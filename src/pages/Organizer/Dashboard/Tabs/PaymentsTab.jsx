import React, { useState, useEffect, useCallback } from 'react';
import Button from '../../../../components/Common/Button.jsx';
import TextInput from '../../../../components/Common/TextInput.jsx';
import Modal from '../../../../components/Common/Modal.jsx';
import { db } from '../../../../utils/firebaseConfig.js';
import { doc, getDoc, updateDoc, collection, query, where, getDocs, addDoc, Timestamp } from 'firebase/firestore';
import { useAuth } from '../../../../hooks/useAuth.js';
import { useNotification } from '../../../../contexts/NotificationContext.jsx';
import { FaCreditCard, FaInfoCircle, FaSpinner } from 'react-icons/fa'; // Added FaSpinner

import styles from '../../organizer.module.css'; // NEW: Import the CSS module

const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';

const PaymentsTab = ({ currentUser, showNotification }) => {
  const [balance, setBalance] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState('mpesa');
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [requestAmount, setRequestAmount] = useState('');
  const [payoutHistory, setPayoutHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSavingDetails, setIsSavingDetails] = useState(false);
  const [isRequestingPayout, setIsRequestingPayout] = useState(false);


  const initialPaymentDetails = {
    mpesaNumber: '',
    bankName: '',
    accountNumber: '',
    accountName: '',
  };
  const [paymentDetailsForm, setPaymentDetailsForm] = useState(initialPaymentDetails);
  const [paymentDetailsErrors, setPaymentDetailsErrors] = useState({});

  const fetchPaymentData = useCallback(async () => {
    if (!currentUser) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      // Fetch organizer's current balance
      const organizerDocRef = doc(db, `artifacts/${appId}/users/${currentUser.uid}/profiles`, currentUser.uid);
      const organizerSnap = await getDoc(organizerDocRef);
      if (organizerSnap.exists()) {
        const data = organizerSnap.data();
        setBalance(data.currentBalance || 0);
        setPaymentDetailsForm(data.paymentDetails || initialPaymentDetails);
        setPaymentMethod(data.paymentDetails?.method || 'mpesa');
      } else {
        setBalance(0);
        setPaymentDetailsForm(initialPaymentDetails);
        setPaymentMethod('mpesa');
      }

      // Fetch payout history
      const payoutRef = collection(db, `artifacts/${appId}/public/payout_requests`);
      const qPayouts = query(payoutRef, where("organizerId", "==", currentUser.uid), orderBy("requestedAt", "desc"));
      const payoutSnap = await getDocs(qPayouts);
      setPayoutHistory(payoutSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));

    } catch (err) {
      console.error("Error fetching payment data:", err);
      setError("Failed to load payment data.");
      setBalance(0);
      setPayoutHistory([]);
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  useEffect(() => {
    fetchPaymentData();
  }, [fetchPaymentData]);


  const handlePaymentDetailsInputChange = useCallback((e) => {
    const { name, value } = e.target;
    setPaymentDetailsForm(prev => ({ ...prev, [name]: value }));
    setPaymentDetailsErrors(prev => ({ ...prev, [name]: undefined }));
  }, []);

  const validatePaymentDetailsForm = useCallback(() => {
    const errors = {};
    if (paymentMethod === 'mpesa' && !paymentDetailsForm.mpesaNumber.trim()) {
      errors.mpesaNumber = 'Mpesa number is required.';
    }
    if (paymentMethod === 'bank') {
      if (!paymentDetailsForm.bankName.trim()) errors.bankName = 'Bank name is required.';
      if (!paymentDetailsForm.accountNumber.trim()) errors.accountNumber = 'Account number is required.';
      if (!paymentDetailsForm.accountName.trim()) errors.accountName = 'Account name is required.';
    }
    setPaymentDetailsErrors(errors);
    return Object.keys(errors).length === 0;
  }, [paymentMethod, paymentDetailsForm]);


  const handleSavePaymentDetails = useCallback(async (e) => {
    e.preventDefault();
    if (!validatePaymentDetailsForm()) {
      showNotification('Please correct the errors in your payment details.', 'error');
      return;
    }

    setIsSavingDetails(true);
    showNotification('Saving payment details...', 'info');
    try {
      const organizerDocRef = doc(db, `artifacts/${appId}/users/${currentUser.uid}/profiles`, currentUser.uid);
      await updateDoc(organizerDocRef, {
        paymentDetails: {
          method: paymentMethod,
          ...paymentDetailsForm
        }
      });
      showNotification('Payment details saved successfully!', 'success');
    } catch (err) {
      console.error("Error saving payment details:", err);
      showNotification('Failed to save payment details: ' + err.message, 'error');
    } finally {
      setIsSavingDetails(false);
    }
  }, [paymentMethod, paymentDetailsForm, validatePaymentDetailsForm, showNotification, currentUser]);


  const handleRequestPayout = useCallback(async () => {
    if (requestAmount <= 0 || requestAmount > balance) {
      showNotification("Please enter a valid amount within your current balance.", 'error');
      return;
    }
    if (!validatePaymentDetailsForm()) { // Ensure payment details are set and valid
        showNotification("Please set your complete payment details before requesting a payout.", 'error');
        return;
    }

    setIsRequestingPayout(true);
    showNotification(`Requesting payout of KES ${requestAmount}...`, 'info');

    try {
      const payoutRequestData = {
        organizerId: currentUser.uid,
        amount: parseFloat(requestAmount),
        method: paymentMethod,
        details: paymentDetailsForm, // Store the details used for this payout
        status: 'pending',
        requestedAt: Timestamp.now(),
      };
      await addDoc(collection(db, `artifacts/${appId}/public/payout_requests`), payoutRequestData);

      // Deduct from balance locally (actual deduction happens during manual payout)
      // For a real system, balance would be updated by a backend process after payout
      setBalance(prev => prev - parseFloat(requestAmount));
      showNotification(`Payout request for KES ${requestAmount} submitted!`, 'success');
      setIsRequestModalOpen(false);
      setRequestAmount('');
      fetchPaymentData(); // Re-fetch history

    } catch (err) {
      console.error("Error requesting payout:", err);
      showNotification('Failed to submit payout request: ' + err.message, 'error');
    } finally {
      setIsRequestingPayout(false);
    }
  }, [requestAmount, balance, paymentMethod, paymentDetailsForm, validatePaymentDetailsForm, showNotification, currentUser, fetchPaymentData]);


  if (loading) {
    return (
      <div className="profile-section-card">
        <h3>Payments</h3>
        <LoadingSkeleton width="100%" height="200px" className="mb-4" />
        <LoadingSkeleton width="100%" height="300px" />
      </div>
    );
  }

  if (error) {
    return <p className="error-message-box">{error}</p>;
  }

  const platformFeePercentage = 8;
  const estimatedGrossRevenue = balance / (1 - platformFeePercentage / 100);

  return (
    <div className="profile-section-card">
      <h3>Payments</h3>

      {/* Current Balance */}
      <div className={styles.balanceCard}>
        <h3>Current Balance Owed to You:</h3>
        <p className={styles.balanceValue}>
          KES {balance.toLocaleString()}
        </p>
        <p className="text-sm text-secondary-color mb-4">
          (This is your share after the {platformFeePercentage}% platform fee and other charges.)
        </p>
        <Button
          onClick={() => setIsRequestModalOpen(true)}
          disabled={balance <= 0 || isRequestingPayout}
          className="btn btn-primary"
        >
          {isRequestingPayout ? <FaSpinner className="spinner mr-2" /> : null}
          {isRequestingPayout ? 'Requesting...' : 'Request Payout'}
        </Button>
      </div>

      {/* Payment Method Settings */}
      <div className={styles.paymentMethodSection}>
        <h3>Set Your Payment Choice</h3>
        <div className={styles.paymentMethodOptions}>
          <label>
            <input
              type="radio"
              value="mpesa"
              checked={paymentMethod === 'mpesa'}
              onChange={() => setPaymentMethod('mpesa')}
              className="form-radio"
            />
            <span className="ml-2">Mpesa</span>
          </label>
          <label>
            <input
              type="radio"
              value="bank"
              checked={paymentMethod === 'bank'}
              onChange={() => setPaymentMethod('bank')}
              className="form-radio"
            />
            <span className="ml-2">Bank Transfer</span>
          </label>
        </div>

        <form onSubmit={handleSavePaymentDetails} className="space-y-4">
          {paymentMethod === 'mpesa' && (
            <TextInput
              label="Mpesa Number"
              id="mpesaNumber"
              name="mpesaNumber"
              type="tel"
              value={paymentDetailsForm.mpesaNumber}
              onChange={handlePaymentDetailsInputChange}
              placeholder="e.g., 07XXXXXXXX"
              required
              error={paymentDetailsErrors.mpesaNumber}
              disabled={isSavingDetails}
            />
          )}

          {paymentMethod === 'bank' && (
            <>
              <TextInput
                label="Bank Name"
                id="bankName"
                name="bankName"
                type="text"
                value={paymentDetailsForm.bankName}
                onChange={handlePaymentDetailsInputChange}
                placeholder="e.g., Equity Bank"
                required
                error={paymentDetailsErrors.bankName}
                disabled={isSavingDetails}
              />
              <TextInput
                label="Account Number"
                id="accountNumber"
                name="accountNumber"
                type="text"
                value={paymentDetailsForm.accountNumber}
                onChange={handlePaymentDetailsInputChange}
                placeholder="e.g., 1234567890"
                required
                error={paymentDetailsErrors.accountNumber}
                disabled={isSavingDetails}
              />
              <TextInput
                label="Account Name"
                id="accountName"
                name="accountName"
                type="text"
                value={paymentDetailsForm.accountName}
                onChange={handlePaymentDetailsInputChange}
                placeholder="e.g., John Doe"
                required
                error={paymentDetailsErrors.accountName}
                disabled={isSavingDetails}
              />
            </>
          )}
          <div className="flex justify-end mt-4">
            <Button type="submit" className="btn btn-primary" disabled={isSavingDetails}>
              {isSavingDetails ? <FaSpinner className="spinner mr-2" /> : null}
              {isSavingDetails ? 'Saving...' : 'Save Payment Details'}
            </Button>
          </div>
        </form>
      </div>

      {/* Payout History */}
      <div className="profile-section-card">
        <h3>Payout History</h3>
        {payoutHistory.length === 0 ? (
          <p className="placeholder-content">No payout requests yet.</p>
        ) : (
          <div className={styles.payoutTableContainer}>
            <table className={styles.payoutTable}>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Amount</th>
                  <th>Method</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {payoutHistory.map(payout => (
                  <tr key={payout.id}>
                    <td>{payout.requestedAt ? new Date(payout.requestedAt.toDate()).toLocaleDateString() : 'N/A'}</td>
                    <td>KES {payout.amount.toLocaleString()}</td>
                    <td>{payout.method}</td>
                    <td style={{color: payout.status === 'completed' ? 'var(--sys-success)' : 'var(--sys-warning)'}}>{payout.status.toUpperCase()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Payout Request Modal */}
      <Modal isOpen={isRequestModalOpen} onClose={() => setIsRequestModalOpen(false)} title="Request Payout">
        <p className="mb-4 text-text-color">You have KES <span style={{color: 'var(--sys-success)', fontWeight: 'bold'}}>{balance.toLocaleString()}</span> available for payout.</p>
        <TextInput
          label="Amount to Request (KES)"
          id="requestAmount"
          name="requestAmount"
          type="number"
          value={requestAmount}
          onChange={(e) => setRequestAmount(e.target.value)}
          placeholder="Enter amount"
          min="1"
          max={balance}
          required
          disabled={isRequestingPayout}
        />
        <p className="text-sm text-secondary-color mt-2 mb-4">
            Funds will be sent to your {paymentMethod === 'mpesa' ? 'Mpesa number' : 'bank account'}.
            Please ensure your details are up to date in the "Set Your Payment Choice" section.
        </p>
        <div className="flex justify-end gap-3 mt-4">
          <Button onClick={() => setIsRequestModalOpen(false)} className="btn btn-secondary" disabled={isRequestingPayout}>Cancel</Button>
          <Button
            onClick={handleRequestPayout}
            disabled={!requestAmount || parseFloat(requestAmount) <= 0 || parseFloat(requestAmount) > balance || isRequestingPayout}
            className="btn btn-primary"
          >
            {isRequestingPayout ? <FaSpinner className="spinner mr-2" /> : null}
            {isRequestingPayout ? 'Submitting...' : 'Submit Request'}
          </Button>
        </div>
      </Modal>
    </div>
  );
};

export default PaymentsTab;