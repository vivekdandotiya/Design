import { create } from 'zustand';

interface ThemeState {
  isDark: boolean;
  toggle: () => void;
  initialize: () => void;
}

export const useThemeStore = create<ThemeState>((set, get) => ({
  isDark: false,

  toggle: () => {
    const newDark = !get().isDark;
    set({ isDark: newDark });
    localStorage.setItem('cw-theme', newDark ? 'dark' : 'light');
    if (newDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  },

  initialize: () => {
    const stored = localStorage.getItem('cw-theme');
    // Default to light mode unless explicitly saved as dark
    const isDark = stored === 'dark';
    set({ isDark });
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  },
}));
