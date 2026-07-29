// client/src/pages/Login.jsx

import { useState } from 'react';
import { Box, Typography, TextField, Button, Link, Alert, IconButton, InputAdornment } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Eye, EyeOff, Loader2, ArrowRight } from 'lucide-react';
import axios from 'axios';
import AuthLayout from '../components/AuthLayout';
import { darkFieldStyle, darkLabelSx } from '../utils/darkFormStyles';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await axios.post('http://localhost:5000/api/auth/login', form);
      const userData = {
        _id: res.data.user.id || res.data.user._id,
        id: res.data.user.id || res.data.user._id,
        name: res.data.user.name,
        email: res.data.user.email,
        city: res.data.user.city || '',
        cnic: res.data.user.cnic || '00000-0000000-0',
        phone: res.data.user.phone || '',
        createdAt: res.data.user.createdAt || new Date().toISOString(),
      };
      login(userData, res.data.token);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
      setLoading(false);
    }
  };

  const Label = ({ text }) => <Typography sx={darkLabelSx}>{text}</Typography>;

  return (
    <AuthLayout
      eyebrow="Welcome back"
      title="Sign in to Rentify"
      quote='"Your neighbour has what you need — rent it today."'
      subtitle={
        <>
          Don&apos;t have an account?{' '}
          <Link onClick={() => navigate('/register')} sx={{ color: 'var(--sage-light)', cursor: 'pointer', fontWeight: 600, textDecoration: 'none', '&:hover': { color: 'var(--sage)' } }}>
            Create one free
          </Link>
        </>
      }
    >
      {error && <Alert severity="error" sx={{ mb: 2, borderRadius: '12px', bgcolor: 'rgba(220,38,38,0.1)', border: '1px solid rgba(220,38,38,0.25)' }}>{error}</Alert>}

      <Box component="form" onSubmit={handleSubmit}>
        <Box sx={{ mb: 2 }}>
          <Label text="EMAIL" />
          <TextField fullWidth size="small" name="email" type="email" placeholder="you@example.com" value={form.email} onChange={handleChange} required sx={darkFieldStyle} />
        </Box>
        <Box sx={{ mb: 2.5 }}>
          <Label text="PASSWORD" />
          <TextField
            fullWidth
            size="small"
            name="password"
            type={showPass ? 'text' : 'password'}
            placeholder="Enter password"
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
        </Box>
        <Button type="submit" fullWidth disabled={loading} className="auth-submit-btn">
          {loading ? (<><Loader2 size={16} className="auth-spin" /> Signing in...</>) : (<>Sign in <ArrowRight size={16} /></>)}
        </Button>
      </Box>
    </AuthLayout>
  );
};

export default Login;
