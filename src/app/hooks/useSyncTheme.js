import { useEffect } from "react";

export function useSyncTheme(theme) {
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document
      .querySelector('meta[name="theme-color"]')
      ?.setAttribute("content", theme === "dark" ? "#111418" : "#f4f5f7");
  }, [theme]);
}
