import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { verifyToken, login as apiLogin, logout as apiLogout, register as apiRegister, googleLogin as apiGoogleLogin } from '../api/auth.api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser]       = useState(null);
  const [role, setRole]       = useState(null);
  const [token, setToken]     = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Restore session on mount
  useEffect(() => {
    const restore = async () => {
      try {
        const res = await verifyToken();
        if (res.success) {
          setUser(res.data.user);
          setRole(res.data.user.role);
          setToken(localStorage.getItem('kaiser_token'));
        }
      } catch {
        // No valid session
        localStorage.removeItem('kaiser_token');
      } finally {
        setIsLoading(false);
      }
    };
    restore();
  }, []);

  // Listen for global 401
  useEffect(() => {
    const handle401 = () => {
      setUser(null);
      setRole(null);
      setToken(null);
      localStorage.removeItem('kaiser_token');
    };
    window.addEventListener('kaiser:unauthorized', handle401);
    return () => window.removeEventListener('kaiser:unauthorized', handle401);
  }, []);

  const login = useCallback(async (credentials) => {
    const res = await apiLogin(credentials);
    if (res.success) {
      setUser(res.data.user);
      setRole(res.data.user.role);
      setToken(res.data.token);
    }
    return res;
  }, []);

  const register = useCallback(async (payload) => {
    const res = await apiRegister(payload);
    if (res.success) {
      setUser(res.data.user);
      setRole(res.data.user.role);
      setToken(res.data.token);
    }
    return res;
  }, []);

  const googleLogin = useCallback(async (credential) => {
    const res = await apiGoogleLogin(credential);
    if (res.success) {
      setUser(res.data.user);
      setRole(res.data.user.role);
      setToken(res.data.token);
    }
    return res;
  }, []);

  const logout = useCallback(async () => {
    await apiLogout();
    setUser(null);
    setRole(null);
    setToken(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, role, token, isLoading, login, register, googleLogin, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};

export default AuthContext;
