// ─── Sovereign Civic Auth & Registration Page (Light & Dark Mode) ───────────
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams, useLocation, Link } from 'react-router-dom';
import {
  Shield, ArrowRight, BadgeCheck, AlertCircle, Eye, EyeOff,
  UserCheck, Mail, Lock, User, Phone, MapPin, Check, Sparkles,
  CheckCircle2, Radio
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { DEMO_CITIZENS, MUMBAI_WARDS } from '../utils/mockData';
import { sound } from '../utils/soundEffects';
import { ForgotPasswordModal } from '../components/auth/ForgotPasswordModal';
import toast from 'react-hot-toast';

// ── Validation helpers ────────────────────────────────────────────────────────
const validateEmail = (email) => {
  if (!email.trim()) return 'Email address is required.';
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
  if (!name.trim()) return 'Full name is required.';
  if (name.trim().length < 2) return 'Name must be at least 2 characters.';
  if (name.trim().length > 100) return 'Name is too long.';
  if (/[<>{}]/.test(name)) return 'Name contains invalid characters.';
  return '';
};

// Compute Password Strength
const getPasswordStrength = (pwd) => {
  if (!pwd) return { score: 0, label: '', color: 'bg-white/20' };
  let score = 0;
  if (pwd.length >= 8) score += 1;
  if (/[0-9]/.test(pwd)) score += 1;
  if (/[A-Z]/.test(pwd)) score += 1;
  if (/[^A-Za-z0-9]/.test(pwd)) score += 1;

  if (score === 1) return { score: 25, label: 'Weak', color: 'bg-rose-500' };
  if (score === 2) return { score: 50, label: 'Fair', color: 'bg-amber-400' };
  if (score === 3) return { score: 75, label: 'Good', color: 'bg-teal-400' };
  return { score: 100, label: 'Strong', color: 'bg-emerald-400' };
};

export const AuthPage = () => {
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { login, register } = useAuth();

  // Detect mode from route path (/register) or query (?mode=register)
  const isDirectRegister = location.pathname === '/register' || searchParams.get('mode') === 'register';
  const [mode, setMode] = useState(isDirectRegister ? 'register' : 'login');

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    ward: 8, // Default to Ward 8 (G/N Bandra/Dadar)
    consent: true,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showForgotModal, setShowForgotModal] = useState(false);
  const { isDark } = useTheme();
  const from = location.state?.from?.pathname;

  // Sync mode if URL changes
  useEffect(() => {
    if (location.pathname === '/register') {
      setMode('register');
    } else if (location.pathname === '/login') {
      setMode('login');
    }
  }, [location.pathname]);

  // Real-time initials preview
  const initials = formData.name.trim()
    ? formData.name.trim().split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : 'MC';

  const pwdStrength = getPasswordStrength(formData.password);

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
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (fieldErrors[field]) {
      setFieldErrors((prev) => {
        const updated = { ...prev };
        delete updated[field];
        return updated;
      });
    }
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    sound.play('click');
    setError('');

    if (!validateForm()) {
      sound.play('error');
      return;
    }

    setLoading(true);

    try {
      if (mode === 'register') {
        const selectedWard = MUMBAI_WARDS.find((w) => w.id === Number(formData.ward)) || MUMBAI_WARDS[7];
        
        await register({
          name: formData.name.trim(),
          email: formData.email.trim(),
          password: formData.password,
          phone: formData.phone.trim() || '+91 98000 00000',
          ward: selectedWard.id,
          wardName: `${selectedWard.code} – ${selectedWard.area.split(',')[0]}`,
        });

        sound.play('pop');
        navigate('/app');
      } else {
        const result = await login({
          email: formData.email.trim(),
          password: formData.password,
        });

        sound.play('pop');
        const userRole = result?.data?.user?.role;
        if (userRole === 'admin') navigate('/admin');
        else if (userRole === 'officer') navigate(`/officer/${result.data.user.id}`);
        else navigate(from && from.startsWith('/app') ? from : '/app');
      }
    } catch (err) {
      sound.play('error');
      setError(err.message || 'Authentication failed. Please verify credentials or try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={`min-h-[92vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden transition-colors duration-300 select-none ${
        isDark
          ? 'bg-neutral-950 text-neutral-100'
          : 'bg-gradient-to-br from-slate-100 via-emerald-50/50 to-teal-50/40 text-neutral-900'
      }`}
    >
      {/* ── Background Ambient Lighting ── */}
      <div
        className={`absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] rounded-full pointer-events-none transition-all duration-500 ${
          isDark ? 'bg-emerald-500/12 blur-[130px]' : 'bg-emerald-300/35 blur-[120px]'
        }`}
      />
      <div
        className={`absolute bottom-10 right-1/4 w-[400px] h-[400px] rounded-full pointer-events-none transition-all duration-500 ${
          isDark ? 'bg-teal-500/10 blur-[120px]' : 'bg-teal-300/25 blur-[100px]'
        }`}
      />

      {/* ── Main Glassmorphic Auth Card ── */}
      <div
        className={`max-w-xl w-full rounded-3xl p-6 sm:p-10 relative z-10 space-y-6 transition-all duration-300 ${
          isDark
            ? 'bg-neutral-900/85 backdrop-blur-2xl border border-white/15 shadow-[0_24px_60px_rgba(0,0,0,0.85)]'
            : 'bg-white/95 backdrop-blur-2xl border border-neutral-200/90 shadow-[0_24px_60px_rgba(15,23,42,0.1)]'
        }`}
      >
        {/* Top Gradient Accent Bar */}
        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-emerald-500 via-teal-400 to-sky-400 rounded-t-3xl" />

        {/* ── Top Bar: Gateway Live Badge ── */}
        <div className="flex items-center justify-center pt-1">
          <div className="flex items-center gap-2">
            <span
              className={`w-2 h-2 rounded-full shrink-0 ${
                isDark ? 'bg-emerald-400 shadow-[0_0_8px_#34d399]' : 'bg-emerald-600 shadow-[0_0_6px_rgba(5,150,105,0.4)]'
              } animate-pulse`}
            />
            <span
              className={`font-mono text-[10px] sm:text-[11px] font-bold tracking-[.18em] sm:tracking-[.25em] uppercase ${
                isDark ? 'text-emerald-300' : 'text-emerald-700'
              }`}
            >
              MUMBAI SMART CITY CITIZEN GATEWAY
            </span>
          </div>
        </div>

        {/* ── Header with Logo ── */}
        <div className="flex items-center justify-center gap-3 pt-1 text-center">
          <div
            className={`w-12 h-12 rounded-2xl flex items-center justify-center p-1 shadow-brand transition-colors ${
              isDark ? 'bg-white' : 'bg-emerald-50 border border-emerald-100'
            }`}
          >
            <img src="/kaiser-mark.png" alt="Kaiser AI" className="w-full h-full object-contain" />
          </div>
          <div className="text-left">
            <h1
              className={`font-display font-extrabold text-2xl sm:text-3xl tracking-tight transition-colors ${
                isDark ? 'text-white' : 'text-neutral-900'
              }`}
            >
              {mode === 'login' ? 'Citizen Sign In' : 'Resident Registration'}
            </h1>
            <p className={`text-xs transition-colors ${isDark ? 'text-white/60' : 'text-neutral-500'}`}>
              {mode === 'login'
                ? 'Access your municipal grievance desk & live SLA status'
                : 'Join 24 municipal wards to report hazards & earn civic rewards'}
            </p>
          </div>
        </div>

        {/* ── Mode Switcher Tabs ── */}
        <div
          className={`grid grid-cols-2 p-1.5 rounded-2xl relative font-mono text-xs transition-colors ${
            isDark
              ? 'bg-neutral-950/80 border border-white/10'
              : 'bg-neutral-100 border border-neutral-200'
          }`}
        >
          <button
            type="button"
            onClick={() => {
              sound.play('click');
              setMode('login');
              setError('');
              setFieldErrors({});
            }}
            className={`py-2.5 rounded-xl font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${
              mode === 'login'
                ? isDark
                  ? 'bg-neutral-800 text-white shadow-md border border-white/10'
                  : 'bg-white text-neutral-900 shadow-sm border border-neutral-200/80'
                : isDark
                ? 'text-white/60 hover:text-white'
                : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            <Lock size={13} className={mode === 'login' ? (isDark ? 'text-emerald-400' : 'text-emerald-600') : ''} />
            <span>SIGN IN</span>
          </button>

          <button
            type="button"
            onClick={() => {
              sound.play('click');
              setMode('register');
              setError('');
              setFieldErrors({});
            }}
            className={`py-2.5 rounded-xl font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${
              mode === 'register'
                ? isDark
                  ? 'bg-emerald-500 text-neutral-950 shadow-md font-black'
                  : 'bg-emerald-600 text-white shadow-sm font-black'
                : isDark
                ? 'text-white/60 hover:text-white'
                : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            <Sparkles size={13} />
            <span>REGISTER NEW CITIZEN</span>
          </button>
        </div>

        {/* Error Alert Box */}
        {error && (
          <div
            className={`p-3.5 rounded-2xl text-xs flex items-center gap-2.5 animate-shake transition-colors ${
              isDark
                ? 'bg-rose-950/70 border border-rose-500/40 text-rose-200'
                : 'bg-rose-50 border border-rose-200 text-rose-800'
            }`}
          >
            <AlertCircle size={16} className={`${isDark ? 'text-rose-400' : 'text-rose-600'} shrink-0`} />
            <span className="font-medium">{error}</span>
          </div>
        )}

        {/* ── Auth Form ── */}
        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          
          {/* ── Registration Fields ── */}
          {mode === 'register' && (
            <>
              {/* Name field with live avatar preview */}
              <div className="space-y-1.5">
                <label
                  className={`text-xs font-semibold flex items-center justify-between transition-colors ${
                    isDark ? 'text-white/80' : 'text-neutral-700'
                  }`}
                >
                  <span>Full Legal Name</span>
                  <span className={`text-[10px] font-mono ${isDark ? 'text-white/40' : 'text-neutral-400'}`}>
                    Used on municipal certificates
                  </span>
                </label>
                <div className="relative flex items-center">
                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs ml-2 absolute transition-colors ${
                      isDark
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/30'
                        : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                    }`}
                  >
                    {initials}
                  </div>
                  <input
                    type="text"
                    placeholder="e.g. Aarav Sharma"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    required
                    maxLength={100}
                    autoComplete="name"
                    className={`w-full pl-13 pr-4 py-3 rounded-xl text-xs transition-colors shadow-inner ${
                      isDark
                        ? 'bg-neutral-950/80 border border-white/15 text-white placeholder-white/30 focus:border-emerald-400 focus:outline-none'
                        : 'bg-neutral-50 border border-neutral-200 text-neutral-900 placeholder-neutral-400 focus:bg-white focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none'
                    }`}
                  />
                </div>
                {fieldErrors.name && (
                  <p className="text-rose-500 text-[11px] font-medium flex items-center gap-1">
                    <AlertCircle size={11} /> {fieldErrors.name}
                  </p>
                )}
              </div>

              {/* Phone number */}
              <div className="space-y-1.5">
                <label
                  className={`text-xs font-semibold flex items-center justify-between transition-colors ${
                    isDark ? 'text-white/80' : 'text-neutral-700'
                  }`}
                >
                  <span>Mobile Phone Number</span>
                  <span className={`text-[10px] font-mono ${isDark ? 'text-emerald-400' : 'text-emerald-700'}`}>
                    For resolution SMS updates
                  </span>
                </label>
                <div className="relative">
                  <Phone
                    className={`absolute left-3.5 top-1/2 -translate-y-1/2 ${
                      isDark ? 'text-white/40' : 'text-neutral-400'
                    }`}
                    size={15}
                  />
                  <input
                    type="tel"
                    placeholder="+91 98765 43210"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    maxLength={20}
                    autoComplete="tel"
                    className={`w-full pl-10 pr-4 py-3 rounded-xl text-xs font-mono transition-colors shadow-inner ${
                      isDark
                        ? 'bg-neutral-950/80 border border-white/15 text-white placeholder-white/30 focus:border-emerald-400 focus:outline-none'
                        : 'bg-neutral-50 border border-neutral-200 text-neutral-900 placeholder-neutral-400 focus:bg-white focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none'
                    }`}
                  />
                </div>
              </div>

              {/* Mumbai Ward Selection */}
              <div className="space-y-1.5">
                <label
                  className={`text-xs font-semibold flex items-center justify-between transition-colors ${
                    isDark ? 'text-white/80' : 'text-neutral-700'
                  }`}
                >
                  <span>Resident Mumbai Ward</span>
                  <span className={`text-[10px] font-mono ${isDark ? 'text-teal-300' : 'text-teal-700'}`}>
                    Auto-routes to your Ward Junior Engineer
                  </span>
                </label>
                <div className="relative">
                  <MapPin
                    className={`absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none ${
                      isDark ? 'text-emerald-400' : 'text-emerald-600'
                    }`}
                    size={15}
                  />
                  <select
                    value={formData.ward}
                    onChange={(e) => handleInputChange('ward', Number(e.target.value))}
                    className={`w-full pl-10 pr-4 py-3 rounded-xl text-xs transition-colors shadow-inner cursor-pointer ${
                      isDark
                        ? 'bg-neutral-950 border border-white/15 text-white focus:border-emerald-400 focus:outline-none'
                        : 'bg-neutral-50 border border-neutral-200 text-neutral-900 focus:bg-white focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none'
                    }`}
                  >
                    {MUMBAI_WARDS.map((w) => (
                      <option
                        key={w.id}
                        value={w.id}
                        className={isDark ? 'bg-neutral-900 text-white' : 'bg-white text-neutral-900'}
                      >
                        {w.code} ({w.name}): {w.area.split(',')[0]} · {w.zone}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </>
          )}

          {/* ── Email Field ── */}
          <div className="space-y-1.5">
            <label
              className={`text-xs font-semibold transition-colors ${
                isDark ? 'text-white/80' : 'text-neutral-700'
              }`}
            >
              Email Address
            </label>
            <div className="relative">
              <Mail
                className={`absolute left-3.5 top-1/2 -translate-y-1/2 ${
                  isDark ? 'text-white/40' : 'text-neutral-400'
                }`}
                size={15}
              />
              <input
                type="email"
                placeholder="citizen@mumbai.gov.in"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                required
                maxLength={254}
                autoComplete="email"
                className={`w-full pl-10 pr-4 py-3 rounded-xl text-xs font-mono transition-colors shadow-inner ${
                  isDark
                    ? 'bg-neutral-950/80 border border-white/15 text-white placeholder-white/30 focus:border-emerald-400 focus:outline-none'
                    : 'bg-neutral-50 border border-neutral-200 text-neutral-900 placeholder-neutral-400 focus:bg-white focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none'
                }`}
              />
            </div>
            {fieldErrors.email && (
              <p className="text-rose-500 text-[11px] font-medium flex items-center gap-1">
                <AlertCircle size={11} /> {fieldErrors.email}
              </p>
            )}
          </div>

          {/* ── Password Field ── */}
          <div className="space-y-1.5">
            <label
              className={`text-xs font-semibold flex items-center justify-between transition-colors ${
                isDark ? 'text-white/80' : 'text-neutral-700'
              }`}
            >
              <span>Password</span>
              {mode === 'register' && (
                <span
                  className={`text-[10px] font-mono font-bold ${
                    pwdStrength.score >= 75
                      ? isDark ? 'text-emerald-400' : 'text-emerald-700'
                      : pwdStrength.score >= 50
                      ? isDark ? 'text-amber-400' : 'text-amber-700'
                      : isDark ? 'text-rose-400' : 'text-rose-600'
                  }`}
                >
                  {pwdStrength.label ? `Strength: ${pwdStrength.label}` : 'Min 8 chars'}
                </span>
              )}
            </label>
            <div className="relative">
              <Lock
                className={`absolute left-3.5 top-1/2 -translate-y-1/2 ${
                  isDark ? 'text-white/40' : 'text-neutral-400'
                }`}
                size={15}
              />
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••••••"
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                required
                maxLength={128}
                autoComplete={mode === 'register' ? 'new-password' : 'current-password'}
                className={`w-full pl-10 pr-11 py-3 rounded-xl text-xs font-mono transition-colors shadow-inner ${
                  isDark
                    ? 'bg-neutral-950/80 border border-white/15 text-white placeholder-white/30 focus:border-emerald-400 focus:outline-none'
                    : 'bg-neutral-50 border border-neutral-200 text-neutral-900 placeholder-neutral-400 focus:bg-white focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none'
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className={`absolute right-3.5 top-1/2 -translate-y-1/2 transition-colors cursor-pointer ${
                  isDark ? 'text-white/40 hover:text-white' : 'text-neutral-400 hover:text-neutral-700'
                }`}
                tabIndex={-1}
              >
                {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>

            {/* Live Strength Meter (Registration Mode) */}
            {mode === 'register' && formData.password.length > 0 && (
              <div
                className={`w-full h-1 rounded-full overflow-hidden mt-1.5 transition-colors ${
                  isDark ? 'bg-white/10' : 'bg-neutral-200'
                }`}
              >
                <div
                  className={`h-full transition-all duration-300 ${pwdStrength.color}`}
                  style={{ width: `${pwdStrength.score}%` }}
                />
              </div>
            )}

            {fieldErrors.password && (
              <p className="text-rose-500 text-[11px] font-medium flex items-center gap-1">
                <AlertCircle size={11} /> {fieldErrors.password}
              </p>
            )}

            {mode === 'login' && (
              <div className="flex items-center justify-end pt-0.5">
                <button
                  type="button"
                  onClick={() => {
                    sound.play('click');
                    setShowForgotModal(true);
                  }}
                  className={`text-[11px] font-semibold cursor-pointer transition-colors ${
                    isDark ? 'text-emerald-400 hover:text-emerald-300 hover:underline' : 'text-emerald-700 hover:text-emerald-800 hover:underline'
                  }`}
                >
                  Forgot password?
                </button>
              </div>
            )}
          </div>

          {/* ── DPDP Act Consent (Register Mode) ── */}
          {mode === 'register' && (
            <div
              className={`pt-1 flex items-start gap-2.5 text-xs transition-colors ${
                isDark ? 'text-white/60' : 'text-neutral-600'
              }`}
            >
              <input
                type="checkbox"
                id="consent"
                checked={formData.consent}
                onChange={(e) => setFormData((p) => ({ ...p, consent: e.target.checked }))}
                className={`mt-0.5 rounded cursor-pointer ${
                  isDark
                    ? 'border-white/20 bg-neutral-950 text-emerald-500 focus:ring-0'
                    : 'border-neutral-300 bg-white text-emerald-600 focus:ring-0'
                }`}
              />
              <label htmlFor="consent" className="cursor-pointer text-[11px] leading-relaxed">
                I agree to the{' '}
                <span className={isDark ? 'text-emerald-400 underline' : 'text-emerald-700 underline font-semibold'}>
                  Terms of Civic Service
                </span>{' '}
                and consent to municipal ward routing in accordance with India's{' '}
                <strong className={isDark ? 'text-white' : 'text-neutral-900'}>DPDP Act 2023</strong>.
              </label>
            </div>
          )}

          {/* ── Main Action Button ── */}
          <button
            type="submit"
            disabled={loading}
            className={`glow-btn relative overflow-hidden shine group w-full py-4 rounded-2xl font-black text-xs tracking-widest uppercase hover:scale-[1.01] active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 ${
              isDark
                ? 'bg-gradient-to-r from-emerald-500 via-brand-500 to-teal-400 text-neutral-950 shadow-[0_0_24px_rgba(52,211,153,0.45)]'
                : 'bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-500 hover:from-emerald-700 hover:to-teal-600 text-white shadow-[0_6px_20px_rgba(16,185,129,0.3)]'
            }`}
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span
                  className={`w-4 h-4 border-2 border-t-transparent rounded-full animate-spin ${
                    isDark ? 'border-neutral-950' : 'border-white'
                  }`}
                />
                <span>AUTHENTICATING VIA FASTAPI...</span>
              </span>
            ) : (
              <>
                <span>{mode === 'login' ? 'SIGN IN AS CITIZEN' : 'REGISTER WITH FASTAPI BACKEND'}</span>
                <ArrowRight size={15} className="group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </form>

        {/* ── BMC Municipal Staff Portal Gateway ── */}
        <div
          className={`p-3.5 rounded-2xl flex items-center justify-between gap-3 text-xs transition-colors ${
            isDark
              ? 'bg-neutral-950/80 border border-sky-500/30 text-white'
              : 'bg-sky-50/80 border border-sky-200 text-sky-950'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <div
              className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                isDark
                  ? 'bg-sky-500/20 text-sky-300 border border-sky-400/30'
                  : 'bg-sky-100 text-sky-700 border border-sky-200'
              }`}
            >
              <BadgeCheck size={16} />
            </div>
            <div>
              <p className={`font-bold text-xs ${isDark ? 'text-white' : 'text-neutral-900'}`}>
                BMC Municipal Staff Portal
              </p>
              <p className={`text-[10px] ${isDark ? 'text-white/50' : 'text-neutral-500'}`}>
                24 Ward Junior Engineers & Headquarters
              </p>
            </div>
          </div>
          <Link
            to="/officer-login"
            onClick={() => sound.play('click')}
            className={`px-3.5 py-2 rounded-xl text-xs font-mono flex items-center gap-1.5 transition-all cursor-pointer shrink-0 shadow-xs ${
              isDark
                ? 'border border-sky-400/40 bg-sky-500/15 hover:bg-sky-500/25 text-sky-300 font-bold'
                : 'border border-sky-300 bg-white hover:bg-sky-50 text-sky-700 font-bold'
            }`}
          >
            <span>Staff Portal</span>
            <ArrowRight size={13} />
          </Link>
        </div>

      </div>

      <ForgotPasswordModal
        isOpen={showForgotModal}
        onClose={() => setShowForgotModal(false)}
        initialEmail={formData.email}
        accountType="citizen"
        accountName={formData.name || 'Resident Citizen'}
        onSuccess={({ email: resetEmail, newPassword }) => {
          setFormData((p) => ({ ...p, email: resetEmail, password: newPassword }));
          setShowForgotModal(false);
          toast.success('Password updated! You can now sign in.');
        }}
      />
    </div>
  );
};
