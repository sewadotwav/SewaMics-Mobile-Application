import React from "react";
import { View, Text, Image, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { getProductImage } from "../../utils/imageMapper";
import { useWishlist } from "../../context/WishlistContext";

interface ProductCardProps {
  product: any;
  onPress: (productId: string) => void;
  style?: object;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onPress,
  style,
}) => {
  const { toggleWishlist, isInWishlist } = useWishlist();

  return (
    <TouchableOpacity
      style={[styles.productCard, style]}
      onPress={() => onPress(product.id)}
      activeOpacity={0.9}
    >
      <View style={styles.productImageContainer}>
        <Image
          source={getProductImage(product.imageKey)}
          style={styles.productImage}
          resizeMode="cover"
        />

        {/* Favorite Heart Icon Overlay */}
        <TouchableOpacity
          style={styles.favoriteButton}
          onPress={() => toggleWishlist(product)}
          activeOpacity={0.7}
        >
          <Ionicons
            name={isInWishlist(product.id) ? "heart" : "heart-outline"}
            size={16}
            color={isInWishlist(product.id) ? "#9d174d" : "#6b7280"}
          />
        </TouchableOpacity>
      </View>

      {/* Content Row: Title and Rating */}
      <View style={styles.cardContentRow}>
        <View style={styles.titleWrapper}>
          <Text style={styles.productName}>{product.name}</Text>
        </View>
        <View style={styles.ratingContainer}>
          <Ionicons name="star" size={13} color="#ff914d" style={{ marginRight: 4, marginTop: -1 }} />
          <Text style={styles.ratingText}>{product.rating || "0.0"}</Text>
        </View>
      </View>

      {/* Price Row */}
      <Text style={styles.productPrice}>₱{Number(product.price).toFixed(2)}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
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
    width: "100%",
    height: "100%",
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
    alignItems: "flex-start",
    marginBottom: 4,
  },
  titleWrapper: {
    flex: 1,
    minHeight: 44,
    marginRight: 8,
  },
  productName: {
    fontSize: 15,
    fontFamily: "Zalando-Medium",
    lineHeight: 18,
    letterSpacing: -0.2,
    color: "#1f2937",
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 0,
  },
  ratingText: {
    fontSize: 14,
    fontFamily: "Zalando-Bold",
    color: "#6b7280",
  },
  productPrice: {
    fontSize: 17,
    fontFamily: "Zalando-SemiBold",
    letterSpacing: -0.5,
    color: "#ff914d",
  },
});
