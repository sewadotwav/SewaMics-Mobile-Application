// ============================================================
// SewaMics — Authentication Context
// File: src/context/AuthContext.tsx
//
// Manages global authentication state across the application
// by listening to Firebase's onAuthStateChanged observer.
// ============================================================

import React, { createContext, useState, useEffect, ReactNode } from "react";
import { User, onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "../config/firebaseConfig";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  logout: async () => {},
});

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    console.log("Setting up Firebase Auth listener...");
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setIsLoading(false);
      console.log("Auth state changed. User:", firebaseUser ? firebaseUser.uid : "None");
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  const logout = async () => {
    try {
      await signOut(auth);
      console.log("User successfully logged out.");
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
