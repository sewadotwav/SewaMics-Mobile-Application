import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  Timestamp,
} from "firebase/firestore";

import { db } from "../config/firebaseConfig";
import {
  COLLECTIONS,
  CartDocument,
  CartItem,
} from "../config/firestoreSchema";
import { getProductById, Product } from "./productService";

function recalculateTotals(items: CartItem[]): { cartTotal: number; itemCount: number } {
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const cartTotal = parseFloat(
    items.reduce((sum, item) => sum + item.price * item.quantity, 0).toFixed(2)
  );
  return { cartTotal, itemCount };
}

/** Returns null for users with no cart yet. */
export async function getCart(userId: string): Promise<CartDocument | null> {
  try {
    const cartRef = doc(db, COLLECTIONS.CARTS, userId);
    const snap = await getDoc(cartRef);

    if (!snap.exists()) {
      return null;
    }

    return snap.data() as CartDocument;
  } catch (error) {
    throw new Error(
      `[cartService] Failed to fetch cart for user ${userId}: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }
}


export async function addToCart(
  userId: string,
  productId: string,
  qty: number,
  selectedSize?: string
): Promise<void> {
  try {
    if (!productId || productId.trim() === "") {
      throw new Error("[cartService] productId must not be empty.");
    }
    if (!Number.isInteger(qty) || qty <= 0) {
      throw new Error("[cartService] qty must be a positive integer.");
    }

    const product: Product | null = await getProductById(productId);
    if (!product) {
      throw new Error(
        `[cartService] Cannot add to cart — product ${productId} not found.`
      );
    }
    if (!product.isActive) {
      throw new Error(
        `[cartService] Cannot add to cart — "${product.name}" is no longer available.`
      );
    }

    const cartRef = doc(db, COLLECTIONS.CARTS, userId);
    const snap = await getDoc(cartRef);

    let items: CartItem[] = snap.exists()
      ? (snap.data() as CartDocument).items
      : [];


    const existingIndex = items.findIndex(
      (item) => item.productId === productId && item.selectedSize === selectedSize
    );

    if (existingIndex >= 0) {
      const updated = { ...items[existingIndex] };
      updated.quantity += qty;
      updated.subtotal = parseFloat(
        (updated.price * updated.quantity).toFixed(2)
      );
      items[existingIndex] = updated;
    } else {
      const newItem: CartItem = {
        productId,
        name: product.name,
        price: product.price,
        quantity: qty,
        image: product.imageKey ?? "",
        selectedSize,
        subtotal: parseFloat((product.price * qty).toFixed(2)),
        addedAt: Timestamp.now(),
      };
      items = [...items, newItem];
    }

    const { cartTotal, itemCount } = recalculateTotals(items);

    await setDoc(cartRef, {
      uid: userId,
      items,
      cartTotal,
      itemCount,
      lastUpdated: Timestamp.now(),
    } as CartDocument);
  } catch (error) {
    if (error instanceof Error && error.message.startsWith("[cartService]")) {
      throw error;
    }
    throw new Error(
      `[cartService] Failed to add product ${productId} to cart: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }
}


export async function removeFromCart(
  userId: string,
  productId: string
): Promise<void> {
  try {
    const cartRef = doc(db, COLLECTIONS.CARTS, userId);
    const snap = await getDoc(cartRef);

    if (!snap.exists()) {
      throw new Error(
        `[cartService] Cannot remove — no cart found for user: ${userId}`
      );
    }

    const items: CartItem[] = (snap.data() as CartDocument).items;
    const targetItem = items.find((item) => item.productId === productId);

    if (!targetItem) {
      throw new Error(
        `[cartService] Product ${productId} not found in cart for user: ${userId}`
      );
    }

    const updatedItems = items.filter((item) => item.productId !== productId);
    const { cartTotal, itemCount } = recalculateTotals(updatedItems);

    await updateDoc(cartRef, {
      items: updatedItems,
      cartTotal,
      itemCount,
      lastUpdated: Timestamp.now(),
    });
  } catch (error) {
    if (error instanceof Error && error.message.startsWith("[cartService]")) {
      throw error;
    }
    throw new Error(
      `[cartService] Failed to remove product ${productId} from cart: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }
}


export async function updateCartItemQuantity(
  userId: string,
  productId: string,
  qty: number
): Promise<void> {
  try {
    if (qty <= 0) {
      return removeFromCart(userId, productId);
    }

    const cartRef = doc(db, COLLECTIONS.CARTS, userId);
    const snap = await getDoc(cartRef);

    if (!snap.exists()) {
      throw new Error(
        `[cartService] Cannot update — no cart found for user: ${userId}`
      );
    }

    let items: CartItem[] = (snap.data() as CartDocument).items;
    const itemIndex = items.findIndex((item) => item.productId === productId);

    if (itemIndex < 0) {
      throw new Error(
        `[cartService] Product ${productId} not found in cart for user: ${userId}`
      );
    }

    const updated = { ...items[itemIndex] };
    updated.quantity = qty;
    updated.subtotal = parseFloat((updated.price * qty).toFixed(2));
    items[itemIndex] = updated;

    const { cartTotal, itemCount } = recalculateTotals(items);

    await updateDoc(cartRef, {
      items,
      cartTotal,
      itemCount,
      lastUpdated: Timestamp.now(),
    });
  } catch (error) {
    if (error instanceof Error && error.message.startsWith("[cartService]")) {
      throw error;
    }
    throw new Error(
      `[cartService] Failed to update quantity for product ${productId}: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }
}

// Cart document is preserved (not deleted) — call after checkout.
export async function clearCart(userId: string): Promise<void> {
  try {
    const cartRef = doc(db, COLLECTIONS.CARTS, userId);

    await setDoc(
      cartRef,
      {
        uid: userId,
        items: [],
        cartTotal: 0,
        itemCount: 0,
        lastUpdated: Timestamp.now(),
      } as CartDocument,
      { merge: true }
    );
  } catch (error) {
    throw new Error(
      `[cartService] Failed to clear cart for user ${userId}: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }
}


export async function getCartTotal(userId: string): Promise<number> {
  try {
    const cart = await getCart(userId);

    if (!cart || cart.items.length === 0) {
      return 0;
    }

    const total = cart.items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    return parseFloat(total.toFixed(2));
  } catch (error) {
    throw new Error(
      `[cartService] Failed to calculate cart total for user ${userId}: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }
}
