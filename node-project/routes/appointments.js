const express = require('express');
const router = express.Router();
const { db } = require('../firebaseConfig');
// 1. 取得房東的所有預約請求 (房東端)

router.get('/landlord/:id', async (req, res) => {
  try {
    const landlordId = req.params.id;
    
    // 查詢 appointments 集合
    const snapshot = await db.collection('appointments')
      .where('landlordId', '==', landlordId)
      .orderBy('createdAt', 'desc') // 依時間排序 (若報錯需建索引)
      .get();

    if (snapshot.empty) {
        return res.json([]); 
    }

    const appointments = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    res.json(appointments);
  } catch (error) {
    console.error("讀取房東預約失敗:", error);
    if (error.code === 9 || error.message.includes('index')) {
        return res.json([]); 
    }
    res.status(500).json({ error: error.message });
  }
});


// 2. 取得租客的所有預約請求 (租客端) 

router.get('/tenant/:id', async (req, res) => {
  try {
    const tenantId = req.params.id;

    const snapshot = await db.collection('appointments')
      .where('tenantId', '==', tenantId)
      .orderBy('createdAt', 'desc')
      .get();

    if (snapshot.empty) {
        return res.json([]); 
    }

    const appointments = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    res.json(appointments);
  } catch (error) {
    console.error("讀取租客預約失敗:", error);
    if (error.code === 9 || error.message.includes('index')) {
        return res.json([]); 
    }
    res.status(500).json({ error: error.message });
  }
});


// 3. 建立新預約 (租客端送出申請)
router.post('/add', async (req, res) => {
  try {
    const data = req.body;

    // 基本防呆：移除 undefined
    const cleanData = JSON.parse(JSON.stringify({
        ...data,
        status: 'pending', // 預設狀態：待確認
        createdAt: new Date().toISOString()
    }));

    const docRef = await db.collection('appointments').add(cleanData);
    res.json({ success: true, id: docRef.id });

  } catch (error) {
    console.error("建立預約失敗:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// 4. 更新預約狀態 (房東端：接受/拒絕)
router.patch('/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // 'accepted' 或 'rejected'

    if (!status) return res.status(400).json({ error: "缺少狀態" });

    await db.collection('appointments').doc(id).update({
        status: status,
        updatedAt: new Date().toISOString()
    });

    res.json({ success: true, message: "狀態已更新" });

  } catch (error) {
    console.error("更新狀態失敗:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;