const { PDFDocument } = require('pdf-lib');
const fontkit = require('@pdf-lib/fontkit');
const fs = require('fs').promises; 
const path = require('path');
const axios = require('axios');
const { db, bucket } = require('../../firebaseConfig');

// ==========================================
// 🛠️ Helper Functions (輔助工具)
// ==========================================

// 民國日期轉換工具
const getROCDateParts = (dateString) => {
  if (!dateString) return { y: '', m: '', d: '' };
  const [y, m, d] = dateString.split('-');
  return {
    y: y ? (parseInt(y) - 1911).toString() : '',
    m: m || '',
    d: d || ''
  };
};

// 共用的簽名處理邏輯 (核心功能)
const processSignature = async (contractId, signatureBase64, position, role) => {
  const docRef = db.collection('contracts').doc(contractId);
  const doc = await docRef.get();
  if (!doc.exists) throw new Error("合約不存在");
  
  const { pdfUrl } = doc.data();
  if (!pdfUrl) throw new Error("找不到 PDF 連結");

  // 1. 下載 PDF
  const pdfResponse = await axios.get(pdfUrl, { responseType: 'arraybuffer' });
  const pdfDoc = await PDFDocument.load(pdfResponse.data);

  // 2. 嵌入簽名圖片
  const pngImageBytes = Buffer.from(signatureBase64.replace(/^data:image\/png;base64,/, ""), 'base64');
  const pngImage = await pdfDoc.embedPng(pngImageBytes);

  // 3. 繪製簽名 (含偵錯與防呆)
  const pages = pdfDoc.getPages();
  
  // 👇👇👇 偵錯訊息開始 👇👇👇
  console.log("========================================");
  console.log(`🔥 [偵錯模式] PDF 總頁數: ${pages.length}`);
  
  // 這裡只宣告一次 pageIndex，不會再報錯了
  let pageIndex = 7; // 預設第 8 頁 (Index 7)

  if (pages.length <= 7) {
      console.log(`⚠️ [警告] 頁數不足 8 頁！系統自動切換到最後一頁 (Index: ${pages.length - 1})`);
      pageIndex = pages.length - 1;
  }
  
  console.log(`🎯 [確認] 最終將簽名畫在第 ${pageIndex + 1} 頁 (Index: ${pageIndex})`);
  console.log(`📍 [確認] 座標位置 X: ${position.x}, Y: ${position.y}`);
  console.log("========================================");
  // 👆👆👆 偵錯訊息結束 👆👆👆

  const targetPage = pages[pageIndex];

  // 縮放簽名大小
  const pngDims = pngImage.scale(0.25);

  targetPage.drawImage(pngImage, {
    x: position.x,
    y: position.y,
    width: pngDims.width,
    height: pngDims.height,
  });

  // 4. 鎖定表單
  const form = pdfDoc.getForm();
  try { form.flatten(); } catch (e) { console.log("Flatten skipped"); }

  // 5. 存回 Firebase Storage
  const pdfBytes = await pdfDoc.save();
  
  const filename = `contracts/${contractId}_${role}_signed_${Date.now()}.pdf`;
  const file = bucket.file(filename);

  await file.save(Buffer.from(pdfBytes), {
    contentType: 'application/pdf',
    metadata: { contentType: 'application/pdf' }
  });

  const [url] = await file.getSignedUrl({ action: 'read', expires: '03-01-2125' });

  // 6. 更新 Firestore
  const updateData = {
    pdfUrl: url,
    storagePath: filename,
  };

  if (role === 'landlord') {
    updateData.status = 'landlord_signed';
    updateData.landlordSignedAt = new Date().toISOString();
  } else if (role === 'tenant') {
    updateData.status = 'tenant_signed';
    updateData.tenantSignedAt = new Date().toISOString();
  }

  await docRef.update(updateData);
  return url;
};

// ==========================================
// 🎮 Controllers (控制器)
// ==========================================

const getContracts = async (req, res) => {
  try {
    const { landlordId, tenantId } = req.query;
    let query = db.collection('contracts');

    if (landlordId) {
      query = query.where('landlordId', '==', landlordId);
    } else if (tenantId) {
      query = query.where('tenantId', '==', tenantId);
    } else {
      return res.json([]);
    }

    const snapshot = await query.get();
    if (snapshot.empty) return res.json([]);

    const leases = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    leases.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    res.json(leases);
  } catch (error) {
    console.error("讀取失敗:", error);
    res.status(500).json({ error: error.message });
  }
};

