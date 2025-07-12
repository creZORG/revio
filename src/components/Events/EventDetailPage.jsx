import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { db } from '../../utils/firebaseConfig.js';
import { doc, getDoc, setDoc, deleteDoc, updateDoc, collection, addDoc, Timestamp } from 'firebase/firestore';
import { useAuth } from '../../hooks/useAuth.js';
import { useNotification } from '../../contexts/NotificationContext.jsx';
import Modal from '../../components/Common/Modal.jsx';
import LoadingSkeleton from '../../components/Common/LoadingSkeleton.jsx';

import styles from './EventDetailPage.module.css'; // Dedicated CSS module

// Import new sub-components
import TicketPurchaseSection from '../../components/Events/Details/TicketPurchaseSection.jsx';
import RsvpFormSection from '../../components/Events/Details/RsvpFormSection.jsx';
import OnlineEventInfo from '../../components/Events/Details/OnlineEventInfo.jsx';
import FreeEventInfo from '../../components/Events/Details/FreeEventInfo.jsx';
import NightlifeSpecifics from '../../components/Events/Details/NightlifeSpecifics.jsx';
import GallerySection from '../../components/Events/Details/GallerySection.jsx'; // Import GallerySection

import {
  FaCalendarAlt, FaMapMarkerAlt, FaTicketAlt, FaEnvelope, FaFacebookF, FaTwitter, FaWhatsapp, FaInstagram,
  FaHeart, FaRegHeart, FaLaptopCode, FaDollarSign, FaUsers, FaClock, FaPhone, FaLink, FaStar, FaGamepad,
  FaMinus, FaPlus, FaCheckCircle, FaSpinner, FaTag // Added FaTag for coupon
} from 'react-icons/fa';

const appId = "1:147113503727:web:1d9d351c30399b2970241a"; // Hardcode appId

