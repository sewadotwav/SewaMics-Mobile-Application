import { doc, getDoc, updateDoc, arrayUnion, arrayRemove, Timestamp } from "firebase/firestore";
import { db } from "../config/firebaseConfig";

export interface Address {
  id: string;
  street: string;
  city: string;
  province: string;
  postalCode: string;
  isDefault: boolean;
  createdAt: Timestamp;
  label?: string;
}

export const getUserAddresses = async (userId: string): Promise<Address[]> => {
  try {
    const userDocRef = doc(db, "users", userId);
    const userDoc = await getDoc(userDocRef);
    if (!userDoc.exists()) return [];
    
    let addresses = (userDoc.data().addresses as Address[]) || [];
    let needsUpdate = false;
    
    addresses = addresses.map(a => {
      if (!a.id) {
        needsUpdate = true;
        return { ...a, id: Math.random().toString(36).substring(2, 10), isDefault: a.isDefault || false };
      }
      return a;
    });

    if (needsUpdate) {
      await updateDoc(userDocRef, { addresses });
    }

    return addresses;
  } catch (error) {
    console.error("Error fetching addresses:", error);
    throw error;
  }
};

export const addAddress = async (userId: string, address: Address): Promise<void> => {
  try {
    if (!address.street || !address.city || !address.province || !address.postalCode) {
      throw new Error("Missing required address fields");
    }

    const userDocRef = doc(db, "users", userId);
    const userDoc = await getDoc(userDocRef);
    if (!userDoc.exists()) throw new Error("User not found");

    let addresses = (userDoc.data().addresses as Address[]) || [];
    
    // If the new address is default, unset all others
    if (address.isDefault) {
      addresses = addresses.map(addr => ({ ...addr, isDefault: false }));
    }

    addresses.push(address);

    await updateDoc(userDocRef, {
      addresses: addresses
    });
  } catch (error) {
    console.error("Error adding address:", error);
    throw error;
  }
};

export const updateAddress = async (userId: string, addressId: string, updates: Partial<Address>): Promise<void> => {
  try {
    const userDocRef = doc(db, "users", userId);
    const userDoc = await getDoc(userDocRef);
    if (!userDoc.exists()) throw new Error("User not found");

    const addresses = (userDoc.data().addresses as Address[]) || [];
    const index = addresses.findIndex(a => a.id === addressId);
    
    if (index === -1) throw new Error("Address not found");

    // If the update sets isDefault to true, unset all others
    let updatedAddresses = [...addresses];
    if (updates.isDefault) {
      updatedAddresses = updatedAddresses.map(addr => ({ ...addr, isDefault: false }));
    }

    updatedAddresses[index] = { ...updatedAddresses[index], ...updates };

    await updateDoc(userDocRef, {
      addresses: updatedAddresses
    });
  } catch (error) {
    console.error("Error updating address:", error);
    throw error;
  }
};

export const deleteAddress = async (userId: string, addressId: string): Promise<void> => {
  try {
    const userDocRef = doc(db, "users", userId);
    const userDoc = await getDoc(userDocRef);
    if (!userDoc.exists()) throw new Error("User not found");

    const addresses = (userDoc.data().addresses as Address[]) || [];
    
    if (addresses.length <= 1) {
      throw new Error("Cannot delete your only address");
    }

    const addressToRemove = addresses.find(a => a.id === addressId);
    if (!addressToRemove) throw new Error("Address not found");

    await updateDoc(userDocRef, {
      addresses: arrayRemove(addressToRemove)
    });
  } catch (error) {
    console.error("Error deleting address:", error);
    throw error;
  }
};

export const setDefaultAddress = async (userId: string, addressId: string): Promise<void> => {
  try {
    const userDocRef = doc(db, "users", userId);
    const userDoc = await getDoc(userDocRef);
    if (!userDoc.exists()) throw new Error("User not found");

    const addresses = (userDoc.data().addresses as Address[]) || [];
    
    const updatedAddresses = addresses.map(addr => ({
      ...addr,
      isDefault: addr.id === addressId
    }));

    await updateDoc(userDocRef, {
      addresses: updatedAddresses
    });
  } catch (error) {
    console.error("Error setting default address:", error);
    throw error;
  }
};
