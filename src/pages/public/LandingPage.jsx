import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Shield, AlertTriangle, ArrowRight, CheckCircle2, MapPin, Search, Sparkles,
  TrendingUp, Users, Clock, Filter, Eye, ThumbsUp, Activity, BarChart3, CloudRain,
  ChevronRight, Phone, Award, Layers, Zap, Cpu, Bell, CheckCircle
} from 'lucide-react';
import { getComplaints } from '../../api/complaints.api';
import { getDashboardStats } from '../../api/analytics.api';
import { getWeatherAQI } from '../../api/weather.api';
import { CategoryIcon, SeverityBadge, StatusBadge } from '../../components/complaints/ComplaintComponents';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { LeafletMap } from '../../components/map/LeafletMap';
import { formatRelative } from '../../utils/formatters';

export const LandingPage = () => {
  const navigate = useNavigate();
  const [complaints, setComplaints] = useState([]);
  const [cityStats, setCityStats] = useState(null);
  const [weatherData, setWeatherData] = useState(null);
  const [selectedWard, setSelectedWard] = useState('8');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    async function fetchData() {
      try {
        const [complaintsRes, statsRes, weatherRes] = await Promise.all([
          getComplaints({ ward: selectedWard }),
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

  return (
    <div className="space-y-16 pb-20">
      {/* ── Weather Warning Banner ───────────────────────────────────────────── */}
      {weatherData && (
        <div className="bg-amber-50 border-b border-amber-200 px-4 py-2 text-amber-900 text-xs sm:text-sm font-medium flex items-center justify-between">
          <div className="max-w-7xl mx-auto w-full flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <CloudRain className="text-amber-600 shrink-0" size={17} />
              <span>
                <strong>BMC Monsoon Advisory:</strong> Air Quality Index {weatherData.aqi} ({weatherData.condition}) · 31°C · High humidity in coastal wards. Pothole reporting SLAs accelerated.
              </span>
            </div>
            <span className="hidden md:inline-block text-xs bg-amber-100 text-amber-800 px-2.5 py-0.5 rounded-full font-semibold">
              Live Weather Feed
            </span>
          </div>
        </div>
      )}

      {/* ── Hero Section (Stacked Headline & Orange CTA) ────────────────────── */}
      <section className="relative overflow-hidden pt-8 pb-12 lg:pt-14 lg:pb-18 bg-gradient-to-b from-brand-50/60 via-white to-neutral-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-12 gap-10 items-center">
            
            {/* Left Copy Column */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-100 text-brand-800 text-xs font-semibold tracking-wide">
                <Sparkles size={14} className="text-brand-600" />
                <span>AI-Powered Municipal Governance for Greater Mumbai</span>
              </div>
              
              <div className="space-y-1">
                <h1 className="text-4xl sm:text-6xl font-extrabold text-neutral-900 tracking-tight leading-tight">
                  Report It Fast.
                </h1>
                <h1 className="text-4xl sm:text-6xl font-extrabold text-brand-600 tracking-tight leading-tight">
                  Get It Fixed.
                </h1>
              </div>
              
              <p className="text-base sm:text-lg text-neutral-600 max-w-xl leading-relaxed">
                Kaiser AI automatically categorizes, prioritizes, and routes civic grievances directly to municipal ward officers across Mumbai’s 26 administrative zones.
              </p>
              
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <Link to="/app/report">
                  <button className="px-8 py-3.5 rounded-full font-bold text-base text-white bg-accent-600 hover:bg-accent-700 shadow-accent hover:shadow-lg transition-all transform active:scale-95 flex items-center gap-2.5 cursor-pointer">
                    <AlertTriangle size={18} />
                    Report an Issue
                  </button>
                </Link>
                <Link to="/app/map">
                  <button className="px-7 py-3.5 rounded-full font-semibold text-base text-neutral-700 bg-white border border-neutral-300 hover:bg-neutral-50 shadow-soft-sm transition-all flex items-center gap-2 cursor-pointer">
                    <MapPin size={18} className="text-brand-600" />
                    View Live Ward Map
                  </button>
                </Link>
              </div>

              {/* Citizen trust endorsement */}
              <div className="pt-2 flex items-center gap-4 text-xs text-neutral-500">
                <div className="flex -space-x-2">
                  <div className="w-8 h-8 rounded-full bg-brand-200 border-2 border-white flex items-center justify-center font-bold text-brand-800 text-[11px]">PN</div>
                  <div className="w-8 h-8 rounded-full bg-sky-200 border-2 border-white flex items-center justify-center font-bold text-sky-800 text-[11px]">AS</div>
                  <div className="w-8 h-8 rounded-full bg-amber-200 border-2 border-white flex items-center justify-center font-bold text-amber-800 text-[11px]">MK</div>
                </div>
                <span>Trusted by over <strong>42,000+ Mumbaikars</strong> across 26 wards</span>
              </div>
            </div>

            {/* Right Interactive Leaflet Map Preview Card */}
            <div className="lg:col-span-5">
              <div className="relative">
                <div className="bg-white rounded-3xl p-3 shadow-soft-xl border border-neutral-200/80 overflow-hidden">
                  <div className="flex items-center justify-between px-3 py-2 border-b border-neutral-100 mb-2">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-red-500 inline-block animate-ping"></span>
                      <span className="text-xs font-bold text-neutral-800">Live Ward Map: G/N (Bandra)</span>
                    </div>
                    <Badge variant="brand" size="sm">OpenStreetMap Live</Badge>
                  </div>

                  {/* Leaflet Map Preview */}
                  <div className="relative rounded-2xl overflow-hidden">
                    <LeafletMap
                      center={[19.0596, 72.8296]}
                      zoom={13}
                      complaints={complaints.slice(0, 5)}
                      height="320px"
                    />
                  </div>

                  {/* Floating AI Categorization Overlay Pill */}
                  <div className="mt-3 p-3 bg-brand-50/80 rounded-xl border border-brand-100 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 text-brand-900 font-medium">
                      <Cpu size={16} className="text-brand-600" />
                      <span>AI Model: <strong>94% Confidence</strong> Auto-Routing</span>
                    </div>
                    <Link to="/how-it-works" className="text-brand-700 font-bold hover:underline flex items-center gap-1 text-[11px]">
                      Learn More <ChevronRight size={13} />
                    </Link>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── Stats Bar (4 Realistic KPI Cards) ────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-5 border-l-4 border-l-brand-600 shadow-soft-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-brand-100 flex items-center justify-center text-brand-700">
                <MapPin size={20} />
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-extrabold text-neutral-900">26</div>
                <div className="text-xs text-neutral-500 font-medium">Mumbai Wards Covered</div>
              </div>
            </div>
          </Card>

          <Card className="p-5 border-l-4 border-l-emerald-600 shadow-soft-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-700">
                <CheckCircle2 size={20} />
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-extrabold text-neutral-900">14,827</div>
                <div className="text-xs text-neutral-500 font-medium">Issues Resolved</div>
              </div>
            </div>
          </Card>

          <Card className="p-5 border-l-4 border-l-sky-600 shadow-soft-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-sky-100 flex items-center justify-center text-sky-700">
                <Clock size={20} />
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-extrabold text-neutral-900">3.7 Days</div>
                <div className="text-xs text-neutral-500 font-medium">Avg Resolution Time</div>
              </div>
            </div>
          </Card>

          <Card className="p-5 border-l-4 border-l-amber-600 shadow-soft-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center text-amber-700">
                <Users size={20} />
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-extrabold text-neutral-900">42,000+</div>
                <div className="text-xs text-neutral-500 font-medium">Active Citizens</div>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* ── How It Works (4 Steps Horizontal Process) ────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto space-y-2 mb-10">
          <Badge variant="brand">Simple & Transparent</Badge>
          <h2 className="text-3xl font-bold text-neutral-900">How Kaiser AI Works</h2>
          <p className="text-sm text-neutral-600">From the moment you notice an issue on your street to the moment it is inspected and fixed.</p>
        </div>

        <div className="grid md:grid-cols-4 gap-6 relative">
          <div className="bg-white p-6 rounded-2xl border border-neutral-100 shadow-soft-sm space-y-3 relative">
            <div className="w-12 h-12 rounded-2xl bg-brand-50 text-brand-700 flex items-center justify-center font-bold text-lg">
              1
            </div>
            <h3 className="font-bold text-neutral-900 text-base">Report Issue</h3>
            <p className="text-xs text-neutral-500 leading-relaxed">
              Snap a quick photo and pinpoint the street location on our interactive Mumbai map. Voice notes supported.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-neutral-100 shadow-soft-sm space-y-3 relative">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold text-lg">
              2
            </div>
            <h3 className="font-bold text-neutral-900 text-base">AI Classification</h3>
            <p className="text-xs text-neutral-500 leading-relaxed">
              Computer vision classifies the issue (pothole, water leak, garbage) and calculates severity based on weather and traffic.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-neutral-100 shadow-soft-sm space-y-3 relative">
            <div className="w-12 h-12 rounded-2xl bg-sky-50 text-sky-700 flex items-center justify-center font-bold text-lg">
              3
            </div>
            <h3 className="font-bold text-neutral-900 text-base">Officer Dispatched</h3>
            <p className="text-xs text-neutral-500 leading-relaxed">
              Automatically routed to the respective ward engineer's queue with strict SLA deadlines and real-time tracking.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-neutral-100 shadow-soft-sm space-y-3 relative">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-lg">
              4
            </div>
            <h3 className="font-bold text-neutral-900 text-base">Verified Resolution</h3>
            <p className="text-xs text-neutral-500 leading-relaxed">
              Ward crew completes repairs, uploads photo evidence, and the citizen receives instant status confirmation.
            </p>
          </div>
        </div>
      </section>

      {/* ── Features Grid (6 Core Capabilities) ─────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto space-y-2 mb-10">
          <Badge variant="brand">Built for Mumbai</Badge>
          <h2 className="text-3xl font-bold text-neutral-900">Engineered for Rapid Civic Impact</h2>
          <p className="text-sm text-neutral-600">Addressing the unique challenges of Mumbai's high-density municipal infrastructure.</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="p-6 space-y-3 hover:shadow-soft-md transition-shadow">
            <div className="w-10 h-10 rounded-xl bg-brand-100 text-brand-700 flex items-center justify-center">
              <MapPin size={20} />
            </div>
            <h3 className="font-bold text-neutral-900 text-base">GPS-Tagged Reporting</h3>
            <p className="text-xs text-neutral-500 leading-relaxed">
              Sub-meter geolocation pinning on OpenStreetMap ensures road maintenance crews arrive at the exact pothole or drain cover.
            </p>
          </Card>

          <Card className="p-6 space-y-3 hover:shadow-soft-md transition-shadow">
            <div className="w-10 h-10 rounded-xl bg-accent-100 text-accent-700 flex items-center justify-center">
              <Zap size={20} />
            </div>
            <h3 className="font-bold text-neutral-900 text-base">AI Severity Scoring</h3>
            <p className="text-xs text-neutral-500 leading-relaxed">
              Dynamic algorithm evaluates complaint depth, citizen upvotes, traffic density, and monsoon risk to assign priority SLA.
            </p>
          </Card>

          <Card className="p-6 space-y-3 hover:shadow-soft-md transition-shadow">
            <div className="w-10 h-10 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center">
              <Clock size={20} />
            </div>
            <h3 className="font-bold text-neutral-900 text-base">Real-Time SLA Tracking</h3>
            <p className="text-xs text-neutral-500 leading-relaxed">
              Transparent live status timeline from 'Reported' to 'Assigned' and 'Resolved' with automated notifications at every milestone.
            </p>
          </Card>

          <Card className="p-6 space-y-3 hover:shadow-soft-md transition-shadow">
            <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center">
              <Layers size={20} />
            </div>
            <h3 className="font-bold text-neutral-900 text-base">Duplicate Detection</h3>
            <p className="text-xs text-neutral-500 leading-relaxed">
              Cluster analysis automatically groups similar nearby complaints, combining community upvotes into a single priority ticket.
            </p>
          </Card>

          <Card className="p-6 space-y-3 hover:shadow-soft-md transition-shadow">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <Award size={20} />
            </div>
            <h3 className="font-bold text-neutral-900 text-base">Officer Accountability</h3>
            <p className="text-xs text-neutral-500 leading-relaxed">
              Dedicated ward officer consoles with photo-verified proof of resolution before a complaint can be closed.
            </p>
          </Card>

          <Card className="p-6 space-y-3 hover:shadow-soft-md transition-shadow">
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
              <BarChart3 size={20} />
            </div>
            <h3 className="font-bold text-neutral-900 text-base">Transparent Ward Analytics</h3>
            <p className="text-xs text-neutral-500 leading-relaxed">
              Public ward leaderboard and municipal dashboards enabling data-driven budget allocation and rapid bottleneck detection.
            </p>
          </Card>
        </div>
      </section>

      {/* ── Testimonials (Realistic Mumbai Citizens) ────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto space-y-2 mb-10">
          <Badge variant="brand">Citizen Voices</Badge>
          <h2 className="text-3xl font-bold text-neutral-900">Trusted by Communities Across Mumbai</h2>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <Card className="p-6 space-y-4 shadow-soft-sm">
            <p className="text-xs text-neutral-600 italic leading-relaxed">
              "The huge pothole outside Bandra Station on SV Road was repaired within 48 hours of reporting. The photo proof by the officer was super reassuring."
            </p>
            <div className="flex items-center gap-3 pt-2 border-t border-neutral-100">
              <div className="w-9 h-9 rounded-full bg-brand-100 text-brand-700 font-bold flex items-center justify-center text-xs">
                PN
              </div>
              <div>
                <div className="font-bold text-xs text-neutral-900">Priya Nair</div>
                <div className="text-[11px] text-neutral-400">G/N Ward (Bandra West)</div>
              </div>
            </div>
          </Card>

          <Card className="p-6 space-y-4 shadow-soft-sm">
            <p className="text-xs text-neutral-600 italic leading-relaxed">
              "During the heavy rains last week, a broken drain cover on Linking Road was attended to the same evening. Kaiser AI's upvoting feature helped our society get noticed."
            </p>
            <div className="flex items-center gap-3 pt-2 border-t border-neutral-100">
              <div className="w-9 h-9 rounded-full bg-sky-100 text-sky-700 font-bold flex items-center justify-center text-xs">
                SJ
              </div>
              <div>
                <div className="font-bold text-xs text-neutral-900">Sangeeta Joshi</div>
                <div className="text-[11px] text-neutral-400">H/W Ward (Khar)</div>
              </div>
            </div>
          </Card>

          <Card className="p-6 space-y-4 shadow-soft-sm">
            <p className="text-xs text-neutral-600 italic leading-relaxed">
              "As an Advanced Locality Management (ALM) volunteer in Andheri, tracking our neighborhood's pending garbage issues on the live map saves us dozens of phone calls."
            </p>
            <div className="flex items-center gap-3 pt-2 border-t border-neutral-100">
              <div className="w-9 h-9 rounded-full bg-amber-100 text-amber-700 font-bold flex items-center justify-center text-xs">
                AS
              </div>
              <div>
                <div className="font-bold text-xs text-neutral-900">Arun Shetty</div>
                <div className="text-[11px] text-neutral-400">K/W Ward (Lokhandwala)</div>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* ── Full-Width CTA Banner ───────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-brand-600 rounded-3xl p-8 sm:p-12 text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-brand-lg">
          <div className="space-y-2 text-center md:text-left">
            <h3 className="text-2xl sm:text-3xl font-extrabold">Ready to make your ward better?</h3>
            <p className="text-sm text-brand-100 max-w-xl">
              Join thousands of active citizens transforming Mumbai into a cleaner, safer, and faster-responding city.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Link to="/register">
              <button className="px-8 py-3.5 rounded-full font-bold text-sm bg-white text-brand-800 hover:bg-neutral-50 shadow-soft-md transition-all cursor-pointer">
                Create Free Citizen Account
              </button>
            </Link>
            <Link to="/app/report">
              <button className="px-6 py-3.5 rounded-full font-bold text-sm bg-accent-600 hover:bg-accent-700 text-white transition-all cursor-pointer">
                Report Issue Now
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* ── Emergency Response Banner ────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-neutral-900 text-white rounded-2xl p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center md:text-left">
            <h3 className="text-xl font-bold flex items-center justify-center md:justify-start gap-2">
              <Phone className="text-red-400" size={20} />
              Mumbai Municipal Emergency Response
            </h3>
            <p className="text-sm text-neutral-400 max-w-xl">
              For urgent flood, fire, building collapse, or water mains break emergencies requiring immediate BMC intervention.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <a
              href="tel:1916"
              className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-full font-bold text-sm shadow-lg flex items-center gap-2 transition-colors"
            >
              Call Disaster Management 1916
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};
