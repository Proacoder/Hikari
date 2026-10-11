import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Shield, Search, ChevronRight, Lock, Eye, EyeOff, Star,
  MapPin, Building2, BadgeCheck, AlertCircle, User, CheckCircle2,
  Phone, Mail, Award, ArrowLeft
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { MOCK_OFFICERS } from '../utils/mockData';

const DEPT_COLORS = {
  'Roads & Infrastructure': { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-700', badge: 'bg-amber-100 text-amber-700', avatar: 'bg-gradient-to-br from-amber-400 to-orange-500' },
  'Sanitation':             { bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-700', badge: 'bg-emerald-100 text-emerald-700', avatar: 'bg-gradient-to-br from-emerald-400 to-teal-500' },
  'Water Supply':           { bg: 'bg-sky-50', border: 'border-sky-200', text: 'text-sky-700', badge: 'bg-sky-100 text-sky-700', avatar: 'bg-gradient-to-br from-sky-400 to-blue-500' },
  'Electrical':             { bg: 'bg-yellow-50', border: 'border-yellow-200', text: 'text-yellow-700', badge: 'bg-yellow-100 text-yellow-700', avatar: 'bg-gradient-to-br from-yellow-400 to-amber-500' },
  'Building & Permits':     { bg: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-700', badge: 'bg-purple-100 text-purple-700', avatar: 'bg-gradient-to-br from-purple-400 to-violet-500' },
};

const DEFAULT_DEPT = { bg: 'bg-brand-50', border: 'border-brand-200', text: 'text-brand-700', badge: 'bg-brand-100 text-brand-700', avatar: 'bg-gradient-to-br from-brand-400 to-blue-500' };

const STATUS_CONFIG = {
  Available: { dot: 'bg-emerald-400', badge: 'bg-emerald-100 text-emerald-700' },
  Busy:      { dot: 'bg-amber-400',   badge: 'bg-amber-100 text-amber-700'   },
  'On Leave':{ dot: 'bg-neutral-300', badge: 'bg-neutral-100 text-neutral-500'},
};

export const OfficerLoginPage = () => {
  const [step, setStep]               = useState('select');
  const [selectedOfficer, setSelected] = useState(null);
  const [search, setSearch]           = useState('');
  const [deptFilter, setDeptFilter]   = useState('All');
  const [password, setPassword]       = useState('');
  const [showPwd, setShowPwd]         = useState(false);
  const [error, setError]             = useState('');
  const [loading, setLoading]         = useState(false);
  const { login }                     = useAuth();
  const navigate                      = useNavigate();

  const departments = ['All', 'Roads & Infrastructure', 'Sanitation', 'Water Supply', 'Electrical', 'Building & Permits'];

  const filtered = MOCK_OFFICERS.filter((o) => {
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

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await login({ email: selectedOfficer.email, password });
      navigate(`/officer/${selectedOfficer.id}`);
    } catch (err) {
      setError('Incorrect password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col">
      {/* ── Light Header ── */}
      <header className="bg-white border-b border-neutral-200 shadow-sm flex items-center gap-3 px-6 py-3.5">
        <div className="w-8 h-8 bg-brand-600 rounded-xl flex items-center justify-center shadow">
          <Shield size={15} className="text-white" strokeWidth={2.5} />
        </div>
        <span className="font-bold text-neutral-900 text-lg">Kaiser <span className="text-brand-600">AI</span></span>
        <div className="ml-auto flex items-center gap-3">
          <span className="hidden sm:block text-xs text-neutral-400 font-medium">BMC Municipal Officer Portal</span>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 border border-emerald-200 rounded-full text-emerald-700 text-[11px] font-semibold">
            <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full" />
            Secure Access
          </span>
        </div>
      </header>

      <div className="flex-1 flex flex-col items-center justify-start p-4 py-8 max-w-5xl mx-auto w-full">
        {step === 'select' ? (
          /* ── STEP 1: Select Officer ── */
          <>
            {/* Page Title */}
            <div className="text-center mb-6 w-full">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-brand-50 border border-brand-200 rounded-full text-brand-700 text-xs font-semibold mb-3">
                <BadgeCheck size={12} />
                MCGM Ward Officer Portal · 26 Wards
              </div>
              <h1 className="text-2xl font-bold text-neutral-900 mb-1">Select Your Officer Profile</h1>
              <p className="text-neutral-500 text-sm">Choose your ward from Mumbai's 26 administrative zones</p>
            </div>

            {/* Search + Filter Bar */}
            <div className="w-full flex flex-col sm:flex-row gap-2 mb-5">
              <div className="relative flex-1">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by name, ward or department…"
                  className="w-full pl-9 pr-4 py-2.5 bg-white border border-neutral-200 rounded-xl text-neutral-700 placeholder-neutral-400 text-sm focus:outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100 transition-all shadow-sm"
                />
              </div>
              <select
                value={deptFilter}
                onChange={(e) => setDeptFilter(e.target.value)}
                className="py-2.5 px-3 bg-white border border-neutral-200 rounded-xl text-neutral-700 text-xs font-medium focus:outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100 shadow-sm"
              >
                {departments.map((d) => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>

            {/* Stats row */}
            <div className="w-full grid grid-cols-3 gap-3 mb-5">
              {[
                { label: 'Total Officers', value: '26', color: 'text-brand-600 bg-brand-50 border-brand-100' },
                { label: 'Available Now', value: `${MOCK_OFFICERS.filter(o => o.status === 'Available').length}`, color: 'text-emerald-700 bg-emerald-50 border-emerald-100' },
                { label: 'Total Resolved', value: MOCK_OFFICERS.reduce((s, o) => s + o.resolvedCount, 0).toLocaleString(), color: 'text-amber-700 bg-amber-50 border-amber-100' },
              ].map(({ label, value, color }) => (
                <div key={label} className={`border rounded-xl px-4 py-3 text-center ${color}`}>
                  <div className="text-xl font-bold">{value}</div>
                  <div className="text-[11px] font-medium opacity-70 mt-0.5">{label}</div>
                </div>
              ))}
            </div>

            {/* Officer Grid */}
            <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-h-[62vh] overflow-y-auto pr-0.5">
              {filtered.map((officer) => {
                const dc  = DEPT_COLORS[officer.department] || DEFAULT_DEPT;
                const sc  = STATUS_CONFIG[officer.status] || STATUS_CONFIG['On Leave'];
                return (
                  <button
                    key={officer.id}
                    onClick={() => handleOfficerSelect(officer)}
                    className="group text-left bg-white border border-neutral-200 rounded-2xl p-4 hover:border-brand-300 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 relative overflow-hidden shadow-sm"
                  >
                    {/* Subtle dept tint */}
                    <div className={`absolute top-0 right-0 w-24 h-24 ${dc.bg} rounded-full translate-x-8 -translate-y-8 pointer-events-none`} />

                    <div className="flex items-start gap-3 relative">
                      {/* Avatar */}
                      <div className={`w-11 h-11 rounded-xl ${dc.avatar} flex items-center justify-center text-white font-bold text-sm shrink-0 shadow`}>
                        {officer.avatarInitials}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 mb-0.5">
                          <span className="font-bold text-neutral-900 text-sm truncate">{officer.name}</span>
                          <span className={`w-2 h-2 rounded-full shrink-0 ${sc.dot}`} />
                        </div>
                        <div className="flex items-center gap-1 text-neutral-500 text-xs mb-1.5">
                          <MapPin size={9} />
                          <span className="truncate">{officer.wardName.split('–')[0].trim()}</span>
                        </div>
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${dc.badge}`}>
                          {officer.department}
                        </span>
                      </div>
                    </div>

                    <div className="mt-3 pt-2.5 border-t border-neutral-100 flex items-center justify-between">
                      <div className="flex items-center gap-3 text-[11px] text-neutral-500">
                        <span className="flex items-center gap-0.5"><Star size={9} className="text-amber-400 fill-amber-400" /> {officer.rating}</span>
                        <span>{officer.resolvedCount} resolved</span>
                      </div>
                      <span className="text-xs font-semibold text-brand-600 group-hover:text-brand-700 flex items-center gap-0.5 transition-colors">
                        Login <ChevronRight size={12} />
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>

            {filtered.length === 0 && (
              <div className="w-full py-16 text-center text-neutral-400">
                <User size={36} className="mx-auto mb-3 opacity-30" />
                <p className="font-medium">No officers match your search</p>
                <button onClick={() => { setSearch(''); setDeptFilter('All'); }} className="mt-2 text-brand-600 text-sm hover:underline">Clear filters</button>
              </div>
            )}
          </>
        ) : (
          /* ── STEP 2: Enter Password ── */
          <div className="w-full max-w-md">
            <button
              onClick={() => { setStep('select'); setError(''); }}
              className="flex items-center gap-1.5 text-neutral-500 hover:text-neutral-800 text-sm mb-6 transition-colors font-medium"
            >
              <ArrowLeft size={14} /> Back to officer selection
            </button>

            <div className="bg-white border border-neutral-200 rounded-2xl shadow-lg overflow-hidden">
              {/* Officer identity banner */}
              {(() => {
                const dc = DEPT_COLORS[selectedOfficer.department] || DEFAULT_DEPT;
                const sc = STATUS_CONFIG[selectedOfficer.status] || STATUS_CONFIG['On Leave'];
                return (
                  <div className={`p-5 ${dc.bg} border-b ${dc.border}`}>
                    <div className="flex items-center gap-3">
                      <div className={`w-14 h-14 rounded-2xl ${dc.avatar} flex items-center justify-center text-white text-xl font-bold shadow`}>
                        {selectedOfficer.avatarInitials}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-1.5 mb-0.5">
                          <h2 className="text-lg font-bold text-neutral-900">{selectedOfficer.name}</h2>
                          <BadgeCheck size={16} className="text-brand-500" />
                        </div>
                        <p className={`text-sm font-medium ${dc.text}`}>{selectedOfficer.wardName}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${dc.badge}`}>{selectedOfficer.department}</span>
                          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${sc.badge}`}>{selectedOfficer.status}</span>
                        </div>
                      </div>
                      <CheckCircle2 size={20} className="text-brand-500 shrink-0" />
                    </div>
                  </div>
                );
              })()}

              {/* Stats strip */}
              <div className="grid grid-cols-3 divide-x divide-neutral-100 bg-neutral-50 border-b border-neutral-100">
                {[
                  { label: 'Resolved', value: selectedOfficer.resolvedCount },
                  { label: 'Avg Days', value: `${selectedOfficer.avgResolutionDays}d` },
                  { label: 'Rating',   value: `${selectedOfficer.rating}/5` },
                ].map((s) => (
                  <div key={s.label} className="py-3 text-center">
                    <div className="text-base font-bold text-neutral-900">{s.value}</div>
                    <div className="text-[10px] text-neutral-400">{s.label}</div>
                  </div>
                ))}
              </div>

              {/* Password form */}
              <div className="p-6 space-y-4">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-8 h-8 bg-brand-50 border border-brand-100 rounded-xl flex items-center justify-center">
                    <Lock size={14} className="text-brand-600" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-neutral-800">Enter Your Password</p>
                    <p className="text-[11px] text-neutral-400">Secure officer authentication required</p>
                  </div>
                </div>

                {error && (
                  <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-xs">
                    <AlertCircle size={13} />
                    {error}
                  </div>
                )}

                <form onSubmit={handleLogin} className="space-y-3">
                  <div className="relative">
                    <input
                      type={showPwd ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Officer password"
                      required
                      autoFocus
                      className="w-full px-4 py-2.5 pr-11 bg-white border border-neutral-200 rounded-xl text-neutral-800 placeholder-neutral-400 text-sm focus:outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100 transition-all shadow-sm"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPwd(!showPwd)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700 transition-colors"
                    >
                      {showPwd ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-neutral-500 px-0.5">
                    <span>Default Password: <code className="bg-neutral-100 text-brand-700 px-1.5 py-0.5 rounded font-mono font-bold">{selectedOfficer.password}</code></span>
                    <button
                      type="button"
                      onClick={() => setPassword(selectedOfficer.password)}
                      className="text-brand-600 font-bold hover:underline"
                    >
                      Click to fill
                    </button>
                  </div>

                  <button
                    type="submit"
                    disabled={loading || !password}
                    className="w-full py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-semibold rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm shadow-sm hover:shadow-md"
                  >
                    {loading ? (
                      <span className="flex items-center justify-center gap-2">
                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Authenticating…
                      </span>
                    ) : (
                      `Sign In → ${selectedOfficer.name}'s Dashboard`
                    )}
                  </button>
                </form>

                <p className="text-center text-[11px] text-neutral-400 pt-1">
                  Forgot password? Contact IT Helpdesk · <span className="text-brand-500">it@bmc.gov.in</span>
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
