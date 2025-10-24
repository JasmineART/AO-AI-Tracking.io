# 📘 Quick User Guide: Adding Data Source Connections

## How to Configure Data Sources for Your Project

### Step 1: Create or Edit a Project
1. Go to the **Projects** page
2. Click **"+ Add New Project"** (or click **"Edit"** on an existing project)

### Step 2: Fill in Basic Project Details
- **Project Name**: Enter a descriptive name
- **Type**: Select AI System, Automation, Analytics, or Infrastructure
- **Status**: Choose Planning, In Progress, Completed, or On Hold
- **Owner**: Enter the project owner's name
- **Department**: Enter the department name
- **AI Readiness Score**: Adjust the slider (0-100)

### Step 3: Configure Data Source Connections

You'll see a new section titled **"🔌 Data Source Connections"** with a progress indicator showing "X / 10 Sources"

#### To Add a Data Source:

1. **Select Data Source Type**
   - Choose from 15+ options: AWS, Azure, Google Sheets, PostgreSQL, MongoDB, Snowflake, etc.

2. **Select Authentication Type**
   - None (Public/Local)
   - Basic Login (User/Pass)
   - API Key
   - OAuth 2.0
   - Token-Based
   - Certificate
   - SSO/SAML

3. **Enter Connection URL/Endpoint**
   - The placeholder text changes based on your selected type
   - Examples:
     - **Google Sheets**: `https://docs.google.com/spreadsheets/d/...`
     - **PostgreSQL**: `prod-db.company.com:5432`
     - **AWS**: `https://s3.amazonaws.com/bucket-name/data`
     - **External API**: `https://api.service.com/v1/data`

4. **Enter Data Format**
   - Examples: JSON, SQL, CSV, Parquet, XML, Excel

5. **Enter Credentials (if needed)**
   - **API Key/Token**: Appears if you selected "API Key" or "Token-Based" authentication
   - **Username/Password**: Appears if you selected "Basic Login" authentication

6. **Click "➕ Add This Data Source"**
   - The source will be added to your list
   - The form will reset for you to add another source

#### Managing Your Data Sources:

**View Configured Sources**
- All configured sources appear in a scrollable list above the form
- Each entry shows:
  - 🔷 Icon and type (e.g., "Azure", "PostgreSQL")
  - 🔐 Authentication method badge
  - 📍 Connection URL
  - 📄 Data format

**Remove a Source**
- Click the 🗑️ (trash) icon next to any source to remove it

**Limits**
- You can configure up to **10 data sources** per project
- When you reach 10, the form will be hidden
- Remove a source to add a new one

### Step 4: Complete and Save

1. Review all your data source connections
2. Click **"🚀 Add Project"** (or **"✅ Update Project"** if editing)
3. Your project will be saved with all connection details

### Step 5: View Your Project

On the Projects page, your project card will display:
- First 3 data sources as colorful badges
- If you have more than 3, a "+X more" badge shows the count
- Click **Edit** anytime to view or modify all connection details

## Example Configurations

### Example 1: Simple Google Sheets Project
```
Type: Google Sheets
Auth: OAuth 2.0
URL: https://docs.google.com/spreadsheets/d/1ABC123.../edit
Format: CSV
```

### Example 2: Multi-Source Analytics Project
```
Source 1:
  Type: PostgreSQL
  Auth: Basic Login (User/Pass)
  URL: analytics-db.company.com:5432
  Format: SQL
  
Source 2:
  Type: AWS
  Auth: API Key
  URL: https://s3.amazonaws.com/analytics-bucket/raw-data
  Format: JSON
  
Source 3:
  Type: Tableau
  Auth: Token-Based
  URL: https://tableau.company.com/workbooks/analytics
  Format: JSON
```

### Example 3: Enterprise AI System
```
Source 1:
  Type: Snowflake
  Auth: API Key
  URL: https://company.snowflakecomputing.com/warehouse
  Format: SQL
  
Source 2:
  Type: Salesforce
  Auth: OAuth 2.0
  URL: https://yourorg.salesforce.com/api/v1
  Format: JSON
  
Source 3:
  Type: MongoDB
  Auth: Basic Login (User/Pass)
  URL: mongodb://prod-cluster.company.com:27017/aidata
  Format: JSON
```

## Tips & Best Practices

### 🔐 Security
- **Never share** screenshots of connection details with credentials
- Use **read-only** credentials when possible
- Consider using **OAuth 2.0** for better security
- **Note**: In production, credentials should be encrypted

### 📝 Documentation
- Keep connection URLs **accurate and up-to-date**
- Use **descriptive formats** (e.g., "JSON API v2" instead of just "JSON")
- Document any **special authentication requirements**

### 🎯 Organization
- Add sources in **order of importance** (primary sources first)
- Group related sources together when possible
- Use the **correct data source type** for better organization

### ✅ Validation
- **Test your connections** before adding them to production
- Verify **data formats** match what the source actually provides
- Ensure **authentication credentials** are current and valid

## Troubleshooting

**Q: The "Add This Data Source" button is disabled**
- A: Make sure you've filled in all required fields:
  - Connection URL/Endpoint
  - Data Format
  - Authentication Type

**Q: I can't add more than 10 sources**
- A: The system limits projects to 10 data sources for optimal performance
- Remove unused sources to add new ones

**Q: My credentials aren't saving**
- A: Optional credential fields (API Key, Username, Password) are only shown based on your selected Authentication Type
- They are saved but may be hidden for security when viewing

**Q: Where are my old projects with single data sources?**
- A: They still work! The system maintains backward compatibility
- Old projects show the legacy data source field
- Edit them to add multiple sources with full details

## Getting Help

If you need assistance:
1. Check the main **USER_GUIDE.md** for general project management
2. Review **DATA_SOURCE_INTEGRATION_ENHANCEMENT.md** for technical details
3. Contact your system administrator for connection credentials
4. Refer to your data source's API documentation for connection details

---

**Happy Data Integrating! 🚀**
