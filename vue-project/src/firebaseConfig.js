import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBGnMmziDY7U8joHDkrH2cRE_vH2sNPgto",
  authDomain: "oo-project-dedbd.firebaseapp.com",
  projectId: "oo-project-dedbd",
  storageBucket: "oo-project-dedbd.firebasestorage.app",
  messagingSenderId: "19707691140",
  appId: "1:19707691140:web:d63a76a3bddc97778002d1",
  measurementId: "G-2P7X1V0VBM"
};

// 初始化 Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, "oo-base");