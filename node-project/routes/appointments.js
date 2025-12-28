const express = require('express');
const router = express.Router();

// 引入所有的 Controllers
// 假設您的 controller 檔案都放在 ../controllers/appointments/ 資料夾下
const createAppointment = require('../controllers/appointments/createAppointment');
const getLandlordAppointments = require('../controllers/appointments/getLandlordAppointments');
const getTenantAppointments = require('../controllers/appointments/getTenantAppointments');
const updateAppointmentStatus = require('../controllers/appointments/updateAppointmentStatus');
const addMessage = require('../controllers/appointments/addMessage');
const negotiateAppointment = require('../controllers/appointments/negotiateAppointment');

// ==========================================
// 定義路由 (API Endpoints)
// ==========================================

// 1. 建立新預約
// 前端呼叫: POST /api/appointments/create
router.post('/create', createAppointment);

// 2. 取得房東的預約列表
// 前端呼叫: GET /api/appointments/landlord/:id
router.get('/landlord/:id', getLandlordAppointments);

// 3. 取得房客的預約列表
// 前端呼叫: GET /api/appointments/tenant/:id
router.get('/tenant/:id', getTenantAppointments);

// 4. 更新預約狀態 (確認/取消/完成)
// 前端呼叫: POST /api/appointments/:id/status
router.post('/:id/status', updateAppointmentStatus);

// 5. 新增對話訊息 (雙方通用)
// 前端呼叫: POST /api/appointments/:id/message
router.post('/:id/message', addMessage);

// 6. 房東發起協調 (舊版/專用)
// 前端呼叫: POST /api/appointments/:id/negotiate
router.post('/:id/negotiate', negotiateAppointment);

module.exports = router;