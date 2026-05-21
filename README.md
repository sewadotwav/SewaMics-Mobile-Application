# SewaMics - Ceramic Mug E-Commerce App (Personal Learning Project)

<p align="center">
  <img src="https://img.shields.io/badge/React_Native-0.81.5-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React Native">
  <img src="https://img.shields.io/badge/Expo-54.0.6-000020?style=for-the-badge&logo=expo&logoColor=white" alt="Expo">
  <img src="https://img.shields.io/badge/Firebase-10.12.0-FFCA28?style=for-the-badge&logo=firebase&logoColor=black" alt="Firebase">
  <img src="https://img.shields.io/badge/TypeScript-5.4.5-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript">
  <img src="https://img.shields.io/badge/License-MIT-green.svg?style=for-the-badge" alt="License">
</p>

A comprehensive, agent-driven e-commerce platform for ceramic mugs and specialty items, built with modern React Native and Firebase technologies. The platform features a beautiful, cross-platform customer-facing application with seamless product browsing, order tracking, and secure payment processing.

*Note: This project embraces an intuitive, agent-driven development workflow, where the codebase is iteratively crafted through continuous AI collaboration rather than strictly traditional manual authoring.*

---

## Table of Contents

- [Features](#features)
- [Demo](#demo)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
  - [Basic Setup](#1-basic-setup)
  - [Service Configuration](#2-service-configuration)
- [Usage](#usage)
- [Project Structure](#project-structure)
- [Technologies Used](#technologies-used)
- [Recent Updates](#recent-updates)
- [Testing](#testing)
- [License](#license)
- [Contact](#contact)
- [Troubleshooting](#troubleshooting)

---

## Features

### Mobile App
- **Cross-Platform Support** - Works seamlessly on iOS, Android, and Web using Expo.
- **Product Catalog** - Browse ceramic mugs and items beautifully with smooth navigation.
- **Shopping Cart** - Add/remove items, update quantities, real-time total calculation.
- **User Authentication** - Secure login, registration, and profile management using Firebase.
- **Order Management** - Place orders, track status, and view order history.
- **Real-time Synchronization** - Instant updates for products, carts, and orders using Firestore.
- **Responsive Design** - Optimized for various screen sizes with safe area context.
- **Payment Processing** - Stripe integration for secure credit/debit card transactions.
- **Email Notifications** - Automated email handling using **EmailJS** integration.
- **Third-Party Auth & Services** - Leveraging **Google APIs** for seamless integrations.
- **AI Chatbot Support** - An integrated conversational assistant powered by Google's **Gemini 2.5 Flash API**.

### Backend & Infrastructure
- **Firebase Backend** - Leverages Firestore for a robust NoSQL database and Auth for user sessions.
- **Serverless Functions** - Cloud Functions for backend processes.
- **Admin Capabilities** - Managed securely via Firebase Admin SDK.
- **Real-time Database** - Live synchronization across all connected clients.
- **Secure Transactions** - Handled securely through Stripe React Native.

### Security Features
- **Authentication** - Firebase Auth protection.
- **Database Rules** - Firestore security rules to protect user data.
- **Secure Payments** - Tokenized payment details via Stripe.
- **Environment Variables** - Protected API keys and sensitive configuration.

---

## Demo

**Public App**: Run locally via Expo or Web Browser  

> **Note**: This is a development project. Use Expo Go on your mobile device or run the web version for the best experience.

---

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** >= 18.x and npm/yarn
- **Expo CLI** (`npm install -g expo-cli`)
- **A Firebase Project**
- **Stripe Account**
- **EmailJS Account**
- **Google Cloud Console Project** (for Google APIs)
- **Google AI Studio Account** (for Gemini API Key)

---

## Installation

### 1. Basic Setup

#### Clone the Repository
```bash
git clone https://github.com/sewadotwav/SewaMics.git
cd SewaMics
```

#### Install Dependencies
```bash
npm install
```

#### Create Environment File
Copy the example environment file and update with your credentials:
```bash
# Windows (PowerShell)
copy .env.example .env.local

# macOS/Linux
cp .env.example .env.local
```

### 2. Service Configuration

#### Firebase Setup
1. Create a project in the [Firebase Console](https://console.firebase.google.com/).
2. Enable Firestore Database and Firebase Authentication.
3. Create the required collections: `users`, `products`, `carts`, `orders`.
4. Add your Firebase configuration to `firebase/config.js` or your environment variables.

#### Stripe Setup
1. Get your publishable key from the Stripe Dashboard.
2. Add it to your `.env.local`.

#### EmailJS, Google APIs & Gemini Setup
1. Set up your EmailJS service, template, and public key.
2. Obtain necessary Google API credentials from the Google Cloud Console.
3. Get a Gemini API Key from Google AI Studio.
4. Add these credentials to your `.env.local`.

---

## Usage

### Starting the Development Server

```bash
# Start Expo development server (offline mode supported)
npm start
```

Access the application on specific platforms:
```bash
npm run android   # For Android emulator/device
npm run ios       # For iOS simulator/device
npm run web       # For Web browser
```

---

## Project Structure

```text
SewaMics/
├── src/
│   ├── components/    # Reusable UI components
│   ├── pages/         # Screen components
│   ├── services/      # API and backend integrations
│   ├── utils/         # Helper functions
│   └── App.js         # Entry point
├── firebase/          # Firebase configuration files
├── assets/            # Images, fonts, etc.
├── package.json       # Project dependencies
└── README.md          # Project documentation
```

---

## Technologies Used

### Frontend & Core
- **React Native (0.81.5)** - Mobile UI Framework
- **Expo (~54.0.6)** - React Native toolchain
- **React Navigation v7** - App routing and navigation
- **TypeScript** - Static typing

### Backend & Services
- **Firebase (v10)** - Authentication, Firestore, Cloud Functions
- **Firebase Admin** - Server-side Firebase management

### Third-Party APIs & Integrations
- **Stripe** - Payment processing gateway (`@stripe/stripe-react-native`)
- **EmailJS** - Client-side email sending service
- **Google APIs** - Authentication and related services
- **Gemini 2.5 Flash API** - Fast, lightweight LLM for the AI Chatbot assistant

### Development Tools
- **Node.js** - JavaScript runtime
- **npm/yarn** - Package managers

---

## Recent Updates

- **AI Chatbot**: Fully integrated an intelligent assistant powered by Google's **Gemini 2.5 Flash API** to answer styling and retail questions.
- **API Integrations**: Added support for **Google APIs** and **EmailJS** for enhanced communications and authentication.
- **Navigation Overhaul**: Integrated cross-platform navigation using React Navigation v7.
- **Payment Gateway**: Set up secure payment flows with Stripe React Native.
- **Database Schema**: Established real-time database schema for users, products, carts, and orders.
- **Agent-Assisted Workflow**: Adopted an intelligent, agent-driven development workflow to rapidly iterate on features and optimizations.

---

## Testing

```bash
# Run type checking
npm run type-check

# Run automated tests (if configured)
npm test
```

---

## License

This project is licensed under the **MIT License** - see the LICENSE file for details.

---

## Contact

### Project Links
- **Repository**: [https://github.com/sewadotwav/SewaMics](https://github.com/sewadotwav/SewaMics)

### Get In Touch
- **Author**: Dimalanta, Miles C.

---

## Troubleshooting

### Common Issues

#### Issue: "Expo server won't start"
**Solution:**
Clear the metro bundler cache:
```bash
npx expo start -c
```

#### Issue: "Firebase permission denied"
**Solution:**
Check your Firestore security rules and ensure you are authenticated properly in the app. Also verify that your Firebase config in `.env.local` is correct.

#### Issue: "Stripe initialization failed"
**Solution:**
Ensure your Stripe publishable key is correctly loaded in the `StripeProvider` at the root of your application.

#### Issue: "Emails not sending via EmailJS"
**Solution:**
Ensure your Service ID, Template ID, and Public Key are correctly populated in your environment variables and match your EmailJS dashboard.

#### Issue: "AI Chatbot unresponsive or failing"
**Solution:**
Verify that your `EXPO_PUBLIC_GEMINI_API_KEY` is present and active in `.env.local`. Ensure your device has an active internet connection to contact the Google Gemini API endpoint.

---

<p align="center">Made with care by the SewaMics Team</p>
<p align="center">© 2026 SewaMics. All rights reserved.</p>
