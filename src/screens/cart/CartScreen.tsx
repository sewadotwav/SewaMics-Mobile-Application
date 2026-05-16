// ============================================================
// SewaMics — Cart Screen
// File: src/screens/cart/CartScreen.tsx
// ============================================================

import React, { useState, useCallback } from "react";
import { useFocusEffect } from "@react-navigation/native";
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { useAuth } from "../../context/AuthContext";
import {
  getCart,
  removeFromCart,
  updateCartItemQuantity,
} from "../../services/cartService";
import { getProductImage } from "../../utils/imageMapper";
import { getErrorMessage } from "../../utils/errorHandler";
import { CTAButton } from "../../components/common/CTAButton";
import { LoadingScreen } from "../../components/common/LoadingScreen";
import { useNotification } from "../../context/NotificationContext";
import { CartItem } from "../../config/firestoreSchema";

const DELIVERY_FEE = 50;

interface CartScreenProps {
  navigation: any;
}

export const CartScreen = ({ navigation }: CartScreenProps) => {
  const { user } = useAuth();
  const { showAlert, showToast } = useNotification();

  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null); // productId being acted on

  // ── Fetch cart ────────────────────────────────────────────────
  const fetchCart = useCallback(async () => {
    if (!user?.uid) return;
    try {
      const cart = await getCart(user.uid);
      setCartItems(cart?.items ?? []);
    } catch (err) {
      console.error("[CartScreen] Failed to fetch cart:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user?.uid]);

  // Re-fetch every time the tab is focused (so add-to-cart reflects immediately)
  useFocusEffect(
    useCallback(() => {
      fetchCart();
    }, [fetchCart])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchCart();
  };

  // ── Handlers ──────────────────────────────────────────────────
  const handleRemove = async (productId: string) => {
    showAlert({
      title: "Remove Item",
      message: "Are you sure you want to remove this item from your cart?",
      confirmText: "Remove",
      cancelText: "Cancel",
      isDestructive: true,
      onConfirm: async () => {
        setActionLoading(productId);
        try {
          await removeFromCart(user!.uid, productId);
          setCartItems((prev) =>
            prev.filter((item) => item.productId !== productId)
          );
          showToast("Item removed from cart");
        } catch (err) {
          Alert.alert("Error", getErrorMessage(err));
        } finally {
          setActionLoading(null);
        }
      },
    });
  };

  const handleUpdateQty = async (productId: string, newQty: number) => {
    if (newQty < 1) {
      handleRemove(productId);
      return;
    }
    setActionLoading(productId);
    try {
      await updateCartItemQuantity(user!.uid, productId, newQty);
      setCartItems((prev) =>
        prev.map((item) =>
          item.productId === productId
            ? {
                ...item,
                quantity: newQty,
                subtotal: parseFloat((item.price * newQty).toFixed(2)),
              }
            : item
        )
      );
    } catch (err) {
      Alert.alert("Error", getErrorMessage(err));
    } finally {
      setActionLoading(null);
    }
  };

  const handleMakePayment = () => {
    navigation.navigate("CheckoutStack", {
      screen: "Checkout",
      params: { step: "shipping" },
    });
  };

  // ── Derived values ────────────────────────────────────────────
  const subtotal = cartItems.reduce((sum, item) => sum + item.subtotal, 0);
  const totalAmount = subtotal + (cartItems.length > 0 ? DELIVERY_FEE : 0);

  // ── Render ────────────────────────────────────────────────────
  if (loading) return <LoadingScreen message="Loading your cart..." />;

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      {/* ── HEADER ── */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Cart</Text>
        {cartItems.length > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{cartItems.length}</Text>
          </View>
        )}
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          { flexGrow: 1 },
          styles.scrollContent,
          cartItems.length > 0 && { paddingBottom: 250 }, // Extra space for sticky footer
        ]}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#9d174d"
          />
        }
      >
        {/* ── CART ITEMS CONTAINER ── */}
        <View style={styles.cartContainer}>
          {cartItems.length === 0 ? (
            /* ── EMPTY STATE ── */
            <View style={styles.emptyState}>
              <Feather name="shopping-cart" size={52} color="#e5e7eb" />
              <Text style={styles.emptyTitle}>Your cart is empty</Text>
              <Text style={styles.emptySubtext}>
               Browse our products now to get started with the coolness!
              </Text>
              <TouchableOpacity
                style={styles.browseButton}
                onPress={() => navigation.navigate("CatalogTab")}
                activeOpacity={0.85}
              >
                <Feather
                  name="grid"
                  size={16}
                  color="#ffffff"
                  style={{ marginRight: 8 }}
                />
                <Text style={styles.browseButtonText}>Browse Catalog</Text>
              </TouchableOpacity>
            </View>
          ) : (
            /* ── ITEMS LIST ── */
            cartItems.map((item, index) => {
              const isLast = index === cartItems.length - 1;
              const isActing = actionLoading === item.productId;

              return (
                <View
                  key={item.productId}
                  style={[styles.cartItem, !isLast && styles.cartItemBorder]}
                >
                  {/* Circular thumbnail */}
                  <View style={styles.thumbnailWrapper}>
                    <Image
                      source={getProductImage(
                        item.productId.split("-")[0] // derive imageKey from productId
                      )}
                      style={styles.thumbnail}
                      resizeMode="cover"
                    />
                  </View>

                  {/* Item info */}
                  <View style={styles.itemInfo}>
                    <Text style={styles.itemName} numberOfLines={2}>
                      {item.name}
                    </Text>
                    {item.selectedSize && (
                      <View style={styles.sizeCapsule}>
                        <Text style={styles.sizeText}>{item.selectedSize}</Text>
                      </View>
                    )}
                    {/* Quantity stepper */}
                    <View style={styles.qtyRow}>
                      <TouchableOpacity
                        style={[styles.qtyBtn, isActing && styles.qtyBtnDisabled]}
                        onPress={() =>
                          handleUpdateQty(item.productId, item.quantity - 1)
                        }
                        disabled={isActing}
                        activeOpacity={0.7}
                      >
                        <Feather name="minus" size={12} color="#6b7280" />
                      </TouchableOpacity>
                      <Text style={styles.qtyText}>{item.quantity}</Text>
                      <TouchableOpacity
                        style={[
                          styles.qtyBtn,
                          styles.qtyPlus,
                          isActing && styles.qtyBtnDisabled,
                        ]}
                        onPress={() =>
                          handleUpdateQty(item.productId, item.quantity + 1)
                        }
                        disabled={isActing}
                        activeOpacity={0.7}
                      >
                        <Feather name="plus" size={12} color="#ffffff" />
                      </TouchableOpacity>
                    </View>
                  </View>

                  {/* Price + remove */}
                  <View style={styles.itemRight}>
                    <View style={styles.priceCapsule}>
                      <Text style={styles.priceText}>
                        ₱{item.subtotal.toFixed(2)}
                      </Text>
                    </View>
                    <TouchableOpacity
                      style={styles.removeBtn}
                      onPress={() => handleRemove(item.productId)}
                      activeOpacity={0.7}
                    >
                      <Feather name="trash-2" size={14} color="#9ca3af" />
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })
          )}
        </View>
      </ScrollView>

      {/* ── STICKY FOOTER (SUMMARY + PAYMENT) ── */}
      {cartItems.length > 0 && (
        <View style={styles.stickyFooter}>
          {/* ── ORDER SUMMARY CARD ── */}
          <View style={styles.summaryCard}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Subtotal</Text>
              <Text style={styles.summaryValue}>₱{subtotal.toFixed(2)}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Delivery Fee</Text>
              <Text style={styles.summaryValue}>₱{DELIVERY_FEE.toFixed(2)}</Text>
            </View>

            <View style={styles.summaryDivider} />

            <View style={styles.summaryRow}>
              <Text style={styles.totalLabel}>Total Amount</Text>
              <Text style={styles.totalValue}>₱{totalAmount.toFixed(2)}</Text>
            </View>
          </View>

          {/* ── MAKE PAYMENT BUTTON ── */}
          <View style={styles.stickyBar}>
            <CTAButton
              title="Make Payment"
              onPress={handleMakePayment}
              style={styles.paymentButton}
            />
          </View>
        </View>
      )}
    </SafeAreaView>
  );
};

