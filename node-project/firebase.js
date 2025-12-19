const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

// 初始化 Firebase
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();
// 如果需要指定資料庫名稱，在這裡設定
db.settings({ databaseId: 'oo-base' });

// 匯出 db 和 admin 讓別的檔案可以用
module.exports = { db, admin };