import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Modal } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useAuth } from "../../context/AuthContext";
import { getUserAddresses, addAddress, updateAddress, deleteAddress, Address } from "../../services/addressService";
import { CheckoutData } from "./CheckoutScreen";
import { CTAButton } from "../../components/common/CTAButton";
import { AddressForm } from "../../components/common/AddressForm";

interface ShippingStepProps {
  checkoutData: CheckoutData;
  updateCheckoutData: (data: Partial<CheckoutData>) => void;
  updateCurrentStep: (step: "shipping" | "payment" | "review") => void;
}

export const ShippingStep: React.FC<ShippingStepProps> = ({ checkoutData, updateCheckoutData, updateCurrentStep }) => {
  const { user } = useAuth();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [formVisible, setFormVisible] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | undefined>(undefined);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(checkoutData.selectedAddress?.id || null);

  useEffect(() => {
    fetchAddresses();
  }, [user]);

  const fetchAddresses = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const data = await getUserAddresses(user.uid);
      setAddresses(data);
      if (data.length > 0 && !selectedAddressId) {
        const defaultAddr = data.find(a => a.isDefault) || data[0];
        setSelectedAddressId(defaultAddr.id);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveAddress = async (address: Address) => {
    if (!user) return;
    try {
      if (editingAddress) {
        await updateAddress(user.uid, address.id, address);
      } else {
        await addAddress(user.uid, address);
      }
      setFormVisible(false);
      await fetchAddresses();
      setSelectedAddressId(address.id); // Auto-select the newly added/edited address
    } catch (error) {
      console.error("Error saving address", error);
      alert("Failed to save address. Please try again.");
    }
  };

  const handleDeleteAddress = async (address: Address) => {
    if (!user) return;
    // Basic confirmation would ideally use Alert, but for simplicity here
    try {
      await deleteAddress(user.uid, address.id);
      if (selectedAddressId === address.id) setSelectedAddressId(null);
      await fetchAddresses();
    } catch (error: any) {
      alert(error.message || "Failed to delete address");
    }
  };

  const handleContinuePayment = () => {
    if (!selectedAddressId) {
      alert("Please select a shipping address");
      return;
    }
    const selected = addresses.find(a => a.id === selectedAddressId);
    updateCheckoutData({ selectedAddress: selected });
    updateCurrentStep("payment");
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#9d174d" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Shipping Address</Text>
          <Text style={styles.subtitle}>Choose a shipping address or add a new one</Text>
        </View>

        <View style={styles.addressesList}>
          {addresses.map((addr, index) => {
            const isSelected = addr.id === selectedAddressId;
            return (
              <TouchableOpacity
                key={addr.id || `addr-${index}`}
                style={[styles.addressCard, isSelected && styles.addressCardSelected]}
                onPress={() => setSelectedAddressId(addr.id)}
                activeOpacity={0.8}
              >
                <View style={styles.cardHeader}>
                  <View style={styles.radioContainer}>
                    <View style={[styles.radioOuter, isSelected && styles.radioOuterSelected]}>
                      {isSelected && <View style={styles.radioInner} />}
                    </View>
                    <Text style={styles.addressLabel}>{addr.label || "Address"}</Text>
                    {addr.isDefault && (
                      <View style={styles.defaultBadge}>
                        <Text style={styles.defaultBadgeText}>DEFAULT</Text>
                      </View>
                    )}
                  </View>
                </View>

                <View style={styles.addressDetails}>
                  <Text style={styles.streetText}>{addr.street}</Text>
                  <Text style={styles.cityText}>{addr.city}, {addr.province} {addr.postalCode}</Text>
                </View>

                <View style={styles.cardActions}>
                  <TouchableOpacity onPress={() => { setEditingAddress(addr); setFormVisible(true); }}>
                    <Text style={styles.actionEditText}>Edit</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => handleDeleteAddress(addr)}>
                    <Text style={styles.actionDeleteText}>Delete</Text>
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            );
          })}

          <TouchableOpacity
            style={styles.addNewButton}
            onPress={() => { setEditingAddress(undefined); setFormVisible(true); }}
            activeOpacity={0.7}
          >
            <Text style={styles.addNewButtonText}>+ Add New Address</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <CTAButton
          title="Continue to Payment"
          onPress={handleContinuePayment}
          disabled={!selectedAddressId}
          style={styles.continueBtn}
        />
      </View>

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
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  scrollContainer: { flex: 1 },
  header: {
    padding: 16,
    paddingBottom: 8,
  },
  title: {
    fontSize: 18,
    fontFamily: "Zalando-Bold",
    color: "#9d174d",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 13,
    fontFamily: "Zalando-Medium",
    color: "#6b7280",
  },
  addressesList: {
    paddingBottom: 24,
  },
  addressCard: {
    backgroundColor: "#ffffff",
    borderWidth: 2,
    borderColor: "#e5e7eb",
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 12,
  },
  addressCardSelected: {
    borderColor: "#9d174d",
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  radioContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#d1d5db",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  radioOuterSelected: {
    borderColor: "#9d174d",
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#9d174d",
  },
  addressLabel: {
    fontSize: 14,
    fontFamily: "Zalando-Bold",
    color: "#1f2937",
    marginRight: 8,
  },
  defaultBadge: {
    backgroundColor: "#f3f4f6",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  defaultBadgeText: {
    fontSize: 9,
    fontFamily: "Zalando-Bold",
    color: "#6b7280",
  },
  addressDetails: {
    paddingLeft: 30, // Align with text next to radio
    marginBottom: 12,
  },
  streetText: {
    fontSize: 13,
    fontFamily: "Zalando-Medium",
    color: "#1f2937",
    marginBottom: 2,
  },
  cityText: {
    fontSize: 13,
    fontFamily: "Zalando-Regular",
    color: "#6b7280",
  },
  cardActions: {
    flexDirection: "row",
    paddingLeft: 30,
    gap: 16,
  },
  actionEditText: {
    fontSize: 13,
    fontFamily: "Zalando-Bold",
    color: "#9d174d",
  },
  actionDeleteText: {
    fontSize: 13,
    fontFamily: "Zalando-SemiBold",
    color: "#9ca3af",
  },
  addNewButton: {
    marginHorizontal: 16,
    marginTop: 8,
    borderWidth: 2,
    borderColor: "#ff914d",
    borderStyle: "dashed",
    borderRadius: 16,
    height: 48,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(255, 145, 77, 0.05)",
  },
  addNewButtonText: {
    fontSize: 14,
    fontFamily: "Zalando-Bold",
    color: "#ff914d",
  },
  footer: {
    padding: 16,
    backgroundColor: "#ffffff",
    borderTopWidth: 1,
    borderTopColor: "#f3f4f6",
  },
  continueBtn: {
    width: "100%",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#ffffff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    paddingBottom: 40,
  },
});
