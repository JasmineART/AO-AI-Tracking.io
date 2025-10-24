import React, { useState } from 'react';
import { getProjectRoadmapData } from '../utils/projectDataGenerator';

const ProjectDashboard = ({ project }) => {
  const roadmapData = getProjectRoadmapData(project);
  const [selectedPhase, setSelectedPhase] = useState(null);
  const [showAddMilestone, setShowAddMilestone] = useState(false);

  const getPhaseColor = (status) => {
    const colors = {
      completed: 'bg-green-500',
      'in-progress': 'bg-blue-500',
      pending: 'bg-gray-300',
      blocked: 'bg-red-500'
    };
    return colors[status] || 'bg-gray-300';
  };

  const getStatusIcon = (status) => {
    const icons = {
      completed: '✅',
      'in-progress': '⚙️',
      pending: '⏳',
      blocked: '🚫'
    };
    return icons[status] || '📋';
  };

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-3xl">📊</span>
            <span className="text-4xl font-bold">{roadmapData.stats.totalTasks}</span>
          </div>
          <p className="text-sm font-semibold opacity-90">Total Tasks</p>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-3xl">✅</span>
            <span className="text-4xl font-bold">{roadmapData.stats.completedTasks}</span>
          </div>
          <p className="text-sm font-semibold opacity-90">Completed</p>
        </div>

        <div className="bg-gradient-to-br from-yellow-500 to-orange-600 rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-3xl">⚙️</span>
            <span className="text-4xl font-bold">{roadmapData.stats.inProgressTasks}</span>
          </div>
          <p className="text-sm font-semibold opacity-90">In Progress</p>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-3xl">📈</span>
            <span className="text-4xl font-bold">{roadmapData.stats.progress}%</span>
          </div>
          <p className="text-sm font-semibold opacity-90">Overall Progress</p>
        </div>
      </div>

      {/* Timeline/Roadmap */}
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">🗺️ Project Roadmap</h2>
          <button
            onClick={() => setShowAddMilestone(!showAddMilestone)}
            className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-4 py-2 rounded-lg font-semibold text-sm hover:shadow-lg transition-all"
          >
            {showAddMilestone ? '❌ Cancel' : '➕ Add Milestone'}
          </button>
        </div>

        {showAddMilestone && (
          <div className="mb-6 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-lg p-4 border-2 border-indigo-300">
            <h3 className="font-bold text-gray-900 mb-3">Add New Milestone</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <input
                type="text"
                placeholder="Milestone name"
                className="px-3 py-2 border-2 border-indigo-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
              <input
                type="date"
                className="px-3 py-2 border-2 border-indigo-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
              <select className="px-3 py-2 border-2 border-indigo-300 rounded-lg focus:ring-2 focus:ring-indigo-500">
                <option>Pending</option>
                <option>In Progress</option>
                <option>Completed</option>
              </select>
            </div>
            <button className="mt-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white px-4 py-2 rounded-lg font-semibold text-sm hover:shadow-lg transition-all">
              ✓ Save Milestone
            </button>
          </div>
        )}

        {/* Phase Timeline */}
        <div className="space-y-4">
          {roadmapData.phases.map((phase, idx) => (
            <div key={idx} className="relative">
              <div
                className={`rounded-xl p-6 cursor-pointer transition-all duration-300 ${
                  selectedPhase === idx
                    ? 'bg-gradient-to-r from-indigo-100 to-purple-100 border-2 border-indigo-400 shadow-lg'
                    : 'bg-gray-50 hover:bg-gray-100 border border-gray-200'
                }`}
                onClick={() => setSelectedPhase(selectedPhase === idx ? null : idx)}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-full ${getPhaseColor(phase.status)} flex items-center justify-center text-white text-xl font-bold`}>
                      {getStatusIcon(phase.status)}
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">{phase.name}</h3>
                      <p className="text-sm text-gray-600">
                        {phase.startDate} - {phase.endDate}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                      phase.status === 'completed' ? 'bg-green-100 text-green-700' :
                      phase.status === 'in-progress' ? 'bg-blue-100 text-blue-700' :
                      phase.status === 'blocked' ? 'bg-red-100 text-red-700' :
                      'bg-gray-200 text-gray-700'
                    }`}>
                      {phase.status.toUpperCase()}
                    </span>
                    <div className="mt-2">
                      <span className="text-2xl font-bold text-indigo-600">{phase.progress}%</span>
                    </div>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
                  <div
                    className={`h-2 rounded-full transition-all duration-500 ${getPhaseColor(phase.status)}`}
                    style={{ width: `${phase.progress}%` }}
                  ></div>
                </div>

                {/* Milestones (Collapsed) */}
                {selectedPhase === idx && (
                  <div className="mt-4 space-y-2 animate-fadeIn">
                    <h4 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
                      🎯 Milestones ({phase.milestones.length})
                    </h4>
                    {phase.milestones.map((milestone, mIdx) => (
                      <div
                        key={mIdx}
                        className="bg-white rounded-lg p-4 border border-gray-200 hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <span className="text-2xl">{getStatusIcon(milestone.status)}</span>
                            <div>
                              <p className="font-semibold text-gray-900">{milestone.name}</p>
                              <p className="text-xs text-gray-600">Due: {milestone.dueDate}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold text-gray-700">{milestone.owner}</span>
                            <span className={`px-2 py-1 rounded text-xs font-bold ${
                              milestone.status === 'completed' ? 'bg-green-100 text-green-700' :
                              milestone.status === 'in-progress' ? 'bg-blue-100 text-blue-700' :
                              'bg-gray-200 text-gray-700'
                            }`}>
                              {milestone.status}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Connector Line */}
              {idx < roadmapData.phases.length - 1 && (
                <div className="flex justify-center">
                  <div className="w-0.5 h-4 bg-gray-300"></div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Team & Resources */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Team Members */}
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
          <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            👥 Team Members
          </h3>
          <div className="space-y-3">
            {roadmapData.team.map((member, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-indigo-50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold">
                    {member.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{member.name}</p>
                    <p className="text-xs text-gray-600">{member.role}</p>
                  </div>
                </div>
                <span className="text-sm font-semibold text-indigo-600">{member.tasks} tasks</span>
              </div>
            ))}
          </div>
        </div>

        {/* Risk & Issues */}
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
          <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            ⚠️ Risks & Issues
          </h3>
          <div className="space-y-3">
            {roadmapData.risks.map((risk, idx) => (
              <div
                key={idx}
                className={`p-3 rounded-lg border-l-4 ${
                  risk.severity === 'high' ? 'bg-red-50 border-red-500' :
                  risk.severity === 'medium' ? 'bg-yellow-50 border-yellow-500' :
                  'bg-blue-50 border-blue-500'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-semibold text-gray-900">{risk.title}</p>
                    <p className="text-xs text-gray-600 mt-1">{risk.description}</p>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs font-bold ${
                    risk.severity === 'high' ? 'bg-red-200 text-red-800' :
                    risk.severity === 'medium' ? 'bg-yellow-200 text-yellow-800' :
                    'bg-blue-200 text-blue-800'
                  }`}>
                    {risk.severity.toUpperCase()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Budget & Resources */}
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
        <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          💰 Budget & Resources
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <p className="text-sm text-gray-600 mb-2">Total Budget</p>
            <p className="text-3xl font-bold text-gray-900">${roadmapData.budget.total.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-2">Spent</p>
            <p className="text-3xl font-bold text-indigo-600">${roadmapData.budget.spent.toLocaleString()}</p>
            <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-indigo-500 to-purple-500 h-2 rounded-full"
                style={{ width: `${(roadmapData.budget.spent / roadmapData.budget.total) * 100}%` }}
              ></div>
            </div>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-2">Remaining</p>
            <p className="text-3xl font-bold text-green-600">${roadmapData.budget.remaining.toLocaleString()}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectDashboard;
