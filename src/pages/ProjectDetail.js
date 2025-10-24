import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { ProjectDetailSkeleton } from '../components/SkeletonLoader';
import { getDemoData } from '../utils/demoData';
import { getUserProjectsFromRealtimeDb } from '../utils/realtimeDatabase';
import DataGridView from '../components/DataGridView';
import ProjectDashboard from '../components/ProjectDashboard';

const ProjectDetail = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [project, setProject] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProject();
  }, [projectId, currentUser]);

  const loadProject = async () => {
    setLoading(true);
    try {
      let projects;
      if (currentUser?.isDemo) {
        const demoData = getDemoData();
        projects = demoData.projects;
      } else if (currentUser) {
        projects = await getUserProjectsFromRealtimeDb(currentUser.uid);
      }
      
      const foundProject = projects?.find(p => p.id === projectId);
      setProject(foundProject);
    } catch (error) {
      console.error('Error loading project:', error);
    }
    setLoading(false);
  };

  if (loading) {
    return <ProjectDetailSkeleton />;
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">❌</div>
          <p className="text-xl text-gray-600 mb-4">Project not found</p>
          <button
            onClick={() => navigate('/projects')}
            className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-xl font-bold hover:shadow-lg transition-all"
          >
            ← Back to Projects
          </button>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: '📋' },
    { id: 'data', label: 'Data Grid', icon: '📊' },
    { id: 'dashboard', label: 'Dashboard', icon: '📈' }
  ];

  const getStatusColor = (status) => {
    const colors = {
      'Planning': 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white',
      'In Progress': 'bg-gradient-to-r from-blue-400 to-indigo-500 text-white',
      'Completed': 'bg-gradient-to-r from-green-400 to-emerald-500 text-white',
      'On Hold': 'bg-gradient-to-r from-gray-300 to-gray-400 text-gray-700'
    };
    return colors[status] || 'bg-gray-200 text-gray-700';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-indigo-50 to-purple-50 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => navigate('/projects')}
            className="mb-4 text-indigo-600 hover:text-indigo-800 font-semibold flex items-center gap-2 transition-colors"
          >
            ← Back to Projects
          </button>
          
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h1 className="text-3xl font-extrabold mb-2">
                  <span className="gradient-text">{project.name}</span>
                </h1>
                <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600">
                  <span className="flex items-center gap-1">
                    🎯 <strong>Type:</strong> {project.type}
                  </span>
                  <span className="flex items-center gap-1">
                    👤 <strong>Owner:</strong> {project.owner}
                  </span>
                  <span className="flex items-center gap-1">
                    🏢 <strong>Department:</strong> {project.department}
                  </span>
                  <span className="flex items-center gap-1">
                    📅 <strong>Start:</strong> {new Date(project.startDate).toLocaleDateString()}
                  </span>
                </div>
              </div>
              <span className={`px-4 py-2 rounded-full text-sm font-bold shadow-lg ${getStatusColor(project.status)}`}>
                {project.status}
              </span>
            </div>

            {/* Readiness Score */}
            <div className="mt-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-gray-700">AI Readiness Score</span>
                <span className="text-lg font-extrabold text-indigo-600">{project.readinessScore}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-indigo-500 to-purple-500 h-3 rounded-full transition-all duration-500"
                  style={{ width: `${project.readinessScore}%` }}
                ></div>
              </div>
            </div>

            {/* Data Sources */}
            {project.dataSources && project.dataSources.length > 0 && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <p className="text-sm font-semibold text-gray-700 mb-2">Connected Data Sources ({project.dataSources.length})</p>
                <div className="flex flex-wrap gap-2">
                  {project.dataSources.map((source, idx) => (
                    <span key={idx} className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                      {source.icon} {source.type}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-6">
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
            <div className="flex border-b border-gray-200 overflow-x-auto">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  title={tab.label}
                  aria-label={tab.label}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 min-w-[80px] px-4 py-3 transition-all flex items-center justify-center ${
                    activeTab === tab.id
                      ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white border-b-4 border-indigo-700'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <span className="text-2xl">{tab.icon}</span>
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <div className="p-6">
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    {/* Project Information */}
                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
                      <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                        📋 Project Information
                      </h3>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Project Type:</span>
                          <span className="font-semibold text-gray-900">{project.type}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Status:</span>
                          <span className="font-semibold text-gray-900">{project.status}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Owner:</span>
                          <span className="font-semibold text-gray-900">{project.owner}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Department:</span>
                          <span className="font-semibold text-gray-900">{project.department}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Start Date:</span>
                          <span className="font-semibold text-gray-900">
                            {new Date(project.startDate).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Readiness Score:</span>
                          <span className="font-semibold text-indigo-600">{project.readinessScore}%</span>
                        </div>
                      </div>
                    </div>

                    {/* Data Sources Details */}
                    <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-200">
                      <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                        💾 Data Sources
                      </h3>
                      {project.dataSources && project.dataSources.length > 0 ? (
                        <div className="space-y-3 max-h-64 overflow-y-auto">
                          {project.dataSources.map((source, idx) => (
                            <div key={idx} className="bg-white rounded-lg p-3 shadow-sm border border-purple-100">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-xl">{source.icon}</span>
                                <span className="font-semibold text-gray-900 text-sm">{source.type}</span>
                              </div>
                              <p className="text-xs text-gray-600 truncate" title={source.connectionDetailOrUrl}>
                                📍 {source.connectionDetailOrUrl}
                              </p>
                              <div className="flex items-center gap-2 mt-1">
                                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                                  {source.format}
                                </span>
                                <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                                  {source.authType}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-500 text-sm">No data sources configured</p>
                      )}
                    </div>
                  </div>

                  {/* Quick Actions */}
                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200">
                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                      ⚡ Quick Actions
                    </h3>
                    <div className="grid md:grid-cols-3 gap-4">
                      <button
                        onClick={() => setActiveTab('data')}
                        className="bg-white hover:bg-gradient-to-r hover:from-blue-500 hover:to-indigo-600 hover:text-white text-gray-700 px-4 py-3 rounded-lg font-semibold shadow-sm border border-gray-200 transition-all duration-300"
                      >
                        📊 View Data Grid
                      </button>
                      <button
                        onClick={() => setActiveTab('dashboard')}
                        className="bg-white hover:bg-gradient-to-r hover:from-purple-500 hover:to-pink-600 hover:text-white text-gray-700 px-4 py-3 rounded-lg font-semibold shadow-sm border border-gray-200 transition-all duration-300"
                      >
                        📈 View Dashboard
                      </button>
                      <button
                        onClick={() => navigate('/projects')}
                        className="bg-white hover:bg-gradient-to-r hover:from-gray-500 hover:to-gray-600 hover:text-white text-gray-700 px-4 py-3 rounded-lg font-semibold shadow-sm border border-gray-200 transition-all duration-300"
                      >
                        ← Back to Projects
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'data' && (
                <DataGridView project={project} />
              )}

              {activeTab === 'dashboard' && (
                <ProjectDashboard project={project} />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectDetail;
