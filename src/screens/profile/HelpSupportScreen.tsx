// ============================================================
// SewaMics — Help & Support Screen (No Dark Mode)
// File: src/screens/profile/HelpSupportScreen.tsx
// ============================================================

import React, { useState } from "react";
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";

interface HelpSupportScreenProps {
  navigation: any;
}

const FAQ_ITEMS = [
  { question: "How do I track my order?", answer: "Go to the Orders tab from the bottom navigation bar. Tap on any order to see its current status and estimated delivery date." },
  { question: "Can I return or exchange a product?", answer: "Yes! We accept returns within 14 days of delivery. The item must be unused and in its original packaging. Contact us via email to initiate a return." },
  { question: "How do I change my delivery address?", answer: "You can update your home address anytime from Profile → Edit Profile. Changes apply to future orders only." },
  { question: "What payment methods do you accept?", answer: "We currently accept major credit and debit cards via Stripe. More payment options including GCash and PayMaya are coming soon." },
  { question: "Are the mugs microwave and dishwasher safe?", answer: "Most of our ceramic mugs are microwave-safe and top-rack dishwasher safe. Check the individual product description to confirm." },
  { question: "How long does shipping take?", answer: "Standard shipping takes 3–7 business days within the Philippines. Metro Manila orders may arrive faster (1–3 days). Express options are available at checkout." },
];

const FAQItem = ({ question, answer }: { question: string; answer: string }) => {
  const [expanded, setExpanded] = useState(false);
  return (
    <TouchableOpacity
      style={styles.faqItem}
      onPress={() => setExpanded((prev) => !prev)}
      activeOpacity={0.85}
    >
      <View style={styles.faqHeader}>
        <Text style={styles.faqQuestion}>{question}</Text>
        <Feather name={expanded ? "chevron-up" : "chevron-down"} size={18} color="rgba(255,255,255,0.8)" />
      </View>
      {expanded && <Text style={styles.faqAnswer}>{answer}</Text>}
    </TouchableOpacity>
  );
};

export const HelpSupportScreen = ({ navigation }: HelpSupportScreenProps) => {
  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} activeOpacity={0.7} style={styles.backButton}>
          <Feather name="arrow-left" size={22} color="#9d174d" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Help & Support</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 20 }}>
        {/* Hero Heading */}
        <Text style={styles.heroHeading}>Questions, honestly answered.</Text>

        {/* Banner */}
        <View style={styles.bannerCard}>
          <Feather name="help-circle" size={28} color="#9d174d" style={{ marginBottom: 8 }} />
          <Text style={styles.bannerTitle}>How can we help?</Text>
          <Text style={styles.bannerSubtext}>Browse our FAQs or reach out to us directly. We're happy to help!</Text>
        </View>

        {/* FAQ */}
        <Text style={styles.sectionLabel}>Frequently Asked Questions</Text>
        {FAQ_ITEMS.map((item, index) => (
          <FAQItem key={index} question={item.question} answer={item.answer} />
        ))}

        {/* Contact */}
        <Text style={styles.sectionLabel}>Contact Us</Text>
        <View style={styles.contactCard}>
          <TouchableOpacity style={[styles.contactRow, styles.rowBorder]} onPress={() => Linking.openURL("mailto:support@sewamics.com")} activeOpacity={0.7}>
            <View style={[styles.contactIconWrapper, { backgroundColor: "#9d174d18" }]}>
              <Feather name="mail" size={18} color="#9d174d" />
            </View>
            <View style={styles.contactContent}>
              <Text style={styles.contactLabel}>Email Support</Text>
              <Text style={styles.contactValue}>support@sewamics.com</Text>
            </View>
            <Feather name="chevron-right" size={16} color="#9ca3af" />
          </TouchableOpacity>

          <TouchableOpacity style={[styles.contactRow, styles.rowBorder]} onPress={() => Linking.openURL("tel:+63281234567")} activeOpacity={0.7}>
            <View style={[styles.contactIconWrapper, { backgroundColor: "#ea580c18" }]}>
              <Feather name="phone" size={18} color="#ea580c" />
            </View>
            <View style={styles.contactContent}>
              <Text style={styles.contactLabel}>Phone Support</Text>
              <Text style={styles.contactValue}>+63 (2) 8123-4567</Text>
            </View>
            <Feather name="chevron-right" size={16} color="#9ca3af" />
          </TouchableOpacity>

          <View style={styles.contactRow}>
            <View style={[styles.contactIconWrapper, { backgroundColor: "#10b98118" }]}>
              <Feather name="clock" size={18} color="#10b981" />
            </View>
            <View style={styles.contactContent}>
              <Text style={styles.contactLabel}>Business Hours</Text>
              <Text style={styles.contactValue}>Mon–Fri, 9AM – 6PM PHT</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#ffffff" },

  header: {
    height: 56, flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: 16, borderBottomWidth: 1, borderBottomColor: "#e5e7eb", backgroundColor: "#ffffff",
  },
  backButton: { width: 40, alignItems: "flex-start" },
  headerTitle: { fontSize: 18, fontFamily: "Zalando-SemiBold", color: "#1f2937", letterSpacing: -0.3 },
  headerRight: { width: 40 },

  heroHeading: {
    fontSize: 36,
    fontFamily: "Zalando-SemiBold",
    color: "#9d174d",
    textAlign: "center",
    letterSpacing: -0.5,
    marginTop: 24,
    marginBottom: 16,
  },

  bannerCard: {
    borderRadius: 16, borderWidth: 1,
    borderColor: "#9d174d30", backgroundColor: "#9d174d0d",
    padding: 20, alignItems: "center",
  },
  bannerTitle: { fontSize: 18, fontFamily: "Zalando-SemiBold", color: "#1f2937", letterSpacing: -0.3, marginBottom: 6 },
  bannerSubtext: { fontSize: 14, fontFamily: "Zalando-Regular", color: "#6b7280", textAlign: "center", lineHeight: 20 },

  sectionLabel: { fontSize: 16, fontFamily: "Zalando-Bold", color: "#1f2937", marginTop: 24, marginBottom: 12 },

  faqItem: { borderRadius: 20, backgroundColor: "#9d174d", padding: 16, marginBottom: 8 },
  faqHeader: { flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between" },
  faqQuestion: { fontSize: 14, fontFamily: "Zalando-Medium", color: "#ffffff", flex: 1, marginRight: 12, lineHeight: 20 },
  faqAnswer: { fontSize: 13, fontFamily: "Zalando-Regular", color: "rgba(255,255,255,0.85)", marginTop: 12, lineHeight: 20 },

  contactCard: { borderRadius: 20, borderWidth: 1, borderColor: "#e5e7eb", backgroundColor: "#f9fafb", overflow: "hidden" },
  contactRow: { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingVertical: 14, minHeight: 60 },
  rowBorder: { borderBottomWidth: 1, borderBottomColor: "#e5e7eb" },
  contactIconWrapper: { width: 40, height: 40, borderRadius: 20, justifyContent: "center", alignItems: "center", marginRight: 12 },
  contactContent: { flex: 1 },
  contactLabel: { fontSize: 12, fontFamily: "Zalando-Light", color: "#6b7280", marginBottom: 2 },
  contactValue: { fontSize: 14, fontFamily: "Zalando-Regular", color: "#1f2937" },
});
