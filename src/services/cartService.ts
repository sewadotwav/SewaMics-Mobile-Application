// ============================================================
// SewaMics — Cart Service
// File: src/services/cartService.ts
//
// Manages shopping cart documents in Firestore.
// Collection: carts/{userId}
//
// One cart document per user, keyed by Firebase Auth UID.
// Cart document is created on first item add and persisted
// across sessions. Use clearCart() after checkout, not deleteDoc.
// ============================================================

import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  Timestamp,
  FieldValue,
  arrayUnion,
  arrayRemove,
} from "firebase/firestore";

import { db } from "../config/firebaseConfig";
import {
  COLLECTIONS,
  CartDocument,
  CartItem,
  ProductDocument,
} from "../config/firestoreSchema";
import { getProductById, Product } from "./productService";

// ─────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────

/**
 * Recalculates cartTotal and itemCount from the current items array.
 * Called after every mutation to keep derived fields in sync.
 */
function recalculateTotals(items: CartItem[]): {
  cartTotal: number;
  itemCount: number;
} {
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const cartTotal = parseFloat(
    items.reduce((sum, item) => sum + item.price * item.quantity, 0).toFixed(2)
  );
  return { cartTotal, itemCount };
}

// ─────────────────────────────────────────────
// SERVICE FUNCTIONS
// ─────────────────────────────────────────────

/**
 * Fetches the cart document for a given user.
 *
 * Returns null on first-time users who have not yet added any items.
 * Callers should treat null as an empty cart state.
 *
 * @param userId - Firebase Auth UID of the user
 * @returns CartDocument if it exists, or null
 * @throws On Firestore read failure
 */
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

// ─────────────────────────────────────────────

/**
 * Adds a product to the user's cart, or increments its quantity
 * if the product is already present.
 *
 * Fetches live product data from Firestore to populate CartItem
 * fields (name, price, image). Creates the cart document if it
 * doesn't exist yet.
 *
 * @param userId    - Firebase Auth UID of the user
 * @param productId - Firestore document ID of the product to add
 * @param qty       - Number of units to add (must be > 0)
 * @throws If qty <= 0 or productId is empty
 * @throws If the product does not exist or is inactive
 * @throws On Firestore read/write failure
 */
export async function addToCart(
  userId: string,
  productId: string,
  qty: number,
  selectedSize?: string
): Promise<void> {
  try {
    // ── Validate inputs ────────────────────────────────────
    if (!productId || productId.trim() === "") {
      throw new Error("[cartService] productId must not be empty.");
    }
    if (!Number.isInteger(qty) || qty <= 0) {
      throw new Error("[cartService] qty must be a positive integer.");
    }

    // ── Fetch live product data ────────────────────────────
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

    // ── Add or increment ───────────────────────────────────
    // Check for same product AND same size
    const existingIndex = items.findIndex(
      (item) => item.productId === productId && item.selectedSize === selectedSize
    );

    if (existingIndex >= 0) {
      // Product + Size already in cart — increment quantity
      const updated = { ...items[existingIndex] };
      updated.quantity += qty;
      updated.subtotal = parseFloat(
        (updated.price * updated.quantity).toFixed(2)
      );
      items[existingIndex] = updated;
    } else {
      // New item — build CartItem from live product data
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

    // setDoc upserts — creates or fully overwrites the cart document
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

// ─────────────────────────────────────────────

/**
 * Removes a specific product from the user's cart.
 *
 * If the cart becomes empty after removal, the cart document
 * is kept with an empty items array — it is not deleted.
 *
 * @param userId    - Firebase Auth UID of the user
 * @param productId - Firestore document ID of the product to remove
 * @throws If the cart does not exist
 * @throws If the product is not found in the cart
 * @throws On Firestore read/write failure
 */
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

    // Use arrayRemove to atomically remove the matched item object
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

// ─────────────────────────────────────────────

/**
 * Updates the quantity of a specific item in the user's cart.
 *
 * If qty <= 0, the item is removed from the cart entirely.
 * If qty > 0, the item quantity is updated in place.
 *
 * @param userId    - Firebase Auth UID of the user
 * @param productId - Firestore document ID of the product to update
 * @param qty       - New quantity (0 or negative removes the item)
 * @throws If the item does not exist in the cart
 * @throws On Firestore read/write failure
 */
export async function updateCartItemQuantity(
  userId: string,
  productId: string,
  qty: number
): Promise<void> {
  try {
    // If qty <= 0, delegate to removeFromCart
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

// ─────────────────────────────────────────────

/**
 * Clears all items from the user's cart.
 *
 * Resets items to an empty array and zeroes out totals.
 * The cart document itself is preserved — not deleted.
 * Call this after a successful checkout.
 *
 * @param userId - Firebase Auth UID of the user
 * @throws On Firestore write failure
 */
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
      { merge: true } // Preserve document if it exists, create if not
    );
  } catch (error) {
    throw new Error(
      `[cartService] Failed to clear cart for user ${userId}: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }
}

// ─────────────────────────────────────────────

/**
 * Calculates the total price of all items in the user's cart.
 *
 * Computes the sum of (price × quantity) for each cart item.
 * Returns 0 if the cart is empty or does not exist — no error thrown.
 *
 * @param userId - Firebase Auth UID of the user
 * @returns Total cart price as a number rounded to 2 decimal places
 * @throws On Firestore read failure
 */
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
