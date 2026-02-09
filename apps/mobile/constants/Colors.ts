/**
 * Folio Design System Colors
 * Consistent color palette for light and dark themes
 */

const palette = {
  // Primary brand colors
  primary: '#6C63FF',
  primaryDark: '#5A52D5',
  primaryLight: '#8B85FF',

  // Secondary accent
  secondary: '#03DAC6',
  secondaryDark: '#018786',

  // Neutral palette
  white: '#FFFFFF',
  black: '#000000',
  gray50: '#FAFAFA',
  gray100: '#F5F5F5',
  gray200: '#EEEEEE',
  gray300: '#E0E0E0',
  gray400: '#BDBDBD',
  gray500: '#9E9E9E',
  gray600: '#757575',
  gray700: '#616161',
  gray800: '#424242',
  gray900: '#212121',

  // Dark mode surfaces
  darkSurface: '#121212',
  darkSurface1: '#1E1E1E',
  darkSurface2: '#232323',
  darkSurface3: '#252525',
  darkSurface4: '#272727',

  // Semantic
  error: '#EF4444',
  errorDark: '#FF453A',
  success: '#10B981',
  successDark: '#34D399',
  warning: '#F59E0B',
  warningDark: '#FBBF24',
  info: '#3B82F6',
  infoDark: '#60A5FA',
};

export default {
  light: {
    text: palette.gray900,
    textSecondary: palette.gray600,
    background: palette.white,
    surface: palette.gray50,
    surfaceVariant: palette.gray100,
    tint: palette.primary,
    primary: palette.primary,
    primaryContainer: '#EDE7F6',
    tabIconDefault: palette.gray400,
    tabIconSelected: palette.primary,
    tabBackground: palette.white,
    border: palette.gray200,
    borderLight: palette.gray100,
    notification: palette.error,
    error: palette.error,
    success: palette.success,
    warning: palette.warning,
    info: palette.info,
    icon: palette.gray700,
    iconSecondary: palette.gray500,
    card: palette.white,
    cardBorder: palette.gray200,
    overlay: 'rgba(0, 0, 0, 0.5)',
    shimmer: palette.gray200,
    inputBackground: palette.gray50,
    divider: palette.gray200,
    badge: palette.error,
  },
  dark: {
    text: palette.gray100,
    textSecondary: palette.gray400,
    background: palette.darkSurface,
    surface: palette.darkSurface1,
    surfaceVariant: palette.darkSurface2,
    tint: palette.primaryLight,
    primary: palette.primaryLight,
    primaryContainer: '#311B92',
    tabIconDefault: palette.gray500,
    tabIconSelected: palette.primaryLight,
    tabBackground: palette.darkSurface1,
    border: palette.darkSurface4,
    borderLight: palette.darkSurface3,
    notification: palette.errorDark,
    error: palette.errorDark,
    success: palette.successDark,
    warning: palette.warningDark,
    info: palette.infoDark,
    icon: palette.gray300,
    iconSecondary: palette.gray500,
    card: palette.darkSurface2,
    cardBorder: palette.darkSurface4,
    overlay: 'rgba(0, 0, 0, 0.7)',
    shimmer: palette.darkSurface3,
    inputBackground: palette.darkSurface2,
    divider: palette.darkSurface4,
    badge: palette.errorDark,
  },
  palette,
};
