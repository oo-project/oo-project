const express = require('express');
const router = express.Router();
const { db } = require('../firebaseConfig');

// 1. 取得特定房源的房客 (通常是從合約反查)
router.get('/', async (req, res) => {
  try {
    const { rentalId } = req.query;
    if (!rentalId) return res.json([]);

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