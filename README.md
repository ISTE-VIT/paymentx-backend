# PaymentX Backend

PaymentX Backend is the API server for PaymentX, enabling secure NFC-based offline payments for campus environments. It provides endpoints for user registration, wallet management, and transaction processing, all secured with Firebase authentication and MongoDB.

## Features
- User & merchant registration (with college email, NFC ID, PIN)
- Wallet top-up, withdrawal, and balance check
- NFC tap-to-pay (offline for users, online for merchants)
- Transaction history for users and merchants
- Firebase authentication and PIN protection

## Quick Start

1. **Clone the repository:**
   ```bash
   git clone https://github.com/ISTE-VIT/paymentx-backend.git
   cd paymentx-backend
   ```
2. **Install dependencies:**
   ```bash
   npm install
   ```
3. **Set up environment variables:**
   Create a `.env` file in the root directory with:
   ```env
   MONGO_URI=your_mongodb_connection_string
   FIREBASE=base64_encoded_firebase_service_account_json
   PROJECT_ID=your_firebase_project_id
   ```
   
4. **Start the server:**
   ```bash
   npm start
   ```
   The server runs on [http://localhost:3000](http://localhost:3000) by default.

## API Overview
- All endpoints are under `/api/users`, `/api/wallets`, or `/api/transactions`
- All endpoints require a valid Firebase ID token in the `Authorization` header

## Project Structure
- `app.js` — Express app setup, routes, middleware
- `server.js` — Server entry point
- `config/` — Firebase and MongoDB config
- `middleware/` — Authentication middleware
- `models/` — Mongoose models (User, Wallet, Transaction)
- `routes/` — API endpoints

---

For more details, see the code or contact the maintainer.
