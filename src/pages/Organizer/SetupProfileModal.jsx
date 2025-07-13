import React, { useState, useEffect } from 'react';
import { doc, getDoc, updateDoc, setDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../utils/firebaseConfig';
import { useNotification } from '../../contexts/NotificationContext';
import styles from './SetupProfileModal.module.css';

const appId = "1:147113503727:web:1d9d351c30399b2970241a";

const SetupProfileModal = ({ user, onSetupComplete }) => {
    const [formData, setFormData] = useState({});
    const [missingFields, setMissingFields] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [usernameAvailable, setUsernameAvailable] = useState(true);
    const { showNotification } = useNotification();

    // Fetch existing profile data to determine what's missing
    useEffect(() => {
        const fetchProfile = async () => {
            const userProfileRef = doc(db, `artifacts/${appId}/users/${user.uid}/profiles`, user.uid);
            const docSnap = await getDoc(userProfileRef);
            
            const data = docSnap.exists() ? docSnap.data() : {};
            
            // Pre-fill form with any existing data
            setFormData({
                username: data.username || '',
                fullName: data.fullName || '',
                phone: data.phone || '',
                bio: data.bio || '',
                organization: data.organization || ''
            });

            // Determine which fields are missing
            const requiredFields = ['username', 'fullName', 'phone', 'bio'];
            const missing = requiredFields.filter(field => !data[field]);
            setMissingFields(missing);
            setLoading(false);
        };
        fetchProfile();
    }, [user.uid]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        let processedValue = value;
        if (name === 'username') {
            processedValue = value.toLowerCase().replace(/[^a-z0-9_]/g, '');
            checkUsername(processedValue);
        }
        setFormData(prev => ({ ...prev, [name]: processedValue }));
    };

    const checkUsername = async (name) => {
        if (name.length < 3) {
            setUsernameAvailable(false);
            return;
        }
        const publicProfilesRef = collection(db, `artifacts/${appId}/public/data_for_app/profiles`);
        const q = query(publicProfilesRef, where("username", "==", name));
        const querySnapshot = await getDocs(q);
        setUsernameAvailable(querySnapshot.empty);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        // Check if the username is taken, but only if it was a missing field
        if (missingFields.includes('username') && !usernameAvailable) {
            showNotification('That username is already taken.', 'error');
            return;
        }
        setIsSubmitting(true);

        try {
            const userProfileRef = doc(db, `artifacts/${appId}/users/${user.uid}/profiles`, user.uid);
            const publicProfileRef = doc(db, `artifacts/${appId}/public/data_for_app/profiles`, user.uid);

            // Prepare only the new data to be saved
            const dataToSave = {
                ...formData,
                isProfileComplete: true,
            };

            await updateDoc(userProfileRef, dataToSave);
            
            // Update the public profile with the latest info
            await setDoc(publicProfileRef, {
                username: dataToSave.username,
                displayName: dataToSave.fullName,
                bio: dataToSave.bio,
                organizerId: user.uid,
                avatarUrl: user.photoURL || null,
            }, { merge: true });

            showNotification('Profile setup complete! Welcome aboard.', 'success');
            onSetupComplete();

        } catch (error) {
            console.error("Error setting up profile:", error);
            showNotification('Failed to set up profile.', 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) {
        return <div className={styles.modalOverlay}><p>Loading profile...</p></div>;
    }

    return (
        <div className={styles.modalOverlay}>
            <div className={styles.modalContent}>
                <h1 className={styles.title}>Complete Your Profile</h1>
                <p className={styles.subtitle}>We just need a few more details to get you started.</p>
                <form onSubmit={handleSubmit} className={styles.form}>
                    
                    {missingFields.includes('username') && (
                        <div className={styles.formGroup}>
                            <label>Public Username</label>
                            <input type="text" name="username" value={formData.username} onChange={handleInputChange} placeholder="e.g., naks_events" required />
                            {formData.username.length > 2 && (
                                <small className={usernameAvailable ? styles.available : styles.taken}>
                                    {usernameAvailable ? 'Username is available!' : 'Username is taken.'}
                                </small>
                            )}
                        </div>
                    )}

                    {missingFields.includes('fullName') && (
                        <div className={styles.formGroup}>
                            <label>Full Name (as per ID)</label>
                            <input type="text" name="fullName" value={formData.fullName} onChange={handleInputChange} placeholder="John Doe" required />
                        </div>
                    )}

                     {missingFields.includes('phone') && (
                        <div className={styles.formGroup}>
                            <label>Reachable Phone Number</label>
                            <input type="tel" name="phone" value={formData.phone} onChange={handleInputChange} placeholder="+2547..." required />
                        </div>
                    )}

                    {/* Organization is optional, so we show it if it doesn't exist yet */}
                    {!formData.organization && (
                        <div className={styles.formGroup}>
                            <label>Organization Name (Optional)</label>
                            <input type="text" name="organization" value={formData.organization} onChange={handleInputChange} placeholder="Naks Events Ltd." />
                        </div>
                    )}

                    {missingFields.includes('bio') && (
                        <div className={styles.formGroup}>
                            <label>Short Bio (This will be public)</label>
                            <textarea name="bio" value={formData.bio} onChange={handleInputChange} rows="3" placeholder="Tell us a little about what you do." required></textarea>
                        </div>
                    )}

                    <button type="submit" className="btn btn-primary" disabled={isSubmitting || (missingFields.includes('username') && !usernameAvailable)}>
                        {isSubmitting ? 'Saving...' : 'Complete Setup'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default SetupProfileModal;