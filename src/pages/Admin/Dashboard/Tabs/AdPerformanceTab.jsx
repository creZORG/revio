import React, { useState, useEffect, useMemo } from 'react';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from '../../../../utils/firebaseConfig';
import { getFunctions, httpsCallable } from 'firebase/functions';
import DataTable from '../components/DataTable';
import Modal from '../../../../components/Common/Modal';
import styles from './AdPerformanceTab.module.css';
import { format } from 'date-fns';

const functions = getFunctions();
const getAnalyticsCallable = httpsCallable(functions, 'getShortlinkAnalytics');

const AdPerformanceTab = () => {
    const [ads, setAds] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedAd, setSelectedAd] = useState(null);
    const [analytics, setAnalytics] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isAnalyticsLoading, setIsAnalyticsLoading] = useState(false);

    useEffect(() => {
        const q = query(collection(db, 'ads'), orderBy('createdAt', 'desc'));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            setAds(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    const viewStats = async (ad) => {
        const shortId = ad.actionUrl.split('/').pop();
        if (!shortId) return;

        setSelectedAd(ad);
        setIsModalOpen(true);
        setIsAnalyticsLoading(true);

        try {
            const result = await getAnalyticsCallable({ shortId });
            setAnalytics(result.data);
        } catch (error) {
            console.error("Error fetching analytics:", error);
        } finally {
            setIsAnalyticsLoading(false);
        }
    };

    const columns = useMemo(() => [
        { Header: 'Action Text', accessor: 'actionText' },
        { Header: 'Short Link', accessor: 'actionUrl' },
        { Header: 'Created', accessor: 'createdAt', Cell: ({value}) => value ? format(value.toDate(), 'MMM dd, yyyy') : 'N/A' },
    ], []);

    return (
        <>
            <div className={styles.performanceSection}>
                <h3 className={styles.sectionTitle}>Ad Performance & Analytics</h3>
                <DataTable
                    columns={columns}
                    data={ads}
                    isLoading={loading}
                    onView={viewStats}
                />
            </div>

            {isModalOpen && selectedAd && (
                <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={`Stats for "${selectedAd.actionText}"`}>
                    {isAnalyticsLoading ? <p>Loading stats...</p> : (
                        analytics && (
                            <div className={styles.analyticsContainer}>
                                <div className={styles.statBox}>
                                    <span className={styles.statValue}>{analytics.clicks}</span>
                                    <span className={styles.statLabel}>Total Clicks</span>
                                </div>
                                <h4 className={styles.recentClicksTitle}>Recent Clicks (Last 25)</h4>
                                <ul className={styles.clickList}>
                                    {analytics.recentClicks.length > 0 ? analytics.recentClicks.map(click => (
                                        <li key={click.id}>
                                            <span>{format(new Date(click.timestamp), 'MMM dd, hh:mm:ss a')}</span>
                                            <span className={styles.userAgent}>{click.userAgent.substring(0, 50)}...</span>
                                        </li>
                                    )) : <li>No clicks recorded yet.</li>}
                                </ul>
                            </div>
                        )
                    )}
                </Modal>
            )}
        </>
    );
};

export default AdPerformanceTab;