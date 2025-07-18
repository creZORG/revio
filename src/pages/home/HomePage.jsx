// src/pages/home/HomePage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import styles from './HomePage.module.css'; // Dedicated CSS for the new HomePage
import { useEvents } from '../../hooks/useEvents.js'; // Assuming this hook fetches events
import EventList from './EventList.jsx'; // Import the new EventList from src/pages/home/
import LoadingSkeleton from '../../components/Common/LoadingSkeleton.jsx'; // Reusing existing LoadingSkeleton
import { 
  MagnifyingGlassIcon, AdjustmentsHorizontalIcon, 
  MusicalNoteIcon, PaintBrushIcon, CodeBracketIcon, TrophyIcon, UsersIcon, SparklesIcon,
  CalendarDaysIcon, SunIcon, ForwardIcon, CalendarIcon, AcademicCapIcon, HeartIcon,
  UserIcon, 
  MoonIcon, 
} from '@heroicons/react/24/outline'; // Ensuring all common Heroicons are imported


const HomePage = () => {
  const { events, loading, error } = useEvents(); 
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedLocation, setSelectedLocation] = useState('all'); 
  const [selectedTimeFilter, setSelectedTimeFilter] = useState('all-time'); 
  const [selectedAgeFilter, setSelectedAgeFilter] = useState('all-ages'); 

  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false); // For mobile filter panel

  // Nakuru Sub-counties
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

  // Age filters with icons
  const ageFilters = [
    { id: 'all-ages', label: 'All Ages', icon: UsersIcon }, 
    { id: 'kids_friendly', label: 'Kids Friendly', icon: UserIcon }, 
    { id: 'family_friendly', label: 'Family Friendly', icon: UsersIcon }, 
    { id: 'teenagers', label: 'Teenagers (13-18)', icon: UserIcon }, 
    { id: '18_plus', label: '18+', icon: UsersIcon }, 
    { id: 'young_adults', label: 'Young Adults (19-35)', icon: UsersIcon }, 
    { id: 'seniors', label: 'Seniors (35+)', icon: UserIcon } 
  ];

  // Time filters
  const timeFilters = [
    { id: 'all-time', label: 'All Time', icon: CalendarDaysIcon },
    { id: 'today', label: 'Today', icon: SunIcon },
    { id: 'tomorrow', label: 'Tomorrow', icon: MoonIcon }, 
    { id: 'this-week', label: 'This Week', icon: CalendarIcon },
    { id: 'next-week', label: 'Next Week', icon: ForwardIcon },
    { id: 'this-month', label: 'This Month', icon: CalendarDaysIcon },
    { id: 'next-month', label: 'Next Month', icon: ForwardIcon }
  ];

  // Event Categories filter in sidebar
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


  // FIX: Make filteredEvents a computed value with React.useMemo
  const filteredEvents = React.useMemo(() => {
    return events.filter(event => {
      const eventName = event.eventName ?? '';
      const eventDescription = event.description ?? '';
      const eventCategory = event.category ?? '';
      const eventLocation = event.mainLocation ?? '';
      const eventStartDate = event.startDate ? new Date(event.startDate) : null;
      const eventTargetAge = event.targetAge ?? '';

      // Search Query Filter
      const matchesSearch = eventName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            eventDescription.toLowerCase().includes(searchQuery.toLowerCase());
      
      // Category Filter
      const matchesCategory = selectedCategory === 'all' || eventCategory.toLowerCase().includes(selectedCategory.toLowerCase());

      // Location Filter
      const matchesLocation = selectedLocation === 'all' || eventLocation.toLowerCase().includes(selectedLocation.toLowerCase()); 

      // Age Filter (assuming event.targetAge is like 'all-ages', '18_plus' etc.)
      const matchesAge = selectedAgeFilter === 'all-ages' || eventTargetAge.toLowerCase() === selectedAgeFilter.toLowerCase();


      // Time Filter (more complex, using current date)
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
      {/* Header Section: Search and Top Filters */}
      <section className={styles.heroSection}>
        <h1 className={styles.mainTitle}>Discover Events in Nakuru</h1>
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