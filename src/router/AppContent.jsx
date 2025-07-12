// src/router/AppContent.jsx
import React, { useState, useEffect } from 'react'; // Import useState, useEffect
import { Routes, Route, Link } from 'react-router-dom'; // Import Link

// Import Layout Components
import Navbar from '../components/Nav/Navbar/Navbar.jsx';
import Footer from '../components/Nav/Footer/Footer.jsx';

// Import Page Components
import HomePage from '../pages/HomePage.jsx'; // This is your main EventList page
// FIX: Corrected AuthPage import path
import AuthPage from '../pages/Auth/AuthPage.jsx';
import UserDashboardPage from '../pages/UserDashboardPage.jsx';
import AdminDashboardPage from '../pages/Admin/AdminDashboardPage.jsx';
import InfluencerDashboardPage from '../pages/Influencer/InfluencerDashboardPage.jsx';
import OrganizerDashboardPage from '../pages/Organizer/OrganizerDashboardPage.jsx';

import EventDetailPage from '../pages/Events/EventDetailPage.jsx';
// REMOVED: AllEventsPage, TicketedEventsPage, FreeEventsPage, RSVPeventsPage imports
// import AllEventsPage from '../pages/Events/AllEventsPage.jsx';
// import TicketedEventsPage from '../pages/Events/TicketedEventsPage.jsx';
// import FreeEventsPage from '../pages/Events/FreeEventsPage.jsx';
// import RSVPeventsPage from '../pages/Events/RSVPeventsPage.jsx';
import NightlifePage from '../pages/NightlifePage.jsx';
import PrivacyPolicyPage from '../pages/PrivacyPolicyPage.jsx';
import TermsOfServicePage from '../pages/TermsOfServicePage.jsx';
import ContactPage from '../pages/ContactPage.jsx';
import NotFoundPage from '../pages/NotFoundPage.jsx';
import RefundPolicyPage from '../pages/RefundPolicyPage.jsx';
import AboutUsPage from '../pages/AboutUsPage.jsx';

// NEW: Import Email Verification Handler Page
import EmailVerificationHandlerPage from '../pages/Auth/EmailVerificationHandlerPage.jsx';
// NEW: Import Landing Page
import LandingPage from '../pages/LandingPage.jsx';
// NEW: Import VerifyEmailPendingPage
import VerifyEmailPendingPage from '../pages/Auth/VerifyEmailPendingPage.jsx';

// NEW: Placeholder Imports for new pages mentioned (will create basic files for these)
import FaqPage from '../pages/FaqPage.jsx';
import CookiePolicyPage from '../pages/CookiePolicyPage.jsx';
import BlogPage from '../pages/BlogPage.jsx';

import ProtectedRoute from './ProtectedRoute.jsx'; // Assuming ProtectedRoute is in the same folder

import { useAuth } from '../hooks/useAuth.js'; // Import useAuth
import PostLoginWelcomeModal from '../components/Auth/PostLoginWelcomeModal.jsx'; // Import the new modal


const AppContent = () => {
  const { currentUser, isAuthenticated, userRole, loading: authLoading } = useAuth();
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);

  useEffect(() => {
    if (!authLoading && isAuthenticated && currentUser) {
      const isInitialUser = !currentUser.emailVerified || currentUser.role === 'user';
      const isOnAuthOrVerifyPage = window.location.pathname === '/auth' || 
                                   window.location.pathname === '/verify-email' || 
                                   window.location.pathname === '/verify-email-pending';

      if (isInitialUser && !isOnAuthOrVerifyPage && userRole !== 'admin') {
        setShowWelcomeModal(true);
      } else {
        setShowWelcomeModal(false);
      }
    } else {
      setShowWelcomeModal(false);
    }
  }, [authLoading, isAuthenticated, currentUser, userRole, window.location.pathname]);


  return (
    <>
      <Navbar />
      <main className="app-main-content">
        <Routes>
          {/* FIX: Root route now renders LandingPage */}
          <Route path="/" element={<LandingPage />} />
          {/* FIX: /events now renders HomePage (your events list) */}
          <Route path="/events" element={<HomePage />} />
          
          <Route path="/events/:id" element={<EventDetailPage />} />
          <Route path="/nightlife" element={<NightlifePage />} />
          {/* FIX: Unified Auth Route */}
          <Route path="/auth" element={<AuthPage />} />
          {/* NEW: Email Verification Handler Route */}
          <Route path="/verify-email" element={<EmailVerificationHandlerPage />} />
          {/* NEW: Route for pending email verification message */}
          <Route path="/verify-email-pending" element={<VerifyEmailPendingPage />} />

          <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
          <Route path="/terms-of-service" element={<TermsOfServicePage />} />
          <Route path="/refund-policy" element={<RefundPolicyPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/about-us" element={<AboutUsPage />} />
          <Route path="/faq" element={<FaqPage />} />
          <Route path="/cookie-policy" element={<CookiePolicyPage />} />
          <Route path="/blog" element={<BlogPage />} />

          <Route path="/dashboard" element={<ProtectedRoute><UserDashboardPage /></ProtectedRoute>} />
          <Route path="/dashboard/influencer" element={<ProtectedRoute requiredRole="influencer"><InfluencerDashboardPage /></ProtectedRoute>} />
          <Route path="/dashboard/organizer" element={<ProtectedRoute requiredRole="organizer"><OrganizerDashboardPage /></ProtectedRoute>} />

          <Route path="/admin/*" element={<ProtectedRoute requiredRole="admin"><AdminDashboardPage /></ProtectedRoute>} />

          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>
      <Footer />
      {/* NEW: Render PostLoginWelcomeModal conditionally */}
      {showWelcomeModal && (
        <PostLoginWelcomeModal isOpen={showWelcomeModal} onClose={() => setShowWelcomeModal(false)} />
      )}
    </>
  );
};

export default AppContent;