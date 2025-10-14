# 🚀 Quick Deploy Checklist

## Before First Deployment

### ✅ Step 1: Update Firebase Configuration
**FILE:** `/src/firebase.js`

Replace demo config with your actual Firebase project:
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

Get these values from:
- Firebase Console → Project Settings → General

---

### ✅ Step 2: Enable GitHub Pages
1. Go to: `https://github.com/JasmineART/AO-AI-Tracking.io/settings/pages`
2. Under **Source**, select: **GitHub Actions**
3. Click **Save**

---

### ✅ Step 3: Add Authorized Domain in Firebase
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. **Authentication** → **Settings** → **Authorized domains**
4. Click **Add domain**
5. Add: `jasmineart.github.io`

---

### ✅ Step 4: Deploy!

**Option A - Automatic (Recommended):**
```bash
git add .
git commit -m "Initial deployment"
git push origin main
```
✨ GitHub Actions will automatically build and deploy!

**Option B - Manual:**
```bash
npm run deploy
```

---

### ✅ Step 5: Verify Deployment

After 2-5 minutes, visit:
```
https://JasmineART.github.io/AO-AI-Tracking.io/
```

**Test these:**
- [ ] Homepage loads
- [ ] Login page accessible
- [ ] Google Sign-in works
- [ ] Demo login works
- [ ] Dashboard displays
- [ ] All routes work (refresh pages)

---

## Monitoring Deployment

**GitHub Actions:**
`https://github.com/JasmineART/AO-AI-Tracking.io/actions`

**Deployment Status:**
`https://github.com/JasmineART/AO-AI-Tracking.io/deployments`

---

## Quick Commands

```bash
# Test production build locally
npm run build

# Deploy manually
npm run deploy

# Start development server
npm start
```

---

## ⚠️ Common Issues

### Issue: Authentication doesn't work
**Fix:** Add `jasmineart.github.io` to Firebase Authorized Domains

### Issue: Blank page
**Fix:** Check browser console for errors, verify basename in App.js

### Issue: 404 on page refresh
**Fix:** Should be handled automatically by 404.html

---

## 🎉 That's It!

Your app is now live on GitHub Pages!

**Live URL:** https://JasmineART.github.io/AO-AI-Tracking.io/

Every push to `main` branch will automatically redeploy! 🚀
