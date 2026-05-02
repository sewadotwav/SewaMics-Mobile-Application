// ============================================================
// SewaMics — Cloud Function: setAdminClaim
// File: functions/setAdminClaim.ts
//
// PURPOSE:
//   A callable Firebase Cloud Function that grants admin
//   privileges to a user by setting a custom JWT claim.
//   Admin status is then readable in Firestore security rules
//   via request.auth.token.admin == true.
//
// USAGE (from admin dashboard or Firebase emulator):
//   const setAdminClaim = httpsCallable(functions, 'setAdminClaim');
//   await setAdminClaim({ userId: 'uid_of_user_to_promote' });
//
// DEPLOYMENT:
//   firebase deploy --only functions
// ============================================================

import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

// Initialize Firebase Admin SDK if not already initialized
// (Guard prevents duplicate initialization across function files)
if (!admin.apps.length) {
  admin.initializeApp();
}

// ─────────────────────────────────────────────
// TYPE DEFINITIONS
// ─────────────────────────────────────────────

interface SetAdminClaimData {
  /** UID of the user to be granted admin privileges */
  userId: string;
}

interface SetAdminClaimResponse {
  success: boolean;
  message: string;
}

// ─────────────────────────────────────────────
// CALLABLE CLOUD FUNCTION
// ─────────────────────────────────────────────

export const setAdminClaim = functions.https.onCall(
  async (
    data: SetAdminClaimData,
    context: functions.https.CallableContext
  ): Promise<SetAdminClaimResponse> => {

    // ── 1. Require Authentication ──────────────────────────
    // The caller must be signed in
    if (!context.auth) {
      throw new functions.https.HttpsError(
        "unauthenticated",
        "You must be signed in to perform this action."
      );
    }

    // ── 2. Require Caller to Already Be Admin ──────────────
    // Only existing admins can promote other users.
    // On first setup, use the Firebase Admin SDK directly
    // in the Firebase console or via a one-time script.
    const callerClaims = context.auth.token;
    if (!callerClaims.admin) {
      throw new functions.https.HttpsError(
        "permission-denied",
        "Only admins can assign admin privileges."
      );
    }

    // ── 3. Validate Input ──────────────────────────────────
    const { userId } = data;

    if (!userId || typeof userId !== "string" || userId.trim() === "") {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "A valid userId string must be provided."
      );
    }

    // Prevent an admin from accidentally operating on themselves
    if (userId === context.auth.uid) {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "You cannot modify your own admin claim through this function."
      );
    }

    // ── 4. Verify Target User Exists ───────────────────────
    let targetUser: admin.auth.UserRecord;
    try {
      targetUser = await admin.auth().getUser(userId);
    } catch (error) {
      throw new functions.https.HttpsError(
        "not-found",
        `No user found with UID: ${userId}`
      );
    }

    // ── 5. Check if Already Admin ─────────────────────────
    const existingClaims = targetUser.customClaims ?? {};
    if (existingClaims.admin === true) {
      return {
        success: true,
        message: `User ${userId} already has admin privileges. No changes made.`,
      };
    }

    // ── 6. Set Custom Admin Claim ─────────────────────────
    try {
      await admin.auth().setCustomUserClaims(userId, {
        ...existingClaims, // Preserve any existing claims
        admin: true,
      });

      // Log the action for audit purposes
      functions.logger.info(
        `[SewaMics] Admin claim granted to user: ${userId}`,
        {
          grantedBy: context.auth.uid,
          targetUser: userId,
          timestamp: new Date().toISOString(),
        }
      );

      return {
        success: true,
        message: `Admin privileges successfully granted to user: ${userId}. The user must sign out and sign back in for the claim to take effect.`,
      };
    } catch (error) {
      functions.logger.error(
        `[SewaMics] Failed to set admin claim for user: ${userId}`,
        error
      );
      throw new functions.https.HttpsError(
        "internal",
        "Failed to set admin claim. Please try again."
      );
    }
  }
);

// ─────────────────────────────────────────────
// ONE-TIME BOOTSTRAP SCRIPT (DEV ONLY)
//
// Use this to create the FIRST admin manually.
// Run once from your local machine with Admin SDK
// credentials, then delete this function.
//
// Usage: ts-node functions/setAdminClaim.ts --bootstrap <uid>
// ─────────────────────────────────────────────

export async function bootstrapFirstAdmin(uid: string): Promise<void> {
  if (!uid) throw new Error("UID is required.");

  try {
    const user = await admin.auth().getUser(uid);
    const existing = user.customClaims ?? {};

    await admin.auth().setCustomUserClaims(uid, {
      ...existing,
      admin: true,
    });

    console.log(`✅ First admin claim set for UID: ${uid}`);
    console.log("   User must sign out and sign back in for claim to activate.");
  } catch (error) {
    console.error("❌ Failed to bootstrap admin:", error);
    throw error;
  }
}
