// backend/controllers/rentals/getPublicRentals.js
const { db } = require('../../firebase');

const getPublicRentals = async (req, res) => {
  try {
    // 查詢條件：必須是已發布 (isPublished == true)
    // 排序：按時間新到舊
    const snapshot = await db.collection('houses')
      .where('isPublished', '==', true)
      .orderBy('createdAt', 'desc')
      .get();

    const rentals = [];
    snapshot.forEach(doc => {
      rentals.push({ id: doc.id, ...doc.data() });
    });

    res.status(200).json({ success: true, data: rentals });
  } catch (error) {
    console.error('取得公開租件失敗:', error);
    res.status(500).json({ success: false, message: '伺服器錯誤' });
  }
};

module.exports = getPublicRentals;