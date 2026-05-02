// ============================================================
// SewaMics — User Service
// File: src/services/userService.ts
//
// Manages user profile documents in Firestore.
// Collection: users/{uid}
// ============================================================

import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
  deleteDoc,
  Timestamp,
} from "firebase/firestore";

import { db } from "../config/firebaseConfig";
import { COLLECTIONS, UserDocument } from "../config/firestoreSchema";

// ─────────────────────────────────────────────
// IMMUTABLE FIELDS
// These fields must never be updated after creation.
// ─────────────────────────────────────────────

const IMMUTABLE_FIELDS: (keyof UserDocument)[] = ["uid", "email", "createdAt"];

// ─────────────────────────────────────────────
// SERVICE FUNCTIONS
// ─────────────────────────────────────────────

/**
 * Creates a new user profile document in Firestore.
 *
 * Called immediately after Firebase Auth sign-up.
 * Document path: users/{uid}
 *
 * @param uid   - Firebase Auth UID (becomes the document ID)
 * @param email - User's email address from Auth
 * @param name  - Display name provided during registration
 * @throws If a document with the given UID already exists
 */
export async function createUserProfile(
  uid: string,
  email: string,
  name: string
): Promise<void> {
  try {
    const userRef = doc(db, COLLECTIONS.USERS, uid);

    // Check if the user already exists to prevent accidental overwrites
    const existingSnap = await getDoc(userRef);
    if (existingSnap.exists()) {
      throw new Error(
        `[userService] User profile already exists for UID: ${uid}`
      );
    }

    const now = Timestamp.now();

    const newUser: UserDocument = {
      uid,
      email,
      name,
      phone: "",
      addresses: [],
      preferences: {
        notifications: true,
        theme: "light",
      },
      createdAt: now,
      updatedAt: now,
    };

    await setDoc(userRef, newUser);
  } catch (error) {
    // Re-throw with context if it's not already our own error
    if (error instanceof Error && error.message.startsWith("[userService]")) {
      throw error;
    }
    throw new Error(
      `[userService] Failed to create profile for UID ${uid}: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }
}

// ─────────────────────────────────────────────

/**
 * Fetches a user profile document from Firestore.
 *
 * Returns null instead of throwing if the user doesn't exist,
 * since a missing user may be a valid app state (e.g. first login).
 *
 * @param uid - Firebase Auth UID of the user to fetch
 * @returns The UserDocument, or null if not found
 */
export async function getUserProfile(uid: string): Promise<UserDocument | null> {
  try {
    const userRef = doc(db, COLLECTIONS.USERS, uid);
    const snap = await getDoc(userRef);

    if (!snap.exists()) {
      return null; // Not found — caller decides how to handle
    }

    return snap.data() as UserDocument;
  } catch (error) {
    throw new Error(
      `[userService] Failed to fetch profile for UID ${uid}: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }
}

// ─────────────────────────────────────────────

/**
 * Updates specific fields on an existing user profile.
 *
 * Immutable fields (uid, email, createdAt) are stripped before
 * writing to prevent accidental corruption of core identity fields.
 *
 * @param uid     - Firebase Auth UID of the user to update
 * @param updates - Partial UserDocument with only the fields to change
 * @throws If the user document does not exist
 */
export async function updateUserProfile(
  uid: string,
  updates: Partial<UserDocument>
): Promise<void> {
  try {
    const userRef = doc(db, COLLECTIONS.USERS, uid);

    // Confirm user exists before attempting update
    const snap = await getDoc(userRef);
    if (!snap.exists()) {
      throw new Error(
        `[userService] Cannot update — no profile found for UID: ${uid}`
      );
    }

    // Strip immutable fields from the update payload
    const safeUpdates = { ...updates };
    IMMUTABLE_FIELDS.forEach((field) => {
      if (field in safeUpdates) {
        console.warn(
          `[userService] Attempted to update immutable field "${field}" — ignored.`
        );
        delete safeUpdates[field];
      }
    });

    // Always stamp updatedAt with the current server time
    safeUpdates.updatedAt = Timestamp.now();

    await updateDoc(userRef, safeUpdates);
  } catch (error) {
    if (error instanceof Error && error.message.startsWith("[userService]")) {
      throw error;
    }
    throw new Error(
      `[userService] Failed to update profile for UID ${uid}: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }
}

// ─────────────────────────────────────────────

/**
 * Deletes a user's Firestore profile document.
 *
 * This removes the document from the `users` collection only.
 * Firebase Auth account deletion must be handled separately
 * via `deleteUser()` from firebase/auth.
 *
 * @param uid - Firebase Auth UID of the user to delete
 * @throws If the user document does not exist
 */
export async function deleteUserAccount(uid: string): Promise<void> {
  try {
    const userRef = doc(db, COLLECTIONS.USERS, uid);

    // Confirm user exists before attempting delete
    const snap = await getDoc(userRef);
    if (!snap.exists()) {
      throw new Error(
        `[userService] Cannot delete — no profile found for UID: ${uid}`
      );
    }

    await deleteDoc(userRef);
  } catch (error) {
    if (error instanceof Error && error.message.startsWith("[userService]")) {
      throw error;
    }
    throw new Error(
      `[userService] Failed to delete profile for UID ${uid}: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }
}
