const { db } = require('../../firebaseConfig');
const admin = require('firebase-admin');

// 取得我的收藏列表
const getMyFavorites = async (req, res) => {
  try {
    const { uid } = req.query;
    if (!uid) return res.status(400).json({ success: false, message: '缺少使用者 ID' });
    console.log(`正在查詢使用者 ${uid} 的收藏...`);
    // 1. 先去 favorites 集合找出該使用者所有的收藏紀錄
    const favSnapshot = await db.collection('favorites')
      .where('uid', '==', uid)
      .orderBy('createAt', 'desc')
      .get();

    if (favSnapshot.empty) {
      console.log('該使用者沒有任何收藏紀錄。');
      return res.json({ success: true, data: [] });
      
    }

    // 2. 取得所有收藏的 rentalId
    // 我們同時把 favorite 的文件 ID (docId) 也留著，方便等等做「取消收藏」
    const favMap = favSnapshot.docs.map(doc => ({
      favDocId: doc.id,
      rentalId: doc.data().rentalId
    }));

    // 3. 根據 rentalId 去 rentals 集合抓取詳細房源資料
    // 使用 Promise.all 平行處理多次查詢
    const rentalsPromises = favMap.map(async (item) => {
      console.log(`嘗試抓取房源詳細資料，ID: ${item.rentalId}`);
      const rentalDoc = await db.collection('rentals').doc(item.rentalId).get();
      if (!rentalDoc.exists) {
        console.log(`⚠️ 警告：房源 ${item.rentalId} 在 rentals 集合中不存在！`);
        return null;} // 房源可能已被刪除
      
      // 回傳合併後的資料：房源資料 + 收藏紀錄的 ID
      return {
        id: rentalDoc.id,
        ...rentalDoc.data(),
        favDocId: item.favDocId // 這是為了讓前端可以刪除這筆收藏
      };
    });

    const results = await Promise.all(rentalsPromises);
    
    // 過濾掉 null (已刪除的房源)
    const validRentals = results.filter(r => r !== null);
    console.log(`成功找到 ${validRentals.length} 筆有效的收藏租件。`);
    res.json({ success: true, data: validRentals });

  } catch (error) {
    console.error('取得收藏失敗:', error);
    res.status(500).json({ success: false, message: '伺服器錯誤' });
  }
};

// 移除收藏 (取消收藏)
const removeFavorite = async (req, res) => {
  try {
    const { favDocId } = req.params;
    await db.collection('favorites').doc(favDocId).delete();
    res.json({ success: true, message: '已移除收藏' });
  } catch (error) {
    console.error('移除失敗:', error);
    res.status(500).json({ success: false, message: '伺服器錯誤' });
  }
};

const addFavorite = async (req, res) => {
  try {
    const { uid, rentalId } = req.body;
    if (!uid || !rentalId) return res.status(400).json({ success: false, message: '參數不足' });

    // 1. 防止重複收藏
    const snapshot = await db.collection('favorites')
      .where('uid', '==', uid)
      .where('rentalId', '==', rentalId)
      .get();

    if (!snapshot.empty) {
      return res.json({ success: true, message: '已經收藏過了', favDocId: snapshot.docs[0].id });
    }

    // 2. 新增到資料庫
    const newFav = {
      uid,
      rentalId,
      createAt: admin.firestore.FieldValue.serverTimestamp()
    };

    const docRef = await db.collection('favorites').add(newFav);

    res.json({ success: true, message: '收藏成功', favDocId: docRef.id });
  } catch (error) {
    console.error('收藏失敗:', error);
    res.status(500).json({ success: false, message: '伺服器錯誤' });
  }
};

// ✨ 新增：檢查某個房源是否已收藏 (進入詳情頁時用)
const checkFavoriteStatus = async (req, res) => {
  try {
    const { uid, rentalId } = req.query;
    if (!uid || !rentalId) return res.json({ isFavorite: false });

    const snapshot = await db.collection('favorites')
      .where('uid', '==', uid)
      .where('rentalId', '==', rentalId)
      .limit(1)
      .get();

    if (!snapshot.empty) {
      // 回傳 true 以及該筆收藏的 ID (方便之後刪除用)
      return res.json({ success: true, isFavorite: true, favDocId: snapshot.docs[0].id });
    }

    res.json({ success: true, isFavorite: false, favDocId: null });
  } catch (error) {
    console.error('檢查收藏狀態失敗:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// 記得導出
module.exports = { 
  getMyFavorites, 
  removeFavorite,
  addFavorite,
  checkFavoriteStatus
};