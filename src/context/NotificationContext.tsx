import React, { createContext, useContext, useState, useCallback } from "react";
import { CustomModal } from "../components/common/CustomModal";
import { Toast } from "../components/common/Toast";

interface AlertConfig {
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  isDestructive?: boolean;
}

interface ToastConfig {
  message: string;
}

interface NotificationContextType {
  showAlert: (config: AlertConfig) => void;
  showToast: (message: string) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(
  undefined
);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {

  const [modalVisible, setModalVisible] = useState(false);
  const [modalConfig, setModalConfig] = useState<AlertConfig | null>(null);


  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  const showAlert = useCallback((config: AlertConfig) => {
    setModalConfig(config);
    setModalVisible(true);
  }, []);

  const showToast = useCallback((message: string) => {
    setToastMessage(message);
    setToastVisible(true);
  }, []);

  const handleModalConfirm = () => {
    modalConfig?.onConfirm();
    setModalVisible(false);
  };

  const handleModalCancel = () => {
    setModalVisible(false);
  };

  return (
    <NotificationContext.Provider value={{ showAlert, showToast }}>
      {children}
      
      {modalConfig && (
        <CustomModal
          visible={modalVisible}
          title={modalConfig.title}
          message={modalConfig.message}
          confirmText={modalConfig.confirmText}
          cancelText={modalConfig.cancelText}
          isDestructive={modalConfig.isDestructive}
          onConfirm={handleModalConfirm}
          onCancel={handleModalCancel}
        />
      )}

      <Toast
        visible={toastVisible}
        message={toastMessage}
        onHide={() => setToastVisible(false)}
      />
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error(
      "useNotification must be used within a NotificationProvider"
    );
  }
  return context;
};
