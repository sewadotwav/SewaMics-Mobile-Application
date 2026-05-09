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
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "../../context/AuthContext";
import { getUserProfile } from "../../services/userService";
import { useProducts } from "../../hooks/useProducts";
import { getProductImage } from "../../utils/imageMapper";

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

  const [refreshing, setRefreshing] = useState(false);
  const [userName, setUserName] = useState("Guest");
  const [searchQuery, setSearchQuery] = useState("");
  const [favorites, setFavorites] = useState<Record<string, boolean>>({});

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

  const toggleFavorite = (id: string) => {
    setFavorites(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  // Locally filter products based on the search query
  const filteredProducts = useMemo(() => {
    if (!searchQuery.trim()) return products;
    return products.filter((p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [products, searchQuery]);

  return (
    <View style={styles.safeArea}>
      {/* A. HEADER SECTION */}
      <View style={[styles.header, { paddingTop: Math.max(insets.top, Platform.OS === 'android' ? 40 : 0) }]}>
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
          onPress={() => navigation.navigate("Profile")}
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
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search"
            placeholderTextColor="#9ca3af"
            value={searchQuery}
            onChangeText={setSearchQuery}
            returnKeyType="search"
          />
          <TouchableOpacity
            style={styles.searchButton}
            activeOpacity={0.8}
          >
            <Feather name="search" size={20} color="#ffffff" />
          </TouchableOpacity>
        </View>

        {/* Big Welcome Message */}
        <View style={styles.welcomeBanner}>
          <Text style={styles.welcomeBannerText}>Welcome, browse coolness now!</Text>
          <Text style={styles.welcomeSubtext}>Discover playful handmade ceramic mugs made to brighten up your sip made by yours truly in SewaMic</Text>
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

        {/* E. CATEGORY TAB SWITCHER (Centered and justified) */}
        <View style={styles.tabContainer}>
          {categories.map((cat) => {
            const isActive = cat.toLowerCase() === selectedCategory.toLowerCase();
            return (
              <TouchableOpacity
                key={cat}
                style={[
                  styles.tabButton,
                  isActive ? styles.tabButtonActive : styles.tabButtonInactive,
                ]}
                onPress={() => setSelectedCategory(cat)}
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    styles.tabText,
                    isActive ? styles.tabTextActive : styles.tabTextInactive,
                  ]}
                >
                  {cat}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={styles.productGridContainer}>
          {isLoading && !refreshing ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#9d174d" />
            </View>
          ) : filteredProducts.length > 0 ? (
            <View style={styles.productGrid}>
              {filteredProducts.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  style={styles.productCard}
                  onPress={() => navigation.navigate("ProductDetail", { productId: item.id })}
                  activeOpacity={0.9}
                >
                  <View style={styles.productImageContainer}>
                    <Image
                      source={getProductImage(item.imageKey)}
                      style={styles.productImage}
                      resizeMode="cover"
                    />

                    {/* Favorite Heart Icon Overlay */}
                    <TouchableOpacity
                      style={styles.favoriteButton}
                      onPress={() => toggleFavorite(item.id)}
                      activeOpacity={0.7}
                    >
                      <Ionicons
                        name={favorites[item.id] ? "heart" : "heart-outline"}
                        size={16}
                        color={favorites[item.id] ? "#9d174d" : "#6b7280"}
                      />
                    </TouchableOpacity>
                  </View>

                  {/* Content Row: Title and Rating */}
                  <View style={styles.cardContentRow}>
                    <View style={styles.titleWrapper}>
                      {/* Full text, no truncation */}
                      <Text style={styles.productName}>
                        {item.name}
                      </Text>
                    </View>
                    <View style={styles.ratingContainer}>
                      <Text style={styles.ratingStar}>⭐</Text>
                      <Text style={styles.ratingText}>{item.rating || "0.0"}</Text>
                    </View>
                  </View>

                  {/* Price Row */}
                  <Text style={styles.productPrice}>
                    ₱{Number(item.price).toFixed(2)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          ) : (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No products found.</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
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
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingBottom: 12,
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

  // Search Bar
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 16,
    height: 52,
    borderRadius: 26,
    backgroundColor: "#f9fafb",
    borderWidth: 1.5,
    borderColor: "#fb923c",
    paddingLeft: 20,
    paddingRight: 4,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    fontFamily: "Zalando-ExtraLight", // 200 for placeholder/search
    color: "#1f2937",
    padding: 0,
  },
  searchButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#fb923c",
    justifyContent: "center",
    alignItems: "center",
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
    color: "#6b7280",
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

  // Category Tabs (Centered/Justified)
  tabContainer: {
    flexDirection: "row",
    justifyContent: "center", // Center tabs tightly
    alignItems: "center",
    paddingHorizontal: 16,
    marginBottom: 24,
    width: "100%",
  },
  tabButton: {
    flex: 1, // Flex 1 ensures they divide the space equally
    paddingVertical: 10,
    marginHorizontal: 4,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  tabButtonActive: {
    backgroundColor: "#fb923c",
  },
  tabButtonInactive: {
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  tabText: {
    fontSize: 14,
    fontFamily: "Zalando-SemiBold", // 600
    letterSpacing: -0.3,
  },
  tabTextActive: {
    color: "#ffffff",
  },
  tabTextInactive: {
    color: "#6b7280",
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
  productCard: {
    width: "48%",
    marginBottom: 24,
  },
  productImageContainer: {
    width: "100%",
    aspectRatio: 1,
    borderRadius: 16,
    backgroundColor: "#fcfbf8",
    overflow: "hidden",
    marginBottom: 12,
  },
  productImage: {
    width: "100%", // Full width, no margin
    height: "100%", // Full height, no margin
  },
  favoriteButton: {
    position: "absolute",
    top: 10,
    right: 10,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#ffffff",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },

  cardContentRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start", // Keeps rating perfectly flush with the first line of text
    marginBottom: 4,
  },
  titleWrapper: {
    flex: 1,
    minHeight: 44, // Generous height for 2 lines without breaking row alignment
    marginRight: 8,
  },
  productName: {
    fontSize: 15,
    fontFamily: "Zalando-Medium", // 500 as requested
    lineHeight: 18,
    letterSpacing: -0.2,
    color: "#1f2937",
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 0, // 0 margin ensures strict top alignment with text
  },
  ratingStar: {
    fontSize: 14, // Bigger star
    marginRight: 2,
  },
  ratingText: {
    fontSize: 14,
    fontFamily: "Zalando-Bold", // 700 for importance
    color: "#6b7280",
  },
  productPrice: {
    fontSize: 17,
    fontFamily: "Zalando-SemiBold", // 600 as requested
    letterSpacing: -0.5,
    color: "#1f2937",
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
