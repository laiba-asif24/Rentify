import { Box, Typography } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { Shield, Sparkles } from 'lucide-react';

const floatingItems = [
  { label: 'Canon DSLR', price: 'Rs 800/day', img: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?q=80&w=200&auto=format&fit=crop', delay: '0s', top: '10%', left: '5%' },
  { label: 'Power Drill', price: 'Rs 350/day', img: 'https://images.unsplash.com/photo-1572981779307-38b8cabb2407?q=80&w=200&auto=format&fit=crop', delay: '0.5s', top: '45%', left: '62%' },
  { label: 'Camping Tent', price: 'Rs 500/day', img: 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?q=80&w=200&auto=format&fit=crop', delay: '1s', top: '90%', left: '30%' },
];

const AuthLayout = ({ eyebrow, title, subtitle, footer, quote, children, wide = false }) => (
  <Box className="auth-page">
    <Box className="auth-orb auth-orb-1" />
    <Box className="auth-orb auth-orb-2" />
    <Box className="auth-orb auth-orb-3" />

    <Box className="auth-shell">
      <Box className="auth-brand">
        <Box component={RouterLink} to="/" className="auth-logo fade-in-1">
          <Box className="auth-logo-dot" />
          <Typography component="span" sx={{ fontFamily: '"Fraunces", serif', fontWeight: 600, fontSize: '1.45rem', color: 'var(--ink)' }}>
            Rentify
          </Typography>
        </Box>

        <Box className="auth-brand-content fade-in-2">
          <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 1, mb: 2, px: 2, py: 0.7, borderRadius: '100px', bgcolor: 'rgba(139,92,246,0.12)', border: '1px solid rgba(139,92,246,0.22)' }}>
            <Sparkles size={14} color="#A78BFA" />
            <Typography sx={{ fontSize: '11px', fontWeight: 600, color: '#A78BFA', letterSpacing: '0.06em' }}>PAKISTAN&apos;S RENTAL MARKET</Typography>
          </Box>

          <Typography className="auth-quote">{quote}</Typography>

          <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap', mt: 3 }}>
            {['500+ items', '50+ cities', 'Verified owners'].map((s, i) => (
              <Box key={s} className="auth-stat-pill" style={{ animationDelay: `${0.3 + i * 0.1}s` }}>
                {s}
              </Box>
            ))}
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 3, color: 'var(--slate)', fontSize: '13px' }}>
            <Shield size={16} color="var(--sage-light)" />
            <span>Secure bookings &amp; ID-verified users</span>
          </Box>
        </Box>

        {/* Floating cards — only in bottom stage, below text */}
        <Box className="auth-float-stage fade-in-4" aria-hidden>
          {floatingItems.map((item) => (
            <Box
              key={item.label}
              className="auth-float-card"
              style={{ top: item.top, left: item.left, animationDelay: item.delay }}
            >
              <Box component="img" src={item.img} alt="" />
              <Box>
                <Typography sx={{ fontSize: '12px', fontWeight: 600, color: 'var(--ink)' }}>{item.label}</Typography>
                <Typography sx={{ fontSize: '11px', color: 'var(--purple-light)', fontWeight: 600 }}>{item.price}</Typography>
              </Box>
            </Box>
          ))}
        </Box>
      </Box>

      <Box className={`auth-card fade-in-3${wide ? ' auth-card-wide' : ''}`}>
        <Box component={RouterLink} to="/" className="auth-logo auth-logo-mobile fade-in-1">
          <Box className="auth-logo-dot" />
          <Typography component="span" sx={{ fontFamily: '"Fraunces", serif', fontWeight: 600, fontSize: '1.35rem', color: 'var(--ink)' }}>
            Rentify
          </Typography>
        </Box>
        <Typography className="auth-eyebrow">{eyebrow}</Typography>
        <Typography className="auth-title">{title}</Typography>
        {subtitle && <Typography className="auth-subtitle">{subtitle}</Typography>}
        {children}
        {footer && <Box className="auth-footer">{footer}</Box>}
      </Box>
    </Box>
  </Box>
);

export default AuthLayout;
