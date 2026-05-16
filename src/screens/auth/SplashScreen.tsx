// ============================================================
// SewaMics — Mobile Splash Screen
// File: src/screens/auth/SplashScreen.tsx
// ============================================================

import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  Animated,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation } from "@react-navigation/native";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

export const SplashScreen = () => {
  const navigation = useNavigation<any>();
  const floatAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Floating animation logic — same as admin screen
    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: -15,
          duration: 2500,
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim, {
          toValue: 0,
          duration: 2500,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [floatAnim]);

  return (
    <View style={styles.container}>
      {/* ── CONTENT AREA ── */}
      <View style={styles.content}>
        {/* Title Text — matches weight, color, and positioning of UI spec */}
        <Text style={styles.title}>
          Sip the vibe,{"\n"}
          Sip SewaMics.
        </Text>

        {/* Animated Brand Image — Floating Effect */}
        <Animated.View
          style={[
            styles.imageContainer,
            { transform: [{ translateY: floatAnim }] },
          ]}
        >
          <Image
            source={require("../../../assets/Brand/newSplashScreen.png")}
            style={styles.image}
            resizeMode="contain"
          />
        </Animated.View>

        {/* Start Button — Pill shape with subtle shadow */}
        <TouchableOpacity
          style={styles.button}
          activeOpacity={0.85}
          onPress={() => navigation.navigate("Login")}
        >
          <Text style={styles.buttonText}>Start Here</Text>
        </TouchableOpacity>
      </View>

      {/* ── BACKGROUND GRADIENT ── */}
      <LinearGradient
        colors={["transparent", "rgba(255, 145, 77, 0.3)"]}
        style={styles.gradient}
        pointerEvents="none"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  content: {
    flex: 1,
    paddingHorizontal: 28,
    paddingTop: 80, 
    alignItems: "center", 
  },
  title: {
    alignSelf: "flex-start",
    fontSize: 48,
    fontFamily: "Zalando-Bold",
    color: "#ff914d",
    lineHeight: 46,
    letterSpacing: -1,
  },
  imageContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
  },
  image: {
    width: SCREEN_WIDTH * 0.9,
    height: SCREEN_WIDTH * 0.9,
  },
  button: {
    backgroundColor: "#ff914d",
    paddingVertical: 14,
    paddingHorizontal: 60,
    borderRadius: 30,
    marginBottom: 180, 
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  buttonText: {
    color: "#ffffff",
    fontSize: 18,
    fontFamily: "Zalando-SemiBold",
  },
  gradient: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: "30%", 
  },
});
