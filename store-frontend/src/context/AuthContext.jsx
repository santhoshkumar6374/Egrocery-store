import { createContext, useCallback, useEffect, useMemo, useState } from 'react';
import { authApi } from '../api/authApi';
import { getStoredAuth, setStoredAuth } from '../api/axiosClient';
import { ROLES } from '../utils/constants';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [auth, setAuth] = useState(() => getStoredAuth());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = getStoredAuth();
    if (!stored?.accessToken) {
      setLoading(false);
      return;
    }

    // Re-hydrate the profile on load in case the cached copy is stale
    // (e.g. an admin blocked the account, or the name/roles changed elsewhere).
    authApi
      .getProfile()
      .then(({ data }) => {
        const refreshed = { ...stored, user: data.data };
        setStoredAuth(refreshed);
        setAuth(refreshed);
      })
      .catch(() => {
        setStoredAuth(null);
        setAuth(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const applyAuthPayload = useCallback((payload) => {
    const nextAuth = {
      accessToken: payload.accessToken,
      refreshToken: payload.refreshToken,
      user: payload.user,
    };
    setStoredAuth(nextAuth);
    setAuth(nextAuth);
    return nextAuth.user;
  }, []);

  const login = useCallback(
    async (email, password) => {
      const { data } = await authApi.login({ email, password });
      return applyAuthPayload(data.data);
    },
    [applyAuthPayload],
  );

  const register = useCallback(
    async (payload) => {
      const { data } = await authApi.register(payload);
      return applyAuthPayload(data.data);
    },
    [applyAuthPayload],
  );

  const logout = useCallback(async () => {
    const stored = getStoredAuth();
    try {
      if (stored?.refreshToken) {
        await authApi.logout(stored.refreshToken);
      }
    } catch {
      // Best-effort server-side revoke; local session is cleared regardless.
    }
    setStoredAuth(null);
    setAuth(null);
  }, []);

  const refreshProfile = useCallback(async () => {
    const { data } = await authApi.getProfile();
    setAuth((prev) => {
      const next = { ...prev, user: data.data };
      setStoredAuth(next);
      return next;
    });
    return data.data;
  }, []);

  const value = useMemo(() => {
    const roles = auth?.user?.roles ?? [];
    return {
      user: auth?.user ?? null,
      isAuthenticated: Boolean(auth?.accessToken),
      isAdmin: roles.includes(ROLES.ADMIN),
      isCustomer: roles.includes(ROLES.CUSTOMER),
      loading,
      login,
      register,
      logout,
      refreshProfile,
    };
  }, [auth, loading, login, register, logout, refreshProfile]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}