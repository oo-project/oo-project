const express = require('express');
const router = express.Router();
const chatWithBot = require('../controllers/bot/chatController');

router.post('/chat', chatWithBot);

module.exports = router;