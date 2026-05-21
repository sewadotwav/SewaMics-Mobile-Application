import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { CheckoutStackParamList } from "./types";
import { CheckoutScreen } from "../screens/checkout/CheckoutScreen";
import { OrderConfirmationScreen } from "../screens/checkout/OrderConfirmationScreen";

const Stack = createNativeStackNavigator<CheckoutStackParamList>();

export const CheckoutStackNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: "slide_from_right",
        gestureEnabled: false,
        contentStyle: { backgroundColor: "#ffffff" },
      }}
    >
      <Stack.Screen name="Checkout" component={CheckoutScreen} initialParams={{ step: "shipping" }} />
      <Stack.Screen name="OrderConfirmation" component={OrderConfirmationScreen} />
    </Stack.Navigator>
  );
};
