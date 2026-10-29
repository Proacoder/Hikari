import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Shield, Search, Eye, EyeOff,
  MapPin, BadgeCheck, AlertCircle, Building2,
  ArrowLeft, UserCheck
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { MOCK_OFFICERS } from '../utils/mockData';
import { ForgotPasswordModal } from '../components/auth/ForgotPasswordModal';
import toast from 'react-hot-toast';

const DEPT_COLORS = {
  'Roads & Infrastructure': { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-700', badge: 'bg-amber-100 text-amber-700', avatar: 'bg-gradient-to-br from-amber-400 to-orange-500' },
  'Sanitation': { bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-700', badge: 'bg-emerald-100 text-emerald-700', avatar: 'bg-gradient-to-br from-emerald-400 to-teal-500' },
  'Water Supply': { bg: 'bg-sky-50', border: 'border-sky-200', text: 'text-sky-700', badge: 'bg-sky-100 text-sky-700', avatar: 'bg-gradient-to-br from-sky-400 to-blue-500' },
  'Electrical': { bg: 'bg-yellow-50', border: 'border-yellow-200', text: 'text-yellow-700', badge: 'bg-yellow-100 text-yellow-700', avatar: 'bg-gradient-to-br from-yellow-400 to-amber-500' },
  'Building & Permits': { bg: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-700', badge: 'bg-purple-100 text-purple-700', avatar: 'bg-gradient-to-br from-purple-400 to-violet-500' },
};

const DEFAULT_DEPT = { bg: 'bg-brand-50', border: 'border-brand-200', text: 'text-brand-700', badge: 'bg-brand-100 text-brand-700', avatar: 'bg-gradient-to-br from-brand-400 to-blue-500' };

export const OfficerLoginPage = () => {
  const [portalType, setPortalType] = useState('officer'); // 'officer' | 'admin'
  const [step, setStep] = useState('select');  // 'select' | 'login'
  const [selectedOfficer, setSelected] = useState(null);
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('All');

  // Credentials
  const [adminEmail, setAdminEmail] = useState('r.mehta@bmc.gov.in');
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotAccountType, setForgotAccountType] = useState('officer'); // 'officer' | 'admin'

  const { login } = useAuth();
  const navigate = useNavigate();

  const departments = ['All', 'Roads & Infrastructure', 'Sanitation', 'Water Supply', 'Electrical', 'Building & Permits'];

  const filteredOfficers = MOCK_OFFICERS.filter((o) => {
    const matchSearch = o.name.toLowerCase().includes(search.toLowerCase()) ||
      o.wardName.toLowerCase().includes(search.toLowerCase()) ||
      o.department.toLowerCase().includes(search.toLowerCase());
    const matchDept = deptFilter === 'All' || o.department === deptFilter;
    return matchSearch && matchDept;
  });

  const handleOfficerSelect = (officer) => {
    setSelected(officer);
    setPassword('');
    setError('');
    setStep('login');
  };

  const handleOfficerLogin = async (e) => {
    e.preventDefault();
    setError('');

    if (!password.trim()) {
      setError('Password is required.');
      return;
    }

    setLoading(true);
    try {
      const res = await login({ email: selectedOfficer.email, password });
      navigate(`/officer/${res?.data?.user?.id || selectedOfficer.id}`);
    } catch (err) {
      setError(err.message || 'Incorrect password. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleAdminLogin = async (e) => {
    e.preventDefault();
    setError('');

    if (!adminEmail.trim() || !password.trim()) {
      setError('Email and password are required.');
      return;
    }

    setLoading(true);
    try {
      await login({ email: adminEmail.trim(), password });
      navigate('/admin');
    } catch (err) {
      setError(err.message || 'Authentication failed. Please verify administrator credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 flex flex-col transition-colors">
      {/* ── Official Staff Header ── */}
      <header className="bg-white dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800 shadow-sm flex items-center justify-between px-6 py-3.5">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-brand-700 rounded-xl flex items-center justify-center shadow">
            <Shield size={16} className="text-white" strokeWidth={2.5} />
          </div>
          <div>
            <span className="font-bold text-neutral-900 dark:text-neutral-100 text-base">Kaiser <span className="text-brand-600 dark:text-brand-400">AI</span></span>
            <span className="text-[11px] text-neutral-400 dark:text-neutral-500 block font-medium leading-none">Brihanmumbai Municipal Corporation</span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <Link
            to="/login"
            className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200 flex items-center gap-1 transition-colors"
          >
            <ArrowLeft size={13} /> Citizen Portal
          </Link>
          <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/40 rounded-full text-emerald-700 dark:text-emerald-300 text-[11px] font-semibold">
            <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full" />
            Official Gateway
          </span>
        </div>
      </header>

      <div className="flex-1 flex flex-col items-center justify-start p-4 py-8 max-w-5xl mx-auto w-full">
        {/* Portal Switcher Tabs (Only shown on profile selection list or admin portal; hidden during officer password sign-in) */}
        {(portalType === 'admin' || step === 'select') && (
          <div className="flex p-1 bg-neutral-200/80 dark:bg-neutral-800/80 rounded-xl mb-6 text-xs font-semibold max-w-md w-full">
            <button
              type="button"
              onClick={() => { setPortalType('officer'); setStep('select'); setError(''); setPassword(''); }}
              className={`flex-1 py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${portalType === 'officer' ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 shadow-soft-sm font-bold' : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200'
                }`}
            >
              <BadgeCheck size={14} className="text-brand-600 dark:text-brand-400" />
              Ward Officers ({MOCK_OFFICERS.length})
            </button>
            <button
              type="button"
              onClick={() => { setPortalType('admin'); setError(''); setPassword(''); }}
              className={`flex-1 py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${portalType === 'admin' ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 shadow-soft-sm font-bold' : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200'
                }`}
            >
              <Building2 size={14} className="text-brand-600 dark:text-brand-400" />
              Municipal HQ Admin
            </button>
          </div>
        )}

        {/* ── SECTION A: WARD OFFICERS PORTAL ── */}
        {portalType === 'officer' && (
          <>
            {step === 'select' ? (
              <>
                {/* Header */}
                <div className="text-center mb-6 w-full">
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-brand-50 dark:bg-brand-950/40 border border-brand-200 dark:border-brand-800/40 rounded-full text-brand-700 dark:text-brand-300 text-xs font-semibold mb-2">
                    <BadgeCheck size={12} />
                    MCGM Ward Officers · {MOCK_OFFICERS.length} Administrative Wards
                  </div>
                  <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-1">Select Your Ward Officer Profile</h1>
                  <p className="text-neutral-500 dark:text-neutral-400 text-sm">Designated engineering & field operations desk across Greater Mumbai</p>
                </div>

                {/* Search & Filter Bar */}
                <div className="w-full flex flex-col sm:flex-row gap-2 mb-5">
                  <div className="relative flex-1">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 dark:text-neutral-500" />
                    <input
                      type="text"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="Search by name, ward (e.g. Bandra, Ward 8) or department…"
                      className="w-full pl-9 pr-4 py-2.5 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl text-neutral-800 dark:text-neutral-100 placeholder-neutral-400 dark:placeholder-neutral-500 text-sm focus:outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100 transition-all shadow-sm"
                    />
                  </div>
                  <select
                    value={deptFilter}
                    onChange={(e) => setDeptFilter(e.target.value)}
                    className="py-2.5 px-3 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl text-neutral-700 dark:text-neutral-200 text-xs font-medium focus:outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100 shadow-sm cursor-pointer"
                  >
                    {departments.map((d) => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>

                {/* Stats Row */}
                <div className="w-full grid grid-cols-3 gap-3 mb-5">
                  {[
                    { label: 'Active Wards', value: `${MOCK_OFFICERS.length}`, color: 'text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-950/40 border-brand-100 dark:border-brand-800/40' },
                    { label: 'Available Now', value: `${MOCK_OFFICERS.filter(o => o.status === 'Available').length}`, color: 'text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-100 dark:border-emerald-800/40' },
                    { label: 'Total Resolved', value: MOCK_OFFICERS.reduce((s, o) => s + o.resolvedCount, 0).toLocaleString(), color: 'text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 border-amber-100 dark:border-amber-800/40' },
                  ].map(({ label, value, color }) => (
                    <div key={label} className={`border rounded-xl px-4 py-3 text-center ${color}`}>
                      <div className="text-xl font-bold">{value}</div>
                      <div className="text-[11px] font-medium opacity-70 mt-0.5">{label}</div>
                    </div>
                  ))}
                </div>

                {/* Officers Grid */}
                <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                  {filteredOfficers.map((officer) => {
                    const deptStyle = DEPT_COLORS[officer.department] || DEFAULT_DEPT;
                    return (
                      <div
                        key={officer.id}
                        onClick={() => handleOfficerSelect(officer)}
                        className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 hover:border-brand-400 dark:hover:border-brand-500 hover:shadow-soft-md rounded-2xl p-4 cursor-pointer transition-all flex flex-col justify-between group"
                      >
                        <div className="flex items-start gap-3">
                          <div className={`w-11 h-11 rounded-xl text-white font-bold flex items-center justify-center shrink-0 shadow-sm ${deptStyle.avatar}`}>
                            {officer.avatarInitials}
                          </div>
                          <div className="min-w-0 flex-1">
                            <h3 className="font-bold text-neutral-900 dark:text-neutral-100 text-sm truncate group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
                              {officer.name}
                            </h3>
                            <div className="flex items-center gap-1 text-[11px] text-neutral-500 dark:text-neutral-400 mt-0.5 truncate">
                              <MapPin size={11} className="shrink-0 text-brand-600 dark:text-brand-400" />
                              <span className="truncate">{officer.wardName}</span>
                            </div>
                            <span className={`inline-block mt-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${deptStyle.bg} ${deptStyle.text} ${deptStyle.border}`}>
                              {officer.department}
                            </span>
                          </div>
                        </div>

                        <div className="mt-3 pt-3 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between text-[11px]">
                          <span className="text-neutral-400 dark:text-neutral-500 font-mono text-[10px]">Badge #{officer.employeeId.split('/').slice(-2).join('/')}</span>
                          <span className="text-brand-600 dark:text-brand-400 font-bold group-hover:translate-x-0.5 transition-transform">Sign In →</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            ) : (
              /* Step 2: Officer Password Screen */
              <div className="max-w-md w-full bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-8 shadow-soft-lg space-y-6">
                <button
                  type="button"
                  onClick={() => { setStep('select'); setError(''); }}
                  className="text-xs text-neutral-500 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200 flex items-center gap-1 font-semibold cursor-pointer"
                >
                  <ArrowLeft size={13} /> Back to Officer List
                </button>

                <div className="text-center space-y-2">
                  <div className="w-14 h-14 rounded-2xl bg-brand-600 text-white font-bold text-lg flex items-center justify-center mx-auto shadow-md">
                    {selectedOfficer.avatarInitials}
                  </div>
                  <h2 className="text-xl font-bold text-neutral-900 dark:text-neutral-100">{selectedOfficer.name}</h2>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400">{selectedOfficer.wardName} · {selectedOfficer.department}</p>
                </div>

                {error && (
                  <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800/40 text-red-700 dark:text-red-300 rounded-xl text-xs flex items-center gap-2">
                    <AlertCircle size={14} className="shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                <form onSubmit={handleOfficerLogin} className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">Official Password</label>
                    <div className="relative">
                      <input
                        type={showPwd ? 'text' : 'password'}
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="w-full px-4 py-2.5 pr-11 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl text-neutral-800 dark:text-neutral-100 placeholder-neutral-400 dark:placeholder-neutral-500 text-sm focus:outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100 transition-all shadow-sm"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPwd(!showPwd)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 cursor-pointer"
                      >
                        {showPwd ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                    </div>
                    <div className="flex items-center justify-between pt-1">
                      <span className="text-[10px] text-neutral-400 dark:text-neutral-500">Assigned Ward Engineer</span>
                      <button
                        type="button"
                        onClick={() => {
                          setForgotAccountType('officer');
                          setShowForgotModal(true);
                        }}
                        className="text-xs text-brand-600 dark:text-brand-400 hover:text-brand-800 dark:hover:text-brand-300 font-semibold hover:underline cursor-pointer"
                      >
                        Forgot password?
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-2.5 bg-brand-600 hover:bg-brand-700 disabled:opacity-60 text-white font-bold rounded-xl text-xs shadow-soft transition-all cursor-pointer"
                  >
                    {loading ? 'Verifying Credentials…' : `Sign In as ${selectedOfficer.name}`}
                  </button>
                </form>
              </div>
            )}
          </>
        )}

        {/* ── SECTION B: BMC COMMISSIONER & HQ ADMIN PORTAL ── */}
        {portalType === 'admin' && (
          <div className="max-w-md w-full bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-8 shadow-soft-lg space-y-6">
            <div className="text-center space-y-2">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-neutral-900 to-neutral-800 text-white flex items-center justify-center mx-auto shadow-md">
                <Building2 size={24} className="text-amber-400" />
              </div>
              <h2 className="text-xl font-bold text-neutral-900 dark:text-neutral-100">Municipal Commissioner HQ Console</h2>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">Brihanmumbai Municipal Corporation · Central Command Access</p>
            </div>

            {error && (
              <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800/40 text-red-700 dark:text-red-300 rounded-xl text-xs flex items-center gap-2">
                <AlertCircle size={14} className="shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleAdminLogin} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">Administrator Email</label>
                <input
                  type="email"
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  placeholder="r.mehta@bmc.gov.in"
                  required
                  className="w-full px-4 py-2.5 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl text-neutral-800 dark:text-neutral-100 placeholder-neutral-400 dark:placeholder-neutral-500 text-sm focus:outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100 transition-all shadow-sm"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">Admin Secret Key</label>
                <div className="relative">
                  <input
                    type={showPwd ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full px-4 py-2.5 pr-11 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl text-neutral-800 dark:text-neutral-100 placeholder-neutral-400 dark:placeholder-neutral-500 text-sm focus:outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100 transition-all shadow-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPwd(!showPwd)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 cursor-pointer"
                  >
                    {showPwd ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
                <div className="flex items-center justify-between pt-1">
                  <span className="text-[10px] text-neutral-400 dark:text-neutral-500">Municipal Commissioner Console</span>
                  <button
                    type="button"
                    onClick={() => {
                      setForgotAccountType('admin');
                      setShowForgotModal(true);
                    }}
                    className="text-xs text-amber-700 dark:text-amber-400 hover:text-amber-900 dark:hover:text-amber-300 font-semibold hover:underline cursor-pointer"
                  >
                    Forgot secret key?
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 bg-neutral-900 dark:bg-emerald-600 hover:bg-neutral-800 dark:hover:bg-emerald-700 disabled:opacity-60 text-white font-bold rounded-xl text-xs shadow-soft transition-all cursor-pointer"
              >
                {loading ? 'Authenticating Official Console…' : 'Authenticate Command Console'}
              </button>
            </form>
          </div>
        )}
      </div>

      <ForgotPasswordModal
        isOpen={showForgotModal}
        onClose={() => setShowForgotModal(false)}
        initialEmail={forgotAccountType === 'admin' ? adminEmail : (selectedOfficer?.email || '')}
        accountType={forgotAccountType}
        accountName={forgotAccountType === 'admin' ? 'Municipal HQ Admin (Rajendra Mehta)' : (selectedOfficer?.name || 'Ward Officer')}
        onSuccess={({ newPassword }) => {
          setPassword(newPassword);
          setShowForgotModal(false);
          toast.success('Password updated! You can now sign in.');
        }}
      />
    </div>
  );
};
