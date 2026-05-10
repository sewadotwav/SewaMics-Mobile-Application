// ============================================================
// SewaMics — Toast Notification
// File: src/components/common/Toast.tsx
// ============================================================

import React, { useEffect } from "react";
import { View, Text, StyleSheet, Animated } from "react-native";
import { Feather } from "@expo/vector-icons";

interface ToastProps {
  visible: boolean;
  message: string;
  onHide: () => void;
  duration?: number;
}

export const Toast = ({ visible, message, onHide, duration = 2000 }: ToastProps) => {
  const opacity = React.useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.delay(duration),
        Animated.timing(opacity, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start(() => {
        onHide();
      });
    }
  }, [visible]);

  if (!visible) return null;

  return (
    <Animated.View style={[styles.container, { opacity }]}>
      <View style={styles.content}>
        <Feather name="check-circle" size={18} color="#9d174d" style={{ marginRight: 8 }} />
        <Text style={styles.message}>{message}</Text>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 120, // above sticky bar
    left: 20,
    right: 20,
    alignItems: "center",
    zIndex: 9999,
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(243, 244, 246, 0.95)", // Light gray opaque
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 30,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 8,
  },
  message: {
    fontSize: 14,
    fontFamily: "Zalando-SemiBold",
    color: "#9d174d", // Purple
  },
});
