const { db, admin } = require('../../firebase');
const uploadImage = require('../../utils/uploadImage'); // ✨ 引入工具

const updateRental = async (req, res) => {
  try {
    const { id, images, ...otherData } = req.body; // 把 images 獨立出來處理

    // ✨✨✨ 處理圖片 ✨✨✨
    let imageUrls = [];
    if (images && images.length > 0) {
      imageUrls = await Promise.all(
        images.map(img => uploadImage(img))
      );
    }
    // ✨✨✨

    const updateData = {
      ...otherData,
      images: imageUrls, // 更新成網址陣列
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };

    await db.collection('houses').doc(id).update(updateData);

    res.status(200).json({ success: true, message: '更新成功' });
  } catch (error) {
    console.error('更新失敗:', error);
    res.status(500).json({ success: false, message: '伺服器錯誤' });
  }
};

module.exports = updateRental;