const express = require('express');
const router = express.Router();
const getPublicProfile = require('../controllers/user/getPublicProfile');
const updateProfile = require('../controllers/user/updateProfile');

router.get('/:id', getPublicProfile); // 取得公開資料
router.post('/update', updateProfile); // 更新資料

module.exports = router;