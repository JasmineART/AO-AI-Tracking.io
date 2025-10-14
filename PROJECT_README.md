# OA AI Tracker - Enterprise AI Readiness Dashboard

A comprehensive React application for tracking and measuring AI and automation initiatives across your enterprise.

## Features

### 🎯 Core Functionality
- **AI Readiness Tracking**: Monitor enterprise-wide AI readiness scores and metrics
- **Project Management**: Add, edit, and track AI systems and automation projects
- **Multi-Source Data Integration**: Connect to 10+ popular data platforms including:
  - Amazon Web Services (AWS)
  - Microsoft Azure
  - Google Sheets
  - Microsoft Excel
  - Salesforce
  - PostgreSQL
  - MongoDB
  - Snowflake
  - Databricks
  - Tableau

### 📊 Dashboard Features
- **Real-time Metrics**: Overall readiness score, project counts, and status tracking
- **Trend Analysis**: Visualize AI readiness trends over time with interactive charts
- **Department Analytics**: Compare performance across different departments
- **Project Distribution**: View project status and type breakdowns
- **AI-Generated Insights**: Automatic recommendations based on your data

### 🔐 Authentication
- **Google OAuth**: Sign in with your Google account
- **GitHub OAuth**: Sign in with your GitHub account
- **Email/Password**: Traditional email-based authentication
- **Demo Mode**: Try the app with pre-populated sample data

### 👤 User Features
- **Profile Management**: View and manage your account settings
- **Personalized Dashboard**: Custom views based on your projects
- **Notifications**: Email alerts and weekly reports (configurable)

## Demo Account

The application includes a fully functional demo account with:
- ✅ 5 pre-populated projects across different departments
- ✅ 100 data points for comprehensive metrics
- ✅ AI-generated dashboards and visualizations
- ✅ Sample data from various data sources

### Accessing the Demo

1. Click "Try Demo" on the home page
2. Or click "Try Demo Account" on the login page
3. Or navigate to `/login?demo=true`

The demo account includes sample projects from:
- Customer Service
- Operations
- Finance
- Supply Chain
- Human Resources

## Installation

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Setup

1. Clone the repository:
```bash
git clone <repository-url>
cd AO-AI-Tracking.io
```

2. Install dependencies:
```bash
npm install
```

3. Configure Firebase (Optional - for production):
   - Create a Firebase project at https://console.firebase.google.com
   - Enable Google and GitHub authentication providers
   - Update `src/firebase.js` with your Firebase credentials

4. Start the development server:
```bash
npm start
```

The application will open at `http://localhost:3000`

## Building for Production

```bash
npm run build
```

The production-ready files will be in the `dist` directory.

## Project Structure

```
AO-AI-Tracking.io/
├── src/
│   ├── App.js                 # Main application component with routing
│   ├── firebase.js            # Firebase configuration
│   ├── index.css              # Tailwind CSS imports
│   ├── components/
│   │   ├── Navbar.js          # Navigation bar component
│   │   └── ProtectedRoute.js  # Route protection wrapper
│   ├── contexts/
│   │   └── AuthContext.js     # Authentication context provider
│   ├── pages/
│   │   ├── Home.js            # Landing page
│   │   ├── Login.js           # Login/signup page
│   │   ├── Dashboard.js       # Main dashboard with charts
│   │   ├── Projects.js        # Project management page
│   │   └── Profile.js         # User profile page
│   └── utils/
│       ├── demoData.js        # Demo data generation
│       └── dataIntegration.js # Data source connectors
├── index.js                   # Application entry point
├── index.html                 # HTML template
├── webpack.config.js          # Webpack configuration
├── tailwind.config.js         # Tailwind CSS configuration
└── package.json               # Project dependencies
```

## Technologies Used

- **React 19**: Modern UI library
- **React Router**: Client-side routing
- **Firebase**: Authentication and backend services
- **Chart.js & react-chartjs-2**: Data visualization
- **Tailwind CSS**: Utility-first CSS framework
- **Webpack**: Module bundler
- **Babel**: JavaScript transpiler

## Available Scripts

- `npm start`: Start development server
- `npm run build`: Build for production

## Features in Detail

### Dashboard Visualizations

1. **Trend Chart**: Line chart showing AI readiness and data quality over time
2. **Department Performance**: Bar chart comparing average readiness by department
3. **Project Status**: Doughnut chart showing distribution of project statuses
4. **Project Types**: Pie chart showing breakdown of project types
5. **Department Breakdown**: Detailed metrics for each department
6. **Recent Projects Table**: Quick overview of latest projects

### Project Management

- Add new AI/automation projects
- Edit existing projects
- Delete projects
- Track multiple attributes:
  - Project name and type
  - Status (Planning, In Progress, Completed, On Hold)
  - Data source connection
  - Owner and department
  - AI readiness score
  - Start date

### Data Integration

The application provides simulated connectors for:
- Cloud platforms (AWS, Azure)
- Database systems (PostgreSQL, MongoDB, Snowflake)
- Business intelligence tools (Tableau, Databricks)
- Productivity tools (Google Sheets, Excel)
- CRM systems (Salesforce)

## Demo Data

The demo account includes:

### 5 Sample Projects:
1. Customer Service AI Chatbot (In Progress - 78% ready)
2. Predictive Maintenance System (Completed - 92% ready)
3. Invoice Processing Automation (In Progress - 65% ready)
4. Inventory Optimization AI (Planning - 45% ready)
5. HR Recruitment Assistant (In Progress - 71% ready)

### 100 Data Points across 8 metrics:
- Data Quality Score
- Model Accuracy
- Infrastructure Readiness
- Team Skill Level
- Compliance Status
- Budget Utilization
- Timeline Adherence
- Stakeholder Engagement

## Future Enhancements

- Real data integration with external APIs
- Advanced AI-powered recommendations
- Export reports to PDF/Excel
- Team collaboration features
- Custom metric definitions
- Mobile app version

## License

See LICENSE file for details.

## Support

For issues or questions, please open an issue in the repository.
