const express = require('express');
const router = express.Router();
const { db } = require('../firebaseConfig');

// 1. 取得特定房源的房客 (通常是從合約反查)
// 對應前端: /api/room-tenants?rentalId=...
router.get('/', async (req, res) => {
  try {
    const { rentalId } = req.query;
    if (!rentalId) return res.json([]);

    // 邏輯：去 contracts 集合找，狀態是 'active' 或 'valid' 的合約
    // 這裡簡化：只要是該房間的合約我們都抓出來看看
    const snapshot = await db.collection('contracts')
      .where('rentalId', '==', rentalId)
      .get();

    if (snapshot.empty) return res.json([]);

    // 整理出房客資料
    const tenants = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
            name: data.tenantName || '未知房客',
            id: data.tenantId
        };
    });

    res.json(tenants);
  } catch (error) {
    console.error("讀取房客失敗:", error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;