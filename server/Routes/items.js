// server/routes/items.js

const express = require('express');
const router = express.Router();
const {
  getAllItems,
  getSingleItem,
  addItem,
  updateItem,
  deleteItem,
  getMyItems
} = require('../Controllers/itemController');
const authMiddleware = require('../middleware/authMiddleware');
const upload = require('../middleware/upload');

router.get('/', getAllItems);
router.get('/my', authMiddleware, getMyItems);
router.get('/:id', getSingleItem);

// ✅ UPDATED - Add upload middleware
router.post('/', authMiddleware, upload.array('images', 4), addItem);

router.put('/:id', authMiddleware, updateItem);
router.delete('/:id', authMiddleware, deleteItem);

module.exports = router;