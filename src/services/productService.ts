import { collection, getDocs, query, where, orderBy, limit, DocumentData } from "firebase/firestore";
import { db } from "../config/firebaseConfig";

export interface Product {
  id: string; // Document ID (or productID field)
  category: string;
  currency: string;
  description: string;
  imageKey: string;
  isActive: boolean;
  name: string;
  price: number;
  productID: string;
  rating: number;
  reviews: number;
  stock: number;
}

export const getProducts = async (categoryFilter?: string, maxLimit: number = 20): Promise<Product[]> => {
  try {
    const productsRef = collection(db, "products");
    let q = query(productsRef, where("isActive", "==", true));
    
    if (categoryFilter) {
      q = query(q, where("category", "==", categoryFilter));
    }
    
    // To avoid requiring a composite index in Firestore for every category,
    // we remove orderBy from the query and sort client-side instead.
    if (maxLimit > 0) {
      q = query(q, limit(maxLimit * 3)); // fetch a bit more to sort properly
    }
    
    const snapshot = await getDocs(q);
    
    const products: Product[] = [];
    snapshot.forEach((doc) => {
      const data = doc.data() as DocumentData;
      products.push({
        id: doc.id,
        category: data.category || "Uncategorized",
        currency: data.currency || "₱",
        description: data.description || "",
        imageKey: data.imageKey || "",
        isActive: data.isActive !== false,
        name: data.name || "Unknown Product",
        price: data.price || 0,
        productID: data.productID || doc.id,
        rating: data.rating || 0,
        reviews: data.reviews || 0,
        stock: data.stock || 0,
      });
    });
    
    // Sort by rating descending client-side to avoid Firebase Index errors
    products.sort((a, b) => b.rating - a.rating);
    
    // Return only the requested limit
    return products.slice(0, maxLimit);
  } catch (error) {
    console.error("Error fetching products:", error);
    throw error;
  }
};

export const getCategories = async (): Promise<string[]> => {
  try {
    // In a production app with thousands of items, you might want a separate "categories" collection.
    // For this prototype, we'll fetch all active products and extract unique categories.
    // Since Firebase doesn't have a native SELECT DISTINCT, this is an acceptable approach for <100 items.
    const productsRef = collection(db, "products");
    const q = query(productsRef, where("isActive", "==", true));
    const snapshot = await getDocs(q);
    
    const categoriesSet = new Set<string>();
    snapshot.forEach((doc) => {
      const categoryRaw = doc.data().category;
      if (categoryRaw && typeof categoryRaw === "string") {
        // Normalize: "fruits" -> "Fruits", "ANIMALS" -> "Animals"
        const normalized = categoryRaw.trim().charAt(0).toUpperCase() + categoryRaw.trim().slice(1).toLowerCase();
        categoriesSet.add(normalized);
      }
    });
    
    // Sort categories, maybe ensure "Fruits" is first as per requirements
    const categories = Array.from(categoriesSet);
    categories.sort((a, b) => {
      if (a === "Fruits") return -1;
      if (b === "Fruits") return 1;
      return a.localeCompare(b);
    });
    
    // Fallback if empty
    if (categories.length === 0) {
      return ["Fruits", "Vegetables", "Animals"];
    }
    
    return categories;
  } catch (error) {
    console.error("Error fetching categories:", error);
    // Return defaults if error
    return ["Fruits", "Vegetables", "Animals"];
  }
};
