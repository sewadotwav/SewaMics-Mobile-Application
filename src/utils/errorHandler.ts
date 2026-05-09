/**
 * SewaMics — Error Handling Utility
 * File: src/utils/errorHandler.ts
 * 
 * Provides centralized logic for transforming technical errors (like Firebase codes)
 * into user-friendly messages and detecting network issues.
 */

/**
 * Maps Firebase Auth error codes to user-friendly strings.
 */
export const getErrorMessage = (error: any): string => {
  if (!error) return "An unknown error occurred";

  const code = error.code || error.message;

  switch (code) {
    case "auth/invalid-email":
      return "Invalid email address";
    case "auth/user-not-found":
      return "Account not found";
    case "auth/wrong-password":
      return "Incorrect password";
    case "auth/email-already-in-use":
      return "Email already in use";
    case "auth/weak-password":
      return "Password too weak";
    case "auth/operation-not-allowed":
      return "Operation not allowed";
    case "auth/user-disabled":
      return "Account disabled";
    case "auth/too-many-requests":
      return "Too many login attempts, try again later";
    default:
      return "An error occurred, please try again";
  }
};

/**
 * Detects if an error is network-related.
 */
export const isNetworkError = (error: any): boolean => {
  if (!error) return false;
  
  const message = error.message?.toLowerCase() || "";
  const code = error.code?.toLowerCase() || "";

  return (
    message.includes("network") ||
    message.includes("fetch") ||
    message.includes("offline") ||
    message.includes("internet") ||
    code.includes("network") ||
    code.includes("unavailable")
  );
};
