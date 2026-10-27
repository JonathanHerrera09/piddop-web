import { useEffect, useState } from "react";

export function useTheme() {
  const [dark, setDark] = useState(false);
  useEffect(() => {
    setDark(document.documentElement.classList.contains("dark"));
  }, []);
  const toggle = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("piddop-theme", next ? "dark" : "light");
  };
  return { dark, toggle };
}

export const themeInitScript = `try{if(localStorage.getItem('piddop-theme')==='dark')document.documentElement.classList.add('dark')}catch(e){}`;
