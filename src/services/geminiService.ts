import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../config/firebaseConfig";

const getApiUrl = () => {
  const key = process.env.EXPO_PUBLIC_GEMINI_API_KEY;
  if (!key) {
    console.error("[SewaMics] EXPO_PUBLIC_GEMINI_API_KEY is missing in your environment variables!");
  }
  return `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${key || ""}`;
};

const FALLBACK_INSTRUCTIONS = `
You are Clay, the playful ceramic mascot of SewaMics! Speak in a happy, formal tone.
Refer to these rules:
- Shipments take 3-5 days in Metro Manila, 5-7 days provincially.
- All mugs are microwave/dishwasher safe unless specified.
Keep responses under 3 sentences.
`;

export const getSystemInstructions = async (): Promise<string> => {
  try {
    const docRef = doc(db, "settings", "chatbot");
    const docSnap = await getDoc(docRef);
    if (docSnap.exists() && docSnap.data().systemInstructions) {
      return docSnap.data().systemInstructions;
    } else {

      return FALLBACK_INSTRUCTIONS;
    }
  } catch (error) {
    console.error("Error fetching system instructions:", error);
    return FALLBACK_INSTRUCTIONS;
  }
};

export const generateGeminiResponse = async (conversationHistory: any[], systemInstruction: string) => {
  const response = await fetch(getApiUrl(), {
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
