
import { useState, useEffect, useRef } from 'react';
import {
  Box, Grid, Typography, Avatar, Chip, Paper, Button, Divider, CircularProgress,
  TextField, MenuItem, Alert, Dialog, IconButton
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { io } from 'socket.io-client';
import {
  LayoutDashboard, Package, Calendar, Inbox, Plus, Check, X,
  MessageCircle, Star, ChevronRight, Clock, LogOut, User,
  DollarSign, TrendingUp, Bell, Eye, ShoppingBag,
  MapPin, Mail, Phone, Shield, Edit2, Save, Loader2, Camera,
  Upload, ArrowLeft, Trash2, AlertTriangle
} from 'lucide-react';
import ChatEmbedded from '../components/ChatEmbedded';
import { dash, statusConfigDark, dashFieldStyle, dashPaper } from '../utils/dashboardTheme';

const SOCKET_URL = 'http://localhost:5000';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, login, logout, updateUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [editMode, setEditMode] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: '',
    phone: '',
    city: '',
    bio: '',
  });
  const [myListings, setMyListings] = useState([]);
  const [myBookings, setMyBookings] = useState([]);
  const [incomingBookings, setIncomingBookings] = useState([]);
  const [stats, setStats] = useState({
    listings: 0,
    bookings: 0,
    pending: 0,
    rating: 4.8,
    totalEarnings: 0,
  });
  const [socket, setSocket] = useState(null);
  const socketRef = useRef(null);

  // ── ADD ITEM STATE ──
  const [showAddItem, setShowAddItem] = useState(false);
  const [itemForm, setItemForm] = useState({
    title: '',
    category: '',
    pricePerDay: '',
    location: { city: '', area: '' },
    deposit: '',
    description: ''
  });
  const [itemImages, setItemImages] = useState([]);
  const [itemImageFiles, setItemImageFiles] = useState([]);
  const [itemLoading, setItemLoading] = useState(false);
  const [itemSuccess, setItemSuccess] = useState(false);
  const [itemError, setItemError] = useState('');
  const categoryList = ['Tools', 'Cameras', 'Camping', 'Party & events', 'Sports & bikes', 'Audio & tech'];

  // ── CHAT MODAL STATE ──
  const [chatModalOpen, setChatModalOpen] = useState(false);
  const [chatBookingId, setChatBookingId] = useState(null);

  // ── NOTIFICATION STATE ──
  const [unreadCount, setUnreadCount] = useState(0);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);

  // ── REVIEW MODAL STATE ──
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [reviewBooking, setReviewBooking] = useState(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewLoading, setReviewLoading] = useState(false);
  const [reviewAlert, setReviewAlert] = useState({ open: false, message: '', severity: 'success' });

  // ── DELETE LISTING MODAL STATE ──
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteAlert, setDeleteAlert] = useState({ open: false, message: '', severity: 'success' });

  const openDeleteModal = (listing) => {
    setItemToDelete(listing);
    setDeleteModalOpen(true);
  };

  const handleDeleteItem = async () => {
    if (!itemToDelete) return;
    try {
      setDeleteLoading(true);
      await api.delete(`/items/${itemToDelete._id}`);
      setMyListings(prev => prev.filter(x => x._id !== itemToDelete._id));
      setStats(prev => ({ ...prev, listings: Math.max(0, prev.listings - 1) }));
      setDeleteModalOpen(false);
      setItemToDelete(null);
      setDeleteAlert({ open: true, message: 'Listing deleted successfully.', severity: 'success' });
      setTimeout(() => setDeleteAlert({ ...deleteAlert, open: false }), 3500);
    } catch (err) {
      console.error('Delete listing failed:', err);
      const msg = err.response?.data?.message || 'Failed to delete listing. Please try again.';
      setDeleteAlert({ open: true, message: msg, severity: 'error' });
      setTimeout(() => setDeleteAlert({ ...deleteAlert, open: false }), 4500);
      setDeleteModalOpen(false);
      setItemToDelete(null);
    } finally {
      setDeleteLoading(false);
    }
  };

  const openReviewModal = (booking) => {
    setReviewBooking(booking);
    setReviewRating(5);
    setReviewComment('');
    setReviewModalOpen(true);
  };

  const handleReviewSubmit = async () => {
    if (!reviewBooking || reviewComment.trim() === '') {
      setReviewAlert({ open: true, message: 'Please write a comment for your review', severity: 'warning' });
      setTimeout(() => setReviewAlert({ ...reviewAlert, open: false }), 3500);
      return;
    }
    try {
      setReviewLoading(true);
      await api.post('/reviews', {
        itemId: reviewBooking.item?._id,
        rating: reviewRating,
        comment: reviewComment.trim()
      });
      setReviewAlert({ open: true, message: '✅ Review submitted successfully!', severity: 'success' });

      const updatedBookings = myBookings.map(b =>
        b._id === reviewBooking._id ? { ...b, reviewGiven: true } : b
      );
      setMyBookings(updatedBookings);

      setTimeout(() => {
        setReviewModalOpen(false);
        setReviewBooking(null);
        setReviewLoading(false);
        setReviewAlert({ ...reviewAlert, open: false });
      }, 1500);
    } catch (err) {
      setReviewAlert({
        open: true,
        message: err.response?.data?.message || 'Failed to submit review',
        severity: 'error'
      });
      setReviewLoading(false);
      setTimeout(() => setReviewAlert({ ...reviewAlert, open: false }), 4000);
    }
  };

  const openChat = (bookingId) => {
    setChatBookingId(bookingId);
    setChatModalOpen(true);
  };

  // ── SOCKET CONNECTION ──
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;

    const newSocket = io(SOCKET_URL, {
      transports: ['polling', 'websocket'],
      auth: { token: token },
    });

    socketRef.current = newSocket;
    setSocket(newSocket);

    newSocket.on('connect', () => {
      console.log('✅ Socket connected for notifications');
    });

    newSocket.on('newMessageNotification', (data) => {
      console.log('🔔 New message notification:', data);
      setUnreadCount(prev => prev + 1);
      setNotifications(prev => [{
        bookingId: data.bookingId,
        senderName: data.senderName || 'Someone',
        itemTitle: data.itemTitle || 'Chat',
        message: data.message || '',
        timestamp: data.timestamp || new Date()
      }, ...prev]);
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, []);

  // ── FETCH UNREAD COUNT ──
  const fetchUnreadCount = async () => {
    try {
      const res = await api.get('/messages/unread/count');
      setUnreadCount(res.data.unread || 0);
    } catch (err) {
      console.error('Failed to fetch unread count:', err);
    }
  };

  // ── MARK MESSAGES AS READ ──
  const markMessagesAsRead = async (bookingId) => {
    try {
      await api.put(`/messages/${bookingId}/read`);
      setUnreadCount(prev => Math.max(0, prev - 1));
      setNotificationOpen(false);
      openChat(bookingId);
    } catch (err) {
      console.error('Failed to mark messages as read:', err);
    }
  };

  // ── FETCH DATA ──
  useEffect(() => {
    fetchUnreadCount();

    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const listingsRes = await api.get('/items/my');
        setMyListings(listingsRes.data);

        const bookingsRes = await api.get('/bookings/my');
        setMyBookings(bookingsRes.data);

        const incomingRes = await api.get('/bookings/owner');
        setIncomingBookings(incomingRes.data);

        const totalEarnings = incomingRes.data
          .filter((b) => b.status === 'approved' || b.status === 'confirmed' || b.status === 'completed')
          .reduce((sum, b) => sum + (b.totalPrice || 0), 0);

        setStats({
          listings: listingsRes.data.length,
          bookings: bookingsRes.data.length,
          pending: incomingRes.data.filter((b) => b.status === 'pending').length,
          rating: 4.8,
          totalEarnings: totalEarnings,
        });

        if (user) {
          setForm({
            name: user.name || '',
            phone: user.phone || '',
            city: user.city || '',
            bio: user.bio || '',
          });
        }

        setLoading(false);
      } catch (err) {
        console.error('Failed to fetch dashboard data:', err);
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, [user]);

  // ── STATUS ──
  const statusConfig = statusConfigDark;

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await api.put('/users/profile', form);
      const updated = res.data.user || res.data;
      updateUser(updated);
      setEditMode(false);
    } catch (err) {
      console.error('Failed to update profile:', err);
      alert(err.response?.data?.message || 'Profile update failed. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  // ── ITEM HANDLERS ──
  const handleItemChange = (e) => {
    const { name, value } = e.target;
    if (name === 'city' || name === 'area') {
      setItemForm({ ...itemForm, location: { ...itemForm.location, [name]: value } });
    } else {
      setItemForm({ ...itemForm, [name]: value });
    }
  };

  const handleItemImageUpload = (e) => {
    const files = Array.from(e.target.files);
    const remaining = 4 - itemImages.length;
    const selected = files.slice(0, remaining);
    setItemImageFiles([...itemImageFiles, ...selected]);
    const previews = selected.map((f) => URL.createObjectURL(f));
    setItemImages([...itemImages, ...previews]);
  };

  const removeItemImage = (idx) => {
    setItemImages(itemImages.filter((_, i) => i !== idx));
    setItemImageFiles(itemImageFiles.filter((_, i) => i !== idx));
  };

  const handleItemSubmit = async (e) => {
    e.preventDefault();
    setItemLoading(true);
    setItemError('');

    try {
      const formData = new FormData();
      formData.append('title', itemForm.title);
      formData.append('description', itemForm.description);
      formData.append('category', itemForm.category);
      formData.append('pricePerDay', itemForm.pricePerDay);
      formData.append('location[city]', itemForm.location.city);
      formData.append('location[area]', itemForm.location.area);
      formData.append('deposit', itemForm.deposit);

      itemImageFiles.forEach((file) => {
        formData.append('images', file);
      });

      await api.post('/items', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setItemSuccess(true);
      const listingsRes = await api.get('/items/my');
      setMyListings(listingsRes.data);
      setStats(prev => ({ ...prev, listings: listingsRes.data.length }));

      setTimeout(() => {
        setItemSuccess(false);
        setShowAddItem(false);
        setActiveTab('listings');
        setItemForm({
          title: '',
          category: '',
          pricePerDay: '',
          location: { city: '', area: '' },
          deposit: '',
          description: ''
        });
        setItemImages([]);
        setItemImageFiles([]);
        setItemLoading(false);
      }, 1500);
    } catch (err) {
      console.error('❌ Error adding item:', err);
      setItemError(err.response?.data?.message || 'Failed to add item');
      setItemLoading(false);
    }
  };

  // ── NAV ITEMS ──
  const navItems = [
    { key: 'overview', label: 'Overview', icon: LayoutDashboard },
    { key: 'listings', label: 'My Listings', icon: Package },
    { key: 'bookings', label: 'My Bookings', icon: ShoppingBag },
    { key: 'incoming', label: 'Requests', icon: Inbox, badge: stats.pending },
  ];

  // ── COMPONENTS ──
  const InfoItem = ({ icon: Icon, label, value, fullWidth = false }) => (
    <Box sx={{ gridColumn: fullWidth ? '1 / -1' : 'auto' }}>
      <Typography sx={{ fontSize: '11px', fontWeight: 700, color: 'var(--slate)', fontFamily: '"IBM Plex Mono", monospace', letterSpacing: '0.08em', mb: 0.5 }}>
        {label}
      </Typography>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        {Icon && <Icon size={16} color="var(--slate)" />}
        <Typography sx={{ fontSize: '15px', color: 'var(--ink)', fontWeight: 500 }}>
          {value || '—'}
        </Typography>
      </Box>
    </Box>
  );

  const fieldStyle = dashFieldStyle;

  const itemFieldStyle = dashFieldStyle;

  if (loading) {
    return (
      <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'var(--bg)', alignItems: 'center', justifyContent: 'center' }}>
        <CircularProgress sx={{ color: 'var(--purple)' }} />
      </Box>
    );
  }

  const statCards = [
    { 
      label: 'Active Listings', 
      value: stats.listings, 
      icon: Package, 
      color: 'var(--sage-light)',
      bgColor: 'rgba(64,159,122,0.15)',
      change: '+2 this month',
      trend: 'up',
      gradient: 'linear-gradient(135deg, rgba(64,159,122,0.2) 0%, rgba(64,159,122,0.05) 100%)'
    },
    { 
      label: 'Total Bookings', 
      value: stats.bookings, 
      icon: Calendar, 
      color: '#E8A33D',
      bgColor: 'rgba(232,163,61,0.15)',
      change: '+1 this week',
      trend: 'up',
      gradient: 'linear-gradient(135deg, rgba(232,163,61,0.2) 0%, rgba(232,163,61,0.05) 100%)'
    },
    { 
      label: 'Total Earned', 
      value: `Rs ${stats.totalEarnings.toLocaleString()}`, 
      icon: DollarSign, 
      color: 'var(--purple)',
      bgColor: 'rgba(139,92,246,0.15)',
      change: 'From rentals',
      trend: 'neutral',
      gradient: 'linear-gradient(135deg, rgba(139,92,246,0.2) 0%, rgba(139,92,246,0.05) 100%)'
    },
    { 
      label: 'Avg Rating', 
      value: stats.rating, 
      icon: Star, 
      color: '#E8A33D',
      bgColor: 'rgba(232,163,61,0.15)',
      change: '12 reviews',
      trend: 'up',
      gradient: 'linear-gradient(135deg, rgba(232,163,61,0.2) 0%, rgba(232,163,61,0.05) 100%)'
    },
  ];

  const quickStats = [
    { label: 'Total Views', value: '142', icon: Eye, color: 'var(--sage-light)' },
    { label: 'Conversion Rate', value: '68%', icon: TrendingUp, color: '#E8A33D' },
    { label: 'Response Rate', value: '94%', icon: Clock, color: 'var(--ink)' },
    { label: 'Active Items', value: stats.listings, icon: Package, color: 'var(--sage-light)' },
  ];

  const chartData = [
    { month: 'Jan', earnings: 1200, bookings: 2 },
    { month: 'Feb', earnings: 800, bookings: 1 },
    { month: 'Mar', earnings: 1500, bookings: 3 },
    { month: 'Apr', earnings: 2000, bookings: 4 },
    { month: 'May', earnings: 2500, bookings: 5 },
    { month: 'Jun', earnings: 3000, bookings: 6 },
  ];

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'var(--bg)' }}>

      {/* ── SIDEBAR ── */}
      <Box sx={{
        width: 280,
        bgcolor: 'var(--beige-dark)',
        borderRight: '1px solid var(--line)',
        display: 'flex',
        flexDirection: 'column',
        position: 'fixed',
        top: 0, left: 0, bottom: 0,
        zIndex: 100,
        flexShrink: 0,
      }}>
        <Box sx={{ px: 3, py: 3.5, borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, cursor: 'pointer' }} onClick={() => navigate('/')}>
            <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#E8A33D' }} />
            <Typography sx={{ fontFamily: '"Fraunces", serif', fontWeight: 600, fontSize: '1.2rem', color: 'white', letterSpacing: '-0.02em' }}>
              Rentify
            </Typography>
          </Box>
        </Box>

        <Box sx={{ px: 3, py: 3, borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar sx={{ width: 40, height: 40, bgcolor: 'var(--purple)', fontSize: '0.95rem', fontWeight: 700 }}>
              {user?.name?.[0]?.toUpperCase() || 'U'}
            </Avatar>
            <Box sx={{ overflow: 'hidden' }}>
              <Typography sx={{ fontWeight: 600, fontSize: '14px', color: 'white', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {user?.name || 'User'}
              </Typography>
              <Typography sx={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {user?.email || ''}
              </Typography>
            </Box>
          </Box>
        </Box>

        <Box sx={{ flex: 1, px: 2, py: 2, overflowY: 'auto' }}>
          <Typography sx={{ fontSize: '10px', fontWeight: 700, color: 'rgba(255,255,255,0.25)', letterSpacing: '0.12em', px: 1, mb: 1.5 }}>
            MAIN MENU
          </Typography>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.key;
            return (
              <Box key={item.key} onClick={() => setActiveTab(item.key)}
                sx={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  px: 2.5, py: 1.5, borderRadius: '10px', cursor: 'pointer', mb: 0.5,
                  bgcolor: isActive ? 'rgba(139,92,246,0.2)' : 'transparent',
                  transition: 'all 0.2s ease',
                  '&:hover': { bgcolor: 'rgba(255,255,255,0.06)' },
                }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Icon size={16} color={isActive ? 'white' : 'rgba(255,255,255,0.45)'} />
                  <Typography sx={{ fontSize: '13.5px', fontWeight: isActive ? 600 : 500, color: isActive ? 'white' : 'rgba(255,255,255,0.55)' }}>
                    {item.label}
                  </Typography>
                </Box>
                {item.badge > 0 && (
                  <Box sx={{ width: 18, height: 18, borderRadius: '50%', bgcolor: '#E8A33D', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Typography sx={{ fontSize: '10px', fontWeight: 700, color: 'var(--ink)' }}>{item.badge}</Typography>
                  </Box>
                )}
              </Box>
            );
          })}

          <Divider sx={{ borderColor: 'rgba(255,255,255,0.06)', my: 2 }} />

          <Typography sx={{ fontSize: '10px', fontWeight: 700, color: 'rgba(255,255,255,0.25)', letterSpacing: '0.12em', px: 1, mb: 1.5 }}>
            ACCOUNT
          </Typography>

          {[
            { label: 'Profile', icon: User, action: () => setActiveTab('profile') },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <Box key={item.label} onClick={item.action}
                sx={{ display: 'flex', alignItems: 'center', gap: 2, px: 2.5, py: 1.5, borderRadius: '10px', cursor: 'pointer', mb: 0.5, '&:hover': { bgcolor: 'rgba(255,255,255,0.06)' } }}>
                <Icon size={16} color="rgba(255,255,255,0.45)" />
                <Typography sx={{ fontSize: '13.5px', fontWeight: 500, color: 'rgba(255,255,255,0.55)' }}>
                  {item.label}
                </Typography>
              </Box>
            );
          })}
        </Box>

        <Box sx={{ px: 2, py: 3, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <Box onClick={handleLogout}
            sx={{ display: 'flex', alignItems: 'center', gap: 2, px: 2.5, py: 1.5, borderRadius: '10px', cursor: 'pointer', '&:hover': { bgcolor: 'rgba(255,255,255,0.06)' } }}>
            <LogOut size={16} color="rgba(255,255,255,0.35)" />
            <Typography sx={{ fontSize: '13.5px', fontWeight: 500, color: 'rgba(255,255,255,0.4)' }}>Sign out</Typography>
          </Box>
        </Box>
      </Box>

      {/* ── MAIN CONTENT ── */}
      <Box sx={{ 
        ml: '280px', 
        flex: 1, 
        p: { xs: 1, md: 2 }, 
        width: 'calc(100% - 280px)',
        maxWidth: '100%',
        overflowX: 'hidden',
        bgcolor: 'var(--bg)',
        minHeight: '100vh'
      }}>

        {/* Top bar */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Box>
            <Typography sx={{ fontSize: '12px', color: 'var(--slate)', fontFamily: '"IBM Plex Mono", monospace', mb: 0.5 }}>
              {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </Typography>
            <Typography sx={{ fontFamily: '"Fraunces", serif', fontSize: '1.6rem', fontWeight: 600, color: 'var(--ink)' }}>
              {activeTab === 'overview' && 'Overview'}
              {activeTab === 'listings' && 'My Listings'}
              {activeTab === 'bookings' && 'My Bookings'}
              {activeTab === 'incoming' && 'Incoming Requests'}
              {activeTab === 'profile' && 'Your Profile'}
              {activeTab === 'additem' && 'List a New Item'}
            </Typography>
          </Box>
          
          <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
            
            {/* Notification Icon */}
            <Box sx={{ position: 'relative' }}>
              <IconButton 
                onClick={() => setNotificationOpen(!notificationOpen)}
                sx={{ 
                  bgcolor: 'var(--bg-card)',
                  border: '1px solid var(--line)',
                  borderRadius: '50%',
                  width: 40,
                  height: 40,
                  '&:hover': { bgcolor: 'var(--line)' }
                }}
              >
                <Bell size={18} color="var(--slate)" />
                {unreadCount > 0 && (
                  <Box sx={{
                    position: 'absolute',
                    top: -4,
                    right: -4,
                    bgcolor: '#DC2626',
                    color: 'white',
                    borderRadius: '50%',
                    width: 20,
                    height: 20,
                    fontSize: '10px',
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 2px 8px rgba(220,38,38,0.3)',
                  }}>
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </Box>
                )}
              </IconButton>
              
{/* ✅ NOTIFICATION DROPDOWN */}
{notificationOpen && (
  <Paper elevation={3} sx={{
    position: 'absolute',
    top: 48,
    right: 0,
    width: 360,
    maxHeight: 420,
    overflow: 'auto',
    borderRadius: '16px',
    boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
    zIndex: 999,
    p: 0,
  }}>
    <Box sx={{ 
      p: 2.5, 
      borderBottom: '1px solid var(--line)',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    }}>
      <Typography sx={{ fontWeight: 700, fontSize: '16px', color: 'var(--ink)' }}>
        🔔 Notifications {unreadCount > 0 && `(${unreadCount})`}
      </Typography>
      {unreadCount > 0 && (
        <Typography 
          onClick={() => {
            notifications.forEach(n => {
              api.put(`/messages/${n.bookingId}/read`);
            });
            setUnreadCount(0);
            setNotifications([]);
            setNotificationOpen(false);
          }}
          sx={{ 
            fontSize: '12px', 
            color: 'var(--sage-light)', 
            cursor: 'pointer',
            fontWeight: 600,
            '&:hover': { textDecoration: 'underline' }
          }}
        >
          Mark all read
        </Typography>
      )}
    </Box>
    
    {unreadCount === 0 ? (
      <Box sx={{ textAlign: 'center', py: 5 }}>
        <Typography sx={{ fontSize: '40px', mb: 1 }}>🔕</Typography>
        <Typography sx={{ color: 'var(--slate)', fontSize: '15px', fontWeight: 500 }}>
          No new notifications
        </Typography>
        <Typography sx={{ color: 'var(--slate)', fontSize: '13px' }}>
          All caught up!
        </Typography>
      </Box>
    ) : (
      notifications.map((n, i) => (
        <Box 
          key={i}
          onClick={() => {
            api.put(`/messages/${n.bookingId}/read`);
            setUnreadCount(prev => Math.max(0, prev - 1));
            setNotificationOpen(false);
            setChatBookingId(n.bookingId);
            setChatModalOpen(true);
          }}
          sx={{
            p: 2.5,
            borderBottom: i < notifications.length - 1 ? '1px solid var(--line)' : 'none',
            cursor: 'pointer',
            bgcolor: 'rgba(62,124,107,0.04)',
            transition: 'all 0.2s ease',
            '&:hover': { 
              bgcolor: 'rgba(62,124,107,0.08)',
              transform: 'translateX(4px)'
            },
            display: 'flex',
            alignItems: 'flex-start',
            gap: 2,
          }}
        >
          <Avatar sx={{
            width: 40,
            height: 40,
            bgcolor: 'var(--sage-light)',
            fontSize: '14px',
            fontWeight: 600,
            flexShrink: 0,
          }}>
            {n.senderName?.[0]?.toUpperCase() || 'U'}
          </Avatar>
          
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.3 }}>
              <Typography sx={{ 
                fontWeight: 700, 
                fontSize: '14px', 
                color: 'var(--ink)',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}>
                {n.senderName || 'Someone'}
              </Typography>
              <Typography sx={{ 
                fontSize: '12px', 
                color: 'var(--slate)',
                whiteSpace: 'nowrap',
              }}>
                • {n.itemTitle || 'Chat'}
              </Typography>
            </Box>
            
            <Typography sx={{
              fontSize: '13px',
              color: 'var(--slate)',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              mb: 0.5,
            }}>
              {n.message || 'Sent a message'}
            </Typography>
            
            <Typography sx={{
              fontSize: '10px',
              color: 'var(--slate)',
              fontFamily: '"IBM Plex Mono", monospace',
            }}>
              {new Date(n.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </Typography>
          </Box>
          
          <Box sx={{
            width: 10,
            height: 10,
            borderRadius: '50%',
            bgcolor: 'var(--sage-light)',
            flexShrink: 0,
            mt: 0.5,
            boxShadow: '0 0 0 3px rgba(62,124,107,0.15)',
          }} />
        </Box>
      ))
    )}
  </Paper>
)}

     </Box>
            
            {/* List an Item */}
            <Box onClick={() => { setShowAddItem(true); setActiveTab('additem'); }}
              sx={{ display: 'flex', alignItems: 'center', gap: 1.5, bgcolor: 'var(--purple)', color: 'white', px: 3, py: 1.3, borderRadius: '100px', cursor: 'pointer', fontSize: '13px', fontWeight: 600, transition: 'all 0.2s ease', '&:hover': { bgcolor: 'var(--purple-light)' }, boxShadow: '0 4px 16px rgba(139,92,246,0.25)' }}>
              <Plus size={15} /> List an Item
            </Box>
          </Box>
        </Box>

        {/* ── OVERVIEW TAB ── */}
        {activeTab === 'overview' && (
          <Box sx={{ 
            px: 2, 
            flex: 1, 
            display: 'flex', 
            flexDirection: 'column', 
            minHeight: 0 
          }}>
            
            {/* Stats Row */}
            <Grid container spacing={3} sx={{ mb: 3, mx: 0, width: '100%' }}>
              {statCards.map((s, i) => {
                const Icon = s.icon;
                return (
                  <Grid item xs={6} sm={6} md={3} key={i} sx={{ px: 0.5 }}>
                    <Paper elevation={0} sx={{ 
                      bgcolor: 'var(--bg-card)', 
                      borderRadius: '16px', 
                      p: 3.5, 
                      border: '1px solid var(--line)',
                      backgroundImage: s.gradient,
                      position: 'relative',
                      overflow: 'hidden',
                      transition: 'all 0.4s var(--ease)',
                      transform: 'translateY(0)',
                      animation: 'fadeInScale 0.6s ease-out forwards',
                      opacity: 0,
                      animationDelay: `${i * 0.1}s`,
                      '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        right: 0,
                        width: '100px',
                        height: '100px',
                        backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.05) 0%, transparent 70%)',
                        pointerEvents: 'none',
                        transform: 'translate(20px, -20px)'
                      },
                      '&:hover': { 
                        boxShadow: '0 12px 40px rgba(0,0,0,0.15)', 
                        transform: 'translateY(-4px) scale(1.02)',
                        borderColor: 'var(--line-strong)'
                      }
                    }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                        <Box sx={{ 
                          width: 48, 
                          height: 48, 
                          borderRadius: '12px', 
                          bgcolor: s.bgColor, 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'center',
                          transition: 'transform 0.3s var(--ease)',
                          '&:hover': {
                            transform: 'rotate(5deg) scale(1.1)'
                          }
                        }}>
                          <Icon size={24} color={s.color} />
                        </Box>
                        <Chip 
                          label={s.change} 
                          size="small" 
                          sx={{ 
                            bgcolor: s.trend === 'up' ? 'rgba(64,159,122,0.15)' : 'rgba(255,255,255,0.05)', 
                            color: s.trend === 'up' ? 'var(--sage-light)' : 'var(--slate)', 
                            fontSize: '11px', 
                            fontWeight: 600, 
                            height: 24,
                            borderRadius: '100px'
                          }} 
                        />
                      </Box>
                      <Typography sx={{ 
                        fontFamily: '"Fraunces", serif', 
                        fontSize: '2rem', 
                        fontWeight: 700, 
                        color: 'var(--ink)', 
                        mb: 0.5,
                        lineHeight: 1.1
                      }}>
                        {s.value}
                      </Typography>
                      <Typography sx={{ 
                        color: 'var(--slate)', 
                        fontSize: '14px', 
                        fontWeight: 500 
                      }}>
                        {s.label}
                      </Typography>
                    </Paper>
                  </Grid>
                );
              })}
            </Grid>

            {/* Chart + Quick Stats */}
            <Grid container spacing={3} sx={{ mb: 3, mx: 0, width: '100%', flexShrink: 0 }}>
              <Grid item xs={12} md={8} sx={{ px: 0.5 }}>
                <Paper elevation={0} sx={{ 
                  bgcolor: 'var(--bg-card)', 
                  borderRadius: '16px', 
                  p: 3.5, 
                  border: '1px solid var(--line)',
                  height: '100%',
                  animation: 'fadeInUp 0.6s ease-out forwards',
                  opacity: 0,
                  animationDelay: '0.4s'
                }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Box>
                      <Typography sx={{ fontWeight: 700, fontSize: '16px', color: 'var(--ink)' }}>Earnings Overview</Typography>
                      <Typography sx={{ fontSize: '13px', color: 'var(--slate)' }}>Last 6 months performance</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                        <Box sx={{ width: 10, height: 10, borderRadius: '3px', bgcolor: 'var(--sage-light)' }} />
                        <Typography sx={{ fontSize: '11px', color: 'var(--slate)' }}>Earnings</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                        <Box sx={{ width: 10, height: 10, borderRadius: '3px', bgcolor: '#E8A33D' }} />
                        <Typography sx={{ fontSize: '11px', color: 'var(--slate)' }}>Bookings</Typography>
                      </Box>
                    </Box>
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'flex-end', height: 200, gap: 1.5, pt: 1 }}>
                    {chartData.map((d, i) => {
                      const maxVal = 3500;
                      const eHeight = (d.earnings / maxVal) * 160;
                      const bHeight = (d.bookings / 8) * 160;
                      return (
                        <Box key={i} sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                          <Box sx={{ display: 'flex', alignItems: 'flex-end', gap: 0.8, height: 170 }}>
                            <Box sx={{ 
                              width: 22, 
                              height: Math.max(eHeight, 4), 
                              bgcolor: 'var(--sage-light)', 
                              borderRadius: '4px 4px 0 0', 
                              transition: 'all 0.3s ease', 
                              '&:hover': { opacity: 0.8, transform: 'scaleY(1.03)' } 
                            }} />
                            <Box sx={{ 
                              width: 22, 
                              height: Math.max(bHeight, 4), 
                              bgcolor: '#E8A33D', 
                              borderRadius: '4px 4px 0 0', 
                              transition: 'all 0.3s ease', 
                              '&:hover': { opacity: 0.8, transform: 'scaleY(1.03)' } 
                            }} />
                          </Box>
                          <Typography sx={{ fontSize: '11px', color: 'var(--slate)', mt: 0.5, fontWeight: 500 }}>{d.month}</Typography>
                        </Box>
                      );
                    })}
                  </Box>
                </Paper>
              </Grid>

              <Grid item xs={12} md={4} sx={{ px: 0.5 }}>
                <Paper elevation={0} sx={{ 
                  bgcolor: 'var(--bg-card)', 
                  borderRadius: '16px', 
                  p: 3.5, 
                  border: '1px solid var(--line)', 
                  height: '100%',
                  animation: 'fadeInUp 0.6s ease-out forwards',
                  opacity: 0,
                  animationDelay: '0.5s'
                }}>
                  <Typography sx={{ fontWeight: 700, fontSize: '16px', color: 'var(--ink)', mb: 2.5 }}>
                    Quick Stats
                  </Typography>
                  {quickStats.map((s, i) => {
                    const Icon = s.icon;
                    return (
                      <Box 
                        key={i} 
                        sx={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'space-between', 
                          py: 1.75, 
                          borderBottom: i < 3 ? '1px solid var(--line)' : 'none',
                          transition: 'all 0.2s ease',
                          '&:hover': {
                            pl: 0.5,
                            bgcolor: 'rgba(255,255,255,0.02)'
                          }
                        }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Box sx={{ 
                            width: 36, 
                            height: 36, 
                            borderRadius: '10px', 
                            bgcolor: `${s.color}15`, 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center',
                            border: `1px solid ${s.color}30`
                          }}>
                            <Icon size={18} color={s.color} />
                          </Box>
                          <Typography sx={{ fontSize: '13px', color: 'var(--slate)', whiteSpace: 'nowrap', fontWeight: 500 }}>
                            {s.label}
                          </Typography>
                        </Box>
                        <Typography sx={{ fontSize: '15px', fontWeight: 700, color: 'var(--ink)', whiteSpace: 'nowrap', ml: 1 }}>
                          {s.value}
                        </Typography>
                      </Box>
                    );
                  })}
                </Paper>
              </Grid>
            </Grid>

            {/* Recent Activity + Pending Requests */}
            <Box sx={{ flex: 1, minHeight: 0, mb: 0 }}>
              <Grid container spacing={3} sx={{ mx: 0, width: '100%', height: '100%' }}>
              <Grid item xs={12} md={8} sx={{ px: 0.5 }}>
                <Paper elevation={0} sx={{ 
                  bgcolor: 'var(--bg-card)', 
                  borderRadius: '16px', 
                  p: 3.5, 
                  border: '1px solid var(--line)', 
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  animation: 'fadeInUp 0.6s ease-out forwards',
                  opacity: 0,
                  animationDelay: '0.6s'
                }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2.5, flexShrink: 0 }}>
                    <Typography sx={{ fontWeight: 700, fontSize: '16px', color: 'var(--ink)' }}>Recent Activity</Typography>
                    <Box onClick={() => setActiveTab('bookings')} sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: 0.5, 
                      color: 'var(--sage-light)', 
                      cursor: 'pointer', 
                      fontSize: '13px', 
                      fontWeight: 600,
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        color: '#68B89E'
                      }
                    }}>
                      View all <ChevronRight size={16} />
                    </Box>
                  </Box>
                  <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                    {myBookings.length === 0 ? (
                      <Box sx={{ 
                        textAlign: 'center', 
                        py: 4, 
                        bgcolor: 'rgba(255,255,255,0.03)', 
                        borderRadius: '12px', 
                        flex: 1, 
                        display: 'flex', 
                        flexDirection: 'column', 
                        alignItems: 'center', 
                        justifyContent: 'center' 
                      }}>
                        <Typography sx={{ color: 'var(--slate)' }}>No recent activity</Typography>
                        <Typography sx={{ color: 'var(--slate)', fontSize: '13px', mt: 0.5 }}>Start renting or listing items to see activity here</Typography>
                      </Box>
                    ) : (
                      myBookings.slice(0, 3).map((b, i) => {
                        const s = statusConfig(b.status);
                        return (
                          <Box key={b._id} sx={{ flexShrink: 0 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2.5, py: 1.7, borderBottom: i < 2 ? '1px solid var(--line)' : 'none' }}>
                              <Box sx={{ width: 52, height: 52, borderRadius: '12px', overflow: 'hidden', bgcolor: 'rgba(255,255,255,0.03)', flexShrink: 0, boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
                                <Box component="img" src={b.item?.images?.[0] || 'https://via.placeholder.com/52'} sx={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                              </Box>
                              <Box sx={{ flex: 1 }}>
                                <Typography sx={{ fontWeight: 600, fontSize: '14px', color: 'var(--ink)' }}>{b.item?.title}</Typography>
                                <Typography sx={{ fontSize: '12px', color: 'var(--slate)' }}>{b.owner?.name} · {new Date(b.startDate).toLocaleDateString()}</Typography>
                              </Box>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6, bgcolor: s.bg, px: 1.3, py: 0.5, borderRadius: '100px', border: '1px solid ' + s.dot + '33' }}>
                                  <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: s.dot }} />
                                  <Typography sx={{ fontSize: '11px', fontWeight: 600, color: s.color }}>{s.label}</Typography>
                                </Box>
                                <Typography sx={{ fontSize: '14px', fontWeight: 700, color: 'var(--ink)' }}>Rs {b.totalPrice?.toLocaleString()}</Typography>
                              </Box>
                            </Box>
                          </Box>
                        );
                      })
                    )}
                  </Box>
                </Paper>
              </Grid>

              <Grid item xs={12} md={4} sx={{ px: 0.5 }}>
                <Grid container spacing={3} sx={{ height: '100%' }}>
                  <Grid item xs={12} sx={{ display: 'flex' }}>
                    <Paper elevation={0} sx={{ 
                      bgcolor: 'var(--bg-card)', 
                      borderRadius: '16px', 
                      p: 3.5, 
                      border: '1px solid var(--line)', 
                      flex: 1,
                      height: '100%',
                      animation: 'fadeInUp 0.6s ease-out forwards',
                      opacity: 0,
                      animationDelay: '0.7s'
                    }}>
                      <Typography sx={{ fontWeight: 700, fontSize: '16px', color: 'var(--ink)', mb: 2.5 }}>
                        Pending Requests
                      </Typography>
                      {incomingBookings.filter(b => b.status === 'pending').length === 0 ? (
                        <Box sx={{ 
                          textAlign: 'center', 
                          py: 4, 
                          bgcolor: 'rgba(255,255,255,0.03)', 
                          borderRadius: '12px',
                          border: '1px dashed var(--line)'
                        }}>
                          <Typography sx={{ fontSize: '32px', mb: 1.5 }}>✨</Typography>
                          <Typography sx={{ color: 'var(--slate)', fontWeight: 600, fontSize: '14px', mb: 0.5 }}>All clear!</Typography>
                          <Typography sx={{ color: 'var(--slate)', fontSize: '12px' }}>No pending requests right now</Typography>
                        </Box>
                      ) : (
                        incomingBookings.filter(b => b.status === 'pending').map((b) => (
                          <Box key={b._id} sx={{ mb: 2.5, pb: 2.5, borderBottom: '1px solid var(--line)' }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
                              <Box>
                                <Typography sx={{ fontWeight: 600, fontSize: '15px', color: 'var(--ink)' }}>{b.renter?.name}</Typography>
                                <Typography sx={{ fontSize: '13px', color: 'var(--slate)' }}>{b.item?.title}</Typography>
                              </Box>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6, bgcolor: 'rgba(232,163,61,0.12)', px: 1.5, py: 0.5, borderRadius: '100px' }}>
                                <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: '#E8A33D' }} />
                                <Typography sx={{ fontSize: '11px', fontWeight: 700, color: '#E8A33D' }}>Pending</Typography>
                              </Box>
                            </Box>
                            <Box sx={{ display: 'flex', gap: 1.5, mt: 1 }}>
                              <Box onClick={async () => { try { await api.put(`/bookings/${b._id}`, { status: 'approved' }); window.location.reload(); } catch (err) {} }} sx={{ 
                                flex: 1, 
                                bgcolor: 'var(--sage-light)', 
                                color: 'white', 
                                textAlign: 'center', 
                                py: 1, 
                                borderRadius: '10px', 
                                cursor: 'pointer', 
                                fontSize: '13px', 
                                fontWeight: 600, 
                                transition: 'all 0.2s ease',
                                '&:hover': { 
                                  bgcolor: '#68B89E',
                                  boxShadow: '0 4px 12px rgba(104,184,158,0.3)'
                                } 
                              }}>
                                Approve
                              </Box>
                              <Box onClick={async () => { try { await api.put(`/bookings/${b._id}`, { status: 'rejected' }); window.location.reload(); } catch (err) {} }} sx={{ 
                                width: 40, 
                                height: 38, 
                                border: '1px solid var(--line)', 
                                borderRadius: '10px', 
                                display: 'flex', 
                                alignItems: 'center', 
                                justifyContent: 'center', 
                                cursor: 'pointer', 
                                transition: 'all 0.2s ease',
                                '&:hover': { 
                                  borderColor: '#F87171',
                                  bgcolor: 'rgba(248,113,113,0.1)'
                                } 
                              }}>
                                <X size={16} color="var(--slate)" />
                              </Box>
                            </Box>
                          </Box>
                        ))
                      )}
                    </Paper>
                  </Grid>

                  <Grid item xs={12} sx={{ display: 'flex' }}>
                    <Paper elevation={0} sx={{ 
                      bgcolor: 'var(--bg-card)', 
                      borderRadius: '16px', 
                      p: 3.5, 
                      border: '1px solid var(--line)', 
                      flex: 1, 
                      display: 'flex', 
                      flexDirection: 'column', 
                      justifyContent: 'center',
                      height: '100%',
                      animation: 'fadeInUp 0.6s ease-out forwards',
                      opacity: 0,
                      animationDelay: '0.8s'
                    }}>
                      <Typography sx={{ fontWeight: 700, fontSize: '16px', color: 'var(--ink)', mb: 2.5 }}>
                        Quick Actions
                      </Typography>
                      {[
                        { label: 'List a new item', icon: Plus, action: () => { setShowAddItem(true); setActiveTab('additem'); }, color: 'var(--purple)' },
                        { label: 'Browse items', icon: Eye, action: () => navigate('/browse'), color: 'var(--sage-light)' },
                        { label: 'View profile', icon: User, action: () => setActiveTab('profile'), color: '#E8A33D' },
                      ].map((a, i) => {
                        const Icon = a.icon;
                        return (
                          <Box 
                            key={i} 
                            onClick={a.action} 
                            sx={{ 
                              display: 'flex', 
                              alignItems: 'center', 
                              gap: 2, 
                              py: 1.5, 
                              cursor: 'pointer', 
                              borderBottom: i < 2 ? '1px solid var(--line)' : 'none', 
                              transition: 'all 0.2s ease',
                              pl: 0.5,
                              '&:hover': {
                                pl: 1.5,
                                bgcolor: 'rgba(255,255,255,0.03)'
                              },
                              '&:hover span': { 
                                color: a.color 
                              }, 
                            }}
                          >
                            <Box sx={{
                              width: 36,
                              height: 36,
                              borderRadius: '10px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              bgcolor: `${a.color}15`,
                              border: `1px solid ${a.color}30`
                            }}>
                              <Icon size={18} color={a.color} />
                            </Box>
                            <Box component="span" sx={{ fontSize: '14px', fontWeight: 500, color: 'var(--slate)', transition: 'color 0.2s ease' }}>{a.label}</Box>
                            <ChevronRight size={16} color="var(--slate)" style={{ marginLeft: 'auto', opacity: 0.5 }} />
                          </Box>
                        );
                      })}
                    </Paper>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
            </Box>
          </Box>
        )}

        {/* ── MY LISTINGS ── */}
        {activeTab === 'listings' && (
          <Box sx={{ px: 2 }}>
            {myListings.length === 0 ? (
              <Paper elevation={0} sx={{ textAlign: 'center', py: 8, bgcolor: 'var(--bg-card)', borderRadius: '16px', border: '1px solid var(--line)' }}>
                <Package size={40} style={{ color: '#CBD5E1', marginBottom: 12 }} />
                <Typography sx={{ color: 'var(--slate)', fontSize: '15px', fontWeight: 500 }}>No listings yet</Typography>
                <Box onClick={() => { setShowAddItem(true); setActiveTab('additem'); }} sx={{ 
                  mt: 2, 
                  display: 'inline-flex', 
                  alignItems: 'center', 
                  gap: 1, 
                  bgcolor: 'var(--purple)', 
                  color: 'white', 
                  px: 3, 
                  py: 1.2, 
                  borderRadius: '100px', 
                  cursor: 'pointer', 
                  fontSize: '13px', 
                  fontWeight: 600,
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    bgcolor: 'var(--purple-light)',
                    boxShadow: '0 4px 12px rgba(139,92,246,0.3)'
                  }
                }}>
                  <Plus size={14} /> Add your first listing
                </Box>
              </Paper>
            ) : (
              <>
                {myListings.map((l) => (
                  <Paper key={l._id} elevation={0} sx={{ 
                    bgcolor: 'var(--bg-card)', 
                    border: '1px solid var(--line)', 
                    borderRadius: '16px', 
                    p: 3, 
                    mb: 2.5, 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 3, 
                    flexWrap: 'wrap', 
                    transition: 'all 0.3s ease', 
                    '&:hover': { 
                      boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                      transform: 'translateY(-3px)',
                      borderColor: 'var(--line-strong)'
                    } 
                  }}>
                    <Box sx={{ 
                      width: 72, 
                      height: 72, 
                      borderRadius: '14px', 
                      overflow: 'hidden', 
                      flexShrink: 0, 
                      bgcolor: 'rgba(255,255,255,0.03)',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
                    }}>
                      <Box component="img" src={l.images?.[0] || 'https://via.placeholder.com/72'} sx={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </Box>
                    <Box sx={{ flex: 1 }}>
                      <Typography sx={{ 
                        fontWeight: 700, 
                        fontSize: '16px', 
                        color: 'var(--ink)', 
                        mb: 0.5 
                      }}>{l.title}</Typography>
                      <Typography sx={{ 
                        fontSize: '13px', 
                        color: 'var(--slate)',
                        fontWeight: 500
                      }}>{l.category} · {l.location?.city}</Typography>
                    </Box>
                    <Box sx={{ textAlign: 'right' }}>
                      <Typography sx={{ 
                        fontWeight: 700, 
                        fontSize: '17px', 
                        color: 'var(--ink)',
                        mb: 1
                      }}>Rs {l.pricePerDay?.toLocaleString()}<Box component="span" sx={{ fontSize: '13px', color: 'var(--slate)', fontWeight: 400 }}>/day</Box></Typography>
                      <Box sx={{ 
                        display: 'inline-flex', 
                        alignItems: 'center', 
                        gap: 0.7, 
                        bgcolor: 'rgba(64,159,122,0.12)', 
                        px: 1.7, 
                        py: 0.5, 
                        borderRadius: '100px',
                        border: '1px solid rgba(64,159,122,0.2)'
                      }}>
                        <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: 'var(--sage-light)' }} />
                        <Typography sx={{ fontSize: '11px', fontWeight: 700, color: 'var(--sage-light)' }}>Active</Typography>
                      </Box>
                    </Box>
                    <Box sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: 1.25,
                      flexShrink: 0
                    }}>
                      <Button
                        size="small"
                        startIcon={<Edit2 size={14} />}
                        sx={{
                          px: 1.75,
                          py: 0.85,
                          borderRadius: '10px',
                          bgcolor: 'rgba(139,92,246,0.1)',
                          color: 'var(--purple)',
                          fontSize: '12.5px',
                          fontWeight: 600,
                          border: '1px solid rgba(139,92,246,0.25)',
                          transition: 'all 0.2s ease',
                          '&:hover': {
                            bgcolor: 'rgba(139,92,246,0.18)',
                            borderColor: 'var(--purple)',
                          }
                        }}
                      >
                        Edit
                      </Button>
                      <Button
                        size="small"
                        startIcon={<Trash2 size={14} />}
                        onClick={() => openDeleteModal(l)}
                        sx={{
                          px: 1.75,
                          py: 0.85,
                          borderRadius: '10px',
                          bgcolor: 'rgba(220, 38, 38, 0.08)',
                          color: '#EF4444',
                          fontSize: '12.5px',
                          fontWeight: 600,
                          border: '1px solid rgba(220, 38, 38, 0.22)',
                          transition: 'all 0.2s ease',
                          '&:hover': {
                            bgcolor: 'rgba(220, 38, 38, 0.15)',
                            borderColor: '#DC2626',
                          }
                        }}
                      >
                        Delete
                      </Button>
                      <Box onClick={() => navigate(`/item/${l._id}`)} sx={{ 
                        width: 44, 
                        height: 44, 
                        borderRadius: '12px', 
                        border: '1px solid var(--line)', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center', 
                        cursor: 'pointer', 
                        transition: 'all 0.2s ease',
                        flexShrink: 0,
                        '&:hover': { 
                          borderColor: 'var(--purple)',
                          bgcolor: 'rgba(139,92,246,0.1)'
                        } 
                      }}>
                        <ChevronRight size={18} color="var(--slate)" />
                      </Box>
                    </Box>
                  </Paper>
                ))}
                <Paper elevation={0} onClick={() => { setShowAddItem(true); setActiveTab('additem'); }} sx={{ 
                  border: '2px dashed var(--line)', 
                  borderRadius: '16px', 
                  p: 4, 
                  textAlign: 'center', 
                  cursor: 'pointer', 
                  transition: 'all 0.3s ease', 
                  '&:hover': { 
                    borderColor: 'var(--purple)', 
                    bgcolor: 'rgba(139,92,246,0.05)',
                    transform: 'translateY(-2px)'
                  } 
                }}>
                  <Plus size={20} color="var(--slate)" style={{ margin: '0 auto 6px' }} />
                  <Typography sx={{ fontWeight: 600, color: 'var(--slate)', fontSize: '13.5px' }}>Add a new listing</Typography>
                </Paper>
              </>
            )}
          </Box>
        )}

        {/* ── MY BOOKINGS ── */}
        {activeTab === 'bookings' && (
          <Box sx={{ px: 2 }}>
            {myBookings.length === 0 ? (
              <Paper elevation={0} sx={{ textAlign: 'center', py: 8, bgcolor: 'var(--bg-card)', borderRadius: '16px', border: '1px solid var(--line)' }}>
                <ShoppingBag size={40} style={{ color: '#CBD5E1', marginBottom: 12 }} />
                <Typography sx={{ color: 'var(--slate)', fontSize: '15px', fontWeight: 500 }}>No bookings yet</Typography>
              </Paper>
            ) : (
              myBookings.map((b) => {
                const s = statusConfig(b.status);
                return (
                  <Paper key={b._id} elevation={0} sx={{ 
                    bgcolor: 'var(--bg-card)', 
                    border: '1px solid var(--line)', 
                    borderRadius: '16px', 
                    p: 3, 
                    mb: 2.5, 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 3, 
                    flexWrap: 'wrap', 
                    transition: 'all 0.3s ease', 
                    '&:hover': { 
                      boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                      transform: 'translateY(-3px)',
                      borderColor: 'var(--line-strong)'
                    } 
                  }}>
                    <Box sx={{ 
                      width: 72, 
                      height: 72, 
                      borderRadius: '14px', 
                      overflow: 'hidden', 
                      flexShrink: 0, 
                      bgcolor: 'rgba(255,255,255,0.03)',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
                    }}>
                      <Box component="img" src={b.item?.images?.[0] || 'https://via.placeholder.com/72'} sx={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </Box>
                    <Box sx={{ flex: 1 }}>
                      <Typography sx={{ fontWeight: 700, fontSize: '16px', color: 'var(--ink)', mb: 0.5 }}>{b.item?.title}</Typography>
                      <Typography sx={{ fontSize: '13px', color: 'var(--slate)', mb: 1, fontWeight: 500 }}>Owner: {b.owner?.name} · {new Date(b.startDate).toLocaleDateString()}</Typography>
                      <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.8, bgcolor: s.bg, px: 1.7, py: 0.5, borderRadius: '100px', border: `1px solid ${s.dot}33` }}>
                        <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: s.dot }} />
                        <Typography sx={{ fontSize: '11.5px', fontWeight: 700, color: s.color }}>{s.label}</Typography>
                      </Box>
                    </Box>
                    <Box sx={{ textAlign: 'right' }}>
                      <Typography sx={{ fontWeight: 700, fontSize: '17px', color: 'var(--ink)', mb: 1.2 }}>Rs {b.totalPrice?.toLocaleString()}</Typography>
                      {b.status === 'approved' && (
                        <Box onClick={() => openChat(b._id)}
                          sx={{ 
                            display: 'inline-flex', 
                            alignItems: 'center', 
                            gap: 0.8, 
                            color: 'var(--sage-light)', 
                            cursor: 'pointer', 
                            fontSize: '12.5px', 
                            fontWeight: 600, 
                            justifyContent: 'flex-end', 
                            '&:hover': { 
                              textDecoration: 'underline',
                              color: '#68B89E'
                            } 
                          }}>
                          <MessageCircle size={16} /> Chat with owner
                        </Box>
                      )}
                      {b.status === 'completed' && !b.reviewGiven && (
                        <Box onClick={() => openReviewModal(b)}
                          sx={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 1,
                            background: 'linear-gradient(135deg, var(--purple) 0%, var(--purple-dark) 55%, var(--sage-dark) 100%)',
                            color: 'white',
                            px: 2.5,
                            py: 1.1,
                            borderRadius: '100px',
                            cursor: 'pointer',
                            fontSize: '13px',
                            fontWeight: 700,
                            boxShadow: '0 6px 18px rgba(139,92,246,0.35)',
                            transition: 'all 0.25s ease',
                            animation: 'pulse 2.2s ease-in-out infinite',
                            '&:hover': {
                              transform: 'translateY(-2px) scale(1.03)',
                              boxShadow: '0 10px 28px rgba(139,92,246,0.5)',
                              filter: 'brightness(1.08)'
                            }
                          }}>
                          <Star size={15} fill="white" /> Write a Review
                        </Box>
                      )}
                      {b.status === 'completed' && b.reviewGiven && (
                        <Box sx={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 0.8,
                          bgcolor: 'rgba(64,159,122,0.12)',
                          color: 'var(--sage-light)',
                          px: 2,
                          py: 0.8,
                          borderRadius: '100px',
                          fontSize: '12.5px',
                          fontWeight: 600,
                          border: '1px solid rgba(64,159,122,0.3)'
                        }}>
                          <Check size={14} /> Review Submitted
                        </Box>
                      )}
                    </Box>
                  </Paper>
                );
              })
            )}
          </Box>
        )}

        {/* ── INCOMING REQUESTS ── */}
        {activeTab === 'incoming' && (
          <Box sx={{ px: 2 }}>
            {incomingBookings.length === 0 ? (
              <Paper elevation={0} sx={{ textAlign: 'center', py: 8, bgcolor: 'var(--bg-card)', borderRadius: '16px', border: '1px solid var(--line)' }}>
                <Inbox size={40} style={{ color: '#CBD5E1', marginBottom: 12 }} />
                <Typography sx={{ color: 'var(--slate)', fontSize: '15px', fontWeight: 500 }}>No incoming requests</Typography>
              </Paper>
            ) : (
              incomingBookings.map((b) => {
                const s = statusConfig(b.status);
                return (
                  <Paper key={b._id} elevation={0} sx={{ 
                    bgcolor: 'var(--bg-card)', 
                    border: '1px solid var(--line)', 
                    borderRadius: '16px', 
                    p: 3.5, 
                    mb: 2.5, 
                    transition: 'all 0.3s ease', 
                    '&:hover': { 
                      boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                      transform: 'translateY(-3px)',
                      borderColor: 'var(--line-strong)'
                    } 
                  }}>
                    <Box sx={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'flex-start', 
                      flexWrap: 'wrap', 
                      gap: 3 
                    }}>
                      <Box sx={{ 
                        display: 'flex', 
                        gap: 3, 
                        alignItems: 'flex-start' 
                      }}>
                        <Box sx={{ 
                          width: 72, 
                          height: 72, 
                          borderRadius: '14px', 
                          overflow: 'hidden', 
                          flexShrink: 0, 
                          bgcolor: 'rgba(255,255,255,0.03)',
                          boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
                        }}>
                          <Box component="img" src={b.item?.images?.[0] || 'https://via.placeholder.com/72'} sx={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </Box>
                        <Box>
                          <Typography sx={{ 
                            fontWeight: 700, 
                            fontSize: '16px', 
                            color: 'var(--ink)', 
                            mb: 0.5 
                          }}>{b.item?.title}</Typography>
                          <Typography sx={{ 
                            fontSize: '13px', 
                            color: 'var(--slate)', 
                            mb: 0.7, 
                            fontWeight: 500 
                          }}>Requested by <strong style={{ color: 'var(--ink)' }}>{b.renter?.name}</strong></Typography>
                          <Typography sx={{ 
                            fontSize: '12px', 
                            color: 'var(--slate)', 
                            fontFamily: '"IBM Plex Mono", monospace', 
                            mb: 1.2 
                          }}>CNIC: {b.renterCnic || 'N/A'}</Typography>
                          <Box sx={{ 
                            display: 'inline-flex', 
                            alignItems: 'center', 
                            gap: 0.8, 
                            bgcolor: s.bg, 
                            px: 1.7, 
                            py: 0.5, 
                            borderRadius: '100px', 
                            border: `1px solid ${s.dot}33` 
                          }}>
                            <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: s.dot }} />
                            <Typography sx={{ 
                              fontSize: '11.5px', 
                              fontWeight: 700, 
                              color: s.color 
                            }}>{s.label}</Typography>
                          </Box>
                        </Box>
                      </Box>
                      <Box sx={{ textAlign: 'right' }}>
                        <Typography sx={{ 
                          fontWeight: 700, 
                          fontSize: '17px', 
                          color: 'var(--ink)', 
                          mb: 1.5 
                        }}>Rs {b.totalPrice?.toLocaleString()}</Typography>
                        {b.status === 'pending' && (
                          <Box sx={{ display: 'flex', gap: 1.5 }}>
                            <Box onClick={async () => { try { await api.put(`/bookings/${b._id}`, { status: 'approved' }); window.location.reload(); } catch (err) {} }}
                              sx={{ 
                                display: 'flex', 
                                alignItems: 'center', 
                                gap: 1, 
                                bgcolor: 'var(--sage-light)', 
                                color: 'white', 
                                px: 2.5, 
                                py: 1, 
                                borderRadius: '100px', 
                                cursor: 'pointer', 
                                fontSize: '12.5px', 
                                fontWeight: 600, 
                                transition: 'all 0.2s ease', 
                                '&:hover': { 
                                  bgcolor: '#68B89E',
                                  boxShadow: '0 4px 12px rgba(104,184,158,0.3)'
                                } 
                              }}>
                              <Check size={14} /> Approve
                            </Box>
                            <Box onClick={async () => { try { await api.put(`/bookings/${b._id}`, { status: 'rejected' }); window.location.reload(); } catch (err) {} }}
                              sx={{ 
                                display: 'flex', 
                                alignItems: 'center', 
                                gap: 1, 
                                border: '1px solid var(--line)', 
                                color: '#F87171', 
                                px: 2.5, 
                                py: 1, 
                                borderRadius: '100px', 
                                cursor: 'pointer', 
                                fontSize: '12.5px', 
                                fontWeight: 600, 
                                transition: 'all 0.2s ease', 
                                '&:hover': { 
                                  borderColor: '#F87171', 
                                  bgcolor: 'rgba(248,113,113,0.1)' 
                                } 
                              }}>
                              <X size={14} /> Reject
                            </Box>
                          </Box>
                        )}
                        {b.status === 'approved' && (
                          <Box sx={{ display: 'flex', gap: 1.5, justifyContent: 'flex-end', alignItems: 'center', flexWrap: 'wrap' }}>
                            <Box onClick={async () => {
                              try {
                                await api.put(`/bookings/${b._id}`, { status: 'completed' });
                                setIncomingBookings(prev => prev.map(x =>
                                  x._id === b._id ? { ...x, status: 'completed' } : x
                                ));
                              } catch (err) {
                                console.error('Mark complete failed:', err);
                              }
                            }}
                              sx={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 0.8,
                                background: 'linear-gradient(135deg, #3E7C6B 0%, #2A5A4F 100%)',
                                color: 'white',
                                px: 2,
                                py: 0.9,
                                borderRadius: '100px',
                                cursor: 'pointer',
                                fontSize: '12.5px',
                                fontWeight: 600,
                                transition: 'all 0.2s ease',
                                boxShadow: '0 4px 12px rgba(62,124,107,0.3)',
                                '&:hover': {
                                  transform: 'translateY(-1px)',
                                  filter: 'brightness(1.05)'
                                }
                              }}>
                              <Check size={14} /> Mark Returned
                            </Box>
                            <Box onClick={() => openChat(b._id)}
                              sx={{ 
                                display: 'inline-flex', 
                                alignItems: 'center', 
                                gap: 0.8, 
                                color: 'var(--sage-light)', 
                                cursor: 'pointer', 
                                fontSize: '12.5px', 
                                fontWeight: 600, 
                                '&:hover': { 
                                  textDecoration: 'underline',
                                  color: '#68B89E'
                                } 
                              }}>
                              <MessageCircle size={16} /> Chat
                            </Box>
                          </Box>
                        )}
                        {b.status === 'completed' && (
                          <Box sx={{ display: 'flex', gap: 1.5, justifyContent: 'flex-end', alignItems: 'center', flexWrap: 'wrap' }}>
                            {b.reviewGiven ? (
                              <Box sx={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 0.8,
                                bgcolor: 'rgba(64,159,122,0.12)',
                                color: 'var(--sage-light)',
                                px: 2,
                                py: 0.8,
                                borderRadius: '100px',
                                fontSize: '12px',
                                fontWeight: 600,
                                border: '1px solid rgba(64,159,122,0.3)'
                              }}>
                                <Star size={13} fill="var(--sage-light)" /> Renter Reviewed
                              </Box>
                            ) : (
                              <Box sx={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 0.8,
                                bgcolor: 'rgba(232,163,61,0.12)',
                                color: '#E8A33D',
                                px: 2,
                                py: 0.8,
                                borderRadius: '100px',
                                fontSize: '12px',
                                fontWeight: 600,
                                border: '1px solid rgba(232,163,61,0.3)',
                                animation: 'pulse 2s ease-in-out infinite'
                              }}>
                                <Clock size={13} /> Waiting Review
                              </Box>
                            )}
                            <Box onClick={() => openChat(b._id)}
                              sx={{ 
                                display: 'inline-flex', 
                                alignItems: 'center', 
                                gap: 0.8, 
                                color: 'var(--slate)', 
                                cursor: 'pointer', 
                                fontSize: '12.5px', 
                                fontWeight: 600, 
                                '&:hover': { 
                                  textDecoration: 'underline',
                                  color: 'var(--ink)'
                                } 
                              }}>
                              <MessageCircle size={16} /> Chat
                            </Box>
                          </Box>
                        )}
                      </Box>
                    </Box>
                  </Paper>
                );
              })
            )}
          </Box>
        )}

        {/* ── PROFILE TAB ── */}
        {activeTab === 'profile' && (
          <Box sx={{ maxWidth: '1100px', mx: 'auto', px: 2 }}>
            <Paper elevation={0} sx={{ 
              bgcolor: 'var(--bg-card)', 
              borderRadius: '16px', 
              border: '1px solid var(--line)', 
              p: { xs: 3, md: 4.5 },
              boxShadow: '0 4px 16px rgba(0,0,0,0.04)',
              animation: 'fadeInScale 0.6s ease-out forwards',
              opacity: 0,
              animationDelay: '0.1s'
            }}>
              
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 4, flexWrap: 'wrap' }}>
                <Box sx={{ position: 'relative' }}>
                  <Avatar sx={{ 
                    width: 84, 
                    height: 84, 
                    bgcolor: 'var(--purple)', 
                    fontSize: '2.2rem', 
                    fontWeight: 700,
                    border: '3px solid var(--line)',
                    boxShadow: '0 8px 24px rgba(139,92,246,0.2)'
                  }}>
                    {user?.name?.[0]?.toUpperCase() || 'U'}
                  </Avatar>
                  {editMode && (
                    <Box sx={{ 
                      position: 'absolute', 
                      bottom: 0, 
                      right: 0, 
                      bgcolor: 'var(--bg-card)', 
                      borderRadius: '50%', 
                      p: 0.75, 
                      border: '2px solid var(--line)', 
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        borderColor: 'var(--sage-light)',
                        bgcolor: 'rgba(64,159,122,0.1)'
                      }
                    }}>
                      <Camera size={18} color="var(--slate)" />
                    </Box>
                  )}
                </Box>
                
                <Box sx={{ flex: 1 }}>
                  <Typography sx={{ 
                    fontFamily: '"Fraunces", serif', 
                    fontSize: '1.6rem', 
                    fontWeight: 600, 
                    color: 'var(--ink)',
                    mb: 0.5
                  }}>
                    {user?.name || 'User'}
                  </Typography>
                  <Typography sx={{ 
                    color: 'var(--slate)', 
                    fontSize: '14px', 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 0.8 
                  }}>
                    <MapPin size={15} /> {user?.city || 'No city set'}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1.25, mt: 1.5, flexWrap: 'wrap' }}>
                    <Chip 
                      icon={<Shield size={14} color="var(--sage-light)" />} 
                      label="Verified" 
                      size="small" 
                      sx={{ 
                        bgcolor: 'rgba(62,124,107,0.12)', 
                        color: 'var(--sage-light)', 
                        fontWeight: 700,
                        borderRadius: '100px',
                        border: '1px solid rgba(62,124,107,0.2)'
                      }} 
                    />
                    <Chip 
                      label="Member since 2026" 
                      size="small" 
                      sx={{ 
                        color: 'var(--slate)', 
                        borderRadius: '100px',
                        bgcolor: 'rgba(255,255,255,0.04)'
                      }} 
                    />
                  </Box>
                </Box>
                
                <Button
                  onClick={() => setEditMode(!editMode)}
                  startIcon={editMode ? <Save size={16} /> : <Edit2 size={16} />}
                  sx={{
                    bgcolor: editMode ? 'var(--sage-light)' : 'var(--purple)',
                    color: 'white',
                    borderRadius: '100px',
                    px: 2.75,
                    py: 1.25,
                    fontSize: '13px',
                    fontWeight: 700,
                    boxShadow: editMode ? '0 6px 20px rgba(64,159,122,0.3)' : '0 6px 20px rgba(139,92,246,0.3)',
                    '&:hover': { 
                      bgcolor: editMode ? '#5FA189' : 'var(--purple-light)',
                      boxShadow: editMode ? '0 8px 24px rgba(64,159,122,0.35)' : '0 8px 24px rgba(139,92,246,0.35)',
                    },
                    transition: 'all 0.3s ease',
                  }}
                >
                  {editMode ? 'Save Changes' : 'Edit Profile'}
                </Button>
              </Box>

              <Divider sx={{ 
                mb: 4, 
                borderColor: 'var(--line)' 
              }} />

              <Grid container spacing={2} sx={{ mb: 4 }}>
                {[
                  { label: 'Listings', value: stats.listings, icon: Package, color: 'var(--sage-light)' },
                  { label: 'Bookings', value: stats.bookings, icon: Calendar, color: '#E8A33D' },
                  { label: 'Reviews', value: 0, icon: Star, color: '#E8A33D' },
                  { label: 'Rating', value: stats.rating ? `${stats.rating}★` : '—', icon: Star, color: 'var(--purple)' },
                ].map((item, i) => {
                  const Icon = item.icon;
                  return (
                    <Grid item xs={6} sm={3} key={i}>
                      <Box sx={{ 
                        textAlign: 'center', 
                        p: 2, 
                        bgcolor: 'rgba(255,255,255,0.04)', 
                        borderRadius: '14px',
                        border: '1px solid var(--line)',
                        transition: 'all 0.3s ease',
                        animation: 'fadeInUp 0.5s ease-out forwards',
                        opacity: 0,
                        animationDelay: `${0.2 + i * 0.1}s`,
                        '&:hover': {
                          transform: 'translateY(-3px)',
                          borderColor: 'var(--line-strong)',
                          boxShadow: '0 8px 24px rgba(0,0,0,0.1)'
                        }
                      }}>
                        <Icon 
                          size={20} 
                          color={item.color} 
                          style={{ marginBottom: 8 }} 
                        />
                        <Typography sx={{ 
                          fontFamily: '"Fraunces", serif', 
                          fontSize: '1.3rem', 
                          fontWeight: 700, 
                          color: 'var(--ink)' 
                        }}>
                          {item.value}
                        </Typography>
                        <Typography sx={{ 
                          fontSize: '12px', 
                          color: 'var(--slate)',
                          fontWeight: 500,
                          mt: 0.5
                        }}>
                          {item.label}
                        </Typography>
                      </Box>
                    </Grid>
                  );
                })}
              </Grid>

              {editMode ? (
                <Box component="form" sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <Typography sx={{ fontSize: '11px', fontWeight: 700, color: 'var(--slate)', fontFamily: '"IBM Plex Mono", monospace', letterSpacing: '0.08em', mb: 0.5 }}>
                        FULL NAME
                      </Typography>
                      <TextField fullWidth size="small" name="name" value={form.name} onChange={handleChange} variant="outlined" sx={fieldStyle} />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography sx={{ fontSize: '11px', fontWeight: 700, color: 'var(--slate)', fontFamily: '"IBM Plex Mono", monospace', letterSpacing: '0.08em', mb: 0.5 }}>
                        PHONE
                      </Typography>
                      <TextField fullWidth size="small" name="phone" value={form.phone} onChange={handleChange} variant="outlined" sx={fieldStyle} />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography sx={{ fontSize: '11px', fontWeight: 700, color: 'var(--slate)', fontFamily: '"IBM Plex Mono", monospace', letterSpacing: '0.08em', mb: 0.5 }}>
                        CITY
                      </Typography>
                      <TextField fullWidth size="small" name="city" value={form.city} onChange={handleChange} variant="outlined" sx={fieldStyle} />
                    </Grid>
                    <Grid item xs={12}>
                      <Typography sx={{ fontSize: '11px', fontWeight: 700, color: 'var(--slate)', fontFamily: '"IBM Plex Mono", monospace', letterSpacing: '0.08em', mb: 0.5 }}>
                        BIO
                      </Typography>
                      <TextField fullWidth size="small" multiline rows={2} name="bio" value={form.bio} onChange={handleChange} placeholder="Tell others about yourself..." variant="outlined" sx={fieldStyle} />
                    </Grid>
                  </Grid>
                  
                  <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                    <Button onClick={() => setEditMode(false)} sx={{ color: 'var(--slate)', fontWeight: 600, fontSize: '13px' }}>Cancel</Button>
                    <Button onClick={handleSave} disabled={saving}
                      sx={{ bgcolor: 'var(--sage-light)', color: 'white', borderRadius: '100px', px: 3, py: 1, fontSize: '13px', fontWeight: 600, '&:hover': { bgcolor: '#5FA189' }, '&.Mui-disabled': { bgcolor: 'var(--line)', color: 'var(--slate)' } }}>
                      {saving ? <Loader2 size={16} className="spin" /> : 'Save Changes'}
                    </Button>
                  </Box>
                </Box>
              ) : (
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
                  <InfoItem icon={Mail} label="Email" value={user?.email} />
                  <InfoItem icon={Phone} label="Phone" value={user?.phone || 'Not set'} />
                  <InfoItem icon={MapPin} label="City" value={user?.city || 'Not set'} />
                  <InfoItem icon={Calendar} label="Member Since" value={new Date(user?.createdAt || Date.now()).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })} />
                  <InfoItem icon={User} label="Bio" value={user?.bio || 'No bio yet'} fullWidth />
                </Box>
              )}
            </Paper>
          </Box>
        )}

        {/* ── ADD ITEM TAB ── */}
        {activeTab === 'additem' && (
          <Box sx={{ maxWidth: '900px', mx: 'auto', px: 2 }}>
            <Paper elevation={0} sx={{ 
              bgcolor: 'var(--bg-card)', 
              borderRadius: '16px', 
              border: '1px solid var(--line)', 
              p: { xs: 3, md: 4.5 },
              boxShadow: '0 4px 16px rgba(0,0,0,0.04)',
              animation: 'fadeInScale 0.6s ease-out forwards',
              opacity: 0,
              animationDelay: '0.1s'
            }}>
              
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3, cursor: 'pointer', transition: 'all 0.2s ease', '&:hover': { opacity: 0.8 } }} onClick={() => { setShowAddItem(false); setActiveTab('listings'); }}>
                <ArrowLeft size={16} color="var(--slate)" />
                <Typography sx={{ color: 'var(--slate)', fontSize: '13px', fontWeight: 500 }}>Back to Listings</Typography>
              </Box>

              <Typography sx={{ fontFamily: '"Fraunces", serif', fontSize: '1.4rem', fontWeight: 600, color: 'var(--ink)', mb: 0.5 }}>
                List a New Item
              </Typography>
              <Typography sx={{ color: 'var(--slate)', fontSize: '14px', mb: 3 }}>
                Add clear photos and honest details — it builds trust and gets you booked faster.
              </Typography>

              {itemSuccess && (
                <Alert icon={<Check size={18} />} severity="success" sx={{ mb: 3, borderRadius: '12px' }}>
                  Item listed successfully!
                </Alert>
              )}

              {itemError && (
                <Alert severity="error" sx={{ mb: 3, borderRadius: '12px' }}>
                  {itemError}
                </Alert>
              )}

              <Box component="form" onSubmit={handleItemSubmit}>
                <Box sx={{ mb: 2.5 }}>
                  <Typography sx={{ fontSize: '11px', fontWeight: 700, color: 'var(--slate)', fontFamily: '"IBM Plex Mono", monospace', letterSpacing: '0.08em', mb: 0.5 }}>
                    PHOTOS (UP TO 4)
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
                    {itemImages.map((img, i) => (
                      <Box key={i} sx={{ position: 'relative', width: 64, height: 64, borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--line)', transition: 'all 0.2s ease', '&:hover': { transform: 'scale(1.05)' } }}>
                        <Box component="img" src={img} sx={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        <Box onClick={() => removeItemImage(i)}
                          sx={{ position: 'absolute', top: 4, right: 4, width: 18, height: 18, borderRadius: '50%', bgcolor: 'rgba(14,26,43,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                          <X size={10} color="white" />
                        </Box>
                      </Box>
                    ))}
                    {itemImages.length < 4 && (
                      <Box component="label" sx={{
                        width: 64, height: 64, borderRadius: '8px', border: '1.5px dashed var(--line)',
                        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                        cursor: 'pointer', transition: 'all 0.2s ease', '&:hover': { borderColor: 'var(--sage-light)', bgcolor: 'rgba(62,124,107,0.04)' },
                      }}>
                        <Upload size={16} color="var(--slate)" />
                        <Typography sx={{ fontSize: '9px', color: 'var(--slate)', mt: 0.3 }}>Add</Typography>
                        <input type="file" accept="image/*" multiple hidden onChange={handleItemImageUpload} />
                      </Box>
                    )}
                  </Box>
                </Box>

                <Box sx={{ mb: 2 }}>
                  <Typography sx={{ fontSize: '11px', fontWeight: 700, color: 'var(--slate)', fontFamily: '"IBM Plex Mono", monospace', letterSpacing: '0.08em', mb: 0.5 }}>
                    ITEM NAME
                  </Typography>
                  <TextField fullWidth size="small" name="title" placeholder="e.g. Canon DSLR Camera" value={itemForm.title} onChange={handleItemChange} required sx={itemFieldStyle} />
                </Box>

                <Grid container spacing={1.5} sx={{ mb: 0.5 }}>
                  <Grid item xs={6}>
                    <Typography sx={{ fontSize: '11px', fontWeight: 700, color: 'var(--slate)', fontFamily: '"IBM Plex Mono", monospace', letterSpacing: '0.08em', mb: 0.5 }}>
                      CATEGORY
                    </Typography>
                    <TextField fullWidth size="small" select name="category" value={itemForm.category} onChange={handleItemChange} required sx={itemFieldStyle}>
                      {categoryList.map((c) => <MenuItem key={c} value={c}>{c}</MenuItem>)}
                    </TextField>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography sx={{ fontSize: '11px', fontWeight: 700, color: 'var(--slate)', fontFamily: '"IBM Plex Mono", monospace', letterSpacing: '0.08em', mb: 0.5 }}>
                      PRICE / DAY (RS)
                    </Typography>
                    <TextField fullWidth size="small" type="number" name="pricePerDay" placeholder="500" value={itemForm.pricePerDay} onChange={handleItemChange} required sx={itemFieldStyle} />
                  </Grid>
                </Grid>

                <Grid container spacing={1.5} sx={{ mt: 0.5 }}>
                  <Grid item xs={6}>
                    <Typography sx={{ fontSize: '11px', fontWeight: 700, color: 'var(--slate)', fontFamily: '"IBM Plex Mono", monospace', letterSpacing: '0.08em', mb: 0.5 }}>
                      CITY
                    </Typography>
                    <TextField fullWidth size="small" name="city" placeholder="Karachi" value={itemForm.location.city} onChange={handleItemChange} required sx={itemFieldStyle} />
                  </Grid>
                  <Grid item xs={6}>
                    <Typography sx={{ fontSize: '11px', fontWeight: 700, color: 'var(--slate)', fontFamily: '"IBM Plex Mono", monospace', letterSpacing: '0.08em', mb: 0.5 }}>
                      AREA
                    </Typography>
                    <TextField fullWidth size="small" name="area" placeholder="Gulshan-e-Iqbal" value={itemForm.location.area} onChange={handleItemChange} required sx={itemFieldStyle} />
                  </Grid>
                </Grid>

                <Box sx={{ mt: 2, mb: 2 }}>
                  <Typography sx={{ fontSize: '11px', fontWeight: 700, color: 'var(--slate)', fontFamily: '"IBM Plex Mono", monospace', letterSpacing: '0.08em', mb: 0.5 }}>
                    SECURITY DEPOSIT (RS)
                  </Typography>
                  <TextField fullWidth size="small" type="number" name="deposit" placeholder="3000" value={itemForm.deposit} onChange={handleItemChange} required sx={itemFieldStyle} />
                  <Typography sx={{ fontSize: '10px', color: 'var(--slate)', mt: 0.3 }}>
                    Refunded to renter after item is returned
                  </Typography>
                </Box>

                <Box sx={{ mb: 2.5 }}>
                  <Typography sx={{ fontSize: '11px', fontWeight: 700, color: 'var(--slate)', fontFamily: '"IBM Plex Mono", monospace', letterSpacing: '0.08em', mb: 0.5 }}>
                    DESCRIPTION
                  </Typography>
                  <TextField fullWidth size="small" multiline rows={2} name="description" placeholder="Condition, what's included, any usage notes..." value={itemForm.description} onChange={handleItemChange} required sx={itemFieldStyle} />
                </Box>

                <Box sx={{ display: 'flex', gap: 2 }}>
                  <Button
                    fullWidth
                    onClick={() => { setShowAddItem(false); setActiveTab('listings'); }}
                    sx={{
                      border: '1px solid var(--line)',
                      color: 'var(--slate)',
                      borderRadius: '100px',
                      py: 1.2,
                      fontWeight: 600,
                      fontSize: '13px',
                      transition: 'all 0.2s ease',
                      '&:hover': { bgcolor: 'var(--line)', transform: 'translateY(-1px)' }
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    fullWidth
                    disabled={itemLoading}
                    sx={{
                      bgcolor: 'var(--purple)',
                      color: '#F6F2EA',
                      borderRadius: '100px',
                      py: 1.2,
                      fontWeight: 600,
                      fontSize: '13px',
                      transition: 'all 0.2s ease',
                      '&:hover': { bgcolor: 'var(--sage-light)', transform: 'translateY(-1px)', boxShadow: '0 4px 12px rgba(139,92,246,0.3)' },
                      '&.Mui-disabled': { bgcolor: 'var(--line)', color: 'var(--slate)' },
                    }}
                  >
                    {itemLoading ? <Loader2 size={16} className="spin-loader" /> : 'Publish listing'}
                  </Button>
                </Box>
              </Box>
            </Paper>
          </Box>
        )}

      </Box>

      {/* ─── CHAT MODAL ─── */}
      <Dialog
        open={chatModalOpen}
        onClose={() => setChatModalOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '28px',
            maxWidth: '440px',
            width: '100%',
            height: '520px',
            maxHeight: '75vh',
            overflow: 'hidden',
            boxShadow: '0 20px 60px rgba(0,0,0,0.25)',
          }
        }}
        BackdropProps={{
          sx: {
            backgroundColor: 'rgba(0,0,0,0.5)',
            backdropFilter: 'blur(8px)',
          }
        }}
      >
        {chatBookingId && (
          <ChatEmbedded 
            bookingId={chatBookingId} 
            onClose={() => setChatModalOpen(false)} 
            isModal={true}
          />
        )}
      </Dialog>

      {/* ─── REVIEW MODAL ─── */}
      <Dialog
        open={reviewModalOpen}
        onClose={() => !reviewLoading && setReviewModalOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '24px',
            bgcolor: 'var(--bg-card)',
            maxWidth: '480px',
            width: '100%',
            boxShadow: '0 20px 60px rgba(0,0,0,0.35)',
            border: '1px solid var(--line)',
            animation: reviewModalOpen ? 'fadeInScale 0.3s ease-out forwards' : 'none'
          }
        }}
        BackdropProps={{
          sx: {
            backgroundColor: 'rgba(0,0,0,0.55)',
            backdropFilter: 'blur(10px)',
          }
        }}
      >
        <Box sx={{ p: { xs: 2.5, md: 3.5 } }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2.5 }}>
            <Box>
              <Typography sx={{
                fontFamily: '"Fraunces", serif',
                fontSize: '1.4rem',
                fontWeight: 600,
                color: 'var(--ink)',
                mb: 0.3
              }}>
                Leave a Review
              </Typography>
              <Typography sx={{ fontSize: '13px', color: 'var(--slate)' }}>
                Share your experience renting this item
              </Typography>
            </Box>
            <IconButton
              onClick={() => !reviewLoading && setReviewModalOpen(false)}
              disabled={reviewLoading}
              sx={{
                border: '1px solid var(--line)',
                width: 36,
                height: 36,
                '&:hover': { bgcolor: 'var(--line)' }
              }}
            >
              <X size={16} color="var(--slate)" />
            </IconButton>
          </Box>

          {deleteAlert.open && (
            <Alert
              severity={deleteAlert.severity}
              sx={{
                mb: 2.5,
                borderRadius: '12px',
                bgcolor: deleteAlert.severity === 'success' ? 'rgba(64,159,122,0.12)' :
                         deleteAlert.severity === 'warning' ? 'rgba(232,163,61,0.12)' :
                         'rgba(248,113,113,0.12)',
                border: `1px solid ${deleteAlert.severity === 'success' ? 'rgba(64,159,122,0.3)' :
                           deleteAlert.severity === 'warning' ? 'rgba(232,163,61,0.3)' :
                           'rgba(248,113,113,0.3)'}`,
                color: 'var(--ink)',
                '& .MuiAlert-icon': {
                  color: deleteAlert.severity === 'success' ? 'var(--sage-light)' :
                         deleteAlert.severity === 'warning' ? '#E8A33D' : '#F87171'
                }
              }}
            >
              <Typography sx={{ fontSize: '13px', fontWeight: 500 }}>{deleteAlert.message}</Typography>
            </Alert>
          )}

          {reviewAlert.open && (
            <Alert
              severity={reviewAlert.severity}
              sx={{
                mb: 2.5,
                borderRadius: '12px',
                bgcolor: reviewAlert.severity === 'success' ? 'rgba(64,159,122,0.12)' :
                         reviewAlert.severity === 'warning' ? 'rgba(232,163,61,0.12)' :
                         'rgba(248,113,113,0.12)',
                border: `1px solid ${reviewAlert.severity === 'success' ? 'rgba(64,159,122,0.3)' :
                           reviewAlert.severity === 'warning' ? 'rgba(232,163,61,0.3)' :
                           'rgba(248,113,113,0.3)'}`,
                color: 'var(--ink)',
                '& .MuiAlert-icon': {
                  color: reviewAlert.severity === 'success' ? 'var(--sage-light)' :
                         reviewAlert.severity === 'warning' ? '#E8A33D' : '#F87171'
                }
              }}
            >
              <Typography sx={{ fontSize: '13px', fontWeight: 500 }}>{reviewAlert.message}</Typography>
            </Alert>
          )}

          {reviewBooking && (
            <Paper elevation={0} sx={{
              p: 2,
              mb: 3,
              borderRadius: '14px',
              border: '1px solid var(--line)',
              bgcolor: 'rgba(255,255,255,0.02)',
              display: 'flex',
              gap: 2,
              alignItems: 'center'
            }}>
              <Box sx={{
                width: 56,
                height: 56,
                borderRadius: '12px',
                overflow: 'hidden',
                flexShrink: 0,
                bgcolor: 'var(--line)'
              }}>
                <Box
                  component="img"
                  src={reviewBooking.item?.images?.[0] || 'https://via.placeholder.com/56'}
                  sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </Box>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography sx={{
                  fontWeight: 700,
                  fontSize: '14.5px',
                  color: 'var(--ink)',
                  mb: 0.3,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}>
                  {reviewBooking.item?.title || 'Item'}
                </Typography>
                <Typography sx={{ fontSize: '12px', color: 'var(--slate)' }}>
                  Owner: {reviewBooking.owner?.name || 'Unknown'}
                </Typography>
              </Box>
            </Paper>
          )}

          <Box sx={{ mb: 3 }}>
            <Typography sx={{
              fontSize: '11px',
              fontWeight: 700,
              color: 'var(--slate)',
              fontFamily: '"IBM Plex Mono", monospace',
              letterSpacing: '0.08em',
              mb: 1.2
            }}>
              YOUR RATING
            </Typography>
            <Box sx={{ display: 'flex', gap: 0.8 }}>
              {[1, 2, 3, 4, 5].map((star) => (
                <Box
                  key={star}
                  onClick={() => !reviewLoading && setReviewRating(star)}
                  sx={{
                    cursor: reviewLoading ? 'default' : 'pointer',
                    p: 0.8,
                    borderRadius: '10px',
                    transition: 'all 0.15s ease',
                    transform: star <= reviewRating ? 'scale(1.05)' : 'scale(1)',
                    '&:hover': !reviewLoading ? {
                      transform: star <= reviewRating ? 'scale(1.1)' : 'scale(1.05)',
                      bgcolor: 'rgba(232,163,61,0.08)'
                    } : {}
                  }}
                >
                  <Star
                    size={28}
                    fill={star <= reviewRating ? '#E8A33D' : 'transparent'}
                    color={star <= reviewRating ? '#E8A33D' : 'var(--line)'}
                    strokeWidth={star <= reviewRating ? 0 : 2}
                  />
                </Box>
              ))}
            </Box>
          </Box>

          <Box sx={{ mb: 3.5 }}>
            <Typography sx={{
              fontSize: '11px',
              fontWeight: 700,
              color: 'var(--slate)',
              fontFamily: '"IBM Plex Mono", monospace',
              letterSpacing: '0.08em',
              mb: 1.2
            }}>
              YOUR COMMENT
            </Typography>
            <TextField
              fullWidth
              multiline
              rows={4}
              placeholder="What did you like about the item? Was the owner easy to deal with? Any tips for future renters?"
              value={reviewComment}
              onChange={(e) => setReviewComment(e.target.value)}
              disabled={reviewLoading}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '14px',
                  fontSize: '14px',
                  bgcolor: 'var(--bg)',
                  color: 'var(--ink)',
                  '& fieldset': { borderColor: 'var(--line)' },
                  '&:hover fieldset': { borderColor: 'var(--line-strong)' },
                  '&.Mui-focused fieldset': { borderColor: 'var(--purple)', borderWidth: '1.5px' },
                },
              }}
            />
          </Box>

          <Box sx={{ display: 'flex', gap: 1.5 }}>
            <Button
              fullWidth
              onClick={() => !reviewLoading && setReviewModalOpen(false)}
              disabled={reviewLoading}
              sx={{
                border: '1px solid var(--line)',
                color: 'var(--slate)',
                borderRadius: '100px',
                py: 1.3,
                fontWeight: 600,
                fontSize: '13.5px',
                transition: 'all 0.2s ease',
                '&:hover': { bgcolor: 'var(--line)', color: 'var(--ink)' },
                '&.Mui-disabled': { bgcolor: 'transparent', color: 'var(--line)', borderColor: 'var(--line)' }
              }}
            >
              Cancel
            </Button>
            <Button
              fullWidth
              onClick={handleReviewSubmit}
              disabled={reviewLoading}
              sx={{
                background: 'linear-gradient(135deg, var(--purple) 0%, var(--purple-dark) 55%, var(--sage-dark) 100%)',
                color: 'white',
                borderRadius: '100px',
                py: 1.3,
                fontWeight: 700,
                fontSize: '13.5px',
                transition: 'all 0.25s ease',
                boxShadow: '0 6px 18px rgba(139,92,246,0.3)',
                '&:hover': {
                  transform: 'translateY(-1px)',
                  boxShadow: '0 10px 24px rgba(139,92,246,0.42)',
                  filter: 'brightness(1.05)'
                },
                '&.Mui-disabled': {
                  background: 'var(--line)',
                  color: 'var(--slate)',
                  boxShadow: 'none'
                }
              }}
            >
              {reviewLoading ? (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CircularProgress size={16} sx={{ color: 'white' }} />
                  Submitting...
                </Box>
              ) : (
                'Submit Review'
              )}
            </Button>
          </Box>
        </Box>
      </Dialog>

      {/* ───── DELETE LISTING CONFIRM DIALOG ───── */}
      <Dialog
        open={deleteModalOpen}
        onClose={() => { if (!deleteLoading) { setDeleteModalOpen(false); setItemToDelete(null); } }}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            bgcolor: 'var(--bg-card)',
            borderRadius: '20px',
            border: '1px solid var(--line)',
            boxShadow: '0 25px 80px rgba(0,0,0,0.5)',
            p: 0,
            animation: deleteModalOpen ? 'fadeInScale 0.3s ease-out forwards' : 'none',
            overflow: 'hidden',
            maxWidth: '460px',
          }
        }}
      >
        <Box sx={{ p: 4.5, pb: 3.5, position: 'relative' }}>
          {/* Close button */}
          <IconButton
            onClick={() => { if (!deleteLoading) { setDeleteModalOpen(false); setItemToDelete(null); } }}
            disabled={deleteLoading}
            sx={{
              position: 'absolute',
              top: 16,
              right: 16,
              width: 34,
              height: 34,
              color: 'var(--slate)',
              '&:hover': { bgcolor: 'var(--line)' },
              '&.Mui-disabled': { opacity: 0.4 }
            }}
          >
            <X size={16} />
          </IconButton>

          {/* Warning icon circle */}
          <Box sx={{
            width: 64,
            height: 64,
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mx: 'auto',
            mb: 2.5,
            bgcolor: 'rgba(220, 38, 38, 0.1)',
            border: '1px solid rgba(220, 38, 38, 0.25)',
          }}>
            <AlertTriangle size={30} color="#DC2626" strokeWidth={2.2} />
          </Box>

          <Typography sx={{
            textAlign: 'center',
            fontFamily: '"Fraunces", serif',
            fontSize: '1.5rem',
            fontWeight: 700,
            color: 'var(--ink)',
            mb: 1
          }}>
            Delete this listing?
          </Typography>
          <Typography sx={{
            textAlign: 'center',
            color: 'var(--slate)',
            fontSize: '13.5px',
            lineHeight: 1.55,
            mb: 3
          }}>
            This action <b style={{ color: 'var(--ink)' }}>cannot be undone</b>. The listing, all photos, and any pending booking requests will be permanently removed.
          </Typography>

          {/* Item preview card */}
          {itemToDelete && (
            <Paper elevation={0} sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 2,
              p: 2,
              mb: 3,
              borderRadius: '14px',
              bgcolor: 'rgba(255,255,255,0.02)',
              border: '1px solid rgba(220, 38, 38, 0.18)',
            }}>
              <Box sx={{
                width: 56,
                height: 56,
                borderRadius: '12px',
                overflow: 'hidden',
                flexShrink: 0,
                bgcolor: 'var(--bg-card)',
                border: '1px solid var(--line)'
              }}>
                <Box component="img"
                  src={itemToDelete.images?.[0] || 'https://via.placeholder.com/56'}
                  sx={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </Box>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography sx={{
                  fontSize: '14.5px',
                  fontWeight: 700,
                  color: 'var(--ink)',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }}>{itemToDelete.title}</Typography>
                <Typography sx={{ fontSize: '12.5px', color: 'var(--slate)', mt: 0.25 }}>
                  {itemToDelete.category || 'Item'} · Rs {itemToDelete.pricePerDay?.toLocaleString()}/day
                </Typography>
              </Box>
            </Paper>
          )}

          {/* Action buttons */}
          <Box sx={{ display: 'flex', gap: 1.5 }}>
            <Button
              onClick={() => { setDeleteModalOpen(false); setItemToDelete(null); }}
              disabled={deleteLoading}
              sx={{
                flex: 1,
                py: 1.35,
                borderRadius: '12px',
                fontWeight: 600,
                fontSize: '13.5px',
                color: 'var(--slate)',
                bgcolor: 'var(--line)',
                '&:hover': { bgcolor: 'rgba(148,163,184,0.2)' },
                '&.Mui-disabled': { opacity: 0.5 }
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleDeleteItem}
              disabled={deleteLoading}
              sx={{
                flex: 1,
                py: 1.35,
                borderRadius: '12px',
                fontWeight: 700,
                fontSize: '13.5px',
                color: 'white',
                background: 'linear-gradient(135deg, #DC2626 0%, #B91C1C 100%)',
                boxShadow: '0 10px 25px rgba(220, 38, 38, 0.35)',
                transition: 'all 0.2s ease',
                '&:hover': {
                  transform: 'translateY(-1px)',
                  boxShadow: '0 14px 30px rgba(220, 38, 38, 0.45)',
                },
                '&.Mui-disabled': {
                  opacity: 0.6,
                  color: 'white',
                  background: 'linear-gradient(135deg, #DC2626 0%, #B91C1C 100%)',
                }
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                {deleteLoading ? (
                  <>
                    <CircularProgress size={15} sx={{ color: 'white' }} />
                    Deleting…
                  </>
                ) : (
                  <>
                    <Trash2 size={15} />
                    Delete Permanently
                  </>
                )}
              </Box>
            </Button>
          </Box>
        </Box>
      </Dialog>

      <style>{`
        @keyframes spinLoaderAdd { to { transform: rotate(360deg); } }
        .spin-loader { animation: spinLoaderAdd 0.8s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }
        .spin { animation: spin 0.8s linear infinite; }
        @keyframes spinSend { to { transform: rotate(360deg); } }
        .spin-send { animation: spinSend 0.8s linear infinite; }
        @keyframes fadeInScale {
          from {
            opacity: 0;
            transform: translateY(20px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(15px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.55; }
        }
      `}</style>
    </Box>
  );
};

export default Dashboard;