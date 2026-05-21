import { useEffect } from "react";
import * as WebBrowser from "expo-web-browser";
import * as Google from "expo-auth-session/providers/google";
import { GoogleAuthProvider, signInWithCredential, signOut } from "firebase/auth";
import { auth } from "../config/firebaseConfig";

// Required to complete the auth session when returning to the app
WebBrowser.maybeCompleteAuthSession();

// Web Client ID from Google Cloud Console
const WEB_CLIENT_ID = "13256516723-v5fre62me1tdmi7p9l3qs7doc6bagn4d.apps.googleusercontent.com";

/**
 * Hook for Google Sign-In via Expo AuthSession.
 * Uses 'id_token' flow — compatible with Firebase and Expo Go.
 *
 * NOTE: We intentionally omit androidClientId. If provided, Expo Go tries the
 * Android client ID which doesn't support web redirect URIs (causes Error 400).
 */
export function useGoogleAuth() {
  const [request, response, promptAsync] = Google.useAuthRequest({
    clientId: WEB_CLIENT_ID,
    webClientId: WEB_CLIENT_ID,

    redirectUri: "https://auth.expo.io/@sewaphim/sewamics",
    responseType: "id_token",
    selectAccount: true,
  });

  useEffect(() => {
    async function handleSignInResponse() {
      if (response?.type === "success") {
        try {
          const { id_token } = response.params;
          if (!id_token) {
            console.error("No ID token found in response parameters.");
            return;
          }
          const credential = GoogleAuthProvider.credential(id_token);
          const userCredential = await signInWithCredential(auth, credential);
          console.log("Signed into Firebase with Google:", userCredential.user.uid);
        } catch (error) {
          console.error("Firebase Sign-In Error:", error);
        }
      } else if (response?.type === "error") {
        console.error("Google OAuth Error:", response.error?.message);
      }
    }
    handleSignInResponse();
  }, [response]);

  const signInWithGoogle = async () => {
    try {
      await promptAsync();
    } catch (error) {
      console.error("Failed to start Google Sign-In prompt:", error);
    }
  };

  const signOutGoogle = async () => {
    try {
      await signOut(auth);
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
