import dotenv from "dotenv";
import { initializeApp, cert } from "firebase-admin/app";

dotenv.config();

const accountJson = process.env.FIREBASE_SERVICE_ACCOUNT;

if (!accountJson) {
  throw new Error("FIREBASE_SERVICE_ACCOUNT is missing. Check your .env file.");
}

const serviceAccount = JSON.parse(accountJson);

export const app = initializeApp({
  credential: cert(serviceAccount),
});