// ── Styles ────────────────────────────────────────────────────
const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#ffffff" },

  // Header — white, no gray
  header: {
    height: 56,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    backgroundColor: "#ffffff",
    gap: 10,
  },
  headerTitle: {
    fontSize: 28,
    fontFamily: "Zalando-Bold",
    color: "#9d174d",
    flex: 1,
  },
  badge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#9d174d",
    justifyContent: "center",
    alignItems: "center",
  },
  badgeText: {
    fontSize: 13,
    fontFamily: "Zalando-Bold",
    color: "#ffffff",
  },

  // Scroll
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },

  // Cart Items Container 
  cartContainer: {
    flex: 1,
    backgroundColor: "#ffffff",
    borderRadius: 28,
    overflow: "hidden",
    paddingTop: 8,
    paddingBottom: 4,
  },

  // Empty state
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
    paddingBottom: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontFamily: "Zalando-SemiBold",
    color: "#1f2937",
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    fontFamily: "Zalando-Regular",
    color: "#6b7280",
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 24,
  },
  browseButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: 44,
    borderRadius: 20,
    paddingHorizontal: 24,
    backgroundColor: "#9d174d",
  },
  browseButtonText: {
    fontSize: 14,
    fontFamily: "Zalando-SemiBold",
    color: "#ffffff",
  },

  // Cart Item Row
  cartItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 18,
    gap: 16,
  },
  cartItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },

  // Circular thumbnail
  thumbnailWrapper: {
    width: 64,
    height: 64,
    borderRadius: 32,
    overflow: "hidden",
    backgroundColor: "#f9fafb",
  },
  thumbnail: { width: "100%", height: "100%" },

  // Item info
  itemInfo: { flex: 1 },
  itemName: {
    fontSize: 14,
    fontFamily: "Zalando-SemiBold",
    color: "#1f2937",
    marginBottom: 6,
    lineHeight: 18,
  },
  sizeCapsule: {
    backgroundColor: "#f3f4f6",
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    alignSelf: "flex-start",
    marginBottom: 10,
  },
  sizeText: {
    fontSize: 11,
    fontFamily: "Zalando-Medium",
    color: "#9d174d",
  },

  // Quantity stepper
  qtyRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  qtyBtn: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: "#f3f4f6",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  qtyPlus: {
    backgroundColor: "#9d174d",
    borderColor: "#9d174d",
  },
  qtyBtnDisabled: { opacity: 0.4 },
  qtyText: {
    fontSize: 14,
    fontFamily: "Zalando-SemiBold",
    color: "#1f2937",
    minWidth: 20,
    textAlign: "center",
  },

  // Item right (price + remove)
  itemRight: {
    alignItems: "flex-end",
    gap: 8,
  },
  priceCapsule: {
    // No background, flat text
  },
  priceText: {
    fontSize: 16,
    fontFamily: "Zalando-Bold",
    color: "#9d174d",
  },
  removeBtn: {
    padding: 4,
  },

  // Summary card — purple themed, flat floating, opaque
  summaryCard: {
    marginHorizontal: 16,
    marginBottom: 16,
    backgroundColor: "rgba(157, 23, 77, 0.9)",
    borderRadius: 24,
    paddingTop: 20,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  summaryLabel: {
    fontSize: 14,
    fontFamily: "Zalando-Regular",
    color: "#f3f4f6",
    opacity: 0.9,
  },
  summaryValue: {
    fontSize: 14,
    fontFamily: "Zalando-SemiBold",
    color: "#ffffff",
  },
  summaryDivider: {
    height: 1,
    backgroundColor: "#ffffff",
    opacity: 0.2,
    marginVertical: 12,
  },
  totalLabel: {
    fontSize: 16,
    fontFamily: "Zalando-Bold",
    color: "#ffffff",
  },
  totalValue: {
    fontSize: 22,
    fontFamily: "Zalando-Bold",
    color: "#ffffff",
  },
  stickyFooter: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "transparent",
  },
  stickyBar: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: "#ffffff",
  },
  paymentButton: {
    // CTAButton handles all internal styling
  },
});
