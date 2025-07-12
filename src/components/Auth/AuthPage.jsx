import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, sendEmailVerification } from 'firebase/auth';
import { doc, setDoc, getDoc, Timestamp } from 'firebase/firestore';
import { db } from '../../utils/firebaseConfig.js';
import { useNotification } from '../../contexts/NotificationContext.jsx';
import { useTheme } from '../../contexts/ThemeContext.jsx';
import Button from '../../components/Common/Button.jsx';
import LoadingSkeleton from '../../components/Common/LoadingSkeleton.jsx';

import styles from './AuthPage.module.css';

import {
  FaInfoCircle, FaCheckCircle, FaTimesCircle, FaSpinner, FaUser, FaCalendarAlt, FaStar
} from 'react-icons/fa';

const appId = "1:147113503727:web:1d9d351c30399b2970241a";

const AuthPage = () => {
  const auth = getAuth();
  const navigate = useNavigate();
  const { showNotification } = useNotification();
  const { theme, toggleTheme } = useTheme();

  const [isLoginMode, setIsLoginMode] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreeToPolicies, setAgreeToPolicies] = useState(false);

  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSignupEnabled, setIsSignupEnabled] = useState(true);

  // Fetch admin setting for signup availability
  useEffect(() => {
    const fetchSignupSetting = async () => {
      try {
        const docRef = doc(db, `appSettings/authControls`);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setIsSignupEnabled(docSnap.data().allowPublicSignup || false);
        } else {
          setIsSignupEnabled(true);
        }
      } catch (err) {
        console.error("Error fetching signup setting:", err);
        setIsSignupEnabled(true);
      }
    };
    fetchSignupSetting();
  }, []);


  const handleLogin = async (e) => {
    e.preventDefault();
    setFormErrors({});
    setIsSubmitting(true);

    if (!email || !password) {
      setFormErrors({ general: 'Email and password are required.' });
      showNotification('Please enter your email and password.', 'error');
      setIsSubmitting(false);
      return;
    }

    try {
      await signInWithEmailAndPassword(auth, email, password);
      showNotification('Login successful! Welcome back.', 'success');
      navigate('/dashboard'); // Redirect to a general dashboard or homepage
    } catch (error) {
      console.error("Login error:", error);
      let errorMessage = 'Login failed. Please check your credentials.';
      if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
        errorMessage = 'Invalid email or password.';
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = 'Too many failed login attempts. Please try again later.';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Invalid email format.';
      }
      setFormErrors({ general: errorMessage });
      showNotification(errorMessage, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setFormErrors({});
    setIsSubmitting(true);

    if (!isSignupEnabled) {
        setFormErrors({ general: 'Public sign-up is currently disabled. Please try again later.' });
        showNotification('Sign-up is currently disabled.', 'error');
        setIsSubmitting(false);
        return;
    }

    const errors = {};
    if (!email) errors.email = 'Email is required.';
    if (!password) errors.password = 'Password is required.';
    if (password.length < 6) errors.password = 'Password must be at least 6 characters.';
    if (password !== confirmPassword) errors.confirmPassword = 'Passwords do not match.';
    if (!agreeToPolicies) errors.agreeToPolicies = 'You must agree to the policies.';

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      showNotification('Please correct the errors in the form.', 'error');
      setIsSubmitting(false);
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Send verification email
      await sendEmailVerification(user);
      showNotification('Registration successful! Please check your email to verify your account.', 'success', 8000);

      // Create user profile in Firestore
      const userProfileRef = doc(db, `artifacts/${appId}/users/${user.uid}/profiles`, user.uid);
      await setDoc(userProfileRef, {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName || user.email.split('@')[0],
        role: 'user', // Default new users to 'user' role
        createdAt: Timestamp.now(),
        emailVerified: false,
        status: 'pending' // Default status for new users
      });

      // Redirect to /events after successful registration
      navigate('/events');

    } catch (error) {
      console.error("Registration error:", error);
      let errorMessage = 'Registration failed. Please try again.';
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'Email address is already in use.';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Invalid email format.';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'Password is too weak. Please choose a stronger password.';
      }
      setFormErrors({ general: errorMessage });
      showNotification(errorMessage, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.pageWrapper}>
      {/* Removed Dark Mode Toggle Standalone */}

      {/* Removed Launch Countdown Card */}

      {/* Main Content Grid */}
      <div className={styles.mainContentGrid}>
        {/* Authentication Forms Container (Right Column on PC, First on Mobile) */}
        <section className={`${styles.authContainer} glassmorphism`}>
          <div className={styles.authHeader}>
            <h1 className={styles.authTitle}>Welcome to <span className={styles.naksYetuGradient}>Naks Yetu</span></h1>
            <p className={styles.authSubtitle}>Your gateway to Nakuru's finest events.</p>
          </div>

          <div className={styles.authToggleButtons}>
            <button
              onClick={() => setIsLoginMode(true)}
              className={`${styles.authToggleButton} ${isLoginMode ? styles.active : ''}`}
            >
              Login
            </button>
            <button
              onClick={() => setIsLoginMode(false)}
              className={`${styles.authToggleButton} ${!isLoginMode ? styles.active : ''}`}
              disabled={!isSignupEnabled} // Disable signup if not enabled by admin
            >
              Sign Up
            </button>
          </div>

          {/* Login Form */}
          {isLoginMode && (
            <form onSubmit={handleLogin} className={styles.authForm}>
              {formErrors.general && <p className="error-message-box">{formErrors.general}</p>}
              <div className="form-group">
                <label htmlFor="login-email" className="form-label">Email Address</label>
                <input type="email" id="login-email" className="input-field" placeholder="your@example.com" required value={email} onChange={(e) => setEmail(e.target.value)} disabled={isSubmitting} />
                {formErrors.email && <p className="error-message-box">{formErrors.email}</p>}
              </div>
              <div className="form-group">
                <label htmlFor="login-password" className="form-label">Password</label>
                <input type="password" id="login-password" className="input-field" placeholder="••••••••" required value={password} onChange={(e) => setPassword(e.target.value)} disabled={isSubmitting} />
                {formErrors.password && <p className="error-message-box">{formErrors.password}</p>}
              </div>
              <Button type="submit" className="btn btn-primary full-width-btn" disabled={isSubmitting}>
                {isSubmitting ? <FaSpinner className="spinner" /> : 'Login'}
              </Button>
              <Link to="/forgot-password" className={styles.forgotPasswordLink}>Forgot Password?</Link>
            </form>
          )}

          {/* Sign Up Form */}
          {!isLoginMode && (
            <form onSubmit={handleRegister} className={styles.authForm}>
              {!isSignupEnabled && (
                <div className={`${styles.signupDisclaimer} glassmorphism`}>
                  <FaInfoCircle />
                  <p>Public sign-up is currently disabled. Please log in with pre-approved credentials or contact support for access.</p>
                </div>
              )}
              {formErrors.general && <p className="error-message-box">{formErrors.general}</p>}
              <div className="form-group">
                <label htmlFor="signup-email" className="form-label">Email Address</label>
                <input type="email" id="signup-email" className="input-field" placeholder="your@example.com" required value={email} onChange={(e) => setEmail(e.target.value)} disabled={isSubmitting || !isSignupEnabled} />
                {formErrors.email && <p className="error-message-box">{formErrors.email}</p>}
              </div>
              <div className="form-group">
                <label htmlFor="signup-password" className="form-label">Password</label>
                <input type="password" id="signup-password" className="input-field" placeholder="••••••••" required value={password} onChange={(e) => setPassword(e.target.value)} disabled={isSubmitting || !isSignupEnabled} />
                {formErrors.password && <p className="error-message-box">{formErrors.password}</p>}
              </div>
              <div className="form-group">
                <label htmlFor="signup-confirm-password" className="form-label">Confirm Password</label>
                <input type="password" id="signup-confirm-password" className="input-field" placeholder="••••••••" required value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} disabled={isSubmitting || !isSignupEnabled} />
                {formErrors.confirmPassword && <p className="error-message-box">{formErrors.confirmPassword}</p>}
              </div>
              
              {/* Removed Role Selection */}

              {/* Combined Policies Checkbox */}
              <div className="form-group">
                <label className={styles.checkboxLabel}>
                  <input type="checkbox" checked={agreeToPolicies} onChange={(e) => setAgreeToPolicies(e.target.checked)} disabled={isSubmitting || !isSignupEnabled} />
                  I agree to the <Link to="/terms-of-service" target="_blank" rel="noopener noreferrer">Terms of Service</Link>, <Link to="/privacy-policy" target="_blank" rel="noopener noreferrer">Privacy Policy</Link>, and <Link to="/cookie-policy" target="_blank" rel="noopener noreferrer">Cookie Policy</Link> <span className="required-star">*</span>
                </label>
                {formErrors.agreeToPolicies && <p className="error-message-box">{formErrors.agreeToPolicies}</p>}
              </div>

              <Button type="submit" className="btn btn-primary full-width-btn" disabled={isSubmitting || !isSignupEnabled || !agreeToPolicies}>
                {isSubmitting ? <FaSpinner className="spinner" /> : 'Sign Up'}
              </Button>
            </form>
          )}
        </section>

        {/* Dynamic Information Sections (Left Column on PC, Second on Mobile) */}
        <section className={styles.infoSectionsWrapper}>
          <div className={`${styles.infoSection} ${styles.glassmorphismInfo}`}>
            <div className={`${styles.infoIconCircle} ${styles.bgNaksPrimaryLight}`}><FaUser className="text-naks-primary" /></div>
            <h2 className={`${styles.infoTitle} ${styles.gradientText}`}>For Users</h2>
            <p className={styles.infoDescription}>
              Discover exclusive events, vibrant nightlife, and unique experiences tailored just for you in **Nakuru**. Get personalized recommendations, easy ticketing, and seamless event management.
            </p>
            <ul className={styles.infoBenefitsList}>
              <li><FaCheckCircle /> Personalized Event Feeds for Nakuru</li>
              <li><FaCheckCircle /> Secure & Easy Ticketing</li>
              <li><FaCheckCircle /> Event Reminders & Updates</li>
              <li><FaCheckCircle /> Community & Social Features</li>
            </ul>
            <Link to="/events" className={`${styles.infoSectionBtn} btn btn-primary`}>Explore Events</Link>
          </div>

          <div className={`${styles.infoSection} ${styles.glassmorphismInfo}`}>
            <div className={`${styles.infoIconCircle} ${styles.bgNaksSecondaryLight}`}><FaCalendarAlt className="text-naks-secondary" /></div>
            <h2 className={`${styles.infoTitle} ${styles.gradientText}`}>For Organizers</h2>
            <p className={styles.infoDescription}>
              List, promote, and manage your events within **Nakuru** with powerful tools. Reach a wider local audience, streamline ticketing, and gain insights into your event's performance.
            </p>
            <ul className={styles.infoBenefitsList}>
              <li><FaCheckCircle /> Intuitive Event Creation & Management</li>
              <li><FaCheckCircle /> Robust Ticketing & RSVP Handling</li>
              <li><FaCheckCircle /> Targeted Nakuru Audience Reach</li>
              <li><FaCheckCircle /> Dedicated Organizer Dashboard</li>
            </ul>
            <Link to="/organizer/dashboard" className={`${styles.infoSectionBtn} btn btn-secondary`}>Access Organizer Portal</Link>
          </div>

          <div className={`${styles.infoSection} ${styles.glassmorphismInfo}`}>
            <div className={`${styles.infoIconCircle} ${styles.bgNaksInfoLight}`}><FaStar className="text-naks-info" /></div>
            <h2 className={`${styles.infoTitle} ${styles.gradientText}`}>For Influencers</h2>
            <p className={styles.infoDescription}>
              Partner with Naks Yetu to promote exciting events and experiences in **Nakuru**. Grow your reach, engage your followers, and earn commissions by driving event attendance.
            </p>
            <ul className={styles.infoBenefitsList}>
              <li><FaCheckCircle /> Curated Event Access</li>
              <li><FaCheckCircle /> Performance Tracking & Analytics</li>
              <li><FaCheckCircle /> Commission-Based Earnings</li>
              <li><FaCheckCircle /> Expand Your Influence in Nakuru</li>
            </ul>
            <Link to="/influencer/dashboard" className={`${styles.infoSectionBtn} btn btn-secondary`}>Access Influencer Portal</Link>
          </div>
        </section>
      </div>
    </div>
  );
};

export default AuthPage;