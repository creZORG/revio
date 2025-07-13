import React, { useState } from 'react';
import styles from './AdminForms.module.css';
import { useNotification } from '../../../../contexts/NotificationContext';
import ImageUpload from '../../../../components/Common/ImageUpload';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../../../utils/firebaseConfig';
import { useAuth } from '../../../../hooks/useAuth';

const functions = getFunctions();
const createShortlinkCallable = httpsCallable(functions, 'createShortlink');

const CreateAdForm = () => {
    const { currentUser } = useAuth();
    const { showNotification } = useNotification();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [posterUrl, setPosterUrl] = useState('');
    const [actionText, setActionText] = useState('');
    const [actionContent, setActionContent] = useState('');
    const [actionType, setActionType] = useState('link');

    const validateContent = () => {
        if (actionType === 'link') {
            return actionContent.includes('.') && !actionContent.includes(' ');
        }
        if (actionType === 'phone') {
            return /^\+?\d{7,15}$/.test(actionContent);
        }
        return false;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!posterUrl || !actionText || !actionContent) {
            showNotification('Please fill all fields.', 'error');
            return;
        }
        if (!validateContent()) {
            showNotification(`Please enter a valid ${actionType}.`, 'error');
            return;
        }
        setIsSubmitting(true);

        try {
            let finalActionUrl = actionContent;
            if (actionType === 'link') {
                // Call the cloud function to get the short link
                const result = await createShortlinkCallable({ longUrl: actionContent });
                finalActionUrl = result.data.shortUrl;
                showNotification(`Short link created: ${finalActionUrl}`, 'info');
            } else {
                finalActionUrl = `tel:${actionContent}`;
            }

            // Save the ad to Firestore
            await addDoc(collection(db, 'ads'), {
                posterUrl,
                actionText,
                actionUrl: finalActionUrl,
                createdAt: serverTimestamp(),
                createdBy: currentUser.uid,
            });

            showNotification('Advertisement created successfully!', 'success');
            // Reset form
            setPosterUrl('');
            setActionText('');
            setActionContent('');

        } catch (error) {
            console.error("Error creating ad:", error);
            showNotification(error.message || 'Failed to create ad.', 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className={styles.formContainer}>
            <h3 className={styles.formTitle}>Create New Advertisement</h3>
            <div className={styles.formGroup}>
                <label>Ad Poster</label>
                <ImageUpload onUpload={url => setPosterUrl(url)} folder="ads" />
            </div>
             <div className={styles.formGroup}>
                <label>Action Button Text</label>
                <input type="text" value={actionText} onChange={e => setActionText(e.target.value)} placeholder="e.g., Learn More, Call Now" />
            </div>
             <div className={styles.formGroup}>
                <label>Action Type</label>
                <select value={actionType} onChange={e => setActionType(e.target.value)}>
                    <option value="link">Open a Link</option>
                    <option value="phone">Open Phone Dialer</option>
                </select>
            </div>
             <div className={styles.formGroup}>
                <label>{actionType === 'link' ? 'Destination Link' : 'Phone Number'}</label>
                <input type="text" value={actionContent} onChange={e => setActionContent(e.target.value)} placeholder={actionType === 'link' ? 'naksyetu.co.ke/event' : '+2547...'} />
            </div>
            <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                {isSubmitting ? 'Creating Ad...' : 'Create Ad'}
            </button>
        </form>
    );
};

export default CreateAdForm;