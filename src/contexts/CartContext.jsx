// /src/contexts/CartContext.jsx
import React, { createContext, useState, useContext, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '../hooks/useAuth.js'; 
import { getCart, updateCart, clearUserCart, subscribeToCart } from '../services/cartService.jsx'; 

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const { currentUser, isAuthenticated, loading: authLoading } = useAuth(); 
  const [cartItems, setCartItems] = useState({});
  const [totalTicketsCount, setTotalTicketsCount] = useState(0); 
  const [loadingCart, setLoadingCart] = useState(true); 

  // Ref to prevent initial load from overwriting cart when isAuthenticated is still false
  const isInitialAuthCheckComplete = useRef(false);

  useEffect(() => {
    let unsubscribe = () => {}; 

    if (isAuthenticated && currentUser?.uid) {
      // User is authenticated: subscribe to Firestore cart
      setLoadingCart(true);
      unsubscribe = subscribeToCart(currentUser.uid, (items) => {
        setCartItems(items);
        setLoadingCart(false);
      });
      // TODO: If there's a local guest cart, merge it into Firestore cart upon login
      // This is a more advanced feature not covered in this specific task.
    } else {
      // User is NOT authenticated: load from local storage
      const localCart = JSON.parse(localStorage.getItem('naksYetuGuestCart') || '{}');
      setCartItems(localCart);
      setLoadingCart(false);
    }

    isInitialAuthCheckComplete.current = true; // Mark initial auth check as complete

    return () => {
      if (unsubscribe) {
        unsubscribe(); // Unsubscribe from Firestore if active
      }
    };
  }, [isAuthenticated, currentUser?.uid]);

  // Effect to save guest cart to local storage whenever cartItems changes AND user is not authenticated
  useEffect(() => {
    if (isInitialAuthCheckComplete.current && !isAuthenticated) {
      localStorage.setItem('naksYetuGuestCart', JSON.stringify(cartItems));
    }
  }, [cartItems, isAuthenticated]);


  useEffect(() => {
    let count = 0;
    for (const ticketId in cartItems) {
      count += cartItems[ticketId];
    }
    setTotalTicketsCount(count);
  }, [cartItems]);

  // Cart Actions - now handle both authenticated (Firestore) and unauthenticated (local storage)
  const updateCartItemQuantity = useCallback(async (ticketId, newQuantity) => {
    const qty = Math.max(0, newQuantity);
    
    setCartItems(prevItems => {
      const newItems = { ...prevItems };
      if (qty === 0) {
        delete newItems[ticketId]; // Correctly remove item from state if quantity is 0
      } else {
        newItems[ticketId] = qty;
      }
      return newItems;
    });

    if (isAuthenticated && currentUser?.uid) {
      // For authenticated users, update Firestore
      await updateCart(currentUser.uid, { ...cartItems, [ticketId]: qty === 0 ? deleteField() : qty });
    } 
    // For unauthenticated users, the useEffect will save to local storage
  }, [isAuthenticated, currentUser?.uid, cartItems]); // Add cartItems to dependency array for Firestore update

  const clearCart = useCallback(async () => {
    setCartItems({}); // Optimistic clear of local state
    if (isAuthenticated && currentUser?.uid) {
        await clearUserCart(currentUser.uid); // Clear in Firestore
    } else {
        localStorage.removeItem('naksYetuGuestCart'); // Clear local storage for guests
    }
  }, [isAuthenticated, currentUser?.uid]);


  const contextValue = React.useMemo(() => ({
    cartItems,
    totalTicketsCount,
    loadingCart, 
    updateCartItemQuantity, // Only expose this single update function
    clearCart,
    // addToCart and removeFromCart are now handled by updateCartItemQuantity
  }), [cartItems, totalTicketsCount, loadingCart, updateCartItemQuantity, clearCart]);

  return (
    <CartContext.Provider value={contextValue}>
      {!authLoading && !loadingCart ? children : <div>Loading Cart...</div>} 
    </CartContext.Provider>
  );
};