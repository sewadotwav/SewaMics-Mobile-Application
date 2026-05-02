// ============================================================
// SewaMics — Product Service
// File: src/services/productService.ts
//
// Manages ceramic mug product documents in Firestore.
// Collection: products/{productId}
//
// NOTE: Write operations (create/update/delete) are currently
// open to any authenticated user at the service layer.
// Firestore security rules enforce admin-only writes server-side.
// Full admin guard via custom claims should be added here too
// once the admin dashboard is set up.
// ============================================================

import {
  collection,
  getDocs,
  doc,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  Timestamp,
  Query,
  DocumentData,
} from "firebase/firestore";

import { db } from "../config/firebaseConfig";
import { COLLECTIONS, ProductDocument } from "../config/firestoreSchema";

// ─────────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────────

export type ProductCategory = "Animal" | "Vegetable" | "Fruit";

const IMMUTABLE_FIELDS: (keyof ProductDocument)[] = ["productId", "createdAt"];

// ─────────────────────────────────────────────
// SERVICE FUNCTIONS
// ─────────────────────────────────────────────

/**
 * Fetches all active products from the products collection.
 *
 * Only returns products where `isActive === true`.
 * Inactive products are soft-deleted and hidden from the catalog.
 *
 * @returns Array of active ProductDocuments, or empty array if none exist
 * @throws On Firestore read failure
 */
