// ─── Sovereign Civic Dark Cyber Auth & Registration Page ──────────────────────
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams, useLocation, Link } from 'react-router-dom';
import {
  Shield, ArrowRight, BadgeCheck, AlertCircle, Eye, EyeOff,
  UserCheck, Mail, Lock, User, Phone, MapPin, Check, Sparkles,
  CheckCircle2, Radio
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { DEMO_CITIZENS, MUMBAI_WARDS } from '../utils/mockData';
import { sound } from '../utils/soundEffects';

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

  // Demo Citizen Auto-Fill
  const fillSingleCitizenDemo = () => {
    sound.play('pop');
    setFormData((prev) => ({
      ...prev,
      email: DEMO_CITIZENS[0].email,
      password: DEMO_CITIZENS[0].password,
    }));
    setFieldErrors({});
    setError('');
  };

  return (
    <div className="min-h-[92vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden bg-neutral-950 text-neutral-100 select-none">
      
      {/* ── Background Ambient Lighting ── */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-emerald-500/12 rounded-full blur-[130px] pointer-events-none" />
      <div className="absolute bottom-10 right-1/4 w-[400px] h-[400px] bg-teal-500/10 rounded-full blur-[120px] pointer-events-none" />

      {/* ── Main Glassmorphic Auth Card ── */}
      <div className="max-w-xl w-full rounded-3xl bg-neutral-900/85 backdrop-blur-2xl border border-white/15 p-6 sm:p-10 shadow-[0_24px_60px_rgba(0,0,0,0.85)] relative z-10 space-y-6">
        
        {/* Top Gradient Accent Bar */}
        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-emerald-400 via-teal-300 to-sky-400 rounded-t-3xl" />

        {/* ── Header with Logo & Live Badge ── */}
        <div className="text-center space-y-3 pt-2">
          <div className="flex items-center justify-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399] animate-pulse" />
            <span className="font-mono text-[11px] font-bold tracking-[.3em] uppercase text-emerald-300">
              MUMBAI SMART CITY CITIZEN GATEWAY
            </span>
          </div>

          <div className="flex items-center justify-center gap-3">
            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center p-1 shadow-brand">
              <img src="/kaiser-mark.png" alt="Kaiser AI" className="w-full h-full object-contain" />
            </div>
            <div className="text-left">
              <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-white tracking-tight">
                {mode === 'login' ? 'Citizen Sign In' : 'Resident Registration'}
              </h1>
              <p className="text-xs text-white/60">
                {mode === 'login'
                  ? 'Access your municipal grievance desk & live SLA status'
                  : 'Join 24 municipal wards to report hazards & earn civic rewards'}
              </p>
            </div>
          </div>
        </div>

        {/* ── Mode Switcher Tabs ── */}
        <div className="grid grid-cols-2 p-1.5 bg-neutral-950/80 border border-white/10 rounded-2xl relative font-mono text-xs">
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
                ? 'bg-neutral-800 text-white shadow-md border border-white/10'
                : 'text-white/60 hover:text-white'
            }`}
          >
            <Lock size={13} className={mode === 'login' ? 'text-emerald-400' : ''} />
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
                ? 'bg-emerald-500 text-neutral-950 shadow-md font-black'
                : 'text-white/60 hover:text-white'
            }`}
          >
            <Sparkles size={13} />
            <span>REGISTER NEW CITIZEN</span>
          </button>
        </div>

        {/* Error Alert Box */}
        {error && (
          <div className="p-3.5 bg-rose-950/70 border border-rose-500/40 text-rose-200 rounded-2xl text-xs flex items-center gap-2.5 animate-shake">
            <AlertCircle size={16} className="text-rose-400 shrink-0" />
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
                <label className="text-xs font-semibold text-white/80 flex items-center justify-between">
                  <span>Full Legal Name</span>
                  <span className="text-[10px] text-white/40 font-mono">Used on municipal certificates</span>
                </label>
                <div className="relative flex items-center">
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 flex items-center justify-center font-bold text-xs ml-2 absolute">
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
                    className="w-full pl-13 pr-4 py-3 bg-neutral-950/80 border border-white/15 rounded-xl text-xs text-white placeholder-white/30 focus:outline-none focus:border-emerald-400 transition-colors shadow-inner"
                  />
                </div>
                {fieldErrors.name && (
                  <p className="text-rose-400 text-[11px] font-medium flex items-center gap-1">
                    <AlertCircle size={11} /> {fieldErrors.name}
                  </p>
                )}
              </div>

              {/* Phone number */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-white/80 flex items-center justify-between">
                  <span>Mobile Phone Number</span>
                  <span className="text-[10px] text-emerald-400 font-mono">For resolution SMS updates</span>
                </label>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40" size={15} />
                  <input
                    type="tel"
                    placeholder="+91 98765 43210"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    maxLength={20}
                    autoComplete="tel"
                    className="w-full pl-10 pr-4 py-3 bg-neutral-950/80 border border-white/15 rounded-xl text-xs text-white placeholder-white/30 focus:outline-none focus:border-emerald-400 transition-colors shadow-inner font-mono"
                  />
                </div>
              </div>

              {/* Mumbai Ward Selection */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-white/80 flex items-center justify-between">
                  <span>Resident Mumbai Ward</span>
                  <span className="text-[10px] text-teal-300 font-mono">Auto-routes to your Ward Junior Engineer</span>
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 text-emerald-400 pointer-events-none" size={15} />
                  <select
                    value={formData.ward}
                    onChange={(e) => handleInputChange('ward', Number(e.target.value))}
                    className="w-full pl-10 pr-4 py-3 bg-neutral-950 border border-white/15 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-400 transition-colors shadow-inner cursor-pointer"
                  >
                    {MUMBAI_WARDS.map((w) => (
                      <option key={w.id} value={w.id} className="bg-neutral-900 text-white">
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
            <label className="text-xs font-semibold text-white/80">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40" size={15} />
              <input
                type="email"
                placeholder="citizen@mumbai.gov.in"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                required
                maxLength={254}
                autoComplete="email"
                className="w-full pl-10 pr-4 py-3 bg-neutral-950/80 border border-white/15 rounded-xl text-xs text-white placeholder-white/30 focus:outline-none focus:border-emerald-400 transition-colors shadow-inner font-mono"
              />
            </div>
            {fieldErrors.email && (
              <p className="text-rose-400 text-[11px] font-medium flex items-center gap-1">
                <AlertCircle size={11} /> {fieldErrors.email}
              </p>
            )}
          </div>

          {/* ── Password Field ── */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-white/80 flex items-center justify-between">
              <span>Password</span>
              {mode === 'register' && (
                <span className={`text-[10px] font-mono font-bold ${
                  pwdStrength.score >= 75 ? 'text-emerald-400' : pwdStrength.score >= 50 ? 'text-amber-400' : 'text-rose-400'
                }`}>
                  {pwdStrength.label ? `Strength: ${pwdStrength.label}` : 'Min 8 chars'}
                </span>
              )}
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40" size={15} />
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••••••"
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                required
                maxLength={128}
                autoComplete={mode === 'register' ? 'new-password' : 'current-password'}
                className="w-full pl-10 pr-11 py-3 bg-neutral-950/80 border border-white/15 rounded-xl text-xs text-white placeholder-white/30 focus:outline-none focus:border-emerald-400 transition-colors shadow-inner font-mono"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors cursor-pointer"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>

            {/* Live Strength Meter (Registration Mode) */}
            {mode === 'register' && formData.password.length > 0 && (
              <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden mt-1.5">
                <div
                  className={`h-full transition-all duration-300 ${pwdStrength.color}`}
                  style={{ width: `${pwdStrength.score}%` }}
                />
              </div>
            )}

            {fieldErrors.password && (
              <p className="text-rose-400 text-[11px] font-medium flex items-center gap-1">
                <AlertCircle size={11} /> {fieldErrors.password}
              </p>
            )}
          </div>

          {/* ── DPDP Act Consent (Register Mode) ── */}
          {mode === 'register' && (
            <div className="pt-1 flex items-start gap-2.5 text-xs text-white/60">
              <input
                type="checkbox"
                id="consent"
                checked={formData.consent}
                onChange={(e) => setFormData((p) => ({ ...p, consent: e.target.checked }))}
                className="mt-0.5 rounded border-white/20 bg-neutral-950 text-emerald-500 focus:ring-0 cursor-pointer"
              />
              <label htmlFor="consent" className="cursor-pointer text-[11px] leading-relaxed">
                I agree to the <span className="text-emerald-400 underline">Terms of Civic Service</span> and consent to municipal ward routing in accordance with India's <strong className="text-white">DPDP Act 2023</strong>.
              </label>
            </div>
          )}

          {/* ── Main Action Button ── */}
          <button
            type="submit"
            disabled={loading}
            className="glow-btn relative overflow-hidden shine group w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-500 via-brand-500 to-teal-400 text-neutral-950 font-black text-xs tracking-widest uppercase shadow-[0_0_24px_rgba(52,211,153,0.45)] hover:scale-[1.02] active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-neutral-950 border-t-transparent rounded-full animate-spin" />
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

        {/* ── Quick 1-Click Demo Login Card (Citizen) ── */}
        {mode === 'login' && (
          <div className="p-3.5 bg-neutral-950/80 border border-emerald-500/30 rounded-2xl space-y-2">
            <div className="flex items-center justify-between text-[11px] font-mono font-bold text-emerald-300">
              <span className="flex items-center gap-1.5">
                <UserCheck size={13} className="text-emerald-400" />
                QUICK DEMO CITIZEN ACCESS
              </span>
              <span className="text-white/40 text-[10px]">1-CLICK AUTO-FILL</span>
            </div>
            
            <button
              type="button"
              onClick={fillSingleCitizenDemo}
              className="w-full flex items-center justify-between p-2.5 bg-white/5 hover:bg-emerald-500/10 border border-white/10 hover:border-emerald-400/40 rounded-xl text-left transition-all cursor-pointer group"
            >
              <div className="min-w-0 pr-2">
                <span className="text-xs font-bold text-white group-hover:text-emerald-300 block truncate">
                  Priya Nair (Resident · Bandra North)
                </span>
                <span className="text-[10px] font-mono text-white/50 block truncate">
                  Ward 8 · {DEMO_CITIZENS[0].email}
                </span>
              </div>
              <div className="text-right shrink-0">
                <span className="text-[10px] font-mono bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded font-bold border border-emerald-400/30">
                  Fill Demo →
                </span>
              </div>
            </button>
          </div>
        )}

        {/* ── Municipal Staff Portal Switcher Banner ── */}
        <div className="p-3.5 bg-neutral-950/70 border border-white/10 rounded-2xl flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-sky-500/20 text-sky-300 border border-sky-400/30 flex items-center justify-center shrink-0">
              <BadgeCheck size={16} />
            </div>
            <div>
              <p className="font-bold text-white text-xs">BMC Municipal Staff Portal</p>
              <p className="text-[10px] text-white/50">24 Ward Junior Engineers & Headquarters</p>
            </div>
          </div>
          <Link
            to="/officer-login"
            onClick={() => sound.play('click')}
            className="px-3 py-1.5 rounded-xl border border-white/20 hover:border-sky-400 hover:bg-white/10 text-white font-mono text-xs flex items-center gap-1 transition-colors cursor-pointer shrink-0"
          >
            <span>Staff Portal</span>
            <ArrowRight size={12} />
          </Link>
        </div>

      </div>

    </div>
  );
};
