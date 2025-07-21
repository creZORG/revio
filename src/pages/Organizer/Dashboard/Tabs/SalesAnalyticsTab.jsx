import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../../contexts/AuthContext.jsx';
import { useNotification } from '../../../../contexts/NotificationContext.jsx';
import { getOrganizerCompletedOrdersQuery, onCollectionSnapshot } from '../../../../services/firestoreService.js';
import { FaChartLine, FaUsers, FaTicketAlt, FaDollarSign } from 'react-icons/fa'; // Icons for analytics
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'; // For charts

import styles from './SalesAnalyticsTab.module.css'; // Create this CSS Module
import LoadingSkeleton from '../../../../components/Common/LoadingSkeleton.jsx';

const SalesAnalyticsTab = ({ organizerId }) => {
    const { isAuthenticated, loading: authLoading } = useAuth();
    const { showNotification } = useNotification();

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [completedOrders, setCompletedOrders] = useState([]);

    const [chartData, setChartData] = useState([]);
    const [topSellingEvents, setTopSellingEvents] = useState([]);
    const [customerDemographics, setCustomerDemographics] = useState({}); // Placeholder for future demographic data

    useEffect(() => {
        if (!isAuthenticated || !organizerId) {
            setLoading(false);
            return () => {};
        }

        setLoading(true);
        setError(null);

        const unsubscribe = onCollectionSnapshot(
            getOrganizerCompletedOrdersQuery(organizerId),
            (orders) => {
                console.log("SalesAnalyticsTab: Real-time orders update:", orders);
                setCompletedOrders(orders);
                setLoading(false);
            },
            (err) => {
                console.error("SalesAnalyticsTab: Error listening to completed orders:", err);
                setError("Failed to load analytics data. Please try again.");
                showNotification("Failed to load analytics data.", "error");
                setLoading(false);
            }
        );

        return () => unsubscribe();
    }, [isAuthenticated, organizerId, showNotification]);

    // Effect to process data for charts and top-selling events
    useEffect(() => {
        if (completedOrders.length === 0) {
            setChartData([]);
            setTopSellingEvents([]);
            return;
        }

        // --- Prepare data for Line Chart (e.g., daily revenue) ---
        const dailyRevenueMap = new Map(); // Map<DateString, TotalRevenue>
        const eventSalesMap = new Map(); // Map<EventId, { name, revenue, ticketsSold }>

        completedOrders.forEach(order => {
            const orderDate = order.orderEndTime ? new Date(order.orderEndTime.toDate()) : new Date(order.createdAt.toDate());
            const dateString = format(orderDate, 'MMM dd'); // e.g., "Jul 20"

            dailyRevenueMap.set(dateString, (dailyRevenueMap.get(dateString) || 0) + (order.totalAmount || 0));

            // For top selling events
            const eventId = order.eventId;
            const eventName = order.eventDetails?.eventName || `Event ${eventId}`;
            const currentEventSales = eventSalesMap.get(eventId) || { name: eventName, revenue: 0, ticketsSold: 0 };
            currentEventSales.revenue += order.totalAmount || 0;
            if (order.generatedTicketDetails && Array.isArray(order.generatedTicketDetails)) {
                currentEventSales.ticketsSold += order.generatedTicketDetails.length; // Assuming each entry is 1 ticket
            }
            eventSalesMap.set(eventId, currentEventSales);
        });

        const sortedChartData = Array.from(dailyRevenueMap.entries())
            .map(([date, revenue]) => ({ date, revenue }))
            .sort((a, b) => new Date(a.date) - new Date(b.date)); // Sort by date

        setChartData(sortedChartData);

        const sortedTopSellingEvents = Array.from(eventSalesMap.values())
            .sort((a, b) => b.revenue - a.revenue) // Sort by revenue descending
            .slice(0, 5); // Top 5
        setTopSellingEvents(sortedTopSellingEvents);

    }, [completedOrders]);


    if (authLoading || loading) {
        return (
            <div className={styles.analyticsContainer}>
                <LoadingSkeleton count={3} />
                <p className={styles.loadingMessage}>Loading sales analytics...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className={styles.analyticsContainer}>
                <p className={styles.errorMessage}>{error}</p>
            </div>
        );
    }

    if (!isAuthenticated) {
        return (
            <div className={styles.analyticsContainer}>
                <p className={styles.errorMessage}>Please log in to view your dashboard.</p>
            </div>
        );
    }

    return (
        <div className={styles.analyticsContainer}>
            <h1 className={styles.header}>Sales Analytics</h1>

            <div className={styles.chartSection}>
                <h2 className={styles.sectionTitle}>Revenue Over Time</h2>
                {chartData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke={getComputedStyle(document.documentElement).getPropertyValue('--naks-gray-200')} />
                            <XAxis dataKey="date" stroke={getComputedStyle(document.documentElement).getPropertyValue('--naks-text-secondary')} />
                            <YAxis stroke={getComputedStyle(document.documentElement).getPropertyValue('--naks-text-secondary')} />
                            <Tooltip contentStyle={{ backgroundColor: getComputedStyle(document.documentElement).getPropertyValue('--naks-surface'), border: `1px solid ${getComputedStyle(document.documentElement).getPropertyValue('--naks-border-medium')}`, borderRadius: 'var(--border-radius-small)' }}
                                   labelStyle={{ color: getComputedStyle(document.documentElement).getPropertyValue('--naks-text-primary') }}
                                   itemStyle={{ color: getComputedStyle(document.documentElement).getPropertyValue('--naks-text-primary') }} />
                            <Legend />
                            <Line type="monotone" dataKey="revenue" stroke={getComputedStyle(document.documentElement).getPropertyValue('--naks-secondary')} activeDot={{ r: 8 }} name="Revenue (KES)" />
                        </LineChart>
                    </ResponsiveContainer>
                ) : (
                    <p className={styles.noDataMessage}>No revenue data available yet.</p>
                )}
            </div>

            <div className={styles.topSellingSection}>
                <h2 className={styles.sectionTitle}>Top Selling Events</h2>
                {topSellingEvents.length > 0 ? (
                    <ul className={styles.topSellingList}>
                        {topSellingEvents.map((event, index) => (
                            <li key={event.id || index} className={styles.topSellingItem}>
                                <span className={styles.topSellingName}>{event.name}</span>
                                <span className={styles.topSellingRevenue}>KES {event.revenue.toFixed(2)}</span>
                                <span className={styles.topSellingTickets}>{event.ticketsSold} Tickets</span>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className={styles.noDataMessage}>No top selling events data available yet.</p>
                )}
            </div>

            {/* Placeholder for future customer demographics */}
            <div className={styles.demographicsSection}>
                <h2 className={styles.sectionTitle}>Customer Demographics (Coming Soon)</h2>
                <p className={styles.noDataMessage}>Demographic insights will appear here.</p>
            </div>
        </div>
    );
};

export default SalesAnalyticsTab;