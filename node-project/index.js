const express = require('express');
const cors = require('cors');
const admin = require('firebase-admin');
const { PDFDocument } = require('pdf-lib');
const fontkit = require('@pdf-lib/fontkit');
const fs = require('fs');
const axios = require('axios'); // ★ 必須安裝：npm install axios

const app = express();
app.use(cors());
app.use(express.json({ limit: '50mb' })); // 提高限制以免傳圖檔/PDF時爆掉

// --- Firebase 初始化 ---
const serviceAccount = require('./serviceAccountKey.json'); // 請確認檔名正確
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  // 請把下面的 oo-project-xxxx 改成你 serviceAccountKey.json 裡面寫的 project_id
  storageBucket: "oo-project-dedbd"
});

const db = admin.firestore();
db.settings({
    databaseId: 'oo-base'  // ★★★ 關鍵就是加這行！
});
const bucket = admin.storage().bucket();

app.get('/api/contracts', async (req, res) => {
  try {
    // ★★★ 先拿掉 orderBy，只保留 .get() ★★★
    const snapshot = await db.collection('contracts').get();
    
    const leases = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json(leases);
  } catch (error) {
    console.error("讀取失敗:", error); // 確保錯誤印在終端機
    res.status(500).json({ error: error.message });
  }
});

// --- API 2: 建立新租約 (生成可編輯 PDF) ---
app.post('/api/contracts', async (req, res) => {
  try {
    const newContract = req.body;
    
    // 1. 解構資料
    const { 
      landlordName, tenantName, address, price, 
      periodStart, periodEnd, otherTerms,
      depositMonths, depositFee 
    } = newContract;

    // 2. 準備日期 (轉民國年)
    // (A) 簽約日 (Today)
    const today = new Date();
    const tYear = (today.getFullYear() - 1911).toString();
    const tMonth = (today.getMonth() + 1).toString();
    const tDate = today.getDate().toString();

    // (B) 租期起
    const [sY, sM, sD] = (periodStart || '--').split('-');
    const sYearROC = sY ? (parseInt(sY) - 1911).toString() : '';

    // (C) 租期訖
    const [eY, eM, eD] = (periodEnd || '--').split('-');
    const eYearROC = eY ? (parseInt(eY) - 1911).toString() : '';

    // 3. 讀取 PDF 與字體
    // ★ 請確認這兩個檔案存在於 node-project 根目錄
    const templateBytes = fs.readFileSync('./template_contract.pdf');
    const pdfDoc = await PDFDocument.load(templateBytes);
    
    pdfDoc.registerFontkit(fontkit);
    const fontBytes = fs.readFileSync('./kaiu.ttf');
    const customFont = await pdfDoc.embedFont(fontBytes);

    // 4. 填寫表單
    const form = pdfDoc.getForm();
    
    const setField = (fieldName, text) => {
      try {
        const field = form.getTextField(fieldName);
        if (field) {
          field.setText(text ? text.toString() : ''); 
          field.updateAppearances(customFont); 
        }
      } catch (e) {
        // 忽略找不到欄位的錯誤
      }
    };

    // --- 填入 14 個欄位 ---
    setField('todayyear', tYear);
    setField('todaymonth', tMonth);
    setField('todaydate', tDate);
    setField('depositmonth', depositMonths);
    setField('depositfee', depositFee);
    setField('landlordName', landlordName);
    setField('tenantName', tenantName);
    setField('rentAmount', price);
    setField('periodStartyear', sYearROC);
    setField('periodStartmonth', sM);
    setField('periodStartdate', sD);
    setField('periodEndyear', eYearROC);
    setField('periodEndmonth', eM);
    setField('periodEnddate', eD);
    
    if(otherTerms) setField('otherTerms', otherTerms);
    if(address) setField('address', address);

    // ★ 關鍵：不平面化 (form.flatten())，保留藍色框框供房東編輯

    // 5. 存檔並上傳
    const pdfBytes = await pdfDoc.save();
    const filename = `contracts/${Date.now()}_${tenantName}.pdf`;
    const file = bucket.file(filename);
    
    await file.save(Buffer.from(pdfBytes), { 
      contentType: 'application/pdf',
      metadata: { contentType: 'application/pdf' }
    });
    
    const [url] = await file.getSignedUrl({ action: 'read', expires: '03-01-2125' });

    // 6. 寫入資料庫
    const finalContractData = {
        ...newContract,
        pdfUrl: url,
        createdAt: new Date().toISOString()
    };

    const docRef = await db.collection('contracts').add(finalContractData);

    console.log("✅ 租約建立成功，可編輯 PDF URL:", url);
    res.json({ success: true, id: docRef.id, pdfUrl: url });

  } catch (error) {
    console.error("建立租約失敗:", error);
    res.status(500).json({ error: "建立失敗: " + error.message });
  }
});

