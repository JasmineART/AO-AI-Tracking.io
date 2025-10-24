// Generate realistic project data for demo purposes

export const getProjectData = (project, sourceIndex = 0) => {
  const projectType = project.type;
  const dataSource = project.dataSources?.[sourceIndex] || { type: 'CSV/Excel' };

  // Generate data based on project type and data source
  switch (projectType) {
    case 'AI System':
      return generateAISystemData(project, dataSource);
    case 'Automation':
      return generateAutomationData(project, dataSource);
    case 'Analytics':
      return generateAnalyticsData(project, dataSource);
    case 'Infrastructure':
      return generateInfrastructureData(project, dataSource);
    default:
      return generateGenericData(project, dataSource);
  }
};

const generateAISystemData = (project, dataSource) => {
  const columns = [
    { key: 'id', label: 'ID' },
    { key: 'timestamp', label: 'Timestamp' },
    { key: 'modelVersion', label: 'Model Version' },
    { key: 'accuracy', label: 'Accuracy (%)' },
    { key: 'precision', label: 'Precision (%)' },
    { key: 'recall', label: 'Recall (%)' },
    { key: 'f1Score', label: 'F1 Score' },
    { key: 'latency', label: 'Latency (ms)' },
    { key: 'throughput', label: 'Throughput (req/s)' },
    { key: 'status', label: 'Status' }
  ];

  const rows = [];
  const statuses = ['Active', 'Training', 'Validation', 'Deployed'];
  
  for (let i = 1; i <= 25; i++) {
    const date = new Date(2024, 9, Math.floor(Math.random() * 30) + 1);
    rows.push({
      id: `AI-${String(i).padStart(4, '0')}`,
      timestamp: date.toISOString().split('T')[0],
      modelVersion: `v${Math.floor(Math.random() * 5) + 1}.${Math.floor(Math.random() * 10)}`,
      accuracy: (85 + Math.random() * 15).toFixed(2),
      precision: (80 + Math.random() * 20).toFixed(2),
      recall: (75 + Math.random() * 25).toFixed(2),
      f1Score: (0.80 + Math.random() * 0.20).toFixed(3),
      latency: Math.floor(50 + Math.random() * 200),
      throughput: Math.floor(100 + Math.random() * 500),
      status: statuses[Math.floor(Math.random() * statuses.length)]
    });
  }

  return { columns, rows };
};

const generateAutomationData = (project, dataSource) => {
  const columns = [
    { key: 'workflowId', label: 'Workflow ID' },
    { key: 'executionDate', label: 'Execution Date' },
    { key: 'taskName', label: 'Task Name' },
    { key: 'startTime', label: 'Start Time' },
    { key: 'endTime', label: 'End Time' },
    { key: 'duration', label: 'Duration (min)' },
    { key: 'recordsProcessed', label: 'Records Processed' },
    { key: 'errorCount', label: 'Errors' },
    { key: 'successRate', label: 'Success Rate (%)' },
    { key: 'triggeredBy', label: 'Triggered By' }
  ];

  const rows = [];
  const tasks = ['Data Import', 'Transform', 'Validation', 'Export', 'Notification'];
  const triggers = ['Schedule', 'Manual', 'API', 'Event'];
  
  for (let i = 1; i <= 30; i++) {
    const date = new Date(2024, 9, Math.floor(Math.random() * 30) + 1);
    const startHour = Math.floor(Math.random() * 24);
    const duration = Math.floor(5 + Math.random() * 55);
    
    rows.push({
      workflowId: `WF-${String(i).padStart(5, '0')}`,
      executionDate: date.toISOString().split('T')[0],
      taskName: tasks[Math.floor(Math.random() * tasks.length)],
      startTime: `${String(startHour).padStart(2, '0')}:${String(Math.floor(Math.random() * 60)).padStart(2, '0')}`,
      endTime: `${String((startHour + Math.floor(duration / 60)) % 24).padStart(2, '0')}:${String(Math.floor(Math.random() * 60)).padStart(2, '0')}`,
      duration: duration,
      recordsProcessed: Math.floor(100 + Math.random() * 10000),
      errorCount: Math.floor(Math.random() * 50),
      successRate: (95 + Math.random() * 5).toFixed(2),
      triggeredBy: triggers[Math.floor(Math.random() * triggers.length)]
    });
  }

  return { columns, rows };
};

