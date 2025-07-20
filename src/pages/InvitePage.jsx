// src/pages/InvitePage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom'; // CRITICAL FIX: Import Link
import { useAuth } from '../contexts/AuthContext.jsx';
import { useNotification } from '../contexts/NotificationContext.jsx';
import TextInput from '../components/Common/TextInput.jsx';
import Button from '../components/Common/Button.jsx';
import Modal from '../components/Common/Modal.jsx'; // For password change prompt
import { UserIcon, LockClosedIcon, EnvelopeIcon, CheckCircleIcon, InformationCircleIcon } from '@heroicons/react/24/outline'; // Icons
import { getAuth, sendEmailVerification, updatePassword } from 'firebase/auth'; // Firebase Auth functions
import { doc, getDoc, updateDoc } from 'firebase/firestore'; // Firestore functions
import styles from './InvitePage.module.css'; // Dedicated CSS module

const InvitePage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [showPasswordChangeModal, setShowPasswordChangeModal] = useState(false);
    const [newPassword, setNewPassword] = useState('');
    const [confirmNewPassword, setConfirmNewPassword] = useState('');
    const [passwordChangeError, setPasswordChangeError] = useState('');

    const navigate = useNavigate();
    const { login, currentUser, isAuthenticated, auth, db } = useAuth(); // Assuming auth and db are exposed by useAuth
    const { showNotification } = useNotification();

    // Hardcoded inviter and app ID for now
    const inviterName = "Moses Irungu";
    const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id'; // Use global appId

    useEffect(() => {
        // Redirect if already logged in and email is verified
        if (isAuthenticated && currentUser?.emailVerified) {
            // Check if it's a temporary password (requires a Firestore flag)
            const checkTempPasswordAndRedirect = async () => {
                if (db && currentUser?.uid) {
                    const userProfileRef = doc(db, `artifacts/${appId}/users/${currentUser.uid}/profiles`, currentUser.uid);
                    const userProfileSnap = await getDoc(userProfileRef);
                    if (userProfileSnap.exists() && userProfileSnap.data().isTempPassword) {
                        setShowPasswordChangeModal(true); // Prompt password change
                    } else {
                        navigate('/organizer-dashboard'); // Redirect to dashboard if all good
                    }
                } else {
                    navigate('/organizer-dashboard'); // Fallback redirect
                }
            };
            checkTempPasswordAndRedirect();
        } else if (isAuthenticated && !currentUser?.emailVerified) {
            // If logged in but email not verified, redirect to verification pending page
            navigate('/verify-email-pending');
        }
    }, [isAuthenticated, currentUser, navigate, db, appId]);


    const handleLogin = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setPasswordChangeError(''); // Clear previous errors

        try {
            const userCredential = await login(email, password); // Use the login function from AuthContext
            const user = userCredential.user;

            if (!user.emailVerified) {
                showNotification("Please verify your email address to continue.", "warning");
                navigate('/verify-email-pending'); // Redirect to a page explaining email verification
                return;
            }

            // Check if it's a temporary password (requires a Firestore flag 'isTempPassword: true')
            if (db && user.uid) {
                const userProfileRef = doc(db, `artifacts/${appId}/users/${user.uid}/profiles`, user.uid);
                const userProfileSnap = await getDoc(userProfileRef);
                if (userProfileSnap.exists() && userProfileSnap.data().isTempPassword) {
                    setShowPasswordChangeModal(true); // Show password change modal
                    showNotification("For your security, please change your temporary password.", "info", 6000);
                    return; // Don't redirect immediately, wait for password change
                }
            }

            // If email verified and not temp password, redirect to dashboard
            showNotification("Login successful! Welcome to your partner dashboard.", "success");
            navigate('/organizer-dashboard');

        } catch (error) {
            console.error("Login error:", error);
            let errorMessage = "Failed to log in. Please check your email and password.";
            if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
                errorMessage = "Invalid email or password.";
            } else if (error.code === 'auth/invalid-email') {
                errorMessage = "Invalid email format.";
            } else if (error.code === 'auth/user-disabled') {
                errorMessage = "Your account has been disabled. Please contact support.";
            }
            showNotification(errorMessage, "error");
        } finally {
            setIsLoading(false);
        }
    };

    const handlePasswordChange = async (e) => {
        e.preventDefault();
        setPasswordChangeError('');

        if (newPassword !== confirmNewPassword) {
            setPasswordChangeError("New passwords do not match.");
            return;
        }
        if (newPassword.length < 6) {
            setPasswordChangeError("Password must be at least 6 characters long.");
            return;
        }

        setIsLoading(true);
        try {
            const user = auth.currentUser;
            if (!user) {
                throw new Error("No authenticated user found for password change.");
            }
            await updatePassword(user, newPassword);

            // Update Firestore flag to indicate password is no longer temporary
            if (db && user.uid) {
                const userProfileRef = doc(db, `artifacts/${appId}/users/${user.uid}/profiles`, user.uid);
                await updateDoc(userProfileRef, { isTempPassword: false });
            }

            showNotification("Password successfully changed! Redirecting to dashboard.", "success");
            setShowPasswordChangeModal(false);
            navigate('/organizer-dashboard');

        } catch (error) {
            console.error("Error changing password:", error);
            let errorMessage = "Failed to change password. Please try logging in again.";
            if (error.code === 'auth/requires-recent-login') {
                errorMessage = "Please log out and log in again to change your password.";
            }
            setPasswordChangeError(errorMessage);
            showNotification(errorMessage, "error");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className={styles.invitePageWrapper}>
            <div className={styles.inviteCard}>
                <h1 className={styles.mainHeader}>
                    Your Invitation to Partner with Naksyetu!
                </h1>
                <p className={styles.inviterMessage}>
                    **{inviterName}** has invited you to be a Naksyetu partner.
                </p>
                <p className={styles.subMessage}>
                    Unlock exclusive tools, streamline event management, and grow your audience.
                </p>

                <form onSubmit={handleLogin} className={styles.loginForm}>
                    <TextInput
                        label="Email Address"
                        id="email"
                        name="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="your.email@example.com"
                        required
                        icon={EnvelopeIcon}
                    />
                    <TextInput
                        label="Password"
                        id="password"
                        name="password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Temporary password"
                        required
                        icon={LockClosedIcon}
                    />
                    <Button type="submit" isLoading={isLoading} disabled={isLoading} className={styles.loginButton}>
                        {isLoading ? 'Logging In...' : 'Access Partner Dashboard'}
                    </Button>
                </form>

                <p className={styles.securityNote}>
                    <InformationCircleIcon className={styles.infoIcon} /> Your dashboard is secure. We recommend changing your password after your first login.
                </p>
                <p className={styles.needHelp}>
                    Need help? <Link to="/faq" className={styles.link}>Visit our FAQ</Link> or <Link to="/contact" className={styles.link}>Contact Support</Link>.
                </p>
            </div>

            {/* Password Change Modal */}
            <Modal isOpen={showPasswordChangeModal} onClose={() => setShowPasswordChangeModal(false)} title="Change Your Temporary Password">
                <form onSubmit={handlePasswordChange} className={styles.passwordChangeForm}>
                    <p className={styles.modalMessage}>
                        Welcome! For your security, please set a new, strong password.
                    </p>
                    {passwordChangeError && <p className={styles.errorMessage}>{passwordChangeError}</p>}
                    <TextInput
                        label="New Password"
                        id="newPassword"
                        name="newPassword"
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Enter new password (min 6 chars)"
                        required
                        icon={LockClosedIcon}
                    />
                    <TextInput
                        label="Confirm New Password"
                        id="confirmNewPassword"
                        name="confirmNewPassword"
                        type="password"
                        value={confirmNewPassword}
                        onChange={(e) => setConfirmNewPassword(e.target.value)}
                        placeholder="Confirm new password"
                        required
                        icon={LockClosedIcon}
                    />
                    <Button type="submit" isLoading={isLoading} disabled={isLoading} className={styles.modalButton}>
                        {isLoading ? 'Changing Password...' : 'Change Password'}
                    </Button>
                </form>
            </Modal>
        </div>
    );
};

export default InvitePage;