import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Shield, AlertTriangle, ArrowRight, CheckCircle2, MapPin, Search, Sparkles,
  TrendingUp, Users, Clock, Filter, Eye, ThumbsUp, Activity, BarChart3, CloudRain, ChevronRight, Phone
} from 'lucide-react';
import { getComplaints } from '../api/complaints.api';
import { getDashboardStats } from '../api/analytics.api';
import { getWeatherAQI } from '../api/weather.api';
import { MUMBAI_WARDS } from '../utils/mockData';
import { useLanguage } from '../context/LanguageContext';
import { CategoryIcon, SeverityBadge, StatusBadge } from '../components/complaints/ComplaintComponents';
import { Button } from '../components/common/Button';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { formatRelative } from '../utils/formatters';

export const LandingPage = () => {
  const { t, translateCategory, translateStatus } = useLanguage();
  const [complaints, setComplaints] = useState([]);
  const [cityStats, setCityStats] = useState(null);
  const [weatherData, setWeatherData] = useState(null);
  const [selectedWard, setSelectedWard] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    async function fetchData() {
      try {
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
      }
    }
    fetchData();
  }, [selectedWard]);

  const filteredComplaints = complaints.filter((item) => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        item.title?.toLowerCase().includes(q) ||
        item.description?.toLowerCase().includes(q) ||
        item.category?.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-12 pb-16">
      {/* ── Weather Warning Banner ───────────────────────────────────────────── */}
      {weatherData && (
        <div className="bg-amber-500/10 border-b border-amber-500/20 px-4 py-2.5 text-amber-900 text-xs sm:text-sm font-medium flex items-center justify-between">
          <div className="max-w-7xl mx-auto w-full flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <CloudRain className="text-amber-600 shrink-0" size={18} />
              <span>
                <strong>BMC Advisory:</strong> Air Quality Index: {weatherData.aqi} ({weatherData.aqiCategory}) – {weatherData.temperature}°C {weatherData.condition}
              </span>
            </div>
            <span className="hidden md:inline-block text-xs bg-amber-200/60 text-amber-800 px-2 py-0.5 rounded-full font-semibold">
              Live Weather Feed
            </span>
          </div>
        </div>
      )}

      {/* ── Hero Section ────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden pt-8 pb-12 lg:pt-16 lg:pb-20 bg-gradient-to-b from-brand-50/50 via-white to-neutral-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Copy */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-100/70 text-brand-800 text-xs font-semibold tracking-wide">
                <Sparkles size={14} className="text-brand-600" />
                <span>{t('hero.badge', 'AI-Powered Municipal Governance for Mumbai')}</span>
              </div>
              
              <h1 className="text-3xl sm:text-5xl font-extrabold text-neutral-900 tracking-tight leading-tight">
                {t('hero.title1', 'Empowering Citizens.')}<br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-700 via-brand-600 to-sky-600">
                  {t('hero.title2', 'Accelerating Resolution.')}
                </span>
              </h1>
              
              <p className="text-base sm:text-lg text-neutral-600 max-w-2xl leading-relaxed">
                {t('hero.description', 'Kaiser AI automatically categorizes, prioritizes, and routes civic grievances directly to municipal ward officers across Mumbai’s 26 administrative zones.')}
              </p>
              
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <Link to="/app/report">
                  <Button variant="primary" size="lg" icon={AlertTriangle}>
                    {t('hero.reportBtn', 'Report an Issue')}
                  </Button>
                </Link>
                <Link to="/app/map">
                  <Button variant="outline" size="lg" icon={MapPin}>
                    {t('hero.mapBtn', 'View Live Ward Map')}
                  </Button>
                </Link>
              </div>

              {/* Quick stats counter pill */}
              <div className="pt-4 grid grid-cols-3 gap-4 border-t border-neutral-200/80">
                <div>
                  <div className="text-xl sm:text-2xl font-bold text-neutral-900">
                    {cityStats?.totalComplaints ? cityStats.totalComplaints.toLocaleString() : '14,827'}
                  </div>
                  <div className="text-xs text-neutral-500 font-medium">{t('hero.statReported', 'Issues Reported')}</div>
                </div>
                <div>
                  <div className="text-xl sm:text-2xl font-bold text-emerald-600">
                    {cityStats?.resolvedRate ? `${cityStats.resolvedRate}%` : '91.4%'}
                  </div>
                  <div className="text-xs text-neutral-500 font-medium">{t('hero.statResolved', 'Resolution Rate')}</div>
                </div>
                <div>
                  <div className="text-xl sm:text-2xl font-bold text-sky-600">
                    {cityStats?.avgResolutionDays ? `${(cityStats.avgResolutionDays * 24).toFixed(1)}h` : '18.4h'}
                  </div>
                  <div className="text-xs text-neutral-500 font-medium">{t('hero.statTime', 'Avg Resolution Time')}</div>
                </div>
              </div>
            </div>

            {/* Right Card Preview */}
            <div className="lg:col-span-5">
              <Card variant="glass" className="p-6 relative overflow-hidden border border-neutral-200/60 shadow-soft-xl">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Activity className="text-brand-600 animate-pulse" size={18} />
                    <span className="text-xs font-semibold text-neutral-700 uppercase tracking-wider">AI Categorization engine</span>
                  </div>
                  <Badge variant="success" size="sm">Active Model v3.2</Badge>
                </div>

                <div className="space-y-3">
                  <div className="p-3.5 bg-white rounded-xl border border-neutral-100 shadow-soft-sm text-xs space-y-2">
                    <div className="flex items-center justify-between text-neutral-400 font-mono text-[11px]">
                      <span>INPUT: CITIZEN PHOTO & VOICE</span>
                      <span>CONFIDENCE: 98.4%</span>
                    </div>
                    <p className="text-neutral-800 font-medium italic">
                      "Severe pothole near WEH Metro station causing traffic congestion..."
                    </p>
                    <div className="pt-2 border-t border-neutral-100 flex items-center justify-between">
                      <span className="font-semibold text-brand-700">Detected: Pothole</span>
                      <span className="bg-red-50 text-red-700 px-2 py-0.5 rounded text-[11px] font-bold">Severity 85/100</span>
                    </div>
                  </div>

                  <div className="p-3 bg-brand-50/60 rounded-xl border border-brand-100 text-xs flex items-center justify-between">
                    <span className="text-neutral-600 font-medium">Routed to:</span>
                    <span className="font-bold text-brand-800">K/E Ward Assistant Engineer (Roads)</span>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-neutral-100 flex items-center justify-between text-xs text-neutral-500">
                  <span>Automated SLA Assignment: 24 Hours</span>
                  <Link to="/auth" className="text-brand-600 font-semibold hover:underline flex items-center gap-1">
                    Try Citizen Portal <ChevronRight size={14} />
                  </Link>
                </div>
              </Card>
            </div>

          </div>
        </div>
      </section>

      {/* ── Live Ward Complaints Feed ───────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-2xl font-bold text-neutral-900">{t('hero.liveTickerTitle', 'Live Ward Issue Ticker')}</h2>
            <p className="text-sm text-neutral-500">{t('hero.liveTickerSubtitle', 'Real-time civic grievances submitted across Mumbai municipal wards.')}</p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={16} />
              <input
                type="text"
                placeholder={t('hero.searchPlaceholder', 'Search issues...')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-3 py-2 bg-white border border-neutral-200 rounded-xl text-xs focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
              />
            </div>
            <select
              value={selectedWard}
              onChange={(e) => setSelectedWard(e.target.value)}
              className="py-2 px-3 bg-white border border-neutral-200 rounded-xl text-xs font-medium text-neutral-700 focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 max-w-[200px]"
            >
              <option value="">{t('hero.allWards', 'All Wards')}</option>
              {MUMBAI_WARDS.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.name} ({w.area})
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredComplaints.map((item) => (
            <Card key={item.id} hover className="p-4 space-y-3 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <CategoryIcon category={item.category} />
                    <span className="text-xs font-semibold text-neutral-700 uppercase tracking-wide">
                      {translateCategory(item.category)}
                    </span>
                  </div>
                  <StatusBadge status={item.status} />
                </div>
                <h3 className="font-semibold text-neutral-900 text-sm line-clamp-1">{item.title}</h3>
                <p className="text-xs text-neutral-600 mt-1 line-clamp-2">{item.description}</p>
              </div>

              <div className="pt-3 border-t border-neutral-100 space-y-2">
                <div className="flex items-center justify-between text-xs text-neutral-500">
                  <span className="flex items-center gap-1"><MapPin size={12} /> Ward #{item.ward}</span>
                  <SeverityBadge level={item.severity} />
                </div>
                <div className="flex items-center justify-between text-[11px] text-neutral-400">
                  <span>ID: {item.id}</span>
                  <span>{formatRelative(item.createdAt)}</span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* ── Emergency Contacts Section ────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-neutral-900 text-white rounded-2xl p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center md:text-left">
            <h3 className="text-xl font-bold flex items-center justify-center md:justify-start gap-2">
              <Phone className="text-red-400" size={20} />
              {t('hero.emergencyTitle', 'Mumbai Municipal Emergency Response')}
            </h3>
            <p className="text-sm text-neutral-400 max-w-xl">
              {t('hero.emergencyDesc', 'For urgent flood, fire, building collapse, or water mains break emergencies requiring immediate response.')}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <a
              href="tel:1916"
              className="bg-red-600 hover:bg-red-700 text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-lg flex items-center gap-2 transition-colors"
            >
              {t('hero.callDisaster', 'Call Disaster Management 1916')}
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};
