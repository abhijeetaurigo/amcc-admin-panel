import { alpha } from '@mui/material/styles';

export const appColors = {
  primary: '#015F74',
  primaryDark: '#0B3B3F',
  primarySoft: '#E1F3F5',
  secondary: '#424242',
  background: '#F5F7FA',
  surface: '#FFFFFF',
  surfaceAlt: '#F1F6F9',
  border: '#DCE9FE',
  textPrimary: '#182030',
  textSecondary: '#586175',
  success: '#45A429',
  warning: '#D97706',
  error: '#B51A00',
  info: '#297EC8',
} as const;

export const appGradients = {
  hero: `linear-gradient(135deg, ${appColors.primaryDark} 0%, ${appColors.primary} 48%, #297EC8 100%)`,
  soft: `linear-gradient(180deg, ${alpha(appColors.primarySoft, 0.95)} 0%, ${alpha(
    appColors.background,
    0.98,
  )} 100%)`,
} as const;

export const appShadows = {
  card: '0 10px 30px rgba(24, 32, 48, 0.08)',
  lift: '0 16px 38px rgba(24, 32, 48, 0.14)',
} as const;

export const appRadii = {
  sm: 6,
  md: 8,
  lg: 10,
} as const;
