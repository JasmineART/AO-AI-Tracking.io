import { v4 as uuidv4 } from 'uuid';

// Generate demo data for the dashboard
export const generateDemoData = () => {
  const projects = [
    {
      id: uuidv4(),
      name: 'Customer Service AI Chatbot',
      status: 'In Progress',
      type: 'Automation',
      dataSource: 'AWS', // Legacy field for backward compatibility
      dataSources: [
        { id: 1, type: 'AWS', icon: '☁️', connectionDetailOrUrl: 'https://aws.amazon.com/s3/bucket/chatbot-data', format: 'JSON', authType: 'API Key' },
        { id: 2, type: 'PostgreSQL', icon: '🐘', connectionDetailOrUrl: 'prod-db.company.com:5432', format: 'SQL', authType: 'Basic Login (User/Pass)' }
      ],
      readinessScore: 78,
      startDate: '2024-08-15',
      owner: 'Sarah Johnson',
      department: 'Customer Service'
    },
    {
      id: uuidv4(),
      name: 'Predictive Maintenance System',
      status: 'Completed',
      type: 'AI System',
      dataSource: 'Azure', // Legacy field
      dataSources: [
        { id: 1, type: 'Azure', icon: '🔷', connectionDetailOrUrl: 'https://maintenance.blob.core.windows.net/data', format: 'Parquet', authType: 'OAuth 2.0' }
      ],
      readinessScore: 92,
      startDate: '2024-05-01',
      owner: 'Michael Chen',
      department: 'Operations'
    },
    {
      id: uuidv4(),
      name: 'Invoice Processing Automation',
      status: 'In Progress',
      type: 'Automation',
      dataSource: 'Google Sheets', // Legacy field
      dataSources: [
        { id: 1, type: 'Google Sheets', icon: '📊', connectionDetailOrUrl: 'https://docs.google.com/spreadsheets/d/1BxdjHwEw_invoices/edit', format: 'CSV', authType: 'OAuth 2.0' }
      ],
      readinessScore: 65,
      startDate: '2024-09-10',
      owner: 'Emily Rodriguez',
      department: 'Finance'
    },
    {
      id: uuidv4(),
      name: 'Inventory Optimization AI',
      status: 'Planning',
      type: 'AI System',
      dataSource: 'Excel', // Legacy field
      dataSources: [
        { id: 1, type: 'Excel', icon: '📈', connectionDetailOrUrl: 'file://shared/inventory/data.xlsx', format: 'Excel', authType: 'None (Public/Local)' },
        { id: 2, type: 'Snowflake', icon: '❄️', connectionDetailOrUrl: 'https://company.snowflakecomputing.com/warehouse', format: 'SQL', authType: 'API Key' }
      ],
      readinessScore: 45,
      startDate: '2024-10-01',
      owner: 'David Kim',
      department: 'Supply Chain'
    },
    {
      id: uuidv4(),
      name: 'HR Recruitment Assistant',
      status: 'In Progress',
      type: 'AI System',
      dataSource: 'Salesforce', // Legacy field
      dataSources: [
        { id: 1, type: 'Salesforce', icon: '☁️', connectionDetailOrUrl: 'https://yourorg.salesforce.com/candidates', format: 'JSON', authType: 'OAuth 2.0' },
        { id: 2, type: 'MongoDB', icon: '🍃', connectionDetailOrUrl: 'mongodb://hr-cluster.company.com:27017/recruitment', format: 'JSON', authType: 'Basic Login (User/Pass)' }
      ],
      readinessScore: 71,
      startDate: '2024-07-20',
      owner: 'Lisa Thompson',
      department: 'Human Resources'
    }
  ];

  // Generate 100 data points for metrics
  const dataPoints = [];
  const metrics = [
    'Data Quality Score',
    'Model Accuracy',
    'Infrastructure Readiness',
    'Team Skill Level',
    'Compliance Status',
    'Budget Utilization',
    'Timeline Adherence',
    'Stakeholder Engagement'
  ];

  for (let i = 0; i < 100; i++) {
    const project = projects[i % projects.length];
    const metric = metrics[i % metrics.length];
    
    dataPoints.push({
      id: uuidv4(),
      projectId: project.id,
      projectName: project.name,
      metric: metric,
      value: Math.floor(Math.random() * 40) + 60, // 60-100 range
      timestamp: new Date(2024, 8 + (i % 3), (i % 28) + 1).toISOString(),
      category: i % 2 === 0 ? 'Technical' : 'Organizational',
      trend: Math.random() > 0.5 ? 'up' : 'down'
    });
  }

  // Calculate aggregate metrics
  const aggregateMetrics = {
    overallReadiness: Math.floor(dataPoints.reduce((sum, dp) => sum + dp.value, 0) / dataPoints.length),
    totalProjects: projects.length,
    activeProjects: projects.filter(p => p.status === 'In Progress').length,
    completedProjects: projects.filter(p => p.status === 'Completed').length,
    averageScore: Math.floor(projects.reduce((sum, p) => sum + p.readinessScore, 0) / projects.length)
  };

  // Department breakdown
  const departmentMetrics = {};
  projects.forEach(project => {
    if (!departmentMetrics[project.department]) {
      departmentMetrics[project.department] = {
        projectCount: 0,
        avgReadiness: 0,
        totalReadiness: 0
      };
    }
    departmentMetrics[project.department].projectCount++;
    departmentMetrics[project.department].totalReadiness += project.readinessScore;
    departmentMetrics[project.department].avgReadiness = 
      Math.floor(departmentMetrics[project.department].totalReadiness / departmentMetrics[project.department].projectCount);
  });

  // Time series data for trend charts
  const timeSeriesData = [];
  for (let month = 0; month < 6; month++) {
    timeSeriesData.push({
      month: ['May', 'June', 'July', 'Aug', 'Sept', 'Oct'][month],
      readiness: 60 + (month * 5) + Math.floor(Math.random() * 5),
      projects: 2 + Math.floor(month / 2),
      dataQuality: 65 + (month * 4) + Math.floor(Math.random() * 5)
    });
  }

  return {
    projects,
    dataPoints,
    aggregateMetrics,
    departmentMetrics,
    timeSeriesData
  };
};

