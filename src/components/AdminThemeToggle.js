import React, { useState, useEffect } from 'react';

const AdminThemeToggle = () => {
  const [theme, setTheme] = useState('light');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;
    const fetchTheme = async () => {
      try {
        // Try proxied endpoint first, fall back to direct dev API if needed
        let res = await fetch('/api/theme');
        let data = null;
        if (res.ok) {
          const ct = res.headers.get('content-type') || '';
          if (ct.includes('application/json')) {
            data = await res.json();
          }
        }
        if (!data) {
          // fallback
          res = await fetch('http://localhost:4000/api/theme');
          if (res.ok) data = await res.json();
        }
        if (!mounted) return;
        if (data) setTheme(data.theme || 'light');
      } catch (e) {
        // ignore
      }
    };
    fetchTheme();
    return () => { mounted = false; };
  }, []);

  const setServerTheme = async (t) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/theme', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ theme: t })
      });
      if (!res.ok) throw new Error('Failed to update');
      const data = await res.json();
      setTheme(data.theme || t);
      // Broadcast change so the client can react immediately
      try {
        window.dispatchEvent(new CustomEvent('server-theme-changed', { detail: { theme: data.theme || t } }));
      } catch (e) {
        // ignore if dispatch fails in tests
      }
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-3" role="group" aria-label="Admin theme toggle">
      <div className="text-sm text-gray-600">Admin Theme</div>
      <button
        onClick={() => setServerTheme('light')}
        disabled={loading}
        aria-pressed={theme === 'light'}
        aria-label="Set server theme to light"
        className={`px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-indigo-400 ${theme === 'light' ? 'bg-white text-gray-900' : 'bg-gray-50 text-gray-700'}`}
      >
        Light
      </button>
      <button
        onClick={() => setServerTheme('dark')}
        disabled={loading}
        aria-pressed={theme === 'dark'}
        aria-label="Set server theme to dark"
        className={`px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-indigo-400 ${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-700'}`}
      >
        Dark
      </button>
      {error && <div className="text-xs text-red-500">{error}</div>}
    </div>
  );
};

export default AdminThemeToggle;
