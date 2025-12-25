const express = require('express');
const router = express.Router();
const { db } = require('../firebaseConfig'); 

// ==========================================
// 🛠️ 輔助函式：移除 undefined (防止 500 錯誤)
// ==========================================
const cleanData = (obj) => {
  return JSON.parse(JSON.stringify(obj));
};

// ==========================================
// 靜態路由 (必須放在 /:id 之前)
// ==========================================

// 1. 取得特定房東的房源列表
router.get('/list', async (req, res) => {
  try {
    const { landlordId } = req.query;
    if (!landlordId) return res.status(400).json({ success: false, error: "缺少 landlordId" });

    console.log(`🔍 搜尋房東 ${landlordId} 的房源 (Collection: houses)...`);

    // 👇 修改重點：統一使用 'houses'
    const snapshot = await db.collection('houses')
      .where('landlordId', '==', landlordId)
      // .orderBy('createdAt', 'desc') // 若後端報錯說缺索引，請先註解這行，等資料出來再去建索引
      .get();

    if (snapshot.empty) {
        console.log("⚠️ 查詢結果為空 (可能該房東還沒建立房源)");
        return res.json({ success: true, data: [] });
    }

    const rentals = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    console.log(`✅ 成功找到 ${rentals.length} 筆資料`);
    res.json({ success: true, data: rentals });

  } catch (error) {
    console.error("❌ 取得列表失敗:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// 2. 取得公開房源
router.get('/public', async (req, res) => {
  try {
    // 👇 修改重點：統一使用 'houses'
    const snapshot = await db.collection('houses')
      .where('isPublished', '==', true)
      .limit(20)
      .get();
    
    const rentals = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json({ success: true, data: rentals });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 3. 取得設施列表
router.get('/amenities', (req, res) => {
    const amenities = [
        "Wi-Fi", "電視", "冰箱", "冷氣", "洗衣機", 
        "熱水器", "床", "衣櫃", "沙發", "桌椅", 
        "陽台", "電梯", "車位", "可養寵物", "可開伙"
    ];
    res.json({ success: true, data: amenities });
});

// 4. 刪除房源
router.post('/delete', async (req, res) => {
  try {
    const { id } = req.body;
    if (!id) return res.status(400).json({ success: false, error: "缺少 ID" });

    // 👇 修改重點：統一使用 'houses'
    await db.collection('houses').doc(id).delete();
    
    console.log(`🗑️ 房源 ${id} 已刪除`);
    res.json({ success: true, message: "刪除成功" });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 5. 新增房源
router.post('/add', async (req, res) => {
    try {
        console.log("📝 準備新增房源到 'houses'...");

        // 1. 準備資料
        const rawData = {
            ...req.body,
            price: Number(req.body.price) || 0,        
            deposit: Number(req.body.deposit) || 0,    
            floor: Number(req.body.floor) || 1,
            area: Number(req.body.area) || 5,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            isPublished: req.body.isPublished || false,
            images: req.body.images || [],             
            amenities: req.body.amenities || []        
        };

        // 2. 清洗資料
        const safeData = cleanData(rawData);

        // 3. 👇 修改重點：寫入 'houses'
        const docRef = await db.collection('houses').add(safeData);
        
        console.log(`✅ 新增成功，ID: ${docRef.id}`);
        res.json({ success: true, id: docRef.id });

    } catch (error) {
        console.error("❌ 新增失敗:", error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// 6. 編輯房源
router.post('/update', async (req, res) => {
    try {
        const { id, ...data } = req.body;
        if (!id) return res.status(400).json({ success: false, error: "缺少 ID" });

        const rawData = {
            ...data,
            price: Number(data.price) || 0,
            deposit: Number(data.deposit) || 0,
            updatedAt: new Date().toISOString()
        };

        const safeData = cleanData(rawData);

        // 👇 修改重點：更新 'houses'
        await db.collection('houses').doc(id).update(safeData);

        console.log(`✅ 更新成功: ${id}`);
        res.json({ success: true });
    } catch (error) {
        console.error("❌ 更新失敗:", error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// ==========================================
// 動態路由 (最後面)
// ==========================================

// 7. 取得單一房源詳情
router.get('/:id', async (req, res) => {
  try {
    const rentalId = req.params.id;
    if (['list', 'public', 'amenities', 'add', 'update', 'delete'].includes(rentalId)) return;

    // 👇 修改重點：查詢 'houses'
    const doc = await db.collection('houses').doc(rentalId).get();

    if (!doc.exists) {
      return res.status(404).json({ success: false, error: "找無此房源" });
    }
    res.json({ success: true, data: { id: doc.id, ...doc.data() } });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;