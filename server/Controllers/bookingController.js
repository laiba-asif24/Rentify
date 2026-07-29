// server/controllers/bookingController.js

const Booking = require('../models/Booking');
const Item = require('../models/Item');

// ✅ CREATE BOOKING
exports.createBooking = async (req, res) => {
  try {
    console.log('📦 Creating booking for user:', req.userId);
    console.log('📦 Request body:', req.body);

    const { itemId, startDate, endDate, agreementAccepted, renterCnic } = req.body;

    // ✅ Validation
    if (!itemId) {
      return res.status(400).json({ message: "Item ID is required" });
    }

    if (!startDate || !endDate) {
      return res.status(400).json({ message: "Start date and end date are required" });
    }

    const item = await Item.findById(itemId);
    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }

    if (!item.isAvailable) {
      return res.status(400).json({ message: "Item is not available" });
    }

    // ✅ Calculate days and total price
    const start = new Date(startDate);
    const end = new Date(endDate);
    const days = Math.max(1, Math.ceil((end - start) / (1000 * 60 * 60 * 24)));
    const totalPrice = days * item.pricePerDay;

    console.log(`📅 Days: ${days}, Total: ${totalPrice}`);

    // ✅ Create booking
    const booking = new Booking({
      item: itemId,
      renter: req.userId,
      owner: item.owner,
      startDate: start,
      endDate: end,
      totalPrice: totalPrice,
      status: 'pending',
      agreementAccepted: agreementAccepted || true,
      agreementTimestamp: new Date(),
      renterCnic: renterCnic || '00000-0000000-0'
    });

    await booking.save();
    console.log('✅ Booking created:', booking._id);

    res.status(201).json({
      message: "Booking request sent successfully",
      booking: booking
    });

  } catch (error) {
    console.error('❌ Error creating booking:', error);
    res.status(500).json({
      message: "Server error",
      error: error.message
    });
  }
};

// ✅ GET BOOKING BY ID
exports.getBookingById = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('item', 'title pricePerDay images category location deposit')
      .populate('renter', 'name email phone city')
      .populate('owner', 'name email phone city');

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    // Check if user is authorized
    if (booking.renter._id.toString() !== req.userId && 
        booking.owner._id.toString() !== req.userId) {
      return res.status(403).json({ message: "Not authorized" });
    }

    res.json(booking);
  } catch (error) {
    console.error('❌ Error fetching booking:', error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ✅ GET MY BOOKINGS (as renter)
exports.getMyBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ renter: req.userId })
      .populate('item', 'title pricePerDay images location')
      .populate('owner', 'name phone');
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ✅ GET OWNER BOOKINGS (as owner)
exports.getOwnerBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ owner: req.userId })
      .populate('item', 'title pricePerDay images')
      .populate('renter', 'name phone city cnic');
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ✅ UPDATE BOOKING STATUS
exports.updateBookingStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const booking = await Booking.findById(req.params.id);
    
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    if (booking.owner.toString() !== req.userId) {
      return res.status(403).json({ message: "Not authorized" });
    }

    booking.status = status;
    await booking.save();

    res.json({ message: `Booking ${status}`, booking });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};