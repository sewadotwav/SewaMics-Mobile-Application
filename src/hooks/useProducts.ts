import { useState, useEffect, useCallback } from "react";
import { Product, getProducts, getCategories } from "../services/productService";

export const useProducts = (initialCategory?: string) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>(
    initialCategory !== undefined ? initialCategory : "Fruits"
  );
  
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);


  useEffect(() => {
    let isMounted = true;
    
    const fetchCategories = async () => {
      try {
        const fetchedCategories = await getCategories();
        if (isMounted) {
          setCategories(fetchedCategories);
          if (initialCategory === undefined && fetchedCategories.length > 0) {
            setSelectedCategory(fetchedCategories[0]);
          }
        }
      } catch (err) {
        console.error(err);
      }
    };
    
    fetchCategories();
    return () => { isMounted = false; };
  }, [initialCategory]);


  const fetchProducts = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const fetchedProducts = await getProducts(selectedCategory || undefined, 100);
      setProducts(fetchedProducts);
    } catch (err: any) {
      setError(err.message || "Failed to fetch products");
    } finally {
      setIsLoading(false);
    }
  }, [selectedCategory]);

  useEffect(() => {
    let isMounted = true;
    
    const loadData = async () => {
      if (selectedCategory !== undefined) {
        try {
          setIsLoading(true);
          const data = await getProducts(selectedCategory || undefined, 100);
          if (isMounted) {
            setProducts(data);
          }
        } catch (err: any) {
          if (isMounted) setError(err.message);
        } finally {
          if (isMounted) setIsLoading(false);
        }
      }
    };
    
    loadData();
    return () => { isMounted = false; };
  }, [selectedCategory]);

  const refreshProducts = () => {
    return fetchProducts();
  };

  return {
    products,
    categories,
    selectedCategory,
    setSelectedCategory,
    isLoading,
    error,
    refreshProducts
  };
};
