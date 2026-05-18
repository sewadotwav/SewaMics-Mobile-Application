import { doc, getDoc } from "firebase/firestore";
import { db } from "../config/firebaseConfig";

// Security note: In strict production, this would be behind a server or in .env
const GEMINI_API_KEY = "EXPO_PUBLIC_GEMINI_API_KEY";
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`;

export const getSystemInstructions = async (): Promise<string> => {
  const docRef = doc(db, "settings", "chatbot");
  const docSnap = await getDoc(docRef);
  if (docSnap.exists() && docSnap.data().systemInstructions) {
    return docSnap.data().systemInstructions;
  } else {
    throw new Error("System instructions document 'settings/chatbot' is missing or empty in Firestore.");
  }
};

export const generateGeminiResponse = async (conversationHistory: any[], systemInstruction: string) => {
  const response = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      systemInstruction: {
        parts: [{ text: systemInstruction }]
      },
      contents: conversationHistory
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("Gemini API Error:", response.status, errorText);
    throw new Error(`API Error: ${response.status}`);
  }

  return await response.json();
};
