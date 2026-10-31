// ─── Static Clean Hero: Mumbai Night Skyline Background (No Animations) ───
import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Activity, Waves } from 'lucide-react';
import { sound } from '../../utils/soundEffects';
import { useLanguage } from '../../context/LanguageContext';

const STATUS_STYLES = {
  ASSIGNED: 'text-sky-300 bg-sky-500/20 border-sky-400/40 shadow-[0_0_10px_rgba(56,189,248,0.25)]',
  RESOLVED: 'text-emerald-300 bg-emerald-500/20 border-emerald-400/40 shadow-[0_0_10px_rgba(52,211,153,0.25)]',
  ESCALATED: 'text-amber-300 bg-amber-500/20 border-amber-400/40 shadow-[0_0_10px_rgba(251,191,36,0.25)]',
  DETECTED: 'text-rose-300 bg-rose-500/20 border-rose-400/40 shadow-[0_0_10px_rgba(251,113,133,0.25)]',
};

export const HeroSlider = ({ stats, weather }) => {
  const { t } = useLanguage();

  const telemetryRows = [
    ['WD-K/E-0492', 'POTHOLE · 98.4%', 'ASSIGNED'],
    ['WD-G/N-0061', 'GARBAGE DUMP · 94.1%', 'DETECTED'],
    ['WD-P/N-0305', 'OPEN DRAIN · 91.7%', 'ASSIGNED'],
    ['WD-L-0182', 'STREETLIGHT · 88.0%', 'RESOLVED'],
  ];

  return (
    <section
      className="relative w-full min-h-[92vh] lg:min-h-screen text-white overflow-hidden isolate flex flex-col justify-between pt-20 sm:pt-24 pb-8 select-none"
      aria-label="Kaiser AI Municipal Hero"
    >
      {/* ── Static Background Image with Clear Visibility ── */}
      <div className="absolute inset-0 z-0">
        <img
          src="/hero/mumbai-night-skyline.jpg?v=2"
          alt="Mumbai Night Skyline"
          className="w-full h-full object-cover object-center"
        />
        {/* Gentle Left vignette for text clarity, keeping the skyline vivid & clearly visible */}
        <div className="absolute inset-0 bg-gradient-to-r from-neutral-950/80 via-neutral-950/35 to-transparent pointer-events-none" />
        {/* Soft edge fade into navbar and footer */}
        <div className="absolute inset-0 bg-gradient-to-b from-neutral-950/45 via-transparent to-neutral-950/60 pointer-events-none" />
      </div>

      {/* ── Main Hero Content Grid ── */}
      <div className="relative z-20 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 my-auto flex-1 flex flex-col justify-center py-6 sm:py-10">
        <div className="grid lg:grid-cols-12 gap-8 lg:gap-12 items-center">

          {/* Left Column: Bold Typography & CTAs */}
          <div className="lg:col-span-7 space-y-6 text-left">
            <div className="space-y-4">
              {/* Eyebrow with Emerald Accent Line */}
              <div className="flex items-center gap-3">
                <span className="block w-10 sm:w-14 h-0.5 bg-gradient-to-r from-emerald-400 via-teal-300 to-sky-400 shadow-[0_0_8px_#34d399]" />
                <span className="font-mono text-xs font-bold uppercase tracking-[.25em] text-emerald-300">
                  {t('hero.slide1.eyebrow', 'SOVEREIGN AI-DRIVEN CIVIC GOVERNANCE')}
                </span>
              </div>

              {/* Massive Punchy Headline */}
              <h1 className="font-display text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight leading-[1.08] text-white">
                <span className="block text-white drop-shadow-lg">
                  {t('hero.slide1.l1', 'Fix Mumbai')}
                </span>
                <span className="block font-light text-white/95 bg-gradient-to-r from-white via-emerald-100 to-teal-300 bg-clip-text text-transparent">
                  {t('hero.slide1.l2', 'one report at a time.')}
                </span>
              </h1>

              {/* Accent Divider */}
              <span className="block h-0.5 w-44 sm:w-80 bg-gradient-to-r from-emerald-400 via-teal-300 to-transparent" />

              {/* Subtitle Description */}
              <p className="text-sm sm:text-base lg:text-lg text-white/80 max-w-xl leading-relaxed drop-shadow-md">
                {t('hero.slide1.desc', 'Snap a photo or speak in any language. Kaiser AI detects the issue, scores severity with OpenAI CLIP Zero-Shot Vision and auto-dispatches ward engineers before your chai gets cold.')}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-4 pt-1">
              <Link
                to="/app/report"
                onClick={() => sound.play('click')}
                className="glow-btn relative overflow-hidden shine group px-8 py-4 rounded-full bg-gradient-to-r from-emerald-500 via-brand-500 to-teal-400 text-neutral-950 font-black text-xs tracking-[.2em] uppercase flex items-center gap-3 hover:scale-105 active:scale-95 shadow-[0_0_30px_rgba(52,211,153,0.5)] transition-all cursor-pointer"
              >
                <span>{t('hero.reportBtn', 'Report Civic Issue')}</span>
                <ArrowRight size={16} className="group-hover:translate-x-1.5 transition-transform" />
              </Link>
              <Link
                to="/how-it-works"
                onClick={() => sound.play('click')}
                className="px-8 py-4 rounded-full border border-white/30 hover:border-emerald-400/80 hover:bg-white/10 backdrop-blur text-white font-bold text-xs tracking-[.2em] uppercase transition-all active:scale-95 flex items-center gap-2 cursor-pointer shadow-soft-sm"
              >
                <span>{t('nav.howItWorks', 'How It Works')}</span>
              </Link>
            </div>

            {/* Quick Municipal Feature Chips */}
            <div className="pt-2 flex flex-wrap items-center gap-2.5 text-[11px] font-mono text-white/75">
              <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                24 BMC Wards
              </span>
              <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-sky-400" />
                OpenAI CLIP Vision
              </span>
              <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                SLA Auto-Escalate
              </span>
              <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm flex items-center gap-1.5">
                <Waves size={12} className="text-teal-400" />
                IMD Flood Radar
              </span>
              <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                1916 Control Room
              </span>
            </div>
          </div>

          {/* Right Column: Glass Live Telemetry Card */}
          <div className="lg:col-span-5">
            <div className="relative rounded-3xl bg-neutral-900/75 backdrop-blur-xl border border-white/15 p-5 sm:p-6 shadow-[0_16px_50px_rgba(0,0,0,0.5)]">
              {/* Card Header */}
              <div className="flex items-center justify-between pb-3.5 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#4ade80]" />
                  <span className="font-mono text-[11px] font-bold tracking-[.25em] uppercase text-emerald-300">
                    LIVE TELEMETRY
                  </span>
                </div>
                <span className="font-mono text-[10px] text-white/50 tracking-wider">
                  01 / 05
                </span>
              </div>

              {/* Ticket Feed Rows */}
              <div className="divide-y divide-white/5 py-1">
                {telemetryRows.map(([id, label, st]) => (
                  <div key={id} className="py-2.5 flex items-center justify-between text-xs font-mono">
                    <span className="font-bold text-white tracking-wide flex items-center gap-1.5">
                      <span className="w-1 h-1 rounded-full bg-emerald-400/60" />
                      {id}
                    </span>
                    <span className="text-white/70 text-[11px] truncate max-w-[150px]">{label}</span>
                    <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold border tracking-wider ${STATUS_STYLES[st] || 'text-white'}`}>
                      {st}
                    </span>
                  </div>
                ))}
              </div>

              {/* Card Footer Telemetry HUD */}
              <div className="mt-3 pt-3.5 border-t border-white/15 flex items-center justify-between text-[10px] text-white/60">
                <span className="flex items-center gap-1.5">
                  <Activity size={12} className="text-emerald-400" />
                  BMC NODE: OPTIMAL (18.4h SLA)
                </span>
                <span className="font-semibold text-emerald-400/90 font-mono">GPS 19.076° N, 72.877° E</span>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* ── Bottom Telemetry Strip ── */}
      <div className="relative z-20 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between pt-4 border-t border-white/10 font-mono text-[11px] tracking-[.3em] text-white/80">
        <div className="flex items-center gap-3 sm:gap-4">
          <span className="font-bold text-white text-xs sm:text-sm">01 / 05</span>
          <span className="hidden md:inline text-white/70 text-[10px] uppercase">
            {t('hero.slide1.caption', 'PHOTO TO DISPATCH IN SECONDS')}
          </span>
        </div>

        {/* Right: Scroll Cue */}
        <div className="flex items-center gap-3 font-mono text-[10px] tracking-[.35em] text-white/60">
          <span className="hidden sm:inline">SCROLL</span>
          <span className="block w-px h-7 bg-gradient-to-b from-white/80 to-transparent" />
        </div>
      </div>
    </section>
  );
};
