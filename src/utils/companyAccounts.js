import { get, ref, remove, set, update } from 'firebase/database';
import { realtimeDb } from '../firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';

const STORAGE_KEY = 'ao_company_accounts_v1';
const COMPANY_TABLE_PATH = 'company_table';
const ACCOUNT_TABLE_PATH = 'account_table';
const PROJECT_DATA_PATH = 'project_data';
const ACCOUNT_BY_USER_PATH = 'account_by_user';
const BACKFILL_STATUS_KEY_PREFIX = 'company_backfill_done_';

export const COMPANY_ROLE_LABELS = {
  admin: 'Administrator',
  team_lead: 'Team Lead',
  account_manager: 'Account Manager',
  customer_service: 'Customer Service',
  member: 'Member'
};

export const COMPANY_ROLE_OPTIONS = Object.keys(COMPANY_ROLE_LABELS);

export const EMPLOYEE_PORTAL_ROLE_OPTIONS = COMPANY_ROLE_OPTIONS.filter((role) => role !== 'member');

export const COMPANY_PERMISSION_OPTIONS = [
  { value: 'owner', label: 'Owner' },
  { value: 'manage_users', label: 'Manage Users' },
  { value: 'manage_projects', label: 'Manage Projects' },
  { value: 'view_only', label: 'View Only' }
];

const MANAGEMENT_ROLES = ['admin', 'account_manager'];

export const SUBSCRIPTION_PACKAGES = {
  small_team: {
    id: 'small_team',
    name: 'Small Team',
    minUsers: 1,
    maxUsers: 3,
    price: '$79/mo'
  },
  small_business: {
    id: 'small_business',
    name: 'Small Business',
    minUsers: 4,
    maxUsers: 15,
    price: '$249/mo'
  },
  enterprise_mini: {
    id: 'enterprise_mini',
    name: 'Enterprise Mini',
    minUsers: 15,
    maxUsers: 50,
    price: '$699/mo'
  }
};

const DOMAIN_COMPANY_MAP = {
  'oaitracker.com': 'co-oa-ai',
  'acme.com': 'co-acme-corp'
};

const DEFAULT_COMPANIES = [
  {
    id: 'co-oa-ai',
    name: 'OA AI LLC',
    subscriptionPackage: 'small_business',
    status: 'active',
    users: [
      {
        userId: 'emp-admin-001',
        email: 'admin@oaitracker.com',
        name: 'Sam Patel',
        role: 'admin',
        permission: 'owner'
      },
      {
        userId: 'emp-tl-001',
        email: 'team.lead@oaitracker.com',
        name: 'Alex Chen',
        role: 'team_lead',
        permission: 'manage_projects'
      },
      {
        userId: 'emp-am-001',
        email: 'am.lead@oaitracker.com',
        name: 'Taylor Morgan',
        role: 'account_manager',
        permission: 'manage_users'
      },
      {
        userId: 'emp-cs-001',
        email: 'cs.agent@oaitracker.com',
        name: 'Jordan Rivera',
        role: 'customer_service',
        permission: 'view_only'
      }
    ],
    projects: [
      {
        id: 'org-prj-001',
        name: 'Customer Support Agent Copilot',
        type: 'AI System',
        status: 'In Progress',
        owner: 'Jordan Rivera',
        department: 'Customer Service',
        progress: 74,
        updatedAt: '2026-05-02'
      },
      {
        id: 'org-prj-002',
        name: 'Invoice Reconciliation Automation',
        type: 'Automation',
        status: 'In Progress',
        owner: 'Taylor Morgan',
        department: 'Finance Ops',
        progress: 61,
        updatedAt: '2026-05-08'
      },
      {
        id: 'org-prj-003',
        name: 'Enterprise Knowledge Search',
        type: 'AI System',
        status: 'Planning',
        owner: 'Alex Chen',
        department: 'Operations',
        progress: 28,
        updatedAt: '2026-05-10'
      }
    ]
  },
  {
    id: 'co-acme-corp',
    name: 'Acme Corporation',
    subscriptionPackage: 'small_team',
    status: 'active',
    users: [
      {
        userId: 'acme-owner-001',
        email: 'owner@acme.com',
        name: 'Chris Lane',
        role: 'admin',
        permission: 'owner'
      }
    ],
    projects: [
      {
        id: 'org-prj-004',
        name: 'Sales Forecasting Model',
        type: 'AI System',
        status: 'In Progress',
        owner: 'Chris Lane',
        department: 'Sales',
        progress: 52,
        updatedAt: '2026-05-09'
      }
    ]
  }
];

