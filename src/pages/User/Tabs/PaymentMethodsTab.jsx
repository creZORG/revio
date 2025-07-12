import React from 'react';
import LoadingSkeleton from '../../../components/Common/LoadingSkeleton.jsx';
import { FaCreditCard, FaInfoCircle } from 'react-icons/fa';

import styles from '../user.module.css'; // NEW: Import the CSS module

const PaymentMethodsTab = ({ currentUser, showNotification, tabDataLoading }) => {
  if (tabDataLoading) {
    return (
      <div>
        <h2>Payment Methods</h2>
        <LoadingSkeleton width="100%" height="150px" className="bg-naks-bg-light" />
      </div>
    );
  }

  return (
    <div>
      <h2>Payment Methods</h2>
      <div className="profile-section-card placeholder-content">
        <FaCreditCard style={{color: 'var(--naks-orange-logo)'}} />
        <p>Manage your saved payment methods here.</p>
        <p>Add, edit, or remove credit/debit cards for faster checkout.</p>
        <p className="text-xs mt-4"><FaInfoCircle /> Payment method integration coming soon!</p>
      </div>
    </div>
  );
};

export default PaymentMethodsTab;