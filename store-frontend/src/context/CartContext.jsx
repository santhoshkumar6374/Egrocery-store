import { createContext, useCallback, useEffect, useMemo, useState } from 'react';
import { cartApi } from '../api/cartApi';
import { useAuth } from '../hooks/useAuth';

export const CartContext = createContext(null);

const EMPTY_CART = { items: [], totalItems: 0, itemsTotal: 0, hasUnavailableItems: false, discountAmount: 0, payableTotal: 0 };

export function CartProvider({ children }) {
  const { isAuthenticated, isCustomer } = useAuth();
  const [cart, setCart] = useState(EMPTY_CART);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    if (!isCustomer) {
      setCart(EMPTY_CART);
      return;
    }
    setLoading(true);
    try {
      const { data } = await cartApi.get();
      setCart(data.data);
    } finally {
      setLoading(false);
    }
  }, [isCustomer]);

  useEffect(() => {
    if (isAuthenticated && isCustomer) {
      refresh();
    } else {
      setCart(EMPTY_CART);
    }
  }, [isAuthenticated, isCustomer, refresh]);

  const addItem = useCallback(async (productId, quantity) => {
    const { data } = await cartApi.addItem(productId, quantity);
    setCart(data.data);
    return data.data;
  }, []);

  const updateItem = useCallback(async (itemId, quantity) => {
    const { data } = await cartApi.updateItem(itemId, quantity);
    setCart(data.data);
    return data.data;
  }, []);

  const removeItem = useCallback(async (itemId) => {
    const { data } = await cartApi.removeItem(itemId);
    setCart(data.data);
    return data.data;
  }, []);

  const applyCoupon = useCallback(async (code) => {
    const { data } = await cartApi.applyCoupon(code);
    setCart(data.data);
    return data.data;
  }, []);

  const removeCoupon = useCallback(async () => {
    const { data } = await cartApi.removeCoupon();
    setCart(data.data);
    return data.data;
  }, []);

  const value = useMemo(
    () => ({ cart, loading, refresh, addItem, updateItem, removeItem, applyCoupon, removeCoupon }),
    [cart, loading, refresh, addItem, updateItem, removeItem, applyCoupon, removeCoupon],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}