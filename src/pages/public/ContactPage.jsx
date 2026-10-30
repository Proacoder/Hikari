// ─── Sovereign Civic Dark/Light Adaptive Contact Page ─────────────────────────
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Phone, Mail, MapPin, Building2, Search, CheckCircle2, Clock,
  AlertTriangle, Send, Copy, Check, ChevronRight, ArrowRight,
  Sparkles, LifeBuoy
} from 'lucide-react';
import { Badge } from '../../components/common/Badge';
import { MUMBAI_WARDS } from '../../utils/mockData';
import { getStoredComplaints, getComplaintById } from '../../api/complaints.api';
import { sound } from '../../utils/soundEffects';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { classNames } from '../../utils/formatters';

const EMERGENCY_NUMBERS = [
  { title: 'BMC Central Disaster Control', number: '1916', desc: 'Toll-free 24x7 monsoon & civic emergencies', primary: true },
  { title: 'Mumbai Police Control', number: '100 / 112', desc: 'Public safety & rapid response', primary: false },
  { title: 'Mumbai Traffic Police WhatsApp', number: '8454-999999', desc: 'Waterlogging & tree fall road blockades', primary: false },
  { title: 'Fire & Rescue Services', number: '101', desc: 'Structural collapse & fire hazards', primary: false },
  { title: 'Ambulance & Medical Emergency', number: '108', desc: 'Free emergency medical dispatch', primary: false },
];

