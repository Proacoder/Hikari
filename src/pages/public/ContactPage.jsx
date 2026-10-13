import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Phone, Mail, MapPin, Building2, Search, CheckCircle2, Clock,
  AlertTriangle, Send, Copy, Check, ChevronRight, ArrowRight,
  Sparkles, LifeBuoy
} from 'lucide-react';
import { Card } from '../../components/common/Card';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { MUMBAI_WARDS } from '../../utils/mockData';
import { getStoredComplaints } from '../../api/complaints.api';

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

  const handleTrackSubmit = (e) => {
    e.preventDefault();
    setTrackError(false);
    const cleanId = trackingId.trim().toLowerCase();
    if (!cleanId) return;

    const allComplaints = getStoredComplaints();
    const found = allComplaints.find((c) => c.id?.toLowerCase() === cleanId);
    if (found) {
      setTrackResult(found);
      setTrackError(false);
    } else {
      // Genuine error state: ticket not found in registry (no fake simulations)
      setTrackError(true);
      setTrackResult(null);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const refNum = `KSR-2025-${Math.floor(1000 + Math.random() * 9000)}`;
    setSubmittedData({
      refNumber: refNum,
      ...formData,
      timestamp: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })
    });
  };

  const handleCopyRef = () => {
    if (!submittedData) return;
    navigator.clipboard.writeText(submittedData.refNumber);
    setCopiedRef(true);
    setTimeout(() => setCopiedRef(false), 2000);
  };

  return (
    <div className="space-y-16 pb-20">
      {/* ── Hero Section ──────────────────────────────────────────────────────── */}
      <section className="relative bg-gradient-to-b from-brand-50/60 via-white to-neutral-50 pt-14 pb-16 border-b border-neutral-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 text-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-100 text-brand-800 text-xs font-semibold shadow-soft-sm">
            <Building2 size={14} className="text-brand-700" />
            <span>24x7 Greater Mumbai Municipal Helpdesk & Directory</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold text-neutral-900 tracking-tight">
            Contact Kaiser AI & <span className="text-brand-600">26 Ward Directory</span>
          </h1>

          <p className="text-base text-neutral-600 max-w-2xl mx-auto font-normal">
            Directly connect with municipal liaison officers, locate your designated Assistant Commissioner, or escalate pending civic grievances.
          </p>

          {/* Quick Emergency Hotlines Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 pt-6 text-left">
            {EMERGENCY_NUMBERS.map((em, idx) => (
              <div
                key={idx}
                className={`p-3.5 rounded-2xl border transition-all ${
                  em.primary
                    ? 'bg-red-500 text-white border-red-600 shadow-soft-sm'
                    : 'bg-white border-neutral-200/80 shadow-soft-sm'
                }`}
              >
                <div className={`text-[11px] font-bold uppercase tracking-wider ${em.primary ? 'text-red-100' : 'text-neutral-500'}`}>
                  {em.title}
                </div>
                <a
                  href={`tel:${em.number.split('/')[0].trim().replace(/[^0-9]/g, '')}`}
                  className={`text-lg sm:text-xl font-extrabold tracking-tight mt-1 flex items-center gap-1.5 ${
                    em.primary ? 'text-white hover:text-red-100' : 'text-brand-700 hover:text-brand-800'
                  }`}
                >
                  <Phone size={14} />
                  <span>{em.number}</span>
                </a>
                <div className={`text-[10px] mt-0.5 ${em.primary ? 'text-red-100' : 'text-neutral-400'}`}>
                  {em.desc}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Quick Complaint Status Tracker Bar ───────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-neutral-900 via-neutral-800 to-neutral-900 text-white rounded-3xl p-6 sm:p-8 shadow-soft-md">
          <div className="grid lg:grid-cols-12 gap-6 items-center">
            <div className="lg:col-span-5 space-y-1.5">
              <span className="text-xs font-bold uppercase tracking-wider text-brand-400 flex items-center gap-1">
                <Sparkles size={13} /> Real-Time Grievance Tracker
              </span>
              <h2 className="text-xl sm:text-2xl font-bold">Have an Existing Complaint ID?</h2>
              <p className="text-xs text-neutral-400">
                Check live SLA status and the assigned ward engineer without logging in. Try: <button onClick={() => setTrackingId('cmp-001')} className="underline text-brand-400 font-mono cursor-pointer">cmp-001</button> or <button onClick={() => setTrackingId('cmp-002')} className="underline text-brand-400 font-mono cursor-pointer">cmp-002</button>.
              </p>
            </div>

            <div className="lg:col-span-7">
              <form onSubmit={handleTrackSubmit} className="flex flex-col sm:flex-row gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" size={16} />
                  <input
                    type="text"
                    placeholder="Enter Complaint ID (e.g. cmp-001 or KSR-2025-XXXX)..."
                    value={trackingId}
                    onChange={(e) => setTrackingId(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-neutral-800 border border-neutral-700 rounded-xl text-xs text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
                <button
                  type="submit"
                  className="px-6 py-3 bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs rounded-xl shadow-brand transition-colors cursor-pointer shrink-0 flex items-center justify-center gap-1.5"
                >
                  <Search size={14} /> Track Status
                </button>
              </form>

              {trackError && (
                <div className="mt-3 p-3 bg-red-950/60 border border-red-800 rounded-xl text-xs text-red-300 flex items-center gap-2">
                  <AlertTriangle size={14} className="shrink-0" />
                  <span>Complaint ID not found. Please verify your reference number or submit an enquiry below.</span>
                </div>
              )}

              {trackResult && (
                <div className="mt-4 p-4 bg-neutral-800/90 rounded-2xl border border-neutral-700 animate-fade-in space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-neutral-700/80 pb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-brand-400">{trackResult.id}</span>
                      <span className="text-xs text-neutral-300 font-semibold">{trackResult.title}</span>
                    </div>
                    <Badge variant={trackResult.status === 'resolved' ? 'success' : 'warning'} size="sm">
                      {trackResult.status.toUpperCase().replace('_', ' ')}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] text-neutral-300">
                    <div>
                      <span className="text-neutral-500 block">Category</span>
                      <span className="font-semibold text-white">{trackResult.category}</span>
                    </div>
                    <div>
                      <span className="text-neutral-500 block">Severity Score</span>
                      <span className="font-semibold text-amber-400">{trackResult.severity}/100</span>
                    </div>
                    <div>
                      <span className="text-neutral-500 block">Assigned Officer</span>
                      <span className="font-semibold text-white">{trackResult.assignedOfficer?.name || 'Assigned to Ward'}</span>
                    </div>
                    <div className="text-right sm:text-left">
                      <span className="text-neutral-500 block">Action</span>
                      <Link to="/app" className="text-brand-400 hover:underline font-semibold flex items-center gap-0.5">
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

      {/* ── Contact Form & Municipal Helpdesk Details ────────────────────────── */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-12 gap-10">
          {/* Left Column: Interactive Form */}
          <div className="lg:col-span-6 space-y-6">
            <Card className="p-6 sm:p-8 space-y-6 shadow-soft border border-neutral-200/80">
              <div>
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-neutral-900">Direct Municipal Liaison Desk</h2>
                  <Badge variant="brand" size="sm">Online Portal</Badge>
                </div>
                <p className="text-xs text-neutral-500 mt-1">
                  Submit an escalation, report society infrastructure issues, or reach Kaiser AI engineers.
                </p>
              </div>

              {/* Inquiry Type Tabs */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 p-1 bg-neutral-100 rounded-xl">
                {['Escalation', 'ALM / Society', 'Partnership', 'Tech Support'].map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setInquiryType(t)}
                    className={`py-1.5 px-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      inquiryType === t
                        ? 'bg-white text-brand-800 shadow-soft-sm'
                        : 'text-neutral-600 hover:text-neutral-900'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>

              {submittedData ? (
                <div className="p-6 bg-brand-50/60 rounded-2xl border border-brand-200 text-center space-y-4 animate-scale-in">
                  <div className="w-14 h-14 bg-brand-100 text-brand-700 rounded-2xl flex items-center justify-center mx-auto shadow-soft-sm">
                    <CheckCircle2 size={32} />
                  </div>
                  <div>
                    <h3 className="font-bold text-neutral-900 text-lg">Enquiry Registered Successfully</h3>
                    <p className="text-xs text-neutral-600 mt-1">
                      Your query has been routed to the Assistant Commissioner's grievance liaison desk.
                    </p>
                  </div>

                  <div className="bg-white p-4 rounded-xl border border-brand-200 text-left space-y-2 text-xs">
                    <div className="flex items-center justify-between border-b border-neutral-100 pb-2">
                      <span className="text-neutral-500">Reference Number:</span>
                      <div className="flex items-center gap-1.5 font-mono font-bold text-brand-700">
                        <span>{submittedData.refNumber}</span>
                        <button
                          type="button"
                          onClick={handleCopyRef}
                          className="p-1 hover:bg-neutral-100 rounded text-neutral-500 hover:text-neutral-800 cursor-pointer"
                          title="Copy reference number"
                        >
                          {copiedRef ? <Check size={14} className="text-brand-600" /> : <Copy size={14} />}
                        </button>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-neutral-500">Designated Ward:</span>
                      <span className="font-semibold text-neutral-800">{submittedData.ward}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-neutral-500">Inquiry Type:</span>
                      <span className="font-semibold text-neutral-800">{inquiryType}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-neutral-500">Response SLA:</span>
                      <span className="font-semibold text-emerald-600">&lt; 24 Business Hours</span>
                    </div>
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSubmittedData(null)}
                    className="w-full"
                  >
                    Submit Another Inquiry
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <Input
                      label="Your Full Name"
                      placeholder="e.g. Ananya Deshmukh"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                    <Input
                      label="Contact Email"
                      type="email"
                      placeholder="ananya@example.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                    />
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <Input
                      label="Mobile Phone (+91)"
                      placeholder="98200 12345"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      required
                    />
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-neutral-700">Urgency Level</label>
                      <select
                        value={formData.urgency}
                        onChange={(e) => setFormData({ ...formData, urgency: e.target.value })}
                        className="w-full rounded-xl border border-neutral-200 p-2.5 text-xs bg-white focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                      >
                        <option value="Normal">Normal Inquiry (48h)</option>
                        <option value="Medium">Medium Priority (24h)</option>
                        <option value="Monsoon Emergency">Monsoon Hazard / Critical (Immediate)</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-neutral-700">Municipal Ward</label>
                      <select
                        value={formData.ward}
                        onChange={(e) => setFormData({ ...formData, ward: e.target.value })}
                        className="w-full rounded-xl border border-neutral-200 p-2.5 text-xs bg-white focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                      >
                        {MUMBAI_WARDS.map((w) => (
                          <option key={w.id} value={`${w.code} – ${w.area.split(',')[0]}`}>
                            {w.code} ({w.area.split(',')[0]})
                          </option>
                        ))}
                      </select>
                    </div>

                    <Input
                      label="Complaint ID (Optional)"
                      placeholder="e.g. cmp-001 if escalating"
                      value={formData.complaintRef}
                      onChange={(e) => setFormData({ ...formData, complaintRef: e.target.value })}
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-neutral-700">Detailed Message / Grievance Description</label>
                    <textarea
                      rows={4}
                      placeholder="Explain your inquiry, unresolved hazard timeline, or society requirement..."
                      className="w-full rounded-xl border border-neutral-200 p-3 text-xs focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      required
                    />
                  </div>

                  <Button type="submit" variant="primary" fullWidth className="py-3 shadow-brand">
                    <Send size={15} className="mr-1.5" /> Submit to Municipal Liaison
                  </Button>
                </form>
              )}
            </Card>
          </div>

          {/* Right Column: Central Headquarters & Contact Protocols */}
          <div className="lg:col-span-6 space-y-6">
            {/* Headquarters Card */}
            <Card className="p-6 sm:p-8 space-y-5 border border-neutral-200/80 shadow-soft">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-neutral-900 text-white flex items-center justify-center shadow-soft-sm">
                  <Building2 size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-neutral-900">BMC Central Headquarters</h3>
                  <p className="text-xs text-neutral-500">Brihanmumbai Municipal Corporation, Fort</p>
                </div>
              </div>

              <div className="space-y-3 text-xs text-neutral-600 border-t border-neutral-100 pt-4">
                <div className="flex items-start gap-2.5">
                  <MapPin size={16} className="text-brand-600 shrink-0 mt-0.5" />
                  <span>
                    <strong>Address:</strong> Municipal Corporation Building, Mahapalika Marg, Opposite CSMT Station, Fort, Mumbai 400001
                  </span>
                </div>
                <div className="flex items-start gap-2.5">
                  <Clock size={16} className="text-brand-600 shrink-0 mt-0.5" />
                  <span>
                    <strong>Citizen Visiting Hours:</strong> Monday to Friday: 10:00 AM – 5:30 PM (Public Hearings: 3:00 PM – 5:00 PM)
                  </span>
                </div>
                <div className="flex items-start gap-2.5">
                  <Mail size={16} className="text-brand-600 shrink-0 mt-0.5" />
                  <span>
                    <strong>Official Email:</strong> <a href="mailto:mc@mcgm.gov.in" className="text-brand-700 hover:underline">mc@mcgm.gov.in</a> / <a href="mailto:support@kaiserai.mcgm.gov.in" className="text-brand-700 hover:underline">support@kaiserai.mcgm.gov.in</a>
                  </span>
                </div>
              </div>

              {/* Citizen Hearing Banner (Lokshahi Din) */}
              <div className="p-4 bg-sky-50 rounded-2xl border border-sky-100 space-y-1.5 text-xs text-sky-900">
                <div className="font-bold flex items-center gap-1.5 text-sky-800">
                  <LifeBuoy size={14} /> Citizen Lokshahi Din (Public Hearings)
                </div>
                <p className="text-sky-700 text-[11px] leading-relaxed">
                  Every 1st Monday of the month from 10:00 AM to 12:00 PM, all 26 Assistant Commissioners personally hear unresolved civic grievances at their respective ward offices.
                </p>
              </div>
            </Card>

            {/* Department Escalation Directory */}
            <div className="grid sm:grid-cols-2 gap-4">
              <Card className="p-4 space-y-2 border border-neutral-200/80">
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 bg-amber-50 px-2 py-0.5 rounded">
                  Roads & Bridges
                </span>
                <h4 className="font-bold text-sm text-neutral-900">Chief Engineer (Roads)</h4>
                <p className="text-xs text-neutral-500">Major potholes & road reinstatement</p>
                <div className="pt-2 border-t border-neutral-100 text-xs text-neutral-600">
                  <a href="mailto:che.roads@mcgm.gov.in" className="text-brand-600 font-semibold hover:underline block truncate">
                    che.roads@mcgm.gov.in
                  </a>
                </div>
              </Card>

              <Card className="p-4 space-y-2 border border-neutral-200/80">
                <span className="text-[10px] font-bold uppercase tracking-wider text-sky-600 bg-sky-50 px-2 py-0.5 rounded">
                  Monsoon Drainage
                </span>
                <h4 className="font-bold text-sm text-neutral-900">Storm Water Drains (SWD)</h4>
                <p className="text-xs text-neutral-500">Waterlogging & culvert maintenance</p>
                <div className="pt-2 border-t border-neutral-100 text-xs text-neutral-600">
                  <a href="mailto:dyche.swd@mcgm.gov.in" className="text-brand-600 font-semibold hover:underline block truncate">
                    dyche.swd@mcgm.gov.in
                  </a>
                </div>
              </Card>

              <Card className="p-4 space-y-2 border border-neutral-200/80">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                  Waste Management
                </span>
                <h4 className="font-bold text-sm text-neutral-900">Chief Engineer (SWM)</h4>
                <p className="text-xs text-neutral-500">Garbage dumps & daily collection</p>
                <div className="pt-2 border-t border-neutral-100 text-xs text-neutral-600">
                  <a href="mailto:swm.ho@mcgm.gov.in" className="text-brand-600 font-semibold hover:underline block truncate">
                    swm.ho@mcgm.gov.in
                  </a>
                </div>
              </Card>

              <Card className="p-4 space-y-2 border border-neutral-200/80">
                <span className="text-[10px] font-bold uppercase tracking-wider text-purple-600 bg-purple-50 px-2 py-0.5 rounded">
                  Water Supply
                </span>
                <h4 className="font-bold text-sm text-neutral-900">Hydraulic Engineer</h4>
                <p className="text-xs text-neutral-500">Contamination & pipeline bursts</p>
                <div className="pt-2 border-t border-neutral-100 text-xs text-neutral-600">
                  <a href="mailto:he@mcgm.gov.in" className="text-brand-600 font-semibold hover:underline block truncate">
                    he@mcgm.gov.in
                  </a>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* ── Searchable 26 Municipal Wards Directory ──────────────────────────── */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-50 text-brand-700 text-xs font-semibold">
              <Building2 size={13} />
              <span>Full Administrative Mapping</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 tracking-tight">
              26 Municipal Ward Directory
            </h2>
            <p className="text-xs sm:text-sm text-neutral-500 max-w-xl">
              Find your designated Assistant Commissioner, control room phone lines, and physical ward office address across Greater Mumbai.
            </p>
          </div>

          {/* Search bar */}
          <div className="relative min-w-[280px]">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" size={16} />
            <input
              type="text"
              placeholder="Search ward (e.g. K/E) or locality (e.g. Bandra)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-neutral-200 rounded-xl text-xs focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
            />
          </div>
        </div>

        {/* Zone Filter Tabs */}
        <div className="flex flex-wrap items-center gap-2 border-b border-neutral-200/80 pb-4">
          {zones.map((zone) => (
            <button
              key={zone}
              onClick={() => setSelectedZone(zone)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                selectedZone === zone
                  ? 'bg-neutral-900 text-white shadow-soft-sm'
                  : 'bg-white border border-neutral-200 text-neutral-600 hover:bg-neutral-50'
              }`}
            >
              {zone} {zone === 'All' ? `(${MUMBAI_WARDS.length})` : ''}
            </button>
          ))}
          <span className="ml-auto text-xs text-neutral-400 font-medium hidden sm:block">
            Showing {filteredWards.length} ward offices
          </span>
        </div>

        {/* Wards Cards Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredWards.map((w) => (
            <Card key={w.id} hover className="p-5 space-y-4 border border-neutral-200/80 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-base text-neutral-900">{w.code}</span>
                    <Badge variant="brand" size="sm">Ward #{w.id}</Badge>
                  </div>
                  <span className="text-[10px] font-semibold text-neutral-400 bg-neutral-100 px-2 py-0.5 rounded">
                    {w.zone.split(' ')[0]}
                  </span>
                </div>

                <div className="space-y-1">
                  <p className="text-xs font-semibold text-neutral-800 line-clamp-2">
                    {w.area}
                  </p>
                  <p className="text-[11px] text-neutral-500">
                    Lead: <span className="text-neutral-700 font-medium">{w.ac}</span>
                  </p>
                </div>

                <div className="pt-2 border-t border-neutral-100 space-y-1.5 text-xs text-neutral-600">
                  <div className="flex items-center gap-2">
                    <Phone size={13} className="text-brand-600 shrink-0" />
                    <a href={`tel:${w.phone.replace(/[^0-9]/g, '')}`} className="font-semibold text-neutral-800 hover:text-brand-600">
                      {w.phone}
                    </a>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail size={13} className="text-brand-600 shrink-0" />
                    <a href={`mailto:${w.email}`} className="text-neutral-600 hover:text-brand-600 truncate">
                      {w.email}
                    </a>
                  </div>
                  <div className="flex items-start gap-2 text-[11px] text-neutral-500">
                    <MapPin size={13} className="text-neutral-400 shrink-0 mt-0.5" />
                    <span className="line-clamp-2">{w.address}</span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-neutral-100">
                <Link
                  to={`/app/report?ward=${w.id}`}
                  className="w-full inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-neutral-50 hover:bg-brand-50 text-neutral-700 hover:text-brand-700 text-xs font-semibold border border-neutral-200/80 transition-colors"
                >
                  <span>Report in {w.code}</span>
                  <ArrowRight size={13} />
                </Link>
              </div>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
};
