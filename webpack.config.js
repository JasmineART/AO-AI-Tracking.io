const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const webpack = require('webpack');

const isProduction = process.env.NODE_ENV === 'production';
const publicPath = isProduction ? '/AO-AI-Tracking.io/' : '/';

// Build a connect-src string that is strict in production but allows
// websocket schemes in development (codespaces / cloud-hosted dev servers
// use dynamic hostnames like "*.app.github.dev:3000" which would otherwise
// be blocked by a strict allowlist). Using the ws:/wss: scheme source in
// development lets the dev websocket connect without hardcoding container
// hostnames.
const connectSrc = isProduction
  ? "'self' https://*.firebaseio.com https://*.googleapis.com https://www.google-analytics.com wss://*.firebaseio.com"
  : "'self' https://*.firebaseio.com https://*.googleapis.com https://www.google-analytics.com wss://*.firebaseio.com wss: ws:";

module.exports = {
  entry: './index.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: isProduction ? 'bundle.[contenthash:8].js' : 'bundle.js',
    clean: true,
    publicPath: publicPath,
  },
  // Performance optimizations
  cache: {
    type: 'filesystem',
    buildDependencies: {
      config: [__filename],
    },
  },
  performance: {
    hints: isProduction ? 'warning' : false,
    maxAssetSize: 512000,
    maxEntrypointSize: 512000,
  },
  resolve: {
    extensions: ['.js', '.jsx'],
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            cacheDirectory: true, // Enable caching for faster rebuilds
            cacheCompression: false,
          }
        },
      },
      {
        test: /\.css$/,
        use: [
          'style-loader',
          'css-loader',
          'postcss-loader',
        ],
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './index.html',
    }),
    new webpack.DefinePlugin({
      // NODE_ENV is automatically set by webpack based on --mode flag, so we don't redefine it here
      'process.env.REACT_APP_FIREBASE_API_KEY': JSON.stringify(process.env.REACT_APP_FIREBASE_API_KEY || 'AIzaSyCzyBwFrRvqoMcspj7lIYpiR3nRa7Bcy00'),
      'process.env.REACT_APP_FIREBASE_AUTH_DOMAIN': JSON.stringify(process.env.REACT_APP_FIREBASE_AUTH_DOMAIN || 'oa-ai-dash.firebaseapp.com'),
      'process.env.REACT_APP_FIREBASE_DATABASE_URL': JSON.stringify(process.env.REACT_APP_FIREBASE_DATABASE_URL || 'https://oa-ai-dash-default-rtdb.firebaseio.com'),
      'process.env.REACT_APP_FIREBASE_PROJECT_ID': JSON.stringify(process.env.REACT_APP_FIREBASE_PROJECT_ID || 'oa-ai-dash'),
      'process.env.REACT_APP_FIREBASE_STORAGE_BUCKET': JSON.stringify(process.env.REACT_APP_FIREBASE_STORAGE_BUCKET || 'oa-ai-dash.firebasestorage.app'),
      'process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID': JSON.stringify(process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID || '1036320496271'),
      'process.env.REACT_APP_FIREBASE_APP_ID': JSON.stringify(process.env.REACT_APP_FIREBASE_APP_ID || '1:1036320496271:web:ef72456abd7bcf3f02aefa'),
      'process.env.REACT_APP_FIREBASE_MEASUREMENT_ID': JSON.stringify(process.env.REACT_APP_FIREBASE_MEASUREMENT_ID || 'G-GKETS43FTH'),
      'process.env.REACT_APP_RATE_LIMIT_MAX_ATTEMPTS': JSON.stringify(process.env.REACT_APP_RATE_LIMIT_MAX_ATTEMPTS || '5'),
      'process.env.REACT_APP_RATE_LIMIT_WINDOW_MS': JSON.stringify(process.env.REACT_APP_RATE_LIMIT_WINDOW_MS || '900000'),
      'process.env.REACT_APP_MAX_LOGIN_ATTEMPTS': JSON.stringify(process.env.REACT_APP_MAX_LOGIN_ATTEMPTS || '5'),
      'process.env.REACT_APP_LOGIN_TIMEOUT_MINUTES': JSON.stringify(process.env.REACT_APP_LOGIN_TIMEOUT_MINUTES || '15'),
      'process.env.REACT_APP_ENABLE_ANALYTICS': JSON.stringify(process.env.REACT_APP_ENABLE_ANALYTICS || 'false'),
    }),
    // Copy .nojekyll file for GitHub Pages
    {
      apply: (compiler) => {
        compiler.hooks.afterEmit.tap('AfterEmitPlugin', (compilation) => {
          const fs = require('fs');
          const nojekyllPath = path.resolve(__dirname, 'dist', '.nojekyll');
          fs.writeFileSync(nojekyllPath, '');
          
          // Copy 404.html for GitHub Pages SPA routing
          const html404Source = path.resolve(__dirname, 'public', '404.html');
          const html404Dest = path.resolve(__dirname, 'dist', '404.html');
          if (fs.existsSync(html404Source)) {
            fs.copyFileSync(html404Source, html404Dest);
          }
        });
      }
    }
  ],
  devServer: {
    static: './dist',
    hot: true,
    port: 3000,
    open: true,
    historyApiFallback: true,
    // Allow all hosts for GitHub Codespaces and similar cloud dev environments
    allowedHosts: 'all',
    // Configure websocket client for cloud environments
    client: {
      webSocketURL: 'auto://0.0.0.0:0/ws',
    },
    headers: {
      // Content Security Policy. connect-src is computed above to allow
      // websocket schemes in development environments where the dev server
      // is accessed via dynamic hostnames.
      'Content-Security-Policy': [
        "default-src 'self'",
        "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://www.google-analytics.com",
        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
        "font-src 'self' https://fonts.gstatic.com data:",
        "img-src 'self' data: https: blob:",
        `connect-src ${connectSrc}`,
        "frame-src 'self' https://*.firebaseapp.com",
        "object-src 'none'",
        "base-uri 'self'",
        "form-action 'self'",
        "frame-ancestors 'none'",
        "upgrade-insecure-requests"
      ].join('; '),

      // Security Headers
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'X-XSS-Protection': '1; mode=block',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'Permissions-Policy': 'geolocation=(), microphone=(), camera=()',

      // HTTPS Enforcement (in production)
      'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload'
    }
  },
  // Production optimizations
  optimization: {
    minimize: isProduction,
    splitChunks: isProduction ? {
      chunks: 'all',
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          priority: 10,
        },
      },
    } : false,
  },
  // Development options
  devtool: isProduction ? 'source-map' : 'eval-cheap-module-source-map',
  mode: isProduction ? 'production' : 'development',
};
