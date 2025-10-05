import { useEffect, useMemo } from "react";

export function useTelegram() {
  const tg = useMemo(() => window?.Telegram?.WebApp ?? null, []);

  useEffect(() => {
    if (!tg) return;

    try {
      tg.ready();
      tg.expand?.();
    } catch {}

    const onThemeChanged = () => {
      const root = document.documentElement;
      const css = getComputedStyle(root);
      root.style.setProperty("--app-bg", css.getPropertyValue("--tg-theme-bg-color") || "#ffffff");
      root.style.setProperty("--app-text", css.getPropertyValue("--tg-theme-text-color") || "#0f0f0f");
      root.style.setProperty("--app-hint", css.getPropertyValue("--tg-theme-hint-color") || "#8e8e93");
      root.style.setProperty("--app-link", css.getPropertyValue("--tg-theme-link-color") || "#2481cc");
      root.style.setProperty("--app-button", css.getPropertyValue("--tg-theme-button-color") || "#2481cc");
      root.style.setProperty("--app-button-text", css.getPropertyValue("--tg-theme-button-text-color") || "#ffffff");
      root.style.setProperty("--app-secondary-bg", css.getPropertyValue("--tg-theme-secondary-bg-color") || "#f2f2f2");
    };

    tg.onEvent?.("themeChanged", onThemeChanged);
    onThemeChanged();

    return () => {
      tg.offEvent?.("themeChanged", onThemeChanged);
    };
  }, [tg]);

  return {
    tg,
    MainButton: tg?.MainButton ?? null,
    BackButton: tg?.BackButton ?? null,
    themeParams: tg?.themeParams ?? {},
  };
}