// src/services/functionsService.js
import { functions } from '../utils/firebaseConfig.js';
import { httpsCallable } from 'firebase/functions';

export const callCloudFunction = async (functionName, data) => {
  try {
    const callable = httpsCallable(functions, functionName);
    const result = await callable(data);
    return result.data;
  } catch (error) {
    console.error(`Error calling Cloud Function ${functionName}:`, error.message, error.code, error.details);
    throw error;
  }
};

export const sendVerificationEmail = async (email) => {
  return callCloudFunction('sendVerificationEmail', { email });
};

export const sendWelcomeEmail = async (email, username) => {
  return callCloudFunction('sendWelcomeEmail', { email, username });
};

export const assignPromoCode = async (userId, code) => {
  return callCloudFunction('assignPromoCode', { userId, code });
};

// UPDATED: Function to upload image via Cloud Function, now passing contentType
export const uploadImageToStorage = async (imageData, fileName, contentType) => {
  return callCloudFunction('uploadImageToStorage', { imageData, fileName, contentType });
};