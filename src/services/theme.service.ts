export type ThemeMode = 'light' | 'dark';

const STORAGE_KEY = 'allora.web.theme';

function detectSystemTheme(): ThemeMode {
  if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
    return 'dark';
  }

  return 'light';
}

export function readThemeMode(): ThemeMode {
  const stored = window.localStorage.getItem(STORAGE_KEY);

  if (stored === 'light' || stored === 'dark') {
    return stored;
  }

  return detectSystemTheme();
}

export function saveThemeMode(mode: ThemeMode) {
  window.localStorage.setItem(STORAGE_KEY, mode);
}

export function applyThemeMode(mode: ThemeMode) {
  document.documentElement.dataset.theme = mode;
  document.documentElement.style.colorScheme = mode;
}