// --- API 3: 房東上傳修改後的 PDF (覆蓋) ---
app.put('/api/contracts/:id/update-pdf', async (req, res) => {
  try {
    const contractId = req.params.id;
    const { pdfBase64 } = req.body;

    if (!pdfBase64) return res.status(400).json({ error: "無檔案資料" });

    const base64Data = pdfBase64.replace(/^data:application\/pdf;base64,/, "");
    const buffer = Buffer.from(base64Data, 'base64');

    const filename = `contracts/${contractId}_updated_${Date.now()}.pdf`;
    const file = bucket.file(filename);
    
    await file.save(buffer, { 
      contentType: 'application/pdf',
      metadata: { contentType: 'application/pdf' }
    });

    const [url] = await file.getSignedUrl({ action: 'read', expires: '03-01-2125' });

    await db.collection('contracts').doc(contractId).update({
      pdfUrl: url
    });

    res.json({ success: true, url });

  } catch (error) {
    console.error("更新合約失敗:", error);
    res.status(500).json({ error: error.message });
  }
});

// --- API 4: 房東簽名 (合成簽名並生效) ---
app.put('/api/contracts/:id/landlord-sign', async (req, res) => {
  try {
    const contractId = req.params.id;
    const { signatureImage } = req.body; // Base64 圖檔

    if (!signatureImage) return res.status(400).json({ error: "無簽名資料" });

    // 1. 取得目前合約資訊
    const docRef = db.collection('contracts').doc(contractId);
    const doc = await docRef.get();
    if (!doc.exists) return res.status(404).json({ error: "合約不存在" });
    const { pdfUrl } = doc.data();

    // 2. 下載 PDF
    const pdfResponse = await axios.get(pdfUrl, { responseType: 'arraybuffer' });
    const existingPdfBytes = pdfResponse.data;

    // 3. 載入 PDF & 簽名圖
    const pdfDoc = await PDFDocument.load(existingPdfBytes);
    const pngImageBytes = Buffer.from(signatureImage.replace(/^data:image\/png;base64,/, ""), 'base64');
    const pngImage = await pdfDoc.embedPng(pngImageBytes);

    // 4. 繪製簽名 (預設畫在第一頁，位置 x:100, y:150，請自行調整)
    const pages = pdfDoc.getPages();
    const firstPage = pages[0]; // 或最後一頁 pages[pages.length - 1]
    const pngDims = pngImage.scale(0.25); // 縮放比例

    firstPage.drawImage(pngImage, {
      x: 100, // ★ 請調整這裡的座標來對齊你的 Signaturelandlord 欄位
      y: 150, 
      width: pngDims.width,
      height: pngDims.height,
    });

    // 5. 平面化 (鎖定合約)
    const form = pdfDoc.getForm();
    try { form.flatten(); } catch(e) {}

    // 6. 上傳最終版
    const pdfBytes = await pdfDoc.save();
    const filename = `contracts/${contractId}_signed_${Date.now()}.pdf`;
    const file = bucket.file(filename);
    await file.save(Buffer.from(pdfBytes), { contentType: 'application/pdf' });
    const [url] = await file.getSignedUrl({ action: 'read', expires: '03-01-2125' });

    // 7. 更新狀態
    await docRef.update({
      pdfUrl: url,
      status: 'completed',
      landlordSignedAt: new Date().toISOString()
    });

    res.json({ success: true, url });

  } catch (error) {
    console.error("簽名失敗:", error);
    res.status(500).json({ error: error.message });
  }
});

