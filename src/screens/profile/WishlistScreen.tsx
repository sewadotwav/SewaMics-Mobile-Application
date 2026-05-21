import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather, Ionicons } from "@expo/vector-icons";
import { useWishlist } from "../../context/WishlistContext";
import { getProductImage } from "../../utils/imageMapper";
import { LoadingScreen } from "../../components/common/LoadingScreen";
import { FloatingMascotBubble } from "../../components/common/FloatingMascotBubble";

interface WishlistScreenProps {
  navigation: any;
}

export const WishlistScreen = ({ navigation }: WishlistScreenProps) => {
  const { wishlistItems, toggleWishlist, isLoading } = useWishlist();

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} activeOpacity={0.7} style={styles.backButton}>
          <Feather name="arrow-left" size={22} color="#9d174d" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Wishlist</Text>
        <View style={styles.headerRight} />
      </View>

      {isLoading ? (
        <LoadingScreen message="Loading your wishlist..." />
      ) : wishlistItems.length === 0 ? (

        <ScrollView contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}>
          <View style={styles.emptyContainer}>
          <View style={styles.emptyIconWrapper}>
            <Feather name="heart" size={40} color="#9d174d" />
          </View>
          <Text style={styles.emptyTitle}>Your wishlist is empty</Text>
          <Text style={styles.emptySubtext}>
            Tap the heart icon on any product to save it here for later.
          </Text>
          <TouchableOpacity
            style={styles.browseButton}
            onPress={() => navigation.navigate("HomeTab")}
            activeOpacity={0.85}
          >
            <Feather name="shopping-bag" size={18} color="#ffffff" style={{ marginRight: 8 }} />
            <Text style={styles.browseButtonText}>Browse Products</Text>
          </TouchableOpacity>
          </View>
        </ScrollView>
      ) : (

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.gridContent}
        >
          <View style={styles.productGrid}>
            {wishlistItems.map((item) => (
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
                  {/* Remove from wishlist */}
                  <TouchableOpacity
                    style={styles.favoriteButton}
                    onPress={() => toggleWishlist(item)}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="heart" size={16} color="#9d174d" />
                  </TouchableOpacity>
                </View>

                <View style={styles.cardContentRow}>
                  <View style={styles.titleWrapper}>
                    <Text style={styles.productName}>{item.name}</Text>
                  </View>
                  <View style={styles.ratingContainer}>
                    <Ionicons name="star" size={13} color="#ff914d" style={{ marginRight: 4, marginTop: -1 }} />
                    <Text style={styles.ratingText}>{item.rating || "0.0"}</Text>
                  </View>
                </View>
                <Text style={styles.productPrice}>₱{Number(item.price).toFixed(2)}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      )}
      <FloatingMascotBubble />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#ffffff" },
  centeredContainer: { flex: 1, justifyContent: "center", alignItems: "center" },

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
  headerTitle: { fontSize: 18, fontFamily: "Zalando-SemiBold", color: "#1f2937", letterSpacing: -0.3 },
  headerRight: { width: 40 },


  emptyContainer: { flex: 1, justifyContent: "center", alignItems: "center", paddingHorizontal: 32, paddingBottom: 40 },
  emptyIconWrapper: {
    width: 100, height: 100, borderRadius: 50,
    backgroundColor: "#f9fafb",
    justifyContent: "center", alignItems: "center", marginBottom: 24,
  },
  emptyTitle: { fontSize: 20, fontFamily: "Zalando-SemiBold", color: "#1f2937", marginBottom: 12, textAlign: "center", letterSpacing: -0.3 },
  emptySubtext: { fontSize: 14, fontFamily: "Zalando-Regular", color: "#6b7280", textAlign: "center", lineHeight: 22, marginBottom: 32 },
  browseButton: {
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    height: 48, borderRadius: 20, paddingHorizontal: 24, backgroundColor: "#9d174d",
  },
  browseButtonText: { color: "#ffffff", fontSize: 16, fontFamily: "Zalando-SemiBold" },


  gridContent: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 100 },
  productGrid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between" },
  productCard: { width: "48%", marginBottom: 24 },
  productImageContainer: {
    width: "100%", aspectRatio: 1, borderRadius: 16,
    backgroundColor: "#fcfbf8", overflow: "hidden", marginBottom: 12,
  },
  productImage: { width: "100%", height: "100%" },
  favoriteButton: {
    position: "absolute", top: 10, right: 10,
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: "#ffffff",
    justifyContent: "center", alignItems: "center",
    shadowColor: "#000", shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1, shadowRadius: 3, elevation: 3,
  },
  cardContentRow: {
    flexDirection: "row", justifyContent: "space-between",
    alignItems: "flex-start", marginBottom: 4,
  },
  titleWrapper: { flex: 1, minHeight: 44, marginRight: 8 },
  productName: { fontSize: 15, fontFamily: "Zalando-Medium", lineHeight: 18, letterSpacing: -0.2, color: "#1f2937" },
  ratingContainer: { flexDirection: "row", alignItems: "center" },
  ratingText: { fontSize: 14, fontFamily: "Zalando-Bold", color: "#6b7280" },
  productPrice: { fontSize: 17, fontFamily: "Zalando-SemiBold", letterSpacing: -0.5, color: "#ff914d" },
});
