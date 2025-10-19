/**
 * AI Analytics Service
 * Processes project data and generates insights using AI analysis
 */

/**
 * Generate AI-powered insights from project data
 * This simulates an AI analytics API call with intelligent analysis
 */
export const generateAIInsights = async (projects) => {
  if (!projects || projects.length === 0) {
    return {
      summary: 'No projects to analyze yet. Add your first project to get started!',
      recommendations: [],
      trends: [],
      predictions: {},
      riskFactors: []
    };
  }

  // Simulate API call delay (in real implementation, this would call an AI API)
  await new Promise(resolve => setTimeout(resolve, 500));

  // Calculate key metrics
  const totalProjects = projects.length;
  const activeProjects = projects.filter(p => 
    p.status === 'In Progress' || p.status === 'Planning'
  ).length;
  const completedProjects = projects.filter(p => p.status === 'Completed').length;
  const avgReadiness = projects.reduce((sum, p) => sum + (p.readinessScore || 0), 0) / totalProjects;
  
  // Analyze by department
  const departmentStats = {};
  projects.forEach(project => {
    const dept = project.department || 'Unassigned';
    if (!departmentStats[dept]) {
      departmentStats[dept] = {
        count: 0,
        totalReadiness: 0,
        types: {}
      };
    }
    departmentStats[dept].count++;
    departmentStats[dept].totalReadiness += project.readinessScore || 0;
    
    const type = project.type || 'Other';
    departmentStats[dept].types[type] = (departmentStats[dept].types[type] || 0) + 1;
  });

  // Calculate department averages
  Object.keys(departmentStats).forEach(dept => {
    departmentStats[dept].avgReadiness = 
      departmentStats[dept].totalReadiness / departmentStats[dept].count;
  });

  // Analyze by type
  const typeStats = {};
  projects.forEach(project => {
    const type = project.type || 'Other';
    if (!typeStats[type]) {
      typeStats[type] = { count: 0, avgReadiness: 0, totalReadiness: 0 };
    }
    typeStats[type].count++;
    typeStats[type].totalReadiness += project.readinessScore || 0;
  });

  Object.keys(typeStats).forEach(type => {
    typeStats[type].avgReadiness = typeStats[type].totalReadiness / typeStats[type].count;
  });

  // Generate AI Summary
  const summary = generateSummary(totalProjects, activeProjects, completedProjects, avgReadiness);

  // Generate Recommendations
  const recommendations = generateRecommendations(projects, departmentStats, avgReadiness);

  // Generate Trends
  const trends = generateTrends(projects, departmentStats);

  // Generate Predictions
  const predictions = generatePredictions(projects, avgReadiness, activeProjects);

  // Identify Risk Factors
  const riskFactors = identifyRiskFactors(projects, avgReadiness);

  // Generate Insights by Department
  const departmentInsights = generateDepartmentInsights(departmentStats);

  // Generate Type Analysis
  const typeAnalysis = generateTypeAnalysis(typeStats);

  return {
    summary,
    recommendations,
    trends,
    predictions,
    riskFactors,
    departmentInsights,
    typeAnalysis,
    metrics: {
      totalProjects,
      activeProjects,
      completedProjects,
      avgReadiness,
      departmentCount: Object.keys(departmentStats).length
    }
  };
};

/**
 * Generate executive summary
 */
const generateSummary = (total, active, completed, avgReadiness) => {
  const readinessLevel = avgReadiness >= 80 ? 'excellent' : 
                        avgReadiness >= 60 ? 'good' : 
                        avgReadiness >= 40 ? 'moderate' : 'needs improvement';
  
  const completionRate = total > 0 ? ((completed / total) * 100).toFixed(1) : 0;
  
  return `Portfolio Overview: You have ${total} project${total !== 1 ? 's' : ''} with ${active} currently active. ` +
         `Your average AI readiness score is ${avgReadiness.toFixed(1)}% (${readinessLevel}). ` +
         `Completion rate: ${completionRate}%. ${generatePerformanceInsight(avgReadiness, completionRate)}`;
};

/**
 * Generate performance insight
 */
const generatePerformanceInsight = (avgReadiness, completionRate) => {
  if (avgReadiness >= 70 && completionRate >= 50) {
    return '🌟 Your portfolio shows strong performance with high readiness and completion rates.';
  } else if (avgReadiness >= 60) {
    return '📈 Good progress! Focus on completing in-progress projects to boost your success rate.';
  } else if (avgReadiness < 50) {
    return '⚠️ Consider focusing resources on improving readiness scores before starting new initiatives.';
  }
  return '💡 Continue monitoring and adjusting your strategy for optimal results.';
};

