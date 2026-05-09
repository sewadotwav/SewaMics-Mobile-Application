// ============================================================
// SewaMics — Login Screen
// File: src/screens/auth/LoginScreen.tsx
// ============================================================

import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Keyboard,
  Platform,
} from "react-native";
import { AntDesign, Feather } from "@expo/vector-icons";
import { AuthScreenWrapper } from "../../components/AuthScreenWrapper";
import { useAuth } from "../../context/AuthContext";

// ─── Validation Helpers ──────────────────────────────────────
const validateEmail = (email: string): string | null => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email.trim()) return "Email is required.";
  if (!emailRegex.test(email.trim())) return "Please enter a valid email address.";
  return null;
};

const validatePassword = (password: string): string | null => {
  if (!password) return "Password is required.";
  if (password.length < 8) return "Password must be at least 8 characters.";
  if (!/[A-Z]/.test(password)) return "Password must contain at least one uppercase letter.";
  if (!/[a-z]/.test(password)) return "Password must contain at least one lowercase letter.";
  if (!/[^A-Za-z0-9]/.test(password)) return "Password must contain at least one symbol.";
  return null;
};
// ─────────────────────────────────────────────────────────────

interface LoginScreenProps {
  navigation: any;
}

export const LoginScreen = ({ navigation }: LoginScreenProps) => {
  const { loginWithEmail, loginWithGoogle, error: authError, clearError } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [localLoading, setLocalLoading] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);

  const displayError = localError || authError;

  // ─── Handlers ────────────────────────────────────────────
  const handleEmailChange = useCallback((text: string) => {
    setEmail(text);
    if (localError) setLocalError(null);
    if (authError) clearError();
  }, [localError, authError, clearError]);

  const handlePasswordChange = useCallback((text: string) => {
    setPassword(text);
    if (localError) setLocalError(null);
    if (authError) clearError();
  }, [localError, authError, clearError]);

  const togglePasswordVisibility = useCallback(() => {
    setShowPassword((prev) => !prev);
  }, []);

  const handleLogin = useCallback(async () => {
    Keyboard.dismiss();

    const emailErr = validateEmail(email);
    if (emailErr) { setLocalError(emailErr); return; }

    const passErr = validatePassword(password);
    if (passErr) { setLocalError(passErr); return; }

    try {
      setLocalLoading(true);
      setLocalError(null);
      await loginWithEmail(email, password);
      // Navigation is handled automatically by RootNavigator on auth state change
    } catch {
      // Error is set in AuthContext
    } finally {
      setLocalLoading(false);
    }
  }, [email, password, loginWithEmail]);

  const handleGoogleLogin = useCallback(async () => {
    Keyboard.dismiss();
    try {
      setLocalLoading(true);
      setLocalError(null);
      await loginWithGoogle();
    } catch {
      // Error is set in AuthContext
    } finally {
      setLocalLoading(false);
    }
  }, [loginWithGoogle]);

  const handleNavigateSignup = useCallback(() => {
    navigation.navigate("Signup");
  }, [navigation]);
  // ─────────────────────────────────────────────────────────

  return (
    <AuthScreenWrapper
      title="Log In"
      subtitle="Login Now To Your Account. Access your account to manage settings, explore features."
      bottomText="Don't have an account?"
      bottomLinkText="Sign Up"
      onBottomLinkPress={handleNavigateSignup}
    >
      {/* ── a) Email Label ── */}
      <Text style={styles.label}>Email</Text>

      {/* ── b) Email Input ── */}
      <TextInput
        style={[styles.input, emailFocused && styles.inputFocused]}
        placeholder="chiyochan@gmail.com"
        placeholderTextColor="#d1d5db"
        value={email}
        onChangeText={handleEmailChange}
        keyboardType="email-address"
        autoCapitalize="none"
        autoCorrect={false}
        onFocus={() => setEmailFocused(true)}
        onBlur={() => setEmailFocused(false)}
      />

      {/* ── c) Password Label ── */}
      <Text style={[styles.label, { marginTop: 4 }]}>Password</Text>

      {/* ── d) Password Input ── */}
      <View style={[styles.passwordContainer, passwordFocused && styles.inputFocused]}>
        <TextInput
          style={styles.passwordInput}
          placeholder="••••••••"
          placeholderTextColor="#d1d5db"
          value={password}
          onChangeText={handlePasswordChange}
          secureTextEntry={!showPassword}
          autoCapitalize="none"
          autoCorrect={false}
          onFocus={() => setPasswordFocused(true)}
          onBlur={() => setPasswordFocused(false)}
        />
        <TouchableOpacity
          onPress={togglePasswordVisibility}
          style={styles.eyeButton}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Feather
            name={showPassword ? "eye" : "eye-off"}
            size={24}
            color="#9ca3af"
          />
        </TouchableOpacity>
      </View>

      {/* ── e) Remember Me ── */}
      <TouchableOpacity
        style={styles.rememberLeft}
        onPress={() => setRememberMe((prev) => !prev)}
        activeOpacity={0.7}
      >
        {/* Circle radio-style checkbox */}
        <View style={[styles.radioOuter, rememberMe && styles.radioOuterChecked]}>
          {rememberMe && <View style={styles.radioInner} />}
        </View>
        <Text style={styles.rememberText}>Remember me</Text>
      </TouchableOpacity>

      {/* ── f) Error Message ── */}
      {displayError ? (
        <Text style={styles.errorText}>{displayError}</Text>
      ) : null}

      {/* ── g) Login Button ── */}
      <TouchableOpacity
        style={[styles.loginButton, localLoading && styles.buttonDisabled]}
        onPress={handleLogin}
        disabled={localLoading}
        activeOpacity={0.85}
      >
        {localLoading ? (
          <ActivityIndicator color="#ffffff" size="small" />
        ) : (
          <Text style={styles.loginButtonText}>Login</Text>
        )}
      </TouchableOpacity>

      {/* ── h) OR Divider ── */}
      <View style={styles.dividerRow}>
        <View style={styles.dividerLine} />
        <Text style={styles.dividerText}>OR</Text>
        <View style={styles.dividerLine} />
      </View>

      {/* ── i) Google Button ── */}
      <TouchableOpacity
        style={styles.googleButton}
        onPress={handleGoogleLogin}
        activeOpacity={0.85}
        disabled={localLoading}
      >
        <AntDesign name="google" size={20} color="#EA4335" />
        <Text style={styles.googleButtonText}>Sign in with Google</Text>
      </TouchableOpacity>
    </AuthScreenWrapper>
  );
};

