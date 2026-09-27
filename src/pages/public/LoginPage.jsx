import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Shield, Lock, Mail, ArrowRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';

export const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [role, setRole] = useState('citizen'); // citizen | officer | admin
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await login(email, password, role);
      if (role === 'admin') navigate('/admin');
      else if (role === 'officer') navigate('/officer');
      else navigate('/app');
    } catch (err) {
      setError(err?.response?.data?.error?.message || err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleRoleSelect = (selected) => {
    setRole(selected);
    if (selected === 'citizen') setEmail('priya.nair@example.com');
    else if (selected === 'officer') setEmail('suresh.patil@bmc.gov.in');
    else if (selected === 'admin') setEmail('r.mehta@bmc.gov.in');
    setPassword('demo1234');
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl w-full grid md:grid-cols-12 bg-white rounded-3xl shadow-soft-xl border border-neutral-200/80 overflow-hidden">
        
        {/* Left Form */}
        <div className="md:col-span-7 p-8 sm:p-12 space-y-6">
          <div className="space-y-2">
            <Link to="/" className="inline-flex items-center gap-2 mb-2">
              <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center shadow-brand">
                <Shield size={18} className="text-white" strokeWidth={2.5} />
              </div>
              <span className="font-bold text-lg text-neutral-900">Kaiser <span className="text-brand-600">AI</span></span>
            </Link>
            <h2 className="text-2xl font-extrabold text-neutral-900">Sign in to your account</h2>
            <p className="text-xs text-neutral-500">Select your portal role below to sign in or use demo accounts.</p>
          </div>

          {/* Role selector tabs */}
          <div className="grid grid-cols-3 gap-1 p-1 bg-neutral-100 rounded-xl text-xs font-semibold">
            <button
              type="button"
              onClick={() => handleRoleSelect('citizen')}
              className={`py-2 rounded-lg transition-all cursor-pointer ${role === 'citizen' ? 'bg-white text-brand-700 shadow-soft-sm' : 'text-neutral-500'}`}
            >
              Citizen
            </button>
            <button
              type="button"
              onClick={() => handleRoleSelect('officer')}
              className={`py-2 rounded-lg transition-all cursor-pointer ${role === 'officer' ? 'bg-white text-sky-700 shadow-soft-sm' : 'text-neutral-500'}`}
            >
              Ward Officer
            </button>
            <button
              type="button"
              onClick={() => handleRoleSelect('admin')}
              className={`py-2 rounded-lg transition-all cursor-pointer ${role === 'admin' ? 'bg-white text-amber-700 shadow-soft-sm' : 'text-neutral-500'}`}
            >
              BMC Admin
            </button>
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Email Address or Mobile"
              type="text"
              placeholder={role === 'officer' ? 'officer@bmc.gov.in' : 'citizen@example.com'}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-neutral-700">Password</label>
                <Link to="/forgot-password" className="text-xs text-brand-600 hover:underline">
                  Forgot password?
                </Link>
              </div>
              <Input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <Button
              type="submit"
              variant="primary"
              fullWidth
              loading={loading}
              className="py-3 rounded-full font-bold text-sm shadow-brand"
            >
              Sign In as {role.toUpperCase()}
            </Button>
          </form>

          {/* Google OAuth Button */}
          <div className="pt-2 border-t border-neutral-100 space-y-3">
            <button
              type="button"
              onClick={() => handleRoleSelect('citizen')}
              className="w-full py-2.5 px-4 bg-white border border-neutral-300 rounded-full text-xs font-semibold text-neutral-700 hover:bg-neutral-50 shadow-soft-sm flex items-center justify-center gap-2 cursor-pointer transition-colors"
            >
              <svg width="18" height="18" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"/>
                <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"/>
                <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"/>
                <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
              </svg>
              Continue with Google
            </button>
            <div className="text-center text-xs text-neutral-500">
              Don't have an account?{' '}
              <Link to="/register" className="text-brand-600 font-bold hover:underline">
                Sign Up as Citizen
              </Link>
            </div>
          </div>
        </div>

        {/* Right Civic Illustration Column */}
        <div className="hidden md:flex md:col-span-5 bg-gradient-to-br from-brand-600 to-emerald-700 p-8 text-white flex-col justify-between">
          <div className="space-y-4">
            <Badge variant="brand" className="bg-white/20 text-white border-none">
              Brihanmumbai Civic AI
            </Badge>
            <h3 className="text-2xl font-extrabold leading-snug">
              Transforming Civic Governance for 26 Mumbai Wards
            </h3>
            <p className="text-xs text-brand-100 leading-relaxed">
              Real-time grievance telemetry, automated department routing, and verified image audit trails.
            </p>
          </div>

          <div className="space-y-3 p-4 bg-white/10 rounded-2xl backdrop-blur-sm border border-white/10 text-xs">
            <div className="font-semibold text-white">⚡ Quick Demo Login Credentials:</div>
            <div className="text-brand-100 space-y-1 text-[11px]">
              <div>• Citizen: <code>priya.nair@example.com</code></div>
              <div>• Officer: <code>suresh.patil@bmc.gov.in</code></div>
              <div>• Admin: <code>r.mehta@bmc.gov.in</code></div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
