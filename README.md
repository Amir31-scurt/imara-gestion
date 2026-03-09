# Imara Gestion

A beautiful, optimized, and secure dashboard built for Imara Maison to manage luxury fashion orders, expenses, and track collection periods.

## ✨ Features

- **Secure Authentication**: Protected routes with Firebase Auth. Non-authenticated users are automatically redirected to the login page.
- **Order Management (CRUD)**: Create, Read, Update, and permanently Delete customer orders.
- **Smart Archiving**: Move old or completed orders to an archive to keep your active list clean without losing historical data.
- **Financial Dashboard**:
  - Automatically calculates total revenue, expenses, and net balance.
  - Groups profits and expenses strictly by **Collection Period** (e.g., "March 2026").
- **Expense Tracking**: Log all business expenses and withdrawals to maintain accurate Net Balance calculations.
- **Admin PIN Protection**: Irreversible actions (like permanently deleting an order or expense) are protected by a required Admin PIN code.
- **Real-Time Synergy**: Built with Redux Toolkit Query (RTK) and Firebase onSnapshot listeners for instant synchronization across your dashboard. Optimistic updates ensure the UI feels lightning fast.
- **Dynamic Filtering**: Quickly search via client name and dynamically filter by active status or collection grouping.

## 🛠️ Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS & Vanilla CSS Variables
- **State Management**: Redux Toolkit (RTK Query)
- **Database / Auth**: Firebase (Firestore & Firebase Auth)
- **Icons**: Lucide React
- **Notifications**: React Hot Toast

## 🚀 Getting Started

### 1. Requirements
- Node.js (v18 or higher recommended)
- A Firebase Project with Firestore and Authentication (Email/Password) enabled.

### 2. Installation
Clone the repository and install dependencies:
```bash
git clone https://github.com/Amir31-scurt/imara-gestion.git
cd "Imara Gestion"
npm install
```

### 3. Environment Setup
Create a `.env.local` file in the root directory and add your Firebase configuration credentials:

```bash
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

### 4. Firestore Security Rules
Ensure your Firestore database uses the following security rules to protect your records:

```javascript
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    match /orders/{orderId} {
      allow create: if request.auth != null && request.resource.data.userId == request.auth.uid;
      allow read, update, delete: if request.auth != null && resource.data.userId == request.auth.uid;
    }
    match /expenses/{expenseId} {
      allow create: if request.auth != null && request.resource.data.userId == request.auth.uid;
      allow read, update, delete: if request.auth != null && resource.data.userId == request.auth.uid;
    }
  }
}
```
*(Note: A composite index on `userId` (ASC) and `createdAt` (DESC) is required for both `orders` and `expenses` collections).*

### 5. Start Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## 🎨 Design & Interaction
The application is strictly designed following modern luxury aesthetics. It utilizes deep, elegant styling choices (dark modes, glassmorphism hints) and smooth CSS/React micro-animations to create a premium feel right out of the box.