// ─── Styles ──────────────────────────────────────────────────
const styles = StyleSheet.create({
  label: {
    fontSize: 13,
    fontFamily: "Zalando-Medium", // 500
    color: "#1f2937",
    marginBottom: 8,
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    fontFamily: "Zalando-Regular", // 400
    color: "#1f2937",
    backgroundColor: "#ffffff",
    marginBottom: 16,
  },
  inputFocused: {
    borderColor: "#9d174d",
    borderWidth: 2,
  },
  passwordContainer: {
    height: 48,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 20,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    backgroundColor: "#ffffff",
    marginBottom: 12,
  },
  passwordInput: {
    flex: 1,
    fontSize: 16,
    fontFamily: "Zalando-Regular", // 400
    color: "#1f2937",
    height: "100%",
  },
  eyeButton: {
    padding: 4,
  },

  // ── Remember Me ──
  rememberLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 20,
  },
  radioOuter: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 1.5,
    borderColor: "#d1d5db",
    backgroundColor: "#ffffff",
    justifyContent: "center",
    alignItems: "center",
  },
  radioOuterChecked: {
    borderColor: "#9d174d",
    backgroundColor: "#9d174d",
  },
  radioInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#ffffff",
  },
  rememberText: {
    fontSize: 13,
    fontFamily: "Zalando-Light", // 300
    color: "#1f2937",
  },

  // ── Error ──
  errorText: {
    fontSize: 13,
    fontFamily: "Zalando-Regular", // 400
    color: "#ef4444",
    marginBottom: 12,
  },

  // ── Login Button ──
  loginButton: {
    height: 48,
    backgroundColor: "#9d174d",
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  loginButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontFamily: "Zalando-SemiBold", // 600
  },

  // ── OR Divider ──
  dividerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 8,
    marginBottom: 16,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#e5e7eb",
  },
  dividerText: {
    fontSize: 12,
    fontFamily: "Zalando-Light", // 300
    color: "#9ca3af",
    marginHorizontal: 12,
  },

  // ── Google Button ──
  googleButton: {
    height: 48,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 16,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#ffffff",
    gap: 8,
  },
  googleButtonText: {
    fontSize: 16,
    fontFamily: "Zalando-Medium", // 500
    color: "#1f2937",
  },
});
