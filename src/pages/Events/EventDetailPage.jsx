import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom'; // Import useNavigate
import { db } from '../../utils/firebaseConfig.js';
import { doc, getDoc, setDoc, deleteDoc, updateDoc, collection, addDoc, Timestamp } from 'firebase/firestore';
import { useAuth } from '../../hooks/useAuth.js';
import { useNotification } from '../../contexts/NotificationContext.jsx';
import Modal from '../../components/Common/Modal.jsx';
import LoadingSkeleton from '../../components/Common/LoadingSkeleton.jsx';

import styles from './EventDetailPage.module.css'; // Dedicated CSS module

// Import new sub-components
import EventHeroSection from './EventDetailPage/EventHeroSection.jsx';
import EventMainContent from './EventDetailPage/EventMainContent.jsx';
import EventSidebarActions from './EventDetailPage/EventSidebarActions.jsx';
import EventMobileTabs from './EventDetailPage/EventMobileTabs.jsx';

// Import icons
import {
  FaCalendarAlt, FaMapMarkerAlt, FaTicketAlt, FaEnvelope, FaFacebookF, FaTwitter, FaWhatsapp, FaInstagram,
  FaHeart, FaRegHeart, FaLaptopCode, FaDollarSign, FaUsers, FaClock, FaPhone, FaLink, FaStar, FaGamepad,
  FaMinus, FaPlus, FaCheckCircle, FaSpinner, FaTag, FaInfoCircle, FaShareAlt
} from 'react-icons/fa';

const appId = "1:147113503727:web:1d9d351c30399b2970241a"; // Hardcoded appId

// Universal Date Conversion Helper
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


