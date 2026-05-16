import React, { useState, useEffect, useMemo } from "react";
import {
  ScrollView,
  View,
  Text,
  ActivityIndicator,
  Modal,
  TouchableOpacity,
  StyleSheet,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { ProductCard } from "../../components/common/ProductCard";
import { LoadingScreen } from "../../components/common/LoadingScreen";
import { CategoryTabs } from "../../components/common/CategoryTabs";
import { SearchBar } from "../../components/common/SearchBar";
import { useProducts } from "../../hooks/useProducts";
import { useAuth } from "../../context/AuthContext";
import { Product } from "../../services/productService";
export const CatalogScreen = ({ navigation }: any) => {
  const { user } = useAuth();
  
  const {
    products,
    categories,
    selectedCategory,
    setSelectedCategory,
    isLoading,
  } = useProducts(""); // Pass empty string to fetch all if useProducts supports it, but wait, useProducts initializes with "Fruits" or first category. Let's adapt it.

  // State for Catalog
  const [searchTerm, setSearchTerm] = useState("");
  const [sortMenuVisible, setSortMenuVisible] = useState(false);
  const [selectedSort, setSelectedSort] = useState<string>("default");

  // Since useProducts sets a default category, if we want an "All" view, we need to handle it.
  // For now, let's inject "All" into the category list client-side if it's not there.
  const displayCategories = ["All", ...categories.filter(c => c !== "All")];
  
  // If useProducts didn't load "All", let's handle selected category state here to override it
  const [localCategory, setLocalCategory] = useState<string>("All");

  // When "All" is selected, useProducts doesn't know what to do if it's strictly checking string.
  // Actually, useProducts accepts `selectedCategory`. Let's handle fetch logic carefully.
  // Wait, useProducts hook will fetch all if we pass an empty string, but the initial category sets to "Fruits".
  // Let's rely on useProducts but force empty string when 'All'.
  useEffect(() => {
    if (localCategory === "All") {
      setSelectedCategory(""); // fetch all (productService.ts ignores filter if empty)
    } else {
      setSelectedCategory(localCategory);
    }
  }, [localCategory, setSelectedCategory]);


  // Filtering & Sorting Logic
  const filteredAndSortedProducts = useMemo(() => {
    let result = [...products];

    // Search Filter
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(term) ||
          p.description.toLowerCase().includes(term)
      );
    }

    // Sorting
    switch (selectedSort) {
      case "price-asc":
        result.sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        result.sort((a, b) => b.price - a.price);
        break;
      case "rating-high":
        result.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      case "rating-low":
        result.sort((a, b) => (a.rating || 0) - (b.rating || 0));
        break;
      default:
        break; // original order
    }

    return result;
  }, [products, searchTerm, selectedSort]);

  const handleClearFilters = () => {
    setSearchTerm("");
    setLocalCategory("All");
    setSelectedSort("default");
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      {/* SEARCH BAR replacing Header */}
      <View style={styles.topSearchSection}>
        <SearchBar
          value={searchTerm}
          onChangeText={setSearchTerm}
          placeholder="Search ceramics..."
        />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.pageTitle}>Product Catalog</Text>



        {/* CATEGORIES */}
        <CategoryTabs
          categories={displayCategories}
          selectedCategory={localCategory}
          onSelectCategory={setLocalCategory}
          style={styles.categoryTabs}
        />

        {/* SORT BAR */}
        <View style={styles.sortBar}>
          <Text style={styles.resultsCount}>
            {filteredAndSortedProducts.length} products
          </Text>
          <TouchableOpacity
            style={styles.sortButton}
            onPress={() => setSortMenuVisible(true)}
            activeOpacity={0.7}
          >
            <Feather name="sliders" size={16} color="#9ca3af" />
            <Text style={styles.sortButtonText}>Sort</Text>
          </TouchableOpacity>
        </View>

        {/* PRODUCT GRID OR EMPTY STATE */}
        {isLoading ? (
          <LoadingScreen />
        ) : filteredAndSortedProducts.length === 0 ? (
          <View style={styles.emptyState}>
            <Feather name="search" size={48} color="#9ca3af" />
            <Text style={styles.emptyTitle}>No products found</Text>
            <Text style={styles.emptySubtext}>
              Try adjusting your filters or search term
            </Text>
            <TouchableOpacity
              style={styles.clearFiltersButton}
              onPress={handleClearFilters}
            >
              <Text style={styles.clearFiltersText}>Clear All Filters</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.productGrid}>
            {filteredAndSortedProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onPress={(id) =>
                  navigation.navigate("ProductDetail", { productId: id })
                }
              />
            ))}
          </View>
        )}
      </ScrollView>

      {/* SORT MODAL */}
      <Modal
        visible={sortMenuVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setSortMenuVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setSortMenuVisible(false)}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Sort Products</Text>
            </View>

            {[
              { id: "default", label: "Default", icon: "list" },
              { id: "price-asc", label: "Price: Low to High", icon: "arrow-up" },
              { id: "price-desc", label: "Price: High to Low", icon: "arrow-down" },
              { id: "rating-high", label: "Highest Rating", icon: "star" },
              { id: "rating-low", label: "Lowest Rating", icon: "star" },
            ].map((option) => (
              <TouchableOpacity
                key={option.id}
                style={styles.sortOption}
                onPress={() => {
                  setSelectedSort(option.id);
                  setSortMenuVisible(false);
                }}
              >
                <Feather name={option.icon as any} size={16} color="#9ca3af" style={styles.sortOptionIcon} />
                <Text style={styles.sortOptionText}>{option.label}</Text>
                {selectedSort === option.id && (
                  <Feather name="check" size={16} color="#ff914d" />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#ffffff" },
  scrollContent: { paddingBottom: 10 },
  pageTitle: {
    fontSize: 28,
    fontFamily: "Zalando-Bold", // 700
    letterSpacing: -0.5,
    color: "#ff914d", 
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  topSearchSection: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#ffffff",
  },

  categoryTabs: {
    marginTop: 16,
    marginBottom: 0,
  },
  sortBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    height: 48,
    paddingHorizontal: 16,
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 16,
    backgroundColor: "#f9fafb",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  resultsCount: {
    fontSize: 12,
    fontFamily: "Zalando-Medium",
    color: "#6b7280",
  },
  sortButton: {
    flexDirection: "row",
    alignItems: "center",
  },
  sortButtonText: {
    fontSize: 12,
    fontFamily: "Zalando-SemiBold",
    color: "#9d174d",
    marginLeft: 6,
  },
  loadingContainer: {
    marginTop: 40,
    alignItems: "center",
  },
  productGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    paddingHorizontal: 16,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
    marginTop: 40,
  },
  emptyTitle: {
    fontSize: 16,
    fontFamily: "Zalando-Bold",
    color: "#1f2937",
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 13,
    fontFamily: "Zalando-Regular",
    color: "#6b7280",
    marginTop: 8,
    marginBottom: 24,
  },
  clearFiltersButton: {
    height: 44,
    paddingHorizontal: 24,
    borderRadius: 12,
    backgroundColor: "#f9fafb",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    justifyContent: "center",
    alignItems: "center",
  },
  clearFiltersText: {
    fontSize: 13,
    fontFamily: "Zalando-SemiBold",
    color: "#9d174d",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#ffffff",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 16,
    paddingBottom: 32,
  },
  modalHeader: {
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
    marginBottom: 8,
  },
  modalTitle: {
    fontSize: 16,
    fontFamily: "Zalando-SemiBold",
    color: "#1f2937",
  },
  sortOption: {
    flexDirection: "row",
    alignItems: "center",
    height: 44,
    paddingHorizontal: 8,
  },
  sortOptionIcon: {
    marginRight: 12,
  },
  sortOptionText: {
    flex: 1,
    fontSize: 14,
    fontFamily: "Zalando-Medium",
    color: "#1f2937",
  },
});
