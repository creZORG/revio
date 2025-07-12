// src/contexts/AuthContext.jsx
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'; // Import useCallback
import { auth, db } from '../utils/firebaseConfig.js';
import { onAuthStateChanged, signOut } from 'firebase/auth'; // Import signOut
import { doc, getDoc, setDoc, Timestamp } from 'firebase/firestore'; // Import setDoc, Timestamp for profile creation
import GlobalLoadingScreen from '../components/Common/GlobalLoadingScreen.jsx'; // NEW: Import GlobalLoadingScreen

export const AuthContext = createContext(null);

const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState(null);

  // NEW: signOutUser function
  const signOutUser = useCallback(async () => {
    try {
      await signOut(auth);
      // State will be updated by onAuthStateChanged listener
    } catch (error) {
      console.error("Error signing out:", error);
      // You might want to use a global notification here if needed
      // (Note: useNotification context is not available directly here without importing it)
    }
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setCurrentUser(user);
        setIsAuthenticated(true);
        console.log("Firebase Auth State Changed: User logged in", user.email);

        if (db) {
          try {
            const userDocRef = doc(db, `artifacts/${appId}/users/${user.uid}/profiles`, user.uid);
            const userDocSnap = await getDoc(userDocRef);

            if (userDocSnap.exists()) {
              const profileData = userDocSnap.data();
              // Update currentUser with profile data
              setCurrentUser({
                ...user,
                role: profileData.role,
                emailVerified: user.emailVerified, // Ensure this is always from auth object directly
                createdAt: profileData.createdAt?.toDate ? profileData.createdAt.toDate() : null, // Convert Timestamp to Date
              });
              setUserRole(profileData.role || 'user');
              console.log("User role fetched from Firestore:", profileData.role);
            } else {
              // If no profile, create a basic one and set default role
              const newProfileData = {
                  uid: user.uid,
                  email: user.email,
                  displayName: user.displayName || user.email.split('@')[0],
                  role: 'user',
                  createdAt: Timestamp.now(),
                  emailVerified: user.emailVerified,
                  status: 'active'
              };
              await setDoc(userDocRef, newProfileData, { merge: true });
              setCurrentUser({
                ...user,
                ...newProfileData, // Add new profile data to currentUser
                createdAt: newProfileData.createdAt.toDate(), // Convert Timestamp to Date
              });
              setUserRole('user');
              console.warn("User profile not found in Firestore for UID:", user.uid, "Assigning default 'user' role and creating profile.");
            }
          } catch (error) {
            console.error("Error fetching/setting user role from Firestore:", error.message);
            setUserRole('user');
          }
        } else {
          console.warn("Firestore DB instance not available yet, cannot fetch user role.");
          setUserRole('user');
        }

      } else {
        setCurrentUser(null);
        setIsAuthenticated(false);
        setUserRole(null);
        console.log("Firebase Auth State Changed: User logged out");
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
    signOutUser, // NEW: Add signOutUser to context value
  };

  if (loading) {
    // FIX: Render GlobalLoadingScreen instead of basic text
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