// client/src/components/ChatEmbedded.jsx

import { useState, useEffect, useRef } from 'react';
import { Box, Typography, TextField, IconButton, Avatar, CircularProgress, Alert, Menu, MenuItem, Dialog, DialogTitle, DialogContent, DialogActions, Button } from '@mui/material';
import { useAuth } from '../context/AuthContext';
import { io } from 'socket.io-client';
import axios from 'axios';
import { Send, Check, CheckCheck, User, Loader2, X, MoreVertical, Trash2 } from 'lucide-react';

const SOCKET_URL = 'http://localhost:5000';
const API_URL = 'http://localhost:5000/api';

const ChatEmbedded = ({ bookingId, onClose, isModal = false }) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [bookingDetails, setBookingDetails] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState('');
  const messagesEndRef = useRef(null);
  const socketRef = useRef(null);
  
  // ── DELETE CHAT STATE ──
  const [anchorEl, setAnchorEl] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

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

  // ── FETCH DATA ──
  useEffect(() => {
    if (!bookingId) return;

    const fetchData = async () => {
      try {
        const bookingRes = await axios.get(`${API_URL}/bookings/${bookingId}`, getHeaders());
        setBookingDetails(bookingRes.data);

        const msgRes = await axios.get(`${API_URL}/messages/${bookingId}`, getHeaders());
        setMessages(msgRes.data);
        setLoading(false);
      } catch (err) {
        console.error('Failed to fetch data:', err);
        setError('Failed to load chat');
        setLoading(false);
      }
    };
    fetchData();
  }, [bookingId]);

  // ── SOCKET CONNECTION ──
  useEffect(() => {
    if (!user || !bookingId || loading) return;

    const token = localStorage.getItem('token');
    if (!token) {
      setError('No token found');
      return;
    }

    const newSocket = io(SOCKET_URL, {
      transports: ['polling', 'websocket'],
      auth: { token: token },
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socketRef.current = newSocket;

    newSocket.on('connect', () => {
      setIsConnected(true);
      setError('');
      newSocket.emit('joinRoom', bookingId);
    });

    newSocket.on('disconnect', () => {
      setIsConnected(false);
    });

    newSocket.on('receiveMessage', (msg) => {
      setMessages((prev) => [...prev, msg]);
    });

    newSocket.on('connected', (data) => {
      console.log('📦 Joined room:', data);
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [bookingId, user, loading]);

  // ── SEND MESSAGE ──
  const sendMessage = () => {
    if (!newMessage.trim() || !socketRef.current || !isConnected) {
      setError('Not connected');
      return;
    }

    if (!user || !user._id) {
      setError('User not logged in');
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

  // ── DELETE CHAT ──
  const handleDeleteChat = async () => {
    setDeleting(true);
    try {
      await axios.delete(`${API_URL}/messages/${bookingId}`, getHeaders());
      setMessages([]);
      setDeleteDialogOpen(false);
      setAnchorEl(null);
    } catch (err) {
      console.error('Failed to delete chat:', err);
      setError('Failed to delete chat');
    }
    setDeleting(false);
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

  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', p: 3 }}>
        <CircularProgress sx={{ color: 'var(--sage-light)' }} />
      </Box>
    );
  }

  return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column', 
      height: '100%', 
      width: '100%',
      bgcolor: 'var(--bg)',
      overflow: 'hidden',
    }}>
      
      {/* ✅ HEADER - WITH 3 DOTS MENU */}
      <Box sx={{
        bgcolor: 'var(--bg-card)',
        borderBottom: '1px solid var(--line)',
        p: 2.5,
        display: 'flex',
        alignItems: 'center',
        gap: 2,
        flexShrink: 0,
      }}>
        <IconButton onClick={onClose} sx={{ color: 'var(--ink-soft)' }}>
          <X size={24} />
        </IconButton>
        <Avatar sx={{ bgcolor: 'var(--sage-light)', width: 40, height: 40 }}>
          {otherUser?.name?.[0]?.toUpperCase() || 'U'}
        </Avatar>
        <Box sx={{ flex: 1 }}>
          <Typography sx={{ fontWeight: 600, fontSize: '16px', color: 'var(--ink)' }}>
            {otherUser?.name || 'User'}
          </Typography>
          <Typography sx={{ fontSize: '12px', color: 'var(--slate)' }}>
            {isConnected ? '🟢 Online' : '⚪ Offline'}
          </Typography>
        </Box>
        
        {/* ✅ 3 DOTS MENU */}
        <IconButton 
          onClick={(e) => setAnchorEl(e.currentTarget)} 
          sx={{ color: 'var(--ink-soft)' }}
        >
          <MoreVertical size={22} />
        </IconButton>
        
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={() => setAnchorEl(null)}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'right',
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
          PaperProps={{
            sx: {
              borderRadius: '12px',
              bgcolor: 'var(--bg-card)',
              border: '1px solid var(--line)',
              boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
              minWidth: '160px',
              mt: 1,
            }
          }}
        >
          <MenuItem 
            onClick={() => {
              setAnchorEl(null);
              setDeleteDialogOpen(true);
            }}
            sx={{ 
              color: '#F87171',
              gap: 1.5,
              '&:hover': { bgcolor: 'rgba(248, 113, 113, 0.1)' }
            }}
          >
            <Trash2 size={16} /> Delete Chat
          </MenuItem>
        </Menu>
      </Box>

      {/* ✅ MESSAGES */}
      <Box sx={{
        flex: 1,
        overflowY: 'auto',
        p: 2.5,
        bgcolor: 'var(--bg)',
        position: 'relative',
        '&::before': {
          content: '""',
          position: 'absolute',
          inset: 0,
          backgroundImage: 'radial-gradient(circle at 20% 20%, rgba(139, 92, 246, 0.03) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(64, 159, 122, 0.03) 0%, transparent 50%)',
          pointerEvents: 'none'
        }
      }}>
        {error && <Alert severity="error" sx={{ mb: 2, borderRadius: '12px', bgcolor: 'rgba(248, 113, 113, 0.1)', border: '1px solid rgba(248, 113, 113, 0.2)', color: '#FCA5A5' }}>{error}</Alert>}

        {messages.length === 0 ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--slate)', position: 'relative', zIndex: 1 }}>
            <User size={40} style={{ opacity: 0.3, marginBottom: 12 }} />
            <Typography sx={{ fontSize: '14px', fontWeight: 500 }}>No messages yet</Typography>
            <Typography sx={{ fontSize: '13px' }}>Say hello to start the conversation</Typography>
          </Box>
        ) : (
          messages.map((msg, i) => {
            const senderId = typeof msg.senderId === 'object' ? msg.senderId?._id : msg.senderId;
            const isMine = String(senderId) === String(user._id);

            return (
              <Box
                key={i}
                sx={{
                  display: 'flex',
                  justifyContent: isMine ? 'flex-end' : 'flex-start',
                  mb: 1,
                  position: 'relative',
                  zIndex: 1,
                  animation: 'fadeInUp 0.3s ease-out forwards',
                  opacity: 0,
                  animationDelay: `${i * 0.05}s`
                }}
              >
                <Box
                  sx={{
                    maxWidth: '75%',
                    bgcolor: isMine ? 'var(--sage-dark)' : 'var(--bg-card)',
                    borderRadius: isMine ? '18px 4px 18px 18px' : '4px 18px 18px 18px',
                    px: 2.5,
                    py: 1.5,
                    border: '1px solid var(--line)',
                    boxShadow: '0 1px 2px rgba(0,0,0,0.06)',
                  }}
                >
                  <Typography sx={{ fontSize: '14px', color: 'var(--ink)', lineHeight: 1.5 }}>
                    {msg.message}
                  </Typography>
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
                    <Typography sx={{ fontSize: '10px', color: 'var(--slate)' }}>
                      {formatTime(msg.timestamp)}
                    </Typography>
                    {isMine && (
                      msg.isRead ? (
                        <CheckCheck size={14} style={{ color: 'var(--sage-light)' }} />
                      ) : (
                        <Check size={14} style={{ color: 'var(--slate)' }} />
                      )
                    )}
                  </Box>
                </Box>
              </Box>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </Box>

      {/* ✅ INPUT */}
      <Box sx={{
        display: 'flex',
        gap: 1.5,
        p: 2,
        bgcolor: 'var(--bg-card)',
        borderTop: '1px solid var(--line)',
        flexShrink: 0,
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
              fontSize: '15px',
              bgcolor: 'var(--bg)',
              color: 'var(--ink)',
              '& fieldset': { borderColor: 'var(--line)' },
              '&:hover fieldset': { borderColor: 'var(--line-strong)' },
              '&.Mui-focused fieldset': { borderColor: 'var(--purple)', borderWidth: '1.5px' },
              '&.Mui-disabled fieldset': { borderColor: 'var(--line)' },
              '&.Mui-disabled': { color: 'var(--slate)' },
            },
            '& .MuiOutlinedInput-input::placeholder': { color: 'var(--slate)', opacity: 1 }
          }}
        />
        <IconButton
          onClick={sendMessage}
          disabled={!newMessage.trim() || !isConnected || sending}
          sx={{
            bgcolor: 'var(--purple)',
            color: 'white',
            borderRadius: '50%',
            width: 52,
            height: 52,
            '&:hover': { bgcolor: 'var(--purple-light)', boxShadow: '0 8px 24px rgba(139,92,246,0.3)' },
            '&.Mui-disabled': { bgcolor: 'var(--line)', color: 'var(--slate)' },
            transition: 'all 0.25s var(--ease)'
          }}
        >
          {sending ? <Loader2 size={22} className="spin-send" /> : <Send size={22} />}
        </IconButton>
      </Box>

      {/* ✅ DELETE CONFIRMATION DIALOG */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        PaperProps={{
          sx: {
            borderRadius: '16px',
            bgcolor: 'var(--bg-card)',
            border: '1px solid var(--line)',
          }
        }}
      >
        <DialogTitle sx={{ pb: 1, pt: 2, px: 3 }}>
          <Typography sx={{ fontWeight: 700, fontSize: '18px', color: 'var(--ink)' }}>Delete Chat?</Typography>
        </DialogTitle>
        <DialogContent sx={{ px: 3 }}>
          <Typography sx={{ color: 'var(--slate)', fontSize: '14px' }}>
            Are you sure you want to delete all messages in this chat? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
          <Button 
            onClick={() => setDeleteDialogOpen(false)} 
            sx={{ 
              color: 'var(--slate)', 
              fontWeight: 600,
              borderRadius: '100px',
              px: 3,
            }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleDeleteChat} 
            disabled={deleting}
            sx={{ 
              bgcolor: '#DC2626', 
              color: 'white',
              fontWeight: 600,
              borderRadius: '100px',
              px: 3,
              '&:hover': { bgcolor: '#B91C1C' },
              '&.Mui-disabled': { bgcolor: 'var(--line)', color: 'var(--slate)' },
            }}
          >
            {deleting ? <Loader2 size={18} className="spin-send" /> : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>

      <style>{`
        @keyframes spinSend { to { transform: rotate(360deg); } }
        .spin-send { animation: spinSend 0.8s linear infinite; }
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </Box>
  );
};

export default ChatEmbedded;
