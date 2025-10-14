# 🚀 Quick Start Guide - OA AI Tracker

## Your app is running! 🎉

### Access the Application
Open your browser and go to:
```
http://localhost:3000
```

## First Steps

### 1. Try the Demo Account (Recommended)
The easiest way to explore all features:

1. On the home page, click **"Try Demo"** button
   - OR click **"Get Started"** then **"Try Demo Account"**
   - OR go directly to: `http://localhost:3000/login?demo=true`

2. You'll be automatically logged in with:
   - **Email**: demo@oaitracker.com
   - **Pre-loaded data**: 5 projects, 100 data points

3. Explore the app:
   - **Dashboard**: View charts and metrics
   - **Projects**: Add, edit, or delete projects
   - **Profile**: See user settings

### 2. Create Your Own Account
If you want to use real authentication:

1. Click **"Get Started"** → **"Sign up"**
2. Choose one of:
   - **Google** (OAuth)
   - **GitHub** (OAuth)
   - **Email/Password** (create new account)

## Navigation Overview

```
┌─────────────────────────────────────┐
│  🤖 OA AI Tracker                   │
│  [Home] [Dashboard] [Projects] [Profile] [Logout]
└─────────────────────────────────────┘
```

### Available Pages

- **Home** (`/`) - Landing page with features
- **Login** (`/login`) - Authentication page
- **Dashboard** (`/dashboard`) - Analytics & charts (🔒 requires login)
- **Projects** (`/projects`) - Manage AI projects (🔒 requires login)
- **Profile** (`/profile`) - User settings (🔒 requires login)

## Features You Can Try

### On Dashboard Page
✅ View 4 key metric cards  
✅ See trend line chart (6 months)  
✅ Compare departments (bar chart)  
✅ Check project status (doughnut chart)  
✅ View project types (pie chart)  
✅ Read AI insights & recommendations  

### On Projects Page
✅ Add new project (click "+ Add New Project")  
✅ Edit existing project (click "Edit" on card)  
✅ Delete project (click "Delete" + confirm)  
✅ View readiness scores with progress bars  
✅ See project details (owner, department, status)  

### Demo Projects Included
1. **Customer Service AI Chatbot** - 78% ready
2. **Predictive Maintenance System** - 92% ready ✅
3. **Invoice Processing Automation** - 65% ready
4. **Inventory Optimization AI** - 45% ready
5. **HR Recruitment Assistant** - 71% ready

## Data Sources Available

When adding/editing projects, you can connect to:
- ☁️ AWS
- 🔷 Azure
- 📊 Google Sheets
- 📈 Excel
- ☁️ Salesforce
- 🐘 PostgreSQL
- 🍃 MongoDB
- ❄️ Snowflake
- 🧱 Databricks
- 📊 Tableau

## Common Tasks

### Add a New Project
1. Go to **Projects** page
2. Click **"+ Add New Project"**
3. Fill in:
   - Project name
   - Type (AI System, Automation, etc.)
   - Status (Planning, In Progress, etc.)
   - Data source
   - Owner name
   - Department
   - Readiness score (slider)
4. Click **"Add Project"**
5. View it on Dashboard and Projects page

### View Dashboard Insights
1. Go to **Dashboard** page
2. Scroll to bottom
3. Read **Insights** (blue box) - current observations
4. Read **Recommendations** (purple box) - action items

### Check Your Profile
1. Click **Profile** in navigation
2. View your user info
3. Toggle notification preferences
4. Click **"Sign Out"** when done

## Troubleshooting

### App won't load?
```bash
# Stop the server (Ctrl+C)
# Kill port 3000
lsof -ti:3000 | xargs kill -9

# Restart
npm start
```

### Can't see data in demo mode?
- Click **"Try Demo Account"** button again
- Or clear localStorage and reload:
  - Open browser console (F12)
  - Type: `localStorage.clear()`
  - Press Enter
  - Reload page

### Charts not showing?
- Ensure you're logged in
- Check that projects exist
- Refresh the page

## Next Steps

### To Customize
1. **Update Firebase Config**: Edit `src/firebase.js`
2. **Add Real Data Sources**: Implement actual API calls in `src/utils/dataIntegration.js`
3. **Modify Styles**: Edit Tailwind classes in component files
4. **Add Features**: Create new components in `src/`

### To Deploy
```bash
# Build for production
npm run build

# Files will be in dist/ folder
# Upload to any static hosting (Netlify, Vercel, etc.)
```

## Keyboard Shortcuts

- `Esc` - Close modal windows
- `Tab` - Navigate through form fields
- `Ctrl/Cmd + Click` - Open links in new tab

## Getting Help

📖 **Read Full Documentation**:
- `README.md` - Technical overview
- `USER_GUIDE.md` - Comprehensive user guide
- `PROJECT_SUMMARY.md` - Complete feature list

🐛 **Found a bug?**
- Check browser console (F12)
- Review error messages
- Check `webpack` terminal output

## Demo Account Info

```
Email: demo@oaitracker.com
User ID: demo-user-123
Password: Not required (auto-login)
Data: Stored in browser localStorage
```

## Have Fun! 🎊

Your AI Enterprise Readiness Dashboard is fully functional!

Explore, experiment, and enjoy tracking your AI journey! 🚀

---

**Quick Links:**
- App: http://localhost:3000
- Demo Login: http://localhost:3000/login?demo=true
- Dashboard: http://localhost:3000/dashboard
