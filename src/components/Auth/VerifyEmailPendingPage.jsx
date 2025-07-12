import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { getAuth, sendEmailVerification } from 'firebase/auth'; // Import sendEmailVerification
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore'; // Import Firestore functions
import { db } from '../../utils/firebaseConfig.js';
import { useNotification } from '../../contexts/NotificationContext.jsx';
import LoadingSkeleton from '../../components/Common/LoadingSkeleton.jsx';
import EventCard from '../../components/Events/EventCard.jsx'; // To display suggested events

import styles from './AuthPage.module.css'; // Re-use auth page styles

import { FaEnvelopeOpenText, FaRedo, FaCalendarAlt, FaSpinner } from 'react-icons/fa';

const appId = "1:147113503727:web:1d9d351c30399b2970241a";

// Universal Date Conversion Helper (re-defined here for robustness, or import if centralized)
const toJSDate = (firestoreTimestampOrDateValue) => {
  if (!firestoreTimestampOrDateValue) return null;
  if (firestoreTimestampOrDateValue instanceof Date) return firestoreTimestampOrDateValue;
  if (typeof firestoreTimestampOrDateValue.toDate === 'function') {
    return firestoreTimestampOrDateValue.toDate();
  }
  if (typeof firestoreTimestampOrDateValue === 'object' && firestoreTimestampOrDateValue.seconds !== undefined && firestoreTimestampOrDateValue.nanoseconds !== undefined) {
    return new Date(firestoreTimestampOrDateValue.seconds * 1000 + firestoreTimestampOrDateValue.nanoseconds / 1000000);
  }
  if (typeof firestoreTimestampOrDateValue === 'string' || typeof firestoreTimestampOrDateValue === 'number') {
    const date = new Date(firestoreTimestampOrDateValue);
    return isNaN(date.getTime()) ? null : date;
  }
  return null;
};


const VerifyEmailPendingPage = () => {
  const location = useLocation();
  const auth = getAuth();
  const { showNotification } = useNotification();
  const userEmail = location.state?.email || auth.currentUser?.email || 'your email address';

  const [suggestedEvents, setSuggestedEvents] = useState([]);
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [eventsError, setEventsError] = useState(null);
  const [isResending, setIsResending] = useState(false);

  // Fetch suggested events
  useEffect(() => {
    const fetchSuggestedEvents = async () => {
      setLoadingEvents(true);
      setEventsError(null);
      try {
        const eventsRef = collection(db, `artifacts/${appId}/public/data_for_app/events`);
        const q = query(
          eventsRef,
          orderBy('createdAt', 'desc'), // Order by creation date or start date
          limit(3) // Fetch top 3 events
        );
        const snapshot = await getDocs(q);
        const fetched = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          startDate: toJSDate(doc.data().startDate), // Convert dates
          endDate: toJSDate(doc.data().endDate),
        }));
        setSuggestedEvents(fetched);
      } catch (err) {
        console.error("Error fetching suggested events:", err);
        setEventsError("Failed to load suggested events.");
      } finally {
        setLoadingEvents(false);
      }
    };
    fetchSuggestedEvents();
  }, []);

  const handleResendVerificationEmail = async () => {
    if (!auth.currentUser) {
      showNotification('No user logged in to resend email.', 'error');
      return;
    }
    setIsResending(true);
    try {
      await sendEmailVerification(auth.currentUser);
      showNotification('Verification email re-sent! Please check your inbox.', 'success');
    } catch (err) {
      console.error("Error resending verification email:", err);
      showNotification('Failed to resend verification email. Please try again later.', 'error');
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className={styles.pageWrapper} style={{minHeight: 'calc(100vh - 120px)', justifyContent: 'center'}}>
      <section className={`${styles.authContainer} ${styles.infoSection}`} style={{maxWidth: '700px', padding: '40px'}}>
        <h2 className={styles.authTitle}>
          Welcome to <span className={styles.naksYetuGradient}>Naks Yetu</span>!
        </h2>
        <p className={styles.authSubtitle} style={{marginBottom: '25px'}}>
          Your account has been created.
        </p>

        <div style={{textAlign: 'center', marginBottom: '30px'}}>
          <FaEnvelopeOpenText style={{ fontSize: '4rem', color: 'var(--naks-info)', marginBottom: '20px' }} />
          <h3 className={styles.infoTitle} style={{color: 'var(--naks-text-primary)', marginBottom: '10px'}}>
            Verify Your Email Address
          </h3>
          <p className={styles.infoDescription}>
            We've sent a verification email to <strong>{userEmail}</strong>. Please check your inbox (and spam folder) and click the link to activate your account.
          </p>
          <p className={styles.infoDescription} style={{fontWeight: '600', color: 'var(--naks-warning)'}}>
            Email verification is important for full account access and security, but you can still explore the app without it.
          </p>
          <Button onClick={handleResendVerificationEmail} className="btn btn-secondary" disabled={isResending} style={{marginTop: '20px'}}>
            {isResending ? <FaSpinner className="spinner" /> : <FaRedo />} Resend Verification Email
          </Button>
        </div>

        <h3 className={styles.infoTitle} style={{marginBottom: '20px'}}>
          <FaCalendarAlt style={{marginRight: '10px', color: 'var(--naks-secondary)'}} /> Explore Events Now!
        </h3>
        {loadingEvents ? (
          <div className={styles.infoSectionsWrapper} style={{gridTemplateColumns: '1fr', gap: '20px'}}>
            {Array(3).fill(0).map((_, i) => (
              <LoadingSkeleton key={i} width="100%" height="150px" style={{borderRadius: '15px'}} />
            ))}
          </div>
        ) : eventsError ? (
          <p className="error-message-box">{eventsError}</p>
        ) : suggestedEvents.length === 0 ? (
          <p className={styles.infoDescription}>No events to suggest right now. Check back later!</p>
        ) : (
          <div className={styles.infoSectionsWrapper} style={{gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px'}}>
            {suggestedEvents.map(event => (
              <Link to={`/events/${event.id}`} key={event.id} className={styles.infoSection} style={{padding: '15px', borderRadius: '12px', boxShadow: 'var(--shadow-sm)'}}>
                <img src={event.bannerImageUrl || 'https://placehold.co/150x100/E0E0E0/808080?text=Event'} alt={event.eventName} style={{width: '100%', height: '100px', objectFit: 'cover', borderRadius: '8px', marginBottom: '10px'}} />
                <h4 style={{fontSize: '1rem', fontWeight: '600', color: 'var(--naks-text-primary)', margin: '0 0 5px 0'}}>{event.eventName}</h4>
                <p style={{fontSize: '0.8rem', color: 'var(--naks-text-secondary)', margin: '0'}}>{event.startDate?.toLocaleDateString() || 'N/A'}</p>
              </Link>
            ))}
          </div>
        )}
        <Link to="/events" className={`${styles.infoSectionBtn} btn btn-primary`} style={{marginTop: '30px'}}>View All Events</Link>
      </section>
    </div>
  );
};

export default VerifyEmailPendingPage;