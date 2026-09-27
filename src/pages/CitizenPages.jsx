import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  AlertTriangle, MapPin, Camera, Mic, Sparkles, Clock, CheckCircle2,
  ThumbsUp, MessageSquare, Shield, Upload, Navigation, Filter,
  CloudRain, Wind, Thermometer, Eye, TrendingUp, BarChart3
} from 'lucide-react';
import { getComplaints, createComplaint, getMapData } from '../api/complaints.api';
import { getWeatherAQI } from '../api/weather.api';
import { ComplaintCard, StatusBadge, SeverityBadge, CategoryIcon } from '../components/complaints/ComplaintComponents';
import { Button } from '../components/common/Button';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { Input } from '../components/common/Input';
import { Modal } from '../components/common/Modal';
import { LeafletMap } from '../components/map/LeafletMap';
import { formatRelative } from '../utils/formatters';

// ── Citizen Dashboard ────────────────────────────────────────────────────────
export const CitizenDashboard = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [weather, setWeather] = useState(null);

  useEffect(() => {
    async function load() {
      try {
        const [res, weatherRes] = await Promise.all([
          getComplaints({ ward: 1 }),
          getWeatherAQI(19.076, 72.877),
        ]);
        setComplaints(res.data || []);
        setWeather(weatherRes.data || null);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Quick Action Hero Banner */}
      <div className="bg-gradient-to-r from-brand-700 to-sky-700 text-white rounded-2xl p-6 sm:p-8 shadow-soft-xl flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2 text-center md:text-left">
          <span className="text-xs font-semibold uppercase tracking-wider text-brand-200">Kaiser AI Assistant Active</span>
          <h2 className="text-2xl sm:text-3xl font-bold">See a civic issue in your ward?</h2>
          <p className="text-sm text-brand-100 max-w-lg">
            Snap a photo or record audio. Our AI will auto-fill category, severity, and location for instant municipal routing.
          </p>
        </div>
        <Link to="/app/report">
          <Button variant="secondary" size="lg" icon={AlertTriangle} className="shadow-lg whitespace-nowrap">
            Report Issue Now
          </Button>
        </Link>
      </div>

      {/* Weather + AQI Strip */}
      {weather && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Card className="p-3 flex items-center gap-3 bg-sky-50/60 border-sky-100">
            <div className="w-9 h-9 rounded-xl bg-sky-100 flex items-center justify-center text-sky-600">
              <Thermometer size={18} />
            </div>
            <div>
              <div className="text-lg font-bold text-neutral-900">{weather.temperature}°C</div>
              <div className="text-[11px] text-neutral-500 font-medium">{weather.condition || 'Moderate'}</div>
            </div>
          </Card>
          <Card className="p-3 flex items-center gap-3 bg-amber-50/60 border-amber-100">
            <div className="w-9 h-9 rounded-xl bg-amber-100 flex items-center justify-center text-amber-600">
              <Wind size={18} />
            </div>
            <div>
              <div className="text-lg font-bold text-neutral-900">AQI {weather.aqi}</div>
              <div className="text-[11px] text-neutral-500 font-medium">{weather.aqi > 100 ? 'Unhealthy' : 'Moderate'}</div>
            </div>
          </Card>
          <Card className="p-3 flex items-center gap-3 bg-blue-50/60 border-blue-100">
            <div className="w-9 h-9 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600">
              <CloudRain size={18} />
            </div>
            <div>
              <div className="text-lg font-bold text-neutral-900">{weather.humidity}%</div>
              <div className="text-[11px] text-neutral-500 font-medium">Humidity</div>
            </div>
          </Card>
          <Card className="p-3 flex items-center gap-3 bg-emerald-50/60 border-emerald-100">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-600">
              <Eye size={18} />
            </div>
            <div>
              <div className="text-lg font-bold text-neutral-900">Good</div>
              <div className="text-[11px] text-neutral-500 font-medium">Visibility</div>
            </div>
          </Card>
        </div>
      )}

      {/* Overview Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4 border-l-4 border-l-brand-600 space-y-1">
          <span className="text-xs font-semibold text-neutral-500 uppercase">My Submissions</span>
          <div className="text-2xl font-bold text-neutral-900">3 Active</div>
        </Card>
        <Card className="p-4 border-l-4 border-l-amber-500 space-y-1">
          <span className="text-xs font-semibold text-neutral-500 uppercase">In Progress</span>
          <div className="text-2xl font-bold text-amber-600">2 Issues</div>
        </Card>
        <Card className="p-4 border-l-4 border-l-emerald-500 space-y-1">
          <span className="text-xs font-semibold text-neutral-500 uppercase">Resolved</span>
          <div className="text-2xl font-bold text-emerald-600">8 Fixed</div>
        </Card>
        <Card className="p-4 border-l-4 border-l-sky-500 space-y-1">
          <span className="text-xs font-semibold text-neutral-500 uppercase">Ward Ranking</span>
          <div className="text-2xl font-bold text-sky-700">Top 5% Citizen</div>
        </Card>
      </div>

      {/* Recent Ward Activity Feed */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-neutral-900">Recent Complaints in Your Neighborhood</h3>
          <Link to="/app/my-complaints" className="text-xs font-semibold text-brand-600 hover:underline">
            View My Complaints →
          </Link>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          {complaints.slice(0, 4).map((c) => (
            <ComplaintCard key={c.id} complaint={c} />
          ))}
        </div>
      </div>
    </div>
  );
};

// ── Report Issue Form with AI Preview ─────────────────────────────────────────
export const ReportIssuePage = () => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Pothole',
    landmark: '',
    ward: 1,
    image: null
  });
  const [aiAnalyzing, setAiAnalyzing] = useState(false);
  const [aiPrediction, setAiPrediction] = useState(null);
  const [submitted, setSubmitted] = useState(false);

  const handleAiCategorize = () => {
    if (!formData.description && !formData.title) return;
    setAiAnalyzing(true);
    setTimeout(() => {
      setAiPrediction({
        category: 'Pothole',
        severity: 85,
        confidence: '97.8%',
        assignedDept: 'Roads & Traffic Department',
        slaHours: 24
      });
      setAiAnalyzing(false);
    }, 1200);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createComplaint(formData);
      setSubmitted(true);
    } catch (err) {
      console.error(err);
    }
  };

  if (submitted) {
    return (
      <div className="max-w-xl mx-auto py-12 text-center space-y-4">
        <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
          <CheckCircle2 size={36} />
        </div>
        <h2 className="text-2xl font-bold text-neutral-900">Grievance Registered Successfully!</h2>
        <p className="text-sm text-neutral-600">
          Your issue has been assigned Ticket ID <strong>#KS-2026-8891</strong> and dispatched directly to Assistant Engineer, K/E Ward.
        </p>
        <div className="pt-4 flex justify-center gap-3">
          <Link to="/app/my-complaints">
            <Button variant="primary">Track Status</Button>
          </Link>
          <Button variant="outline" onClick={() => { setSubmitted(false); setAiPrediction(null); setFormData({ title: '', description: '', category: 'Pothole', landmark: '', ward: 1, image: null }); }}>
            Report Another Issue
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-neutral-900">Report Civic Issue</h2>
        <p className="text-xs text-neutral-500">Provide details or let Kaiser AI auto-detect category & urgency.</p>
      </div>

      <Card className="p-6 space-y-6 shadow-soft-md">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Issue Title / Summary"
            placeholder="e.g. Open manhole cover near Western Express Highway"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            onBlur={handleAiCategorize}
            required
          />

          <div className="space-y-1">
            <label className="text-xs font-semibold text-neutral-700">Detailed Description</label>
            <textarea
              rows={3}
              className="w-full rounded-xl border border-neutral-200 p-3 text-xs focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
              placeholder="Describe what you see, specific landmark, or hazard level..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              onBlur={handleAiCategorize}
            />
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <Input
              label="Location Landmark"
              placeholder="Opposite Metro Station Exit 2"
              value={formData.landmark}
              onChange={(e) => setFormData({ ...formData, landmark: e.target.value })}
              required
            />
            <div className="space-y-1">
              <label className="text-xs font-semibold text-neutral-700">Municipal Ward</label>
              <select
                value={formData.ward}
                onChange={(e) => setFormData({ ...formData, ward: Number(e.target.value) })}
                className="w-full rounded-xl border border-neutral-200 p-2.5 text-xs font-medium text-neutral-700 focus:ring-2 focus:ring-brand-500/20"
              >
                <option value={1}>K/E (Andheri East)</option>
                <option value={2}>H/W (Bandra West)</option>
                <option value={3}>G/S (Worli)</option>
                <option value={4}>A (Colaba/Fort)</option>
              </select>
            </div>
          </div>

          {/* Image & Audio Upload simulation */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-neutral-700">Upload Media Evidence</label>
            <div className="border-2 border-dashed border-neutral-200 hover:border-brand-400 rounded-xl p-6 text-center space-y-2 bg-neutral-50 transition-colors cursor-pointer">
              <div className="flex justify-center gap-3 text-neutral-400">
                <Camera size={24} />
                <Mic size={24} />
                <Upload size={24} />
              </div>
              <p className="text-xs font-medium text-neutral-600">Click to upload photo or record voice description</p>
              <p className="text-[11px] text-neutral-400">PNG, JPG, MP3 up to 10MB</p>
            </div>
          </div>

          {/* AI Analysis Card Preview */}
          {aiAnalyzing && (
            <div className="p-4 bg-brand-50 rounded-xl flex items-center gap-3 text-xs text-brand-700 animate-pulse">
              <Sparkles size={18} className="text-brand-600" />
              <span>AI is analyzing complaint text & location for automatic category prediction...</span>
            </div>
          )}

          {aiPrediction && !aiAnalyzing && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl space-y-2 text-xs">
              <div className="flex items-center justify-between font-bold text-emerald-800">
                <span className="flex items-center gap-1.5"><Sparkles size={14} /> AI Recommendation</span>
                <span>Confidence: {aiPrediction.confidence}</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-neutral-700 pt-1">
                <div>Category: <strong>{aiPrediction.category}</strong></div>
                <div>Assigned Dept: <strong>{aiPrediction.assignedDept}</strong></div>
                <div>Estimated Urgency: <strong>Score {aiPrediction.severity}/100</strong></div>
                <div>Max Target SLA: <strong>{aiPrediction.slaHours} Hours</strong></div>
              </div>
            </div>
          )}

          <Button type="submit" variant="primary" className="w-full justify-center py-3 text-sm">
            Submit Grievance to BMC
          </Button>
        </form>
      </Card>
    </div>
  );
};

