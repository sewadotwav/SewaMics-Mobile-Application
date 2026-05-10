// ============================================================
// SewaMics — Profile Screen (No Dark Mode)
// File: src/screens/profile/ProfileScreen.tsx
// ============================================================

import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { storage } from "../../config/firebaseConfig";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { useAuth } from "../../context/AuthContext";
import { getUserProfile, updateUserProfile } from "../../services/userService";
import { getErrorMessage } from "../../utils/errorHandler";
import { LoadingScreen } from "../../components/common/LoadingScreen";
import { useNotification } from "../../context/NotificationContext";
import { CTAButton } from "../../components/common/CTAButton";
import { UserDocument } from "../../config/firestoreSchema";

interface ProfileScreenProps {
  navigation: any;
}

export const ProfileScreen = ({ navigation }: ProfileScreenProps) => {
  const { user, logout } = useAuth();
  const { showAlert } = useNotification();

  const [profile, setProfile] = useState<UserDocument | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [imageUploading, setImageUploading] = useState(false);

  // ── Fetch Firestore Profile ───────────────────────────────────
  useEffect(() => {
    let isMounted = true;
    const fetchProfile = async () => {
      if (!user?.uid) return;
      try {
        const data = await getUserProfile(user.uid);
        if (isMounted) setProfile(data);
      } catch (err) {
        console.error("Error fetching profile:", err);
      } finally {
        if (isMounted) setProfileLoading(false);
      }
    };
    fetchProfile();
    return () => { isMounted = false; };
  }, [user]);

  // ── Profile Picture Handler ───────────────────────────────────
  const handleProfilePictureChange = useCallback(async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission Required", "Please allow photo library access to change your profile picture.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: "images" as any,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });

    if (result.canceled || !result.assets?.[0]?.uri) return;

    try {
      setImageUploading(true);
      console.log("[Profile] Starting upload to bucket:", storage.app.options.storageBucket);
      
      // Robust Blob conversion for React Native
      const uri = result.assets[0].uri;
      const blob: any = await new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.onload = function () {
          resolve(xhr.response);
        };
        xhr.onerror = function (e) {
          console.error("XHR failed", e);
          reject(new TypeError("Network request failed"));
        };
        xhr.responseType = "blob";
        xhr.open("GET", uri, true);
        xhr.send(null);
      });

      const storageRef = ref(storage, `users/${user!.uid}/profilePicture.jpg`);
      await uploadBytes(storageRef, blob, { contentType: "image/jpeg" });
      
      // Important: Close the blob to free up memory
      if (blob.close) blob.close();

      const downloadURL = await getDownloadURL(storageRef);
      await updateUserProfile(user!.uid, { profilePicture: downloadURL });
      setProfile((prev) => prev ? { ...prev, profilePicture: downloadURL } : prev);
      Alert.alert("Success", "Profile picture updated!");
    } catch (err: any) {
      console.error("Upload error details:", JSON.stringify(err, null, 2));
      Alert.alert("Upload Failed", "Please ensure your Firebase Storage is set up and your .env variables are correct.");
    } finally {
      setImageUploading(false);
    }
  }, [user]);

  // ── Logout Handler ────────────────────────────────────────────
  const handleLogout = useCallback(() => {
    showAlert({
      title: "Log Out",
      message: "Are you sure you wanna log out? We will miss you :((",
      confirmText: "Yes",
      cancelText: "No",
      onConfirm: async () => {
        try {
          await logout();
        } catch (err: any) {
          Alert.alert("Error", getErrorMessage(err));
        }
      },
    });
  }, [logout, showAlert]);

  if (profileLoading) {
    return <LoadingScreen message="Loading profile..." />;
  }

  const displayName = profile?.name || user?.displayName || "User";
  const displayEmail = profile?.email || user?.email || "";
  const displayPhone = profile?.phone || "Not set";
  const displayAddress = profile?.addresses?.[0]?.street || "Not set";
  const profilePicture = profile?.profilePicture;

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      {/* Header */}
      <View style={styles.header}>
        <Image
          source={require("../../../assets/Brand/SewaLogo.png")}
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={styles.headerTitle}>Profile</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 10 }}
      >
        {/* Avatar */}
        <View style={styles.avatarSection}>
          <TouchableOpacity
            onPress={handleProfilePictureChange}
            activeOpacity={0.8}
            style={styles.avatarContainer}
          >
            {imageUploading ? (
              <ActivityIndicator size="large" color="#9d174d" />
            ) : profilePicture ? (
              <Image source={{ uri: profilePicture }} style={styles.avatarImage} />
            ) : (
              <Feather name="user" size={40} color="#9ca3af" />
            )}
            <View style={styles.avatarEditBadge}>
              <Feather name="edit-2" size={10} color="#ffffff" />
            </View>
          </TouchableOpacity>
          <Text style={styles.userName}>{displayName}</Text>
          <Text style={styles.userEmail}>{displayEmail}</Text>
        </View>

        {/* Personal Info Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Personal Information</Text>
            <TouchableOpacity onPress={() => navigation.navigate("EditProfile")} activeOpacity={0.7}>
              <Text style={styles.editLink}>Edit</Text>
            </TouchableOpacity>
          </View>
          <InfoRow icon="user" label="Name" value={displayName} />
          <InfoRow icon="mail" label="E-mail" value={displayEmail} />
          <InfoRow icon="phone" label="Phone number" value={displayPhone} />
          <InfoRow icon="home" label="Home address" value={displayAddress} last />
        </View>

        {/* Account Info Card */}
        <View style={[styles.card, { marginTop: 16 }]}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Account Information</Text>
          </View>
          <AccountRow icon="package" label="My Orders" onPress={() => navigation.getParent()?.navigate("OrdersTab")} />
          <AccountRow icon="heart" label="Wishlist" onPress={() => navigation.navigate("Wishlist")} />
          <AccountRow icon="help-circle" label="Help & Support" onPress={() => navigation.navigate("HelpSupport")} last />
        </View>

        {/* Logout Button */}
        <CTAButton
          title="Logout"
          icon="log-out"
          onPress={handleLogout}
          style={{ marginTop: 16 }}
        />
      </ScrollView>
    </SafeAreaView>
  );
};

