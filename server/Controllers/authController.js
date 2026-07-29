// server/controllers/authController.js

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const cloudinary = require('../config/cloudinary');

// REGISTER - WITH CNIC IMAGE
exports.register = async (req, res) => {
  try {
    console.log('📝 Register request received');
    console.log('📦 Body keys:', Object.keys(req.body || {}));
    if (req.body) {
      try {
        const safeBody = Object.assign({}, req.body);
        if (safeBody.password) safeBody.password = '[REDACTED]';
        console.log('� Body (no password):', JSON.stringify(safeBody));
      } catch(e) {}
    }
    if (req.file) {
      console.log('� File OK:', { field: req.file.fieldname, sizeKb: Math.round(req.file.size / 1024), type: req.file.mimetype, name: req.file.originalname });
    } else {
      console.warn('⚠️ NO req.file — multer did not parse any file with field "cnicImage"');
    }

    const { name, email, phone, city, password } = req.body || {};
    const cnicImage = req.file;

    // ✅ Check if all fields are present
    if (!name || !email || !phone || !city || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // ✅ Check if CNIC image is uploaded
    if (!cnicImage) {
      return res.status(400).json({ message: "CNIC image is required" });
    }

    // Check if user already exists
    try {
      const existingUser = await User.findOne({ email: (email || '').toLowerCase() });
      if (existingUser) {
        console.warn('⚠️ Register denied: email already exists:', (email || '').toLowerCase());
        return res.status(400).json({ message: "User with this email already exists. Please log in instead." });
      }
    } catch (dbErr) {
      console.error('❌ DB check existing user failed:', dbErr);
      return res.status(500).json({ message: "Database connection error - please try again" });
    }

    // ✅ Upload CNIC image to Cloudinary — REQUIRED (strict: no register without verified CNIC)
    let cnicImageUrl = '';
    try {
      const cloudConfig = cloudinary.config();
      if (!cloudConfig.cloud_name || !cloudConfig.api_key || !cloudConfig.api_secret) {
        console.error('❌ Cloudinary credentials missing in .env');
        return res.status(500).json({ message: "CNIC verification service unavailable. Please contact support." });
      }
      console.log('🔄 Attempting Cloudinary CNIC upload...');
      const b64 = Buffer.from(cnicImage.buffer).toString('base64');
      const dataURI = `data:${cnicImage.mimetype};base64,${b64}`;
      const result = await cloudinary.uploader.upload(dataURI, {
        folder: 'rentify/cnic',
        resource_type: 'image',
        timeout: 20000,
      });
      console.log('✅ Cloudinary CNIC upload success:', result.secure_url);
      cnicImageUrl = result.secure_url;
    } catch (cloudinaryError) {
      console.error('❌ Cloudinary CNIC upload failed:', cloudinaryError.message || cloudinaryError);
      return res.status(500).json({ message: "CNIC verification failed. Please try a smaller photo (under 2MB) in JPG/PNG format." });
    }

    if (!cnicImageUrl) {
      return res.status(500).json({ message: "CNIC verification incomplete. Please re-upload your CNIC and try again." });
    }

    let hashedPassword = '';
    try {
      hashedPassword = await bcrypt.hash(password, 10);
    } catch (bcryptErr) {
      console.error('❌ Bcrypt hash failed:', bcryptErr);
      return res.status(500).json({ message: "Account security error (password). Please use a different password (at least 8 chars)." });
    }

    const newUser = new User({
      name,
      email: email.toLowerCase(),
      phone,
      city,
      password: hashedPassword,
      cnicImage: cnicImageUrl,
      cnicVerified: true,
    });

    try {
      await newUser.save();
    } catch (saveErr) {
      console.error('❌ Mongo save error:', saveErr);
      if (saveErr.code === 11000) {
        console.warn('⚠️ Register denied: duplicate email at save stage:', (email || '').toLowerCase());
        return res.status(400).json({ message: "User with this email already exists. Please log in instead." });
      }
      if (saveErr.name === 'ValidationError') {
        const firstErr = saveErr.errors && Object.values(saveErr.errors)[0];
        return res.status(400).json({ message: "Invalid input: " + (firstErr ? firstErr.message : saveErr.message) });
      }
      return res.status(500).json({ message: "Could not create account - please try again" });
    }

    console.log('✅ User registered successfully:', newUser._id);
    res.status(201).json({ message: "User registered successfully" });

  } catch (error) {
    console.error('❌ Fatal register error:', error);
    const msg = error.message || String(error);
    // Only append detail if it's something informative (not generic)
    if (msg && msg.length < 160 && !/server error|fatal|unknown/i.test(msg)) {
      return res.status(500).json({ message: "Server error - please try again. Detail: " + msg });
    }
    return res.status(500).json({ message: "Server error - please try again" });
  }
};

// LOGIN
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    // ✅ Return complete user data
    res.json({
      token,
      user: {
        id: user._id,
        _id: user._id,
        name: user.name,
        email: user.email,
        city: user.city,
        phone: user.phone,
        bio: user.bio || '',
        avatar: user.avatar || '',
        rating: user.rating || 0,
        notifications: user.notifications !== undefined ? user.notifications : true,
        theme: user.theme || 'light',
        createdAt: user.createdAt,
        cnic: user.cnic || '00000-0000000-0'
      }
    });

  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};