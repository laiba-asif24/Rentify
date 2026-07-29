// server/routes/auth.js

const express = require('express');
const router = express.Router();
const { register, login } = require('../controllers/authController');
const upload = require('../middleware/upload');

function multerErrorHandler(err, req, res, next) {
  if (err) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ message: 'CNIC image is too large. Max size is 5MB.' });
    }
    if (err.message === 'Only images are allowed') {
      return res.status(400).json({ message: 'Only image files are allowed (JPG, PNG, GIF).' });
    }
    return res.status(400).json({ message: 'File upload error: ' + (err.message || 'Unknown') });
  }
  next();
}

// ✅ Register with CNIC image upload
router.post('/register', (req, res, next) => {
  upload.single('cnicImage')(req, res, (err) => multerErrorHandler(err, req, res, next));
}, register);

router.post('/login', login);

module.exports = router;