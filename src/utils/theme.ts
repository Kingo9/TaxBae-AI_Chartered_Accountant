import { Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

// Modern color palette with enhanced accessibility
export const colors = {
  // Primary brand colors
  primary: '#6366F1', // Indigo - trust & reliability
  primaryLight: '#A5B4FC',
  primaryDark: '#4F46E5',
  primaryMuted: '#F0F4FF', // Very light primary for subtle backgrounds
  
  // Secondary colors
  secondary: '#10B981', // Emerald - growth & success
  secondaryLight: '#6EE7B7',
  secondaryDark: '#047857',
  secondaryMuted: '#F0FDF9',
  
  // Accent colors
  accent: '#F59E0B', // Amber - attention & highlights
  accentLight: '#FCD34D',
  accentDark: '#D97706',
  accentMuted: '#FFFBEB',
  
  // Background colors with improved contrast
  background: '#F8FAFC', // Main background
  backgroundLight: '#FFFFFF', // Cards & surfaces
  backgroundDark: '#F1F5F9', // Subtle contrast
  backgroundMuted: '#F8FAFC', // Alternative background
  
  // Enhanced text colors for better readability
  textPrimary: '#1E293B', // High contrast text
  textSecondary: '#64748B', // Medium contrast text
  textLight: '#94A3B8', // Low contrast text
  textWhite: '#FFFFFF',
  textMuted: '#CBD5E1', // Very light text for disabled states
  
  // Status colors with consistent naming
  success: '#10B981', // Green for positive actions
  successLight: '#D1FAE5',
  warning: '#F59E0B', // Orange for warnings
  warningLight: '#FEF3C7',
  error: '#EF4444', // Red for errors & destructive actions
  errorLight: '#FEE2E2',
  info: '#3B82F6', // Blue for informational content
  infoLight: '#DBEAFE',
  
  // Border and divider colors
  border: '#E2E8F0',
  borderLight: '#F1F5F9',
  divider: '#E2E8F0',
  
  // Semantic colors for financial data
  income: '#10B981', // Green for income
  expense: '#EF4444', // Red for expenses
  investment: '#8B5CF6', // Purple for investments
  savings: '#06B6D4', // Cyan for savings
  neutral: '#6B7280', // Gray for neutral data
  
  // Interactive states
  interactive: {
    hover: 'rgba(99, 102, 241, 0.08)',
    pressed: 'rgba(99, 102, 241, 0.12)',
    focus: 'rgba(99, 102, 241, 0.16)',
    disabled: '#F1F5F9',
  },
  
  // Enhanced chart colors with better accessibility
  chartColors: [
    '#6366F1', // Primary indigo
    '#10B981', // Success green
    '#F59E0B', // Warning amber
    '#EF4444', // Error red
    '#8B5CF6', // Purple
    '#06B6D4', // Cyan
    '#84CC16', // Lime
    '#F97316', // Orange
    '#EC4899', // Pink
    '#14B8A6'  // Teal
  ],
  
  // Gradient definitions for modern UI
  gradients: {
    primary: ['#6366F1', '#A5B4FC'],
    secondary: ['#10B981', '#6EE7B7'],
    accent: ['#F59E0B', '#FCD34D'],
    success: ['#10B981', '#34D399'],
    warm: ['#F59E0B', '#F97316'],
    cool: ['#3B82F6', '#06B6D4'],
  }
};

// Enhanced typography with better hierarchy
export const typography = {
  // Font sizes with improved scale
  fontSize: {
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 30,
    '4xl': 36,
    '5xl': 42,
    '6xl': 48,
  },
  
  // Font weights
  fontWeight: {
    light: '300' as const,
    normal: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
    extrabold: '800' as const,
  },
  
  // Line heights for better readability
  lineHeight: {
    none: 1,
    tight: 1.25,
    snug: 1.375,
    normal: 1.5,
    relaxed: 1.625,
    loose: 2,
  },
  
  // Text styles for common use cases
  textStyles: {
    h1: {
      fontSize: 30,
      fontWeight: '700' as const,
      lineHeight: 1.2,
    },
    h2: {
      fontSize: 24,
      fontWeight: '600' as const,
      lineHeight: 1.25,
    },
    h3: {
      fontSize: 20,
      fontWeight: '600' as const,
      lineHeight: 1.375,
    },
    body: {
      fontSize: 16,
      fontWeight: '400' as const,
      lineHeight: 1.5,
    },
    caption: {
      fontSize: 14,
      fontWeight: '400' as const,
      lineHeight: 1.375,
    },
    small: {
      fontSize: 12,
      fontWeight: '400' as const,
      lineHeight: 1.25,
    },
  },
};

// Spacing
export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  '2xl': 48,
  '3xl': 64,
};

// Border radius
export const borderRadius = {
  none: 0,
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  '2xl': 24,
  full: 9999,
};

// Shadows
export const shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
  },
  xl: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 12,
  },
};

// Screen dimensions
export const dimensions = {
  width,
  height,
  isSmallScreen: width < 375,
  isLargeScreen: width > 414,
};

// Enhanced common component styles with modern patterns
export const commonStyles = {
  // Layout containers
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  
  safeContainer: {
    flex: 1,
    backgroundColor: colors.background,
  },
  
  screenContainer: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: spacing.lg,
  },
  
  // Flexbox utilities
  centered: {
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
  },
  
  row: {
    flexDirection: 'row' as const,
  },
  
  column: {
    flexDirection: 'column' as const,
  },
  
  spaceBetween: {
    justifyContent: 'space-between' as const,
  },
  
  spaceAround: {
    justifyContent: 'space-around' as const,
  },
  
  alignCenter: {
    alignItems: 'center' as const,
  },
  
  // Card variations
  card: {
    backgroundColor: colors.backgroundLight,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    ...shadows.md,
  },
  
  cardMinimal: {
    backgroundColor: colors.backgroundLight,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    ...shadows.sm,
  },
  
  cardElevated: {
    backgroundColor: colors.backgroundLight,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    ...shadows.lg,
  },
  
  // Input variations
  input: {
    backgroundColor: colors.backgroundLight,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    fontSize: typography.fontSize.base,
    color: colors.textPrimary,
    minHeight: 48, // Improved touch target
  },
  
  inputFocused: {
    borderColor: colors.primary,
    borderWidth: 2,
  },
  
  inputError: {
    borderColor: colors.error,
  },
  
  // Button variations
  button: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    minHeight: 48, // Improved touch target
    ...shadows.sm,
  },
  
  buttonSecondary: {
    backgroundColor: colors.backgroundLight,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    minHeight: 48,
  },
  
  buttonOutline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    minHeight: 48,
  },
  
  buttonText: {
    color: colors.textWhite,
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
  },
  
  buttonTextSecondary: {
    color: colors.textPrimary,
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.medium,
  },
  
  buttonTextOutline: {
    color: colors.primary,
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
  },
  
  // List styles
  listItem: {
    backgroundColor: colors.backgroundLight,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginVertical: spacing.xs,
    ...shadows.sm,
  },
  
  listSeparator: {
    height: 1,
    backgroundColor: colors.divider,
  },
  
  // Loading states
  loadingOverlay: {
    position: 'absolute' as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    zIndex: 1000,
  },
  
  // Badge styles
  badge: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  
  badgeText: {
    color: colors.textWhite,
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.semibold,
  },
};

export default {
  colors,
  typography,
  spacing,
  borderRadius,
  shadows,
  dimensions,
  commonStyles,
};
