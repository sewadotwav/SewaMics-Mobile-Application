import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, ActivityIndicator, Alert } from "react-native";
import * as Clipboard from "expo-clipboard";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, useRoute } from "@react-navigation/native";
import { Feather } from "@expo/vector-icons";
import { doc, getDoc, updateDoc, increment } from "firebase/firestore";
import { db } from "../../config/firebaseConfig";
import { getProductImage } from "../../utils/imageMapper";
import { useNotification } from "../../context/NotificationContext";
import { refundPaymentIntent } from "../../services/stripeService";
import { CTAButton } from "../../components/common/CTAButton";

// Helper functions for safe Firestore timestamp conversion
const getSafeDate = (ts: any): Date => {
  if (!ts) return new Date();
  if (typeof ts.toDate === "function") return ts.toDate();
  if (ts.seconds) return new Date(ts.seconds * 1000);
  return new Date(ts);
};

const getSafeMillis = (ts: any): number => {
  if (!ts) return 0;
  if (typeof ts.toMillis === "function") return ts.toMillis();
  if (ts.seconds) return ts.seconds * 1000;
  return new Date(ts).getTime();
};

export const OrderDetailScreen = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { orderId } = route.params;

  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);
  const { showToast, showAlert } = useNotification();

  const handleCopyOrderNumber = async () => {
    if (!order) return;
    const textToCopy = order.orderID || order.id;
    await Clipboard.setStringAsync(textToCopy);
    showToast("Copied to clipboard!");
  };

  useEffect(() => {
    fetchOrderDetail();
  }, [orderId]);

  const fetchOrderDetail = async () => {
    try {
      const docRef = doc(db, "orders", orderId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setOrder({ id: docSnap.id, ...docSnap.data() });
      } else {
        // Fallback or error
      }
    } catch (error) {
      console.error("Error fetching order detail", error);
    } finally {
      setLoading(false);
    }
  };

  const confirmCancelOrder = () => {
    if (!order) return;

    // Check 3 days constraint dynamically
    const orderTime = getSafeMillis(order.createdAt);
    const threeDaysInMs = 3 * 24 * 60 * 60 * 1000;
    const isPastThreeDays = (Date.now() - orderTime) > threeDaysInMs;

    if (isPastThreeDays) {
      showAlert({
        title: "Cannot Cancel Order",
        message: "Orders can only be cancelled within 3 days of purchase. Please contact our support team for assistance.",
        confirmText: "OK",
        onConfirm: () => {},
      });
      return;
    }

    showAlert({
      title: "Cancel Order",
      message: "Are you sure you want to cancel this order? This action will refund your payment.",
      confirmText: "Yes, Cancel",
      cancelText: "No, Keep Order",
      isDestructive: true,
      onConfirm: handleCancelOrder,
    });
  };

  const handleCancelOrder = async () => {
    if (!order) return;
    setCancelling(true);
    try {
      // 1. Refund Stripe Payment
      if (order.stripePaymentIntentId) {
        try {
          await refundPaymentIntent(order.stripePaymentIntentId);
        } catch (stripeError: any) {
          // If the charge was already refunded in Stripe, proceed gracefully to fix database sync issues
          if (stripeError.message && stripeError.message.includes("already been refunded")) {
            console.log("Stripe payment was already refunded. Continuing database sync.");
          } else {
            throw stripeError;
          }
        }
      }

      // 2. Update Firestore Order Status
      const docRef = doc(db, "orders", order.id);
      await updateDoc(docRef, {
        status: "cancelled",
        paymentStatus: "refunded",
        cancelledAt: new Date(),
      });

      // 3. Restore Stock for each item
      if (order.items && Array.isArray(order.items)) {
        await Promise.all(
          order.items.map((item: any) => {
            const pId = item.productID || item.productId;
            if (!pId) return Promise.resolve();
            return updateDoc(doc(db, "products", pId), {
              stock: increment(item.quantity || 1),
            }).catch(e => console.warn(`Stock update failed for ${pId}:`, e));
          })
        );
      }

      // Refresh order details to show Cancelled badge
      await fetchOrderDetail();
      
      // Notify successful cancellation with a premium dialog
      showAlert({
        title: "Order Cancelled Successfully",
        message: "Your order has been successfully cancelled and a full refund has been initiated to your payment card.",
        confirmText: "OK",
        onConfirm: () => {},
      });
    } catch (error: any) {
      console.error("Cancellation error:", error);
      showAlert({
        title: "Cancellation Failed",
        message: error.message || "Could not cancel the order. Please try again or contact support.",
        confirmText: "OK",
        onConfirm: () => {},
      });
    } finally {
      setCancelling(false);
    }
  };

  const renderStatusBadge = (status: string) => {
    let bgColor = "#fef3c7";
    let textColor = "#92400e";

    if (status === "shipped") {
      bgColor = "#bfdbfe";
      textColor = "#1e40af";
    } else if (status === "delivered") {
      bgColor = "#dcfce7";
      textColor = "#166534";
    } else if (status === "cancelled") {
      bgColor = "#fecaca";
      textColor = "#991b1b";
    }

    return (
      <View style={[styles.statusBadge, { backgroundColor: bgColor }]}>
        <Text style={[styles.statusText, { color: textColor }]}>{status.toUpperCase()}</Text>
      </View>
    );
  };

  if (loading || !order) {
    return (
      <SafeAreaView style={styles.centerContainer} edges={["top"]}>
        <ActivityIndicator size="large" color="#9d174d" />
      </SafeAreaView>
    );
  }

  const orderDate = order.createdAt ? getSafeDate(order.createdAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }) : "Unknown date";
  const last4 = "6522"; // Mock from prototype or fetch if saved

  // Can cancel if order is in a cancellable status (not shipped or delivered)
  const isCancellable = order &&
    order.status !== "cancelled" &&
    order.status !== "shipped" &&
    order.status !== "delivered";

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn} activeOpacity={0.7}>
          <Feather name="chevron-left" size={28} color="#9d174d" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Order Details</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        
        {/* Order Number & Date */}
        <View style={styles.card}>
          <View style={styles.cardRow}>
            <View>
              <Text style={styles.label}>Order Number</Text>
              <Text style={styles.valueHighlight}>{order.orderID || order.id}</Text>
            </View>
            <TouchableOpacity onPress={handleCopyOrderNumber} activeOpacity={0.7}>
              <Feather name="copy" size={18} color="#9d174d" />
            </TouchableOpacity>
          </View>
          <View style={styles.divider} />
          <View style={styles.cardRow}>
            <View>
              <Text style={styles.label}>Order Date</Text>
              <Text style={styles.value}>{orderDate}</Text>
            </View>
          </View>
        </View>

        {/* Items List */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Items</Text>
          {order.items?.map((item: any, idx: number) => {
            let resolvedImageKey = item.imageKey || item.productID || item.productId;
            if (!resolvedImageKey || resolvedImageKey.startsWith("product-")) {
              const lowerName = (item.name || "").toLowerCase();
              if (lowerName.includes("pumpkin")) resolvedImageKey = "pumpkin";
              else if (lowerName.includes("parrot")) resolvedImageKey = "parrot";
              else if (lowerName.includes("strawberry")) resolvedImageKey = "strawberry";
              else if (lowerName.includes("fish")) resolvedImageKey = "fish";
            }
            
            return (
              <View key={idx} style={styles.itemRow}>
                <Image source={getProductImage(resolvedImageKey)} style={styles.itemImage} />
                <View style={styles.itemDetails}>
                  <Text style={styles.itemName} numberOfLines={1}>{item.name || "Unknown Product"}</Text>
                  <Text style={styles.itemSubText}>Qty: {item.quantity}</Text>
                  {item.size && <Text style={styles.itemSubText}>Size: {item.size}</Text>}
                </View>
                <Text style={styles.itemPrice}>₱{item.price?.toFixed(2)}</Text>
              </View>
            );
          })}
        </View>

        {/* Order Summary */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Order Summary</Text>
          <View style={styles.summaryCard}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Subtotal</Text>
              <Text style={styles.summaryValue}>₱{order.subtotal?.toFixed(2)}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Delivery fee</Text>
              <Text style={styles.summaryValue}>₱{order.shippingFee?.toFixed(2)}</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.summaryRow}>
              <Text style={styles.summaryTotalLabel}>Total</Text>
              <Text style={styles.summaryTotalValue}>₱{order.totalAmount?.toFixed(2)}</Text>
            </View>
          </View>
        </View>

        {/* Shipping Address */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Shipping Address</Text>
          <View style={styles.infoCardSolid}>
            <Feather name="map-pin" size={20} color="#ffffff" style={styles.infoIcon} />
            <View style={styles.infoContent}>
              <Text style={styles.addressTextSolid}>
                {order.shippingAddress?.Street}{"\n"}
                {order.shippingAddress?.City}, {order.shippingAddress?.Province} {order.shippingAddress?.PostalCode}
              </Text>
            </View>
          </View>
        </View>

        {/* Payment Method */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Payment Method</Text>
          <View style={styles.infoCardSolid}>
            <Feather name="credit-card" size={20} color="#ffffff" style={styles.infoIcon} />
            <View style={styles.infoContent}>
              <View style={styles.paymentRow}>
                <View>
                  <Text style={styles.paymentMethodSolid}>Credit Card</Text>
                  <Text style={styles.paymentDetailsSolid}>•••• •••• •••• {last4}</Text>
                </View>
                <Text style={styles.paymentStatusSolid}>
                  {order.paymentStatus === "refunded" ? "Refunded" : "Completed"}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {isCancellable && (
          <View style={{ marginHorizontal: 16, marginBottom: 40 }}>
            <CTAButton
              title="Cancel Order"
              onPress={confirmCancelOrder}
              disabled={cancelling}
              loading={cancelling}
              style={{ backgroundColor: "#ffffff", borderWidth: 2, borderColor: "#9d174d" }}
              textStyle={{ color: "#9d174d" }}
            />
          </View>
        )}

      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#ffffff" },
  centerContainer: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#ffffff" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    height: 56,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  backBtn: { width: 40 },
  headerTitle: { fontSize: 18, fontFamily: "Zalando-Bold", color: "#9d174d", flex: 1, textAlign: "center" },
  headerRight: { width: 40 },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 },
  statusText: { fontSize: 10, fontFamily: "Zalando-Bold", letterSpacing: 0.5 },
  scrollContainer: { flex: 1 },
  card: {
    backgroundColor: "#ffffff",
    margin: 16,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  cardRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  label: { fontSize: 12, fontFamily: "Zalando-Medium", color: "#6b7280", marginBottom: 4 },
  value: { fontSize: 14, fontFamily: "Zalando-SemiBold", color: "#1f2937" },
  valueHighlight: { fontSize: 14, fontFamily: "Zalando-Bold", color: "#9d174d" },
  divider: { height: 1, backgroundColor: "#e5e7eb", marginVertical: 12 },
  sectionContainer: { marginBottom: 24 },
  sectionTitle: { fontSize: 14, fontFamily: "Zalando-Bold", color: "#9d174d", paddingHorizontal: 16, marginBottom: 12 },
  itemRow: { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, marginBottom: 16 },
  itemImage: { width: 64, height: 64, borderRadius: 12, marginRight: 12, backgroundColor: "#f3f4f6" },
  itemDetails: { flex: 1 },
  itemName: { fontSize: 13, fontFamily: "Zalando-Bold", color: "#1f2937", marginBottom: 2 },
  itemSubText: { fontSize: 12, fontFamily: "Zalando-Medium", color: "#6b7280" },
  itemPrice: { fontSize: 14, fontFamily: "Zalando-Bold", color: "#9d174d" },
  summaryCard: { marginHorizontal: 16 },
  summaryRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 8 },
  summaryLabel: { fontSize: 13, fontFamily: "Zalando-Medium", color: "#6b7280" },
  summaryValue: { fontSize: 13, fontFamily: "Zalando-SemiBold", color: "#1f2937" },
  summaryTotalLabel: { fontSize: 14, fontFamily: "Zalando-Bold", color: "#9d174d" },
  summaryTotalValue: { fontSize: 18, fontFamily: "Zalando-Bold", color: "#9d174d" },
  infoCardSolid: { 
    backgroundColor: "#9d174d", 
    marginHorizontal: 16, 
    borderRadius: 12, 
    padding: 16,
    flexDirection: "row",
    alignItems: "center"
  },
  infoIcon: { marginRight: 12 },
  infoContent: { flex: 1 },
  addressTextSolid: { fontSize: 13, fontFamily: "Zalando-Medium", color: "#ffffff", lineHeight: 20 },
  paymentRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  paymentMethodSolid: { fontSize: 13, fontFamily: "Zalando-Bold", color: "#ffffff", marginBottom: 2 },
  paymentDetailsSolid: { fontSize: 12, fontFamily: "Zalando-Medium", color: "rgba(255, 255, 255, 0.8)" },
  paymentStatusSolid: { fontSize: 12, fontFamily: "Zalando-Bold", color: "rgba(255, 255, 255, 0.9)" },
});
