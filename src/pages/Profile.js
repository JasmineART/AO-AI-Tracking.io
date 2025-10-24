import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { getUserFromRealtimeDb, updateUserInRealtimeDb, listenToUserData } from '../utils/realtimeDatabase';

const Profile = () => {
  const { currentUser, logout } = useAuth();
  const { success, error: showError } = useToast();
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    displayName: '',
    bio: '',
    phone: '',
    company: '',
    position: ''
  });

  useEffect(() => {
    const fetchUserData = async () => {
      if (currentUser && !currentUser.isDemo) {
        try {
          const data = await getUserFromRealtimeDb(currentUser.uid);
          setUserData(data);
          setFormData({
            displayName: data?.displayName || currentUser.displayName || '',
            bio: data?.bio || '',
            phone: data?.phone || '',
            company: data?.company || '',
            position: data?.position || ''
          });
        } catch (error) {
          console.error('Error fetching user data:', error);
        }
      }
      setLoading(false);
    };

    fetchUserData();
  }, [currentUser]);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      await updateUserInRealtimeDb(currentUser.uid, formData);
      const updatedData = await getUserFromRealtimeDb(currentUser.uid);
      setUserData(updatedData);
      setEditMode(false);
      success('Profile updated successfully! 🎉');
    } catch (error) {
      console.error('Error updating profile:', error);
      showError('Failed to update profile. Please try again.');
    }
  };

  const handleLogout = async () => {
    try {
      // AuthContext logout() now handles all cleanup including demo state
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Failed to logout:', error);
    }
  };

  if (!currentUser) {
    navigate('/login');
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-purple-50 to-pink-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <h1 className="text-4xl font-extrabold mb-8 animate-fadeInDown">
          <span className="gradient-text">Profile Settings</span>
        </h1>

        {/* Profile Card */}
        <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl p-8 mb-6 border border-gray-100 animate-fadeInUp">
          <div className="flex items-start gap-6">
            {/* Avatar */}
            <div className="flex-shrink-0">
              {currentUser.photoURL ? (
                <img
                  src={currentUser.photoURL}
                  alt="Profile"
                  className="w-28 h-28 rounded-2xl border-4 border-indigo-200 shadow-xl transform hover:scale-110 transition-transform duration-300"
                />
              ) : (
                <div className="w-28 h-28 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-xl transform hover:scale-110 transition-transform duration-300">
                  <span className="text-4xl font-bold text-white">
                    {currentUser.displayName?.[0] || currentUser.email?.[0]?.toUpperCase() || 'U'}
                  </span>
                </div>
              )}
            </div>

            {/* User Info */}
            <div className="flex-grow">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                {currentUser.displayName || 'User'}
                {currentUser.isDemo && (
                  <span className="ml-3 text-sm bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-1.5 rounded-full shadow-lg">
                    🎮 Demo Account
                  </span>
                )}
              </h2>
              <p className="text-gray-600 mb-6 text-lg">{currentUser.email}</p>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div className="p-4 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl">
                  <label className="text-sm font-bold text-gray-500">User ID</label>
                  <p className="text-gray-900 font-mono text-sm mt-1">{currentUser.uid}</p>
                </div>
                <div className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl">
                  <label className="text-sm font-bold text-gray-500">Account Type</label>
                  <p className="text-gray-900 font-semibold mt-1">
                    {currentUser.isDemo ? '🎮 Demo' : '⭐ Standard'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Account Information */}
        <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl p-8 mb-6 border border-gray-100 animate-fadeInUp" style={{animationDelay: '0.1s'}}>
          <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <span>📋</span> Account Information
          </h3>
          
          <div className="space-y-6">
            <div className="border-l-4 border-indigo-500 bg-indigo-50 rounded-r-xl p-5">
              <label className="block text-sm font-bold text-gray-500 mb-2">
                📧 Email Address
              </label>
              <p className="text-gray-900 text-lg">{currentUser.email}</p>
            </div>

            <div className="border-l-4 border-purple-500 bg-purple-50 rounded-r-xl p-5">
              <label className="block text-sm font-bold text-gray-500 mb-2">
                👤 Display Name
              </label>
              <p className="text-gray-900 text-lg">{currentUser.displayName || 'Not set'}</p>
            </div>

            <div className="border-l-4 border-green-500 bg-green-50 rounded-r-xl p-5">
              <label className="block text-sm font-bold text-gray-500 mb-2">
                ✅ Account Status
              </label>
              <p className="text-green-600 font-bold text-lg">Active</p>
            </div>

            <div className="border-l-4 border-blue-500 bg-blue-50 rounded-r-xl p-5">
              <label className="block text-sm font-bold text-gray-500 mb-2">
                📅 Member Since
              </label>
              <p className="text-gray-900 text-lg">
                {currentUser.metadata?.creationTime || new Date().toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>

        {/* Database Storage Info - Only for authenticated users */}
        {!currentUser.isDemo && userData && (
          <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl p-8 mb-6 border border-gray-100 animate-fadeInUp" style={{animationDelay: '0.15s'}}>
            <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <span>💾</span> Database Information
            </h3>
            
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-6 border-2 border-green-200 mb-4">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-3xl">✅</span>
                <div>
                  <p className="font-bold text-green-800">User Data Saved in Realtime Database</p>
                  <p className="text-sm text-green-600">Your profile is securely stored in Firebase Realtime Database</p>
                </div>
              </div>
              
              <div className="grid md:grid-cols-2 gap-4 mt-4">
                <div className="bg-white/80 rounded-xl p-4">
                  <p className="text-xs text-gray-500 mb-1">Created At</p>
                  <p className="font-mono text-sm text-gray-800">
                    {userData.createdAt ? new Date(userData.createdAt).toLocaleString() : 'Just now'}
                  </p>
                </div>
                <div className="bg-white/80 rounded-xl p-4">
                  <p className="text-xs text-gray-500 mb-1">Last Login</p>
                  <p className="font-mono text-sm text-gray-800">
                    {userData.lastLogin ? new Date(userData.lastLogin).toLocaleString() : 'Just now'}
                  </p>
                </div>
                <div className="bg-white/80 rounded-xl p-4">
                  <p className="text-xs text-gray-500 mb-1">Projects</p>
                  <p className="font-mono text-sm text-gray-800">
                    {userData.projects?.length || 0} linked projects
                  </p>
                </div>
                <div className="bg-white/80 rounded-xl p-4">
                  <p className="text-xs text-gray-500 mb-1">Storage Status</p>
                  <p className="font-mono text-sm text-green-600 font-bold">
                    ✓ Synced
                  </p>
                </div>
              </div>
            </div>

            <div className="text-sm text-gray-600 bg-blue-50 rounded-xl p-4">
              <p className="font-semibold mb-2">🔐 Your data is protected by:</p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>Firebase Authentication (Google Security)</li>
                <li>Realtime Database with security rules</li>
                <li>Encrypted data transmission (HTTPS)</li>
                <li>Regular automated backups</li>
              </ul>
            </div>
          </div>
        )}

        {/* Preferences */}
        <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl p-8 mb-6 border border-gray-100 animate-fadeInUp" style={{animationDelay: '0.2s'}}>
          <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <span>⚙️</span> Preferences
          </h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between py-3 border-b border-gray-200">
              <div>
                <p className="font-medium text-gray-900">Email Notifications</p>
                <p className="text-sm text-gray-500">Receive updates about your projects</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" defaultChecked />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
              </label>
            </div>

            <div className="flex items-center justify-between py-3 border-b border-gray-200">
              <div>
                <p className="font-medium text-gray-900">Weekly Reports</p>
                <p className="text-sm text-gray-500">Get weekly AI readiness summaries</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" defaultChecked />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
              </label>
            </div>

            <div className="flex items-center justify-between py-3">
              <div>
                <p className="font-medium text-gray-900">Dashboard Alerts</p>
                <p className="text-sm text-gray-500">Alert when metrics fall below threshold</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
              </label>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl p-8 border border-gray-100 animate-fadeInUp" style={{animationDelay: '0.3s'}}>
          <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <span>🎯</span> Account Actions
          </h3>
          
          <div className="space-y-4">
            <button className="w-full md:w-auto px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-bold hover:shadow-2xl hover:scale-105 transition-all duration-300 transform">
              ✏️ Update Profile
            </button>
            
            <button className="w-full md:w-auto px-8 py-4 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-xl font-bold hover:shadow-2xl hover:scale-105 transition-all duration-300 transform ml-0 md:ml-4">
              🔑 Change Password
            </button>
            
            <div className="pt-6 border-t-2 border-gray-200">
              <button
                onClick={handleLogout}
                className="w-full md:w-auto px-8 py-4 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-xl font-bold hover:shadow-2xl hover:scale-105 transition-all duration-300 transform"
              >
                🚪 Sign Out
              </button>
            </div>
          </div>
        </div>

        {currentUser.isDemo && (
          <div className="mt-6 bg-gradient-to-r from-purple-500 to-pink-500 border-2 border-purple-300 rounded-2xl p-6 text-white shadow-xl animate-fadeInUp">
            <h4 className="font-bold text-xl mb-3 flex items-center gap-2">
              <span>🎮</span> Demo Account Notice
            </h4>
            <p className="leading-relaxed">
              You are using a demo account with pre-populated data. 
              Create a real account to save your own projects and data permanently.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
