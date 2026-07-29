import { Box, Container, Grid, Typography, Link, Divider } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { MapPin, Shield, ArrowRight } from 'lucide-react';

const Footer = () => {
  const navigate = useNavigate();

  const footerLinks = {
    Rent: [
      { label: 'Browse all items', path: '/browse' },
      { label: 'Tools & DIY', path: '/browse?category=Tools' },
      { label: 'Cameras', path: '/browse?category=Cameras' },
      { label: 'Camping gear', path: '/browse?category=Camping' },
      { label: 'Sports & bikes', path: '/browse?category=Sports%20%26%20bikes' },
    ],
    Earn: [
      { label: 'List an item', path: '/register' },
      { label: 'How it works', path: '/#how' },
      { label: 'Owner dashboard', path: '/dashboard' },
      { label: 'Pricing & fees', path: '/browse' },
    ],
    Company: [
      { label: 'About Rentify', path: '/browse' },
      { label: 'Trust & safety', path: '/browse' },
      { label: 'Help center', path: '/browse' },
      { label: 'Contact us', path: '/browse' },
    ],
    Legal: [
      { label: 'Terms of service', path: '/browse' },
      { label: 'Privacy policy', path: '/browse' },
      { label: 'Cookie policy', path: '/browse' },
      { label: 'Rental agreement', path: '/browse' },
    ],
  };

  return (
    <Box sx={{
      bgcolor: '#0A0A0F',
      borderTop: '1px solid var(--line)',
      pt: { xs: 6, md: 9 },
      pb: 4,
      position: 'relative',
      overflow: 'hidden',
    }}>
      <Box sx={{
        position: 'absolute',
        top: '-30%',
        left: '50%',
        transform: 'translateX(-50%)',
        width: '80%',
        height: '60%',
        background: 'radial-gradient(ellipse, rgba(139,92,246,0.06) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
        <Grid container spacing={{ xs: 4, md: 6 }}>
          {/* Brand column */}
          <Grid item xs={12} md={3}>
            <Typography sx={{
              fontFamily: '"Fraunces", serif',
              fontWeight: 600,
              fontSize: '24px',
              color: 'var(--ink)',
              mb: 2,
              display: 'flex',
              alignItems: 'center',
              gap: 1,
            }}>
              <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: 'var(--purple)' }} />
              Rentify
            </Typography>
            <Typography sx={{ color: 'var(--slate)', fontSize: '14px', lineHeight: 1.8, maxWidth: 280, mb: 3 }}>
              Pakistan's peer-to-peer rental marketplace. Borrow what you need, earn from what you own.
            </Typography>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <MapPin size={15} color="var(--purple-light)" />
              <Typography sx={{ color: 'var(--slate)', fontSize: '13px' }}>Karachi · Lahore · Islamabad</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
              <Shield size={15} color="var(--purple-light)" />
              <Typography sx={{ color: 'var(--slate)', fontSize: '13px' }}>Every user ID-verified</Typography>
            </Box>

            <Box sx={{ display: 'flex', gap: 1.5 }}>
              {[
                { label: 'X', href: '#' },
                { label: 'in', href: '#' },
                { label: 'ig', href: '#' },
                { label: 'fb', href: '#' },
              ].map((s) => (
                <Box
                  key={s.label}
                  component="a"
                  href={s.href}
                  sx={{
                    width: 38,
                    height: 38,
                    borderRadius: '10px',
                    bgcolor: 'rgba(255,255,255,0.04)',
                    border: '1px solid var(--line)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--slate)',
                    cursor: 'pointer',
                    fontSize: '13px',
                    fontWeight: 600,
                    textDecoration: 'none',
                    transition: 'all 0.25s ease',
                    '&:hover': {
                      borderColor: 'var(--purple)',
                      color: 'var(--purple-light)',
                      bgcolor: 'rgba(139,92,246,0.1)',
                      transform: 'translateY(-2px)',
                    },
                  }}
                >
                  {s.label}
                </Box>
              ))}
            </Box>
          </Grid>

          {/* Link columns */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <Grid item xs={6} sm={3} md={2.25} key={title}>
              <Typography sx={{
                fontWeight: 700,
                fontSize: '12px',
                color: 'var(--ink)',
                mb: 2.5,
                fontFamily: '"IBM Plex Mono", monospace',
                letterSpacing: '0.08em',
              }}>
                {title.toUpperCase()}
              </Typography>
              {links.map((link) => (
                <Box key={link.label} sx={{ mb: 1.8 }}>
                  <Link
                    component="button"
                    onClick={() => navigate(link.path)}
                    underline="none"
                    sx={{
                      color: 'var(--slate)',
                      fontSize: '14px',
                      cursor: 'pointer',
                      transition: 'color 0.2s ease',
                      '&:hover': { color: 'var(--purple-light)' },
                    }}
                  >
                    {link.label}
                  </Link>
                </Box>
              ))}
            </Grid>
          ))}
        </Grid>

        <Divider sx={{ borderColor: 'var(--line)', my: { xs: 4, md: 5 } }} />

        <Box sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 2,
        }}>
          <Typography sx={{ color: 'var(--slate)', fontSize: '13px', fontFamily: '"IBM Plex Mono", monospace' }}>
            © 2026 Rentify. All rights reserved.
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography sx={{ color: 'var(--slate)', fontSize: '13px' }}>
              Made for people who'd rather borrow than buy
            </Typography>
            <ArrowRight size={14} color="var(--purple)" />
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;
