import React, { createContext, useContext, useState , useEffect } from "react";
import { ThemeProvider as StyledThemeProvider, createGlobalStyle } from "styled-components";

type ThemeMode = "light" | "dark";

const ThemeContext = createContext({
  mode: "light" as ThemeMode,
  toggle: () => {},
});

export const useThemeMode = () => useContext(ThemeContext);

const GlobalStyle = createGlobalStyle<{ mode: ThemeMode }>`
  body {
    margin: 0;
    padding: 0;
    background: ${({ mode }) =>
      mode === "dark"
        ? "radial-gradient(circle at top, #1C4D8D, #0b0f14)"
        : "radial-gradient(circle at top, #eef2ff, #ffffff)"};
    color: ${({ mode }) => (mode === "dark" ? "#e5e7eb" : "#111827")};
    transition: background 0.4s ease, color 0.3s ease;
    font-family: Inter, system-ui, sans-serif;
  }
`;

const themes = {
  light: {
    bg: "#f8fafc",
    text: "#0f172a",
    glass: "rgba(255,255,255,0.7)",
    accent: "#6366f1",
    Title: "000",
    Name: "000",
    Link: "000" ,
  },
  dark: {
    bg: "#1C4D8D",
    text: "#e5e7eb",
    glass: "rgba(15,23,42,0.7)",
    accent: "#22d3ee",
    Title: "#e5e7eb",
    Name: "#e5e7eb",
    Link: "#e5e7eb" ,
  },
};
export const AppThemeProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const [mode, setMode] = useState<ThemeMode>('light');

  const toggle = () =>
    setMode((m) => (m === 'light' ? 'dark' : 'light'));

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', mode);
  }, [mode]);

  return (
    <ThemeContext.Provider value={{ mode, toggle }}>
      <StyledThemeProvider theme={themes[mode]}>
        <GlobalStyle mode={mode} />
        {children}
      </StyledThemeProvider>
    </ThemeContext.Provider>
  );
};