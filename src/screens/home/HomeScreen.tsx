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
  Animated,
  Dimensions,
} from "react-native";
import { Feather, Ionicons } from "@expo/vector-icons";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "../../context/AuthContext";
import { getUserProfile } from "../../services/userService";
import { useProducts } from "../../hooks/useProducts";
import { getProductImage } from "../../utils/imageMapper";
import { useWishlist } from "../../context/WishlistContext";
import { LoadingScreen } from "../../components/common/LoadingScreen";
import { SearchBar } from "../../components/common/SearchBar";
import { CategoryTabs } from "../../components/common/CategoryTabs";
import { ProductCard } from "../../components/common/ProductCard";
import { FloatingMascotBubble } from "../../components/common/FloatingMascotBubble";

const { width: windowWidth } = Dimensions.get("window");
const cardWidth = (windowWidth - 32) * 0.48;

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

  const FEATURED_IMAGES = useMemo(() => [
    require("../../../assets/Featured Products/featuredBanana.png"),
    require("../../../assets/Featured Products/featuredGrapes.png"),
    require("../../../assets/Featured Products/featuredPumpkin.png"),
    require("../../../assets/Featured Products/featuredStrawberry.png"),
    require("../../../assets/Featured Products/showcase1.png"),
    require("../../../assets/Featured Products/showcase2.png"),
  ], []);

  const [imgIdx, setImgIdx] = useState({ prev: 0, curr: 0 });
  const slideAnim = useMemo(() => new Animated.Value(0), []);

  useEffect(() => {
    const interval = setInterval(() => {
      setImgIdx(prev => ({ prev: prev.curr, curr: (prev.curr + 2) % FEATURED_IMAGES.length }));
    }, 4000);
    return () => clearInterval(interval);
  }, [FEATURED_IMAGES.length]);

  useEffect(() => {
    if (imgIdx.curr !== imgIdx.prev) {
      slideAnim.setValue(0);
      Animated.timing(slideAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }).start();
    }
  }, [imgIdx, slideAnim]);

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
            source={require("../../../assets/Brand/newSewaMicsLogo.png")}
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
        <View style={styles.featuredHeaderRow}>
          <Text style={styles.sectionTitle}>Featured</Text>
          <TouchableOpacity onPress={() => navigation.navigate("CatalogTab")} activeOpacity={0.7}>
            <Text style={styles.seeMoreText}>See more...</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.featuredContainer}>
          <View style={styles.featuredCard}>
            <Animated.View
              style={[
                {
                  width: cardWidth * 2,
                  height: "100%",
                  flexDirection: "row",
                },
                {
                  transform: [
                    {
                      translateX: slideAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [-cardWidth, 0],
                      }),
                    },
                    {
                      scaleX: slideAnim.interpolate({
                        inputRange: [0, 0.5, 1],
                        outputRange: [1, 1.08, 1], // Simulates horizontal motion blur
                      }),
                    },
                  ],
                },
              ]}
            >
              {/* Left Side: Incoming Image */}
              <View style={{ width: cardWidth, height: "100%" }}>
                <Image
                  source={FEATURED_IMAGES[imgIdx.curr]}
                  style={styles.featuredImage}
                  resizeMode="cover"
                />
              </View>
              {/* Right Side: Outgoing Image */}
              <View style={{ width: cardWidth, height: "100%" }}>
                <Image
                  source={FEATURED_IMAGES[imgIdx.prev]}
                  style={styles.featuredImage}
                  resizeMode="cover"
                />
              </View>
            </Animated.View>
          </View>
          
          <View style={styles.featuredCard}>
            <Animated.View
              style={[
                {
                  width: cardWidth * 2,
                  height: "100%",
                  flexDirection: "row",
                },
                {
                  transform: [
                    {
                      translateX: slideAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [-cardWidth, 0],
                      }),
                    },
                    {
                      scaleX: slideAnim.interpolate({
                        inputRange: [0, 0.5, 1],
                        outputRange: [1, 1.08, 1], // Simulates horizontal motion blur
                      }),
                    },
                  ],
                },
              ]}
            >
              {/* Left Side: Incoming Image */}
              <View style={{ width: cardWidth, height: "100%" }}>
                <Image
                  source={FEATURED_IMAGES[(imgIdx.curr + 1) % FEATURED_IMAGES.length]}
                  style={styles.featuredImage}
                  resizeMode="cover"
                />
              </View>
              {/* Right Side: Outgoing Image */}
              <View style={{ width: cardWidth, height: "100%" }}>
                <Image
                  source={FEATURED_IMAGES[(imgIdx.prev + 1) % FEATURED_IMAGES.length]}
                  style={styles.featuredImage}
                  resizeMode="cover"
                />
              </View>
            </Animated.View>
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
            <LoadingScreen />
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
      <FloatingMascotBubble />
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
    fontSize: 38,
    fontFamily: "Zalando-Bold",
    letterSpacing: -0.5,
    color: "#9d174d",
    marginBottom: 4,
  },
  welcomeSubtext: {
    fontSize: 15,
    fontFamily: "Zalando-Medium",
    color: "#1f2937",
    lineHeight: 20,
    textAlign: "left",
  },

  // Hero Section
  heroContainer: {
    marginHorizontal: 16,
    marginBottom: 24,
    borderRadius: 16,
    overflow: "hidden",
    height: 160,
  },
  heroImage: {
    width: "100%",
    height: "100%",
  },

  // Featured Showcase
  featuredHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "baseline",
    marginHorizontal: 16,
    marginBottom: 12,
  },
  seeMoreText: {
    fontSize: 12,
    fontFamily: "Zalando-Medium",
    color: "#9d174d",
  },
  featuredContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginHorizontal: 16,
    marginBottom: 20,
  },
  featuredCard: {
    width: "48%", // Use exact percentage instead of flex to fix Android image blowout
    height: 160,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#e5e7eb",
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
    color: "#9d174d", // Updated to deep pink
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
