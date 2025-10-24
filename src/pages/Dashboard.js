import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { MetricCardSkeleton, ChartSkeleton } from '../components/SkeletonLoader';
import { exportDashboardToPDF } from '../utils/pdfExport';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line, Bar, Doughnut, Pie } from 'react-chartjs-2';
import { getDemoData } from '../utils/demoData';
import { getUserProjectsFromRealtimeDb, listenToProjects } from '../utils/realtimeDatabase';
import { generateAIInsights, generateTimeSeriesData } from '../utils/aiAnalytics';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

// Generate dashboard metrics from projects
const generateDashboardFromProjects = (projects) => {
  // Generate default time series data
  const timeSeriesData = [];
  const months = ['May', 'June', 'July', 'Aug', 'Sept', 'Oct'];
  
  if (!projects || projects.length === 0) {
    // Return empty/default data structure with empty time series array
    for (let month = 0; month < 6; month++) {
      timeSeriesData.push({
        month: months[month],
        readiness: 0,
        projects: 0,
        dataQuality: 0
      });
    }
    
    return {
      aggregateMetrics: {
        totalProjects: 0,
        activeProjects: 0,
        completedProjects: 0,
        overallReadiness: 0,
        avgReadiness: 0,
        dataPoints: 0
      },
      departmentMetrics: {},
      timeSeriesData
    };
  }

  const activeProjects = projects.filter(p => p.status === 'Active' || p.status === 'In Progress').length;
  const completedProjects = projects.filter(p => p.status === 'Completed' || p.status === 'Deployed').length;
  const avgReadiness = projects.reduce((sum, p) => sum + (p.readinessScore || 0), 0) / projects.length;

  // Group by department
  const departmentMetrics = {};
  projects.forEach(project => {
    const dept = project.department || 'Unassigned';
    if (!departmentMetrics[dept]) {
      departmentMetrics[dept] = { count: 0, avgReadiness: 0, projects: [] };
    }
    departmentMetrics[dept].count++;
    departmentMetrics[dept].projects.push(project);
  });

  // Calculate average readiness per department
  Object.keys(departmentMetrics).forEach(dept => {
    const deptProjects = departmentMetrics[dept].projects;
    departmentMetrics[dept].avgReadiness = 
      deptProjects.reduce((sum, p) => sum + (p.readinessScore || 0), 0) / deptProjects.length;
  });

  // Generate time series data with actual project data
  for (let month = 0; month < 6; month++) {
    timeSeriesData.push({
      month: months[month],
      readiness: Math.min(100, Math.max(0, Math.round(avgReadiness + (month * 2) + (Math.random() * 10 - 5)))),
      projects: Math.max(1, Math.floor(projects.length * (0.5 + month * 0.1))),
      dataQuality: Math.min(100, Math.max(0, Math.round(avgReadiness + (month * 3) + (Math.random() * 10 - 5))))
    });
  }

  return {
    aggregateMetrics: {
      totalProjects: projects.length,
      activeProjects,
      completedProjects,
      overallReadiness: Math.round(avgReadiness),
      avgReadiness: Math.round(avgReadiness),
      dataPoints: projects.length * 20 // Simulated data points
    },
    departmentMetrics,
    timeSeriesData
  };
};

