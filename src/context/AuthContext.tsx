// ============================================================
// SewaMics — Authentication Context
// File: src/context/AuthContext.tsx
//
// Manages global authentication state, session persistence,
// and user operations (login, signup, google auth).
// ============================================================

import React, { createContext, useState, useEffect, ReactNode, useCallback, useContext, useMemo } from "react";
import { 
  User, 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut,
  AuthError
} from "firebase/auth";
import { auth } from "../config/firebaseConfig";
import { createUserProfile, getUserProfile } from "../services/userService";
import { useGoogleAuth } from "../services/authService";

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
  checkAuthStatus: () => Promise<void>;
  loginWithEmail: (email: string, pass: string) => Promise<void>;
  signupWithEmail: (email: string, pass: string, name: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  error: null,
  isAuthenticated: false,
  checkAuthStatus: async () => {},
  loginWithEmail: async () => {},
  signupWithEmail: async () => {},
  loginWithGoogle: async () => {},
  logout: async () => {},
  clearError: () => {},
});

export const useAuth = () => useContext(AuthContext);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Hook for Expo Google Auth Session
  const { signInWithGoogle } = useGoogleAuth();

  const clearError = useCallback(() => setError(null), []);

  const checkAuthStatus = useCallback(async () => {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        setUser(null);
        return;
      }
      
      // Load user profile from Firestore to ensure it exists
      const profile = await getUserProfile(currentUser.uid);
      if (profile) {
        setUser(currentUser);
      } else {
        // Edge case: user exists in Auth but not Firestore
        console.warn("User profile missing in Firestore.");
        setUser(currentUser);
      }
    } catch (err) {
      console.error("Error in checkAuthStatus:", err);
    }
  }, []);

  const loginWithEmail = useCallback(async (email: string, pass: string) => {
    try {
      clearError();
      if (!email || !pass) throw new Error("Email and password are required.");
      
      const userCredential = await signInWithEmailAndPassword(auth, email.trim(), pass);
      await getUserProfile(userCredential.user.uid);
      setUser(userCredential.user);
    } catch (err: any) {
      setError(mapFirebaseError(err));
      throw err;
    }
  }, [clearError]);

  const signupWithEmail = useCallback(async (email: string, pass: string, name: string) => {
    try {
      clearError();
      if (!email || !pass || !name) throw new Error("All fields are required.");
      
      const userCredential = await createUserWithEmailAndPassword(auth, email.trim(), pass);
      
      // Create user profile in Firestore
      await createUserProfile(userCredential.user.uid, email.trim(), name.trim());
      
      setUser(userCredential.user);
    } catch (err: any) {
      setError(mapFirebaseError(err));
      throw err;
    }
  }, [clearError]);

  const loginWithGoogle = useCallback(async () => {
    try {
      clearError();
      await signInWithGoogle();
      // The auth state listener will automatically pick up the user change
    } catch (err: any) {
      setError(mapFirebaseError(err));
      throw err;
    }
  }, [signInWithGoogle, clearError]);

  const logout = useCallback(async () => {
    try {
      clearError();
      await signOut(auth);
      setUser(null);
    } catch (err: any) {
      setError(mapFirebaseError(err));
      throw err;
    }
  }, [clearError]);

  // Listen to Firebase Auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setLoading(true);
      if (firebaseUser) {
        await checkAuthStatus();
      } else {
        setUser(null);
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
    checkAuthStatus,
    loginWithEmail,
    signupWithEmail,
    loginWithGoogle,
    logout,
    clearError
  }), [user, loading, error, checkAuthStatus, loginWithEmail, signupWithEmail, loginWithGoogle, logout, clearError]);

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};
