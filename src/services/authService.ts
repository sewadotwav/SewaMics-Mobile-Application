// ============================================================
// SewaMics — Authentication Service
// File: src/services/authService.ts
//
// Handles Google Sign-In using Expo AuthSession instead of
// native Google Sign-In (to maintain Expo Go compatibility).
// ============================================================

import { useEffect } from "react";
import * as WebBrowser from "expo-web-browser";
import * as Google from "expo-auth-session/providers/google";
import { GoogleAuthProvider, signInWithCredential, signOut } from "firebase/auth";
import { auth } from "../config/firebaseConfig";

// Ensure web browser auth sessions resolve correctly when returning to the app
WebBrowser.maybeCompleteAuthSession();

// The web client ID created in Google Cloud Console
const WEB_CLIENT_ID = "13256516723-v5fre62me1tdmi7p9l3qs7doc6bagn4d.apps.googleusercontent.com";

/**
 * Custom hook providing Google Sign-In functionality for Expo Go.
 * Uses the Web-based OAuth flow compatible with standard Expo.
 */
export function useGoogleAuth() {
  const [request, response, promptAsync] = Google.useAuthRequest({
    webClientId: WEB_CLIENT_ID,
  });

  // Listen for the response from the Google OAuth flow
  useEffect(() => {
    async function handleSignInResponse() {
      if (response?.type === "success") {
        try {
          const { id_token } = response.params;
          
          if (!id_token) {
            console.error("No ID token found in response parameters.");
            return;
          }

          // Create Firebase credential using the token from Google
          const credential = GoogleAuthProvider.credential(id_token);
          
          // Sign into Firebase
          const userCredential = await signInWithCredential(auth, credential);
          console.log("Successfully signed into Firebase with Google:", userCredential.user.uid);
          
        } catch (error) {
          console.error("Firebase Sign-In Error:", error);
        }
      } else if (response?.type === "error") {
        console.error("Google OAuth Error:", response.error);
      }
    }

    handleSignInResponse();
  }, [response]);

  /**
   * Triggers the Google Sign-In flow
   */
  const signInWithGoogle = async () => {
    try {
      console.log("Starting Google Sign-In flow...");
      await promptAsync();
    } catch (error) {
      console.error("Failed to start Google Sign-In prompt:", error);
    }
  };

  /**
   * Signs the user out of Firebase
   */
  const signOutGoogle = async () => {
    try {
      await signOut(auth);
      console.log("Successfully signed out.");
    } catch (error) {
      console.error("Sign out error:", error);
    }
  };

  return {
    signInWithGoogle,
    signOutGoogle,
    isReady: !!request,
  };
}
