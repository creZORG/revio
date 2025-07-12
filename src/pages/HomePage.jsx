import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
    FaChevronLeft, FaChevronRight, FaArrowRight, FaFilter, FaChevronUp, FaChevronDown,
    FaMusic, FaPaintBrush, FaMoon, FaFootballBall, FaUtensils, FaLaptopCode, FaUsers,
    FaGraduationCap, FaTshirt, FaHeartbeat, FaGlobe, FaSun, FaCalendarWeek, FaAngleDoubleRight,
    FaCalendar, FaPlus, FaSearch, FaBeer, FaChild, FaBan, FaUserFriends, FaUserAlt
} from 'react-icons/fa';

import EventList from '../components/Events/EventList.jsx';
import styles from './HomePage.module.css';

const HomePage = () => {
    const carouselTrackRef = useRef(null);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [carouselImages, setCarouselImages] = useState([]);
    const autoSlideIntervalRef = useRef(null);

    const sidebarRef = useRef(null);
    const sidebarToggleBtnRef = useRef(null);
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

    const [activeCategory, setActiveCategory] = useState('all');
    const [activeTime, setActiveTime] = useState('all');
    const [activeAge, setActiveAge] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedLocation, setSelectedLocation] = useState('');


    useEffect(() => {
        // REWRITTEN SECTION STARTS HERE
        setCarouselImages([
            {
                id: 1,
                // Fallback/default image (typically for non-srcset browsers or largest screen)
                src: "https://i.postimg.cc/5030yRr3/NAKS-YETU-CAROSEUL-1700-BY-400.jpg",
                // Responsive image sources
                mobileSrc: "https://platform.naksyetu.co.ke/uploads/asset_6871a7dd078ce1.39561536.png",
                tabletSrc: "https://platform.naksyetu.co.ke/uploads/asset_6871a7dfd992f2.81477033.png",
                desktopSrc: "https://platform.naksyetu.co.ke/uploads/asset_6871a7dfd992f2.81477033.png",
                alt: "Event Poster 1"
            },
            {
                id: 2,
                src: "https://i.postimg.cc/5030yRr3/NAKS-YETU-CAROSEUL-1700-BY-400.jpg",
                mobileSrc: "https://platform.naksyetu.co.ke/uploads/asset_6871a7dd078ce1.39561536.png",
                tabletSrc: "https://platform.naksyetu.co.ke/uploads/asset_6871a7dfd992f2.81477033.png",
                desktopSrc: "https://platform.naksyetu.co.ke/uploads/asset_6871a7dfd992f2.81477033.png",
                alt: "Event Poster 2"
            },
            {
                id: 3,
                src: "https://i.postimg.cc/5030yRr3/NAKS-YETU-CAROSEUL-1700-BY-400.jpg",
                mobileSrc: "https://platform.naksyetu.co.ke/uploads/asset_6871a7dd078ce1.39561536.png",
                tabletSrc: "https://platform.naksyetu.co.ke/uploads/asset_6871a7dfd992f2.81477033.png",
                desktopSrc: "https://platform.naksyetu.co.ke/uploads/asset_6871a7dfd992f2.81477033.png",
                alt: "Event Poster 3"
            },
        ]);
        // REWRITTEN SECTION ENDS HERE
    }, []);


    const updateCarousel = useCallback(() => {
        if (carouselTrackRef.current && carouselImages.length > 0) {
            const offset = -currentIndex * 100;
            carouselTrackRef.current.style.transform = `translateX(${offset}%)`;

            document.querySelectorAll(`.${styles.carouselPagination} .${styles.paginationDot}`).forEach((dot, index) => {
                if (index === currentIndex) {
                    dot.classList.add(styles.active);
                } else {
                    dot.classList.remove(styles.active);
                }
            });
        }
    }, [currentIndex, carouselImages]);

    const resetAutoSlide = useCallback(() => {
        clearInterval(autoSlideIntervalRef.current);
        autoSlideIntervalRef.current = setInterval(() => {
            setCurrentIndex(prevIndex => (prevIndex + 1) % carouselImages.length);
        }, 5000);
    }, [carouselImages.length]);

    useEffect(() => {
        if (carouselImages.length > 0) {
            const paginationContainer = document.querySelector(`.${styles.carouselPagination}`);
            if (paginationContainer) {
                paginationContainer.innerHTML = '';
                carouselImages.forEach((_, index) => {
                    const dot = document.createElement('div');
                    dot.classList.add(styles.paginationDot);
                    if (index === 0) dot.classList.add(styles.active);
                    dot.dataset.index = index;
                    dot.addEventListener('click', () => {
                        setCurrentIndex(index);
                        resetAutoSlide();
                    });
                    paginationContainer.appendChild(dot);
                });
            }
            updateCarousel();
            resetAutoSlide();
        }
        return () => clearInterval(autoSlideIntervalRef.current);
    }, [carouselImages, updateCarousel, resetAutoSlide]);

    useEffect(() => {
        updateCarousel();
    }, [currentIndex, updateCarousel]);


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


    // --- Filter Options (with Icons and Abbreviations) ---
    const eventCategories = [
        { id: 'all', label: 'All Categories', icon: FaFilter },
        { id: 'music', label: 'Music', icon: FaMusic },
        { id: 'art', label: 'Art & Culture', icon: FaPaintBrush },
        // Removed Nightlife as per instruction
        { id: 'sports', label: 'Sports', icon: FaFootballBall },
        { id: 'food', label: 'Food & Drink', icon: FaUtensils },
        { id: 'tech', label: 'Tech & Gaming', icon: FaLaptopCode },
        { id: 'community', label: 'Community', icon: FaUsers },
        { id: 'education', label: 'Education', icon: FaGraduationCap },
        { id: 'fashion', label: 'Fashion & Beauty', icon: FaTshirt },
        { id: 'health', label: 'Health & Wellness', icon: FaHeartbeat }
    ];
    const timeFilters = [
        { id: 'all', label: 'All Time', icon: FaGlobe, abbr: 'ALL' },
        { id: 'today', label: 'Today', icon: FaSun, abbr: 'TOD' },
        { id: 'tomorrow', label: 'Tomorrow', icon: FaArrowRight, abbr: 'TOM' },
        { id: 'this-week', label: 'This Week', icon: FaCalendarWeek, abbr: 'WEEK' },
        { id: 'next-week', label: 'Next Week', icon: FaAngleDoubleRight, abbr: 'NXTW' },
        { id: 'this-month', label: 'This Month', icon: FaCalendar, abbr: 'MON' },
        { id: 'next-month', label: 'Next Month', icon: FaPlus, abbr: 'NXTM' },
    ];
    const ageFilters = [
        { id: 'all', label: 'All Ages', icon: FaUsers },
        { id: 'kids', label: 'Kids Friendly', icon: FaChild },
        { id: 'family', label: 'Family Friendly', icon: FaUserFriends },
        { id: 'teens', label: 'Teenagers (13-18)', icon: FaUserAlt },
        { id: '18plus', label: '18+', icon: FaBan },
        { id: '21plus', label: '21+', icon: FaBeer },
        { id: 'young-adults', label: 'Young Adults (19-35)', icon: FaUsers },
        { id: 'seniors', label: 'Seniors (35+)', icon: FaUserAlt }
    ];
    const locationOptions = [
        { value: '', label: 'All Nakuru Sub-Counties' }, { value: 'bahati', label: 'Bahati' },
        { value: 'gilgil', label: 'Gilgil' }, { value: 'kuresoi-north', label: 'Kuresoi North' },
        { value: 'kuresoi-south', label: 'Kuresoi South' }, { value: 'molo', label: 'Molo' },
        { value: 'naivasha', label: 'Naivasha' }, { value: 'nakuru-east', label: 'Nakuru East' },
        { value: 'nakuru-west', label: 'Nakuru West' }, { value: 'njoro', label: 'Njoro' },
        { value: 'rongai', label: 'Rongai' }, { value: 'subukia', label: 'Subukia' }
    ];

    return (
        <div className={styles.homePageWrapper}>
            {/* Hero Carousel Section (Posters) */}
            <section className={styles.heroCarouselSection}>
                <div ref={carouselTrackRef} className={styles.carouselTrack}>
                    {carouselImages.map(img => (
                        // REWRITTEN IMG TAG STARTS HERE
                        <img
                            key={img.id}
                            src={img.src} // Fallback/default for browsers that don't support srcset
                            srcSet={`
                                ${img.mobileSrc} 480w,
                                ${img.tabletSrc} 768w,
                                ${img.desktopSrc} 1024w
                            `}
                            sizes="(max-width: 480px) 100vw,
                                   (max-width: 768px) 100vw,
                                   100vw" // For screens wider than 768px, carousel takes 100% of viewport width
                            alt={img.alt}
                            className={styles.carouselImage}
                        />
                        // REWRITTEN IMG TAG ENDS HERE
                    ))}
                </div>
                <button className={`${styles.carouselArrow} ${styles.leftArrow}`} onClick={() => setCurrentIndex(prev => (prev - 1 + carouselImages.length) % carouselImages.length)}>
                    <FaChevronLeft />
                </button>
                <button className={`${styles.carouselArrow} ${styles.rightArrow}`} onClick={() => setCurrentIndex(prev => (prev + 1) % carouselImages.length)}>
                    <FaChevronRight />
                </button>
                <div className={styles.carouselPagination}></div>
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
                            <h3 className={styles.filterHeading}>Event Categories</h3>
                            <ul className={styles.filterList}>
                                {eventCategories.map(cat => (
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
                                {timeFilters.map(time => (
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

                {/* Main Content Area for Events */}
                <main className={styles.mainContent}>
                    {/* Top Search and Age Filters */}
                    <section className={`${styles.topFiltersSection} glassmorphism`}>
                        <div className={styles.searchGroup}>
                            <input type="text" placeholder="Search events by name..." className={styles.searchInput} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                            <button className={styles.searchButton} onClick={() => console.log('Search initiated:', searchQuery)}>
                                <FaSearch />
                            </button>
                        </div>
                        <select className={styles.locationSelect} value={selectedLocation} onChange={(e) => setSelectedLocation(e.target.value)}>
                            {locationOptions.map(loc => (
                                <option key={loc.value} value={loc.value}>{loc.label}</option>
                            ))}
                        </select>
                        <div className={styles.ageFiltersGroup}>
                            {ageFilters.map(age => (
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

                    {/* Event List Component (fetches and displays events based on filters) */}
                    <EventList
                        category={activeCategory}
                        timeFilter={activeTime}
                        ageFilter={activeAge}
                        searchQuery={searchQuery}
                        locationFilter={selectedLocation}
                    />
                </main>
            </div>
        </div>
    );
};

export default HomePage;