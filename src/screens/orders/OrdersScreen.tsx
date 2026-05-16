// ============================================================
// SewaMics — Orders Screen
// File: src/screens/orders/OrdersScreen.tsx
// ============================================================

import React, { useState, useEffect, useCallback } from "react";
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  Image, ActivityIndicator, RefreshControl, ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { Feather } from "@expo/vector-icons";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../../config/firebaseConfig";
import { useAuth } from "../../context/AuthContext";
import { getProductImage } from "../../utils/imageMapper";

// ── Status tab config ─────────────────────────────────────────
const STATUS_TABS = [
  { key: "all",       label: "All" },
  { key: "pending",   label: "Pending" },
  { key: "shipped",   label: "Shipped" },
  { key: "delivered", label: "Delivered" },
  { key: "cancelled", label: "Cancelled" },
];

const STATUS_CONFIG: Record<string, { bg: string; text: string; icon: string }> = {
  pending:   { bg: "#fef3c7", text: "#92400e", icon: "clock" },
  shipped:   { bg: "#dbeafe", text: "#1e40af", icon: "truck" },
  delivered: { bg: "#dcfce7", text: "#166534", icon: "check-circle" },
  cancelled: { bg: "#fee2e2", text: "#991b1b", icon: "x-circle" },
};

export const OrdersScreen = () => {
  const { user } = useAuth();
  const navigation = useNavigation<any>();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");

  const fetchOrders = useCallback(async () => {
    if (!user) return;
    try {
      setLoading(true);
      const q = query(collection(db, "orders"), where("userId", "==", user.uid));
      const snapshot = await getDocs(q);
      const data = snapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .sort((a: any, b: any) => {
          const aT = a.createdAt?.toMillis?.() ?? 0;
          const bT = b.createdAt?.toMillis?.() ?? 0;
          return bT - aT;
        });
      setOrders(data);
    } catch (err) {
      console.error("Error fetching orders:", err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);
  useFocusEffect(useCallback(() => { fetchOrders(); }, [fetchOrders]));

  // ── Filter by active tab ──────────────────────────────────
  const filtered = activeTab === "all"
    ? orders
    : orders.filter(o => (o.status || "pending") === activeTab);

  // ── Count per status for tab badges ──────────────────────
  const countFor = (key: string) =>
    key === "all"
      ? orders.length
      : orders.filter(o => (o.status || "pending") === key).length;

  // ── Render helpers ────────────────────────────────────────
  const renderStatusBadge = (status: string) => {
    const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.pending;
    return (
      <View style={[styles.statusBadge, { backgroundColor: cfg.bg }]}>
        <Feather name={cfg.icon as any} size={10} color={cfg.text} style={{ marginRight: 4 }} />
        <Text style={[styles.statusText, { color: cfg.text }]}>
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </Text>
      </View>
    );
  };

  const renderOrderCard = ({ item }: { item: any }) => {
    const items: any[] = item.items ?? [];
    const firstItem = items[0] ?? null;
    const extraCount = items.length - 1;

    // Use the stored imageKey on each item for correct image resolution
    const imageSource = firstItem?.imageKey
      ? getProductImage(firstItem.imageKey)
      : getProductImage(firstItem?.productID); // fallback

    const dateStr = item.createdAt
      ? item.createdAt.toDate().toLocaleDateString("en-PH", {
          month: "short", day: "numeric", year: "numeric",
        })
      : "—";

    const status = item.status ?? "pending";
    const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.pending;

    return (
      <TouchableOpacity
        style={styles.orderCard}
        onPress={() => navigation.navigate("OrderDetail", { orderId: item.orderID || item.id })}
        activeOpacity={0.85}
      >
        {/* Status stripe on left edge */}
        <View style={[styles.statusStripe, { backgroundColor: cfg.text }]} />

        <View style={styles.cardBody}>
          {/* Top row: image + details */}
          <View style={styles.cardTop}>
            <Image
              source={imageSource}
              style={styles.productImage}
              resizeMode="cover"
            />
            <View style={styles.cardInfo}>
              {/* Product name(s) */}
              <Text style={styles.productName} numberOfLines={1}>
                {firstItem?.name ?? "Unknown Product"}
              </Text>
              {extraCount > 0 && (
                <Text style={styles.extraItems}>+{extraCount} more item{extraCount > 1 ? "s" : ""}</Text>
              )}
              <Text style={styles.dateText}>{dateStr}</Text>
              <Text style={styles.orderRef}>Ref: {item.orderID ?? item.id}</Text>
            </View>
          </View>

          {/* Bottom row: status badge + total */}
          <View style={styles.cardBottom}>
            {renderStatusBadge(status)}
            <Text style={styles.totalText}>₱{item.totalAmount?.toFixed(2)}</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  // ── Loading state ─────────────────────────────────────────
  if (loading && orders.length === 0) {
    return (
      <SafeAreaView style={styles.safeArea} edges={["top"]}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>My Orders</Text>
        </View>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#9d174d" />
        </View>
      </SafeAreaView>
    );
  }

  // ── Empty state ───────────────────────────────────────────
  if (!loading && orders.length === 0) {
    return (
      <SafeAreaView style={styles.safeArea} edges={["top"]}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>My Orders</Text>
        </View>
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIconWrap}>
            <Feather name="shopping-bag" size={48} color="#d1d5db" />
          </View>
          <Text style={styles.emptyTitle}>No orders yet</Text>
          <Text style={styles.emptySubtitle}>
            Your confirmed purchases will appear here
          </Text>
          <TouchableOpacity
            style={styles.shopBtn}
            onPress={() => navigation.navigate("CatalogTab")}
          >
            <Text style={styles.shopBtnText}>Start Shopping</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // ── Main list ─────────────────────────────────────────────
  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Orders</Text>
        <Text style={styles.headerSubtitle}>{orders.length} order{orders.length !== 1 ? "s" : ""}</Text>
      </View>

      {/* Status tabs */}
      <View style={styles.tabBarWrapper}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabBar}
        >
          {STATUS_TABS.map(tab => {
            const count = countFor(tab.key);
            const isActive = activeTab === tab.key;
            return (
              <TouchableOpacity
                key={tab.key}
                style={[styles.tab, isActive && styles.tabActive]}
                onPress={() => setActiveTab(tab.key)}
                activeOpacity={0.7}
              >
                <Text style={[styles.tabLabel, isActive && styles.tabLabelActive]}>
                  {tab.label}
                </Text>
                {count > 0 && (
                  <View style={[styles.tabBadge, isActive && styles.tabBadgeActive]}>
                    <Text style={[styles.tabBadgeText, isActive && styles.tabBadgeTextActive]}>
                      {count}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Order list */}
      {filtered.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Feather name="inbox" size={40} color="#d1d5db" />
          <Text style={styles.emptyTitle}>No {activeTab} orders</Text>
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={item => item.id}
          renderItem={renderOrderCard}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={loading} onRefresh={fetchOrders} tintColor="#9d174d" />
          }
        />
      )}
    </SafeAreaView>
  );
};

// ── Styles ────────────────────────────────────────────────────
const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#ffffff" },

  header: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  headerTitle: { fontSize: 22, fontFamily: "Zalando-Bold", color: "#9d174d" },
  headerSubtitle: { fontSize: 12, fontFamily: "Zalando-Medium", color: "#9ca3af", marginTop: 2 },

  centerContainer: { flex: 1, justifyContent: "center", alignItems: "center" },

  // ── Tabs ──────────────────────────────────────────────────
  tabBarWrapper: { borderBottomWidth: 1, borderBottomColor: "#f3f4f6" },
  tabBar: { paddingHorizontal: 16, paddingVertical: 10, gap: 8 },
  tab: {
    flexDirection: "row", alignItems: "center",
    paddingHorizontal: 14, paddingVertical: 6,
    borderRadius: 20, borderWidth: 1, borderColor: "#e5e7eb",
    backgroundColor: "#f9fafb", gap: 6,
  },
  tabActive: { backgroundColor: "#9d174d", borderColor: "#9d174d" },
  tabLabel: { fontSize: 13, fontFamily: "Zalando-SemiBold", color: "#6b7280" },
  tabLabelActive: { color: "#ffffff" },
  tabBadge: {
    minWidth: 18, height: 18, borderRadius: 9,
    backgroundColor: "#e5e7eb", justifyContent: "center", alignItems: "center",
    paddingHorizontal: 4,
  },
  tabBadgeActive: { backgroundColor: "rgba(255,255,255,0.3)" },
  tabBadgeText: { fontSize: 10, fontFamily: "Zalando-Bold", color: "#6b7280" },
  tabBadgeTextActive: { color: "#ffffff" },

  // ── Order card ────────────────────────────────────────────
  listContent: { padding: 16, gap: 12 },
  orderCard: {
    flexDirection: "row",
    backgroundColor: "#ffffff",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  statusStripe: { width: 4 },
  cardBody: { flex: 1, padding: 14 },
  cardTop: { flexDirection: "row", marginBottom: 12 },
  productImage: {
    width: 64, height: 64, borderRadius: 10,
    marginRight: 12, backgroundColor: "#f3f4f6",
  },
  cardInfo: { flex: 1, justifyContent: "center" },
  productName: {
    fontSize: 14, fontFamily: "Zalando-Bold", color: "#1f2937", marginBottom: 3,
  },
  extraItems: {
    fontSize: 11, fontFamily: "Zalando-Medium", color: "#ff914d", marginBottom: 3,
  },
  dateText: { fontSize: 12, fontFamily: "Zalando-Medium", color: "#9ca3af", marginBottom: 2 },
  orderRef: { fontSize: 11, fontFamily: "Zalando-Regular", color: "#d1d5db" },

  cardBottom: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "#f9fafb",
    paddingTop: 10,
  },
  statusBadge: {
    flexDirection: "row", alignItems: "center",
    paddingHorizontal: 10, paddingVertical: 5,
    borderRadius: 20,
  },
  statusText: { fontSize: 11, fontFamily: "Zalando-SemiBold" },
  totalText: { fontSize: 15, fontFamily: "Zalando-Bold", color: "#9d174d" },

  // ── Empty state ───────────────────────────────────────────
  emptyContainer: { flex: 1, justifyContent: "center", alignItems: "center", padding: 32 },
  emptyIconWrap: {
    width: 96, height: 96, borderRadius: 48,
    backgroundColor: "#f9fafb", justifyContent: "center", alignItems: "center", marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 18, fontFamily: "Zalando-Bold", color: "#1f2937", marginBottom: 8, marginTop: 12,
  },
  emptySubtitle: {
    fontSize: 14, fontFamily: "Zalando-Medium", color: "#9ca3af",
    textAlign: "center", marginBottom: 28, lineHeight: 22,
  },
  shopBtn: {
    backgroundColor: "#9d174d", paddingHorizontal: 32,
    paddingVertical: 14, borderRadius: 24,
  },
  shopBtnText: { color: "#ffffff", fontSize: 15, fontFamily: "Zalando-SemiBold" },
});
