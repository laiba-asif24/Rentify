

const express = require('express');
const router = express.Router();
const { 
  sendMessage, 
  getMessages, 
  deleteMessages,
  getUnreadCount,    
  markAsRead         
} = require('../controllers/messageController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/', authMiddleware, sendMessage);
router.get('/:bookingId', authMiddleware, getMessages);
router.delete('/:bookingId', authMiddleware, deleteMessages);
router.get('/unread/count', authMiddleware, getUnreadCount);      
router.put('/:bookingId/read', authMiddleware, markAsRead);       
module.exports = router;