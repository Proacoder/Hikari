// ─── Sovereign Civic Adaptive How It Works Page (Light & Dark) ───────────────────
import React from 'react';
import { Link } from 'react-router-dom';
import {
  Camera, Cpu, CheckCircle2, Shield, ArrowRight,
  Sparkles, Clock, MapPin, Zap, Check, ChevronRight
} from 'lucide-react';
import { sound } from '../../utils/soundEffects';
import { useTheme } from '../../context/ThemeContext';
import { classNames } from '../../utils/formatters';

export const HowItWorksPage = () => {
  const { isDark } = useTheme();
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
      title: 'OpenAI CLIP Vision & Severity Scoring',
      desc: 'Our multimodal OpenAI CLIP zero-shot vision and ViT authenticity models classify municipal issues, filter non-civic spam or AI deepfakes, and score urgency from 1 to 100 based on hazard size, flood risk, and road traffic hierarchy.',
      bullets: [
        'OpenAI CLIP zero-shot classification for potholes, garbage dumps, open drains, and streetlights with 94%+ precision',
        'Deep learning ViT synthetic AI image verification to block fake and spam complaints',
        'Dynamic SLA calculation: high-hazard complaints get accelerated 12h-24h turnaround clocks',
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
    <div className={classNames('w-full min-h-screen select-none pb-24 transition-colors duration-300', isDark ? 'bg-neutral-950 text-neutral-100' : 'bg-slate-50 text-neutral-900')}>
      
      {/* ── Page Hero Header ── */}
      <section className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-16 text-center">
        {/* Ambient Top Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl mx-auto space-y-4">
          <div className={classNames('inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border text-xs font-mono font-bold tracking-widest uppercase', isDark ? 'bg-emerald-500/15 border-emerald-400/30 text-emerald-300' : 'bg-emerald-50 border-emerald-300 text-emerald-800')}>
            <Sparkles size={14} className={isDark ? 'text-emerald-400' : 'text-emerald-600'} />
            STEP-BY-STEP CIVIC PIPELINE
          </div>

          <h1 className={classNames('font-display text-4xl sm:text-6xl font-extrabold tracking-tight leading-tight', isDark ? 'text-white' : 'text-neutral-900')}>
            How Kaiser AI Resolves{' '}
            <span className="bg-gradient-to-r from-emerald-500 via-teal-500 to-sky-500 bg-clip-text text-transparent">
              Mumbai's Grievances
            </span>
          </h1>

          <p className={classNames('text-base sm:text-lg leading-relaxed', isDark ? 'text-white/75' : 'text-neutral-600')}>
            Our sovereign AI pipeline connects citizen photos straight to ward junior engineers with sub-second automated triage and zero bureaucratic delay.
          </p>

          {/* Quick Metrics Bar */}
          <div className="pt-6 grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-2xl mx-auto font-mono text-xs">
            <div className={classNames('p-3 rounded-2xl border backdrop-blur-md transition-colors', isDark ? 'bg-neutral-900/80 border-white/10' : 'bg-white border-neutral-200/80 shadow-soft-sm')}>
              <span className="block text-xl font-bold text-emerald-500">94.2%</span>
              <span className={classNames('text-[11px]', isDark ? 'text-white/50' : 'text-neutral-500')}>AI Precision</span>
            </div>
            <div className={classNames('p-3 rounded-2xl border backdrop-blur-md transition-colors', isDark ? 'bg-neutral-900/80 border-white/10' : 'bg-white border-neutral-200/80 shadow-soft-sm')}>
              <span className="block text-xl font-bold text-teal-500">&lt;24h</span>
              <span className={classNames('text-[11px]', isDark ? 'text-white/50' : 'text-neutral-500')}>Average SLA</span>
            </div>
            <div className={classNames('p-3 rounded-2xl border backdrop-blur-md transition-colors', isDark ? 'bg-neutral-900/80 border-white/10' : 'bg-white border-neutral-200/80 shadow-soft-sm')}>
              <span className="block text-xl font-bold text-sky-500">24 Wards</span>
              <span className={classNames('text-[11px]', isDark ? 'text-white/50' : 'text-neutral-500')}>GIS Mapped</span>
            </div>
            <div className={classNames('p-3 rounded-2xl border backdrop-blur-md transition-colors', isDark ? 'bg-neutral-900/80 border-white/10' : 'bg-white border-neutral-200/80 shadow-soft-sm')}>
              <span className="block text-xl font-bold text-amber-500">100%</span>
              <span className={classNames('text-[11px]', isDark ? 'text-white/50' : 'text-neutral-500')}>Photo Audited</span>
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
              className={classNames(
                'rounded-3xl p-6 sm:p-8 border backdrop-blur-xl shadow-2xl relative overflow-hidden group transition-all',
                isDark
                  ? `bg-neutral-900/70 ${item.border} hover:bg-neutral-900/85`
                  : 'bg-white border-neutral-200 hover:border-emerald-300 shadow-soft-lg'
              )}
            >
              {/* Background gradient flare */}
              <div className={`absolute top-0 right-0 w-80 h-80 bg-gradient-to-br ${item.gradient} rounded-full blur-3xl pointer-events-none`} />

              <div className="grid md:grid-cols-12 gap-8 items-center relative z-10">
                {/* Visual Icon Box */}
                <div className={classNames('md:col-span-4 flex flex-col items-center justify-center p-6 rounded-2xl border text-center space-y-3', isEven ? 'md:order-2' : '', isDark ? 'bg-neutral-950/70 border-white/10' : 'bg-neutral-50 border-neutral-200')}>
                  <div className={`w-16 h-16 rounded-2xl border flex items-center justify-center shadow-lg ${item.iconBg}`}>
                    <Icon size={32} />
                  </div>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold border tracking-widest ${item.badge}`}>
                    {item.step}
                  </span>
                  <span className={classNames('font-mono text-3xl font-extrabold', isDark ? 'text-white/90' : 'text-neutral-900')}>
                    {item.num}
                  </span>
                </div>

                {/* Content Box */}
                <div className={`md:col-span-8 space-y-4 ${isEven ? 'md:order-1' : ''}`}>
                  <h3 className={classNames('font-display text-2xl sm:text-3xl font-bold tracking-tight', isDark ? 'text-white' : 'text-neutral-900')}>
                    {item.title}
                  </h3>
                  <p className={classNames('text-sm sm:text-base leading-relaxed', isDark ? 'text-white/75' : 'text-neutral-600')}>
                    {item.desc}
                  </p>
                  <ul className={classNames('space-y-2 text-xs sm:text-sm', isDark ? 'text-white/60' : 'text-neutral-700')}>
                    {item.bullets.map((b, bi) => (
                      <li key={bi} className="flex items-start gap-2.5">
                        <Check size={15} className="text-emerald-500 shrink-0 mt-0.5" />
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
        <div className={classNames('rounded-3xl p-8 sm:p-12 border text-center space-y-6 backdrop-blur-2xl relative overflow-hidden transition-colors', isDark ? 'bg-gradient-to-r from-neutral-900 via-neutral-900/90 to-neutral-900 border-emerald-500/30 shadow-[0_0_50px_rgba(52,211,153,0.15)]' : 'bg-white border-neutral-200 shadow-soft-xl')}>
          
          <div className="absolute top-0 right-1/4 w-60 h-60 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />

          <h2 className={classNames('font-display text-2xl sm:text-4xl font-extrabold', isDark ? 'text-white' : 'text-neutral-900')}>
            Have a civic issue you want fixed today?
          </h2>
          <p className={classNames('text-sm sm:text-base max-w-xl mx-auto', isDark ? 'text-white/70' : 'text-neutral-600')}>
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
              className={classNames('px-8 py-4 rounded-full border font-bold text-xs tracking-widest uppercase transition-all flex items-center gap-2 cursor-pointer', isDark ? 'border-white/20 hover:bg-white/10 text-white' : 'border-neutral-300 hover:bg-neutral-100 text-neutral-800')}
            >
              <span>Explore Live Ward Map</span>
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
};