const safeClone = (value) => JSON.parse(JSON.stringify(value));

const getCompanyPayload = (company) => ({
  id: company.id,
  name: company.name,
  subscriptionPackage: company.subscriptionPackage,
  status: company.status || 'active',
  updatedAt: new Date().toISOString()
});

const getAccountPayload = (companyId, account) => ({
  companyId,
  userId: account.userId,
  email: account.email,
  name: account.name,
  role: account.role,
  permission: account.permission,
  updatedAt: new Date().toISOString()
});

const getProjectPayload = (companyId, project) => ({
  companyId,
  id: project.id,
  name: project.name,
  type: project.type,
  status: project.status,
  owner: project.owner,
  department: project.department,
  progress: project.progress,
  updatedAt: project.updatedAt || new Date().toISOString()
});

const syncCompanyToRealtimeDb = async (company) => {
  if (!company || !company.id) return;

  const companyRef = ref(realtimeDb, `${COMPANY_TABLE_PATH}/${company.id}`);
  await set(companyRef, getCompanyPayload(company));

  const accounts = Array.isArray(company.users) ? company.users : [];
  const projects = Array.isArray(company.projects) ? company.projects : [];

  const accountWrites = accounts.map(async (account) => {
    if (!account.userId) return;
    const accountRef = ref(realtimeDb, `${ACCOUNT_TABLE_PATH}/${company.id}/${account.userId}`);
    const accountByUserRef = ref(realtimeDb, `${ACCOUNT_BY_USER_PATH}/${account.userId}`);
    const payload = getAccountPayload(company.id, account);
    await set(accountRef, payload);
    await set(accountByUserRef, payload);
  });

  const projectWrites = projects.map(async (project) => {
    if (!project.id) return;
    const projectRef = ref(realtimeDb, `${PROJECT_DATA_PATH}/${company.id}/${project.id}`);
    await set(projectRef, getProjectPayload(company.id, project));
  });

  await Promise.all([...accountWrites, ...projectWrites]);
};

const seedRealtimeDbIfEmpty = async (companyAccounts) => {
  const snapshot = await get(ref(realtimeDb, COMPANY_TABLE_PATH));
  if (snapshot.exists()) return;

  const writes = companyAccounts.map((company) => syncCompanyToRealtimeDb(company));
  await Promise.all(writes);
};

const queueRealtimeSync = (company, companyAccounts = null) => {
  Promise.resolve()
    .then(async () => {
      if (companyAccounts && companyAccounts.length > 0) {
        await seedRealtimeDbIfEmpty(companyAccounts);
      }
      await syncCompanyToRealtimeDb(company);
    })
    .catch((error) => {
      console.error('Failed to sync company/account data to Firebase:', error);
    });
};

export const getCompanyAccounts = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const defaults = safeClone(DEFAULT_COMPANIES);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(defaults));
      return defaults;
    }

    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      throw new Error('Invalid company account data');
    }
    return parsed;
  } catch (error) {
    const fallback = safeClone(DEFAULT_COMPANIES);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(fallback));
    return fallback;
  }
};

export const saveCompanyAccounts = (companyAccounts) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(companyAccounts));
};

const createDefaultCompanyFromUser = (user) => {
  const workspaceName = user.displayName ? `${user.displayName} Workspace` : 'New Workspace';
  return {
    id: `co-${user.uid}`,
    name: workspaceName,
    subscriptionPackage: 'small_team',
    status: 'active',
    users: [],
    projects: []
  };
};

export const getDefaultPermissionForRole = (role = 'member') => {
  const map = {
    admin: 'owner',
    team_lead: 'manage_projects',
    account_manager: 'manage_users',
    customer_service: 'view_only',
    member: 'view_only'
  };
  return map[role] || 'view_only';
};

export const hasUserManagementAccess = (role = 'member') => MANAGEMENT_ROLES.includes(role);

export const hasBillingAccess = (role = 'member') => MANAGEMENT_ROLES.includes(role);

export const isUserCountWithinPackage = (userCount, packageConfig) => {
  if (!packageConfig) return false;
  return userCount >= packageConfig.minUsers && userCount <= packageConfig.maxUsers;
};

