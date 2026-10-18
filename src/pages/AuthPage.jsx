import React, { useState, useCallback } from 'react';
import { useNavigate, useSearchParams, useLocation, Link } from 'react-router-dom';
import { Shield, ArrowRight, BadgeCheck, AlertCircle, Eye, EyeOff, UserCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { Card } from '../components/common/Card';
import { DEMO_CITIZENS, MUMBAI_WARDS } from '../utils/mockData';

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
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    phone: '',
    ward: 8, // Default to Ward 8 (G/N Bandra)
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);

  const { login, register } = useAuth();
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

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }, [formData, mode]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
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
      if (mode === 'register') {
        const selectedWard = MUMBAI_WARDS.find(w => w.id === Number(formData.ward)) || MUMBAI_WARDS[7];
        await register({
          name: formData.name.trim(),
          email: formData.email.trim(),
          password: formData.password,
          phone: formData.phone.trim() || '+91 98000 00000',
          ward: selectedWard.id,
          wardName: `${selectedWard.name} – ${selectedWard.area.split(',')[0]}`,
        });
        navigate('/app');
      } else {
        const result = await login({
          email: formData.email.trim(),
          password: formData.password,
        });

        // Route based on returned role (protects against staff logging in here)
        const userRole = result?.data?.user?.role;
        if (userRole === 'admin') navigate('/admin');
        else if (userRole === 'officer') navigate(`/officer/${result.data.user.id}`);
        else navigate(from && from.startsWith('/app') ? from : '/app');
      }
    } catch (err) {
      setError(err.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  // Strictly 1 Demo User for Citizens
  const fillSingleCitizenDemo = () => {
    setFormData(prev => ({
      ...prev,
      email: DEMO_CITIZENS[0].email,
      password: DEMO_CITIZENS[0].password,
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
            {mode === 'login' ? 'Citizen Sign In' : 'Create Citizen Account'}
          </h2>
          <p className="text-xs text-neutral-500">
            {mode === 'login'
              ? 'Access your municipal grievance desk and track complaints'
              : 'Register as a Mumbai resident to report and monitor civic issues'}
          </p>
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs flex items-center gap-2">
            <AlertCircle size={14} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          {mode === 'register' && (
            <>
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

              <div className="space-y-1">
                <Input
                  label="Phone Number"
                  type="tel"
                  placeholder="+91 98765 43210"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  maxLength={20}
                  autoComplete="tel"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-neutral-700">Resident Mumbai Ward</label>
                <select
                  value={formData.ward}
                  onChange={(e) => handleInputChange('ward', Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 bg-white border border-neutral-200 rounded-xl text-neutral-800 text-sm focus:outline-none focus:ring-2 focus:ring-brand-100 focus:border-brand-400 shadow-sm"
                >
                  {MUMBAI_WARDS.map((w) => (
                    <option key={w.id} value={w.id}>
                      Ward {w.id}: {w.name} ({w.area.split(',')[0]})
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-neutral-400">Used to route your local civic complaints to your ward officer.</p>
              </div>
            </>
          )}

          <div className="space-y-1">
            <Input
              label="Email Address"
              type="email"
              placeholder="priya.nair@example.com"
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

          <Button
            type="submit"
            variant="primary"
            className="w-full justify-center py-2.5"
            loading={loading}
          >
            {mode === 'login' ? 'Sign In as Citizen' : 'Register Citizen Account'}
          </Button>
        </form>

        {/* Strictly 1 Demo User for Public Preview */}
        {mode === 'login' && (
          <div className="p-3 bg-sky-50/80 border border-sky-200 rounded-xl space-y-2">
            <div className="flex items-center justify-between text-[11px] font-bold text-sky-800">
              <span className="flex items-center gap-1.5"><UserCheck size={13} /> Quick Demo Access</span>
              <span className="text-sky-600 font-normal">Citizen Account</span>
            </div>
            <button
              type="button"
              onClick={fillSingleCitizenDemo}
              className="w-full flex items-center justify-between px-3 py-2 bg-white hover:bg-sky-100/70 border border-sky-200 rounded-xl text-left transition-colors group"
            >
              <div className="min-w-0 pr-2">
                <span className="text-xs font-bold text-neutral-800 group-hover:text-sky-900 block truncate">
                  Priya Nair (Resident · Bandra North)
                </span>
                <span className="text-[10px] text-neutral-500 block truncate">
                  Ward 8 · {DEMO_CITIZENS[0].email}
                </span>
              </div>
              <div className="text-right shrink-0">
                <span className="text-[11px] font-mono bg-sky-100 text-sky-800 px-2 py-0.5 rounded font-bold">
                  {DEMO_CITIZENS[0].password}
                </span>
                <span className="block text-[10px] text-sky-600 font-medium mt-0.5">Click to fill →</span>
              </div>
            </button>
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

        {/* Segregated Municipal Staff Portal Banner */}
        <div className="mt-4 p-3 bg-gradient-to-r from-blue-900/5 to-indigo-900/5 border border-blue-100 rounded-xl flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-100 rounded-xl flex items-center justify-center shrink-0">
            <BadgeCheck size={16} className="text-blue-600" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-neutral-800">BMC Municipal Staff Portal</p>
            <p className="text-[11px] text-neutral-500">24 Ward Officers & Municipal Commissioner HQ</p>
          </div>
          <Link
            to="/officer-login"
            className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 shrink-0"
          >
            Staff Portal <ArrowRight size={12} />
          </Link>
        </div>
      </Card>
    </div>
  );
};