const Dashboard = () => {
  const { currentUser } = useAuth();
  const { success, error: showError } = useToast();
  const [projects, setProjects] = useState([]);
  const [aiInsights, setAIInsights] = useState(null);
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  const handleExportPDF = () => {
    if (!aggregateMetrics || !departmentMetrics) {
      showError('No data available to export');
      return;
    }
    
    const exportData = {
      overallReadiness: aggregateMetrics.overallReadiness,
      totalProjects: aggregateMetrics.totalProjects,
      activeProjects: aggregateMetrics.activeProjects,
      completedProjects: aggregateMetrics.completedProjects,
      departments: departmentMetrics.map(dept => ({
        name: dept.name,
        projects: dept.count,
        avgReadiness: dept.avgReadiness
      })),
      insights: aiInsights
    };
    
    const result = exportDashboardToPDF(exportData);
    if (result) {
      success('Dashboard exported to PDF successfully! 📄');
    } else {
      showError('Failed to export PDF. Please try again.');
    }
  };

  // Load and analyze projects data
  const loadAndAnalyzeData = useCallback(async (projectsData) => {
    setAnalyzing(true);
    try {
      console.log('🔄 Analyzing projects data...', projectsData);
      
      // Generate AI insights
      const insights = await generateAIInsights(projectsData);
      setAIInsights(insights);
      console.log('✅ AI Insights generated:', insights);
      
      // Generate dashboard metrics
      const data = generateDashboardFromProjects(projectsData);
      setDashboardData(data);
      console.log('✅ Dashboard data generated:', data);
      
      setLastUpdate(new Date());
    } catch (error) {
      console.error('❌ Error analyzing data:', error);
    } finally {
      setAnalyzing(false);
    }
  }, []);

  // Real-time listener for project changes
  useEffect(() => {
    let unsubscribe = null;

    const setupRealtimeListener = async () => {
      setLoading(true);
      try {
        if (currentUser?.isDemo) {
          // Demo user - use demo data
          const data = getDemoData();
          setProjects(data.projects || []);
          await loadAndAnalyzeData(data.projects || []);
        } else if (currentUser) {
          // Real user - set up real-time listener
          console.log('🔥 Setting up real-time project listener...');
          
          // Initial load
          const initialProjects = await getUserProjectsFromRealtimeDb(currentUser.uid);
          setProjects(initialProjects || []);
          await loadAndAnalyzeData(initialProjects || []);
          
          // Set up real-time listener for updates
          unsubscribe = listenToProjects(currentUser.uid, async (updatedProjects) => {
            console.log('🔔 Projects updated in real-time!', updatedProjects);
            setProjects(updatedProjects);
            await loadAndAnalyzeData(updatedProjects);
          });
        }
      } catch (error) {
        console.error('Error setting up dashboard:', error);
        setProjects([]);
        await loadAndAnalyzeData([]);
      } finally {
        setLoading(false);
      }
    };

    setupRealtimeListener();

    // Cleanup listener on unmount
    return () => {
      if (unsubscribe) {
        console.log('🔌 Cleaning up real-time listener');
        unsubscribe();
      }
    };
  }, [currentUser, loadAndAnalyzeData]);

  if (loading || !dashboardData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl text-gray-600">Loading dashboard...</div>
      </div>
    );
  }

  const { aggregateMetrics, departmentMetrics, timeSeriesData } = dashboardData;

  // Safety checks: ensure data is in correct format
  const safeTimeSeriesData = Array.isArray(timeSeriesData) ? timeSeriesData : [];
  const safeProjects = Array.isArray(projects) ? projects : [];
  const safeDepartmentMetrics = departmentMetrics && typeof departmentMetrics === 'object' ? departmentMetrics : {};

  // Chart configurations
  const trendChartData = {
    labels: safeTimeSeriesData.map(d => d.month),
    datasets: [
      {
        label: 'Overall Readiness Score',
        data: safeTimeSeriesData.map(d => d.readiness),
        borderColor: 'rgb(99, 102, 241)',
        backgroundColor: 'rgba(99, 102, 241, 0.1)',
        fill: true,
        tension: 0.4
      },
      {
        label: 'Data Quality Score',
        data: safeTimeSeriesData.map(d => d.dataQuality),
        borderColor: 'rgb(34, 197, 94)',
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        fill: true,
        tension: 0.4
      }
    ]
  };

  const departmentChartData = {
    labels: Object.keys(safeDepartmentMetrics),
    datasets: [{
      label: 'Average Readiness by Department',
      data: Object.values(safeDepartmentMetrics).map(d => d.avgReadiness),
      backgroundColor: [
        'rgba(99, 102, 241, 0.8)',
        'rgba(34, 197, 94, 0.8)',
        'rgba(234, 179, 8, 0.8)',
        'rgba(239, 68, 68, 0.8)',
        'rgba(168, 85, 247, 0.8)'
      ],
      borderColor: [
        'rgb(99, 102, 241)',
        'rgb(34, 197, 94)',
        'rgb(234, 179, 8)',
        'rgb(239, 68, 68)',
        'rgb(168, 85, 247)'
      ],
      borderWidth: 2
    }]
  };

  const projectStatusData = {
    labels: ['Planning', 'In Progress', 'Completed', 'On Hold'],
    datasets: [{
      data: [
        safeProjects.filter(p => p.status === 'Planning').length,
        safeProjects.filter(p => p.status === 'In Progress').length,
        safeProjects.filter(p => p.status === 'Completed').length,
        safeProjects.filter(p => p.status === 'On Hold').length
      ],
      backgroundColor: [
        'rgba(234, 179, 8, 0.8)',
        'rgba(59, 130, 246, 0.8)',
        'rgba(34, 197, 94, 0.8)',
        'rgba(156, 163, 175, 0.8)'
      ],
      borderColor: [
        'rgb(234, 179, 8)',
        'rgb(59, 130, 246)',
        'rgb(34, 197, 94)',
        'rgb(156, 163, 175)'
      ],
      borderWidth: 2
    }]
  };

  const projectTypeData = {
    labels: ['AI System', 'Automation', 'Analytics', 'Infrastructure'],
    datasets: [{
      data: [
        safeProjects.filter(p => p.type === 'AI System').length,
        safeProjects.filter(p => p.type === 'Automation').length,
        safeProjects.filter(p => p.type === 'Analytics').length,
        safeProjects.filter(p => p.type === 'Infrastructure').length
      ],
      backgroundColor: [
        'rgba(168, 85, 247, 0.8)',
        'rgba(99, 102, 241, 0.8)',
        'rgba(34, 197, 94, 0.8)',
        'rgba(234, 179, 8, 0.8)'
      ],
      borderColor: [
        'rgb(168, 85, 247)',
        'rgb(99, 102, 241)',
        'rgb(34, 197, 94)',
        'rgb(234, 179, 8)'
      ],
      borderWidth: 2
    }]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        position: 'top',
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100
      }
    }
  };

  const pieOptions = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        position: 'bottom',
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 py-8">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Hero Header with Stats */}
        <div className="mb-10 animate-fadeInDown">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-5xl font-extrabold mb-3 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                AI Readiness Dashboard
              </h1>
              <p className="text-gray-600 text-xl">Real-time enterprise AI and automation insights</p>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={handleExportPDF}
                className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-6 py-3 rounded-xl font-bold hover:shadow-xl hover:scale-105 transition-all duration-300 transform flex items-center gap-2"
                title="Export Dashboard to PDF"
              >
                📄 Export PDF
              </button>
              <div className="hidden md:flex items-center gap-3 bg-white rounded-2xl shadow-lg px-6 py-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-indigo-600">{aggregateMetrics.overallReadiness}%</div>
                  <div className="text-xs text-gray-500 font-semibold">READINESS</div>
                </div>
                <div className="w-px h-12 bg-gray-200"></div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">{aggregateMetrics.totalProjects}</div>
                  <div className="text-xs text-gray-500 font-semibold">PROJECTS</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Key Metrics Cards with Circular Progress */}
        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
            {[...Array(4)].map((_, idx) => (
              <MetricCardSkeleton key={idx} />
            ))}
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {/* Overall Readiness - Circular Progress */}
          <div className="bg-white rounded-3xl shadow-xl p-8 transform hover:scale-105 transition-all duration-500 hover:shadow-2xl animate-fadeInUp border-2 border-indigo-100 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 rounded-full -mr-16 -mt-16"></div>
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wide">Overall Readiness</h3>
                <span className="text-4xl">🎯</span>
              </div>
              <div className="flex items-center justify-center my-6">
                <div className="relative w-32 h-32">
                  <svg className="transform -rotate-90 w-32 h-32">
                    <circle cx="64" cy="64" r="56" stroke="#e5e7eb" strokeWidth="12" fill="none" />
                    <circle 
                      cx="64" cy="64" r="56" 
                      stroke="url(#gradient-indigo)" 
                      strokeWidth="12" 
                      fill="none" 
                      strokeDasharray={`${(aggregateMetrics.overallReadiness / 100) * 351.86} 351.86`}
                      strokeLinecap="round"
                      className="transition-all duration-1000 ease-out"
                    />
                    <defs>
                      <linearGradient id="gradient-indigo" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#6366f1" />
                        <stop offset="100%" stopColor="#8b5cf6" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-3xl font-extrabold text-indigo-600">{aggregateMetrics.overallReadiness}%</span>
                  </div>
                </div>
              </div>
              <p className="text-center text-sm text-gray-600 font-medium">Enterprise Average</p>
            </div>
          </div>

          {/* Total Projects - Enhanced Card */}
          <div className="bg-gradient-to-br from-blue-500 to-cyan-600 rounded-3xl shadow-xl p-8 text-white transform hover:scale-105 transition-all duration-500 hover:shadow-2xl animate-fadeInUp relative overflow-hidden" style={{animationDelay: '0.1s'}}>
            <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -mr-20 -mt-20"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-12 -mb-12"></div>
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold opacity-90 uppercase tracking-wide">Total Projects</h3>
                <span className="text-5xl">📊</span>
              </div>
              <p className="text-6xl font-extrabold mb-2">{aggregateMetrics.totalProjects}</p>
              <p className="text-sm opacity-90 mb-4">Active & completed portfolio</p>
              <div className="flex gap-1">
                {[...Array(Math.min(aggregateMetrics.totalProjects, 10))].map((_, i) => (
                  <div 
                    key={i} 
                    className="flex-1 h-2 bg-white/40 rounded-full animate-pulse" 
                    style={{animationDelay: `${i * 0.1}s`}}
                  ></div>
                ))}
                {aggregateMetrics.totalProjects > 10 && (
                  <span className="text-xs ml-2 opacity-80">+{aggregateMetrics.totalProjects - 10}</span>
                )}
              </div>
            </div>
          </div>

          {/* In Progress - Enhanced Card */}
          <div className="bg-gradient-to-br from-amber-500 to-orange-600 rounded-3xl shadow-xl p-8 text-white transform hover:scale-105 transition-all duration-500 hover:shadow-2xl animate-fadeInUp relative overflow-hidden" style={{animationDelay: '0.2s'}}>
            <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -mr-20 -mt-20"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-12 -mb-12"></div>
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold opacity-90 uppercase tracking-wide">In Progress</h3>
                <span className="text-5xl">⚡</span>
              </div>
              <p className="text-6xl font-extrabold mb-2">{aggregateMetrics.activeProjects}</p>
              <p className="text-sm opacity-90 mb-4">Currently active initiatives</p>
              <div className="flex items-center gap-3">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{animationDelay: '0s'}}></div>
                  <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                  <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{animationDelay: '0.4s'}}></div>
                </div>
                <span className="text-xs opacity-90 font-semibold">Live Tracking</span>
              </div>
            </div>
          </div>

          {/* Completed - Enhanced Card */}
          <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-3xl shadow-xl p-8 text-white transform hover:scale-105 transition-all duration-500 hover:shadow-2xl animate-fadeInUp relative overflow-hidden" style={{animationDelay: '0.3s'}}>
            <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -mr-20 -mt-20"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-12 -mb-12"></div>
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold opacity-90 uppercase tracking-wide">Completed</h3>
                <span className="text-5xl">✅</span>
              </div>
              <p className="text-6xl font-extrabold mb-2">{aggregateMetrics.completedProjects}</p>
              <p className="text-sm opacity-90 mb-4">Successfully deployed</p>
              <div className="flex items-center gap-3">
                <div className="text-3xl">🎉</div>
                <span className="text-xs opacity-90 font-semibold">Celebrating Success</span>
              </div>
            </div>
          </div>
          </div>
        )}

        {/* AI Insights Section */}
        {aiInsights && (
          <div className="mb-10 animate-fadeInUp" style={{animationDelay: '0.4s'}}>
            {/* AI Analysis Header with enhanced design */}
            <div className="bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 rounded-3xl shadow-2xl p-8 mb-8 text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32"></div>
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full -ml-24 -mb-24"></div>
              <div className="relative">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <div className="text-6xl animate-pulse">🤖</div>
                    <div>
                      <h2 className="text-3xl font-extrabold mb-1">AI-Powered Insights</h2>
                      <p className="text-sm opacity-90">Real-time analytics • Last updated {analyzing ? 'now' : lastUpdate.toLocaleTimeString()}</p>
                    </div>
                  </div>
                  {analyzing && (
                    <div className="flex items-center gap-3 bg-white/20 rounded-full px-4 py-2">
                      <div className="flex gap-1">
                        <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{animationDelay: '0s'}}></div>
                        <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                        <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{animationDelay: '0.4s'}}></div>
                      </div>
                      <span className="text-sm font-semibold">Analyzing</span>
                    </div>
                  )}
                </div>
                <p className="text-xl leading-relaxed font-light">{aiInsights.summary}</p>
              </div>
            </div>

            {/* Key Recommendations with enhanced cards */}
            {aiInsights.recommendations && aiInsights.recommendations.length > 0 && (
              <div className="bg-white rounded-3xl shadow-2xl p-8 mb-8 border border-gray-100">
                <h3 className="text-2xl font-extrabold text-gray-900 mb-6 flex items-center gap-3">
                  <span className="text-4xl">💡</span> 
                  <span>Priority Recommendations</span>
                  <span className="ml-auto bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-sm font-bold">
                    {aiInsights.recommendations.length} Actions
                  </span>
                </h3>
                <div className="space-y-4">
                  {aiInsights.recommendations.map((rec, index) => (
                    <div key={index} className={`p-6 rounded-2xl border-l-4 transform hover:scale-102 transition-all duration-300 hover:shadow-lg ${
                      rec.priority === 'high' ? 'bg-red-50 border-red-500 hover:bg-red-100' :
                      rec.priority === 'medium' ? 'bg-yellow-50 border-yellow-500 hover:bg-yellow-100' :
                      'bg-blue-50 border-blue-500 hover:bg-blue-100'
                    }`}>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-3">
                            <span className={`px-3 py-1 rounded-full text-xs font-extrabold shadow-sm ${
                              rec.priority === 'high' ? 'bg-red-500 text-white' :
                              rec.priority === 'medium' ? 'bg-yellow-500 text-white' :
                              'bg-blue-500 text-white'
                            }`}>
                              {rec.priority.toUpperCase()} PRIORITY
                            </span>
                            <span className="px-3 py-1 bg-white rounded-full text-xs text-gray-700 font-bold shadow-sm">{rec.category}</span>
                          </div>
                          <h4 className="font-extrabold text-gray-900 text-lg mb-2">{rec.title}</h4>
                          <p className="text-sm text-gray-700 mb-3 leading-relaxed">{rec.description}</p>
                          <div className="flex items-start gap-2 bg-white/50 rounded-lg p-3">
                            <span className="text-lg">→</span>
                            <p className="text-sm text-gray-800 font-medium">{rec.action}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Trends and Predictions Grid - Enhanced */}
            <div className="grid md:grid-cols-2 gap-8 mb-8">
              {/* Current Trends */}
              {aiInsights.trends && aiInsights.trends.length > 0 && (
                <div className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 rounded-3xl shadow-xl p-8 border border-blue-200 hover:shadow-2xl transition-shadow duration-300">
                  <h3 className="text-2xl font-extrabold text-gray-900 mb-6 flex items-center gap-3">
                    <span className="text-4xl">📈</span> Current Trends
                  </h3>
                  <div className="space-y-5">
                    {aiInsights.trends.map((trend, index) => (
                      <div key={index} className="bg-white rounded-2xl p-5 shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105">
                        <div className="flex items-center justify-between mb-3">
                          <span className="font-bold text-gray-900 text-lg">{trend.metric}</span>
                          <span className={`text-3xl ${
                            trend.direction === 'up' ? 'text-green-500' :
                            trend.direction === 'down' ? 'text-red-500' :
                            'text-gray-500'
                          }`}>
                            {trend.direction === 'up' ? '↗️' : trend.direction === 'down' ? '↘️' : '→'}
                          </span>
                        </div>
                        <p className="text-3xl font-extrabold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">{trend.value}</p>
                        <p className="text-sm text-gray-600 leading-relaxed">{trend.insight}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Predictions */}
              {aiInsights.predictions && (
                <div className="bg-gradient-to-br from-purple-50 via-pink-50 to-rose-50 rounded-3xl shadow-xl p-8 border border-purple-200 hover:shadow-2xl transition-shadow duration-300">
                  <h3 className="text-2xl font-extrabold text-gray-900 mb-6 flex items-center gap-3">
                    <span className="text-4xl">🔮</span> AI Predictions
                  </h3>
                  <div className="space-y-5">
                    <div className="bg-white rounded-2xl p-6 shadow-md hover:shadow-lg transition-all duration-300">
                      <div className="flex items-center gap-2 mb-4">
                        <span className="text-2xl">📅</span>
                        <h4 className="font-extrabold text-gray-900 text-lg">Next Month Forecast</h4>
                      </div>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between p-3 bg-blue-50 rounded-xl">
                          <span className="text-sm font-semibold text-gray-700">Expected Completions:</span>
                          <span className="text-xl font-extrabold text-blue-600">{aiInsights.predictions.nextMonth.expectedCompletions}</span>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-purple-50 rounded-xl">
                          <span className="text-sm font-semibold text-gray-700">Confidence Level:</span>
                          <span className={`px-3 py-1 rounded-full text-xs font-extrabold ${
                            aiInsights.predictions.nextMonth.confidenceLevel === 'high' ? 'bg-green-500 text-white' :
                            aiInsights.predictions.nextMonth.confidenceLevel === 'medium' ? 'bg-yellow-500 text-white' :
                            'bg-red-500 text-white'
                          }`}>
                            {aiInsights.predictions.nextMonth.confidenceLevel.toUpperCase()}
                          </span>
                        </div>
                        <div className="p-3 bg-indigo-50 rounded-xl">
                          <span className="text-sm font-semibold text-gray-700 block mb-1">Readiness Trend:</span>
                          <span className="text-sm text-indigo-700 font-medium">{aiInsights.predictions.nextMonth.readinessTrend}</span>
                        </div>
                      </div>
                    </div>
                    <div className="bg-white rounded-2xl p-6 shadow-md hover:shadow-lg transition-all duration-300">
                      <div className="flex items-center gap-2 mb-4">
                        <span className="text-2xl">📊</span>
                        <h4 className="font-extrabold text-gray-900 text-lg">Quarterly Outlook</h4>
                      </div>
                      <div className="space-y-3">
                        <div className="p-3 bg-green-50 rounded-xl">
                          <span className="text-sm font-semibold text-gray-700 block mb-1">Portfolio Growth:</span>
                          <span className="text-lg text-green-700 font-bold">{aiInsights.predictions.nextQuarter.portfolioGrowth}</span>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-blue-50 rounded-xl">
                          <span className="text-sm font-semibold text-gray-700">Target Readiness:</span>
                          <span className="text-xl font-extrabold text-blue-600">{aiInsights.predictions.nextQuarter.readinessTarget}%</span>
                        </div>
                        <div className="p-3 bg-purple-50 rounded-xl">
                          <span className="text-sm font-semibold text-gray-700 block mb-1">Recommendation:</span>
                          <span className="text-sm text-purple-700 font-medium">{aiInsights.predictions.nextQuarter.recommendation}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Risk Factors - Enhanced */}
            {aiInsights.riskFactors && aiInsights.riskFactors.length > 0 && (
              <div className="bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 rounded-3xl shadow-xl p-8 mb-8 border-2 border-red-200">
                <h3 className="text-2xl font-extrabold text-gray-900 mb-6 flex items-center gap-3">
                  <span className="text-4xl">⚠️</span> 
                  <span>Risk Factors</span>
                  <span className="ml-auto bg-red-100 text-red-700 px-3 py-1 rounded-full text-sm font-bold">
                    {aiInsights.riskFactors.length} Identified
                  </span>
                </h3>
                <div className="space-y-4">
                  {aiInsights.riskFactors.map((risk, index) => (
                    <div key={index} className="bg-white rounded-2xl p-6 shadow-md hover:shadow-xl transition-all duration-300 transform hover:scale-102">
                      <div className="flex items-start gap-4">
                        <div className="flex-shrink-0">
                          <span className={`inline-flex items-center justify-center w-16 h-16 rounded-full text-2xl ${
                            risk.level === 'high' ? 'bg-red-100 text-red-600' :
                            risk.level === 'medium' ? 'bg-yellow-100 text-yellow-600' :
                            'bg-gray-100 text-gray-600'
                          }`}>
                            {risk.level === 'high' ? '🚨' : risk.level === 'medium' ? '⚡' : 'ℹ️'}
                          </span>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-3">
                            <span className={`px-3 py-1 rounded-full text-xs font-extrabold shadow-sm ${
                              risk.level === 'high' ? 'bg-red-500 text-white' :
                              risk.level === 'medium' ? 'bg-yellow-500 text-white' :
                              'bg-gray-500 text-white'
                            }`}>
                              {risk.level.toUpperCase()} RISK
                            </span>
                          </div>
                          <h4 className="font-extrabold text-gray-900 text-lg mb-3">{risk.risk}</h4>
                          <div className="bg-orange-50 rounded-xl p-4 mb-3">
                            <span className="text-sm font-bold text-gray-700 block mb-1">💥 Impact:</span>
                            <p className="text-sm text-gray-800">{risk.impact}</p>
                          </div>
                          <div className="bg-green-50 rounded-xl p-4">
                            <span className="text-sm font-bold text-gray-700 block mb-1">✅ Mitigation Strategy:</span>
                            <p className="text-sm text-gray-800">{risk.mitigation}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Charts Row 1 */}
        {loading ? (
          <>
            <div className="grid lg:grid-cols-2 gap-6 mb-6">
              <ChartSkeleton />
              <ChartSkeleton />
            </div>
            <div className="grid lg:grid-cols-2 gap-6 mb-6">
              <ChartSkeleton />
              <ChartSkeleton />
            </div>
          </>
        ) : (
          <>
            <div className="grid lg:grid-cols-2 gap-6 mb-6">
          {/* Trend Chart */}
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-gray-100 hover:shadow-2xl transition-all duration-300 animate-fadeInUp">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">📈 AI Readiness Trends</h3>
              <span className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs font-semibold">6 Months</span>
            </div>
            <Line data={trendChartData} options={chartOptions} />
          </div>

          {/* Department Performance */}
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-gray-100 hover:shadow-2xl transition-all duration-300 animate-fadeInUp" style={{animationDelay: '0.1s'}}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">🏢 Department Performance</h3>
              <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold">Live Data</span>
            </div>
            <Bar data={departmentChartData} options={chartOptions} />
          </div>
        </div>

        {/* Charts Row 2 */}
        <div className="grid lg:grid-cols-2 gap-6 mb-6">
          {/* Project Status Distribution */}
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-gray-100 hover:shadow-2xl transition-all duration-300 animate-fadeInUp" style={{animationDelay: '0.2s'}}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">📊 Project Status</h3>
              <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-semibold">Distribution</span>
            </div>
            <div className="max-w-md mx-auto">
              <Doughnut data={projectStatusData} options={pieOptions} />
            </div>
          </div>

          {/* Project Type Distribution */}
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-gray-100 hover:shadow-2xl transition-all duration-300 animate-fadeInUp" style={{animationDelay: '0.3s'}}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">🎯 Project Types</h3>
              <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">Categories</span>
            </div>
            <div className="max-w-md mx-auto">
              <Pie data={projectTypeData} options={pieOptions} />
            </div>
          </div>
        </div>

        {/* Department Details */}
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-6 mb-6 border border-gray-100 animate-fadeInUp">
          <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <span>🏭</span> Department Breakdown
          </h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(safeDepartmentMetrics).map(([dept, metrics]) => (
              <div key={dept} className="border-2 border-gray-100 rounded-xl p-5 hover:border-indigo-300 hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-white to-gray-50">
                <h4 className="font-bold text-gray-900 mb-3 text-lg">{dept}</h4>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Projects:</span>
                    <span className="font-bold text-indigo-600 text-lg">{metrics.projectCount || metrics.count || 0}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Avg Readiness:</span>
                    <span className="font-bold text-purple-600 text-lg">{Math.round(metrics.avgReadiness || 0)}%</span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-500"
                      style={{width: `${Math.round(metrics.avgReadiness || 0)}%`}}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Projects */}
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-6 mb-6 border border-gray-100 animate-fadeInUp">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <span>📋</span> Recent Projects
            </h3>
            <Link to="/projects" className="text-indigo-600 hover:text-indigo-700 font-semibold flex items-center gap-1 hover:gap-2 transition-all duration-300">
              View All <span>→</span>
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-gray-200 bg-gray-50">
                  <th className="text-left py-4 px-4 font-bold text-gray-700">Project Name</th>
                  <th className="text-left py-4 px-4 font-bold text-gray-700">Type</th>
                  <th className="text-left py-4 px-4 font-bold text-gray-700">Department</th>
                  <th className="text-left py-4 px-4 font-bold text-gray-700">Status</th>
                  <th className="text-left py-4 px-4 font-bold text-gray-700">Readiness</th>
                </tr>
              </thead>
              <tbody>
                {safeProjects.slice(0, 5).map((project, idx) => (
                  <tr key={project.id} className="border-b border-gray-100 hover:bg-indigo-50 transition-colors duration-200" style={{animationDelay: `${idx * 0.05}s`}}>
                    <td className="py-4 px-4 font-semibold text-gray-900">{project.name}</td>
                    <td className="py-4 px-4 text-gray-600">{project.type}</td>
                    <td className="py-4 px-4 text-gray-600">{project.department}</td>
                    <td className="py-4 px-4">
                      <span className={`px-3 py-1.5 rounded-full text-xs font-bold shadow-sm ${
                        project.status === 'Completed' ? 'bg-gradient-to-r from-green-400 to-emerald-500 text-white' :
                        project.status === 'In Progress' ? 'bg-gradient-to-r from-blue-400 to-indigo-500 text-white' :
                        project.status === 'Planning' ? 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white' :
                        'bg-gray-200 text-gray-700'
                      }`}>
                        {project.status}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <div className="flex-grow bg-gray-200 rounded-full h-3 w-28 overflow-hidden">
                          <div
                            className="bg-gradient-to-r from-indigo-500 to-purple-500 h-3 rounded-full transition-all duration-500"
                            style={{ width: `${project.readinessScore}%` }}
                          ></div>
                        </div>
                        <span className="font-bold text-gray-900 min-w-[3rem] text-right">{project.readinessScore}%</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Action Items */}
        <div className="grid md:grid-cols-2 gap-6 animate-fadeInUp">
          <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-xl p-8 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-12 -mb-12"></div>
            <div className="relative z-10">
              <h3 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <span>📈</span> Key Insights
              </h3>
              <ul className="space-y-4">
                <li className="flex items-start gap-3 bg-white/10 backdrop-blur-sm rounded-xl p-4 hover:bg-white/20 transition-all duration-300">
                  <span className="text-green-300 font-bold text-xl">✓</span>
                  <span className="leading-relaxed">Overall readiness has improved by 15% this quarter</span>
                </li>
                <li className="flex items-start gap-3 bg-white/10 backdrop-blur-sm rounded-xl p-4 hover:bg-white/20 transition-all duration-300">
                  <span className="text-yellow-300 font-bold text-xl">!</span>
                  <span className="leading-relaxed">2 projects need attention to meet deadlines</span>
                </li>
                <li className="flex items-start gap-3 bg-white/10 backdrop-blur-sm rounded-xl p-4 hover:bg-white/20 transition-all duration-300">
                  <span className="text-blue-300 font-bold text-xl">→</span>
                  <span className="leading-relaxed">Consider expanding AI initiatives in top-performing departments</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl shadow-xl p-8 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-12 -mb-12"></div>
            <div className="relative z-10">
              <h3 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <span>🎯</span> Recommendations
              </h3>
              <ul className="space-y-4">
                <li className="flex items-start gap-3 bg-white/10 backdrop-blur-sm rounded-xl p-4 hover:bg-white/20 transition-all duration-300">
                  <span className="font-bold text-xl">1.</span>
                  <span className="leading-relaxed">Focus on data quality improvements for projects below 60%</span>
                </li>
                <li className="flex items-start gap-3 bg-white/10 backdrop-blur-sm rounded-xl p-4 hover:bg-white/20 transition-all duration-300">
                  <span className="font-bold text-xl">2.</span>
                  <span className="leading-relaxed">Share best practices from completed projects</span>
                </li>
                <li className="flex items-start gap-3 bg-white/10 backdrop-blur-sm rounded-xl p-4 hover:bg-white/20 transition-all duration-300">
                  <span className="font-bold text-xl">3.</span>
                  <span className="leading-relaxed">Schedule cross-department collaboration sessions</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
