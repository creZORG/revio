import React, { useState, useEffect } from 'react';
import { collection, getDocs, query, where, limit, orderBy } from 'firebase/firestore';
import { db } from '../../../../utils/firebaseConfig';
import styles from './OverviewTab.module.css';

// Import components
import StatCard from '../components/StatCard';
import ActivityFeed from '../components/ActivityFeed';
import LoadingSkeleton from '../../../../components/Common/LoadingSkeleton';

// Import Icons
import {
  FaCalendarCheck, FaUsers, FaDollarSign, FaUserTie, FaStar, FaTicketAlt, FaSpinner
} from 'react-icons/fa';

const OverviewTab = () => {
  const [stats, setStats] = useState({
    totalEvents: 0,
    totalUsers: 0,
    totalRevenueMonth: 0,
    activeOrganizers: 0,
    activeInfluencers: 0,
    ticketsSoldToday: 0,
  });
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        // Fetch Users
        const usersCollectionRef = collection(db, 'users');
        const usersSnapshot = await getDocs(usersCollectionRef);
        const usersData = usersSnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));

        const totalUsers = usersData.length;
        const activeOrganizers = usersData.filter(u => u.role === 'organizer').length;
        const activeInfluencers = usersData.filter(u => u.role === 'influencer').length;

        // Fetch Events
        const eventsCollectionRef = collection(db, 'events');
        const eventsSnapshot = await getDocs(eventsCollectionRef);
        const totalEvents = eventsSnapshot.size;
        
        // Fetch Activities
        const activitiesCollectionRef = collection(db, 'platform_activities');
        const activitiesQuery = query(activitiesCollectionRef, orderBy('timestamp', 'desc'), limit(5));
        const activitiesSnapshot = await getDocs(activitiesQuery);
        const activitiesData = activitiesSnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));

        // TODO: Implement logic for revenue and tickets sold today
        // This will likely require more complex queries or Cloud Functions

        setStats({
          totalEvents,
          totalUsers,
          totalRevenueMonth: 0, // Placeholder
          activeOrganizers,
          activeInfluencers,
          ticketsSoldToday: 0, // Placeholder
        });

        setActivities(activitiesData);

      } catch (error) {
        console.error("Error fetching admin dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const formatCurrency = (amount) => {
    return `KES ${amount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`;
  };

  if (loading) {
    return (
        <div className={styles.loadingContainer}>
            <FaSpinner className={styles.spinner} />
            <p>Loading Overview...</p>
        </div>
    );
  }

  return (
    <div className={styles.overviewSection}>
      <div className={styles.statCardsGrid}>
        <StatCard icon={<FaCalendarCheck />} value={stats.totalEvents} label="Total Events" colorClass="primary" />
        <StatCard icon={<FaUsers />} value={stats.totalUsers} label="Total Users" colorClass="info" />
        <StatCard icon={<FaDollarSign />} value={formatCurrency(stats.totalRevenueMonth)} label="Revenue (Month)" colorClass="success" />
        <StatCard icon={<FaUserTie />} value={stats.activeOrganizers} label="Active Organizers" colorClass="secondary" />
        <StatCard icon={<FaStar />} value={stats.activeInfluencers} label="Active Influencers" colorClass="warning" />
        <StatCard icon={<FaTicketAlt />} value={stats.ticketsSoldToday} label="Tickets Sold (Today)" colorClass="info" />
      </div>

      <ActivityFeed activities={activities} isLoading={loading} />
    </div>
  );
};

export default OverviewTab;