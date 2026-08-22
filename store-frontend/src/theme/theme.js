import { createTheme } from '@mui/material/styles';
import { colors, fonts } from './tokens';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: colors.awningGreen,
      light: colors.awningGreenLight,
      dark: colors.awningGreenDark,
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: colors.tomato,
      light: '#D9662F',
      dark: colors.tomatoDark,
      contrastText: '#FFFFFF',
    },
    warning: { main: colors.wheat, contrastText: colors.ink },
    error: { main: colors.tomato },
    background: {
      default: colors.paper,
      paper: '#FFFFFF',
    },
    text: {
      primary: colors.ink,
      secondary: colors.inkMuted,
    },
    divider: '#E4DFD1',
  },
  shape: {
    borderRadius: 10,
  },
  typography: {
    fontFamily: fonts.body,
    h1: { fontFamily: fonts.display, fontWeight: 700, letterSpacing: '-0.01em' },
    h2: { fontFamily: fonts.display, fontWeight: 700, letterSpacing: '-0.01em' },
    h3: { fontFamily: fonts.display, fontWeight: 700 },
    h4: { fontFamily: fonts.display, fontWeight: 600 },
    h5: { fontFamily: fonts.display, fontWeight: 600 },
    h6: { fontFamily: fonts.body, fontWeight: 700 },
    button: { textTransform: 'none', fontWeight: 600 },
    overline: { fontFamily: fonts.mono, letterSpacing: '0.08em' },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: colors.paper,
        },
        '::selection': {
          backgroundColor: colors.wheat,
          color: colors.ink,
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: { borderRadius: 8, paddingLeft: 18, paddingRight: 18 },
        containedPrimary: {
          boxShadow: 'none',
          '&:hover': { boxShadow: 'none' },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: { backgroundImage: 'none' },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 14,
          border: `1px solid ${'#E4DFD1'}`,
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: { boxShadow: 'none' },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: { fontWeight: 600 },
      },
    },
    MuiTextField: {
      defaultProps: {
        variant: 'outlined',
      },
    },
  },
});

export default theme;