import { createContext, useCallback, useEffect, useMemo, useState } from 'react';
import { wishlistApi } from '../api/wishlistApi';
import { useAuth } from '../hooks/useAuth';

export const WishlistContext = createContext(null);

export function WishlistProvider({ children }) {
  const { isAuthenticated, isCustomer } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    if (!isCustomer) {
      setItems([]);
      return;
    }
    setLoading(true);
    try {
      const { data } = await wishlistApi.list();
      setItems(data.data);
    } finally {
      setLoading(false);
    }
  }, [isCustomer]);

  useEffect(() => {
    if (isAuthenticated && isCustomer) {
      refresh();
    } else {
      setItems([]);
    }
  }, [isAuthenticated, isCustomer, refresh]);

  const productIds = useMemo(() => new Set(items.map((i) => i.productId)), [items]);

  const isWishlisted = useCallback((productId) => productIds.has(productId), [productIds]);

  const toggle = useCallback(
    async (productId) => {
      if (productIds.has(productId)) {
        await wishlistApi.remove(productId);
        setItems((prev) => prev.filter((i) => i.productId !== productId));
        return false;
      }
      const { data } = await wishlistApi.add(productId);
      setItems((prev) => [data.data, ...prev]);
      return true;
    },
    [productIds],
  );

  const remove = useCallback(async (productId) => {
    await wishlistApi.remove(productId);
    setItems((prev) => prev.filter((i) => i.productId !== productId));
  }, []);

  const value = useMemo(
    () => ({ items, loading, isWishlisted, toggle, remove, refresh }),
    [items, loading, isWishlisted, toggle, remove, refresh],
  );

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
}