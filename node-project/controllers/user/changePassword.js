const { db } = require('../../firebaseConfig'); // 注意路徑：往上兩層找到 firebaseConfig.js

const changePassword = async (req, res) => {
  console.log('收到修改密碼請求');
  
  try {
    const { userId, role, oldPassword, newPassword } = req.body;

    if (!userId || !role || !oldPassword || !newPassword) {
      return res.status(400).json({ message: '欄位不完整' });
    }

    const collectionName = role === 'landlord' ? 'landlords' : 'tenants';
    const docRef = db.collection(collectionName).doc(userId);

    // 1. 取出目前資料
    const doc = await docRef.get();
    if (!doc.exists) {
      return res.status(404).json({ success: false, message: '用戶不存在' });
    }

    const userData = doc.data();

    // 2. 比對舊密碼
    if (userData.password !== oldPassword) {
      return res.status(400).json({ success: false, message: '舊密碼錯誤，請重新輸入' });
    }

    // 3. 寫入新密碼
    await docRef.update({
      password: newPassword
    });

    console.log('密碼修改成功');
    res.status(200).json({ success: true, message: '密碼修改成功' });

  } catch (error) {
    console.error('修改密碼失敗:', error);
    res.status(500).json({ success: false, message: '伺服器錯誤' });
  }
};

module.exports = changePassword;