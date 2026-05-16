import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Modal, ActivityIndicator } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Feather } from "@expo/vector-icons";
import { useStripe } from "@stripe/stripe-react-native";
import { useAuth } from "../../context/AuthContext";
import { CheckoutData } from "./CheckoutScreen";
import { CTAButton } from "../../components/common/CTAButton";
import { createPaymentIntent } from "../../services/stripeService";
import { getCart, clearCart } from "../../services/cartService";
import { CartItem } from "../../config/firestoreSchema";
import { getProductImage } from "../../utils/imageMapper";
import { doc, setDoc, updateDoc, Timestamp, increment } from "firebase/firestore";
import { db } from "../../config/firebaseConfig";

interface ReviewStepProps {
  checkoutData: CheckoutData;
  updateCheckoutData: (data: Partial<CheckoutData>) => void;
  updateCurrentStep: (step: "shipping" | "payment" | "review") => void;
}

export const ReviewStep: React.FC<ReviewStepProps> = ({ checkoutData, updateCurrentStep }) => {
  const { user } = useAuth();
  const navigation = useNavigation<any>();
  const { confirmPayment } = useStripe();

  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loadingCart, setLoadingCart] = useState(true);
  
  const [termsAgreed, setTermsAgreed] = useState(false);
  const [termsModalVisible, setTermsModalVisible] = useState(false);
  const [privacyModalVisible, setPrivacyModalVisible] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCart = async () => {
      if (!user) return;
      try {
        const cart = await getCart(user.uid);
        if (cart) setCartItems(cart.items);
      } catch (err) {
        console.error("Failed to fetch cart", err);
      } finally {
        setLoadingCart(false);
      }
    };
    fetchCart();
  }, [user]);

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shippingFee = 50.00; // Fixed for now
  const totalAmount = subtotal + shippingFee;

  const handleSubmitOrder = async () => {
    if (!termsAgreed) {
      setError("Please agree to Terms of Use and Privacy Policy");
      return;
    }
    // Guard: need user, address, and a Stripe PaymentMethod from the previous step
    if (!user || !checkoutData.paymentMethodId || !checkoutData.selectedAddress) {
      setError("Missing required checkout information. Please go back and try again.");
      return;
    }

    setProcessing(true);
    setError(null);

    try {
      // 1. Create a PaymentIntent with the REAL order total (amount in centavos)
      const clientSecret = await createPaymentIntent(
        Math.round(totalAmount * 100),
        "php"
      );

      // 2. Confirm the PaymentIntent using the SDK with the already-created PaymentMethod.
      //    The SDK handles 3D Secure authentication automatically if required.
      const { paymentIntent, error: stripeError } = await confirmPayment(clientSecret, {
        paymentMethodType: "Card",
        paymentMethodData: {
          paymentMethodId: checkoutData.paymentMethodId,
        },
      });

      if (stripeError) {
        setError(stripeError.message || "Payment failed. Please try again.");
        setProcessing(false);
        return;
      }

      if (!paymentIntent || paymentIntent.status !== "Succeeded") {
        setError(`Payment incomplete (status: ${paymentIntent?.status}). Please try again.`);
        setProcessing(false);
        return;
      }

      // 3. Create Order in Firestore
      const orderId = `VRD${Math.random().toString(36).substring(2, 11).toUpperCase()}`;
      const orderData = {
        orderID: orderId,
        userId: user.uid,
        stripePaymentIntentId: paymentIntent.id,
        items: cartItems.map(item => ({
          productID: item.productId,
          name: item.name,
          quantity: item.quantity,
          price: item.price,
          subtotal: item.price * item.quantity,
          imageKey: item.image ?? "",   // 'image' field stores the imageKey in cartService
        })),
        subtotal,
        shippingFee,
        totalAmount,
        currency: "PHP",
        shippingAddress: {
          Street: checkoutData.selectedAddress.street,
          City: checkoutData.selectedAddress.city,
          Province: checkoutData.selectedAddress.province,
          PostalCode: checkoutData.selectedAddress.postalCode,
        },
        paymentMethod: "credit_card",
        paymentStatus: "paid",
        status: "pending",
        createdAt: Timestamp.now(),
        shippedAt: null,
        deliveredAt: null,
      };

      await setDoc(doc(db, "orders", orderId), orderData);

      // 3. Decrement stock for each purchased item
      await Promise.all(
        cartItems.map(item =>
          updateDoc(doc(db, "products", item.productId), {
            stock: increment(-item.quantity),
          }).catch(e => console.warn(`Stock update failed for ${item.productId}:`, e))
        )
      );

      // 4. Clear Cart
      await clearCart(user.uid);

      // 4. Navigate
      navigation.navigate("OrderConfirmation", { orderId });
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setProcessing(false);
    }
  };

  const { selectedAddress, cardDetails } = checkoutData;
  const last4 = cardDetails?.cardNumber ? cardDetails.cardNumber.slice(-4) : "****";

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        
        {/* Order Summary */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Order Summary</Text>
          
          {loadingCart ? (
            <ActivityIndicator size="small" color="#9d174d" style={{ padding: 20 }} />
          ) : (
            <View style={styles.itemsList}>
              {cartItems.map((item, idx) => (
                <View key={`${item.productId}-${idx}`} style={styles.itemRow}>
                  <Image source={getProductImage(item.productId.split("-")[0])} style={styles.itemImage} />
                  <View style={styles.itemDetails}>
                    <Text style={styles.itemName} numberOfLines={1}>{item.name}</Text>
                    <Text style={styles.itemQty}>Qty: {item.quantity}</Text>
                  </View>
                  <Text style={styles.itemPrice}>₱{item.price.toFixed(2)}</Text>
                </View>
              ))}
            </View>
          )}

          <View style={styles.totalsContainer}>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Subtotal</Text>
              <Text style={styles.totalValue}>₱{subtotal.toFixed(2)}</Text>
            </View>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Delivery fee</Text>
              <Text style={styles.totalValue}>₱{shippingFee.toFixed(2)}</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.totalRow}>
              <Text style={styles.finalTotalLabel}>Total</Text>
              <Text style={styles.finalTotalValue}>₱{totalAmount.toFixed(2)}</Text>
            </View>
          </View>
        </View>

        {/* Shipping Address */}
        <View style={styles.cardLight}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Shipping address</Text>
            <TouchableOpacity onPress={() => updateCurrentStep("shipping")}>
              <Text style={styles.editText}>Edit</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.addressName}>{selectedAddress?.label || "Home"}</Text>
          <Text style={styles.addressFull}>
            {selectedAddress?.street}, {selectedAddress?.city}, {selectedAddress?.province} {selectedAddress?.postalCode}
          </Text>
        </View>

        {/* Payment Method */}
        <View style={styles.cardLight}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Payment</Text>
            <TouchableOpacity onPress={() => updateCurrentStep("payment")}>
              <Text style={styles.editText}>Edit</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.paymentInfoRow}>
            <View style={styles.mcLogos}>
              <View style={[styles.circle, { backgroundColor: "#ea580c" }]} />
              <View style={[styles.circle, { backgroundColor: "#fbbf24", marginLeft: -8 }]} />
            </View>
            <View>
              <Text style={styles.paymentCardText}>•••• •••• •••• {last4}</Text>
              <Text style={styles.paymentExpiryText}>{cardDetails?.expiryDate}</Text>
            </View>
          </View>
        </View>

        {/* Terms & Conditions */}
        <View style={styles.termsContainer}>
          <TouchableOpacity 
            style={styles.checkboxContainer} 
            onPress={() => {
              setTermsAgreed(!termsAgreed);
              if (error) setError(null);
            }}
            activeOpacity={0.7}
          >
            <View style={[styles.checkbox, termsAgreed && styles.checkboxChecked]}>
              {termsAgreed && <Feather name="check" size={12} color="#ffffff" />}
            </View>
          </TouchableOpacity>
          <Text style={styles.termsText}>
            By clicking submit order, you agree to <Text style={styles.linkText} onPress={() => setTermsModalVisible(true)}>Terms of Use</Text> and <Text style={styles.linkText} onPress={() => setPrivacyModalVisible(true)}>Privacy Policy</Text>
          </Text>
        </View>
        {error && <Text style={styles.errorTextCenter}>{error}</Text>}
        
      </ScrollView>

      <View style={styles.footer}>
        <CTAButton
          title={processing ? "Processing..." : "Submit Order"}
          onPress={handleSubmitOrder}
          disabled={processing || loadingCart}
        />
      </View>

      {/* Terms Modal */}
      <Modal visible={termsModalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <TouchableOpacity style={styles.closeButton} onPress={() => setTermsModalVisible(false)}>
              <Feather name="x" size={24} color="#9d174d" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Terms of Use</Text>
            <ScrollView style={styles.modalScroll}>
              <Text style={styles.modalText}>These Terms of Use govern your use of SewaMics. By accessing and using this platform, you accept and agree to be bound by the terms and provision of this agreement.</Text>
              <Text style={styles.modalText}>You agree to use this site for lawful purposes only and in a way that does not infringe the rights of, restrict or inhibit anyone else's use and enjoyment of the site.</Text>
              <Text style={styles.modalText}>All content included on this site, such as text, graphics, logos, images, and software, is the property of SewaMics or its content suppliers.</Text>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Privacy Modal */}
      <Modal visible={privacyModalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <TouchableOpacity style={styles.closeButton} onPress={() => setPrivacyModalVisible(false)}>
              <Feather name="x" size={24} color="#9d174d" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Privacy Policy</Text>
            <ScrollView style={styles.modalScroll}>
              <Text style={styles.modalText}>We are committed to protecting your privacy. This Privacy Policy explains how we collect and use your information when you use our services.</Text>
              <Text style={styles.modalText}>We collect information from you when you register on our site, place an order, or subscribe to our newsletter. We use this information to process transactions and improve customer service.</Text>
              <Text style={styles.modalText}>We do not sell, trade, or otherwise transfer to outside parties your personally identifiable information. This does not include trusted third parties who assist us in operating our website.</Text>
            </ScrollView>
          </View>
        </View>
      </Modal>

    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContainer: { flex: 1 },
  card: {
    backgroundColor: "#f9fafb",
    borderRadius: 12,
    marginHorizontal: 16,
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 14,
    fontFamily: "Zalando-Bold",
    color: "#9d174d",
    padding: 16,
    paddingBottom: 8,
  },
  itemsList: {
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  itemRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  itemImage: {
    width: 48,
    height: 48,
    borderRadius: 8,
    marginRight: 12,
  },
  itemDetails: {
    flex: 1,
  },
  itemName: {
    fontSize: 13,
    fontFamily: "Zalando-Bold",
    color: "#1f2937",
  },
  itemQty: {
    fontSize: 12,
    fontFamily: "Zalando-Medium",
    color: "#6b7280",
    marginTop: 2,
  },
  itemPrice: {
    fontSize: 13,
    fontFamily: "Zalando-Bold",
    color: "#1f2937",
  },
  totalsContainer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  totalLabel: {
    fontSize: 13,
    fontFamily: "Zalando-Medium",
    color: "#6b7280",
  },
  totalValue: {
    fontSize: 13,
    fontFamily: "Zalando-Bold",
    color: "#1f2937",
  },
  divider: {
    height: 1,
    backgroundColor: "#e5e7eb",
    marginVertical: 8,
  },
  finalTotalLabel: {
    fontSize: 14,
    fontFamily: "Zalando-Bold",
    color: "#1f2937",
  },
  finalTotalValue: {
    fontSize: 18,
    fontFamily: "Zalando-Bold",
    color: "#9d174d",
  },
  cardLight: {
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#f3f4f6",
    borderRadius: 12,
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 12,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  editText: {
    fontSize: 12,
    fontFamily: "Zalando-Bold",
    color: "#9d174d",
  },
  addressName: {
    fontSize: 13,
    fontFamily: "Zalando-Bold",
    color: "#1f2937",
    marginBottom: 4,
  },
  addressFull: {
    fontSize: 13,
    fontFamily: "Zalando-Medium",
    color: "#6b7280",
  },
  paymentInfoRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  mcLogos: {
    flexDirection: "row",
    marginRight: 12,
  },
  circle: {
    width: 24,
    height: 24,
    borderRadius: 12,
  },
  paymentCardText: {
    fontSize: 13,
    fontFamily: "Zalando-Bold",
    color: "#1f2937",
    letterSpacing: 1,
  },
  paymentExpiryText: {
    fontSize: 12,
    fontFamily: "Zalando-Medium",
    color: "#6b7280",
  },
  termsContainer: {
    flexDirection: "row",
    paddingHorizontal: 16,
    marginBottom: 16,
    alignItems: "flex-start",
  },
  checkboxContainer: {
    marginRight: 12,
    marginTop: 2,
  },
  checkbox: {
    width: 18,
    height: 18,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: "#9d174d",
    justifyContent: "center",
    alignItems: "center",
  },
  checkboxChecked: {
    backgroundColor: "#9d174d",
  },
  termsText: {
    flex: 1,
    fontSize: 12,
    fontFamily: "Zalando-Medium",
    color: "#6b7280",
    lineHeight: 18,
  },
  linkText: {
    color: "#9d174d",
    fontFamily: "Zalando-Bold",
    textDecorationLine: "underline",
  },
  errorTextCenter: {
    color: "#ef4444",
    fontSize: 13,
    fontFamily: "Zalando-Medium",
    textAlign: "center",
    marginBottom: 16,
  },
  footer: {
    padding: 16,
    backgroundColor: "#ffffff",
    borderTopWidth: 1,
    borderTopColor: "#f3f4f6",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 24,
    width: "85%",
    maxHeight: "70%",
  },
  closeButton: {
    position: "absolute",
    top: 16,
    right: 16,
    zIndex: 1,
  },
  modalTitle: {
    fontSize: 18,
    fontFamily: "Zalando-Bold",
    color: "#1f2937",
    textAlign: "center",
    marginBottom: 16,
  },
  modalScroll: {
    marginTop: 8,
  },
  modalText: {
    fontSize: 14,
    fontFamily: "Zalando-Regular",
    color: "#4b5563",
    lineHeight: 22,
    marginBottom: 12,
    textAlign: "center",
  },
});