export const associateUserWithCompanyAccount = (user, preferredRole = 'member') => {
  if (!user || !user.uid || !user.email) {
    return { company: null, companyRole: 'member', companyAccounts: getCompanyAccounts() };
  }

  const companyAccounts = getCompanyAccounts();
  const email = String(user.email).toLowerCase();
  const domain = email.split('@')[1] || '';

  let targetCompany = null;
  let companyUser = null;
  let hasChanges = false;

  for (const company of companyAccounts) {
    const matchedUser = company.users.find(
      (entry) => entry.userId === user.uid || entry.email.toLowerCase() === email
    );
    if (matchedUser) {
      targetCompany = company;
      companyUser = matchedUser;
      break;
    }
  }

  if (!targetCompany) {
    const mappedId = DOMAIN_COMPANY_MAP[domain];
    if (mappedId) {
      targetCompany = companyAccounts.find((company) => company.id === mappedId) || null;
    }
  }

  if (!targetCompany) {
    targetCompany = createDefaultCompanyFromUser(user);
    companyAccounts.push(targetCompany);
    hasChanges = true;
  }

  if (!companyUser) {
    companyUser = {
      userId: user.uid,
      email,
      name: user.displayName || email.split('@')[0],
      role: preferredRole,
      permission: getDefaultPermissionForRole(preferredRole)
    };
    targetCompany.users.push(companyUser);
    hasChanges = true;
  }

  const dedupedUsers = [];
  const seen = new Set();
  for (const entry of targetCompany.users) {
    const stableIdentity = entry.userId || String(entry.email).toLowerCase();
    if (!seen.has(stableIdentity)) {
      seen.add(stableIdentity);
      dedupedUsers.push(entry);
    }
  }
  if (dedupedUsers.length !== targetCompany.users.length) {
    hasChanges = true;
  }
  targetCompany.users = dedupedUsers;

  if (hasChanges) {
    saveCompanyAccounts(companyAccounts);
  }

  queueRealtimeSync(targetCompany, companyAccounts);

  return {
    company: targetCompany,
    companyRole: companyUser.role || 'member',
    companyAccounts
  };
};

export const getUserCompany = (user) => {
  const result = associateUserWithCompanyAccount(user, user?.employeeRole || 'member');
  return result.company;
};

export const updateCompanyUserPermission = async (companyId, userId, permission) => {
  const companyAccounts = getCompanyAccounts();
  const company = companyAccounts.find((entry) => entry.id === companyId);

  if (!company) {
    return { ok: false, error: 'Company account not found.' };
  }

  const user = company.users.find((entry) => entry.userId === userId);
  if (!user) {
    return { ok: false, error: 'User not found in this company account.' };
  }

  user.permission = permission;
  saveCompanyAccounts(companyAccounts);
  try {
    await syncCompanyToRealtimeDb(company);
    // Sync permission to Firestore users collection
    try {
      await updateDoc(doc(db, 'users', userId), { companyPermission: permission, updatedAt: new Date().toISOString() });
    } catch (_firestoreErr) {
      // Firestore user doc may not exist yet; non-fatal
    }
  } catch (error) {
    return { ok: false, error: 'Permission updated locally, but failed to sync to Firebase.' };
  }
  return { ok: true, companyAccounts };
};

export const updateCompanyUserRole = async (companyId, userId, role) => {
  const companyAccounts = getCompanyAccounts();
  const company = companyAccounts.find((entry) => entry.id === companyId);

  if (!company) {
    return { ok: false, error: 'Company account not found.' };
  }

  const user = company.users.find((entry) => entry.userId === userId);
  if (!user) {
    return { ok: false, error: 'User not found in this company account.' };
  }

  user.role = role;
  user.permission = getDefaultPermissionForRole(role);

  saveCompanyAccounts(companyAccounts);
  try {
    await syncCompanyToRealtimeDb(company);
    // Sync role and permission to Firestore users collection
    try {
      await updateDoc(doc(db, 'users', userId), {
        companyRole: role,
        companyPermission: user.permission,
        updatedAt: new Date().toISOString()
      });
    } catch (_firestoreErr) {
      // Firestore user doc may not exist yet; non-fatal
    }
  } catch (error) {
    return { ok: false, error: 'Role updated locally, but failed to sync to Firebase.' };
  }
  return { ok: true, companyAccounts };
};

