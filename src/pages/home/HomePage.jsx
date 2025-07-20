// src/pages/home/HomePage.jsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import styles from './HomePage.module.css'; // Dedicated CSS for the new HomePage
import { useEvents } from '../../hooks/useEvents.js'; // Assuming this hook fetches events
import EventList from './EventList.jsx'; // Import the new EventList from src/pages/home/
import LoadingSkeleton from '../../components/Common/LoadingSkeleton.jsx'; // Reusing existing LoadingSkeleton
import { db } from '../../utils/firebaseConfig.js'; // Import Firestore instance
import { collection, query, orderBy, getDocs } from 'firebase/firestore'; // Import Firestore functions
import {
  MagnifyingGlassIcon, AdjustmentsHorizontalIcon, 
  MusicalNoteIcon, PaintBrushIcon, CodeBracketIcon, TrophyIcon, UsersIcon, SparklesIcon,
  CalendarDaysIcon, SunIcon, ForwardIcon, CalendarIcon, AcademicCapIcon, HeartIcon,
  UserIcon, MoonIcon,
} from '@heroicons/react/24/outline'; // Ensuring all common Heroicons are imported
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa'; // For carousel arrows


const HomePage = () => {
  const { events, loading, error } = useEvents(); 
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedLocation, setSelectedLocation] = useState('all'); 
  const [selectedTimeFilter, setSelectedTimeFilter] = useState('all-time'); 
  const [selectedAgeFilter, setSelectedAgeFilter] = useState('all-ages'); 
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false); // For mobile filter panel

  // --- Carousel States and Refs ---
  const carouselTrackRef = useRef(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  // Initialize carouselImages with hardcoded data as a robust fallback
  const [carouselImages, setCarouselImages] = useState([
    {
        id: 'fallback1',
        src: "https://i.postimg.cc/5030yRr3/NAKS-YETU-CAROSEUL-1700-BY-400.jpg",
        mobileSrc: "https://i.postimg.cc/5030yRr3/NAKS-YETU-CAROSEUL-1700-BY-400.jpg", // Placeholder for mobile
        tabletSrc: "https://i.postimg.cc/5030yRr3/NAKS-YETU-CAROSEUL-1700-BY-400.jpg", // Placeholder for tablet
        desktopSrc: "https://i.postimg.cc/5030yRr3/NAKS-YETU-CAROSEUL-1700-BY-400.jpg", // Placeholder for desktop
        alt: "Default Carousel Image 1",
        link: "#",
        order: 1,
        isActive: true
    },
    {
        id: 'fallback2',
        src: "https://platform.naksyetu.co.ke/uploads/asset_687a4e20ab82d9.29537154.png",
        mobileSrc: "https://placehold.co/480x200/FF6B6B/FFFFFF?text=Welcome",
        tabletSrc: "https://placehold.co/768x300/FF6B6B/FFFFFF?text=Welcome",
        desktopSrc: "https://platform.naksyetu.co.ke/uploads/asset_687a4e2150f833.25969325.png",
        alt: "Default Carousel Image 2",
        link: "#",
        order: 2,
        isActive: true
    },
    {
        id: 'fallback3',
        src: "https://platform.naksyetu.co.ke/uploads/asset_687a4e2150f833.25969325.png",
        mobileSrc: "https://placehold.co/480x200/FFA07A/FFFFFF?text=Discover",
        tabletSrc: "https://placehold.co/768x300/FFA07A/FFFFFF?text=Discover",
        desktopSrc: "https://platform.naksyetu.co.ke/uploads/asset_687a4e20ab82d9.29537154.png",
        alt: "Default Carousel Image 3",
        link: "#",
        order: 3,
        isActive: true
    },
     {
        id: 'fallback3',
        src: "https://platform.naksyetu.co.ke/uploads/asset_6871a7dfd992f2.81477033.png",
        mobileSrc: "https://placehold.co/480x200/FFA07A/FFFFFF?text=Discover",
        tabletSrc: "https://placehold.co/768x300/FFA07A/FFFFFF?text=Discover",
        desktopSrc: "https://platform.naksyetu.co.ke/uploads/asset_6871a7dfd992f2.81477033.png",
        alt: "Default Carousel Image 3",
        link: "#",
        order: 3,
        isActive: true
    },
  ]);
  const [loadingCarousel, setLoadingCarousel] = useState(true); // Set to true initially as we fetch from Firestore
  const autoSlideIntervalRef = useRef(null);

  // --- Carousel Logic ---
  const updateCarousel = useCallback(() => {
    if (carouselTrackRef.current && carouselImages.length > 0) {
      const offset = -currentIndex * 100;
      carouselTrackRef.current.style.transform = `translateX(${offset}%)`;

      // Update pagination dots
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
    if (carouselImages.length > 1) { // Only auto-slide if more than one image
      autoSlideIntervalRef.current = setInterval(() => {
        setCurrentIndex(prevIndex => (prevIndex + 1) % carouselImages.length);
      }, 5000); // Auto-slide every 5 seconds
    }
  }, [carouselImages.length]);

  // Effect to fetch carousel images from Firestore
  useEffect(() => {
    const fetchCarouselImages = async () => {
      setLoadingCarousel(true);
      try {
        const carouselCollectionRef = collection(db, 'artifacts/naksyetu-9c648/public/data/carouselImages');
        const q = query(carouselCollectionRef, orderBy('order', 'asc'));
        const querySnapshot = await getDocs(q);
        const imagesData = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          if (data.isActive) { // Only show active images
            imagesData.push({ id: doc.id, ...data });
          }
        });

        if (imagesData.length > 0) {
          setCarouselImages(imagesData); // Update state with fetched images
        } else {
          console.log("Firestore returned no carousel images. Using hardcoded fallbacks.");
          // If no images from Firestore, the initial state (hardcoded images) will persist.
        }
      } catch (error) {
        console.error("Error fetching carousel images from Firestore:", error);
        console.log("Error fetching carousel images. Using hardcoded fallbacks.");
        // If error, the initial state (hardcoded images) will persist.
      } finally {
        setLoadingCarousel(false);
      }
    };

    fetchCarouselImages();

    // Cleanup interval on component unmount
    return () => clearInterval(autoSlideIntervalRef.current);
  }, []); // Empty dependency array to run once on mount

  // Effect to update carousel display and reset auto-slide when images or index change
  useEffect(() => {
    if (carouselImages.length > 0) {
      const paginationContainer = document.querySelector(`.${styles.carouselPagination}`);
      if (paginationContainer) {
        // Clear existing dots before re-rendering
        paginationContainer.innerHTML = '';
        carouselImages.forEach((_, index) => {
          const dot = document.createElement('div');
          dot.classList.add(styles.paginationDot);
          if (index === currentIndex) dot.classList.add(styles.active);
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
    } else if (!loadingCarousel) { // If no images (even after fetch) and not loading, clear carousel
        if (carouselTrackRef.current) carouselTrackRef.current.style.transform = `translateX(0%)`;
        const paginationContainer = document.querySelector(`.${styles.carouselPagination}`);
        if (paginationContainer) paginationContainer.innerHTML = '';
        clearInterval(autoSlideIntervalRef.current);
    }
  }, [carouselImages, currentIndex, updateCarousel, resetAutoSlide, loadingCarousel]);


  // --- Sidebar & Filter Logic ---
  const nakuruSubCounties = [
    { value: 'all', label: 'All Nakuru Sub-Counties' },
    { value: 'nakuru_city', label: 'Nakuru City' },
    { value: 'bahati', label: 'Bahati' },
    { value: 'gilgil', label: 'Gilgil' },
    { value: 'kuresoi_north', label: 'Kuresoi North' },
    { value: 'kuresoi_south', label: 'Kuresoi South' },
    { value: 'molo', label: 'Molo' },
    { value: 'naivasha', label: 'Naivasha' },
    { value: 'nakuru_east', label: 'Nakuru East' },
    { value: 'nakuru_west', label: 'Nakuru West' },
    { value: 'njoro', label: 'Njoro' },
    { value: 'rongai', label: 'Rongai' },
    { value: 'subukia', label: 'Subukia' }
  ];

  const ageFilters = [
    { id: 'all-ages', label: 'All Ages', icon: UsersIcon }, 
    { id: 'kids_friendly', label: 'Kids Friendly', icon: UserIcon }, 
    { id: 'family_friendly', label: 'Family Friendly', icon: UsersIcon }, 
    { id: 'teenagers', label: 'Teenagers (13-18)', icon: UserIcon }, 
    { id: '18_plus', label: '18+', icon: UsersIcon }, 
    { id: 'young_adults', label: 'Young Adults (19-35)', icon: UsersIcon }, 
    { id: 'seniors', label: 'Seniors (35+)', icon: UserIcon } 
  ];

  const timeFilters = [
    { id: 'all-time', label: 'All Time', icon: CalendarDaysIcon },
    { id: 'today', label: 'Today', icon: SunIcon },
    { id: 'tomorrow', label: 'Tomorrow', icon: MoonIcon }, 
    { id: 'this-week', label: 'This Week', icon: CalendarIcon },
    { id: 'next-week', label: 'Next Week', icon: ForwardIcon },
    { id: 'this-month', label: 'This Month', icon: CalendarDaysIcon },
    { id: 'next-month', label: 'Next Month', icon: ForwardIcon }
  ];

  const eventCategories = [
    { id: 'all', name: 'All Categories', icon: SparklesIcon },
    { id: 'music', name: 'Music', icon: MusicalNoteIcon },
    { id: 'arts_culture', name: 'Art & Culture', icon: PaintBrushIcon },
    { id: 'sports', name: 'Sports', icon: TrophyIcon },
    { id: 'food_drink', name: 'Food & Drink', icon: UsersIcon }, 
    { id: 'tech_gaming', name: 'Tech & Gaming', icon: CodeBracketIcon }, 
    { id: 'community', name: 'Community', icon: UsersIcon },
    { id: 'education', name: 'Education', icon: AcademicCapIcon },
    { id: 'fashion_beauty', name: 'Fashion & Beauty', icon: SparklesIcon }, 
    { id: 'health_wellness', name: 'Health & Wellness', icon: HeartIcon }
  ];

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleLocationChange = (e) => {
    setSelectedLocation(e.target.value);
  };

  const handleCategorySelect = useCallback((categoryId) => {
    setSelectedCategory(categoryId);
    if (window.innerWidth <= 767) { 
        setIsFilterPanelOpen(false); 
    }
  }, []);

  const handleTimeFilterSelect = useCallback((filterId) => {
    setSelectedTimeFilter(filterId);
    if (window.innerWidth <= 767) { 
        setIsFilterPanelOpen(false); 
    }
  }, []);

  const handleAgeFilterSelect = useCallback((ageId) => {
    setSelectedAgeFilter(ageId);
    if (window.innerWidth <= 767) { 
        setIsFilterPanelOpen(false); 
    }
  }, []);


  const filteredEvents = React.useMemo(() => {
    return events.filter(event => {
      const eventName = event.eventName ?? '';
      const eventDescription = event.description ?? '';
      const eventCategory = event.category ?? '';
      const eventLocation = event.mainLocation ?? '';
      const eventStartDate = event.startDate ? new Date(event.startDate) : null;
      const eventTargetAge = event.targetAge ?? '';

      const matchesSearch = eventName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            eventDescription.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesCategory = selectedCategory === 'all' || eventCategory.toLowerCase().includes(selectedCategory.toLowerCase());

      const matchesLocation = selectedLocation === 'all' || eventLocation.toLowerCase().includes(selectedLocation.toLowerCase()); 

      const matchesAge = selectedAgeFilter === 'all-ages' || eventTargetAge.toLowerCase() === selectedAgeFilter.toLowerCase();


      const matchesTime = (() => {
        if (selectedTimeFilter === 'all-time' || !eventStartDate) return true;

        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
        const startOfThisWeek = new Date(today.getFullYear(), today.getMonth(), today.getDate() - today.getDay()); 
        const endOfThisWeek = new Date(startOfThisWeek.getFullYear(), startOfThisWeek.getMonth(), startOfThisWeek.getDate() + 6, 23, 59, 59, 999); 
        const startOfNextWeek = new Date(endOfThisWeek.getFullYear(), endOfThisWeek.getMonth(), endOfThisWeek.getDate() + 1);
        const endOfNextWeek = new Date(startOfNextWeek.getFullYear(), startOfNextWeek.getMonth(), startOfNextWeek.getDate() + 6, 23, 59, 59, 999);
        const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const endOfThisMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999); 
        const startOfNextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
        const endOfNextMonth = new Date(now.getFullYear(), now.getMonth() + 2, 0, 23, 59, 59, 999);

        if (selectedTimeFilter === 'today') return eventStartDate.toDateString() === today.toDateString();
        if (selectedTimeFilter === 'tomorrow') return eventStartDate.toDateString() === tomorrow.toDateString();
        if (selectedTimeFilter === 'this-week') return eventStartDate >= today && eventStartDate <= endOfThisWeek;
        if (selectedTimeFilter === 'next-week') return eventStartDate >= startOfNextWeek && eventStartDate <= endOfNextWeek;
        if (selectedTimeFilter === 'this-month') return eventStartDate >= startOfThisMonth && eventStartDate <= endOfThisMonth;
        if (selectedTimeFilter === 'next-month') return eventStartDate >= startOfNextMonth && eventStartDate <= endOfNextMonth;
        
        return true;
      })();
      
      return matchesSearch && matchesCategory && matchesLocation && matchesAge && matchesTime;
    });
  }, [events, searchQuery, selectedCategory, selectedLocation, selectedAgeFilter, selectedTimeFilter]); // Dependencies for useMemo

  if (loading) {
    return (
      <div className={styles.homePageContainer}>
        <LoadingSkeleton count={4} />
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.homePageContainer}>
        <p className={styles.errorMessage}>Failed to load events: {error.message}</p>
      </div>
    );
  }

  return (
    <div className={styles.homePageContainer}>
      {/* Hero Carousel Section (Posters) */}
      <section className={styles.heroCarouselSection}>
          {loadingCarousel && carouselImages.length === 0 ? ( // Only show loading if no images AND still loading
              <div className={styles.carouselLoading}>Loading carousel...</div>
          ) : carouselImages.length > 0 ? (
              <>
                  <div ref={carouselTrackRef} className={styles.carouselTrack}>
                      {carouselImages.map(img => (
                          <a key={img.id} href={img.link || '#'} className={styles.carouselLinkWrapper} target="_blank" rel="noopener noreferrer">
                              <img
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
                          </a>
                      ))}
                  </div>
                  {carouselImages.length > 1 && ( // Only show arrows/dots if more than one image
                      <>
                          <button className={`${styles.carouselArrow} ${styles.leftArrow}`} onClick={() => setCurrentIndex(prev => (prev - 1 + carouselImages.length) % carouselImages.length)}>
                              <FaChevronLeft />
                          </button>
                          <button className={`${styles.carouselArrow} ${styles.rightArrow}`} onClick={() => setCurrentIndex(prev => (prev + 1) % carouselImages.length)}>
                              <FaChevronRight />
                          </button>
                          <div className={styles.carouselPagination}></div>
                      </>
                  )}
              </>
          ) : (
              // This block will only show if loading is false AND carouselImages is empty (meaning no data from Firestore and no hardcoded fallback)
              <div className={styles.noCarouselImages}>No carousel images available.</div>
          )}
      </section>

      {/* Header Section: Search and Top Filters (Moved below carousel) */}
      <section className={styles.heroSection}>
       
        <div className={styles.searchFilterContainer}>
            <div className={styles.searchBar}>
                <MagnifyingGlassIcon className={styles.searchIcon} />
                <input 
                    type="text" 
                    placeholder="Search by event name or description..." 
                    className={styles.searchInput} 
                    value={searchQuery}
                    onChange={handleSearchChange}
                />
                {/* Location Dropdown */}
                <select 
                    className={styles.locationDropdown} 
                    value={selectedLocation} 
                    onChange={handleLocationChange}
                >
                    {nakuruSubCounties.map(loc => (
                        <option key={loc.value} value={loc.value}>{loc.label}</option>
                    ))}
                </select>
                {/* Mobile Filter Toggle Button */}
                <button 
                    className={styles.filterToggleButton} 
                    onClick={() => setIsFilterPanelOpen(!isFilterPanelOpen)}
                    aria-label="Toggle filters"
                >
                    <AdjustmentsHorizontalIcon className="h-6 w-6" />
                </button>
            </div>

            {/* Age Filter Pills */}
            <div className={styles.ageFilterPills}>
                {ageFilters.map(age => {
                    const Icon = age.icon;
                    return (
                        <button 
                            key={age.id} 
                            className={`${styles.ageFilterPill} ${selectedAgeFilter === age.id ? styles.activeAgeFilterPill : ''}`}
                            onClick={() => handleAgeFilterSelect(age.id)}
                        >
                            <Icon className={styles.ageFilterIcon} />
                            <span>{age.label}</span>
                        </button>
                    );
                })}
            </div>
        </div>
      </section>

      {/* Sidebar Filters (Mobile: Slide-in, Desktop: Fixed left) */}
      <aside className={`${styles.sidebarFilters} ${isFilterPanelOpen ? styles.sidebarFiltersOpen : ''}`}>
        <h3 className={styles.sidebarTitle}>Filters</h3>
        <button className={styles.closeSidebarButton} onClick={() => setIsFilterPanelOpen(false)}>
            &times;
        </button>

        {/* Event Categories Filter */}
        <div className={styles.filterSection}>
          <h4 className={styles.filterSectionTitle}>Event Categories</h4>
          <div className={styles.categoriesGrid}>
            {eventCategories.map(cat => {
              const Icon = cat.icon;
              return (
                <button 
                  key={cat.id} 
                  className={`${styles.categoryPill} ${selectedCategory === cat.id ? styles.activeCategoryPill : ''}`}
                  onClick={() => handleCategorySelect(cat.id)}
                >
                  <Icon className={styles.categoryIcon} />
                  <span>{cat.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Time Filters */}
        <div className={styles.filterSection}>
          <h4 className={styles.filterSectionTitle}>Time Filters</h4>
          <div className={styles.timeFilterList}>
            {timeFilters.map(timeFilter => {
              const Icon = timeFilter.icon;
              return (
                <button 
                  key={timeFilter.id} 
                  className={`${styles.timeFilterItem} ${selectedTimeFilter === timeFilter.id ? styles.activeTimeFilterItem : ''}`}
                  onClick={() => handleTimeFilterSelect(timeFilter.id)}
                >
                  <Icon className={styles.timeFilterIcon} />
                  <span>{timeFilter.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </aside>

      {/* Main Content Area for Event List */}
      <section className={styles.eventsListingArea}>
        <h2 className={styles.sectionHeading}></h2>
        {filteredEvents.length === 0 ? (
          <p className={styles.noEventsMessage}>No events found matching your criteria.</p>
        ) : (
          <EventList events={filteredEvents} />
        )}
      </section>
    </div>
  );
};

export default HomePage;
