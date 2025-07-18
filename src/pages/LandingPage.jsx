// /src/pages/LandingPage.jsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { FaArrowRight, FaTicketAlt, FaHandshake, FaMoneyBillWave,FaCalendarAlt,FaPhone, FaMapMarkerAlt, FaUsers, FaChartBar, FaHeadset, FaLink } from 'react-icons/fa'; // Added icons

import styles from './LandingPage.module.css'; // Dedicated CSS module

const LandingPage = () => {
  // Hero Carousel Images (from provided posters and brand identity)
  const heroCarouselItems = [
    {
      id: 1,
      image: "https://platform.naksyetu.co.ke/uploads/asset_6871a7dfd992f2.81477033.png", // Naks Yetu Festival poster
      title: "Discover Your Next Unforgettable Event",
      subtitle: "Experience concerts, festivals, and unique experiences in Nakuru.",
      ctaLink: "/events",
      ctaText: "Explore Events",
    },
    {
      id: 2,
      image: "https://platform.naksyetu.co.ke/uploads/asset_6871a7dd078ce1.39561536.png", // General promo poster
      title: "More Than Just Tickets. It's a Movement.",
      subtitle: "We empower your vision with real-time support and community.",
      ctaLink: "/organizer/dashboard",
      ctaText: "Become an Organizer",
    },
    {
      id: 3,
      image: "https://i.postimg.cc/5030yRr3/NAKS-YETU-CAROSEUL-1700-BY-400.jpg", // Another generic carousel image
      title: "Amplify Your Reach. Boost Your Influence.",
      subtitle: "Partner with us to promote events and earn commissions.",
      ctaLink: "/influencer/dashboard",
      ctaText: "Join as Influencer",
    },
  ];

  const carouselTrackRef = useRef(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const autoSlideIntervalRef = useRef(null);

  // Auto-slide carousel logic
  const updateCarousel = useCallback(() => {
    if (carouselTrackRef.current && heroCarouselItems.length > 0) {
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
  }, [currentIndex, heroCarouselItems]);

  const resetAutoSlide = useCallback(() => {
    clearInterval(autoSlideIntervalRef.current);
    autoSlideIntervalRef.current = setInterval(() => {
      setCurrentIndex(prevIndex => (prevIndex + 1) % heroCarouselItems.length);
    }, 7000); // Change every 7 seconds
  }, [heroCarouselItems.length]);

  useEffect(() => {
    if (heroCarouselItems.length > 0) {
      const paginationContainer = document.querySelector(`.${styles.carouselPagination}`);
      if (paginationContainer) {
        paginationContainer.innerHTML = ''; // Clear previous dots
        heroCarouselItems.forEach((_, index) => {
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
  }, [heroCarouselItems, updateCarousel, resetAutoSlide]);

  useEffect(() => {
    updateCarousel();
  }, [currentIndex, updateCarousel]);


  // Partner Logos (from WhatsApp Image 2025-07-10 at 10.27.12 PM (1).jpeg)
  const partners = [
    { name: "Naks Yetu Media", logo: "https://platform.naksyetu.co.ke/uploads/asset_687326e72cab87.08243403.png" }, // Placeholder logo for Naks Yetu Media
    { name: "TwinCat Creative Agency", logo: "https://platform.naksyetu.co.ke/uploads/asset_687326e72cab87.08243403.png" }, // Placeholder for TwinCat
    { name: "MOV Studio", logo: "https://platform.naksyetu.co.ke/uploads/asset_687326e72cab87.08243403.png" }, // Placeholder for MOV Studio
    { name: "KOL", logo: "https://platform.naksyetu.co.ke/uploads/asset_687326e72cab87.08243403.png" }, // Placeholder for KOL
    { name: "K9 Kennel", logo: "https://platform.naksyetu.co.ke/uploads/asset_687326e72cab87.08243403.png" }, // Placeholder for K9 Kennel
  ];


  return (
    <div className={styles.landingPageContainer}>
      {/* Hero Section */}
      <section className={styles.heroSection}>
        <div ref={carouselTrackRef} className={styles.carouselTrack}>
          {heroCarouselItems.map(item => (
            <div key={item.id} className={styles.carouselItem}>
              <img src={item.image} alt={item.title} className={styles.carouselBgImage} />
              <div className={styles.heroOverlay}>
                <div className={styles.heroContent}>
                  <h1 className={styles.heroTitle}>{item.title}</h1>
                  <p className={styles.heroSubtitle}>{item.subtitle}</p>
                  <Link to={item.ctaLink} className={`${styles.heroCtaButton} ${styles.btnPrimary}`}>
                    {item.ctaText} <FaArrowRight />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className={styles.carouselPagination}></div>
      </section>

      {/* Why Plan Your Next Event With Us? - Value Proposition */}
      <section className={styles.valuePropSection}>
        <h2 className={styles.sectionTitle}>Why Plan Your Next Event With Us?</h2>
        <div className={styles.valuePropGrid}>
          <div className={`${styles.valuePropCard} ${styles.builtInNakuru}`}>
            <h3 className={styles.cardHeading}>Built in Nakuru.</h3>
            <p className={styles.cardText}>
              Ticketed by Naks Yetu is proudly homegrown. Our platform is crafted by people who understand Nakuru's energy, creativity, and potential. We connect you directly to the community because we are the community.
            </p>
          </div>
          <div className={`${styles.valuePropCard} ${styles.builtForReliability}`}>
            <h3 className={styles.cardHeading}>Built for Reliability.</h3>
            <p className={styles.cardText}>
              We've designed every feature for fast payouts to on-ground support, to serve your event smoothly and professionally. With real-time data, physical presence, and trusted local partnerships, you can count on us to deliver every time.
            </p>
          </div>
          <div className={`${styles.valuePropCard} ${styles.builtForYou}`}>
            <h3 className={styles.cardHeading}>Built for You.</h3>
            <p className={styles.cardText}>
              Whether you're an organizer, creative, or business, ticketed by Naks Yetu empowers you to take full control of your event journey. From start to finish, you're supported by tools, people, and a mission that exists to see you win.
            </p>
          </div>
        </div>
      </section>

      {/* Features Section (Community-Driven, Powerful Event Tools, On-Ground Support etc.) */}
      <section className={styles.featuresSection}>
        <div className={styles.featuresGrid}>
          <div className={styles.featureCard}>
            <FaUsers className={styles.featureIcon} />
            <h3 className={styles.featureTitle}>Community-Driven</h3>
            <p className={styles.featureDescription}>Our community is your audience. From planning to post-event, we walk with you.</p>
          </div>
          <div className={styles.featureCard}>
            <FaChartBar className={styles.featureIcon} />
            <h3 className={styles.featureTitle}>Powerful Event Tools</h3>
            <p className={styles.featureDescription}>Get full control to manage your event. Add influencers, track QR scans, see clicks, impressions, bookings, and feedback.</p>
          </div>
          <div className={styles.featureCard}>
            <FaHeadset className={styles.featureIcon} />
            <h3 className={styles.featureTitle}>On-Ground Support</h3>
            <p className={styles.featureDescription}>Our team helps you verify tickets and manage crowds smoothly.</p>
          </div>
          <div className={styles.featureCard}>
            <FaCalendarAlt className={styles.featureIcon} />
            <h3 className={styles.featureTitle}>Post-Event Data Reports</h3>
            <p className={styles.featureDescription}>Real-time analytics for better decisions and future planning.</p>
          </div>
          <div className={styles.featureCard}>
            <FaMoneyBillWave className={styles.featureIcon} />
            <h3 className={styles.featureTitle}>Funds Released Within 48 Hours</h3>
            <p className={styles.featureDescription}>You don't have to wait for your money.</p>
          </div>
          <div className={styles.featureCard}>
            <FaPhone className={styles.featureIcon} />
            <h3 className={styles.featureTitle}>Physical Support</h3>
            <p className={styles.featureDescription}>We are based in Nakuru. That means no delays, just face-to-face support.</p>
          </div>
        </div>
        {/* NEW: Billboards/Marketing Feature */}
        <div className={styles.marketingFeature}>
            <FaMapMarkerAlt className={styles.marketingIcon} />
            <h3 className={styles.marketingTitle}>7 Billboards at Nakuru Entry Points</h3>
            <p className={styles.marketingDescription}>Over 40,000+ monthly road users = Built-in marketing.</p>
        </div>
      </section>

      {/* Partners Section */}
      <section className={styles.partnersSection}>
        <h2 className={styles.sectionTitle}>Our Partners</h2>
        <div className={styles.partnersGrid}>
          {partners.map((partner, index) => (
            <div key={index} className={styles.partnerLogoContainer}>
              <img src={partner.logo} alt={partner.name} className={styles.partnerLogo} />
              <span className={styles.partnerName}>{partner.name}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Final Call to Action */}
      <section className={styles.finalCtaSection}>
        <h2 className={styles.finalCtaTitle}>Plan Your Next Event With Us!</h2>
        <p className={styles.finalCtaSubtitle}>
          Be part of the only ticketing movement rooted in Nakuru.
        </p>
        <div className={styles.finalCtaButtons}>
          <Link to="/auth" className={`${styles.finalCtaBtn} ${styles.btnPrimary}`}>
            Get Started <FaArrowRight />
          </Link>
          <Link to="/contact" className={`${styles.finalCtaBtn} ${styles.btnSecondary}`}>
            Contact Us
          </Link>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;