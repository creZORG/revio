import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../../../contexts/AuthContext.jsx';
import { useNotification } from '../../../../contexts/NotificationContext.jsx';
// CRITICAL FIX: Correct import syntax for firestoreService.js functions
import {
    getOrganizerCompletedOrdersQuery,
    getOrganizerTicketsQuery,
    onCollectionSnapshot,
    // Timestamp is imported directly from firebase/firestore now
} from '../../../../services/firestoreService.js';
import { Timestamp } from 'firebase/firestore'; // Import Timestamp directly from firebase/firestore
import { FaDollarSign, FaTicketAlt, FaShoppingCart, FaUserCheck } from 'react-icons/fa';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { format } from 'date-fns';

import styles from './OverviewTab.module.css';
import LoadingSkeleton from '../../../../components/Common/LoadingSkeleton.jsx';

const OverviewTab = ({ organizerId }) => { // Receive organizerId as prop
    const { isAuthenticated, loading: authLoading } = useAuth();
    const { showNotification } = useNotification();

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [completedOrders, setCompletedOrders] = useState([]);
    const [soldTickets, setSoldTickets] = useState([]);

    const [totalRevenue, setTotalRevenue] = useState(0);
    const [totalTicketsSold, setTotalTicketsSold] = useState(0);
    const [totalOrdersCompleted, setTotalOrdersCompleted] = useState(0);

    // Effect to subscribe to completed orders
    useEffect(() => {
        if (!isAuthenticated || !organizerId) {
            setLoading(false);
            return () => {};
        }

        setLoading(true);
        setError(null);

        // Subscribe to completed orders
        const unsubscribeOrders = onCollectionSnapshot(
            getOrganizerCompletedOrdersQuery(organizerId),
            (orders) => {
                console.log("OverviewTab: Real-time orders update:", orders);
                setCompletedOrders(orders);
                setLoading(false);
            },
            (err) => {
                console.error("OverviewTab: Error listening to completed orders:", err);
                setError("Failed to load sales data. Please try again.");
                showNotification("Failed to load sales data.", "error");
                setLoading(false);
            }
        );

        // Subscribe to tickets (optional, for more granular ticket data if needed)
        const unsubscribeTickets = onCollectionSnapshot(
            getOrganizerTicketsQuery(organizerId),
            (tickets) => {
                console.log("OverviewTab: Real-time tickets update:", tickets);
                setSoldTickets(tickets);
            },
            (err) => {
                console.error("OverviewTab: Error listening to sold tickets:", err);
            }
        );


        return () => {
            unsubscribeOrders();
            unsubscribeTickets();
        };
    }, [isAuthenticated, organizerId, showNotification]);

    // Effect to calculate derived metrics whenever completedOrders or soldTickets change
    useEffect(() => {
        let revenue = 0;
        let ordersCount = completedOrders.length;
        let ticketsCount = 0;

        completedOrders.forEach(order => {
            revenue += order.totalAmount || 0;
            // Sum tickets from the order document's generatedTicketDetails
            if (order.generatedTicketDetails && Array.isArray(order.generatedTicketDetails)) {
                ticketsCount += order.generatedTicketDetails.reduce((sum, ticket) => sum + (ticket.quantity || 0), 0);
            }
        });
        // Fallback to soldTickets if order.generatedTicketDetails is not reliably populated
        if (ticketsCount === 0 && soldTickets.length > 0) {
             ticketsCount = soldTickets.length; // Assuming each doc in soldTickets is one ticket
        }


        setTotalRevenue(revenue);
        setTotalTicketsSold(ticketsCount);
        setTotalOrdersCompleted(ordersCount);

    }, [completedOrders, soldTickets]);


    if (authLoading || loading) {
        return (
            <div className={styles.overviewContainer}>
                <p className={styles.loadingMessage}>Loading your sales overview...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className={styles.overviewContainer}>
                <p className={styles.errorMessage}>{error}</p>
            </div>
        );
    }

    if (!isAuthenticated) {
        return (
            <div className={styles.overviewContainer}>
                <p className={styles.errorMessage}>Please log in to view your dashboard.</p>
            </div>
        );
    }

    return (
        <div className={styles.overviewContainer}>
            <h1 className={styles.header}>Sales Overview</h1>

            <div className={styles.statsGrid}>
                <div className={styles.statCard}>
                    <FaDollarSign className={styles.statIcon} />
                    <span className={styles.statValue}>KES {totalRevenue.toFixed(2)}</span>
                    <span className={styles.statLabel}>Total Revenue</span>
                </div>
                <div className={styles.statCard}>
                    <FaTicketAlt className={styles.statIcon} />
                    <span className={styles.statValue}>{totalTicketsSold}</span>
                    <span className={styles.statLabel}>Tickets Sold</span>
                </div>
                <div className={styles.statCard}>
                    <FaShoppingCart className={styles.statIcon} />
                    <span className={styles.statValue}>{totalOrdersCompleted}</span>
                    <span className={styles.statLabel}>Orders Completed</span>
                </div>
                <div className={styles.statCard}>
                    <FaUserCheck className={styles.statIcon} />
                    <span className={styles.statValue}>{(totalTicketsSold / Math.max(1, totalOrdersCompleted)).toFixed(1)}</span>
                    <span className={styles.statLabel}>Avg. Tickets per Order</span>
                </div>
            </div>

            <div className={styles.recentSalesSection}>
                <h2 className={styles.sectionTitle}>Recent Completed Sales</h2>
                {completedOrders.length === 0 ? (
                    <p className={styles.noSalesMessage}>No completed sales yet.</p>
                ) : (
                    <ul className={styles.salesList}>
                        {completedOrders.slice(0, 5).map(order => ( // Show up to 5 recent sales
                            <li key={order.id} className={styles.saleItem}>
                                <div className={styles.saleDetails}>
                                    <p className={styles.saleEventName}>{order.eventDetails?.eventName || 'N/A'}</p>
                                    <p className={styles.saleMeta}>
                                        Order ID: {order.orderId?.substring(order.orderId.length - 8) || 'N/A'} |
                                        {order.orderEndTime ? ` ${format(order.orderEndTime instanceof Timestamp ? order.orderEndTime.toDate() : order.orderEndTime, 'MMM d, hh:mm a')}` : 'N/A'}
                                    </p>
                                </div>
                                <span className={styles.saleAmount}>KES {order.totalAmount?.toFixed(2) || '0.00'}</span>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
};

export default OverviewTab;