const EventDetailPage = () => {
  const { id } = useParams();
  const { currentUser, isAuthenticated } = useAuth();
  const { showNotification } = useNotification();
  const navigate = useNavigate(); // Initialize useNavigate

  const [event, setEvent] = useState(null);
  const [organizer, setOrganizer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSaved, setIsSaved] = useState(false);
  
  const [isMobileView, setIsMobileView] = useState(window.innerWidth <= 1024); // Determine if mobile for responsive layout

  // M-Pesa Payment State (moved here as it's shared for modal)
  const [mpesaPhoneNumber, setMpesaPhoneNumber] = useState('');
  const [mpesaAmount, setMpesaAmount] = useState(0);
  const [isProcessingMpesa, setIsProcessingMpesa] = useState(false);
  const [mpesaError, setMpesaError] = useState('');

  const [showShareModal, setShowShareModal] = useState(false);
  const [showMpesaModal, setShowMpesaModal] = useState(false);
  const [showContactOrganizerModal, setShowContactOrganizerModal] = useState(false);


  useEffect(() => {
    const handleResize = () => {
      setIsMobileView(window.innerWidth <= 1024);
    };
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, []);


  // Fetch Event Data and Organizer Data
  useEffect(() => {
    const fetchEventAndOrganizer = async () => {
      setLoading(true);
      setError(null);
      
      if (!id) {
        setError("Event ID is missing from the URL.");
        setLoading(false);
        return;
      }

      try {
        const eventDocRef = doc(db, `artifacts/${appId}/public/data_for_app/events`, id);
        const eventSnap = await getDoc(eventDocRef);

        if (!eventSnap.exists()) {
          setError("Event not found.");
          setLoading(false);
          return;
        }

        const eventData = { id: eventSnap.id, ...eventSnap.data() };
        eventData.startDate = toJSDate(eventData.startDate);
        eventData.endDate = toJSDate(eventData.endDate);
        eventData.ticketTypes = eventData.ticketTypes?.map(ticket => ({
            ...ticket,
            bookingStartDate: toJSDate(ticket.bookingStartDate),
            bookingEndDate: toJSDate(ticket.bookingEndDate),
        })) ?? [];
        eventData.rsvpConfig = eventData.rsvpConfig ? {
            ...eventData.rsvpConfig,
            rsvpStartDate: toJSDate(eventData.rsvpConfig.rsvpStartDate),
            rsvpEndDate: toJSDate(eventData.rsvpConfig.rsvpEndDate),
        } : {};
        eventData.galleryImages = eventData.galleryImageUrls || []; // FIX: Correctly get gallery images

        setEvent(eventData);

        if (eventData.organizerId) {
          const organizerProfileRef = doc(db, `artifacts/${appId}/users/${eventData.organizerId}/profiles`, eventData.organizerId);
          const organizerSnap = await getDoc(organizerProfileRef);
          if (organizerSnap.exists()) {
            setOrganizer(organizerSnap.data());
          }
        }

        if (isAuthenticated && currentUser) {
          const savedEventRef = doc(db, `artifacts/${appId}/users/${currentUser.uid}/favorites`, eventData.id);
          const savedSnap = await getDoc(savedEventRef);
          setIsSaved(savedSnap.exists());
        }

      } catch (err) {
        console.error("Error fetching event details:", err);
        setError("Failed to load event details: " + err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchEventAndOrganizer();
  }, [id, isAuthenticated, currentUser]);

  const handleSaveToggle = async (e) => {
    e.stopPropagation();
    e.preventDefault();
    if (!isAuthenticated || !currentUser) {
      showNotification("Please log in to save events!", "info");
      return;
    }
    if (!event?.id) {
      showNotification("Event data not loaded yet.", "error");
      return;
    }
    const savedEventRef = doc(db, `artifacts/${appId}/users/${currentUser.uid}/favorites`, event.id);
    try {
      if (isSaved) {
        await deleteDoc(savedEventRef);
        setIsSaved(false);
        showNotification(`'${event.eventName}' removed from favorites.`, "info");
      } else {
        await setDoc(savedEventRef, { eventId: event.id, eventName: event.eventName, bannerImageUrl: event.bannerImageUrl, startDate: event.startDate, addedAt: Timestamp.now() });
        setIsSaved(true);
        showNotification(`'${event.eventName}' added to favorites!`, "success");
      }
    } catch (err) {
      console.error("Error saving/unsaving event:", err);
      showNotification("Failed to save/unsave event. Please try again.", "error");
    }
  };

  const handleMpesaPayment = async () => {
    setMpesaError('');
    if (!mpesaPhoneNumber.trim()) {
      setMpesaError('Phone number is required.');
      return;
    }
    if (mpesaAmount <= 0) {
      setMpesaError('Amount must be greater than zero.');
      return;
    }

    setIsProcessingMpesa(true);
    showNotification('Initiating M-Pesa payment...', 'info');

    try {
      console.log(`Simulating M-Pesa payment of KES ${mpesaAmount} to ${mpesaPhoneNumber} for event ${event.eventName}`);
      
      await new Promise(resolve => setTimeout(resolve, 2000));

      showNotification('M-Pesa payment initiated successfully! Check your phone for STK Push.', 'success');
      const purchasesRef = collection(db, `artifacts/${appId}/public/purchases`);
      await addDoc(purchasesRef, {
        eventId: event.id,
        eventName: event.eventName,
        userId: currentUser?.uid || 'unauthenticated',
        phoneNumber: mpesaPhoneNumber,
        amount: mpesaAmount,
        purchaseDate: Timestamp.now(),
        status: 'pending_confirmation',
        paymentMethod: 'mpesa',
      });

      showNotification(`Confirmation email sent to ${currentUser?.email || 'your registered email'}!`, 'success');

      setShowMpesaModal(false);
      setMpesaPhoneNumber('');
      setMpesaAmount(0);
      showNotification('Purchase successful! Your tickets have been sent to your email.', 'success');

    } catch (err) {
      console.error("M-Pesa payment error:", err);
      setMpesaError('Payment failed. Please try again.');
      showNotification('M-Pesa payment failed. ' + err.message, 'error');
    } finally {
      setIsProcessingMpesa(false);
    }
  };

  // Derived data for props
  const startDate = event?.startDate instanceof Date ? event.startDate : null;
  const endDate = event?.endDate instanceof Date ? event.endDate : null;

  const displayDateFull = startDate
    ? `${startDate.toLocaleString('en-US', { weekday: 'long' })}, ${startDate.toLocaleString('en-US', { month: 'long' })} ${startDate.getDate()}, ${startDate.getFullYear()} | ${startDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
    : 'N/A';

  const displayEndDateFull = endDate && startDate?.toDateString() !== endDate.toDateString()
    ? ` - ${endDate.toLocaleDateString()} ${endDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
    : '';

  const displayLocation = event?.specificAddress || event?.mainLocation || 'N/A';


  // Render appropriate event action/details component (passed to sidebar/tabs)
  const renderEventActionComponent = () => {
    if (!event) return null;

    const isNaksYetuTicketedEvent = event.isNaksYetuTicketed || (event.eventType === 'ticketed' && event.ticketTypes && event.ticketTypes.length > 0);

    const isBasicAdminEvent = !isNaksYetuTicketedEvent && (event.eventType === 'free' || event.eventType === 'rsvp' || event.eventType === 'online');

    if (isNaksYetuTicketedEvent) {
        return <TicketPurchaseSection event={event} onProceedToCheckout={(amount) => {setMpesaAmount(amount); setShowMpesaModal(true);}} />;
    } else if (event.eventType === 'rsvp' && !isBasicAdminEvent) {
        return <RsvpFormSection event={event} />;
    } else if (event.eventType === 'online' && !isBasicAdminEvent) {
        return <OnlineEventInfo event={event} />;
    } else if (event.eventType === 'free' && !isBasicAdminEvent) {
        return <FreeEventInfo event={event} />;
    } else if (event.category === 'Nightlife') {
        return <NightlifeSpecifics event={event} />;
    }
    return (
      <div className={styles.sectionContent} style={{textAlign: 'center', color: 'var(--naks-text-secondary)'}}>
        <h2 className={styles.sidebarHeading}>Event Actions</h2>
        <p>No specific actions available for this event type.</p>
        <p>This event is for visibility only.</p>
      </div>
    );
  };

  // Render the PC Layout
  const renderPcLayout = () => (
    <>
      <EventHeroSection
        event={event}
        displayDateFull={displayDateFull}
        displayEndDateFull={displayEndDateFull}
        displayLocation={displayLocation}
        showNotification={showNotification}
      />

      {/* Share Icons & Save/Calendar (Below Hero) */}
      <div className={styles.shareIconsBelowHero}>
          <button onClick={() => setShowShareModal(true)} className={styles.shareSmallButton}>
              <FaShareAlt /> Share
          </button>
          <button onClick={handleSaveToggle} className={`${styles.shareSmallButton} ${isSaved ? styles.saved : ''}`}>
              {isSaved ? <FaHeart /> : <FaRegHeart />} Save
          </button>
          <button onClick={() => showNotification('Add to Google Calendar (Coming Soon!)', 'info')} className={styles.shareSmallButton}>
              <FaCalendarAlt /> Calendar
          </button>
      </div>

      {/* Main Content Area - PC layout without tabs */}
      <div className={`${styles.mainWrapper} ${styles.pcLayout}`}>
        <EventMainContent event={event} organizer={organizer} />
        <EventSidebarActions event={event} setMpesaAmount={setMpesaAmount} setShowMpesaModal={setShowMpesaModal} />
      </div>
    </>
  );

  // Render the Mobile Layout
  const renderMobileLayout = () => (
    <>
      <EventHeroSection
        event={event}
        displayDateFull={displayDateFull}
        displayEndDateFull={displayEndDateFull}
        displayLocation={displayLocation}
        showNotification={showNotification}
      />

      {/* Share Icons & Save/Calendar (Below Hero for Mobile) */}
      <div className={styles.shareIconsBelowHero}>
          <button onClick={() => setShowShareModal(true)} className={styles.shareSmallButton}>
              <FaShareAlt /> Share
          </button>
          <button onClick={handleSaveToggle} className={`${styles.shareSmallButton} ${isSaved ? styles.saved : ''}`}>
              {isSaved ? <FaHeart /> : <FaRegHeart />} Save
          </button>
          <button onClick={() => showNotification('Add to Google Calendar (Coming Soon!)', 'info')} className={styles.shareSmallButton}>
              <FaCalendarAlt /> Calendar
          </button>
      </div>

      {/* Main Content Area - Mobile layout with tabs */}
      <div className={styles.mainWrapper}>
        <EventMobileTabs event={event} organizer={organizer} setMpesaAmount={setMpesaAmount} setShowMpesaModal={setShowMpesaModal} />
      </div>

      {/* Mobile Fixed Action Button (Proceed to Checkout/Register/Attend) */}
      {isMobileView && (event.eventType === 'ticketed' || event.eventType === 'rsvp' || event.eventType === 'free' || event.eventType === 'online') && (
        <div className={styles.mobileFixedActionButtonContainer}>
            {event.eventType === 'ticketed' && (
                <button onClick={() => { setShowMpesaModal(true); }} className={`btn btn-primary ${styles.mobileFixedActionButton}`}>Proceed to Checkout</button>
            )}
            {event.eventType === 'rsvp' && (
                <button onClick={() => setShowMpesaModal(true)} className={`btn btn-primary ${styles.mobileFixedActionButton}`}>Register for Event</button>
            )}
            {event.eventType === 'free' && (
                <button className={`btn btn-primary ${styles.mobileFixedActionButton}`}>Attend for Free</button>
            )}
            {event.eventType === 'online' && (
                <button onClick={() => window.open(event.onlineEventUrl, '_blank')} className={`btn btn-primary ${styles.mobileFixedActionButton}`}>Join Online Event</button>
            )}
        </div>
      )}
    </>
  );


  if (loading) {
    return (
      <div className={styles.eventDetailPageContainer}>
        <LoadingSkeleton width="100%" height="500px" className={styles.eventHeroSection} />
        <div className={styles.mainWrapper}>
          <LoadingSkeleton width="100%" height="150px" className={styles.sectionContent} style={{marginBottom: '20px'}} />
          <LoadingSkeleton width="100%" height="100px" className={styles.sectionContent} style={{marginBottom: '20px'}} />
          <LoadingSkeleton width="100%" height="120px" className={styles.sectionContent} />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`${styles.eventDetailPageContainer} error-message-box`} style={{justifyContent: 'center', alignItems: 'center', minHeight: '300px'}}>
        <p>{error}</p>
      </div>
    );
  }

  if (!event) {
    return (
      <div className={`${styles.eventDetailPageContainer} error-message-box`} style={{justifyContent: 'center', alignItems: 'center', minHeight: '300px'}}>
        <p>Event data is missing or not found.</p>
      </div>
    );
  }

  return (
    <div className={styles.eventDetailPageContainer}>
      {isMobileView ? renderMobileLayout() : renderPcLayout()}

      {/* Share Icons Modal */}
      <Modal isOpen={showShareModal} onClose={() => setShowShareModal(false)} title="Share This Event">
        <div style={{textAlign: 'center', padding: '20px'}}>
          <p style={{marginBottom: '20px', color: 'var(--naks-text-secondary)'}}>Share "{event.eventName}" with your friends!</p>
          <div className={styles.socialShareIcons} style={{justifyContent: 'center', gap: '25px'}}>
            <a href={`https://wa.me/?text=${encodeURIComponent(event.eventName + " - " + window.location.href)}`} target="_blank" rel="noopener noreferrer" className={styles.socialIcon} onClick={() => setShowShareModal(false)}><FaWhatsapp /></a>
            <a href={`https://www.instagram.com/direct/new/`} target="_blank" rel="noopener noreferrer" className={styles.socialIcon} onClick={() => setShowShareModal(false)}><FaInstagram /></a>
            <a href={`https://www.facebook.com/sharer/sharer.php?u=${window.location.href}`} target="_blank" rel="noopener noreferrer" className={styles.socialIcon} onClick={() => setShowShareModal(false)}><FaFacebookF /></a>
          </div>
        </div>
      </Modal>

      {/* M-Pesa Payment Modal */}
      <Modal isOpen={showMpesaModal} onClose={() => setShowMpesaModal(false)} title="Complete Your Payment">
        <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <p style={{color: 'var(--naks-text-secondary)', textAlign: 'center'}}>
            Please enter your M-Pesa number to proceed with payment.
          </p>
          <div className="form-group">
            <label htmlFor="mpesaPhoneNumber" className="form-label">M-Pesa Phone Number</label>
            <input
              type="tel"
              id="mpesaPhoneNumber"
              className="input-field"
              placeholder="e.g., 2547XXXXXXXX"
              value={mpesaPhoneNumber}
              onChange={(e) => setMpesaPhoneNumber(e.target.value)}
              disabled={isProcessingMpesa}
            />
            {mpesaError && <p className="error-message-box">{mpesaError}</p>}
          </div>
          <div className="form-group">
            <label className="form-label">Amount</label>
            <input
              type="text"
              className="input-field"
              value={`KES ${mpesaAmount.toFixed(2)}`}
              disabled
              style={{fontWeight: 'bold', color: 'var(--naks-primary)'}}
            />
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
            <button onClick={() => setShowMpesaModal(false)} className="btn btn-secondary" disabled={isProcessingMpesa}>Cancel</button>
            <button onClick={handleMpesaPayment} className="btn btn-primary" disabled={isProcessingMpesa}>
              {isProcessingMpesa ? <FaSpinner className="spinner" /> : 'Pay with M-Pesa'}
            </button>
          </div>
        </div>
      </Modal>

      {/* Contact Organizer Modal */}
      <Modal isOpen={showContactOrganizerModal} onClose={() => setShowContactOrganizerModal(false)} title="Contact Organizer">
        {organizer ? (
          <div style={{ padding: '20px', textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <h3 style={{color: 'var(--naks-text-primary)', marginBottom: '10px'}}>{organizer.displayName || organizer.email}</h3>
            <p style={{color: 'var(--naks-text-secondary)'}}><FaEnvelope style={{marginRight: '8px'}} /> {organizer.contactEmail || 'N/A'}</p>
            <p style={{color: 'var(--naks-text-secondary)'}}><FaPhone style={{marginRight: '8px'}} /> {organizer.contactPhone || 'N/A'}</p>
            <div className={styles.organizerSocialLinks} style={{justifyContent: 'center', marginTop: '20px'}}>
              {organizer.instagram && <a href={organizer.instagram} target="_blank" rel="noopener noreferrer" className={styles.organizerSocialLink}><FaInstagram /></a>}
              {organizer.twitter && <a href={organizer.twitter} target="_blank" rel="noopener noreferrer" className={styles.organizerSocialLink}><FaTwitter /></a>}
            </div>
            <button onClick={() => setShowContactOrganizerModal(false)} className="btn btn-primary" style={{marginTop: '20px'}}>Close</button>
          </div>
        ) : (
          <div style={{ padding: '20px', textAlign: 'center', color: 'var(--naks-text-secondary)' }}>
            <p>Organizer details not available.</p>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default EventDetailPage;