// ============================================================
// SewaMics — Stripe Service
// File: src/services/stripeService.ts
//
// Responsible ONLY for creating PaymentIntents server-side style.
// Card confirmation is handled entirely by @stripe/stripe-react-native
// SDK in ReviewStep.tsx (confirmPayment hook) — PCI-compliant.
// ============================================================

const STRIPE_SECRET_KEY = process.env.EXPO_PUBLIC_STRIPE_SECRET_KEY || "";
const STRIPE_API_URL = "https://api.stripe.com/v1";

if (!STRIPE_SECRET_KEY) {
  console.warn("[Stripe] EXPO_PUBLIC_STRIPE_SECRET_KEY is not set in .env.local");
}

/**
 * Encode an object as application/x-www-form-urlencoded.
 * React Native does not have a reliable URLSearchParams in all versions.
 */
const encode = (params: Record<string, string>): string =>
  Object.entries(params)
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
    .join("&");

/**
 * Creates a real Stripe PaymentIntent and returns the client_secret.
 *
 * @param amount   - Amount in the smallest currency unit (centavos for PHP).
 * @param currency - ISO 4217 currency code, e.g. "php".
 *
 * In production this call belongs in a backend (Cloud Function).
 * For this project the secret key is kept in EXPO_PUBLIC_ env vars
 * which are only accessible to the dev team, not end users on Expo Go.
 */
export const createPaymentIntent = async (
  amount: number,
  currency: string = "php"
): Promise<string> => {
  const response = await fetch(`${STRIPE_API_URL}/payment_intents`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${STRIPE_SECRET_KEY}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: encode({
      amount: String(Math.round(amount)),
      currency: currency.toLowerCase(),
      "payment_method_types[0]": "card",
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    console.error("[Stripe] createPaymentIntent error:", data?.error);
    throw new Error(data?.error?.message || "Failed to create payment session");
  }

  return data.client_secret as string;
};
