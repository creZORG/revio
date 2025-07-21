import React, { createContext, useState, useContext, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '../hooks/useAuth.js';
import { getCart, updateCart, clearUserCart, subscribeToCart } from '../services/cartService.jsx';
import { deleteField } from 'firebase/firestore';

export const CartContext = createContext();

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
  const [totalTicketsCount, setTotalTicketsCount] = useState(0); // Declared here
  const [loadingCart, setLoadingCart] = useState(true);

  const isInitialCartLoadComplete = useRef(false);
  const isUpdatingOptimistically = useRef(false);


  // Effect for subscribing to cart changes (Firestore or Local Storage)
  useEffect(() => {
    let unsubscribe = () => {};

    if (!isInitialCartLoadComplete.current) {
      setLoadingCart(true);
    }

    if (isAuthenticated && currentUser?.uid) {
      console.log("CartContext: Authenticated user detected. Subscribing to Firestore cart.");
      unsubscribe = subscribeToCart(currentUser.uid, (items) => {
        if (JSON.stringify(items) !== JSON.stringify(cartItems)) {
            console.log("CartContext: Firestore update received and applied:", items);
            setCartItems(items);
        } else {
            console.log("CartContext: Firestore update received, but data is identical to current state. Skipping setState.");
        }

        if (isInitialCartLoadComplete.current === false) {
            setLoadingCart(false);
            isInitialCartLoadComplete.current = true;
        }
      });
    } else {
      console.log("CartContext: Unauthenticated user. Loading cart from local storage.");
      const localCart = JSON.parse(localStorage.getItem('naksYetuGuestCart') || '{}');
      setCartItems(localCart);
      if (isInitialCartLoadComplete.current === false) {
        setLoadingCart(false);
        isInitialCartLoadComplete.current = true;
      }
    }

    return () => {
      if (unsubscribe) {
        console.log("CartContext: Unsubscribing from cart changes.");
        unsubscribe();
      }
    };
  }, [isAuthenticated, currentUser?.uid]);


  // Effect to save guest cart to local storage whenever cartItems changes AND user is not authenticated
  useEffect(() => {
    if (isInitialCartLoadComplete.current && !isAuthenticated) {
      console.log("CartContext: Saving guest cart to local storage:", cartItems);
      localStorage.setItem('naksYetuGuestCart', JSON.stringify(cartItems));
    }
  }, [cartItems, isAuthenticated]);


  useEffect(() => {
    let count = 0;
    for (const ticketId in cartItems) {
      count += cartItems[ticketId].quantity || 0;
    }
    setTotalTicketsCount(count);
  }, [cartItems]);

  // Cart Actions
  const updateCartItemQuantity = useCallback(async (ticketObject, newQuantity) => {
    const ticketId = ticketObject.id;

    setCartItems(prevItems => {
      const updatedItems = { ...prevItems };
      const quantityToSet = Math.max(0, newQuantity);

      if (quantityToSet === 0) {
        delete updatedItems[ticketId];
      } else {
        updatedItems[ticketId] = { ...ticketObject, quantity: quantityToSet };
      }
      console.log("CartContext: Optimistically updated local cart:", updatedItems);
      return updatedItems;
    });

    if (isAuthenticated && currentUser?.uid) {
      const firestoreUpdateData = {};
      if (newQuantity <= 0) {
        firestoreUpdateData[ticketId] = deleteField();
      } else {
        firestoreUpdateData[ticketId] = { ...ticketObject, quantity: newQuantity };
      }
      console.log("CartContext: Sending update to Firestore:", firestoreUpdateData);
      try {
        await updateCart(currentUser.uid, firestoreUpdateData);
      } catch (error) {
        console.error("CartContext: Failed to update cart in Firestore. Consider implementing rollback or re-fetching.", error);
      }
    }
  }, [isAuthenticated, currentUser?.uid]);


  const removeCartItem = useCallback(async (ticketId) => {
    setCartItems(prevItems => {
      const newItems = { ...prevItems };
      delete newItems[ticketId];
      return newItems;
    });

    if (isAuthenticated && currentUser?.uid) {
      try {
        await updateCart(currentUser.uid, { [ticketId]: deleteField() });
      } catch (error) {
        console.error("CartContext: Failed to remove cart item from Firestore. Reverting optimistic update.", error);
      }
    }
  }, [isAuthenticated, currentUser?.uid]);


  const clearCart = useCallback(async () => {
    setCartItems({});
    if (isAuthenticated && currentUser?.uid) {
        try {
            await clearUserCart(currentUser.uid);
        } catch (error) {
            console.error("CartContext: Failed to clear cart in Firestore. Reverting optimistic update.", error);
        }
    } else {
      localStorage.removeItem('naksYetuGuestCart');
    }
  }, [isAuthenticated, currentUser?.uid]);


  const contextValue = React.useMemo(() => ({
    cartItems,
    totalTicketsCount, // Correctly included here
    loadingCart,
    updateCartItemQuantity,
    removeCartItem,
    clearCart,
  }), [cartItems, totalTicketsCount, loadingCart, updateCartItemQuantity, removeCartItem, clearCart]);

  return (
    <CartContext.Provider value={contextValue}>
      {!authLoading && !loadingCart ? children : (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', fontSize: '1.2em', color: 'var(--naks-text-primary)' }}>
          Loading Naks Yetu...
        </div>
      )}
    </CartContext.Provider>
  );
};