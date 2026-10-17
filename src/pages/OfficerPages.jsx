import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import {
  Clock, AlertTriangle, CheckCircle2, Shield, Search,
  TrendingUp, FileText, Activity, Award, Star,
  Thermometer, User, RefreshCw, Eye,
  ThumbsUp, Calendar, Building2,
  Phone, Mail, BadgeCheck, Target,
  Image as ImageIcon, X, ZoomIn, Sparkles
} from 'lucide-react';
import { getComplaints, updateComplaint } from '../api/complaints.api';
import { getWeatherAQI } from '../api/weather.api';
import { MUMBAI_WARDS, MOCK_OFFICERS, OFFICER_PERFORMANCE } from '../utils/mockData';
import { StatusBadge, SeverityBadge } from '../components/complaints/ComplaintComponents';
import { Button } from '../components/common/Button';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { LeafletMap } from '../components/map/LeafletMap';
import { SkeletonKpiCard, SkeletonRow } from '../components/common/Skeleton';
import { useAuth } from '../context/AuthContext';
import { FieldInspectionModal } from '../components/officer/FieldInspectionModal';
import { formatDate } from '../utils/formatters';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, AreaChart, Area, CartesianGrid
} from 'recharts';

// ── Helpers ────────────────────────────────────────────────────────────────────

const daysAgo = (iso) => {
  if (!iso) return 'Recent';
  const d = Math.floor((Date.now() - new Date(iso)) / 86400000);
  if (d <= 0) return 'Today';
  if (d === 1) return 'Yesterday';
  return `${d}d ago`;
};

const DEPT_GRADIENT = {
  'Roads & Infrastructure': 'from-amber-500 to-orange-500',
  'Sanitation':             'from-emerald-500 to-teal-500',
  'Water Supply':           'from-sky-500 to-blue-600',
  'Electrical':             'from-yellow-400 to-amber-500',
  'Building & Permits':     'from-purple-500 to-violet-600',
};

// ── Mini Charts ────────────────────────────────────────────────────────────────
const WeeklyChart = ({ data }) => (
  <ResponsiveContainer width="100%" height={150}>
    <BarChart data={data} barGap={3}>
      <XAxis dataKey="week" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
      <YAxis hide />
      <Tooltip contentStyle={{ fontSize: 11, borderRadius: 10, border: '1px solid #e2e8f0' }} />
      <Bar dataKey="resolved" fill="#16a34a" radius={[5, 5, 0, 0]} />
    </BarChart>
  </ResponsiveContainer>
);

