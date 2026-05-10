// ============================================================
// SewaMics — Edit Profile Screen (No Dark Mode)
// File: src/screens/profile/EditProfileScreen.tsx
// ============================================================

import React, { useState, useEffect } from "react";
import {
  View, Text, StyleSheet, ScrollView, TextInput,
  TouchableOpacity, ActivityIndicator, Alert,
  KeyboardAvoidingView, Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { useAuth } from "../../context/AuthContext";
import { getUserProfile, updateUserProfile } from "../../services/userService";
import { getErrorMessage } from "../../utils/errorHandler";
import { useNotification } from "../../context/NotificationContext";
import { LoadingScreen } from "../../components/common/LoadingScreen";
import { CTAButton } from "../../components/common/CTAButton";

interface EditProfileScreenProps {
  navigation: any;
}

export const EditProfileScreen = ({ navigation }: EditProfileScreenProps) => {
  const { user } = useAuth();
  const { showToast, showAlert } = useNotification();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const fetch = async () => {
      if (!user?.uid) return;
      try {
        const profile = await getUserProfile(user.uid);
        if (isMounted && profile) {
          setName((profile as any).name || "");
          setPhone((profile as any).phone || "");
          setAddress((profile as any).addresses?.[0]?.street || "");
        }
      } catch (err) {
        console.error(err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetch();
    return () => { isMounted = false; };
  }, [user]);

  const handleSave = async () => {
    if (!user?.uid) return;
    try {
      setSaving(true);
      await updateUserProfile(user.uid, {
        name: name.trim(),
        phone: phone.trim(),
        addresses: address.trim() ? [{ street: address.trim(), city: "", state: "", zip: "", country: "" }] : [],
      } as any);
      
      showToast("Profile updated successfully!");
      navigation.goBack();
    } catch (err: any) {
      showAlert({
        title: "Error",
        message: getErrorMessage(err),
        confirmText: "OK",
        onConfirm: () => {},
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <LoadingScreen message="Fetching profile details..." />;
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} activeOpacity={0.7} style={styles.backButton}>
          <Feather name="arrow-left" size={22} color="#9d174d" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Profile</Text>
        <View style={styles.headerRight} />
      </View>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : "height"}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 10 }}
        >
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>Enter your complete details</Text>
            </View>

            {/* Name */}
            <View style={[styles.fieldRow, styles.rowBorder]}>
              <Feather name="user" size={18} color="#9ca3af" style={styles.fieldIcon} />
              <View style={styles.fieldContent}>
                <Text style={styles.fieldLabel}>Name</Text>
                <TextInput
                  style={styles.fieldInput}
                  value={name}
                  onChangeText={setName}
                  placeholder="Your full name"
                  placeholderTextColor="#9ca3af"
                  returnKeyType="next"
                />
              </View>
            </View>

            {/* Email — read-only */}
            <View style={[styles.fieldRow, styles.rowBorder]}>
              <Feather name="mail" size={18} color="#9ca3af" style={styles.fieldIcon} />
              <View style={styles.fieldContent}>
                <Text style={styles.fieldLabel}>E-mail</Text>
                <Text style={[styles.fieldInput, { color: "#9ca3af" }]}>{user?.email || ""}</Text>
              </View>
            </View>

            {/* Phone */}
            <View style={[styles.fieldRow, styles.rowBorder]}>
              <Feather name="phone" size={18} color="#9ca3af" style={styles.fieldIcon} />
              <View style={styles.fieldContent}>
                <Text style={styles.fieldLabel}>Phone number</Text>
                <TextInput
                  style={styles.fieldInput}
                  value={phone}
                  onChangeText={setPhone}
                  placeholder="+1 555 000 0000"
                  placeholderTextColor="#9ca3af"
                  keyboardType="phone-pad"
                  returnKeyType="next"
                />
              </View>
            </View>

            {/* Address */}
            <View style={styles.fieldRow}>
              <Feather name="home" size={18} color="#9ca3af" style={styles.fieldIcon} />
              <View style={styles.fieldContent}>
                <Text style={styles.fieldLabel}>Home address</Text>
                <TextInput
                  style={styles.fieldInput}
                  value={address}
                  onChangeText={setAddress}
                  placeholder="Enter your full address"
                  placeholderTextColor="#9ca3af"
                  returnKeyType="done"
                />
              </View>
            </View>
          </View>

          {/* Save */}
          <CTAButton
            title="Save Changes"
            icon="check"
            onPress={handleSave}
            loading={saving}
            style={{ marginTop: 24 }}
          />

          {/* Cancel */}
          <CTAButton
            title="Cancel"
            variant="secondary"
            onPress={() => navigation.goBack()}
            style={{ marginTop: 12 }}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#ffffff" },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#ffffff" },

  header: {
    height: 56, flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: 16, borderBottomWidth: 1, borderBottomColor: "#e5e7eb", backgroundColor: "#ffffff",
  },
  backButton: { width: 40, alignItems: "flex-start" },
  headerTitle: { fontSize: 18, fontFamily: "Zalando-SemiBold", color: "#1f2937", letterSpacing: -0.3 },
  headerRight: { width: 40 },

  card: { marginTop: 24, borderRadius: 20, borderWidth: 1, borderColor: "#e5e7eb", backgroundColor: "#f9fafb", overflow: "hidden" },
  cardHeader: { paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: "#e5e7eb" },
  cardTitle: { fontSize: 16, fontFamily: "Zalando-Bold", color: "#1f2937" },

  fieldRow: { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingVertical: 12, minHeight: 60 },
  rowBorder: { borderBottomWidth: 1, borderBottomColor: "#e5e7eb" },
  fieldIcon: { marginRight: 12, marginTop: 4 },
  fieldContent: { flex: 1 },
  fieldLabel: { fontSize: 12, fontFamily: "Zalando-Light", color: "#6b7280", marginBottom: 2 },
  fieldInput: { fontSize: 14, fontFamily: "Zalando-Regular", color: "#1f2937", padding: 0 },
});
