import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Image,
  Alert,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getSystemInstructions, generateGeminiResponse } from "../../services/geminiService";

interface Message {
  id: string;
  text: string;
  sender: "user" | "bot" | "system";
}

export const ChatbotScreen = ({ navigation }: any) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSettingUp, setIsSettingUp] = useState(true);
  const [setupError, setSetupError] = useState<boolean>(false);
  const flatListRef = useRef<FlatList>(null);
  const [systemInstructionCache, setSystemInstructionCache] = useState<string>("");

  // Pre-fetch dynamic instructions and local history when the screen opens
  useEffect(() => {
    let isMounted = true;
    const initializeChat = async () => {
      try {
        const instructions = await getSystemInstructions();
        if (isMounted) setSystemInstructionCache(instructions);

        const history = await AsyncStorage.getItem("chatbot_history");
        if (isMounted) {
          if (history) {
            setMessages(JSON.parse(history));
          } else {
            setMessages([
              {
                id: "welcome",
                text: "Hi there! I'm Clay, your SewaMics helper. Ask me anything about our mugs, shipping, or care instructions!",
                sender: "bot",
              },
            ]);
          }
        }
      } catch (error) {
        console.error("Failed to load chat initialization:", error);
        if (isMounted) setSetupError(true);
      } finally {
        if (isMounted) setIsSettingUp(false);
      }
    };
    initializeChat();
    return () => { isMounted = false; };
  }, []);

  // Save chat history to local storage whenever it updates
  useEffect(() => {
    if (!isSettingUp && messages.length > 0) {
      AsyncStorage.setItem("chatbot_history", JSON.stringify(messages));
    }
  }, [messages, isSettingUp]);

  // ── RATE LIMIT CHECKS (Local safeguard) ──────────────────────────
  const checkRateLimits = async (): Promise<boolean> => {
    try {
      const now = Date.now();
      const oneMinuteAgo = now - 60000;
      const oneDayAgo = now - 86400000;

      const storedTimestamps = await AsyncStorage.getItem("chat_request_timestamps");
      const timestamps: number[] = storedTimestamps ? JSON.parse(storedTimestamps) : [];

      const activeTimestamps = timestamps.filter(t => t > oneDayAgo);

      // Check RPM (Limit: 5/minute)
      const recentMinutes = activeTimestamps.filter(t => t > oneMinuteAgo);
      if (recentMinutes.length >= 5) {
        Alert.alert("Clay is catching his breath!", "Please wait a minute before sending another question to prevent spam.");
        return false;
      }

      // Check RPD (Limit: 30/day)
      if (activeTimestamps.length >= 30) {
        Alert.alert("Daily limit reached!", "You've reached your chat limit for today. Come back tomorrow!");
        return false;
      }

      activeTimestamps.push(now);
      await AsyncStorage.setItem("chat_request_timestamps", JSON.stringify(activeTimestamps));
      return true;
    } catch (e) {
      console.error("Rate limit error", e);
      return true;
    }
  };

  // ── SEND MESSAGE TO GEMINI FLASH ─────────────────────────────────────
  const handleSendMessage = async () => {
    if (!inputText.trim() || isLoading || setupError) return;

    const allowed = await checkRateLimits();
    if (!allowed) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText.trim(),
      sender: "user",
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText("");
    setIsLoading(true);

    try {
      // Structure the conversation history exactly how Gemini API requires it
      const conversationHistory = messages
        .filter(msg => msg.id !== "welcome" && msg.sender !== "system")
        .map(msg => ({
          role: msg.sender === "user" ? "user" : "model",
          parts: [{ text: msg.text }],
        }));
      
      // Add the newest message
      conversationHistory.push({ role: "user", parts: [{ text: userMessage.text }] });

      // Call the Live API via the Service
      const data = await generateGeminiResponse(conversationHistory, systemInstructionCache);
      const botResponseText = data.candidates?.[0]?.content?.parts?.[0]?.text || "Sorry, I encountered a glitch!";

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: botResponseText.trim(),
        sender: "bot",
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error("Chatbot Error:", error);
      setMessages(prev => [
        ...prev,
        { id: Date.now().toString(), text: "I'm having trouble connecting right now. Please check your internet connection!", sender: "system" }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
  }, [messages, isLoading]);

  const renderMessageItem = ({ item }: { item: Message }) => {
    const isUser = item.sender === "user";
    const isSystem = item.sender === "system";

    return (
      <View style={[styles.messageRow, isUser ? styles.userRow : styles.botRow]}>
        {!isUser && !isSystem && (
          <Image
            source={require("../../../assets/Brand/SewaMicsClay.png")}
            style={styles.mascotIcon}
          />
        )}
        <View
          style={[
            styles.bubble,
            isUser ? styles.userBubble : isSystem ? styles.systemBubble : styles.botBubble,
          ]}
        >
          <Text style={[styles.messageText, isUser ? styles.userText : styles.botText]}>
            {item.text}
          </Text>
        </View>
      </View>
    );
  };

  const innerContent = (
    <>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity onPress={() => navigation.goBack()} activeOpacity={0.7} style={styles.backBtn}>
            <Feather name="chevron-left" size={28} color="#9d174d" />
          </TouchableOpacity>
          
          <View style={styles.mascotTitleContainer}>
            <Image
              source={require("../../../assets/Brand/SewaMicsClay.png")}
              style={styles.mascotHeaderImg}
            />
            <View>
              <Text style={styles.mascotName}>Clay</Text>
              <Text style={styles.mascotStatus}>Online • Mascot Assistant</Text>
            </View>
          </View>
        </View>
      </View>

      {isSettingUp ? (
        <View style={styles.setupLoader}>
          <ActivityIndicator size="large" color="#9d174d" />
          <Text style={styles.setupText}>Connecting to Clay's brain...</Text>
        </View>
      ) : setupError ? (
        <View style={styles.setupLoader}>
          <Feather name="alert-triangle" size={40} color="#dc2626" style={{ marginBottom: 12 }} />
          <Text style={styles.setupErrorTitle}>Brain Initialization Error</Text>
          <Text style={styles.setupErrorSub}>
            Please add the "settings/chatbot" document with "systemInstructions" in your Firebase console.
          </Text>
        </View>
      ) : (
        <>
          {/* Messages */}
          <FlatList
            ref={flatListRef}
            data={messages}
            keyExtractor={item => item.id}
            renderItem={renderMessageItem}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            ListFooterComponent={
              isLoading ? (
                <View style={styles.loadingRow}>
                  <Image source={require("../../../assets/Brand/SewaMicsClay.png")} style={styles.mascotIcon} />
                  <View style={styles.loadingBubble}>
                    <ActivityIndicator size="small" color="#9d174d" />
                  </View>
                </View>
              ) : null
            }
          />

          {/* Input Field */}
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Ask Clay anything..."
              placeholderTextColor="#9ca3af"
              value={inputText}
              onChangeText={setInputText}
              editable={!isLoading}
            />
            <TouchableOpacity
              style={[styles.sendBtn, !inputText.trim() && styles.sendBtnDisabled]}
              onPress={handleSendMessage}
              disabled={isLoading || !inputText.trim()}
              activeOpacity={0.8}
            >
              <Feather name="send" size={18} color="#ffffff" />
            </TouchableOpacity>
          </View>
        </>
      )}
    </>
  );

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      {Platform.OS === "ios" ? (
        <KeyboardAvoidingView style={styles.keyboardAvoid} behavior="padding" keyboardVerticalOffset={10}>
          {innerContent}
        </KeyboardAvoidingView>
      ) : (
        <View style={styles.keyboardAvoid}>
          {innerContent}
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#ffffff" },
  keyboardAvoid: { flex: 1 },
  header: {
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderColor: "#f3f4f6",
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  backBtn: { padding: 4, marginRight: 8 },
  mascotTitleContainer: { flexDirection: "row", alignItems: "center" },
  mascotHeaderImg: { width: 36, height: 36, borderRadius: 18, marginRight: 8, backgroundColor: "#fa955d20" },
  mascotName: { fontSize: 16, fontFamily: "Zalando-Bold", color: "#1f2937" },
  mascotStatus: { fontSize: 11, fontFamily: "Zalando-Medium", color: "#9d174d" },
  listContent: { padding: 16, paddingBottom: 24 },
  messageRow: { flexDirection: "row", marginVertical: 8, maxWidth: "80%" },
  userRow: { alignSelf: "flex-end", flexDirection: "row-reverse" },
  botRow: { alignSelf: "flex-start" },
  mascotIcon: { width: 28, height: 28, borderRadius: 14, marginRight: 8, alignSelf: "flex-end", backgroundColor: "#fa955d20" },
  bubble: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 18 },
  userBubble: { backgroundColor: "#9d174d", borderBottomRightRadius: 2 },
  botBubble: { backgroundColor: "#f3f4f6", borderBottomLeftRadius: 2, borderWidth: 1, borderColor: "#e5e7eb" },
  systemBubble: { backgroundColor: "#fee2e2", alignSelf: "center", borderBottomLeftRadius: 18 },
  messageText: { fontSize: 14, fontFamily: "Zalando-Medium", lineHeight: 20 },
  userText: { color: "#ffffff" },
  botText: { color: "#000000" }, // Black text for high readability
  loadingRow: { flexDirection: "row", marginVertical: 8, alignSelf: "flex-start" },
  loadingBubble: { backgroundColor: "#f3f4f6", borderWidth: 1, borderColor: "#e5e7eb", paddingHorizontal: 20, paddingVertical: 12, borderRadius: 18, borderBottomLeftRadius: 2 },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    backgroundColor: "#ffffff",
  },
  input: {
    flex: 1,
    height: 44,
    backgroundColor: "#f9fafb",
    borderRadius: 22,
    paddingHorizontal: 18,
    fontSize: 14,
    fontFamily: "Zalando-Medium",
    color: "#1f2937",
    borderWidth: 1.5,
    borderColor: "#fa955d", // Tangerine orange border
    marginRight: 10,
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#fa955d", // Changed to orange
    justifyContent: "center",
    alignItems: "center",
  },
  sendBtnDisabled: { backgroundColor: "#e5e7eb" },
  setupLoader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
    backgroundColor: "#ffffff",
  },
  setupText: {
    marginTop: 16,
    fontSize: 15,
    color: "#4b5563",
    fontFamily: "Zalando-Medium",
  },
  setupErrorTitle: {
    fontSize: 18,
    fontFamily: "Zalando-Bold",
    color: "#1f2937",
    marginBottom: 8,
  },
  setupErrorSub: {
    fontSize: 13,
    color: "#6b7280",
    textAlign: "center",
    fontFamily: "Zalando-Medium",
    lineHeight: 18,
    paddingHorizontal: 20,
  },
});
