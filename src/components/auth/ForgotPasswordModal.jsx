import React, { useState, useEffect } from 'react';
import {
  KeyRound,
  Mail,
  Lock,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  Shield,
  RotateCcw,
  Sparkles,
  X,
  UserCheck,
} from 'lucide-react';
import { requestPasswordReset, resetPassword } from '../../api/auth.api';
import { sound } from '../../utils/soundEffects';
import toast from 'react-hot-toast';

export const ForgotPasswordModal = ({
  isOpen,
  onClose,
  initialEmail = '',
  accountType = 'citizen', // 'citizen' | 'officer' | 'admin'
  accountName = '',
  onSuccess,
}) => {
  const [step, setStep] = useState('request'); // 'request' | 'verify' | 'success'
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [devOtp, setDevOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Sync initial email when modal opens
  useEffect(() => {
    if (isOpen) {
      setEmail(initialEmail || '');
      setOtp('');
      setDevOtp('');
      setNewPassword('');
      setConfirmPassword('');
      setError('');
      setStep('request');
      setShowPwd(false);
    }
  }, [isOpen, initialEmail]);

  if (!isOpen) return null;

  // Role metadata
  const roleConfig = {
    citizen: {
      title: 'Citizen Password Recovery',
      badge: 'Resident Account',
      badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      iconColor: 'bg-emerald-600',
      hint: 'Enter your registered citizen email to receive a secure recovery code.',
    },
    officer: {
      title: 'Ward Officer Password Reset',
      badge: 'MCGM Field Desk',
      badgeColor: 'bg-brand-100 text-brand-800 border-brand-200',
      iconColor: 'bg-brand-600',
      hint: 'Enter your official BMC/MCGM engineer email to reset your official password.',
    },
    admin: {
      title: 'Municipal HQ Admin Key Recovery',
      badge: 'Central Command',
      badgeColor: 'bg-amber-100 text-amber-800 border-amber-200',
      iconColor: 'bg-neutral-900',
      hint: 'Enter your municipal administrator email to reset your console security key.',
    },
  }[accountType] || {
    title: 'Account Password Recovery',
    badge: 'Security Desk',
    badgeColor: 'bg-brand-100 text-brand-800',
    iconColor: 'bg-brand-600',
    hint: 'Enter your account email to receive a recovery code.',
  };

  // Step 1: Request OTP
  const handleRequestCode = async (e) => {
    e.preventDefault();
    setError('');

    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      setError('Please provide a valid registered email address.');
      sound.play('alert');
      return;
    }

    setLoading(true);
    sound.play('click');

    try {
      const res = await requestPasswordReset(cleanEmail);
      const data = res?.data || res;
      if (data?.dev_otp) {
        setDevOtp(data.dev_otp);
      }
      setStep('verify');
      sound.play('pop');
      toast.success(`Verification code dispatched to ${cleanEmail}`);
    } catch (err) {
      sound.play('alert');
      setError(err.message || 'Unable to process password reset. Please verify email.');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify & Reset Password
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');

    const cleanOtp = otp.trim();
    if (!cleanOtp || cleanOtp.length !== 6) {
      setError('Please enter the 6-digit verification code.');
      sound.play('alert');
      return;
    }

    if (!newPassword || newPassword.length < 6) {
      setError('New password must be at least 6 characters.');
      sound.play('alert');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match. Please re-enter.');
      sound.play('alert');
      return;
    }

    setLoading(true);
    sound.play('click');

    try {
      await resetPassword({
        email: email.trim().toLowerCase(),
        otp: cleanOtp,
        newPassword,
      });

      sound.play('success');
      setStep('success');

      if (onSuccess) {
        onSuccess({
          email: email.trim().toLowerCase(),
          newPassword,
        });
      }
    } catch (err) {
      sound.play('alert');
      setError(err.message || 'Password update failed. Code may be invalid or expired.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div
        className="relative w-full max-w-md bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 rounded-3xl shadow-2xl border border-neutral-200 dark:border-neutral-800 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header gradient banner */}
        <div className="h-2 bg-gradient-to-r from-brand-600 via-emerald-500 to-teal-400" />

        {/* Close button */}
        <button
          type="button"
          onClick={() => {
            sound.play('click');
            onClose();
          }}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-500 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200 flex items-center justify-center transition-colors cursor-pointer"
        >
          <X size={16} />
        </button>

        <div className="p-6 sm:p-7 space-y-5">
          {/* Header */}
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-2xl ${roleConfig.iconColor} text-white flex items-center justify-center shadow-md shadow-brand-500/20`}>
              <KeyRound size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-neutral-900 dark:text-neutral-100 text-base sm:text-lg">
                  {roleConfig.title}
                </h3>
              </div>
              <span className={`inline-block mt-0.5 px-2 py-0.5 rounded-full text-[10px] font-bold border ${roleConfig.badgeColor}`}>
                {roleConfig.badge}
              </span>
            </div>
          </div>

          {accountName && step !== 'success' && (
            <div className="p-2.5 bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-700 rounded-xl flex items-center gap-2 text-xs text-neutral-600 dark:text-neutral-300">
              <UserCheck size={14} className="text-brand-600 dark:text-brand-400 shrink-0" />
              <span>Target Account: <strong className="text-neutral-900 dark:text-neutral-100">{accountName}</strong></span>
            </div>
          )}

          {/* Error notice */}
          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800/40 rounded-xl text-xs text-red-700 dark:text-red-300 flex items-start gap-2 animate-shake">
              <AlertCircle size={15} className="text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
              <span className="font-medium leading-relaxed">{error}</span>
            </div>
          )}

          {/* ── STEP 1: Request Code ── */}
          {step === 'request' && (
            <form onSubmit={handleRequestCode} className="space-y-4">
              <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed">
                {roleConfig.hint}
              </p>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">Account Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400 dark:text-neutral-500" size={16} />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. officer@mcgm.gov.in"
                    required
                    className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl text-neutral-800 dark:text-neutral-100 placeholder-neutral-400 dark:placeholder-neutral-500 text-xs focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 font-mono shadow-xs"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 bg-brand-600 hover:bg-brand-700 disabled:opacity-60 text-white font-bold rounded-xl text-xs shadow-soft transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Dispatching Verification Code…</span>
                  </span>
                ) : (
                  <>
                    <span>Send Recovery Code</span>
                    <ArrowRight size={14} />
                  </>
                )}
              </button>
            </form>
          )}

          {/* ── STEP 2: Enter Code & New Password ── */}
          {step === 'verify' && (
            <form onSubmit={handleResetPassword} className="space-y-3.5">
              <div className="flex items-center justify-between text-xs text-neutral-500 dark:text-neutral-400">
                <span>Code sent to: <strong className="text-neutral-800 dark:text-neutral-200 font-mono">{email}</strong></span>
                <button
                  type="button"
                  onClick={() => {
                    setStep('request');
                    setError('');
                  }}
                  className="text-brand-600 dark:text-brand-400 hover:underline font-semibold cursor-pointer"
                >
                  Change Email
                </button>
              </div>

              {/* Dev OTP convenience chip for demo testing */}
              {devOtp && (
                <div className="p-2.5 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/40 rounded-xl text-[11px] text-amber-800 dark:text-amber-300 flex items-center justify-between">
                  <span className="flex items-center gap-1">
                    <Sparkles size={12} className="text-amber-600 dark:text-amber-400" />
                    Local Demo Code: <strong className="font-mono text-amber-950 dark:text-amber-200 font-bold">{devOtp}</strong>
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setOtp(devOtp);
                      toast.success('Auto-filled demo recovery code.');
                    }}
                    className="text-[10px] font-bold text-amber-800 dark:text-amber-300 bg-amber-200/60 dark:bg-amber-900/60 hover:bg-amber-200 dark:hover:bg-amber-800 px-2 py-0.5 rounded-lg cursor-pointer"
                  >
                    Use Code
                  </button>
                </div>
              )}

              {/* 6-Digit OTP */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">6-Digit Verification Code</label>
                <input
                  type="text"
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                  placeholder="123456"
                  required
                  className="w-full text-center tracking-[0.5em] text-lg font-mono font-bold py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-xl text-neutral-900 dark:text-neutral-100 focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 shadow-inner"
                />
              </div>

              {/* New Password */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">New Password (min 6 characters)</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400 dark:text-neutral-500" size={15} />
                  <input
                    type={showPwd ? 'text' : 'password'}
                    placeholder="••••••••••••"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    className="w-full pl-10 pr-10 py-2.5 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl text-xs text-neutral-800 dark:text-neutral-100 placeholder-neutral-400 dark:placeholder-neutral-500 focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 font-mono shadow-xs"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPwd(!showPwd)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 cursor-pointer"
                  >
                    {showPwd ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">Confirm New Password</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400 dark:text-neutral-500" size={15} />
                  <input
                    type={showPwd ? 'text' : 'password'}
                    placeholder="••••••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl text-xs text-neutral-800 dark:text-neutral-100 placeholder-neutral-400 dark:placeholder-neutral-500 focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 font-mono shadow-xs"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white font-bold rounded-xl text-xs shadow-soft transition-all flex items-center justify-center gap-1.5 cursor-pointer mt-2"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Updating Password…</span>
                  </span>
                ) : (
                  <>
                    <CheckCircle2 size={15} />
                    <span>Set New Password & Complete</span>
                  </>
                )}
              </button>
            </form>
          )}

          {/* ── STEP 3: Success Screen ── */}
          {step === 'success' && (
            <div className="text-center py-4 space-y-4 animate-fade-in">
              <div className="w-14 h-14 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto shadow-md">
                <CheckCircle2 size={32} />
              </div>
              <div className="space-y-1">
                <h4 className="text-base font-bold text-neutral-900 dark:text-neutral-100">
                  Password Updated Successfully!
                </h4>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed max-w-xs mx-auto">
                  Your credentials have been securely updated. You can now log into Kaiser AI with your new password.
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  sound.play('click');
                  onClose();
                }}
                className="w-full py-2.5 bg-neutral-900 dark:bg-emerald-600 hover:bg-neutral-800 dark:hover:bg-emerald-700 text-white font-bold rounded-xl text-xs shadow-soft transition-all cursor-pointer"
              >
                Return to Sign In
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

