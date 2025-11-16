import { ref, set, get, update, remove, push, onValue, off } from 'firebase/database';
import { realtimeDb } from '../firebase';
import validators from './validators';
import errorMonitor from './errorMonitoring';

/**
 * Save user data to Realtime Database
 */
export const saveUserToRealtimeDb = async (user) => {
  if (!user) return;

  try {
    const userRef = ref(realtimeDb, `users/${user.uid}`);
    const snapshot = await get(userRef);

    const userData = {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName || user.email?.split('@')[0],
      photoURL: user.photoURL || null,
      lastLogin: new Date().toISOString(),
    };

    if (!snapshot.exists()) {
      // New user - add createdAt timestamp
      await set(userRef, {
        ...userData,
        createdAt: new Date().toISOString(),
        projects: [],
        preferences: {
          theme: 'light',
          notifications: true
        }
      });
      if (process.env.NODE_ENV === 'development') {
        console.log('✅ New user created in Realtime Database:', user.email);
      }
    } else {
      // Existing user - update last login
      await update(userRef, { lastLogin: userData.lastLogin });
      if (process.env.NODE_ENV === 'development') {
        console.log('✅ User login updated in Realtime Database:', user.email);
      }
    }

    return userData;
  } catch (error) {
    console.error('❌ Error saving user to Realtime Database:', error);
    throw error;
  }
};

/**
 * Get user data from Realtime Database
 */
export const getUserFromRealtimeDb = async (userId) => {
  try {
    const userRef = ref(realtimeDb, `users/${userId}`);
    const snapshot = await get(userRef);
    
    if (snapshot.exists()) {
      return snapshot.val();
    } else {
      if (process.env.NODE_ENV === 'development') {
        console.log('No user data found in Realtime Database');
      }
      return null;
    }
  } catch (error) {
    console.error('Error getting user data from Realtime Database:', error);
    throw error;
  }
};

/**
 * Update user profile in Realtime Database
 */
export const updateUserInRealtimeDb = async (userId, updates) => {
  try {
    const userRef = ref(realtimeDb, `users/${userId}`);
    await update(userRef, updates);
    if (process.env.NODE_ENV === 'development') {
      console.log('✅ User profile updated in Realtime Database');
    }
    return true;
  } catch (error) {
    console.error('❌ Error updating user in Realtime Database:', error);
    throw error;
  }
};

/**
 * Save project to Realtime Database
 */
