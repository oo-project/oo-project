const { db } = require('../../firebase');

const getRentalById = async (req, res) => {
  try {
    const { id } = req.params;
    const doc = await db.collection('houses').doc(id).get();

    if (!doc.exists) {
      return res.status(404).json({ message: '找不到該租件' });
    }

    res.status(200).json({ success: true,data: { id: doc.id, ...doc.data() }});
  } catch (error) {
    console.error('取得詳情失敗:', error);
    res.status(500).json({ success: false, message: '伺服器錯誤' });
  }
};

module.exports = getRentalById;