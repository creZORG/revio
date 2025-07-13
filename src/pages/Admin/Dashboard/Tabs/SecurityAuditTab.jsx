import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { collection, onSnapshot, query, orderBy, where, Timestamp } from 'firebase/firestore';
import { db } from '../../../../utils/firebaseConfig';
import DataTable from '../components/DataTable';
import styles from './SecurityAuditTab.module.css';
import { format } from 'date-fns';
import { FaSearch } from 'react-icons/fa';

const ACTION_CATEGORIES = ['Role Change', 'Status Change', 'Event Approved', 'Event Rejected']; // Add more as needed

const SecurityAuditTab = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  // State for filters
  const [filters, setFilters] = useState({
    action: 'all',
    adminName: '',
    startDate: '',
    endDate: '',
  });
  const [activeQuery, setActiveQuery] = useState(null);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleSearch = useCallback(() => {
    setActiveQuery(filters);
  }, [filters]);

  useEffect(() => {
    setLoading(true);
    const logsRef = collection(db, "admin_logs");
    let queryConstraints = [orderBy("timestamp", "desc")];

    if (activeQuery) {
        if (activeQuery.action && activeQuery.action !== 'all') {
            queryConstraints.push(where('action', '==', activeQuery.action));
        }
        if (activeQuery.adminName) {
            queryConstraints.push(where('adminName', '>=', activeQuery.adminName));
            queryConstraints.push(where('adminName', '<=', activeQuery.adminName + '\uf8ff'));
        }
        if (activeQuery.startDate) {
            queryConstraints.push(where('timestamp', '>=', Timestamp.fromDate(new Date(activeQuery.startDate))));
        }
        if (activeQuery.endDate) {
            const endOfDay = new Date(activeQuery.endDate);
            endOfDay.setHours(23, 59, 59, 999);
            queryConstraints.push(where('timestamp', '<=', Timestamp.fromDate(endOfDay)));
        }
    }

    const q = query(logsRef, ...queryConstraints);

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const logsData = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          timestamp: data.timestamp ? format(data.timestamp.toDate(), 'MMM dd, yyyy, hh:mm:ss a') : 'N/A',
          detailsString: Object.entries(data.details).map(([key, value]) => `${key}: ${value}`).join('; ')
        };
      });
      setLogs(logsData);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching admin logs:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [activeQuery]);

  const columns = useMemo(() => [
    { Header: 'Timestamp', accessor: 'timestamp' },
    { Header: 'Admin', accessor: 'adminName' },
    { Header: 'Action', accessor: 'action', Cell: ({ value }) => <span className={styles.actionCell}>{value}</span> },
    { Header: 'Target User', accessor: 'targetUserName' },
    { Header: 'Details', accessor: 'detailsString' },
    { Header: 'Device Info', accessor: 'deviceInfo' },
  ], []);

  return (
    <div className={styles.auditSection}>
      <div className={styles.sectionHeader}>
        <h3 className={styles.sectionTitle}>Administrator Activity Log</h3>
      </div>
      
      <div className={styles.controlsContainer}>
        <input
            type="text"
            name="adminName"
            placeholder="Search by Admin Name..."
            value={filters.adminName}
            onChange={handleFilterChange}
            className={styles.filterInput}
        />
        <select name="action" value={filters.action} onChange={handleFilterChange} className={styles.filterSelect}>
            <option value="all">All Actions</option>
            {ACTION_CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
        </select>
        <input type="date" name="startDate" value={filters.startDate} onChange={handleFilterChange} className={styles.filterInput} />
        <input type="date" name="endDate" value={filters.endDate} onChange={handleFilterChange} className={styles.filterInput} />
        <button onClick={handleSearch} className={styles.searchButton}><FaSearch /> Apply Filters</button>
      </div>

      <DataTable
        columns={columns}
        data={logs}
        isLoading={loading}
        noDataMessage="No logs match the current filters."
      />
    </div>
  );
};

export default SecurityAuditTab;
