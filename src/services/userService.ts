import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
  deleteDoc,
  Timestamp,
} from "firebase/firestore";

import { db, auth } from "../config/firebaseConfig";
import { COLLECTIONS, UserDocument } from "../config/firestoreSchema";

// uid, email, createdAt must never be mutated after creation
const IMMUTABLE_FIELDS: (keyof UserDocument)[] = ["uid", "email", "createdAt"];


export async function createUserProfile(
  uid: string,
  email: string,
  name: string
): Promise<void> {
  try {
    const userRef = doc(db, COLLECTIONS.USERS, uid);

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


export async function getUserProfile(uid: string): Promise<UserDocument | null> {
  try {
    const userRef = doc(db, COLLECTIONS.USERS, uid);
    const snap = await getDoc(userRef);

    if (!snap.exists()) return null;

    return snap.data() as UserDocument;
  } catch (error) {
    throw new Error(
      `[userService] Failed to fetch profile for UID ${uid}: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }
}


export async function updateUserProfile(
  uid: string,
  updates: Partial<UserDocument>
): Promise<void> {
  try {
    const userRef = doc(db, COLLECTIONS.USERS, uid);

    const snap = await getDoc(userRef);
    if (!snap.exists()) {

      const now = Timestamp.now();
      const newUser: UserDocument = {
        uid,
        email: auth.currentUser?.email || updates.email || "",
        name: updates.name || auth.currentUser?.displayName || "",
        phone: updates.phone || "",
        addresses: [],
        preferences: {
          notifications: true,
          theme: "light",
        },
        createdAt: now,
        updatedAt: now,
      };
      await setDoc(userRef, newUser);
      return;
    }

    const safeUpdates = { ...updates };
    IMMUTABLE_FIELDS.forEach((field) => {
      if (field in safeUpdates) {
        console.warn(
          `[userService] Attempted to update immutable field "${field}" — ignored.`
        );
        delete safeUpdates[field];
      }
    });

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

// NOTE: This only removes the Firestore document. Firebase Auth account deletion is separate.
export async function deleteUserAccount(uid: string): Promise<void> {
  try {
    const userRef = doc(db, COLLECTIONS.USERS, uid);
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
