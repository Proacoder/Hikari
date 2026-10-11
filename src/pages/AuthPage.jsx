import React, { useState, useCallback } from 'react';
import { useNavigate, useSearchParams, useLocation, Link } from 'react-router-dom';
import { Shield, User, Lock, Phone, ArrowRight, CheckCircle2, BadgeCheck, AlertCircle, Eye, EyeOff, Info } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { Card } from '../components/common/Card';
import { DEMO_CITIZENS, MOCK_USERS } from '../utils/mockData';

// ── Input sanitization ──────────────────────────────────────────────────────
const sanitizeInput = (str) => {
  if (typeof str !== 'string') return '';
  return str.replace(/[<>]/g, '');
};

// ── Validation helpers ──────────────────────────────────────────────────────
const validateEmail = (email) => {
  if (!email.trim()) return 'Email is required.';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()))
    return 'Please enter a valid email address.';
  if (email.trim().length > 254) return 'Email is too long.';
  return '';
};

const validatePassword = (password, isRegister = false) => {
  if (!password) return 'Password is required.';
  if (password.length < 6) return 'Password must be at least 6 characters.';
  if (isRegister && password.length < 8)
    return 'Password must be at least 8 characters for registration.';
  if (password.length > 128) return 'Password is too long.';
  return '';
};

const validateName = (name) => {
  if (!name.trim()) return 'Name is required.';
  if (name.trim().length < 2) return 'Name must be at least 2 characters.';
  if (name.trim().length > 100) return 'Name is too long.';
  if (/[<>{}]/.test(name)) return 'Name contains invalid characters.';
  return '';
};

