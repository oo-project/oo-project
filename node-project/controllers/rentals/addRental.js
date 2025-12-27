const { db } = require('../../firebaseConfig');
const uploadImage = require('../../utils/uploadImage');
const getCoordinates = require('../../utils/geocoding');

const addRental = async (req, res) => {
  try {
    const { 
      landlordId, title, address, type, price, 
      deposit, floor, area, rooms, amenities, 
      description, images, isPublished 
    } = req.body;


    // 轉換經緯度
    let coordinates = { lat: 23.705, lng: 120.430 }; // 預設值 (斗六)
    
    if (address) {
      console.log(`正在轉換地址: ${address}...`);
      const coords = await getCoordinates(address);
      if (coords) {
        coordinates = coords;
        console.log('轉換成功:', coordinates);
      }
    }

    const newRental = {
      landlordId,
      title,
      address,
      
      //儲存經緯度到資料庫
      lat: coordinates.lat,
      lng: coordinates.lng,

      type,
      price: Number(price),
      deposit: Number(deposit),
      createdAt: new Date().toISOString()
    };

    const docRef = await db.collection('houses').add(newRental);
    res.status(200).json({ success: true, message: '新增成功', id: docRef.id });

  } catch (error) {
    console.error('新增失敗:', error);
    res.status(500).json({ success: false, message: '伺服器錯誤' });
  }
};

module.exports = addRental;