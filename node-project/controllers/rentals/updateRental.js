const { db, admin } = require('../../firebaseConfig');
const uploadImage = require('../../utils/uploadImage');
const getCoordinates = require('../../utils/geocoding'); // ✨ 1. 引入 Geocoding 工具

const updateRental = async (req, res) => {
  try {
    // 🔥 強制 Log：確認請求進入
    console.log('🔥 [Debug] 後端收到更新請求！標題:', req.body.title);

    const { id, images, address, ...otherData } = req.body;

    if (!id) {
      return res.status(400).json({ success: false, message: '缺少 ID' });
    }

    // ✨ 2. 先抓取舊資料 (為了比對地址)
    const docRef = db.collection('houses').doc(id);
    const doc = await docRef.get();

    if (!doc.exists) {
      return res.status(404).json({ success: false, message: '找不到該租件' });
    }
    
    const oldData = doc.data();

    // ✨ 3. 處理地址定位 (Geocoding)
    let geoData = {};
    
    // 印出比對結果
    console.log(`👀 [Debug 比對] 新地址: "${address}" vs 舊地址: "${oldData.address}"`);

    if (address && address !== oldData.address) {
      console.log(`📍 地址已變更，正在呼叫 Google API 重新定位...`);
      const coords = await getCoordinates(address);
      
      if (coords) {
        geoData.lat = coords.lat;
        geoData.lng = coords.lng;
        console.log('✅ 定位成功:', coords);
      }
    } else {
      console.log('💨 [Debug] 地址沒變，跳過 Google API (省錢模式)');
    }

    // ✨ 4. 處理圖片 (混合了「舊網址」與「新上傳的 Base64」)
    let imageUrls = [];
    if (images && images.length > 0) {
      // 使用 Promise.all 平行處理
      imageUrls = await Promise.all(
        images.map(img => {
          // 如果是已經存在的網址 (http開頭)，直接保留，不用上傳
          if (typeof img === 'string' && img.startsWith('http')) {
            return img;
          }
          // 如果是新圖片 (Base64)，才執行上傳
          return uploadImage(img);
        })
      );
    }

    // ✨ 5. 組合更新資料
    const updateData = {
      ...otherData,
      address: address, // 更新文字地址
      ...geoData,       // 如果有新座標，這裡會更新 lat/lng
      images: imageUrls,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };

    // 執行更新
    await docRef.update(updateData);

    res.status(200).json({ success: true, message: '更新成功' });

  } catch (error) {
    console.error('❌ 更新失敗:', error);
    res.status(500).json({ success: false, message: '伺服器錯誤' });
  }
};

module.exports = updateRental;