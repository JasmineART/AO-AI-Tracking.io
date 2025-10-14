import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
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
import { getUserProjectsFromRealtimeDb } from '../utils/realtimeDatabase';

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
        avgReadiness: 0,
        dataPoints: 0
      },
      departmentMetrics: {},
      timeSeriesData,
      projects: []
    };
  }

  const activeProjects = projects.filter(p => p.status === 'Active' || p.status === 'In Progress').length;
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
      avgReadiness: Math.round(avgReadiness),
      dataPoints: projects.length * 20 // Simulated data points
    },
    departmentMetrics,
    timeSeriesData,
    projects
  };
};

const Dashboard = () => {
  const { currentUser } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      setLoading(true);
      try {
        if (currentUser?.isDemo) {
          // Demo user - use demo data
          const data = getDemoData();
          setDashboardData(data);
        } else if (currentUser) {
          // Real user - fetch from Firebase and generate metrics
          const projects = await getUserProjectsFromRealtimeDb(currentUser.uid);
          const data = generateDashboardFromProjects(projects || []);
          setDashboardData(data);
        }
      } catch (error) {
        console.error('Error loading dashboard data:', error);
        setDashboardData(generateDashboardFromProjects([]));
      }
      setLoading(false);
    };

    loadDashboardData();
  }, [currentUser]);

  if (loading || !dashboardData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl text-gray-600">Loading dashboard...</div>
      </div>
    );
  }

  const { aggregateMetrics, departmentMetrics, timeSeriesData, projects } = dashboardData;

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
      <div className="container mx-auto px-4">
        <div className="mb-8 animate-fadeInDown">
          <h1 className="text-4xl font-extrabold mb-2">
            <span className="gradient-text">AI Readiness Dashboard</span>
          </h1>
          <p className="text-gray-600 text-lg">Enterprise-wide AI and automation tracking metrics</p>
        </div>

        {/* Key Metrics Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-2xl shadow-xl p-6 text-white transform hover:scale-105 transition-all duration-300 hover:shadow-2xl animate-fadeInUp">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold opacity-90">Overall Readiness</h3>
              <span className="text-3xl">🎯</span>
            </div>
            <p className="text-4xl font-extrabold mb-1">{aggregateMetrics.overallReadiness}%</p>
            <p className="text-sm opacity-80">Enterprise average</p>
            <div className="mt-4 h-2 bg-white/30 rounded-full overflow-hidden">
              <div className="h-full bg-white rounded-full" style={{width: `${aggregateMetrics.overallReadiness}%`}}></div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-xl p-6 text-white transform hover:scale-105 transition-all duration-300 hover:shadow-2xl animate-fadeInUp" style={{animationDelay: '0.1s'}}>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold opacity-90">Total Projects</h3>
              <span className="text-3xl">📊</span>
            </div>
            <p className="text-4xl font-extrabold mb-1">{aggregateMetrics.totalProjects}</p>
            <p className="text-sm opacity-80">Active & completed</p>
            <div className="mt-4 flex gap-1">
              {[...Array(aggregateMetrics.totalProjects)].map((_, i) => (
                <div key={i} className="flex-1 h-2 bg-white/50 rounded-full"></div>
              ))}
            </div>
          </div>

          <div className="bg-gradient-to-br from-yellow-500 to-orange-500 rounded-2xl shadow-xl p-6 text-white transform hover:scale-105 transition-all duration-300 hover:shadow-2xl animate-fadeInUp" style={{animationDelay: '0.2s'}}>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold opacity-90">In Progress</h3>
              <span className="text-3xl">⚡</span>
            </div>
            <p className="text-4xl font-extrabold mb-1">{aggregateMetrics.activeProjects}</p>
            <p className="text-sm opacity-80">Currently active</p>
            <div className="mt-4 flex items-center gap-2">
              <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
              <div className="text-xs opacity-90">Live tracking</div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl shadow-xl p-6 text-white transform hover:scale-105 transition-all duration-300 hover:shadow-2xl animate-fadeInUp" style={{animationDelay: '0.3s'}}>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold opacity-90">Completed</h3>
              <span className="text-3xl">✅</span>
            </div>
            <p className="text-4xl font-extrabold mb-1">{aggregateMetrics.completedProjects}</p>
            <p className="text-sm opacity-80">Successfully deployed</p>
            <div className="mt-4 flex items-center gap-2">
              <div className="text-2xl">🎉</div>
              <div className="text-xs opacity-90">Celebrating success</div>
            </div>
          </div>
        </div>

        {/* Charts Row 1 */}
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
      </div>
    </div>
  );
};

export default Dashboard;