// ── Row Helpers ───────────────────────────────────────────────
const InfoRow = ({
  icon,
  label,
  value,
  last = false,
}: {
  icon: React.ComponentProps<typeof Feather>["name"];
  label: string;
  value: string;
  last?: boolean;
}) => (
  <View style={[styles.infoRow, !last && styles.rowBorder]}>
    <Feather name={icon} size={20} color="#9ca3af" style={styles.rowIcon} />
    <View style={styles.infoRowContent}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  </View>
);

const AccountRow = ({
  icon,
  label,
  onPress,
  last = false,
}: {
  icon: React.ComponentProps<typeof Feather>["name"];
  label: string;
  onPress: () => void;
  last?: boolean;
}) => (
  <TouchableOpacity
    style={[styles.accountRow, !last && styles.rowBorder]}
    onPress={onPress}
    activeOpacity={0.7}
  >
    <View style={styles.accountRowLeft}>
      <Feather name={icon} size={20} color="#9ca3af" style={styles.rowIcon} />
      <Text style={styles.rowLabel}>{label}</Text>
    </View>
    <Feather name="chevron-right" size={18} color="#9ca3af" />
  </TouchableOpacity>
);

// ── Styles ────────────────────────────────────────────────────
const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#ffffff" },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#ffffff" },

  header: {
    height: 56,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
    backgroundColor: "#ffffff",
  },
  logo: { width: 64, height: 48 },
  headerTitle: { fontSize: 18, fontFamily: "Zalando-SemiBold", color: "#1f2937", letterSpacing: -0.3 },
  headerRight: { width: 40 },

  avatarSection: { alignItems: "center", paddingTop: 24, paddingBottom: 8 },
  avatarContainer: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: "#f3f4f6",
    justifyContent: "center", alignItems: "center",
  },
  avatarImage: { width: 80, height: 80, borderRadius: 40 },
  avatarEditBadge: {
    position: "absolute", bottom: 0, right: 0,
    width: 24, height: 24, borderRadius: 12,
    backgroundColor: "#ea580c",
    justifyContent: "center", alignItems: "center",
    borderWidth: 2, borderColor: "#ffffff",
  },
  userName: { fontSize: 26, fontFamily: "Zalando-Bold", color: "#ea580c", marginTop: 16, letterSpacing: -0.5 },
  userEmail: { fontSize: 14, fontFamily: "Zalando-Regular", color: "#6b7280", marginTop: 4 },

  card: {
    marginTop: 24, borderRadius: 20,
    borderWidth: 1, borderColor: "#e5e7eb",
    backgroundColor: "#f9fafb", overflow: "hidden",
  },
  cardHeader: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    paddingHorizontal: 16, paddingVertical: 14,
    borderBottomWidth: 1, borderBottomColor: "#e5e7eb",
  },
  cardTitle: { fontSize: 16, fontFamily: "Zalando-Bold", color: "#1f2937" },
  editLink: { fontSize: 13, fontFamily: "Zalando-SemiBold", color: "#ea580c" },

  infoRow: { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingVertical: 12, minHeight: 44 },
  infoRowContent: { flex: 1 },
  infoLabel: { fontSize: 13, fontFamily: "Zalando-Light", color: "#6b7280", marginBottom: 2 },
  infoValue: { fontSize: 14, fontFamily: "Zalando-Regular", color: "#1f2937" },

  accountRow: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: 16, paddingVertical: 12, minHeight: 44,
  },
  accountRowLeft: { flexDirection: "row", alignItems: "center", flex: 1 },
  rowIcon: { marginRight: 12 },
  rowLabel: { fontSize: 14, fontFamily: "Zalando-Regular", color: "#1f2937" },
  rowBorder: { borderBottomWidth: 1, borderBottomColor: "#e5e7eb" },
});