export const updateCompanySubscription = async (companyId, subscriptionPackage) => {
  const packageConfig = SUBSCRIPTION_PACKAGES[subscriptionPackage];
  if (!packageConfig) {
    return { ok: false, error: 'Invalid subscription package.' };
  }

  const companyAccounts = getCompanyAccounts();
  const company = companyAccounts.find((entry) => entry.id === companyId);

  if (!company) {
    return { ok: false, error: 'Company account not found.' };
  }

  const userCount = company.users.length;
  if (!isUserCountWithinPackage(userCount, packageConfig)) {
    return {
      ok: false,
      error: `${packageConfig.name} supports ${packageConfig.minUsers}-${packageConfig.maxUsers} users. Current account has ${userCount} users.`
    };
  }

  company.subscriptionPackage = subscriptionPackage;
  saveCompanyAccounts(companyAccounts);
  try {
    await syncCompanyToRealtimeDb(company);
  } catch (error) {
    return { ok: false, error: 'Subscription updated locally, but failed to sync to Firebase.' };
  }
  return { ok: true, companyAccounts };
};

export const getCompanyIdForUserFromRealtimeDb = async (userId) => {
  if (!userId) return null;
  try {
    const snapshot = await get(ref(realtimeDb, `${ACCOUNT_BY_USER_PATH}/${userId}`));
    if (!snapshot.exists()) return null;
    return snapshot.val()?.companyId || null;
  } catch (error) {
    console.error('Failed to resolve company for user from Firebase:', error);
    return null;
  }
};

export const runOneTimeCompanyBackfill = async (userId) => {
  if (!userId) {
    return { ok: false, skipped: true, reason: 'Missing user id.' };
  }

  const backfillStatusKey = `${BACKFILL_STATUS_KEY_PREFIX}${userId}`;
  if (localStorage.getItem(backfillStatusKey) === 'true') {
    return { ok: true, skipped: true, reason: 'Backfill already completed.' };
  }

  const companyAccounts = getCompanyAccounts();
  if (!companyAccounts.length) {
    localStorage.setItem(backfillStatusKey, 'true');
    return { ok: true, skipped: true, reason: 'No company data to backfill.' };
  }

  try {
    await Promise.all(companyAccounts.map((company) => syncCompanyToRealtimeDb(company)));
    localStorage.setItem(backfillStatusKey, 'true');
    return { ok: true, skipped: false, syncedCompanies: companyAccounts.length };
  } catch (error) {
    console.error('One-time company backfill failed:', error);
    return { ok: false, skipped: false, error: error.message || 'Backfill failed.' };
  }
};

export const syncCompanyProjectToRealtimeDb = async (companyId, project) => {
  if (!companyId || !project?.id) return;
  const projectRef = ref(realtimeDb, `${PROJECT_DATA_PATH}/${companyId}/${project.id}`);
  await set(projectRef, getProjectPayload(companyId, project));
};

export const deleteCompanyProjectFromRealtimeDb = async (companyId, projectId) => {
  if (!companyId || !projectId) return;
  await remove(ref(realtimeDb, `${PROJECT_DATA_PATH}/${companyId}/${projectId}`));
};

/**
 * Propagate partial account field changes (e.g. displayName) to account_table
 * and account_by_user without requiring a full company re-sync.
 */
export const syncAccountInCompanyTables = async (userId, fieldsToUpdate) => {
  if (!userId || !fieldsToUpdate || Object.keys(fieldsToUpdate).length === 0) return;
  try {
    const companyId = await getCompanyIdForUserFromRealtimeDb(userId);
    if (!companyId) return;
    const accountRef = ref(realtimeDb, `${ACCOUNT_TABLE_PATH}/${companyId}/${userId}`);
    const accountByUserRef = ref(realtimeDb, `${ACCOUNT_BY_USER_PATH}/${userId}`);
    const patch = { ...fieldsToUpdate, updatedAt: new Date().toISOString() };
    await Promise.all([update(accountRef, patch), update(accountByUserRef, patch)]);

    // Mirror the change into localStorage so the in-memory view stays consistent
    const companyAccounts = getCompanyAccounts();
    const company = companyAccounts.find((c) => c.id === companyId);
    if (company) {
      const account = company.users.find((u) => u.userId === userId);
      if (account) {
        Object.assign(account, fieldsToUpdate);
        saveCompanyAccounts(companyAccounts);
      }
    }
  } catch (error) {
    console.error('❌ Failed to sync account fields to company tables:', error);
    throw error;
  }
};

export const getSubscriptionLabel = (subscriptionPackage) => {
  const config = SUBSCRIPTION_PACKAGES[subscriptionPackage];
  if (!config) return 'Unknown Package';
  return `${config.name} (${config.minUsers}-${config.maxUsers} users)`;
};