/**
 * Generate actionable recommendations
 */
const generateRecommendations = (projects, departmentStats, avgReadiness) => {
  const recommendations = [];

  // Low readiness recommendation
  const lowReadinessProjects = projects.filter(p => (p.readinessScore || 0) < 50);
  if (lowReadinessProjects.length > 0) {
    recommendations.push({
      priority: 'high',
      category: 'Readiness',
      title: `Improve ${lowReadinessProjects.length} Low-Readiness Project${lowReadinessProjects.length !== 1 ? 's' : ''}`,
      description: `Focus on: ${lowReadinessProjects.slice(0, 2).map(p => p.name).join(', ')}${lowReadinessProjects.length > 2 ? ', and others' : ''}`,
      action: 'Review data infrastructure, team skills, and technical requirements'
    });
  }

  // Stalled projects recommendation
  const stalledProjects = projects.filter(p => p.status === 'On Hold');
  if (stalledProjects.length > 0) {
    recommendations.push({
      priority: 'medium',
      category: 'Status',
      title: `${stalledProjects.length} Project${stalledProjects.length !== 1 ? 's' : ''} On Hold`,
      description: 'Review and reactivate or close stalled initiatives',
      action: 'Schedule review meetings to determine next steps'
    });
  }

  // Department balance recommendation
  const deptNames = Object.keys(departmentStats);
  if (deptNames.length === 1) {
    recommendations.push({
      priority: 'low',
      category: 'Portfolio',
      title: 'Expand Across Departments',
      description: 'Consider spreading AI initiatives across multiple departments',
      action: 'Identify opportunities in other business units'
    });
  }

  // High performers to learn from
  const highPerformers = projects.filter(p => (p.readinessScore || 0) >= 80);
  if (highPerformers.length > 0 && projects.length > highPerformers.length) {
    recommendations.push({
      priority: 'low',
      category: 'Best Practices',
      title: 'Learn from High Performers',
      description: `${highPerformers.length} project${highPerformers.length !== 1 ? 's have' : ' has'} achieved 80+% readiness`,
      action: 'Document and share success factors across teams'
    });
  }

  // Type diversity
  const typeCount = new Set(projects.map(p => p.type)).size;
  if (typeCount === 1 && projects.length > 2) {
    recommendations.push({
      priority: 'low',
      category: 'Diversification',
      title: 'Diversify Project Types',
      description: 'All projects are of the same type - consider expanding scope',
      action: 'Explore automation, analytics, or infrastructure opportunities'
    });
  }

  return recommendations;
};

/**
 * Generate trend analysis
 */
const generateTrends = (projects, departmentStats) => {
  const trends = [];

  // Readiness trend
  const avgReadiness = projects.reduce((sum, p) => sum + (p.readinessScore || 0), 0) / projects.length;
  trends.push({
    metric: 'AI Readiness',
    value: `${avgReadiness.toFixed(1)}%`,
    direction: avgReadiness >= 70 ? 'up' : avgReadiness >= 50 ? 'stable' : 'down',
    insight: avgReadiness >= 70 ? 'Strong readiness across portfolio' : 
             avgReadiness >= 50 ? 'Moderate readiness, room for improvement' : 
             'Focus needed on foundational capabilities'
  });

  // Department concentration
  const topDept = Object.entries(departmentStats)
    .sort((a, b) => b[1].count - a[1].count)[0];
  if (topDept) {
    trends.push({
      metric: 'Department Focus',
      value: `${topDept[0]} (${topDept[1].count} projects)`,
      direction: 'neutral',
      insight: `Primary activity in ${topDept[0]} department`
    });
  }

  // Status distribution
  const inProgressCount = projects.filter(p => p.status === 'In Progress').length;
  const totalActive = projects.filter(p => p.status !== 'Completed' && p.status !== 'On Hold').length;
  if (totalActive > 0) {
    trends.push({
      metric: 'Active Execution',
      value: `${inProgressCount}/${totalActive} in progress`,
      direction: inProgressCount > 0 ? 'up' : 'stable',
      insight: inProgressCount > 0 ? 'Strong execution momentum' : 'Projects in planning phase'
    });
  }

  return trends;
};

/**
 * Generate predictions
 */
