import { Platform } from 'react-native';

/** Skiitrope brand palette, mirroring the website's CSS variables. */
export const Colors = {
  light: {
    text: '#111318',
    background: '#ffffff',
    backgroundElement: '#F0F0F3',
    backgroundSelected: '#E0E1E6',
    textSecondary: '#60646C',
    red: '#e8112d',
    redDark: '#c20e26',
    blue: '#2f6bff',
    blueDark: '#1f4fd8',
    border: '#E0E1E6',
    success: '#1f8a4c',
  },
  dark: {
    text: '#ffffff',
    background: '#0e0f12',
    backgroundElement: '#1b1d21',
    backgroundSelected: '#2E3135',
    textSecondary: '#B0B4BA',
    red: '#ff4d64',
    redDark: '#e8112d',
    blue: '#5c8bff',
    blueDark: '#2f6bff',
    border: '#2E3135',
    success: '#2fbf71',
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

export const Fonts = Platform.select({
  ios: {
    sans: 'system-ui',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
});

export const Spacing = {
  xs: 4,
  s: 8,
  m: 16,
  l: 24,
  xl: 32,
} as const;