// ── My Complaints Page ────────────────────────────────────────────────────────
export const MyComplaintsPage = () => {
  const [complaints, setComplaints] = useState([]);
  const [activeTab, setActiveTab] = useState('ALL');

  useEffect(() => {
    async function load() {
      const res = await getComplaints();
      setComplaints(res.data || []);
    }
    load();
  }, []);

  const filtered = complaints.filter(c => {
    if (activeTab === 'IN_PROGRESS') return c.status === 'in_progress' || c.status === 'assigned';
    if (activeTab === 'RESOLVED') return c.status === 'resolved';
    return true;
  });

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-neutral-900">My Reported Complaints</h2>
          <p className="text-xs text-neutral-500">Track real-time progress and status of your submitted issues.</p>
        </div>
        <Link to="/app/report">
          <Button variant="primary" size="sm" icon={AlertTriangle}>New Report</Button>
        </Link>
      </div>

      {/* Filter Tabs */}
      <div className="flex border-b border-neutral-200 space-x-6 text-sm font-semibold text-neutral-500">
        <button
          onClick={() => setActiveTab('ALL')}
          className={`pb-2 transition-colors ${activeTab === 'ALL' ? 'text-brand-600 border-b-2 border-brand-600' : 'hover:text-neutral-800'}`}
        >
          All Issues ({complaints.length})
        </button>
        <button
          onClick={() => setActiveTab('IN_PROGRESS')}
          className={`pb-2 transition-colors ${activeTab === 'IN_PROGRESS' ? 'text-brand-600 border-b-2 border-brand-600' : 'hover:text-neutral-800'}`}
        >
          In Progress
        </button>
        <button
          onClick={() => setActiveTab('RESOLVED')}
          className={`pb-2 transition-colors ${activeTab === 'RESOLVED' ? 'text-brand-600 border-b-2 border-brand-600' : 'hover:text-neutral-800'}`}
        >
          Resolved
        </button>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {filtered.map(c => (
          <ComplaintCard key={c.id} complaint={c} />
        ))}
      </div>
    </div>
  );
};

