// src/pages/Organizer/Dashboard/Tabs/SalesAnalyticsTab.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../../contexts/AuthContext.jsx';
import { useNotification } from '../../../../contexts/NotificationContext.jsx';
import { db } from '../../../../utils/firebaseConfig.js';
import { collection, query, where, getDocs } from 'firebase/firestore';
import LoadingSkeleton from '../../../../components/Common/LoadingSkeleton.jsx';
import styles from './SalesAnalyticsTab.module.css'; // Create this CSS module

const SalesAnalyticsTab = () => {
    const { currentUser, isAuthenticated, loadingAuth } = useAuth();
    const { showNotification } = useNotification();
    const [salesData, setSalesData] = useState([]);
    const [loadingSales, setLoadingSales] = useState(true);
    const [salesError, setSalesError] = useState(null);
    const [summary, setSummary] = useState({
        totalRevenue: 0,
        totalTicketsSold: 0,
        totalOrders: 0,
    });

    const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';

    useEffect(() => {
        const fetchSalesData = async () => {
            if (!isAuthenticated || !currentUser?.uid || !db) {
                setLoadingSales(false);
                setSalesError("Please log in as an organizer to view sales data.");
                return;
            }

            setLoadingSales(true);
            setSalesError(null);
            setSalesData([]);
            setSummary({ totalRevenue: 0, totalTicketsSold: 0, totalOrders: 0 });

            try {
                // Query orders where orderStatus is 'paid' and organizerId matches current user's UID
                const ordersRef = collection(db, `artifacts/${appId}/public/data/orders`);
                const q = query(
                    ordersRef,
                    where("organizerId", "==", currentUser.uid),
                    where("orderStatus", "==", "paid")
                );

                const querySnapshot = await getDocs(q);
                let fetchedOrders = [];
                let currentTotalRevenue = 0;
                let currentTotalTicketsSold = 0;

                querySnapshot.forEach((doc) => {
                    const order = doc.data();
                    fetchedOrders.push({ id: doc.id, ...order });
                    currentTotalRevenue += order.totalAmount || 0;
                    // Sum tickets sold from each order
                    order.tickets.forEach(ticket => {
                        currentTotalTicketsSold += ticket.quantity || 0;
                    });
                });

                setSalesData(fetchedOrders);
                setSummary({
                    totalRevenue: currentTotalRevenue,
                    totalTicketsSold: currentTotalTicketsSold,
                    totalOrders: fetchedOrders.length,
                });

            } catch (error) {
                console.error("Error fetching sales data:", error);
                setSalesError("Failed to fetch sales data. Please try again.");
                showNotification("Failed to load sales data: " + error.message, "error");
            } finally {
                setLoadingSales(false);
            }
        };

        if (isAuthenticated && currentUser?.uid && !loadingAuth) { // Only fetch if authenticated and auth is ready
            fetchSalesData();
        }
    }, [isAuthenticated, currentUser, loadingAuth, db, appId, showNotification]);

    if (loadingSales) {
        return <LoadingSkeleton count={5} />;
    }

    if (salesError) {
        return <div className={styles.salesError}>{salesError}</div>;
    }

    if (salesData.length === 0) {
        return <div className={styles.noSalesData}>No sales data found for your events yet.</div>;
    }

    return (
        <div className={styles.salesAnalyticsContainer}>
            <h2 className={styles.sectionTitle}>Sales Analytics</h2>

            <div className={styles.summaryCards}>
                <div className={styles.summaryCard}>
                    <h3>Total Revenue</h3>
                    <p>KES {summary.totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                </div>
                <div className={styles.summaryCard}>
                    <h3>Tickets Sold</h3>
                    <p>{summary.totalTicketsSold.toLocaleString()}</p>
                </div>
                <div className={styles.summaryCard}>
                    <h3>Total Orders</h3>
                    <p>{summary.totalOrders.toLocaleString()}</p>
                </div>
            </div>

            <h3 className={styles.sectionSubTitle}>Individual Orders</h3>
            <div className={styles.ordersTableContainer}>
                <table className={styles.ordersTable}>
                    <thead>
                        <tr>
                            <th>Order ID</th>
                            <th>Event</th>
                            <th>Customer Email</th>
                            <th>Amount</th>
                            <th>Tickets</th>
                            <th>Date</th>
                        </tr>
                    </thead>
                    <tbody>
                        {salesData.map(order => (
                            <tr key={order.orderId}>
                                <td>{order.orderId.substring(0, 8)}...</td>
                                <td>{order.eventDetails?.eventName || 'N/A'}</td>
                                <td>{order.customerEmail || 'N/A'}</td>
                                <td>KES {order.totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                                <td>{order.tickets.reduce((sum, t) => sum + t.quantity, 0)}</td>
                                <td>{order.createdAt?.toDate ? new Date(order.createdAt.toDate()).toLocaleDateString() : 'N/A'}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default SalesAnalyticsTab;