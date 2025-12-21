const { db } = require('../../firebase');

const updateProfile = async (req, res) => {
  try {
    // ✨ 接收 role (身分) 欄位
    const { userId, bio, name, phone, avatar, role } = req.body; 

    // ✨ 關鍵判斷：如果是房東，就去 'landlord' 集合；否則去 'users'
    // 注意：您的資料庫集合名稱是單數 'landlord'
    const collectionName = role === 'landlord' ? 'landlord' : 'users';

    console.log(`正在更新 ${collectionName} 集合，ID: ${userId}`);

    // 使用 set + merge: true，確保文件不存在時會自動建立
    await db.collection(collectionName).doc(userId).set({
      name: name,
      bio: bio || '',
      avatar: avatar || '',
      // phone: phone, 
      updatedAt: new Date()
    }, { merge: true });

    res.status(200).json({ success: true, message: '更新成功' });
  } catch (error) {
    console.error('更新失敗:', error);
    res.status(500).json({ success: false, message: '伺服器錯誤' });
  }
};

module.exports = updateProfile;