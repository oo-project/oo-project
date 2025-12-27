const express = require('express');
const router = express.Router();
const portalController = require('../controllers/tenant/portalController');

const chatController = require('../controllers/landlord/chatController');

router.get('/info', portalController.getMyLivingInfo);

router.post('/note', portalController.updateTenantNote);

router.post('/chat/send', chatController.sendMessage);
router.get('/chat/history', chatController.getChatHistory);
module.exports = router;