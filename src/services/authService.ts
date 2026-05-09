// ============================================================
// SewaMics — Authentication Service
// File: src/services/authService.ts
//
// Handles Google Sign-In using Expo AuthSession instead of
// native Google Sign-In (to maintain Expo Go compatibility).
// ============================================================

import { useEffect } from "react";
import * as WebBrowser from "expo-web-browser";
import * as AuthSession from "expo-auth-session";
import * as Google from "expo-auth-session/providers/google";
import { GoogleAuthProvider, signInWithCredential, signOut } from "firebase/auth";
import { auth } from "../config/firebaseConfig";

// Ensure web browser auth sessions resolve correctly when returning to the app
WebBrowser.maybeCompleteAuthSession();

// The web client ID from Google Cloud Console
const WEB_CLIENT_ID = "13256516723-v5fre62me1tdmi7p9l3qs7doc6bagn4d.apps.googleusercontent.com";

// The Android client ID from Google Cloud Console
const ANDROID_CLIENT_ID = "13256516723-gi3sqcif7klkb2h0okh1sbn84i033538.apps.googleusercontent.com";

/**
 * Custom hook providing Google Sign-In functionality for Expo Go and Android standalone.
 * Uses the secure 'id_token' flow compatible with Firebase.
 */
export function useGoogleAuth() {
  const [request, response, promptAsync] = Google.useAuthRequest({
    clientId: WEB_CLIENT_ID, // Forces it to use the Web Client ID on all platforms in Expo Go
    webClientId: WEB_CLIENT_ID,
    // Note: We intentionally do NOT provide androidClientId here right now. 
    // If provided, Expo Go tries to use the Android Client ID, which does not 
    // support web redirect URIs (like auth.expo.io), causing Error 400.
    
    // PERMANENT FIX: Explicitly define the redirect URI for Expo's proxy
    // This forces the app to request the exact URL authorized in Google Console.
    redirectUri: "https://auth.expo.io/@sewaphim/sewamics",

    // Use 'id_token' for secure Firebase authentication
    responseType: "id_token",
    // Forces the account selection screen for a better user experience
    selectAccount: true,
  });

  // Listen for the response from the Google OAuth flow
  useEffect(() => {
    async function handleSignInResponse() {
      if (response?.type === "success") {
        try {
          // In 'id_token' flow, the token is in params
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
        console.error("Error details:", response.error?.message);
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
