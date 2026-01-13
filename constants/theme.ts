export type ThemeMode = 'dark-green' | 'dark-white' | 'light-green' | 'light-white';

export interface ThemeColors {
  bg: string;
  bgCard: string;
  border: string;
  borderHover: string;
  textPrimary: string;
  textSecondary: string;
  textDim: string;
  accent: string;
  bullishBg: string;
  bullishBorder: string;
  bullishText: string;
  bearishBg: string;
  bearishBorder: string;
  bearishText: string;
}

export const themes: Record<ThemeMode, ThemeColors> = {
  'dark-green': {
    bg: '#000000',
    bgCard: '#0a0a0a',
    border: '#003311',
    borderHover: '#00ff41',
    textPrimary: '#00ff41',
    textSecondary: '#00aa2b',
    textDim: '#008f11',
    accent: '#00ff41',
    bullishBg: 'rgba(0, 255, 65, 0.2)',
    bullishBorder: '#00ff41',
    bullishText: '#00ff41',
    bearishBg: 'rgba(239, 68, 68, 0.2)',
    bearishBorder: '#ef4444',
    bearishText: '#ef4444',
  },
  'dark-white': {
    bg: '#000000',
    bgCard: '#0a0a0a',
    border: '#333333',
    borderHover: '#ffffff',
    textPrimary: '#ffffff',
    textSecondary: '#cccccc',
    textDim: '#888888',
    accent: '#ffffff',
    bullishBg: 'rgba(0, 255, 65, 0.2)',
    bullishBorder: '#00ff41',
    bullishText: '#00ff41',
    bearishBg: 'rgba(239, 68, 68, 0.2)',
    bearishBorder: '#ef4444',
    bearishText: '#ef4444',
  },
  'light-green': {
    bg: '#ffffff',
    bgCard: '#f0fff0',
    border: '#c0e0c0',
    borderHover: '#00aa2b',
    textPrimary: '#00aa2b',
    textSecondary: '#006622',
    textDim: '#666666',
    accent: '#00aa2b',
    bullishBg: 'rgba(0, 170, 43, 0.15)',
    bullishBorder: '#00aa2b',
    bullishText: '#00aa2b',
    bearishBg: 'rgba(220, 38, 38, 0.15)',
    bearishBorder: '#dc2626',
    bearishText: '#dc2626',
  },
  'light-white': {
    bg: '#ffffff',
    bgCard: '#f9fafb',
    border: '#e5e7eb',
    borderHover: '#1a1a1a',
    textPrimary: '#1a1a1a',
    textSecondary: '#4a4a4a',
    textDim: '#999999',
    accent: '#1a1a1a',
    bullishBg: 'rgba(0, 170, 43, 0.15)',
    bullishBorder: '#00aa2b',
    bullishText: '#00aa2b',
    bearishBg: 'rgba(220, 38, 38, 0.15)',
    bearishBorder: '#dc2626',
    bearishText: '#dc2626',
  },
};

export const themeLabels: Record<ThemeMode, string> = {
  'dark-green': 'Matrix',
  'dark-white': 'Dark',
  'light-green': 'Light Green',
  'light-white': 'Classic',
};
