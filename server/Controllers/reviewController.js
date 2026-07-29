const Review = require('../models/Review');
const Item = require('../models/Item');
const Booking = require('../models/Booking');

exports.addReview = async (req, res) => {
  try {
    const { itemId, rating, comment } = req.body;
    const item = await Item.findById(itemId);
    if (!item) return res.status(404).json({ message: "Item not found" });

    const completedBooking = await Booking.findOne({
      item: itemId, renter: req.userId, status: 'completed'
    });
    if (!completedBooking) {
      return res.status(400).json({ message: "You can only review items you have rented and returned" });
    }

    const existingReview = await Review.findOne({ item: itemId, renter: req.userId });
    if (existingReview) return res.status(400).json({ message: "Review already given" });

    const review = new Review({ item: itemId, renter: req.userId, rating, comment });
    await review.save();

    completedBooking.reviewGiven = true;
    await completedBooking.save();

    res.status(201).json({ message: "Review added", review });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.getItemReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ item: req.params.itemId })
      .populate('renter', 'name avatar');
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};