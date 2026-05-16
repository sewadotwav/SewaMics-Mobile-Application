import React from "react";
import { View, TextInput, TouchableOpacity, StyleSheet } from "react-native";
import { Feather } from "@expo/vector-icons";

interface SearchBarProps {
  placeholder?: string;
  value: string;
  onChangeText: (text: string) => void;
  onClearPress?: () => void;
  onFocus?: () => void;
  autoFocus?: boolean;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  placeholder = "Search ceramics...",
  value,
  onChangeText,
  onClearPress,
  onFocus,
  autoFocus = false,
}) => {
  return (
    <View style={styles.searchContainer}>
      <TextInput
        style={styles.searchInput}
        placeholder={placeholder}
        placeholderTextColor="#9ca3af"
        value={value}
        onChangeText={onChangeText}
        returnKeyType="search"
        onFocus={onFocus}
        autoFocus={autoFocus}
      />
      {value.length > 0 ? (
        <TouchableOpacity
          style={[styles.searchButton, { backgroundColor: "#f3f4f6", borderWidth: 1, borderColor: "#e5e7eb" }]}
          activeOpacity={0.8}
          onPress={() => {
            onChangeText("");
            if (onClearPress) onClearPress();
          }}
        >
          <Feather name="x" size={20} color="#9ca3af" />
        </TouchableOpacity>
      ) : (
        <TouchableOpacity
          style={styles.searchButton}
          activeOpacity={0.8}
          disabled={true}
        >
          <Feather name="search" size={20} color="#ffffff" />
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    height: 52,
    borderRadius: 26,
    backgroundColor: "#f9fafb",
    borderWidth: 2.5,
    borderColor: "#ff914d",
    paddingLeft: 20,
    paddingRight: 4,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    fontFamily: "Zalando-ExtraLight",
    color: "#1f2937",
    padding: 0,
  },
  searchButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#ff914d",
    justifyContent: "center",
    alignItems: "center",
  },
});
