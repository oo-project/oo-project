const { bucket } = require('../firebase');
const { v4: uuidv4 } = require('uuid'); // 如果沒安裝，請跑 npm install uuid

/**
 * 將 Base64 字串上傳到 Firebase Storage 並回傳公開網址
 * @param {string} base64String - 前端傳來的 base64 字串
 * @returns {Promise<string>} - 圖片的公開網址 URL
 */
const uploadImage = async (base64String) => {
  // 1. 檢查是否真的是 Base64 格式，如果已經是 http 開頭的網址(編輯時)，直接回傳
  if (!base64String || base64String.startsWith('http')) {
    return base64String;
  }

  return new Promise((resolve, reject) => {
    try {
      // 2. 去除 Base64 的開頭 (data:image/jpeg;base64,...)
      const matches = base64String.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
      
      if (!matches || matches.length !== 3) {
        return reject(new Error('Invalid base64 string'));
      }

      const type = matches[1]; // e.g., image/jpeg
      const buffer = Buffer.from(matches[2], 'base64');
      
      // 3. 產生唯一的檔名
      const extension = type.split('/')[1];
      const fileName = `rentals/${uuidv4()}.${extension}`;
      const file = bucket.file(fileName);

      // 4. 寫入 Storage
      const stream = file.createWriteStream({
        metadata: { contentType: type }
      });

      stream.on('error', (err) => {
        reject(err);
      });

      stream.on('finish', async () => {
        // 5. 設定為公開並取得網址
        await file.makePublic();
        // 這是公開存取的永久網址格式
        const publicUrl = `https://storage.googleapis.com/${bucket.name}/${fileName}`;
        resolve(publicUrl);
      });

      stream.end(buffer);

    } catch (error) {
      reject(error);
    }
  });
};

module.exports = uploadImage;