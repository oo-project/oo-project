const express = require('express');
const cors = require('cors');

// --- 引入路由 ---
const authRoutes = require('./routes/auth'); 
const rentalRoutes = require('./routes/rentals');
const tenantsRoutes = require('./routes/tenants');
const userRoutes = require('./routes/user');
const appointmentRoutes = require('./routes/appointments');
const contractsRoutes = require('./routes/contracts');
const landlordRoutes = require('./routes/landlord');
const tenantPortalRoutes = require('./routes/tenantPortal');
const chatRoutes = require('./routes/chat');
const favoriteRoutes = require('./routes/favorites');

const app = express();

// 1. CORS 設定

const corsOptions = {
  origin: [
    'http://localhost:5173',      // 本地開發
    'https://oo-rent.zeabur.app'  // 線上前端網址 (跟 Zeabur 網址一樣)
  ],
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true, // 允許帶有 cookie 的請求
  optionsSuccessStatus: 204
};
app.use(cors(corsOptions));


// 2. 解析器設定 (採用你的邏輯，為了 PDF 上傳)
// 須維持 50mb，不然上傳合約會失敗
app.use(express.json({ limit: '50mb' })); 
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// 3. 路由設定 

app.use('/api/auth', authRoutes);               // 登入驗證
app.use('/api/user', userRoutes);              // 使用者資訊
app.use('/api/room-tenants', tenantsRoutes);    // 房客名單
app.use('/api/appointments', appointmentRoutes);// 預約看房
app.use('/api/contracts', contractsRoutes);     // 合約管理
app.use('/api/landlord', landlordRoutes);       // 房東管理
app.use('/api/tenant/portal', tenantPortalRoutes); // 租客入口
app.use('/api/landlord/chat', chatRoutes);      // 聊天室
app.use('/api/rentals', rentalRoutes);          // 房源管理
app.use('/api/favorites', favoriteRoutes);      // 我的收藏

// 4. 啟動伺服器
//const PORT = process.env.PORT || 3000;
const PORT = 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ 後端伺服器運作中：http://0.0.0.0:${PORT}`);
});