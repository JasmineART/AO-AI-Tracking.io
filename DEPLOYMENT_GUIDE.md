# GitHub Pages Deployment Guide

## 🚀 Deployment Setup Complete!

Your OA AI Tracker app is now configured for deployment on GitHub Pages.

## 📋 Pre-Deployment Checklist

### 1. Update Firebase Configuration (IMPORTANT!)

Before deploying, you MUST update the Firebase configuration with your actual project credentials:

**Edit `/src/firebase.js`:**

```javascript
const firebaseConfig = {
  apiKey: "YOUR_ACTUAL_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};
```

### 2. Enable GitHub Pages in Repository Settings

1. Go to your GitHub repository: `https://github.com/JasmineART/AO-AI-Tracking.io`
2. Click **Settings** tab
3. Scroll to **Pages** section (left sidebar)
4. Under **Source**, select:
   - Source: **GitHub Actions**
5. Click **Save**

### 3. Add Firebase Authorized Domains

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Go to **Authentication** → **Settings** → **Authorized domains**
4. Add these domains:
   - `jasmineart.github.io`
   - `localhost` (for local development)
5. Click **Add domain**

## 🎯 Deployment Methods

### Method 1: Automatic Deployment (Recommended)

The app is configured with GitHub Actions for automatic deployment.

**Steps:**
1. Commit your changes:
   ```bash
   git add .
   git commit -m "Ready for deployment"
   git push origin main
   ```

2. GitHub Actions will automatically:
   - Install dependencies
   - Build the project
   - Deploy to GitHub Pages

3. Monitor deployment:
   - Go to **Actions** tab in GitHub
   - Watch the "Deploy to GitHub Pages" workflow
   - Deployment takes 2-5 minutes

4. Access your app at:
   ```
   https://JasmineART.github.io/AO-AI-Tracking.io/
   ```

### Method 2: Manual Deployment

If you prefer manual deployment:

```bash
# Build the project
npm run build

# Deploy to GitHub Pages
npm run deploy
```

This will:
1. Build the production bundle in `dist/` folder
2. Push the `dist/` folder to `gh-pages` branch
3. GitHub Pages will serve from that branch

## 🔧 Configuration Files

### Files Modified for GitHub Pages:

1. **`package.json`**
   - Added `homepage` field
   - Added `predeploy` and `deploy` scripts
   - Added `gh-pages` dev dependency

2. **`webpack.config.js`**
   - Added `publicPath` configuration
   - Configured for production/development modes
   - Added `.nojekyll` and `404.html` copying

3. **`src/App.js`**
   - Added `basename` prop to Router
   - Handles `/AO-AI-Tracking.io` path prefix

4. **`.github/workflows/deploy.yml`**
   - GitHub Actions workflow for automatic deployment
   - Triggers on push to main branch

5. **`index.html`**
   - Added SPA redirect script for GitHub Pages routing

6. **`public/404.html`**
   - Handles client-side routing on GitHub Pages

## 🌐 How GitHub Pages Deployment Works

### Build Process:
1. Webpack bundles all JavaScript into `bundle.js`
2. CSS is processed through PostCSS/Tailwind
3. HTML is generated with correct paths
4. Files are output to `dist/` folder

### Deployment Process:
1. `dist/` folder is pushed to `gh-pages` branch
2. GitHub Pages serves files from `gh-pages` branch
3. App is accessible at `https://JasmineART.github.io/AO-AI-Tracking.io/`

### Routing on GitHub Pages:
- GitHub Pages doesn't natively support SPA routing
- `404.html` redirects all routes to `index.html`
- React Router handles client-side routing
- `basename` prop ensures correct path handling

## 🔍 Troubleshooting

### Issue: "Page Not Found" on refresh

**Solution**: This should be handled by `404.html`, but if issues persist:
- Check that `404.html` is in the `dist/` folder
- Verify GitHub Pages is serving from `gh-pages` branch

### Issue: Blank page or "Cannot GET /"

