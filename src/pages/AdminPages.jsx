import React, { useState, useEffect } from 'react';
import {
  BarChart3, Building2, Users, TrendingUp, AlertTriangle, CheckCircle2,
  Download, Filter, Layers, Shield, Award, Star, MapPin, Activity,
  CloudRain, Thermometer, Wind, ChevronRight
} from 'lucide-react';
import { getDashboardStats, getCategoryAnalytics, getWardAnalytics, getResolutionTrends } from '../api/analytics.api';
import { getWeatherAQI } from '../api/weather.api';
import { MOCK_OFFICERS } from '../utils/mockData';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { LeafletMap } from '../components/map/LeafletMap';
import { getComplaints } from '../api/complaints.api';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  LineChart, Line, CartesianGrid, Area, AreaChart,
  PieChart, Pie, Cell, Legend
} from 'recharts';

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
  const [analytics, setAnalytics] = useState(null);
  const [categoryData, setCategoryData] = useState([]);
  const [wardData, setWardData] = useState([]);
  const [trends, setTrends] = useState(null);
  const [weather, setWeather] = useState(null);
  const [mapComplaints, setMapComplaints] = useState([]);
  const [activeSection, setActiveSection] = useState('overview');

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
      }
    }
    load();
  }, []);

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
          <Button variant="outline" size="sm" icon={Download}>Export Monthly Report</Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
      </div>

      {/* Section Tabs */}
      <div className="flex border-b border-neutral-200 space-x-6 text-sm font-semibold text-neutral-500 overflow-x-auto">
        {['overview', 'leaderboard', 'analytics', 'map'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveSection(tab)}
            className={`pb-2 transition-colors whitespace-nowrap capitalize ${activeSection === tab ? 'text-brand-600 border-b-2 border-brand-600' : 'hover:text-neutral-800'}`}
          >
            {tab === 'overview' ? 'Ward Performance' : tab === 'leaderboard' ? 'Officer Leaderboard' : tab === 'analytics' ? 'Charts & Analytics' : 'City Map'}
          </button>
        ))}
      </div>

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
    </div>
  );
};
