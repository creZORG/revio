import React from 'react';
import { FaExclamationTriangle, FaBug, FaSyncAlt, FaChevronDown,FaChartLine, FaChevronUp, FaHome, FaCalendarAlt, FaMoon, FaCheckCircle, FaTimesCircle, FaGamepad, FaTwitter } from 'react-icons/fa';
import Button from './Button.jsx';

import styles from './ErrorBoundary.module.css'; // Import its own CSS module

// Define suggestedRoutes outside the component, as it's static data
const suggestedRoutes = [
  { path: '/', label: 'Home', icon: FaHome, status: 'working' },
  { path: '/events', label: 'Events', icon: FaCalendarAlt, status: 'working' },
  { path:  window.location.pathname,Icon:FaMoon, status: 'not-working' }, // Simulate not working
  { path: '/dashboard', label: 'Dashboard', icon: FaChartLine, status: 'working' }, // Example
];

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      showDetails: false,
      currentPath: typeof window !== 'undefined' ? window.location.pathname : '/',
      fixProgress: 0,
      fixMessage: "Our tech ninjas are already on the case!",
    };
    this.fixInterval = null;
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidMount() {
    if (this.state.hasError) {
      this.fixInterval = setInterval(() => {
        this.setState(prevState => {
          const newProgress = prevState.fixProgress + 10;
          if (newProgress >= 100) {
            clearInterval(this.fixInterval);
            return { fixProgress: 100, fixMessage: "Looks like we're almost there! Try reloading." };
          }
          return { fixProgress: newProgress };
        });
      }, 1000); // Update every second
    }
  }

  componentWillUnmount() {
    if (this.fixInterval) {
      clearInterval(this.fixInterval);
    }
  }

  handleReload = () => {
    window.location.reload();
  };

  toggleDetails = () => {
    this.setState(prevState => ({ showDetails: !prevState.showDetails }));
  };

  handleMiniGame = () => {
    let clicks = 0;
    const maxClicks = 10;
    alert(`Mini-Game: Click the button ${maxClicks} times to fix the error! (Simulated)`);
    const gameInterval = setInterval(() => {
        clicks++;
        if (clicks >= maxClicks) {
            clearInterval(gameInterval);
            alert("You fixed it! (Just kidding, but thanks for playing!) Now try reloading.");
        } else {
            alert(`Clicks: ${clicks}/${maxClicks}`);
        }
    }, 1000);
  };


  render() {
    if (!this.state.hasError) {
      return this.props.children;
    }

    // Use CSS variables for colors, as they are globally defined
    // No need to define local JS variables for colors if they are used directly in style attributes or CSS classes
    // const primaryPink = 'var(--naks-primary-pink)'; etc.

    return (
      <div className={styles.errorPageContainer}>
        <div className={styles.errorCard}>
          {/* Humorous Icon/Illustration Placeholder */}
          <div style={{marginBottom: '20px'}}>
            <FaExclamationTriangle className={styles.errorIcon} />
          </div>

          {/* Playful Headline */}
          <h1 className={styles.headline}>
            Uh oh, our hamsters fell off the wheel! 🐹
          </h1>

          {/* Acknowledge Frustration & Reassure */}
          <p className={styles.bodyText}>
            We know this isn't ideal, but it looks like something unexpected happened behind the scenes.
          </p>
          <p className={styles.reassuranceText}>
            {this.state.fixMessage}
          </p>

          {/* Simulated Progress Bar */}
          <div className={styles.progressBarContainer}>
            <div className={styles.progressBar} style={{width: `${this.state.fixProgress}%`}}>
              {this.state.fixProgress}%
            </div>
          </div>


          {/* Failed Route Display */}
          {this.state.currentPath && (
            <div className={styles.failedRouteBox}>
              <p>Failed Route: <code>{this.state.currentPath}</code></p>
            </div>
          )}


          {/* Engaging Alternatives */}
          <div className={styles.suggestedRoutesSection}>
            <h3 className={styles.suggestedRoutesHeading}>In the meantime, why not try:</h3>
            <ul className={styles.suggestedRoutesList}>
              {suggestedRoutes.map((route, index) => (
                <li key={index}>
                  {route.status === 'working' ? <FaCheckCircle className={styles.statusIconSuccess} /> : <FaTimesCircle className={styles.statusIconError} />}
                  <a href={route.path}>{route.label}</a>
                  <span>({route.status === 'working' ? 'Working' : 'Not Working'})</span>
                </li>
              ))}
              <li>
                <FaTwitter style={{color: 'var(--sys-info)'}} />
                <a href="https://twitter.com/naksyetu" target="_blank" rel="noopener noreferrer">Follow us on Twitter for updates!</a>
              </li>
              {/* Mini-Game */}
              <li>
                <FaGamepad style={{color: 'var(--naks-primary)'}} /> {/* Use primary color for gamepad icon */}
                <button onClick={this.handleMiniGame} className="text-link"> {/* Use global text-link class */}
                  Play "Fix the Bug" Mini-Game!
                </button>
              </li>
            </ul>
          </div>

          {/* Error Details Toggle */}
          <button
            onClick={this.toggleDetails}
            className={styles.detailsToggleButton}
          >
            <FaBug /> Show Error Details
            {this.state.showDetails ? <FaChevronUp /> : <FaChevronDown />}
          </button>

          {this.state.showDetails && (
            <div className={styles.errorDetailsBox}>
              <h3 className={styles.errorDetailsHeading}>Error Message:</h3>
              <p className={styles.errorMessageText}>{this.state.error && this.state.error.toString()}</p>
              <h3 className={styles.errorDetailsHeading}>Component Stack:</h3>
              <pre className={styles.componentStackText}>{this.state.errorInfo && this.state.errorInfo.componentStack}</pre>
            </div>
          )}

          {/* Action Buttons */}
          <div className={styles.actionButtons}>
            <Button onClick={this.handleReload} className="btn btn-primary">
              <FaSyncAlt /> Reload Page
            </Button>
            <a href="/" className="btn btn-secondary">
              Go to Home
            </a>
          </div>
        </div>
      </div>
    );
  }
}

export default ErrorBoundary;