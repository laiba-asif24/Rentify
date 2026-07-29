// client/src/pages/Register.jsx

import { useState } from 'react';
import { Box, Typography, TextField, Button, Link, Alert, Grid, IconButton, InputAdornment } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Loader2, ArrowRight, Upload, X } from 'lucide-react';
import axios from 'axios';
import AuthLayout from '../components/AuthLayout';
import { darkFieldStyle, darkLabelSx } from '../utils/darkFormStyles';

const Register = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    city: '',
    password: '',
    cnicImage: null,
  });
  const [cnicPreview, setCnicPreview] = useState(null);
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [errorType, setErrorType] = useState('default'); // default | duplicate
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleCnicUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setError('Please upload an image file');
        setErrorType('default');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setError('Image size should be less than 5MB');
        setErrorType('default');
        return;
      }
      setForm({ ...form, cnicImage: file });
        setCnicPreview(URL.createObjectURL(file));
      setError('');
      setErrorType('default');
    }
  };

  const removeCnicImage = () => {
    setForm({ ...form, cnicImage: null });
    setCnicPreview(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setErrorType('default');
    setLoading(true);

    if (!form.cnicImage) {
      setError('Please upload your CNIC image');
      setLoading(false);
      return;
    }

    try {
      const formData = new FormData();
      formData.append('name', form.name.trim());
      formData.append('email', form.email.trim().toLowerCase());
      formData.append('phone', form.phone.trim());
      formData.append('city', form.city.trim());
      formData.append('password', form.password);
      formData.append('cnicImage', form.cnicImage);

      await axios.post('http://localhost:5000/api/auth/register', formData);

      navigate('/login');
    } catch (err) {
      console.error('Register err:', err);
      const status = err.response?.status;
      const serverMsg = err.response?.data?.message;
      const axiosMsg = err.message;
      const msg = serverMsg || axiosMsg || 'Registration failed';

      if (status === 400 && serverMsg === 'All fields are required') {
        setError('Form data could not be processed. Please refresh the page, re-upload your CNIC, and try again.');
      } else if (status === 400 && /already exists/i.test(serverMsg || '')) {
        setError('This email address is already linked to an existing Rentify account.');
        setErrorType('duplicate');
      } else if (status === 500 && /cnic/i.test(serverMsg || '')) {
        setError(serverMsg); // Show exact CNIC error from server
      } else if (status === 500 && /database/i.test(serverMsg || '')) {
        setError('We could not connect to our database. Please try again in a moment.');
      } else if (!status) {
        // Network error
        setError('Could not connect to the server. Make sure the backend (node server.js) is running on port 5000.');
      } else {
        setError(msg);
      }
      setLoading(false);
    }
  };

  const Label = ({ text }) => <Typography sx={darkLabelSx}>{text}</Typography>;

  return (
    <AuthLayout
      wide
      eyebrow="Join the community"
      title="Create your account"
      quote='"Start earning from things you already own — list in minutes."'
      subtitle={
        <>
          Already have an account?{' '}
          <Link onClick={() => navigate('/login')} sx={{ color: 'var(--sage-light)', cursor: 'pointer', fontWeight: 600, textDecoration: 'none', '&:hover': { color: 'var(--sage)' } }}>
            Sign in
          </Link>
        </>
      }
    >
      {error && (
        errorType === 'duplicate' ? (
          <Alert
            severity="error"
            sx={{
              mb: 2,
              borderRadius: '12px',
              bgcolor: 'rgba(220,38,38,0.1)',
              border: '1px solid rgba(220,38,38,0.25)',
              color: 'var(--ink)',
              '& .MuiAlert-message': { width: '100%' },
              '& .MuiAlert-icon': { color: '#EF4444' }
            }}
          >
            <Typography sx={{ fontSize: '13.5px', fontWeight: 500, lineHeight: 1.55 }}>
              {error}
            </Typography>
            <Typography sx={{ fontSize: '13px', color: 'var(--slate)', mt: 1, lineHeight: 1.5 }}>
              You can{' '}
              <Link
                onClick={() => navigate('/login')}
                sx={{
                  color: 'var(--sage-light)',
                  cursor: 'pointer',
                  fontWeight: 700,
                  textDecoration: 'none',
                  '&:hover': { color: 'var(--sage)', textDecoration: 'underline' }
                }}
              >
                Sign in here
              </Link>{' '}
              with this email, or continue registration with a different email address.
            </Typography>
          </Alert>
        ) : (
          <Alert
            severity="error"
            sx={{
              mb: 2,
              borderRadius: '12px',
              bgcolor: 'rgba(220,38,38,0.1)',
              border: '1px solid rgba(220,38,38,0.25)',
              '& .MuiAlert-icon': { color: '#EF4444' }
            }}
          >
            <Typography sx={{ fontSize: '13.5px', fontWeight: 500, lineHeight: 1.55 }}>{error}</Typography>
          </Alert>
        )
      )}

      <Box component="form" onSubmit={handleSubmit} encType="multipart/form-data">
        <Grid container spacing={1.5}>
          <Grid item xs={12}>
            <Label text="FULL NAME" />
            <TextField fullWidth size="small" name="name" placeholder="Ahmed Ali" value={form.name} onChange={handleChange} required sx={darkFieldStyle} />
          </Grid>
          <Grid item xs={12}>
            <Label text="EMAIL" />
            <TextField fullWidth size="small" name="email" type="email" placeholder="you@example.com" value={form.email} onChange={handleChange} required sx={darkFieldStyle} />
          </Grid>
          <Grid item xs={6}>
            <Label text="PHONE" />
            <TextField fullWidth size="small" name="phone" placeholder="03001234567" value={form.phone} onChange={handleChange} required sx={darkFieldStyle} />
          </Grid>
          <Grid item xs={6}>
            <Label text="CITY" />
            <TextField fullWidth size="small" name="city" placeholder="Karachi" value={form.city} onChange={handleChange} required sx={darkFieldStyle} />
          </Grid>

          <Grid item xs={12}>
            <Label text="CNIC IMAGE" />
            <Box
              onClick={() => document.getElementById('cnic-upload-input')?.click()}
              className="auth-upload-zone"
              sx={{ bgcolor: cnicPreview ? 'rgba(64,159,122,0.08)' : 'transparent' }}
            >
              <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handleCnicUpload} id="cnic-upload-input" />
              {cnicPreview ? (
                <Box sx={{ position: 'relative', display: 'inline-block' }}>
                  <img src={cnicPreview} alt="CNIC Preview" style={{ maxHeight: '70px', borderRadius: '8px', maxWidth: '100%' }} />
                  <Box
                    onClick={(e) => { e.stopPropagation(); removeCnicImage(); }}
                    sx={{
                      position: 'absolute', top: -6, right: -6, bgcolor: '#dc2626', color: 'white',
                      borderRadius: '50%', width: 20, height: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                    }}
                  >
                    <X size={12} />
                  </Box>
                </Box>
              ) : (
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1.5, flexWrap: 'wrap' }}>
                  <Upload size={18} color="var(--slate)" />
                  <Typography sx={{ color: 'var(--slate)', fontSize: '13px', fontWeight: 500 }}>Upload CNIC photo</Typography>
                  <Typography sx={{ color: 'var(--slate)', fontSize: '11px' }}>JPG/PNG · max 5MB</Typography>
                </Box>
              )}
            </Box>
          </Grid>

          <Grid item xs={12}>
            <Label text="PASSWORD" />
            <TextField
              fullWidth
              size="small"
              name="password"
              type={showPass ? 'text' : 'password'}
              placeholder="Min. 8 characters"
              value={form.password}
              onChange={handleChange}
              required
              sx={darkFieldStyle}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowPass(!showPass)} edge="end" size="small">
                      {showPass ? <EyeOff size={16} color="var(--slate)" /> : <Eye size={16} color="var(--slate)" />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
        </Grid>

        <Button type="submit" fullWidth disabled={loading} className="auth-submit-btn" sx={{ mt: 3 }}>
          {loading ? (<><Loader2 size={16} className="auth-spin" /> Creating...</>) : (<>Create account <ArrowRight size={16} /></>)}
        </Button>
      </Box>
    </AuthLayout>
  );
};

export default Register;
