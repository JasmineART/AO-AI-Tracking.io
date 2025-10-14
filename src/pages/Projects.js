import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getDemoData, addProject, updateProject, deleteProject } from '../utils/demoData';
import { getAvailableDataSources } from '../utils/dataIntegration';

const Projects = () => {
  const { currentUser } = useAuth();
  const [projects, setProjects] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [dataSources] = useState(getAvailableDataSources());
  
  const [formData, setFormData] = useState({
    name: '',
    type: 'AI System',
    status: 'Planning',
    dataSource: 'AWS',
    owner: '',
    department: '',
    readinessScore: 50
  });

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = () => {
    if (currentUser?.isDemo) {
      const demoData = getDemoData();
      setProjects(demoData.projects);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (editingProject) {
      updateProject(editingProject.id, formData);
    } else {
      addProject(formData);
    }
    
    loadProjects();
    resetForm();
  };

  const handleEdit = (project) => {
    setEditingProject(project);
    setFormData({
      name: project.name,
      type: project.type,
      status: project.status,
      dataSource: project.dataSource,
      owner: project.owner,
      department: project.department,
      readinessScore: project.readinessScore
    });
    setShowAddModal(true);
  };

  const handleDelete = (projectId) => {
    if (window.confirm('Are you sure you want to delete this project?')) {
      deleteProject(projectId);
      loadProjects();
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      type: 'AI System',
      status: 'Planning',
      dataSource: 'AWS',
      owner: '',
      department: '',
      readinessScore: 50
    });
    setEditingProject(null);
    setShowAddModal(false);
  };

  const getStatusColor = (status) => {
    const colors = {
      'Planning': 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white',
      'In Progress': 'bg-gradient-to-r from-blue-400 to-indigo-500 text-white',
      'Completed': 'bg-gradient-to-r from-green-400 to-emerald-500 text-white',
      'On Hold': 'bg-gradient-to-r from-gray-300 to-gray-400 text-gray-700'
    };
    return colors[status] || 'bg-gray-200 text-gray-700';
  };

  const getReadinessColor = (score) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-indigo-50 to-purple-50 py-8">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-8 animate-fadeInDown">
          <div>
            <h1 className="text-4xl font-extrabold mb-2">
              <span className="gradient-text">Projects & Systems</span>
            </h1>
            <p className="text-gray-600">Manage your AI and automation initiatives</p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-xl font-bold hover:shadow-2xl hover:scale-105 transition-all duration-300 transform flex items-center gap-2"
          >
            <span className="text-2xl">+</span> Add New Project
          </button>
        </div>

        {/* Projects Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project, idx) => (
            <div key={project.id} className="group bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-gray-100 animate-fadeInUp" style={{animationDelay: `${idx * 0.05}s`}}>
              <div className="p-6 relative">
                {/* Status Badge with Gradient */}
                <div className="absolute top-4 right-4">
                  <span className={`px-4 py-2 rounded-full text-xs font-bold shadow-lg ${getStatusColor(project.status)}`}>
                    {project.status}
                  </span>
                </div>

                <h3 className="text-xl font-bold text-gray-900 mb-6 pr-20 group-hover:text-indigo-600 transition-colors duration-300">{project.name}</h3>

                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-lg flex items-center justify-center">
                      <span className="text-lg">🎯</span>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 font-semibold">Type</p>
                      <p className="font-bold text-gray-900">{project.type}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-lg flex items-center justify-center">
                      <span className="text-lg">💾</span>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 font-semibold">Data Source</p>
                      <p className="font-bold text-gray-900">{project.dataSource}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-green-100 to-emerald-100 rounded-lg flex items-center justify-center">
                      <span className="text-lg">👤</span>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 font-semibold">Owner</p>
                      <p className="font-bold text-gray-900">{project.owner}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-100 to-pink-100 rounded-lg flex items-center justify-center">
                      <span className="text-lg">🏢</span>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 font-semibold">Department</p>
                      <p className="font-bold text-gray-900">{project.department}</p>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-gray-100">
                    <p className="text-xs text-gray-500 font-semibold mb-2">AI Readiness Score</p>
                    <div className="flex items-center gap-3">
                      <div className="flex-grow bg-gray-200 rounded-full h-3 overflow-hidden">
                        <div
                          className="bg-gradient-to-r from-indigo-500 to-purple-500 h-3 rounded-full transition-all duration-500 shadow-lg"
                          style={{ width: `${project.readinessScore}%` }}
                        ></div>
                      </div>
                      <span className={`font-extrabold text-lg ${getReadinessColor(project.readinessScore)}`}>
                        {project.readinessScore}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 pt-2">
                    <div className="w-10 h-10 bg-gradient-to-br from-yellow-100 to-orange-100 rounded-lg flex items-center justify-center">
                      <span className="text-lg">📅</span>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 font-semibold">Start Date</p>
                      <p className="font-bold text-gray-900">
                        {new Date(project.startDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 mt-6 pt-6 border-t border-gray-100">
                  <button
                    onClick={() => handleEdit(project)}
                    className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-4 py-3 rounded-xl font-bold hover:shadow-xl hover:scale-105 transition-all duration-300 transform"
                  >
                    ✏️ Edit
                  </button>
                  <button
                    onClick={() => handleDelete(project.id)}
                    className="flex-1 bg-gradient-to-r from-red-500 to-pink-500 text-white px-4 py-3 rounded-xl font-bold hover:shadow-xl hover:scale-105 transition-all duration-300 transform"
                  >
                    🗑️ Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {projects.length === 0 && (
          <div className="text-center py-20 animate-fadeInUp">
            <div className="text-8xl mb-6">📊</div>
            <p className="text-gray-500 text-xl mb-6">No projects yet. Let's get started!</p>
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-8 py-4 rounded-xl font-bold hover:shadow-2xl hover:scale-105 transition-all duration-300 transform"
            >
              ✨ Create Your First Project
            </button>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeInUp">
          <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border-2 border-gray-100 animate-scaleIn">
            <div className="p-8">
              <h2 className="text-3xl font-bold mb-6">
                <span className="gradient-text">
                  {editingProject ? '✏️ Edit Project' : '✨ Add New Project'}
                </span>
              </h2>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Project Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300 bg-gray-50 hover:bg-white"
                    placeholder="e.g., Customer Service AI Chatbot"
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Type *
                    </label>
                    <select
                      name="type"
                      value={formData.type}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    >
                      <option value="AI System">AI System</option>
                      <option value="Automation">Automation</option>
                      <option value="Analytics">Analytics</option>
                      <option value="Infrastructure">Infrastructure</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Status *
                    </label>
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    >
                      <option value="Planning">Planning</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Completed">Completed</option>
                      <option value="On Hold">On Hold</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Data Source *
                  </label>
                  <select
                    name="dataSource"
                    value={formData.dataSource}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  >
                    {dataSources.map(source => (
                      <option key={source.id} value={source.id}>
                        {source.icon} {source.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Owner *
                    </label>
                    <input
                      type="text"
                      name="owner"
                      value={formData.owner}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      placeholder="Project owner name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Department *
                    </label>
                    <input
                      type="text"
                      name="department"
                      value={formData.department}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      placeholder="e.g., Operations"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    AI Readiness Score: {formData.readinessScore}
                  </label>
                  <input
                    type="range"
                    name="readinessScore"
                    value={formData.readinessScore}
                    onChange={handleInputChange}
                    min="0"
                    max="100"
                    className="w-full"
                  />
                </div>

                <div className="flex gap-4 pt-6 border-t border-gray-200">
                  <button
                    type="submit"
                    className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-4 rounded-xl font-bold hover:shadow-2xl hover:scale-105 transition-all duration-300 transform"
                  >
                    {editingProject ? '✅ Update Project' : '🚀 Add Project'}
                  </button>
                  <button
                    type="button"
                    onClick={resetForm}
                    className="flex-1 bg-gray-200 text-gray-700 px-6 py-4 rounded-xl font-bold hover:bg-gray-300 hover:shadow-lg transition-all duration-300"
                  >
                    ❌ Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Projects;
