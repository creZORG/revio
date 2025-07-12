import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext(null);

export const ThemeProvider = ({ children }) => {
  // Initialize theme from localStorage or default to 'light'
  const [theme, setTheme] = useState(() => {
    if (typeof window !== 'undefined') { // Check if window is defined (for SSR compatibility)
      return localStorage.getItem('theme') || 'light';
    }
    return 'light';
  });

  // Effect to apply/remove 'dark-mode' class on body and save to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const body = document.body;
      if (theme === 'dark') {
        body.classList.add('dark-mode');
      } else {
        body.classList.remove('dark-mode');
      }
      localStorage.setItem('theme', theme);
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  const colors = {
    // NAKS YETU BRAND COLORS & VARIABLES (from your style.css mockup)
    // These should dynamically change based on theme if you define them in CSS variables
    // For now, these are static as per the initial plan, but the CSS will use var()
    primary: '#E6336B', /* Pink */
    secondary: '#333333', /* Dark Gray/Black */
    background: '#F8F8F8', /* Off-white */
    surface: '#FFFFFF', /* White */
    text: '#333333', /* Black/Dark Gray text */
    headerBg: '#FFFFFF', /* White header background */
    borderColor: '#EEEEEE', /* Lighter Gray */
    filterBtnBg: '#F5F5F5', /* Very Light Gray */
    filterBtnText: '#555555', /* Darker gray */
    filterBtnActiveBg: '#E6336B', /* Pink */
    filterBtnActiveText: '#FFFFFF', /* White */
    errorMessageBg: '#FFFFFF', /* White */
    errorMessageText: '#E6336B', /* Pink */
    boxShadowLight: '0 1px 4px rgba(0, 0, 0, 0.05)',
    boxShadowMedium: '0 2px 6px rgba(0, 0, 0, 0.08)',

    // Naks Yetu Specific Colors from Logo (for accents like orange)
    'naks-pink-logo': '#E6336B',
    'naks-orange-logo': '#FF4500',
    'naks-black-logo': '#1A1A1A', // Darkest black from your logo/navbar
    'naks-white-logo': '#FFFFFF',

    // System colors (success, error, info)
    sysSuccess: '#38A169',
    sysError: '#E53E3E',
    sysInfo: '#3182CE',
    sysWarning: '#F6AD55',
  };

  const value = {
    theme,
    toggleTheme,
    colors, // Expose colors directly
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  return useContext(ThemeContext);
};