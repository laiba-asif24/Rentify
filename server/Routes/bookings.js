// server/routes/bookings.js

const express = require('express');
const router = express.Router();
const { 
  createBooking, 
  getMyBookings, 
  getOwnerBookings, 
  updateBookingStatus,
  getBookingById   // ✅ Make sure this is imported
} = require('../controllers/bookingController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/', authMiddleware, createBooking);
router.get('/my', authMiddleware, getMyBookings);
router.get('/owner', authMiddleware, getOwnerBookings);
router.get('/:id', authMiddleware, getBookingById);  // ✅ Make sure this exists
router.put('/:id', authMiddleware, updateBookingStatus);

module.exports = router;