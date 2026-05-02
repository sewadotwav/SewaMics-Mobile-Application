# SewaMics

A comprehensive e-commerce platform for fresh produce and specialty items, built with modern web technologies and cloud infrastructure.

## Overview

SewaMics is a full-stack e-commerce application designed to facilitate the seamless buying and selling of fresh fruits, vegetables, seafood, and specialty products. The platform emphasizes user experience, inventory management, and secure transaction handling.

## Architecture

### Technology Stack

**Frontend**
- React.js / Next.js
- Tailwind CSS
- Redux / Context API

**Backend**
- Firebase (Firestore, Authentication, Cloud Functions)
- Node.js (optional backend services)

**Database**
- Firestore (NoSQL)
- Real-time synchronization

**Hosting**
- Firebase Hosting
- Cloud Storage

## Project Structure

```
SewaMics/
├── public/
├── src/
│   ├── components/
│   ├── pages/
│   ├── services/
│   ├── utils/
│   └── App.js
├── firebase/
│   └── config.js
├── .env.local
└── README.md
```

## Database Collections

### Collections Schema

**users**
- User authentication and profile management
- Multiple address storage
- Notification preferences

**products**
- Product catalog with pricing and inventory
- Category classification
- Stock management

**carts**
- User shopping carts
- Real-time item tracking
- Cart state management

**orders**
- Order history and tracking
- Payment and shipping information
- Order status management

## Features

- User authentication and authorization
- Product browsing and search functionality
- Shopping cart management
- Order placement and tracking
- Real-time inventory updates
- Order status notifications
- Secure payment processing
- User profile management with multiple addresses

## Getting Started

### Prerequisites

- Node.js (v14+)
- npm or yarn
- Firebase account

### Installation

1. Clone the repository
```bash
git clone https://github.com/sewadotwav/SewaMics.git
cd SewaMics
```

2. Install dependencies
```bash
npm install
```

3. Configure environment variables
```bash
cp .env.example .env.local
```

4. Update Firebase credentials in `firebase/config.js`

5. Start the development server
```bash
npm start
```

## Available Scripts

```bash
npm start       # Run development server
npm build       # Build for production
npm test        # Run tests
npm deploy      # Deploy to Firebase Hosting
```

## Firebase Setup

1. Create a Firebase project
2. Enable Firestore Database
3. Set up Firebase Authentication
4. Create required collections: `users`, `products`, `carts`, `orders`
5. Configure Firestore security rules
6. Add Firebase configuration to `.env.local`

## Database Schema

See `firebase_schema.json` for detailed collection structure and field definitions.

## Mock Data

Mock data for development and testing is available in `firebase_mock_data.json`.

## Security

- Firebase Authentication for user verification
- Firestore security rules for data protection
- Environment variables for sensitive credentials
- HTTPS for all connections


## Authors

- Dimalanta, Miles C.



---

**Note:** This is a practice project for learning and development purposes.
