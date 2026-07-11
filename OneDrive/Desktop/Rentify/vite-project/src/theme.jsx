import { createTheme } from '@mui/material';

const theme = createTheme({
  palette: {
    primary: { main: '#3E7C6B' },
    secondary: { main: '#E8A33D' },
    background: { default: '#F6F2EA', paper: '#FFFFFF' },
    text: { primary: '#0E1A2B', secondary: '#6B7686' },
  },
  typography: {
    fontFamily: '"Inter", sans-serif',
    h1: { fontFamily: '"Fraunces", serif', fontWeight: 600, letterSpacing: '-0.01em', lineHeight: 1.05 },
    h2: { fontFamily: '"Fraunces", serif', fontWeight: 600, letterSpacing: '-0.01em', lineHeight: 1.05 },
    h3: { fontFamily: '"Fraunces", serif', fontWeight: 600, letterSpacing: '-0.01em', lineHeight: 1.05 },
    button: { fontWeight: 600, textTransform: 'none' },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: '100px',
          textTransform: 'none',
          fontWeight: 600,
          fontSize: '14px',
          padding: '12px 24px',
          boxShadow: 'none',
          '&:hover': { boxShadow: 'none' },
        },
      },
    },
  },
});

export default theme;