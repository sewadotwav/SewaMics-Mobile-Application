import { collection, getDocs, query, where, limit, doc, getDoc, DocumentData } from "firebase/firestore";
import { db } from "../config/firebaseConfig";

export interface Product {
  id: string;
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
  reviewCount?: number;
  stock: number;
  features?: string[];
  sizes?: string[];
  specifications?: Record<string, string>;
}

export const getProductById = async (productId: string): Promise<Product | null> => {
  try {
    const docRef = doc(db, "products", productId);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) return null;

    const rawData = docSnap.data() as DocumentData;
    const priceValue = rawData.price ?? rawData.Price ?? rawData["price "] ?? 0;

    return {
      id: docSnap.id,
      category: rawData.category || "Uncategorized",
      currency: rawData.currency || "₱",
      description: rawData.description || "",
      imageKey: rawData.imageKey || rawData.image || rawData.imageUrl || rawData.imageUri || "",
      isActive: rawData.isActive !== false,
      name: String(rawData.name || rawData.Name || rawData["name "] || rawData.title || rawData.Title || "Unknown Product").trim(),
      price: Number(priceValue),
      productID: rawData.productID || rawData.productId || docSnap.id,
      rating: rawData.rating || 0,
      reviews: rawData.reviews || 0,
      reviewCount: rawData.reviewCount ?? rawData.reviews ?? 0,
      stock: rawData.stock || 0,
      features: rawData.features || [],
      sizes: rawData.sizes || ["Small", "Medium", "Large"],
      specifications: rawData.specifications || {},
    };
  } catch (error) {
    console.error("Error fetching product by ID:", error);
    throw error;
  }
};

export const getProducts = async (categoryFilter?: string, maxLimit: number = 20): Promise<Product[]> => {
  try {
    const productsRef = collection(db, "products");
    let q = query(productsRef, where("isActive", "==", true));

    if (categoryFilter) {
      q = query(q, where("category", "==", categoryFilter));
    }


    if (maxLimit > 0) {
      q = query(q, limit(maxLimit * 3));
    }

    const snapshot = await getDocs(q);

    const products: Product[] = [];
    snapshot.forEach((doc) => {
      if (!doc.exists()) return;
      const rawData = doc.data() as DocumentData;

      const priceValue = rawData.price ?? rawData.Price ?? rawData["price "] ?? 0;
      const finalPrice = Number(priceValue);

      products.push({
        id: doc.id,
        category: rawData.category || "Uncategorized",
        currency: rawData.currency || "₱",
        description: rawData.description || "",
        imageKey: rawData.imageKey || rawData.image || rawData.imageUrl || rawData.imageUri || "",
        isActive: rawData.isActive !== false,
        name: String(rawData.name || rawData.Name || rawData["name "] || rawData.title || rawData.Title || "Unknown Product").trim(),
        price: finalPrice,
        productID: rawData.productID || rawData.productId || doc.id,
        rating: rawData.rating || 0,
        reviews: rawData.reviews || 0,
        stock: rawData.stock || 0,
      });
    });


    products.sort((a, b) => b.rating - a.rating);
    return products.slice(0, maxLimit);
  } catch (error) {
    console.error("Error fetching products:", error);
    throw error;
  }
};

export const getCategories = async (): Promise<string[]> => {
  try {


    const productsRef = collection(db, "products");
    const q = query(productsRef, where("isActive", "==", true));
    const snapshot = await getDocs(q);

    const categoriesSet = new Set<string>();
    snapshot.forEach((doc) => {
      const categoryRaw = doc.data().category;
      if (categoryRaw && typeof categoryRaw === "string") {
        const normalized = categoryRaw.trim().charAt(0).toUpperCase() + categoryRaw.trim().slice(1).toLowerCase();
        categoriesSet.add(normalized);
      }
    });

    const categories = Array.from(categoriesSet);
    categories.sort((a, b) => {
      if (a === "Fruits") return -1;
      if (b === "Fruits") return 1;
      return a.localeCompare(b);
    });

    if (categories.length === 0) return ["Fruits", "Vegetables", "Animals"];

    return categories;
  } catch (error) {
    console.error("Error fetching categories:", error);
    return ["Fruits", "Vegetables", "Animals"];
  }
};
