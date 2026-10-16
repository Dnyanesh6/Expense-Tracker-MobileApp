import { Platform } from 'react-native';

export const Colors = {
  light: {
    text: '#1F2733',
    textSecondary: '#6B7686',
    background: '#F6F7F9',
    card: '#FFFFFF',
    backgroundElement: '#EEF1F5',
    backgroundSelected: '#E3E8EF',
    border: '#E7EBF0',
    primary: '#5B699B',
    primaryText: '#FFFFFF',
    danger: '#C0564E',
    success: '#4E9A6B',
  },
  dark: {
    text: '#E7EAF0',
    textSecondary: '#9AA3B2',
    background: '#101318',
    card: '#181C23',
    backgroundElement: '#22272F',
    backgroundSelected: '#2C323C',
    border: '#252B34',
    primary: '#8B95CC',
    primaryText: '#141820',
    danger: '#D9837B',
    success: '#6BBE8C',
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;
export type Theme = typeof Colors.light;

export const Fonts = Platform.select({
  ios: { sans: 'system-ui', serif: 'ui-serif', rounded: 'ui-rounded', mono: 'ui-monospace' },
  default: { sans: 'normal', serif: 'serif', rounded: 'normal', mono: 'monospace' },
  web: {
    sans: 'var(--font-display)',
    serif: 'var(--font-serif)',
    rounded: 'var(--font-rounded)',
    mono: 'var(--font-mono)',
  },
});

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

export const Radius = { sm: 8, md: 12, lg: 16, pill: 999 } as const;

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;
