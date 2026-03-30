import { createTheme, alpha } from '@mui/material/styles';
import type { Shadows } from '@mui/material/styles';
import { appColors, appRadii, appShadows } from './tokens';

export const appTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: appColors.primary,
      dark: appColors.primaryDark,
      light: appColors.primarySoft,
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: appColors.secondary,
    },
    success: {
      main: appColors.success,
    },
    warning: {
      main: appColors.warning,
    },
    error: {
      main: appColors.error,
    },
    info: {
      main: appColors.info,
    },
    background: {
      default: appColors.background,
      paper: appColors.surface,
    },
    text: {
      primary: appColors.textPrimary,
      secondary: appColors.textSecondary,
    },
    divider: appColors.border,
  },
  shape: {
    borderRadius: appRadii.md,
  },
  typography: {
    fontFamily: ['"IBM Plex Sans"', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'].join(
      ',',
    ),
    h1: { fontWeight: 700, letterSpacing: '-0.03em', lineHeight: 1.04 },
    h2: { fontWeight: 700, letterSpacing: '-0.025em', lineHeight: 1.08 },
    h3: { fontWeight: 700, letterSpacing: '-0.02em', lineHeight: 1.1 },
    h4: { fontWeight: 700, letterSpacing: '-0.015em', lineHeight: 1.14 },
    h5: { fontWeight: 600, letterSpacing: '-0.01em' },
    h6: { fontWeight: 600, letterSpacing: '-0.005em' },
    subtitle1: { fontWeight: 600 },
    subtitle2: { fontWeight: 600, letterSpacing: '0.005em' },
    body1: { lineHeight: 1.55 },
    body2: { lineHeight: 1.5 },
    overline: { fontWeight: 700, letterSpacing: '0.14em' },
    button: { textTransform: 'none', fontWeight: 600, letterSpacing: '0.005em' },
  },
  shadows: [
    'none',
    '0 2px 6px rgba(24, 32, 48, 0.04)',
    '0 4px 12px rgba(24, 32, 48, 0.05)',
    '0 8px 20px rgba(24, 32, 48, 0.06)',
    '0 10px 30px rgba(24, 32, 48, 0.08)',
    '0 14px 34px rgba(24, 32, 48, 0.10)',
    '0 18px 42px rgba(24, 32, 48, 0.12)',
    '0 24px 48px rgba(24, 32, 48, 0.14)',
    '0 28px 56px rgba(24, 32, 48, 0.16)',
    '0 34px 64px rgba(24, 32, 48, 0.18)',
    ...Array(15).fill('0 34px 64px rgba(24, 32, 48, 0.18)'),
  ] as Shadows,
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        html: {
          WebkitFontSmoothing: 'antialiased',
          MozOsxFontSmoothing: 'grayscale',
        },
        body: {
          backgroundColor: appColors.background,
          backgroundImage:
            'radial-gradient(circle at top left, rgba(1, 95, 116, 0.06), transparent 32%), radial-gradient(circle at top right, rgba(41, 126, 200, 0.06), transparent 28%)',
        },
        '*::selection': {
          backgroundColor: alpha(appColors.primary, 0.16),
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          border: `1px solid ${appColors.border}`,
          boxShadow: '0 4px 14px rgba(24, 32, 48, 0.05)',
          borderRadius: appRadii.md,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: appRadii.lg,
          border: `1px solid ${appColors.border}`,
          boxShadow: appShadows.card,
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 6,
          paddingInline: 14,
          minHeight: 36,
        },
        containedPrimary: {
          boxShadow: 'none',
          '&:hover': {
            boxShadow: appShadows.lift,
          },
        },
        outlined: {
          borderColor: appColors.border,
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          fontWeight: 700,
          letterSpacing: '0.01em',
          height: 26,
        },
      },
    },
    MuiTextField: {
      defaultProps: {
        variant: 'outlined',
        size: 'small',
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          backgroundColor: appColors.surface,
          minHeight: 38,
          '& fieldset': {
            borderColor: appColors.border,
          },
          '&:hover fieldset': {
            borderColor: alpha(appColors.primary, 0.35),
          },
          '&.Mui-focused fieldset': {
            borderColor: appColors.primary,
          },
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          boxShadow: 'none',
          borderRadius: 0,
          borderBottom: `1px solid ${alpha(appColors.border, 0.8)}`,
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          borderRight: `1px solid ${alpha(appColors.border, 0.85)}`,
          backgroundImage:
            'linear-gradient(180deg, rgba(255,255,255,0.98) 0%, rgba(247,250,252,0.98) 100%)',
        },
      },
    },
    MuiCardContent: {
      styleOverrides: {
        root: {
          padding: 16,
          '&:last-child': {
            paddingBottom: 16,
          },
        },
      },
    },
    MuiTableContainer: {
      styleOverrides: {
        root: {
          border: `1px solid ${appColors.border}`,
          borderRadius: appRadii.sm,
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        head: {
          fontWeight: 700,
          color: appColors.textSecondary,
          backgroundColor: appColors.surfaceAlt,
          paddingTop: 8,
          paddingBottom: 8,
        },
        root: {
          paddingTop: 8,
          paddingBottom: 8,
        },
      },
    },
  },
});
