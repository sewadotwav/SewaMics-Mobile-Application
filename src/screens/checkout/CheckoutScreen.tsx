import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Platform, KeyboardAvoidingView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, useRoute } from "@react-navigation/native";
import { Feather } from "@expo/vector-icons";
import { ShippingStep } from "./ShippingStep";
import { PaymentStep } from "./PaymentStep";
import { ReviewStep } from "./ReviewStep";

export interface CheckoutData {
  selectedAddress: any;
  paymentMethod: string;
  cardDetails: any;
  paymentMethodId: string | null;
  clientSecret: string | null;
  selectedItems?: string[];
}

export const CheckoutScreen = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  
  const [currentStep, setCurrentStep] = useState<"shipping" | "payment" | "review">(route.params?.step || "shipping");
  const [checkoutData, setCheckoutData] = useState<CheckoutData>({
    selectedAddress: null,
    paymentMethod: "credit_card",
    cardDetails: null,
    paymentMethodId: null,
    clientSecret: null,
    selectedItems: route.params?.selectedItems || [],
  });

  const steps = [
    { id: "shipping", title: "Shipping", number: 1 },
    { id: "payment", title: "Payment", number: 2 },
    { id: "review", title: "Review", number: 3 },
  ];

  const getStepIndex = (stepId: string) => steps.findIndex((s) => s.id === stepId);
  const currentIndex = getStepIndex(currentStep);

  const renderStepIndicators = () => {
    return (
      <View style={styles.stepContainer}>
        {steps.map((step, index) => {
          const isComplete = index < currentIndex;
          const isCurrent = index === currentIndex;
          const isLast = index === steps.length - 1;

          return (
            <React.Fragment key={step.id}>
              <View style={styles.stepItem}>
                <View
                  style={[
                    styles.stepCircle,
                    isComplete && styles.stepCircleComplete,
                    isCurrent && styles.stepCircleCurrent,
                    !isComplete && !isCurrent && styles.stepCircleIncomplete,
                  ]}
                >
                  {isComplete ? (
                    <Feather name="check" size={12} color="#ffffff" />
                  ) : (
                    <Text
                      style={[
                        styles.stepNumber,
                        (isCurrent || isComplete) && styles.stepNumberActive,
                      ]}
                    >
                      {step.number}
                    </Text>
                  )}
                </View>
                <Text
                  style={[
                    styles.stepTitle,
                    isCurrent && styles.stepTitleCurrent,
                    isComplete && styles.stepTitleComplete,
                  ]}
                >
                  {step.title}
                </Text>
              </View>

              {!isLast && (
                <View
                  style={[
                    styles.stepConnector,
                    isComplete && styles.stepConnectorComplete,
                  ]}
                />
              )}
            </React.Fragment>
          );
        })}
      </View>
    );
  };

  const updateCheckoutData = (updates: Partial<CheckoutData>) => {
    setCheckoutData((prev) => ({ ...prev, ...updates }));
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <KeyboardAvoidingView 
        style={{ flex: 1 }} 
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        {/* HEADER */}
        <View style={styles.header}>
          <View style={styles.headerLeft} />
          <Text style={styles.headerTitle}>Checkout</Text>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerRight} activeOpacity={0.7}>
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
        </View>

        {/* STEP INDICATORS */}
        {renderStepIndicators()}

        {/* DYNAMIC CONTENT */}
        <View style={styles.content}>
          {currentStep === "shipping" && (
            <ShippingStep
              checkoutData={checkoutData}
              updateCheckoutData={updateCheckoutData}
              updateCurrentStep={setCurrentStep}
            />
          )}
          {currentStep === "payment" && (
            <PaymentStep
              checkoutData={checkoutData}
              updateCheckoutData={updateCheckoutData}
              updateCurrentStep={setCurrentStep}
            />
          )}
          {currentStep === "review" && (
            <ReviewStep
              checkoutData={checkoutData}
              updateCheckoutData={updateCheckoutData}
              updateCurrentStep={setCurrentStep}
            />
          )}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  header: {
    flexDirection: "row",
    height: 56,
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
  },
  headerLeft: {
    flex: 1,
  },
  headerTitle: {
    flex: 2,
    textAlign: "center",
    fontSize: 18,
    fontFamily: "Zalando-Bold",
    color: "#9d174d",
  },
  headerRight: {
    flex: 1,
    alignItems: "flex-end",
  },
  cancelText: {
    fontSize: 14,
    fontFamily: "Zalando-Medium",
    color: "#4b5563",
  },
  stepContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    paddingHorizontal: 24,
    backgroundColor: "#ffffff",
  },
  stepItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  stepCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 6,
  },
  stepCircleComplete: {
    backgroundColor: "#9d174d",
  },
  stepCircleCurrent: {
    backgroundColor: "#9d174d",
  },
  stepCircleIncomplete: {
    backgroundColor: "#e5e7eb",
  },
  stepNumber: {
    fontSize: 12,
    fontFamily: "Zalando-Bold",
    color: "#6b7280",
  },
  stepNumberActive: {
    color: "#ffffff",
  },
  stepTitle: {
    fontSize: 13,
    fontFamily: "Zalando-Medium",
    color: "#6b7280",
  },
  stepTitleCurrent: {
    color: "#9d174d",
    fontFamily: "Zalando-SemiBold",
  },
  stepTitleComplete: {
    color: "#9d174d",
  },
  stepConnector: {
    flex: 1,
    height: 1,
    backgroundColor: "#e5e7eb",
    marginHorizontal: 12,
  },
  stepConnectorComplete: {
    backgroundColor: "#9d174d",
    height: 1,
  },
  content: {
    flex: 1,
  },
});
