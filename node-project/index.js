const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

// 1. 引入剛剛寫好的路由檔案
const authRoutes = require('./routes/auth');
// const rentalRoutes = require('./routes/rentals'); // 未來可以加這個

const app = express();

// 2. 中介軟體
app.use(cors());
app.use(bodyParser.json());

// 3. 掛載路由
// 這行的意思是：只要網址是 /api 開頭的，都交給 authRoutes 處理
// 所以 auth.js 裡的 '/register' 會變成 '/api/register'
app.use('/api', authRoutes);

// 未來如果有房源功能：
// app.use('/api/rentals', rentalRoutes); 

// 4. 啟動伺服器
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`後端伺服器運作中：http://localhost:${PORT}`);
});