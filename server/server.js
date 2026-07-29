const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const path = require('path');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const itemRoutes = require('./routes/items');
const bookingRoutes = require('./routes/bookings');
const messageRoutes = require('./routes/messages');
const reviewRoutes = require('./routes/reviews');
const initSocket = require('./socket');

const app = express();
const server = http.createServer(app);

// Middleware
app.use(cors({
  origin: "http://localhost:5173",
  credentials: true
}));
app.use(express.json());

//  Frontend Static Files Serve Karo
const frontendPath = path.join(__dirname, '../vite-project/dist');
console.log(`📁 Serving frontend from: ${frontendPath}`);

//  Static files serve karo
app.use(express.static(frontendPath));

//  API Routes
app.use('/api/auth', authRoutes);
app.use('/api/items', itemRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/reviews', reviewRoutes);


app.get('/api', (req, res) => {
  res.send('Rentify API Running');
});

app.use((req, res) => {
  res.sendFile(path.join(frontendPath, 'index.html'));
});

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch(err => console.log("❌ MongoDB Error", err));

// Socket.io
initSocket(server);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📱 Frontend served from: ${frontendPath}`);
});

server.keepAliveTimeout = 61000;
server.headersTimeout = 65000;

app.use((req, res, next) => {
  console.log(`📨 ${req.method} ${req.url}`);
  next();
});