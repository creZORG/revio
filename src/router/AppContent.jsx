// src/router/AppContent.jsx
import React, { useState, useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';

// Import Layout Components
import Navbar from '../components/Nav/Navbar/Navbar.jsx';
import Footer from '../components/Nav/Footer/Footer.jsx';

// Import Page Components
import HomePage from '../pages/home/HomePage.jsx'; 
import AuthPage from '../pages/Auth/AuthPage.jsx';
import UserDashboardPage from '../pages/UserDashboardPage.jsx';
import AdminDashboardPage from '../pages/Admin/AdminDashboardPage.jsx';
import InfluencerDashboardPage from '../pages/Influencer/InfluencerDashboardPage.jsx';
import OrganizerDashboardPage from '../pages/Organizer/OrganizerDashboardPage.jsx';

import EventDetailPage from '../pages/Events/EventDetailPage.jsx';
import NightlifePage from '../pages/NightlifePage.jsx';
import PrivacyPolicyPage from '../pages/PrivacyPolicyPage.jsx';
import TermsOfServicePage from '../pages/TermsOfServicePage.jsx';
import ContactPage from '../pages/ContactPage.jsx';
import NotFoundPage from '../pages/NotFoundPage.jsx';
import RefundPolicyPage from '../pages/RefundPolicyPage.jsx';
import AboutUsPage from '../pages/AboutUsPage.jsx';

import EmailVerificationHandlerPage from '../pages/Auth/EmailVerificationHandlerPage.jsx';
import LandingPage from '../pages/LandingPage.jsx';
import VerifyEmailPendingPage from '../pages/Auth/VerifyEmailPendingPage.jsx';

import FaqPage from '../pages/FaqPage.jsx';
import CookiePolicyPage from '../pages/CookiePolicyPage.jsx';
import BlogPage from '../pages/BlogPage.jsx';

import ProtectedRoute from './ProtectedRoute.jsx';

import CheckoutPage from '../pages/CheckoutPage.jsx';
import TestPaymentPage from '../pages/TestPaymentPage.jsx';

import { useAuth } from '../hooks/useAuth.js';
import PostLoginWelcomeModal from '../components/Auth/PostLoginWelcomeModal.jsx';

// NEW: Import EventProvider
import { EventProvider } from '../contexts/EventContext.jsx';


const AppContent = () => {
  const { currentUser, isAuthenticated, userRole, loading: authLoading } = useAuth();
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);
  const location = useLocation(); 
  const [isDashboardRoute, setIsDashboardRoute] = useState(false); 

  useEffect(() => {
    const dashboardPaths = ['/dashboard', '/dashboard/influencer', '/dashboard/organizer', '/admin'];
    setIsDashboardRoute(dashboardPaths.some(path => location.pathname.startsWith(path)));
  }, [location.pathname]);

  useEffect(() => {
    if (!authLoading && isAuthenticated && currentUser) {
      const isInitialUser = !currentUser.emailVerified || currentUser.role === 'user';
      const isOnAuthOrVerifyPage = location.pathname === '/auth' || 
                                   location.pathname === '/verify-email' || 
                                   location.pathname === '/verify-email-pending';

      if (isInitialUser && !isOnAuthOrVerifyPage && userRole !== 'admin') { 
        setShowWelcomeModal(true);
      } else {
        setShowWelcomeModal(false);
      }
    } else {
      setShowWelcomeModal(false);
    }
  }, [authLoading, isAuthenticated, currentUser, userRole, location.pathname]);


  return (
    <>
      {!isDashboardRoute && <Navbar />} 

      <main className="app-main-content">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          {/* UPDATED: Wrap HomePage with EventProvider */}
          <Route path="/events" element={
            <EventProvider> {/* Wrap HomePage with EventProvider */}
              <HomePage />
            </EventProvider>
          } /> 
          
          <Route path="/events/:id" element={<EventDetailPage />} />
          <Route path="/nightlife" element={<NightlifePage />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/verify-email" element={<EmailVerificationHandlerPage />} />
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

          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/testpay" element={<TestPaymentPage />} /> 

          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>
      <Footer />
      {showWelcomeModal && (
        <PostLoginWelcomeModal isOpen={showWelcomeModal} onClose={() => setShowWelcomeModal(false)} />
      )}
    </>
  );
};

export default AppContent;