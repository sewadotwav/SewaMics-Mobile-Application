// ============================================================
// SewaMics — OTP & 2FA Service
// File: src/services/otpService.ts
// ============================================================

import { doc, setDoc, getDoc } from "firebase/firestore";
import { db } from "../config/firebaseConfig";

// Generate a random 6-digit OTP code
export const generateOTP = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

/**
 * Saves a generated 6-digit OTP code to a secure private subcollection.
 * The code is configured to expire in 5 minutes.
 */
export const storeOTP = async (uid: string, code: string): Promise<void> => {
  const expiresAt = Date.now() + 5 * 60 * 1000; // 5 minutes expiration
  const ref = doc(db, "users", uid, "private", "2fa");
  await setDoc(ref, {
    code,
    expiresAt,
  });
};

/**
 * Verifies if the entered 6-digit code matches and is still valid.
 */
export const verifyOTP = async (uid: string, enteredCode: string): Promise<boolean> => {
  try {
    const ref = doc(db, "users", uid, "private", "2fa");
    const snap = await getDoc(ref);
    if (!snap.exists()) return false;

    const { code, expiresAt } = snap.data();
    if (Date.now() > expiresAt) return false; // Code expired
    return code === enteredCode.trim();
  } catch (error) {
    console.error("Error verifying OTP:", error);
    return false;
  }
};

/**
 * Sends a premium branded HTML email using the secure EmailJS REST API.
 * Pulls credentials from environment variables to ensure no hardcoding.
 */
export const sendOTPEmail = async (email: string, code: string): Promise<boolean> => {
  const serviceId = process.env.EXPO_PUBLIC_EMAILJS_SERVICE_ID;
  const templateId = process.env.EXPO_PUBLIC_EMAILJS_TEMPLATE_ID;
  const publicKey = process.env.EXPO_PUBLIC_EMAILJS_PUBLIC_KEY;

  if (!serviceId || !templateId || !publicKey || serviceId.includes("your_")) {
    return false; // Keys not configured — do not send or log
  }
  
  try {
    const response = await fetch("https://api.emailjs.com/api/v1.0/email/send", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        service_id: serviceId,
        template_id: templateId,
        user_id: publicKey,
        template_params: {
          email: email, 
          otp_code: code, 
          time: new Date(Date.now() + 5 * 60 * 1000).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }), // Matches {{time}} in user's EmailJS template
        },
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      console.warn("EmailJS API Warning:", err);
    }
    return response.ok;
  } catch (error) {
    console.error("Failed to send EmailJS 2FA email:", error);
    return false;
  }
};
