// node-project/controllers/rentals/rentalController.js
const { db } = require('../../firebaseConfig'); // ⚠️ 注意路徑：往上兩層才找得到 firebaseConfig

// 取得單一房源詳情 (並計算收藏人數)
const getRentalById = async (req, res) => {
  try {
    const rentalId = req.params.id;

    // 1. 排除非 ID 的關鍵字 (防止誤判)
    if (['list', 'public', 'amenities', 'add', 'update', 'delete'].includes(rentalId)) return;

    // 2. 從 houses 集合抓取房源
    const doc = await db.collection('houses').doc(rentalId).get();

    if (!doc.exists) {
      return res.status(404).json({ success: false, error: "找無此房源" });
    }

    // ==========================================
    // ✨✨✨ 這裡就是我們要加的新功能 ✨✨✨
    // ==========================================
    const favSnapshot = await db.collection('favorites')
      .where('rentalId', '==', rentalId)
      .get();
      
    const favoriteCount = favSnapshot.size; // 取得收藏總數
    // ==========================================

    // 3. 回傳資料 (包含 favoriteCount)
    res.json({ 
      success: true, 
      data: { 
        id: doc.id, 
        ...doc.data(),
        favoriteCount: favoriteCount // 傳給前端
      } 
    });

  } catch (error) {
    console.error("取得詳情失敗:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// 匯出函式
module.exports = {
  getRentalById
};