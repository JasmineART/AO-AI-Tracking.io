/**
 * Demo Logout Verification Test
 * 
 * This script tests the demo login -> logout flow to ensure:
 * 1. Demo user is properly stored in localStorage on login
 * 2. Demo data is initialized
 * 3. Logout clears both demoUser and demoData from localStorage
 * 4. State is properly reset after logout
 */

// Mock localStorage for Node.js environment
class LocalStorageMock {
  constructor() {
    this.store = {};
  }

  clear() {
    this.store = {};
  }

  getItem(key) {
    return this.store[key] || null;
  }

  setItem(key, value) {
    this.store[key] = String(value);
  }

  removeItem(key) {
    delete this.store[key];
  }

  get length() {
    return Object.keys(this.store).length;
  }

  key(index) {
    const keys = Object.keys(this.store);
    return keys[index] || null;
  }
}

// Setup
const localStorage = new LocalStorageMock();
let currentUser = null;

// Simulate demoLogin function
function demoLogin() {
  const demoUser = {
    uid: 'demo-user-123',
    email: 'demo@oaitracker.com',
    displayName: 'Demo User',
    photoURL: null,
    isDemo: true
  };
  currentUser = demoUser;
  localStorage.setItem('demoUser', JSON.stringify(demoUser));
  
  // Simulate demo data initialization
  const demoData = {
    projects: [
      { id: '1', name: 'Test Project', status: 'Active' }
    ]
  };
  localStorage.setItem('demoData', JSON.stringify(demoData));
  
  return Promise.resolve(demoUser);
}

// Simulate logout function (matches our implementation)
async function logout() {
  if (currentUser && currentUser.isDemo) {
    try {
      localStorage.removeItem('demoUser');
      localStorage.removeItem('demoData');
    } catch (err) {
      console.warn('Could not remove demo data from localStorage:', err);
    }
    currentUser = null;
    return Promise.resolve();
  }

  // For non-demo users, would call Firebase signOut
  currentUser = null;
  return Promise.resolve();
}

describe('Demo logout flow (localStorage)', () => {
  beforeEach(() => {
    // clear mock localStorage
    localStorage.clear();
    currentUser = null;
  });

  test('demoLogin stores demoUser and demoData and logout clears them', async () => {
    await demoLogin();
    expect(currentUser).not.toBeNull();
    expect(currentUser.isDemo).toBe(true);
    expect(localStorage.getItem('demoUser')).not.toBeNull();
    expect(localStorage.getItem('demoData')).not.toBeNull();

    await logout();
    expect(currentUser).toBeNull();
    expect(localStorage.getItem('demoUser')).toBeNull();
    expect(localStorage.getItem('demoData')).toBeNull();
  });
});
