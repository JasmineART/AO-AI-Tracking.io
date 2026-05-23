import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import {
  COMPANY_PERMISSION_OPTIONS,
  COMPANY_ROLE_LABELS,
  COMPANY_ROLE_OPTIONS,
  SUBSCRIPTION_PACKAGES,
  associateUserWithCompanyAccount,
  getCompanyAccounts,
  getSubscriptionLabel,
  hasBillingAccess,
  hasUserManagementAccess,
  isUserCountWithinPackage,
  updateCompanySubscription,
  updateCompanyUserPermission,
  updateCompanyUserRole
} from '../utils/companyAccounts';

const statusClass = (status) => {
  const value = String(status || '').toLowerCase();
  if (value.includes('progress')) return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300';
  if (value.includes('planning')) return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300';
  if (value.includes('complete')) return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300';
  return 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300';
};

const packageCardClass = (active) => (
  active
    ? 'border-indigo-500 ring-2 ring-indigo-200 dark:ring-indigo-800 bg-indigo-50/70 dark:bg-indigo-900/20'
    : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'
);

const CompanyPortal = () => {
  const { currentUser } = useAuth();
  const { success, error: showError } = useToast();

  const [activeTab, setActiveTab] = useState('overview');
  const [company, setCompany] = useState(null);
  const [companyAccounts, setCompanyAccounts] = useState([]);
  const [projectFilter, setProjectFilter] = useState('ongoing');

  const effectiveRole = currentUser?.companyRole || currentUser?.employeeRole || 'member';
  const canManageUsers = hasUserManagementAccess(effectiveRole);
  const canManageBilling = hasBillingAccess(effectiveRole);

  const refreshCompany = () => {
    if (!currentUser) return;
    const association = associateUserWithCompanyAccount(currentUser, effectiveRole);
    setCompanyAccounts(association.companyAccounts || getCompanyAccounts());
    setCompany(association.company || null);
  };

  useEffect(() => {
    refreshCompany();
  }, [currentUser]);

  const ongoingProjects = useMemo(() => {
    if (!company?.projects) return [];
    return company.projects.filter((project) => {
      const status = String(project.status || '').toLowerCase();
      return status.includes('progress') || status.includes('planning');
    });
  }, [company]);

  const visibleProjects = useMemo(() => {
    if (!company?.projects) return [];
    if (projectFilter === 'all') return company.projects;
    if (projectFilter === 'ongoing') return ongoingProjects;
    if (projectFilter === 'ai') {
      return company.projects.filter((project) => String(project.type || '').toLowerCase().includes('ai'));
    }
    return company.projects.filter((project) => String(project.type || '').toLowerCase().includes('automation'));
  }, [company, ongoingProjects, projectFilter]);

  const usagePackage = SUBSCRIPTION_PACKAGES[company?.subscriptionPackage] || null;
  const userCount = company?.users?.length || 0;
  const roleDisplayName = COMPANY_ROLE_LABELS[effectiveRole] || 'Member';

  const handlePermissionChange = async (userId, permission) => {
    if (!company) return;
    const result = await updateCompanyUserPermission(company.id, userId, permission);
    if (!result.ok) {
      showError(result.error);
      return;
    }
    success('User permission updated.');
    refreshCompany();
  };

  const handleRoleChange = async (userId, role) => {
    if (!company) return;
    const result = await updateCompanyUserRole(company.id, userId, role);
    if (!result.ok) {
      showError(result.error);
      return;
    }
    success('User role updated.');
    refreshCompany();
  };

  const handleSubscriptionChange = async (packageId) => {
    if (!company) return;
    const result = await updateCompanySubscription(company.id, packageId);
    if (!result.ok) {
      showError(result.error);
      return;
    }
    success('Subscription package updated successfully.');
    refreshCompany();
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'org-projects', label: 'Org Projects', icon: '🚀' },
    { id: 'user-access', label: 'User Access', icon: '🔐' },
    { id: 'subscription', label: 'Subscription', icon: '💳' },
    { id: 'visitors', label: 'Visitors', icon: '🌐' }
  ];

  if (!company) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center px-4">
        <div className="text-center bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-xl border border-gray-200 dark:border-gray-700">
          <p className="text-gray-600 dark:text-gray-300">Loading company account...</p>
        </div>
      </div>
    );
  }

  const totalProjects = company.projects.length;
  const ongoingCount = ongoingProjects.length;
  const automationProjects = company.projects.filter((project) => String(project.type || '').toLowerCase().includes('automation')).length;
  const aiProjects = company.projects.filter((project) => String(project.type || '').toLowerCase().includes('ai')).length;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-10">
      <div className="bg-gradient-to-r from-slate-800 via-blue-900 to-indigo-900 text-white">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className="text-2xl">🏢</span>
                <h1 className="text-2xl font-extrabold">Company Portal</h1>
                <span className="text-xs bg-white/20 px-3 py-1 rounded-full font-semibold">{roleDisplayName}</span>
              </div>
              <p className="text-blue-200 text-sm">
                {company.name} • {getSubscriptionLabel(company.subscriptionPackage)} • {userCount} users
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Link to="/dashboard" className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-sm font-semibold hover:bg-white/20 transition-all">📊 AI Dashboard</Link>
              <Link to="/" className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-sm font-semibold hover:bg-white/20 transition-all">🏠 Main Site</Link>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm sticky top-16 z-30">
        <div className="container mx-auto px-4">
          <div className="flex gap-1 overflow-x-auto py-2">
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

      <div className="container mx-auto px-4 mt-6 space-y-6">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-5 border border-gray-100 dark:border-gray-700">
                <div className="text-2xl">🚀</div>
                <div className="text-2xl font-extrabold text-gray-900 dark:text-white">{totalProjects}</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">Total Org Projects</div>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-5 border border-gray-100 dark:border-gray-700">
                <div className="text-2xl">⏳</div>
                <div className="text-2xl font-extrabold text-gray-900 dark:text-white">{ongoingCount}</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">Ongoing Projects</div>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-5 border border-gray-100 dark:border-gray-700">
                <div className="text-2xl">🤖</div>
                <div className="text-2xl font-extrabold text-gray-900 dark:text-white">{aiProjects}</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">AI Projects</div>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-5 border border-gray-100 dark:border-gray-700">
                <div className="text-2xl">⚙️</div>
                <div className="text-2xl font-extrabold text-gray-900 dark:text-white">{automationProjects}</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">Automation Projects</div>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-100 dark:border-gray-700">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Subscription & User Capacity</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">Current package: <span className="font-semibold">{usagePackage?.name || 'Unknown'}</span></p>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">User usage: <span className="font-semibold">{userCount}</span> / {usagePackage?.maxUsers || 0}</p>
                <div className="w-full h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${Math.min(100, (userCount / (usagePackage?.maxUsers || 1)) * 100)}%` }} />
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-100 dark:border-gray-700">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Access Control Summary</h3>
                <div className="space-y-2 text-sm">
                  <p className="text-gray-700 dark:text-gray-300">Your role: <span className="font-semibold">{roleDisplayName}</span></p>
                  <p className="text-gray-700 dark:text-gray-300">Can manage users: <span className="font-semibold">{canManageUsers ? 'Yes' : 'No'}</span></p>
                  <p className="text-gray-700 dark:text-gray-300">Can manage billing: <span className="font-semibold">{canManageBilling ? 'Yes' : 'No'}</span></p>
                  <p className="text-gray-700 dark:text-gray-300">Company accounts in workspace: <span className="font-semibold">{companyAccounts.length}</span></p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'org-projects' && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Entire Organization Ongoing AI & Automation Projects</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">Track delivery progress across departments in one place.</p>
              </div>
              <select value={projectFilter} onChange={(event) => setProjectFilter(event.target.value)} className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm text-gray-900 dark:text-white">
                <option value="ongoing">Ongoing</option>
                <option value="all">All Projects</option>
                <option value="ai">AI Only</option>
                <option value="automation">Automation Only</option>
              </select>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="text-left px-6 py-3 font-semibold text-gray-600 dark:text-gray-300">Project</th>
                    <th className="text-left px-6 py-3 font-semibold text-gray-600 dark:text-gray-300">Type</th>
                    <th className="text-left px-6 py-3 font-semibold text-gray-600 dark:text-gray-300">Owner</th>
                    <th className="text-left px-6 py-3 font-semibold text-gray-600 dark:text-gray-300">Department</th>
                    <th className="text-left px-6 py-3 font-semibold text-gray-600 dark:text-gray-300">Status</th>
                    <th className="text-right px-6 py-3 font-semibold text-gray-600 dark:text-gray-300">Progress</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                  {visibleProjects.map((project) => (
                    <tr key={project.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                      <td className="px-6 py-4 font-semibold text-gray-900 dark:text-white">{project.name}</td>
                      <td className="px-6 py-4 text-gray-700 dark:text-gray-300">{project.type}</td>
                      <td className="px-6 py-4 text-gray-700 dark:text-gray-300">{project.owner}</td>
                      <td className="px-6 py-4 text-gray-700 dark:text-gray-300">{project.department}</td>
                      <td className="px-6 py-4"><span className={`text-xs font-semibold px-2 py-1 rounded-full ${statusClass(project.status)}`}>{project.status}</span></td>
                      <td className="px-6 py-4 text-right font-semibold text-gray-900 dark:text-white">{project.progress}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'user-access' && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">User Permissions Under Company Account</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {canManageUsers
                  ? 'Update user role and permission levels for your organization.'
                  : 'You have read-only access. Contact an administrator to modify permissions.'}
              </p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="text-left px-6 py-3 font-semibold text-gray-600 dark:text-gray-300">User</th>
                    <th className="text-left px-6 py-3 font-semibold text-gray-600 dark:text-gray-300">Email</th>
                    <th className="text-left px-6 py-3 font-semibold text-gray-600 dark:text-gray-300">Role</th>
                    <th className="text-left px-6 py-3 font-semibold text-gray-600 dark:text-gray-300">Permission</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                  {company.users.map((user) => (
                    <tr key={user.userId} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                      <td className="px-6 py-4 font-semibold text-gray-900 dark:text-white">{user.name}</td>
                      <td className="px-6 py-4 text-gray-700 dark:text-gray-300">{user.email}</td>
                      <td className="px-6 py-4">
                        <select value={user.role} disabled={!canManageUsers} onChange={(event) => handleRoleChange(user.userId, event.target.value)} className="px-2 py-1 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:opacity-60">
                          {COMPANY_ROLE_OPTIONS.map((role) => (
                            <option key={role} value={role}>{COMPANY_ROLE_LABELS[role]}</option>
                          ))}
                        </select>
                      </td>
                      <td className="px-6 py-4">
                        <select value={user.permission} disabled={!canManageUsers} onChange={(event) => handlePermissionChange(user.userId, event.target.value)} className="px-2 py-1 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:opacity-60">
                          {COMPANY_PERMISSION_OPTIONS.map((permission) => (
                            <option key={permission.value} value={permission.value}>{permission.label}</option>
                          ))}
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'subscription' && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-100 dark:border-gray-700">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Subscription Package Management</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">Select the package that matches your company user count. Package updates are validated automatically.</p>
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              {Object.values(SUBSCRIPTION_PACKAGES).map((pkg) => {
                const active = company.subscriptionPackage === pkg.id;
                const eligible = isUserCountWithinPackage(userCount, pkg);
                return (
                  <div key={pkg.id} className={`rounded-xl border p-5 shadow-sm ${packageCardClass(active)}`}>
                    <h4 className="text-lg font-bold text-gray-900 dark:text-white">{pkg.name}</h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">{pkg.price}</p>
                    <p className="text-sm text-gray-700 dark:text-gray-300 mb-4">Supports {pkg.minUsers}-{pkg.maxUsers} users</p>
                    {!eligible && <p className="text-xs text-red-600 dark:text-red-400 mb-3">Not eligible for {userCount} current users.</p>}
                    <button onClick={() => handleSubscriptionChange(pkg.id)} disabled={!canManageBilling || !eligible || active} className="w-full px-3 py-2 rounded-lg font-semibold text-sm bg-indigo-600 text-white disabled:bg-gray-300 dark:disabled:bg-gray-700 disabled:text-gray-500 disabled:cursor-not-allowed">
                      {active ? 'Current Package' : 'Switch Package'}
                    </button>
                  </div>
                );
              })}
            </div>

            {!canManageBilling && (
              <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4 text-sm text-amber-700 dark:text-amber-300">
                You do not have billing permissions. An admin or account manager can change subscription packages.
              </div>
            )}
          </div>
        )}

        {activeTab === 'visitors' && (
          <div className="grid md:grid-cols-3 gap-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-5 border border-gray-100 dark:border-gray-700">
              <div className="text-2xl">🌐</div>
              <div className="text-2xl font-extrabold text-gray-900 dark:text-white">207.3K</div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Web Visitors (Monthly)</div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-5 border border-gray-100 dark:border-gray-700">
              <div className="text-2xl">📱</div>
              <div className="text-2xl font-extrabold text-gray-900 dark:text-white">155.3K</div>
              <div className="text-sm text-gray-500 dark:text-gray-400">App Visitors (Monthly)</div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-5 border border-gray-100 dark:border-gray-700">
              <div className="text-2xl">⚡</div>
              <div className="text-2xl font-extrabold text-gray-900 dark:text-white">99.97%</div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Platform Uptime</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CompanyPortal;
