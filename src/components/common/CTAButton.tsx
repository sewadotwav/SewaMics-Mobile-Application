import React from "react";
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  StyleSheet,
  ViewStyle,
  TextStyle,
} from "react-native";
import { Feather } from "@expo/vector-icons";

export interface CTAButtonProps {
  title: string;
  onPress: () => void;
  variant?: "primary" | "secondary";
  icon?: React.ComponentProps<typeof Feather>["name"];
  iconColor?: string;
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle | ViewStyle[];
  textStyle?: TextStyle | TextStyle[];
}

export const CTAButton: React.FC<CTAButtonProps> = ({
  title,
  onPress,
  variant = "primary",
  icon,
  iconColor,
  loading = false,
  disabled = false,
  style,
  textStyle,
}) => {
  const isPrimary = variant === "primary";

  return (
    <TouchableOpacity
      style={[
        styles.baseButton,
        isPrimary ? styles.primaryButton : styles.secondaryButton,
        style,
        disabled && styles.disabledButton,
      ]}
      onPress={onPress}
      activeOpacity={0.8}
      disabled={disabled || loading}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={isPrimary ? "#ffffff" : "#6b7280"}
        />
      ) : (
        <>
          {icon && (
            <Feather
              name={icon}
              size={isPrimary ? 20 : 18}
              color={iconColor || (isPrimary ? "#ffffff" : "#6b7280")}
              style={styles.icon}
            />
          )}
          <Text
            style={[
              isPrimary ? styles.primaryText : styles.secondaryText,
              textStyle,
            ]}
          >
            {title}
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  baseButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: 48,
    borderRadius: 20,
  },
  primaryButton: {
    backgroundColor: "#9d174d",
  },
  secondaryButton: {
    backgroundColor: "transparent",
    borderWidth: 1.5,
    borderColor: "#e5e7eb",
  },
  disabledButton: {
    opacity: 0.7,
  },
  icon: {
    marginRight: 8,
  },
  primaryText: {
    color: "#ffffff",
    fontSize: 16,
    fontFamily: "Zalando-SemiBold",
  },
  secondaryText: {
    color: "#6b7280",
    fontSize: 16,
    fontFamily: "Zalando-Regular",
  },
});
