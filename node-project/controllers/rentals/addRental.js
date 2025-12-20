const { db, admin } = require('../../firebase');
const uploadImage = require('../../utils/uploadImage');

const addRental = async (req, res) => {
  try {
    // 從前端接收資料
    const { 
      landlordId, title, address, price, deposit, 
      type, floor, area, rooms, amenities, 
      description, images, isPublished 
    } = req.body;

    if (!landlordId || !title || !price) {
      return res.status(400).json({ message: '必要欄位缺失' });
    }

    let imageUrls = [];
    if (images && images.length > 0) {
      console.log('正在上傳圖片至 Storage...');
      imageUrls = await Promise.all(
        images.map(base64 => uploadImage(base64))
      );
      console.log('圖片上傳完成，取得網址:', imageUrls);
    }

    const newRental = {
      landlordId,
      title,
      address,
      price: Number(price),
      deposit: Number(deposit),
      type,
      floor: Number(floor),
      area: Number(area),
      rooms: Number(rooms),
      amenities: amenities || [],
      description: description || '',
      images: imageUrls, // Firebase Storage 網址陣列
      isPublished: isPublished || false,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };

    // 寫入 houses 集合
    const docRef = await db.collection('houses').add(newRental);

    res.status(200).json({ success: true, message: '新增成功', id: docRef.id });
  } catch (error) {
    console.error('新增租件失敗:', error);
    res.status(500).json({ success: false, message: '伺服器錯誤' });
  }
};

module.exports = addRental;