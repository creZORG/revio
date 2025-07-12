// src/router/AppRouter.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';

// Import Layout Components
import Navbar from '../components/Nav/Navbar/Navbar.jsx';
import Footer from '../components/Nav/Footer/Footer.jsx';

// Import Page Components
import HomePage from '../pages/HomePage.jsx';
import AuthPage from '../pages/Auth/AuthPage.jsx';
import UserDashboardPage from '../pages/UserDashboardPage.jsx';
import AdminDashboardPage from '../pages/Admin/AdminDashboardPage.jsx'; // Ensure this is imported
import InfluencerDashboardPage from '../pages/Influencer/InfluencerDashboardPage.jsx';
import OrganizerDashboardPage from '../pages/Organizer/OrganizerDashboardPage.jsx';

import EventDetailPage from '../pages/Events/EventDetailPage.jsx';
import AllEventsPage from '../pages/Events/AllEventsPage.jsx';
import TicketedEventsPage from '../pages/Events/TicketedEventsPage.jsx';
import FreeEventsPage from '../pages/Events/FreeEventsPage.jsx';
import RSVPeventsPage from '../pages/Events/RSVPeventsPage.jsx';
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


const AppRouter = () => {
  return (
    <Router>
      <Navbar />
      <main className="app-main-content">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/events" element={<HomePage />} />
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

          {/* Admin Dashboard Route */}
          <Route path="/admin/*" element={<ProtectedRoute requiredRole="admin"><AdminDashboardPage /></ProtectedRoute>} />

          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>
      <Footer />
    </Router>
  );
};

export default AppRouter;