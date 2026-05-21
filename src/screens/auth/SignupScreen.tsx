import React, { useState, useCallback, useMemo } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Keyboard,
} from "react-native";
import { AntDesign, Feather } from "@expo/vector-icons";
import { AuthScreenWrapper } from "../../components/AuthScreenWrapper";
import { useAuth } from "../../context/AuthContext";

// ─── Validation Helpers ──────────────────────────────────────
const validateName = (name: string): string | null => {
  if (!name.trim()) return "Full name is required.";
  if (name.trim().length < 2) return "Name must be at least 2 characters.";
  return null;
};

const validateEmail = (email: string): string | null => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email.trim()) return "Email is required.";
  if (!emailRegex.test(email.trim())) return "Please enter a valid email address.";
  return null;
};

const validatePassword = (password: string): string | null => {
  if (!password) return "Password is required.";
  if (password.length < 6) return "Password must be at least 6 characters.";


  return null;
};
// ─────────────────────────────────────────────────────────────

interface SignupScreenProps {
  navigation: any;
}

export const SignupScreen = ({ navigation }: SignupScreenProps) => {
  const { signupWithEmail, loginWithGoogle, error: authError, clearError } = useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  
  const [localLoading, setLocalLoading] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);


  const [nameFocused, setNameFocused] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [confirmPasswordFocused, setConfirmPasswordFocused] = useState(false);

  const displayError = localError || authError;


  const passwordsMatch = useMemo(() => {
    return password.length > 0 && confirmPassword.length > 0 && password === confirmPassword;
  }, [password, confirmPassword]);


  const clearErrors = useCallback(() => {
    if (localError) setLocalError(null);
    if (authError) clearError();
  }, [localError, authError, clearError]);

  const handleSignup = useCallback(async () => {
    Keyboard.dismiss();

    const nameErr = validateName(name);
    if (nameErr) { setLocalError(nameErr); return; }

    const emailErr = validateEmail(email);
    if (emailErr) { setLocalError(emailErr); return; }

    const passErr = validatePassword(password);
    if (passErr) { setLocalError(passErr); return; }

    if (!passwordsMatch) {
      setLocalError("Passwords do not match.");
      return;
    }

    try {
      setLocalLoading(true);
      setLocalError(null);
      await signupWithEmail(email, password, name);

    } catch {

    } finally {
      setLocalLoading(false);
    }
  }, [name, email, password, passwordsMatch, signupWithEmail]);

  const handleGoogleSignup = useCallback(async () => {
    Keyboard.dismiss();
    try {
      setLocalLoading(true);
      setLocalError(null);
      await loginWithGoogle();
    } catch {

    } finally {
      setLocalLoading(false);
    }
  }, [loginWithGoogle]);

  const handleNavigateLogin = useCallback(() => {
    navigation.navigate("Login");
  }, [navigation]);



  return (
    <AuthScreenWrapper
      title="Sign Up"
      subtitle="Sign Up To Your Account. Create your account to start shopping and save favorites."
      bottomText="Already have an account?"
      bottomLinkText="Login"
      onBottomLinkPress={handleNavigateLogin}
    >
      {/* ── a) Full Name ── */}
      <Text style={styles.label}>Full Name</Text>
      <TextInput
        style={[styles.input, nameFocused && styles.inputFocused]}
        placeholder="Chiyo Chan"
        placeholderTextColor="#d1d5db"
        value={name}
        onChangeText={(text) => { setName(text); clearErrors(); }}
        autoCapitalize="words"
        autoCorrect={false}
        onFocus={() => setNameFocused(true)}
        onBlur={() => setNameFocused(false)}
      />

      {/* ── b) Email ── */}
      <Text style={styles.label}>Email</Text>
      <TextInput
        style={[styles.input, emailFocused && styles.inputFocused]}
        placeholder="chiyochan@gmail.com"
        placeholderTextColor="#d1d5db"
        value={email}
        onChangeText={(text) => { setEmail(text); clearErrors(); }}
        keyboardType="email-address"
        autoCapitalize="none"
        autoCorrect={false}
        onFocus={() => setEmailFocused(true)}
        onBlur={() => setEmailFocused(false)}
      />

      {/* ── c) Password ── */}
      <Text style={styles.label}>Password</Text>
      <View style={[styles.passwordContainer, passwordFocused && styles.inputFocused]}>
        <TextInput
          style={styles.passwordInput}
          placeholder="••••••••"
          placeholderTextColor="#d1d5db"
          value={password}
          onChangeText={(text) => { setPassword(text); clearErrors(); }}
          secureTextEntry={!showPassword}
          autoCapitalize="none"
          autoCorrect={false}
          onFocus={() => setPasswordFocused(true)}
          onBlur={() => setPasswordFocused(false)}
        />
        <TouchableOpacity
          onPress={() => setShowPassword(!showPassword)}
          style={styles.eyeButton}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Feather
            name={showPassword ? "eye" : "eye-off"}
            size={20}
            color="#9ca3af"
          />
        </TouchableOpacity>
      </View>

      {/* ── d) Confirm Password & Validation ── */}
      <Text style={styles.label}>Confirm Password</Text>
      <View style={[styles.passwordContainer, confirmPasswordFocused && styles.inputFocused, { marginBottom: 12 }]}>
        <TextInput
          style={styles.passwordInput}
          placeholder="••••••••"
          placeholderTextColor="#d1d5db"
          value={confirmPassword}
          onChangeText={(text) => { setConfirmPassword(text); clearErrors(); }}
          secureTextEntry={!showConfirmPassword}
          autoCapitalize="none"
          autoCorrect={false}
          onFocus={() => setConfirmPasswordFocused(true)}
          onBlur={() => setConfirmPasswordFocused(false)}
        />
        
        {/* Right side match validation */}
        {confirmPassword.length > 0 && (
          <View style={styles.validationIndicator}>
            {passwordsMatch ? (
              <>
                <Feather name="check" size={14} color="#9d174d" />
                <Text style={styles.matchTextValid}>Passwords match</Text>
              </>
            ) : (
              <>
                <Feather name="x" size={14} color="#ff914d" />
                <Text style={styles.matchTextInvalid}>Passwords don't match</Text>
              </>
            )}
          </View>
        )}
        
        <TouchableOpacity
          onPress={() => setShowConfirmPassword(!showConfirmPassword)}
          style={styles.eyeButton}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Feather
            name={showConfirmPassword ? "eye" : "eye-off"}
            size={20}
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
        <View style={[styles.radioOuter, rememberMe && styles.radioOuterChecked]}>
          {rememberMe && <View style={styles.radioInner} />}
        </View>
        <Text style={styles.rememberText}>Remember me</Text>
      </TouchableOpacity>

      {/* ── f) Error Message ── */}
      {displayError ? (
        <Text style={styles.errorText}>{displayError}</Text>
      ) : null}

      {/* ── g) Sign Up Button ── */}
      <TouchableOpacity
        style={[styles.signupButton, localLoading && styles.buttonDisabled]}
        onPress={handleSignup}
        disabled={localLoading}
        activeOpacity={0.85}
      >
        {localLoading ? (
          <ActivityIndicator color="#ffffff" size="small" />
        ) : (
          <Text style={styles.signupButtonText}>Sign Up</Text>
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
        onPress={handleGoogleSignup}
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
    fontFamily: "Zalando-Medium",
    color: "#9d174d",
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
    fontFamily: "Zalando-Regular",
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
    marginBottom: 16,
  },
  passwordInput: {
    flex: 1,
    fontSize: 16,
    fontFamily: "Zalando-Regular",
    color: "#1f2937",
    height: "100%",
  },
  eyeButton: {
    padding: 4,
    marginLeft: 4,
  },


  validationIndicator: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 8,
    gap: 4,
  },
  matchTextValid: {
    fontSize: 12,
    color: "#9d174d",
    fontFamily: "Zalando-Medium",
  },
  matchTextInvalid: {
    fontSize: 12,
    color: "#ff914d",
    fontFamily: "Zalando-Medium",
  },


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
    fontFamily: "Zalando-Light",
    color: "#1f2937",
  },


  errorText: {
    fontSize: 13,
    fontFamily: "Zalando-Regular",
    color: "#ef4444",
    marginBottom: 12,
  },


  signupButton: {
    height: 48,
    backgroundColor: "#9d174d",
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  signupButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontFamily: "Zalando-SemiBold",
  },


  dividerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#e5e7eb",
  },
  dividerText: {
    fontSize: 12,
    fontFamily: "Zalando-Light",
    color: "#9ca3af",
    marginHorizontal: 12,
  },


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
    fontFamily: "Zalando-Medium",
    color: "#1f2937",
  },
});
