import { Box, Typography } from '@mui/material';

const Loader = () => {
  return (
    <Box className="rentify-loader-overlay">
      <Box className="rentify-loader-content">
        <Box className="rentify-loader-logo">
          <Box className="rentify-loader-dot" />
          <Typography
            component="span"
            sx={{
              fontFamily: '"Fraunces", serif',
              fontWeight: 600,
              fontSize: { xs: '3.2rem', sm: '4rem', md: '4.8rem' },
              letterSpacing: '-0.03em',
              background: 'linear-gradient(135deg, #8B5CF6 0%, #3B82F6 50%, #6EE7B7 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            Rentify
          </Typography>
        </Box>

        <Box className="rentify-loader-progress-wrap">
          <Box className="rentify-loader-progress" />
        </Box>

        <Typography
          className="rentify-loader-text"
          sx={{
            marginTop: '1.8rem',
            fontSize: { xs: '11px', sm: '12px' },
            fontWeight: 600,
            letterSpacing: '0.35em',
            color: 'var(--slate)',
            textTransform: 'uppercase',
            fontFamily: '"IBM Plex Mono", monospace',
          }}
        >
          Loading Marketplace…
        </Typography>
      </Box>
    </Box>
  );
};

export default Loader;
