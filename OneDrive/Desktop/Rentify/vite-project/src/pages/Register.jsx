// client/src/pages/Register.jsx

import { useState } from 'react';
import { Box, Typography, TextField, Button, Link, Alert, Grid, IconButton, InputAdornment } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Loader2, ArrowRight } from 'lucide-react';
import axios from 'axios';
import { Link as RouterLink } from 'react-router-dom';

const Register = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', phone: '', city: '', password: '', cnic: '' });
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await axios.post('http://localhost:5000/api/auth/register', form);
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
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
            "Start earning from things you already own."
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
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', p: { xs: 3, md: 6 }, pt: { xs: 10, md: 4 } }}>
        <Box sx={{ width: '100%', maxWidth: 420 }}>
          <Typography className="auth-in" sx={{ fontSize: '12px', fontWeight: 700, color: '#3E7C6B', letterSpacing: '0.12em', mb: 2 }}>
            CREATE ACCOUNT
          </Typography>
          <Typography className="auth-in" variant="h2" sx={{ fontFamily: '"Fraunces", serif', fontSize: '1.8rem', color: '#0E1A2B', mb: 1 }}>
            Join Rentify
          </Typography>
          <Typography className="auth-in" sx={{ color: '#6B7280', fontSize: '15px', mb: 4 }}>
            Already have an account?{' '}
            <Link onClick={() => navigate('/login')} sx={{ color: '#3E7C6B', cursor: 'pointer', fontWeight: 600, textDecoration: 'none' }}>
              Sign in
            </Link>
          </Typography>

          {error && <Alert severity="error" sx={{ mb: 3, borderRadius: '12px' }}>{error}</Alert>}

          <Box component="form" onSubmit={handleSubmit}>
            <Grid container spacing={2}>
              <Grid item xs={12} className="auth-in">
                <Label text="FULL NAME" />
                <TextField fullWidth name="name" placeholder="Ahmed Ali" value={form.name} onChange={handleChange} required sx={fieldStyle} />
              </Grid>
              <Grid item xs={12} className="auth-in">
                <Label text="EMAIL" />
                <TextField fullWidth name="email" type="email" placeholder="you@example.com" value={form.email} onChange={handleChange} required sx={fieldStyle} />
              </Grid>
              <Grid item xs={6} className="auth-in">
                <Label text="PHONE" />
                <TextField fullWidth name="phone" placeholder="03001234567" value={form.phone} onChange={handleChange} required sx={fieldStyle} />
              </Grid>
              <Grid item xs={6} className="auth-in">
                <Label text="CITY" />
                <TextField fullWidth name="city" placeholder="Karachi" value={form.city} onChange={handleChange} required sx={fieldStyle} />
              </Grid>
              <Grid item xs={12} className="auth-in">
                <Label text="CNIC" />
                <TextField fullWidth name="cnic" placeholder="12345-1234567-1" value={form.cnic} onChange={handleChange} required sx={fieldStyle} />
                <Typography sx={{ fontSize: '12px', color: '#6B7280', mt: 0.8, fontFamily: '"IBM Plex Mono", monospace' }}>
                  Format: 12345-1234567-1
                </Typography>
              </Grid>
              <Grid item xs={12} className="auth-in">
                <Label text="PASSWORD" />
                <TextField fullWidth name="password" type={showPass ? 'text' : 'password'} placeholder="Min. 8 characters" value={form.password} onChange={handleChange} required sx={fieldStyle}
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
              </Grid>
            </Grid>
            <Button type="submit" fullWidth disabled={loading}
              sx={{ mt: 3, bgcolor: '#0E1A2B', color: '#F7F3EA', py: 1.8, fontSize: '15px', fontWeight: 600, borderRadius: '100px', display: 'flex', gap: 1 }}>
              {loading ? (<><Loader2 size={18} className="auth-spin" /> Creating...</>) : (<>Create account <ArrowRight size={16} /></>)}
            </Button>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default Register;