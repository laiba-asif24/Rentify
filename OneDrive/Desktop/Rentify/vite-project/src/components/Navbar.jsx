import { useState, useEffect } from 'react';
import { AppBar, Toolbar, Container, Typography, Box, Button } from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <AppBar position="fixed" elevation={0} sx={{
      background: scrolled ? 'rgba(246,242,234,0.88)' : 'transparent',
      backdropFilter: scrolled ? 'blur(14px)' : 'none',
      borderBottom: scrolled ? '1px solid var(--line)' : 'none',
      transition: 'all 0.4s var(--ease)',
      py: scrolled ? 0 : 0.5,
    }}>
      <Container maxWidth="lg">
        <Toolbar disableGutters sx={{ height: scrolled ? 64 : 72, transition: 'height 0.4s var(--ease)' }}>
          <Typography component={Link} to="/"
            sx={{ fontFamily: '"Fraunces", serif', fontWeight: 600, fontSize: '22px', color: 'var(--ink)', textDecoration: 'none', letterSpacing: '-0.02em', flexGrow: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: 'var(--amber)', display: 'inline-block' }} />
            Rentify
          </Typography>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 4.5 }}>
            {[['Categories', '/browse'], ['How it works', '/browse'], ['Nearby items', '/browse'], ['Why us', '/browse']].map(([label, path]) => (
              <Link key={label} to={path} className="nav-link-item">{label}</Link>
            ))}
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, ml: 4 }}>
            {user ? (
              <>
                <Link to="/dashboard" className="nav-link-item">Dashboard</Link>
                <Button onClick={() => { logout(); navigate('/login'); }}
                  sx={{ bgcolor: 'var(--ink)', color: 'var(--cream)', borderRadius: '100px', px: 3, fontSize: '14px', fontWeight: 600, '&:hover': { bgcolor: 'var(--sage)', transform: 'translateY(-2px)', boxShadow: '0 12px 24px rgba(62,124,107,0.28)' }, transition: 'all 0.35s var(--ease)' }}>
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Link to="/login" className="nav-link-item">Login</Link>
                <Button component={Link} to="/register"
                  sx={{ bgcolor: 'var(--ink)', color: 'var(--cream)', borderRadius: '100px', px: 3, fontSize: '14px', fontWeight: 600, '&:hover': { bgcolor: 'var(--sage)', transform: 'translateY(-2px)', boxShadow: '0 12px 24px rgba(62,124,107,0.28)' }, transition: 'all 0.35s var(--ease)' }}>
               Get Started
                </Button>
              </>
            )}
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default Navbar;