// ============================================================
// SewaMics — Payment Step
// File: src/screens/checkout/PaymentStep.tsx
//
// Uses @stripe/stripe-react-native CardField for PCI-compliant
// card data collection. Raw card numbers are never stored or
// transmitted by our code — the SDK handles tokenization.
// ============================================================

import React, { useState, useRef, useEffect } from "react";
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  ScrollView, Alert, ActivityIndicator, Animated
} from "react-native";
import { CardForm, useStripe } from "@stripe/stripe-react-native";
import { FontAwesome, Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { CheckoutData } from "./CheckoutScreen";
import { CTAButton } from "../../components/common/CTAButton";

interface PaymentStepProps {
  checkoutData: CheckoutData;
  updateCheckoutData: (data: Partial<CheckoutData>) => void;
  updateCurrentStep: (step: "shipping" | "payment" | "review") => void;
}

export const PaymentStep: React.FC<PaymentStepProps> = ({
  checkoutData,
  updateCheckoutData,
  updateCurrentStep,
}) => {
  const { createPaymentMethod } = useStripe();
  const [cardholderName, setCardholderName] = useState(
    checkoutData.cardDetails?.cardholderName || ""
  );
  const [cardComplete, setCardComplete] = useState(false);
  const [nameError, setNameError] = useState("");
  const [processing, setProcessing] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(25)).current;
  const nameCheckAnim = useRef(new Animated.Value(0)).current;
  const cardCheckAnim = useRef(new Animated.Value(0)).current;

  const isNameValid = cardholderName.trim().length >= 3;

  useEffect(() => {
    Animated.spring(nameCheckAnim, {
      toValue: isNameValid ? 1 : 0,
      tension: 80,
      friction: 6,
      useNativeDriver: true,
    }).start();
  }, [isNameValid]);

  useEffect(() => {
    Animated.spring(cardCheckAnim, {
      toValue: cardComplete ? 1 : 0,
      tension: 80,
      friction: 6,
      useNativeDriver: true,
    }).start();
  }, [cardComplete]);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleContinueReview = async () => {
    // Validate cardholder name
    if (!cardholderName.trim()) {
      setNameError("Cardholder name is required");
      return;
    }
    if (!cardComplete) {
      Alert.alert("Incomplete Card", "Please fill in all card details.");
      return;
    }

    setProcessing(true);
    try {
      // Use the Stripe SDK to create a PaymentMethod from the CardForm.
      // We pass paymentMethodData here to bind the cardholder's name, which Stripe seamlessly
      // merges with the native CardForm details without overwriting.
      const { paymentMethod, error } = await createPaymentMethod({
        paymentMethodType: "Card",
        paymentMethodData: {
          billingDetails: { name: cardholderName.trim() },
        },
      });

      if (error || !paymentMethod) {
        Alert.alert(
          "Card Error",
          error?.message || "Could not validate card. Please check your details."
        );
        return;
      }

      // Store the PaymentMethod ID and safe display info (last 4 digits only).
      // The full card number is NEVER stored anywhere in the app.
      updateCheckoutData({
        paymentMethod: "credit_card",
        cardDetails: {
          cardholderName: cardholderName.trim(),
          last4: paymentMethod.Card?.last4 ?? "****",
          brand: paymentMethod.Card?.brand ?? "card",
        },
        paymentMethodId: paymentMethod.id,
        clientSecret: null, // Created in ReviewStep with the real order amount
      });

      updateCurrentStep("review");
    } catch (err: any) {
      console.error("[PaymentStep] createPaymentMethod error:", err);
      Alert.alert("Error", err?.message || "An unexpected error occurred.");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Payment Method</Text>
          <Text style={styles.subtitle}>Enter your card details securely</Text>
        </View>

        {/* Dynamic, High-fidelity Premium Virtual Credit Card */}
        <Animated.View style={[styles.vCardWrapper, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
          <LinearGradient
            colors={["#9d174d", "#ff914d"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.vCard}
          >
            {/* VCard Header */}
            <View style={styles.vCardHeader}>
              <Text style={styles.vCardBrand}>SewaMics Pay</Text>
              <Feather name="wifi" size={20} color="rgba(255,255,255,0.75)" style={{ transform: [{ rotate: "90deg" }] }} />
            </View>

            {/* Simulated Gold Metallic Chip */}
            <View style={styles.vChip}>
              <View style={styles.vChipHorizontal} />
              <View style={styles.vChipVertical} />
              <View style={styles.vChipCenter} />
            </View>

            {/* VCard Number */}
            <Text style={styles.vCardNumber}>
              ••••   ••••   ••••   {checkoutData.cardDetails?.last4 || "••••"}
            </Text>

            {/* VCard Footer */}
            <View style={styles.vCardFooter}>
              <View style={{ flex: 1 }}>
                <Text style={styles.vLabel}>CARDHOLDER</Text>
                <Text style={styles.vValue} numberOfLines={1}>
                  {cardholderName ? cardholderName.toUpperCase() : "YOUR NAME HERE"}
                </Text>
              </View>
              <View style={{ alignItems: "flex-end", width: 80 }}>
                <Text style={styles.vLabel}>EXPIRES</Text>
                <Text style={styles.vValue}>••/••</Text>
              </View>
            </View>
          </LinearGradient>
        </Animated.View>

        <View style={styles.cardContainer}>
          {/* Card type selector header */}
          <View style={styles.cardHeader}>
            <View style={styles.radioContainer}>
              <View style={styles.radioOuter}>
                <View style={styles.radioInner} />
              </View>
              <Text style={styles.paymentMethodTitle}>Credit / Debit Card</Text>
            </View>
            <View style={styles.cardLogos}>
              <FontAwesome name="cc-visa" size={28} color="#1434CB" style={{ marginRight: 6 }} />
              <FontAwesome name="cc-mastercard" size={28} color="#EB001B" />
            </View>
          </View>

          {/* Cardholder name */}
          <View style={styles.formGroup}>
            <View style={styles.fieldLabelRow}>
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <Feather name="user" size={14} color="#9d174d" style={{ marginRight: 6 }} />
                <Text style={[styles.fieldLabel, { marginBottom: 0 }]}>Cardholder Name</Text>
              </View>
              <Animated.View style={{ transform: [{ scale: nameCheckAnim }], opacity: nameCheckAnim }}>
                <Feather name="check-circle" size={16} color="#9d174d" />
              </Animated.View>
            </View>
            <View style={[styles.inputContainer, nameError ? styles.inputContainerError : null]}>
              <Feather name="edit-3" size={16} color="#9ca3af" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Full name on card"
                value={cardholderName}
                onChangeText={(t) => { setCardholderName(t); setNameError(""); }}
                placeholderTextColor="#9ca3af"
                autoCapitalize="words"
              />
            </View>
            {nameError ? <Text style={styles.errorText}>{nameError}</Text> : null}
          </View>

          {/* Stripe CardForm — PCI-compliant multi-line input (no horizontal scrolling) */}
          <View style={styles.formGroup}>
            <View style={styles.fieldLabelRow}>
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <Feather name="credit-card" size={14} color="#9d174d" style={{ marginRight: 6 }} />
                <Text style={[styles.fieldLabel, { marginBottom: 0 }]}>Card Details</Text>
              </View>
              <Animated.View style={{ transform: [{ scale: cardCheckAnim }], opacity: cardCheckAnim }}>
                <Feather name="check-circle" size={16} color="#9d174d" />
              </Animated.View>
            </View>
            <CardForm
              defaultValues={{
                countryCode: "PH"
              }}
              cardStyle={{
                backgroundColor: "#f9fafb",
                textColor: "#1f2937",
                placeholderColor: "#9ca3af",
                borderColor: "#e5e7eb",
                borderWidth: 1,
                borderRadius: 8,
                fontSize: 14,
                fontFamily: "Zalando-Medium",
              }}
              style={styles.cardForm}
              onFormComplete={(details) => {
                setCardComplete(details.complete);
              }}
            />
            {!cardComplete && (
              <Text style={styles.hintText}>
                Enter your 16-digit card number, expiry date, and CVV
              </Text>
            )}
          </View>

          {/* Security notice */}
          <View style={styles.secureNotice}>
            <FontAwesome name="lock" size={12} color="#6b7280" style={{ marginRight: 6 }} />
            <Text style={styles.secureText}>
              Payments are processed securely by Stripe. We never store your card number.
            </Text>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        {processing ? (
          <View style={styles.processingRow}>
            <ActivityIndicator color="#9d174d" size="small" />
            <Text style={styles.processingText}>Validating card...</Text>
          </View>
        ) : (
          <CTAButton
            title="Continue to Review"
            onPress={handleContinueReview}
            disabled={processing}
            style={styles.continueBtn}
          />
        )}
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => updateCurrentStep("shipping")}
          disabled={processing}
        >
          <Text style={styles.backBtnText}>Back to Shipping</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContainer: { flex: 1 },
  header: { padding: 16, paddingBottom: 8 },
  title: { fontSize: 18, fontFamily: "Zalando-Bold", color: "#9d174d", marginBottom: 4 },
  subtitle: { fontSize: 13, fontFamily: "Zalando-Medium", color: "#6b7280" },
  cardContainer: {
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  radioContainer: { flexDirection: "row", alignItems: "center" },
  radioOuter: {
    width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: "#9d174d",
    justifyContent: "center", alignItems: "center", marginRight: 10,
  },
  radioInner: { width: 10, height: 10, borderRadius: 5, backgroundColor: "#9d174d" },
  paymentMethodTitle: { fontSize: 14, fontFamily: "Zalando-Bold", color: "#1f2937" },
  cardLogos: { flexDirection: "row" },
  formGroup: { marginBottom: 16 },
  fieldLabelRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  fieldLabel: { fontSize: 12, fontFamily: "Zalando-SemiBold", color: "#6b7280" },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    height: 44,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 8,
    backgroundColor: "#f9fafb",
    paddingHorizontal: 12,
  },
  inputContainerError: {
    borderColor: "#ef4444",
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    height: "100%",
    fontSize: 14,
    fontFamily: "Zalando-Medium",
    color: "#1f2937",
  },
  errorText: { color: "#ef4444", fontSize: 12, fontFamily: "Zalando-Regular", marginTop: 4 },
  hintText: { color: "#9ca3af", fontSize: 11, fontFamily: "Zalando-Regular", marginTop: 6 },
  // CardForm takes full width at stacked multi-line height (280 to prevent clipping)
  cardForm: { width: "100%", height: 280 },
  secureNotice: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
    padding: 10,
    backgroundColor: "#f9fafb",
    borderRadius: 8,
  },
  secureText: { fontSize: 11, fontFamily: "Zalando-Regular", color: "#6b7280", flex: 1 },
  // High-Fidelity Virtual Credit Card Mockup Styles
  vCardWrapper: {
    marginHorizontal: 16,
    marginVertical: 12,
    borderRadius: 16,
    shadowColor: "#9d174d",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
    overflow: "hidden",
  },
  vCard: {
    padding: 20,
    height: 180,
    borderRadius: 16,
    justifyContent: "space-between",
  },
  vCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  vCardBrand: {
    color: "#ffffff",
    fontSize: 16,
    fontFamily: "Zalando-Bold",
    letterSpacing: 0.5,
  },
  vChip: {
    width: 42,
    height: 32,
    backgroundColor: "#d97706",
    borderColor: "#fbbf24",
    borderWidth: 1.5,
    borderRadius: 6,
    padding: 4,
    position: "relative",
  },
  vChipHorizontal: {
    position: "absolute",
    left: 0,
    right: 0,
    top: "50%",
    height: 1,
    backgroundColor: "#fbbf24",
  },
  vChipVertical: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: "50%",
    width: 1,
    backgroundColor: "#fbbf24",
  },
  vChipCenter: {
    position: "absolute",
    left: 10,
    right: 10,
    top: 6,
    bottom: 6,
    borderColor: "#fbbf24",
    borderWidth: 1,
    borderRadius: 3,
    backgroundColor: "transparent",
  },
  vCardNumber: {
    color: "#ffffff",
    fontSize: 20,
    fontFamily: "Zalando-Bold",
    letterSpacing: 2,
    textAlign: "center",
    marginVertical: 8,
    textShadowColor: "rgba(0,0,0,0.3)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  vCardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
  },
  vLabel: {
    color: "rgba(255,255,255,0.6)",
    fontSize: 8,
    fontFamily: "Zalando-Medium",
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  vValue: {
    color: "#ffffff",
    fontSize: 13,
    fontFamily: "Zalando-Bold",
    letterSpacing: 0.5,
  },
  footer: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 50,
    backgroundColor: "#ffffff",
    gap: 12,
  },
  continueBtn: { width: "100%" },
  processingRow: { flexDirection: "row", alignItems: "center", justifyContent: "center", height: 48, gap: 10 },
  processingText: { fontSize: 15, fontFamily: "Zalando-SemiBold", color: "#9d174d" },
  backBtn: {
    width: "100%", height: 48, justifyContent: "center", alignItems: "center",
    borderRadius: 24, borderWidth: 1, borderColor: "#9d174d", backgroundColor: "#ffffff",
  },
  backBtnText: { fontSize: 15, fontFamily: "Zalando-SemiBold", color: "#9d174d" },
});
