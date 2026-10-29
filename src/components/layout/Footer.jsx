// ─── Sovereign Municipal Footer (Light & Dark Mode) ──────────────────────────
import React from 'react';
import { Link } from 'react-router-dom';
import {
  Shield, Phone, Mail, MapPin, ExternalLink, Waves,
  Radio, CheckCircle2, ArrowUpRight, ChevronRight,
  Building2, Siren, Headphones, Cpu, AlertTriangle
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { sound } from '../../utils/soundEffects';

const QUICK_LINKS = [
  { label: 'File Citizen Grievance', to: '/app/report', isPrimary: true },
  { label: '24-Ward Live GIS Map', to: '/app/map' },
  { label: 'Ward Leaderboard & Metrics', to: '/app/leaderboard' },
  { label: 'Zero-Touch Triage System', to: '/how-it-works' },
  { label: 'About Municipal AI Mission', to: '/about' },
  { label: 'Find My Ward Office', to: '/contact' },
  { label: 'Officer / Staff Portal', to: '/officer/login' },
];

const KEY_WARDS = [
  {
    ward: 'Ward K/East (Andheri E)',
    area: 'SV Road & WEH Transit Corridors',
    phone: '022-2616-6000',
  },
  {
    ward: 'Ward G/North (Dharavi / Bandra)',
    area: 'Mithi River Basin & Mahim Bay',
    phone: '022-2640-5555',
  },
  {
    ward: 'Ward F/South (Parel / Hindmata)',
    area: 'Culvert Dewatering & Low-Lying Sump',
    phone: '022-2413-4567',
  },
  {
    ward: 'Ward H/West (Bandra W)',
    area: 'Promenade & Tidal Watch Sluices',
    phone: '022-2642-2311',
  },
];

const EMERGENCY_NUMBERS = [
  { label: 'Disaster Central (24x7)', num: '1916', desc: 'BMC Flood & Disaster Helpline', badge: 'BMC 24x7' },
  { label: 'Medical Emergency', num: '108', desc: 'Ambulance & Cardiac Dispatch', badge: 'EMS' },
  { label: 'Mumbai Police', num: '100', desc: 'City Police Command Control', badge: 'POLICE' },
  { label: 'Power & Grid Fire', num: '1912', desc: 'BEST / MSEDCL Isolation', badge: 'GRID' },
];

export const Footer = () => {
  const { isDark } = useTheme();

  return (
    <footer
      className={`relative select-none border-t transition-colors ${
        isDark
          ? 'bg-[#070b12] border-white/10 text-neutral-400'
          : 'bg-slate-100 border-neutral-200 text-neutral-600'
      }`}
    >
      {/* ── 1. Top Emergency Helpline Ribbon ── */}
      <div
        className={`border-b transition-colors ${
          isDark
            ? 'bg-neutral-900/60 border-white/10'
            : 'bg-white border-neutral-200 shadow-xs'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-col lg:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5 shrink-0">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500" />
            </span>
            <span className="font-mono text-xs font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400 flex items-center gap-1.5">
              <Siren size={14} />
              Mumbai Emergency Quick Access
            </span>
            <span className="hidden sm:inline text-xs opacity-40">|</span>
            <span className="hidden sm:inline text-xs text-neutral-500 dark:text-neutral-400">
              Direct municipal emergency response hotlines
            </span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3">
            {EMERGENCY_NUMBERS.map((e) => (
              <a
                key={e.num}
                href={`tel:${e.num}`}
                onClick={() => sound.play('click')}
                className={`px-3 py-1.5 rounded-xl border text-xs font-mono transition-all flex items-center gap-2 cursor-pointer ${
                  isDark
                    ? 'bg-white/5 hover:bg-rose-500/10 border-white/10 hover:border-rose-500/30 text-white/90 hover:text-rose-300'
                    : 'bg-neutral-50 hover:bg-rose-50 border-neutral-200 hover:border-rose-300 text-neutral-800 hover:text-rose-700 shadow-xs'
                }`}
                title={`${e.label} · ${e.desc}`}
              >
                <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/20">
                  {e.badge}
                </span>
                <span className="font-black text-sm text-rose-600 dark:text-rose-400">{e.num}</span>
                <span className="hidden md:inline text-[11px] opacity-75 font-sans font-medium">{e.label}</span>
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* ── 2. Main Footer Multi-Column Grid ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10">
          
          {/* Column 1 (4 cols): Brand, Mission & Grid Status */}
          <div className="lg:col-span-4 space-y-5">
            <Link
              to="/"
              onClick={() => sound.play('click')}
              className="inline-flex items-center gap-3 group cursor-pointer"
            >
              <div className="relative w-11 h-11 rounded-2xl bg-white shadow-brand flex items-center justify-center p-1 overflow-hidden group-hover:scale-105 group-hover:rotate-2 transition-all duration-300">
                <img src="/kaiser-mark.png" alt="Kaiser AI" className="w-full h-full object-contain" />
                <span className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/80 to-transparent translate-x-[-120%] group-hover:translate-x-[120%] transition-transform duration-700" />
              </div>
              <div>
                <span className={`font-display font-black text-xl tracking-tight block ${isDark ? 'text-white' : 'text-neutral-900'}`}>
                  Kaiser<span className="bg-gradient-to-r from-emerald-500 to-teal-400 bg-clip-text text-transparent ml-0.5">AI</span>
                </span>
                <span className="font-mono text-[10px] uppercase tracking-widest text-emerald-600 dark:text-emerald-400 block font-bold">
                  Brihanmumbai Municipal Civic Command
                </span>
              </div>
            </Link>

            <p className={`text-sm leading-relaxed ${isDark ? 'text-neutral-300/80' : 'text-neutral-600'}`}>
              Sovereign AI-driven civic issue triage, ultrasonic flood telemetry, and automated ward dispatch engineered for Mumbai's 24 administrative wards.
            </p>

            {/* Live Telemetry Health Card */}
            <div
              className={`p-3.5 rounded-2xl border transition-all ${
                isDark
                  ? 'bg-neutral-900/60 border-white/10'
                  : 'bg-white border-neutral-200 shadow-xs'
              }`}
            >
              <div className="flex items-center justify-between pb-2 border-b border-neutral-200 dark:border-white/10 text-xs font-mono">
                <span className="flex items-center gap-2 font-bold text-emerald-600 dark:text-emerald-400">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_#10b981]" />
                  24 WARD GRID ONLINE
                </span>
                <span className="text-[10px] text-neutral-500 dark:text-neutral-400 font-semibold">
                  IMD SANTACRUZ SYNC
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 pt-2.5 text-[11px] font-mono">
                <div>
                  <span className="text-neutral-400 dark:text-neutral-500 block text-[10px]">AVG TICKET SLA</span>
                  <span className={`font-bold ${isDark ? 'text-white' : 'text-neutral-900'}`}>18.4 Hours</span>
                </div>
                <div>
                  <span className="text-neutral-400 dark:text-neutral-500 block text-[10px]">ACTIVE PUMPS</span>
                  <span className="font-bold text-teal-600 dark:text-teal-400">64/64 Stations</span>
                </div>
              </div>
            </div>

            {/* Compliance Pills */}
            <div className="flex flex-wrap gap-2 text-[10px] font-mono">
              <span className={`px-2.5 py-1 rounded-full border ${isDark ? 'bg-white/5 border-white/10 text-neutral-300' : 'bg-neutral-200/60 border-neutral-300 text-neutral-700'}`}>
                🛡️ DPDP 2023 Masked
              </span>
              <span className={`px-2.5 py-1 rounded-full border ${isDark ? 'bg-white/5 border-white/10 text-neutral-300' : 'bg-neutral-200/60 border-neutral-300 text-neutral-700'}`}>
                ⚖️ MCGM Open Bylaws
              </span>
            </div>
          </div>

          {/* Column 2 (2 cols): Quick Links */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-3.5 rounded-full bg-emerald-500" />
              <h4 className={`text-xs font-mono font-bold uppercase tracking-[.2em] ${isDark ? 'text-white' : 'text-neutral-900'}`}>
                Civic Portals
              </h4>
            </div>
            <ul className="space-y-2.5">
              {QUICK_LINKS.map((l) => (
                <li key={l.to}>
                  <Link
                    to={l.to}
                    onClick={() => sound.play('click')}
                    className={`group text-xs sm:text-sm flex items-center justify-between transition-colors py-0.5 ${
                      l.isPrimary
                        ? 'font-bold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300'
                        : isDark
                        ? 'text-neutral-400 hover:text-white'
                        : 'text-neutral-600 hover:text-neutral-900'
                    }`}
                  >
                    <span>{l.label}</span>
                    <ChevronRight size={13} className="opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all text-emerald-500" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3 (3 cols): Key Ward Offices */}
          <div className="lg:col-span-3 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-3.5 rounded-full bg-teal-500" />
                <h4 className={`text-xs font-mono font-bold uppercase tracking-[.2em] ${isDark ? 'text-white' : 'text-neutral-900'}`}>
                  Key Ward Desks
                </h4>
              </div>
              <Link
                to="/contact"
                onClick={() => sound.play('click')}
                className="text-[11px] font-mono font-semibold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-0.5"
              >
                <span>All 24 Wards</span>
                <ArrowUpRight size={12} />
              </Link>
            </div>

            <div className="space-y-2.5">
              {KEY_WARDS.map((w) => (
                <div
                  key={w.ward}
                  className={`p-2.5 rounded-xl border transition-all ${
                    isDark
                      ? 'bg-neutral-900/40 hover:bg-neutral-900/80 border-white/5 hover:border-white/15'
                      : 'bg-white hover:bg-neutral-50 border-neutral-200/80 hover:border-neutral-300 shadow-2xs'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className={`font-bold ${isDark ? 'text-neutral-200' : 'text-neutral-800'}`}>
                      {w.ward}
                    </span>
                    <a
                      href={`tel:${w.phone}`}
                      onClick={() => sound.play('click')}
                      className="font-mono text-[11px] text-teal-600 dark:text-teal-400 hover:underline flex items-center gap-1 font-semibold"
                    >
                      <Phone size={11} />
                      {w.phone}
                    </a>
                  </div>
                  <span className="text-[10px] text-neutral-500 dark:text-neutral-400 mt-0.5 block truncate">
                    {w.area}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Column 4 (3 cols): Central HQ Contact & Staff Access */}
          <div className="lg:col-span-3 space-y-4">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-3.5 rounded-full bg-sky-500" />
              <h4 className={`text-xs font-mono font-bold uppercase tracking-[.2em] ${isDark ? 'text-white' : 'text-neutral-900'}`}>
                Central Command
              </h4>
            </div>

            <div
              className={`p-3.5 rounded-2xl border space-y-3 text-xs ${
                isDark
                  ? 'bg-neutral-900/40 border-white/10'
                  : 'bg-white border-neutral-200 shadow-xs'
              }`}
            >
              <div className="flex items-start gap-2.5">
                <MapPin size={16} className="shrink-0 text-emerald-500 mt-0.5" />
                <span className={`leading-relaxed ${isDark ? 'text-neutral-300' : 'text-neutral-700'}`}>
                  Municipal Commissioner's Office, Mahapalika Marg, Fort, Mumbai 400001
                </span>
              </div>

              <div className="pt-2 border-t border-neutral-200 dark:border-white/10 space-y-2">
                <a
                  href="mailto:help@kaisarai.bmc.gov.in"
                  className={`flex items-center gap-2 transition-colors ${
                    isDark ? 'text-neutral-400 hover:text-white' : 'text-neutral-600 hover:text-neutral-900'
                  }`}
                >
                  <Mail size={14} className="text-teal-500" />
                  <span>help@kaisarai.bmc.gov.in</span>
                </a>

                <a
                  href="https://portal.mcgm.gov.in"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`flex items-center gap-2 transition-colors ${
                    isDark ? 'text-neutral-400 hover:text-white' : 'text-neutral-600 hover:text-neutral-900'
                  }`}
                >
                  <ExternalLink size={14} className="text-sky-500" />
                  <span>MCGM Official Portal</span>
                </a>
              </div>
            </div>

            {/* Municipal Officer Portal Shortcut Card */}
            <Link
              to="/officer/login"
              onClick={() => sound.play('click')}
              className={`p-3 rounded-2xl border flex items-center justify-between group transition-all cursor-pointer ${
                isDark
                  ? 'bg-gradient-to-r from-emerald-950/40 via-neutral-900 to-teal-950/40 border-emerald-500/30 hover:border-emerald-400/60'
                  : 'bg-gradient-to-r from-emerald-50 via-white to-teal-50 border-emerald-300 hover:border-emerald-500 shadow-xs'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                  <Building2 size={16} />
                </div>
                <div>
                  <span className={`text-xs font-bold block ${isDark ? 'text-white' : 'text-neutral-900'}`}>
                    BMC Municipal Staff Portal
                  </span>
                  <span className="text-[10px] text-neutral-500 dark:text-neutral-400 block">
                    Ward Engineers & Central HQ
                  </span>
                </div>
              </div>
              <ChevronRight size={16} className="text-emerald-500 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

        </div>

        {/* ── 3. Bottom Legal Bar with Safe Floating Button Offset ── */}
        <div
          className={`mt-12 pt-6 border-t flex flex-col md:flex-row items-center justify-between gap-4 font-mono text-[11px] ${
            isDark ? 'border-white/10 text-neutral-500' : 'border-neutral-200 text-neutral-500'
          }`}
        >
          <div className="flex flex-wrap items-center gap-2 text-center md:text-left">
            <span>© 2026 Brihanmumbai Municipal Corporation (BMC).</span>
            <span className="hidden sm:inline">·</span>
            <span>Kaiser AI Sovereign Civic Command.</span>
          </div>

          {/* Right Links with padding to never overlap with the floating Kaiser Sahayak AI assistant */}
          <div className="flex items-center gap-4 text-center md:text-right pr-28 sm:pr-32">
            <Link to="/about" className="hover:underline">About</Link>
            <span>·</span>
            <Link to="/how-it-works" className="hover:underline">Architecture</Link>
            <span>·</span>
            <Link to="/contact" className="hover:underline">Wards</Link>
            <span>·</span>
            <span className="text-[10px] opacity-75">IMD Doppler Telemetry V2</span>
          </div>
        </div>

      </div>
    </footer>
  );
};
