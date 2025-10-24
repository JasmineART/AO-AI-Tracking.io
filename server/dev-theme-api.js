const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.DEV_THEME_PORT || 4000;
app.use(express.json());

app.get('/api/theme', (req, res) => {
  // Read a dev-theme.json file at project root if present
  try {
    const p = path.resolve(__dirname, '..', 'dev-theme.json');
    if (fs.existsSync(p)) {
      const raw = fs.readFileSync(p, 'utf8');
      const cfg = JSON.parse(raw);
      return res.json({ theme: cfg.theme || 'light' });
    }
  } catch (e) {
    // ignore and fallthrough
  }
  // default
  res.json({ theme: 'light' });
});

// Allow POST to update the dev-theme.json file (dev only)
app.post('/api/theme', (req, res) => {
  try {
    const { theme } = req.body || {};
    if (!theme || (theme !== 'light' && theme !== 'dark')) {
      return res.status(400).json({ error: 'Invalid theme value' });
    }
    const p = path.resolve(__dirname, '..', 'dev-theme.json');
    fs.writeFileSync(p, JSON.stringify({ theme }, null, 2), 'utf8');
    return res.json({ theme });
  } catch (e) {
    return res.status(500).json({ error: 'Failed to update theme' });
  }
});

app.listen(PORT, () => {
  console.log(`Dev theme API listening on http://localhost:${PORT}/api/theme`);
});
