// server/socket.js

const { Server } = require('socket.io');
const Message = require('./models/Message');
const Booking = require('./models/Booking');
const User = require('./models/User');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const initSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: ["http://localhost:5173", "http://localhost:5000"],
      methods: ["GET", "POST"],
      credentials: true,
    },
    pingTimeout: 60000,
    pingInterval: 25000,
    transports: ['polling', 'websocket'],
    allowEIO3: true,
  });

  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error('Authentication error: No token provided'));
    }
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = decoded.id;
      console.log('✅ Socket authenticated:', socket.userId);
      next();
    } catch (err) {
      next(new Error('Authentication error: Invalid token'));
    }
  });

  io.on("connection", (socket) => {
    console.log("🟢 User connected:", socket.id, "User ID:", socket.userId);

    // ✅ JOIN ROOM
    socket.on("joinRoom", (bookingId) => {
      if (!bookingId || bookingId.startsWith('new-')) {
        socket.emit("error", { message: "Invalid booking ID" });
        return;
      }
      socket.join(bookingId);
      console.log(`📦 User ${socket.userId} joined room: ${bookingId}`);
      socket.emit("connected", { status: "joined", bookingId });
    });

    // ✅ SEND MESSAGE - WITH NOTIFICATION
    socket.on("sendMessage", async (data) => {
      try {
        const { bookingId, message } = data;
        
        console.log('📨 sendMessage:', { bookingId, message: message?.substring(0, 20) });
        console.log('🔑 Authenticated User (sender):', socket.userId);

        if (!bookingId || bookingId.startsWith('new-')) {
          socket.emit("error", { message: "Invalid booking ID" });
          return;
        }
        
        if (!message || message.trim() === '') {
          socket.emit("error", { message: "Message cannot be empty" });
          return;
        }

        const senderId = socket.userId;
        
        if (!senderId) {
          socket.emit("error", { message: "User not authenticated" });
          return;
        }

        console.log(`✅ Saving message from user: ${senderId}`);

        // ✅ Save message
        const newMsg = new Message({
          bookingId,
          senderId: senderId,
          message: message.trim(),
          timestamp: new Date(),
          isRead: false
        });

        await newMsg.save();

        // ✅ Populate sender name
        const populatedMsg = await Message.findById(newMsg._id)
          .populate('senderId', 'name');

        console.log('📤 Broadcasting message from:', populatedMsg.senderId?.name);

        // ✅ Send message to room
        io.to(bookingId).emit("receiveMessage", populatedMsg);

        // ✅ 🔔 SEND NOTIFICATION TO OTHER USER (who is NOT sender)
        // Get booking details to find other user
        const booking = await Booking.findById(bookingId)
          .populate('item', 'title')
          .populate('renter', 'name')
          .populate('owner', 'name');

        if (booking) {
          // Find the other user (not the sender)
          const otherUserId = booking.renter._id.toString() === senderId 
            ? booking.owner._id 
            : booking.renter._id;

          // Get other user's socket ID
          const otherUserSockets = await io.fetchSockets();
          const otherUserSocket = otherUserSockets.find(
            s => s.userId === otherUserId.toString()
          );

          if (otherUserSocket) {
            // ✅ Send notification to other user
            otherUserSocket.emit("newMessageNotification", {
              bookingId: bookingId,
              senderName: populatedMsg.senderId?.name || 'Someone',
              itemTitle: booking.item?.title || 'Item',
              message: populatedMsg.message,
              timestamp: new Date()
            });
            console.log(`🔔 Notification sent to user: ${otherUserId}`);
          }
        }

      } catch (error) {
        console.error("❌ Error sending message:", error);
        socket.emit("error", { message: "Failed to send message" });
      }
    });

    // ✅ TYPING INDICATOR
    socket.on("typing", (data) => {
      const { bookingId, senderId } = data;
      if (!bookingId || bookingId.startsWith('new-')) return;
      socket.to(bookingId).emit("typing", { senderId });
    });

    // ✅ MARK MESSAGES AS READ
    socket.on("markAsRead", async (data) => {
      try {
        const { bookingId } = data;
        await Message.updateMany(
          { 
            bookingId: bookingId,
            senderId: { $ne: socket.userId },
            isRead: false
          },
          { isRead: true }
        );
        console.log(`✅ Messages marked as read for booking: ${bookingId}`);
      } catch (error) {
        console.error("❌ Error marking messages as read:", error);
      }
    });

    socket.on("disconnect", (reason) => {
      console.log("🔴 User disconnected:", socket.id, "Reason:", reason);
    });
  });

  return io;
};

module.exports = initSocket;