import React from 'react';
import { Link } from 'react-router-dom';

const FaqPage = () => {
  return (
    <div style={{textAlign: 'center', padding: '50px', minHeight: 'calc(100vh - 120px)', backgroundColor: 'var(--naks-bg-light)', color: 'var(--naks-text-primary)'}}>
      <h1 style={{color: 'var(--naks-primary)', marginBottom: '20px'}}>Frequently Asked Questions</h1>
      <p style={{color: 'var(--naks-text-secondary)', marginBottom: '30px'}}>This page is under construction. Please check back later for FAQs.</p>
      <Link to="/" className="btn btn-primary">Go to Home</Link>
    </div>
  );
};

export default FaqPage;