const createContract = async (req, res) => {
  try {
    const newContract = req.body;
    let { 
      landlordName, tenantName, address, price, 
      periodStart, periodEnd, otherTerms,
      depositMonths, depositFee,
      tenantId, tenantPhone 
    } = newContract;

    if (!tenantId && tenantPhone) {
      const userSnapshot = await db.collection('users')
        .where('username', '==', tenantPhone)
        .get();
      if (!userSnapshot.empty) {
        tenantId = userSnapshot.docs[0].id;
      }
    }

    const today = new Date();
    const tYear = (today.getFullYear() - 1911).toString();
    const tMonth = (today.getMonth() + 1).toString();
    const tDate = today.getDate().toString();
    const start = getROCDateParts(periodStart);
    const end = getROCDateParts(periodEnd);

    const templatePath = path.join(__dirname, '../../template_contract.pdf');
    const fontPath = path.join(__dirname, '../../kaiu.ttf');
    
    const [templateBytes, fontBytes] = await Promise.all([
      fs.readFile(templatePath),
      fs.readFile(fontPath)
    ]);

    const pdfDoc = await PDFDocument.load(templateBytes);
    pdfDoc.registerFontkit(fontkit);
    const customFont = await pdfDoc.embedFont(fontBytes);

    const form = pdfDoc.getForm();
    const setField = (fieldName, text) => {
      try {
        const field = form.getTextField(fieldName);
        if (field) {
          field.setText(text ? text.toString() : '');
          field.updateAppearances(customFont);
        }
      } catch (e) {}
    };

    setField('todayyear', tYear);
    setField('todaymonth', tMonth);
    setField('todaydate', tDate);
    setField('depositmonth', depositMonths);
    setField('depositfee', depositFee);
    setField('landlordName', landlordName);
    setField('tenantName', tenantName);
    setField('rentAmount', price);
    setField('periodStartyear', start.y);
    setField('periodStartmonth', start.m);
    setField('periodStartdate', start.d);
    setField('periodEndyear', end.y);
    setField('periodEndmonth', end.m);
    setField('periodEnddate', end.d);

    if (otherTerms) setField('otherTerms', otherTerms);
    if (address) setField('address', address);

    const pdfBytes = await pdfDoc.save();
    
    const filename = `contracts/${Date.now()}_contract.pdf`;
    const file = bucket.file(filename);

    await file.save(Buffer.from(pdfBytes), {
      contentType: 'application/pdf',
      metadata: { contentType: 'application/pdf' }
    });

    const [url] = await file.getSignedUrl({ action: 'read', expires: '03-01-2125' });

    const finalContractData = {
      ...newContract,
      tenantId: tenantId || '',
      pdfUrl: url,
      storagePath: filename,
      status: 'created',
      createdAt: new Date().toISOString()
    };

    const docRef = await db.collection('contracts').add(finalContractData);
    res.json({ success: true, id: docRef.id, pdfUrl: url });

  } catch (error) {
    console.error("建立租約失敗:", error);
    res.status(500).json({ error: "建立失敗: " + error.message });
  }
};

const updateContractPdf = async (req, res) => {
  try {
    const contractId = req.params.id;
    const { pdfBase64 } = req.body;
    if (!pdfBase64) return res.status(400).json({ error: "無檔案資料" });

    const base64Data = pdfBase64.replace(/^data:application\/pdf;base64,/, "");
    const buffer = Buffer.from(base64Data, 'base64');
    
    const filename = `contracts/${contractId}_updated_${Date.now()}.pdf`;
    const file = bucket.file(filename);
    
    await file.save(buffer, { contentType: 'application/pdf' });
    const [url] = await file.getSignedUrl({ action: 'read', expires: '03-01-2125' });

    await db.collection('contracts').doc(contractId).update({ pdfUrl: url, storagePath: filename });
    res.json({ success: true, url });
  } catch (error) {
    console.error("更新合約失敗:", error);
    res.status(500).json({ error: error.message });
  }
};

const landlordSign = async (req, res) => {
  try {
    const contractId = req.params.id;
    const { signatureImage } = req.body;
    if (!signatureImage) return res.status(400).json({ error: "無簽名資料" });
    
    // 房東簽名座標 (可依偵錯結果調整)
    const url = await processSignature(contractId, signatureImage, { x: 260, y: 525 }, 'landlord');
    
    res.json({ success: true, url });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const tenantSign = async (req, res) => {
  try {
    const contractId = req.params.id;
    const { signatureImage } = req.body;
    if (!signatureImage) return res.status(400).json({ error: "無簽名資料" });

    // 房客簽名座標 (可依偵錯結果調整)
    const url = await processSignature(contractId, signatureImage, { x: 260, y: 370 }, 'tenant');
    
    res.json({ success: true, url });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getContracts,
  createContract,
  updateContractPdf,
  landlordSign,
  tenantSign
};

