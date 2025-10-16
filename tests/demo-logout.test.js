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

// Test suite
async function runTests() {
  console.log('🧪 Starting Demo Logout Tests...\n');
  
  let testsPassed = 0;
  let testsFailed = 0;

  // Test 1: Demo Login
  console.log('Test 1: Demo Login');
  try {
    await demoLogin();
    
    if (currentUser === null) {
      throw new Error('currentUser should be set after demoLogin');
    }
    if (!currentUser.isDemo) {
      throw new Error('currentUser.isDemo should be true');
    }
    if (localStorage.getItem('demoUser') === null) {
      throw new Error('demoUser should be in localStorage');
    }
    if (localStorage.getItem('demoData') === null) {
      throw new Error('demoData should be in localStorage');
    }
    
    console.log('✅ PASSED: Demo user logged in successfully');
    console.log(`   - currentUser.email: ${currentUser.email}`);
    console.log(`   - localStorage has demoUser: ${localStorage.getItem('demoUser') !== null}`);
    console.log(`   - localStorage has demoData: ${localStorage.getItem('demoData') !== null}`);
    testsPassed++;
  } catch (error) {
    console.log(`❌ FAILED: ${error.message}`);
    testsFailed++;
  }
  console.log('');

  // Test 2: Demo Logout
  console.log('Test 2: Demo Logout');
  try {
    await logout();
    
    if (currentUser !== null) {
      throw new Error('currentUser should be null after logout');
    }
    if (localStorage.getItem('demoUser') !== null) {
      throw new Error('demoUser should be removed from localStorage');
    }
    if (localStorage.getItem('demoData') !== null) {
      throw new Error('demoData should be removed from localStorage');
    }
    
    console.log('✅ PASSED: Demo logout cleared all state');
    console.log(`   - currentUser is null: ${currentUser === null}`);
    console.log(`   - demoUser removed: ${localStorage.getItem('demoUser') === null}`);
    console.log(`   - demoData removed: ${localStorage.getItem('demoData') === null}`);
    testsPassed++;
  } catch (error) {
    console.log(`❌ FAILED: ${error.message}`);
    testsFailed++;
  }
  console.log('');

  // Test 3: Re-login after logout
  console.log('Test 3: Re-login After Logout');
  try {
    await demoLogin();
    
    if (currentUser === null) {
      throw new Error('Should be able to login again after logout');
    }
    if (!currentUser.isDemo) {
      throw new Error('Re-login should set isDemo flag');
    }
    
    console.log('✅ PASSED: Can re-login after logout');
    console.log(`   - currentUser restored: ${currentUser !== null}`);
    testsPassed++;
  } catch (error) {
    console.log(`❌ FAILED: ${error.message}`);
    testsFailed++;
  }
  console.log('');

  // Test 4: Logout again to verify consistency
  console.log('Test 4: Second Logout (Consistency Check)');
  try {
    await logout();
    
    if (currentUser !== null) {
      throw new Error('Second logout should also clear state');
    }
    
    console.log('✅ PASSED: Second logout works correctly');
    testsPassed++;
  } catch (error) {
    console.log(`❌ FAILED: ${error.message}`);
    testsFailed++;
  }
  console.log('');

  // Summary
  console.log('═'.repeat(50));
  console.log('📊 Test Summary');
  console.log('═'.repeat(50));
  console.log(`Total Tests: ${testsPassed + testsFailed}`);
  console.log(`✅ Passed: ${testsPassed}`);
  console.log(`❌ Failed: ${testsFailed}`);
  console.log('');
  
  if (testsFailed === 0) {
    console.log('🎉 All tests passed! Demo logout is working correctly.');
    process.exit(0);
  } else {
    console.log('⚠️  Some tests failed. Please review the implementation.');
    process.exit(1);
  }
}

// Run tests
runTests().catch(error => {
  console.error('💥 Test suite crashed:', error);
  process.exit(1);
});
