import React, { useState, useEffect } from 'react';
import {
  Clock, AlertTriangle, CheckCircle2, UserCheck, Shield, Filter, Search,
  TrendingUp, MapPin, ChevronRight, FileText, Activity, Award, Star,
  BarChart3, CloudRain, Thermometer, Wind, Users
} from 'lucide-react';
import { getComplaints, updateComplaint } from '../api/complaints.api';
import { getWeatherAQI } from '../api/weather.api';
import { MOCK_OFFICERS, OFFICER_PERFORMANCE } from '../utils/mockData';
import { StatusBadge, SeverityBadge, CategoryIcon } from '../components/complaints/ComplaintComponents';
import { Button } from '../components/common/Button';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { LeafletMap } from '../components/map/LeafletMap';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';

// ── Officer Performance Chart (mini bar) ──────────────────────────────────────
const WeeklyChart = ({ data }) => (
  <ResponsiveContainer width="100%" height={160}>
    <BarChart data={data} barGap={3}>
      <XAxis dataKey="week" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
      <YAxis hide />
      <Tooltip
        contentStyle={{ fontSize: 11, borderRadius: 10, border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.07)' }}
        labelStyle={{ fontWeight: 700 }}
      />
      <Bar dataKey="resolved" fill="#16a34a" radius={[6, 6, 0, 0]} />
    </BarChart>
  </ResponsiveContainer>
);

// ── Category Donut ────────────────────────────────────────────────────────────
const CategoryDonut = ({ data }) => (
  <ResponsiveContainer width="100%" height={200}>
    <PieChart>
      <Pie
        data={data}
        cx="50%"
        cy="50%"
        innerRadius={50}
        outerRadius={80}
        paddingAngle={3}
        dataKey="value"
        nameKey="name"
        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
        style={{ fontSize: 10 }}
      >
        {data.map((entry, i) => (
          <Cell key={i} fill={entry.fill} />
        ))}
      </Pie>
      <Tooltip contentStyle={{ fontSize: 11, borderRadius: 10, border: '1px solid #e2e8f0' }} />
    </PieChart>
  </ResponsiveContainer>
);

export const OfficerDashboard = () => {
  const [complaints, setComplaints] = useState([]);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [statusUpdate, setStatusUpdate] = useState('');
  const [remarks, setRemarks] = useState('');
  const [weather, setWeather] = useState(null);
  const [activeTab, setActiveTab] = useState('queue');

  useEffect(() => {
    async function load() {
      const [res, weatherRes] = await Promise.all([
        getComplaints({ ward: 1 }),
        getWeatherAQI(19.076, 72.877),
      ]);
      setComplaints(res.data || []);
      setWeather(weatherRes.data || null);
    }
    load();
  }, []);

  const handleUpdateStatus = async () => {
    if (!selectedTicket || !statusUpdate) return;
    try {
      await updateComplaint(selectedTicket.id, {
        status: statusUpdate,
        remarks: remarks
      });
      setComplaints(prev => prev.map(c => c.id === selectedTicket.id ? { ...c, status: statusUpdate } : c));
      setSelectedTicket(null);
      setStatusUpdate('');
      setRemarks('');
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Officer Header Card */}
      <div className="bg-white border border-neutral-200/80 rounded-2xl p-6 shadow-soft-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="brand">K/E Ward – Andheri East</Badge>
            <span className="text-xs text-neutral-400 font-mono">Officer ID: BMC-OFF-4892</span>
          </div>
          <h2 className="text-2xl font-bold text-neutral-900">Ward Grievance Dispatch Center</h2>
          <p className="text-xs text-neutral-500">Real-time queue of citizen complaints auto-prioritized by Kaiser AI SLA Engine.</p>
        </div>

        <div className="flex items-center gap-3">
          {weather && (
            <Card className="px-4 py-2 bg-sky-50/60 border-sky-100 flex items-center gap-3">
              <Thermometer className="text-sky-500" size={18} />
              <div>
                <div className="text-xs text-neutral-400 font-semibold">{weather.temperature}°C · AQI {weather.aqi}</div>
                <div className="text-[11px] text-neutral-500">{weather.condition}</div>
              </div>
            </Card>
          )}
          <Card className="px-4 py-2 bg-neutral-50 flex items-center gap-3">
            <Clock className="text-amber-500" size={20} />
            <div>
              <div className="text-xs text-neutral-400 font-semibold">Active SLA Queue</div>
              <div className="text-sm font-bold text-neutral-900">{complaints.length} Complaints</div>
            </div>
          </Card>
        </div>
      </div>

      {/* KPI Stats Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4 bg-red-50/50 border-red-100 space-y-1">
          <span className="text-xs font-semibold text-red-700 uppercase">Critical (SLA &lt; 4h)</span>
          <div className="text-2xl font-bold text-red-700">{complaints.filter(c => c.severity >= 80).length} Priority</div>
        </Card>
        <Card className="p-4 bg-amber-50/50 border-amber-100 space-y-1">
          <span className="text-xs font-semibold text-amber-700 uppercase">Pending Inspection</span>
          <div className="text-2xl font-bold text-amber-700">{complaints.filter(c => c.status === 'assigned').length} Assigned</div>
        </Card>
        <Card className="p-4 bg-sky-50/50 border-sky-100 space-y-1">
          <span className="text-xs font-semibold text-sky-700 uppercase">In Repair</span>
          <div className="text-2xl font-bold text-sky-700">{complaints.filter(c => c.status === 'in_progress').length} Active</div>
        </Card>
        <Card className="p-4 bg-emerald-50/50 border-emerald-100 space-y-1">
          <span className="text-xs font-semibold text-emerald-700 uppercase">Resolved Today</span>
          <div className="text-2xl font-bold text-emerald-700">{complaints.filter(c => c.status === 'resolved').length} Completed</div>
        </Card>
      </div>

      {/* Tab Toggle */}
      <div className="flex border-b border-neutral-200 space-x-6 text-sm font-semibold text-neutral-500">
        <button
          onClick={() => setActiveTab('queue')}
          className={`pb-2 transition-colors ${activeTab === 'queue' ? 'text-brand-600 border-b-2 border-brand-600' : 'hover:text-neutral-800'}`}
        >
          Complaint Queue
        </button>
        <button
          onClick={() => setActiveTab('performance')}
          className={`pb-2 transition-colors ${activeTab === 'performance' ? 'text-brand-600 border-b-2 border-brand-600' : 'hover:text-neutral-800'}`}
        >
          My Performance
        </button>
        <button
          onClick={() => setActiveTab('map')}
          className={`pb-2 transition-colors ${activeTab === 'map' ? 'text-brand-600 border-b-2 border-brand-600' : 'hover:text-neutral-800'}`}
        >
          Ward Map
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'queue' && (
        <Card className="overflow-hidden shadow-soft-sm border border-neutral-200/80">
          <div className="p-4 border-b border-neutral-100 flex items-center justify-between">
            <h3 className="font-bold text-neutral-900 text-sm">Active Complaint Queue</h3>
            <span className="text-xs text-neutral-400">Sorted by Severity & SLA</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-neutral-600">
              <thead className="bg-neutral-50 border-b border-neutral-100 text-neutral-500 uppercase tracking-wider font-semibold">
                <tr>
                  <th className="px-4 py-3">Ticket ID</th>
                  <th className="px-4 py-3">Category & Title</th>
                  <th className="px-4 py-3">Ward Zone</th>
                  <th className="px-4 py-3">Severity</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {complaints.map((item) => (
                  <tr key={item.id} className="hover:bg-neutral-50/80 transition-colors">
                    <td className="px-4 py-3 font-mono font-medium text-neutral-900">{item.id}</td>
                    <td className="px-4 py-3">
                      <div className="font-semibold text-neutral-900">{item.title}</div>
                      <div className="text-[11px] text-neutral-400">{item.category}</div>
                    </td>
                    <td className="px-4 py-3 text-neutral-600">Ward #{item.ward}</td>
                    <td className="px-4 py-3"><SeverityBadge score={item.severity} /></td>
                    <td className="px-4 py-3"><StatusBadge status={item.status} /></td>
                    <td className="px-4 py-3 text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedTicket(item)}
                      >
                        Update Status
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {activeTab === 'performance' && (
        <div className="grid md:grid-cols-2 gap-6">
          {/* Weekly Resolution Chart */}
          <Card className="p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-neutral-900">Weekly Resolution Trend</h3>
              <Badge variant="success">+{OFFICER_PERFORMANCE.trend}% ↑</Badge>
            </div>
            <WeeklyChart data={OFFICER_PERFORMANCE.weeklyResolved} />
          </Card>

          {/* Category Breakdown Donut */}
          <Card className="p-5 space-y-4">
            <h3 className="font-bold text-sm text-neutral-900">Issue Category Breakdown</h3>
            <CategoryDonut data={OFFICER_PERFORMANCE.categoryBreakdown} />
          </Card>

          {/* Personal KPIs */}
          <Card className="p-5 space-y-3 md:col-span-2">
            <h3 className="font-bold text-sm text-neutral-900 flex items-center gap-2">
              <Award size={16} className="text-brand-600" />
              Performance Summary
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-3 bg-emerald-50/60 rounded-xl border border-emerald-100">
                <div className="text-xs text-emerald-700 font-semibold">Total Resolved</div>
                <div className="text-2xl font-bold text-emerald-800">{OFFICER_PERFORMANCE.totalResolved}</div>
              </div>
              <div className="p-3 bg-sky-50/60 rounded-xl border border-sky-100">
                <div className="text-xs text-sky-700 font-semibold">Avg Resolution</div>
                <div className="text-2xl font-bold text-sky-800">{OFFICER_PERFORMANCE.avgResolutionDays}d</div>
              </div>
              <div className="p-3 bg-amber-50/60 rounded-xl border border-amber-100">
                <div className="text-xs text-amber-700 font-semibold">This Month</div>
                <div className="text-2xl font-bold text-amber-800">{OFFICER_PERFORMANCE.lastMonthResolved}</div>
              </div>
              <div className="p-3 bg-brand-50/60 rounded-xl border border-brand-100">
                <div className="text-xs text-brand-700 font-semibold">Citizen Rating</div>
                <div className="text-2xl font-bold text-brand-800 flex items-center gap-1">
                  <Star size={16} className="text-amber-400 fill-amber-400" />
                  {OFFICER_PERFORMANCE.satisfactionRatio} / 5
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}

      {activeTab === 'map' && (
        <LeafletMap
          complaints={complaints}
          height="500px"
          zoom={13}
          center={[19.1152, 72.8680]}
        />
      )}

      {/* Update Status Modal */}
      <Modal
        open={!!selectedTicket}
        onClose={() => setSelectedTicket(null)}
        title={`Update Ticket #${selectedTicket?.id}`}
      >
        {selectedTicket && (
          <div className="space-y-4 text-xs">
            <div className="p-3 bg-neutral-50 rounded-xl space-y-1">
              <p className="font-bold text-neutral-900">{selectedTicket.title}</p>
              <p className="text-neutral-500">{selectedTicket.description}</p>
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-neutral-700">Select New Status</label>
              <select
                value={statusUpdate}
                onChange={(e) => setStatusUpdate(e.target.value)}
                className="w-full rounded-xl border border-neutral-200 p-2.5 text-xs font-medium text-neutral-700"
              >
                <option value="">-- Choose Status --</option>
                <option value="assigned">ASSIGNED (Inspection Dispatched)</option>
                <option value="in_progress">IN_PROGRESS (Work Crew on Site)</option>
                <option value="resolved">RESOLVED (Action Completed)</option>
                <option value="duplicate">DUPLICATE (Mark as Duplicate)</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-neutral-700">Officer Remarks / Work Log</label>
              <textarea
                rows={3}
                placeholder="Detail field inspection notes or contractor dispatch time..."
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                className="w-full rounded-xl border border-neutral-200 p-2.5 text-xs"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="ghost" onClick={() => setSelectedTicket(null)}>Cancel</Button>
              <Button variant="primary" onClick={handleUpdateStatus}>Confirm Status Update</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
