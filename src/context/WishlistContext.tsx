/**
 * SewaMics — Wishlist Context
 * File: src/context/WishlistContext.tsx
 *
 * Stores the user's wishlist in Firestore and exposes
 * add/remove/check helpers to all screens.
 */

import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  useCallback,
  useMemo,
  ReactNode,
} from "react";
import {
  doc,
  collection,
  getDocs,
  setDoc,
  deleteDoc,
  Timestamp,
} from "firebase/firestore";
import { db } from "../config/firebaseConfig";
import { useAuth } from "./AuthContext";
import { Product } from "../services/productService";

// ── Types ─────────────────────────────────────────────────────
interface WishlistContextType {
  wishlistItems: Product[];
  isInWishlist: (productId: string) => boolean;
  toggleWishlist: (product: Product) => Promise<void>;
  isLoading: boolean;
}

const WishlistContext = createContext<WishlistContextType>({
  wishlistItems: [],
  isInWishlist: () => false,
  toggleWishlist: async () => {},
  isLoading: false,
});

export const useWishlist = () => useContext(WishlistContext);

// ── Provider ──────────────────────────────────────────────────
export const WishlistProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const [wishlistItems, setWishlistItems] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);


  useEffect(() => {
    if (!user?.uid) {
      setWishlistItems([]);
      return;
    }

    let isMounted = true;
    const fetchWishlist = async () => {
      setIsLoading(true);
      try {
        const wishlistRef = collection(db, "users", user.uid, "wishlist");
        const snapshot = await getDocs(wishlistRef);
        if (isMounted) {
          const items: Product[] = snapshot.docs.map((d) => d.data() as Product);
          setWishlistItems(items);
        }
      } catch (err) {
        console.error("[WishlistContext] Failed to fetch wishlist:", err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchWishlist();
    return () => { isMounted = false; };
  }, [user?.uid]);


  const isInWishlist = useCallback(
    (productId: string) => wishlistItems.some((item) => item.id === productId),
    [wishlistItems]
  );


  const toggleWishlist = useCallback(
    async (product: Product) => {
      if (!user?.uid) return;

      const productRef = doc(db, "users", user.uid, "wishlist", product.id);
      const alreadyIn = wishlistItems.some((item) => item.id === product.id);


      if (alreadyIn) {
        setWishlistItems((prev) => prev.filter((item) => item.id !== product.id));
        await deleteDoc(productRef);
      } else {
        setWishlistItems((prev) => [...prev, product]);
        await setDoc(productRef, { ...product, savedAt: Timestamp.now() });
      }
    },
    [user?.uid, wishlistItems]
  );

  const value = useMemo(
    () => ({ wishlistItems, isInWishlist, toggleWishlist, isLoading }),
    [wishlistItems, isInWishlist, toggleWishlist, isLoading]
  );

  return (
    <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>
  );
};
