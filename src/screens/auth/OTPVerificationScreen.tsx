// ============================================================
// SewaMics — OTP Verification Screen
// File: src/screens/auth/OTPVerificationScreen.tsx
// ============================================================

import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Image,
  AppState,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../../context/AuthContext";
import { useNotification } from "../../context/NotificationContext";
import { Feather } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const OTPVerificationScreen = () => {
  const { verifyOTPCode, resendOTPCode, logout, user } = useAuth();
  const { showToast } = useNotification();
  const [code, setCode] = useState<string[]>(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes in seconds
  const expirationRef = useRef<number>(Date.now() + 300 * 1000);

  const inputRefs = useRef<TextInput[]>([]);

  // Load or initialize absolute expiration timestamp
  useEffect(() => {
    let isMounted = true;
    const loadExpiration = async () => {
      if (!user?.uid) return;
      try {
        const stored = await AsyncStorage.getItem(`otp_expires_${user.uid}`);
        if (stored) {
          const exp = parseInt(stored, 10);
          if (Date.now() < exp) {
            expirationRef.current = exp;
            if (isMounted) {
              setTimeLeft(Math.max(0, Math.floor((exp - Date.now()) / 1000)));
            }
            return;
          }
        }
        // Fallback / Initial: set fresh 5 minutes and store
        const freshExp = Date.now() + 300 * 1000;
        expirationRef.current = freshExp;
        await AsyncStorage.setItem(`otp_expires_${user.uid}`, freshExp.toString());
        if (isMounted) setTimeLeft(300);
      } catch (e) {
        console.error(e);
      }
    };
    
    loadExpiration();
    return () => { isMounted = false; };
  }, [user?.uid]);

  // Active tick interval & AppState listener to handle waking up
  useEffect(() => {
    const interval = setInterval(() => {
      const remaining = Math.max(0, Math.floor((expirationRef.current - Date.now()) / 1000));
      setTimeLeft(remaining);
      if (remaining <= 0) {
        clearInterval(interval);
      }
    }, 1000);

    const subscription = AppState.addEventListener("change", (nextAppState) => {
      if (nextAppState === "active") {
        const remaining = Math.max(0, Math.floor((expirationRef.current - Date.now()) / 1000));
        setTimeLeft(remaining);
      }
    });

    return () => {
      clearInterval(interval);
      subscription.remove();
    };
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleInputChange = (text: string, index: number) => {
    const numericText = text.replace(/[^0-9]/g, "");
    const newCode = [...code];
    newCode[index] = numericText;
    setCode(newCode);

    if (numericText && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === "Backspace" && !code[index] && index > 0) {
      const newCode = [...code];
      newCode[index - 1] = "";
      setCode(newCode);
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async () => {
    const enteredCode = code.join("");
    if (enteredCode.length < 6) {
      Alert.alert("Incomplete Code", "Please enter the full 6-digit authentication code.");
      return;
    }

    setLoading(true);
    try {
      const success = await verifyOTPCode(enteredCode);
      if (!success) {
        showToast("The code is incorrect or has expired. Please try again.");
      }
    } catch (err) {
      showToast("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResending(true);
    try {
      await resendOTPCode();
      const newExp = Date.now() + 300 * 1000;
      expirationRef.current = newExp;
      if (user?.uid) {
        await AsyncStorage.setItem(`otp_expires_${user.uid}`, newExp.toString());
      }
      setTimeLeft(300);
      setCode(["", "", "", "", "", ""]);
      showToast("A new 6-digit security code has been sent to your email.");
    } catch {
      showToast("Unable to send a new code. Please check your connection.");
    } finally {
      setResending(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      <KeyboardAvoidingView
        style={styles.keyboardAvoid}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={() => logout()} style={styles.cancelButton} activeOpacity={0.7}>
            <Feather name="x" size={24} color="#9d174d" />
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          <Image
            source={require("../../../assets/Brand/newSewaMicsLogo.png")}
            style={styles.logo}
            resizeMode="contain"
          />
          
          <Text style={styles.title}>2FA Verification</Text>
          <Text style={styles.subtitle}>
            We've sent a 6-digit authentication code to:{"\n"}
            <Text style={styles.emailHighlight}>{user?.email}</Text>
          </Text>

          <View style={styles.otpRow}>
            {code.map((val, idx) => (
              <TextInput
                key={idx}
                ref={(ref) => {
                  if (ref) inputRefs.current[idx] = ref;
                }}
                style={styles.otpInput}
                keyboardType="number-pad"
                maxLength={1}
                value={val}
                onChangeText={(text) => handleInputChange(text, idx)}
                onKeyPress={(e) => handleKeyPress(e, idx)}
                editable={!loading}
              />
            ))}
          </View>

          <View style={styles.timerRow}>
            <Feather name="clock" size={16} color="#ff914d" style={{ marginRight: 6 }} />
            <Text style={styles.timerText}>
              Code expires in: <Text style={styles.timeVal}>{formatTime(timeLeft)}</Text>
            </Text>
          </View>

          <TouchableOpacity
            style={[styles.verifyButton, code.join("").length < 6 && styles.verifyDisabled]}
            onPress={handleVerify}
            disabled={loading || code.join("").length < 6}
            activeOpacity={0.8}
          >
            {loading ? (
              <ActivityIndicator color="#ffffff" size="small" />
            ) : (
              <Text style={styles.verifyText}>Verify & Proceed</Text>
            )}
          </TouchableOpacity>

          <View style={styles.resendRow}>
            <Text style={styles.resendLabel}>Didn't receive the code?</Text>
            {timeLeft <= 0 ? (
              <TouchableOpacity onPress={handleResend} disabled={resending} activeOpacity={0.7}>
                <Text style={styles.resendLink}>Resend Code</Text>
              </TouchableOpacity>
            ) : (
              <Text style={styles.resendWait}>Resend in {formatTime(timeLeft)}</Text>
            )}
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#ffffff" },
  keyboardAvoid: { flex: 1 },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
  },
  cancelButton: { flexDirection: "row", alignItems: "center" },
  cancelText: {
    marginLeft: 6,
    fontSize: 15,
    fontFamily: "Zalando-Medium",
    color: "#9d174d",
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  logo: { width: 90, height: 90, marginBottom: 16 },
  title: {
    fontSize: 26,
    fontFamily: "Zalando-Bold",
    color: "#9d174d",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    fontFamily: "Zalando-Medium",
    color: "#ff914d",
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 32,
  },
  emailHighlight: { fontFamily: "Zalando-Bold", color: "#9d174d" },
  otpRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    paddingHorizontal: 8,
    marginBottom: 24,
  },
  otpInput: {
    width: 44,
    height: 52,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: "#9d174d", // Clean pink border matching brand
    textAlign: "center",
    fontSize: 20,
    fontFamily: "Zalando-Bold",
    color: "#9d174d",
    backgroundColor: "#ffffff",
  },
  timerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 32,
  },
  timerText: {
    fontSize: 14,
    fontFamily: "Zalando-Medium",
    color: "#ff914d",
  },
  timeVal: { fontFamily: "Zalando-Bold", color: "#9d174d" },
  verifyButton: {
    width: "100%",
    height: 50,
    borderRadius: 25,
    backgroundColor: "#9d174d", // Pink brand action button
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
  },
  verifyDisabled: { backgroundColor: "#fbcfe8" }, // light pink disabled state
  verifyText: {
    fontSize: 16,
    fontFamily: "Zalando-Bold",
    color: "#ffffff",
  },
  resendRow: { flexDirection: "row", alignItems: "center" },
  resendLabel: {
    fontSize: 13,
    fontFamily: "Zalando-Medium",
    color: "#ff914d",
    marginRight: 6,
  },
  resendLink: {
    fontSize: 13,
    fontFamily: "Zalando-Bold",
    color: "#9d174d",
    textDecorationLine: "underline",
  },
  resendWait: {
    fontSize: 13,
    fontFamily: "Zalando-Medium",
    color: "#9d174d",
  },
});