**Solution**: 
- Check browser console for errors
- Verify `basename` in `App.js` matches repo name
- Ensure `publicPath` in webpack matches deployment path

### Issue: CSS not loading

**Solution**:
- Check `publicPath` in webpack.config.js
- Ensure Tailwind CSS import is correct: `@import "tailwindcss";`
- Rebuild: `npm run build`

### Issue: Firebase authentication not working

**Solution**:
- Add `jasmineart.github.io` to Firebase Authorized Domains
- Update Firebase config with real credentials
- Check Firebase Console for authentication errors

### Issue: Routes not working (404 errors)

**Solution**:
- Verify `404.html` exists in `dist/` folder
- Check that redirect script is in `index.html`
- Ensure `basename` prop is set correctly in Router

## 📊 Deployment Status

Check deployment status:
- **Actions tab**: `https://github.com/JasmineART/AO-AI-Tracking.io/actions`
- **Deployments**: `https://github.com/JasmineART/AO-AI-Tracking.io/deployments`

## 🎨 Local Testing of Production Build

Test the production build locally before deploying:

```bash
# Build production version
npm run build

# Serve the dist folder (install serve globally if needed)
npx serve dist

# Or use Python
cd dist
python -m http.server 8000
```

Access at: `http://localhost:8000`

## 🔐 Security Considerations

### Before Deploying:

1. **Firebase Config**: Use environment variables for sensitive data (optional)
2. **API Keys**: Restrict Firebase API keys to your domain
3. **Firestore Rules**: Ensure security rules are properly configured
4. **CORS**: Configure CORS if using external APIs

### Firebase Security Rules Example:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

## 📝 Post-Deployment Steps

After successful deployment:

1. ✅ Test all routes: `/`, `/login`, `/dashboard`, `/projects`, `/profile`
2. ✅ Test authentication: Google, GitHub, Email, Demo
3. ✅ Verify database operations (create user, save data)
4. ✅ Check responsive design on mobile
5. ✅ Test all features: Create project, view dashboard, etc.
6. ✅ Monitor Firebase Console for errors
7. ✅ Check browser console for JavaScript errors

## 🔄 Updating the Deployed App

To update your live app:

```bash
# Make your changes
git add .
git commit -m "Update: description of changes"
git push origin main
```

GitHub Actions will automatically rebuild and redeploy (2-5 minutes).

Or manually:
```bash
npm run deploy
```

## 📱 Custom Domain (Optional)

To use a custom domain:

1. Add `CNAME` file to `public/` folder:
   ```
   yourdomain.com
   ```

2. Update webpack to copy CNAME file

3. Configure DNS:
   - Add CNAME record pointing to `jasmineart.github.io`

4. Update Firebase authorized domains with your custom domain

## 🎯 Production URLs

- **Live App**: `https://JasmineART.github.io/AO-AI-Tracking.io/`
- **Repository**: `https://github.com/JasmineART/AO-AI-Tracking.io`
- **Actions**: `https://github.com/JasmineART/AO-AI-Tracking.io/actions`

## 💡 Performance Optimization

The production build includes:
- ✅ Code minification
- ✅ CSS optimization
- ✅ Tree shaking (unused code removal)
- ✅ Asset optimization
- ✅ Webpack production mode optimizations

## 📞 Support

If you encounter issues:
1. Check GitHub Actions logs for build errors
2. Review browser console for runtime errors
3. Verify Firebase configuration
4. Check GitHub Pages settings
5. Review this guide's troubleshooting section

---

## Quick Command Reference

```bash
# Local development
npm start

# Build for production
npm run build

# Deploy to GitHub Pages (manual)
npm run deploy

# Install dependencies
npm install

# Check for errors
npm run build
```

## 🎉 You're Ready to Deploy!

Your app is fully configured for GitHub Pages deployment. Just push to the main branch and GitHub Actions will handle the rest!

---

**Built with** ❤️ **for GitHub Pages deployment**
