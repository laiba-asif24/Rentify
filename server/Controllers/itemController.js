// server/controllers/itemController.js

const Item = require('../models/Item');
const cloudinary = require('../config/cloudinary');

// ✅ GET ALL ITEMS (with filters)
exports.getAllItems = async (req, res) => {
  try {
    const { category, city, search } = req.query;
    let filter = {};
    if (category) filter.category = category;
    if (city) filter['location.city'] = city;
    if (search) filter.title = { $regex: search, $options: 'i' };
    const items = await Item.find(filter).populate('owner', 'name email city rating');
    res.json(items);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ✅ GET SINGLE ITEM
exports.getSingleItem = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id).populate('owner', 'name email city rating');
    if (!item) return res.status(404).json({ message: "Item not found" });
    res.json(item);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ✅ GET MY ITEMS (for dashboard)
exports.getMyItems = async (req, res) => {
  try {
    const items = await Item.find({ owner: req.userId });
    res.json(items);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ✅ ADD ITEM - With Cloudinary Image Upload
exports.addItem = async (req, res) => {
  try {
    console.log('📦 Adding item for user:', req.userId);
    console.log('📦 Request body:', req.body);
    console.log('📦 Files:', req.files ? req.files.length : 0);

    const { title, description, category, pricePerDay, location, deposit } = req.body;

    // Validation
    if (!title || !description || !category || !pricePerDay || !location) {
      return res.status(400).json({
        message: "All fields are required: title, description, category, pricePerDay, location"
      });
    }

    let imageUrls = [];

    // ✅ Upload images to Cloudinary if files exist
    if (req.files && req.files.length > 0) {
      console.log(`📸 Uploading ${req.files.length} images to Cloudinary...`);
      
      const uploadPromises = req.files.map(async (file, index) => {
        try {
          // Convert buffer to base64
          const b64 = Buffer.from(file.buffer).toString('base64');
          const dataURI = `data:${file.mimetype};base64,${b64}`;

          const result = await cloudinary.uploader.upload(dataURI, {
            folder: 'rentify',
            resource_type: 'image',
            public_id: `${Date.now()}_${index}`,
          });
          console.log(`✅ Image ${index + 1} uploaded:`, result.secure_url);
          return result.secure_url;
        } catch (err) {
          console.error(`❌ Cloudinary upload error for image ${index + 1}:`, err);
          return null;
        }
      });

      const results = await Promise.all(uploadPromises);
      imageUrls = results.filter(url => url !== null);
    }

    // If no images uploaded, use placeholder
    if (imageUrls.length === 0) {
      imageUrls = ['https://via.placeholder.com/400x300.png?text=No+Image'];
    }

    console.log('📸 Final image URLs:', imageUrls);

    const newItem = new Item({
      title,
      description,
      category,
      pricePerDay: Number(pricePerDay),
      location: {
        city: location.city || 'Unknown',
        area: location.area || 'Unknown'
      },
      deposit: Number(deposit) || 0,
      images: imageUrls,
      owner: req.userId,
      isAvailable: true
    });

    await newItem.save();
    console.log('✅ Item added successfully:', newItem._id);

    res.status(201).json({
      message: "Item added successfully",
      item: newItem
    });
  } catch (error) {
    console.error('❌ Error adding item:', error);
    res.status(500).json({
      message: "Server error",
      error: error.message
    });
  }
};

// ✅ UPDATE ITEM
exports.updateItem = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) return res.status(404).json({ message: "Item not found" });
    if (item.owner.toString() !== req.userId) return res.status(403).json({ message: "Not authorized" });

    // If new images are uploaded, upload to Cloudinary
    let imageUrls = item.images;
    if (req.files && req.files.length > 0) {
      const uploadPromises = req.files.map(async (file, index) => {
        try {
          const b64 = Buffer.from(file.buffer).toString('base64');
          const dataURI = `data:${file.mimetype};base64,${b64}`;
          const result = await cloudinary.uploader.upload(dataURI, {
            folder: 'rentify',
            resource_type: 'image',
            public_id: `${Date.now()}_${index}`,
          });
          return result.secure_url;
        } catch (err) {
          console.error('❌ Cloudinary upload error:', err);
          return null;
        }
      });
      const results = await Promise.all(uploadPromises);
      const newImages = results.filter(url => url !== null);
      if (newImages.length > 0) {
        imageUrls = newImages;
      }
    }

    const updatedItem = await Item.findByIdAndUpdate(
      req.params.id,
      { ...req.body, images: imageUrls },
      { new: true }
    );
    res.json({ message: "Item updated", item: updatedItem });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ✅ DELETE ITEM
exports.deleteItem = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) return res.status(404).json({ message: "Item not found" });
    if (item.owner.toString() !== req.userId) return res.status(403).json({ message: "Not authorized" });

    // Optional: Delete images from Cloudinary
    if (item.images && item.images.length > 0) {
      for (const imageUrl of item.images) {
        try {
          // Extract public_id from URL
          const parts = imageUrl.split('/');
          const filename = parts[parts.length - 1].split('.')[0];
          const publicId = `rentify/${filename}`;
          await cloudinary.uploader.destroy(publicId);
          console.log(`🗑️ Deleted image: ${publicId}`);
        } catch (err) {
          console.error('❌ Error deleting image from Cloudinary:', err);
        }
      }
    }

    await Item.findByIdAndDelete(req.params.id);
    res.json({ message: "Item deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};