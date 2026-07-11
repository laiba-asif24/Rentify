import { Box, Container, Grid, Typography, Link, Divider } from '@mui/material';

const Footer = () => {
  return (
   <Box sx={{ bgcolor: 'var(--cream)', borderTop: '1px solid var(--line)', pt: 8, pb: 5 }}>
      <Container maxWidth="lg">
        <Grid container spacing={6}>
          <Grid item xs={12} md={4}>
            <Typography sx={{ fontFamily: '"Fraunces", serif', fontWeight: 600, fontSize: '22px', color: 'var(--ink)', mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: 'var(--amber)', display: 'inline-block' }} />
              Rentify
            </Typography>
            <Typography sx={{ color: 'var(--slate)', fontSize: '14px', lineHeight: 1.8, maxWidth: 280 }}>
              The local marketplace for renting everyday items — tools, gear, and tech — from people near you instead of buying new.
            </Typography>
            <Box sx={{ display: 'flex', gap: 1.5, mt: 3 }}>
              {['𝕏', 'in', '◎'].map((s, i) => (
                <Box key={i} sx={{ width: 36, height: 36, borderRadius: '50%', border: '1px solid var(--line)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--slate)', cursor: 'pointer', fontSize: '14px', '&:hover': { borderColor: 'var(--sage)', color: 'var(--sage)' }, transition: 'all 0.2s ease' }}>
                  {s}
                </Box>
              ))}
            </Box>
          </Grid>

          {[
            { title: 'Product', links: ['Browse items', 'List an item', 'Pricing', 'Mobile app'] },
            { title: 'Company', links: ['About', 'Careers', 'Press', 'Contact'] },
            { title: 'Support', links: ['Help center', 'Trust & safety', 'Terms', 'Privacy'] },
          ].map((col) => (
            <Grid item xs={6} md={2.5} key={col.title}>
              <Typography sx={{ fontWeight: 700, fontSize: '13px', color: 'var(--ink)', mb: 3, fontFamily: '"IBM Plex Mono", monospace', letterSpacing: '0.05em' }}>
                {col.title.toUpperCase()}
              </Typography>
              {col.links.map(link => (
                <Box key={link} sx={{ mb: 2 }}>
                  <Link href="#" underline="none" sx={{ color: 'var(--slate)', fontSize: '14px', '&:hover': { color: 'var(--sage)' }, transition: 'color 0.2s ease' }}>
                    {link}
                  </Link>
                </Box>
              ))}
            </Grid>
          ))}
        </Grid>

        <Divider sx={{ borderColor: 'var(--line)', my: 5 }} />

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
          <Typography sx={{ color: 'var(--slate)', fontSize: '13px', fontFamily: '"IBM Plex Mono", monospace' }}>
            © 2026 Rentify. All rights reserved.
          </Typography>
          <Typography sx={{ color: 'var(--slate)', fontSize: '13px', fontStyle: 'italic' }}>
            Made for people who'd rather borrow than buy.
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;