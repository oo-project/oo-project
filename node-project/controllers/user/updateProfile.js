const { db, admin } = require('../../firebaseConfig'); // 注意路徑：往上兩層找到 firebaseConfig.js

const updateProfile = async (req, res) => {
  try {
    const { userId, bio, name, avatar, role } = req.body; 

    if (!userId) {
      return res.status(400).json({ success: false, message: '缺少 User ID' });
    }

    // ✨ 優化 1: 建立一個 "乾淨" 的更新物件
    // 只放入有值的欄位，避免把資料庫裡原本的資料覆蓋成 undefined
    const updateData = {
      updatedAt: new Date()
    };
    if (name) updateData.name = name;
    if (avatar) updateData.avatar = avatar;
    if (bio !== undefined) updateData.bio = bio; // bio 允許是空字串，所以用 !== undefined

    // ✨ 優化 2: 智慧判斷集合 (防止前端沒傳 role 導致存錯)
    let collectionName = 'users'; // 預設值

    if (role === 'landlord') {
      // 如果前端明確說他是房東，就信他
      collectionName = 'landlords'; // ⚠️ 建議統一改回複數 'landlords'
    } else {
      // 🕵️‍♂️ 如果前端沒傳 role，後端自己去查！(雙重保險)
      const landlordDoc = await db.collection('landlords').doc(userId).get();
      if (landlordDoc.exists) {
        collectionName = 'landlords';
      }
    }

    console.log(`正在更新 ${collectionName} 集合，ID: ${userId}`);

    // 執行更新 (使用 update 比 set 更安全，確保 ID 存在才更新)
    // 如果您希望 ID 不存在時自動建立，維持使用 .set(..., { merge: true }) 也可以
    await db.collection(collectionName).doc(userId).set(updateData, { merge: true });

    res.status(200).json({ success: true, message: '更新成功' });
  } catch (error) {
    console.error('更新失敗:', error);
    res.status(500).json({ success: false, message: '伺服器錯誤' });
  }
};

module.exports = updateProfile;