import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
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

ChartJS.register(
  CategoryScale, LinearScale, PointElement, LineElement,
  BarElement, ArcElement, Title, Tooltip, Legend, Filler
);

// ========== Demo Data ==========
const generateClientProfiles = () => [
  {
    id: 'cl-001',
    name: 'Acme Corporation',
    industry: 'Technology',
    contact: 'John Reynolds',
    email: 'j.reynolds@acme.com',
    phone: '(555) 234-5678',
    plan: 'Enterprise',
    status: 'Active',
    onboardDate: '2024-03-15',
    projects: 8,
    monthlyVisitors: { web: 45200, app: 32100 },
    satisfaction: 94,
    revenue: '$24,500/mo',
    avatar: '🏭'
  },
  {
    id: 'cl-002',
    name: 'GlobalFinance Ltd',
    industry: 'Finance',
    contact: 'Sarah Mitchell',
    email: 's.mitchell@globalfin.com',
    phone: '(555) 345-6789',
    plan: 'Professional',
    status: 'Active',
    onboardDate: '2024-06-01',
    projects: 5,
    monthlyVisitors: { web: 28400, app: 19800 },
    satisfaction: 88,
    revenue: '$12,800/mo',
    avatar: '🏦'
  },
  {
    id: 'cl-003',
    name: 'HealthFirst Medical',
    industry: 'Healthcare',
    contact: 'Dr. Emily Carter',
    email: 'e.carter@healthfirst.org',
    phone: '(555) 456-7890',
    plan: 'Enterprise',
    status: 'Active',
    onboardDate: '2024-01-20',
    projects: 12,
    monthlyVisitors: { web: 67800, app: 51200 },
    satisfaction: 96,
    revenue: '$38,200/mo',
    avatar: '🏥'
  },
  {
    id: 'cl-004',
    name: 'EduTech Solutions',
    industry: 'Education',
    contact: 'Marcus Lee',
    email: 'm.lee@edutech.io',
    phone: '(555) 567-8901',
    plan: 'Starter',
    status: 'Active',
    onboardDate: '2025-01-10',
    projects: 3,
    monthlyVisitors: { web: 12600, app: 8900 },
    satisfaction: 82,
    revenue: '$4,200/mo',
    avatar: '🎓'
  },
  {
    id: 'cl-005',
    name: 'RetailMax Group',
    industry: 'Retail',
    contact: 'Angela Torres',
    email: 'a.torres@retailmax.com',
    phone: '(555) 678-9012',
    plan: 'Professional',
    status: 'Pending Review',
    onboardDate: '2025-02-28',
    projects: 4,
    monthlyVisitors: { web: 19300, app: 14700 },
    satisfaction: 79,
    revenue: '$8,900/mo',
    avatar: '🛒'
  },
  {
    id: 'cl-006',
    name: 'LogiTrack Systems',
    industry: 'Logistics',
    contact: 'David Nakamura',
    email: 'd.nakamura@logitrack.com',
    phone: '(555) 789-0123',
    plan: 'Enterprise',
    status: 'Active',
    onboardDate: '2024-09-05',
    projects: 7,
    monthlyVisitors: { web: 34100, app: 28600 },
    satisfaction: 91,
    revenue: '$19,700/mo',
    avatar: '🚛'
  }
];

const generateVisitorData = () => {
  const months = ['Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar'];
  return {
    labels: months,
    web: [142000, 158000, 171000, 165000, 183000, 207300],
    app: [98000, 112000, 124000, 118000, 136000, 155300],
    bounceRate: [32, 29, 27, 30, 25, 22],
    avgSession: [4.2, 4.5, 4.8, 4.3, 5.1, 5.6],
    conversionRate: [2.8, 3.1, 3.4, 3.0, 3.7, 4.2]
  };
};

const generatePerformanceData = () => ({
  uptime: 99.97,
  avgResponseTime: 142,
  errorRate: 0.03,
  activeUsers: 3842,
  peakConcurrent: 1247,
  apiCalls: '2.4M',
  dataProcessed: '847 GB',
  aiModelsActive: 23,
  pageLoadTime: 1.8,
  mobileScore: 94,
  desktopScore: 98,
  seoScore: 92
});

// ========== Sub-Components ==========

