import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, ActivityIndicator } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { Feather } from "@expo/vector-icons";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../config/firebaseConfig";
import { getProductImage } from "../../utils/imageMapper";

export const OrderDetailScreen = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { orderId } = route.params;

  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

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
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#9d174d" />
      </View>
    );
  }

  const orderDate = order.createdAt ? order.createdAt.toDate().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }) : "Unknown date";
  const last4 = "6522"; // Mock from prototype or fetch if saved

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn} activeOpacity={0.7}>
          <Feather name="chevron-left" size={28} color="#9d174d" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Order Details</Text>
        <View style={styles.headerRight}>
          {renderStatusBadge(order.status || "pending")}
        </View>
      </View>

      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        
        {/* Order Number & Date */}
        <View style={styles.card}>
          <View style={styles.cardRow}>
            <View>
              <Text style={styles.label}>Order Number</Text>
              <Text style={styles.valueHighlight}>{order.orderID || order.id}</Text>
            </View>
            <TouchableOpacity>
              <Feather name="copy" size={18} color="#9ca3af" />
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
          {order.items?.map((item: any, idx: number) => (
            <View key={idx} style={styles.itemRow}>
              <Image source={getProductImage(item.productID)} style={styles.itemImage} />
              <View style={styles.itemDetails}>
                <Text style={styles.itemName} numberOfLines={1}>{item.name}</Text>
                <Text style={styles.itemSubText}>Qty: {item.quantity}</Text>
                {item.size && <Text style={styles.itemSubText}>Size: {item.size}</Text>}
              </View>
              <Text style={styles.itemPrice}>₱{item.price?.toFixed(2)}</Text>
            </View>
          ))}
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
              <Text style={styles.summaryValueGreen}>₱{order.shippingFee?.toFixed(2)}</Text>
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
          <View style={styles.infoCard}>
            <Text style={styles.addressText}>
              {order.shippingAddress?.Street}{"\n"}
              {order.shippingAddress?.City}, {order.shippingAddress?.Province} {order.shippingAddress?.PostalCode}
            </Text>
          </View>
        </View>

        {/* Payment Method */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Payment Method</Text>
          <View style={styles.infoCard}>
            <View style={styles.paymentRow}>
              <View>
                <Text style={styles.paymentMethod}>Credit Card</Text>
                <Text style={styles.paymentDetails}>•••• •••• •••• {last4}</Text>
              </View>
              <Text style={styles.paymentStatus}>Completed</Text>
            </View>
          </View>
        </View>

      </ScrollView>
    </View>
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
  headerTitle: { fontSize: 18, fontFamily: "Zalando-Bold", color: "#1f2937" },
  headerRight: { width: 80, alignItems: "flex-end" },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 },
  statusText: { fontSize: 10, fontFamily: "Zalando-Bold", letterSpacing: 0.5 },
  scrollContainer: { flex: 1 },
  card: {
    backgroundColor: "#f9fafb",
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
  sectionTitle: { fontSize: 14, fontFamily: "Zalando-Bold", color: "#1f2937", paddingHorizontal: 16, marginBottom: 12 },
  itemRow: { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, marginBottom: 16 },
  itemImage: { width: 64, height: 64, borderRadius: 12, marginRight: 12, backgroundColor: "#f3f4f6" },
  itemDetails: { flex: 1 },
  itemName: { fontSize: 13, fontFamily: "Zalando-Bold", color: "#1f2937", marginBottom: 2 },
  itemSubText: { fontSize: 12, fontFamily: "Zalando-Medium", color: "#6b7280" },
  itemPrice: { fontSize: 14, fontFamily: "Zalando-Bold", color: "#9d174d" },
  summaryCard: { marginHorizontal: 16 },
  summaryRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 8 },
  summaryLabel: { fontSize: 13, fontFamily: "Zalando-Medium", color: "#6b7280" },
  summaryValue: { fontSize: 13, fontFamily: "Zalando-SemiBold", color: "#6b7280" },
  summaryValueGreen: { fontSize: 13, fontFamily: "Zalando-SemiBold", color: "#10b981" },
  summaryTotalLabel: { fontSize: 14, fontFamily: "Zalando-Bold", color: "#1f2937" },
  summaryTotalValue: { fontSize: 18, fontFamily: "Zalando-Bold", color: "#9d174d" },
  infoCard: { backgroundColor: "#f9fafb", marginHorizontal: 16, borderRadius: 12, padding: 16 },
  addressText: { fontSize: 13, fontFamily: "Zalando-Medium", color: "#1f2937", lineHeight: 20 },
  paymentRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  paymentMethod: { fontSize: 13, fontFamily: "Zalando-Bold", color: "#1f2937", marginBottom: 2 },
  paymentDetails: { fontSize: 12, fontFamily: "Zalando-Medium", color: "#6b7280" },
  paymentStatus: { fontSize: 12, fontFamily: "Zalando-Bold", color: "#10b981" },
});