// ── Interactive Issue Map Page with Real Leaflet ──────────────────────────────
export const IssueMapPage = () => {
  const [mapComplaints, setMapComplaints] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await getMapData();
        setMapComplaints(res.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const filteredComplaints = selectedCategory === 'All'
    ? mapComplaints
    : mapComplaints.filter(c => c.category === selectedCategory);

  const categories = ['All', 'Pothole', 'Garbage', 'Drainage', 'Streetlight', 'Water Leakage'];

  const totalOpen = mapComplaints.filter(c => c.status !== 'resolved').length;
  const totalCritical = mapComplaints.filter(c => c.severity >= 80).length;

  return (
    <div className="space-y-4 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-neutral-900">Mumbai Interactive Ward Map</h2>
          <p className="text-xs text-neutral-500">Visual geospatial map of reported potholes, garbage, and street light outages.</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="brand">Live Tracking</Badge>
          <Badge variant="amber">{totalOpen} Open Issues</Badge>
          {totalCritical > 0 && <Badge variant="red">{totalCritical} Critical</Badge>}
        </div>
      </div>

      {/* Category Filter Bar */}
      <div className="flex flex-wrap items-center gap-2">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border ${
              selectedCategory === cat
                ? 'bg-brand-600 text-white border-brand-600 shadow-brand'
                : 'bg-white text-neutral-600 border-neutral-200 hover:border-brand-300 hover:text-brand-700'
            }`}
          >
            {cat}
          </button>
        ))}
        <span className="text-xs text-neutral-400 ml-2">
          Showing {filteredComplaints.length} of {mapComplaints.length} issues
        </span>
      </div>

      {/* Map Container */}
      <div className="relative">
        <LeafletMap
          complaints={filteredComplaints}
          height="550px"
          zoom={12}
        />

        {/* Floating Legend */}
        <div className="absolute bottom-4 left-4 right-4 z-[1000] bg-white/95 backdrop-blur-md p-4 rounded-xl shadow-soft-xl border border-neutral-200/80 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4 text-xs">
            <span className="font-semibold text-neutral-700">Legend:</span>
            <span className="flex items-center gap-1 text-red-600 font-medium"><span className="w-2.5 h-2.5 rounded-full bg-red-600" /> Critical (80+)</span>
            <span className="flex items-center gap-1 text-orange-600 font-medium"><span className="w-2.5 h-2.5 rounded-full bg-orange-500" /> High (60-79)</span>
            <span className="flex items-center gap-1 text-amber-600 font-medium"><span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> Medium (40-59)</span>
            <span className="flex items-center gap-1 text-emerald-600 font-medium"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Low (&lt;40)</span>
          </div>
          <Link to="/app/report">
            <Button variant="primary" size="sm" icon={MapPin}>
              Report at My GPS Location
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};
