const Message = require('../models/Message');
const Booking = require('../models/Booking');

exports.sendMessage = async (req, res) => {
  try {
    const { bookingId, message } = req.body;
    const booking = await Booking.findById(bookingId);
    if (!booking) return res.status(404).json({ message: "Booking not found" });
    if (booking.renter.toString() !== req.userId && booking.owner.toString() !== req.userId) {
      return res.status(403).json({ message: "Not authorized" });
    }
    const newMessage = new Message({ bookingId, senderId: req.userId, message });
    await newMessage.save();
    res.status(201).json({ message: "Message sent", data: newMessage });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.getMessages = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const booking = await Booking.findById(bookingId);
    if (!booking) return res.status(404).json({ message: "Booking not found" });
    if (booking.renter.toString() !== req.userId && booking.owner.toString() !== req.userId) {
      return res.status(403).json({ message: "Not authorized" });
    }
    const messages = await Message.find({ bookingId })
      .populate('senderId', 'name')
      .sort({ createdAt: 1 });
    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
// ✅ DELETE ALL MESSAGES FOR A BOOKING
exports.deleteMessages = async (req, res) => {
  try {
    const { bookingId } = req.params;
    
    // Check if booking exists
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }
    
    // Check if user is authorized (renter or owner)
    if (booking.renter.toString() !== req.userId && booking.owner.toString() !== req.userId) {
      return res.status(403).json({ message: "Not authorized" });
    }
    
    // Delete all messages
    await Message.deleteMany({ bookingId });
    
    res.json({ message: "Chat deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
// ✅ GET UNREAD MESSAGES COUNT
exports.getUnreadCount = async (req, res) => {
  try {
    // Get all bookings where user is either renter or owner
    const Booking = require('../models/Booking');
    const bookings = await Booking.find({
      $or: [
        { renter: req.userId },
        { owner: req.userId }
      ]
    });
    
    const bookingIds = bookings.map(b => b._id);
    
    // Count unread messages where user is not the sender
    const count = await Message.countDocuments({
      bookingId: { $in: bookingIds },
      senderId: { $ne: req.userId },
      isRead: false
    });
    
    res.json({ unread: count });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// ✅ MARK MESSAGES AS READ
exports.markAsRead = async (req, res) => {
  try {
    const { bookingId } = req.params;
    
    await Message.updateMany(
      { 
        bookingId: bookingId,
        senderId: { $ne: req.userId },
        isRead: false
      },
      { isRead: true }
    );
    
    res.json({ message: 'Messages marked as read' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};