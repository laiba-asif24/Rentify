// server/routes/users.js

const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const User = require('../models/User');
const bcrypt = require('bcryptjs');

// ✅ GET USER PROFILE
router.get('/profile', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-password -cnicImage');
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// ✅ UPDATE PROFILE
router.put('/profile', authMiddleware, async (req, res) => {
  try {
    const { name, phone, city, bio } = req.body;
    const user = await User.findById(req.userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    if (name !== undefined) user.name = name;
    if (phone !== undefined) user.phone = phone;
    if (city !== undefined) user.city = city;
    if (bio !== undefined) user.bio = bio;
    
    await user.save();
    
    const updatedUser = await User.findById(req.userId).select('-password -cnicImage');
    res.json(updatedUser);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// ✅ GET USER STATS
router.get('/stats', authMiddleware, async (req, res) => {
  try {
    const Item = require('../models/Item');
    const Booking = require('../models/Booking');
    
    const listings = await Item.countDocuments({ owner: req.userId });
    const bookings = await Booking.countDocuments({ renter: req.userId });
    const user = await User.findById(req.userId);
    
    res.json({
      listings,
      bookings,
      reviews: 0,
      rating: user?.rating || 0
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;