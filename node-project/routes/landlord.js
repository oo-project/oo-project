const express = require('express');
const router = express.Router();
// 引用剛剛寫好的 controller
const tenantsController = require('../controllers/landlord/tenantsController');
const chatController = require('../controllers/landlord/chatController');


// GET /api/landlord/tenants?landlordId=...
router.get('/tenants', tenantsController.getTenants);

// PUT /api/landlord/tenants/:id
router.put('/tenants/:id', tenantsController.updateTenant);

router.post('/send', chatController.sendMessage);
router.get('/history', chatController.getChatHistory);
module.exports = router;