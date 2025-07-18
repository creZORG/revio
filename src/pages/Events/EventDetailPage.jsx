

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { db } from '../../utils/firebaseConfig.js';
import { doc, getDoc, setDoc, deleteDoc, updateDoc, collection, addDoc, Timestamp } from 'firebase/firestore';
import { useAuth } from '../../hooks/useAuth.js';
import { useNotification } from '../../contexts/NotificationContext.jsx';
import Modal from '../../components/Common/Modal.jsx';
import LoadingSkeleton from '../../components/Common/LoadingSkeleton.jsx';
import Button from '../../components/Common/Button.jsx';
import styles from './EventDetailPage.module.css'; // Main styling for EventDetailPage

import EventHeroSection from './EventDetailPage/EventHeroSection.jsx';
import TicketPurchaseSection from '../../components/Events/Details/TicketPurchaseSection.jsx'; 
import AboutSection from '../../components/Events/Details/AboutSection.jsx'; 
import GallerySection from '../../components/Events/Details/GallerySection.jsx'; 
import OrganizerSection from '../../components/Events/Details/OrganizerSection.jsx'; 
import TermsSection from '../../components/Events/Details/TermsSection.jsx'; 

// Import icons for general use and modals
import {
  FaCalendarAlt, FaMapMarkerAlt, FaTicketAlt, FaEnvelope, FaFacebookF, FaTwitter, FaWhatsapp, FaInstagram,
  FaHeart, FaRegHeart, FaLaptopCode, FaDollarSign, FaUsers, FaClock, FaPhone, FaLink, FaStar, FaGamepad,
  FaMinus, FaPlus, FaCheckCircle, FaSpinner, FaTag, FaInfoCircle, FaShareAlt,FaImage ,FaUserCircle,FaFileContract 
} from 'react-icons/fa';
import { format } from 'date-fns'; 

import { useCart } from '../../contexts/CartContext.jsx'; 

const appId = "1:147113503727:web:1d9d351c30399b2970241a"; 

// Universal Date Conversion Helper (for Firestore Timestamps)
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
  };