const MetricCard = ({ label, value, change, icon, color = 'indigo' }) => {
  const isPositive = change && !change.startsWith('-');
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-5 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-gray-100 dark:border-gray-700">
      <div className="flex items-center justify-between mb-3">
        <span className="text-2xl">{icon}</span>
        {change && (
          <span className={`text-xs font-bold px-2 py-1 rounded-full ${isPositive ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'}`}>
            {change}
          </span>
        )}
      </div>
      <div className="text-2xl font-extrabold text-gray-900 dark:text-white">{value}</div>
      <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">{label}</div>
    </div>
  );
};

const ClientProfileCard = ({ client, onSelect, isSelected }) => {
  const statusColor = client.status === 'Active'
    ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
    : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400';

  return (
    <div
      onClick={() => onSelect(client)}
      className={`bg-white dark:bg-gray-800 rounded-xl shadow-md p-5 cursor-pointer transition-all duration-300 hover:shadow-xl hover:-translate-y-1 border-2 ${
        isSelected ? 'border-indigo-500 ring-2 ring-indigo-200 dark:ring-indigo-800' : 'border-transparent hover:border-indigo-200 dark:hover:border-indigo-700'
      }`}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <span className="text-3xl">{client.avatar}</span>
          <div>
            <h3 className="font-bold text-gray-900 dark:text-white text-sm">{client.name}</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">{client.industry}</p>
          </div>
        </div>
        <span className={`text-xs font-semibold px-2 py-1 rounded-full ${statusColor}`}>{client.status}</span>
      </div>
      <div className="grid grid-cols-3 gap-2 text-center mt-4">
        <div>
          <div className="text-sm font-bold text-gray-900 dark:text-white">{client.projects}</div>
          <div className="text-xs text-gray-500 dark:text-gray-400">Projects</div>
        </div>
        <div>
          <div className="text-sm font-bold text-gray-900 dark:text-white">{client.satisfaction}%</div>
          <div className="text-xs text-gray-500 dark:text-gray-400">Satisfaction</div>
        </div>
        <div>
          <div className="text-sm font-bold text-indigo-600 dark:text-indigo-400">{client.revenue}</div>
          <div className="text-xs text-gray-500 dark:text-gray-400">Revenue</div>
        </div>
      </div>
    </div>
  );
};

// ========== Main Component ==========

