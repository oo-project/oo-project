const { db, admin } = require('../../firebaseConfig');

const addMessage = async (req, res) => {
  try {
    const { id } = req.params;
    const { role, message } = req.body; // role: 'landlord' 或 'tenant'

    if (!message) return res.status(400).send('訊息是空的');

    const newMessage = {
      role,
      content: message,
      createdAt: new Date().toISOString()
    };

    // 使用 arrayUnion 增加新訊息
    await db.collection('appointments').doc(id).update({
      status: 'negotiating', // 只要有人說話，狀態就變協調中
      history: admin.firestore.FieldValue.arrayUnion(newMessage),
      updatedAt: new Date().toISOString()
    });

    res.status(200).json({ success: true, data: newMessage });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
module.exports = addMessage;