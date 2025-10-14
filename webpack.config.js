const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const webpack = require('webpack');

const isProduction = process.env.NODE_ENV === 'production';
const publicPath = isProduction ? '/AO-AI-Tracking.io/' : '/';

module.exports = {
  entry: './index.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js',
    clean: true,
    publicPath: publicPath,
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
      __app_id: JSON.stringify('oa-sol-default-app'),
      __firebase_config: JSON.stringify(JSON.stringify({
        apiKey: "AIzaSyDemoKey123456789",
        authDomain: "demo-project.firebaseapp.com",
        projectId: "demo-project",
        storageBucket: "demo-project.appspot.com",
        messagingSenderId: "123456789",
        appId: "1:123456789:web:abcdef123456"
      })),
      __initial_auth_token: JSON.stringify(null),
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
  },
};