// Store demo data in localStorage
export const initializeDemoData = () => {
  const existingData = localStorage.getItem('demoData');
  if (!existingData) {
    const demoData = generateDemoData();
    localStorage.setItem('demoData', JSON.stringify(demoData));
    return demoData;
  }
  return JSON.parse(existingData);
};

// Get demo data from localStorage
export const getDemoData = () => {
  const data = localStorage.getItem('demoData');
  return data ? JSON.parse(data) : initializeDemoData();
};

// Add a new project
export const addProject = (project) => {
  const demoData = getDemoData();
  const newProject = {
    id: uuidv4(),
    ...project,
    startDate: new Date().toISOString().split('T')[0]
  };
  demoData.projects.push(newProject);
  localStorage.setItem('demoData', JSON.stringify(demoData));
  return newProject;
};

// Update a project
export const updateProject = (projectId, updates) => {
  const demoData = getDemoData();
  const projectIndex = demoData.projects.findIndex(p => p.id === projectId);
  if (projectIndex !== -1) {
    demoData.projects[projectIndex] = { ...demoData.projects[projectIndex], ...updates };
    localStorage.setItem('demoData', JSON.stringify(demoData));
    return demoData.projects[projectIndex];
  }
  return null;
};

// Delete a project
export const deleteProject = (projectId) => {
  const demoData = getDemoData();
  demoData.projects = demoData.projects.filter(p => p.id !== projectId);
  demoData.dataPoints = demoData.dataPoints.filter(dp => dp.projectId !== projectId);
  localStorage.setItem('demoData', JSON.stringify(demoData));
};
