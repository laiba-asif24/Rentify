// server/models/Item.js

const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  category: { 
    type: String, 
    required: true, 
    enum: ['Tools', 'Cameras', 'Camping', 'Party & events', 'Sports & bikes', 'Audio & tech']  // ✅ FIXED
  },
  pricePerDay: { type: Number, required: true },
  images: [{ type: String }],
  location: {
    city: { type: String, required: true },
    area: { type: String, required: true }
  },
  deposit: { type: Number, default: 0 },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  isAvailable: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Item', itemSchema);