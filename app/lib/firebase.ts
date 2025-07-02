// lib/firebase.ts
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getDatabase } from "firebase/database";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBTi0tIQA_0MFww4gl_e32aVxzQlQ99NdM",
  authDomain: "ukcc-email-sender.firebaseapp.com",
  databaseURL: "https://ukcc-email-sender-default-rtdb.europe-west1.firebasedatabase.app", // Updated URL - check this!
  projectId: "ukcc-email-sender",
  storageBucket: "ukcc-email-sender.firebasestorage.app",
  messagingSenderId: "466518188764",
  appId: "1:466518188764:web:3d0a0c49961caa32040a19",
  measurementId: "G-K7CQRQF4GV"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Analytics (only in browser)
let analytics;
if (typeof window !== 'undefined') {
  analytics = getAnalytics(app);
}

// Initialize Realtime Database
const database = getDatabase(app);

export { app, analytics, database };