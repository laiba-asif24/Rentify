// client/src/theme.jsx

import { createTheme } from '@mui/material';

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: { 
      main: '#8B5CF6',
      light: '#A78BFA',
      dark: '#6D28D9',
    },
    secondary: { 
      main: '#409F7A',
      light: '#52B88E',
      dark: '#2D6A4F',
    },
    background: { 
      default: '#0D0D12', 
      paper: '#16161E' 
    },
    text: { 
      primary: '#F0F0F5', 
      secondary: '#8892A4' 
    },
  },
  typography: {
    fontFamily: '"Inter", sans-serif',
    h1: { 
      fontFamily: '"Fraunces", serif', 
      fontWeight: 600, 
      letterSpacing: '-0.02em', 
      lineHeight: 1.05 
    },
    h2: { 
      fontFamily: '"Fraunces", serif', 
      fontWeight: 600, 
      letterSpacing: '-0.02em', 
      lineHeight: 1.05 
    },
    button: { 
      fontWeight: 600, 
      textTransform: 'none' 
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: '100px',
          textTransform: 'none',
          fontWeight: 600,
          fontSize: '14px',
          padding: '12px 28px',
          boxShadow: 'none',
          '&:hover': { 
            boxShadow: '0 8px 24px rgba(139,92,246,0.3)',
            transform: 'translateY(-2px)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: '20px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
          border: '1px solid rgba(255,255,255,0.08)',
          background: '#16161E',
          transition: 'all 0.3s cubic-bezier(.22,1,.36,1)',
          '&:hover': {
            boxShadow: '0 16px 48px rgba(0,0,0,0.35)',
            transform: 'translateY(-4px)',
          },
        },
      },
    },
  },
});

export default theme;
