import React, { useState, useEffect, useCallback } from 'react';
import { db } from '../../../../utils/firebaseConfig.js';
import { collection, query, getDocs, addDoc, Timestamp, orderBy, where } from 'firebase/firestore';
import { useAuth } from '../../../../hooks/useAuth.js';
import { useNotification } from '../../../../contexts/NotificationContext.jsx';
import Button from '../../../../components/Common/Button.jsx';
import LoadingSkeleton from '../../../../components/Common/LoadingSkeleton.jsx';
import Modal from '../../../../components/Common/Modal.jsx';

import styles from '../../organizer.module.css'; // Re-use organizer dashboard styles
import couponStyles from '../Forms/CouponCreatorWizard/CouponCreatorWizard.module.css'; // Specific coupon styles

import { FaPlus, FaTags, FaSpinner, FaEdit, FaTrash,FaCheckCircle,FaStar, FaInfoCircle, FaCalendarAlt, FaPercentage, FaDollarSign, FaUsers } from 'react-icons/fa';

const appId = "1:147113503727:web:1d9d351c30399b2970241a";

const PromotionsTab = () => {
  const { currentUser, isAuthenticated } = useAuth();
  const { showNotification } = useNotification();

  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreateCouponModal, setShowCreateCouponModal] = useState(false);

  // Form data for new coupon
  const [newCoupon, setNewCoupon] = useState({
    code: '',
    discountType: 'percentage', // 'percentage' or 'fixed'
    discountValue: '',
    usageLimit: '', // Total uses
    perUserLimit: '', // Uses per user
    expiryDate: '',
    applicableEventIds: [], // Array of event IDs
    attachedInfluencerId: '', // Optional
    status: 'active', // 'active' or 'inactive'
  });
  const [couponFormErrors, setCouponFormErrors] = useState({});
  const [isSubmittingCoupon, setIsSubmittingCoupon] = useState(false);

  // Fetch organizer's events for applicability dropdown
  const [organizerEvents, setOrganizerEvents] = useState([]);
  const [loadingOrganizerEvents, setLoadingOrganizerEvents] = useState(true);

  useEffect(() => {
    const fetchCoupons = async () => {
      if (!currentUser?.uid) return;
      setLoading(true);
      try {
        const q = query(
          // FIX: Corrected collection path for coupons
          collection(db, `artifacts/${appId}/public/data_for_app/coupons`),
          where('organizerId', '==', currentUser.uid),
          orderBy('createdAt', 'desc')
        );
        const snapshot = await getDocs(q);
        const fetchedCoupons = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setCoupons(fetchedCoupons);
      } catch (err) {
        console.error("Error fetching coupons:", err);
        setError("Failed to load coupons.");
        showNotification("Failed to load coupons.", 'error');
      } finally {
        setLoading(false);
      }
    };

    const fetchOrganizerEvents = async () => {
      if (!currentUser?.uid) return;
      setLoadingOrganizerEvents(true);
      try {
        const q = query(
          // This path was already correct from previous fixes
          collection(db, `artifacts/${appId}/public/data_for_app/events`),
          where('organizerId', '==', currentUser.uid),
          where('status', '==', 'approved'),
          where('eventType', '==', 'ticketed'),
          orderBy('startDate', 'desc')
        );
        const snapshot = await getDocs(q);
        const events = snapshot.docs.map(doc => ({ id: doc.id, name: doc.data().eventName }));
        setOrganizerEvents(events);
      } catch (err) {
        console.error("Error fetching organizer events for coupons:", err);
        showNotification("Failed to load your events for coupon applicability.", 'error');
      } finally {
        setLoadingOrganizerEvents(false);
      }
    };

    if (isAuthenticated && currentUser) {
      fetchCoupons();
      fetchOrganizerEvents();
    }
  }, [isAuthenticated, currentUser, showNotification]);


  const handleCouponInputChange = useCallback((e) => {
    const { name, value, type, checked } = e.target;
    if (type === 'checkbox' && name === 'applicableEventIds') {
        const eventId = e.target.value;
        setNewCoupon(prev => {
            const currentEventIds = prev.applicableEventIds || [];
            if (checked) {
                return { ...prev, applicableEventIds: [...currentEventIds, eventId] }; // FIX: Corrected immutable update
            } else {
                return { ...prev, applicableEventIds: currentEventIds.filter(id => id !== eventId) };
            }
        });
    } else {
        setNewCoupon(prev => ({ ...prev, [name]: type === 'number' ? parseFloat(value) : value })); // FIX: Parse numbers
    }
    setCouponFormErrors(prev => ({ ...prev, [name]: undefined }));
  }, []);

  const validateCouponForm = useCallback(() => {
    const errors = {};
    if (!newCoupon.code.trim()) errors.code = 'Coupon code is required.';
    if (!newCoupon.discountValue || parseFloat(newCoupon.discountValue) <= 0) errors.discountValue = 'Discount value must be a positive number.';
    if (newCoupon.discountType === 'percentage' && (parseFloat(newCoupon.discountValue) > 100 || parseFloat(newCoupon.discountValue) < 0)) errors.discountValue = 'Percentage must be between 0 and 100.';
    if (newCoupon.usageLimit && (isNaN(parseInt(newCoupon.usageLimit)) || parseInt(newCoupon.usageLimit) <= 0)) errors.usageLimit = 'Usage limit must be a positive integer.';
    if (newCoupon.perUserLimit && (isNaN(parseInt(newCoupon.perUserLimit)) || parseInt(newCoupon.perUserLimit) <= 0)) errors.perUserLimit = 'Per user limit must be a positive integer.';
    if (!newCoupon.expiryDate) errors.expiryDate = 'Expiry date is required.';
    else if (new Date(newCoupon.expiryDate) < new Date()) errors.expiryDate = 'Expiry date cannot be in the past.';

    setCouponFormErrors(errors);
    return Object.keys(errors).length === 0;
  }, [newCoupon]);

  const handleCreateCoupon = async () => {
    if (!isAuthenticated || !currentUser) {
      showNotification('You must be logged in to create coupons.', 'error');
      return;
    }
    if (!validateCouponForm()) {
      showNotification('Please correct the errors in the coupon form.', 'error');
      return;
    }

    setIsSubmittingCoupon(true);
    showNotification('Creating coupon...', 'info');

    try {
      const couponsCollectionRef = collection(db, `artifacts/${appId}/public/data_for_app/coupons`); // FIX: Corrected collection path
      await addDoc(couponsCollectionRef, {
        ...newCoupon,
        discountValue: parseFloat(newCoupon.discountValue),
        usageLimit: newCoupon.usageLimit ? parseInt(newCoupon.usageLimit) : null,
        perUserLimit: newCoupon.perUserLimit ? parseInt(newCoupon.perUserLimit) : null,
        expiryDate: Timestamp.fromDate(new Date(newCoupon.expiryDate)), // Convert to Timestamp
        organizerId: currentUser.uid,
        createdAt: Timestamp.now(),
        usedCount: 0, // Initialize usage count
      });

      showNotification('Coupon created successfully!', 'success');
      setShowCreateCouponModal(false);
      setNewCoupon({ // Reset form
        code: '', discountType: 'percentage', discountValue: '', usageLimit: '', perUserLimit: '',
        expiryDate: '', applicableEventIds: [], attachedInfluencerId: '', status: 'active',
      });
      // Re-fetch coupons to update list
      const q = query(
        collection(db, `artifacts/${appId}/public/data_for_app/coupons`), // FIX: Corrected collection path
        where('organizerId', '==', currentUser.uid),
        orderBy('createdAt', 'desc')
      );
      const snapshot = await getDocs(q);
      setCoupons(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));

    } catch (err) {
      console.error("Error creating coupon:", err);
      showNotification('Failed to create coupon. ' + err.message, 'error');
    } finally {
      setIsSubmittingCoupon(false);
    }
  };

  const handleDeleteCoupon = async (couponId) => {
    if (!confirm('Are you sure you want to delete this coupon? This action cannot be undone.')) {
      return;
    }
    setIsSubmittingCoupon(true); // Use this to disable actions during delete
    showNotification('Deleting coupon...', 'info');
    try {
      await deleteDoc(doc(db, `artifacts/${appId}/public/data_for_app/coupons`, couponId)); // FIX: Corrected collection path
      showNotification('Coupon deleted successfully!', 'success');
      setCoupons(prev => prev.filter(coupon => coupon.id !== couponId));
    } catch (err) {
      console.error("Error deleting coupon:", err);
      showNotification('Failed to delete coupon. ' + err.message, 'error');
    } finally {
      setIsSubmittingCoupon(false);
    }
  };


  if (loading) {
    return (
      <div className="section-content" style={{ textAlign: 'center', padding: '50px' }}>
        <FaSpinner className={`${styles.spinner} ${styles.spin}`} style={{ fontSize: '3rem', color: 'var(--naks-primary)' }} />
        <p style={{ marginTop: '15px', color: 'var(--naks-text-secondary)' }}>Loading coupons...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-message-box">
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="section-content">
      <div className={styles.sectionHeader}>
        <h2 className={styles.sectionTitle}>Your Promotions</h2>
        <Button onClick={() => setShowCreateCouponModal(true)} className="btn btn-primary">
          <FaPlus /> Create New Coupon
        </Button>
      </div>

      {coupons.length === 0 && !loading ? (
        <div className="profile-section-card" style={{ textAlign: 'center', padding: '20px' }}>
          <p className="text-naks-text-secondary">You haven't created any coupons yet.</p>
          <p className="text-naks-text-secondary">Click "Create New Coupon" to get started!</p>
        </div>
      ) : (
        <div className={couponStyles.couponListGrid}>
          {coupons.map(coupon => (
            <div key={coupon.id} className={couponStyles.couponCard}>
              <div className={couponStyles.couponHeader}>
                <h3 className={couponStyles.couponCode}>{coupon.code}</h3>
                <span className={`${couponStyles.couponStatus} ${coupon.status === 'active' ? couponStyles.active : couponStyles.inactive}`}>
                  {coupon.status.toUpperCase()}
                </span>
              </div>
              <p className={couponStyles.couponDetail}>
                {coupon.discountType === 'percentage' ? `${coupon.discountValue}% OFF` : `KES ${coupon.discountValue} OFF`}
              </p>
              <p className={couponStyles.couponDetail}>
                <FaCalendarAlt /> Expires: {coupon.expiryDate ? new Date(coupon.expiryDate.toDate()).toLocaleDateString() : 'N/A'}
              </p>
              {coupon.usageLimit && (
                <p className={couponStyles.couponDetail}>
                  <FaUsers /> Uses: {coupon.usedCount || 0} / {coupon.usageLimit}
                </p>
              )}
              {coupon.perUserLimit && (
                <p className={couponStyles.couponDetail}>
                  <FaUsers /> Per User: {coupon.perUserLimit}
                </p>
              )}
              {coupon.applicableEventIds && coupon.applicableEventIds.length > 0 && (
                <p className={couponStyles.couponDetail}>
                  <FaInfoCircle /> Applicable to {coupon.applicableEventIds.length} event(s)
                </p>
              )}
              {coupon.attachedInfluencerId && (
                <p className={couponStyles.couponDetail}>
                  <FaStar /> Influencer: {coupon.attachedInfluencerId}
                </p>
              )}
              <div className={couponStyles.couponActions}>
                <Button className="btn btn-secondary btn-small" disabled>
                  <FaEdit /> Edit
                </Button>
                <Button onClick={() => handleDeleteCoupon(coupon.id)} className="btn btn-secondary btn-small" disabled={isSubmittingCoupon}>
                  <FaTrash /> Delete
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Coupon Modal */}
      <Modal isOpen={showCreateCouponModal} onClose={() => setShowCreateCouponModal(false)} title="Create New Coupon">
        <div className={couponStyles.couponForm}>
          <div className="form-group">
            <label htmlFor="couponCode" className="form-label">Coupon Code <span className="required-star">*</span></label>
            <input type="text" id="code" name="code" className="input-field" value={newCoupon.code} onChange={handleCouponInputChange} disabled={isSubmittingCoupon} placeholder="e.g., SUMMER20" />
            {couponFormErrors.code && <p className="error-message-box">{couponFormErrors.code}</p>}
          </div>

          <div className="form-group">
            <label htmlFor="discountType" className="form-label">Discount Type <span className="required-star">*</span></label>
            <select id="discountType" name="discountType" className="input-field" value={newCoupon.discountType} onChange={handleCouponInputChange} disabled={isSubmittingCoupon}>
              <option value="percentage">Percentage (%)</option>
              <option value="fixed">Fixed Amount (KES)</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="discountValue" className="form-label">Discount Value <span className="required-star">*</span></label>
            <input type="number" id="discountValue" name="discountValue" className="input-field" value={newCoupon.discountValue} onChange={handleCouponInputChange} disabled={isSubmittingCoupon} min="0" step="0.01" placeholder={newCoupon.discountType === 'percentage' ? 'e.g., 20 (for 20%)' : 'e.g., 500 (for KES 500)'} />
            {couponFormErrors.discountValue && <p className="error-message-box">{couponFormErrors.discountValue}</p>}
          </div>

          <div className="form-group">
            <label htmlFor="usageLimit" className="form-label">Total Usage Limit <span className="optional-label">(Optional)</span></label>
            <input type="number" id="usageLimit" name="usageLimit" className="input-field" value={newCoupon.usageLimit} onChange={handleCouponInputChange} disabled={isSubmittingCoupon} min="1" placeholder="e.g., 100 (total uses)" />
            {couponFormErrors.usageLimit && <p className="error-message-box">{couponFormErrors.usageLimit}</p>}
          </div>

          <div className="form-group">
            <label htmlFor="perUserLimit" className="form-label">Uses Per User <span className="optional-label">(Optional)</span></label>
            <input type="number" id="perUserLimit" name="perUserLimit" className="input-field" value={newCoupon.perUserLimit} onChange={handleCouponInputChange} disabled={isSubmittingCoupon} min="1" placeholder="e.g., 1 (one use per user)" />
            {couponFormErrors.perUserLimit && <p className="error-message-box">{couponFormErrors.perUserLimit}</p>}
          </div>

          <div className="form-group">
            <label htmlFor="expiryDate" className="form-label">Expiry Date <span className="required-star">*</span></label>
            <input type="date" id="expiryDate" name="expiryDate" className="input-field" value={newCoupon.expiryDate} onChange={handleCouponInputChange} disabled={isSubmittingCoupon} />
            {couponFormErrors.expiryDate && <p className="error-message-box">{couponFormErrors.expiryDate}</p>}
          </div>

          <div className="form-group">
            <label htmlFor="applicableEventIds" className="form-label">Applicable Events <span className="optional-label">(Optional)</span> <FaInfoCircle title="Select specific events this coupon can be used for. Leave blank for all events." style={{verticalAlign: 'middle', marginLeft: '5px', color: 'var(--naks-text-secondary)'}}/></label>
            {loadingOrganizerEvents ? (
                <p className="text-naks-text-secondary">Loading events...</p>
            ) : organizerEvents.length === 0 ? (
                <p className="text-naks-text-secondary">No ticketed events found for applicability.</p>
            ) : (
                <div className={couponStyles.checkboxGroup} style={{flexDirection: 'column', alignItems: 'flex-start'}}>
                    {organizerEvents.map(event => (
                        <label key={event.id} className="form-label">
                            <input
                                type="checkbox"
                                name="applicableEventIds"
                                value={event.id}
                                checked={(newCoupon.applicableEventIds || []).includes(event.id)}
                                onChange={handleCouponInputChange}
                                disabled={isSubmittingCoupon}
                            />
                            {event.name}
                        </label>
                    ))}
                </div>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="attachedInfluencerId" className="form-label">Attached Influencer ID <span className="optional-label">(Optional)</span> <FaInfoCircle title="Link this coupon to a specific influencer for tracking earnings." style={{verticalAlign: 'middle', marginLeft: '5px', color: 'var(--naks-text-secondary)'}}/></label>
            <input type="text" id="attachedInfluencerId" name="attachedInfluencerId" className="input-field" value={newCoupon.attachedInfluencerId} onChange={handleCouponInputChange} disabled={isSubmittingCoupon} placeholder="e.g., influencer_john_doe" />
          </div>

          <div className="form-group">
            <label htmlFor="status" className="form-label">Status <span className="required-star">*</span></label>
            <select id="status" name="status" className="input-field" value={newCoupon.status} onChange={handleCouponInputChange} disabled={isSubmittingCoupon}>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          <div className={couponStyles.actionButtons} style={{justifyContent: 'flex-end'}}>
            <Button onClick={() => setShowCreateCouponModal(false)} className="btn btn-secondary" disabled={isSubmittingCoupon}>Cancel</Button>
            <Button onClick={handleCreateCoupon} className="btn btn-primary" disabled={isSubmittingCoupon}>
              {isSubmittingCoupon ? <FaSpinner className="spinner" /> : <FaCheckCircle />}
              {isSubmittingCoupon ? 'Creating...' : 'Create Coupon'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default PromotionsTab;