const EventDetailPage = () => {
    const { id } = useParams(); 
    const navigate = useNavigate();
    const { showNotification } = useNotification();
    const { cartItems, updateCartItemQuantity } = useCart(); 

    const { currentUser, isAuthenticated } = useAuth(); 

    const [event, setEvent] = useState(null);
    const [organizer, setOrganizer] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isSaved, setIsSaved] = useState(false);
    
    const [isMobileView, setIsMobileView] = useState(window.innerWidth <= 1024); 
    
    const [activeTab, setActiveTab] = useState('tickets'); 

    const tabs = [
        { id: 'tickets', label: 'Tickets', icon: FaTicketAlt, component: TicketPurchaseSection },
        { id: 'about', label: 'About', icon: FaInfoCircle, component: AboutSection },
        { id: 'gallery', label: 'Gallery', icon: FaImage, component: GallerySection },
        { id: 'organizer', label: 'Organizer', icon: FaUserCircle, component: OrganizerSection }, 
        { id: 'terms', label: 'Terms & Policies', icon: FaFileContract, component: TermsSection }, 
    ];


    const [showShareModal, setShowShareModal] = useState(false);
    const [showMpesaModal, setShowMpesaModal] = useState(false); 
    const [mpesaPhoneNumber, setMpesaPhoneNumber] = useState('');
    const [mpesaAmount, setMpesaAmount] = useState(0);
    const [isProcessingMpesa, setIsProcessingMpesa] = useState(false);
    const [mpesaError, setMpesaError] = useState('');
    const [showContactOrganizerModal, setShowContactOrganizerModal] = useState(false);


    useEffect(() => {
        const handleResize = () => {
            setIsMobileView(window.innerWidth <= 1024);
        };
        window.addEventListener('resize', handleResize);
        handleResize(); 
        return () => window.removeEventListener('resize', handleResize);
    }, []);


    useEffect(() => {
        const fetchEvent = async () => {
            setLoading(true);
            setError(null);

            if (!id || typeof id !== 'string') {
                console.error("EventDetailPage: Invalid eventId received:", id);
                setError("Invalid event ID. Please go back to events.");
                showNotification('Invalid event ID.', 'error');
                setLoading(false);
                return; 
            }

            try {
                const eventDocRef = doc(db, `artifacts/${appId}/public/data_for_app/events`, id);
                const docSnap = await getDoc(eventDocRef);

                if (!docSnap.exists()) {
                    setError("Event not found.");
                    showNotification('Event not found.', 'error');
                    navigate('/events'); 
                    return;
                }

                const rawEventData = docSnap.data();
                const eventData = {
                    id: docSnap.id,
                    eventName: rawEventData.eventName || 'N/A',
                    eventDescription: rawEventData.description || '', 
                    bannerImageUrl: rawEventData.bannerImageUrl || '',
                    galleryImages: rawEventData.galleryImageUrls || [], 
                    eventCategory: rawEventData.category || 'N/A', 
                    eventTags: rawEventData.tags || [], 
                    ageCategories: rawEventData.targetAge ? [rawEventData.targetAge] : ['all_ages'], 
                    
                    startDate: toJSDate(rawEventData.startDate),
                    startTime: rawEventData.startTime || 'N/A',
                    endDate: toJSDate(rawEventData.endDate),
                    endTime: rawEventData.endTime || 'N/A',
                    venueName: rawEventData.mainLocation || 'N/A', 
                    venueAddress: rawEventData.specificAddress || 'N/A', 
                    nakuruSubCounty: rawEventData.nakuruSubCounty || 'N/A', 
                    
                    eventType: rawEventData.eventType || 'general', 
                    isTicketed: rawEventData.isTicketed ?? false, 
                    isOnlineEvent: rawEventData.isOnline ?? false,
                    isRsvp: rawEventData.isRsvp ?? false,
                    isFreeEvent: rawEventData.isFree ?? false,
                    hasCoupons: rawEventData.hasCoupons ?? false,
                    isNightlife: rawEventData.isNightlife ?? false,
                    onlineLink: rawEventData.onlineEventUrl || null, 
                    onlineEventType: rawEventData.onlineEventType || null,
                    donationOption: rawEventData.donationOption ?? false,

                    organizerId: rawEventData.organizerId || null,
                    organizerDisplayName: rawEventData.organizerDisplayName || 'N/A', 
                    organizerEmail: rawEventData.contactEmail || 'N/A', 
                    organizerContactPhone: rawEventData.contactPhone || 'N/A', 
                    
                    ticketDetails: rawEventData.ticketDetails?.map(ticket => ({
                        ...ticket,
                        salesStartDate: toJSDate(ticket.salesStartDate),
                        salesEndDate: toJSDate(ticket.salesEndDate),
                    })) || [],
                    rsvpConfig: rawEventData.rsvpConfig ? {
                        ...rawEventData.rsvpConfig,
                        rsvpStartDate: toJSDate(rawEventData.rsvpConfig.rsvpStartDate),
                        rsvpEndDate: toJSDate(rawEventData.rsvpConfig.rsvpEndDate),
                    } : null,
                    donationOption: rawEventData.donationOption ?? false,

                    sponsors: rawEventData.sponsors || [], 
                    status: rawEventData.status || 'draft',
                    pageViews: rawEventData.pageViews || 0,
                    adminPriority: rawEventData.adminPriority || 5,
                    createdAt: toJSDate(rawEventData.createdAt),
                    updatedAt: toJSDate(rawEventData.updatedAt),
                    refundPolicyType: rawEventData.refundPolicy || 'naksyetu', 
                    customRefundPolicy: rawEventData.customRefundPolicyText || '', 
                    disclaimer: rawEventData.disclaimer || '', 
                };
                
                setEvent(eventData);

                if (eventData.organizerId && typeof eventData.organizerId === 'string') {
                    const organizerProfileRef = doc(db, `artifacts/${appId}/users/${eventData.organizerId}/profiles`, eventData.organizerId);
                    const organizerSnap = await getDoc(organizerProfileRef);
                    if (organizerSnap.exists()) {
                        setOrganizer(organizerSnap.data());
                    } else {
                        console.warn(`Organizer profile not found for ID: ${eventData.organizerId}`);
                        setOrganizer(null); 
                    }
                } else {
                    console.warn("Event data is missing or has an invalid organizerId.");
                    setOrganizer(null); 
                }

                if (isAuthenticated && currentUser?.uid && eventData.id) {
                    const savedEventRef = doc(db, `artifacts/${appId}/users/${currentUser.uid}/favorites`, eventData.id);
                    const savedSnap = await getDoc(savedEventRef);
                    setIsSaved(savedSnap.exists());
                } else if (!isAuthenticated) {
                    setIsSaved(false); 
                }

            } catch (err) {
                console.error("Error fetching event details:", err);
                setError("Failed to load event details: " + err.message);
                showNotification('Failed to load event details. Please try again.', 'error');
            } finally {
                setLoading(false);
            }
        };

        fetchEvent();
    }, [id, navigate, showNotification, isAuthenticated, currentUser]); 


    // Calculate total tickets and price specifically for the current event's tickets in the cart
    const { totalSelectedTicketsForCurrentEvent, totalPriceForCurrentEvent } = useCallback(() => {
        let count = 0;
        let price = 0;
        if (event && event.id && event.ticketDetails && cartItems) { // Ensure cartItems is not null
            Object.keys(cartItems).forEach(ticketId => {
                const ticket = event.ticketDetails.find(t => t.id === ticketId);
                const qty = cartItems[ticketId]; // Quantity from the cart
                if (ticket && qty > 0) { // Ensure ticket exists and quantity is positive
                    count += qty;
                    const rawPrice = ticket?.price;
                    const numericPrice = typeof rawPrice === 'object' && rawPrice !== null ? Object.values(rawPrice)[0] || 0 : rawPrice || 0;
                    const finalPrice = typeof numericPrice === 'number' ? numericPrice : 0;
                    price += qty * finalPrice;
                }
            });
        }
        return { totalSelectedTicketsForCurrentEvent: count, totalPriceForCurrentEvent: price };
    }, [cartItems, event])(); // Recalculate when cartItems or event change


    const handleProceedToCheckout = useCallback(() => {
        if (totalSelectedTicketsForCurrentEvent === 0) { 
            showNotification('Please select at least one ticket to proceed.', 'error');
            return;
        }
        navigate('/checkout', { state: { eventId: event.id, selectedTickets: cartItems } });
    }, [totalSelectedTicketsForCurrentEvent, event, cartItems, navigate, showNotification]);

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

    const handleShareEvent = useCallback(() => {
        showNotification('Sharing event! (Mock)', 'info');
        setShowShareModal(true); 
    }, [showNotification]);

    const handleAddToCalendar = useCallback(() => {
        showNotification('Event added to calendar! (Mock)', 'info');
    }, [showNotification]);

    const handleContactOrganizer = useCallback(() => {
        showNotification('Opening contact form for organizer... (Mock)', 'info');
        setShowContactOrganizerModal(true); 
    }, [showNotification]);

    const handleTicketsClick = useCallback(() => {
        setActiveTab('tickets'); 
        const tabsSection = document.getElementById('tab-nav-container');
        if (tabsSection) {
            tabsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }, []);

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
                ticketIds: [], 
            });

            showNotification(`Confirmation email sent to ${currentUser?.email || 'your registered email'}!`, 'success');

            setShowMpesaModal(false);
            setMpesaPhoneNumber('');
            setMpesaAmount(0);
            showNotification('Purchase simulation complete. Check your dashboard for updates.', 'success');

        } catch (err) {
            console.error("M-Pesa payment error:", err);
            setMpesaError('Payment failed. Please try again.');
            showNotification('M-Pesa payment failed. ' + err.message, 'error');
        } finally {
            setIsProcessingMpesa(false);
        }
    };


    if (loading) {
        return (
            <div className={styles.eventDetailPageContainer}>
                <LoadingSkeleton width="100%" height="400px" className={styles.eventHeroSection} />
                <LoadingSkeleton width="100%" height="50px" style={{ marginBottom: '20px' }} />
                <div className={styles.mainWrapper}>
                    <LoadingSkeleton width="100%" height="200px" className={styles.sectionContent} style={{marginBottom: '20px'}} />
                    <LoadingSkeleton width="100%" height="150px" className={styles.sectionContent} style={{marginBottom: '20px'}} />
                    <LoadingSkeleton width="100%" height="180px" className={styles.sectionContent} />
                </div>
            </div>
        );
    }

    if (error || !event) {
        return (
            <div className={`${styles.eventDetailPageContainer} ${styles.errorMessageBox}`} style={{textAlign: 'center', padding: '50px'}}>
                <p>{error || 'Event data is missing or not found.'}</p>
                <Button onClick={() => navigate('/events')} className={`${styles.btn} ${styles.btnPrimary}`} style={{ marginTop: '20px' }}>Go Back to Events</Button>
            </div>
        );
    }

    const ActiveTabComponent = tabs.find(tab => tab.id === activeTab)?.component;


    return (
        <div className={styles.eventDetailPageContainer}>
            {/* Hero Section (Image Only) */}
            <EventHeroSection 
                event={event}
                organizer={organizer} 
                onSaveEvent={handleSaveToggle}
                onShareEvent={handleShareEvent}
                onAddToCalendar={handleAddToCalendar}
                onTicketsClick={handleTicketsClick} 
                isSaved={isSaved} 
            />

            {/* NEW: Event Summary Card - This holds text & icons that are below hero image */}
            <div className={styles.eventSummaryCard}>
                <h1 className={styles.eventSummaryTitle}>{event.eventName}</h1>
                <p className={styles.eventSummaryMeta}>
                    <FaMapMarkerAlt /> <span>{event.venueName || event.onlineLink || 'N/A'}</span>
                </p>
                <p className={styles.eventSummaryMeta}>
                    <FaCalendarAlt /> <span>{event.startDate instanceof Date ? format(event.startDate, 'MMM d, yyyy') : 'N/A'}</span>
                </p>
                <p className={styles.eventSummaryMeta}>
                    <FaClock /> <span>{`${event.startTime || 'N/A'} ${event.endTime ? '- ' + event.endTime : ''}`}</span> 
                </p>
                {event.hasCoupons && (
                    <p className={styles.couponMessage}><FaTag /> Coupons are available for this event! <FaInfoCircle title="Look for codes from our influencers to get discounts!" /></p>
                )}


                {/* Share Icons & Save/Calendar (Below Event Summary Card) */}
                <div className={styles.shareIconsBelowHero}>
                    <button onClick={handleShareEvent} className={styles.shareSmallButton}>
                        <FaShareAlt /> Share
                    </button>
                    <button onClick={handleSaveToggle} className={`${styles.shareSmallButton} ${isSaved ? styles.saved : ''}`}>
                        <FaHeart /> Save
                    </button>
                    <button onClick={handleAddToCalendar} className={styles.shareSmallButton}>
                        <FaCalendarAlt /> Calendar
                    </button>
                </div>
            </div>


            {/* Tab Navigation Container */}
            <div id="tab-nav-container" className={styles.tabNavContainer}>
                <div className={styles.tabNav}>
                    {tabs.map(tab => (
                        <button 
                            key={tab.id}
                            className={`${styles.tabNavItem} ${activeTab === tab.id ? styles.activeTab : ''}`}
                            onClick={() => setActiveTab(tab.id)}
                        >
                            {/* Render Tab Icon */}
                            {tab.icon && <tab.icon className={styles.tabIcon} />}
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Main Content Area: Tab Content & Sidebar (PC Layout) */}
            <div className={`${styles.mainWrapper} ${styles.pcLayout}`}>
                <main className={styles.mainContentColumn}>
                    {ActiveTabComponent && (
                        <ActiveTabComponent 
                            event={event} 
                            organizer={organizer} 
                            cartItems={cartItems}
                            totalTicketsCount={totalSelectedTicketsForCurrentEvent} // Pass only current event's total
                            updateCartItemQuantity={updateCartItemQuantity}
                            onProceedToCheckout={handleProceedToCheckout} 
                            onContactOrganizer={handleContactOrganizer}
                            galleryImages={event.galleryImages} 
                            eventName={event.eventName} 
                            setShowMpesaModal={setShowMpesaModal}
                            setMpesaAmount={setMpesaAmount}
                            setMpesaPhoneNumber={setMpesaPhoneNumber}
                        />
                    )}
                </main>

                {/* Sidebar Actions (Tickets Summary & Checkout Button) - Always visible on PC for 'tickets' tab */}
                {activeTab === 'tickets' && event.isTicketed && (
                    <aside className={`${styles.sidebarColumn} glassmorphism`}>
                        <h3 className={styles.sidebarHeading}>Your Tickets</h3>
                        <div className={styles.ticketSummaryDetails}>
                            <div className={styles.ticketSummaryItem}>
                                <span>Total Selected:</span>
                                <span>{totalSelectedTicketsForCurrentEvent} Tickets</span> {/* Use current event's total */}
                            </div>
                            <div className={styles.ticketSummaryItem}>
                                <span>Total Price:</span>
                                <span>KES {totalPriceForCurrentEvent.toFixed(2)}</span> {/* Use current event's total price */}
                            </div>
                        </div>
                        <Button onClick={handleProceedToCheckout} className={`${styles.checkoutButton} ${styles.btnPrimary}`} disabled={totalSelectedTicketsForCurrentEvent === 0}>
                            Proceed to Checkout
                        </Button>
                    </aside>
                )}
            </div>

            {/* Mobile Fixed Action Button (appears only on mobile, for specific event types) */}
            {window.innerWidth <= 1024 && (event.isTicketed || event.isRsvp || event.isFreeEvent || event.isOnlineEvent) && (
                <div className={styles.mobileFixedActionButtonContainer}>
                    {event.isTicketed && (
                        <Button onClick={handleProceedToCheckout} className={`${styles.mobileFixedActionButton} ${styles.btnPrimary}`} disabled={totalSelectedTicketsForCurrentEvent === 0}>
                            Get Tickets ({totalSelectedTicketsForCurrentEvent})
                        </Button>
                    )}
                    {event.isRsvp && (
                        <Button onClick={() => showNotification('RSVP (Coming Soon)', 'info')} className={`${styles.mobileFixedActionButton} ${styles.btnPrimary}`}>
                            Register for Event
                        </Button>
                    )}
                    {event.isFreeEvent && (
                        <Button onClick={() => showNotification('Attend for Free (Coming Soon)', 'info')} className={`${styles.mobileFixedActionButton} ${styles.btnPrimary}`}>
                            Attend for Free
                        </Button>
                    )}
                    {event.isOnlineEvent && event.onlineLink && (
                        <Button onClick={() => window.open(event.onlineLink, '_blank')} className={`${styles.mobileFixedActionButton} ${styles.btnPrimary}`}>
                            Join Online Event
                        </Button>
                    )}
                </div>
            )}

            {/* Modals (Share, M-Pesa Payment, Contact Organizer) */}
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

            {/* M-Pesa Payment Modal (used by TicketPurchaseSection's onProceedToCheckout) */}
            <Modal isOpen={showMpesaModal} onClose={() => setShowMpesaModal(false)} title="Complete Your Payment">
                {/* Simplified content for Mpesa modal - assuming it will integrate payment later */}
                <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    <p style={{color: 'var(--naks-text-secondary)', textAlign: 'center'}}>
                        M-Pesa payment for KES {mpesaAmount.toFixed(2)} for {event.eventName}.
                    </p>
                    <p style={{color: 'var(--naks-text-secondary)', textAlign: 'center'}}>
                        Instructions will be here.
                    </p>
                    <Button onClick={() => setShowMpesaModal(false)} className={`${styles.btn} ${styles.btnPrimary}`}>Close</Button>
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
                        <Button onClick={() => setShowContactOrganizerModal(false)} className={`${styles.btn} ${styles.btnPrimary}`} style={{marginTop: '20px'}}>Close</Button>
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