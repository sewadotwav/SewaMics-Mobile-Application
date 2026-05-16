import React, { useEffect, useRef } from "react";
import { View, Text, StyleSheet, Animated, TouchableOpacity, SafeAreaView } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { Feather } from "@expo/vector-icons";
import { CTAButton } from "../../components/common/CTAButton";

export const OrderConfirmationScreen = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { orderId } = route.params || { orderId: "UNKNOWN" };

  const scaleAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      tension: 50,
      friction: 7,
      useNativeDriver: true,
    }).start();
  }, [scaleAnim]);

  // Calculate estimated delivery: 5 days from now
  const estDate = new Date();
  estDate.setDate(estDate.getDate() + 5);
  const estimatedDelivery = estDate.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });

  const handleTrackOrder = () => {
    // Navigate to Orders tab
    navigation.reset({
      index: 0,
      routes: [
        {
          name: "AppRoot",
          state: {
            routes: [
              {
                name: "BottomTabs",
                state: {
                  index: 3, // Index of OrdersTab
                  routes: [
                    { name: "HomeTab" },
                    { name: "CatalogTab" },
                    { name: "CartTab" },
                    { 
                      name: "OrdersTab",
                      state: {
                        routes: [
                          { name: "OrdersMain" }
                        ]
                      }
                    },
                    { name: "ProfileTab" }
                  ]
                }
              }
            ]
          }
        }
      ],
    });
  };

  const handleContinueShopping = () => {
    navigation.reset({
      index: 0,
      routes: [
        {
          name: "AppRoot",
          state: {
            routes: [
              {
                name: "BottomTabs",
                state: {
                  routes: [{ name: "CatalogTab" }]
                }
              }
            ]
          }
        }
      ]
    });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        
        <Animated.View style={[styles.successIconContainer, { transform: [{ scale: scaleAnim }] }]}>
          <Feather name="check" size={40} color="#ffffff" />
        </Animated.View>

        <Text style={styles.title}>Order Confirmed!</Text>
        <Text style={styles.subtitle}>Your order has been placed successfully</Text>

        <View style={styles.detailsContainer}>
          <View style={styles.detailRow}>
            <Feather name="package" size={20} color="#9ca3af" />
            <View style={styles.detailTextContainer}>
              <Text style={styles.detailLabel}>Order Number</Text>
              <Text style={styles.detailValue}>{orderId}</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.detailRow}>
            <Feather name="calendar" size={20} color="#9ca3af" />
            <View style={styles.detailTextContainer}>
              <Text style={styles.detailLabel}>Estimated Delivery</Text>
              <Text style={styles.detailValueDate}>{estimatedDelivery}</Text>
            </View>
          </View>
        </View>

      </View>

      <View style={styles.footer}>
        <CTAButton
          title="Track Order"
          onPress={handleTrackOrder}
          style={styles.trackBtn}
        />
        <TouchableOpacity style={styles.shopBtn} onPress={handleContinueShopping} activeOpacity={0.7}>
          <Text style={styles.shopBtnText}>Continue Shopping</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#ffffff" },
  container: {
    flex: 1,
    alignItems: "center",
    paddingTop: 60,
  },
  successIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#9d174d",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#9d174d",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  title: {
    fontSize: 24,
    fontFamily: "Zalando-Bold",
    color: "#1f2937",
    marginTop: 24,
  },
  subtitle: {
    fontSize: 14,
    fontFamily: "Zalando-Medium",
    color: "#6b7280",
    marginTop: 8,
  },
  detailsContainer: {
    backgroundColor: "#f9fafb",
    width: "85%",
    borderRadius: 16,
    padding: 20,
    marginTop: 40,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  detailTextContainer: {
    marginLeft: 16,
  },
  detailLabel: {
    fontSize: 12,
    fontFamily: "Zalando-Medium",
    color: "#6b7280",
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 16,
    fontFamily: "Zalando-Bold",
    color: "#9d174d",
  },
  detailValueDate: {
    fontSize: 16,
    fontFamily: "Zalando-Bold",
    color: "#1f2937",
  },
  divider: {
    height: 1,
    backgroundColor: "#e5e7eb",
    marginVertical: 16,
  },
  footer: {
    padding: 20,
    paddingBottom: 40,
    backgroundColor: "#ffffff",
    gap: 12,
  },
  trackBtn: {
    width: "100%",
  },
  shopBtn: {
    width: "100%",
    height: 48,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 24,
    borderWidth: 2,
    borderColor: "#9d174d",
    backgroundColor: "#ffffff",
  },
  shopBtnText: {
    fontSize: 15,
    fontFamily: "Zalando-SemiBold",
    color: "#9d174d",
  },
});
