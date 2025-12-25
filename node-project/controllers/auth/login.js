const { db } = require('../../firebaseConfig'); // 注意路徑：往上兩層找到 firebaseConfig.js

const login = async (req, res) => {
  console.log('收到登入請求:', req.body);

  try {
    const { username, password, role } = req.body;

    // 1. 判斷要查哪個集合 (假設手機號碼是帳號)
    const collectionName = role === 'landlord' ? 'landlords' : 'tenants';

    // 2. 去 Firebase 查詢
    const snapshot = await db.collection(collectionName)
      .where('phone', '==', username)
      .get();

    // 3. 檢查有沒有這個人
    if (snapshot.empty) {
      return res.status(401).json({ success: false, message: '帳號不存在或身分錯誤' });
    }

    // 4. 比對密碼
    let userFound = null;
    let docId = '';

    snapshot.forEach(doc => {
      const data = doc.data();
      if (data.password === password) {
        userFound = data;
        docId = doc.id;
      }
    });

    if (!userFound) {
      return res.status(401).json({ success: false, message: '密碼錯誤' });
    }

    // 5. 登入成功
    console.log('登入成功:', userFound.name);
    
    res.status(200).json({
      success: true,
      message: '登入成功',
      user: {
        id: docId,
        name: userFound.name,
        role: role,
        phone: userFound.phone,
        avatar: userFound.avatar || ''
      }
    });

  } catch (error) {
    console.error('登入錯誤:', error);
    res.status(500).json({ success: false, message: '伺服器錯誤' });
  }
};

module.exports = login;