const EventDetailPage = () => {
  const { id } = useParams();
  const { currentUser, isAuthenticated } = useAuth();
  const { showNotification } = useNotification();

  const [event, setEvent] = useState(null);
  const [organizer, setOrganizer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSaved, setIsSaved] = useState(false);
  const [showRsvpModal, setShowRsvpModal] = useState(false);
  const [rsvpForm, setRsvpForm] = useState({ name: '', email: '', phone: '', address: '', company: '', jobTitle: '', dietary: '' });
  const [rsvpFormErrors, setRsvpFormErrors] = useState({});
  const [isSubmittingRsvp, setIsSubmittingRsvp] = useState(false);

  // Initialize timeLeft with a consistent empty object
  const [timeLeft, setTimeLeft] = useState({});

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
        setEvent(eventData);

        // Fetch organizer data
        if (eventData.organizerId) {
          const organizerProfileRef = doc(db, `artifacts/${appId}/users/${eventData.organizerId}/profiles`, eventData.organizerId);
          const organizerSnap = await getDoc(organizerProfileRef);
          if (organizerSnap.exists()) {
            setOrganizer(organizerSnap.data());
          }
        }

        // Check saved status
        if (isAuthenticated && currentUser) {
          const savedEventRef = doc(db, `artifacts/${appId}/users/${currentUser.uid}/favorites`, eventData.id);
          const savedSnap = await getDoc(savedEventRef);
          setIsSaved(savedSnap.exists());
        }

        // After fetching eventData, update timeLeft
        const initialTimeLeft = calculateTimeLeft(eventData.startDate ? new Date(eventData.startDate.toDate()) : null);
        setTimeLeft(initialTimeLeft || {});

      } catch (err) {
        console.error("Error fetching event details:", err);
        setError("Failed to load event details: " + err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchEventAndOrganizer();
  }, [id, isAuthenticated, currentUser]);

  // Handle save/unsave event
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

  // --- Ticket Quantity Control Logic (for sidebar) ---
  // This logic is now primarily within TicketPurchaseSection.jsx
  const handleQuantityChange = useCallback((ticketTypeId, delta) => {
    // This function can be passed down to TicketPurchaseSection if it needs to update parent state
    // For now, it's a placeholder.
    console.log(`Quantity change for ${ticketTypeId}: ${delta}`);
  }, []);


  // --- RSVP Modal Logic ---
  const handleRsvpSubmit = async (e) => {
    e.preventDefault();
    setIsSubmittingRsvp(true);
    setRsvpFormErrors({});

    const errors = {};
    if (!rsvpForm.name.trim()) errors.name = 'Name is required.';
    if (!rsvpForm.email.trim()) errors.email = 'Email is required.';
    else if (!/\S+@\S+\.\S+/.test(rsvpForm.email)) errors.email = 'Invalid email format.';

    if (event?.rsvpConfig?.requiredAttendeeInfo) {
      if (event.rsvpConfig.requiredAttendeeInfo.includes('phone') && !rsvpForm.phone.trim()) errors.phone = 'Phone number is required.';
      if (event.rsvpConfig.requiredAttendeeInfo.includes('address') && !rsvpForm.address.trim()) errors.address = 'Address is required.';
      if (event.rsvpConfig.requiredAttendeeInfo.includes('company') && !rsvpForm.company.trim()) errors.company = 'Company Name is required.';
      if (event.rsvpConfig.requiredAttendeeInfo.includes('jobTitle') && !rsvpForm.jobTitle.trim()) errors.jobTitle = 'Job Title is required.';
    }

    if (Object.keys(errors).length > 0) {
      setRsvpFormErrors(errors);
      setIsSubmittingRsvp(false);
      showNotification('Please fill in all required RSVP fields.', 'error');
      return;
    }

    try {
      const rsvpCollectionRef = collection(db, `artifacts/${appId}/public/data_for_app/rsvps`); // Corrected path
      await addDoc(rsvpCollectionRef, {
        eventId: event.id,
        eventName: event.eventName,
        userId: currentUser?.uid || 'unauthenticated',
        rsvpedAt: Timestamp.now(),
        status: 'confirmed',
        ...rsvpForm,
      });

      showNotification('RSVP submitted successfully!', 'success');
      setShowRsvpModal(false);
      setRsvpForm({ name: '', email: '', phone: '', address: '', company: '', jobTitle: '', dietary: '' });
    } catch (err) {
      console.error("Error submitting RSVP:", err);
      showNotification('Failed to submit RSVP. Please try again.', 'error');
    } finally {
      setIsSubmittingRsvp(false);
    }
  };


  // calculateTimeLeft now takes startDate as a parameter, making it a pure function
  const calculateTimeLeft = (targetDate) => {
    if (!targetDate) return null;
    const difference = +targetDate - +new Date();
    let timeLeft = {};

    if (difference > 0) {
      timeLeft = {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
      };
    }
    return timeLeft;
  };

  // useEffect for countdown now depends on event.startDate
  useEffect(() => {
    if (!event?.startDate) {
      setTimeLeft({});
      return;
    }

    const targetDate = new Date(event.startDate.toDate());

    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft(targetDate) || {});
    }, 1000);

    return () => clearInterval(timer);
  }, [event?.startDate]);


  const timerComponents = [];
  if (timeLeft && Object.keys(timeLeft).length > 0) {
    Object.keys(timeLeft).forEach((interval) => {
      if (timeLeft[interval] !== undefined) {
        timerComponents.push(
          <span key={interval} className={styles.countdownItem}>
            {timeLeft[interval]} {interval}{" "}
          </span>
        );
      }
    });
  }


  // Define derived data here, before the main return statement's JSX
  const startDate = event?.startDate ? new Date(event.startDate.toDate()) : null;
  const endDate = event?.endDate ? new Date(event.endDate.toDate()) : null;

  const displayDateFull = startDate
    ? `${startDate.toLocaleString('en-US', { weekday: 'long' })}, ${startDate.toLocaleString('en-US', { month: 'long' })} ${startDate.getDate()}, ${startDate.getFullYear()} | ${startDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
    : 'N/A';

  const displayEndDateFull = endDate && startDate?.toDateString() !== endDate.toDateString()
    ? ` - ${endDate.toLocaleDateString()} ${endDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
    : '';

  const displayLocation = event?.specificAddress || event?.mainLocation || 'N/A';

  let onlineEventTypeDisplay = '';
  if (event?.eventType === 'online') {
    if (event.onlineEventType && event.onlineEventType.trim() !== '') {
      onlineEventTypeDisplay = event.onlineEventType.split(/\s+/).slice(0, 15).join(' ');
      if (event.onlineEventType.split(/\s+/).length > 15) {
        onlineEventTypeDisplay += '...';
      }
    } else {
      onlineEventTypeDisplay = 'Online Event';
    }
  }

  // Determine if portrait layout is needed (simple aspect ratio check)
  const isPortrait = event?.bannerImageUrl && event.bannerImageUrl.includes('placehold.co') ?
    (parseInt(event.bannerImageUrl.split('x')[1]?.split('/')[0]) > parseInt(event.bannerImageUrl.split('x')[0]?.split('/')[0])) : false; // Placeholder specific logic
    // In a real app, you'd fetch image dimensions or rely on backend to provide aspect ratio


  return (
    <div className={styles.eventDetailPageContainer}>
      {/* Conditional rendering of content only when event is loaded */}
      {event && (
        <>
          {/* Event Hero Section */}
          <section className={`${styles.eventHeroSection} ${isPortrait ? styles.portraitLayout : ''}`}>
            <img src={event.bannerImageUrl || "https://placehold.co/1400x600/E0E0E0/808080?text=Event+Banner"} alt={event.eventName} className={styles.eventHeroImage} />
            <div className={styles.eventHeroOverlay}>
              <div className={styles.eventHeroContent}>
                <h1 className={styles.eventHeroTitle}>{event.eventName}</h1>
                <p className={styles.eventHeroMeta}><FaCalendarAlt /> {displayDateFull}{displayEndDateFull}</p>
                <p className={styles.eventHeroMeta}><FaMapMarkerAlt /> {displayLocation}</p>
                {event.eventType === 'online' && event.onlineEventUrl && (
                    <p className={styles.eventHeroMeta}><FaLink /> <a href={event.onlineEventUrl} target="_blank" rel="noopener noreferrer" className="text-link">Join Online Event</a></p>
                )}
                {/* NEW: Display all organizer-entered details */}
                {event.category && <p className={styles.eventHeroMeta}>Category: {event.category}</p>}
                {event.eventType && <p className={styles.eventHeroMeta}>Type: {event.eventType}</p>}
                {event.selectedAgeCategories && event.selectedAgeCategories.length > 0 && (
                    <p className={styles.eventHeroMeta}>Age: {event.selectedAgeCategories.join(', ')}</p>
                )}
                {event.contactEmail && <p className={styles.eventHeroMeta}>Contact: {event.contactEmail}</p>}
                {event.contactPhone && <p className={styles.eventHeroMeta}>Phone: {event.contactPhone}</p>}

                {/* NEW: Branded "Ticketed by Naks Yetu" logo */}
                {event.eventType === 'ticketed' && (
                    <div className={styles.naksYetuBranding}>
                        <img src="https://i.postimg.cc/j5mxTwKr/naks-yetu-final-logo-CIRCLE-01.png" alt="Naks Yetu Logo" />
                        <span>Ticketed by Naks Yetu</span>
                    </div>
                )}

                {/* NEW: Coupon Availability Message */}
                {event.hasCoupons && ( // Assuming a boolean field 'hasCoupons'
                    <p className={styles.couponMessage}><FaTag /> Coupons are available for this event!</p>
                )}

                {event.eventType === 'ticketed' && (
                  <button className={`btn btn-primary ${styles.heroActionBtn} glassmorphism-button`}>Get Tickets <FaTicketAlt /></button>
                )}
                {event.eventType === 'rsvp' && (
                  <button onClick={() => setShowRsvpModal(true)} className={`btn btn-primary ${styles.heroActionBtn} glassmorphism-button`}>Register for Event <FaUsers /></button>
                )}
                {event.eventType === 'free' && (
                  <button className={`btn btn-primary ${styles.heroActionBtn} glassmorphism-button`}>Attend for Free <FaCheckCircle /></button>
                )}
              </div>
            </div>
            {/* Countdown on the right of the poster */}
            {startDate && startDate > new Date() && (
                <div className={styles.countdownContainer}>
                    {timerComponents.length ? timerComponents : <span className={styles.countdownEnded}>Event Started!</span>}
                </div>
            )}
          </section>

          {/* Main Content Area */}
          <div className={styles.mainWrapper}>
            {/* Event Main Info Column */}
            <main className={styles.eventMainInfoColumn}>
              {/* About Event Section */}
              <section className={styles.sectionContent}>
                <h2 className={`${styles.sectionTitle} ${styles.gradientText}`}>About This Event</h2>
                <div className={styles.textContent}>
                  <p>{event.description}</p>
                </div>
              </section>

              {/* Event Gallery Section */}
              {event.galleryImages && event.galleryImages.length > 0 && (
                <GallerySection galleryImages={event.galleryImages} eventName={event.eventName} loading={false} />
              )}

              {/* Organizer Branding Section */}
              {organizer && (
                <section className={styles.sectionContent}>
                  <h2 className={`${styles.sectionTitle} ${styles.gradientText}`}>About The Organizer</h2>
                  <div className={styles.organizerInfo}>
                    <img src={organizer.avatarUrl || "https://placehold.co/80x80/E0E0E0/808080?text=Org"} alt={organizer.displayName} className={styles.organizerLogo} />
                    <div className={styles.organizerDetails}>
                      <h3 className={styles.organizerName}>{organizer.displayName || organizer.email}</h3>
                      <p className={organizer.organizerBio || 'No bio available.'}></p> {/* Use organizer.organizerBio */}
                      <div className={styles.organizerSocialLinks}>
                        {organizer.instagram && <a href={organizer.instagram} target="_blank" rel="noopener noreferrer" className={styles.organizerSocialLink}><FaInstagram /></a>}
                        {organizer.twitter && <a href={organizer.twitter} target="_blank" rel="noopener noreferrer" className={styles.organizerSocialLink}><FaTwitter /></a>}
                        {organizer.contactPhone && <a href={`tel:${organizer.contactPhone}`} className={styles.organizerSocialLink}><FaPhone /></a>}
                        {organizer.contactEmail && <a href={`mailto:${organizer.contactEmail}`} className={styles.organizerSocialLink}><FaEnvelope /></a>}
                      </div>
                      <Link to={`/events/organizer/${organizer.id}`} className={`btn btn-secondary ${styles.viewOtherEventsBtn}`}>View Other Events by This Organizer</Link>
                    </div>
                  </div>
                </section>
              )}

              {/* Refund Policy Section */}
              {(event.refundPolicyType || event.customRefundPolicy || event.disclaimer) && ( // Check customRefundPolicy too
                <section className={styles.sectionContent}>
                    <h2 className={`${styles.sectionTitle} ${styles.gradientText}`}>Refund Policy & Disclaimers</h2>
                    <div className={styles.textContent}>
                        {event.refundPolicyType === 'naksyetu' && (
                            <p>This event adheres to the <Link to="/refund-policy" className="text-link">Naks Yetu Standard Refund Policy</Link>.</p>
                        )}
                        {event.refundPolicyType === 'custom' && (
                            <p>{event.customRefundPolicy || 'No custom refund policy provided.'}</p>
                        )}
                        {event.disclaimer && (
                            <>
                                <h4 style={{marginTop: '15px', marginBottom: '5px', color: 'var(--naks-text-primary)'}}>Disclaimer:</h4>
                                <p>{event.disclaimer}</p>
                            </>
                        )}
                    </div>
                </section>
              )}

              {/* NEW: Sponsors Section */}
              {event.sponsors && event.sponsors.length > 0 && (
                  <section className={`${styles.sectionContent} ${styles.sponsorsSection}`}>
                      <h2 className={`${styles.sectionTitle} ${styles.gradientText}`}>Event Sponsors</h2>
                      <div className={styles.sponsorsGrid}>
                          {event.sponsors.map((sponsor, index) => (
                              <div key={index} className={styles.sponsorLogoContainer}>
                                  <img src={sponsor.logoUrl} alt={sponsor.name} className={styles.sponsorLogo} />
                                  <span className={styles.sponsorNameTooltip}>{sponsor.name}</span>
                              </div>
                          ))}
                      </div>
                  </section>
              )}
            </main>

            {/* Sidebar for Tickets & Actions */}
            {event.eventType === 'ticketed' && event.ticketTypes && event.ticketTypes.length > 0 && (
                <TicketPurchaseSection event={event} />
            )}
            {event.eventType === 'rsvp' && (
                <RsvpFormSection event={event} />
            )}
            {event.eventType === 'online' && (
                <OnlineEventInfo event={event} />
            )}
            {event.eventType === 'free' && (
                <FreeEventInfo event={event} />
            )}
            {event.isNightlife && ( // Render nightlife specifics if it's a nightlife event
                <NightlifeSpecifics event={event} />
            )}
          </div>

          {/* RSVP Modal (controlled by RsvpFormSection) */}
          <Modal isOpen={showRsvpModal} onClose={() => setShowRsvpModal(false)} title={`RSVP for ${event.eventName}`}>
            <form onSubmit={handleRsvpSubmit} style={{display: 'flex', flexDirection: 'column', gap: '15px', padding: '20px'}}>
              <div className="form-group">
                <label htmlFor="rsvpName" className="form-label">Full Name <span style={{color: 'red'}}>*</span></label>
                <input type="text" id="rsvpName" name="name" className="input-field" value={rsvpForm.name} onChange={(e) => setRsvpForm({ ...rsvpForm, name: e.target.value })} disabled={isSubmittingRsvp} required />
                {rsvpFormErrors.name && <p className="error-message-box">{rsvpFormErrors.name}</p>}
              </div>
              <div className="form-group">
                <label htmlFor="rsvpEmail" className="form-label">Email <span style={{color: 'red'}}>*</span></label>
                <input type="email" id="rsvpEmail" name="email" className="input-field" value={rsvpForm.email} onChange={(e) => setRsvpForm({ ...rsvpForm, email: e.target.value })} disabled={isSubmittingRsvp} required />
                {rsvpFormErrors.email && <p className="error-message-box">{rsvpFormErrors.email}</p>}
              </div>

              {event?.rsvpConfig?.requiredAttendeeInfo?.includes('phone') && (
                <div className="form-group">
                  <label htmlFor="rsvpPhone" className="form-label">Phone Number <span style={{color: 'red'}}>*</span></label>
                  <input type="tel" id="rsvpPhone" name="phone" className="input-field" value={rsvpForm.phone} onChange={(e) => setRsvpForm({ ...rsvpForm, phone: e.target.value })} disabled={isSubmittingRsvp} required />
                  {rsvpFormErrors.phone && <p className="error-message-box">{rsvpFormErrors.phone}</p>}
                </div>
              )}
              {event?.rsvpConfig?.requiredAttendeeInfo?.includes('address') && (
                <div className="form-group">
                  <label htmlFor="rsvpAddress" className="form-label">Address <span style={{color: 'red'}}>*</span></label>
                  <input type="text" id="rsvpAddress" name="address" className="input-field" value={rsvpForm.address} onChange={(e) => setRsvpForm({ ...rsvpForm, address: e.target.value })} disabled={isSubmittingRsvp} required />
                  {rsvpFormErrors.address && <p className="error-message-box">{rsvpFormErrors.address}</p>}
                </div>
              )}
              {event?.rsvpConfig?.requiredAttendeeInfo?.includes('company') && (
                <div className="form-group">
                  <label htmlFor="rsvpCompany" className="form-label">Company Name <span style={{color: 'red'}}>*</span></label>
                  <input type="text" id="rsvpCompany" name="company" className="input-field" value={rsvpForm.company} onChange={(e) => setRsvpForm({ ...rsvpForm, company: e.target.value })} disabled={isSubmittingRsvp} required />
                  {rsvpFormErrors.company && <p className="error-message-box">{rsvpFormErrors.company}</p>}
                </div>
              )}
              {event?.rsvpConfig?.requiredAttendeeInfo?.includes('jobTitle') && (
                <div className="form-group">
                  <label htmlFor="rsvpJobTitle" className="form-label">Job Title <span style={{color: 'red'}}>*</span></label>
                  <input type="text" id="rsvpJobTitle" name="jobTitle" className="input-field" value={rsvpForm.jobTitle} onChange={(e) => setRsvpForm({ ...rsvpForm, jobTitle: e.target.value })} disabled={isSubmittingRsvp} required />
                  {rsvpFormErrors.jobTitle && <p className="error-message-box">{rsvpFormErrors.jobTitle}</p>}
                </div>
              )}
              {event?.rsvpConfig?.requiredAttendeeInfo?.includes('dietary') && (
                <div className="form-group">
                  <label htmlFor="rsvpDietary" className="form-label">Dietary Restrictions <span className="optional-label">(Optional)</span></label>
                  <input type="text" id="rsvpDietary" name="dietary" className="input-field" value={rsvpForm.dietary} onChange={(e) => setRsvpForm({ ...rsvpForm, dietary: e.target.value })} disabled={isSubmittingRsvp} />
                </div>
              )}

              <div style={{display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px'}}>
                <button type="button" onClick={() => setShowRsvpModal(false)} className="btn btn-secondary" disabled={isSubmittingRsvp}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={isSubmittingRsvp}>
                  {isSubmittingRsvp ? <FaSpinner className="spinner" /> : 'Submit RSVP'}
                </button>
              </div>
            </form>
          </Modal>
        </>
      )}
    </div>
  );
};

export default EventDetailPage;