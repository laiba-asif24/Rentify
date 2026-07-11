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
        } catch (err) {}
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
      senderId: user._id,
      message: newMessage.trim(),
    };

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

  if (authLoading || loading) {
    return (
      <Box sx={{ bgcolor: 'var(--cream)', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', pt: '110px' }}>
        <CircularProgress sx={{ color: 'var(--sage)' }} />
      </Box>
    );
  }

  if (!user) {
    return (
      <Box sx={{ bgcolor: 'var(--cream)', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', pt: '110px' }}>
        <Box sx={{ textAlign: 'center' }}>
          <Typography sx={{ fontSize: '1.2rem', color: 'var(--ink)', fontWeight: 600, mb: 1 }}>Please login to chat</Typography>
          <Typography onClick={() => navigate('/login')} sx={{ color: 'var(--sage)', cursor: 'pointer', fontWeight: 600 }}>Go to Login →</Typography>
        </Box>
      </Box>
    );
  }

  if (!bookingDetails) {
    return (
      <Box sx={{ bgcolor: 'var(--cream)', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', pt: '110px' }}>
        <Typography>Booking not found</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ bgcolor: 'var(--cream)', minHeight: '100vh', pt: '110px', pb: 4 }}>
      <Container maxWidth="md">
        {error && <Alert severity="error" sx={{ mb: 2, borderRadius: '12px' }}>{error}</Alert>}

        <Box sx={{
          bgcolor: 'white',
          borderRadius: '18px 18px 0 0',
          border: '1px solid var(--line)',
          borderBottom: 'none',
          p: 3,
          display: 'flex',
          alignItems: 'center',
          gap: 2,
        }}>
          <IconButton onClick={() => navigate('/dashboard')} sx={{ color: 'var(--slate)' }}>
            <ArrowLeft size={20} />
          </IconButton>
          <Avatar sx={{ bgcolor: 'var(--sage)', width: 40, height: 40 }}>
            {otherUser?.name?.[0] || 'U'}
          </Avatar>
          <Box sx={{ flex: 1 }}>
            <Typography sx={{ fontWeight: 700, fontSize: '16px', color: 'var(--ink)' }}>
              {otherUser?.name || 'User'}
            </Typography>
            <Typography sx={{ fontSize: '12px', color: 'var(--slate)' }}>
              {bookingDetails?.item?.title || 'Chat'}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
            <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: isConnected ? 'var(--sage)' : 'var(--slate)' }} />
            <Typography sx={{ fontSize: '11px', color: 'var(--slate)', fontFamily: '"IBM Plex Mono", monospace' }}>
              {isConnected ? 'Online' : 'Offline'}
            </Typography>
          </Box>
        </Box>

        <Box sx={{
          bgcolor: 'white',
          border: '1px solid var(--line)',
          borderTop: 'none',
          borderRadius: '0 0 18px 18px',
          height: 'calc(100vh - 380px)',
          minHeight: 400,
          display: 'flex',
          flexDirection: 'column',
          p: 3,
          overflow: 'hidden',
        }}>
          <Box sx={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 1.5, pr: 1 }}>
            {messages.length === 0 ? (
              <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--slate)' }}>
                <User size={40} style={{ opacity: 0.3, marginBottom: 12 }} />
                <Typography sx={{ fontSize: '14px', fontWeight: 500 }}>No messages yet</Typography>
                <Typography sx={{ fontSize: '13px', color: 'var(--slate)' }}>Say hello to start the conversation</Typography>
              </Box>
            ) : (
              messages.map((msg, i) => {
                const isMine = msg.senderId === user._id;
                const isFirstOfGroup = i === 0 || messages[i - 1].senderId !== msg.senderId;
                const showAvatar = !isMine && isFirstOfGroup;

                return (
                  <Box key={i} sx={{ display: 'flex', justifyContent: isMine ? 'flex-end' : 'flex-start', gap: 1.5, alignItems: 'flex-end' }}>
                    {showAvatar && <Avatar sx={{ bgcolor: 'var(--sage)', width: 32, height: 32, fontSize: '13px' }}>{otherUser?.name?.[0] || 'U'}</Avatar>}
                    {!isMine && !showAvatar && <Box sx={{ width: 32 }} />}
                    <Box sx={{
                      maxWidth: '70%',
                      bgcolor: isMine ? 'var(--sage)' : 'var(--cream)',
                      color: isMine ? 'white' : 'var(--ink)',
                      borderRadius: isMine ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                      px: 2.5,
                      py: 1.5,
                      wordBreak: 'break-word',
                    }}>
                      {!isMine && <Typography sx={{ fontSize: '11px', fontWeight: 600, color: 'var(--sage)', mb: 0.5 }}>{otherUser?.name?.split(' ')[0] || 'User'}</Typography>}
                      <Typography sx={{ fontSize: '14px', lineHeight: 1.5, whiteSpace: 'pre-wrap' }}>{msg.message}</Typography>
                      <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
                        <Typography sx={{ fontSize: '10px', opacity: 0.6 }}>
                          {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </Typography>
                        {isMine && (msg.isRead ? <CheckCheck size={14} style={{ opacity: 0.6 }} /> : <Check size={14} style={{ opacity: 0.4 }} />)}
                      </Box>
                    </Box>
                  </Box>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </Box>

          <Box sx={{ display: 'flex', gap: 1.5, mt: 2, pt: 2, borderTop: '1px solid var(--line)' }}>
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
                  borderRadius: '14px',
                  fontSize: '14px',
                  bgcolor: 'var(--cream)',
                  '& fieldset': { borderColor: 'transparent' },
                  '&:hover fieldset': { borderColor: 'var(--sage)' },
                  '&.Mui-focused fieldset': { borderColor: 'var(--sage)' },
                },
              }}
            />
            <IconButton
              onClick={sendMessage}
              disabled={!newMessage.trim() || !isConnected || sending}
              sx={{
                bgcolor: 'var(--ink)',
                color: 'var(--cream)',
                borderRadius: '50%',
                width: 52,
                height: 52,
                flexShrink: 0,
                '&:hover': { bgcolor: 'var(--sage)' },
                '&.Mui-disabled': { bgcolor: 'var(--line)', color: 'var(--slate)' },
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