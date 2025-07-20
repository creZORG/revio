// src/contexts/AuthContext.jsx
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { auth, db } from '../utils/firebaseConfig.js';
import { 
  onAuthStateChanged, 
  signOut,
  signInAnonymously // Ensure signInAnonymously is imported and used
} from 'firebase/auth';
import { doc, getDoc, setDoc, Timestamp } from 'firebase/firestore';
import GlobalLoadingScreen from '../components/Common/GlobalLoadingScreen.jsx';

export const AuthContext = createContext(null);

const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';

export const AuthProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true); // Controls AuthProvider's own loading screen
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [userRole, setUserRole] = useState(null);
    const [adminLevel, setAdminLevel] = useState(0);
    const [isAuthReady, setIsAuthReady] = useState(false); // Signals initial auth check complete

    const signOutUser = useCallback(async () => {
        try {
            await signOut(auth);
        } catch (error) {
            console.error("Error signing out:", error);
        }
    }, []);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            try { // Wrap the entire async logic in a try-catch
                if (user) {
                    setIsAuthenticated(true);
                    try {
                        const userDocRef = doc(db, `artifacts/${appId}/users/${user.uid}/profiles`, user.uid);
                        const userDocSnap = await getDoc(userDocRef);

                        if (userDocSnap.exists()) {
                            const profileData = userDocSnap.data();
                            const fullUserData = {
                                ...user,
                                ...profileData,
                                createdAt: profileData.createdAt?.toDate ? profileData.createdAt.toDate() : null,
                            };
                            setCurrentUser(fullUserData);
                            setUserRole(profileData.role || 'user');
                            setAdminLevel(profileData.adminLevel || 0);
                        } else if (user.isAnonymous) {
                            console.log("Anonymous user signed in, no profile found. Setting default anonymous profile.");
                            const newProfileData = {
                                uid: user.uid,
                                email: null,
                                displayName: 'Guest User',
                                role: 'guest',
                                status: 'active',
                                adminLevel: 0,
                                createdAt: Timestamp.now(),
                            };
                            await setDoc(userDocRef, newProfileData, { merge: true });
                            setCurrentUser({ ...user, ...newProfileData, createdAt: newProfileData.createdAt.toDate() });
                            setUserRole('guest');
                            setAdminLevel(0);
                        } else {
                            console.warn("Permanent user profile not found in Firestore for UID:", user.uid, "Creating default profile.");
                            const newProfileData = {
                                uid: user.uid,
                                email: user.email,
                                displayName: user.displayName || user.email?.split('@')[0] || 'User',
                                role: 'user',
                                status: 'active',
                                adminLevel: 0,
                                createdAt: Timestamp.now(),
                            };
                            await setDoc(userDocRef, newProfileData, { merge: true });

                            setCurrentUser({ ...user, ...newProfileData, createdAt: newProfileData.createdAt.toDate() });
                            setUserRole('user');
                            setAdminLevel(0);
                        }
                    } catch (error) {
                        console.error("Error fetching or creating user profile from Firestore:", error.message);
                        setCurrentUser(user);
                        setUserRole('user');
                        setAdminLevel(0);
                    }
                } else {
                    // User is signed out, attempt anonymous sign-in
                    console.log("No user authenticated. Attempting anonymous sign-in...");
                    try {
                        await signInAnonymously(auth);
                        console.log("Signed in anonymously.");
                    } catch (anonError) {
                        console.error("Error signing in anonymously:", anonError);
                        // If anonymous sign-in also fails, then no user is set.
                        setCurrentUser(null);
                        setIsAuthenticated(false);
                        setUserRole(null);
                        setAdminLevel(0);
                    }
                }
            } catch (outerError) {
                console.error("Unhandled error in onAuthStateChanged:", outerError);
                setCurrentUser(null);
                setIsAuthenticated(false);
                setUserRole(null);
                setAdminLevel(0);
            } finally {
                setLoading(false); // CRITICAL FIX: Always set loading to false
                setIsAuthReady(true); // CRITICAL FIX: Always set auth ready
            }
        });

        return () => unsubscribe();
    }, [appId]);

    const value = {
        currentUser,
        isAuthenticated,
        loadingAuth: loading, // Renamed to loadingAuth for clarity with CheckoutPage
        isAuthReady,
        userRole,
        adminLevel,
        signOutUser,
    };

    if (loading) { // Use AuthProvider's own loading state
        return <GlobalLoadingScreen />;
    }

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};