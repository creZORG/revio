// src/utils/dateConverters.js
import { Timestamp } from 'firebase/firestore'; // Import client-side Timestamp for instanceof check

/**
 * Converts various date representations (Firestore Timestamp, {seconds, nanoseconds} object, ISO string, number)
 * into a native JavaScript Date object.
 * @param {any} value - The value to convert.
 * @returns {Date|null} A Date object or null if conversion fails.
 */
const toJSDate = (value) => {
  if (!value) return null; // Handles null, undefined

  if (value instanceof Date) {
    return value; // Already a Date object
  }

  // Handle Firestore Timestamp objects (from direct Firestore reads)
  if (value instanceof Timestamp) {
    return value.toDate();
  }

  // Handle plain objects that look like Firestore Timestamps (e.g., from Cloud Functions JSON serialization)
  if (typeof value === 'object' && value.seconds !== undefined && value.nanoseconds !== undefined) {
    // Note: Some serialized Timestamps might use _seconds, _nanoseconds
    const seconds = value.seconds || value._seconds;
    const nanoseconds = value.nanoseconds || value._nanoseconds;
    if (seconds !== undefined && nanoseconds !== undefined) {
      return new Date(seconds * 1000 + nanoseconds / 1000000);
    }
  }

  // Handle ISO 8601 strings (from Cloud Functions after server-side conversion)
  if (typeof value === 'string') {
    const date = new Date(value);
    return isNaN(date.getTime()) ? null : date; // Check for invalid date
  }

  // Handle numeric timestamps (e.g., milliseconds since epoch)
  if (typeof value === 'number') {
    const date = new Date(value);
    return isNaN(date.getTime()) ? null : date;
  }

  return null; // Fallback for unhandled types
};

/**
 * Recursively converts all date-like values within an object or array
 * to native JavaScript Date objects using the toJSDate helper.
 * @param {any} data - The data structure to traverse.
 * @returns {any} The data structure with all date-like values converted to Date objects.
 */
export const convertDatesInObject = (data) => {
  if (data === null || typeof data !== 'object') {
    return data;
  }

  // If it's a direct date-like value, convert it
  const convertedDate = toJSDate(data);
  if (convertedDate instanceof Date) {
    return convertedDate;
  }

  // If it's an array, map over its elements
  if (Array.isArray(data)) {
    return data.map(item => convertDatesInObject(item));
  }

  // If it's a plain object, recursively convert its properties
  const newData = {};
  for (const key in data) {
    if (Object.prototype.hasOwnProperty.call(data, key)) {
      newData[key] = convertDatesInObject(data[key]);
    }
  }
  return newData;
};