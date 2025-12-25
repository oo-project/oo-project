const { db } = require('../../firebaseConfig'); // 注意路徑：往上兩層找到 firebaseConfig.js

const getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    // 1. 優先搜尋 'landlords' (房東) 集合
    let doc = await db.collection('landlords').doc(id).get();
    let isLandlord = true;

    // 2. 如果沒找到，再搜尋 'users' (一般使用者/舊資料) 集合
    if (!doc.exists) {
      doc = await db.collection('users').doc(id).get();
      isLandlord = false;
    }

    // 3. 真的都找不到，才回傳 404
    if (!doc.exists) {
      return res.status(404).json({ success: false, message: '找不到使用者' });
    }

    const data = doc.data();

    // 4. 回傳資料
    res.status(200).json({
      success: true,
      data: {
        id: doc.id,
        name: data.name,
        email: data.email,
        phone: data.phone,
        avatar: data.avatar,
        bio: data.bio || '', // 確保 bio 欄位存在
        role: isLandlord ? 'landlord' : 'tenant'
      }
    });

  } catch (error) {
    console.error('取得使用者失敗:', error); // 只保留必要的錯誤 Log
    res.status(500).json({ success: false, message: '伺服器錯誤' });
  }
};

module.exports = getUserById;