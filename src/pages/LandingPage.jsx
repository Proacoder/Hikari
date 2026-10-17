import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  AlertTriangle, MapPin, Search,
  Activity, CloudRain, ChevronRight, Phone,
  ArrowRight, Shield, CheckCircle2, RefreshCw
} from 'lucide-react';
import { getComplaints } from '../api/complaints.api';
import { getDashboardStats } from '../api/analytics.api';
import { getWeatherAQI } from '../api/weather.api';
import { MUMBAI_WARDS, CATEGORIES } from '../utils/mockData';
import { useLanguage } from '../context/LanguageContext';
import { CategoryIcon, SeverityBadge, StatusBadge } from '../components/complaints/ComplaintComponents';
import { Card } from '../components/common/Card';
import { formatRelative } from '../utils/formatters';
import { sound } from '../utils/soundEffects';

export const LandingPage = () => {
  const { t, translateCategory } = useLanguage();
  const [complaints, setComplaints] = useState([]);
  const [cityStats, setCityStats] = useState(null);
  const [weatherData, setWeatherData] = useState(null);
  const [selectedWard, setSelectedWard] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const [complaintsRes, statsRes, weatherRes] = await Promise.all([
          getComplaints(selectedWard ? { ward: Number(selectedWard) } : {}),
          getDashboardStats(),
          getWeatherAQI(19.076, 72.877)
        ]);
        setComplaints(complaintsRes.data || []);
        setCityStats(statsRes.data || null);
        setWeatherData(weatherRes.data || null);
      } catch (err) {
        console.error('Failed to load landing data:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [selectedWard]);

  const filteredComplaints = complaints.filter((item) => {
    const matchesCategory = selectedCategory === 'ALL' || item.category === selectedCategory;
    if (!matchesCategory) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        item.title?.toLowerCase().includes(q) ||
        item.description?.toLowerCase().includes(q) ||
        item.category?.toLowerCase().includes(q) ||
        String(item.ward).includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-12 sm:space-y-16 pb-20 overflow-hidden relative">
      {/* ── Background Ambient Glowing Orbs ─────────────────────────────────── */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[550px] pointer-events-none overflow-hidden -z-10">
        <div className="absolute -top-32 left-1/4 w-[500px] h-[500px] bg-gradient-to-tr from-emerald-400/15 via-teal-300/10 to-transparent rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-10 right-10 w-[450px] h-[450px] bg-gradient-to-bl from-sky-400/15 via-indigo-300/10 to-transparent rounded-full blur-3xl" />
      </div>

      {/* ── Weather & Air Quality Intelligence Bar ─────────────────────────── */}
      {weatherData && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-3">
          <div className="bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-sky-500/10 border border-amber-500/20 rounded-2xl p-3 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-700 flex items-center justify-center shrink-0">
                <CloudRain size={16} />
              </div>
              <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                <span className="font-bold text-neutral-900">BMC IMD Telemetry:</span>
                <span className="text-neutral-700">Air Quality Index {weatherData.aqi} ({weatherData.aqiCategory})</span>
                <span className="text-neutral-400 hidden sm:inline">·</span>
                <span className="text-neutral-700">{weatherData.temperature}°C {weatherData.condition}</span>
                <span className="text-neutral-400 hidden sm:inline">·</span>
                <span className="text-neutral-500">Santacruz Doppler Active</span>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-[10px] font-mono font-bold bg-amber-100 text-amber-800 border border-amber-300/60 px-2 py-0.5 rounded-full">
                SANTACRUZ RADAR LIVE
              </span>
              <Link to="/app/map" className="text-brand-700 hover:text-brand-800 font-semibold text-xs flex items-center gap-0.5">
                Flood Sensors <ChevronRight size={13} />
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* ── Hero Section ────────────────────────────────────────────────────── */}
      <section className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-10">
        <div className="grid lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          
          {/* Left Hero Copy */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-50 border border-brand-200/80 text-brand-800 text-xs font-semibold tracking-wide shadow-xs">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-500 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-600"></span>
              </span>
              <span>{t('hero.badge', 'AI-Powered Municipal Governance for Mumbai')}</span>
            </div>
            
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-neutral-900 tracking-tight leading-[1.12]">
              {t('hero.title1', 'Empowering Citizens.')}<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-600 via-emerald-600 to-sky-600">
                {t('hero.title2', 'Accelerating Resolution.')}
              </span>
            </h1>
            
            <p className="text-base sm:text-lg text-neutral-600 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
              {t('hero.description', 'Kaiser AI automatically categorizes, prioritizes, and routes civic grievances directly to municipal ward officers across Mumbai’s 26 administrative zones.')}
            </p>
            
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3.5 pt-2">
              <Link to="/app/report">
                <button
                  onClick={() => sound.play('click')}
                  className="px-6 py-3.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl font-bold text-sm shadow-brand hover:shadow-brand-lg transition-all duration-200 flex items-center gap-2 cursor-pointer active:scale-95"
                >
                  <AlertTriangle size={17} />
                  <span>{t('hero.reportBtn', 'Report Civic Grievance')}</span>
                  <ArrowRight size={15} />
                </button>
              </Link>
              <Link to="/app/map">
                <button
                  onClick={() => sound.play('click')}
                  className="px-6 py-3.5 bg-white hover:bg-neutral-50 text-neutral-800 border border-neutral-200/90 hover:border-neutral-300 rounded-xl font-bold text-sm shadow-xs transition-all duration-200 flex items-center gap-2 cursor-pointer active:scale-95"
                >
                  <MapPin size={17} className="text-sky-600" />
                  <span>{t('hero.mapBtn', 'Live Mumbai GIS Map')}</span>
                </button>
              </Link>
            </div>

            {/* Quick Stats Grid */}
            <div className="pt-6 grid grid-cols-3 gap-4 border-t border-neutral-200/80">
              <div className="bg-white/80 backdrop-blur-sm p-3.5 rounded-2xl border border-neutral-200/60 shadow-xs">
                <div className="text-xl sm:text-2xl font-black text-neutral-900 font-mono">
                  {cityStats?.totalComplaints ? cityStats.totalComplaints.toLocaleString() : '14,827'}
                </div>
                <div className="text-[11px] text-neutral-500 font-semibold mt-0.5">{t('hero.statReported', 'Issues Reported')}</div>
              </div>
              <div className="bg-white/80 backdrop-blur-sm p-3.5 rounded-2xl border border-neutral-200/60 shadow-xs">
                <div className="text-xl sm:text-2xl font-black text-emerald-600 font-mono">
                  {cityStats?.resolvedRate ? `${cityStats.resolvedRate}%` : '91.4%'}
                </div>
                <div className="text-[11px] text-neutral-500 font-semibold mt-0.5">{t('hero.statResolved', 'Resolution Rate')}</div>
              </div>
              <div className="bg-white/80 backdrop-blur-sm p-3.5 rounded-2xl border border-neutral-200/60 shadow-xs">
                <div className="text-xl sm:text-2xl font-black text-sky-600 font-mono">
                  {cityStats?.avgResolutionDays ? `${(cityStats.avgResolutionDays * 24).toFixed(1)}h` : '18.4h'}
                </div>
                <div className="text-[11px] text-neutral-500 font-semibold mt-0.5">{t('hero.statTime', 'Avg Resolution SLA')}</div>
              </div>
            </div>
          </div>

          {/* Right Hero Interactive AI Terminal Preview */}
          <div className="lg:col-span-5">
            <div className="bg-white/95 backdrop-blur-xl rounded-3xl p-6 border border-neutral-200 shadow-soft-xl relative overflow-hidden group">
              {/* Header Status Bar */}
              <div className="flex items-center justify-between pb-4 border-b border-neutral-100">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center">
                    <Activity className="animate-pulse" size={17} />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-neutral-900">AI Triage & CV Engine</span>
                    <div className="text-[10px] text-neutral-400 font-mono">YOLOv8-Municipal v3.2</div>
                  </div>
                </div>
                <span className="text-[10px] font-mono font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-1 rounded-full">
                  LIVE MODEL ONLINE
                </span>
              </div>

              {/* Holographic Simulation Box */}
              <div className="mt-4 space-y-3">
                <div className="relative rounded-2xl overflow-hidden border border-neutral-200 bg-neutral-900 h-44 group-hover:shadow-md transition-shadow">
                  <img
                    src="https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=800&auto=format&fit=crop&q=80"
                    alt="Road inspection"
                    className="w-full h-full object-cover opacity-85"
                  />
                  {/* Scanning Laser Beam */}
                  <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_12px_#34d399] animate-laser-scan pointer-events-none" />

                  {/* Detected Bounding Box HUD */}
                  <div className="absolute top-10 left-12 right-14 bottom-10 border-2 border-emerald-400/90 rounded-lg pointer-events-none">
                    <span className="absolute -top-3 left-2 bg-emerald-500 text-neutral-950 font-mono text-[9px] font-bold px-1.5 py-0.5 rounded shadow">
                      POTHOLE · 98.4%
                    </span>
                    <span className="absolute -bottom-3 right-2 bg-red-600 text-white font-mono text-[9px] font-bold px-1.5 py-0.5 rounded shadow">
                      SEVERITY 85/100
                    </span>
                  </div>

                  {/* Telemetry pill */}
                  <div className="absolute bottom-2 left-2 bg-black/75 backdrop-blur-sm text-neutral-300 font-mono text-[10px] px-2 py-0.5 rounded-md flex items-center gap-1.5">
                    <MapPin size={11} className="text-sky-400" />
                    <span>GPS: 19.1136° N, 72.8697° E</span>
                  </div>
                </div>

                {/* Smart Dispatch Routing Ticket */}
                <div className="bg-neutral-50 rounded-2xl p-3.5 border border-neutral-200/80 text-xs space-y-2">
                  <div className="flex items-center justify-between text-neutral-500 font-mono text-[11px]">
                    <span>DISPATCH TARGET</span>
                    <span className="text-emerald-700 font-bold">AUTO-ASSIGNED</span>
                  </div>
                  <div className="flex items-center gap-2 font-bold text-neutral-900">
                    <Shield size={15} className="text-brand-600" />
                    <span>K/E Ward Assistant Engineer (Roads)</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-neutral-500 pt-1 border-t border-neutral-200/60">
                    <span>SLA Turnaround: <strong className="text-neutral-800">24 Hours</strong></span>
                    <span>Ward #8 · Andheri East</span>
                  </div>
                </div>
              </div>

              {/* Bottom Quick Test Action */}
              <div className="mt-4 pt-3.5 border-t border-neutral-100 flex items-center justify-between text-xs">
                <span className="text-neutral-500">Multilingual Voice & Photo Triage</span>
                <Link to="/app/report" className="text-brand-700 hover:text-brand-800 font-bold flex items-center gap-1 hover:underline">
                  Launch Interactive Report <ChevronRight size={14} />
                </Link>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* ── Live Ward Complaints Feed ───────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-neutral-500">
                MUNICIPAL TELEMETRY STREAM
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 tracking-tight">
              {t('hero.liveTickerTitle', 'Live Mumbai Ward Issue Ticker')}
            </h2>
            <p className="text-xs sm:text-sm text-neutral-500">
              {t('hero.liveTickerSubtitle', 'Real-time civic grievances submitted across Mumbai municipal wards.')}
            </p>
          </div>

          {/* Search & Ward Selector */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={15} />
              <input
                type="text"
                placeholder={t('hero.searchPlaceholder', 'Search issues or ward...')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-3 py-2 bg-white border border-neutral-200 rounded-xl text-xs text-neutral-800 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 shadow-xs"
              />
            </div>
            <select
              value={selectedWard}
              onChange={(e) => {
                sound.play('click');
                setSelectedWard(e.target.value);
              }}
              className="py-2 px-3 bg-white border border-neutral-200 rounded-xl text-xs font-semibold text-neutral-700 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 shadow-xs cursor-pointer"
            >
              <option value="">{t('hero.allWards', 'All Mumbai Wards (26)')}</option>
              {MUMBAI_WARDS.map((w) => (
                <option key={w.id} value={w.id}>
                  Ward {w.name} ({w.area})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Category Chips Bar */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none mb-6">
          <button
            onClick={() => {
              sound.play('click');
              setSelectedCategory('ALL');
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all shrink-0 cursor-pointer ${
              selectedCategory === 'ALL'
                ? 'bg-neutral-900 text-white shadow-xs'
                : 'bg-white text-neutral-600 border border-neutral-200 hover:bg-neutral-50'
            }`}
          >
            All Categories
          </button>
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => {
                sound.play('click');
                setSelectedCategory(cat);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all shrink-0 flex items-center gap-1.5 cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-brand-600 text-white shadow-xs'
                  : 'bg-white text-neutral-600 border border-neutral-200 hover:bg-neutral-50'
              }`}
            >
              <span>{cat}</span>
            </button>
          ))}
        </div>

        {/* Complaints Grid */}
        {loading ? (
          <div className="py-16 text-center text-neutral-400 flex flex-col items-center gap-3">
            <RefreshCw className="animate-spin text-brand-600" size={28} />
            <p className="text-xs font-medium">Synchronizing ward grievances...</p>
          </div>
        ) : filteredComplaints.length === 0 ? (
          <div className="bg-white rounded-3xl border border-neutral-200 p-12 text-center text-neutral-500 space-y-3">
            <CheckCircle2 size={36} className="mx-auto text-emerald-500" />
            <h3 className="font-bold text-neutral-900 text-base">No active issues found</h3>
            <p className="text-xs text-neutral-500 max-w-sm mx-auto">
              No civic tickets matched your filter criteria. Try choosing a different ward or category.
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredComplaints.slice(0, 9).map((item) => (
              <Link key={item.id} to={`/app/complaint/${item.id}`} className="group block">
                <Card hover className="p-5 h-full flex flex-col justify-between border-neutral-200/90 group-hover:border-brand-400/80 transition-all duration-200 shadow-xs group-hover:shadow-md">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <CategoryIcon category={item.category} size="sm" />
                        <span className="text-xs font-bold text-neutral-800 uppercase tracking-wide">
                          {translateCategory(item.category)}
                        </span>
                      </div>
                      <StatusBadge status={item.status} />
                    </div>
                    <h3 className="font-bold text-neutral-900 text-sm line-clamp-1 group-hover:text-brand-700 transition-colors">
                      {item.title}
                    </h3>
                    <p className="text-xs text-neutral-600 mt-1.5 line-clamp-2 leading-relaxed">
                      {item.description}
                    </p>
                  </div>

                  <div className="pt-4 mt-4 border-t border-neutral-100 space-y-2.5">
                    <div className="flex items-center justify-between text-xs text-neutral-500">
                      <span className="flex items-center gap-1.5 font-medium">
                        <MapPin size={13} className="text-sky-600" />
                        Ward #{item.ward}
                      </span>
                      <SeverityBadge level={item.severity} />
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-neutral-400 font-mono">
                      <span>#{item.id}</span>
                      <span>{formatRelative(item.createdAt)}</span>
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* ── Emergency Response Helpline Section ────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-neutral-950 via-neutral-900 to-neutral-950 text-white rounded-3xl p-6 sm:p-10 border border-neutral-800 shadow-2xl flex flex-col lg:flex-row items-center justify-between gap-8 relative overflow-hidden">
          <div className="space-y-3 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/20 border border-red-500/30 text-red-400 font-mono text-[10px] font-bold uppercase tracking-wider">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-ping inline-block" />
              24/7 BMC RAPID RESPONSE PROTOCOL
            </div>
            <h3 className="text-2xl sm:text-3xl font-black tracking-tight">
              {t('hero.emergencyTitle', 'Mumbai Municipal Disaster & Emergency Cell')}
            </h3>
            <p className="text-xs sm:text-sm text-neutral-400 max-w-xl leading-relaxed">
              For high-water flooding, building subsidence, mains burst, or live wire emergencies requiring immediate on-ground rescue dispatch.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 shrink-0">
            <a
              href="tel:1916"
              className="bg-red-600 hover:bg-red-700 text-white px-5 py-3 rounded-xl font-bold text-sm shadow-lg shadow-red-600/30 flex items-center gap-2 transition-all cursor-pointer active:scale-95"
            >
              <Phone size={16} />
              <span>Dial BMC Disaster 1916</span>
            </a>
            <a
              href="tel:108"
              className="bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-neutral-700 px-4 py-3 rounded-xl font-bold text-sm transition-all cursor-pointer active:scale-95"
            >
              Medical / Ambulance 108
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};
