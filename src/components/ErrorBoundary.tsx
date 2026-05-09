/**
 * SewaMics — Global Error Boundary
 * File: src/components/ErrorBoundary.tsx
 * 
 * Catches JavaScript errors anywhere in their child component tree,
 * logs those errors, and displays a fallback UI instead of crashing the app.
 */

import React, { Component, ErrorInfo, ReactNode } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // You can also log the error to an error reporting service like Sentry
    console.error("Uncaught error:", error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.container}>
          <ScrollView contentContainerStyle={styles.content}>
            <Ionicons name="alert-circle-outline" size={80} color="#9d174d" />
            <Text style={styles.title}>Oops! Something went wrong.</Text>
            <Text style={styles.message}>
              An unexpected error occurred. We've logged the problem and are working on it.
            </Text>
            
            {this.state.error && (
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>{this.state.error.toString()}</Text>
              </View>
            )}

            <TouchableOpacity style={styles.button} onPress={this.handleRetry}>
              <Text style={styles.buttonText}>Try Again</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
    justifyContent: "center",
  },
  content: {
    alignItems: "center",
    padding: 32,
    paddingTop: 100,
  },
  title: {
    fontSize: 24,
    fontFamily: "Zalando-Bold",
    color: "#1f2937",
    marginTop: 24,
    textAlign: "center",
  },
  message: {
    fontSize: 16,
    fontFamily: "Zalando-Regular",
    color: "#6b7280",
    textAlign: "center",
    marginTop: 12,
    lineHeight: 24,
  },
  errorBox: {
    width: "100%",
    backgroundColor: "#f9fafb",
    borderRadius: 12,
    padding: 16,
    marginTop: 24,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  errorText: {
    fontSize: 12,
    fontFamily: "monospace",
    color: "#ef4444",
  },
  button: {
    backgroundColor: "#9d174d",
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 24,
    marginTop: 32,
  },
  buttonText: {
    color: "#ffffff",
    fontSize: 16,
    fontFamily: "Zalando-SemiBold",
  },
});
