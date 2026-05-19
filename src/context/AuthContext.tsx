// ============================================================
// SewaMics — Authentication Context
// File: src/context/AuthContext.tsx
//
// Manages global authentication state, session persistence,
// and user operations (login, signup, google auth).
// ============================================================

import React, { createContext, useState, useEffect, ReactNode, useCallback, useContext, useMemo, useRef } from "react";
import { 
  User, 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut,
  AuthError,
  updateProfile,
} from "firebase/auth";
import { auth } from "../config/firebaseConfig";
import { createUserProfile, getUserProfile } from "../services/userService";
import { useGoogleAuth } from "../services/authService";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { generateOTP, storeOTP, sendOTPEmail, verifyOTP } from "../services/otpService";

// Helper to map Firebase error codes to user-friendly messages
const mapFirebaseError = (error: any): string => {
  const code = error?.code;
  switch (code) {
    case "auth/invalid-email":
      return "The email address is invalid.";
    case "auth/user-disabled":
      return "This account has been disabled.";
    case "auth/user-not-found":
    case "auth/invalid-credential":
    case "auth/wrong-password":
      return "Invalid email or password.";
    case "auth/email-already-in-use":
      return "An account already exists with this email.";
    case "auth/weak-password":
      return "The password is too weak (minimum 6 characters).";
    case "auth/network-request-failed":
      return "Network error. Please check your internet connection.";
    default:
      return error?.message || "An unexpected error occurred.";
  }
};

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  isFullyVerified: boolean;
  checkAuthStatus: () => Promise<void>;
  loginWithEmail: (email: string, pass: string) => Promise<void>;
  signupWithEmail: (email: string, pass: string, name: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
  verifyOTPCode: (enteredCode: string) => Promise<boolean>;
  resendOTPCode: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  error: null,
  isAuthenticated: false,
  isFullyVerified: false,
  checkAuthStatus: async () => {},
  loginWithEmail: async () => {},
  signupWithEmail: async () => {},
  loginWithGoogle: async () => {},
  logout: async () => {},
  clearError: () => {},
  verifyOTPCode: async () => false,
  resendOTPCode: async () => {},
});

