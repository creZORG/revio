import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { db } from '../../../utils/firebaseConfig.js';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import Button from '../../../components/Common/Button.jsx';
import LoadingSkeleton from '../../../components/Common/LoadingSkeleton.jsx';
import { FaHeart, FaCalendarAlt, FaMapMarkerAlt, FaTimes } from 'react-icons/fa';

import styles from '../user.module.css'; // NEW: Import the CSS module

const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';

const MyFavoritesTab = ({ currentUser, showNotification, tabDataLoading }) => {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchFavorites = async () => {
      if (!currentUser) {
        setLoading(false);
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const favoritesRef = collection(db, `artifacts/${appId}/users/${currentUser.uid}/favorites`);
        const q = query(favoritesRef, orderBy("addedAt", "desc"));
        const snapshot = await getDocs(q);
        const fetchedFavorites = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setFavorites(fetchedFavorites);
      } catch (err) {
        console.error("Error fetching favorites:", err);
        setError("Failed to load your favorite events.");
        setFavorites([]);
      } finally {
        setLoading(false);
      }
    };

    fetchFavorites();
  }, [currentUser]);

  const handleRemoveFavorite = (favoriteId) => {
    showNotification(`Removing favorite ${favoriteId}... (Simulated)`, 'info');
  };

  if (loading || tabDataLoading) {
    return (
      <div>
        <h2>My Favorites</h2>
        <LoadingSkeleton width="100%" height="150px" className="mb-4" style={{backgroundColor: 'var(--background-color)'}} />
        <LoadingSkeleton width="100%" height="150px" className="mb-4" style={{backgroundColor: 'var(--background-color)'}} />
      </div>
    );
  }

  if (error) {
    return <p className="error-message-box">{error}</p>;
  }

  return (
    <div>
      <h2>My Favorites</h2>
      {favorites.length > 0 ? (
        <div className={styles.ticketList}> {/* Re-using ticket-list for consistent spacing */}
          {favorites.map(fav => (
            <div key={fav.id} className={styles.ticketItem}> {/* Re-using ticket-item */}
              <div className={styles.ticketInfo}>
                <span className={styles.ticketEventName}>{fav.eventName || 'Favorite Event'}</span>
                <span className={styles.ticketDateLocation}>
                  <FaCalendarAlt /> {fav.eventDate ? new Date(fav.eventDate.toDate()).toLocaleDateString() : 'N/A'}
                  <span>|</span>
                  <FaMapMarkerAlt /> {fav.location || 'N/A'}
                </span>
              </div>
              <div className={styles.ticketActions}>
                <Link to={`/events/${fav.id}`} className="btn action-btn">
                  View Event
                </Link>
                <Button onClick={() => handleRemoveFavorite(fav.id)} className="btn action-btn" style={{backgroundColor: 'var(--sys-error)', color: 'white'}}>
                  <FaTimes /> Remove
                </Button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="profile-section-card placeholder-content">
          <FaHeart />
          <p>No favorite events added yet.</p>
          <Link to="/events" className="btn btn-primary">Discover Events</Link>
        </div>
      )}
    </div>
  );
};

export default MyFavoritesTab;