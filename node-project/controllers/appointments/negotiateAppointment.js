const { db } = require('../../firebaseConfig');

const negotiateAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    const { message } = req.body; // 房東輸入的協調訊息

    if (!message) {
      return res.status(400).json({ success: false, message: '請輸入協調內容' });
    }

    // 更新資料庫：狀態改為 'negotiating'，並寫入留言
    await db.collection('appointments').doc(id).update({
      status: 'negotiating',
      landlordMessage: message,
      updatedAt: new Date().toISOString()
    });

    res.status(200).json({ success: true });
  } catch (error) {
    console.error('協調失敗:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = negotiateAppointment;