const generateAnalyticsData = (project, dataSource) => {
  const columns = [
    { key: 'reportId', label: 'Report ID' },
    { key: 'reportDate', label: 'Report Date' },
    { key: 'category', label: 'Category' },
    { key: 'metric', label: 'Metric' },
    { key: 'value', label: 'Value' },
    { key: 'target', label: 'Target' },
    { key: 'variance', label: 'Variance (%)' },
    { key: 'trend', label: 'Trend' },
    { key: 'priority', label: 'Priority' },
    { key: 'owner', label: 'Owner' }
  ];

  const rows = [];
  const categories = ['Sales', 'Marketing', 'Operations', 'Finance', 'Customer Service'];
  const metrics = ['Revenue', 'Conversion Rate', 'Customer Satisfaction', 'Response Time', 'Cost'];
  const trends = ['↑ Up', '↓ Down', '→ Stable'];
  const priorities = ['High', 'Medium', 'Low'];
  const owners = ['Sarah J.', 'Mike C.', 'Emily R.', 'David K.', 'Lisa T.'];
  
  for (let i = 1; i <= 35; i++) {
    const date = new Date(2024, 9, Math.floor(Math.random() * 30) + 1);
    const value = Math.floor(1000 + Math.random() * 50000);
    const target = Math.floor(1000 + Math.random() * 50000);
    const variance = ((value - target) / target * 100).toFixed(2);
    
    rows.push({
      reportId: `RPT-${String(i).padStart(5, '0')}`,
      reportDate: date.toISOString().split('T')[0],
      category: categories[Math.floor(Math.random() * categories.length)],
      metric: metrics[Math.floor(Math.random() * metrics.length)],
      value: value.toLocaleString(),
      target: target.toLocaleString(),
      variance: variance,
      trend: trends[Math.floor(Math.random() * trends.length)],
      priority: priorities[Math.floor(Math.random() * priorities.length)],
      owner: owners[Math.floor(Math.random() * owners.length)]
    });
  }

  return { columns, rows };
};

const generateInfrastructureData = (project, dataSource) => {
  const columns = [
    { key: 'serverId', label: 'Server ID' },
    { key: 'serverName', label: 'Server Name' },
    { key: 'location', label: 'Location' },
    { key: 'cpuUsage', label: 'CPU Usage (%)' },
    { key: 'memoryUsage', label: 'Memory Usage (%)' },
    { key: 'diskUsage', label: 'Disk Usage (%)' },
    { key: 'networkIn', label: 'Network In (GB)' },
    { key: 'networkOut', label: 'Network Out (GB)' },
    { key: 'uptime', label: 'Uptime (days)' },
    { key: 'status', label: 'Status' }
  ];

  const rows = [];
  const locations = ['US-East', 'US-West', 'EU-Central', 'Asia-Pacific'];
  const statuses = ['Healthy', 'Warning', 'Critical', 'Maintenance'];
  
  for (let i = 1; i <= 20; i++) {
    rows.push({
      serverId: `SRV-${String(i).padStart(4, '0')}`,
      serverName: `${project.name.split(' ')[0]}-Server-${i}`,
      location: locations[Math.floor(Math.random() * locations.length)],
      cpuUsage: (10 + Math.random() * 80).toFixed(1),
      memoryUsage: (20 + Math.random() * 70).toFixed(1),
      diskUsage: (30 + Math.random() * 60).toFixed(1),
      networkIn: (Math.random() * 100).toFixed(2),
      networkOut: (Math.random() * 100).toFixed(2),
      uptime: Math.floor(1 + Math.random() * 365),
      status: statuses[Math.floor(Math.random() * statuses.length)]
    });
  }

  return { columns, rows };
};

