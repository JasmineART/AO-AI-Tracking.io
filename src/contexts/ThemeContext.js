import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  // Default to light unless localStorage explicitly set to dark.
  // This ensures the initial design is the light UI.
  const [isDark, setIsDark] = useState(() => localStorage.getItem('theme') === 'dark');

  useEffect(() => {
    // Save preference to localStorage
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
    
    // Apply theme to document root
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  // On mount attempt to fetch a server-side override for development.
  // A small dev API can respond with { theme: 'dark' } to force dark mode for testing.
  useEffect(() => {
    let mounted = true;
    const fetchServerTheme = async () => {
      try {
        // Try proxied endpoint first, fall back to direct dev API if needed
        let res = await fetch('/api/theme');
        let data = null;
        if (res.ok) {
          const ct = res.headers.get('content-type') || '';
          if (ct.includes('application/json')) data = await res.json();
        }
        if (!data) {
          res = await fetch('http://localhost:4000/api/theme');
          if (res.ok) data = await res.json();
        }
        if (data && data.theme) {
          setIsDark(data.theme === 'dark');
        }
      } catch (e) {
        // ignore network errors (API optional in production)
      }
    };
    fetchServerTheme();
    return () => { mounted = false; };
  }, []);

  // Listen for immediate server-side theme changes (dispatched by AdminThemeToggle)
  useEffect(() => {
    const handler = (e) => {
      try {
        const t = e?.detail?.theme;
        if (t === 'dark' || t === 'light') {
          setIsDark(t === 'dark');
        }
      } catch (err) {
        // ignore
      }
    };
    window.addEventListener('server-theme-changed', handler);
    return () => window.removeEventListener('server-theme-changed', handler);
  }, []);

  const toggleTheme = () => {
    setIsDark(prev => !prev);
  };

  const value = {
    isDark,
    toggleTheme,
    theme: isDark ? 'dark' : 'light',
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};
