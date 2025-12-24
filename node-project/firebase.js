var admin = require("firebase-admin");
// ★ 引入 getFirestore 用來抓取指定資料庫
var { getFirestore } = require("firebase-admin/firestore"); 

var serviceAccount = require("./serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: "oo-project-dedbd.firebasestorage.app"
});

// ★ 關鍵修正：直接在這裡指定資料庫名稱 'oo-base'
const db = getFirestore('oo-base');
const bucket = admin.storage().bucket();
const auth = admin.auth();

// 測試連線 (這行會告訴我們到底連去哪了)
db.listCollections()
  .then(() => console.log("✅ 成功連線到資料庫：oo-base"))
  .catch(err => {
    console.error("❌ 連線失敗！請檢查 serviceAccountKey.json");
    console.error("錯誤代碼:", err.code); // 應該是 5 NOT_FOUND
    console.error("錯誤訊息:", err.message);
  });

module.exports = { admin, db, bucket, auth };