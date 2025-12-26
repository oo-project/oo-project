// rentalController.js

const getRentalById = async (req, res) => {
  try {
    const { id } = req.params;

    // 1. 先從 houses 集合抓取房源基本資料
    const doc = await db.collection('houses').doc(id).get();

    if (!doc.exists) {
      return res.status(404).json({ success: false, message: '找不到房源' });
    }

    // 2. ✨ 核心關鍵：計算此房源被收藏的總次數
    // 我們去 favorites 集合搜尋 rentalId 等於目前房源 ID 的所有紀錄
    const favSnapshot = await db.collection('favorites')
      .where('rentalId', '==', id)
      .get();
    
    // 取得符合紀錄的數量
    const favoriteCount = favSnapshot.size;

    // 3. 回傳房源資料，並把人數 (favoriteCount) 包進去
    res.json({
      success: true,
      data: {
        id: doc.id,
        ...doc.data(),
        favoriteCount: favoriteCount // ✨ 傳給前端顯示
      }
    });

  } catch (error) {
    console.error('取得房源詳情失敗:', error);
    res.status(500).json({ success: false, message: '伺服器錯誤' });
  }
};