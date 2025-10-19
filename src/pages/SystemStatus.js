/**
 * System Status Dashboard Component
 * Displays real-time system health and diagnostics
 */

import React, { useState, useEffect } from 'react';
import healthCheck from '../utils/healthCheck';
import errorMonitor from '../utils/errorMonitoring';

const SystemStatus = () => {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(false);

  useEffect(() => {
    runHealthCheck();
  }, []);

  useEffect(() => {
    let interval;
    if (autoRefresh) {
      interval = setInterval(() => {
        runHealthCheck();
      }, 30000); // Check every 30 seconds
    }
    return () => clearInterval(interval);
  }, [autoRefresh]);

  const runHealthCheck = async () => {
    setLoading(true);
    try {
      const result = await healthCheck.runFullCheck();
      setReport(result);
    } catch (error) {
      console.error('Health check failed:', error);
    }
    setLoading(false);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'healthy': return 'text-green-600 bg-green-100';
      case 'warning': return 'text-yellow-600 bg-yellow-100';
      case 'error': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'healthy': return '✅';
      case 'warning': return '⚠️';
      case 'error': return '❌';
      case 'info': return 'ℹ️';
      default: return '❓';
    }
  };

  if (loading && !report) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4 animate-pulse">🔍</div>
          <div className="text-xl text-gray-600">Running system diagnostics...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 py-8">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl font-extrabold text-gray-900 mb-2">
                System Status
              </h1>
              <p className="text-gray-600">
                Last checked: {report?.lastCheck ? new Date(report.lastCheck).toLocaleTimeString() : 'Never'}
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setAutoRefresh(!autoRefresh)}
                className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                  autoRefresh 
                    ? 'bg-green-600 text-white hover:bg-green-700' 
                    : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                }`}
              >
                {autoRefresh ? '🔄 Auto-Refresh ON' : 'Auto-Refresh OFF'}
              </button>
              <button
                onClick={runHealthCheck}
                disabled={loading}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 font-semibold"
              >
                {loading ? 'Checking...' : '🔍 Run Check'}
              </button>
            </div>
          </div>
        </div>

        {/* Overall Status */}
        {report && (
          <>
            <div className={`rounded-3xl shadow-2xl p-8 mb-8 ${
              report.summary.overall === 'healthy' ? 'bg-gradient-to-br from-green-500 to-emerald-600' :
              report.summary.overall === 'warning' ? 'bg-gradient-to-br from-yellow-500 to-orange-500' :
              'bg-gradient-to-br from-red-500 to-pink-600'
            } text-white`}>
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-3xl font-extrabold mb-2">Overall System Health</h2>
                  <p className="text-xl opacity-90">
                    {report.summary.healthy} of {report.summary.total} checks passed
                  </p>
                </div>
                <div className="text-center">
                  <div className="text-7xl mb-2">
                    {report.summary.overall === 'healthy' ? '💚' : 
                     report.summary.overall === 'warning' ? '⚠️' : '🚨'}
                  </div>
                  <div className="text-5xl font-extrabold">{report.summary.percentage}%</div>
                </div>
              </div>
            </div>

            {/* Detailed Checks */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {Object.entries(report.checks).map(([key, check]) => (
                <div
                  key={key}
                  className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-gray-900 capitalize">
                      {key.replace(/([A-Z])/g, ' $1').trim()}
                    </h3>
                    <span className="text-3xl">{getStatusIcon(check.status)}</span>
                  </div>
                  <div className={`inline-block px-3 py-1 rounded-full text-xs font-bold mb-3 ${getStatusColor(check.status)}`}>
                    {check.status.toUpperCase()}
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{check.message}</p>
                  {check.metrics && (
                    <div className="mt-3 bg-gray-50 rounded-lg p-3">
                      <div className="text-xs font-semibold text-gray-500 mb-1">Metrics:</div>
                      {Object.entries(check.metrics).map(([metricKey, value]) => (
                        <div key={metricKey} className="text-xs text-gray-700">
                          <span className="font-semibold">{metricKey}:</span> {value}
                        </div>
                      ))}
                    </div>
                  )}
                  {check.usage && (
                    <div className="mt-2 text-xs text-gray-500">
                      Storage: {check.usage}
                    </div>
                  )}
                  <div className="mt-2 text-xs text-gray-400">
                    {new Date(check.timestamp).toLocaleTimeString()}
                  </div>
                </div>
              ))}
            </div>

            {/* Error Log */}
            {report.checks.errors?.stats && report.checks.errors.stats.total > 0 && (
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <span className="text-2xl">📋</span> Recent Errors
                </h3>
                <div className="space-y-3">
                  {report.checks.errors.stats.recent.map((error, index) => (
                    <div key={index} className="bg-red-50 border-l-4 border-red-500 rounded-lg p-4">
                      <div className="flex items-start justify-between mb-2">
                        <span className="font-bold text-red-800">{error.type}</span>
                        <span className="text-xs text-red-600">
                          {new Date(error.timestamp).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-sm text-red-700">{error.message}</p>
                      {error.filename && (
                        <p className="text-xs text-red-600 mt-1">
                          {error.filename}:{error.lineno}:{error.colno}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
                <button
                  onClick={() => errorMonitor.clearErrors()}
                  className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-semibold"
                >
                  Clear Error Log
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default SystemStatus;