const generateGenericData = (project, dataSource) => {
  const columns = [
    { key: 'id', label: 'ID' },
    { key: 'date', label: 'Date' },
    { key: 'description', label: 'Description' },
    { key: 'value', label: 'Value' },
    { key: 'status', label: 'Status' }
  ];

  const rows = [];
  const statuses = ['Active', 'Pending', 'Completed', 'Cancelled'];
  
  for (let i = 1; i <= 20; i++) {
    const date = new Date(2024, 9, Math.floor(Math.random() * 30) + 1);
    rows.push({
      id: `GEN-${String(i).padStart(4, '0')}`,
      date: date.toISOString().split('T')[0],
      description: `${project.name} - Record ${i}`,
      value: Math.floor(100 + Math.random() * 10000),
      status: statuses[Math.floor(Math.random() * statuses.length)]
    });
  }

  return { columns, rows };
};

export const getProjectRoadmapData = (project) => {
  const roadmapTemplates = {
    'AI System': generateAIRoadmap(project),
    'Automation': generateAutomationRoadmap(project),
    'Analytics': generateAnalyticsRoadmap(project),
    'Infrastructure': generateInfrastructureRoadmap(project)
  };

  return roadmapTemplates[project.type] || generateGenericRoadmap(project);
};

const generateAIRoadmap = (project) => {
  return {
    stats: {
      totalTasks: 28,
      completedTasks: 15,
      inProgressTasks: 8,
      progress: project.readinessScore || 65
    },
    phases: [
      {
        name: 'Phase 1: Data Collection & Preparation',
        startDate: '2024-08-01',
        endDate: '2024-09-15',
        status: 'completed',
        progress: 100,
        milestones: [
          { name: 'Data Source Identification', dueDate: '2024-08-10', status: 'completed', owner: 'Data Team' },
          { name: 'Data Cleaning & Validation', dueDate: '2024-08-25', status: 'completed', owner: 'ML Engineers' },
          { name: 'Feature Engineering', dueDate: '2024-09-15', status: 'completed', owner: 'Data Scientists' }
        ]
      },
      {
        name: 'Phase 2: Model Development',
        startDate: '2024-09-16',
        endDate: '2024-11-01',
        status: 'in-progress',
        progress: 60,
        milestones: [
          { name: 'Model Architecture Design', dueDate: '2024-09-25', status: 'completed', owner: 'Lead ML Engineer' },
          { name: 'Model Training', dueDate: '2024-10-15', status: 'in-progress', owner: 'ML Team' },
          { name: 'Hyperparameter Tuning', dueDate: '2024-10-28', status: 'pending', owner: 'Data Scientists' },
          { name: 'Model Validation', dueDate: '2024-11-01', status: 'pending', owner: 'QA Team' }
        ]
      },
      {
        name: 'Phase 3: Deployment & Integration',
        startDate: '2024-11-02',
        endDate: '2024-12-01',
        status: 'pending',
        progress: 0,
        milestones: [
          { name: 'Production Environment Setup', dueDate: '2024-11-10', status: 'pending', owner: 'DevOps' },
          { name: 'API Development', dueDate: '2024-11-20', status: 'pending', owner: 'Backend Team' },
          { name: 'Integration Testing', dueDate: '2024-11-28', status: 'pending', owner: 'QA Team' },
          { name: 'Go-Live', dueDate: '2024-12-01', status: 'pending', owner: project.owner }
        ]
      },
      {
        name: 'Phase 4: Monitoring & Optimization',
        startDate: '2024-12-02',
        endDate: '2025-01-31',
        status: 'pending',
        progress: 0,
        milestones: [
          { name: 'Performance Monitoring Setup', dueDate: '2024-12-10', status: 'pending', owner: 'DevOps' },
          { name: 'A/B Testing', dueDate: '2024-12-20', status: 'pending', owner: 'Product Team' },
          { name: 'Model Retraining Pipeline', dueDate: '2025-01-15', status: 'pending', owner: 'ML Engineers' }
        ]
      }
    ],
    team: [
      { name: project.owner, role: 'Project Lead', tasks: 8 },
      { name: 'Alex Johnson', role: 'ML Engineer', tasks: 12 },
      { name: 'Sam Wilson', role: 'Data Scientist', tasks: 10 },
      { name: 'Jordan Lee', role: 'DevOps Engineer', tasks: 6 },
      { name: 'Taylor Kim', role: 'QA Engineer', tasks: 5 }
    ],
    risks: [
      { title: 'Data Quality Issues', description: 'Incomplete or inconsistent training data', severity: 'high' },
      { title: 'Model Bias', description: 'Potential bias in training dataset', severity: 'medium' },
      { title: 'Scalability Concerns', description: 'High inference latency in production', severity: 'medium' }
    ],
    budget: {
      total: 250000,
      spent: 150000,
      remaining: 100000
    }
  };
};