const generatePredictions = (projects, avgReadiness, activeProjects) => {
  // Simple prediction model based on current metrics
  const predictions = {
    nextMonth: {
      expectedCompletions: Math.max(1, Math.floor(activeProjects * 0.3)),
      confidenceLevel: avgReadiness >= 70 ? 'high' : avgReadiness >= 50 ? 'medium' : 'low',
      readinessTrend: avgReadiness >= 60 ? 'improving' : 'needs attention'
    },
    nextQuarter: {
      portfolioGrowth: activeProjects >= 3 ? '15-25%' : '5-15%',
      readinessTarget: Math.min(100, avgReadiness + 10),
      recommendation: avgReadiness >= 70 ? 'Scale operations' : 'Focus on quality improvement'
    }
  };

  return predictions;
};

/**
 * Identify risk factors
 */
const identifyRiskFactors = (projects, avgReadiness) => {
  const risks = [];

  // Low overall readiness
  if (avgReadiness < 50) {
    risks.push({
      level: 'high',
      category: 'Capability',
      risk: 'Low Average Readiness',
      impact: 'Projects may face delays or quality issues',
      mitigation: 'Invest in training, infrastructure, and data quality'
    });
  }

  // Too many concurrent projects
  const activeCount = projects.filter(p => p.status === 'In Progress').length;
  if (activeCount > 5) {
    risks.push({
      level: 'medium',
      category: 'Resource',
      risk: 'High Concurrent Project Load',
      impact: 'Resource constraints may slow delivery',
      mitigation: 'Prioritize projects and consider sequential execution'
    });
  }

  // No completed projects
  const completedCount = projects.filter(p => p.status === 'Completed').length;
  if (completedCount === 0 && projects.length >= 3) {
    risks.push({
      level: 'medium',
      category: 'Execution',
      risk: 'No Completed Projects',
      impact: 'Lack of proven delivery track record',
      mitigation: 'Focus on completing quick wins to build momentum'
    });
  }

  return risks;
};

/**
 * Generate insights by department
 */
const generateDepartmentInsights = (departmentStats) => {
  return Object.entries(departmentStats).map(([dept, stats]) => ({
    department: dept,
    projectCount: stats.count,
    avgReadiness: stats.avgReadiness.toFixed(1),
    performance: stats.avgReadiness >= 70 ? 'High' : stats.avgReadiness >= 50 ? 'Medium' : 'Low',
    topTypes: Object.entries(stats.types)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 2)
      .map(([type]) => type)
  }));
};

/**
 * Generate type analysis
 */
const generateTypeAnalysis = (typeStats) => {
  return Object.entries(typeStats).map(([type, stats]) => ({
    type,
    count: stats.count,
    avgReadiness: stats.avgReadiness.toFixed(1),
    percentage: 0 // Will be calculated in component
  }));
};

/**
 * Generate time series data with AI predictions
 */
export const generateTimeSeriesData = (projects) => {
  const months = ['May', 'June', 'July', 'Aug', 'Sept', 'Oct', 'Nov (Pred)', 'Dec (Pred)'];
  const data = [];

  if (!projects || projects.length === 0) {
    return months.slice(0, 6).map(month => ({
      month,
      readiness: 0,
      projects: 0,
      dataQuality: 0
    }));
  }

  // Generate historical data (last 6 months)
  const avgReadiness = projects.reduce((sum, p) => sum + (p.readinessScore || 0), 0) / projects.length;
  const baseReadiness = Math.max(30, avgReadiness - 15);
  
  for (let i = 0; i < 6; i++) {
    const progress = (i / 5);
    data.push({
      month: months[i],
      readiness: Math.min(100, baseReadiness + (avgReadiness - baseReadiness) * progress),
      projects: Math.floor(projects.length * progress) + 1,
      dataQuality: Math.min(100, (baseReadiness + 10) + ((avgReadiness + 5) - (baseReadiness + 10)) * progress),
      isPrediction: false
    });
  }

  // Generate predictions (next 2 months)
  const trend = avgReadiness >= 60 ? 5 : 3;
  for (let i = 6; i < 8; i++) {
    data.push({
      month: months[i],
      readiness: Math.min(100, avgReadiness + trend * (i - 5)),
      projects: projects.length + Math.floor((i - 5) * 1.2),
      dataQuality: Math.min(100, avgReadiness + trend * (i - 5) + 5),
      isPrediction: true
    });
  }

  return data;
};

export default {
  generateAIInsights,
  generateTimeSeriesData
};
