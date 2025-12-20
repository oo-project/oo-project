const express = require('express');
const router = express.Router();

const getAmenities = require('../controllers/rentals/getAmenities');
const addRental = require('../controllers/rentals/addRental');
const getRentals = require('../controllers/rentals/getRentals');
const getRentalById = require('../controllers/rentals/getRentalById');
const updateRental = require('../controllers/rentals/updateRental');
const deleteRental = require('../controllers/rentals/deleteRental');

// 取得設施選項
router.get('/amenities', getAmenities);

// 租件 CRUD
router.post('/add', addRental);         // 新增
router.get('/list', getRentals);        // 列表 (用 query string 傳 landlordId)
router.get('/:id', getRentalById);      // 詳情 (編輯用)
router.post('/update', updateRental);   // 更新
router.post('/delete', deleteRental);   // 刪除

module.exports = router;