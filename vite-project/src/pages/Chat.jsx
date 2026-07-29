// client/src/pages/Chat.jsx

import { useState, useEffect, useRef } from 'react';
import { Box, Container, Typography, TextField, IconButton, Avatar, CircularProgress, Alert } from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { io } from 'socket.io-client';
import axios from 'axios';
import { Send, ArrowLeft, Check, CheckCheck, User, Loader2 } from 'lucide-react';

const SOCKET_URL = 'http://localhost:5000';
const API_URL = 'http://localhost:5000/api';

const Chat = () => {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const { user, loading: authLoading, updateUser } = useAuth();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [bookingDetails, setBookingDetails] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState('');
  const messagesEndRef = useRef(null);
  const socketRef = useRef(null);
  const reconnectAttempts = useRef(0);
  const isMounted = useRef(true);

  // Force reload user from localStorage
  useEffect(() => {
    if (!user && localStorage.getItem('token')) {
      const savedUser = localStorage.getItem('user');
      if (savedUser) {
        try {
          const parsedUser = JSON.parse(savedUser);
          updateUser(parsedUser);
        } catch (err) {
          console.error('Error parsing user:', err);
        }
      }
    }
  }, [user, updateUser]);

  useEffect(() => {
    if (!bookingId || bookingId.startsWith('new-')) {
      navigate('/dashboard');
      return;
    }
  }, [bookingId, navigate]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const getHeaders = () => ({
    headers: { 
      Authorization: `Bearer ${localStorage.getItem('token')}`,
      'Content-Type': 'application/json',
    }
  });

  useEffect(() => {
    if (!bookingId || bookingId.startsWith('new-')) return;

    const fetchData = async () => {
      try {
        const bookingRes = await axios.get(`${API_URL}/bookings/${bookingId}`, getHeaders());
        setBookingDetails(bookingRes.data);
        const msgRes = await axios.get(`${API_URL}/messages/${bookingId}`, getHeaders());
        setMessages(msgRes.data);
        setLoading(false);
      } catch (err) {
        console.error('Failed to fetch data:', err);
        setError('Failed to load chat. Please try again.');
        setLoading(false);
      }
    };

    fetchData();
  }, [bookingId]);

  // Socket connection
  useEffect(() => {
    if (authLoading) return;
    if (!user || !user._id) {
      setError('User not logged in');
      return;
    }
    if (!bookingId || bookingId.startsWith('new-') || loading) return;

    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      setError('No token found. Please login again.');
      return;
    }

    const newSocket = io(SOCKET_URL, {
      transports: ['polling', 'websocket'],
      auth: { token: token },
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 20000,
      forceNew: true,
    });

    socketRef.current = newSocket;

    newSocket.on('connect', () => {
      setIsConnected(true);
      setError('');
      reconnectAttempts.current = 0;
      newSocket.emit('joinRoom', bookingId);
    });

    newSocket.on('disconnect', (reason) => {
      setIsConnected(false);
      if (reason === 'io server disconnect' || reason === 'transport close') {
        reconnectAttempts.current += 1;
        if (reconnectAttempts.current < 5) {
          setTimeout(() => {
            if (socketRef.current && isMounted.current) {
              socketRef.current.connect();
            }
          }, 2000 * reconnectAttempts.current);
        }
      }
    });

    newSocket.on('connect_error', (err) => {
      setError('Unable to connect to chat server. Please refresh.');
      setIsConnected(false);
    });

    newSocket.on('receiveMessage', (msg) => {
      console.log('📩 New message received:', msg);
      setMessages((prev) => [...prev, msg]);
    });

    newSocket.on('connected', (data) => {
      console.log('📦 Joined room:', data);
    });

    newSocket.on('error', (err) => {
      setError(err.message || 'Chat error occurred');
    });

    return () => {
      isMounted.current = false;
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [bookingId, user, loading, authLoading]);

  // ✅ Send message - senderId server se set hoga
  const sendMessage = () => {
    if (!user || !user._id) {
      setError('User not logged in. Please login again.');
      return;
    }

    if (!bookingId || bookingId.startsWith('new-')) {
      setError('Invalid booking ID');
      return;
    }

    if (!newMessage.trim()) {
      setError('Please type a message');
      return;
    }

    if (!socketRef.current || !isConnected) {
      setError('Not connected to chat server.');
      if (socketRef.current && !socketRef.current.connected) {
        socketRef.current.connect();
      }
      return;
    }

    setSending(true);
    setError('');

    const messageData = {
      bookingId: bookingId,
      message: newMessage.trim(),
    };

    console.log('📤 Sending message:', messageData);
    socketRef.current.emit('sendMessage', messageData);
    setNewMessage('');
    setSending(false);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const getOtherUser = () => {
    if (!bookingDetails || !user) return null;
    if (bookingDetails.renter?._id === bookingDetails.owner?._id) {
      return { name: 'You (Owner & Renter)', _id: user._id };
    }
    return bookingDetails.renter?._id === user._id
      ? bookingDetails.owner
      : bookingDetails.renter;
  };

  const otherUser = getOtherUser();

  // Format time
  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (authLoading || loading) {
    return (
      <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', pt: '110px' }}>
        <CircularProgress sx={{ color: 'var(--sage)' }} />
      </Box>
    );
  }

  if (!user) {
    return (
      <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', pt: '110px' }}>
        <Box sx={{ textAlign: 'center' }}>
          <Typography sx={{ fontSize: '1.2rem', color: 'var(--ink)', fontWeight: 600, mb: 1 }}>Please login to chat</Typography>
          <Typography onClick={() => navigate('/login')} sx={{ color: 'var(--sage)', cursor: 'pointer', fontWeight: 600 }}>Go to Login →</Typography>
        </Box>
      </Box>
    );
  }

  if (!bookingDetails) {
    return (
      <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', pt: '110px' }}>
        <Typography>Booking not found</Typography>
      </Box>
    );
  }

  return (
    <Box className="page-enter" sx={{ minHeight: '100vh', pt: '110px', pb: 4 }}>
      <Container maxWidth="md">
        {error && <Alert severity="error" sx={{ mb: 2, borderRadius: '12px' }}>{error}</Alert>}

        {/* ✅ WhatsApp Style Header with Rentify Theme */}
        <Box sx={{
          bgcolor: 'var(--sage)',  // ✅ Rentify Theme Color
          borderRadius: '18px 18px 0 0',
          p: 2,
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        }}>
          <IconButton onClick={() => navigate('/dashboard')} sx={{ color: 'white' }}>
            <ArrowLeft size={24} />
          </IconButton>
          <Avatar sx={{ bgcolor: 'white', width: 40, height: 40 }}>
            {otherUser?.name?.[0] || 'U'}
          </Avatar>
          <Box sx={{ flex: 1 }}>
            <Typography sx={{ fontWeight: 700, fontSize: '16px', color: 'white' }}>
              {otherUser?.name || 'User'}
            </Typography>
            <Typography sx={{ fontSize: '12px', color: 'rgba(255,255,255,0.8)' }}>
              {isConnected ? '🟢 Online' : '⚪ Offline'}
            </Typography>
          </Box>
        </Box>

        {/* ✅ WhatsApp Style Messages with Rentify Theme */}
        <Box sx={{
          bgcolor: 'var(--bg-card)',
          border: '1px solid var(--line)',
          borderTop: 'none',
          borderRadius: '0 0 18px 18px',
          height: 'calc(100vh - 380px)',
          minHeight: 400,
          display: 'flex',
          flexDirection: 'column',
          p: 2,
          overflow: 'hidden',
        }}>
          
          <Box sx={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 1, pr: 1 }}>
  {messages.length === 0 ? (
    <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--slate)' }}>
      <User size={40} style={{ opacity: 0.3, marginBottom: 12 }} />
      <Typography sx={{ fontSize: '14px', fontWeight: 500, color: 'var(--slate)' }}>No messages yet</Typography>
      <Typography sx={{ fontSize: '13px', color: 'var(--slate)' }}>Say hello to start the conversation</Typography>
    </Box>
  ) : (
    messages.map((msg, i) => {
      const senderId = typeof msg.senderId === 'object' ? msg.senderId?._id : msg.senderId;
      const isMine = String(senderId) === String(user._id);

      return (
        <Box key={i} sx={{ display: 'flex', flexDirection: 'column', alignItems: isMine ? 'flex-end' : 'flex-start', mb: 0.5 }}>
          <Box sx={{
            maxWidth: '75%',
            bgcolor: isMine ? 'var(--sage)' : 'var(--bg-card-hover)',
            color: isMine ? 'white' : 'var(--ink)',
            borderRadius: isMine ? '18px 4px 18px 18px' : '4px 18px 18px 18px',
            px: 2, py: 1.2, wordBreak: 'break-word',
            boxShadow: '0 1px 2px rgba(0,0,0,0.08)',
          }}>
            <Typography sx={{ fontSize: '14px', lineHeight: 1.5, whiteSpace: 'pre-wrap' }}>
              {msg.message}
            </Typography>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 0.5, mt: 0.3 }}>
              <Typography sx={{ fontSize: '10px', color: isMine ? 'rgba(255,255,255,0.75)' : 'rgba(0,0,0,0.4)' }}>
                {formatTime(msg.timestamp)}
              </Typography>
              {isMine && (msg.isRead ? <CheckCheck size={14} style={{ color: 'white' }} /> : <Check size={14} style={{ color: 'rgba(255,255,255,0.7)' }} />)}
            </Box>
          </Box>
        </Box>
      );
    })
  )}
  <div ref={messagesEndRef} />
</Box>

          {/* ✅ WhatsApp Style Input */}
          <Box sx={{
            display: 'flex',
            gap: 1,
            mt: 1,
            pt: 1,
            borderTop: '1px solid var(--line)',
            bgcolor: 'transparent',
          }}>
            <TextField
              fullWidth
              multiline
              maxRows={3}
              placeholder="Type a message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={handleKeyPress}
              disabled={!isConnected}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '30px',
                  fontSize: '14px',
                  bgcolor: 'var(--bg-card)',
                  '& fieldset': { borderColor: 'var(--line)' },
                  '&:hover fieldset': { borderColor: 'var(--sage)' },
                  '&.Mui-focused fieldset': { borderColor: 'var(--sage)' },
                },
              }}
            />
            <IconButton
              onClick={sendMessage}
              disabled={!newMessage.trim() || !isConnected || sending}
              sx={{
                bgcolor: 'var(--sage)',
                color: 'white',
                borderRadius: '50%',
                width: 50,
                height: 50,
                flexShrink: 0,
                '&:hover': { bgcolor: 'var(--sage-light)' },
                '&.Mui-disabled': { bgcolor: 'var(--line)', color: 'white' },
                transition: 'all 0.3s var(--ease)',
              }}
            >
              {sending ? <Loader2 size={20} className="spin-send" /> : <Send size={20} />}
            </IconButton>
          </Box>
        </Box>
      </Container>

      <style>{`
        @keyframes spinSend { to { transform: rotate(360deg); } }
        .spin-send { animation: spinSend 0.8s linear infinite; }
      `}</style>
    </Box>
  );
};

export default Chat;