const express = require('express');
const router = express.Router();
const favoriteController = require('../controllers/favorite/favoriteController');


router.get('/', favoriteController.getMyFavorites);
router.delete('/:favDocId', favoriteController.removeFavorite);
router.post('/', favoriteController.addFavorite); // 新增收藏
router.get('/check', favoriteController.checkFavoriteStatus); // 檢查狀態
module.exports = router;