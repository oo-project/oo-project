const { db } = require('../../firebaseConfig');
const { GoogleGenerativeAI } = require("@google/generative-ai");

// 初始化 Gemini
// 請確保 .env 裡有 GEMINI_API_KEY
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const today = new Date().toISOString().split('T')[0]; // 取得 YYYY-MM-DD
const currentTime = new Date().toLocaleString();
const chatWithBot = async (req, res) => {
  try {
    const { message } = req.body;
    console.log('🤖 收到訊息 (Gemini):', message);

    // 1. 設定模型與生成參數
    // 使用 gemini-pro，並強制它吐出 JSON
    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.5-flash",
      generationConfig: {
        responseMimeType: "application/json", 
      }
    });

    // 2. 定義 Prompt (提示詞)
    // 告訴 Gemini 它的職責，以及輸出的 JSON 格式
    const prompt = `
      你是一個專業的租屋平台 AI 助手。
      
      使用者傳送的訊息是： "${message}"

      請分析使用者的意圖，並嚴格按照以下 JSON 格式回傳，不要包含任何 markdown 標記：
      現在的日期時間是：${currentTime}。
      當使用者說「明天」，請根據這個時間推算。
      情況 A：如果使用者想找房（提到地點、價格、房型、租屋等關鍵字）
      {
        "type": "search",
        "params": {
          "location": "地點關鍵字 (例如: 斗六, 雲科大, 火車站)",
          "maxPrice": 數字 (如果沒提到則為 null),
          "roomType": "房型 (例如: 套房, 雅房, 整層住家)",
          "amenities": ["Wi-Fi", "電視", "冰箱", "冷氣", "洗衣機", "熱水器", "床", "衣櫃", "沙發", "桌椅", "陽台", "電梯", "車位", "可養寵物", "可開伙"]
        }
      }

      情況 B：如果是打招呼、閒聊或與找房無關
      {
        "type": "chat",
        "reply": "你親切的回覆內容 (請用繁體中文，語氣活潑)"
      }

      情況 C:使用者詢問功能在哪裡、如何操作、或想去某個頁面 (如：找房、預約、收藏、改資料) (navigate)
      你「必須」回傳以下格式：
      {
        "type": "navigate",
        "path": "目標路由路徑",
        "reply": "導引文字內容",
        "label": "頁面名稱"
      }
      路徑對照表：
      - 列表找房: /TenantHome/browse
      - 地圖找房: /TenantHome/map
      - 我的收藏: /TenantHome/favorites
      - 預約記錄: /TenantHome/reservations
      - 簽署合約: /TenantHome/contracts
      - 租屋管理: /TenantHome/living
      - 修改個人資料/密碼: /TenantHome/profile

      情況 D：建立提醒事項 (例如：繳房租、繳水電、看房預約)
      {
      "type": "create_reminder",
      "params": {
        "title": "提醒的標題 (如: 繳納水電費)",
        "time": "提醒的時間 (如: 20240501T0900)",
        "recurrence": "頻率 (如: MONTHLY, WEEKLY, null)",
        "reply": "你確認設定好的親切回覆"
      }
    }
    `;

    // 3. 呼叫 Gemini
    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    
    console.log('✨ Gemini 回傳原始資料:', responseText);

    // 4. 解析 JSON
    let aiResponse;
    try {
      aiResponse = JSON.parse(responseText);
    } catch (e) {
      console.error('JSON 解析失敗，Gemini 可能回傳了怪怪的東西');
      return res.json({ type: 'chat', text: '抱歉，我現在有點累，請再說一次好嗎？' });
    }

    // 5. 根據意圖執行動作
    if (aiResponse.type === 'search') {
      const params = aiResponse.params;
      console.log('🔍 搜尋條件:', params);

      let query = db.collection('houses').where('isPublished', '==', true);
      const snapshot = await query.get();
      
      let rentals = [];
      snapshot.forEach(doc => {
        const data = doc.data();
        let match = true;

        if (params.location) {
          const loc = params.location;
          const address = data.address || '';
          const title = data.title || '';
          if (!address.includes(loc) && !title.includes(loc)) match = false;
        }

        if (params.maxPrice && data.price > params.maxPrice) match = false;
        if (params.roomType && data.type !== params.roomType) match = false;

        if (params.amenities && params.amenities.length > 0) {
          const houseAmenities = data.amenities || [];
          const hasAllAmenities = params.amenities.every(item => houseAmenities.includes(item));
          if (!hasAllAmenities) match = false;
        }

        if (match) rentals.push({ id: doc.id, ...data });
      });

      const foundCount = rentals.length;
      if (foundCount > 0) {
        return res.json({ 
          type: 'recommendation', 
          text: `沒問題！為您找到符合需求的房源：`,
          data: rentals.slice(0, 3) 
        });
      } else {
        return res.json({ 
          type: 'text', 
          text: `不好意思，目前沒有找到符合條件的房源，要不要換個關鍵字試試？` 
        });
      }

    } 
    // ✨ 新增：處理導航跳轉分支
    else if (aiResponse.type === 'navigate') {
      console.log('📍 執行導航:', aiResponse.label, aiResponse.path);
      return res.json({
        type: 'navigate',
        path: aiResponse.path,
        label: aiResponse.label,
        text: aiResponse.reply // 前端 AiChatBot 接收 content 或 text，這裡傳 text
      });
    }

    else if (aiResponse.type === 'create_reminder') {
      const { title, time, recurrence, reply } = aiResponse.params;

      const currentUserId = req.body.userId;
      try {
        await db.collection('reminders').add({
          userId: currentUserId,
          title: title,
          remindTime: time,
          recurrence: recurrence,
          status: 'pending',
          createdAt: new Date(),
        });

        return res.json({
          type: 'chat',
          text: reply // 回傳 AI 設定好的親切回覆
        });
      } catch (dbError) {
        console.error('資料庫寫入提醒失敗:', dbError);
        return res.json({ type: 'chat', text: '抱歉，設定提醒時發生錯誤，請稍後再試。' });
      }
    }

    // 處理純閒聊
    else {
      return res.json({ 
        type: 'chat', 
        text: aiResponse.reply 
      });
    }

  } catch (error) {
    console.error('❌ Gemini API 錯誤:', error);
    res.status(500).json({ success: false, message: '伺服器錯誤', error: error.message });
  }
};

module.exports = chatWithBot;