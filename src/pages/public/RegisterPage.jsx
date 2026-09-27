import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Shield, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { MUMBAI_WARDS } from '../../utils/mockData';

export const RegisterPage = () => {
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    ward: 8, // G/N Bandra default
    terms: false
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (!formData.terms) {
      setError('Please agree to terms and civic guidelines');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await registerUser({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        phone: formData.phone,
        ward: Number(formData.ward)
      });
      navigate('/app');
    } catch (err) {
      setError(err?.response?.data?.error?.message || err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl w-full grid md:grid-cols-12 bg-white rounded-3xl shadow-soft-xl border border-neutral-200/80 overflow-hidden">
        
        {/* Left Form */}
        <div className="md:col-span-7 p-8 sm:p-12 space-y-6">
          <div className="space-y-1">
            <Link to="/" className="inline-flex items-center gap-2 mb-2">
              <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center shadow-brand">
                <Shield size={18} className="text-white" strokeWidth={2.5} />
              </div>
              <span className="font-bold text-lg text-neutral-900">Kaiser <span className="text-brand-600">AI</span></span>
            </Link>
            <h2 className="text-2xl font-extrabold text-neutral-900">Create Citizen Account</h2>
            <p className="text-xs text-neutral-500">Register to submit grievances, track repairs, and upvote civic issues.</p>
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3.5">
            <Input
              label="Full Name"
              type="text"
              placeholder="e.g. Priya Nair"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />

            <div className="grid sm:grid-cols-2 gap-3">
              <Input
                label="Email Address"
                type="email"
                placeholder="priya@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
              <Input
                label="Phone Number"
                placeholder="+91 98765 43210"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-neutral-700">Resident Municipal Ward</label>
              <select
                value={formData.ward}
                onChange={(e) => setFormData({ ...formData, ward: Number(e.target.value) })}
                className="w-full rounded-xl border border-neutral-200 p-2.5 text-xs font-medium text-neutral-800 focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
              >
                {MUMBAI_WARDS.map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.name} – {w.area}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid sm:grid-cols-2 gap-3">
              <Input
                label="Password"
                type="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
              />
              <Input
                label="Confirm Password"
                type="password"
                placeholder="••••••••"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                required
              />
            </div>

            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="terms"
                checked={formData.terms}
                onChange={(e) => setFormData({ ...formData, terms: e.target.checked })}
                className="w-4 h-4 rounded text-brand-600 focus:ring-brand-500 border-neutral-300"
              />
              <label htmlFor="terms" className="text-xs text-neutral-600">
                I agree to the BMC Civic Code of Conduct and Verified Reporting policy.
              </label>
            </div>

            <Button
              type="submit"
              variant="primary"
              fullWidth
              loading={loading}
              className="py-3 rounded-full font-bold text-sm shadow-brand mt-2"
            >
              Register Account
            </Button>
          </form>

          <div className="text-center text-xs text-neutral-500 pt-2 border-t border-neutral-100">
            Already have an account?{' '}
            <Link to="/login" className="text-brand-600 font-bold hover:underline">
              Sign In
            </Link>
          </div>
        </div>

        {/* Right Illustration Column */}
        <div className="hidden md:flex md:col-span-5 bg-gradient-to-br from-brand-600 to-emerald-700 p-8 text-white flex-col justify-between">
          <div className="space-y-4">
            <Badge variant="brand" className="bg-white/20 text-white border-none">
              Mumbai Civic Participation
            </Badge>
            <h3 className="text-2xl font-extrabold leading-snug">
              Every Report Shapes Your Neighborhood
            </h3>
            <p className="text-xs text-brand-100 leading-relaxed">
              When citizens actively flag civic hazards, municipal teams can proactively allocate asphalt, clean drainage sumps, and replace broken lights faster.
            </p>
          </div>

          <div className="space-y-2 text-xs text-brand-100 bg-white/10 p-4 rounded-2xl">
            <div className="flex items-center gap-2">
              <CheckCircle2 size={16} className="text-white" />
              <span>Direct SMS alerts on ticket milestones</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 size={16} className="text-white" />
              <span>Community upvoting to increase priority</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 size={16} className="text-white" />
              <span>Inspect officer resolution photo proof</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
