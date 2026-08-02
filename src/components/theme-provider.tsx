"use client";

import { useEffect } from "react";

function applyThemeFromSettings(s: any) {
  if (!s) return;

  let theme = s.theme;
  if (typeof theme === "string") {
    try { theme = JSON.parse(theme); } catch { theme = {}; }
  }
  const mode = theme?.mode || "light";
  if (mode === "dark") {
    document.documentElement.classList.add("dark");
  } else {
    document.documentElement.classList.remove("dark");
  }

  const color = theme?.primaryColor || "#be2ed6";
  document.documentElement.style.setProperty("--primary", color);
  // Generate shades
  const hex = color.replace("#", "");
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  const shade = (pct: number) => {
    const nr = Math.round(r + (255 - r) * pct);
    const ng = Math.round(g + (255 - g) * pct);
    const nb = Math.round(b + (255 - b) * pct);
    return `rgb(${nr}, ${ng}, ${nb})`;
  };
  const darkShade = (pct: number) => {
    const nr = Math.round(r * (1 - pct));
    const ng = Math.round(g * (1 - pct));
    const nb = Math.round(b * (1 - pct));
    return `rgb(${nr}, ${ng}, ${nb})`;
  };
  document.documentElement.style.setProperty("--color-primary-50", shade(0.95));
  document.documentElement.style.setProperty("--color-primary-100", shade(0.9));
  document.documentElement.style.setProperty("--color-primary-200", shade(0.8));
  document.documentElement.style.setProperty("--color-primary-300", shade(0.6));
  document.documentElement.style.setProperty("--color-primary-400", shade(0.3));
  document.documentElement.style.setProperty("--color-primary-500", color);
  document.documentElement.style.setProperty("--color-primary-600", darkShade(0.15));
  document.documentElement.style.setProperty("--color-primary-700", darkShade(0.3));
  document.documentElement.style.setProperty("--color-primary-800", darkShade(0.45));

  if (s.salonName) {
    document.title = s.salonName;
  }
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const load = () => {
      fetch("/api/settings")
        .then((r) => r.json())
        .then((data) => applyThemeFromSettings(data.settings))
        .catch(() => {});
    };
    load();
    window.addEventListener("settings-updated", load);
    return () => window.removeEventListener("settings-updated", load);
  }, []);

  return <>{children}</>;
}
