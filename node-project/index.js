const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser'); // 1. 確保有引入這行
const authRoutes = require('./routes/auth'); 
const rentalRoutes = require('./routes/rentals');
const userRoutes = require('./routes/user');
const appointmentRoutes = require('./routes/appointments');

const app = express();

// ==========================================
// ⚠️ 關鍵順序區 (Middleware)
// ==========================================

// 2. 先設定 CORS
app.use(cors());

// 3. ✨ 最重要：Body Parser 設定必須在「路由」之前！
//    如果不寫在這裡，或者寫在路由下面，就會失效。
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ limit: '10mb', extended: true }));

// ==========================================
// 4. 最後才是載入路由
// ==========================================
app.use('/api', authRoutes);
app.use('/api/rentals', rentalRoutes);
app.use('/api/user', userRoutes);
app.use('/api/appointments', appointmentRoutes);

const port = process.env.PORT || 8080;
app.listen(port, () => {
  console.log(`後端伺服器運作中：http://localhost:${port}`);
});