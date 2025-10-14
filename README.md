# OA AI Tracker - Enterprise AI Readiness Dashboard

A comprehensive React-based dashboard for tracking and measuring AI readiness across your organization.

## 🚀 Features

- **User Authentication**: Google OAuth, GitHub OAuth, and email/password authentication
- **Demo Mode**: Pre-populated demo account with 5 projects and 100+ data points
- **Project Management**: Create, edit, and track AI systems and automation projects
- **Multi-Source Data Integration**: Connect to 10+ popular data platforms:
  - AWS, Microsoft Azure, Google Sheets, Excel, Salesforce, PostgreSQL, MongoDB, Snowflake, Databricks, Tableau
- **AI-Generated Dashboards**: Comprehensive visualizations with real-time insights
- **Responsive Design**: Built with Tailwind CSS for mobile and desktop

## 🛠️ Installation & Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm start
```

The app will open at `http://localhost:3000`

## 🎮 Using the Demo Account

Click **"Try Demo Account"** on the login page to access:
- 5 pre-configured projects across different departments
- 100 AI readiness data points
- Sample dashboards with real-time visualizations
- Full CRUD operations

## 📊 Dashboard Features

The dashboard tracks AI readiness metrics including:
- Overall Readiness Score - Enterprise-wide average
- Data Quality Score - Source data completeness
- Department Performance - Team-level analytics
- Project Status Distribution - Pipeline visibility
- Trend Analysis - Historical performance tracking

## 🔐 Firebase Setup (Optional for Demo)

1. Create a Firebase project at [console.firebase.google.com](https://console.firebase.google.com)
2. Enable Authentication providers (Google, GitHub, Email/Password)
3. Update `src/firebase.js` with your credentials

## 📁 Project Structure

```
src/
├── components/      # Navbar, ProtectedRoute
├── contexts/        # AuthContext
├── pages/          # Home, Login, Dashboard, Projects, Profile
├── utils/          # demoData, dataIntegration
└── firebase.js     # Firebase config
```

## 🎯 Technologies

- React 19 + React Router
- Firebase (Auth + Firestore)
- Chart.js (Visualizations)
- Tailwind CSS (Styling)
- Webpack + Babel

## 📈 Demo Projects

1. **Customer Service AI Chatbot** - In Progress (78% ready)
2. **Predictive Maintenance System** - Completed (92% ready)
3. **Invoice Processing Automation** - In Progress (65% ready)
4. **Inventory Optimization AI** - Planning (45% ready)
5. **HR Recruitment Assistant** - In Progress (71% ready)

## 🚀 Build for Production

```bash
npm run build
```

Built files will be in the `dist/` directory.

---

Built for enterprise AI transformation 🤖
