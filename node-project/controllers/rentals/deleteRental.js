const { db } = require('../../firebase');

const deleteRental = async (req, res) => {
  try {
    const { id } = req.body; // 或 req.params
    await db.collection('houses').doc(id).delete();
    res.status(200).json({ success: true, message: '刪除成功' });
  } catch (error) {
    console.error('刪除失敗:', error);
    res.status(500).json({ success: false, message: '伺服器錯誤' });
  }
};

module.exports = deleteRental;