export const ContactPage = () => {
  const { isDark } = useTheme();
  const { t } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedZone, setSelectedZone] = useState('All');
  const [inquiryType, setInquiryType] = useState('Escalation');
  const [submittedData, setSubmittedData] = useState(null);
  const [copiedRef, setCopiedRef] = useState(false);

  // Quick Tracking Tool State
  const [trackingId, setTrackingId] = useState('');
  const [trackResult, setTrackResult] = useState(null);
  const [trackError, setTrackError] = useState(false);
  const [isTrackLoading, setIsTrackLoading] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    ward: 'K/E Ward – Andheri East',
    category: 'Pothole & Road Hazard',
    complaintRef: '',
    urgency: 'Medium',
    message: ''
  });

  const zones = [
    { key: 'All', label: t('contact.allZones', 'All Zones') },
    { key: 'Island City', label: t('contact.islandCity', 'Island City') },
    { key: 'Western Suburbs', label: t('contact.westernSuburbs', 'Western Suburbs') },
    { key: 'Eastern Suburbs', label: t('contact.easternSuburbs', 'Eastern Suburbs') },
  ];

  const filteredWards = MUMBAI_WARDS.filter((w) => {
    const matchesSearch =
      (w.code || w.name).toLowerCase().includes(searchTerm.toLowerCase()) ||
      w.area.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (w.ac || '').toLowerCase().includes(searchTerm.toLowerCase());
    
    if (selectedZone === 'All') return matchesSearch;
    if (selectedZone === 'Island City') return matchesSearch && (w.zone || '').includes('Island City');
    if (selectedZone === 'Western Suburbs') return matchesSearch && (w.zone || '').includes('Western Suburbs');
    if (selectedZone === 'Eastern Suburbs') return matchesSearch && (w.zone || '').includes('Eastern Suburbs');
    return matchesSearch;
  });

  const handleTrackSubmit = async (e) => {
    e.preventDefault();
    sound.play('click');
    setTrackError(false);
    const cleanId = trackingId.trim();
    if (!cleanId) return;

    setIsTrackLoading(true);
    try {
      const res = await getComplaintById(cleanId);
      const found = res?.data || res;
      if (found && found.id) {
        setTrackResult(found);
        setTrackError(false);
        setIsTrackLoading(false);
        sound.play('pop');
        return;
      }
    } catch {
      // Graceful fallback to local stores
    }

    const allComplaints = getStoredComplaints();
    const foundLocal = allComplaints.find((c) => c.id?.toLowerCase() === cleanId.toLowerCase());
    if (foundLocal) {
      setTrackResult(foundLocal);
      setTrackError(false);
      setIsTrackLoading(false);
      sound.play('pop');
      return;
    }

    try {
      const allInquiries = JSON.parse(localStorage.getItem('kaiser_inquiries_store') || '[]');
      const foundInquiry = allInquiries.find((i) => i.refNumber?.toLowerCase() === cleanId.toLowerCase());
      if (foundInquiry) {
        setTrackResult({
          id: foundInquiry.refNumber,
          title: `Escalation: ${foundInquiry.category}`,
          category: foundInquiry.category,
          status: 'in_progress',
          createdAt: foundInquiry.timestamp,
          wardName: foundInquiry.ward,
          severity: foundInquiry.urgency === 'High' ? 85 : 60,
          description: foundInquiry.message,
        });
        setTrackError(false);
        setIsTrackLoading(false);
        sound.play('pop');
        return;
      }
    } catch {}

    setIsTrackLoading(false);
    setTrackError(true);
    setTrackResult(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    sound.play('click');
    const refNum = `KSR-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const newInquiry = {
      refNumber: refNum,
      ...formData,
      status: 'Escalation Under Review',
      timestamp: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })
    };
    setSubmittedData(newInquiry);

    try {
      const existing = JSON.parse(localStorage.getItem('kaiser_inquiries_store') || '[]');
      localStorage.setItem('kaiser_inquiries_store', JSON.stringify([newInquiry, ...existing]));
    } catch (err) {
      console.warn(err);
    }
  };

  const handleCopyRef = () => {
    if (!submittedData) return;
    sound.play('pop');
    navigator.clipboard.writeText(submittedData.refNumber);
    setCopiedRef(true);
    setTimeout(() => setCopiedRef(false), 2000);
  };

  return (
    <div className={classNames(
      "w-full min-h-screen select-none space-y-16 pb-24 transition-colors duration-200",
      isDark ? "bg-neutral-950 text-neutral-100" : "bg-slate-50 text-neutral-900"
    )}>
      
      {/* ── Hero Section ── */}
      <section className={classNames(
        "relative pt-12 pb-16 border-b overflow-hidden transition-colors",
        isDark ? "border-white/10" : "border-neutral-200"
      )}>
        <div className={classNames(
          "absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full blur-3xl pointer-events-none",
          isDark ? "bg-emerald-500/15" : "bg-emerald-500/10"
        )} />

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 text-center relative z-10">
          <div className={classNames(
            "inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-mono font-bold tracking-widest uppercase transition-colors",
            isDark ? "bg-emerald-500/15 border border-emerald-400/30 text-emerald-300" : "bg-emerald-50 border border-emerald-300 text-emerald-800"
          )}>
            <Building2 size={14} className={isDark ? "text-emerald-400" : "text-emerald-600"} />
            <span>24X7 GREATER MUMBAI MUNICIPAL HELPDESK & DIRECTORY</span>
          </div>

          <h1 className={classNames(
            "font-display text-4xl sm:text-6xl font-extrabold tracking-tight leading-tight",
            isDark ? "text-white" : "text-neutral-950"
          )}>
            Contact Kaiser AI &{' '}
            <span className="bg-gradient-to-r from-emerald-500 via-teal-500 to-sky-500 bg-clip-text text-transparent">
              24 Ward Directory
            </span>
          </h1>

          <p className={classNames(
            "text-base sm:text-lg max-w-2xl mx-auto font-normal leading-relaxed",
            isDark ? "text-white/75" : "text-neutral-600"
          )}>
            Directly connect with municipal liaison officers, locate your designated Assistant Commissioner, or escalate pending civic grievances.
          </p>

          {/* Emergency Hotlines Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 pt-6 text-left">
            {EMERGENCY_NUMBERS.map((em, idx) => (
              <div
                key={idx}
                className={classNames(
                  "p-4 rounded-3xl border transition-all",
                  em.primary
                    ? isDark
                      ? 'bg-rose-950/80 border-rose-500/40 text-rose-200 shadow-[0_0_20px_rgba(244,63,94,0.25)]'
                      : 'bg-rose-50 border-rose-300 text-rose-900 shadow-sm'
                    : isDark
                      ? 'bg-neutral-900/80 border-white/10 text-white backdrop-blur-xl shadow-lg'
                      : 'bg-white border-neutral-200 text-neutral-900 shadow-soft'
                )}
              >
                <div className={classNames(
                  "text-[10px] font-mono font-bold uppercase tracking-wider",
                  em.primary
                    ? isDark ? 'text-rose-400' : 'text-rose-700'
                    : isDark ? 'text-white/50' : 'text-neutral-500'
                )}>
                  {em.title}
                </div>
                <a
                  href={`tel:${em.number.split('/')[0].trim().replace(/[^0-9]/g, '')}`}
                  className={classNames(
                    "text-lg sm:text-xl font-mono font-extrabold tracking-tight mt-1 flex items-center gap-1.5 transition-colors",
                    em.primary
                      ? isDark ? 'text-white hover:text-rose-200' : 'text-rose-800 hover:text-rose-600'
                      : isDark ? 'text-emerald-400 hover:text-emerald-300' : 'text-emerald-600 hover:text-emerald-700'
                  )}
                >
                  <Phone size={14} />
                  <span>{em.number}</span>
                </a>
                <div className={classNames(
                  "text-[10px] mt-0.5",
                  em.primary
                    ? isDark ? 'text-rose-300/80' : 'text-rose-600'
                    : isDark ? 'text-white/40' : 'text-neutral-500'
                )}>
                  {em.desc}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Quick Complaint Status Tracker Bar ── */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className={classNames(
          "rounded-3xl p-6 sm:p-8 shadow-2xl transition-all border",
          isDark
            ? "bg-neutral-900/90 border-white/15 text-white backdrop-blur-2xl"
            : "bg-white border-neutral-200 text-neutral-900 shadow-soft-xl"
        )}>
          <div className="grid lg:grid-cols-12 gap-6 items-center">
            <div className="lg:col-span-5 space-y-1.5">
              <span className={classNames("text-xs font-mono font-bold uppercase tracking-wider flex items-center gap-1", isDark ? "text-emerald-400" : "text-emerald-700")}>
                <Sparkles size={13} /> REAL-TIME GRIEVANCE TRACKER
              </span>
              <h2 className={classNames("text-xl sm:text-2xl font-bold font-display", isDark ? "text-white" : "text-neutral-950")}>
                Have an Existing Complaint ID?
              </h2>
              <p className={classNames("text-xs", isDark ? "text-white/60" : "text-neutral-500")}>
                Check live SLA status and assigned ward engineer without logging in. Try:{' '}
                <button type="button" onClick={() => setTrackingId('cmp-001')} className="underline text-emerald-500 font-mono cursor-pointer font-bold">cmp-001</button> or{' '}
                <button type="button" onClick={() => setTrackingId('cmp-002')} className="underline text-emerald-500 font-mono cursor-pointer font-bold">cmp-002</button>.
              </p>
            </div>

            <div className="lg:col-span-7">
              <form onSubmit={handleTrackSubmit} className="flex flex-col sm:flex-row gap-2">
                <div className="relative flex-1">
                  <Search className={classNames("absolute left-3.5 top-1/2 -translate-y-1/2", isDark ? "text-white/40" : "text-neutral-400")} size={16} />
                  <input
                    type="text"
                    placeholder="Enter Complaint ID (e.g. cmp-001 or KSR-2026-XXXX)..."
                    value={trackingId}
                    onChange={(e) => setTrackingId(e.target.value)}
                    className={classNames(
                      "w-full pl-10 pr-4 py-3 rounded-xl text-xs focus:outline-none focus:border-emerald-500 font-mono border transition-colors",
                      isDark ? "bg-neutral-950/80 border-white/15 text-white placeholder-white/40" : "bg-slate-50 border-neutral-300 text-neutral-900 placeholder-neutral-400"
                    )}
                  />
                </div>
                <button
                  type="submit"
                  disabled={isTrackLoading}
                  className="px-6 py-3 bg-gradient-to-r from-emerald-500 via-brand-500 to-teal-400 text-neutral-950 font-bold text-xs uppercase tracking-wider rounded-xl shadow-[0_0_15px_rgba(52,211,153,0.3)] transition-transform hover:scale-105 active:scale-95 disabled:opacity-60 cursor-pointer shrink-0 flex items-center justify-center gap-1.5"
                >
                  <Search size={14} className={isTrackLoading ? 'animate-spin' : ''} />
                  {isTrackLoading ? 'Searching...' : 'Track Status'}
                </button>
              </form>

              {trackError && (
                <div className={classNames(
                  "mt-3 p-3 rounded-xl text-xs flex items-center gap-2 border",
                  isDark ? "bg-rose-950/60 border-rose-800 text-rose-300" : "bg-rose-50 border-rose-200 text-rose-700"
                )}>
                  <AlertTriangle size={14} className="shrink-0" />
                  <span>Complaint ID not found. Please verify your reference number or submit an enquiry below.</span>
                </div>
              )}

              {trackResult && (
                <div className={classNames(
                  "mt-4 p-4 rounded-2xl border animate-fade-in space-y-3 font-mono transition-all",
                  isDark ? "bg-neutral-950/80 border-emerald-500/30 text-white" : "bg-slate-50 border-emerald-300 text-neutral-900 shadow-sm"
                )}>
                  <div className={classNames("flex flex-wrap items-center justify-between gap-2 border-b pb-2", isDark ? "border-white/10" : "border-neutral-200")}>
                    <div className="flex items-center gap-2">
                      <span className={classNames("font-bold text-xs", isDark ? "text-emerald-400" : "text-emerald-700")}>{trackResult.id}</span>
                      <span className={classNames("text-xs font-sans font-semibold", isDark ? "text-white/90" : "text-neutral-900")}>{trackResult.title}</span>
                    </div>
                    <span className={classNames(
                      "text-[10px] font-bold px-2 py-0.5 rounded border",
                      isDark ? "text-emerald-300 bg-emerald-500/20 border-emerald-400/40" : "text-emerald-800 bg-emerald-100 border-emerald-300"
                    )}>
                      {trackResult.status.toUpperCase().replace('_', ' ')}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
                    <div>
                      <span className={classNames("block", isDark ? "text-white/40" : "text-neutral-500")}>Category</span>
                      <span className={classNames("font-semibold", isDark ? "text-white" : "text-neutral-900")}>{trackResult.category}</span>
                    </div>
                    <div>
                      <span className={classNames("block", isDark ? "text-white/40" : "text-neutral-500")}>Severity Score</span>
                      <span className={classNames("font-semibold", isDark ? "text-amber-400" : "text-amber-600")}>{trackResult.severity}/100</span>
                    </div>
                    <div>
                      <span className={classNames("block", isDark ? "text-white/40" : "text-neutral-500")}>Assigned Officer</span>
                      <span className={classNames("font-semibold", isDark ? "text-white" : "text-neutral-900")}>{trackResult.assignedOfficer?.name || 'Assigned to Ward'}</span>
                    </div>
                    <div className="text-right sm:text-left">
                      <span className={classNames("block", isDark ? "text-white/40" : "text-neutral-500")}>Action</span>
                      <Link to="/app" className={classNames("hover:underline font-semibold flex items-center gap-0.5", isDark ? "text-emerald-400" : "text-emerald-600")}>
                        View Portal <ChevronRight size={12} />
                      </Link>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ── Contact Form & Municipal Helpdesk Details ── */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="grid lg:grid-cols-2 gap-8 items-stretch">
          {/* Left Column: Interactive Form */}
          <div className="flex flex-col">
            <div className={classNames(
              "rounded-3xl p-6 sm:p-8 space-y-6 border shadow-2xl transition-all h-full flex flex-col justify-between",
              isDark ? "bg-neutral-900/80 border-white/10 backdrop-blur-xl" : "bg-white border-neutral-200 shadow-soft-xl"
            )}>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className={classNames("text-xl font-bold font-display", isDark ? "text-white" : "text-neutral-950")}>Direct Municipal Liaison Desk</h2>
                  <span className={classNames(
                    "px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold border",
                    isDark ? "bg-emerald-500/20 text-emerald-300 border-emerald-400/30" : "bg-emerald-50 text-emerald-800 border-emerald-200"
                  )}>
                    ONLINE PORTAL
                  </span>
                </div>
                <p className={classNames("text-xs", isDark ? "text-white/60" : "text-neutral-500")}>
                  Submit an escalation, report society infrastructure issues, or reach Kaiser AI engineers.
                </p>

                {/* Inquiry Type Tabs */}
                <div className={classNames(
                  "grid grid-cols-2 sm:grid-cols-4 gap-1.5 p-1 border rounded-2xl",
                  isDark ? "bg-neutral-950/70 border-white/10" : "bg-slate-100 border-neutral-200"
                )}>
                  {['Escalation', 'ALM / Society', 'Partnership', 'Tech Support'].map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => { sound.play('pop'); setInquiryType(t); }}
                      className={classNames(
                        "py-1.5 px-2 rounded-xl text-xs font-semibold transition-all cursor-pointer text-center",
                        inquiryType === t
                          ? 'bg-emerald-500 text-neutral-950 font-bold shadow-md'
                          : isDark ? 'text-white/60 hover:text-white' : 'text-neutral-600 hover:text-neutral-900'
                      )}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              {submittedData ? (
                <div className={classNames(
                  "p-6 rounded-2xl border text-center space-y-4 animate-scale-in flex-1 flex flex-col justify-between",
                  isDark ? "bg-emerald-950/40 border-emerald-500/30" : "bg-emerald-50 border-emerald-300"
                )}>
                  <div className="space-y-3 my-auto">
                    <div className={classNames(
                      "w-14 h-14 border rounded-2xl flex items-center justify-center mx-auto shadow-md",
                      isDark ? "bg-emerald-500/20 text-emerald-300 border-emerald-400/40" : "bg-emerald-100 text-emerald-700 border-emerald-300"
                    )}>
                      <CheckCircle2 size={32} />
                    </div>
                    <div>
                      <h3 className={classNames("font-bold text-lg", isDark ? "text-white" : "text-neutral-950")}>Enquiry Registered Successfully</h3>
                      <p className={classNames("text-xs mt-1", isDark ? "text-white/60" : "text-neutral-600")}>
                        Your query has been routed to the Assistant Commissioner's grievance liaison desk.
                      </p>
                    </div>

                    <div className={classNames(
                      "p-4 rounded-xl border text-left space-y-2 text-xs font-mono",
                      isDark ? "bg-neutral-950/80 border-white/10" : "bg-white border-neutral-200 shadow-sm"
                    )}>
                      <div className={classNames("flex items-center justify-between border-b pb-2", isDark ? "border-white/10" : "border-neutral-200")}>
                        <span className={isDark ? "text-white/40" : "text-neutral-500"}>Reference Number:</span>
                        <div className={classNames("flex items-center gap-1.5 font-bold", isDark ? "text-emerald-400" : "text-emerald-700")}>
                          <span>{submittedData.refNumber}</span>
                          <button
                            type="button"
                            onClick={handleCopyRef}
                            className="p-1 hover:bg-black/10 dark:hover:bg-white/10 rounded cursor-pointer transition-colors"
                            title="Copy reference number"
                          >
                            {copiedRef ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                          </button>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className={isDark ? "text-white/40" : "text-neutral-500"}>Designated Ward:</span>
                        <span className={classNames("font-semibold", isDark ? "text-white" : "text-neutral-900")}>{submittedData.ward}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className={isDark ? "text-white/40" : "text-neutral-500"}>Inquiry Type:</span>
                        <span className={classNames("font-semibold", isDark ? "text-white" : "text-neutral-900")}>{inquiryType}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className={isDark ? "text-white/40" : "text-neutral-500"}>Response SLA:</span>
                        <span className={classNames("font-semibold", isDark ? "text-emerald-400" : "text-emerald-700")}>&lt; 24 Business Hours</span>
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setSubmittedData(null)}
                    className={classNames(
                      "w-full py-2.5 rounded-xl border text-xs font-bold transition-colors cursor-pointer",
                      isDark ? "border-white/20 text-white hover:bg-white/10" : "border-neutral-300 text-neutral-800 bg-white hover:bg-slate-50"
                    )}
                  >
                    Submit Another Inquiry
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4 flex-1 flex flex-col justify-between">
                  <div className="grid sm:grid-cols-2 gap-3.5">
                    <div className="space-y-1">
                      <label className={classNames("text-xs font-semibold", isDark ? "text-white/80" : "text-neutral-700")}>Your Full Name</label>
                      <input
                        type="text"
                        placeholder="e.g. Ananya Deshmukh"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                        className={classNames(
                          "w-full h-10 rounded-xl border px-3 text-xs focus:outline-none focus:border-emerald-500 transition-colors",
                          isDark ? "bg-neutral-950/80 border-white/15 text-white placeholder-white/30" : "bg-slate-50 border-neutral-300 text-neutral-900 placeholder-neutral-400"
                        )}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className={classNames("text-xs font-semibold", isDark ? "text-white/80" : "text-neutral-700")}>Contact Email</label>
                      <input
                        type="email"
                        placeholder="ananya@example.com"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        required
                        className={classNames(
                          "w-full h-10 rounded-xl border px-3 text-xs focus:outline-none focus:border-emerald-500 transition-colors",
                          isDark ? "bg-neutral-950/80 border-white/15 text-white placeholder-white/30" : "bg-slate-50 border-neutral-300 text-neutral-900 placeholder-neutral-400"
                        )}
                      />
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-3.5">
                    <div className="space-y-1">
                      <label className={classNames("text-xs font-semibold", isDark ? "text-white/80" : "text-neutral-700")}>Mobile Phone (+91)</label>
                      <input
                        type="tel"
                        placeholder="98200 12345"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        required
                        className={classNames(
                          "w-full h-10 rounded-xl border px-3 text-xs focus:outline-none focus:border-emerald-500 transition-colors",
                          isDark ? "bg-neutral-950/80 border-white/15 text-white placeholder-white/30" : "bg-slate-50 border-neutral-300 text-neutral-900 placeholder-neutral-400"
                        )}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className={classNames("text-xs font-semibold", isDark ? "text-white/80" : "text-neutral-700")}>Urgency Level</label>
                      <select
                        value={formData.urgency}
                        onChange={(e) => setFormData({ ...formData, urgency: e.target.value })}
                        className={classNames(
                          "w-full h-10 rounded-xl border px-3 text-xs focus:outline-none focus:border-emerald-500 transition-colors cursor-pointer",
                          isDark ? "bg-neutral-950/80 border-white/15 text-white" : "bg-slate-50 border-neutral-300 text-neutral-900"
                        )}
                      >
                        <option value="Normal">Normal Inquiry (48h)</option>
                        <option value="Medium">Medium Priority (24h)</option>
                        <option value="Monsoon Emergency">Monsoon Hazard / Critical (Immediate)</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-3.5">
                    <div className="space-y-1">
                      <label className={classNames("text-xs font-semibold", isDark ? "text-white/80" : "text-neutral-700")}>Municipal Ward</label>
                      <select
                        value={formData.ward}
                        onChange={(e) => setFormData({ ...formData, ward: e.target.value })}
                        className={classNames(
                          "w-full h-10 rounded-xl border px-3 text-xs focus:outline-none focus:border-emerald-500 transition-colors cursor-pointer",
                          isDark ? "bg-neutral-950/80 border-white/15 text-white" : "bg-slate-50 border-neutral-300 text-neutral-900"
                        )}
                      >
                        {MUMBAI_WARDS.map((w) => (
                          <option key={w.id} value={`${w.code} – ${w.area.split(',')[0]}`}>
                            {w.code} ({w.area.split(',')[0]})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className={classNames("text-xs font-semibold", isDark ? "text-white/80" : "text-neutral-700")}>Complaint ID (Optional)</label>
                      <input
                        type="text"
                        placeholder="e.g. cmp-001 if escalating"
                        value={formData.complaintRef}
                        onChange={(e) => setFormData({ ...formData, complaintRef: e.target.value })}
                        className={classNames(
                          "w-full h-10 rounded-xl border px-3 text-xs focus:outline-none focus:border-emerald-500 transition-colors",
                          isDark ? "bg-neutral-950/80 border-white/15 text-white placeholder-white/30" : "bg-slate-50 border-neutral-300 text-neutral-900 placeholder-neutral-400"
                        )}
                      />
                    </div>
                  </div>

                  <div className="space-y-1 flex-1 flex flex-col">
                    <label className={classNames("text-xs font-semibold", isDark ? "text-white/80" : "text-neutral-700")}>Detailed Message / Description</label>
                    <textarea
                      placeholder="Explain your inquiry, unresolved hazard timeline, or society requirement..."
                      className={classNames(
                        "w-full flex-1 min-h-[110px] rounded-xl border p-3 text-xs focus:outline-none focus:border-emerald-500 transition-colors resize-none",
                        isDark ? "bg-neutral-950/80 border-white/15 text-white placeholder-white/30" : "bg-slate-50 border-neutral-300 text-neutral-900 placeholder-neutral-400"
                      )}
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    className="glow-btn w-full h-12 rounded-xl bg-gradient-to-r from-emerald-500 via-brand-500 to-teal-400 text-neutral-950 font-black text-xs uppercase tracking-wider shadow-[0_0_24px_rgba(52,211,153,0.4)] flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-98 transition-all cursor-pointer"
                  >
                    <Send size={15} />
                    <span>Submit to Municipal Liaison</span>
                  </button>
                </form>
              )}
            </div>
          </div>

          {/* Right Column: Central Headquarters & Contact Protocols */}
          <div className="flex flex-col">
            {/* Headquarters Card */}
            <div className={classNames(
              "rounded-3xl p-6 sm:p-8 space-y-6 border shadow-2xl transition-all h-full flex flex-col justify-between",
              isDark ? "bg-neutral-900/80 border-white/10 backdrop-blur-xl" : "bg-white border-neutral-200 shadow-soft-xl"
            )}>
              <div className="space-y-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={classNames(
                      "w-12 h-12 rounded-2xl border flex items-center justify-center shadow-lg",
                      isDark ? "bg-emerald-500/20 text-emerald-300 border-emerald-400/30" : "bg-emerald-50 text-emerald-700 border-emerald-200"
                    )}>
                      <Building2 size={24} />
                    </div>
                    <div>
                      <h3 className={classNames("text-lg font-bold font-display", isDark ? "text-white" : "text-neutral-950")}>BMC Central Headquarters</h3>
                      <p className={classNames("text-xs", isDark ? "text-white/60" : "text-neutral-500")}>Brihanmumbai Municipal Corporation, Fort</p>
                    </div>
                  </div>
                  <span className={classNames(
                    "hidden sm:inline-block px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold border",
                    isDark ? "bg-emerald-500/20 text-emerald-300 border-emerald-400/30" : "bg-emerald-50 text-emerald-800 border-emerald-200"
                  )}>
                    APEX SEAT
                  </span>
                </div>

                <div className={classNames("space-y-3.5 text-xs border-t pt-4", isDark ? "text-white/70 border-white/10" : "text-neutral-600 border-neutral-200")}>
                  <div className="flex items-start gap-2.5">
                    <MapPin size={16} className={isDark ? "text-emerald-400 shrink-0 mt-0.5" : "text-emerald-600 shrink-0 mt-0.5"} />
                    <span>
                      <strong className={isDark ? "text-white" : "text-neutral-900"}>Address:</strong> Municipal Corporation Building, Mahapalika Marg, Opposite CSMT Station, Fort, Mumbai 400001
                    </span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <Clock size={16} className={isDark ? "text-teal-300 shrink-0 mt-0.5" : "text-teal-600 shrink-0 mt-0.5"} />
                    <span>
                      <strong className={isDark ? "text-white" : "text-neutral-900"}>Visiting Hours:</strong> Monday to Friday: 10:00 AM – 5:30 PM (Public Hearings: 3:00 PM – 5:00 PM)
                    </span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <Phone size={16} className={isDark ? "text-amber-400 shrink-0 mt-0.5" : "text-amber-600 shrink-0 mt-0.5"} />
                    <span>
                      <strong className={isDark ? "text-white" : "text-neutral-900"}>Helpline & PBX:</strong>{" "}
                      <a href="tel:02222620251" className={isDark ? "text-emerald-400 hover:underline" : "text-emerald-600 hover:underline"}>022-2262-0251</a> /{" "}
                      <a href="tel:1916" className={isDark ? "text-emerald-400 hover:underline" : "text-emerald-600 hover:underline"}>1916 (Toll-Free 24x7)</a>
                    </span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <Mail size={16} className={isDark ? "text-sky-400 shrink-0 mt-0.5" : "text-sky-600 shrink-0 mt-0.5"} />
                    <span>
                      <strong className={isDark ? "text-white" : "text-neutral-900"}>Official Email:</strong> <a href="mailto:mc@mcgm.gov.in" className={isDark ? "text-emerald-400 hover:underline" : "text-emerald-600 hover:underline"}>mc@mcgm.gov.in</a> / <a href="mailto:support@kaiserai.mcgm.gov.in" className={isDark ? "text-emerald-400 hover:underline" : "text-emerald-600 hover:underline"}>support@kaiserai.mcgm.gov.in</a>
                    </span>
                  </div>
                </div>
              </div>

              {/* Citizen Hearing Banner (Lokshahi Din) */}
              <div className={classNames(
                "p-4 rounded-2xl border space-y-2 text-xs mt-4",
                isDark ? "bg-sky-950/40 border-sky-500/30 text-sky-200" : "bg-sky-50 border-sky-200 text-sky-800"
              )}>
                <div className={classNames("font-bold flex items-center gap-1.5 text-xs sm:text-sm", isDark ? "text-sky-300" : "text-sky-800")}>
                  <LifeBuoy size={16} /> Citizen Lokshahi Din (Public Hearings)
                </div>
                <p className={classNames("text-[11px] leading-relaxed", isDark ? "text-sky-200/80" : "text-sky-700")}>
                  Every 1st Monday of the month from 10:00 AM to 12:00 PM, all 24 Assistant Commissioners personally hear unresolved civic grievances at their respective ward offices.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ── Key Department Escalation Directory (4 Cards in a Balanced Row) ── */}
        <div className="space-y-4 pt-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b pb-3 border-neutral-200 dark:border-white/10">
            <div>
              <h3 className={classNames("font-display text-base sm:text-lg font-bold", isDark ? "text-white" : "text-neutral-950")}>
                Direct Department Escalation Desks
              </h3>
              <p className={classNames("text-xs", isDark ? "text-white/60" : "text-neutral-500")}>
                Fast-track contact protocols for Chief Engineers across major civic infrastructure divisions.
              </p>
            </div>
            <span className={classNames(
              "self-start sm:self-auto text-[10px] font-mono font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border",
              isDark ? "bg-neutral-800/80 text-white/70 border-white/15" : "bg-slate-100 text-neutral-700 border-neutral-200"
            )}>
              4 SPECIALIZED HEADS
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className={classNames(
              "p-4 rounded-2xl border transition-all flex flex-col justify-between group hover:border-amber-500/40",
              isDark ? "bg-neutral-900/70 border-white/10" : "bg-white border-neutral-200 shadow-soft"
            )}>
              <div className="space-y-1.5">
                <span className={classNames(
                  "inline-block text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded border",
                  isDark ? "text-amber-300 bg-amber-500/20 border-amber-400/30" : "text-amber-800 bg-amber-50 border-amber-200"
                )}>
                  ROADS & BRIDGES
                </span>
                <h4 className={classNames("font-bold text-sm", isDark ? "text-white" : "text-neutral-900")}>Chief Engineer (Roads)</h4>
                <p className={classNames("text-xs leading-relaxed", isDark ? "text-white/50" : "text-neutral-500")}>Major potholes & road reinstatement</p>
              </div>
              <div className={classNames("mt-3 pt-2.5 border-t text-xs", isDark ? "border-white/10" : "border-neutral-200")}>
                <a href="mailto:che.roads@mcgm.gov.in" className={classNames("font-mono hover:underline block truncate", isDark ? "text-emerald-400" : "text-emerald-700")}>
                  che.roads@mcgm.gov.in
                </a>
              </div>
            </div>

            <div className={classNames(
              "p-4 rounded-2xl border transition-all flex flex-col justify-between group hover:border-sky-500/40",
              isDark ? "bg-neutral-900/70 border-white/10" : "bg-white border-neutral-200 shadow-soft"
            )}>
              <div className="space-y-1.5">
                <span className={classNames(
                  "inline-block text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded border",
                  isDark ? "text-sky-300 bg-sky-500/20 border-sky-400/30" : "text-sky-800 bg-sky-50 border-sky-200"
                )}>
                  MONSOON DRAINAGE
                </span>
                <h4 className={classNames("font-bold text-sm", isDark ? "text-white" : "text-neutral-900")}>Storm Water Drains (SWD)</h4>
                <p className={classNames("text-xs leading-relaxed", isDark ? "text-white/50" : "text-neutral-500")}>Waterlogging & culvert maintenance</p>
              </div>
              <div className={classNames("mt-3 pt-2.5 border-t text-xs", isDark ? "border-white/10" : "border-neutral-200")}>
                <a href="mailto:dyche.swd@mcgm.gov.in" className={classNames("font-mono hover:underline block truncate", isDark ? "text-emerald-400" : "text-emerald-700")}>
                  dyche.swd@mcgm.gov.in
                </a>
              </div>
            </div>

            <div className={classNames(
              "p-4 rounded-2xl border transition-all flex flex-col justify-between group hover:border-emerald-500/40",
              isDark ? "bg-neutral-900/70 border-white/10" : "bg-white border-neutral-200 shadow-soft"
            )}>
              <div className="space-y-1.5">
                <span className={classNames(
                  "inline-block text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded border",
                  isDark ? "text-emerald-300 bg-emerald-500/20 border-emerald-400/30" : "text-emerald-800 bg-emerald-50 border-emerald-200"
                )}>
                  WASTE MANAGEMENT
                </span>
                <h4 className={classNames("font-bold text-sm", isDark ? "text-white" : "text-neutral-900")}>Chief Engineer (SWM)</h4>
                <p className={classNames("text-xs leading-relaxed", isDark ? "text-white/50" : "text-neutral-500")}>Garbage dumps & daily collection</p>
              </div>
              <div className={classNames("mt-3 pt-2.5 border-t text-xs", isDark ? "border-white/10" : "border-neutral-200")}>
                <a href="mailto:swm.ho@mcgm.gov.in" className={classNames("font-mono hover:underline block truncate", isDark ? "text-emerald-400" : "text-emerald-700")}>
                  swm.ho@mcgm.gov.in
                </a>
              </div>
            </div>

            <div className={classNames(
              "p-4 rounded-2xl border transition-all flex flex-col justify-between group hover:border-purple-500/40",
              isDark ? "bg-neutral-900/70 border-white/10" : "bg-white border-neutral-200 shadow-soft"
            )}>
              <div className="space-y-1.5">
                <span className={classNames(
                  "inline-block text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded border",
                  isDark ? "text-purple-300 bg-purple-500/20 border-purple-400/30" : "text-purple-800 bg-purple-50 border-purple-200"
                )}>
                  WATER SUPPLY
                </span>
                <h4 className={classNames("font-bold text-sm", isDark ? "text-white" : "text-neutral-900")}>Hydraulic Engineer</h4>
                <p className={classNames("text-xs leading-relaxed", isDark ? "text-white/50" : "text-neutral-500")}>Contamination & pipeline bursts</p>
              </div>
              <div className={classNames("mt-3 pt-2.5 border-t text-xs", isDark ? "border-white/10" : "border-neutral-200")}>
                <a href="mailto:he@mcgm.gov.in" className={classNames("font-mono hover:underline block truncate", isDark ? "text-emerald-400" : "text-emerald-700")}>
                  he@mcgm.gov.in
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Searchable 24 Municipal Wards Directory ── */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-2">
            <span className={classNames("font-mono text-xs font-bold uppercase tracking-widest", isDark ? "text-emerald-400" : "text-emerald-700")}>FULL ADMINISTRATIVE MAPPING</span>
            <h2 className={classNames("font-display text-2xl sm:text-4xl font-extrabold tracking-tight", isDark ? "text-white" : "text-neutral-950")}>
              24 Municipal Ward Directory
            </h2>
            <p className={classNames("text-xs sm:text-sm max-w-xl", isDark ? "text-white/60" : "text-neutral-600")}>
              Find your designated Assistant Commissioner, control room phone lines, and physical ward office address across Greater Mumbai.
            </p>
          </div>

          {/* Search Bar */}
          <div className="relative min-w-[280px]">
            <Search className={classNames("absolute left-3.5 top-1/2 -translate-y-1/2", isDark ? "text-white/40" : "text-neutral-400")} size={16} />
            <input
              type="text"
              placeholder="Search ward (e.g. K/E) or area (e.g. Bandra)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={classNames(
                "w-full pl-10 pr-4 py-2.5 rounded-xl text-xs focus:outline-none focus:border-emerald-500 transition-colors border",
                isDark ? "bg-neutral-900/90 border-white/15 text-white placeholder-white/30" : "bg-white border-neutral-300 text-neutral-900 placeholder-neutral-400 shadow-sm"
              )}
            />
          </div>
        </div>

        {/* Zone Filter Tabs */}
        <div className={classNames("flex flex-wrap items-center gap-2 border-b pb-4", isDark ? "border-white/10" : "border-neutral-200")}>
          {zones.map((zone) => (
            <button
              key={zone}
              onClick={() => { sound.play('pop'); setSelectedZone(zone); }}
              className={classNames(
                "px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer",
                selectedZone === zone
                  ? 'bg-emerald-500 text-neutral-950 font-bold shadow-md'
                  : isDark
                    ? 'bg-neutral-900/80 border border-white/10 text-white/70 hover:bg-neutral-800'
                    : 'bg-white border border-neutral-200 text-neutral-700 hover:bg-neutral-100 shadow-sm'
              )}
            >
              {zone} {zone === 'All' ? `(${MUMBAI_WARDS.length})` : ''}
            </button>
          ))}
          <span className={classNames("ml-auto text-xs font-mono hidden sm:block", isDark ? "text-white/40" : "text-neutral-500")}>
            Showing {filteredWards.length} ward offices
          </span>
        </div>

        {/* Wards Cards Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredWards.map((w) => (
            <div
              key={w.id}
              className={classNames(
                "p-5 space-y-4 rounded-3xl border flex flex-col justify-between transition-all group",
                isDark
                  ? "bg-neutral-900/70 border-white/10 hover:border-emerald-400/40 backdrop-blur-xl shadow-xl"
                  : "bg-white border-neutral-200 hover:border-emerald-500 text-neutral-900 shadow-soft hover:shadow-soft-lg"
              )}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={classNames("font-extrabold text-base font-mono", isDark ? "text-white" : "text-neutral-950")}>{w.code}</span>
                    <span className={classNames(
                      "px-2 py-0.5 rounded-full text-[10px] font-mono font-bold border",
                      isDark ? "bg-emerald-500/20 text-emerald-300 border-emerald-400/30" : "bg-emerald-50 text-emerald-800 border-emerald-200"
                    )}>
                      Ward #{w.id}
                    </span>
                  </div>
                  <span className={classNames(
                    "text-[10px] font-mono px-2 py-0.5 rounded",
                    isDark ? "text-white/50 bg-white/5" : "text-neutral-600 bg-slate-100"
                  )}>
                    {w.zone.split(' ')[0]}
                  </span>
                </div>

                <div className="space-y-1">
                  <p className={classNames("text-xs font-semibold line-clamp-2", isDark ? "text-white/90" : "text-neutral-900")}>
                    {w.area}
                  </p>
                  <p className={classNames("text-[11px]", isDark ? "text-white/50" : "text-neutral-500")}>
                    Lead: <span className={classNames("font-medium", isDark ? "text-white/80" : "text-neutral-800")}>{w.ac}</span>
                  </p>
                </div>

                <div className={classNames("pt-2 border-t space-y-1.5 text-xs", isDark ? "border-white/10 text-white/70" : "border-neutral-200 text-neutral-600")}>
                  <div className="flex items-center gap-2">
                    <Phone size={13} className={isDark ? "text-emerald-400 shrink-0" : "text-emerald-600 shrink-0"} />
                    <a href={`tel:${w.phone.replace(/[^0-9]/g, '')}`} className={classNames("font-mono font-semibold hover:underline", isDark ? "text-white hover:text-emerald-400" : "text-neutral-900 hover:text-emerald-600")}>
                      {w.phone}
                    </a>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail size={13} className={isDark ? "text-emerald-400 shrink-0" : "text-emerald-600 shrink-0"} />
                    <a href={`mailto:${w.email}`} className={classNames("truncate font-mono text-[11px] hover:underline", isDark ? "text-white/70 hover:text-emerald-300" : "text-neutral-600 hover:text-emerald-700")}>
                      {w.email}
                    </a>
                  </div>
                  <div className={classNames("flex items-start gap-2 text-[11px]", isDark ? "text-white/50" : "text-neutral-500")}>
                    <MapPin size={13} className={classNames("shrink-0 mt-0.5", isDark ? "text-white/40" : "text-neutral-400")} />
                    <span className="line-clamp-2">{w.address}</span>
                  </div>
                </div>
              </div>

              <div className={classNames("pt-3 border-t", isDark ? "border-white/10" : "border-neutral-200")}>
                <Link
                  to={`/app/report?ward=${w.id}`}
                  onClick={() => sound.play('click')}
                  className={classNames(
                    "w-full inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-semibold border transition-colors",
                    isDark
                      ? "bg-white/5 hover:bg-emerald-500/20 hover:border-emerald-400/40 text-white/80 hover:text-emerald-300 border-white/10"
                      : "bg-slate-50 hover:bg-emerald-50 hover:border-emerald-300 text-neutral-700 hover:text-emerald-700 border-neutral-200 shadow-xs"
                  )}
                >
                  <span>Report in {w.code}</span>
                  <ArrowRight size={13} />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
};
