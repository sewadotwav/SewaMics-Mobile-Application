// ============================================================
// SewaMics — Product Detail Screen
// File: src/screens/product/ProductDetailScreen.tsx
// ============================================================

import React, { useState, useEffect } from "react";
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import { Feather } from "@expo/vector-icons";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../../context/AuthContext";
import { useWishlist } from "../../context/WishlistContext";
import { getProductById, getProducts, Product } from "../../services/productService";
import { addToCart } from "../../services/cartService";
import { getProductImage } from "../../utils/imageMapper";
import { getErrorMessage } from "../../utils/errorHandler";
import { CTAButton } from "../../components/common/CTAButton";
import { LoadingScreen } from "../../components/common/LoadingScreen";
import { useNotification } from "../../context/NotificationContext";
import { ProductDocument } from "../../config/firestoreSchema";

const DEFAULT_SIZES = ["Small", "Medium", "Large"];

export const ProductDetailScreen = () => {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const { user } = useAuth();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { showToast } = useNotification();

  const { productId } = route.params;

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSize, setSelectedSize] = useState<string>("Medium");
  const [quantity, setQuantity] = useState(1);
  const [cartLoading, setCartLoading] = useState(false);
  const [isSpecsExpanded, setIsSpecsExpanded] = useState(false);
  const [otherProducts, setOtherProducts] = useState<Product[]>([]);

  const SPEC_LABELS: Record<string, string> = {
    brand: "Brand",
    capacity: "Capacity",
    finishType: "Finish Type",
    material: "Material",
    size: "Size",
    weight: "Weight",
  };

  // ── Fetch product ─────────────────────────────────────────────
  useEffect(() => {
    if (!productId) return;
    setLoading(true);

    const fetchProduct = async () => {
      try {
        const data = await getProductById(productId);
        if (data) {
          setProduct(data);
          const sizes = data.sizes?.length ? data.sizes : DEFAULT_SIZES;
          const mediumIdx = sizes.indexOf("Medium");
          setSelectedSize(mediumIdx >= 0 ? "Medium" : sizes[0]);
        } else {
          setError("Product not found");
        }
      } catch (err) {
        setError(getErrorMessage(err));
        console.error("Error fetching product:", err);
      } finally {
        setLoading(false);
      }
    };

    const fetchOtherProducts = async () => {
      try {
        const products = await getProducts();
        // Filter out current product
        const filtered = products.filter(p => p.id !== productId);
        // Randomize the list (Fisher-Yates shuffle style)
        const randomized = filtered.sort(() => Math.random() - 0.5);
        // Take only 6
        setOtherProducts(randomized.slice(0, 6));
      } catch (err) {
        console.error("Error fetching other products:", err);
      }
    };

    fetchProduct();
    fetchOtherProducts();
  }, [productId]);

  // ── Handlers ──────────────────────────────────────────────────
  const handleIncreaseQuantity = () => {
    if (product && quantity < product.stock) setQuantity(quantity + 1);
  };

  const handleDecreaseQuantity = () => {
    if (quantity > 1) setQuantity(quantity - 1);
  };

  const handleToggleWishlist = () => {
    if (product) toggleWishlist(product);
  };

  const handleAddToCart = async () => {
    if (!user || !product) return;
    if (!selectedSize) {
      Alert.alert("Select a size", "Please choose a size before adding to cart.");
      return;
    }
    setCartLoading(true);
    try {
      await addToCart(user.uid, product.id, quantity, selectedSize);
      showToast(`${product.name} (${selectedSize}) added to cart!`);
    } catch (err) {
      Alert.alert("Error", getErrorMessage(err));
    } finally {
      setCartLoading(false);
    }
  };

  const handleBuyNow = () => {
    // Milestone 3 — Checkout
    Alert.alert("Coming Soon", "Checkout will be available in the next update!");
  };

  // ── Shared Header ─────────────────────────────────────────────
  const Header = () => (
    <View style={styles.header}>
      <TouchableOpacity
        onPress={() => navigation.goBack()}
        activeOpacity={0.7}
        style={styles.backButton}
      >
        <Feather name="arrow-left" size={22} color="#9d174d" />
      </TouchableOpacity>
      <Image
        source={require("../../../assets/Brand/SewaLogo.png")}
        style={styles.logo}
        resizeMode="contain"
      />
      <View style={styles.headerRight} />
    </View>
  );

  // ── Render States ─────────────────────────────────────────────
  if (loading) return <LoadingScreen />;

  if (error || !product) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <Header />
        <View style={styles.errorContainer}>
          <Feather name="alert-circle" size={48} color="#ef4444" />
          <Text style={styles.errorText}>{error || "Product not found"}</Text>
        </View>
      </SafeAreaView>
    );
  }

  const sizes = product.sizes?.length ? product.sizes : DEFAULT_SIZES;
  const features = product.features?.length ? product.features : [];
  const stockText = product.stock > 0 ? `${product.stock} in stock` : "Out of stock";
  const inWishlist = isInWishlist(product.id);

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* ── HEADER ── */}
      <Header />

      {/* ── SCROLLABLE CONTENT ── */}
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ── PRODUCT IMAGE ── */}
        <View style={styles.imageContainer}>
          <Image
            source={getProductImage(product.imageKey)}
            style={styles.productImage}
            resizeMode="cover"
          />
          {/* Heart / Wishlist — synced with WishlistContext */}
          <TouchableOpacity
            style={styles.heartButton}
            onPress={handleToggleWishlist}
            activeOpacity={0.8}
          >
            <Ionicons
              name={inWishlist ? "heart" : "heart-outline"}
              size={22}
              color={inWishlist ? "#9d174d" : "#9ca3af"}
            />
          </TouchableOpacity>
        </View>

        {/* ── PRODUCT INFO ── */}
        <View style={styles.infoSection}>
          {/* Category + Rating Row */}
          <View style={styles.categoryRatingRow}>
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryText}>{product.category}</Text>
            </View>
            <View style={styles.ratingRow}>
              <Feather name="star" size={14} color="#fbbf24" />
              <Text style={styles.ratingValue}>
                {product.rating > 0 ? product.rating.toFixed(1) : "4.7"}
              </Text>
              <Text style={styles.reviewCount}>
                ({product.reviewCount ?? product.reviews} reviews)
              </Text>
            </View>
          </View>

          {/* Product Name */}
          <Text style={styles.productName} numberOfLines={3}>
            {product.name}
          </Text>

          {/* Price + Stock (same row) */}
          <View style={styles.priceRow}>
            <Text style={styles.price}>
              ₱{product.price.toLocaleString("en-PH", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </Text>
            <Text style={styles.stockText}>{stockText}</Text>
          </View>

          {/* Feature Tags */}
          {features.length > 0 && (
            <View style={styles.tagsRow}>
              {features.map((tag, idx) => (
                <View key={idx} style={styles.tag}>
                  <Text style={styles.tagText}>{tag}</Text>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* ── SIZE + QUANTITY (single row card) ── */}
        <View style={styles.sizeQtyRow}>
          {/* Size */}
          <View style={styles.sizeBlock}>
            <Text style={styles.sectionLabel}>SIZE</Text>
            <View style={styles.sizeOptions}>
              {sizes.map((size) => (
                <TouchableOpacity
                  key={size}
                  style={[
                    styles.sizeButton,
                    selectedSize === size && styles.sizeButtonActive,
                  ]}
                  onPress={() => setSelectedSize(size)}
                  activeOpacity={0.75}
                >
                  <Text
                    style={[
                      styles.sizeButtonText,
                      selectedSize === size && styles.sizeButtonTextActive,
                    ]}
                  >
                    {size}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Quantity */}
          <View style={styles.qtyBlock}>
            <Text style={styles.sectionLabel}>QUANTITY</Text>
            <View style={styles.qtyControls}>
              <TouchableOpacity
                style={[
                  styles.qtyButton,
                  styles.qtyMinus,
                  quantity <= 1 && styles.qtyButtonDisabled,
                ]}
                onPress={handleDecreaseQuantity}
                disabled={quantity <= 1}
                activeOpacity={0.7}
              >
                <Feather
                  name="minus"
                  size={16}
                  color={quantity <= 1 ? "#d1d5db" : "#6b7280"}
                />
              </TouchableOpacity>
              <Text style={styles.qtyValue}>{quantity}</Text>
              <TouchableOpacity
                style={[
                  styles.qtyButton,
                  styles.qtyPlus,
                  quantity >= product.stock && styles.qtyButtonDisabled,
                ]}
                onPress={handleIncreaseQuantity}
                disabled={quantity >= product.stock}
                activeOpacity={0.7}
              >
                <Feather name="plus" size={16} color="#ffffff" />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* ── PRODUCT DESCRIPTION (plain, no card) ── */}
        {product.description ? (
          <View style={styles.descriptionSection}>
            <Text style={styles.descriptionTitle}>Description</Text>
            <Text style={styles.descriptionText}>{product.description}</Text>
          </View>
        ) : null}

        {/* ── PRODUCT SPECIFICATIONS (collapsible) ── */}
        {product.specifications && Object.keys(product.specifications).length > 0 && (
          <View style={styles.specSection}>
            <Text style={styles.specTitle}>Specification</Text>
            
            <View style={styles.specList}>
              {Object.entries(product.specifications as Record<string, string>)
                .slice(0, isSpecsExpanded ? undefined : 3)
                .map(([key, value], index) => (
                  <View key={key} style={[styles.specRow, index === 0 && { borderTopWidth: 0 }]}>
                    <Text style={styles.specLabel}>{SPEC_LABELS[key] || key}</Text>
                    <Text style={styles.specValue}>{String(value)}</Text>
                  </View>
                ))}
            </View>

            {Object.keys(product.specifications).length > 3 && (
              <TouchableOpacity 
                onPress={() => setIsSpecsExpanded(!isSpecsExpanded)}
                style={styles.seeMoreButton}
                activeOpacity={0.7}
              >
                <Text style={styles.seeMoreText}>
                  {isSpecsExpanded ? "See Less" : "See More"}
                </Text>
                <Feather 
                  name={isSpecsExpanded ? "chevron-up" : "chevron-down"} 
                  size={16} 
                  color="#9d174d" 
                />
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* ── BROWSE MORE ITEMS (horizontal scroll) ── */}
        {otherProducts.length > 0 && (
          <View style={styles.moreItemsSection}>
            <TouchableOpacity 
              style={styles.moreItemsHeader}
              onPress={() => navigation.navigate("CatalogTab")}
              activeOpacity={0.7}
            >
              <Text style={styles.moreItemsTitle}>Browse more items</Text>
              <Feather name="chevron-right" size={18} color="#9d174d" />
            </TouchableOpacity>

            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.horizontalScroll}
            >
              {otherProducts.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  style={styles.smallCard}
                  onPress={() => navigation.push("ProductDetail", { productId: item.id })}
                  activeOpacity={0.9}
                >
                  <View style={styles.smallCardImageContainer}>
                    <Image 
                      source={getProductImage(item.imageKey)} 
                      style={styles.smallCardImage} 
                      resizeMode="cover"
                    />
                    <TouchableOpacity
                      style={styles.smallCardWishlist}
                      onPress={() => toggleWishlist(item as any)}
                    >
                      <Ionicons 
                        name={isInWishlist(item.id) ? "heart" : "heart-outline"} 
                        size={14} 
                        color={isInWishlist(item.id) ? "#9d174d" : "#6b7280"} 
                      />
                    </TouchableOpacity>
                  </View>
                  <View style={styles.smallCardInfo}>
                    <Text numberOfLines={1} style={styles.smallCardName}>{item.name}</Text>
                    <Text style={styles.smallCardPrice}>₱{item.price.toLocaleString()}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}
      </ScrollView>

      {/* ── STICKY BOTTOM ACTION BAR ── */}
      <View style={styles.stickyBar}>
        <TouchableOpacity
          style={[
            styles.cartButton,
            (cartLoading || product.stock === 0) && styles.buttonDisabled,
          ]}
          onPress={handleAddToCart}
          disabled={cartLoading || product.stock === 0}
          activeOpacity={0.85}
        >
          {cartLoading ? (
            <Feather name="loader" size={18} color="#9d174d" />
          ) : (
            <>
              <Feather name="shopping-cart" size={16} color="#9d174d" style={{ marginRight: 6 }} />
              <Text style={styles.cartButtonText}>Add to Cart</Text>
            </>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.buyButton}
          onPress={handleBuyNow}
          activeOpacity={0.85}
        >
          <Text style={styles.buyButtonText}>Buy Now</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

// ── Styles ────────────────────────────────────────────────────
const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#ffffff" },

  // Header — matches ProfileScreen / EditProfileScreen standard
  header: {
    height: 56,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
    backgroundColor: "#ffffff",
  },
  backButton: { width: 40, alignItems: "flex-start" },
  logo: { width: 64, height: 48 },
  headerRight: { width: 40 },

  // Scroll
  scrollContent: { paddingBottom: 75 }, // Extra padding to accommodate floating buttons

  // Product Image
  imageContainer: {
    width: "100%",
    height: 320,
    backgroundColor: "#f3f4f6",
  },
  productImage: { width: "100%", height: "100%" },
  heartButton: {
    position: "absolute",
    bottom: 16,
    right: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#ffffff",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },

  // Product Info
  infoSection: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
    backgroundColor: "#ffffff",
  },
  categoryRatingRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  categoryBadge: {
    backgroundColor: "#f3f4f6",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  categoryText: {
    fontSize: 12,
    fontFamily: "Zalando-Medium",
    color: "#6b7280",
  },
  ratingRow: { flexDirection: "row", alignItems: "center" },
  ratingValue: {
    fontSize: 12,
    fontFamily: "Zalando-SemiBold",
    color: "#1f2937",
    marginLeft: 4,
  },
  reviewCount: {
    fontSize: 12,
    fontFamily: "Zalando-Regular",
    color: "#6b7280",
    marginLeft: 2,
  },
  productName: {
    fontSize: 20,
    fontFamily: "Zalando-SemiBold",
    color: "#1f2937",
    lineHeight: 28,
    marginBottom: 10,
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 10,
    marginBottom: 12,
  },
  price: {
    fontSize: 24,
    fontFamily: "Zalando-Bold",
    color: "#ea580c",
  },
  stockText: {
    fontSize: 12,
    fontFamily: "Zalando-Regular",
    color: "#9ca3af", // gray as in UI prototype
  },
  tagsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 4,
  },
  tag: {
    backgroundColor: "#fff3cd",
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    margin: 4,
  },
  tagText: {
    fontSize: 11,
    fontFamily: "Zalando-Medium",
    color: "#d97706",
  },

  // Size + Quantity — single horizontal row
  sizeQtyRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginTop: 8,
    backgroundColor: "#ffffff",
  },
  sizeBlock: {
    flex: 1,
  },
  qtyBlock: {
    alignItems: "flex-end",
  },
  sectionLabel: {
    fontSize: 11,
    fontFamily: "Zalando-SemiBold",
    color: "#6b7280",
    letterSpacing: 0.8,
    marginBottom: 10,
  },
  sizeOptions: {
    flexDirection: "row",
    gap: 8,
  },
  sizeButton: {
    height: 36,
    paddingHorizontal: 16,
    borderRadius: 24, // pill shape, matching category tabs
    borderWidth: 1.5,
    borderColor: "#e5e7eb",
    backgroundColor: "#ffffff",
    justifyContent: "center",
    alignItems: "center",
  },
  sizeButtonActive: {
    backgroundColor: "#9d174d",
    borderColor: "#9d174d",
  },
  sizeButtonText: {
    fontSize: 13,
    fontFamily: "Zalando-SemiBold",
    color: "#6b7280",
  },
  sizeButtonTextActive: {
    color: "#ffffff",
  },
  qtyControls: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  qtyButton: {
    width: 36,
    height: 36,
    borderRadius: 18, // perfect circle
    justifyContent: "center",
    alignItems: "center",
  },
  qtyMinus: {
    backgroundColor: "#f3f4f6",
  },
  qtyPlus: {
    backgroundColor: "#ea580c",
  },
  qtyButtonDisabled: {
    opacity: 0.4,
  },
  qtyValue: {
    fontSize: 16,
    fontFamily: "Zalando-SemiBold",
    color: "#1f2937",
    minWidth: 24,
    textAlign: "center",
  },

  // Product Description — plain, no card
  descriptionSection: {
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 8,
  },
  descriptionTitle: {
    fontSize: 15,
    fontFamily: "Zalando-Bold",
    color: "#9d174d",
    marginBottom: 8,
  },
  descriptionText: {
    fontSize: 14,
    fontFamily: "Zalando-Regular",
    color: "#4b5563",
    lineHeight: 22,
  },

  // Specifications
  specSection: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 24,
    backgroundColor: "#ffffff",
  },
  specTitle: {
    fontSize: 15,
    fontFamily: "Zalando-Bold",
    color: "#9d174d",
    marginBottom: 16,
  },
  specList: {
    backgroundColor: "#ffffff",
  },
  specRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: "#f3f4f6",
  },
  specLabel: {
    fontSize: 14,
    fontFamily: "Zalando-Medium",
    color: "#9d174d",
  },
  specValue: {
    fontSize: 14,
    fontFamily: "Zalando-Regular",
    color: "#000000",
  },
  seeMoreButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 16,
    paddingVertical: 8,
  },
  seeMoreText: {
    fontSize: 14,
    fontFamily: "Zalando-SemiBold",
    color: "#9d174d",
    marginRight: 4,
  },

  // Browse More Items
  moreItemsSection: {
    paddingTop: 8,
    paddingBottom: 40,
    backgroundColor: "#ffffff",
  },
  moreItemsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  moreItemsTitle: {
    fontSize: 15,
    fontFamily: "Zalando-Bold",
    color: "#9d174d",
  },
  horizontalScroll: {
    paddingHorizontal: 16,
    gap: 12,
  },
  smallCard: {
    width: 110, // Shows approx 3.25 cards
    backgroundColor: "#ffffff",
    borderRadius: 12,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#f3f4f6",
  },
  smallCardImageContainer: {
    width: "100%",
    height: 110,
    backgroundColor: "#f9fafb",
  },
  smallCardImage: {
    width: "100%",
    height: "100%",
  },
  smallCardWishlist: {
    position: "absolute",
    top: 6,
    right: 6,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    justifyContent: "center",
    alignItems: "center",
  },
  smallCardInfo: {
    padding: 8,
  },
  smallCardName: {
    fontSize: 11,
    fontFamily: "Zalando-Medium",
    color: "#1f2937",
    marginBottom: 2,
  },
  smallCardPrice: {
    fontSize: 12,
    fontFamily: "Zalando-Bold",
    color: "#ea580c",
  },

  // Sticky Bottom Action Bar
  stickyBar: {
    position: "absolute",
    bottom: 20, // Float slightly above the very bottom
    left: 0,
    right: 0,
    flexDirection: "row",
    paddingHorizontal: 16,
    gap: 12,
  },
  cartButton: {
    flex: 1,
    height: 54, // Slightly taller for better touch target when floating
    borderRadius: 27,
    borderWidth: 2,
    borderColor: "#9d174d",
    backgroundColor: "#ffffff",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    // Floating shadow
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  cartButtonText: {
    fontSize: 15,
    fontFamily: "Zalando-SemiBold",
    color: "#9d174d",
  },
  buyButton: {
    flex: 1,
    height: 54,
    borderRadius: 27,
    backgroundColor: "#9d174d",
    justifyContent: "center",
    alignItems: "center",
    // Floating shadow
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  buyButtonText: {
    fontSize: 15,
    fontFamily: "Zalando-SemiBold",
    color: "#ffffff",
  },
  buttonDisabled: {
    opacity: 0.5,
  },

  // Error State
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
  },
  errorText: {
    fontSize: 16,
    fontFamily: "Zalando-Medium",
    color: "#ef4444",
    textAlign: "center",
  },
});