export const saveProjectToRealtimeDb = async (userId, project) => {
  try {
    // Create the project data with ID and userId before validation
    const projectsRef = ref(realtimeDb, `users/${userId}/projects`);
    const newProjectRef = push(projectsRef);
    
    const projectData = {
      ...project,
      id: newProjectRef.key,
      userId: userId,
      startDate: project.startDate || new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    // Validate project data (pass isNew = true to skip ID/userId checks for new projects)
    const validation = validators.validateProject(projectData, false);
    if (!validation.valid) {
      const error = new Error(`Invalid project data: ${validation.errors.join(', ')}`);
      errorMonitor.logError({
        type: 'Validation Error',
        message: error.message,
        data: projectData,
        timestamp: new Date().toISOString()
      });
      throw error;
    }
    
      if (process.env.NODE_ENV === 'development') {
        console.log('💾 Saving project to Firebase:', projectData);
      }    await set(newProjectRef, projectData);
    
      if (process.env.NODE_ENV === 'development') {
        console.log('✅ Project saved to Realtime Database');
      }
    return newProjectRef.key;
  } catch (error) {
    console.error('❌ Error saving project to Realtime Database:', error);
    console.error('Error details:', error.message, error.code);
    throw error;
  }
};

/**
 * Get all projects for a user from Realtime Database
 */
export const getUserProjectsFromRealtimeDb = async (userId) => {
  try {
    const projectsRef = ref(realtimeDb, `users/${userId}/projects`);
    const snapshot = await get(projectsRef);
    
    if (snapshot.exists()) {
      const projectsObj = snapshot.val();
      // Convert object to array with safety check
      if (projectsObj && typeof projectsObj === 'object') {
        return Object.keys(projectsObj).map(key => ({
          id: key,
          ...projectsObj[key]
        }));
      }
      return [];
    } else {
      if (process.env.NODE_ENV === 'development') {
        console.log('No projects found for user, returning empty array');
      }
      return [];
    }
  } catch (error) {
    console.error('Error getting projects from Realtime Database:', error);
    // Return empty array on error instead of throwing
    return [];
  }
};

/**
 * Update project in Realtime Database
 */
export const updateProjectInRealtimeDb = async (userId, projectId, updates) => {
  try {
    // Prepare the full project data for validation
    const updatedProject = {
      ...updates,
      id: projectId,
      userId: userId,
      updatedAt: new Date().toISOString()
    };

    // Validate the updated project data
    const validation = validators.validateProject(updatedProject, false);
    if (!validation.valid) {
      const error = new Error(`Invalid project data: ${validation.errors.join(', ')}`);
      errorMonitor.logError({
        type: 'Validation Error',
        message: error.message,
        data: updatedProject,
        timestamp: new Date().toISOString()
      });
      throw error;
    }

    const projectRef = ref(realtimeDb, `users/${userId}/projects/${projectId}`);
    await update(projectRef, updatedProject);
    if (process.env.NODE_ENV === 'development') {
      console.log('✅ Project updated in Realtime Database');
    }
    return true;
  } catch (error) {
    console.error('❌ Error updating project in Realtime Database:', error);
    throw error;
  }
};

/**
 * Delete project from Realtime Database
 */
export const deleteProjectFromRealtimeDb = async (userId, projectId) => {
  try {
    const projectRef = ref(realtimeDb, `users/${userId}/projects/${projectId}`);
    await remove(projectRef);
    if (process.env.NODE_ENV === 'development') {
      console.log('✅ Project deleted from Realtime Database');
    }
    return true;
  } catch (error) {
    console.error('❌ Error deleting project from Realtime Database:', error);
    throw error;
  }
};

/**
 * Listen to user data changes in real-time
 */
export const listenToUserData = (userId, callback) => {
  const userRef = ref(realtimeDb, `users/${userId}`);
  onValue(userRef, (snapshot) => {
    if (snapshot.exists()) {
      callback(snapshot.val());
    } else {
      callback(null);
    }
  });
  
  // Return unsubscribe function
  return () => off(userRef);
};

/**
 * Listen to projects changes in real-time
 */
export const listenToProjects = (userId, callback) => {
  const projectsRef = ref(realtimeDb, `users/${userId}/projects`);
  onValue(projectsRef, (snapshot) => {
    if (snapshot.exists()) {
      const projectsObj = snapshot.val();
      const projectsArray = Object.keys(projectsObj).map(key => ({
        id: key,
        ...projectsObj[key]
      }));
      callback(projectsArray);
    } else {
      callback([]);
    }
  });
  
  // Return unsubscribe function
  return () => off(projectsRef);
};

/**
 * Delete user data from Realtime Database
 */
export const deleteUserFromRealtimeDb = async (userId) => {
  try {
    const userRef = ref(realtimeDb, `users/${userId}`);
    await remove(userRef);
    if (process.env.NODE_ENV === 'development') {
      console.log('✅ User data deleted from Realtime Database');
    }
    return true;
  } catch (error) {
    console.error('❌ Error deleting user from Realtime Database:', error);
    throw error;
  }
};

export default {
  saveUserToRealtimeDb,
  getUserFromRealtimeDb,
  updateUserInRealtimeDb,
  saveProjectToRealtimeDb,
  getUserProjectsFromRealtimeDb,
  updateProjectInRealtimeDb,
  deleteProjectFromRealtimeDb,
  listenToUserData,
  listenToProjects,
  deleteUserFromRealtimeDb
};
