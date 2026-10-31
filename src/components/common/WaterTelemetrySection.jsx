// ─── BMC Monsoon & Water Telemetry Command Center ───────────────────────────
import React, { useState } from 'react';
import {
  Waves, Droplets, CloudRain, AlertTriangle, Shield,
  Activity, Radio, Compass, Wind, ArrowUpRight, Gauge,
  RefreshCw, CheckCircle2, ChevronRight, Phone
} from 'lucide-react';
import { sound } from '../../utils/soundEffects';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';

const WATER_STATIONS = [
  {
    id: 'STN-MITHI-01',
    name: 'Mithi River (BKC Bridge)',
    ward: 'Ward H/E & L',
    waterLevel: 1.42,
    maxSafe: 2.70,
    status: 'NORMAL',
    statusColor: 'text-emerald-700 bg-emerald-100/80 border-emerald-300 dark:text-emerald-400 dark:bg-emerald-500/15 dark:border-emerald-400/30',
    waveColor: 'text-emerald-500/30 dark:text-emerald-400',
    liquidBg: 'from-emerald-400/15 to-teal-500/20 dark:from-emerald-500/30 dark:to-teal-900/40',
    pumps: '6/6 Online (1,800 L/s)',
    dischargeRate: '420 m³/min',
    riskLevel: 'Low',
  },
  {
    id: 'STN-SION-04',
    name: 'Sion Circle Railway Culvert',
    ward: 'Ward F/N (Matunga)',
    waterLevel: 0.48,
    maxSafe: 0.60,
    status: 'ACTIVE PUMPING',
    statusColor: 'text-amber-800 bg-amber-100/80 border-amber-300 dark:text-amber-300 dark:bg-amber-500/15 dark:border-amber-400/30',
    waveColor: 'text-amber-500/30 dark:text-amber-400',
    liquidBg: 'from-amber-400/15 to-orange-500/20 dark:from-amber-500/30 dark:to-orange-900/40',
    pumps: '4/4 Online (1,200 L/s)',
    dischargeRate: '310 m³/min',
    riskLevel: 'Moderate',
  },
  {
    id: 'STN-HIND-02',
    name: 'Hindmata Flyover & Sump',
    ward: 'Ward F/S (Parel)',
    waterLevel: 0.32,
    maxSafe: 0.75,
    status: 'OPTIMAL DRAINAGE',
    statusColor: 'text-emerald-700 bg-emerald-100/80 border-emerald-300 dark:text-emerald-400 dark:bg-emerald-500/15 dark:border-emerald-400/30',
    waveColor: 'text-teal-500/30 dark:text-teal-400',
    liquidBg: 'from-teal-400/15 to-cyan-500/20 dark:from-teal-500/30 dark:to-cyan-900/40',
    pumps: '8/8 Online (2,400 L/s)',
    dischargeRate: '580 m³/min',
    riskLevel: 'Low',
  },
  {
    id: 'STN-ANDH-07',
    name: 'Andheri Subway (SV Road)',
    ward: 'Ward K/W',
    waterLevel: 0.18,
    maxSafe: 0.50,
    status: 'ALL LANES CLEAR',
    statusColor: 'text-sky-800 bg-sky-100/80 border-sky-300 dark:text-sky-300 dark:bg-sky-500/15 dark:border-sky-400/30',
    waveColor: 'text-sky-500/30 dark:text-sky-400',
    liquidBg: 'from-sky-400/15 to-blue-500/20 dark:from-sky-500/30 dark:to-blue-900/40',
    pumps: '4/4 Online (1,000 L/s)',
    dischargeRate: '240 m³/min',
    riskLevel: 'Safe',
  },
  {
    id: 'STN-KURLA-09',
    name: 'Kurla Kamani (LBS Marg)',
    ward: 'Ward L (Kurla West)',
    waterLevel: 0.88,
    maxSafe: 1.05,
    status: 'ELEVATED WATCH',
    statusColor: 'text-rose-800 bg-rose-100/80 border-rose-300 dark:text-rose-300 dark:bg-rose-500/15 dark:border-rose-400/30',
    waveColor: 'text-rose-500/30 dark:text-rose-400',
    liquidBg: 'from-rose-400/15 to-rose-600/20 dark:from-rose-500/30 dark:to-rose-950/40',
    pumps: '6/6 Online (1,500 L/s)',
    dischargeRate: '460 m³/min',
    riskLevel: 'Elevated',
  },
  {
    id: 'STN-MILAN-03',
    name: 'Milan Subway (Santacruz)',
    ward: 'Ward H/W',
    waterLevel: 0.12,
    maxSafe: 0.55,
    status: 'PUMPS STANDBY',
    statusColor: 'text-emerald-700 bg-emerald-100/80 border-emerald-300 dark:text-emerald-400 dark:bg-emerald-500/15 dark:border-emerald-400/30',
    waveColor: 'text-emerald-500/30 dark:text-emerald-400',
    liquidBg: 'from-emerald-400/15 to-teal-500/20 dark:from-emerald-500/30 dark:to-teal-900/40',
    pumps: '3/3 Standby',
    dischargeRate: '0 m³/min',
    riskLevel: 'Safe',
  },
];

