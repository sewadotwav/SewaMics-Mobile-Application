import React, { useEffect, useRef } from "react";
import { TouchableOpacity, Image, StyleSheet, Animated } from "react-native";
import { useNavigation } from "@react-navigation/native";

export const FloatingMascotBubble = () => {
  const navigation = useNavigation<any>();
  const bounceAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const startBounce = () => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(bounceAnim, {
            toValue: -8, // Jump up 8px
            duration: 1200,
            useNativeDriver: true,
          }),
          Animated.timing(bounceAnim, {
            toValue: 0, // Fall back down
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    };
    startBounce();
  }, [bounceAnim]);

  return (
    <Animated.View style={[styles.container, { transform: [{ translateY: bounceAnim }] }]}>
      <TouchableOpacity
        activeOpacity={0.8}
        style={styles.bubble}
        onPress={() => navigation.navigate("Chatbot")}
      >
        <Image
          source={require("../../../assets/Brand/SewaMicsClay.png")}
          style={styles.image}
          resizeMode="cover"
        />
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 24,
    right: 16,
    zIndex: 9999,
  },
  bubble: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#ffffff",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#fa955d", // Brand tangerine orange highlight
  },
  image: {
    width: 52,
    height: 52,
    borderRadius: 26,
  },
});
