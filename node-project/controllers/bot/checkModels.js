// backend/checkModels.js
require('dotenv').config();
const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function listModels() {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" }); 
    // 上面這行只是為了初始化，重點是下面這行
    console.log("正在查詢可用模型...");
    
    // 這是 SDK 內建的功能，但不一定每個版本都有暴露出來，
    // 我們改用 fetch 直接打 API 檢查最準
    const apiKey = process.env.GEMINI_API_KEY;
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
    const data = await response.json();

    if (data.models) {
      console.log("✅ 您的 API Key 可用的模型列表：");
      data.models.forEach(m => {
        // 只印出 generateContent 支援的模型
        if (m.supportedGenerationMethods.includes("generateContent")) {
          console.log(`- ${m.name.replace('models/', '')}`);
        }
      });
    } else {
      console.log("❌ 無法取得模型列表", data);
    }

  } catch (error) {
    console.error("❌ 檢查失敗:", error);
  }
}
listModels();