export const WaterTelemetrySection = () => {
  const { isDark } = useTheme();
  const { t } = useLanguage();
  const [selectedStation, setSelectedStation] = useState(WATER_STATIONS[0]);
  const [lastSync, setLastSync] = useState('14:24:10 IST');

  const handleRefresh = () => {
    sound.play('click');
    const now = new Date();
    setLastSync(now.toTimeString().split(' ')[0] + ' IST');
  };

  return (
    <section className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-1 sm:pt-2 pb-2 sm:pb-4 select-none">
      
      {/* ── Section Header with Cyber Accent ── */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-neutral-200 dark:border-white/10">
        <div className="space-y-3">
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-teal-500 dark:bg-teal-400 shadow-[0_0_12px_#14b8a6] dark:shadow-[0_0_12px_#2dd4bf] animate-ping" />
            <span className="font-mono text-xs font-bold tracking-[.3em] uppercase text-teal-700 dark:text-teal-300">
              {t('water.badge', 'LIVE BMC HYDROLOGICAL RADAR & WATER TELEMETRY')}
            </span>
          </div>
          <h2 className="font-display text-3xl sm:text-5xl font-extrabold text-neutral-900 dark:text-white tracking-tight">
            {t('water.title1', 'Mumbai Water & Flood')}{' '}
            <span className="bg-gradient-to-r from-teal-600 via-emerald-600 to-sky-600 dark:from-teal-300 dark:via-emerald-400 dark:to-sky-400 bg-clip-text text-transparent">
              {t('water.title2', 'Command Telemetry')}
            </span>
          </h2>
          <p className="text-sm sm:text-base text-neutral-600 dark:text-white/70 max-w-2xl leading-relaxed">
            {t('water.desc', 'Real-time ultrasonic water depth sensors across 24 wards, automated dewatering sump stations, and live Arabian Sea tidal advisories.')}
          </p>
        </div>

        {/* Live Status Pills */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="px-4 py-2 rounded-2xl bg-white dark:bg-neutral-900/80 border border-teal-200 dark:border-teal-500/30 text-xs font-mono text-teal-800 dark:text-teal-300 flex items-center gap-2 shadow-sm dark:shadow-lg backdrop-blur-xl">
            <Waves size={15} className="animate-pulse text-teal-600 dark:text-teal-400" />
            <span className="font-semibold">{t('water.pumpsActive', '64/64 PUMPS ACTIVE')}</span>
          </div>
          <button
            onClick={handleRefresh}
            className="px-4 py-2 rounded-2xl bg-neutral-100 hover:bg-neutral-200 dark:bg-white/5 dark:hover:bg-white/10 border border-neutral-200 dark:border-white/15 text-xs font-mono text-neutral-700 dark:text-white/80 hover:text-neutral-900 dark:hover:text-white flex items-center gap-2 transition-all cursor-pointer shadow-xs"
            title="Refresh hydrological telemetry"
          >
            <RefreshCw size={13} className="text-emerald-600 dark:text-emerald-400" />
            <span className="font-medium">{t('water.sync', 'SYNC:')} {lastSync}</span>
          </button>
        </div>
      </div>

      {/* ── Main Telemetry Grid ── */}
      <div className="grid lg:grid-cols-12 gap-8 pt-8">
        
        {/* Left Column (8 cols): Water Sensor Station Cards */}
        <div className="lg:col-span-8 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="font-mono text-xs font-bold tracking-[.25em] text-neutral-600 dark:text-white/70 uppercase flex items-center gap-2">
              <Gauge size={14} className="text-teal-600 dark:text-teal-400" />
              {t('water.sensorsHotspots', `ULTRASONIC FLOOD SENSORS (${WATER_STATIONS.length} MONITORED HOTSPOTS)`)}
            </h3>
            <span className="text-xs font-mono text-emerald-700 dark:text-emerald-400/90 font-semibold">{t('water.allReporting', 'ALL STATIONS REPORTING')}</span>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            {WATER_STATIONS.map((station) => {
              const isSelected = selectedStation.id === station.id;
              const fillPct = Math.min(Math.round((station.waterLevel / station.maxSafe) * 100), 100);

              return (
                <div
                  key={station.id}
                  onClick={() => {
                    sound.play('pop');
                    setSelectedStation(station);
                  }}
                  className={`group relative rounded-3xl p-5 border transition-all cursor-pointer overflow-hidden backdrop-blur-xl ${
                    isSelected
                      ? 'bg-white dark:bg-neutral-900/90 border-teal-500 dark:border-teal-400/60 shadow-md dark:shadow-[0_0_30px_rgba(45,212,191,0.2)] ring-2 ring-teal-500/20'
                      : 'bg-white/80 dark:bg-neutral-900/60 border-neutral-200 dark:border-white/10 hover:border-teal-300 dark:hover:border-white/25 hover:bg-white dark:hover:bg-neutral-900/75 shadow-xs'
                  }`}
                >
                  {/* Water fill level background inside card */}
                  <div
                    className={`absolute bottom-0 inset-x-0 bg-gradient-to-t ${station.liquidBg} pointer-events-none transition-all duration-700`}
                    style={{ height: `${fillPct}%`, opacity: 0.7 }}
                  />

                  {/* Water Wave Line on card bottom */}
                  <div className="absolute bottom-0 left-0 w-[200%] h-8 opacity-25 animate-water-wave pointer-events-none">
                    <svg viewBox="0 0 600 60" preserveAspectRatio="none" className={`w-full h-full fill-current ${station.waveColor}`}>
                      <path d="M0,20 C150,50 350,-10 500,30 L600,60 L0,60 Z" />
                    </svg>
                  </div>

                  {/* Header Row */}
                  <div className="relative z-10 flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[10px] font-mono tracking-wider text-neutral-500 dark:text-white/50 block font-medium">
                        {station.id} · {station.ward}
                      </span>
                      <h4 className="text-base font-bold text-neutral-900 dark:text-white group-hover:text-teal-600 dark:group-hover:text-teal-300 transition-colors pt-0.5">
                        {t(`water.station.${station.id}.name`, station.name)}
                      </h4>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold border tracking-wider shrink-0 ${station.statusColor}`}>
                      {t(`water.status.${station.status}`, station.status)}
                    </span>
                  </div>

                  {/* Big Water Depth Gauge Display */}
                  <div className="relative z-10 my-4 flex items-baseline gap-2">
                    <span className="font-mono text-3xl font-extrabold text-neutral-900 dark:text-white tracking-tight">
                      {station.waterLevel.toFixed(2)}
                    </span>
                    <span className="text-xs font-mono text-neutral-600 dark:text-white/60 font-semibold">{t('water.metersDepth', 'meters depth')}</span>
                    <span className="text-xs font-mono text-neutral-500 dark:text-white/40 ml-auto">
                      {t('water.cap', 'Cap:')} {fillPct}% ({station.maxSafe}{t('water.mMax', 'm max')})
                    </span>
                  </div>

                  {/* Animated Progress Bar */}
                  <div className="relative z-10 w-full h-2 bg-neutral-200 dark:bg-white/10 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-1000 ${
                        fillPct > 80
                          ? 'bg-rose-500 shadow-[0_0_8px_#f43f5e]'
                          : fillPct > 55
                          ? 'bg-amber-400 shadow-[0_0_8px_#fbbf24]'
                          : 'bg-emerald-500 dark:bg-emerald-400 shadow-[0_0_8px_#34d399]'
                      }`}
                      style={{ width: `${fillPct}%` }}
                    />
                  </div>

                  {/* Pump & Flow Telemetry Footer */}
                  <div className="relative z-10 mt-3.5 pt-3 border-t border-neutral-200 dark:border-white/10 flex items-center justify-between text-[11px] font-mono text-neutral-600 dark:text-white/60">
                    <span className="flex items-center gap-1.5 font-medium">
                      <Droplets size={12} className="text-teal-600 dark:text-teal-400" />
                      {station.pumps}
                    </span>
                    <span className="text-neutral-800 dark:text-white/80 font-bold">{station.dischargeRate}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Quick Disaster Management Action Strip */}
          <div className="rounded-3xl bg-white dark:bg-neutral-900/70 border border-neutral-200 dark:border-white/15 p-5 flex flex-col sm:flex-row items-center justify-between gap-4 backdrop-blur-xl shadow-sm dark:shadow-none">
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-2xl bg-rose-100 dark:bg-rose-500/20 border border-rose-200 dark:border-rose-500/30 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
                <AlertTriangle size={20} className="animate-bounce" />
              </div>
              <div>
                <h5 className="text-sm font-bold text-neutral-900 dark:text-white">{t('water.spottedAlert', 'Spotted Unreported Waterlogging or Open Manhole?')}</h5>
                <p className="text-xs text-neutral-600 dark:text-white/60">{t('water.spottedDesc', 'Report with photo for instant 12-hour high-priority monsoon dispatch.')}</p>
              </div>
            </div>
            <a
              href="/app/report"
              onClick={() => sound.play('click')}
              className="px-5 py-2.5 rounded-full bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 dark:from-teal-400 dark:to-emerald-400 text-white dark:text-neutral-950 font-black text-xs tracking-wider uppercase flex items-center gap-2 hover:scale-105 active:scale-95 transition-all shadow-md shrink-0 cursor-pointer"
            >
              <span>{t('water.reportBtn', 'Report Water Hazard')}</span>
              <ArrowUpRight size={14} />
            </a>
          </div>
        </div>

        {/* Right Column (4 cols): Santacruz Doppler Radar & Arabian Sea Tidal Clock */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* ── Card 1: Santacruz Doppler Radar ── */}
          <div className="rounded-3xl bg-white dark:bg-neutral-900/80 border border-neutral-200 dark:border-white/15 p-5 backdrop-blur-2xl shadow-sm dark:shadow-xl relative overflow-hidden group">
            {/* Top Glow */}
            <div className="absolute -top-12 -right-12 w-36 h-36 bg-teal-500/10 dark:bg-teal-500/20 rounded-full blur-2xl pointer-events-none" />

            <div className="flex items-center justify-between pb-3 border-b border-neutral-200 dark:border-white/10 text-xs font-mono">
              <span className="font-bold text-neutral-900 dark:text-white flex items-center gap-2">
                <Radio size={14} className="text-emerald-600 dark:text-emerald-400 animate-pulse" />
                {t('water.radarTitle', 'SANTACRUZ DOPPLER RADAR')}
              </span>
              <span className="text-[10px] text-emerald-800 bg-emerald-100 border border-emerald-300 dark:text-emerald-400 dark:bg-emerald-500/15 dark:border-emerald-400/30 px-2 py-0.5 rounded-full font-bold">
                SCANNING
              </span>
            </div>

            {/* Simulated High-Tech Rotating Radar Screen */}
            <div className="relative w-full aspect-square max-w-[260px] mx-auto my-4 rounded-full border-2 border-teal-500/40 bg-slate-950 flex items-center justify-center overflow-hidden shadow-inner">
              
              {/* Concentric Range Rings */}
              <div className="absolute inset-4 rounded-full border border-teal-500/20 pointer-events-none" />
              <div className="absolute inset-12 rounded-full border border-teal-500/20 pointer-events-none" />
              <div className="absolute inset-20 rounded-full border border-teal-500/25 pointer-events-none" />

              {/* Crosshair Axes */}
              <div className="absolute inset-x-0 top-1/2 h-px bg-teal-500/20" />
              <div className="absolute inset-y-0 left-1/2 w-px bg-teal-500/20" />

              {/* 360-Degree Rotating Radar Sweep Beam */}
              <div className="absolute inset-0 animate-radar-sweep pointer-events-none">
                <div
                  className="w-1/2 h-1/2 origin-bottom-right"
                  style={{
                    background: 'conic-gradient(from 180deg at 100% 100%, rgba(45,212,191,0.45) 0deg, transparent 65deg)',
                  }}
                />
              </div>

              {/* Storm Cell Radar Blips (Simulated Mumbai Coastline) */}
              <div className="absolute top-1/3 left-1/3 w-3 h-3 rounded-full bg-emerald-400/70 blur-xs animate-ping" />
              <div className="absolute top-1/2 right-1/4 w-4 h-4 rounded-full bg-amber-400/80 blur-xs" />
              <div className="absolute bottom-1/3 left-1/2 w-2.5 h-2.5 rounded-full bg-rose-400/80 blur-xs" />

              {/* Center Radar Node */}
              <div className="w-2.5 h-2.5 rounded-full bg-teal-300 shadow-[0_0_10px_#2dd4bf] relative z-10" />
              <span className="absolute bottom-2 text-[9px] font-mono text-teal-400/80 font-bold">{t('water.radarRange', 'RANGE 50 KM')}</span>
            </div>

            {/* Radar Telemetry Specs */}
            <div className="space-y-2 pt-2 border-t border-neutral-200 dark:border-white/10 text-[11px] font-mono">
              <div className="flex justify-between text-neutral-600 dark:text-white/70">
                <span>{t('water.rainfallIntensity', 'Rainfall Intensity:')}</span>
                <span className="text-teal-700 dark:text-teal-300 font-bold">{t('water.heavyRain', '38.4 mm/hr (Heavy)')}</span>
              </div>
              <div className="flex justify-between text-neutral-600 dark:text-white/70">
                <span>{t('water.windSpeed', 'Wind Speed / Direction:')}</span>
                <span className="text-neutral-900 dark:text-white font-semibold">24 km/h · WSW</span>
              </div>
              <div className="flex justify-between text-neutral-600 dark:text-white/70">
                <span>{t('water.stormAdvisory', 'IMD Storm Advisory:')}</span>
                <span className="text-amber-700 dark:text-amber-300 font-bold">{t('water.yellowWatch', 'YELLOW WATCH')}</span>
              </div>
            </div>
          </div>

          {/* ── Card 2: Arabian Sea High Tide Clock ── */}
          <div className="rounded-3xl bg-white dark:bg-neutral-900/80 border border-neutral-200 dark:border-white/15 p-5 backdrop-blur-2xl shadow-sm dark:shadow-xl relative overflow-hidden">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-200 dark:border-white/10 text-xs font-mono">
              <span className="font-bold text-neutral-900 dark:text-white flex items-center gap-2">
                <Compass size={14} className="text-sky-600 dark:text-sky-400" />
                {t('water.tidalClock', 'ARABIAN SEA TIDAL CLOCK')}
              </span>
              <span className="text-[10px] text-sky-800 bg-sky-100 border border-sky-300 dark:text-sky-400 dark:bg-sky-500/15 dark:border-sky-400/30 px-2 py-0.5 rounded-full font-bold">
                {t('water.liveImdLink', 'LIVE IMD LINK')}
              </span>
            </div>

            {/* Big Tide Indicator */}
            <div className="my-4 text-center space-y-1">
              <span className="text-xs font-mono text-neutral-500 dark:text-white/50 uppercase tracking-widest block font-medium">{t('water.nextPeak', 'Next Predicted Peak')}</span>
              <div className="font-mono text-4xl font-black text-sky-700 dark:text-sky-300 tracking-tight flex items-baseline justify-center gap-1.5">
                4.22 <span className="text-base text-neutral-600 dark:text-white/70 font-semibold">{t('water.meters', 'meters')}</span>
              </div>
              <p className="text-xs font-mono text-amber-700 dark:text-amber-300 font-bold">{t('water.highTideAt', 'HIGH TIDE at 14:15 hrs IST')}</p>
            </div>

            {/* Interactive Tide Sine Wave Curve */}
            <div className="w-full h-16 bg-sky-50 dark:bg-neutral-950/70 rounded-2xl border border-sky-200 dark:border-white/10 p-2 relative overflow-hidden flex items-end">
              <svg viewBox="0 0 300 50" preserveAspectRatio="none" className="w-full h-full text-sky-500 dark:text-sky-400 fill-none stroke-current stroke-2">
                <path d="M0,35 Q75,-5 150,30 T300,10" />
              </svg>
              {/* Current time marker on wave */}
              <div className="absolute top-2 left-[58%] -translate-x-1/2 flex flex-col items-center">
                <span className="w-2.5 h-2.5 rounded-full bg-sky-500 dark:bg-sky-300 shadow-[0_0_10px_#0284c7] dark:shadow-[0_0_10px_#38bdf8] animate-ping" />
                <span className="text-[8px] font-mono text-sky-700 dark:text-sky-300 font-bold mt-0.5">{t('water.now', 'NOW')}</span>
              </div>
            </div>

            {/* Promenade Safety Advisory */}
            <div className="mt-4 pt-3 border-t border-neutral-200 dark:border-white/10 space-y-2 text-[11px]">
              <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 text-amber-900 dark:text-amber-200">
                <p className="font-semibold text-[11px] leading-tight">
                  {t('water.promenadeWarning', 'Marine Drive, Bandra Bandstand & Worli Sea Face: Heavy wave action expected. Citizens advised to remain behind safety barriers.')}
                </p>
              </div>
              <div className="flex items-center justify-between font-mono text-[10px] text-neutral-500 dark:text-white/50 pt-1">
                <span>{t('water.disasterCentral', 'BMC Disaster Central:')}</span>
                <a href="tel:1916" className="text-emerald-700 dark:text-emerald-400 font-bold hover:underline flex items-center gap-1">
                  <Phone size={10} />
                  {t('water.tollFree', '1916 (Toll-Free)')}
                </a>
              </div>
            </div>
          </div>

        </div>

      </div>

    </section>
  );
};
