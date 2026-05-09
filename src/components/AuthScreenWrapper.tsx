// ============================================================
// SewaMics — Auth Screen Wrapper
// File: src/components/AuthScreenWrapper.tsx
//
// Reusable layout wrapper for Login and Signup screens.
// Matches the prototype exactly with logo, title, subtitle,
// keyboard handling, and safe area support.
// ============================================================

import React, { ReactNode } from "react";
import {
  View,
  Text,
  Image,
  ScrollView,
  KeyboardAvoidingView,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

interface AuthScreenWrapperProps {
  children: ReactNode;
  title: string;
  subtitle: string;
  onBackPress?: () => void;
  bottomText?: string;
  bottomLinkText?: string;
  onBottomLinkPress?: () => void;
}

export const AuthScreenWrapper = ({
  children,
  title,
  subtitle,
  onBackPress,
  bottomText,
  bottomLinkText,
  onBottomLinkPress,
}: AuthScreenWrapperProps) => {
  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        {/* ── a) Back Button ── */}
        {onBackPress && (
          <TouchableOpacity
            style={styles.backButton}
            onPress={onBackPress}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            activeOpacity={0.7}
          >
            <Feather name="arrow-left" size={24} color="#9d174d" />
          </TouchableOpacity>
        )}

        <ScrollView
          style={styles.flex}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* ── b) Logo Area ── */}
          <View style={[styles.logoContainer, !onBackPress && styles.logoTopMarginNoBack]}>
            <Image
              source={require("../../assets/Brand/SewaLogo.png")}
              style={styles.logo}
              resizeMode="contain"
            />
          </View>

          {/* ── c) Title ── */}
          <Text style={styles.title}>{title}</Text>

          {/* ── d) Subtitle ── */}
          <Text style={styles.subtitle}>{subtitle}</Text>

          {/* ── e) Main Content (form fields etc.) ── */}
          <View style={styles.formContainer}>
            {children}
          </View>
        </ScrollView>

        {/* ── f) Bottom Text Area ── */}
        {(bottomText || bottomLinkText) && (
          <View style={styles.bottomArea}>
            <Text style={styles.bottomText}>
              {bottomText}{" "}
              {bottomLinkText && onBottomLinkPress && (
                <Text style={styles.bottomLink} onPress={onBottomLinkPress}>
                  {bottomLinkText}
                </Text>
              )}
            </Text>
          </View>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  flex: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 100,
  },

  // ── Back Button ──
  backButton: {
    width: 36,
    height: 36,
    marginLeft: 16,
    marginTop: 8,
    justifyContent: "center",
    alignItems: "center",
  },

  // ── Logo ──
  logoContainer: {
    alignItems: "center",
    marginTop: 24,
  },
  logoTopMarginNoBack: {
    marginTop: 40,
  },
  logo: {
    width: 130,
    height: 90,
  },

  // ── Title ──
  title: {
    fontSize: 36,
    fontWeight: "900",
    color: "#1f2937",
    textAlign: "left",
    marginTop: 20,
    marginHorizontal: 16,
  },

  // ── Subtitle ──
  subtitle: {
    fontSize: 13,
    fontWeight: "400",
    color: "#6b7280",
    textAlign: "left",
    marginTop: 8,
    marginHorizontal: 16,
    maxWidth: SCREEN_WIDTH * 0.85,
    lineHeight: 13 * 1.5,
  },

  // ── Form Content ──
  formContainer: {
    paddingHorizontal: 32,
    paddingTop: 28,
  },

  // ── Bottom Text ──
  bottomArea: {
    paddingBottom: 20,
    paddingHorizontal: 16,
    alignItems: "center",
  },
  bottomText: {
    fontSize: 14,
    fontWeight: "400",
    color: "#6b7280",
    textAlign: "center",
  },
  bottomLink: {
    fontSize: 14,
    fontWeight: "600",
    color: "#9d174d",
  },
});
