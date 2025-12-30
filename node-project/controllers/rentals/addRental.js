const { db } = require('../../firebaseConfig');
const uploadImage = require('../../utils/uploadImage'); // 務必確認路徑正確
const getCoordinates = require('../../utils/geocoding'); // 務必確認路徑正確

const addRental = async (req, res) => {
  try {
    // 1. 解構前端傳來的資料
    const { 
      landlordId, title, address, type, price, 
      deposit, floor, area, rooms, amenities, 
      description, images, isPublished 
    } = req.body;

    console.log(`📝 收到新增請求，標題: ${title}`);

    let imageUrls = []; 
    
    // 如果有傳圖片 (Base64)，就上傳轉成網址
    if (images && Array.isArray(images) && images.length > 0) {
      console.log(`📸 正在上傳 ${images.length} 張圖片...`);
      try {
        imageUrls = await Promise.all(
          images.map(base64 => uploadImage(base64))
        );
        console.log('✅ 圖片上傳成功');
      } catch (e) {
        console.error('❌ 圖片上傳發生錯誤 (將略過圖片):', e.message);
      }
    }


    let finalLat = 23.690985;
    let finalLng = 120.527788;

    if (address) {
      console.log(`🗺️ 正在轉換地址: ${address}`);
      try {
        const coords = await getCoordinates(address);
        // 嚴格檢查回傳值是否有效
        if (coords && typeof coords.lat === 'number' && typeof coords.lng === 'number') {
          finalLat = coords.lat;
          finalLng = coords.lng;
          console.log(`📍 座標轉換成功: ${finalLat}, ${finalLng}`);
        } else {
          console.log('⚠️ API 查無座標，將使用預設值');
        }
      } catch (err) {
        console.error('❌ Geocoding 錯誤 (使用預設值):', err.message);
      }
    }

    const newRental = {
      landlordId,
      title,
      address,
      lat: Number(finalLat),
      lng: Number(finalLng),
      images: imageUrls, 

      type: type || '獨立套房',
      price: Number(price) || 0,
      deposit: Number(deposit) || 0,
      floor: Number(floor) || 1,      // 補上樓層
      area: Number(area) || 5,        // 補上坪數
      rooms: Number(rooms) || 1,      // 補上房間數
      amenities: amenities || [],     // 補上設施
      description: description || '', // 補上描述
      isPublished: isPublished || false,
      
      createdAt: new Date().toISOString()
    };

    const docRef = await db.collection('houses').add(newRental);

    console.log(`🎉 寫入 houses 成功！ID: ${docRef.id}`);
    res.status(200).json({ success: true, message: '新增成功', id: docRef.id });

  } catch (error) {
    console.error('🔥 伺服器錯誤:', error);
    res.status(500).json({ success: false, message: error.message || '伺服器內部錯誤' });
  }
};

module.exports = addRental;