import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { db } from '../utils/firebaseConfig.js';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import EventCard from '../components/Events/EventCard.jsx';
import LoadingSkeleton from '../components/Common/LoadingSkeleton.jsx';

import styles from './NightlifePage.module.css'; // Nightlife specific styles
import eventCardStyles from '../components/Events/Events.module.css'; // Re-use EventCard styles

import {
  FaChevronLeft, FaChevronRight, FaArrowRight, FaFilter, FaChevronUp, FaChevronDown,
  FaMusic, FaUsers, FaGlassMartiniAlt, FaGripHorizontal,
  FaMapMarkerAlt, FaClock, FaSearch, FaBeer, FaCocktail, FaCalendarWeek, FaAngleDoubleRight, FaCalendar, FaPlus, FaUserFriends, FaUserAlt,
  FaMicrophoneAlt, FaCompactDisc, FaTree, FaHome, FaGuitar, FaMask, FaMoon, FaDollarSign // Added FaDollarSign for paid filter
} from 'react-icons/fa'; // Ensure all icons are imported

const appId = "1:147113503727:web:1d9d351c30399b2970241a"; // Hardcoded appId

const NightlifePage = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filter States
  const [activeCategory, setActiveCategory] = useState('all');
  const [activeTime, setActiveTime] = useState('all');
  const [activeAge, setActiveAge] = useState('18plus');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');
  const [entryTypeFilter, setEntryTypeFilter] = useState('all'); // NEW: 'all', 'free', 'paid'

  // Sidebar Filter State (copied from HomePage for consistency)
  const sidebarRef = useRef(null);
  const sidebarToggleBtnRef = useRef(null);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // Hero Carousel (from mockup, but simplified as static for now)
  const heroCarouselImages = [
    { id: 1, src: "https://placehold.co/1200x450/E6336B/FFFFFF?text=Nightlife+Poster+1", alt: "Nightlife Poster 1" },
    { id: 2, src: "https://placehold.co/1200x450/FF4500/FFFFFF?text=Nightlife+Poster+2", alt: "Nightlife Poster 2" },
    { id: 3, src: "https://placehold.co/1200x450/2196F3/FFFFFF?text=Nightlife+Poster+3", alt: "Nightlife Poster 3" },
  ];
  const [currentHeroIndex, setCurrentHeroIndex] = useState(0);
  const heroIntervalRef = useRef(null);

  // --- Hero Carousel Logic (Adapted from HomePage) ---
  const updateHeroCarousel = useCallback(() => {
    // This part is simplified as the mockup doesn't show arrows/dots for this hero specifically
    // If it were a carousel, you'd implement similar logic as HomePage's carousel
  }, []);

  const resetHeroAutoSlide = useCallback(() => {
    clearInterval(heroIntervalRef.current);
    heroIntervalRef.current = setInterval(() => {
      setCurrentHeroIndex(prevIndex => (prevIndex + 1) % heroCarouselImages.length);
    }, 7000); // Slower slide for hero
  }, [heroCarouselImages.length]);

  useEffect(() => {
    if (heroCarouselImages.length > 0) {
      resetHeroAutoSlide();
    }
    return () => clearInterval(heroIntervalRef.current);
  }, [heroCarouselImages, resetHeroAutoSlide]);

  // --- Sidebar Filter Toggle Logic (Copied from HomePage) ---
  const setSidebarInitialState = useCallback(() => {
    if (window.innerWidth <= 767) {
      setIsSidebarCollapsed(true);
    } else {
      setIsSidebarCollapsed(false);
    }
  }, []);

  useEffect(() => {
    setSidebarInitialState();
    window.addEventListener('resize', setSidebarInitialState);
    return () => window.removeEventListener('resize', setSidebarInitialState);
  }, [setSidebarInitialState]);

  const toggleSidebar = () => {
    setIsSidebarCollapsed(prev => !prev);
  };


  // --- Nightlife Specific Filter Options (from index.html mockup) ---
  const nightlifeCategories = [
    { id: 'all', label: 'All Nightlife', icon: FaGripHorizontal },
    { id: 'karaoke', label: 'Karaoke', icon: FaMicrophoneAlt },
    { id: 'dj', label: 'DJ', icon: FaCompactDisc },
    { id: 'park-and-chill', label: 'Park and Chill', icon: FaTree },
    { id: 'houseparty', label: 'House Party', icon: FaHome },
    { id: 'live-bands', label: 'Live Bands', icon: FaGuitar },
    { id: 'themed-party', label: 'Themed Party', icon: FaMask },
  ];
  const nightlifeTimeFilters = [
    { id: 'all', label: 'All Time', icon: FaClock, abbr: 'ALL' },
    { id: 'tonight', label: 'Tonight', icon: FaMoon, abbr: 'TON' },
    { id: 'this-weekend', label: 'This Weekend', icon: FaCalendarWeek, abbr: 'WKND' },
    { id: 'next-week', label: 'Next Week', icon: FaAngleDoubleRight, abbr: 'NXTW' },
    { id: 'this-month', label: 'This Month', icon: FaCalendar, abbr: 'MON' },
    { id: 'next-month', label: 'Next Month', icon: FaPlus, abbr: 'NXTM' },
  ];
  const nightlifeAgeFilters = [
    { id: '18plus', label: '18+', icon: FaBeer },
    { id: '21plus', label: '21+', icon: FaCocktail },
    { id: '35plus', label: '35+', icon: FaUserAlt }
  ];
  const locationOptions = [ // Reused from HomePage for consistency
    { value: '', label: 'All Nakuru Sub-Counties' }, { value: 'bahati', label: 'Bahati' },
    { value: 'gilgil', label: 'Gilgil' }, { value: 'kuresoi-north', label: 'Kuresoi North' },
    { value: 'kuresoi-south', label: 'Kuresoi South' }, { value: 'molo', label: 'Molo' },
    { value: 'naivasha', label: 'Naivasha' }, { value: 'nakuru-east', label: 'Nakuru East' },
    { value: 'nakuru-west', label: 'Nakuru West' }, { value: 'njoro', label: 'Njoro' },
    { value: 'rongai', label: 'Rongai' }, { value: 'subukia', label: 'Subukia' }
  ];


  useEffect(() => {
    const fetchNightlifeEvents = async () => {
      setLoading(true);
      setError(null);
      try {
        let eventsRef = collection(db, `artifacts/${appId}/public/data_for_app/events`);
        // Query only for events with category "Nightlife"
        let q = query(eventsRef, where("category", "==", "Nightlife"), orderBy("startDate", "asc"));

        const snapshot = await getDocs(q);
        let fetchedEvents = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        // Apply filters (client-side for now)
        let filteredEvents = fetchedEvents;

        if (activeCategory && activeCategory !== 'all') {
          filteredEvents = filteredEvents.filter(event => event.category === activeCategory);
        }
        if (selectedLocation) {
          filteredEvents = filteredEvents.filter(event => event.mainLocation === selectedLocation);
        }
        if (searchQuery) { // Apply search query from hero section
          filteredEvents = filteredEvents.filter(event =>
            event.eventName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            event.description.toLowerCase().includes(searchQuery.toLowerCase())
          );
        }
        if (activeAge && activeAge !== 'all') {
            filteredEvents = filteredEvents.filter(event =>
                event.selectedAgeCategories && event.selectedAgeCategories.includes(activeAge)
            );
        }
        // Time filters (tonight, this-weekend, etc. - need more robust date logic)
        const now = new Date();
        if (activeTime === 'tonight') {
            filteredEvents = filteredEvents.filter(event => {
                const eventDate = event.startDate ? event.startDate.toDate() : null;
                return eventDate && eventDate.getDate() === now.getDate() && eventDate.getMonth() === now.getMonth() && eventDate.getFullYear() === now.getFullYear();
            });
        }

        // NEW: Apply Entry Type Filter (Free/Paid)
        if (entryTypeFilter === 'free') {
            filteredEvents = filteredEvents.filter(event => event.isFreeEvent);
        } else if (entryTypeFilter === 'paid') {
            filteredEvents = filteredEvents.filter(event => !event.isFreeEvent && event.price && event.price > 0);
        }


        // Apply randomization and priority
        filteredEvents.sort((a, b) => {
            const priorityA = a.adminPriority || 0;
            const priorityB = b.adminPriority || 0;
            if (priorityA !== priorityB) { return priorityB - priorityA; }
            return Math.random() - 0.5;
        });

        setEvents(filteredEvents);
      } catch (err) {
        console.error("Error fetching nightlife events:", err);
        setError("Failed to load nightlife events. Please try again.");
        setEvents([]);
      } finally {
        setLoading(false);
      }
    };

    fetchNightlifeEvents();
  }, [activeCategory, activeTime, activeAge, searchQuery, selectedLocation, entryTypeFilter]);


  if (loading) {
    return (
      <div className={styles.nightlifePageContainer}>
        <div className={eventCardStyles.eventCardsGrid}>
          {Array(4).fill(0).map((_, i) => (
            <div key={i} className={eventCardStyles.eventCard}>
              <LoadingSkeleton width="100%" height="200px" className="mb-2" />
              <div style={{padding: '12px'}}>
                <LoadingSkeleton width="80%" height="20px" className="mb-1" />
                <LoadingSkeleton width="60%" height="16px" className="mb-1" />
                <LoadingSkeleton width="90%" height="16px" className="mb-1" />
                <LoadingSkeleton width="50%" height="16px" className="mb-4" />
                <LoadingSkeleton width="100%" height="30px" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`${styles.nightlifePageContainer} error-message-box`}>
        <p>{error}</p>
      </div>
    );
  }

  const featuredNightlifeEvents = events.filter(e => e.isFeaturedNightlife);
  const upcomingNightlifeEvents = events.filter(e => !e.isFeaturedNightlife);


  return (
    <div className={styles.nightlifePageContainer}>
      {/* Nightlife Hero Section */}
      <section className={styles.nightlifeHeroSection}>
          <div className={styles.discoLights}>
              <div className={`${styles.lightBeam} ${styles.beam1}`}></div>
              <div className={`${styles.lightBeam} ${styles.beam2}`}></div>
              <div className={`${styles.lightBeam} ${styles.beam3}`}></div>
              <div className={`${styles.lightBeam} ${styles.beam4}`}></div>
          </div>
          <div className={`${styles.nightlifeHeroContent} glassmorphism`}>
              <h1 className={styles.nightlifeHeroTitle}>Nightlife in Nakuru</h1>
              <p className={styles.nightlifeHeroDescription}>Discover the hottest clubs, vibrant lounges, and exclusive parties happening tonight!</p>
              <input type="text" placeholder="Search nightlife spots or events..." className={styles.nightlifeSearch} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
              <button className={`btn btn-primary ${styles.nightlifeExploreBtn}`} onClick={() => console.log('Search initiated:', searchQuery)}>Explore Nightlife <FaArrowRight /></button>
          </div>
      </section>

      {/* Main Content Area with Filters */}
      <div className={styles.mainWrapper}>
          {/* Sidebar for Filters */}
          <aside ref={sidebarRef} className={`${styles.sidebar} ${isSidebarCollapsed ? styles.collapsed : ''} glassmorphism-dark`}>
              <div className={styles.sidebarHeader}>
                  <h2 className={styles.filterHeading}>Filters</h2>
                  <button ref={sidebarToggleBtnRef} className={styles.sidebarToggleBtn} onClick={toggleSidebar}>
                      {isSidebarCollapsed ? <FaChevronDown /> : <FaChevronUp />}
                  </button>
              </div>
              <nav className={styles.sidebarNav}>
                  <div className={styles.filterGroup}>
                      <h3 className={styles.filterHeading}>Nightlife Categories</h3>
                      <ul className={styles.filterList}>
                          {nightlifeCategories.map(cat => (
                              <li key={cat.id}>
                                  <a href="#"
                                     data-filter-category={cat.id}
                                     className={`${styles.filterLink} ${activeCategory === cat.id ? styles.active : ''}`}
                                     onClick={(e) => { e.preventDefault(); setActiveCategory(cat.id); }}
                                  >
                                      {cat.icon && <cat.icon />}
                                      <span className={styles.filterText}>{cat.label}</span>
                                  </a>
                              </li>
                          ))}
                      </ul>
                  </div>
                  <div className={styles.filterGroup}>
                      <h3 className={styles.filterHeading}>When</h3>
                      <ul className={styles.filterList}>
                          {nightlifeTimeFilters.map(time => (
                              <li key={time.id}>
                                  <a href="#"
                                     data-filter-time={time.id}
                                     className={`${styles.filterLink} ${activeTime === time.id ? styles.active : ''}`}
                                     onClick={(e) => { e.preventDefault(); setActiveTime(time.id); }}
                                  >
                                      {time.icon && <time.icon className={styles.filterIcon} />}
                                      <span className={styles.filterText}>{time.label}</span>
                                      <span className={styles.filterAbbr}>{time.abbr}</span>
                                  </a>
                              </li>
                          ))}
                      </ul>
                  </div>
              </nav>
          </aside>

          {/* Main Content Area for Nightlife Events */}
          <main className={styles.mainContent}>
              {/* NEW: Combined Filters Section */}
              <section className={`${styles.combinedFiltersSection} glassmorphism`}>
                  {/* Location Dropdown */}
                  <select className={styles.locationSelect} value={selectedLocation} onChange={(e) => setSelectedLocation(e.target.value)}>
                      {locationOptions.map(loc => (
                          <option key={loc.value} value={loc.value}>{loc.label}</option>
                      ))}
                  </select>

                  {/* Free/Paid Toggle Filter */}
                  <div className={styles.entryTypeToggleGroup}>
                      <button
                          className={`${styles.entryTypeToggleButton} ${entryTypeFilter === 'all' ? styles.active : ''}`}
                          onClick={() => setEntryTypeFilter('all')}
                      >
                          All
                      </button>
                      <button
                          className={`${styles.entryTypeToggleButton} ${entryTypeFilter === 'free' ? styles.active : ''}`}
                          onClick={() => setEntryTypeFilter('free')}
                      >
                          Free <FaDollarSign style={{marginLeft: '4px'}} />
                      </button>
                      <button
                          className={`${styles.entryTypeToggleButton} ${entryTypeFilter === 'paid' ? styles.active : ''}`}
                          onClick={() => setEntryTypeFilter('paid')}
                      >
                          Paid <FaDollarSign style={{marginLeft: '4px'}} />
                      </button>
                  </div>
                  
                  {/* Age Filters */}
                  <div className={styles.ageFiltersGroup}>
                      {nightlifeAgeFilters.map(age => (
                          <a key={age.id} href="#"
                             data-filter-age={age.id}
                             className={`${styles.ageFilterPill} ${activeAge === age.id ? styles.active : ''}`}
                             onClick={(e) => { e.preventDefault(); setActiveAge(age.id); }}
                          >
                              {age.icon && <age.icon />}
                              <span>{age.label}</span>
                          </a>
                      ))}
                  </div>
              </section>

              {/* Featured Nightlife Events */}
              <section className={eventCardStyles.eventsSection}>
                  <div className={eventCardStyles.sectionHeader}>
                      <h2 className={`${eventCardStyles.sectionTitle} ${eventCardStyles.gradientText}`}>Featured Nightlife Spots</h2>
                      <p className={eventCardStyles.sectionDescription}>Top-rated clubs and lounges to light up your night.</p>
                      <Link to="/nightlife/featured" className={eventCardStyles.viewAllLink}>View All <FaArrowRight /></Link>
                  </div>
                  <div className={eventCardStyles.eventCardsGrid}>
                      {featuredNightlifeEvents.length === 0 && (
                        <div className={`${eventCardStyles.eventCard} ${eventCardStyles.adCard} glassmorphism`}>
                            <span className={eventCardStyles.adLabel}>AD</span>
                            <img src="https://placehold.co/300x400/A0522D/FFFFFF?text=Your+Ad+Here" alt="Advertisement" className={eventCardStyles.eventCardImage} />
                            <div className={eventCardStyles.eventCardContent}>
                                <h3 className={eventCardStyles.eventCardTitle}>Promote Your Nightlife!</h3>
                                <p className={eventCardStyles.eventCardMeta}>Reach thousands of Naks Yetu users.</p>
                                <button className={`btn btn-primary ${eventCardStyles.btnSmall} glassmorphism-button`}>Learn More</button>
                            </div>
                        </div>
                      )}
                      {featuredNightlifeEvents.map((event, index) => (
                          <EventCard key={event.id || index} event={event} />
                      ))}
                  </div>
              </section>

              {/* Upcoming Nightlife Events */}
              <section className={eventCardStyles.eventsSection}>
                  <div className={eventCardStyles.sectionHeader}>
                      <h2 className={`${eventCardStyles.sectionTitle} ${eventCardStyles.gradientText}`}>Upcoming Nightlife Events</h2>
                      <p className={eventCardStyles.sectionDescription}>Don't miss out on these exciting upcoming parties and shows.</p>
                      <Link to="/nightlife/upcoming" className={eventCardStyles.viewAllLink}>View All <FaArrowRight /></Link>
                  </div>
                  <div className={eventCardStyles.eventCardsGrid}>
                      {upcomingNightlifeEvents.map((event, index) => (
                          <EventCard key={event.id || index} event={event} />
                      ))}
                  </div>
              </section>
          </main>
      </div>
    </div>
  );
};

export default NightlifePage;