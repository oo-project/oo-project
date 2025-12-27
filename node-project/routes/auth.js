const express = require('express');
const router = express.Router();

const registerController = require('../controllers/auth/register');
const loginController = require('../controllers/auth/login');
const updateProfileController = require('../controllers/auth/updateProfile');


// 註冊
router.post('/register', registerController);

// 登入
router.post('/login', loginController);

//更新基本資料
router.post('/update-profile', updateProfileController);



module.exports = router;