const generateAutomationRoadmap = (project) => {
  return {
    stats: {
      totalTasks: 22,
      completedTasks: 12,
      inProgressTasks: 6,
      progress: project.readinessScore || 70
    },
    phases: [
      {
        name: 'Phase 1: Process Analysis',
        startDate: '2024-08-15',
        endDate: '2024-09-30',
        status: 'completed',
        progress: 100,
        milestones: [
          { name: 'Current Process Documentation', dueDate: '2024-08-25', status: 'completed', owner: 'Business Analyst' },
          { name: 'Automation Opportunities Identification', dueDate: '2024-09-15', status: 'completed', owner: 'Process Expert' },
          { name: 'ROI Analysis', dueDate: '2024-09-30', status: 'completed', owner: 'Finance Team' }
        ]
      },
      {
        name: 'Phase 2: Workflow Design & Development',
        startDate: '2024-10-01',
        endDate: '2024-11-15',
        status: 'in-progress',
        progress: 55,
        milestones: [
          { name: 'Workflow Design', dueDate: '2024-10-10', status: 'completed', owner: 'Automation Team' },
          { name: 'Bot Development', dueDate: '2024-10-30', status: 'in-progress', owner: 'RPA Developers' },
          { name: 'Integration Points Setup', dueDate: '2024-11-15', status: 'pending', owner: 'IT Team' }
        ]
      },
      {
        name: 'Phase 3: Testing & Deployment',
        startDate: '2024-11-16',
        endDate: '2024-12-15',
        status: 'pending',
        progress: 0,
        milestones: [
          { name: 'UAT', dueDate: '2024-11-30', status: 'pending', owner: 'QA Team' },
          { name: 'Production Deployment', dueDate: '2024-12-10', status: 'pending', owner: project.owner },
          { name: 'User Training', dueDate: '2024-12-15', status: 'pending', owner: 'Training Team' }
        ]
      }
    ],
    team: [
      { name: project.owner, role: 'Automation Lead', tasks: 7 },
      { name: 'Chris Martinez', role: 'RPA Developer', tasks: 10 },
      { name: 'Morgan Taylor', role: 'Business Analyst', tasks: 6 },
      { name: 'Riley Cooper', role: 'QA Engineer', tasks: 4 }
    ],
    risks: [
      { title: 'Process Changes', description: 'Underlying process may change during development', severity: 'medium' },
      { title: 'User Adoption', description: 'Resistance to automation from end users', severity: 'high' },
      { title: 'Integration Delays', description: 'Third-party API dependencies', severity: 'low' }
    ],
    budget: {
      total: 180000,
      spent: 120000,
      remaining: 60000
    }
  };
};

