import React, { useState, useEffect, useCallback } from 'react';
import { db } from '../../../../utils/firebaseConfig.js';
import { collection, query, where, getDocs, addDoc, Timestamp, orderBy, limit } from 'firebase/firestore'; // Removed updateDoc, doc as they are not used in this snippet
import { useAuth } from '../../../../hooks/useAuth.js';
import { useNotification } from '../../../../contexts/NotificationContext.jsx';
import Button from '../../../../components/Common/Button.jsx';
import LoadingSkeleton from '../../../../components/Common/LoadingSkeleton.jsx';
import Modal from '../../../../components/Common/Modal.jsx';

import styles from '../../organizer.module.css'; // Re-use organizer dashboard styles
import walletTabStyles from './WalletTab.module.css'; // Dedicated CSS for WalletTab

import { FaSpinner, FaPlus, FaMobileAlt, FaUniversity, FaHourglassHalf, FaTimesCircle, FaRegCheckCircle } from 'react-icons/fa';
// Removed unused icons: FaMoneyBillWave, FaInfoCircle, FaCalendarAlt, FaPercentage, FaDollarSign, FaUsers, FaCheckCircle

const appId = "1:147113503727:web:1d9d351c30399b2970241a";

const WalletTab = ({ currentUser, organizerData }) => { // Removed showNotification prop as useNotification hook is used
  const { isAuthenticated } = useAuth();
  const showNotification = useNotification(); // Get showNotification from the context

  // State for financial summaries
  const [totalSales, setTotalSales] = useState(0);
  const [totalCommissionEarned, setTotalCommissionEarned] = useState(0);
  const [netAmountOwed, setNetAmountOwed] = useState(0);
  const [platformFeePercentage, setPlatformFeePercentage] = useState(3);
  const [pendingPayoutsAmount, setPendingPayoutsAmount] = useState(0);
  const [totalPaidOut, setTotalPaidOut] = useState(0); // Added missing state
  const [payoutStats, setPayoutStats] = useState({ pending: 0, completed: 0, rejected: 0 }); // Added missing state

  // State for detailed breakdowns and requests
  const [eventSalesBreakdown, setEventSalesBreakdown] = useState([]);
  const [recentPayoutRequests, setRecentPayoutRequests] = useState([]);

  // State for loading and errors
  const [loadingSales, setLoadingSales] = useState(true);
  const [salesError, setSalesError] = useState(null);

  // State for payout modal and form
  const [showPayoutModal, setShowPayoutModal] = useState(false);
  const [payoutMethod, setPayoutMethod] = useState('mpesa'); // 'mpesa' or 'bank'
  const [payoutAmountToRequest, setPayoutAmountToRequest] = useState('');
  const [mpesaPhoneNumber, setMpesaPhoneNumber] = useState('');
  const [mpesaName, setMpesaName] = useState('');
  const [bankName, setBankName] = useState('');
  const [bankAccountName, setBankAccountName] = useState('');
  const [bankAccountNumber, setBankAccountNumber] = useState('');
  const [payoutErrors, setPayoutErrors] = useState({});
  const [isRequestingPayout, setIsRequestingPayout] = useState(false);

  const MPESA_NUMBER_REGEX = /^(07|01)\d{8}$/;

  /**
   * Fetches sales data and payout requests for the current organizer.
   * This effect runs when authentication status, user data, or organizer data changes.
   */
  useEffect(() => {
    const fetchSalesData = async () => {
      if (!isAuthenticated || !currentUser?.uid || !organizerData) {
        setLoadingSales(false);
        return;
      }
      setLoadingSales(true);
      setSalesError(null);

      try {
        // Fetch purchase data
        const purchasesRef = collection(db, `artifacts/${appId}/public/data_for_app/purchases`);
        const qPurchases = query(purchasesRef, where('organizerId', '==', currentUser.uid));
        const purchaseSnap = await getDocs(qPurchases);

        let totalS = 0;
        let totalC = 0;
        const breakdownMap = new Map();

        purchaseSnap.docs.forEach((doc) => {
          const purchase = doc.data();
          const amount = purchase.amount || 0;
          const commissionAmount = purchase.commissionAmount || 0;

          totalS += amount;
          totalC += commissionAmount;

          const eventId = purchase.eventId;
          const eventName = purchase.eventName || 'Unknown Event';

          if (!breakdownMap.has(eventId)) {
            breakdownMap.set(eventId, {
              id: eventId,
              name: eventName,
              sales: 0,
              commission: 0,
              ticketsSold: 0,
            });
          }
          const eventBreakdown = breakdownMap.get(eventId);
          eventBreakdown.sales += amount;
          eventBreakdown.commission += commissionAmount;
          eventBreakdown.ticketsSold += (purchase.quantity || 1);
        });

        setTotalSales(totalS);
        setTotalCommissionEarned(totalC);

        const calculatedNetAmount = totalC - (totalC * (platformFeePercentage / 100));
        setNetAmountOwed(calculatedNetAmount);

        setEventSalesBreakdown(Array.from(breakdownMap.values()));

        // Fetch payout requests
        const payoutRequestsRef = collection(db, `artifacts/${appId}/public/data_for_app/payoutRequests`);
        const qPayouts = query(
          payoutRequestsRef,
          where('organizerId', '==', currentUser.uid),
          orderBy('requestDate', 'desc'),
          limit(5)
        );
        const payoutSnap = await getDocs(qPayouts);
        const fetchedPayouts = payoutSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setRecentPayoutRequests(fetchedPayouts);

        let pendingAmount = 0;
        let completedCount = 0;
        let pendingCount = 0;
        let rejectedCount = 0;
        let totalPaid = 0;

        fetchedPayouts.forEach(req => {
          if (req.status === 'pending') {
            pendingAmount += (req.amountRequested || 0);
            pendingCount++;
          } else if (req.status === 'completed') {
            completedCount++;
            totalPaid += (req.netAmount || 0);
          } else if (req.status === 'rejected') {
            rejectedCount++;
          }
        });
        setPendingPayoutsAmount(pendingAmount);
        setTotalPaidOut(totalPaid);
        setPayoutStats({ pending: pendingCount, completed: completedCount, rejected: rejectedCount });


      } catch (err) {
        console.error("Error fetching sales data:", err);
        setSalesError("Failed to load sales data.");
        showNotification("Failed to load sales data.", 'error');
      } finally {
        setLoadingSales(false);
      }
    };

    if (isAuthenticated && currentUser && organizerData) {
      fetchSalesData();
    }
  }, [isAuthenticated, currentUser, organizerData, platformFeePercentage, showNotification]);


  /**
   * Handles the submission of a payout request.
   * Validates input fields and sends the request to Firebase.
   */
  const handlePayoutRequest = useCallback(async () => {
    setPayoutErrors({});
    let errors = {};

    const amount = parseFloat(payoutAmountToRequest);
    const currentAvailableBalance = netAmountOwed - pendingPayoutsAmount;

    if (isNaN(amount) || amount <= 0) {
      errors.payoutAmountToRequest = 'Please enter a valid amount.';
    } else if (amount < 1000) {
      errors.payoutAmountToRequest = 'Minimum payout request is KES 1,000.';
    } else if (amount > currentAvailableBalance) {
      errors.payoutAmountToRequest = `Requested amount exceeds available balance (KES ${currentAvailableBalance.toLocaleString()}).`;
    } else if (amount > 100000) {
      errors.general = 'For payouts larger than KES 100,000, please contact support.';
    }

    if (payoutMethod === 'mpesa') {
      if (!mpesaPhoneNumber.trim()) errors.mpesaPhoneNumber = 'M-Pesa phone number is required.';
      else if (!MPESA_NUMBER_REGEX.test(mpesaPhoneNumber)) errors.mpesaPhoneNumber = 'Invalid M-Pesa number format (e.g., 07XXXXXXXX or 01XXXXXXXX).';
      if (!mpesaName.trim()) errors.mpesaName = 'M-Pesa account name is required.';
      else if (mpesaName.toLowerCase() !== (organizerData?.displayName || currentUser?.displayName || '').toLowerCase()) {
        errors.mpesaName = 'M-Pesa name must match your Naks Yetu registered name for verification.';
      }
    } else if (payoutMethod === 'bank') {
      if (!bankName.trim()) errors.bankName = 'Bank name is required.';
      if (!bankAccountName.trim()) errors.bankAccountName = 'Bank account name is required.';
      if (!bankAccountNumber.trim()) errors.bankAccountNumber = 'Bank account number is required.';
    }

    if (Object.keys(errors).length > 0) {
      setPayoutErrors(errors);
      showNotification('Please correct the errors in the payout request form.', 'error');
      return;
    }

    setIsRequestingPayout(true);
    showNotification('Submitting payout request...', 'info');

    try {
      const payoutRequestsRef = collection(db, `artifacts/${appId}/public/data_for_app/payoutRequests`);
      await addDoc(payoutRequestsRef, {
        organizerId: currentUser.uid,
        organizerName: organizerData?.displayName || currentUser?.displayName,
        amountRequested: amount,
        platformFeeApplied: amount * (platformFeePercentage / 100),
        netAmount: amount - (amount * (platformFeePercentage / 100)),
        requestDate: Timestamp.now(),
        status: 'pending',
        payoutMethod: payoutMethod,
        mpesaDetails: payoutMethod === 'mpesa' ? { phoneNumber: mpesaPhoneNumber, name: mpesaName } : null,
        bankDetails: payoutMethod === 'bank' ? { bankName, accountName: bankAccountName, accountNumber: bankAccountNumber } : null,
      });

      showNotification('Payout request submitted successfully! We will process it within 48 hours.', 'success');
      setShowPayoutModal(false);

      // Clear form fields
      setMpesaPhoneNumber('');
      setMpesaName('');
      setBankName('');
      setBankAccountName('');
      setBankAccountNumber('');
      setPayoutAmountToRequest('');

      // Optimistically update local state to reflect the new pending payout
      setNetAmountOwed(prev => prev - amount);
      setPendingPayoutsAmount(prev => prev + amount);

      // Re-fetch data to ensure full accuracy, or update local payoutStats
      // For a quick update, you could do:
      setPayoutStats(prev => ({ ...prev, pending: prev.pending + 1 }));
      setRecentPayoutRequests(prev => [{
        id: 'temp-id-' + Date.now(), // Use a temporary ID for immediate display
        organizerId: currentUser.uid,
        organizerName: organizerData?.displayName || currentUser?.displayName,
        amountRequested: amount,
        platformFeeApplied: amount * (platformFeePercentage / 100),
        netAmount: amount - (amount * (platformFeePercentage / 100)),
        requestDate: Timestamp.now(),
        status: 'pending',
        payoutMethod: payoutMethod,
        mpesaDetails: payoutMethod === 'mpesa' ? { phoneNumber: mpesaPhoneNumber, name: mpesaName } : null,
        bankDetails: payoutMethod === 'bank' ? { bankName, accountName: bankAccountName, accountNumber: bankAccountNumber } : null,
      }, ...prev].slice(0, 5)); // Keep only the latest 5

    } catch (err) {
      console.error("Error requesting payout:", err);
      setPayoutErrors({ general: 'Failed to submit payout request: ' + err.message });
      showNotification('Failed to submit payout request.', 'error');
    } finally {
      setIsRequestingPayout(false);
    }
  }, [payoutAmountToRequest, payoutMethod, mpesaPhoneNumber, mpesaName, bankName, bankAccountName, bankAccountNumber, netAmountOwed, pendingPayoutsAmount, platformFeePercentage, currentUser, organizerData, showNotification, MPESA_NUMBER_REGEX]);


  if (loadingSales) {
    return (
      <div className={walletTabStyles.walletTabContainer}>
        <LoadingSkeleton width="100%" height="250px" style={{ marginBottom: '20px' }} />
        <LoadingSkeleton width="100%" height="300px" />
      </div>
    );
  }

  if (salesError) {
    return (
      <div className="error-message-box">
        <p>{salesError}</p>
      </div>
    );
  }

  const currentAvailableBalance = netAmountOwed - pendingPayoutsAmount;

  return (
    <div className={walletTabStyles.walletTabContainer}>
      <h2 className={walletTabStyles.welcomeMessage}>
        Hey {organizerData?.displayName || currentUser?.displayName || 'Organizer'}, this is your <span className={walletTabStyles.naksYetuGradient}>Naks Yetu</span> Wallet.
      </h2>

      {/* --- Summary Cards Section --- */}
      <div className={walletTabStyles.summaryCardsGrid}>
        <div className={walletTabStyles.summaryCard}>
          <h3 className={walletTabStyles.summaryCardTitle}>Total Sales</h3>
          <p className={walletTabStyles.summaryCardValue}>KES {totalSales.toLocaleString()}</p>
        </div>
        <div className={walletTabStyles.summaryCard}>
          <h3 className={walletTabStyles.summaryCardTitle}>Total Commission Earned</h3>
          <p className={walletTabStyles.summaryCardValue}>KES {totalCommissionEarned.toLocaleString()}</p>
        </div>
        <div className={walletTabStyles.summaryCard}>
          <h3 className={walletTabStyles.summaryCardTitle}>Platform Fee ({platformFeePercentage}%)</h3>
          <p className={walletTabStyles.summaryCardValue}>KES {(totalCommissionEarned * (platformFeePercentage / 100)).toLocaleString()}</p>
        </div>
        <div className={walletTabStyles.summaryCard}>
          <h3 className={walletTabStyles.summaryCardTitle}>Net Amount Owed</h3>
          <p className={walletTabStyles.summaryCardValue} style={{ color: 'var(--naks-success)' }}>KES {netAmountOwed.toLocaleString()}</p>
        </div>
        <div className={walletTabStyles.summaryCard}>
          <h3 className={walletTabStyles.summaryCardTitle}>Available Balance</h3>
          <p className={walletTabStyles.summaryCardValue} style={{ color: currentAvailableBalance > 0 ? 'var(--naks-success)' : 'var(--naks-text-secondary)' }}>
            KES {currentAvailableBalance.toLocaleString()}
            {pendingPayoutsAmount > 0 && (
              <span className={walletTabStyles.pendingAmountIndicator}>
                (+KES {pendingPayoutsAmount.toLocaleString()} pending)
              </span>
            )}
          </p>
          <p className={walletTabStyles.platformFeeNote}>
            * This balance is net of the {platformFeePercentage}% platform fee.
          </p>
        </div>
        <div className={walletTabStyles.summaryCard}>
          <h3 className={walletTabStyles.summaryCardTitle}>Payouts Pending</h3>
          <p className={walletTabStyles.summaryCardValue} style={{ color: 'var(--naks-warning)' }}><FaHourglassHalf /> {payoutStats.pending}</p>
        </div>
        <div className={walletTabStyles.summaryCard}>
          <h3 className={walletTabStyles.summaryCardTitle}>Payouts Completed</h3>
          <p className={walletTabStyles.summaryCardValue} style={{ color: 'var(--naks-success)' }}><FaRegCheckCircle /> {payoutStats.completed}</p>
        </div>
        <div className={walletTabStyles.summaryCard}>
          <h3 className={walletTabStyles.summaryCardTitle}>Payouts Rejected</h3>
          <p className={walletTabStyles.summaryCardValue} style={{ color: 'var(--naks-error)' }}><FaTimesCircle /> {payoutStats.rejected}</p>
        </div>
      </div>

      {/* --- Request Payout Section and Button --- */}
      <div className={walletTabStyles.requestPayoutSection}>
        <h3 className={walletTabStyles.sectionSubtitle}>Request Payout</h3>
        <p className={walletTabStyles.payoutInfo}>
          You can request a payout for your available balance. Ensure your M-Pesa or bank details are correct.
        </p>
        <Button
          onClick={() => setShowPayoutModal(true)}
          className="btn btn-primary"
          disabled={currentAvailableBalance < 1000} // Disable if balance is too low
        >
          <FaPlus /> Request New Payout
        </Button>
        {currentAvailableBalance < 1000 && (
          <p className="error-message-box mt-2">Minimum payout amount is KES 1,000.</p>
        )}
      </div>

      {/* --- Recent Payout Requests Section --- */}
      <div className={walletTabStyles.recentPayoutsSection}>
        <h3 className={walletTabStyles.sectionSubtitle}>Recent Payout Requests</h3>
        {recentPayoutRequests.length > 0 ? (
          <ul className={walletTabStyles.payoutList}>
            {recentPayoutRequests.map(payout => (
              <li key={payout.id} className={walletTabStyles.payoutItem}>
                <span className={walletTabStyles.payoutAmount}>KES {payout.amountRequested.toLocaleString()}</span>
                <span className={`${walletTabStyles.payoutStatus} ${walletTabStyles[payout.status]}`}>
                  {payout.status.charAt(0).toUpperCase() + payout.status.slice(1)}
                </span>
                <span className={walletTabStyles.payoutDate}>
                  {payout.requestDate?.toDate().toLocaleDateString() || 'N/A'}
                </span>
                <span className={walletTabStyles.payoutMethod}>
                  {payout.payoutMethod === 'mpesa' ? `M-Pesa (${payout.mpesaDetails?.phoneNumber})` : `Bank (${payout.bankDetails?.bankName})`}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p>No recent payout requests found.</p>
        )}
      </div>

      {/* --- Event Sales Breakdown Section (Optional, if you want to display it) --- */}
      {eventSalesBreakdown.length > 0 && (
        <div className={walletTabStyles.eventSalesBreakdown}>
          <h3 className={walletTabStyles.sectionSubtitle}>Event Sales Breakdown</h3>
          <ul className={walletTabStyles.breakdownList}>
            {eventSalesBreakdown.map(event => (
              <li key={event.id} className={walletTabStyles.breakdownItem}>
                <h4>{event.name}</h4>
                <p>Sales: KES {event.sales.toLocaleString()}</p>
                <p>Commission: KES {event.commission.toLocaleString()}</p>
                <p>Tickets Sold: {event.ticketsSold}</p>
              </li>
            ))}
          </ul>
        </div>
      )}


      {/* --- Payout Request Modal (Conditionally Rendered) --- */}
      {showPayoutModal && (
        <Modal
          title="Request Payout"
          onClose={() => setShowPayoutModal(false)}
          isOpen={showPayoutModal} // Pass isOpen prop to your Modal component if it uses it
        >
          <p className={walletTabStyles.payoutInfo}>
            Your **available balance** for payout is: **KES {currentAvailableBalance.toLocaleString()}**
          </p>
          {payoutErrors.general && <p className="error-message-box">{payoutErrors.general}</p>}

          <div className="form-group" style={{ width: '100%' }}>
            <label htmlFor="payoutAmountToRequest" className="form-label">Amount to Request (KES) <span className="required-star">*</span></label>
            <input
              type="number"
              id="payoutAmountToRequest"
              className="input-field"
              value={payoutAmountToRequest}
              onChange={(e) => setPayoutAmountToRequest(e.target.value)}
              disabled={isRequestingPayout || currentAvailableBalance <= 0}
              min="1000"
              step="any"
              placeholder={`Max KES ${currentAvailableBalance.toLocaleString()}`}
            />
            {payoutErrors.payoutAmountToRequest && <p className="error-message-box">{payoutErrors.payoutAmountToRequest}</p>}
          </div>

          <div className="form-group" style={{ width: '100%' }}>
            <label className="form-label">Payout Method</label>
            <div className={walletTabStyles.radioGroup}>
              <label>
                <input type="radio" name="payoutMethod" value="mpesa" checked={payoutMethod === 'mpesa'} onChange={(e) => setPayoutMethod(e.target.value)} disabled={isRequestingPayout} /> <FaMobileAlt /> M-Pesa
              </label>
              <label>
                <input type="radio" name="payoutMethod" value="bank" checked={payoutMethod === 'bank'} onChange={(e) => setPayoutMethod(e.target.value)} disabled={isRequestingPayout} /> <FaUniversity /> Bank Transfer
              </label>
            </div>
          </div>

          {payoutMethod === 'mpesa' && (
            <>
              <div className="form-group" style={{ width: '100%' }}>
                <label htmlFor="mpesaPhoneNumber" className="form-label">M-Pesa Phone Number <span className="required-star">*</span></label>
                <input
                  type="tel"
                  id="mpesaPhoneNumber"
                  className="input-field"
                  placeholder="e.g., 07XXXXXXXX or 01XXXXXXXX"
                  value={mpesaPhoneNumber}
                  onChange={(e) => setMpesaPhoneNumber(e.target.value)}
                  disabled={isRequestingPayout}
                />
                {payoutErrors.mpesaPhoneNumber && <p className="error-message-box">{payoutErrors.mpesaPhoneNumber}</p>}
                <p className="text-xs text-naks-text-secondary mt-1">Must start with 07 or 01 and be 10 digits long.</p>
              </div>
              <div className="form-group" style={{ width: '100%' }}>
                <label htmlFor="mpesaName" className="form-label">M-Pesa Account Name <span className="required-star">*</span></label>
                <input
                  type="text"
                  id="mpesaName"
                  className="input-field"
                  value={mpesaName}
                  onChange={(e) => setMpesaName(e.target.value)}
                  disabled={isRequestingPayout}
                  placeholder="Your name as it appears on M-Pesa"
                />
                {payoutErrors.mpesaName && <p className="error-message-box">{payoutErrors.mpesaName}</p>}
                <p className="text-xs text-naks-text-secondary mt-1">This must match your Naks Yetu registered name for verification.</p>
              </div>
            </>
          )}

          {payoutMethod === 'bank' && (
            <>
              <div className="form-group" style={{ width: '100%' }}>
                <label htmlFor="bankName" className="form-label">Bank Name <span className="required-star">*</span></label>
                <input type="text" id="bankName" className="input-field" value={bankName} onChange={(e) => setBankName(e.target.value)} disabled={isRequestingPayout} placeholder="e.g., KCB Bank" />
                {payoutErrors.bankName && <p className="error-message-box">{payoutErrors.bankName}</p>}
              </div>
              <div className="form-group" style={{ width: '100%' }}>
                <label htmlFor="bankAccountName" className="form-label">Bank Account Name <span className="required-star">*</span></label>
                <input type="text" id="bankAccountName" className="input-field" value={bankAccountName} onChange={(e) => setBankAccountName(e.target.value)} disabled={isRequestingPayout} placeholder="Your name as it appears on bank account" />
                {payoutErrors.bankAccountName && <p className="error-message-box">{payoutErrors.bankAccountName}</p>}
              </div>
              <div className="form-group" style={{ width: '100%' }}>
                <label htmlFor="bankAccountNumber" className="form-label">Bank Account Number <span className="required-star">*</span></label>
                <input type="text" id="bankAccountNumber" className="input-field" value={bankAccountNumber} onChange={(e) => setBankAccountNumber(e.target.value)} disabled={isRequestingPayout} placeholder="e.g., 1234567890" />
                {payoutErrors.bankAccountNumber && <p className="error-message-box">{payoutErrors.bankAccountNumber}</p>}
              </div>
              <p className="text-xs text-naks-text-secondary mt-1">Payment will take up to 48 hours or longer for larger payouts.</p>
            </>
          )}

          <div className={walletTabStyles.modalActions}>
            <button onClick={() => setShowPayoutModal(false)} className="btn btn-secondary" disabled={isRequestingPayout}>Cancel</button>
            <Button
              onClick={handlePayoutRequest}
              className="btn btn-primary"
              // Corrected: used currentAvailableBalance instead of undefined 'availableBalance'
              disabled={isRequestingPayout || currentAvailableBalance < 1000 || parseFloat(payoutAmountToRequest) <= 0 || parseFloat(payoutAmountToRequest) > currentAvailableBalance}
            >
              {isRequestingPayout ? <FaSpinner className="spinner" /> : 'Submit Request'}
            </Button>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default WalletTab;