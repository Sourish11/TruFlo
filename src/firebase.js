import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

//Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCbPRY4e1vGdzyMWtm-SY-oYUPkB_YVhz0",
  authDomain: "user-emails-database-truflo.firebaseapp.com",
  projectId: "user-emails-database-truflo",
  storageBucket: "user-emails-database-truflo.appspot.com",
  messagingSenderId: "363592856594",
  appId: "1:363592856594:web:7d50fa971d92b33a4c14cb",
  measurementId: "G-CLF7K39EFY"
};

export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);