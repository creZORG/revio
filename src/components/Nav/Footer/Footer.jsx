import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-content">
        <p className="footer-copyright">
          &copy; {new Date().getFullYear()} Naks Yetu. All rights reserved.
        </p>

        <div className="footer-links">
          <FooterLink to="/privacy-policy">Privacy Policy</FooterLink>
          <FooterLink to="/terms-of-service">Terms of Service</FooterLink>
          <FooterLink to="/about-us">About Us</FooterLink>
          <FooterLink to="/contact">Contact Us</FooterLink>
          <FooterLink to="/faq">FAQ</FooterLink>
          <FooterLink to="/cookie-policy">Cookie Policy</FooterLink>
          <FooterLink to="/blog">Blog</FooterLink>
        </div>
      </div>
    </footer>
  );
};

const FooterLink = ({ to, children }) => (
  <Link
    to={to}
    className="footer-link"
  >
    {children}
  </Link>
);

export default Footer;