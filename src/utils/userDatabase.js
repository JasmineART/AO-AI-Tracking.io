import { doc, getDoc, setDoc, updateDoc, deleteDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase';

/**
 * Get user data from Firestore
 */
export const getUserData = async (userId) => {
  try {
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);
    
    if (userSnap.exists()) {
      return userSnap.data();
    } else {
      console.log('No user data found');
      return null;
    }
  } catch (error) {
    console.error('Error getting user data:', error);
    throw error;
  }
};

/**
 * Update user profile information
 */
export const updateUserProfile = async (userId, updates) => {
  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, updates);
    console.log('✅ User profile updated successfully');
    return true;
  } catch (error) {
    console.error('❌ Error updating user profile:', error);
    throw error;
  }
};

/**
 * Add a project to user's project list
 */
export const addProjectToUser = async (userId, projectId) => {
  try {
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);
    
    if (userSnap.exists()) {
      const currentProjects = userSnap.data().projects || [];
      if (!currentProjects.includes(projectId)) {
        await updateDoc(userRef, {
          projects: [...currentProjects, projectId]
        });
        console.log('✅ Project added to user');
      }
    }
  } catch (error) {
    console.error('❌ Error adding project to user:', error);
    throw error;
  }
};

/**
 * Get all users (admin function)
 */
export const getAllUsers = async () => {
  try {
    const usersRef = collection(db, 'users');
    const querySnapshot = await getDocs(usersRef);
    
    const users = [];
    querySnapshot.forEach((doc) => {
      users.push({ id: doc.id, ...doc.data() });
    });
    
    return users;
  } catch (error) {
    console.error('Error getting all users:', error);
    throw error;
  }
};

/**
 * Search users by email
 */
export const searchUsersByEmail = async (email) => {
  try {
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('email', '==', email));
    const querySnapshot = await getDocs(q);
    
    const users = [];
    querySnapshot.forEach((doc) => {
      users.push({ id: doc.id, ...doc.data() });
    });
    
    return users;
  } catch (error) {
    console.error('Error searching users:', error);
    throw error;
  }
};

/**
 * Delete user data (called when user account is deleted)
 */
export const deleteUserData = async (userId) => {
  try {
    const userRef = doc(db, 'users', userId);
    await deleteDoc(userRef);
    console.log('✅ User data deleted successfully');
    return true;
  } catch (error) {
    console.error('❌ Error deleting user data:', error);
    throw error;
  }
};

export default {
  getUserData,
  updateUserProfile,
  addProjectToUser,
  getAllUsers,
  searchUsersByEmail,
  deleteUserData
};
