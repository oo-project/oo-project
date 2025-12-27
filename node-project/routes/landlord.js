const express = require('express');
const router = express.Router();
const tenantsController = require('../controllers/landlord/tenantsController');
const chatController = require('../controllers/landlord/chatController');

router.get('/tenants', tenantsController.getTenants);

router.put('/tenants/:id', tenantsController.updateTenant);

router.post('/send', chatController.sendMessage);
router.get('/history', chatController.getChatHistory);
module.exports = router;