export const useAuth = () => useContext(AuthContext);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isFullyVerified, setIsFullyVerified] = useState<boolean>(false);
  const isAuthenticating = useRef<boolean>(false);

  // Hook for Expo Google Auth Session
  const { signInWithGoogle } = useGoogleAuth();

  const clearError = useCallback(() => setError(null), []);

  const checkAuthStatus = useCallback(async () => {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        setUser(null);
        setIsFullyVerified(false);
        return;
      }

      // Always check the verified session from AsyncStorage first.
      // This is the source of truth — independent of Firestore profile state.
      const verified = await AsyncStorage.getItem(`verified_session_${currentUser.uid}`);
      const isVerified = verified === "true" || isAuthenticating.current;

      // Attempt to load Firestore profile (best effort)
      try {
        const profile = await getUserProfile(currentUser.uid);
        if (profile) {
          setUser(currentUser);
        } else {
          // Profile missing in Firestore — user may still be verified from a previous session
          setUser(currentUser);
        }
      } catch {
        setUser(currentUser); // Auth is valid even if Firestore is temporarily unavailable
      }

      setIsFullyVerified(isVerified);
    } catch (err) {
      console.error("Error in checkAuthStatus:", err);
    }
  }, []);

  const verifyOTPCode = useCallback(async (enteredCode: string): Promise<boolean> => {
    if (!user) return false;
    const isValid = await verifyOTP(user.uid, enteredCode);
    if (isValid) {
      await AsyncStorage.setItem(`verified_session_${user.uid}`, "true");
      setIsFullyVerified(true);
    }
    return isValid;
  }, [user]);

  const resendOTPCode = useCallback(async (): Promise<void> => {
    if (!user || !user.email) return;
    const code = generateOTP();
    await storeOTP(user.uid, code);
    await sendOTPEmail(user.email, code);
  }, [user]);

  const loginWithEmail = useCallback(async (email: string, pass: string) => {
    try {
      clearError();
      if (!email || !pass) throw new Error("Email and password are required.");
      
      isAuthenticating.current = true;
      const userCredential = await signInWithEmailAndPassword(auth, email.trim(), pass);
      await getUserProfile(userCredential.user.uid);
      setUser(userCredential.user);
      
      // Standard logins bypass OTP and are marked as permanently verified
      await AsyncStorage.setItem(`verified_session_${userCredential.user.uid}`, "true");
      setIsFullyVerified(true);
    } catch (err: any) {
      setError(mapFirebaseError(err));
      throw err;
    } finally {
      isAuthenticating.current = false;
    }
  }, [clearError]);

  const signupWithEmail = useCallback(async (email: string, pass: string, name: string) => {
    try {
      clearError();
      if (!email || !pass || !name) throw new Error("All fields are required.");

      setIsFullyVerified(false);

      try {
        // Attempt fresh registration
        const userCredential = await createUserWithEmailAndPassword(auth, email.trim(), pass);
        // Stamp the display name onto Firebase Auth immediately so ProfileScreen can use it as fallback
        await updateProfile(userCredential.user, { displayName: name.trim() });
        await createUserProfile(userCredential.user.uid, email.trim(), name.trim());
        setUser({ ...userCredential.user, displayName: name.trim() } as User);

        const code = generateOTP();
        await storeOTP(userCredential.user.uid, code);
        await sendOTPEmail(email.trim(), code);
      } catch (createErr: any) {
        // If the email is already registered but the user never verified OTP,
        // sign them in silently and resend a fresh OTP code.
        if (createErr?.code === "auth/email-already-in-use") {
          const existingCred = await signInWithEmailAndPassword(auth, email.trim(), pass);
          const verified = await AsyncStorage.getItem(`verified_session_${existingCred.user.uid}`);
          if (verified === "true") {
            // Already fully verified — this is a duplicate account error for real
            throw new Error("An account with this email is already active. Please log in instead.");
          }
          // Unverified session — resend OTP and trap them on verification screen
          setUser(existingCred.user);
          const code = generateOTP();
          await storeOTP(existingCred.user.uid, code);
          await sendOTPEmail(email.trim(), code);
        } else {
          throw createErr;
        }
      }
    } catch (err: any) {
      setError(mapFirebaseError(err));
      throw err;
    }
  }, [clearError]);

  const loginWithGoogle = useCallback(async () => {
    try {
      clearError();
      isAuthenticating.current = true;
      await signInWithGoogle();
      // Google is auto-verified, session bypasses OTP
      setIsFullyVerified(true);
    } catch (err: any) {
      setError(mapFirebaseError(err));
      throw err;
    } finally {
      isAuthenticating.current = false;
    }
  }, [signInWithGoogle, clearError]);

  const logout = useCallback(async () => {
    try {
      clearError();
      if (user) {
        await AsyncStorage.removeItem(`verified_session_${user.uid}`);
      }
      await signOut(auth);
      setUser(null);
      setIsFullyVerified(false);
    } catch (err: any) {
      setError(mapFirebaseError(err));
      throw err;
    }
  }, [user, clearError]);

  const updateAuthProfile = useCallback(async (displayName: string) => {
    if (!auth.currentUser) return;
    await updateProfile(auth.currentUser, { displayName });
    setUser({ ...auth.currentUser } as User);
  }, []);

  // Listen to Firebase Auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setLoading(true);
      if (firebaseUser) {
        await checkAuthStatus();
      } else {
        setUser(null);
        setIsFullyVerified(false);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [checkAuthStatus]);

  const contextValue = useMemo(() => ({
    user,
    loading,
    error,
    isAuthenticated: !!user,
    isFullyVerified,
    checkAuthStatus,
    loginWithEmail,
    signupWithEmail,
    loginWithGoogle,
    logout,
    clearError,
    verifyOTPCode,
    resendOTPCode,
    updateAuthProfile
  }), [user, loading, error, isFullyVerified, checkAuthStatus, loginWithEmail, signupWithEmail, loginWithGoogle, logout, clearError, verifyOTPCode, resendOTPCode, updateAuthProfile]);

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};
