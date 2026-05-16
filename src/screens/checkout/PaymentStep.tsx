// ============================================================
// SewaMics — Payment Step
// File: src/screens/checkout/PaymentStep.tsx
//
// Uses @stripe/stripe-react-native CardField for PCI-compliant
// card data collection. Raw card numbers are never stored or
// transmitted by our code — the SDK handles tokenization.
// ============================================================

import React, { useState, useRef } from "react";
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  ScrollView, Alert, ActivityIndicator,
} from "react-native";
import { CardField, useStripe, CardFieldInput } from "@stripe/stripe-react-native";
import { FontAwesome } from "@expo/vector-icons";
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
      // Use the Stripe SDK to create a PaymentMethod from the CardField.
      // This is PCI-compliant — no raw card data ever leaves the SDK.
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
          last4: paymentMethod.card?.last4 ?? "****",
          brand: paymentMethod.card?.brand ?? "card",
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
            <Text style={styles.fieldLabel}>Cardholder Name</Text>
            <TextInput
              style={[styles.input, nameError ? styles.inputError : null]}
              placeholder="Full name on card"
              value={cardholderName}
              onChangeText={(t) => { setCardholderName(t); setNameError(""); }}
              placeholderTextColor="#9ca3af"
              autoCapitalize="words"
            />
            {nameError ? <Text style={styles.errorText}>{nameError}</Text> : null}
          </View>

          {/* Stripe CardField — PCI-compliant native card input */}
          <View style={styles.formGroup}>
            <Text style={styles.fieldLabel}>Card Details</Text>
            <CardField
              postalCodeEnabled={false}
              placeholder={{
                number: "0000 0000 0000 0000",
              }}
              cardStyle={{
                backgroundColor: "#f9fafb",
                textColor: "#1f2937",
                placeholderColor: "#9ca3af",
                borderColor: "#e5e7eb",
                borderWidth: 1,
                borderRadius: 8,
                fontSize: 14,
              }}
              style={styles.cardField}
              onCardChange={(details: CardFieldInput.Details) => {
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
    borderWidth: 2,
    borderColor: "#9d174d",
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 16,
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
  fieldLabel: { fontSize: 12, fontFamily: "Zalando-SemiBold", color: "#6b7280", marginBottom: 6 },
  input: {
    height: 44, borderWidth: 1, borderColor: "#e5e7eb", borderRadius: 8, paddingHorizontal: 12,
    backgroundColor: "#f9fafb", fontSize: 14, fontFamily: "Zalando-Medium", color: "#1f2937",
  },
  inputError: { borderColor: "#ef4444" },
  errorText: { color: "#ef4444", fontSize: 12, fontFamily: "Zalando-Regular", marginTop: 4 },
  hintText: { color: "#9ca3af", fontSize: 11, fontFamily: "Zalando-Regular", marginTop: 6 },
  // CardField takes full width at fixed height
  cardField: { width: "100%", height: 48 },
  secureNotice: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
    padding: 10,
    backgroundColor: "#f9fafb",
    borderRadius: 8,
  },
  secureText: { fontSize: 11, fontFamily: "Zalando-Regular", color: "#6b7280", flex: 1 },
  footer: {
    padding: 16,
    backgroundColor: "#ffffff",
    borderTopWidth: 1,
    borderTopColor: "#f3f4f6",
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
