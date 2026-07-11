// client/src/pages/Profile.jsx

import { useState, useEffect } from 'react';
import { Box, Container, Typography, Avatar, Button, TextField, Grid, Chip, Divider, CircularProgress } from '@mui/material';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { Camera, MapPin, Star, Package, Calendar, Edit2, Save, Loader2, Mail, Phone, User, Shield } from 'lucide-react';

const Profile = () => {
  const { user, login } = useAuth();
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: '',
    phone: '',
    city: '',
    bio: '',
  });
  const [stats, setStats] = useState({
    listings: 0,
    bookings: 0,
    reviews: 0,
    rating: 0,
  });

  useEffect(() => {
    if (user) {
      setForm({
        name: user.name || '',
        phone: user.phone || '',
        city: user.city || '',
        bio: user.bio || '',
      });
      fetchStats();
    }
  }, [user]);

  const fetchStats = async () => {
    try {
      const res = await api.get('/users/stats');
      setStats(res.data);
      setLoading(false);
    } catch (err) {
      console.error('Failed to fetch stats:', err);
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await api.put('/users/profile', form);
      // Update auth context with new user data
      login(res.data, localStorage.getItem('token'));
      setEditMode(false);
      setSaving(false);
    } catch (err) {
      console.error('Failed to update profile:', err);
      setSaving(false);
    }
  };

  const statsItems = [
    { label: 'Listings', value: stats.listings, icon: Package },
    { label: 'Bookings', value: stats.bookings, icon: Calendar },
    { label: 'Reviews', value: stats.reviews, icon: Star },
    { label: 'Rating', value: stats.rating ? `${stats.rating}★` : '—', icon: Star },
  ];

  if (loading) {
    return (
      <Box sx={{ bgcolor: 'var(--cream)', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', pt: '110px' }}>
        <CircularProgress sx={{ color: 'var(--sage)' }} />
      </Box>
    );
  }

  if (!user) {
    return (
      <Box sx={{ bgcolor: 'var(--cream)', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', pt: '110px' }}>
        <Typography sx={{ color: 'var(--slate)' }}>Please login to view profile</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ bgcolor: 'var(--cream)', minHeight: '100vh', pt: '110px', pb: 10 }}>
      <Container maxWidth="md">

        {/* Header */}
        <Box sx={{ mb: 5 }}>
          <Box className="eyebrow" sx={{ mb: 1.5 }}>Profile</Box>
          <Typography variant="h2" sx={{ fontSize: { xs: '1.8rem', md: '2.4rem' }, color: 'var(--ink)' }}>
            Your Profile
          </Typography>
          <Typography sx={{ color: 'var(--slate)', fontSize: '15px', mt: 0.5 }}>
            Manage your personal information and view your activity
          </Typography>
        </Box>

        {/* Profile Card */}
        <Box sx={{ bgcolor: 'white', borderRadius: '20px', border: '1px solid var(--line)', p: { xs: 3, md: 4.5 }, boxShadow: 'var(--shadow)', mb: 4 }}>
          
          {/* Avatar & Name */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 4, flexWrap: 'wrap' }}>
            <Box sx={{ position: 'relative' }}>
              <Avatar
                sx={{
                  width: 100,
                  height: 100,
                  bgcolor: 'var(--sage)',
                  fontSize: '2.5rem',
                  fontWeight: 600,
                }}
              >
                {user.name?.[0]?.toUpperCase() || 'U'}
              </Avatar>
              <Box sx={{
                position: 'absolute',
                bottom: 0,
                right: 0,
                bgcolor: 'var(--cream)',
                borderRadius: '50%',
                p: 0.5,
                border: '2px solid white',
                cursor: 'pointer',
              }}>
                <Camera size={18} color="var(--slate)" />
              </Box>
            </Box>
            
            <Box sx={{ flex: 1 }}>
              <Typography sx={{ fontFamily: '"Fraunces", serif', fontSize: '1.6rem', fontWeight: 600, color: 'var(--ink)' }}>
                {user.name}
              </Typography>
              <Typography sx={{ color: 'var(--slate)', fontSize: '14px', display: 'flex', alignItems: 'center', gap: 0.8 }}>
                <MapPin size={15} /> {user.city || 'No city set'}
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                <Chip 
                  icon={<Shield size={14} color="#3E7C6B" />}
                  label="Verified" 
                  size="small" 
                  sx={{ bgcolor: 'rgba(62,124,107,0.1)', color: 'var(--sage)', fontWeight: 600 }} 
                />
                <Chip 
                  label="Member since 2026" 
                  size="small" 
                  sx={{ color: 'var(--slate)' }} 
                />
              </Box>
            </Box>
            
            <Button
              onClick={() => setEditMode(!editMode)}
              startIcon={editMode ? <Save size={18} /> : <Edit2 size={18} />}
              sx={{
                bgcolor: editMode ? 'var(--sage)' : 'var(--ink)',
                color: 'var(--cream)',
                borderRadius: '100px',
                px: 3,
                py: 1.2,
                '&:hover': { bgcolor: editMode ? 'var(--sage-light)' : 'var(--sage)' },
                transition: 'all 0.3s var(--ease)',
              }}
            >
              {editMode ? 'Save Changes' : 'Edit Profile'}
            </Button>
          </Box>

          <Divider sx={{ mb: 4 }} />

          {/* Stats */}
          <Grid container spacing={2} sx={{ mb: 4 }}>
            {statsItems.map((item, i) => {
              const Icon = item.icon;
              return (
                <Grid item xs={6} md={3} key={i}>
                  <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'var(--cream)', borderRadius: '14px' }}>
                    <Icon size={18} color="var(--sage)" style={{ marginBottom: 6 }} />
                    <Typography sx={{ fontFamily: '"Fraunces", serif', fontSize: '1.5rem', fontWeight: 600, color: 'var(--ink)' }}>
                      {item.value}
                    </Typography>
                    <Typography sx={{ fontSize: '12px', color: 'var(--slate)' }}>{item.label}</Typography>
                  </Box>
                </Grid>
              );
            })}
          </Grid>

          {/* Edit Form */}
          {editMode ? (
            <Box component="form" sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Typography sx={{ fontSize: '12px', fontWeight: 700, color: 'var(--slate)', fontFamily: '"IBM Plex Mono", monospace', letterSpacing: '0.08em', mb: 0.8 }}>
                    FULL NAME
                  </Typography>
                  <TextField fullWidth name="name" value={form.name} onChange={handleChange} variant="outlined" sx={fieldStyle} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography sx={{ fontSize: '12px', fontWeight: 700, color: 'var(--slate)', fontFamily: '"IBM Plex Mono", monospace', letterSpacing: '0.08em', mb: 0.8 }}>
                    PHONE
                  </Typography>
                  <TextField fullWidth name="phone" value={form.phone} onChange={handleChange} variant="outlined" sx={fieldStyle} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography sx={{ fontSize: '12px', fontWeight: 700, color: 'var(--slate)', fontFamily: '"IBM Plex Mono", monospace', letterSpacing: '0.08em', mb: 0.8 }}>
                    CITY
                  </Typography>
                  <TextField fullWidth name="city" value={form.city} onChange={handleChange} variant="outlined" sx={fieldStyle} />
                </Grid>
                <Grid item xs={12}>
                  <Typography sx={{ fontSize: '12px', fontWeight: 700, color: 'var(--slate)', fontFamily: '"IBM Plex Mono", monospace', letterSpacing: '0.08em', mb: 0.8 }}>
                    BIO
                  </Typography>
                  <TextField fullWidth multiline rows={3} name="bio" value={form.bio} onChange={handleChange} placeholder="Tell others about yourself..." variant="outlined" sx={fieldStyle} />
                </Grid>
              </Grid>
              
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                <Button onClick={() => setEditMode(false)} sx={{ color: 'var(--slate)', fontWeight: 600 }}>
                  Cancel
                </Button>
                <Button
                  onClick={handleSave}
                  disabled={saving}
                  sx={{
                    bgcolor: 'var(--sage)',
                    color: 'white',
                    borderRadius: '100px',
                    px: 4,
                    py: 1.5,
                    '&:hover': { bgcolor: 'var(--sage-light)' },
                    '&.Mui-disabled': { bgcolor: 'var(--line)', color: 'var(--slate)' },
                  }}
                >
                  {saving ? <Loader2 size={18} className="spin" /> : 'Save Changes'}
                </Button>
              </Box>
            </Box>
          ) : (
            /* Info Display */
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2.5 }}>
              <InfoItem icon={Mail} label="Email" value={user.email} />
              <InfoItem icon={Phone} label="Phone" value={user.phone || 'Not set'} />
              <InfoItem icon={MapPin} label="City" value={user.city || 'Not set'} />
              <InfoItem icon={Calendar} label="Member Since" value={new Date(user.createdAt || Date.now()).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })} />
              <InfoItem icon={User} label="Bio" value={user.bio || 'No bio yet'} fullWidth />
            </Box>
          )}
        </Box>

      </Container>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        .spin { animation: spin 0.8s linear infinite; }
      `}</style>
    </Box>
  );
};

// Helper components
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

const fieldStyle = {
  '& .MuiOutlinedInput-root': {
    borderRadius: '12px',
    fontSize: '15px',
    bgcolor: 'var(--cream)',
    '& fieldset': { borderColor: 'var(--line)' },
    '&:hover fieldset': { borderColor: 'var(--sage)' },
    '&.Mui-focused fieldset': { borderColor: 'var(--sage)', borderWidth: '1.5px' },
  },
};

export default Profile;