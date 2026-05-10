// ============================================================
// SewaMics — Home Screen
// File: src/screens/home/HomeScreen.tsx
// ============================================================

import React, { useState, useEffect, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  TextInput,
  RefreshControl,
  ActivityIndicator,
  Platform,
} from "react-native";
import { Feather, Ionicons } from "@expo/vector-icons";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "../../context/AuthContext";
import { getUserProfile } from "../../services/userService";
import { useProducts } from "../../hooks/useProducts";
import { getProductImage } from "../../utils/imageMapper";
import { useWishlist } from "../../context/WishlistContext";
import { SearchBar } from "../../components/common/SearchBar";
import { CategoryTabs } from "../../components/common/CategoryTabs";
import { ProductCard } from "../../components/common/ProductCard";

export const HomeScreen = ({ navigation }: any) => {
  const { user } = useAuth();
  const insets = useSafeAreaInsets();

  const {
    products,
    categories,
    selectedCategory,
    setSelectedCategory,
    isLoading,
    refreshProducts,
  } = useProducts();

  const { toggleWishlist, isInWishlist } = useWishlist();
  const [refreshing, setRefreshing] = useState(false);
  const [userName, setUserName] = useState("Guest");
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch current user's profile
  useEffect(() => {
    let isMounted = true;
    const fetchUserName = async () => {
      if (user?.uid) {
        try {
          const profile = await getUserProfile(user.uid);
          if (isMounted && profile && profile.name) {
            const firstName = profile.name.split(" ")[0];
            setUserName(firstName);
          }
        } catch (error) {
          console.error("Error fetching user profile:", error);
        }
      }
    };
    fetchUserName();
    return () => { isMounted = false; };
  }, [user]);

  const onRefresh = async () => {
    setRefreshing(true);
    await refreshProducts();
    setRefreshing(false);
  };

  // Locally filter products based on the search query
  const filteredProducts = useMemo(() => {
    if (!searchQuery.trim()) return products;
    return products.filter((p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [products, searchQuery]);

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      {/* A. HEADER SECTION */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.navigate("AppRoot")}
          activeOpacity={0.7}
        >
          <Image
            source={require("../../../assets/Brand/SewaLogo.png")}
            style={styles.logo}
            resizeMode="contain"
          />
        </TouchableOpacity>

        {/* User Greeting */}
        <TouchableOpacity
          style={styles.userPill}
          onPress={() => navigation.navigate("ProfileTab")}
          activeOpacity={0.8}
        >
          <Text style={styles.userPillText}>Sup, {userName}?</Text>
          <View style={styles.avatarContainer}>
            <Feather name="user" size={16} color="#ffffff" />
          </View>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingBottom: 5 }]} // Reduced padding to remove dead space while keeping cards visible above tab bar
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#9d174d" />
        }
      >
        {/* B. SEARCH BAR SECTION */}
        <View style={styles.searchSection}>
          <SearchBar
            value={searchQuery}
            onChangeText={setSearchQuery}
            onFocus={() => navigation.navigate("CatalogTab")}
          />
        </View>

        {/* Big Welcome Message */}
        <View style={styles.welcomeBanner}>
          <Text style={styles.welcomeBannerText}>Welcome, browse coolness now!</Text>
          <Text style={styles.welcomeSubtext}>Discover playful handmade ceramic mugs made to brighten up your sip made by yours truly in SewaMics</Text>
        </View>

        {/* C. HERO SECTION */}
        <View style={styles.heroContainer}>
          <Image
            source={require("../../../assets/Brand/SewaMicsHero.png")}
            style={styles.heroImage}
            resizeMode="cover"
          />
        </View>

        {/* D. FEATURED SHOWCASE */}
        <View style={styles.featuredContainer}>
          <View style={styles.featuredCard}>
            <Image
              source={require("../../../assets/Featured Products/showcase1.jpg")}
              style={styles.featuredImage}
              resizeMode="cover"
            />
          </View>
          <View style={styles.featuredCard}>
            <Image
              source={require("../../../assets/Featured Products/showcase2.jpg")}
              style={styles.featuredImage}
              resizeMode="cover"
            />
          </View>
        </View>

        {/* F. PRODUCT SHOWCASE Header moved above Tabs */}
        <View style={styles.productShowcaseHeader}>
          <Text style={styles.sectionTitle}>Product Showcase</Text>
        </View>

        {/* E. CATEGORY TAB SWITCHER */}
        <CategoryTabs
          categories={categories}
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
        />

        <View style={styles.productGridContainer}>
          {isLoading && !refreshing ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#9d174d" />
            </View>
          ) : filteredProducts.length > 0 ? (
            <View style={styles.productGrid}>
              {filteredProducts.map((item) => (
                <ProductCard
                  key={item.id}
                  product={item}
                  onPress={(id) => navigation.navigate("ProductDetail", { productId: id })}
                />
              ))}
            </View>
          ) : (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No products found.</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

// ─── Styles ──────────────────────────────────────────────────
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  scrollContent: {
    backgroundColor: "#ffffff",
  },

  // Header
  header: {
    height: 56,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
    backgroundColor: "#ffffff",
  },
  logo: {
    width: 64, // Increased logo size
    height: 48,
  },
  userPill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffffff",
    paddingVertical: 6,
    paddingLeft: 12,
    paddingRight: 6,
    borderRadius: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  userPillText: {
    fontSize: 14,
    fontFamily: "Zalando-Bold", // 700
    letterSpacing: -0.5,
    color: "#001b3a",
    marginRight: 8,
  },
  avatarContainer: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#9d174d",
    justifyContent: "center",
    alignItems: "center",
  },

  // Search Section Wrapper
  searchSection: {
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 16,
  },

  // Big Welcome Banner
  welcomeBanner: {
    marginHorizontal: 16,
    marginBottom: 12,
  },
  welcomeBannerText: {
    fontSize: 36, // Increased to match Log In/Sign Up titles
    fontFamily: "Zalando-SemiBold", // 600 as requested
    letterSpacing: -0.5,
    color: "#fb923c", // Match orange theme
    marginBottom: 4,
  },
  welcomeSubtext: {
    fontSize: 15,
    fontFamily: "Zalando-Medium", // 500 weight as product names
    color: "#1f2937", // Updated from gray to black
    lineHeight: 20,
    textAlign: "left",
  },

  // Hero Section
  heroContainer: {
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 16,
    overflow: "hidden",
    height: 160,
  },
  heroImage: {
    width: "100%",
    height: "100%",
  },

  // Featured Showcase
  featuredContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginHorizontal: 16,
    marginBottom: 20,
  },
  featuredCard: {
    width: "48%", // Use exact percentage instead of flex to fix Android image blowout
    height: 160,
    backgroundColor: "#f3f4f6",
    borderRadius: 16,
    overflow: "hidden",
  },
  featuredImage: {
    width: "100%",
    height: "100%",
  },



  // Product Showcase Typography
  productShowcaseHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 16,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: "Zalando-Bold", // 700
    letterSpacing: -0.5,
    color: "#fb923c", // Updated to brand orange
  },

  // 2-Column Grid Layout
  productGridContainer: {
    paddingHorizontal: 16,
  },
  productGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },

  loadingContainer: {
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
  },
  emptyContainer: {
    width: "100%",
    padding: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyText: {
    color: "#6b7280",
    fontSize: 14,
    fontFamily: "Zalando-Light", // 300
  },
});
