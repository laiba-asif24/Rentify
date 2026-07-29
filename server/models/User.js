// server/models/User.js

const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true },
  city: { type: String, required: true },
  password: { type: String, required: true },
  cnicImage: { type: String },
  cnicVerified: { type: Boolean, default: false },
  avatar: { type: String },
  rating: { type: Number, default: 0 },
  bio: { type: String, default: '' },
  notifications: { type: Boolean, default: true },
  theme: { type: String, enum: ['light', 'dark'], default: 'light' },
}, { timestamps: true });

// ✅ Remove sensitive data from responses
userSchema.methods.toJSON = function() {
  const user = this.toObject();
  delete user.password;
  delete user.cnicImage;
  return user;
};

module.exports = mongoose.model('User', userSchema);