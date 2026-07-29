const express = require('express');
const router = express.Router();
const { addReview, getItemReviews } = require('../controllers/reviewController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/', authMiddleware, addReview);
router.get('/:itemId', getItemReviews);

module.exports = router;