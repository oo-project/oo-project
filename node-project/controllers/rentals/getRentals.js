const { db } = require('../../firebase');

const getRentals = async (req, res) => {
  try {
    const { landlordId } = req.query; // 從網址參數拿 ?landlordId=xxx

    if (!landlordId) {
      return res.status(400).json({ message: '未提供房東 ID' });
    }

    const snapshot = await db.collection('houses')
      .where('landlordId', '==', landlordId)
      .orderBy('createdAt', 'desc') // 按時間倒序
      .get();

    const rentals = [];
    snapshot.forEach(doc => {
      rentals.push({ id: doc.id, ...doc.data() });
    });

    res.status(200).json({ success: true, data: rentals });
  } catch (error) {
    console.error('取得列表失敗:', error);
    res.status(500).json({ success: false, message: '伺服器錯誤' });
  }
};

module.exports = getRentals;