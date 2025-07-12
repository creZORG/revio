// src/utils/validators.js
export const validateEmail = (email) => {
  const re = /\S+@\S+\.\S+/;
  return re.test(email);
};

export const validatePassword = (password) => {
  return password.length >= 6; // Minimum 6 characters
};

// Add other input validation logic here