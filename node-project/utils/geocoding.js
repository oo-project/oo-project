const axios = require('axios');
require('dotenv').config();

const GOOGLE_API_KEY = process.env.GOOGLE_MAPS_API_KEY; 

const getCoordinates = async (address) => {
  try {
    // 1. 強制加上 "台灣"，避免搜到中國或其他國家的同名路段
    const fullAddress = address.includes('台灣') ? address : `台灣${address}`;
    
    console.log(`正在向 Google 查詢地址: ${fullAddress}`);

    // 2. 加上 region=tw 參數，限制搜尋範圍為台灣
    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(fullAddress)}&key=${GOOGLE_API_KEY}&language=zh-TW&region=tw`;
    
    const response = await axios.get(url);
    const data = response.data;

    if (data.status === 'OK' && data.results.length > 0) {
      const location = data.results[0].geometry.location;
      // 印出來看看 Google 到底抓到了哪裡 (formatted_address)
      console.log(`✅ Google 抓到的完整地址: ${data.results[0].formatted_address}`);
      return {
        lat: location.lat,
        lng: location.lng
      };
    } else {
      console.warn('❌ Geocoding 找不到地址 (API回應):', data.status);
      if (data.error_message) console.warn('錯誤訊息:', data.error_message);
      return null; 
    }
  } catch (error) {
    console.error('❌ Geocoding 連線錯誤:', error.message);
    return null;
  }
};

module.exports = getCoordinates;