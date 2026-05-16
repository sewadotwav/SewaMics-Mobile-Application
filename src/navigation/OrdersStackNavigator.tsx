import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { OrdersStackParamList } from "./types";
import { OrdersScreen } from "../screens/orders/OrdersScreen";
import { OrderDetailScreen } from "../screens/orders/OrderDetailScreen";

const Stack = createNativeStackNavigator<OrdersStackParamList>();

export const OrdersStackNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: "slide_from_right",
        contentStyle: { backgroundColor: "#ffffff" },
      }}
    >
      <Stack.Screen name="Orders" component={OrdersScreen} />
      <Stack.Screen name="OrderDetail" component={OrderDetailScreen} />
    </Stack.Navigator>
  );
};
