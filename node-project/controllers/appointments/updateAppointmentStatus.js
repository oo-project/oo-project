const { db } = require('../../firebaseConfig');

const updateAppointmentStatus = async (req, res) => {
  try {
    const { id } = req.params; 
    // ✨ 接收前端傳來的 finalDate 和 finalTime
    const { status, finalDate, finalTime } = req.body; 
    
    let updateData = { status };

    // 如果是「確認預約」，且有傳來新的時間，就更新資料庫的預約時間
    if (status === 'confirmed' && finalDate && finalTime) {
      updateData.date = finalDate;
      updateData.time = finalTime;
      // 也可以加一個欄位標記這是最終確認版，看您需求
      updateData.isFinalized = true; 
    }

    await db.collection('appointments').doc(id).update(updateData);
    
    res.status(200).json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = updateAppointmentStatus;