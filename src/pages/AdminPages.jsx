import React, { useState, useEffect, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import {
  Building2, Download, Award, Star,
  Thermometer, ChevronRight, Search, CheckCircle
} from 'lucide-react';
import { getDashboardStats, getCategoryAnalytics, getWardAnalytics, getResolutionTrends } from '../api/analytics.api';
import { getWeatherAQI } from '../api/weather.api';
import { MOCK_OFFICERS, MUMBAI_WARDS } from '../utils/mockData';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { LeafletMap } from '../components/map/LeafletMap';
import { getComplaints } from '../api/complaints.api';
import { MunicipalReportModal } from '../components/admin/MunicipalReportModal';
import { PredictiveDisasterCenter } from '../components/admin/PredictiveDisasterCenter';
import { SkeletonKpiCard } from '../components/common/Skeleton';
import { useDebounce } from '../hooks/useDebounce';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  LineChart, Line, CartesianGrid, Area, AreaChart
} from 'recharts';

// ── Helpers ───────────────────────────────────────────────────────────────────
const getWardZone = (wardId) => {
  if (wardId <= 9) return 'Island City';
  if ([14, 15, 16, 17, 23, 24].includes(wardId)) return 'Eastern Suburbs';
  return 'Western Suburbs';
};

// ── Mini trend sparkline ──────────────────────────────────────────────────────
const TrendChart = ({ data }) => (
  <ResponsiveContainer width="100%" height={180}>
    <AreaChart data={data}>
      <defs>
        <linearGradient id="colorReported" x1="0" y1="0" x2="0" y2="1">
          <stop offset="5%" stopColor="#f97316" stopOpacity={0.2} />
          <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
        </linearGradient>
        <linearGradient id="colorResolved" x1="0" y1="0" x2="0" y2="1">
          <stop offset="5%" stopColor="#16a34a" stopOpacity={0.2} />
          <stop offset="95%" stopColor="#16a34a" stopOpacity={0} />
        </linearGradient>
      </defs>
      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
      <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
      <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
      <Tooltip
        contentStyle={{ fontSize: 11, borderRadius: 10, border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.07)' }}
        labelStyle={{ fontWeight: 700 }}
      />
      <Area type="monotone" dataKey="reported" stroke="#f97316" strokeWidth={2} fillOpacity={1} fill="url(#colorReported)" />
      <Area type="monotone" dataKey="resolved" stroke="#16a34a" strokeWidth={2} fillOpacity={1} fill="url(#colorResolved)" />
    </AreaChart>
  </ResponsiveContainer>
);

// ── Category Bar Chart ────────────────────────────────────────────────────────
const CategoryChart = ({ data }) => (
  <ResponsiveContainer width="100%" height={220}>
    <BarChart data={data} layout="vertical" barGap={3}>
      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
      <XAxis type="number" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
      <YAxis type="category" dataKey="category" tick={{ fontSize: 10, fill: '#64748b', fontWeight: 500 }} axisLine={false} tickLine={false} width={90} />
      <Tooltip
        contentStyle={{ fontSize: 11, borderRadius: 10, border: '1px solid #e2e8f0' }}
      />
      <Bar dataKey="count" name="Total" fill="#16a34a" radius={[0, 6, 6, 0]} barSize={16} />
      <Bar dataKey="resolved" name="Resolved" fill="#86efac" radius={[0, 6, 6, 0]} barSize={16} />
    </BarChart>
  </ResponsiveContainer>
);

// ── AQI/Weather Correlation Chart ─────────────────────────────────────────────
const WeatherCorrelationChart = ({ data }) => (
  <ResponsiveContainer width="100%" height={180}>
    <LineChart data={data}>
      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
      <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
      <YAxis yAxisId="left" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
      <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
      <Tooltip
        contentStyle={{ fontSize: 11, borderRadius: 10, border: '1px solid #e2e8f0' }}
      />
      <Line yAxisId="left" type="monotone" dataKey="complaints" stroke="#f97316" strokeWidth={2} dot={{ r: 3, fill: '#f97316' }} />
      <Line yAxisId="right" type="monotone" dataKey="avgAQI" stroke="#6366f1" strokeWidth={2} dot={{ r: 3, fill: '#6366f1' }} strokeDasharray="5 5" />
    </LineChart>
  </ResponsiveContainer>
);

export const AdminDashboard = () => {
  const location = useLocation();
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [categoryData, setCategoryData] = useState([]);
  const [wardData, setWardData] = useState([]);
  const [trends, setTrends] = useState(null);
  const [weather, setWeather] = useState(null);
  const [mapComplaints, setMapComplaints] = useState([]);
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [wardSearchQuery, setWardSearchQuery] = useState('');
  const [wardZoneFilter, setWardZoneFilter] = useState('all');
  const [complaintSearch, setComplaintSearch] = useState('');
  const [complaintStatusFilter, setComplaintStatusFilter] = useState('all');
  const [complaintWardFilter, setComplaintWardFilter] = useState('all');
  const [complaintCatFilter, setComplaintCatFilter] = useState('all');

  const debouncedWardSearch = useDebounce(wardSearchQuery, 250);
  const debouncedComplaintSearch = useDebounce(complaintSearch, 250);

  const sectionFromPath = (path) => {
    const p = path || location.pathname;
    if (p.endsWith('/wards')) return 'wards';
    if (p.endsWith('/officers')) return 'leaderboard';
    if (p.endsWith('/complaints')) return 'complaints';
    if (p.endsWith('/reports')) return 'reports';
    if (p.endsWith('/disaster')) return 'disaster';
    if (p.endsWith('/analytics')) return 'analytics';
    return 'overview';
  };

  const [prevPath, setPrevPath] = useState(location.pathname);
  const [activeSection, setActiveSection] = useState(() => sectionFromPath(location.pathname));

  if (location.pathname !== prevPath) {
    setPrevPath(location.pathname);
    setActiveSection(sectionFromPath(location.pathname));
  }

  useEffect(() => {
    async function load() {
      try {
        const [statsRes, catRes, wardRes, trendRes, weatherRes, complaintsRes] = await Promise.all([
          getDashboardStats(),
          getCategoryAnalytics(),
          getWardAnalytics(),
          getResolutionTrends(),
          getWeatherAQI(19.076, 72.877),
          getComplaints(),
        ]);
        setAnalytics(statsRes.data || null);
        setCategoryData(catRes.data || []);
        setWardData(wardRes.data || []);
        setTrends(trendRes.data || null);
        setWeather(weatherRes.data || null);
        setMapComplaints(complaintsRes.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  // Compute all 26 wards data
  const allWardsData = useMemo(() => {
    return MUMBAI_WARDS.map((w) => {
      const match = wardData.find((d) => d.wardId === w.id || d.ward?.toLowerCase().startsWith(w.name.toLowerCase()));
      const zone = getWardZone(w.id);
      const wardComplaints = mapComplaints.filter((c) => c.ward === w.id || c.wardName?.includes(w.name));
      const total = match ? match.total : (wardComplaints.length > 0 ? wardComplaints.length * 35 : 420 + (w.id * 18));
      const resolved = match ? match.resolved : Math.floor(total * 0.82);
      const pending = match ? match.pending : total - resolved;
      const rate = match ? match.rate : Math.round((resolved / total) * 100);
      const avgDays = match ? match.avgDays : Number((2.4 + (w.id % 4) * 0.6).toFixed(1));
      const officers = match ? match.officers : (3 + (w.id % 3));

      return {
        ...w,
        zone,
        total,
        resolved,
        pending,
        rate,
        avgDays,
        officers,
      };
    });
  }, [wardData, mapComplaints]);

  const filteredWards = useMemo(() => {
    return allWardsData.filter((w) => {
      const matchesSearch = !debouncedWardSearch ||
        w.name.toLowerCase().includes(debouncedWardSearch.toLowerCase()) ||
        w.area.toLowerCase().includes(debouncedWardSearch.toLowerCase());
      const matchesZone = wardZoneFilter === 'all' || w.zone === wardZoneFilter;
      return matchesSearch && matchesZone;
    });
  }, [allWardsData, debouncedWardSearch, wardZoneFilter]);

  const filteredCityComplaints = useMemo(() => {
    return mapComplaints.filter((c) => {
      const matchesSearch = !debouncedComplaintSearch ||
        c.title?.toLowerCase().includes(debouncedComplaintSearch.toLowerCase()) ||
        c.id?.toLowerCase().includes(debouncedComplaintSearch.toLowerCase()) ||
        c.category?.toLowerCase().includes(debouncedComplaintSearch.toLowerCase()) ||
        c.createdBy?.name?.toLowerCase().includes(debouncedComplaintSearch.toLowerCase());
      const matchesStatus = complaintStatusFilter === 'all' || c.status === complaintStatusFilter;
      const matchesWard = complaintWardFilter === 'all' || String(c.ward) === String(complaintWardFilter);
      const matchesCat = complaintCatFilter === 'all' || c.category === complaintCatFilter;
      return matchesSearch && matchesStatus && matchesWard && matchesCat;
    });
  }, [mapComplaints, debouncedComplaintSearch, complaintStatusFilter, complaintWardFilter, complaintCatFilter]);

  // Sort officers by rating descending for leaderboard
  const leaderboard = [...MOCK_OFFICERS].sort((a, b) => b.rating - a.rating);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="warning">Brihanmumbai Municipal Corporation</Badge>
            <span className="text-xs text-neutral-400 font-mono">City-wide Analytics</span>
          </div>
          <h2 className="text-2xl font-bold text-neutral-900">BMC Command & Control Dashboard</h2>
          <p className="text-xs text-neutral-500">Live operational overview of all 26 administrative wards in Greater Mumbai.</p>
        </div>

        <div className="flex items-center gap-3">
          {weather && (
            <Card className="px-3 py-2 bg-sky-50/60 border-sky-100 flex items-center gap-2">
              <Thermometer className="text-sky-500" size={16} />
              <span className="text-xs font-semibold text-neutral-700">{weather.temperature}°C</span>
              <span className="text-xs text-neutral-400">·</span>
              <span className="text-xs font-semibold text-amber-600">AQI {weather.aqi}</span>
            </Card>
          )}
          <Button variant="outline" size="sm" icon={Download} onClick={() => setReportModalOpen(true)}>
            Export Monthly Report
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {loading ? (
          <>
            <SkeletonKpiCard />
            <SkeletonKpiCard />
            <SkeletonKpiCard />
            <SkeletonKpiCard />
          </>
        ) : (
          <>
            <Card className="p-4 space-y-1">
              <span className="text-xs font-semibold text-neutral-500 uppercase">Total Complaints</span>
              <div className="text-3xl font-extrabold text-neutral-900">
                {analytics?.totalComplaints ? analytics.totalComplaints.toLocaleString() : '14,290'}
              </div>
              <div className="text-[11px] text-emerald-600 font-semibold">+{analytics?.monthlyGrowth || 12.4}% vs last month</div>
            </Card>

            <Card className="p-4 space-y-1">
              <span className="text-xs font-semibold text-neutral-500 uppercase">Resolution Rate</span>
              <div className="text-3xl font-extrabold text-emerald-600">
                {analytics?.resolutionRate ? `${analytics.resolutionRate}%` : '91.4%'}
              </div>
              <div className="text-[11px] text-neutral-400">Target: &gt; 90%</div>
            </Card>

            <Card className="p-4 space-y-1">
              <span className="text-xs font-semibold text-neutral-500 uppercase">Average SLA Time</span>
              <div className="text-3xl font-extrabold text-sky-600">
                {analytics?.avgResolutionDays ? `${(analytics.avgResolutionDays * 24).toFixed(1)}h` : '18.4h'}
              </div>
              <div className="text-[11px] text-emerald-600 font-semibold">-2.1h optimization</div>
            </Card>

            <Card className="p-4 space-y-1">
              <span className="text-xs font-semibold text-neutral-500 uppercase">Active Officers</span>
              <div className="text-3xl font-extrabold text-brand-600">{analytics?.activeOfficers || 84}</div>
              <div className="text-[11px] text-neutral-400">Across 26 wards</div>
            </Card>
          </>
        )}
      </div>

      {/* Section Tabs */}
      <div className="flex border-b border-neutral-200 space-x-6 text-sm font-semibold text-neutral-500 overflow-x-auto">
        {['overview', 'wards', 'leaderboard', 'analytics', 'disaster', 'complaints', 'reports', 'map'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveSection(tab)}
            className={`pb-2 transition-colors whitespace-nowrap capitalize ${activeSection === tab ? 'text-brand-600 border-b-2 border-brand-600' : 'hover:text-neutral-800'}`}
          >
            {tab === 'overview' ? 'Command Overview' :
             tab === 'wards' ? '26 Wards Scorecard' :
             tab === 'leaderboard' ? 'Officer Leaderboard' :
             tab === 'analytics' ? 'Charts & Analytics' :
             tab === 'disaster' ? 'Monsoon & Disaster AI ⚡' :
             tab === 'complaints' ? 'City Complaints' :
             tab === 'reports' ? 'Reports' : 'City Map'}
          </button>
        ))}
      </div>

      {/* SECTION: 26-Ward Municipal Scorecard & Grid */}
      {activeSection === 'wards' && (
        <div className="space-y-6">
          {/* Header & Controls */}
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold text-neutral-900 flex items-center gap-2">
                <Building2 className="text-brand-600" size={20} />
                26 Administrative Wards Scorecard
              </h3>
              <p className="text-xs text-neutral-500">
                Detailed municipal operational overview and SLA health across all zones in Greater Mumbai.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {/* Search Bar */}
              <div className="relative flex-1 md:w-64">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                <input
                  type="text"
                  placeholder="Search ward code, area..."
                  value={wardSearchQuery}
                  onChange={(e) => setWardSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-white border border-neutral-200 rounded-xl text-xs text-neutral-800 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-brand-200"
                />
              </div>

              {/* Zone Filter */}
              <div className="flex items-center gap-1 bg-neutral-100 p-1 rounded-xl text-xs font-medium text-neutral-600">
                {['all', 'Island City', 'Western Suburbs', 'Eastern Suburbs'].map((zone) => (
                  <button
                    key={zone}
                    onClick={() => setWardZoneFilter(zone)}
                    className={`px-3 py-1.5 rounded-lg transition-all ${
                      wardZoneFilter === zone
                        ? 'bg-white text-neutral-900 font-bold shadow-sm'
                        : 'text-neutral-500 hover:text-neutral-900'
                    }`}
                  >
                    {zone === 'all' ? 'All Zones' : zone}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Zone Quick Counter Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Card className="p-3.5 bg-white border-neutral-200 shadow-sm">
              <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block">Total Wards Mapped</span>
              <div className="text-2xl font-black text-neutral-900 mt-0.5">{allWardsData.length} Wards</div>
              <span className="text-[11px] text-neutral-500">100% active coverage</span>
            </Card>
            <Card className="p-3.5 bg-white border-neutral-200 shadow-sm">
              <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block">Island City (South)</span>
              <div className="text-2xl font-black text-brand-700 mt-0.5">
                {allWardsData.filter(w => w.zone === 'Island City').length} Wards
              </div>
              <span className="text-[11px] text-brand-600 font-medium">Wards A through G/S</span>
            </Card>
            <Card className="p-3.5 bg-white border-neutral-200 shadow-sm">
              <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block">Western Suburbs</span>
              <div className="text-2xl font-black text-sky-700 mt-0.5">
                {allWardsData.filter(w => w.zone === 'Western Suburbs').length} Wards
              </div>
              <span className="text-[11px] text-sky-600 font-medium">Wards H/E through RS</span>
            </Card>
            <Card className="p-3.5 bg-white border-neutral-200 shadow-sm">
              <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block">Eastern Suburbs</span>
              <div className="text-2xl font-black text-emerald-700 mt-0.5">
                {allWardsData.filter(w => w.zone === 'Eastern Suburbs').length} Wards
              </div>
              <span className="text-[11px] text-emerald-600 font-medium">Wards L through T</span>
            </Card>
          </div>

          {/* Wards Grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredWards.map((w) => (
              <Card key={w.id} hover className="p-5 space-y-4 bg-white border-neutral-200 shadow-sm flex flex-col justify-between">
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-brand-50 text-brand-700 border border-brand-200">
                          {w.name}
                        </span>
                        <span className="text-[11px] text-neutral-400 font-medium">{w.zone}</span>
                      </div>
                      <h4 className="font-bold text-neutral-900 text-sm mt-1">{w.area}</h4>
                    </div>
                    <Badge variant={w.rate >= 80 ? 'success' : w.rate >= 65 ? 'amber' : 'red'}>
                      {w.rate}% SLA
                    </Badge>
                  </div>

                  <div className="grid grid-cols-3 gap-2 py-3 border-y border-neutral-100 text-center my-3">
                    <div>
                      <span className="text-[10px] text-neutral-400 font-semibold block uppercase">Total</span>
                      <span className="text-sm font-bold text-neutral-800">{w.total?.toLocaleString()}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-emerald-600 font-semibold block uppercase">Resolved</span>
                      <span className="text-sm font-bold text-emerald-700">{w.resolved?.toLocaleString()}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-amber-600 font-semibold block uppercase">Pending</span>
                      <span className="text-sm font-bold text-amber-700">{w.pending?.toLocaleString()}</span>
                    </div>
                  </div>

                  {/* SLA Bar */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px]">
                      <span className="text-neutral-500">Resolution Speed: <strong className="text-neutral-800">{w.avgDays}d</strong></span>
                      <span className="text-neutral-500">{w.officers} Engineers Assigned</span>
                    </div>
                    <div className="w-full h-2 bg-neutral-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          w.rate >= 80 ? 'bg-emerald-500' : w.rate >= 65 ? 'bg-amber-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${w.rate}%` }}
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-between border-t border-neutral-50 text-xs">
                  <span className="text-neutral-400 font-mono text-[11px]">Ward ID #{w.id}</span>
                  <button
                    onClick={() => {
                      setComplaintWardFilter(String(w.id));
                      setActiveSection('complaints');
                    }}
                    className="text-brand-600 hover:text-brand-700 font-semibold flex items-center gap-1 text-[11px]"
                  >
                    View Grievances <ChevronRight size={13} />
                  </button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* SECTION: Ward Performance Table */}
      {activeSection === 'overview' && (
        <Card className="p-6 space-y-4 shadow-soft-sm">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-neutral-900 text-base">Ward Resolution Performance Ranking</h3>
            <Badge variant="brand">26 Wards Active</Badge>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-neutral-600">
              <thead className="bg-neutral-50 border-b border-neutral-100 text-neutral-500 uppercase tracking-wider font-semibold">
                <tr>
                  <th className="px-4 py-3">#</th>
                  <th className="px-4 py-3">Ward Code & Zone</th>
                  <th className="px-4 py-3">Total Complaints</th>
                  <th className="px-4 py-3">Resolved</th>
                  <th className="px-4 py-3">Pending</th>
                  <th className="px-4 py-3">Avg Days</th>
                  <th className="px-4 py-3">Officers</th>
                  <th className="px-4 py-3">Resolution Rate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 font-medium">
                {wardData.map((w, idx) => (
                  <tr key={w.wardId || idx} className="hover:bg-neutral-50 transition-colors">
                    <td className="px-4 py-3">
                      <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold ${idx < 3 ? 'bg-brand-100 text-brand-700' : 'bg-neutral-100 text-neutral-500'}`}>
                        {idx + 1}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-bold text-neutral-900">{w.ward}</td>
                    <td className="px-4 py-3">{w.total?.toLocaleString()}</td>
                    <td className="px-4 py-3 text-emerald-600 font-semibold">{w.resolved?.toLocaleString()}</td>
                    <td className="px-4 py-3 text-amber-600 font-semibold">{w.pending}</td>
                    <td className="px-4 py-3">{w.avgDays}d</td>
                    <td className="px-4 py-3">{w.officers}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-20 h-2 bg-neutral-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${w.rate >= 80 ? 'bg-emerald-500' : w.rate >= 60 ? 'bg-amber-500' : 'bg-red-500'}`}
                            style={{ width: `${w.rate}%` }}
                          />
                        </div>
                        <span className={`font-bold ${w.rate >= 80 ? 'text-emerald-600' : w.rate >= 60 ? 'text-amber-600' : 'text-red-600'}`}>
                          {w.rate}%
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* SECTION: Officer Leaderboard */}
      {activeSection === 'leaderboard' && (
        <div className="space-y-4">
          <h3 className="font-bold text-neutral-900 text-base flex items-center gap-2">
            <Award size={18} className="text-amber-500" />
            Officer Resolution Leaderboard
          </h3>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {leaderboard.map((officer, idx) => (
              <Card key={officer.id} hover className={`p-5 relative ${idx === 0 ? 'border-amber-200 bg-amber-50/30' : ''}`}>
                {idx < 3 && (
                  <div className={`absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                    idx === 0 ? 'bg-amber-400 text-white' : idx === 1 ? 'bg-neutral-300 text-white' : 'bg-orange-400 text-white'
                  }`}>
                    #{idx + 1}
                  </div>
                )}

                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-brand-100 flex items-center justify-center text-brand-700 font-bold text-sm">
                    {officer.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <h4 className="font-bold text-neutral-900 text-sm">{officer.name}</h4>
                    <p className="text-[11px] text-neutral-500">{officer.wardName}</p>
                    <p className="text-[11px] text-neutral-400">{officer.department}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-2 bg-emerald-50 rounded-lg">
                    <span className="text-emerald-600 font-semibold">Resolved</span>
                    <div className="text-lg font-bold text-emerald-800">{officer.resolvedCount}</div>
                  </div>
                  <div className="p-2 bg-sky-50 rounded-lg">
                    <span className="text-sky-600 font-semibold">Avg Days</span>
                    <div className="text-lg font-bold text-sky-800">{officer.avgResolutionDays}d</div>
                  </div>
                  <div className="p-2 bg-amber-50 rounded-lg">
                    <span className="text-amber-600 font-semibold">Active</span>
                    <div className="text-lg font-bold text-amber-800">{officer.assignedCount}</div>
                  </div>
                  <div className="p-2 bg-brand-50 rounded-lg">
                    <span className="text-brand-600 font-semibold">Rating</span>
                    <div className="text-lg font-bold text-brand-800 flex items-center gap-1">
                      <Star size={14} className="text-amber-400 fill-amber-400" />
                      {officer.rating}
                    </div>
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t border-neutral-100 flex items-center justify-between">
                  <Badge variant={officer.status === 'Available' ? 'success' : officer.status === 'On Leave' ? 'amber' : 'sky'}>
                    {officer.status}
                  </Badge>
                  <span className="text-[11px] text-neutral-400 font-mono">{officer.employeeId}</span>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* SECTION: Charts & Analytics */}
      {activeSection === 'analytics' && (
        <div className="space-y-6">
          {/* Trends Chart */}
          <Card className="p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm text-neutral-900">Complaint Volume Trends (6-Month)</h3>
                <p className="text-xs text-neutral-500">Reported vs Resolved trend line across Mumbai</p>
              </div>
              <div className="flex items-center gap-4 text-xs">
                <span className="flex items-center gap-1.5"><span className="w-3 h-0.5 bg-orange-500 rounded" /> Reported</span>
                <span className="flex items-center gap-1.5"><span className="w-3 h-0.5 bg-emerald-500 rounded" /> Resolved</span>
              </div>
            </div>
            {trends?.trends && <TrendChart data={trends.trends} />}
          </Card>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Category Breakdown */}
            <Card className="p-5 space-y-4">
              <h3 className="font-bold text-sm text-neutral-900">Top Issues by Category (Mumbai)</h3>
              {categoryData.length > 0 && <CategoryChart data={categoryData} />}
            </Card>

            {/* Weather vs Complaints Correlation */}
            <Card className="p-5 space-y-4">
              <div>
                <h3 className="font-bold text-sm text-neutral-900">AQI vs Complaint Correlation</h3>
                <p className="text-xs text-neutral-500">Higher AQI months correlate with more complaints</p>
              </div>
              <div className="flex items-center gap-4 text-xs mb-2">
                <span className="flex items-center gap-1.5"><span className="w-3 h-0.5 bg-orange-500 rounded" /> Complaints</span>
                <span className="flex items-center gap-1.5"><span className="w-3 h-0.5 bg-indigo-500 rounded border-dashed" /> Avg AQI</span>
              </div>
              {trends?.weatherCorrelation && <WeatherCorrelationChart data={trends.weatherCorrelation} />}
            </Card>
          </div>

          {/* Top 10 Issues Table */}
          <Card className="p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-neutral-900">Top 10 Most Upvoted Issues in Mumbai</h3>
              <Badge variant="red">{analytics?.highPriorityOpen || 127} High Priority</Badge>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-neutral-600">
                <thead className="bg-neutral-50 border-b border-neutral-100 text-neutral-500 uppercase tracking-wider font-semibold">
                  <tr>
                    <th className="px-3 py-2.5">#</th>
                    <th className="px-3 py-2.5">Issue</th>
                    <th className="px-3 py-2.5">Category</th>
                    <th className="px-3 py-2.5">Ward</th>
                    <th className="px-3 py-2.5">Severity</th>
                    <th className="px-3 py-2.5">Upvotes</th>
                    <th className="px-3 py-2.5">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {mapComplaints
                    .sort((a, b) => (b.upvoteCount || 0) - (a.upvoteCount || 0))
                    .slice(0, 10)
                    .map((c, idx) => (
                      <tr key={c.id} className="hover:bg-neutral-50 transition-colors">
                        <td className="px-3 py-2.5 font-bold text-neutral-400">{idx + 1}</td>
                        <td className="px-3 py-2.5 font-semibold text-neutral-900 max-w-[200px] truncate">{c.title}</td>
                        <td className="px-3 py-2.5">{c.category}</td>
                        <td className="px-3 py-2.5">#{c.ward}</td>
                        <td className="px-3 py-2.5">
                          <span className={`px-2 py-0.5 rounded-pill text-[11px] font-bold border ${
                            c.severity >= 80 ? 'text-red-700 bg-red-50 border-red-200' :
                            c.severity >= 60 ? 'text-orange-700 bg-orange-50 border-orange-200' :
                            'text-amber-700 bg-amber-50 border-amber-200'
                          }`}>
                            {c.severity}
                          </span>
                        </td>
                        <td className="px-3 py-2.5 font-bold text-brand-700">👍 {c.upvoteCount || 0}</td>
                        <td className="px-3 py-2.5">
                          <Badge variant={c.status === 'resolved' ? 'success' : c.status === 'in_progress' ? 'amber' : 'sky'}>
                            {c.status}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {/* SECTION: Reports */}
      {activeSection === 'reports' && (
        <div className="space-y-6">
          <Card className="p-6 bg-gradient-to-r from-slate-900 to-brand-950 text-white rounded-3xl space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <span className="text-[10px] uppercase font-bold text-amber-400 tracking-wider">Executive Municipal Audit</span>
                <h3 className="text-xl font-black">Brihanmumbai Monthly Grievance Dossier</h3>
                <p className="text-xs text-white/70 max-w-lg">
                  Generate the certified municipal performance dossier with SLA compliance breakdown across all 26 wards, departmental speed metrics, and exportable CSV/print formats.
                </p>
              </div>
              <Button
                variant="primary"
                icon={Download}
                onClick={() => setReportModalOpen(true)}
                className="whitespace-nowrap shadow-brand"
              >
                Open Full Municipal Dossier
              </Button>
            </div>
          </Card>

          <div className="grid sm:grid-cols-3 gap-4">
            <Card className="p-4 bg-white border-neutral-200 shadow-sm space-y-2">
              <span className="text-xs font-bold text-neutral-800">CSV Audit Register</span>
              <p className="text-xs text-neutral-500">Download row-level raw complaint database with timestamps, GPS coordinates, and assigned officers.</p>
              <Button variant="outline" size="sm" icon={Download} onClick={() => setReportModalOpen(true)} className="w-full justify-center">
                Download CSV
              </Button>
            </Card>
            <Card className="p-4 bg-white border-neutral-200 shadow-sm space-y-2">
              <span className="text-xs font-bold text-neutral-800">Printable Executive PDF</span>
              <p className="text-xs text-neutral-500">Formatted official letterhead document with Municipal Commissioner sign-off blocks ready for print.</p>
              <Button variant="outline" size="sm" icon={Download} onClick={() => setReportModalOpen(true)} className="w-full justify-center">
                Preview & Print PDF
              </Button>
            </Card>
            <Card className="p-4 bg-white border-neutral-200 shadow-sm space-y-2">
              <span className="text-xs font-bold text-neutral-800">Inter-Ward Compliance Scorecard</span>
              <p className="text-xs text-neutral-500">Comparative SLA metrics between Western, Eastern, and City zone ward engineers.</p>
              <Button variant="outline" size="sm" icon={Download} onClick={() => setReportModalOpen(true)} className="w-full justify-center">
                View Scorecard
              </Button>
            </Card>
          </div>
        </div>
      )}

      {/* SECTION: Monsoon Disaster AI Command Center */}
      {activeSection === 'disaster' && (
        <PredictiveDisasterCenter />
      )}

      {/* SECTION: Full City Complaint Registry */}
      {activeSection === 'complaints' && (
        <Card className="p-6 space-y-4 shadow-soft-sm bg-white border-neutral-200">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Badge variant="brand">Municipal Registry</Badge>
                <span className="text-xs text-neutral-400">{filteredCityComplaints.length} grievances listed</span>
              </div>
              <h3 className="font-bold text-neutral-900 text-lg">City-wide Complaint & Grievance Register</h3>
              <p className="text-xs text-neutral-500">Live feed of all citizen submissions across Greater Mumbai with ward routing status.</p>
            </div>

            {/* Clear Filters Button if any active */}
            {(complaintSearch || complaintStatusFilter !== 'all' || complaintWardFilter !== 'all' || complaintCatFilter !== 'all') && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setComplaintSearch('');
                  setComplaintStatusFilter('all');
                  setComplaintWardFilter('all');
                  setComplaintCatFilter('all');
                }}
              >
                Reset Filters
              </Button>
            )}
          </div>

          {/* Filter Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 bg-neutral-50/70 p-3.5 rounded-2xl border border-neutral-200">
            {/* Search */}
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
              <input
                type="text"
                placeholder="Search title, ID, citizen…"
                value={complaintSearch}
                onChange={(e) => setComplaintSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-white border border-neutral-200 rounded-xl text-xs text-neutral-800 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-brand-200"
              />
            </div>

            {/* Status Filter */}
            <select
              value={complaintStatusFilter}
              onChange={(e) => setComplaintStatusFilter(e.target.value)}
              className="px-3 py-2 bg-white border border-neutral-200 rounded-xl text-xs font-semibold text-neutral-700 focus:outline-none"
            >
              <option value="all">All Statuses</option>
              <option value="reported">Reported</option>
              <option value="assigned">Assigned</option>
              <option value="in_progress">In Progress</option>
              <option value="resolved">Resolved</option>
            </select>

            {/* Ward Filter */}
            <select
              value={complaintWardFilter}
              onChange={(e) => setComplaintWardFilter(e.target.value)}
              className="px-3 py-2 bg-white border border-neutral-200 rounded-xl text-xs font-semibold text-neutral-700 focus:outline-none"
            >
              <option value="all">All 26 Wards</option>
              {MUMBAI_WARDS.map((w) => (
                <option key={w.id} value={w.id}>
                  Ward #{w.id} – {w.name} ({w.area})
                </option>
              ))}
            </select>

            {/* Category Filter */}
            <select
              value={complaintCatFilter}
              onChange={(e) => setComplaintCatFilter(e.target.value)}
              className="px-3 py-2 bg-white border border-neutral-200 rounded-xl text-xs font-semibold text-neutral-700 focus:outline-none"
            >
              <option value="all">All Categories</option>
              <option value="Pothole">Pothole</option>
              <option value="Garbage">Garbage</option>
              <option value="Drainage">Drainage</option>
              <option value="Streetlight">Streetlight</option>
              <option value="Water Leakage">Water Leakage</option>
              <option value="Other">Other</option>
            </select>
          </div>

          {/* Complaint Table */}
          {filteredCityComplaints.length === 0 ? (
            <div className="text-center py-12 space-y-2">
              <CheckCircle size={32} className="mx-auto text-neutral-400" />
              <p className="font-bold text-neutral-700 text-sm">No complaints found</p>
              <p className="text-xs text-neutral-400">No issues match the selected search and filter criteria.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-neutral-600">
                <thead className="bg-neutral-50 border-b border-neutral-200 text-neutral-500 uppercase tracking-wider font-semibold">
                  <tr>
                    <th className="px-3 py-3">ID</th>
                    <th className="px-3 py-3">Grievance & Details</th>
                    <th className="px-3 py-3">Category</th>
                    <th className="px-3 py-3">Ward</th>
                    <th className="px-3 py-3">Citizen</th>
                    <th className="px-3 py-3">Severity</th>
                    <th className="px-3 py-3">Upvotes</th>
                    <th className="px-3 py-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 font-medium">
                  {filteredCityComplaints.map((c) => (
                    <tr key={c.id} className="hover:bg-neutral-50/80 transition-colors">
                      <td className="px-3 py-3 font-mono font-bold text-neutral-500 text-[11px]">{c.id}</td>
                      <td className="px-3 py-3">
                        <div className="font-bold text-neutral-900 line-clamp-1">{c.title}</div>
                        <div className="text-[11px] text-neutral-400 line-clamp-1 mt-0.5">{c.address || c.description}</div>
                      </td>
                      <td className="px-3 py-3 whitespace-nowrap">
                        <span className="px-2 py-0.5 rounded-full text-[11px] bg-neutral-100 text-neutral-700 font-semibold border border-neutral-200">
                          {c.category}
                        </span>
                      </td>
                      <td className="px-3 py-3 whitespace-nowrap font-medium text-neutral-800">
                        {c.wardName ? c.wardName.split('–')[0]?.trim() : `Ward #${c.ward}`}
                      </td>
                      <td className="px-3 py-3 whitespace-nowrap text-neutral-600">
                        {c.createdBy?.name || 'Citizen'}
                      </td>
                      <td className="px-3 py-3 whitespace-nowrap">
                        <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold border ${
                          c.severity >= 80 ? 'text-red-700 bg-red-50 border-red-200' :
                          c.severity >= 60 ? 'text-orange-700 bg-orange-50 border-orange-200' :
                          'text-amber-700 bg-amber-50 border-amber-200'
                        }`}>
                          {c.severity}
                        </span>
                      </td>
                      <td className="px-3 py-3 whitespace-nowrap font-bold text-brand-700">
                        👍 {c.upvoteCount || 0}
                      </td>
                      <td className="px-3 py-3 whitespace-nowrap">
                        <Badge variant={c.status === 'resolved' ? 'success' : c.status === 'in_progress' ? 'amber' : 'sky'}>
                          {c.status}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      )}

      {/* SECTION: City Map */}
      {activeSection === 'map' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-neutral-900 text-base">City-wide Complaint Heatmap</h3>
            <span className="text-xs text-neutral-400">{mapComplaints.length} issues mapped</span>
          </div>
          <LeafletMap
            complaints={mapComplaints}
            height="600px"
            zoom={11}
          />
        </div>
      )}

      {/* Municipal Dossier Modal */}
      <MunicipalReportModal
        isOpen={reportModalOpen}
        onClose={() => setReportModalOpen(false)}
        complaints={mapComplaints}
        analytics={analytics}
      />
    </div>
  );
};
