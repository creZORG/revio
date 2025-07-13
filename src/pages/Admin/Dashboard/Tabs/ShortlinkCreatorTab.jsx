import React, { useState, useEffect, useMemo } from 'react';
import { collection, onSnapshot, query, orderBy, limit } from 'firebase/firestore';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { db } from '../../../../utils/firebaseConfig';
import { useNotification } from '../../../../contexts/NotificationContext';
import DataTable from '../components/DataTable';
import styles from './ShortlinkCreatorTab.module.css';
import { FaLink, FaRandom, FaClipboard } from 'react-icons/fa';

const functions = getFunctions();
const createShortlinkCallable = httpsCallable(functions, 'createShortlink');

const ShortlinkCreatorTab = () => {
    const { showNotification } = useNotification();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [recentLinks, setRecentLinks] = useState([]);
    const [loading, setLoading] = useState(true);

    // Form State
    const [destinationPath, setDestinationPath] = useState(''); // State for just the path
    const [customPath, setCustomPath] = useState('');
    const [message, setMessage] = useState('');

    useEffect(() => {
        const q = query(collection(db, 'shortlinks'), orderBy('createdAt', 'desc'), limit(10));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            setRecentLinks(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    const handleGenerateRandom = () => {
        const randomId = Math.random().toString(36).substring(2, 9);
        setCustomPath(randomId);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!destinationPath) {
            showNotification('Please enter a destination path.', 'error');
            return;
        }
        setIsSubmitting(true);

        try {
            // --- THIS IS THE FIX ---
            // We now send ONLY the path to the backend function.
            const result = await createShortlinkCallable({
                destinationPath: destinationPath,
                customShortId: customPath || null,
                message: message || null,
            });
            // --- END OF FIX ---

            showNotification(`Link created: ${result.data.shortUrl}`, 'success');
            setDestinationPath('');
            setCustomPath('');
            setMessage('');
        } catch (error) {
            console.error("Error creating shortlink:", error);
            showNotification(error.message, 'error');
        } finally {
            setIsSubmitting(false);
        }
    };
    
    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text).then(() => {
            showNotification('Link copied to clipboard!', 'info');
        });
    };

    const columns = useMemo(() => [
        { Header: 'Short Link', accessor: 'id', Cell: ({value}) => <a href={`https://naksyetu.com/r/${value}`} target="_blank" rel="noopener noreferrer">{`naksyetu.com/r/${value}`}</a> },
        { Header: 'Destination', accessor: 'longUrl' },
        { Header: 'Clicks', accessor: 'clicks' },
        { Header: 'Actions', accessor: 'id', Cell: ({value}) => <button onClick={() => copyToClipboard(`https://naksyetu.com/r/${value}`)} className={styles.copyButton} title="Copy Link"><FaClipboard /></button> }
    ], []);

    return (
        <div className={styles.creatorContainer}>
            <form onSubmit={handleSubmit} className={styles.formSection}>
                <h3 className={styles.sectionTitle}>Create a New Shortlink</h3>
                
                <div className={styles.formGroup}>
                    <label>Destination Path</label>
                    <div className={styles.destinationInput}>
                        <span>https://naksyetu.co.ke/</span>
                        <input 
                            type="text" 
                            value={destinationPath} 
                            onChange={e => setDestinationPath(e.target.value)} 
                            placeholder="e.g., nightlife or events/cool-fest" 
                        />
                    </div>
                </div>

                <div className={styles.formGroup}>
                    <label>Custom Short Path (Optional)</label>
                    <div className={styles.customPathInput}>
                        <span>naksyetu.com/r/</span>
                        <input type="text" value={customPath} onChange={e => setCustomPath(e.target.value)} placeholder="e.g., concert24" />
                        <button type="button" onClick={handleGenerateRandom} title="Generate Random"><FaRandom /></button>
                    </div>
                </div>
                 <div className={styles.formGroup}>
                    <label>Interstitial Message (Optional)</label>
                    <textarea value={message} onChange={e => setMessage(e.target.value)} placeholder="This message will be shown before redirecting..." rows={3}></textarea>
                </div>
                <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                    <FaLink /> {isSubmitting ? 'Creating...' : 'Create Link'}
                </button>
            </form>

            <div className={styles.listSection}>
                <h3 className={styles.sectionTitle}>Recently Created Links</h3>
                <DataTable
                    columns={columns}
                    data={recentLinks}
                    isLoading={loading}
                />
            </div>
        </div>
    );
};

export default ShortlinkCreatorTab;