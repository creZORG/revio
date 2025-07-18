// src/services/couponService.js
import { db } from '../utils/firebaseConfig';
import { collection, addDoc, query, where, getDocs, serverTimestamp } from 'firebase/firestore';

const couponsCollection = collection(db, 'coupons');

export const createCoupon = async (couponData, organizerId) => {
  try {
    // Basic validation
    if (!organizerId || !couponData.eventId || !couponData.couponCode || !couponData.discountValue || !couponData.validFrom || !couponData.validUntil) {
      throw new Error("Missing required coupon fields.");
    }

    // TODO: Implement logic to check if couponCode is unique for this event/organizer
    // TODO: Look up influencer by username if provided and link their UID

    const docRef = await addDoc(couponsCollection, {
      ...couponData,
      organizerId: organizerId,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      timesUsed: 0,
      isActive: true, // Default status
    });
    console.log("Coupon created with ID: ", docRef.id);
    return { id: docRef.id, ...couponData };
  } catch (e) {
    console.error("Error adding coupon: ", e);
    throw e;
  }
};

export const getOrganizerCoupons = async (organizerId) => {
  if (!organizerId) {
    return [];
  }
  try {
    const q = query(couponsCollection, where("organizerId", "==", organizerId));
    const querySnapshot = await getDocs(q);
    const coupons = [];
    querySnapshot.forEach((doc) => {
      coupons.push({ id: doc.id, ...doc.data() });
    });
    return coupons;
  } catch (e) {
    console.error("Error fetching organizer coupons: ", e);
    throw e;
  }
};

// TODO: Add functions for updateCoupon, deleteCoupon (soft delete), etc.