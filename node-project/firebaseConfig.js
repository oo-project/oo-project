require('dotenv').config();
const admin = require("firebase-admin");
const { getFirestore } = require("firebase-admin/firestore");

// 1. 準備金鑰 
const serviceAccount = {
  "type": "service_account",
  "project_id": process.env.FIREBASE_PROJECT_ID,
  "private_key_id": process.env.FIREBASE_PRIVATE_KEY_ID,
  "private_key": process.env.FIREBASE_PRIVATE_KEY 
    ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n') 
    : undefined,
  "client_email": process.env.FIREBASE_CLIENT_EMAIL,
  "client_id": process.env.FIREBASE_CLIENT_ID,
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": process.env.FIREBASE_CLIENT_CERT_URL
};

// 2. 先初始化
try {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET || "oo-project-dedbd.firebasestorage.app"
  });
  console.log("✅ Firebase 初始化成功");
} catch (error) {
  console.error("❌ Firebase 初始化失敗 (檢查金鑰或 .env):", error.message);
  throw error;
}

// 3. 初始化之後，才可以連線資料庫
const db = getFirestore('oo-base');
const bucket = admin.storage().bucket();
const auth = admin.auth();

// 4. 測試連線
db.listCollections()
  .then(() => console.log("✅ 成功連線到資料庫：oo-base"))
  .catch(err => console.error("❌ 資料庫連線失敗:", err.message));

// 5. 匯出
module.exports = { admin, db, bucket, auth };