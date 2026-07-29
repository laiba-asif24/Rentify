// client/src/pages/AddItem.jsx

import { useState } from 'react';
import { Box, Container, Typography, TextField, Button, Grid, MenuItem, Alert, Paper } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { Upload, X, Loader2, Check, ArrowLeft } from 'lucide-react';
import { darkFieldStyle, darkLabelSx, darkPaperSx } from '../utils/darkFormStyles';

const categoryList = ['Tools', 'Cameras', 'Camping', 'Party & events', 'Sports & bikes', 'Audio & tech'];

const AddItem = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [form, setForm] = useState({ 
    title: '', 
    category: '', 
    pricePerDay: '', 
    location: { city: '', area: '' },
    deposit: '', 
    description: '' 
  });
  const [images, setImages] = useState([]);
  const [imageFiles, setImageFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const fieldStyle = darkFieldStyle;
  const Label = ({ text }) => <Typography sx={darkLabelSx}>{text}</Typography>;

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'city' || name === 'area') {
      setForm({ ...form, location: { ...form.location, [name]: value } });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    const remaining = 4 - images.length;
    const selected = files.slice(0, remaining);
    setImageFiles([...imageFiles, ...selected]);
    const previews = selected.map((f) => URL.createObjectURL(f));
    setImages([...images, ...previews]);
  };

  const removeImage = (idx) => {
    setImages(images.filter((_, i) => i !== idx));
    setImageFiles(imageFiles.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('title', form.title);
      formData.append('description', form.description);
      formData.append('category', form.category);
      formData.append('pricePerDay', form.pricePerDay);
      formData.append('location[city]', form.location.city);
      formData.append('location[area]', form.location.area);
      formData.append('deposit', form.deposit);

      imageFiles.forEach((file) => {
        formData.append('images', file);
      });

      await api.post('/items', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      setSuccess(true);
      setTimeout(() => {
        navigate('/dashboard');
      }, 1400);
    } catch (err) {
      console.error('❌ Error adding item:', err);
      setError(err.response?.data?.message || 'Failed to add item');
      setLoading(false);
    }
  };

  return (
    <Box className="page-enter" sx={{ minHeight: '100vh', pt: '110px', pb: 6 }}>
      <Container maxWidth="sm">

        {/* Back to Dashboard */}
        <Box 
          onClick={() => navigate('/dashboard')}
          sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 1, 
            cursor: 'pointer', 
            mb: 3,
            color: 'var(--slate)',
            '&:hover': { color: 'var(--ink)' }
          }}
        >
          <ArrowLeft size={16} />
          <Typography sx={{ fontSize: '13px', fontWeight: 500 }}>Back to Dashboard</Typography>
        </Box>

        <Paper elevation={0} sx={{ ...darkPaperSx, p: { xs: 3, md: 4.5 } }}>
          
          <Box sx={{ mb: 4 }}>
            <Typography sx={{ fontFamily: '"Fraunces", serif', fontSize: '1.6rem', fontWeight: 600, color: 'var(--ink)' }}>
              List a New Item
            </Typography>
            <Typography sx={{ color: 'var(--slate)', fontSize: '14px', mt: 0.5 }}>
              Add clear photos and honest details — it builds trust and gets you booked faster.
            </Typography>
          </Box>

          {success && (
            <Alert icon={<Check size={18} />} severity="success" sx={{ mb: 3, borderRadius: '12px' }}>
              Item listed! Redirecting to your dashboard...
            </Alert>
          )}

          {error && (
            <Alert severity="error" sx={{ mb: 3, borderRadius: '12px' }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit}>

            {/* Image upload */}
            <Box sx={{ mb: 3 }}>
              <Label text="PHOTOS (UP TO 4)" />
              <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
                {images.map((img, i) => (
                  <Box key={i} sx={{ position: 'relative', width: 80, height: 80, borderRadius: '10px', overflow: 'hidden', border: '1px solid #E2E8F0' }}>
                    <Box component="img" src={img} sx={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    <Box onClick={() => removeImage(i)}
                      sx={{ position: 'absolute', top: 4, right: 4, width: 20, height: 20, borderRadius: '50%', bgcolor: 'rgba(14,26,43,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                      <X size={12} color="white" />
                    </Box>
                  </Box>
                ))}
                {images.length < 4 && (
                  <Box component="label" sx={{
                    width: 80, height: 80, borderRadius: '10px', border: '1.5px dashed #E2E8F0',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                    cursor: 'pointer', transition: 'all 0.2s ease', '&:hover': { borderColor: '#3E7C6B', bgcolor: 'rgba(62,124,107,0.04)' },
                  }}>
                    <Upload size={18} color="#6B7686" />
                    <Typography sx={{ fontSize: '10px', color: '#6B7686', mt: 0.5 }}>Add</Typography>
                    <input type="file" accept="image/*" multiple hidden onChange={handleImageUpload} />
                  </Box>
                )}
              </Box>
            </Box>

            <Box sx={{ mb: 2.5 }}>
              <Label text="ITEM NAME" />
              <TextField fullWidth size="small" name="title" placeholder="e.g. Canon DSLR Camera" value={form.title} onChange={handleChange} required sx={fieldStyle} />
            </Box>

            <Grid container spacing={2} sx={{ mb: 0.5 }}>
              <Grid item xs={6}>
                <Label text="CATEGORY" />
                <TextField fullWidth size="small" select name="category" value={form.category} onChange={handleChange} required sx={fieldStyle}>
                  {categoryList.map((c) => <MenuItem key={c} value={c}>{c}</MenuItem>)}
                </TextField>
              </Grid>
              <Grid item xs={6}>
                <Label text="PRICE / DAY (RS)" />
                <TextField fullWidth size="small" type="number" name="pricePerDay" placeholder="500" value={form.pricePerDay} onChange={handleChange} required sx={fieldStyle} />
              </Grid>
            </Grid>

            <Grid container spacing={2} sx={{ mt: 0.5, mb: 0.5 }}>
              <Grid item xs={6}>
                <Label text="CITY" />
                <TextField fullWidth size="small" name="city" placeholder="Karachi" value={form.location.city} onChange={handleChange} required sx={fieldStyle} />
              </Grid>
              <Grid item xs={6}>
                <Label text="AREA" />
                <TextField fullWidth size="small" name="area" placeholder="Gulshan-e-Iqbal" value={form.location.area} onChange={handleChange} required sx={fieldStyle} />
              </Grid>
            </Grid>

            <Box sx={{ mt: 2.5, mb: 2.5 }}>
              <Label text="SECURITY DEPOSIT (RS)" />
              <TextField fullWidth size="small" type="number" name="deposit" placeholder="3000" value={form.deposit} onChange={handleChange} required sx={fieldStyle} />
              <Typography sx={{ fontSize: '11px', color: '#6B7686', mt: 0.5 }}>
                Refunded to renter after item is returned in good condition
              </Typography>
            </Box>

            <Box sx={{ mb: 3.5 }}>
              <Label text="DESCRIPTION" />
              <TextField fullWidth size="small" multiline rows={4} name="description" placeholder="Condition, what's included, any usage notes..." value={form.description} onChange={handleChange} required sx={fieldStyle} />
            </Box>

            <Button type="submit" fullWidth disabled={loading}
              sx={{ 
                bgcolor: '#0E1A2B', 
                color: '#F6F2EA', 
                py: 1.6, 
                fontSize: '14px', 
                fontWeight: 600, 
                borderRadius: '100px',
                '&:hover': { bgcolor: '#3E7C6B', transform: 'translateY(-2px)' },
                '&.Mui-disabled': { bgcolor: '#E2E8F0', color: '#94A3B8' },
                transition: 'all 0.3s ease'
              }}>
              {loading ? (<><Loader2 size={18} className="spin-loader" /> Publishing...</>) : 'Publish listing'}
            </Button>
          </Box>
        </Paper>

      </Container>

      <style>{`
        @keyframes spinLoaderAdd { to { transform: rotate(360deg); } }
        .spin-loader { animation: spinLoaderAdd 0.8s linear infinite; }
      `}</style>
    </Box>
  );
};

export default AddItem;