const CategoryDonut = ({ data }) => (
  <ResponsiveContainer width="100%" height={200}>
    <PieChart>
      <Pie data={data} cx="50%" cy="50%" innerRadius={50} outerRadius={80}
        paddingAngle={3} dataKey="value" nameKey="name"
        label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
        labelLine={false} style={{ fontSize: 10 }}>
        {data.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
      </Pie>
      <Tooltip contentStyle={{ fontSize: 11, borderRadius: 10 }} />
    </PieChart>
  </ResponsiveContainer>
);

const MonthlyTrend = ({ data }) => (
  <ResponsiveContainer width="100%" height={130}>
    <AreaChart data={data}>
      <defs>
        <linearGradient id="trendGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="5%" stopColor="#16a34a" stopOpacity={0.25} />
          <stop offset="95%" stopColor="#16a34a" stopOpacity={0} />
        </linearGradient>
      </defs>
      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
      <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
      <YAxis hide />
      <Tooltip contentStyle={{ fontSize: 11, borderRadius: 10 }} />
      <Area type="monotone" dataKey="resolved" stroke="#16a34a" strokeWidth={2} fill="url(#trendGrad)" />
    </AreaChart>
  </ResponsiveContainer>
);

// ── Image Lightbox ─────────────────────────────────────────────────────────────
const ImageLightbox = ({ src, title, onClose }) => (
  <div className="fixed inset-0 z-[9999] bg-black/85 flex items-center justify-center p-4 backdrop-blur-sm" onClick={onClose}>
    <div className="relative max-w-3xl w-full" onClick={(e) => e.stopPropagation()}>
      <div className="flex items-center justify-between pb-3 text-white">
        <span className="font-semibold text-sm truncate">{title}</span>
        <button onClick={onClose} className="text-white/80 hover:text-white flex items-center gap-1.5 text-xs bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded-lg transition-colors">
          <X size={15} /> Close Photo
        </button>
      </div>
      <div className="rounded-2xl overflow-hidden bg-black/40 border border-white/10 shadow-2xl">
        <img src={src} alt={title} className="w-full object-contain max-h-[75vh]" />
      </div>
      <p className="text-white/60 text-xs text-center mt-3">Citizen Photographic Evidence · Inspected by Ward Officer</p>
    </div>
  </div>
);

// ── Complaint Detail Modal with Full Image Inspection ─────────────────────────
const ComplaintDetailModal = ({ complaint, onClose, onUpdate, onInspect }) => {
  const [prevId, setPrevId] = useState(complaint?.id);
  const [status, setStatus] = useState(complaint?.status || 'reported');
  const [remarks, setRemarks] = useState('');
  const [saving, setSaving] = useState(false);
  const [lightbox, setLightbox] = useState(false);

  if (complaint && complaint.id !== prevId) {
    setPrevId(complaint.id);
    setStatus(complaint.status);
    setRemarks('');
  }

  const handleSave = async () => {
    if (!complaint) return;
    setSaving(true);
    try {
      await onUpdate(complaint.id, {
        status,
        officerRemarks: remarks,
        updatedAt: new Date().toISOString(),
      });
      onClose();
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  if (!complaint) return null;
  const sevColor = complaint.severity >= 80 ? 'text-red-700 bg-red-50 border-red-200'
    : complaint.severity >= 60 ? 'text-amber-700 bg-amber-50 border-amber-200'
    : 'text-sky-700 bg-sky-50 border-sky-200';

  return (
    <>
      {lightbox && complaint.imageUrl && (
        <ImageLightbox src={complaint.imageUrl} title={complaint.title} onClose={() => setLightbox(false)} />
      )}
      <Modal open={!!complaint} onClose={onClose} title={`Complaint Review · ${complaint.id}`}>
        <div className="space-y-4 text-xs">
          {/* Image evidence section */}
          {complaint.imageUrl ? (
            <div className="relative rounded-xl overflow-hidden h-48 bg-neutral-100 group cursor-pointer border border-neutral-200 shadow-sm" onClick={() => setLightbox(true)}>
              <img src={complaint.imageUrl} alt={complaint.title} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all flex items-center justify-center">
                <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-white/95 text-neutral-800 rounded-xl px-3 py-1.5 flex items-center gap-1.5 font-semibold text-xs shadow-md">
                  <ZoomIn size={14} className="text-brand-600" /> Click to Inspect Full Image
                </div>
              </div>
              <div className="absolute top-2.5 right-2.5 bg-black/60 text-white text-[10px] px-2.5 py-1 rounded-full flex items-center gap-1 backdrop-blur-sm">
                <ImageIcon size={11} /> Citizen Evidence Photo
              </div>
            </div>
          ) : (
            <div className="h-28 bg-neutral-50 border border-neutral-200 rounded-xl flex items-center justify-center text-neutral-400">
              <div className="text-center">
                <ImageIcon size={24} className="mx-auto mb-1 opacity-40" />
                <p className="text-[11px]">No photographic evidence uploaded</p>
              </div>
            </div>
          )}

          {/* Grievance Details */}
          <div className="p-3.5 bg-neutral-50 rounded-xl border border-neutral-200 space-y-2">
            <p className="font-bold text-neutral-900 text-sm">{complaint.title}</p>
            <p className="text-neutral-600 leading-relaxed">{complaint.description}</p>
            <div className="flex flex-wrap gap-1.5 pt-1">
              <span className={`px-2.5 py-0.5 rounded-lg font-bold border text-[11px] ${sevColor}`}>Severity {complaint.severity}/100</span>
              <span className="px-2.5 py-0.5 bg-white border border-neutral-200 rounded-lg text-neutral-700 text-[11px] font-medium">{complaint.category}</span>
              <span className="px-2.5 py-0.5 bg-white border border-neutral-200 rounded-lg text-neutral-700 text-[11px] font-medium">Ward #{complaint.ward}</span>
              <span className="px-2.5 py-0.5 bg-white border border-neutral-200 rounded-lg text-neutral-700 text-[11px] flex items-center gap-1 font-medium"><ThumbsUp size={10} className="text-brand-600" />{complaint.upvoteCount || 0}</span>
            </div>
          </div>

          {/* Reporter & AI side by side */}
          <div className="grid grid-cols-2 gap-2.5">
            <div className="p-3 bg-sky-50 rounded-xl border border-sky-100">
              <p className="text-sky-700 font-bold mb-1 text-[11px] uppercase tracking-wide">Reported By</p>
              <p className="text-neutral-900 font-semibold">{complaint.createdBy?.name || 'Citizen'}</p>
              <p className="text-neutral-500 mt-0.5">{daysAgo(complaint.createdAt)}</p>
            </div>
            <div className="p-3 bg-purple-50 rounded-xl border border-purple-100">
              <p className="text-purple-700 font-bold mb-1 text-[11px] uppercase tracking-wide flex items-center gap-1">
                <Sparkles size={11} /> AI Assessment
              </p>
              <p className="text-neutral-900 font-semibold">Match Confidence: {Math.round((complaint.aiAnalysis?.confidence || 0.94) * 100)}%</p>
              <p className="text-neutral-500 mt-0.5">AQI: {complaint.aiAnalysis?.aqiAtLocation || 112}</p>
            </div>
          </div>

          {/* Status Update Dropdown */}
          <div className="space-y-1.5">
            <label className="font-bold text-neutral-800">Change Grievance Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full rounded-xl border border-neutral-300 p-2.5 text-xs font-semibold text-neutral-800 bg-white focus:outline-none focus:ring-2 focus:ring-brand-200"
            >
              <option value="reported">REPORTED – Awaiting Field Inspection</option>
              <option value="assigned">ASSIGNED – Inspection Team Dispatched</option>
              <option value="in_progress">IN PROGRESS – Ground Crew Repairing Issue</option>
              <option value="resolved">RESOLVED – Municipal Action Completed ✓</option>
              <option value="duplicate">DUPLICATE – Marked as Duplicate</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="font-bold text-neutral-800">Officer Action Remarks</label>
            <textarea
              rows={3}
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder="Record field report, contractor assignment, repair notes…"
              className="w-full rounded-xl border border-neutral-300 p-2.5 text-xs resize-none bg-white focus:outline-none focus:ring-2 focus:ring-brand-200"
            />
          </div>

          <div className="flex flex-wrap justify-end gap-2 pt-2 border-t border-neutral-100">
            <Button variant="ghost" onClick={onClose}>Cancel</Button>
            <Button
              variant="outline"
              onClick={() => {
                onClose();
                if (onInspect) onInspect(complaint);
              }}
              className="text-brand-600 border-brand-200 hover:bg-brand-50"
            >
              <Shield size={13} className="mr-1 text-brand-600" /> Field Seal & Inspection
            </Button>
            <Button variant="primary" onClick={handleSave} loading={saving}>Save & Update Status</Button>
          </div>
        </div>
      </Modal>
    </>
  );
};

// ── Complaint Row with Thumbnail Preview ───────────────────────────────────────
const ComplaintRow = ({ item, onView, onInspect }) => (
  <tr className="hover:bg-neutral-50/80 transition-colors group">
    <td className="px-4 py-3 font-mono text-[11px] font-semibold text-neutral-500">{item.id}</td>
    <td className="px-4 py-3">
      <div className="flex items-center gap-3">
        {item.imageUrl ? (
          <div className="w-10 h-10 rounded-xl overflow-hidden bg-neutral-100 shrink-0 border border-neutral-200 shadow-sm">
            <img src={item.imageUrl} alt="" className="w-full h-full object-cover" />
          </div>
        ) : (
          <div className="w-10 h-10 rounded-xl bg-neutral-100 flex items-center justify-center text-neutral-400 shrink-0">
            <ImageIcon size={16} />
          </div>
        )}
        <div className="min-w-0">
          <div className="font-bold text-neutral-900 text-xs line-clamp-1">{item.title}</div>
          <div className="text-[10px] text-neutral-400 mt-0.5">{item.category} · {daysAgo(item.createdAt)}</div>
        </div>
      </div>
    </td>
    <td className="px-4 py-3 text-xs text-neutral-600 font-medium">{item.createdBy?.name || 'Citizen'}</td>
    <td className="px-4 py-3"><SeverityBadge score={item.severity} /></td>
    <td className="px-4 py-3"><StatusBadge status={item.status} /></td>
    <td className="px-4 py-3 text-xs text-neutral-500">
      <span className="flex items-center gap-1 font-semibold"><ThumbsUp size={11} className="text-brand-600" />{item.upvoteCount || 0}</span>
    </td>
    <td className="px-4 py-3 text-right">
      <div className="flex items-center justify-end gap-1.5">
        <Button variant="outline" size="sm" onClick={() => onView(item)} className="text-xs font-semibold">
          <Eye size={12} className="mr-1" /> View
        </Button>
        <Button variant="primary" size="sm" onClick={() => onInspect(item)} className="text-xs font-semibold bg-brand-600 hover:bg-brand-700">
          <Shield size={12} className="mr-1" /> Inspect
        </Button>
      </div>
    </td>
  </tr>
);

// ── Profile Tab ────────────────────────────────────────────────────────────────
const ProfileTab = ({ officer }) => {
  if (!officer) return null;
  const deptCls = {
    'Roads & Infrastructure': 'bg-amber-50 text-amber-700 border-amber-200',
    'Sanitation':             'bg-emerald-50 text-emerald-700 border-emerald-200',
    'Water Supply':           'bg-sky-50 text-sky-700 border-sky-200',
    'Electrical':             'bg-yellow-50 text-yellow-700 border-yellow-200',
    'Building & Permits':     'bg-purple-50 text-purple-700 border-purple-200',
  }[officer.department] || 'bg-neutral-100 text-neutral-600 border-neutral-200';

  const grad = DEPT_GRADIENT[officer.department] || 'from-brand-500 to-blue-600';

  return (
    <div className="space-y-5">
      <Card className="p-6 bg-white border-neutral-200 shadow-sm" padding="">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
          <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${grad} flex items-center justify-center text-white text-2xl font-bold shadow-md`}>
            {officer.avatarInitials}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h2 className="text-xl font-bold text-neutral-900">{officer.name}</h2>
              <BadgeCheck size={18} className="text-brand-600" />
            </div>
            <p className="text-sm font-medium text-neutral-600 mb-2">{officer.wardName}</p>
            <div className="flex flex-wrap gap-2">
              <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${deptCls}`}>{officer.department}</span>
              <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${officer.status === 'Available' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : officer.status === 'Busy' ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-neutral-100 text-neutral-500 border-neutral-200'}`}>
                ● {officer.status}
              </span>
            </div>
          </div>
          <div className="text-right shrink-0">
            <div className="text-3xl font-bold text-neutral-900 flex items-center justify-end gap-1">
              <Star size={20} className="text-amber-400 fill-amber-400" />{officer.rating}
            </div>
            <div className="text-xs text-neutral-400">Citizen Rating</div>
          </div>
        </div>
      </Card>

      <div className="grid md:grid-cols-2 gap-4">
        <Card className="p-5 space-y-3 bg-white border-neutral-200 shadow-sm" padding="">
          <h3 className="font-bold text-sm text-neutral-900 flex items-center gap-2"><Phone size={14} className="text-brand-600" />Contact Details</h3>
          {[
            { icon: Mail,     label: 'Email',     value: officer.email    },
            { icon: Phone,    label: 'Phone',     value: officer.phone    },
            { icon: Building2,label: 'Ward Office',value: officer.wardName },
            { icon: Calendar, label: 'Joined',    value: formatDate(officer.joinedAt) },
          ].map(({ icon: Icon, label, value }) => (
            <div key={label} className="flex items-center gap-3 text-xs">
              <div className="w-8 h-8 bg-neutral-100 rounded-lg flex items-center justify-center shrink-0">
                <Icon size={13} className="text-neutral-500" />
              </div>
              <div>
                <div className="text-neutral-400">{label}</div>
                <div className="font-semibold text-neutral-800 break-all">{value}</div>
              </div>
            </div>
          ))}
        </Card>

        <Card className="p-5 space-y-3 bg-white border-neutral-200 shadow-sm" padding="">
          <h3 className="font-bold text-sm text-neutral-900 flex items-center gap-2"><BadgeCheck size={14} className="text-brand-600" />Official Credentials</h3>
          {[
            { label: 'Employee ID', value: officer.employeeId },
            { label: 'Officer ID',  value: officer.id         },
            { label: 'Department',  value: officer.department },
            { label: 'Ward Assignment', value: `Ward #${officer.ward} (${officer.wardName.split('–')[0]?.trim()})` },
          ].map(({ label, value }) => (
            <div key={label} className="flex justify-between text-xs py-2 border-b border-neutral-100 last:border-0">
              <span className="text-neutral-500">{label}</span>
              <span className="font-mono font-bold text-neutral-800">{value}</span>
            </div>
          ))}
        </Card>
      </div>

      <Card className="p-5 bg-white border-neutral-200 shadow-sm" padding="">
        <h3 className="font-bold text-sm text-neutral-900 mb-4 flex items-center gap-2"><Award size={14} className="text-brand-600" />Lifetime Performance</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: 'Total Resolved',     value: officer.resolvedCount,          cls: 'bg-emerald-50 border-emerald-100 text-emerald-800' },
            { label: 'Active Assignments', value: officer.assignedCount,           cls: 'bg-amber-50 border-amber-100 text-amber-800'       },
            { label: 'Avg Resolution',     value: `${officer.avgResolutionDays}d`, cls: 'bg-sky-50 border-sky-100 text-sky-800'             },
            { label: 'Citizen Rating',     value: `${officer.rating}/5 ⭐`,        cls: 'bg-brand-50 border-brand-100 text-brand-800'       },
          ].map(({ label, value, cls }) => (
            <div key={label} className={`p-3 rounded-xl border ${cls}`}>
              <div className="text-[10px] font-semibold uppercase tracking-wide opacity-70">{label}</div>
              <div className="text-xl font-bold mt-1">{value}</div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

// ── Notifications Tab ──────────────────────────────────────────────────────────
const NotificationsTab = ({ officerName, wardComplaints }) => {
  const criticalCount = wardComplaints.filter(c => c.severity >= 80 && c.status !== 'resolved').length;
  const pendingCount  = wardComplaints.filter(c => c.status === 'reported').length;

  const items = [
    { id: 1, type: 'critical', title: `${criticalCount} Critical grievances require immediate inspection`, body: `High-priority issues reported by citizens in your ward require dispatch, ${officerName}.`, time: 'Just now', read: false },
    { id: 2, type: 'update',   title: 'Citizen uploaded new photo evidence', body: 'A citizen attached photographic evidence for an assigned pothole grievance.', time: '2h ago', read: false },
    { id: 3, type: 'assigned', title: `${pendingCount} new grievances dispatched via GPS auto-routing`, body: 'System AI has classified citizen reports into your ward queue.', time: '4h ago', read: false },
    { id: 4, type: 'resolved', title: 'Citizen confirmed resolution feedback', body: 'Civic repair action acknowledged by citizen with 5-star rating.', time: '1 day ago', read: true },
    { id: 5, type: 'reminder', title: 'SLA target approaching (24-hour window)', body: '2 issues are within 4 hours of their municipal SLA target.', time: '2 days ago', read: true },
  ];

  const TYPE_CFG = {
    critical: { cls: 'bg-red-50 border-red-200 text-red-600',     icon: AlertTriangle },
    update:   { cls: 'bg-sky-50 border-sky-200 text-sky-600',      icon: RefreshCw     },
    resolved: { cls: 'bg-emerald-50 border-emerald-200 text-emerald-600', icon: CheckCircle2 },
    assigned: { cls: 'bg-brand-50 border-brand-200 text-brand-600',icon: FileText      },
    reminder: { cls: 'bg-amber-50 border-amber-200 text-amber-600',icon: Clock         },
  };

  return (
    <div className="space-y-3 max-w-3xl">
      <div className="flex items-center justify-between mb-1">
        <h3 className="font-bold text-sm text-neutral-900">Notifications for {officerName}</h3>
        <span className="text-xs text-neutral-400">{items.filter(i => !i.read).length} unread</span>
      </div>
      {items.map((n) => {
        const { cls, icon: Icon } = TYPE_CFG[n.type] || TYPE_CFG.update;
        return (
          <Card key={n.id} className={`flex items-start gap-3 p-4 bg-white border border-neutral-200 shadow-sm transition-all ${!n.read ? 'ring-1 ring-brand-200' : ''}`} padding="">
            <div className={`w-8 h-8 rounded-xl border flex items-center justify-center shrink-0 ${cls}`}>
              <Icon size={14} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-bold text-neutral-900 text-xs">{n.title}</span>
                {!n.read && <span className="w-1.5 h-1.5 bg-brand-600 rounded-full shrink-0" />}
              </div>
              <p className="text-[11px] text-neutral-500 mt-0.5 leading-relaxed">{n.body}</p>
            </div>
            <span className="text-[10px] text-neutral-400 shrink-0 mt-0.5">{n.time}</span>
          </Card>
        );
      })}
    </div>
  );
};

// ── Performance Tab ────────────────────────────────────────────────────────────
const PerformanceTab = ({ officer, perfData, monthlyData }) => (
  <div className="space-y-5">
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {[
        { label: 'Total Resolved', value: perfData.totalResolved,          icon: CheckCircle2, cls: 'bg-emerald-50 border-emerald-100 text-emerald-700' },
        { label: 'Avg Resolution', value: `${perfData.avgResolutionDays}d`,icon: Clock,        cls: 'bg-sky-50 border-sky-100 text-sky-700'             },
        { label: 'This Month',     value: perfData.lastMonthResolved,       icon: TrendingUp,   cls: 'bg-amber-50 border-amber-100 text-amber-700'       },
        { label: 'Citizen Rating', value: `${perfData.satisfactionRatio}/5`,icon: Star,         cls: 'bg-brand-50 border-brand-100 text-brand-700'       },
      ].map(({ label, value, icon: Icon, cls }) => (
        <Card key={label} className={`p-4 border bg-white ${cls} shadow-sm`} padding="">
          <div className="flex items-center gap-2 mb-2">
            <Icon size={14} />
            <span className="text-[11px] font-semibold uppercase tracking-wide opacity-70">{label}</span>
          </div>
          <div className="text-2xl font-bold">{value}</div>
        </Card>
      ))}
    </div>

    <div className="grid md:grid-cols-2 gap-5">
      <Card className="p-5 space-y-3 bg-white border-neutral-200 shadow-sm" padding="">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-sm text-neutral-900">Weekly Resolutions — {officer?.name}</h3>
          <Badge variant="success">+{perfData.trend}% ↑</Badge>
        </div>
        <WeeklyChart data={perfData.weeklyResolved} />
      </Card>
      <Card className="p-5 space-y-3 bg-white border-neutral-200 shadow-sm" padding="">
        <h3 className="font-bold text-sm text-neutral-900">Category Breakdown</h3>
        <CategoryDonut data={perfData.categoryBreakdown} />
      </Card>
    </div>

    <Card className="p-5 space-y-3 bg-white border-neutral-200 shadow-sm" padding="">
      <h3 className="font-bold text-sm text-neutral-900">6-Month Resolution Trend</h3>
      <MonthlyTrend data={monthlyData} />
    </Card>

    <Card className="p-5 bg-white border-neutral-200 shadow-sm" padding="">
      <h3 className="font-bold text-sm text-neutral-900 mb-4 flex items-center gap-2"><Target size={14} className="text-brand-600" />Category Performance</h3>
      <div className="space-y-3">
        {perfData.categoryBreakdown.map((cat) => {
          const pct = Math.round((cat.value / (perfData.totalResolved || 1)) * 100);
          return (
            <div key={cat.name}>
              <div className="flex justify-between text-xs mb-1">
                <span className="font-medium text-neutral-700">{cat.name}</span>
                <span className="text-neutral-500 font-semibold">{cat.value} ({pct}%)</span>
              </div>
              <div className="h-2 bg-neutral-100 rounded-full overflow-hidden">
                <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, backgroundColor: cat.fill }} />
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  </div>
);

// ── Ward Map Tab ───────────────────────────────────────────────────────────────
const MapTab = ({ complaints, officer }) => {
  const wardCoords = useMemo(() => {
    const wardObj = MUMBAI_WARDS.find(w => w.id === officer?.ward);
    if (wardObj) return [wardObj.lat, wardObj.lng];
    if (complaints.length) {
      const lat = complaints.reduce((s, c) => s + c.latitude, 0) / complaints.length;
      const lng = complaints.reduce((s, c) => s + c.longitude, 0) / complaints.length;
      return [lat, lng];
    }
    return [19.076, 72.877];
  }, [complaints, officer]);

  return (
    <div className="space-y-3">
      <Card padding="" className="overflow-hidden bg-white border-neutral-200 shadow-sm">
        <div className="px-4 py-3 border-b border-neutral-200 flex items-center justify-between flex-wrap gap-2">
          <div>
            <h3 className="font-bold text-sm text-neutral-900">Ward Heatmap & GPS Locations — {officer?.name}</h3>
            <p className="text-xs text-neutral-500 mt-0.5">{complaints.length} active complaints in {officer?.wardName}</p>
          </div>
          <div className="flex items-center gap-3 text-[10px] font-semibold">
            {[['#dc2626','Critical (80+)'],['#f97316','High (60-79)'],['#f59e0b','Medium'],['#22c55e','Low']].map(([c,l]) => (
              <span key={l} className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full" style={{backgroundColor:c}} />{l}</span>
            ))}
          </div>
        </div>
      </Card>
      <LeafletMap complaints={complaints} height="520px" zoom={14} center={wardCoords} />
    </div>
  );
};

// ── MAIN Officer Dashboard ─────────────────────────────────────────────────────
export const OfficerDashboard = ({ activeTabOverride }) => {
  const { user } = useAuth();
  const { officerId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  // ── ACCESS CONTROL: Officer can only see their own dashboard ──────────────
  // Resolve the logged-in officer from auth context or localStorage
  const loggedInOfficer = useMemo(() => {
    if (user?.role === 'officer' && user?.id) {
      const matched = MOCK_OFFICERS.find((o) => o.id === user.id);
      if (matched) return matched;
    }
    const storedId = localStorage.getItem('kaiser_officer_id');
    if (storedId) {
      const matched = MOCK_OFFICERS.find((o) => o.id === storedId);
      if (matched) return matched;
    }
    return null;
  }, [user]);

  // If a URL param :officerId is present and doesn't match the logged-in
  // officer, force-redirect to the logged-in officer's own dashboard.
  useEffect(() => {
    if (!loggedInOfficer) return;
    if (officerId && officerId !== loggedInOfficer.id) {
      navigate(`/officer/${loggedInOfficer.id}`, { replace: true });
    }
  }, [officerId, loggedInOfficer, navigate]);

  // The officer profile is always the logged-in officer (never another)
  const officerProfile = loggedInOfficer || MOCK_OFFICERS[0];

  // Determine active tab from route or activeTabOverride
  const activeTab = useMemo(() => {
    const p = location.pathname;
    if (p.endsWith('/ward-overview') || p.includes('/map')) return 'map';
    if (p.endsWith('/performance')) return 'performance';
    if (p.endsWith('/notifications')) return 'notifications';
    if (p.endsWith('/profile')) return 'profile';
    return activeTabOverride || 'queue';
  }, [location.pathname, activeTabOverride]);

  const [complaints,       setComplaints]       = useState([]);
  const [selectedTicket,   setSelectedTicket]   = useState(null);
  const [inspectionTicket, setInspectionTicket] = useState(null);
  const [weather,          setWeather]          = useState(null);
  const [filterStatus,     setFilterStatus]     = useState('all');
  const [filterCat,        setFilterCat]        = useState('all');
  const [searchQ,          setSearchQ]          = useState('');
  const [loading,          setLoading]          = useState(true);

  // Load ward complaints and weather
  useEffect(() => {
    let ignore = false;
    async function loadData() {
      if (!officerProfile) return;
      try {
        const wardObj = MUMBAI_WARDS.find((w) => w.id === officerProfile.ward);
        const lat = wardObj?.lat || 19.076;
        const lng = wardObj?.lng || 72.877;

        const [weatherRes, complaintsRes] = await Promise.all([
          getWeatherAQI(lat, lng),
          getComplaints({ ward: officerProfile.ward }),
        ]);
        if (!ignore) {
          setWeather(weatherRes.data || null);
          setComplaints(complaintsRes.data || []);
        }
      } catch (e) {
        console.error(e);
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }
    loadData();
    return () => {
      ignore = true;
    };
  }, [officerProfile]);

  // Handle switching tabs
  const handleTabClick = (tabId) => {
    const basePath = `/officer/${officerProfile.id}`;
    if (tabId === 'queue') navigate(basePath);
    else if (tabId === 'map') navigate(`${basePath}/ward-overview`);
    else if (tabId === 'performance') navigate(`${basePath}/performance`);
    else if (tabId === 'notifications') navigate(`${basePath}/notifications`);
    else if (tabId === 'profile') navigate(`${basePath}/profile`);
  };

  const filteredComplaints = useMemo(() =>
    complaints.filter((c) => {
      const matchStatus = filterStatus === 'all' || c.status === filterStatus;
      const matchCat    = filterCat    === 'all' || c.category === filterCat;
      const matchSearch = !searchQ || c.title.toLowerCase().includes(searchQ.toLowerCase()) || c.id.includes(searchQ);
      return matchStatus && matchCat && matchSearch;
    }).sort((a, b) => b.severity - a.severity),
  [complaints, filterStatus, filterCat, searchQ]);

  const handleUpdateStatus = useCallback(async (id, payload) => {
    await updateComplaint(id, payload);
    setComplaints((prev) => prev.map((c) => c.id === id ? { ...c, ...payload } : c));
  }, []);

  const stats = useMemo(() => ({
    critical:   complaints.filter((c) => c.severity >= 80).length,
    pending:    complaints.filter((c) => c.status === 'reported' || c.status === 'assigned').length,
    inProgress: complaints.filter((c) => c.status === 'in_progress').length,
    resolved:   complaints.filter((c) => c.status === 'resolved').length,
  }), [complaints]);

  // Dynamic category breakdown derived from the officer's ward complaints
  const dynamicCategoryBreakdown = useMemo(() => {
    const COLORS = {
      'Pothole': '#16a34a',
      'Drainage': '#0ea5e9',
      'Streetlight': '#f59e0b',
      'Garbage': '#ea580c',
      'Water Leakage': '#6366f1',
      'Other': '#8b5cf6',
    };
    const counts = {};
    complaints.forEach((c) => {
      const cat = c.category || 'Other';
      counts[cat] = (counts[cat] || 0) + 1;
    });

    const entries = Object.entries(counts).map(([name, value]) => ({
      name,
      value,
      fill: COLORS[name] || '#64748b',
    }));

    if (entries.length > 0) return entries;

    // SYNTHETIC_BENCHMARK_DATA: Normalized category baseline scaled to officer's career resolved count
    const base = officerProfile?.resolvedCount || 100;
    return [
      { name: 'Pothole',       value: Math.round(base * 0.38), fill: '#16a34a' },
      { name: 'Drainage',      value: Math.round(base * 0.24), fill: '#0ea5e9' },
      { name: 'Streetlight',   value: Math.round(base * 0.20), fill: '#f59e0b' },
      { name: 'Garbage',       value: Math.round(base * 0.12), fill: '#ea580c' },
      { name: 'Water Leakage', value: Math.round(base * 0.06), fill: '#6366f1' },
    ];
  }, [complaints, officerProfile]);

  // SYNTHETIC_BENCHMARK_DATA: 8-week resolution trend derived deterministically from officer's total resolved count
  const dynamicWeeklyResolved = useMemo(() => {
    const base = Math.max(1, Math.round((officerProfile?.resolvedCount || 120) / 24));
    const factors = [0.9, 1.2, 0.7, 1.1, 1.4, 0.8, 1.6, 1.1];
    return factors.map((f, i) => ({
      week: `Wk ${i + 1}`,
      resolved: Math.max(1, Math.round(base * f)),
    }));
  }, [officerProfile]);

  const perfData = useMemo(() => {
    const activeComplaintsInWard = complaints.filter((c) => c.status !== 'resolved').length;
    const resolvedInWard = complaints.filter((c) => c.status === 'resolved').length;
    const baseResolved = officerProfile?.resolvedCount || OFFICER_PERFORMANCE.totalResolved;

    return {
      ...OFFICER_PERFORMANCE,
      totalResolved:     baseResolved + resolvedInWard,
      assignedCount:     activeComplaintsInWard || officerProfile?.assignedCount || 12,
      avgResolutionDays: officerProfile?.avgResolutionDays || OFFICER_PERFORMANCE.avgResolutionDays,
      lastMonthResolved: Math.round(baseResolved * 0.12),
      satisfactionRatio: officerProfile?.rating            || OFFICER_PERFORMANCE.satisfactionRatio,
      categoryBreakdown: dynamicCategoryBreakdown,
      weeklyResolved:    dynamicWeeklyResolved,
    };
  }, [officerProfile, complaints, dynamicCategoryBreakdown, dynamicWeeklyResolved]);

  const monthlyData = useMemo(() => {
    const base = perfData.totalResolved;
    return [
      { month: 'May', resolved: Math.round(base * 0.10) },
      { month: 'Jun', resolved: Math.round(base * 0.14) },
      { month: 'Jul', resolved: Math.round(base * 0.18) },
      { month: 'Aug', resolved: Math.round(base * 0.22) },
      { month: 'Sep', resolved: Math.round(base * 0.15) },
      { month: 'Oct', resolved: Math.round(base * 0.11) },
    ];
  }, [perfData]);

  const TABS = [
    { id: 'queue',         label: 'Complaint Queue', count: complaints.length },
    { id: 'performance',   label: 'My Performance'                            },
    { id: 'map',           label: 'Ward Map'                                  },
    { id: 'profile',       label: 'My Profile'                                },
    { id: 'notifications', label: 'Notifications', count: 3                   },
  ];

  const grad = DEPT_GRADIENT[officerProfile?.department] || 'from-brand-500 to-blue-600';

  if (loading) return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <SkeletonKpiCard />
        <SkeletonKpiCard />
        <SkeletonKpiCard />
        <SkeletonKpiCard />
      </div>
      <Card className="p-6 bg-white border-neutral-200 shadow-sm" padding="">
        <div className="space-y-4">
          <SkeletonRow />
          <SkeletonRow />
          <SkeletonRow />
          <SkeletonRow />
        </div>
      </Card>
    </div>
  );

  return (
    <div className="space-y-5 max-w-7xl mx-auto">

      {/* ── Officer Header Banner (prominently displays officer name & ward) ── */}
      <div className="bg-white border border-neutral-200 rounded-2xl p-5 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className={`w-14 h-14 bg-gradient-to-br ${grad} rounded-2xl flex items-center justify-center text-white text-xl font-bold shadow-md shrink-0`}>
            {officerProfile?.avatarInitials}
          </div>
          <div>
            <div className="flex items-center gap-2 mb-0.5 flex-wrap">
              <Badge variant="brand">{officerProfile?.wardName?.split('–')[0]?.trim()}</Badge>
              <span className="text-[11px] text-neutral-400 font-mono font-medium">{officerProfile?.employeeId}</span>
              <span className="text-[11px] text-emerald-600 font-semibold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                ● {officerProfile?.status}
              </span>
            </div>
            <h1 className="text-xl font-bold text-neutral-900">{officerProfile?.name}</h1>
            <p className="text-xs text-neutral-500">{officerProfile?.department} · Designated Ward Officer</p>
          </div>
        </div>

        {/* Live Weather & Controls */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Officer Identity (read-only — no switcher) */}
          <div className="flex items-center gap-1.5 bg-neutral-50 border border-neutral-200 px-3 py-2 rounded-xl shadow-sm">
            <User size={14} className="text-brand-600 shrink-0" />
            <div className="text-left">
              <span className="text-[10px] uppercase font-bold text-neutral-400 block leading-tight">Signed In Officer</span>
              <span className="text-xs font-bold text-neutral-800">#{officerProfile?.ward} {officerProfile?.name}</span>
            </div>
          </div>

          {weather && (
            <Card className="px-3 py-2 bg-sky-50/70 border-sky-100 flex items-center gap-2 shadow-sm" padding="">
              <Thermometer size={16} className="text-sky-500 shrink-0" />
              <div>
                <div className="text-xs font-bold text-neutral-800">{weather.temperature}°C · AQI {weather.aqi}</div>
                <div className="text-[10px] text-neutral-500">{weather.condition}</div>
              </div>
            </Card>
          )}

          <div className="flex items-center gap-1">
            <Button variant="outline" size="sm" onClick={loadWardData} icon={RefreshCw} title="Refresh data">
              Refresh
            </Button>
          </div>
        </div>
      </div>

      {/* ── Ward Stats Strip ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Critical Issues',  value: stats.critical,   icon: AlertTriangle, cls: 'bg-red-50 border-red-200 text-red-700' },
          { label: 'Pending Review',   value: stats.pending,    icon: Clock,        cls: 'bg-amber-50 border-amber-200 text-amber-700' },
          { label: 'In Progress Work', value: stats.inProgress, icon: Activity,     cls: 'bg-sky-50 border-sky-200 text-sky-700' },
          { label: 'Ward Resolved',    value: stats.resolved,   icon: CheckCircle2, cls: 'bg-emerald-50 border-emerald-200 text-emerald-700' },
        ].map(({ label, value, icon: Icon, cls }) => (
          <Card key={label} className={`p-4 border bg-white ${cls} shadow-sm`} padding="">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px] font-semibold uppercase tracking-wide opacity-75">{label}</span>
              <Icon size={15} />
            </div>
            <div className="text-2xl font-bold">{value}</div>
            <p className="text-[10px] opacity-70 mt-0.5">In {officerProfile?.wardName?.split('–')[0]?.trim()}</p>
          </Card>
        ))}
      </div>

      {/* ── Navigation Tab Strip ── */}
      <div className="border-b border-neutral-200 flex gap-1 overflow-x-auto pb-0.5">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => handleTabClick(t.id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              activeTab === t.id
                ? 'bg-brand-600 text-white shadow-brand shadow-sm'
                : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
            }`}
          >
            <span>{t.label}</span>
            {t.count !== undefined && (
              <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                activeTab === t.id ? 'bg-white/20 text-white' : 'bg-neutral-200 text-neutral-700'
              }`}>
                {t.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ── Tab: Complaint Queue ── */}
      {activeTab === 'queue' && (
        <Card className="overflow-hidden bg-white border-neutral-200 shadow-sm" padding="">
          {/* Filter and Search Bar */}
          <div className="p-4 border-b border-neutral-200 flex flex-col sm:flex-row items-center justify-between gap-3 bg-neutral-50/50">
            <div className="relative w-full sm:w-72">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
              <input
                type="text"
                placeholder="Search grievances, ID, citizen…"
                value={searchQ}
                onChange={(e) => setSearchQ(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-white border border-neutral-200 rounded-xl text-xs text-neutral-800 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-brand-200"
              />
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-2 bg-white border border-neutral-200 rounded-xl text-xs font-semibold text-neutral-700 focus:outline-none shadow-sm"
              >
                <option value="all">All Statuses</option>
                <option value="reported">Reported</option>
                <option value="assigned">Assigned</option>
                <option value="in_progress">In Progress</option>
                <option value="resolved">Resolved</option>
              </select>
              <select
                value={filterCat}
                onChange={(e) => setFilterCat(e.target.value)}
                className="px-3 py-2 bg-white border border-neutral-200 rounded-xl text-xs font-semibold text-neutral-700 focus:outline-none shadow-sm"
              >
                <option value="all">All Categories</option>
                <option value="Pothole">Pothole</option>
                <option value="Garbage">Garbage</option>
                <option value="Drainage">Drainage</option>
                <option value="Streetlight">Streetlight</option>
                <option value="Water Leakage">Water Leakage</option>
              </select>
            </div>
          </div>

          {/* Queue Table */}
          {filteredComplaints.length === 0 ? (
            <div className="text-center py-16 space-y-2">
              <CheckCircle2 size={36} className="mx-auto text-emerald-500" />
              <p className="font-bold text-neutral-800 text-sm">No complaints found</p>
              <p className="text-xs text-neutral-400">All grievances matching filters in {officerProfile?.name}'s ward are clear.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-neutral-50/80 border-b border-neutral-200 text-neutral-500 text-[11px] font-semibold uppercase tracking-wider">
                  <tr>
                    <th className="px-4 py-3">ID</th>
                    <th className="px-4 py-3">Grievance & Evidence Photo</th>
                    <th className="px-4 py-3">Citizen</th>
                    <th className="px-4 py-3">Severity</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Upvotes</th>
                    <th className="px-4 py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 text-xs">
                  {filteredComplaints.map((item) => (
                    <ComplaintRow
                      key={item.id}
                      item={item}
                      onView={setSelectedTicket}
                      onInspect={setInspectionTicket}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      )}

      {/* ── Tab: Performance ── */}
      {activeTab === 'performance' && (
        <PerformanceTab officer={officerProfile} perfData={perfData} monthlyData={monthlyData} />
      )}

      {/* ── Tab: Ward Map ── */}
      {activeTab === 'map' && (
        <MapTab complaints={complaints} officer={officerProfile} />
      )}

      {/* ── Tab: Profile ── */}
      {activeTab === 'profile' && (
        <ProfileTab officer={officerProfile} />
      )}

      {/* ── Tab: Notifications ── */}
      {activeTab === 'notifications' && (
        <NotificationsTab officerName={officerProfile?.name || 'Officer'} wardComplaints={complaints} />
      )}

      {/* ── Complaint Detail Modal with Image Lightbox ── */}
      <ComplaintDetailModal
        complaint={selectedTicket}
        onClose={() => setSelectedTicket(null)}
        onUpdate={handleUpdateStatus}
        onInspect={setInspectionTicket}
      />

      {/* ── Field Inspection & Digital Seal Modal ── */}
      <FieldInspectionModal
        complaint={inspectionTicket}
        officer={officerProfile}
        isOpen={!!inspectionTicket}
        onClose={() => setInspectionTicket(null)}
        onResolveSuccess={(updated) => {
          handleUpdateStatus(updated.id, {
            status: 'resolved',
            officerRemarks: updated.officerNotes,
            resolvedAt: updated.resolvedAt,
          });
        }}
      />
    </div>
  );
};
