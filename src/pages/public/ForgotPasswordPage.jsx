import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Shield, Mail, CheckCircle2, ArrowLeft } from 'lucide-react';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';

export const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setSubmitted(true);
      setLoading(false);
    }, 800);
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <Card className="max-w-md w-full p-8 shadow-soft-xl border border-neutral-200/80 space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 bg-brand-100 text-brand-700 rounded-2xl flex items-center justify-center mx-auto shadow-soft-sm">
            <Mail size={24} />
          </div>
          <h2 className="text-2xl font-bold text-neutral-900">Reset Password</h2>
          <p className="text-xs text-neutral-500">
            Enter your registered email address or phone number and we’ll send you a password reset link.
          </p>
        </div>

        {submitted ? (
          <div className="p-6 bg-emerald-50 rounded-2xl border border-emerald-200 text-center space-y-3">
            <CheckCircle2 size={36} className="text-emerald-600 mx-auto" />
            <h3 className="font-bold text-neutral-900 text-base">Check Your Inbox</h3>
            <p className="text-xs text-neutral-600">
              We've sent a password reset token to <strong>{email}</strong>. Please follow the instructions to regain access.
            </p>
            <Link to="/login" className="inline-block pt-2">
              <Button variant="outline" size="sm">Back to Sign In</Button>
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Registered Email or Mobile"
              type="text"
              placeholder="e.g. priya@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <Button
              type="submit"
              variant="primary"
              fullWidth
              loading={loading}
              className="py-3 rounded-full font-bold text-sm shadow-brand"
            >
              Send Password Reset Link
            </Button>

            <div className="text-center pt-2">
              <Link to="/login" className="text-xs text-neutral-500 hover:text-neutral-800 inline-flex items-center gap-1 font-medium">
                <ArrowLeft size={14} /> Back to Sign In
              </Link>
            </div>
          </form>
        )}
      </Card>
    </div>
  );
};
