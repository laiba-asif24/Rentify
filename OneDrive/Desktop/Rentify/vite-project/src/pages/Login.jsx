// client/src/pages/Login.jsx

import { useState } from 'react';
import { Box, Typography, TextField, Button, Link, Alert, IconButton, InputAdornment } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Eye, EyeOff, Loader2, ArrowRight } from 'lucide-react';
import axios from 'axios';
import { Link as RouterLink } from 'react-router-dom';

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
        createdAt: res.data.user.createdAt || new Date().toISOString()
      };
      login(userData, res.data.token);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
      setLoading(false);
    }
  };

  const fieldStyle = {
    '& .MuiOutlinedInput-root': {
      borderRadius: '12px', fontSize: '15px', bgcolor: 'white',
      '& fieldset': { borderColor: '#E3DFD3' },
      '&:hover fieldset': { borderColor: '#3E7C6B' },
      '&.Mui-focused fieldset': { borderColor: '#3E7C6B', borderWidth: '1.5px' },
    },
  };

  const Label = ({ text }) => (
    <Typography sx={{ fontSize: '12px', fontWeight: 700, color: '#0E1A2B', mb: 1, fontFamily: '"IBM Plex Mono", monospace', letterSpacing: '0.1em' }}>
      {text}
    </Typography>
  );

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#F7F3EA', display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' } }}>
      <style>{`
        @keyframes authFadeUp { from { opacity: 0; transform: translateY(18px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes spinLoader { to { transform: rotate(360deg); } }
        .auth-in { opacity: 0; animation: authFadeUp 0.7s cubic-bezier(0.16,1,0.3,1) forwards; }
        .auth-spin { animation: spinLoader 0.8s linear infinite; }
      `}</style>

      {/* LEFT */}
      <Box sx={{
        display: { xs: 'none', md: 'flex' }, flexDirection: 'column', justifyContent: 'space-between',
        bgcolor: '#0E1A2B', p: 6, position: 'relative', overflow: 'hidden',
      }}>
        <Box component={RouterLink} to="/" className="auth-in" sx={{ display: 'flex', alignItems: 'center', gap: 1, textDecoration: 'none', width: 'fit-content' }}>
          <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#E8A33D' }} />
          <Typography sx={{ fontFamily: '"Fraunces", serif', fontWeight: 600, fontSize: '1.3rem', color: 'white' }}>Rentify</Typography>
        </Box>
        <Box>
          <Typography className="auth-in" sx={{ fontFamily: '"Fraunces", serif', fontStyle: 'italic', fontSize: '2rem', fontWeight: 500, color: 'white', lineHeight: 1.3, mb: 3 }}>
            "Your neighbour has what you need."
          </Typography>
          <Box className="auth-in" sx={{ display: 'flex', gap: 2 }}>
            {['500+ items', '50+ cities', '4.8★ rating'].map((s, i) => (
              <Box key={i} sx={{ bgcolor: 'rgba(255,255,255,0.08)', borderRadius: '100px', px: 2, py: 0.8, border: '1px solid rgba(255,255,255,0.12)' }}>
                <Typography sx={{ color: 'rgba(255,255,255,0.7)', fontSize: '12px', fontFamily: '"IBM Plex Mono", monospace' }}>{s}</Typography>
              </Box>
            ))}
          </Box>
        </Box>
      </Box>

      {/* RIGHT */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', p: { xs: 3, md: 6 }, pt: { xs: 10, md: 6 } }}>
        <Box sx={{ width: '100%', maxWidth: 400 }}>
          <Typography className="auth-in" sx={{ fontSize: '12px', fontWeight: 700, color: '#3E7C6B', letterSpacing: '0.12em', mb: 2 }}>
            WELCOME BACK
          </Typography>
          <Typography className="auth-in" variant="h2" sx={{ fontFamily: '"Fraunces", serif', fontSize: '2rem', color: '#0E1A2B', mb: 1 }}>
            Sign in
          </Typography>
          <Typography className="auth-in" sx={{ color: '#6B7280', fontSize: '15px', mb: 4 }}>
            Don't have an account?{' '}
            <Link onClick={() => navigate('/register')} sx={{ color: '#3E7C6B', cursor: 'pointer', fontWeight: 600, textDecoration: 'none' }}>
              Sign up free
            </Link>
          </Typography>

          {error && <Alert severity="error" sx={{ mb: 3, borderRadius: '12px' }}>{error}</Alert>}

          <Box component="form" onSubmit={handleSubmit}>
            <Box className="auth-in" sx={{ mb: 2.5 }}>
              <Label text="EMAIL" />
              <TextField fullWidth name="email" type="email" placeholder="you@example.com" value={form.email} onChange={handleChange} required sx={fieldStyle} />
            </Box>
            <Box className="auth-in" sx={{ mb: 4 }}>
              <Label text="PASSWORD" />
              <TextField fullWidth name="password" type={showPass ? 'text' : 'password'} placeholder="Enter password" value={form.password} onChange={handleChange} required sx={fieldStyle}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={() => setShowPass(!showPass)} edge="end" size="small">
                        {showPass ? <EyeOff size={18} color="#6B7280" /> : <Eye size={18} color="#6B7280" />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </Box>
            <Button type="submit" fullWidth disabled={loading}
              sx={{ bgcolor: '#0E1A2B', color: '#F7F3EA', py: 1.8, fontSize: '15px', fontWeight: 600, borderRadius: '100px', display: 'flex', gap: 1 }}>
              {loading ? (<><Loader2 size={18} className="auth-spin" /> Signing in...</>) : (<>Sign in <ArrowRight size={16} /></>)}
            </Button>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default Login;