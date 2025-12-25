const { db } = require('../../firebaseConfig');

const getRentals = async (req, res) => {
  try {
    const { landlordId } = req.query;

    // 1. 基本檢查：沒給 ID 就不幫忙找
    if (!landlordId) {
      return res.status(400).json({ message: '未提供房東 ID' });
    }

    // 2. 搜尋 houses 集合
    const snapshot = await db.collection('houses')
      .where('landlordId', '==', landlordId)
      .orderBy('createdAt', 'desc') // 讓最新的租件顯示在最上面
      .get();

    // 3. 整理資料
    const rentals = [];
    snapshot.forEach(doc => {
      rentals.push({ id: doc.id, ...doc.data() });
    });

    // 4. 回傳成功
    res.status(200).json({ success: true, data: rentals });

  } catch (error) {
    console.error('取得列表失敗:', error);
    // 如果是因為缺少索引 (Index) 導致失敗，終端機會給一個網址，點進去建立即可
    res.status(500).json({ success: false, message: '伺服器錯誤' });
  }
};

module.exports = getRentals;