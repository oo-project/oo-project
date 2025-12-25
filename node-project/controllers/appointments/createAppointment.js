const { db } = require('../../firebaseConfig');

const createAppointment = async (req, res) => {
  try {
    // 從前端收到的資料
    const { 
      rentalId,      // 租屋 ID
      rentalTitle,   // 租屋標題 (方便顯示)
      landlordId,    // 房東 ID
      tenantId,      // 房客 ID (預約人)
      tenantName,    // 房客姓名
      date,          // 預約日期
      time,          // 預約時間/時段
      message        // 給房東的話
    } = req.body;

    // 簡單驗證
    if (!rentalId || !landlordId || !tenantId || !date) {
      return res.status(400).json({ success: false, message: '資料不完整' });
    }

    // 準備要存入的資料物件
    const newAppointment = {
      rentalId,
      rentalTitle,
      landlordId,
      tenantId,
      tenantName,
      date,
      time,
      message: message || '', // 沒填就給空字串
      status: 'pending',      // ✨ 初始狀態：等待房東確認
      landlordMessage: '',    // ✨ 預留給房東「協調/回覆」用的欄位
      createdAt: new Date().toISOString()
    };

    // 寫入 'appointments' 集合
    const docRef = await db.collection('appointments').add(newAppointment);

    res.status(200).json({ 
      success: true, 
      message: '預約請求已送出！',
      id: docRef.id 
    });

  } catch (error) {
    console.error('預約失敗:', error);
    res.status(500).json({ success: false, message: '伺服器錯誤' });
  }
};

module.exports = createAppointment;