const generateAnalyticsRoadmap = (project) => {
  return {
    stats: {
      totalTasks: 20,
      completedTasks: 10,
      inProgressTasks: 7,
      progress: project.readinessScore || 60
    },
    phases: [
      {
        name: 'Phase 1: Requirements & Data Discovery',
        startDate: '2024-09-10',
        endDate: '2024-10-10',
        status: 'completed',
        progress: 100,
        milestones: [
          { name: 'Stakeholder Interviews', dueDate: '2024-09-20', status: 'completed', owner: 'Analytics Lead' },
          { name: 'Data Source Mapping', dueDate: '2024-10-05', status: 'completed', owner: 'Data Engineer' },
          { name: 'KPI Definition', dueDate: '2024-10-10', status: 'completed', owner: 'Business Team' }
        ]
      },
      {
        name: 'Phase 2: Dashboard Development',
        startDate: '2024-10-11',
        endDate: '2024-11-20',
        status: 'in-progress',
        progress: 50,
        milestones: [
          { name: 'Data Pipeline Setup', dueDate: '2024-10-25', status: 'completed', owner: 'Data Engineer' },
          { name: 'Dashboard Prototyping', dueDate: '2024-11-05', status: 'in-progress', owner: 'BI Developer' },
          { name: 'Visual Design', dueDate: '2024-11-20', status: 'pending', owner: 'UX Designer' }
        ]
      },
      {
        name: 'Phase 3: Rollout & Training',
        startDate: '2024-11-21',
        endDate: '2024-12-20',
        status: 'pending',
        progress: 0,
        milestones: [
          { name: 'User Acceptance Testing', dueDate: '2024-12-05', status: 'pending', owner: 'QA Team' },
          { name: 'Training Sessions', dueDate: '2024-12-15', status: 'pending', owner: 'Training Team' },
          { name: 'Production Launch', dueDate: '2024-12-20', status: 'pending', owner: project.owner }
        ]
      }
    ],
    team: [
      { name: project.owner, role: 'Analytics Manager', tasks: 6 },
      { name: 'Jamie Anderson', role: 'BI Developer', tasks: 9 },
      { name: 'Casey Brown', role: 'Data Engineer', tasks: 8 },
      { name: 'Drew Phillips', role: 'UX Designer', tasks: 3 }
    ],
    risks: [
      { title: 'Data Latency', description: 'Real-time data requirements may be challenging', severity: 'medium' },
      { title: 'Changing Requirements', description: 'KPIs may evolve during development', severity: 'low' }
    ],
    budget: {
      total: 150000,
      spent: 85000,
      remaining: 65000
    }
  };
};

