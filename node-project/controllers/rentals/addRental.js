const { db } = require('../../firebaseConfig');
const uploadImage = require('../../utils/uploadImage'); // 引入上傳工具
const getCoordinates = require('../../utils/geocoding'); // 引入地圖工具

const addRental = async (req, res) => {
  try {
    // 1. 解構前端傳來的資料
    const { 
      landlordId, title, address, type, price, 
      deposit, floor, area, rooms, amenities, 
      description, images, isPublished 
    } = req.body;

    console.log(`📝 收到新增請求：${title}`);

    // ==========================================
    // 🛠️ 修正 1：處理圖片 (將 Base64 轉為 Storage URL)
    // ==========================================
    let imageUrls = []; // 準備一個陣列來存「網址」

    // 如果前端有傳圖片陣列過來
    if (images && Array.isArray(images) && images.length > 0) {
      console.log(`📸 正在上傳 ${images.length} 張圖片到 Storage...`);
      
      try {
        // 使用 Promise.all 平行處理，把 Base64 全部轉成 Storage 網址
        imageUrls = await Promise.all(
          images.map(async (base64String) => {
            return await uploadImage(base64String);
          })
        );
        console.log('✅ 圖片上傳完成');
      } catch (imgError) {
        console.error('❌ 圖片上傳失敗，將跳過圖片:', imgError);
        // 這裡選擇不中斷程式，只是圖片會是空的，看您需求決定是否要 throw error
      }
    }

    // ==========================================
    // 🛠️ 修正 2：處理座標 (防止 undefined)
    // ==========================================
    let finalLat = 23.705; // 預設值 (斗六)
    let finalLng = 120.430;
    
    if (address) {
      console.log(`🗺️ 正在轉換地址: ${address}...`);
      try {
        const coords = await getCoordinates(address);
        if (coords && coords.lat && coords.lng) {
          finalLat = coords.lat;
          finalLng = coords.lng;
          console.log(`✅ 座標轉換成功: ${finalLat}, ${finalLng}`);
        } else {
          console.log('⚠️ 查無座標，使用預設值');
        }
      } catch (geoError) {
        console.error('Geocoding 錯誤:', geoError);
      }
    }

    // ==========================================
    // 🛠️ 修正 3：補齊所有遺漏的欄位
    // ==========================================
    const newRental = {
      landlordId,
      title,
      address,
      
      // 寫入確保有值的座標
      lat: Number(finalLat),
      lng: Number(finalLng),

      // 寫入轉換後的「圖片網址」 (絕對不能存 Base64!)
      images: imageUrls, 

      type,
      price: Number(price),     
      deposit: Number(deposit),
      
      // 👇 把您原本遺漏的欄位都補回來！
      floor: Number(floor),     
      area: Number(area),       
      rooms: Number(rooms),     
      amenities: amenities || [], // 確保是陣列
      description: description || '',
      isPublished: isPublished || false,

      createdAt: new Date().toISOString()
    };

    // 寫入資料庫 (建議統一用 rentals，如果您原本資料庫是用 houses 也可以改回 houses)
    const docRef = await db.collection('houses').add(newRental);

    console.log(`🎉 新增成功，ID: ${docRef.id}`);
    res.status(200).json({ success: true, message: '新增成功', id: docRef.id });

  } catch (error) {
    console.error('❌ 伺服器新增失敗:', error);
    res.status(500).json({ success: false, message: error.message || '伺服器錯誤' });
  }
};

module.exports = addRental;