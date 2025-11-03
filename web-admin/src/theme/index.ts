import { createTheme } from '@mui/material/styles';

const primary = {
  main: '#1e40af',
  light: '#3b82f6',
  dark: '#1e3a8a',
  contrastText: '#ffffff',
};

const secondary = {
  main: '#ef4444',
  light: '#f87171',
  dark: '#dc2626',
  contrastText: '#ffffff',
};

const success = { main: '#22c55e' };
const warning = { main: '#f59e0b' };
const info = { main: '#0ea5e9' };
const error = { main: '#ef4444' };

export const theme = createTheme({
  palette: {
    mode: 'light',
    primary,
    secondary,
    success,
    warning,
    info,
    error,
    background: {
      default: '#f8fafc',
      paper: '#ffffff',
    },
  },
  typography: {
    fontFamily: 'Inter, system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif',
    h1: { fontWeight: 700 },
    h2: { fontWeight: 700 },
    h3: { fontWeight: 600 },
    h4: { fontWeight: 600 },
    h5: { fontWeight: 600 },
    h6: { fontWeight: 600 },
    button: { textTransform: 'none', fontWeight: 600 },
  },
  shape: { borderRadius: 10 },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          WebkitFontSmoothing: 'antialiased',
          MozOsxFontSmoothing: 'grayscale',
        },
        '::selection': {
          backgroundColor: '#dbeafe',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          background: primary.main,
        },
      },
    },
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: {
        root: { borderRadius: 10 },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: { borderRight: '1px solid #e2e8f0' },
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 1px 2px rgba(0,0,0,0.06)',
        },
      },
    },
  },
});

export default theme;


