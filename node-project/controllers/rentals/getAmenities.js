const { db } = require('../../firebase');

const getAmenities = async (req, res) => {
  try {
    const snapshot = await db.collection('amenities').get();
    
    // 假設你的 amenities 文件裡有一個欄位叫 label 或 name
    const list = [];
    snapshot.forEach(doc => {
      list.push(doc.data().name); // 請確認資料庫欄位是 name 還是 label
    });

    res.status(200).json({ success: true, data: list });
  } catch (error) {
    console.error('取得設施失敗:', error);
    res.status(500).json({ success: false, message: '伺服器錯誤' });
  }
};

module.exports = getAmenities;