const CompanyPortal = () => {
  const { currentUser } = useAuth();
  const { success } = useToast();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('overview');
  const [clients] = useState(generateClientProfiles);
  const [selectedClient, setSelectedClient] = useState(null);
  const [visitorData] = useState(generateVisitorData);
  const [perfData] = useState(generatePerformanceData);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  const employeeRole = sessionStorage.getItem('employeeRole') || 'customer_service';

  const roleLabelMap = {
    customer_service: 'Customer Service',
    account_manager: 'Account Manager',
    team_lead: 'Team Lead',
    admin: 'Administrator'
  };

  // Filtered clients
  const filteredClients = clients.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.contact.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.industry.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'all' || c.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  // Aggregate stats
  const totalWebVisitors = clients.reduce((sum, c) => sum + c.monthlyVisitors.web, 0);
  const totalAppVisitors = clients.reduce((sum, c) => sum + c.monthlyVisitors.app, 0);
  const avgSatisfaction = Math.round(clients.reduce((sum, c) => sum + c.satisfaction, 0) / clients.length);
  const totalProjects = clients.reduce((sum, c) => sum + c.projects, 0);

  // ========== Chart Configs ==========
  const visitorTrendChart = {
    data: {
      labels: visitorData.labels,
      datasets: [
        {
          label: 'Web Visitors',
          data: visitorData.web,
          borderColor: '#6366f1',
          backgroundColor: 'rgba(99, 102, 241, 0.1)',
          fill: true,
          tension: 0.4,
          pointRadius: 4,
          pointHoverRadius: 6
        },
        {
          label: 'App Visitors',
          data: visitorData.app,
          borderColor: '#8b5cf6',
          backgroundColor: 'rgba(139, 92, 246, 0.1)',
          fill: true,
          tension: 0.4,
          pointRadius: 4,
          pointHoverRadius: 6
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { position: 'top' } },
      scales: {
        y: { beginAtZero: true, ticks: { callback: (v) => (v / 1000).toFixed(0) + 'K' } }
      }
    }
  };

  const clientIndustryChart = {
    data: {
      labels: [...new Set(clients.map(c => c.industry))],
      datasets: [{
        data: [...new Set(clients.map(c => c.industry))].map(
          ind => clients.filter(c => c.industry === ind).length
        ),
        backgroundColor: ['#6366f1', '#8b5cf6', '#a78bfa', '#c4b5fd', '#818cf8', '#6d28d9'],
        borderWidth: 0
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { position: 'bottom', labels: { padding: 16 } } }
    }
  };

  const performanceBarChart = {
    data: {
      labels: visitorData.labels,
      datasets: [
        {
          label: 'Bounce Rate (%)',
          data: visitorData.bounceRate,
          backgroundColor: '#f87171',
          borderRadius: 6
        },
        {
          label: 'Conversion Rate (%)',
          data: visitorData.conversionRate,
          backgroundColor: '#34d399',
          borderRadius: 6
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { position: 'top' } },
      scales: { y: { beginAtZero: true, max: 40 } }
    }
  };

  const sessionDurationChart = {
    data: {
      labels: visitorData.labels,
      datasets: [{
        label: 'Avg Session (min)',
        data: visitorData.avgSession,
        borderColor: '#f59e0b',
        backgroundColor: 'rgba(245, 158, 11, 0.15)',
        fill: true,
        tension: 0.4,
        pointRadius: 5,
        pointBackgroundColor: '#f59e0b'
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { position: 'top' } },
      scales: { y: { beginAtZero: true } }
    }
  };

  const planDistributionChart = {
    data: {
      labels: ['Enterprise', 'Professional', 'Starter'],
      datasets: [{
        data: [
          clients.filter(c => c.plan === 'Enterprise').length,
          clients.filter(c => c.plan === 'Professional').length,
          clients.filter(c => c.plan === 'Starter').length
        ],
        backgroundColor: ['#6366f1', '#8b5cf6', '#c4b5fd'],
        borderWidth: 0
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { position: 'bottom' } }
    }
  };

  // Tabs
  const tabs = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'clients', label: 'Client Profiles', icon: '👥' },
    { id: 'visitors', label: 'Web & App Visitors', icon: '🌐' },
    { id: 'performance', label: 'Performance', icon: '⚡' }
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-12">
      {/* Portal Header */}
      <div className="bg-gradient-to-r from-slate-800 via-blue-900 to-indigo-900 text-white">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <span className="text-2xl">🏢</span>
                <h1 className="text-2xl font-extrabold">Company Portal</h1>
                <span className="text-xs bg-white/20 px-3 py-1 rounded-full font-semibold">
                  {roleLabelMap[employeeRole] || 'Employee'}
                </span>
              </div>
              <p className="text-blue-200 text-sm">
                Welcome, {currentUser?.displayName || currentUser?.email || 'Team Member'} — Client management & analytics dashboard
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Link
                to="/dashboard"
                className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-sm font-semibold hover:bg-white/20 transition-all"
              >
                📊 AI Dashboard
              </Link>
              <Link
                to="/"
                className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-sm font-semibold hover:bg-white/20 transition-all"
              >
                🏠 Main Site
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm sticky top-16" style={{ zIndex: 30 }}>
        <div className="container mx-auto px-4">
          <div className="flex gap-1 overflow-x-auto py-2 scrollbar-hide">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 rounded-lg text-sm font-semibold whitespace-nowrap transition-all duration-200 ${
                  activeTab === tab.id
                    ? 'bg-indigo-600 text-white shadow-lg'
                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                {tab.icon} {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 mt-6">
        {/* ========== OVERVIEW TAB ========== */}
        {activeTab === 'overview' && (
          <div className="space-y-6 animate-fadeInUp">
            {/* KPI Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <MetricCard icon="🌐" label="Total Web Visitors" value={totalWebVisitors.toLocaleString()} change="+13.3%" />
              <MetricCard icon="📱" label="Total App Visitors" value={totalAppVisitors.toLocaleString()} change="+14.2%" />
              <MetricCard icon="⭐" label="Avg Satisfaction" value={`${avgSatisfaction}%`} change="+2.1%" />
              <MetricCard icon="🚀" label="Active Projects" value={totalProjects} change="+3" />
            </div>

            {/* Charts Row */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-100 dark:border-gray-700">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">📈 Visitor Trends (6 Months)</h3>
                <div className="h-64">
                  <Line data={visitorTrendChart.data} options={visitorTrendChart.options} />
                </div>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-100 dark:border-gray-700">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">🏢 Clients by Industry</h3>
                <div className="h-64">
                  <Doughnut data={clientIndustryChart.data} options={clientIndustryChart.options} />
                </div>
              </div>
            </div>

            {/* Performance + Plan */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-100 dark:border-gray-700">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">📊 Bounce vs Conversion Rate</h3>
                <div className="h-64">
                  <Bar data={performanceBarChart.data} options={performanceBarChart.options} />
                </div>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-100 dark:border-gray-700">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">📋 Client Plans</h3>
                <div className="h-64">
                  <Pie data={planDistributionChart.data} options={planDistributionChart.options} />
                </div>
              </div>
            </div>

            {/* Quick Stats Bar */}
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl p-6 text-white shadow-xl">
              <h3 className="font-bold text-lg mb-4">⚡ Platform Performance</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-3xl font-extrabold">{perfData.uptime}%</div>
                  <div className="text-sm opacity-80">Uptime</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-extrabold">{perfData.avgResponseTime}ms</div>
                  <div className="text-sm opacity-80">Avg Response</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-extrabold">{perfData.activeUsers.toLocaleString()}</div>
                  <div className="text-sm opacity-80">Active Users</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-extrabold">{perfData.apiCalls}</div>
                  <div className="text-sm opacity-80">API Calls/mo</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========== CLIENT PROFILES TAB ========== */}
        {activeTab === 'clients' && (
          <div className="space-y-6 animate-fadeInUp">
            {/* Search + Filter */}
            <div className="flex flex-col md:flex-row gap-3">
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search clients by name, contact, or industry..."
                  className="w-full px-4 py-3 pl-10 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                />
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
              </div>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
              >
                <option value="all">All Status</option>
                <option value="Active">Active</option>
                <option value="Pending Review">Pending Review</option>
              </select>
            </div>

            {/* Client Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredClients.map((client) => (
                <ClientProfileCard
                  key={client.id}
                  client={client}
                  onSelect={setSelectedClient}
                  isSelected={selectedClient?.id === client.id}
                />
              ))}
            </div>

            {filteredClients.length === 0 && (
              <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                <span className="text-4xl block mb-3">🔍</span>
                No clients match your search criteria.
              </div>
            )}

            {/* Selected Client Detail */}
            {selectedClient && (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-6 border border-gray-100 dark:border-gray-700 animate-fadeInUp">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <span className="text-4xl">{selectedClient.avatar}</span>
                    <div>
                      <h2 className="text-xl font-extrabold text-gray-900 dark:text-white">{selectedClient.name}</h2>
                      <p className="text-gray-500 dark:text-gray-400">{selectedClient.industry} · {selectedClient.plan} Plan</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedClient(null)}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-xl"
                  >
                    ✕
                  </button>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  {/* Contact Info */}
                  <div className="space-y-3">
                    <h3 className="font-bold text-gray-900 dark:text-white text-sm uppercase tracking-wider">Contact Information</h3>
                    <div className="space-y-2 text-sm">
                      <p className="text-gray-600 dark:text-gray-300"><span className="font-semibold">Contact:</span> {selectedClient.contact}</p>
                      <p className="text-gray-600 dark:text-gray-300"><span className="font-semibold">Email:</span> {selectedClient.email}</p>
                      <p className="text-gray-600 dark:text-gray-300"><span className="font-semibold">Phone:</span> {selectedClient.phone}</p>
                      <p className="text-gray-600 dark:text-gray-300"><span className="font-semibold">Onboard Date:</span> {new Date(selectedClient.onboardDate).toLocaleDateString()}</p>
                    </div>
                  </div>

                  {/* Metrics */}
                  <div className="space-y-3">
                    <h3 className="font-bold text-gray-900 dark:text-white text-sm uppercase tracking-wider">Client Metrics</h3>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-indigo-50 dark:bg-indigo-900/20 p-3 rounded-lg text-center">
                        <div className="text-lg font-bold text-indigo-600 dark:text-indigo-400">{selectedClient.monthlyVisitors.web.toLocaleString()}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">Web Visitors/mo</div>
                      </div>
                      <div className="bg-purple-50 dark:bg-purple-900/20 p-3 rounded-lg text-center">
                        <div className="text-lg font-bold text-purple-600 dark:text-purple-400">{selectedClient.monthlyVisitors.app.toLocaleString()}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">App Visitors/mo</div>
                      </div>
                      <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg text-center">
                        <div className="text-lg font-bold text-green-600 dark:text-green-400">{selectedClient.satisfaction}%</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">Satisfaction</div>
                      </div>
                      <div className="bg-amber-50 dark:bg-amber-900/20 p-3 rounded-lg text-center">
                        <div className="text-lg font-bold text-amber-600 dark:text-amber-400">{selectedClient.projects}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">Active Projects</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ========== VISITORS TAB ========== */}
        {activeTab === 'visitors' && (
          <div className="space-y-6 animate-fadeInUp">
            {/* Visitor KPIs */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <MetricCard icon="🌐" label="Web Visitors (Mar)" value="207.3K" change="+13.3%" />
              <MetricCard icon="📱" label="App Visitors (Mar)" value="155.3K" change="+14.2%" />
              <MetricCard icon="📉" label="Bounce Rate" value="22%" change="-3%" />
              <MetricCard icon="⏱️" label="Avg Session" value="5.6 min" change="+0.5 min" />
            </div>

            {/* Visitor Trend */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-100 dark:border-gray-700">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">📈 Web & App Visitor Trends</h3>
              <div className="h-72">
                <Line data={visitorTrendChart.data} options={visitorTrendChart.options} />
              </div>
            </div>

            {/* Engagement Charts */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-100 dark:border-gray-700">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">🎯 Bounce vs Conversion</h3>
                <div className="h-64">
                  <Bar data={performanceBarChart.data} options={performanceBarChart.options} />
                </div>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-100 dark:border-gray-700">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">⏱️ Average Session Duration</h3>
                <div className="h-64">
                  <Line data={sessionDurationChart.data} options={sessionDurationChart.options} />
                </div>
              </div>
            </div>

            {/* Per-Client Visitors Table */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">👥 Visitor Breakdown by Client</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="text-left px-6 py-3 font-semibold text-gray-600 dark:text-gray-300">Client</th>
                      <th className="text-right px-6 py-3 font-semibold text-gray-600 dark:text-gray-300">Web Visitors</th>
                      <th className="text-right px-6 py-3 font-semibold text-gray-600 dark:text-gray-300">App Visitors</th>
                      <th className="text-right px-6 py-3 font-semibold text-gray-600 dark:text-gray-300">Total</th>
                      <th className="text-right px-6 py-3 font-semibold text-gray-600 dark:text-gray-300">Web %</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                    {clients.sort((a, b) => (b.monthlyVisitors.web + b.monthlyVisitors.app) - (a.monthlyVisitors.web + a.monthlyVisitors.app)).map((client) => {
                      const total = client.monthlyVisitors.web + client.monthlyVisitors.app;
                      const webPct = Math.round((client.monthlyVisitors.web / total) * 100);
                      return (
                        <tr key={client.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <span>{client.avatar}</span>
                              <span className="font-semibold text-gray-900 dark:text-white">{client.name}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-right text-gray-700 dark:text-gray-300">{client.monthlyVisitors.web.toLocaleString()}</td>
                          <td className="px-6 py-4 text-right text-gray-700 dark:text-gray-300">{client.monthlyVisitors.app.toLocaleString()}</td>
                          <td className="px-6 py-4 text-right font-bold text-gray-900 dark:text-white">{total.toLocaleString()}</td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <div className="w-16 h-2 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
                                <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${webPct}%` }}></div>
                              </div>
                              <span className="text-gray-500 dark:text-gray-400 text-xs">{webPct}%</span>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ========== PERFORMANCE TAB ========== */}
        {activeTab === 'performance' && (
          <div className="space-y-6 animate-fadeInUp">
            {/* Performance KPIs */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <MetricCard icon="✅" label="Uptime" value={`${perfData.uptime}%`} change="+0.02%" />
              <MetricCard icon="⚡" label="Avg Response" value={`${perfData.avgResponseTime}ms`} change="-18ms" />
              <MetricCard icon="❌" label="Error Rate" value={`${perfData.errorRate}%`} change="-0.01%" />
              <MetricCard icon="👥" label="Active Users" value={perfData.activeUsers.toLocaleString()} change="+12%" />
            </div>

            {/* Infrastructure Metrics */}
            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-100 dark:border-gray-700">
                <h3 className="font-bold text-gray-900 dark:text-white mb-4">🖥️ Infrastructure</h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600 dark:text-gray-400">Peak Concurrent Users</span>
                      <span className="font-bold text-gray-900 dark:text-white">{perfData.peakConcurrent.toLocaleString()}</span>
                    </div>
                    <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full">
                      <div className="h-full bg-indigo-500 rounded-full" style={{ width: '62%' }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600 dark:text-gray-400">API Calls / Month</span>
                      <span className="font-bold text-gray-900 dark:text-white">{perfData.apiCalls}</span>
                    </div>
                    <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full">
                      <div className="h-full bg-purple-500 rounded-full" style={{ width: '48%' }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600 dark:text-gray-400">Data Processed</span>
                      <span className="font-bold text-gray-900 dark:text-white">{perfData.dataProcessed}</span>
                    </div>
                    <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full">
                      <div className="h-full bg-blue-500 rounded-full" style={{ width: '72%' }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600 dark:text-gray-400">AI Models Active</span>
                      <span className="font-bold text-gray-900 dark:text-white">{perfData.aiModelsActive}</span>
                    </div>
                    <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full">
                      <div className="h-full bg-emerald-500 rounded-full" style={{ width: '46%' }}></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Lighthouse-style Scores */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-100 dark:border-gray-700">
                <h3 className="font-bold text-gray-900 dark:text-white mb-4">🏆 Performance Scores</h3>
                <div className="space-y-5">
                  {[
                    { label: 'Page Load Time', value: `${perfData.pageLoadTime}s`, score: 92, color: 'text-green-600 dark:text-green-400' },
                    { label: 'Mobile Score', value: `${perfData.mobileScore}/100`, score: perfData.mobileScore, color: 'text-green-600 dark:text-green-400' },
                    { label: 'Desktop Score', value: `${perfData.desktopScore}/100`, score: perfData.desktopScore, color: 'text-green-600 dark:text-green-400' },
                    { label: 'SEO Score', value: `${perfData.seoScore}/100`, score: perfData.seoScore, color: 'text-green-600 dark:text-green-400' }
                  ].map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">{item.label}</span>
                      <div className="flex items-center gap-3">
                        <div className="w-24 h-2 bg-gray-200 dark:bg-gray-700 rounded-full">
                          <div
                            className={`h-full rounded-full ${item.score >= 90 ? 'bg-green-500' : item.score >= 75 ? 'bg-yellow-500' : 'bg-red-500'}`}
                            style={{ width: `${item.score}%` }}
                          ></div>
                        </div>
                        <span className={`text-sm font-bold ${item.color}`}>{item.value}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Real-time Activity */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-100 dark:border-gray-700">
                <h3 className="font-bold text-gray-900 dark:text-white mb-4">🔴 Live Activity</h3>
                <div className="space-y-3">
                  {[
                    { time: '2 min ago', event: 'New client signup: RetailMax Group', type: 'success' },
                    { time: '8 min ago', event: 'API endpoint /analytics processed 12K requests', type: 'info' },
                    { time: '15 min ago', event: 'HealthFirst Medical: AI model retrained', type: 'info' },
                    { time: '23 min ago', event: 'Database backup completed successfully', type: 'success' },
                    { time: '45 min ago', event: 'SSL certificate renewed for 3 domains', type: 'success' },
                    { time: '1 hr ago', event: 'Scheduled maintenance window started', type: 'warning' }
                  ].map((item, idx) => (
                    <div key={idx} className="flex items-start gap-3 text-sm">
                      <div className={`w-2 h-2 mt-1.5 rounded-full flex-shrink-0 ${
                        item.type === 'success' ? 'bg-green-500' : item.type === 'warning' ? 'bg-yellow-500' : 'bg-blue-500'
                      }`}></div>
                      <div>
                        <p className="text-gray-700 dark:text-gray-300">{item.event}</p>
                        <p className="text-xs text-gray-400">{item.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Session Duration Chart */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-100 dark:border-gray-700">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">⏱️ Average Session Duration Trend</h3>
              <div className="h-64">
                <Line data={sessionDurationChart.data} options={sessionDurationChart.options} />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CompanyPortal;
