// Firebase Admin SDK — server-side only
// Used to verify Firebase ID tokens in NextAuth authorize callback
import * as admin from "firebase-admin";

if (!admin.apps.length) {
    const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_JSON
        ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON)
        : null;

    if (serviceAccount) {
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount),
        });
    } else {
        // Fallback: use GOOGLE_APPLICATION_CREDENTIALS env or default ADC
        admin.initializeApp();
    }
}

export const adminAuth = admin.auth();
export default admin;
