import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Shield, User, Lock, Phone, ArrowRight, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { Card } from '../components/common/Card';

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

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await login({ email: formData.email || `${role}@kaiser.gov.in`, password: formData.password || 'password123' });
      if (role === 'admin') navigate('/admin');
      else if (role === 'officer') navigate('/officer');
      else navigate('/app');
    } catch (err) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
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
            onClick={() => setRole('citizen')}
            className={`py-2 rounded-lg transition-all ${role === 'citizen' ? 'bg-white text-neutral-900 shadow-soft-sm' : 'text-neutral-500'}`}
          >
            Citizen
          </button>
          <button
            type="button"
            onClick={() => setRole('officer')}
            className={`py-2 rounded-lg transition-all ${role === 'officer' ? 'bg-white text-neutral-900 shadow-soft-sm' : 'text-neutral-500'}`}
          >
            Officer
          </button>
          <button
            type="button"
            onClick={() => setRole('admin')}
            className={`py-2 rounded-lg transition-all ${role === 'admin' ? 'bg-white text-neutral-900 shadow-soft-sm' : 'text-neutral-500'}`}
          >
            BMC Admin
          </button>
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'register' && (
            <Input
              label="Full Name"
              type="text"
              placeholder="e.g. Aarav Sharma"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          )}

          <Input
            label="Email or Mobile Number"
            type="text"
            placeholder={role === 'officer' ? 'officer.ke@mcgm.gov.in' : 'aarav@example.com'}
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
          />

          <Input
            label="Password"
            type="password"
            placeholder="••••••••"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            required
          />

          {role === 'officer' && (
            <Input
              label="Officer Badge ID"
              type="text"
              placeholder="BMC-OFF-4892"
              value={formData.badgeNumber}
              onChange={(e) => setFormData({ ...formData, badgeNumber: e.target.value })}
            />
          )}

          <Button
            type="submit"
            variant="primary"
            className="w-full justify-center py-2.5"
            loading={loading}
          >
            {mode === 'login' ? `Sign In as ${role.toUpperCase()}` : 'Register Account'}
          </Button>
        </form>

        <div className="text-center pt-2 text-xs text-neutral-500">
          {mode === 'login' ? (
            <span>
              Don't have an account?{' '}
              <button
                type="button"
                onClick={() => setMode('register')}
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
                onClick={() => setMode('login')}
                className="text-brand-600 font-semibold hover:underline"
              >
                Sign In
              </button>
            </span>
          )}
        </div>
      </Card>
    </div>
  );
};