const generateInfrastructureRoadmap = (project) => {
  return {
    stats: {
      totalTasks: 18,
      completedTasks: 8,
      inProgressTasks: 5,
      progress: project.readinessScore || 55
    },
    phases: [
      {
        name: 'Phase 1: Planning & Design',
        startDate: '2024-10-01',
        endDate: '2024-10-31',
        status: 'completed',
        progress: 100,
        milestones: [
          { name: 'Infrastructure Assessment', dueDate: '2024-10-10', status: 'completed', owner: 'Systems Architect' },
          { name: 'Architecture Design', dueDate: '2024-10-25', status: 'completed', owner: 'Lead Architect' },
          { name: 'Security Review', dueDate: '2024-10-31', status: 'completed', owner: 'Security Team' }
        ]
      },
      {
        name: 'Phase 2: Implementation',
        startDate: '2024-11-01',
        endDate: '2024-12-15',
        status: 'in-progress',
        progress: 45,
        milestones: [
          { name: 'Server Provisioning', dueDate: '2024-11-15', status: 'in-progress', owner: 'Infrastructure Team' },
          { name: 'Network Configuration', dueDate: '2024-11-30', status: 'pending', owner: 'Network Team' },
          { name: 'Security Hardening', dueDate: '2024-12-15', status: 'pending', owner: 'Security Team' }
        ]
      },
      {
        name: 'Phase 3: Migration & Go-Live',
        startDate: '2024-12-16',
        endDate: '2025-01-15',
        status: 'pending',
        progress: 0,
        milestones: [
          { name: 'Data Migration', dueDate: '2024-12-30', status: 'pending', owner: 'Migration Team' },
          { name: 'Cutover', dueDate: '2025-01-10', status: 'pending', owner: project.owner },
          { name: 'Post-Launch Support', dueDate: '2025-01-15', status: 'pending', owner: 'Support Team' }
        ]
      }
    ],
    team: [
      { name: project.owner, role: 'Infrastructure Manager', tasks: 5 },
      { name: 'Pat Murphy', role: 'Systems Engineer', tasks: 8 },
      { name: 'Quinn Davis', role: 'Network Engineer', tasks: 6 },
      { name: 'Avery Scott', role: 'Security Specialist', tasks: 4 }
    ],
    risks: [
      { title: 'Downtime Risk', description: 'Migration may cause service interruption', severity: 'high' },
      { title: 'Budget Overrun', description: 'Hardware costs higher than estimated', severity: 'medium' },
      { title: 'Vendor Delays', description: 'Equipment delivery delays', severity: 'low' }
    ],
    budget: {
      total: 500000,
      spent: 250000,
      remaining: 250000
    }
  };
};

const generateGenericRoadmap = (project) => {
  return {
    stats: {
      totalTasks: 15,
      completedTasks: 7,
      inProgressTasks: 4,
      progress: project.readinessScore || 50
    },
    phases: [
      {
        name: 'Phase 1: Planning',
        startDate: '2024-09-01',
        endDate: '2024-09-30',
        status: 'completed',
        progress: 100,
        milestones: [
          { name: 'Project Kickoff', dueDate: '2024-09-05', status: 'completed', owner: project.owner },
          { name: 'Requirements Gathering', dueDate: '2024-09-20', status: 'completed', owner: 'BA Team' },
          { name: 'Planning Complete', dueDate: '2024-09-30', status: 'completed', owner: project.owner }
        ]
      },
      {
        name: 'Phase 2: Execution',
        startDate: '2024-10-01',
        endDate: '2024-11-30',
        status: 'in-progress',
        progress: 50,
        milestones: [
          { name: 'Development Start', dueDate: '2024-10-10', status: 'completed', owner: 'Dev Team' },
          { name: 'Mid-Point Review', dueDate: '2024-11-15', status: 'in-progress', owner: project.owner },
          { name: 'Testing Phase', dueDate: '2024-11-30', status: 'pending', owner: 'QA Team' }
        ]
      },
      {
        name: 'Phase 3: Completion',
        startDate: '2024-12-01',
        endDate: '2024-12-31',
        status: 'pending',
        progress: 0,
        milestones: [
          { name: 'Final Delivery', dueDate: '2024-12-20', status: 'pending', owner: project.owner },
          { name: 'Project Closure', dueDate: '2024-12-31', status: 'pending', owner: project.owner }
        ]
      }
    ],
    team: [
      { name: project.owner, role: 'Project Manager', tasks: 5 },
      { name: 'Team Member 1', role: 'Developer', tasks: 7 },
      { name: 'Team Member 2', role: 'Analyst', tasks: 5 },
      { name: 'Team Member 3', role: 'Tester', tasks: 3 }
    ],
    risks: [
      { title: 'Resource Availability', description: 'Key team members may be allocated to other projects', severity: 'medium' },
      { title: 'Scope Creep', description: 'Additional requirements may impact timeline', severity: 'low' }
    ],
    budget: {
      total: 200000,
      spent: 100000,
      remaining: 100000
    }
  };
};

export default { getProjectData, getProjectRoadmapData };
