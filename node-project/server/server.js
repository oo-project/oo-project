const express = require('express');
const cors = require('cors');
const admin = require('firebase-admin');
const { getFirestore } = require("firebase-admin/firestore");
// ★ 1. 引入 Storage 功能
const { getStorage } = require("firebase-admin/storage");

const app = express();
const PORT = 3000;

// ★ 2. 設定增加限制，因為簽名圖片的 Base64 字串比較長
app.use(express.json({ limit: '10mb' }));
app.use(cors());


const serviceAccount = require("/serviceAccountKey.json");

// ★ 3. 初始化 (記得填入你的 Storage Bucket 網址)
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    // 請去 Firebase Console -> Storage 複製那個 gs:// 後面的網址 (不含 gs://)
    storageBucket: "oo-project-dedbd.firebasestorage.app" 
  });
}

const db = getFirestore();
const bucket = getStorage().bucket();


// 原本的 GET API
app.get('/api/contracts', async (req, res) => {
  try {
    const snapshot = await db.collection('contracts').get();
    const list = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    res.json(list);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ★★★ 4. 新增：簽約 API (上傳簽名圖 + 更新狀態) ★★★
app.put('/api/contracts/:id/sign', async (req, res) => {
  try {
    const contractId = req.params.id;
    const { signatureImage } = req.body; // 前端傳來的 Base64 字串

    if (!signatureImage) {
      return res.status(400).send("缺少簽名圖片");
    }

    console.log(`正在處理合約 ${contractId} 的簽名...`);

    // --- A. 把 Base64 轉成圖片檔案 ---
    // 去掉開頭的 "data:image/png;base64," 才能存成圖片
    const base64Data = signatureImage.replace(/^data:image\/\w+;base64,/, "");
    const imageBuffer = Buffer.from(base64Data, 'base64');

    // --- B. 上傳到 Firebase Storage ---
    // 設定檔案路徑： signatures/合約ID.png
    const file = bucket.file(`signatures/${contractId}.png`);
    
    await file.save(imageBuffer, {
      metadata: { contentType: 'image/png' }
    });

    // --- C. 取得公開下載連結 ---
    // 設定連結有效期限 (例如 100 年)
    const [signedUrl] = await file.getSignedUrl({
      action: 'read',
      expires: '03-01-2125'
    });

    // --- D. 更新 Firestore 資料庫 ---
    const today = new Date().toISOString().split('T')[0]; // 取得今天日期 YYYY-MM-DD

    await db.collection('contracts').doc(contractId).update({
      status: 'history',       // 狀態變更為歷史紀錄
      signedDate: today,       // 寫入簽約日期
      signatureImage: signedUrl // 寫入剛剛產生的圖片網址
    });

    console.log("簽約成功！圖片網址:", signedUrl);
    res.json({ success: true, url: signedUrl });

  } catch (error) {
    console.error("簽約失敗:", error);
    res.status(500).json({ error: "簽約失敗" });
  }
});

app.listen(PORT, () => {
  console.log(`後端伺服器運行在 http://localhost:${PORT}`);
});