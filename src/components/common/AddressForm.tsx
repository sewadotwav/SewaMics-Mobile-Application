import React, { useState, useEffect } from "react";
import { View, Text, TextInput, StyleSheet, TouchableOpacity } from "react-native";
import { Address } from "../../services/addressService";
import { CTAButton } from "./CTAButton";
import { Timestamp } from "firebase/firestore";
import { Feather } from "@expo/vector-icons";

interface AddressFormProps {
  address?: Address;
  onSave: (address: Address) => void;
  onCancel: () => void;
  isFirstAddress?: boolean;
}

export const AddressForm: React.FC<AddressFormProps> = ({ address, onSave, onCancel, isFirstAddress = false }) => {
  const [street, setStreet] = useState(address?.street || "");
  const [city, setCity] = useState(address?.city || "");
  const [province, setProvince] = useState(address?.province || "");
  const [postalCode, setPostalCode] = useState(address?.postalCode || "");
  const [label, setLabel] = useState(address?.label || "");
  const [isDefault, setIsDefault] = useState(address?.isDefault || isFirstAddress);

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const handleSave = () => {
    const newErrors: { [key: string]: string } = {};
    if (!street.trim()) newErrors.street = "Street address is required";
    if (!city.trim()) newErrors.city = "City is required";
    if (!province.trim()) newErrors.province = "Province is required";
    if (!postalCode.trim()) newErrors.postalCode = "Postal code is required";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const newAddress: Address = {
      id: address?.id || Math.random().toString(36).substring(2, 10), // Generate ID for new
      street: street.trim(),
      city: city.trim(),
      province: province.trim(),
      postalCode: postalCode.trim(),
      label: label.trim() || (isFirstAddress ? "Home" : ""),
      isDefault: isFirstAddress ? true : isDefault,
      createdAt: address?.createdAt || Timestamp.now(),
    };

    onSave(newAddress);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{address ? "Edit Address" : "Add New Address"}</Text>

      <View style={styles.inputGroup}>
        <View style={[styles.inputWrapper, errors.street && styles.inputError]}>
          <Feather name="map-pin" size={18} color="#9ca3af" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Enter street address"
            value={street}
            onChangeText={(text) => { setStreet(text); setErrors(prev => ({ ...prev, street: "" })); }}
            placeholderTextColor="#9ca3af"
          />
        </View>
        {errors.street && <Text style={styles.errorText}>{errors.street}</Text>}
      </View>

      <View style={styles.inputGroup}>
        <View style={[styles.inputWrapper, errors.city && styles.inputError]}>
          <Feather name="map" size={18} color="#9ca3af" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Enter city"
            value={city}
            onChangeText={(text) => { setCity(text); setErrors(prev => ({ ...prev, city: "" })); }}
            placeholderTextColor="#9ca3af"
          />
        </View>
        {errors.city && <Text style={styles.errorText}>{errors.city}</Text>}
      </View>

      <View style={styles.inputGroup}>
        <View style={[styles.inputWrapper, errors.province && styles.inputError]}>
          <Feather name="globe" size={18} color="#9ca3af" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Enter province"
            value={province}
            onChangeText={(text) => { setProvince(text); setErrors(prev => ({ ...prev, province: "" })); }}
            placeholderTextColor="#9ca3af"
          />
        </View>
        {errors.province && <Text style={styles.errorText}>{errors.province}</Text>}
      </View>

      <View style={styles.inputGroup}>
        <View style={[styles.inputWrapper, errors.postalCode && styles.inputError]}>
          <Feather name="hash" size={18} color="#9ca3af" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Enter postal code"
            value={postalCode}
            onChangeText={(text) => { setPostalCode(text); setErrors(prev => ({ ...prev, postalCode: "" })); }}
            keyboardType="numeric"
            placeholderTextColor="#9ca3af"
          />
        </View>
        {errors.postalCode && <Text style={styles.errorText}>{errors.postalCode}</Text>}
      </View>

      <View style={styles.inputGroup}>
        <View style={styles.inputWrapper}>
          <Feather name="tag" size={18} color="#9ca3af" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="e.g., Home, Work"
            value={label}
            onChangeText={setLabel}
            placeholderTextColor="#9ca3af"
          />
        </View>
      </View>

      {!isFirstAddress && (
        <TouchableOpacity 
          style={styles.checkboxContainer} 
          activeOpacity={0.7}
          onPress={() => setIsDefault(!isDefault)}
        >
          <View style={[styles.checkbox, isDefault && styles.checkboxChecked]}>
            {isDefault && <View style={styles.checkboxInner} />}
          </View>
          <Text style={styles.checkboxLabel}>Set as default address</Text>
        </TouchableOpacity>
      )}

      <View style={styles.buttonGroup}>
        <CTAButton title="Save Address" onPress={handleSave} style={styles.saveButton} />
        <TouchableOpacity style={styles.cancelButton} onPress={onCancel} activeOpacity={0.7}>
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#ffffff",
    padding: 16,
    borderRadius: 12,
  },
  title: {
    fontSize: 18,
    fontFamily: "Zalando-Bold",
    color: "#9d174d",
    marginBottom: 16,
    textAlign: "center",
  },
  inputGroup: {
    marginBottom: 12,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    height: 44,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 12,
    backgroundColor: "#ffffff",
    paddingHorizontal: 12,
  },
  inputIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 14,
    fontFamily: "Zalando-Medium",
    color: "#1f2937",
  },
  inputError: {
    borderColor: "#ef4444",
  },
  errorText: {
    color: "#ef4444",
    fontSize: 12,
    fontFamily: "Zalando-Regular",
    marginTop: 4,
    marginLeft: 4,
  },
  checkboxContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    marginTop: 4,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: "#e5e7eb",
    marginRight: 8,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#ffffff",
  },
  checkboxChecked: {
    borderColor: "#9d174d",
  },
  checkboxInner: {
    width: 10,
    height: 10,
    backgroundColor: "#9d174d",
    borderRadius: 2,
  },
  checkboxLabel: {
    fontSize: 14,
    fontFamily: "Zalando-Medium",
    color: "#1f2937",
  },
  buttonGroup: {
    gap: 12,
    marginTop: 8,
  },
  saveButton: {
    height: 48,
    width: "100%",
  },
  cancelButton: {
    height: 48,
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 24,
    backgroundColor: "#ffffff",
  },
  cancelButtonText: {
    fontSize: 15,
    fontFamily: "Zalando-SemiBold",
    color: "#4b5563",
  },
});
