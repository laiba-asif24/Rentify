// client/src/pages/AddItem.jsx

import { useState } from 'react';
import { Box, Container, Typography, TextField, Button, Grid, MenuItem, Alert } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { Upload, X, Loader2, Check } from 'lucide-react';

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

  const fieldStyle = {
    '& .MuiOutlinedInput-root': {
      borderRadius: '12px', fontSize: '15px', bgcolor: 'white',
      '& fieldset': { borderColor: 'var(--line)' },
      '&:hover fieldset': { borderColor: 'var(--sage)' },
      '&.Mui-focused fieldset': { borderColor: 'var(--sage)', borderWidth: '1.5px' },
    },
  };

  const Label = ({ text }) => (
    <Typography sx={{ fontSize: '12px', fontWeight: 700, color: 'var(--ink)', mb: 1, fontFamily: '"IBM Plex Mono", monospace', letterSpacing: '0.1em' }}>
      {text}
    </Typography>
  );

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'city' || name === 'area') {
      setForm({ ...form, location: { ...form.location, [name]: value } });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  // ✅ IMAGE UPLOAD FUNCTION
  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    const remaining = 4 - images.length;
    const selected = files.slice(0, remaining);
    
    // Store files for upload
    setImageFiles([...imageFiles, ...selected]);
    
    // Preview for UI
    const previews = selected.map((f) => URL.createObjectURL(f));
    setImages([...images, ...previews]);
  };

  const removeImage = (idx) => {
    setImages(images.filter((_, i) => i !== idx));
    setImageFiles(imageFiles.filter((_, i) => i !== idx));
  };

  // ✅ SUBMIT FUNCTION WITH FORMDATA
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

      // Append images
      imageFiles.forEach((file) => {
        formData.append('images', file);
      });

      const res = await api.post('/items', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      console.log('✅ Item added:', res.data);
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
    <Box sx={{ backgroundColor: 'var(--cream)', minHeight: '100vh', pt: '110px', pb: 10 }}>
      <Container maxWidth="sm">

        <Box className="eyebrow" sx={{ mb: 1.5 }}>List an item</Box>
        <Typography variant="h2" sx={{ fontFamily: '"Fraunces", serif', fontSize: { xs: '1.8rem', md: '2.2rem' }, color: 'var(--ink)', mb: 1 }}>
          What are you renting out?
        </Typography>
        <Typography sx={{ color: 'var(--slate)', fontSize: '15px', mb: 5 }}>
          Add clear photos and honest details — it builds trust and gets you booked faster.
        </Typography>

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

        <Box component="form" onSubmit={handleSubmit} sx={{ bgcolor: 'white', borderRadius: '20px', border: '1px solid var(--line)', p: { xs: 3, md: 4.5 }, boxShadow: 'var(--shadow)' }}>

          {/* Image upload */}
          <Box sx={{ mb: 3.5 }}>
            <Label text="PHOTOS (UP TO 4)" />
            <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
              {images.map((img, i) => (
                <Box key={i} sx={{ position: 'relative', width: 84, height: 84, borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--line)' }}>
                  <Box component="img" src={img} sx={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  <Box onClick={() => removeImage(i)}
                    sx={{ position: 'absolute', top: 4, right: 4, width: 20, height: 20, borderRadius: '50%', bgcolor: 'rgba(14,26,43,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                    <X size={12} color="white" />
                  </Box>
                </Box>
              ))}
              {images.length < 4 && (
                <Box component="label" sx={{
                  width: 84, height: 84, borderRadius: '12px', border: '1.5px dashed var(--line)',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer', transition: 'all 0.2s ease', '&:hover': { borderColor: 'var(--sage)', bgcolor: 'rgba(62,124,107,0.04)' },
                }}>
                  <Upload size={18} color="var(--slate)" />
                  <Typography sx={{ fontSize: '10px', color: 'var(--slate)', mt: 0.5 }}>Add</Typography>
                  <input type="file" accept="image/*" multiple hidden onChange={handleImageUpload} />
                </Box>
              )}
            </Box>
          </Box>

          <Box sx={{ mb: 2.5 }}>
            <Label text="ITEM NAME" />
            <TextField fullWidth name="title" placeholder="e.g. Canon DSLR Camera" value={form.title} onChange={handleChange} required sx={fieldStyle} />
          </Box>

          <Grid container spacing={2} sx={{ mb: 0.5 }}>
            <Grid item xs={6}>
              <Label text="CATEGORY" />
              <TextField fullWidth select name="category" value={form.category} onChange={handleChange} required sx={fieldStyle}>
                {categoryList.map((c) => <MenuItem key={c} value={c}>{c}</MenuItem>)}
              </TextField>
            </Grid>
            <Grid item xs={6}>
              <Label text="PRICE / DAY (RS)" />
              <TextField fullWidth type="number" name="pricePerDay" placeholder="500" value={form.pricePerDay} onChange={handleChange} required sx={fieldStyle} />
            </Grid>
          </Grid>

          <Grid container spacing={2} sx={{ mt: 0.5, mb: 0.5 }}>
            <Grid item xs={6}>
              <Label text="CITY" />
              <TextField fullWidth name="city" placeholder="Karachi" value={form.location.city} onChange={handleChange} required sx={fieldStyle} />
            </Grid>
            <Grid item xs={6}>
              <Label text="AREA" />
              <TextField fullWidth name="area" placeholder="Gulshan-e-Iqbal" value={form.location.area} onChange={handleChange} required sx={fieldStyle} />
            </Grid>
          </Grid>

          <Box sx={{ mt: 2.5, mb: 2.5 }}>
            <Label text="SECURITY DEPOSIT (RS)" />
            <TextField fullWidth type="number" name="deposit" placeholder="3000" value={form.deposit} onChange={handleChange} required sx={fieldStyle} />
            <Typography sx={{ fontSize: '12px', color: 'var(--slate)', mt: 0.8 }}>Refunded to renter after item is returned in good condition</Typography>
          </Box>

          <Box sx={{ mb: 3.5 }}>
            <Label text="DESCRIPTION" />
            <TextField fullWidth multiline rows={4} name="description" placeholder="Condition, what's included, any usage notes..." value={form.description} onChange={handleChange} required sx={fieldStyle} />
          </Box>

          <Button type="submit" fullWidth disabled={loading}
            sx={{ bgcolor: 'var(--ink)', color: 'var(--cream)', py: 1.8, fontSize: '15px', fontWeight: 700, borderRadius: '100px', display: 'flex', gap: 1, '&:hover': { bgcolor: 'var(--sage)', transform: 'translateY(-2px)' }, transition: 'all 0.3s var(--ease)' }}>
            {loading ? (<><Loader2 size={18} className="spin-loader" /> Publishing...</>) : 'Publish listing'}
          </Button>
        </Box>

      </Container>

      <style>{`
        @keyframes spinLoaderAdd { to { transform: rotate(360deg); } }
        .spin-loader { animation: spinLoaderAdd 0.8s linear infinite; }
      `}</style>
    </Box>
  );
};

export default AddItem;