import { useCallback, useEffect, useState } from "react";

const THEME_STORAGE_KEY = "piddop-theme";
type Theme = "dark" | "light";

function savedTheme(): Theme {
  if (typeof window === "undefined") return "light";
  return window.localStorage.getItem(THEME_STORAGE_KEY) === "dark" ? "dark" : "light";
}

function applyTheme(theme: Theme) {
  document.documentElement.classList.toggle("dark", theme === "dark");
}

export function useTheme() {
  const [theme, setTheme] = useState<Theme>(savedTheme);

  useEffect(() => {
    const persistedTheme = savedTheme();
    setTheme(persistedTheme);
    applyTheme(persistedTheme);
  }, []);

  const toggle = useCallback(() => {
    setTheme((currentTheme) => {
      const nextTheme: Theme = currentTheme === "dark" ? "light" : "dark";
      applyTheme(nextTheme);
      window.localStorage.setItem(THEME_STORAGE_KEY, nextTheme);
      return nextTheme;
    });
  }, []);

  return { dark: theme === "dark", toggle };
}

export const themeInitScript = `try{document.documentElement.classList.toggle('dark',localStorage.getItem('${THEME_STORAGE_KEY}')==='dark')}catch(e){}`;
