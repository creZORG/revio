import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { auth, db } from '../utils/firebaseConfig.js';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc, setDoc, Timestamp } from 'firebase/firestore';
import GlobalLoadingScreen from '../components/Common/GlobalLoadingScreen.jsx';

export const AuthContext = createContext(null);

const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [adminLevel, setAdminLevel] = useState(0); // <-- NEW: State for adminLevel

  const signOutUser = useCallback(async () => {
    try {
      await signOut(auth);
      // State is cleared by the onAuthStateChanged listener below
    } catch (error) {
      console.error("Error signing out:", error);
    }
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // User is signed in, fetch their full profile
        setIsAuthenticated(true);
        try {
          // Using the correct, nested path you provided
          const userDocRef = doc(db, `artifacts/${appId}/users/${user.uid}/profiles`, user.uid);
          const userDocSnap = await getDoc(userDocRef);

          if (userDocSnap.exists()) {
            const profileData = userDocSnap.data();
            
            // Combine auth data with Firestore profile data
            const fullUserData = {
              ...user, // from auth (uid, email, emailVerified, etc.)
              ...profileData, // from firestore (role, adminLevel, status, etc.)
              createdAt: profileData.createdAt?.toDate ? profileData.createdAt.toDate() : null,
            };

            setCurrentUser(fullUserData);
            setUserRole(profileData.role || 'user');
            setAdminLevel(profileData.adminLevel || 0); // <-- NEW: Set adminLevel from profile
            
          } else {
            // This case handles a user who is authenticated but has no profile document yet
            console.warn("User profile not found in Firestore for UID:", user.uid, "Creating default profile.");
            const newProfileData = {
              uid: user.uid,
              email: user.email,
              displayName: user.displayName || user.email.split('@')[0],
              role: 'user',
              status: 'active',
              adminLevel: 0, // <-- NEW: Set default adminLevel
              createdAt: Timestamp.now(),
            };
            await setDoc(userDocRef, newProfileData, { merge: true });

            setCurrentUser({ ...user, ...newProfileData, createdAt: newProfileData.createdAt.toDate() });
            setUserRole('user');
            setAdminLevel(0); // <-- NEW: Set adminLevel state
          }
        } catch (error) {
          console.error("Error fetching user profile from Firestore:", error.message);
          // Fallback for safety
          setCurrentUser(user);
          setUserRole('user');
          setAdminLevel(0);
        }
      } else {
        // User is signed out, clear all states
        setCurrentUser(null);
        setIsAuthenticated(false);
        setUserRole(null);
        setAdminLevel(0); // <-- NEW: Reset adminLevel on logout
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const value = {
    currentUser,
    isAuthenticated,
    loading,
    userRole,
    adminLevel, // <-- NEW: Expose adminLevel to the rest of the app
    signOutUser,
  };

  // Render a loading screen until the initial auth check is complete
  if (loading) {
    return <GlobalLoadingScreen />;
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};
