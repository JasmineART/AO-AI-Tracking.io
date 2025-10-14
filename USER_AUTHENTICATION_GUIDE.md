# User Authentication & Database Guide

## 🔐 User Authentication System

The OA AI Tracker includes a comprehensive user authentication system with automatic database storage.

## Features

### 1. **Google Sign-In** 🌐
- One-click authentication using Google OAuth
- Automatically creates user profile in Firestore database
- Retrieves user's name, email, and profile picture
- Securely managed by Firebase Authentication

### 2. **GitHub Sign-In** 🐙
- One-click authentication using GitHub OAuth
- Automatically saves user data to database
- Retrieves GitHub username and email
- Integrated with Firebase Authentication

### 3. **Email/Password Authentication** 📧
- Traditional email and password sign-up/sign-in
- Secure password hashing via Firebase
- Custom display names supported
- User data stored in Firestore

### 4. **Demo Account** 🎮
- Pre-populated with 5 sample projects
- 100 data points for dashboard visualization
- Perfect for testing features
- No database storage (localStorage only)

## Database Storage

### User Data Structure

When a user signs in (via Google, GitHub, or Email), their information is automatically saved to Firestore:

```javascript
{
  uid: "unique-user-id",
  email: "user@example.com",
  displayName: "John Doe",
  photoURL: "https://profile-photo-url.com",
  createdAt: Timestamp,
  lastLogin: Timestamp,
  projects: [],
  preferences: {
    theme: "light",
    notifications: true
  }
}
```

### Firestore Collections

**Collection: `users`**
- Document ID: User's Firebase UID
- Fields: User profile information
- Security: Read/write only by authenticated user (owner)

### Automatic User Creation Process

1. **User signs in** via Google/GitHub/Email
2. **Authentication verified** by Firebase
3. **Database check**: System checks if user exists in Firestore
4. **New User**: If not exists, creates new document with:
   - User credentials
   - Creation timestamp
   - Default preferences
   - Empty projects array
5. **Existing User**: Updates last login timestamp
6. **Redirect**: User sent to dashboard

### Database Functions Available

#### `saveUserToDatabase(user)`
Saves or updates user information in Firestore

#### `getUserData(userId)`
Retrieves user data from Firestore

#### `updateUserProfile(userId, updates)`
Updates user profile fields

#### `addProjectToUser(userId, projectId)`
Links a project to user's account

#### `getAllUsers()`
Admin function to retrieve all users

#### `searchUsersByEmail(email)`
Find users by email address

#### `deleteUserData(userId)`
Removes user data when account is deleted

## Security Features

### 🔒 Firebase Authentication
- Industry-standard OAuth 2.0
- Secure token-based sessions
- Automatic session management
- Password encryption (bcrypt)

### 🛡️ Firestore Security Rules
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      // Users can only read/write their own data
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

### 🔐 Data Protection
- HTTPS encryption for all data transmission
- Secure token storage in browser
- Regular automated backups
- Google Cloud security infrastructure

## Usage Examples

### Sign Up with Google
```javascript
import { useAuth } from './contexts/AuthContext';

const { signInWithGoogle } = useAuth();

const handleGoogleSignIn = async () => {
  try {
    await signInWithGoogle();
    // User is automatically created in database
    // Redirected to dashboard
  } catch (error) {
    console.error('Sign-in failed:', error);
  }
};
```

### Get User Data
```javascript
import { getUserData } from './utils/userDatabase';

const userId = currentUser.uid;
const userData = await getUserData(userId);

console.log(userData);
// {
//   uid: "abc123",
//   email: "user@example.com",
//   displayName: "John Doe",
//   createdAt: Timestamp,
//   ...
// }
```

### Update User Profile
```javascript
import { updateUserProfile } from './utils/userDatabase';

await updateUserProfile(userId, {
  displayName: "Jane Doe",
  bio: "AI Enthusiast",
  company: "Tech Corp"
});
```

## Profile Page Features

The Profile page displays:

✅ User avatar (from Google/GitHub or generated)  
✅ Email address  
✅ Display name  
✅ Account status  
✅ Member since date  
✅ **Database Information Section** (for authenticated users):
- Creation timestamp
- Last login timestamp
- Linked projects count
- Storage sync status
- Security features list

## Demo vs. Real Accounts

### Demo Account 🎮
- **Storage**: Browser localStorage only
- **Persistence**: Cleared when browser cache is cleared
- **Projects**: 5 pre-populated samples
- **Data**: 100 sample data points
- **Use Case**: Testing and exploration

### Real Account ⭐
- **Storage**: Google Cloud Firestore
- **Persistence**: Permanent, cloud-based
- **Projects**: Unlimited, user-created
- **Data**: Real integrations (AWS, Azure, etc.)
- **Use Case**: Production use

## Getting Started

### For New Users:

1. **Navigate to Login Page**: Click "Get Started" on homepage
2. **Choose Sign-In Method**:
   - Click "Sign in with Google" (recommended)
   - Click "Sign in with GitHub"
   - Or use email/password form
3. **Automatic Account Creation**: Your profile is created automatically
4. **Confirmation**: Check Profile page to see database storage info
5. **Start Creating**: Add projects and integrate data sources

### For Demo Users:

1. Click "Try Demo Account" button
2. Explore pre-populated dashboard
3. Test all features risk-free
4. Convert to real account when ready

## Firebase Configuration

### Required Environment Variables
```javascript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};
```

### Enable Authentication Methods:
1. Go to Firebase Console
2. Navigate to Authentication > Sign-in method
3. Enable:
   - Google
   - GitHub
   - Email/Password

### Configure Firestore:
1. Create Firestore database
2. Start in production mode
3. Add security rules
4. Create `users` collection

## Troubleshooting

### "Failed to sign in with Google"
- Check if Google Auth is enabled in Firebase Console
- Verify authorized domains include your domain
- Clear browser cache and try again

### "User data not saving"
- Verify Firestore is initialized correctly
- Check security rules allow user writes
- Review browser console for errors

### "Database information not showing"
- Ensure you're not using demo account
- Check network connection
- Verify Firestore read permissions

## Best Practices

✅ Always sign in new users automatically to database  
✅ Update `lastLogin` on every session  
✅ Validate user data before database writes  
✅ Handle authentication errors gracefully  
✅ Show loading states during auth operations  
✅ Log out users after long inactivity  
✅ Protect sensitive user data  
✅ Test with different auth providers  

## Support

For issues or questions:
- Check Firebase Console for authentication logs
- Review browser console for JavaScript errors
- Verify Firestore security rules
- Test with demo account first

---

**Built with** ❤️ **using Firebase Authentication & Firestore**
