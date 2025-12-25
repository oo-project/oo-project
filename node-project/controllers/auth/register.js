const { db, admin } = require('../../firebaseConfig'); // 注意路徑：往上兩層找到 firebase.js

const register = async (req, res) => {
  console.log('收到註冊請求:', req.body);

  try {
    const { name, phone, address, gender, role, password } = req.body;

    // 1. 基本驗證
    if (!name || !phone || !password || !role) {
      return res.status(400).json({ message: '欄位不完整' });
    }

    // 2. 準備要寫入的資料
    const newUser = {
      name,
      phone,
      address,
      gender,
      role,      // 'tenant' 或 'landlord'
      password,  // (正式上線建議加密)
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    };

    // 3. 判斷要存入哪個集合
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
};

module.exports = register;