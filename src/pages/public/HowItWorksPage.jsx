// ─── Sovereign Civic Dark Cyber How It Works Page ──────────────────────────────
import React from 'react';
import { Link } from 'react-router-dom';
import {
  Camera, Cpu, CheckCircle2, Shield, ArrowRight,
  Sparkles, Clock, MapPin, Zap, Check, ChevronRight
} from 'lucide-react';
import { sound } from '../../utils/soundEffects';

export const HowItWorksPage = () => {
  const steps = [
    {
      num: '01',
      step: 'STEP 1 · CAPTURE & PIN',
      title: 'Citizen Submission & GPS Telemetry',
      desc: 'Snap a high-resolution photo or record a voice note in English, Marathi, or Hindi. Kaiser AI instantly captures sub-meter GPS coordinates on OpenStreetMap and auto-detects your Mumbai municipal ward polygon.',
      bullets: [
        'Automatic 24-ward boundary detection (e.g. Ward K/E, Andheri East)',
        'Voice grievance transcription in Marathi, Hindi & English',
        'Offline caching mode: report without active 5G connectivity',
      ],
      icon: Camera,
      accent: 'emerald',
      gradient: 'from-emerald-500/20 to-teal-500/5',
      border: 'border-emerald-500/30',
      badge: 'text-emerald-400 bg-emerald-500/15 border-emerald-400/30',
      iconBg: 'bg-emerald-500/20 text-emerald-300 border-emerald-400/40',
    },
    {
      num: '02',
      step: 'STEP 2 · NEURAL PIPELINE',
      title: 'YOLOv8 Vision & Severity Scoring',
      desc: 'Our proprietary deep learning models score the issue from 1 to 100 based on physical dimensions, monsoon flood risk, and road traffic hierarchy (Western Express Highway vs local gully).',
      bullets: [
        'Pothole, garbage dump, open drain, and streetlight classification with 94%+ precision',
        'Dynamic SLA calculation: high-hazard complaints get 12h-24h turnaround clocks',
        'Duplicate clustering to merge multi-citizen reports into single community work orders',
      ],
      icon: Cpu,
      accent: 'teal',
      gradient: 'from-teal-500/20 to-sky-500/5',
      border: 'border-teal-500/30',
      badge: 'text-teal-300 bg-teal-500/15 border-teal-400/30',
      iconBg: 'bg-teal-500/20 text-teal-300 border-teal-400/40',
    },
    {
      num: '03',
      step: 'STEP 3 · DISPATCH & SLA',
      title: 'Direct Ward Engineer Assignment',
      desc: 'The ticket routes straight to the mobile portal of the designated Junior Engineer (Roads, Stormwater Drains, or Solid Waste Management) for that municipal ward, completely bypassing clerical delays.',
      bullets: [
        'Real-time SLA countdown clock visible to citizen and executive engineer',
        'Contractor road repair crew logging with GPS route verification',
        'Auto-escalation to Ward Assistant Commissioner if unattended at 75% SLA',
      ],
      icon: Shield,
      accent: 'sky',
      gradient: 'from-sky-500/20 to-blue-500/5',
      border: 'border-sky-500/30',
      badge: 'text-sky-300 bg-sky-500/15 border-sky-400/30',
      iconBg: 'bg-sky-500/20 text-sky-300 border-sky-400/40',
    },
    {
      num: '04',
      step: 'STEP 4 · AUDIT & CLOSE',
      title: 'Photo-Verified Resolution & Citizen Sign-off',
      desc: 'A work order cannot be closed with paperwork alone. The ward engineer must upload an after-repair photo from the exact GPS coordinates. The citizen gets notified to review and rate the fix.',
      bullets: [
        'Side-by-side photographic before/after proof visible on public feed',
        'Citizen 48-hour satisfaction window with one-click re-open button',
        'Verified resolution points awarded to citizen for municipal certificates',
      ],
      icon: CheckCircle2,
      accent: 'purple',
      gradient: 'from-purple-500/20 to-emerald-500/5',
      border: 'border-purple-500/30',
      badge: 'text-purple-300 bg-purple-500/15 border-purple-400/30',
      iconBg: 'bg-purple-500/20 text-purple-300 border-purple-400/40',
    },
  ];

  return (
    <div className="w-full min-h-screen bg-neutral-950 text-neutral-100 select-none pb-24">
      
      {/* ── Page Hero Header ── */}
      <section className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-16 text-center">
        {/* Ambient Top Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/15 border border-emerald-400/30 text-emerald-300 text-xs font-mono font-bold tracking-widest uppercase">
            <Sparkles size={14} className="text-emerald-400" />
            STEP-BY-STEP CIVIC PIPELINE
          </div>

          <h1 className="font-display text-4xl sm:text-6xl font-extrabold text-white tracking-tight leading-tight">
            How Kaiser AI Resolves{' '}
            <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-sky-400 bg-clip-text text-transparent">
              Mumbai's Grievances
            </span>
          </h1>

          <p className="text-base sm:text-lg text-white/75 leading-relaxed">
            Our sovereign AI pipeline connects citizen photos straight to ward junior engineers with sub-second automated triage and zero bureaucratic delay.
          </p>

          {/* Quick Metrics Bar */}
          <div className="pt-6 grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-2xl mx-auto font-mono text-xs">
            <div className="p-3 rounded-2xl bg-neutral-900/80 border border-white/10 backdrop-blur-md">
              <span className="block text-xl font-bold text-emerald-400">94.2%</span>
              <span className="text-white/50 text-[11px]">AI Precision</span>
            </div>
            <div className="p-3 rounded-2xl bg-neutral-900/80 border border-white/10 backdrop-blur-md">
              <span className="block text-xl font-bold text-teal-300">&lt;24h</span>
              <span className="text-white/50 text-[11px]">Average SLA</span>
            </div>
            <div className="p-3 rounded-2xl bg-neutral-900/80 border border-white/10 backdrop-blur-md">
              <span className="block text-xl font-bold text-sky-400">24 Wards</span>
              <span className="text-white/50 text-[11px]">GIS Mapped</span>
            </div>
            <div className="p-3 rounded-2xl bg-neutral-900/80 border border-white/10 backdrop-blur-md">
              <span className="block text-xl font-bold text-amber-300">100%</span>
              <span className="text-white/50 text-[11px]">Photo Audited</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── Stepper Pipeline Section ── */}
      <section className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {steps.map((item, idx) => {
          const Icon = item.icon;
          const isEven = idx % 2 === 1;

          return (
            <div
              key={item.num}
              className={`rounded-3xl p-6 sm:p-8 bg-neutral-900/70 border ${item.border} backdrop-blur-xl shadow-2xl relative overflow-hidden group transition-all hover:bg-neutral-900/85`}
            >
              {/* Background gradient flare */}
              <div className={`absolute top-0 right-0 w-80 h-80 bg-gradient-to-br ${item.gradient} rounded-full blur-3xl pointer-events-none`} />

              <div className="grid md:grid-cols-12 gap-8 items-center relative z-10">
                {/* Visual Icon Box */}
                <div className={`md:col-span-4 flex flex-col items-center justify-center p-6 rounded-2xl bg-neutral-950/70 border border-white/10 text-center space-y-3 ${isEven ? 'md:order-2' : ''}`}>
                  <div className={`w-16 h-16 rounded-2xl border flex items-center justify-center shadow-lg ${item.iconBg}`}>
                    <Icon size={32} />
                  </div>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold border tracking-widest ${item.badge}`}>
                    {item.step}
                  </span>
                  <span className="font-mono text-3xl font-extrabold text-white/90">
                    {item.num}
                  </span>
                </div>

                {/* Content Box */}
                <div className={`md:col-span-8 space-y-4 ${isEven ? 'md:order-1' : ''}`}>
                  <h3 className="font-display text-2xl sm:text-3xl font-bold text-white tracking-tight">
                    {item.title}
                  </h3>
                  <p className="text-sm sm:text-base text-white/75 leading-relaxed">
                    {item.desc}
                  </p>
                  <ul className="space-y-2 text-xs sm:text-sm text-white/60">
                    {item.bullets.map((b, bi) => (
                      <li key={bi} className="flex items-start gap-2.5">
                        <Check size={15} className="text-emerald-400 shrink-0 mt-0.5" />
                        <span>{b}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          );
        })}
      </section>

      {/* ── Ready to Report CTA ── */}
      <section className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-16">
        <div className="rounded-3xl p-8 sm:p-12 bg-gradient-to-r from-neutral-900 via-neutral-900/90 to-neutral-900 border border-emerald-500/30 text-center space-y-6 shadow-[0_0_50px_rgba(52,211,153,0.15)] backdrop-blur-2xl relative overflow-hidden">
          
          <div className="absolute top-0 right-1/4 w-60 h-60 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />

          <h2 className="font-display text-2xl sm:text-4xl font-extrabold text-white">
            Have a civic issue you want fixed today?
          </h2>
          <p className="text-sm sm:text-base text-white/70 max-w-xl mx-auto">
            It takes under 60 seconds to upload a photo and mobilize your local ward engineering crew.
          </p>
          <div className="pt-2 flex flex-wrap items-center justify-center gap-4">
            <Link
              to="/app/report"
              onClick={() => sound.play('click')}
              className="glow-btn px-8 py-4 rounded-full bg-gradient-to-r from-emerald-500 via-brand-500 to-teal-400 text-neutral-950 font-black text-xs tracking-widest uppercase flex items-center gap-2 hover:scale-105 active:scale-95 shadow-[0_0_24px_rgba(52,211,153,0.4)] transition-all cursor-pointer"
            >
              <span>Report Civic Issue Now</span>
              <ArrowRight size={16} />
            </Link>
            <Link
              to="/app/map"
              onClick={() => sound.play('click')}
              className="px-8 py-4 rounded-full border border-white/20 hover:bg-white/10 text-white font-bold text-xs tracking-widest uppercase transition-all flex items-center gap-2 cursor-pointer"
            >
              <span>Explore Live Ward Map</span>
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
};
