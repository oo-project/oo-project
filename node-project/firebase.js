const admin = require('firebase-admin');
require('dotenv').config(); // 記得要這行

// 檢查變數有沒有讀到 (除錯用)
if (!process.env.FIREBASE_PRIVATE_KEY) {
  console.error('❌ 錯誤：找不到環境變數 FIREBASE_PRIVATE_KEY');
  process.exit(1);
}

const serviceAccount = {
  projectId: process.env.FIREBASE_PROJECT_ID,
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
};

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: "oo-project-dedbd"
});



const db = admin.firestore();
db.settings({ databaseId: 'oo-base' }); // 如果您有自訂資料庫名稱
const bucket = admin.storage().bucket();

module.exports = { db, admin, bucket };