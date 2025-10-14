# OA AI Tracker - User Guide

## Table of Contents
1. [Getting Started](#getting-started)
2. [Demo Account](#demo-account)
3. [Authentication](#authentication)
4. [Dashboard Overview](#dashboard-overview)
5. [Managing Projects](#managing-projects)
6. [Data Integration](#data-integration)
7. [Understanding Metrics](#understanding-metrics)

## Getting Started

### First Time Setup
1. Navigate to `http://localhost:3000`
2. You'll see the home page with feature highlights
3. Choose to either:
   - Try the demo account (recommended for first-time users)
   - Sign up with your own account

### Navigation
The navigation bar provides access to:
- **Home**: Landing page with feature overview
- **Dashboard**: Main analytics and insights page
- **Projects**: Manage AI systems and automation projects
- **Profile**: User settings and preferences

## Demo Account

### Accessing Demo Mode
**Option 1:** Click "Try Demo Account" button on the login page
**Option 2:** Visit `/login?demo=true` directly

### What's Included
The demo account comes pre-loaded with:
- **5 Sample Projects** representing different use cases:
  1. Customer Service AI Chatbot (Customer Service Dept.)
  2. Predictive Maintenance System (Operations Dept.)
  3. Invoice Processing Automation (Finance Dept.)
  4. Inventory Optimization AI (Supply Chain Dept.)
  5. HR Recruitment Assistant (Human Resources Dept.)

- **100 Data Points** across 8 key metrics:
  - Data Quality Score
  - Model Accuracy
  - Infrastructure Readiness
  - Team Skill Level
  - Compliance Status
  - Budget Utilization
  - Timeline Adherence
  - Stakeholder Engagement

- **Historical Data** spanning 6 months for trend analysis

### Demo Capabilities
In demo mode, you can:
✅ View all dashboard visualizations
✅ Add new projects
✅ Edit existing projects
✅ Delete projects
✅ Explore all features
✅ Test data integration connectors

Note: Demo data is stored in browser localStorage and persists across sessions until cleared.

## Authentication

### Sign Up Methods

#### 1. Google OAuth
- Click "Sign up with Google"
- Select your Google account
- Authorize the application
- Redirected to dashboard

#### 2. GitHub OAuth
- Click "Sign up with GitHub"
- Authorize with GitHub credentials
- Grant application permissions
- Redirected to dashboard

#### 3. Email/Password
- Enter email address
- Create password (minimum 6 characters)
- Click "Create Account"
- Verify email (if enabled in Firebase)

### Sign In
- Use the same method you signed up with
- Or switch to email/password if previously configured

### Sign Out
- Click your profile icon or "Profile" in navigation
- Scroll to bottom and click "Sign Out"
- Or use "Logout" button in navigation bar

## Dashboard Overview

### Key Metrics Cards
Located at the top of the dashboard:

1. **Overall Readiness**: Enterprise-wide AI readiness average (0-100%)
2. **Total Projects**: Count of all projects (active + completed)
3. **In Progress**: Projects currently being developed
4. **Completed**: Successfully deployed projects

### Visualizations

#### 1. AI Readiness Trends (Line Chart)
- **X-axis**: Time (monthly)
- **Y-axis**: Score (0-100)
- **Lines**: 
  - Blue: Overall Readiness Score
  - Green: Data Quality Score
- **Purpose**: Track improvement over time

#### 2. Department Performance (Bar Chart)
- **X-axis**: Department names
- **Y-axis**: Average readiness score
- **Purpose**: Compare performance across departments
- **Colors**: Each department has unique color

#### 3. Project Status Distribution (Doughnut Chart)
- **Segments**:
  - Yellow: Planning
  - Blue: In Progress
  - Green: Completed
  - Gray: On Hold
- **Purpose**: Visualize project pipeline

#### 4. Project Type Distribution (Pie Chart)
- **Segments**:
  - Purple: AI System
  - Indigo: Automation
  - Green: Analytics
  - Yellow: Infrastructure
- **Purpose**: Show project category breakdown

### Department Breakdown Table
Shows detailed metrics for each department:
- Number of projects
- Average readiness score

### Recent Projects Table
Displays last 5 projects with:
- Project name
- Type
- Department
- Status badge
- Readiness progress bar

### Insights & Recommendations
AI-generated suggestions based on your data:
- **Insights**: Current observations and trends
- **Recommendations**: Actionable next steps

## Managing Projects

### Adding a New Project

1. Navigate to **Projects** page
2. Click **"+ Add New Project"** button
3. Fill in the form:
   - **Project Name**: Descriptive name (e.g., "Customer Service AI Chatbot")
   - **Type**: Select from:
     - AI System
     - Automation
     - Analytics
     - Infrastructure
   - **Status**: Choose current status:
     - Planning
     - In Progress
     - Completed
     - On Hold
   - **Data Source**: Select integration platform (AWS, Azure, etc.)
   - **Owner**: Name of project lead
   - **Department**: Organizational unit
   - **AI Readiness Score**: Drag slider (0-100)
4. Click **"Add Project"**

### Editing a Project

1. Find project card on Projects page
2. Click **"Edit"** button
3. Update any fields
4. Click **"Update Project"**

### Deleting a Project

1. Find project card on Projects page
2. Click **"Delete"** button
3. Confirm deletion in popup
4. Project and associated data points are removed

### Project Status Colors

- **Planning** (Yellow): Initial phase, requirements gathering
- **In Progress** (Blue): Active development/implementation
- **Completed** (Green): Successfully deployed and operational
- **On Hold** (Gray): Temporarily paused

### Readiness Score Guidelines

- **0-40%**: Early stages, significant work needed
- **41-60%**: Foundational elements in place, needs improvement
- **61-80%**: Good progress, refinement required
- **81-100%**: Production-ready or near completion

## Data Integration

### Supported Platforms

1. **☁️ AWS** - Amazon Web Services
2. **🔷 Azure** - Microsoft Azure
3. **📊 Google Sheets** - Google Sheets API
4. **📈 Excel** - Microsoft Excel
5. **☁️ Salesforce** - Salesforce CRM
6. **🐘 PostgreSQL** - PostgreSQL Database
7. **🍃 MongoDB** - MongoDB Database
8. **❄️ Snowflake** - Snowflake Data Warehouse
9. **🧱 Databricks** - Databricks Platform
10. **📊 Tableau** - Tableau Analytics

### How Integration Works

Currently, the app provides:
- **Simulated Connectors**: Each platform has a connector stub
- **Mock Data Generation**: Demo data simulates real integrations
- **Connection Testing**: Verify platform availability

### Future Integration Features
- Real-time data syncing
- Automated metric updates
- Custom data mapping
- API key management
- Webhook support

## Understanding Metrics

### Data Quality Score
- **What it measures**: Completeness, accuracy, and consistency of data
- **Good score**: 70%+
- **Impact**: Foundation for all AI initiatives

### Model Accuracy
- **What it measures**: Performance of AI/ML models
- **Good score**: 80%+
- **Impact**: Effectiveness of AI solutions

### Infrastructure Readiness
- **What it measures**: Technical infrastructure capacity
- **Good score**: 75%+
- **Impact**: Ability to scale AI deployments

### Team Skill Level
- **What it measures**: Staff competency and training
- **Good score**: 70%+
- **Impact**: Successful implementation and adoption

### Compliance Status
- **What it measures**: Regulatory and policy adherence
- **Good score**: 90%+
- **Impact**: Risk mitigation and legal compliance

### Budget Utilization
- **What it measures**: Financial resource allocation efficiency
- **Good score**: 60-85%
- **Impact**: ROI and cost management

### Timeline Adherence
- **What it measures**: Project schedule performance
- **Good score**: 80%+
- **Impact**: Timely delivery and resource planning

### Stakeholder Engagement
- **What it measures**: Organizational buy-in and support
- **Good score**: 75%+
- **Impact**: Adoption and change management success

## Tips & Best Practices

### Dashboard Usage
1. **Check daily**: Monitor overall readiness trends
2. **Review insights**: Read AI-generated recommendations
3. **Compare departments**: Identify high performers to learn from
4. **Track projects**: Ensure pipeline balance

### Project Management
1. **Update regularly**: Keep status and scores current
2. **Be realistic**: Accurate scores lead to better insights
3. **Document owners**: Ensure accountability
4. **Track completion**: Celebrate and share successes

### Improving Readiness Scores
1. **Focus on data quality first**: Strong foundation is critical
2. **Invest in training**: Skilled teams deliver better results
3. **Ensure compliance early**: Avoid costly delays later
4. **Engage stakeholders**: Build support throughout organization

### Using Demo Data
1. **Explore features**: Test all functionality risk-free
2. **Learn patterns**: Understand what good data looks like
3. **Plan your structure**: Design your project organization
4. **Test integrations**: Verify connector compatibility

## Troubleshooting

### Can't log in
- Clear browser cache and cookies
- Try incognito/private mode
- Use demo account as fallback

### Dashboard not loading
- Refresh the page
- Check browser console for errors
- Verify network connection

### Projects not saving
- Check localStorage space (demo mode)
- Verify Firebase connection (real mode)
- Try different browser

### Charts not displaying
- Ensure data exists for the metric
- Check browser JavaScript settings
- Update to latest browser version

## Keyboard Shortcuts

- `Ctrl/Cmd + K`: Focus search (future feature)
- `Esc`: Close modals
- `Tab`: Navigate form fields

## Getting Help

- Check this guide first
- Review README.md for technical details
- Open issue on GitHub repository
- Contact support team

---

Happy tracking! 🚀