export const AuthPage = () => {
  const [searchParams] = useSearchParams();
  const initialMode = searchParams.get('mode') === 'register' ? 'register' : 'login';
  const [mode, setMode] = useState(initialMode);
  const [role, setRole] = useState('citizen'); // citizen | officer | admin
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    phone: '',
    ward: 'K/E (Andheri East)',
    badgeNumber: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname;

  // Validate all fields before submission
  const validateForm = useCallback(() => {
    const errors = {};

    if (mode === 'register') {
      const nameErr = validateName(formData.name);
      if (nameErr) errors.name = nameErr;
    }

    const emailErr = validateEmail(formData.email);
    if (emailErr) errors.email = emailErr;

    const passwordErr = validatePassword(formData.password, mode === 'register');
    if (passwordErr) errors.password = passwordErr;

    if (role === 'officer' && !formData.badgeNumber.trim()) {
      errors.badgeNumber = 'Officer Badge ID is required for officer login.';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }, [formData, mode, role]);

  const handleInputChange = (field, value) => {
    const sanitized = field === 'password' ? value : sanitizeInput(value);
    setFormData(prev => ({ ...prev, [field]: sanitized }));
    // Clear field error on change
    if (fieldErrors[field]) {
      setFieldErrors(prev => {
        const updated = { ...prev };
        delete updated[field];
        return updated;
      });
    }
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) return;

    setLoading(true);

    try {
      const result = await login({
        email: formData.email.trim(),
        password: formData.password,
      });

      // Route based on the user role that was returned and preserve return destination
      const userRole = result?.data?.user?.role;
      if (userRole === 'admin') navigate('/admin');
      else if (userRole === 'officer') navigate(`/officer/${result.data.user.id}`);
      else navigate(from && from.startsWith('/app') ? from : '/app');
    } catch (err) {
      setError(err.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  // Demo credentials for quick access (2 citizen demo accounts + admin + officer)
  const demoCredentials = role === 'citizen' ? [
    { label: 'Priya Nair (Citizen #1)', ward: 'Ward 8 · Bandra North', email: DEMO_CITIZENS[0].email, password: DEMO_CITIZENS[0].password },
    { label: 'Aarav Sharma (Citizen #2)', ward: 'Ward 12 · Andheri East', email: DEMO_CITIZENS[1].email, password: DEMO_CITIZENS[1].password },
  ] : role === 'admin' ? [
    { label: 'BMC Commissioner Admin', ward: 'Municipal HQ Console', email: MOCK_USERS.admin.email, password: MOCK_USERS.admin.password },
  ] : [
    { label: 'Suresh Patil (Ward Officer)', ward: 'Ward 8 · Bandra North', email: 'suresh.patil@bmc.gov.in', password: 'BandraN@2024', badge: 'BMC/GN/2020/008' },
    { label: 'Ravi Mehta (Ward Officer)', ward: 'Ward 12 · Andheri East', email: 'ravi.mehta@bmc.gov.in', password: 'AndheriE@2024', badge: 'BMC/KE/2021/012' },
  ];

  const fillDemoCredentials = (cred) => {
    setFormData(prev => ({
      ...prev,
      email: cred.email,
      password: cred.password,
      badgeNumber: cred.badge || prev.badgeNumber || '',
    }));
    setFieldErrors({});
    setError('');
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <Card variant="default" className="max-w-md w-full p-8 shadow-soft-xl border border-neutral-100 space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 bg-brand-100 text-brand-700 rounded-2xl flex items-center justify-center mx-auto">
            <Shield size={24} />
          </div>
          <h2 className="text-2xl font-bold text-neutral-900">
            {mode === 'login' ? 'Sign in to Kaiser AI' : 'Create Citizen Account'}
          </h2>
          <p className="text-xs text-neutral-500">
            Select your portal role to continue
          </p>
        </div>

        {/* Role toggle tabs */}
        <div className="grid grid-cols-3 gap-1 p-1 bg-neutral-100 rounded-xl text-xs font-semibold">
          <button
            type="button"
            onClick={() => { setRole('citizen'); setError(''); setFieldErrors({}); }}
            className={`py-2 rounded-lg transition-all ${role === 'citizen' ? 'bg-white text-neutral-900 shadow-soft-sm' : 'text-neutral-500'}`}
          >
            Citizen
          </button>
          <button
            type="button"
            onClick={() => { setRole('officer'); setError(''); setFieldErrors({}); }}
            className={`py-2 rounded-lg transition-all ${role === 'officer' ? 'bg-white text-neutral-900 shadow-soft-sm' : 'text-neutral-500'}`}
          >
            Officer
          </button>
          <button
            type="button"
            onClick={() => { setRole('admin'); setError(''); setFieldErrors({}); }}
            className={`py-2 rounded-lg transition-all ${role === 'admin' ? 'bg-white text-neutral-900 shadow-soft-sm' : 'text-neutral-500'}`}
          >
            BMC Admin
          </button>
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs flex items-center gap-2">
            <AlertCircle size={14} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          {mode === 'register' && (
            <div className="space-y-1">
              <Input
                label="Full Name"
                type="text"
                placeholder="e.g. Aarav Sharma"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                required
                maxLength={100}
                autoComplete="name"
              />
              {fieldErrors.name && (
                <p className="text-red-500 text-[11px] font-medium flex items-center gap-1">
                  <AlertCircle size={11} /> {fieldErrors.name}
                </p>
              )}
            </div>
          )}

          <div className="space-y-1">
            <Input
              label="Email Address"
              type="email"
              placeholder={role === 'officer' ? 'officer.ke@mcgm.gov.in' : role === 'admin' ? 'r.mehta@bmc.gov.in' : 'priya.nair@example.com'}
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              required
              maxLength={254}
              autoComplete="email"
            />
            {fieldErrors.email && (
              <p className="text-red-500 text-[11px] font-medium flex items-center gap-1">
                <AlertCircle size={11} /> {fieldErrors.email}
              </p>
            )}
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-neutral-700">Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                required
                maxLength={128}
                autoComplete={mode === 'register' ? 'new-password' : 'current-password'}
                className={`w-full px-4 py-2.5 pr-11 bg-white border rounded-xl text-neutral-800 placeholder-neutral-400 text-sm focus:outline-none focus:ring-2 transition-all shadow-sm ${
                  fieldErrors.password
                    ? 'border-red-300 focus:border-red-400 focus:ring-red-100'
                    : 'border-neutral-200 focus:border-brand-400 focus:ring-brand-100'
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700 transition-colors"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
            {fieldErrors.password && (
              <p className="text-red-500 text-[11px] font-medium flex items-center gap-1">
                <AlertCircle size={11} /> {fieldErrors.password}
              </p>
            )}
          </div>

          {role === 'officer' && (
            <div className="space-y-1">
              <Input
                label="Officer Badge ID"
                type="text"
                placeholder="BMC-OFF-4892"
                value={formData.badgeNumber}
                onChange={(e) => handleInputChange('badgeNumber', e.target.value)}
                autoComplete="off"
              />
              {fieldErrors.badgeNumber && (
                <p className="text-red-500 text-[11px] font-medium flex items-center gap-1">
                  <AlertCircle size={11} /> {fieldErrors.badgeNumber}
                </p>
              )}
            </div>
          )}

          <Button
            type="submit"
            variant="primary"
            className="w-full justify-center py-2.5"
            loading={loading}
          >
            {mode === 'login' ? `Sign In as ${role.charAt(0).toUpperCase() + role.slice(1)}` : 'Register Account'}
          </Button>
        </form>

        {/* Demo Credentials Quick-Fill with clear passwords */}
        {mode === 'login' && demoCredentials.length > 0 && (
          <div className="p-3 bg-sky-50 border border-sky-200 rounded-xl space-y-2">
            <div className="flex items-center justify-between text-[11px] font-bold text-sky-800">
              <span className="flex items-center gap-1.5"><Info size={13} /> Demo Accounts (Click to Fill)</span>
              <span className="text-sky-600 font-normal">Pre-configured passwords</span>
            </div>
            <div className="space-y-1.5">
              {demoCredentials.map((cred) => (
                <button
                  key={cred.email}
                  type="button"
                  onClick={() => fillDemoCredentials(cred)}
                  className="w-full flex items-center justify-between px-3 py-2 bg-white hover:bg-sky-100/70 border border-sky-200 rounded-xl text-left transition-colors group"
                >
                  <div className="min-w-0 pr-2">
                    <span className="text-xs font-bold text-neutral-800 group-hover:text-sky-900 block truncate">{cred.label}</span>
                    <span className="text-[10px] text-neutral-500 block truncate">{cred.ward} · {cred.email}</span>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-[11px] font-mono bg-sky-100 text-sky-800 px-2 py-0.5 rounded font-bold">
                      {cred.password}
                    </span>
                    <span className="block text-[10px] text-sky-600 font-medium mt-0.5">Click to fill →</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="text-center pt-2 text-xs text-neutral-500">
          {mode === 'login' ? (
            <span>
              Don't have an account?{' '}
              <button
                type="button"
                onClick={() => { setMode('register'); setError(''); setFieldErrors({}); }}
                className="text-brand-600 font-semibold hover:underline"
              >
                Register
              </button>
            </span>
          ) : (
            <span>
              Already registered?{' '}
              <button
                type="button"
                onClick={() => { setMode('login'); setError(''); setFieldErrors({}); }}
                className="text-brand-600 font-semibold hover:underline"
              >
                Sign In
              </button>
            </span>
          )}
        </div>

        {/* Officer Portal Banner */}
        <div className="mt-4 p-3 bg-gradient-to-r from-blue-900/5 to-indigo-900/5 border border-blue-100 rounded-xl flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-100 rounded-xl flex items-center justify-center shrink-0">
            <BadgeCheck size={15} className="text-blue-600" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-neutral-800">Ward Officer Portal</p>
            <p className="text-[11px] text-neutral-500">26 ward officers with individual dashboards</p>
          </div>
          <Link
            to="/officer-login"
            className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 shrink-0"
          >
            Access <ArrowRight size={12} />
          </Link>
        </div>
      </Card>
    </div>
  );
};
