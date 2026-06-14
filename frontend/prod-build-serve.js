/**
 * Production build server with API proxy
 * Serves the production build from the build/ folder
 * Proxies /api requests to the backend API
 *
 * Usage: node prod-build-serve.js
 */

const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const path = require('path');

const app = express();
const PORT = 3000;
const BACKEND_PORT = process.env.BACKEND_PORT || 3100;

// Proxy /api requests to backend
app.use(
  '/api',
  createProxyMiddleware({
    target: `http://localhost:${BACKEND_PORT}`,
    pathRewrite: { '^/api': '' },
    changeOrigin: true,
  })
);

// Serve static files from production build
app.use(express.static(path.join(__dirname, 'build')));

// SPA fallback: serve index.html for all non-file routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Production build server running on http://localhost:${PORT}`);
  console.log(`API requests proxied to http://localhost:${BACKEND_PORT}`);
});
