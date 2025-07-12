import React from 'react';
import { Link } from 'react-router-dom';

const CookiePolicyPage = () => {
  return (
    <div style={{textAlign: 'center', padding: '50px', minHeight: 'calc(100vh - 120px)', backgroundColor: 'var(--naks-bg-light)', color: 'var(--naks-text-primary)'}}>
      <h1 style={{color: 'var(--naks-primary)', marginBottom: '20px'}}>Cookie Policy</h1>
      <p style={{color: 'var(--naks-text-secondary)', marginBottom: '30px'}}>This page is under construction. Details about our cookie usage will be available soon.</p>
      <Link to="/" className="btn btn-primary">Go to Home</Link>
    </div>
  );
};

export default CookiePolicyPage;