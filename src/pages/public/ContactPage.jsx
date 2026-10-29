// ─── Sovereign Civic Dark Cyber Contact Page ─────────────────────────────────
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

const EMERGENCY_NUMBERS = [
  { title: 'BMC Central Disaster Control', number: '1916', desc: 'Toll-free 24x7 monsoon & civic emergencies', primary: true },
  { title: 'Mumbai Police Control', number: '100 / 112', desc: 'Public safety & rapid response', primary: false },
  { title: 'Mumbai Traffic Police WhatsApp', number: '8454-999999', desc: 'Waterlogging & tree fall road blockades', primary: false },
  { title: 'Fire & Rescue Services', number: '101', desc: 'Structural collapse & fire hazards', primary: false },
  { title: 'Ambulance & Medical Emergency', number: '108', desc: 'Free emergency medical dispatch', primary: false },
];

export const ContactPage = () => {
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

  const zones = ['All', 'Island City', 'Western Suburbs', 'Eastern Suburbs'];

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
    <div className="w-full min-h-screen bg-neutral-950 text-neutral-100 select-none space-y-16 pb-24">
      
      {/* ── Hero Section ── */}
      <section className="relative pt-12 pb-16 border-b border-white/10 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/15 border border-emerald-400/30 text-emerald-300 text-xs font-mono font-bold tracking-widest uppercase">
            <Building2 size={14} className="text-emerald-400" />
            <span>24X7 GREATER MUMBAI MUNICIPAL HELPDESK & DIRECTORY</span>
          </div>

          <h1 className="font-display text-4xl sm:text-6xl font-extrabold text-white tracking-tight leading-tight">
            Contact Kaiser AI &{' '}
            <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-sky-400 bg-clip-text text-transparent">
              24 Ward Directory
            </span>
          </h1>

          <p className="text-base sm:text-lg text-white/75 max-w-2xl mx-auto font-normal leading-relaxed">
            Directly connect with municipal liaison officers, locate your designated Assistant Commissioner, or escalate pending civic grievances.
          </p>

          {/* Emergency Hotlines Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 pt-6 text-left">
            {EMERGENCY_NUMBERS.map((em, idx) => (
              <div
                key={idx}
                className={`p-4 rounded-3xl border transition-all ${
                  em.primary
                    ? 'bg-rose-950/80 border-rose-500/40 text-rose-200 shadow-[0_0_20px_rgba(244,63,94,0.25)]'
                    : 'bg-neutral-900/80 border-white/10 text-white backdrop-blur-xl shadow-lg'
                }`}
              >
                <div className={`text-[10px] font-mono font-bold uppercase tracking-wider ${em.primary ? 'text-rose-400' : 'text-white/50'}`}>
                  {em.title}
                </div>
                <a
                  href={`tel:${em.number.split('/')[0].trim().replace(/[^0-9]/g, '')}`}
                  className={`text-lg sm:text-xl font-mono font-extrabold tracking-tight mt-1 flex items-center gap-1.5 ${
                    em.primary ? 'text-white hover:text-rose-200' : 'text-emerald-400 hover:text-emerald-300'
                  }`}
                >
                  <Phone size={14} />
                  <span>{em.number}</span>
                </a>
                <div className={`text-[10px] mt-0.5 ${em.primary ? 'text-rose-300/80' : 'text-white/40'}`}>
                  {em.desc}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Quick Complaint Status Tracker Bar ── */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-neutral-900/90 border border-white/15 text-white rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-2xl">
          <div className="grid lg:grid-cols-12 gap-6 items-center">
            <div className="lg:col-span-5 space-y-1.5">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1">
                <Sparkles size={13} /> REAL-TIME GRIEVANCE TRACKER
              </span>
              <h2 className="text-xl sm:text-2xl font-bold font-display">Have an Existing Complaint ID?</h2>
              <p className="text-xs text-white/60">
                Check live SLA status and assigned ward engineer without logging in. Try:{' '}
                <button type="button" onClick={() => setTrackingId('cmp-001')} className="underline text-emerald-400 font-mono cursor-pointer">cmp-001</button> or{' '}
                <button type="button" onClick={() => setTrackingId('cmp-002')} className="underline text-emerald-400 font-mono cursor-pointer">cmp-002</button>.
              </p>
            </div>

            <div className="lg:col-span-7">
              <form onSubmit={handleTrackSubmit} className="flex flex-col sm:flex-row gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40" size={16} />
                  <input
                    type="text"
                    placeholder="Enter Complaint ID (e.g. cmp-001 or KSR-2026-XXXX)..."
                    value={trackingId}
                    onChange={(e) => setTrackingId(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-neutral-950/80 border border-white/15 rounded-xl text-xs text-white placeholder-white/40 focus:outline-none focus:border-emerald-400 font-mono"
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
                <div className="mt-3 p-3 bg-rose-950/60 border border-rose-800 rounded-xl text-xs text-rose-300 flex items-center gap-2">
                  <AlertTriangle size={14} className="shrink-0" />
                  <span>Complaint ID not found. Please verify your reference number or submit an enquiry below.</span>
                </div>
              )}

              {trackResult && (
                <div className="mt-4 p-4 bg-neutral-950/80 rounded-2xl border border-emerald-500/30 animate-fade-in space-y-3 font-mono">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-emerald-400 text-xs">{trackResult.id}</span>
                      <span className="text-xs text-white/90 font-sans font-semibold">{trackResult.title}</span>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded border text-emerald-300 bg-emerald-500/20 border-emerald-400/40">
                      {trackResult.status.toUpperCase().replace('_', ' ')}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] text-white/70">
                    <div>
                      <span className="text-white/40 block">Category</span>
                      <span className="font-semibold text-white">{trackResult.category}</span>
                    </div>
                    <div>
                      <span className="text-white/40 block">Severity Score</span>
                      <span className="font-semibold text-amber-400">{trackResult.severity}/100</span>
                    </div>
                    <div>
                      <span className="text-white/40 block">Assigned Officer</span>
                      <span className="font-semibold text-white">{trackResult.assignedOfficer?.name || 'Assigned to Ward'}</span>
                    </div>
                    <div className="text-right sm:text-left">
                      <span className="text-white/40 block">Action</span>
                      <Link to="/app" className="text-emerald-400 hover:underline font-semibold flex items-center gap-0.5">
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
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-12 gap-8">
          {/* Left Column: Interactive Form */}
          <div className="lg:col-span-6 space-y-6">
            <div className="rounded-3xl p-6 sm:p-8 space-y-6 bg-neutral-900/80 border border-white/10 backdrop-blur-xl shadow-2xl">
              <div>
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold font-display text-white">Direct Municipal Liaison Desk</h2>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                    ONLINE PORTAL
                  </span>
                </div>
                <p className="text-xs text-white/60 mt-1">
                  Submit an escalation, report society infrastructure issues, or reach Kaiser AI engineers.
                </p>
              </div>

              {/* Inquiry Type Tabs */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 p-1 bg-neutral-950/70 border border-white/10 rounded-2xl">
                {['Escalation', 'ALM / Society', 'Partnership', 'Tech Support'].map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => { sound.play('pop'); setInquiryType(t); }}
                    className={`py-1.5 px-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                      inquiryType === t
                        ? 'bg-emerald-500 text-neutral-950 font-bold shadow-md'
                        : 'text-white/60 hover:text-white'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>

              {submittedData ? (
                <div className="p-6 bg-emerald-950/40 rounded-2xl border border-emerald-500/30 text-center space-y-4 animate-scale-in">
                  <div className="w-14 h-14 bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 rounded-2xl flex items-center justify-center mx-auto shadow-[0_0_20px_rgba(52,211,153,0.3)]">
                    <CheckCircle2 size={32} />
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-lg">Enquiry Registered Successfully</h3>
                    <p className="text-xs text-white/60 mt-1">
                      Your query has been routed to the Assistant Commissioner's grievance liaison desk.
                    </p>
                  </div>

                  <div className="bg-neutral-950/80 p-4 rounded-xl border border-white/10 text-left space-y-2 text-xs font-mono">
                    <div className="flex items-center justify-between border-b border-white/10 pb-2">
                      <span className="text-white/40">Reference Number:</span>
                      <div className="flex items-center gap-1.5 font-bold text-emerald-400">
                        <span>{submittedData.refNumber}</span>
                        <button
                          type="button"
                          onClick={handleCopyRef}
                          className="p-1 hover:bg-white/10 rounded text-white/60 hover:text-white cursor-pointer"
                          title="Copy reference number"
                        >
                          {copiedRef ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                        </button>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-white/40">Designated Ward:</span>
                      <span className="font-semibold text-white">{submittedData.ward}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-white/40">Inquiry Type:</span>
                      <span className="font-semibold text-white">{inquiryType}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-white/40">Response SLA:</span>
                      <span className="font-semibold text-emerald-400">&lt; 24 Business Hours</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setSubmittedData(null)}
                    className="w-full py-2.5 rounded-xl border border-white/20 text-xs font-bold text-white hover:bg-white/10 transition-colors cursor-pointer"
                  >
                    Submit Another Inquiry
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-white/80">Your Full Name</label>
                      <input
                        type="text"
                        placeholder="e.g. Ananya Deshmukh"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                        className="w-full rounded-xl border border-white/15 bg-neutral-950/80 p-2.5 text-xs text-white placeholder-white/30 focus:outline-none focus:border-emerald-400"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-white/80">Contact Email</label>
                      <input
                        type="email"
                        placeholder="ananya@example.com"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        required
                        className="w-full rounded-xl border border-white/15 bg-neutral-950/80 p-2.5 text-xs text-white placeholder-white/30 focus:outline-none focus:border-emerald-400"
                      />
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-white/80">Mobile Phone (+91)</label>
                      <input
                        type="tel"
                        placeholder="98200 12345"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        required
                        className="w-full rounded-xl border border-white/15 bg-neutral-950/80 p-2.5 text-xs text-white placeholder-white/30 focus:outline-none focus:border-emerald-400"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-white/80">Urgency Level</label>
                      <select
                        value={formData.urgency}
                        onChange={(e) => setFormData({ ...formData, urgency: e.target.value })}
                        className="w-full rounded-xl border border-white/15 bg-neutral-950/80 p-2.5 text-xs text-white focus:outline-none focus:border-emerald-400"
                      >
                        <option value="Normal">Normal Inquiry (48h)</option>
                        <option value="Medium">Medium Priority (24h)</option>
                        <option value="Monsoon Emergency">Monsoon Hazard / Critical (Immediate)</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-white/80">Municipal Ward</label>
                      <select
                        value={formData.ward}
                        onChange={(e) => setFormData({ ...formData, ward: e.target.value })}
                        className="w-full rounded-xl border border-white/15 bg-neutral-950/80 p-2.5 text-xs text-white focus:outline-none focus:border-emerald-400"
                      >
                        {MUMBAI_WARDS.map((w) => (
                          <option key={w.id} value={`${w.code} – ${w.area.split(',')[0]}`}>
                            {w.code} ({w.area.split(',')[0]})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-white/80">Complaint ID (Optional)</label>
                      <input
                        type="text"
                        placeholder="e.g. cmp-001 if escalating"
                        value={formData.complaintRef}
                        onChange={(e) => setFormData({ ...formData, complaintRef: e.target.value })}
                        className="w-full rounded-xl border border-white/15 bg-neutral-950/80 p-2.5 text-xs text-white placeholder-white/30 focus:outline-none focus:border-emerald-400"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-white/80">Detailed Message / Description</label>
                    <textarea
                      rows={4}
                      placeholder="Explain your inquiry, unresolved hazard timeline, or society requirement..."
                      className="w-full rounded-xl border border-white/15 bg-neutral-950/80 p-3 text-xs text-white placeholder-white/30 focus:outline-none focus:border-emerald-400"
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    className="glow-btn w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 via-brand-500 to-teal-400 text-neutral-950 font-black text-xs uppercase tracking-wider shadow-[0_0_24px_rgba(52,211,153,0.4)] flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-98 transition-all cursor-pointer"
                  >
                    <Send size={15} />
                    <span>Submit to Municipal Liaison</span>
                  </button>
                </form>
              )}
            </div>
          </div>

          {/* Right Column: Central Headquarters & Contact Protocols */}
          <div className="lg:col-span-6 space-y-6">
            {/* Headquarters Card */}
            <div className="rounded-3xl p-6 sm:p-8 space-y-5 bg-neutral-900/80 border border-white/10 backdrop-blur-xl shadow-2xl">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 flex items-center justify-center shadow-lg">
                  <Building2 size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white font-display">BMC Central Headquarters</h3>
                  <p className="text-xs text-white/60">Brihanmumbai Municipal Corporation, Fort</p>
                </div>
              </div>

              <div className="space-y-3 text-xs text-white/70 border-t border-white/10 pt-4">
                <div className="flex items-start gap-2.5">
                  <MapPin size={16} className="text-emerald-400 shrink-0 mt-0.5" />
                  <span>
                    <strong className="text-white">Address:</strong> Municipal Corporation Building, Mahapalika Marg, Opposite CSMT Station, Fort, Mumbai 400001
                  </span>
                </div>
                <div className="flex items-start gap-2.5">
                  <Clock size={16} className="text-teal-300 shrink-0 mt-0.5" />
                  <span>
                    <strong className="text-white">Visiting Hours:</strong> Monday to Friday: 10:00 AM – 5:30 PM (Public Hearings: 3:00 PM – 5:00 PM)
                  </span>
                </div>
                <div className="flex items-start gap-2.5">
                  <Mail size={16} className="text-sky-400 shrink-0 mt-0.5" />
                  <span>
                    <strong className="text-white">Official Email:</strong> <a href="mailto:mc@mcgm.gov.in" className="text-emerald-400 hover:underline">mc@mcgm.gov.in</a> / <a href="mailto:support@kaiserai.mcgm.gov.in" className="text-emerald-400 hover:underline">support@kaiserai.mcgm.gov.in</a>
                  </span>
                </div>
              </div>

              {/* Citizen Hearing Banner (Lokshahi Din) */}
              <div className="p-4 bg-sky-950/40 rounded-2xl border border-sky-500/30 space-y-1.5 text-xs text-sky-200">
                <div className="font-bold flex items-center gap-1.5 text-sky-300">
                  <LifeBuoy size={14} /> Citizen Lokshahi Din (Public Hearings)
                </div>
                <p className="text-sky-200/80 text-[11px] leading-relaxed">
                  Every 1st Monday of the month from 10:00 AM to 12:00 PM, all 24 Assistant Commissioners personally hear unresolved civic grievances at their respective ward offices.
                </p>
              </div>
            </div>

            {/* Department Escalation Directory */}
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="p-4 space-y-2 rounded-2xl bg-neutral-900/70 border border-white/10">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-300 bg-amber-500/20 px-2 py-0.5 rounded border border-amber-400/30">
                  ROADS & BRIDGES
                </span>
                <h4 className="font-bold text-sm text-white">Chief Engineer (Roads)</h4>
                <p className="text-xs text-white/50">Major potholes & road reinstatement</p>
                <div className="pt-2 border-t border-white/10 text-xs">
                  <a href="mailto:che.roads@mcgm.gov.in" className="text-emerald-400 font-mono hover:underline block truncate">
                    che.roads@mcgm.gov.in
                  </a>
                </div>
              </div>

              <div className="p-4 space-y-2 rounded-2xl bg-neutral-900/70 border border-white/10">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-sky-300 bg-sky-500/20 px-2 py-0.5 rounded border border-sky-400/30">
                  MONSOON DRAINAGE
                </span>
                <h4 className="font-bold text-sm text-white">Storm Water Drains (SWD)</h4>
                <p className="text-xs text-white/50">Waterlogging & culvert maintenance</p>
                <div className="pt-2 border-t border-white/10 text-xs">
                  <a href="mailto:dyche.swd@mcgm.gov.in" className="text-emerald-400 font-mono hover:underline block truncate">
                    dyche.swd@mcgm.gov.in
                  </a>
                </div>
              </div>

              <div className="p-4 space-y-2 rounded-2xl bg-neutral-900/70 border border-white/10">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-300 bg-emerald-500/20 px-2 py-0.5 rounded border border-emerald-400/30">
                  WASTE MANAGEMENT
                </span>
                <h4 className="font-bold text-sm text-white">Chief Engineer (SWM)</h4>
                <p className="text-xs text-white/50">Garbage dumps & daily collection</p>
                <div className="pt-2 border-t border-white/10 text-xs">
                  <a href="mailto:swm.ho@mcgm.gov.in" className="text-emerald-400 font-mono hover:underline block truncate">
                    swm.ho@mcgm.gov.in
                  </a>
                </div>
              </div>

              <div className="p-4 space-y-2 rounded-2xl bg-neutral-900/70 border border-white/10">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-purple-300 bg-purple-500/20 px-2 py-0.5 rounded border border-purple-400/30">
                  WATER SUPPLY
                </span>
                <h4 className="font-bold text-sm text-white">Hydraulic Engineer</h4>
                <p className="text-xs text-white/50">Contamination & pipeline bursts</p>
                <div className="pt-2 border-t border-white/10 text-xs">
                  <a href="mailto:he@mcgm.gov.in" className="text-emerald-400 font-mono hover:underline block truncate">
                    he@mcgm.gov.in
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Searchable 24 Municipal Wards Directory ── */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-2">
            <span className="font-mono text-xs font-bold uppercase tracking-widest text-emerald-400">FULL ADMINISTRATIVE MAPPING</span>
            <h2 className="font-display text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
              24 Municipal Ward Directory
            </h2>
            <p className="text-xs sm:text-sm text-white/60 max-w-xl">
              Find your designated Assistant Commissioner, control room phone lines, and physical ward office address across Greater Mumbai.
            </p>
          </div>

          {/* Search Bar */}
          <div className="relative min-w-[280px]">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40" size={16} />
            <input
              type="text"
              placeholder="Search ward (e.g. K/E) or area (e.g. Bandra)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-neutral-900/90 border border-white/15 rounded-xl text-xs text-white placeholder-white/30 focus:outline-none focus:border-emerald-400"
            />
          </div>
        </div>

        {/* Zone Filter Tabs */}
        <div className="flex flex-wrap items-center gap-2 border-b border-white/10 pb-4">
          {zones.map((zone) => (
            <button
              key={zone}
              onClick={() => { sound.play('pop'); setSelectedZone(zone); }}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                selectedZone === zone
                  ? 'bg-emerald-500 text-neutral-950 font-bold shadow-md'
                  : 'bg-neutral-900/80 border border-white/10 text-white/70 hover:bg-neutral-800'
              }`}
            >
              {zone} {zone === 'All' ? `(${MUMBAI_WARDS.length})` : ''}
            </button>
          ))}
          <span className="ml-auto text-xs text-white/40 font-mono hidden sm:block">
            Showing {filteredWards.length} ward offices
          </span>
        </div>

        {/* Wards Cards Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredWards.map((w) => (
            <div
              key={w.id}
              className="p-5 space-y-4 rounded-3xl bg-neutral-900/70 border border-white/10 hover:border-emerald-400/40 backdrop-blur-xl shadow-xl flex flex-col justify-between transition-all group"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-base text-white font-mono">{w.code}</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                      Ward #{w.id}
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-white/50 bg-white/5 px-2 py-0.5 rounded">
                    {w.zone.split(' ')[0]}
                  </span>
                </div>

                <div className="space-y-1">
                  <p className="text-xs font-semibold text-white/90 line-clamp-2">
                    {w.area}
                  </p>
                  <p className="text-[11px] text-white/50">
                    Lead: <span className="text-white/80 font-medium">{w.ac}</span>
                  </p>
                </div>

                <div className="pt-2 border-t border-white/10 space-y-1.5 text-xs text-white/70">
                  <div className="flex items-center gap-2">
                    <Phone size={13} className="text-emerald-400 shrink-0" />
                    <a href={`tel:${w.phone.replace(/[^0-9]/g, '')}`} className="font-mono font-semibold text-white hover:text-emerald-400">
                      {w.phone}
                    </a>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail size={13} className="text-emerald-400 shrink-0" />
                    <a href={`mailto:${w.email}`} className="text-white/70 hover:text-emerald-300 truncate font-mono text-[11px]">
                      {w.email}
                    </a>
                  </div>
                  <div className="flex items-start gap-2 text-[11px] text-white/50">
                    <MapPin size={13} className="text-white/40 shrink-0 mt-0.5" />
                    <span className="line-clamp-2">{w.address}</span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-white/10">
                <Link
                  to={`/app/report?ward=${w.id}`}
                  onClick={() => sound.play('click')}
                  className="w-full inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-white/5 hover:bg-emerald-500/20 hover:border-emerald-400/40 text-white/80 hover:text-emerald-300 text-xs font-semibold border border-white/10 transition-colors"
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
