require('dotenv').config(); // 1. 務必在最上面引入 dotenv
const admin = require('firebase-admin');

// 2. 將 serviceAccount 從檔案讀取改為組裝物件
const serviceAccount = {
  "type": "service_account",
  "project_id": process.env.FIREBASE_PROJECT_ID,
  "private_key_id": process.env.FIREBASE_PRIVATE_KEY_ID,
  
  // ★★★ 超級關鍵：處理 Private Key 的換行符號 ★★★
  // .env 讀進來時換行符號會變成字串 "\\n"，必須轉回真正的換行 '\n'
  "private_key": process.env.FIREBASE_PRIVATE_KEY 
    ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n') 
    : undefined,
    
  "client_email": process.env.FIREBASE_CLIENT_EMAIL,
  "client_id": process.env.FIREBASE_CLIENT_ID,
  // 下面這些通常是固定的，也可以寫死或放入 env
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": process.env.FIREBASE_CLIENT_CERT_URL
};

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  // 建議 Storage Bucket 也放到 .env，如果沒有就用後面的預設值
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET || "oo-project-dedbd" 
});

const db = admin.firestore();

// 設定 Database ID (保持您原本的設定)
db.settings({
    databaseId: 'oo-base'
});

const bucket = admin.storage().bucket();

// 匯出讓其他檔案可以用
module.exports = { admin, db, bucket };