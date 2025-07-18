// src/pages/Organizer/Dashboard/Forms/Promotions/CouponCreator.jsx
import React, { useState, useEffect } from 'react';
import styles from '../../Tabs/CreateEventWizard.module.css'; // Reusing wizard styles for form elements
import { useAuth } from '../../../../../hooks/useAuth.js';
import { useNotification } from '../../../../../contexts/NotificationContext.jsx';
import { getOrganizerEvents } from '../../../../../services/eventApiService.js'; // To fetch events
import TextInput from '../../../../../components/Common/TextInput.jsx';
import Button from '../../../../../components/Common/Button.jsx';
import LoadingSkeleton from '../../../../../components/Common/LoadingSkeleton.jsx';

const CouponCreator = () => {
  const { currentUser, loadingAuth } = useAuth();
  const { showNotification } = useNotification();
  const [events, setEvents] = useState([]);
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [couponData, setCouponData] = useState({
    eventId: '',
    couponCode: '',
    discountType: 'percentage', // 'percentage' or 'fixed'
    discountValue: '',
    usageLimit: '', // Optional
    validFrom: '',
    validUntil: '',
    influencerUsername: '', // To attach to an influencer
  });

  useEffect(() => {
    const fetchOrganizerEvents = async () => {
      if (!currentUser?.uid) {
        setLoadingEvents(false);
        return;
      }
      setLoadingEvents(true);
      try {
        const fetchedEvents = await getOrganizerEvents(currentUser.uid);
        setEvents(fetchedEvents);
      } catch (error) {
        console.error("Failed to fetch organizer events for coupon creator:", error);
        showNotification("Failed to load your events. " + error.message, 'error');
      } finally {
        setLoadingEvents(false);
      }
    };

    if (!loadingAuth) {
      fetchOrganizerEvents();
    }
  }, [currentUser, loadingAuth, showNotification]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCouponData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!currentUser?.uid) {
      showNotification('You must be logged in to create a coupon.', 'error');
      return;
    }
    // TODO: Add client-side validation
    console.log('Creating coupon with data:', couponData);
    showNotification('Coupon creation initiated...', 'info');

    try {
      // TODO: Implement couponService.createCoupon(couponData, currentUser.uid);
      // This service call would:
      // 1. Validate couponData
      // 2. Look up influencer by username (userService.getUserByUsername)
      // 3. Save coupon to Firestore, linking to event and influencer (if found)
      // 4. Potentially trigger a Cloud Function to generate unique codes if needed

      // Simulate success
      await new Promise(resolve => setTimeout(resolve, 1000)); 
      showNotification('Coupon created successfully!', 'success');
      // Reset form
      setCouponData({
        eventId: '', couponCode: '', discountType: 'percentage', discountValue: '',
        usageLimit: '', validFrom: '', validUntil: '', influencerUsername: '',
      });
    } catch (error) {
      console.error("Error creating coupon:", error);
      showNotification(`Coupon creation failed: ${error.message}`, 'error');
    }
  };

  if (loadingEvents) {
    return <LoadingSkeleton count={3} />;
  }

  if (events.length === 0) {
    return (
      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 text-yellow-800 rounded-md mt-6">
        <p className="font-semibold">You need to create an event first before creating coupons.</p>
        <p className="text-sm">Go to the "Create Event" tab to get started.</p>
      </div>
    );
  }

  return (
    <div className="mt-8 p-4 border border-gray-200 rounded-lg bg-gray-50">
      <h3 className="text-xl font-semibold mb-4">Create New Coupon</h3>
      <form onSubmit={handleSubmit}>
        <div className={styles.formGroup}>
          <label htmlFor="eventId" className={styles.formLabel}>Select Event</label>
          <select
            id="eventId"
            name="eventId"
            value={couponData.eventId}
            onChange={handleChange}
            className={styles.formSelect}
            required
          >
            <option value="">Choose an event</option>
            {events.map(event => (
              <option key={event.id} value={event.id}>{event.eventName} ({event.status.replace(/_/g, ' ')})</option>
            ))}
          </select>
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="couponCode" className={styles.formLabel}>Coupon Code</label>
          <TextInput
            id="couponCode"
            name="couponCode"
            value={couponData.couponCode}
            onChange={handleChange}
            placeholder="e.g., NAKURU20, SAVEBIG"
            required
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="discountType" className={styles.formLabel}>Discount Type</label>
          <select
            id="discountType"
            name="discountType"
            value={couponData.discountType}
            onChange={handleChange}
            className={styles.formSelect}
          >
            <option value="percentage">Percentage (%)</option>
            <option value="fixed">Fixed Amount (KES)</option>
          </select>
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="discountValue" className={styles.formLabel}>Discount Value</label>
          <TextInput
            id="discountValue"
            name="discountValue"
            value={couponData.discountValue}
            onChange={handleChange}
            type="number"
            placeholder={couponData.discountType === 'percentage' ? 'e.g., 10 (for 10%)' : 'e.g., 500 (for KES 500)'}
            required
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="usageLimit" className={styles.formLabel}>Usage Limit (Optional)</label>
          <TextInput
            id="usageLimit"
            name="usageLimit"
            value={couponData.usageLimit}
            onChange={handleChange}
            type="number"
            placeholder="e.g., 100 (total uses)"
          />
          <p className="text-sm text-gray-500 mt-1">Leave empty for unlimited uses.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className={styles.formGroup}>
            <label htmlFor="validFrom" className={styles.formLabel}>Valid From</label>
            <input
              type="date"
              id="validFrom"
              name="validFrom"
              value={couponData.validFrom}
              onChange={handleChange}
              className={styles.formInput}
              required
            />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="validUntil" className={styles.formLabel}>Valid Until</label>
            <input
              type="date"
              id="validUntil"
              name="validUntil"
              value={couponData.validUntil}
              onChange={handleChange}
              className={styles.formInput}
              required
            />
          </div>
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="influencerUsername" className={styles.formLabel}>Attach to Influencer Username (Optional)</label>
          <TextInput
            id="influencerUsername"
            name="influencerUsername"
            value={couponData.influencerUsername}
            onChange={handleChange}
            placeholder="e.g., influencer_mark"
          />
          <p className="text-sm text-gray-500 mt-1">If specified, only this influencer can use/share this code.</p>
        </div>

        <Button type="submit" primary className="w-full mt-4">Create Coupon</Button>
      </form>
    </div>
  );
};

export default CouponCreator;