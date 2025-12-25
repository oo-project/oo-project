const express = require('express');
const router = express.Router();
const updateProfile = require('../controllers/user/updateProfile');
const getUserById = require('../controllers/user/getUserById');
const changePassword = require('../controllers/user/changePassword');

router.post('/update', updateProfile); // 更新資料
router.get('/:id', getUserById);
router.post('/change-password', changePassword); // 修改密碼

module.exports = router;