// --- API 5: 取得某房源的真實房客 (修正版) ---
app.get('/api/room-tenants', async (req, res) => {
  try {
    const { rentalId } = req.query; // 前端傳來的房源 ID

    if (!rentalId) return res.json([]);

    // 1. 去 'appointments' 集合找資料
    // 條件：欄位 rentalId 必須等於 前端傳來的 rentalId
    const snapshot = await db.collection('appointments')
      .where('rentalId', '==', rentalId)
      .get();

    if (snapshot.empty) {
      return res.json([]); // 如果沒人預約，回傳空陣列
    }

    // 2. 整理資料回傳
    const tenants = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: data.tenantId,      // 房客的 User ID
        name: data.tenantName,  // 房客姓名 (請確認你的資料庫欄位是叫 tenantName 嗎?)
        status: data.status || 'applied'
      };
    });

    res.json(tenants);

  } catch (error) {
    console.error("讀取房客失敗:", error);
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 3000;

// --- API 6: 房客簽名 (Tenant Sign) ---
app.put('/api/contracts/:id/tenant-sign', async (req, res) => {
  try {
    const contractId = req.params.id;
    const { signatureImage } = req.body; // Base64 簽名圖

    if (!signatureImage) return res.status(400).json({ error: "無簽名資料" });

    // 1. 取得目前合約
    const docRef = db.collection('contracts').doc(contractId);
    const doc = await docRef.get();
    if (!doc.exists) return res.status(404).json({ error: "合約不存在" });
    const { pdfUrl } = doc.data();

    // 2. 下載目前的 PDF
    const pdfResponse = await axios.get(pdfUrl, { responseType: 'arraybuffer' });
    const existingPdfBytes = pdfResponse.data;

    // 3. 載入 PDF & 簽名圖
    const pdfDoc = await PDFDocument.load(existingPdfBytes);
    const pngImageBytes = Buffer.from(signatureImage.replace(/^data:image\/png;base64,/, ""), 'base64');
    const pngImage = await pdfDoc.embedPng(pngImageBytes);

    // 4. 繪製房客簽名
    // ★★★ 注意：這裡的 x, y 是簽名在 PDF 上的座標 ★★★
    // 假設房客簽名欄位 (SignaturetenantName) 在右下方
    const pages = pdfDoc.getPages();
    const firstPage = pages[0]; 
    const pngDims = pngImage.scale(0.25); // 縮放 25%

    firstPage.drawImage(pngImage, {
      x: 350,  // ★ 靠右邊 (請根據你的 PDF 微調這個數字)
      y: 150,  // ★ 靠下方
      width: pngDims.width,
      height: pngDims.height,
    });

    // 5. 存檔並上傳
    const pdfBytes = await pdfDoc.save();
    const filename = `contracts/${contractId}_tenant_signed_${Date.now()}.pdf`;
    const file = bucket.file(filename);
    
    await file.save(Buffer.from(pdfBytes), { contentType: 'application/pdf' });
    const [url] = await file.getSignedUrl({ action: 'read', expires: '03-01-2125' });

    // 6. 更新資料庫狀態 -> 改為 'tenant_signed' (等待房東簽名)
    await docRef.update({
      pdfUrl: url,
      status: 'tenant_signed', 
      tenantSignedAt: new Date().toISOString()
    });

    res.json({ success: true, url });

  } catch (error) {
    console.error("房客簽名失敗:", error);
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Backend running on port ${PORT}`);
});