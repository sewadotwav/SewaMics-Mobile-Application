import React from "react";
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from "react-native";

const { width } = Dimensions.get("window");

interface CustomModalProps {
  visible: boolean;
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  isDestructive?: boolean;
}

export const CustomModal = ({
  visible,
  title,
  message,
  confirmText = "Yes",
  cancelText = "No",
  onConfirm,
  onCancel,
  isDestructive = false,
}: CustomModalProps) => {
  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={onCancel}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          {title && <Text style={styles.title}>{title}</Text>}
          <Text style={styles.message}>{message}</Text>
          
          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={styles.cancelBtn}
              onPress={onCancel}
              activeOpacity={0.7}
            >
              <Text style={styles.cancelBtnText}>{cancelText}</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                styles.confirmBtn,
                isDestructive && styles.destructiveBtn,
              ]}
              onPress={onConfirm}
              activeOpacity={0.7}
            >
              <Text style={styles.confirmBtnText}>{confirmText}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
  },
  container: {
    width: "100%",
    backgroundColor: "#ffffff",
    borderRadius: 28,
    padding: 24,
    alignItems: "center",
  },
  title: {
    fontSize: 18,
    fontFamily: "Zalando-Bold",
    color: "#1f2937",
    marginBottom: 12,
    textAlign: "center",
  },
  message: {
    fontSize: 15,
    fontFamily: "Zalando-Medium",
    color: "#9d174d",
    lineHeight: 22,
    textAlign: "center",
    marginBottom: 24,
  },
  buttonRow: {
    flexDirection: "row",
    gap: 12,
    width: "100%",
  },
  cancelBtn: {
    flex: 1,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#f3f4f6",
    justifyContent: "center",
    alignItems: "center",
  },
  cancelBtnText: {
    fontSize: 15,
    fontFamily: "Zalando-SemiBold",
    color: "#6b7280",
  },
  confirmBtn: {
    flex: 1,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#9d174d",
    justifyContent: "center",
    alignItems: "center",
  },
  destructiveBtn: {
    backgroundColor: "#9d174d",
  },
  confirmBtnText: {
    fontSize: 15,
    fontFamily: "Zalando-SemiBold",
    color: "#ffffff",
  },
});
