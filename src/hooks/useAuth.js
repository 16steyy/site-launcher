import { useCallback, useEffect, useState } from "react";

import {
  AUTH_CHANGED_EVENT,
  clearApiSession,
  getStoredAccessToken,
} from "../api/client.js";
import {
  ensureValidAccessToken,
  fetchMe,
  loginAndPersist,
  logoutAccount,
  mapAuthErrorMessage,
  registerAndPersist,
} from "../api/auth.js";

export function useAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadUser = useCallback(async () => {
    setLoading(true);
    try {
      const token = await ensureValidAccessToken();
      if (!token) {
        setUser(null);
        return;
      }
      const me = await fetchMe(token);
      setUser(me);
    } catch {
      clearApiSession();
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUser();

    function onAuthChanged() {
      loadUser();
    }

    window.addEventListener(AUTH_CHANGED_EVENT, onAuthChanged);
    return () => window.removeEventListener(AUTH_CHANGED_EVENT, onAuthChanged);
  }, [loadUser]);

  const login = useCallback(async (credentials, t) => {
    try {
      await loginAndPersist(credentials);
      const token = getStoredAccessToken();
      const me = await fetchMe(token);
      setUser(me);
      return { ok: true, user: me };
    } catch (error) {
      return {
        ok: false,
        error: mapAuthErrorMessage(error?.message, "login", t),
      };
    }
  }, []);

  const register = useCallback(async (payload, t) => {
    try {
      await registerAndPersist(payload);
      const token = getStoredAccessToken();
      const me = await fetchMe(token);
      setUser(me);
      return { ok: true, user: me };
    } catch (error) {
      return {
        ok: false,
        error: mapAuthErrorMessage(error?.message, "register", t),
        needsVerification:
          String(error?.message || "")
            .toLowerCase()
            .includes("verification") ||
          error?.details?.requires_verification === true,
      };
    }
  }, []);

  const logout = useCallback(async () => {
    const token = getStoredAccessToken();
    await logoutAccount(token);
    setUser(null);
  }, []);

  return {
    user,
    loading,
    isAuthenticated: Boolean(user),
    login,
    register,
    logout,
    refresh: loadUser,
  };
}
