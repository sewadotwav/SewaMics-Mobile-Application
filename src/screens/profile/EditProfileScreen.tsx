// ============================================================
// SewaMics — Edit Profile Screen
// File: src/screens/profile/EditProfileScreen.tsx
// ============================================================

import React, { useState, useEffect } from "react";
import {
  View, Text, StyleSheet, ScrollView, TextInput,
  TouchableOpacity, ActivityIndicator, Modal,
  KeyboardAvoidingView, Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { updateProfile } from "firebase/auth";
import { useAuth } from "../../context/AuthContext";
import { getUserProfile, updateUserProfile } from "../../services/userService";
import { getErrorMessage } from "../../utils/errorHandler";
import { useNotification } from "../../context/NotificationContext";
import { LoadingScreen } from "../../components/common/LoadingScreen";
import { CTAButton } from "../../components/common/CTAButton";
import { getUserAddresses, addAddress, updateAddress, deleteAddress, Address } from "../../services/addressService";
import { AddressForm } from "../../components/common/AddressForm";

interface EditProfileScreenProps {
  navigation: any;
}

export const EditProfileScreen = ({ navigation }: EditProfileScreenProps) => {
  const { user, updateAuthProfile } = useAuth();
  const { showToast, showAlert } = useNotification();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formVisible, setFormVisible] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | undefined>(undefined);

  useEffect(() => {
    fetchProfile();
  }, [user]);
  
  const fetchProfile = async () => {
    if (!user?.uid) return;
    try {
      setLoading(true);
      const profile = await getUserProfile(user.uid);
      if (profile) {
        setName((profile as any).name || "");
        setPhone((profile as any).phone || "");
      }
      const addrs = await getUserAddresses(user.uid);
      setAddresses(addrs);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!user?.uid) return;
    try {
      setSaving(true);
      await updateUserProfile(user.uid, {
        name: name.trim(),
        phone: phone.trim(),
      });
      // Synchronize changes to Firebase Auth and trigger instant global state updates
      if (updateAuthProfile) {
        await updateAuthProfile(name.trim());
      } else {
        await updateProfile(user, { displayName: name.trim() });
      }
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

  const handleSaveAddress = async (addr: Address) => {
    if (!user?.uid) return;
    try {
      if (editingAddress) {
        await updateAddress(user.uid, addr.id, addr);
      } else {
        await addAddress(user.uid, addr);
      }
      setFormVisible(false);
      const updated = await getUserAddresses(user.uid);
      setAddresses(updated);
      showToast("Address saved successfully!");
    } catch (error) {
      console.error("Error saving address", error);
    }
  };

  const handleDeleteAddress = async (addrId: string) => {
    if (!user?.uid) return;
    try {
      await deleteAddress(user.uid, addrId);
      const updated = await getUserAddresses(user.uid);
      setAddresses(updated);
      showToast("Address deleted successfully!");
    } catch (error) {
      console.error("Error deleting address", error);
    }
  };

  const handleSetDefault = async (addr: Address) => {
    if (!user?.uid) return;
    try {
      await updateAddress(user.uid, addr.id, { ...addr, isDefault: true });
      const updated = await getUserAddresses(user.uid);
      setAddresses(updated);
      showToast("Default address updated!");
    } catch (error) {
      console.error("Error setting default address", error);
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
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 40 }}
        >
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>Account Info</Text>
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
            <View style={styles.fieldRow}>
              <Feather name="phone" size={18} color="#9ca3af" style={styles.fieldIcon} />
              <View style={styles.fieldContent}>
                <Text style={styles.fieldLabel}>Phone number</Text>
                <TextInput
                  style={styles.fieldInput}
                  value={phone}
                  onChangeText={setPhone}
                  placeholder="+63 900 000 0000"
                  placeholderTextColor="#9ca3af"
                  keyboardType="phone-pad"
                />
              </View>
            </View>
          </View>

          {/* Address Management Section */}
          <View style={styles.addressSection}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Saved Addresses</Text>
              <TouchableOpacity onPress={() => { setEditingAddress(undefined); setFormVisible(true); }}>
                <Text style={styles.addText}>+ Add New</Text>
              </TouchableOpacity>
            </View>

            {addresses.length === 0 ? (
              <View style={styles.emptyAddress}>
                <Text style={styles.emptyText}>No addresses saved yet</Text>
              </View>
            ) : (
              addresses.map((addr) => (
                <View key={addr.id} style={styles.addressCard}>
                  <View style={styles.addressHeader}>
                    <View style={styles.addressLabelRow}>
                      <Text style={styles.addressLabelName}>{addr.label || "Address"}</Text>
                      {addr.isDefault && (
                        <View style={styles.defaultBadge}>
                          <Text style={styles.defaultBadgeText}>DEFAULT</Text>
                        </View>
                      )}
                    </View>
                    <View style={styles.addressActions}>
                      <TouchableOpacity onPress={() => { setEditingAddress(addr); setFormVisible(true); }}>
                        <Feather name="edit-2" size={16} color="#9d174d" />
                      </TouchableOpacity>
                      <TouchableOpacity onPress={() => handleDeleteAddress(addr.id)} style={{ marginLeft: 16 }}>
                        <Feather name="trash-2" size={16} color="#ff914d" />
                      </TouchableOpacity>
                    </View>
                  </View>
                  <Text style={styles.addressStreet}>{addr.street}</Text>
                  <Text style={styles.addressCity}>{addr.city}, {addr.province} {addr.postalCode}</Text>
                  {!addr.isDefault && (
                    <TouchableOpacity style={styles.setDefaultBtn} onPress={() => handleSetDefault(addr)}>
                      <Text style={styles.setDefaultText}>Set as Default</Text>
                    </TouchableOpacity>
                  )}
                </View>
              ))
            )}
          </View>

          {/* Update Profile Button */}
          <CTAButton
            title="Update Profile"
            icon="check"
            onPress={handleSaveProfile}
            loading={saving}
            style={{ marginTop: 24 }}
          />

          <TouchableOpacity 
            style={styles.cancelLink} 
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.cancelLinkText}>Cancel</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>

      <Modal visible={formVisible} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <AddressForm
              address={editingAddress}
              isFirstAddress={addresses.length === 0}
              onSave={handleSaveAddress}
              onCancel={() => setFormVisible(false)}
            />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#ffffff" },
  header: {
    height: 56, flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: 16, borderBottomWidth: 1, borderBottomColor: "#e5e7eb", backgroundColor: "#ffffff",
  },
  backButton: { width: 40, alignItems: "flex-start" },
  headerTitle: { fontSize: 18, fontFamily: "Zalando-Bold", color: "#9d174d" },
  headerRight: { width: 40 },

  card: { marginTop: 24, borderRadius: 20, borderWidth: 1, borderColor: "#e5e7eb", backgroundColor: "#ffffff", overflow: "hidden" },
  cardHeader: { paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: "#e5e7eb" },
  cardTitle: { fontSize: 16, fontFamily: "Zalando-Bold", color: "#9d174d" },

  fieldRow: { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingVertical: 12, minHeight: 60 },
  rowBorder: { borderBottomWidth: 1, borderBottomColor: "#e5e7eb" },
  fieldIcon: { marginRight: 12, marginTop: 4 },
  fieldContent: { flex: 1 },
  fieldLabel: { fontSize: 12, fontFamily: "Zalando-Medium", color: "#6b7280", marginBottom: 2 },
  fieldInput: { fontSize: 14, fontFamily: "Zalando-Regular", color: "#1f2937", padding: 0 },

  addressSection: { marginTop: 32 },
  sectionHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 },
  sectionTitle: { fontSize: 16, fontFamily: "Zalando-Bold", color: "#9d174d" },
  addText: { fontSize: 13, fontFamily: "Zalando-Bold", color: "#ff914d" },
  emptyAddress: { padding: 24, backgroundColor: "#ffffff", borderRadius: 12, borderStyle: "dashed", borderWidth: 1, borderColor: "#d1d5db", alignItems: "center" },
  emptyText: { fontSize: 13, fontFamily: "Zalando-Medium", color: "#9ca3af" },
  addressCard: { backgroundColor: "#ffffff", padding: 16, borderRadius: 16, borderWidth: 1, borderColor: "#e5e7eb", marginBottom: 12 },
  addressHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 },
  addressLabelRow: { flexDirection: "row", alignItems: "center" },
  addressLabelName: { fontSize: 14, fontFamily: "Zalando-Bold", color: "#1f2937", marginRight: 8 },
  defaultBadge: { backgroundColor: "#9d174d", paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  defaultBadgeText: { fontSize: 9, fontFamily: "Zalando-Bold", color: "#ffffff" },
  addressActions: { flexDirection: "row", alignItems: "center" },
  addressStreet: { fontSize: 13, fontFamily: "Zalando-Medium", color: "#1f2937", marginBottom: 2 },
  addressCity: { fontSize: 12, fontFamily: "Zalando-Regular", color: "#6b7280" },
  setDefaultBtn: { marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: "#f3f4f6" },
  setDefaultText: { fontSize: 12, fontFamily: "Zalando-Bold", color: "#9d174d" },
  
  cancelLink: { marginTop: 16, alignItems: "center", padding: 12 },
  cancelLinkText: { fontSize: 14, fontFamily: "Zalando-SemiBold", color: "#6b7280" },
  
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" },
  modalContent: { backgroundColor: "#ffffff", borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, paddingBottom: 40 },
});
