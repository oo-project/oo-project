const express = require('express');
const router = express.Router();
// 引入共用的 Firebase 資料庫連線
const { db, admin } = require('../firebase'); 

// ==========================================
// 1. 註冊 API (路徑: /api/register)
// ==========================================
router.post('/register', async (req, res) => {
  // 監控點
  console.log('收到註冊請求:', req.body);

  try {
    const { name, phone, address, gender, role, password } = req.body;

    // 1. 基本驗證
    if (!name || !phone || !password || !role) {
      return res.status(400).json({ message: '欄位不完整' });
    }

    // 2. 準備要寫入的資料物件
    const newUser = {
      name,
      phone,
      address,
      gender,
      role,      // 'tenant' 或 'landlord'
      password,  // (正式上線建議加密)
      createdAt: admin.firestore.FieldValue.serverTimestamp() // 紀錄註冊時間
    };

    // 3. 判斷要存入哪個集合 (自動分流)
    let collectionName = role === 'landlord' ? 'landlords' : 'tenants';
    
    console.log(`準備寫入 Firebase 集合: ${collectionName}`);

    // 4. 寫入資料庫
    const docRef = await db.collection(collectionName).add(newUser);
    console.log(`寫入成功！ID:`, docRef.id);
    
    // 5. 回傳成功訊息
    res.status(200).json({ 
      success: true, 
      message: '註冊成功', 
      userId: docRef.id,
      role: role 
    });

  } catch (error) {
    console.error('註冊錯誤:', error);
    res.status(500).json({ success: false, message: '伺服器錯誤' });
  }
});

// ==========================================
// 2. 登入 API (路徑: /api/login)
// ==========================================
router.post('/login', async (req, res) => {
  console.log('收到登入請求:', req.body);

  try {
    const { username, password, role } = req.body;

    // 1. 判斷要查哪個集合
    // 我們假設「手機號碼」就是登入時的「帳號」
    const collectionName = role === 'landlord' ? 'landlords' : 'tenants';

    // 2. 去 Firebase 查詢該手機號碼的使用者
    const snapshot = await db.collection(collectionName)
      .where('phone', '==', username) // 查詢 phone 欄位等於輸入的帳號
      .get();

    // 3. 檢查有沒有這個人
    if (snapshot.empty) {
      return res.status(401).json({ success: false, message: '帳號不存在或身分錯誤' });
    }

    // 4. 比對密碼 (取第一筆符合的資料)
    let userFound = null;
    let docId = '';

    snapshot.forEach(doc => {
      const data = doc.data();
      // 比對密碼是否正確
      if (data.password === password) {
        userFound = data;
        docId = doc.id;
      }
    });

    if (!userFound) {
      return res.status(401).json({ success: false, message: '密碼錯誤' });
    }

    // 5. 登入成功，回傳使用者資訊
    console.log('登入成功:', userFound.name);
    
    res.status(200).json({
      success: true,
      message: '登入成功',
      user: {
        id: docId,
        name: userFound.name,
        role: role,
        phone: userFound.phone
      }
    });

  } catch (error) {
    console.error('登入錯誤:', error);
    res.status(500).json({ success: false, message: '伺服器錯誤' });
  }
});

// 重點：匯出 router 讓 index.js 使用
module.exports = router;