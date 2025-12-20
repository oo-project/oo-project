const admin = require('firebase-admin');

// 1. 引入 dotenv (這樣才能讀到 .env 檔案)
require('dotenv').config();

// 2. 檢查變數是否讀取成功 (除錯用，上線可拿掉)
// console.log('Project ID:', process.env.FIREBASE_PROJECT_ID);

// 3. 重新組裝金鑰物件
// ⚠️ 特別注意 private_key 的處理：.env 讀進來的 \n 可能會變成純文字，需要轉換
const serviceAccount = {
  projectId: process.env.FIREBASE_PROJECT_ID,
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  privateKey: process.env.FIREBASE_PRIVATE_KEY 
    ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n') 
    : undefined
};

// 檢查是否有缺漏
if (!serviceAccount.projectId || !serviceAccount.privateKey || !serviceAccount.clientEmail) {
  console.error("❌ 錯誤：找不到 Firebase 環境變數，請確認 .env 檔案設定正確。");
  process.exit(1); // 強制結束程式
}

// 4. 初始化
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();
// 如果需要指定資料庫名稱
db.settings({ databaseId: 'oo-base' });

module.exports = { db, admin };