export async function getAllProducts(): Promise<ProductDocument[]> {
  try {
    const productsRef = collection(db, COLLECTIONS.PRODUCTS);
    const activeQuery: Query<DocumentData> = query(
      productsRef,
      where("isActive", "==", true)
    );

    const snap = await getDocs(activeQuery);

    if (snap.empty) {
      return [];
    }

    return snap.docs.map((d) => d.data() as ProductDocument);
  } catch (error) {
    throw new Error(
      `[productService] Failed to fetch products: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }
}

// ─────────────────────────────────────────────

/**
 * Fetches a single product by its Firestore document ID.
 *
 * Returns null if the product doesn't exist rather than throwing,
 * since a missing product may be a valid state (e.g. deleted SKU).
 *
 * @param productId - Firestore document ID of the product
 * @returns The ProductDocument, or null if not found
 * @throws On Firestore read failure
 */
export async function getProductById(
  productId: string
): Promise<ProductDocument | null> {
  try {
    const productRef = doc(db, COLLECTIONS.PRODUCTS, productId);
    const snap = await getDoc(productRef);

    if (!snap.exists()) {
      return null;
    }

    return snap.data() as ProductDocument;
  } catch (error) {
    throw new Error(
      `[productService] Failed to fetch product ${productId}: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }
}

// ─────────────────────────────────────────────

/**
 * Searches active products by name using a case-insensitive partial match.
 *
 * NOTE: Firestore does not support native full-text search.
 * This implementation fetches all active products and filters
 * client-side. Acceptable for a small catalog (10 SKUs).
 * For larger catalogs, integrate Algolia or Typesense.
 *
 * @param searchQuery - Partial name string to search for (e.g. "cat")
 * @returns Array of matching active ProductDocuments, or empty array
 * @throws On Firestore read failure
 */
export async function searchProducts(
  searchQuery: string
): Promise<ProductDocument[]> {
  try {
    if (!searchQuery || searchQuery.trim() === "") {
      return [];
    }

    // Fetch all active products and filter client-side
    const allProducts = await getAllProducts();
    const normalizedQuery = searchQuery.trim().toLowerCase();

    return allProducts.filter((product) =>
      product.name.toLowerCase().includes(normalizedQuery)
    );
  } catch (error) {
    throw new Error(
      `[productService] Search failed for query "${searchQuery}": ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }
}

// ─────────────────────────────────────────────

/**
 * Filters active products by category.
 *
 * Categories map to ceramic mug design themes:
 * - "Animal"    → animal-themed mugs
 * - "Vegetable" → vegetable-themed mugs
 * - "Fruit"     → fruit-themed mugs
 *
 * @param category - Product category to filter by
 * @returns Array of matching active ProductDocuments, or empty array
 * @throws On Firestore read failure
 */
export async function filterProductsByCategory(
  category: ProductCategory
): Promise<ProductDocument[]> {
  try {
    const productsRef = collection(db, COLLECTIONS.PRODUCTS);
    const categoryQuery: Query<DocumentData> = query(
      productsRef,
      where("isActive", "==", true),
      where("category", "==", category)
    );

    const snap = await getDocs(categoryQuery);

    if (snap.empty) {
      return [];
    }

    return snap.docs.map((d) => d.data() as ProductDocument);
  } catch (error) {
    throw new Error(
      `[productService] Failed to filter by category "${category}": ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }
}

// ─────────────────────────────────────────────

/**
 * Creates a new product in the products collection.
 *
 * productId is auto-generated by Firestore and written back
 * into the document. createdAt is set to the current timestamp.
 *
 * @param product - Full product data excluding productId and createdAt
 * @returns The auto-generated productId string
 * @throws If required fields are missing or on Firestore write failure
 *
 * TODO: Add admin check before allowing creation
 */
export async function createProduct(
  product: Omit<ProductDocument, "productId" | "createdAt">
): Promise<string> {
  try {
    // Validate required fields before writing
    if (!product.name || product.name.trim() === "") {
      throw new Error("[productService] Product name is required.");
    }
    if (!product.category || product.category.trim() === "") {
      throw new Error("[productService] Product category is required.");
    }
    if (typeof product.price !== "number" || product.price < 0) {
      throw new Error("[productService] Product price must be a non-negative number.");
    }
    if (typeof product.stock !== "number" || product.stock < 0) {
      throw new Error("[productService] Product stock must be a non-negative number.");
    }

    const productsRef = collection(db, COLLECTIONS.PRODUCTS);
    const now = Timestamp.now();

    // Use addDoc to let Firestore auto-generate the document ID
    const docRef = await addDoc(productsRef, {
      ...product,
      productId: "", // Temporary — overwritten immediately below
      createdAt: now,
      updatedAt: now,
    });

    // Write the auto-generated ID back into the document
    await updateDoc(docRef, { productId: docRef.id });

    return docRef.id;
  } catch (error) {
    if (error instanceof Error && error.message.startsWith("[productService]")) {
      throw error;
    }
    throw new Error(
      `[productService] Failed to create product: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }
}

// ─────────────────────────────────────────────

/**
 * Updates specific fields on an existing product document.
 *
 * Immutable fields (productId, createdAt) are stripped before
 * writing. updatedAt is always stamped with the current time.
 *
 * @param productId - Firestore document ID of the product to update
 * @param updates   - Partial ProductDocument with only the fields to change
 * @throws If the product does not exist or on Firestore write failure
 *
 * TODO: Add admin check before allowing update
 */
export async function updateProduct(
  productId: string,
  updates: Partial<ProductDocument>
): Promise<void> {
  try {
    const productRef = doc(db, COLLECTIONS.PRODUCTS, productId);

    const snap = await getDoc(productRef);
    if (!snap.exists()) {
      throw new Error(
        `[productService] Cannot update — no product found with ID: ${productId}`
      );
    }

    // Strip immutable fields
    const safeUpdates = { ...updates };
    IMMUTABLE_FIELDS.forEach((field) => {
      if (field in safeUpdates) {
        console.warn(
          `[productService] Attempted to update immutable field "${field}" — ignored.`
        );
        delete safeUpdates[field];
      }
    });

    safeUpdates.updatedAt = Timestamp.now();

    await updateDoc(productRef, safeUpdates);
  } catch (error) {
    if (error instanceof Error && error.message.startsWith("[productService]")) {
      throw error;
    }
    throw new Error(
      `[productService] Failed to update product ${productId}: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }
}

// ─────────────────────────────────────────────

/**
 * Deletes a product document from Firestore.
 *
 * Prefer soft-deleting via updateProduct({ isActive: false })
 * to preserve order history references. Only hard-delete when
 * the product has never been ordered.
 *
 * @param productId - Firestore document ID of the product to delete
 * @throws If the product does not exist or on Firestore write failure
 *
 * TODO: Add admin check before allowing deletion
 */
export async function deleteProduct(productId: string): Promise<void> {
  try {
    const productRef = doc(db, COLLECTIONS.PRODUCTS, productId);

    const snap = await getDoc(productRef);
    if (!snap.exists()) {
      throw new Error(
        `[productService] Cannot delete — no product found with ID: ${productId}`
      );
    }

    await deleteDoc(productRef);
  } catch (error) {
    if (error instanceof Error && error.message.startsWith("[productService]")) {
      throw error;
    }
    throw new Error(
      `[productService] Failed to delete product ${productId}: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }
}

// ─────────────────────────────────────────────

/**
 * Updates the stock level of a product.
 *
 * Pass a positive quantity to increase stock (restocking),
 * or a negative quantity to decrease it (order checkout).
 *
 * @param productId - Firestore document ID of the product
 * @param quantity  - Amount to add (positive) or subtract (negative)
 * @throws If the product does not exist
 * @throws If quantity is not a valid integer
 * @throws If the resulting stock would go below zero
 */
export async function updateStock(
  productId: string,
  quantity: number
): Promise<void> {
  try {
    // Validate quantity
    if (!Number.isInteger(quantity) || quantity === 0) {
      throw new Error(
        "[productService] Stock quantity must be a non-zero integer."
      );
    }

    const productRef = doc(db, COLLECTIONS.PRODUCTS, productId);
    const snap = await getDoc(productRef);

    if (!snap.exists()) {
      throw new Error(
        `[productService] Cannot update stock — no product found with ID: ${productId}`
      );
    }

    const product = snap.data() as ProductDocument;
    const newStock = product.stock + quantity;

    // Prevent stock from going negative
    if (newStock < 0) {
      throw new Error(
        `[productService] Insufficient stock for product ${productId}. ` +
          `Available: ${product.stock}, Requested: ${Math.abs(quantity)}`
      );
    }

    await updateDoc(productRef, {
      stock: newStock,
      updatedAt: Timestamp.now(),
    });
  } catch (error) {
    if (error instanceof Error && error.message.startsWith("[productService]")) {
      throw error;
    }
    throw new Error(
      `[productService] Failed to update stock for product ${productId}: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }
}
