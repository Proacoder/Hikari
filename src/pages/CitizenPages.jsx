import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  AlertTriangle, MapPin, Camera, Mic, Sparkles, Clock, CheckCircle2,
  ThumbsUp, MessageSquare, Shield, Upload, Navigation, Filter,
  CloudRain, Wind, Thermometer, Eye, TrendingUp, BarChart3,
  Crosshair, Image as ImageIcon, X, ArrowRight, User, Bell, Award, Check
} from 'lucide-react';
import { getComplaints, createComplaint, getMapData, getStoredComplaints } from '../api/complaints.api';
import { getWeatherAQI } from '../api/weather.api';
import { ComplaintCard, StatusBadge, SeverityBadge, CategoryIcon } from '../components/complaints/ComplaintComponents';
import { Button } from '../components/common/Button';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { Input } from '../components/common/Input';
import { LeafletMap } from '../components/map/LeafletMap';
import { MUMBAI_WARDS, MOCK_OFFICERS, CATEGORIES, MOCK_NOTIFICATIONS } from '../utils/mockData';
import { useAuth } from '../context/AuthContext';

// ── Distance & Ward Classifier Helper ─────────────────────────────────────────
function findNearestWard(lat, lng) {
  let nearest = MUMBAI_WARDS[0];
  let minDistance = Infinity;

  for (const w of MUMBAI_WARDS) {
    const dLat = (w.lat - lat) * 111;
    const dLng = (w.lng - lng) * 111 * Math.cos(lat * Math.PI / 180);
    const dist = Math.sqrt(dLat * dLat + dLng * dLng);
    if (dist < minDistance) {
      minDistance = dist;
      nearest = w;
    }
  }
  return { ward: nearest, distanceKm: minDistance.toFixed(2) };
}

// Preset samples for quick image upload testing
const SAMPLE_EVIDENCE = [
  { label: 'Pothole on Road', url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80', cat: 'Pothole', title: 'Deep Pothole at Main Junction' },
  { label: 'Overflowing Bins', url: 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=600&q=80', cat: 'Garbage', title: 'Severe Garbage Overflow at Market' },
  { label: 'Clogged Drain', url: 'https://images.unsplash.com/photo-1547683905-f686c993aae5?w=600&q=80', cat: 'Drainage', title: 'Storm Drain Blocked with Silt' },
  { label: 'Broken Streetlamp', url: 'https://images.unsplash.com/photo-1518893883800-45cd0954574b?w=600&q=80', cat: 'Streetlight', title: 'Non-functional Street Lamp Pole' },
  { label: 'Water Pipe Burst', url: 'https://images.unsplash.com/photo-1570887830800-53c6e09d99f7?w=600&q=80', cat: 'Water Leakage', title: 'High-pressure Pipeline Leak' },
];

// Quick Mumbai locations for testing GPS classification
const LOCATION_PRESETS = [
  { label: 'Colaba', lat: 18.9067, lng: 72.8280, landmark: 'Colaba Causeway, near Regal Cinema' },
  { label: 'Bandra', lat: 19.0596, lng: 72.8296, landmark: 'Linking Road, near Bandra Station' },
  { label: 'Andheri East', lat: 19.1152, lng: 72.8680, landmark: 'JB Nagar Metro Station, Andheri-Kurla Rd' },
  { label: 'Kurla', lat: 19.0726, lng: 72.8849, landmark: 'LBS Marg, Kurla West' },
  { label: 'Ghatkopar', lat: 19.0868, lng: 72.9083, landmark: 'Ghatkopar Railway Station exit' },
  { label: 'Borivali', lat: 19.2292, lng: 72.8660, landmark: 'SV Road, Borivali East' },
];

// ── Citizen Dashboard ────────────────────────────────────────────────────────
export const CitizenDashboard = () => {
  const { user } = useAuth();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [weather, setWeather] = useState(null);

  // Dynamic assigned ward officer for this citizen's ward
  const assignedOfficer = useMemo(() => {
    const wardId = user?.ward || 8;
    return MOCK_OFFICERS.find((o) => o.ward === wardId) || MOCK_OFFICERS[0];
  }, [user]);

  useEffect(() => {
    async function load() {
      try {
        const [res, weatherRes] = await Promise.all([
          getComplaints(user?.ward ? { ward: user.ward } : { limit: 6 }),
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
  }, [user]);

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Quick Action Hero Banner */}
      <div className="bg-gradient-to-r from-brand-700 via-sky-700 to-blue-800 text-white rounded-2xl p-6 sm:p-8 shadow-soft-xl flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2 text-center md:text-left">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/15 backdrop-blur-sm rounded-full text-xs font-semibold text-brand-100">
            <Sparkles size={13} className="text-amber-300" /> Kaiser AI Citizen Portal · {user?.wardName?.split('–')[0]?.trim() || 'Ward #8'}
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold">Welcome back, {user?.name || 'Citizen'}!</h2>
          <p className="text-sm text-brand-100 max-w-lg leading-relaxed">
            Report civic issues in {user?.wardName || 'Mumbai'}. Kaiser AI auto-routes your reports directly to <strong>{assignedOfficer.name}</strong> ({assignedOfficer.department}).
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <Link to="/app/report">
            <Button variant="white" size="lg" icon={AlertTriangle} className="shadow-lg whitespace-nowrap">
              Report Issue Now
            </Button>
          </Link>
          <Link to="/app/map">
            <Button variant="outline-light" size="lg" icon={MapPin} className="whitespace-nowrap">
              View Ward Map
            </Button>
          </Link>
        </div>
      </div>

      {/* Designated Officer Info Bar */}
      <div className="bg-white border border-neutral-200 rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 bg-brand-600 rounded-xl flex items-center justify-center text-white font-bold text-sm shadow shrink-0">
            {assignedOfficer.avatarInitials}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-neutral-900 text-sm">{assignedOfficer.name}</span>
              <span className="text-[10px] bg-emerald-50 text-emerald-700 font-semibold px-2 py-0.5 rounded-full border border-emerald-200">
                ● Designated Ward Officer
              </span>
            </div>
            <p className="text-xs text-neutral-500">{assignedOfficer.wardName} · {assignedOfficer.department} ({assignedOfficer.employeeId})</p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs text-neutral-500">
          <span className="font-semibold text-brand-600">Avg Resolution: {assignedOfficer.avgResolutionDays}d</span>
          <span>·</span>
          <span>Rating: {assignedOfficer.rating} ★</span>
        </div>
      </div>

      {/* Weather + AQI Strip */}
      {weather && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Card className="p-3.5 flex items-center gap-3 bg-white border-neutral-200 shadow-sm" padding="">
            <div className="w-10 h-10 rounded-xl bg-sky-50 flex items-center justify-center text-sky-600 shrink-0">
              <Thermometer size={18} />
            </div>
            <div>
              <div className="text-lg font-bold text-neutral-900">{weather.temperature}°C</div>
              <div className="text-[11px] text-neutral-500 font-medium">{weather.condition || 'Moderate'}</div>
            </div>
          </Card>
          <Card className="p-3.5 flex items-center gap-3 bg-white border-neutral-200 shadow-sm" padding="">
            <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600 shrink-0">
              <Wind size={18} />
            </div>
            <div>
              <div className="text-lg font-bold text-neutral-900">AQI {weather.aqi}</div>
              <div className="text-[11px] text-neutral-500 font-medium">{weather.aqi > 100 ? 'Unhealthy' : 'Moderate'}</div>
            </div>
          </Card>
          <Card className="p-3.5 flex items-center gap-3 bg-white border-neutral-200 shadow-sm" padding="">
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
              <CloudRain size={18} />
            </div>
            <div>
              <div className="text-lg font-bold text-neutral-900">{weather.humidity}%</div>
              <div className="text-[11px] text-neutral-500 font-medium">Humidity</div>
            </div>
          </Card>
          <Card className="p-3.5 flex items-center gap-3 bg-white border-neutral-200 shadow-sm" padding="">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 shrink-0">
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
        <Card className="p-4 bg-white border-neutral-200 border-l-4 border-l-brand-600 space-y-1 shadow-sm" padding="">
          <span className="text-xs font-semibold text-neutral-500 uppercase">My Submissions</span>
          <div className="text-2xl font-bold text-neutral-900">3 Active</div>
        </Card>
        <Card className="p-4 bg-white border-neutral-200 border-l-4 border-l-amber-500 space-y-1 shadow-sm" padding="">
          <span className="text-xs font-semibold text-neutral-500 uppercase">In Progress</span>
          <div className="text-2xl font-bold text-amber-600">2 Issues</div>
        </Card>
        <Card className="p-4 bg-white border-neutral-200 border-l-4 border-l-emerald-500 space-y-1 shadow-sm" padding="">
          <span className="text-xs font-semibold text-neutral-500 uppercase">Resolved</span>
          <div className="text-2xl font-bold text-emerald-600">8 Fixed</div>
        </Card>
        <Card className="p-4 bg-white border-neutral-200 border-l-4 border-l-sky-500 space-y-1 shadow-sm" padding="">
          <span className="text-xs font-semibold text-neutral-500 uppercase">Wards Covered</span>
          <div className="text-2xl font-bold text-sky-700">26 Wards Active</div>
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

// ── Report Issue Form with Live Location & Image Upload ───────────────────────
export const ReportIssuePage = () => {
  const { user } = useAuth();
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Pothole',
    landmark: '',
    ward: user?.ward || 8,
    latitude: user?.ward === 12 ? 19.1152 : 19.0596,
    longitude: user?.ward === 12 ? 72.8680 : 72.8296,
    imageUrl: '',
    imageName: '',
  });

  const [locationStatus, setLocationStatus] = useState(null); // 'locating' | 'success' | 'error'
  const [locationMessage, setLocationMessage] = useState('');
  const [nearestWardInfo, setNearestWardInfo] = useState(null);

  const [aiAnalyzing, setAiAnalyzing] = useState(false);
  const [aiPrediction, setAiPrediction] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [createdGrievance, setCreatedGrievance] = useState(null);

  // Automatically classify into ward whenever latitude & longitude change
  useEffect(() => {
    if (formData.latitude && formData.longitude) {
      const { ward, distanceKm } = findNearestWard(formData.latitude, formData.longitude);
      setNearestWardInfo({ ...ward, distanceKm });
      setFormData(prev => ({ ...prev, ward: ward.id }));
    }
  }, [formData.latitude, formData.longitude]);

  // Handle GPS Live Location
  const handleDetectLiveLocation = () => {
    if (!navigator.geolocation) {
      setLocationStatus('error');
      setLocationMessage('Geolocation is not supported by your browser.');
      return;
    }

    setLocationStatus('locating');
    setLocationMessage('Acquiring real-time GPS coordinates…');

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = +(pos.coords.latitude.toFixed(5));
        const lng = +(pos.coords.longitude.toFixed(5));
        const { ward, distanceKm } = findNearestWard(lat, lng);

        setFormData(prev => ({
          ...prev,
          latitude: lat,
          longitude: lng,
          ward: ward.id,
          landmark: prev.landmark || `Near ${ward.area} (Live GPS: ${lat}, ${lng})`,
        }));

        setNearestWardInfo({ ...ward, distanceKm });
        setLocationStatus('success');
        setLocationMessage(`Live location detected (${lat}° N, ${lng}° E) · Auto-classified to ${ward.name}`);
      },
      (err) => {
        setLocationStatus('error');
        setLocationMessage(`GPS permission denied or timeout (${err.message}). Pick a Mumbai preset location below!`);
      },
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 0 }
    );
  };

  // Preset location selection
  const handleSelectPreset = (p) => {
    const { ward, distanceKm } = findNearestWard(p.lat, p.lng);
    setFormData(prev => ({
      ...prev,
      latitude: p.lat,
      longitude: p.lng,
      ward: ward.id,
      landmark: p.landmark,
    }));
    setNearestWardInfo({ ...ward, distanceKm });
    setLocationStatus('success');
    setLocationMessage(`Location set to ${p.label} · Auto-classified to ${ward.name}`);
  };

  // Handle file image upload
  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setFormData(prev => ({
        ...prev,
        imageUrl: reader.result,
        imageName: file.name,
      }));
      runAiAnalysis(prev => prev.title || file.name.replace(/\.[^/.]+$/, ''));
    };
    reader.readAsDataURL(file);
  };

  // Select sample evidence photo
  const handleSelectSample = (sample) => {
    setFormData(prev => ({
      ...prev,
      imageUrl: sample.url,
      imageName: `${sample.label}.jpg`,
      title: prev.title || sample.title,
      category: sample.cat,
    }));
    runAiAnalysis(sample.title);
  };

  const runAiAnalysis = (titleHint) => {
    setAiAnalyzing(true);
    setTimeout(() => {
      const cat = formData.category || 'Pothole';
      setAiPrediction({
        category: cat,
        severity: cat === 'Water Leakage' ? 92 : cat === 'Drainage' ? 88 : 82,
        confidence: '98.4%',
        assignedDept: cat === 'Sanitation' ? 'Solid Waste Management' : cat === 'Water Leakage' ? 'Hydraulic Engineer Dept' : 'Roads & Infrastructure',
        slaHours: 24,
      });
      setAiAnalyzing(false);
    }, 900);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        title: formData.title || 'Civic Issue Grievance',
        description: formData.description || 'Reported civic infrastructure defect in Mumbai ward.',
        category: formData.category,
        latitude: formData.latitude,
        longitude: formData.longitude,
        ward: formData.ward,
        landmark: formData.landmark,
        imageUrl: formData.imageUrl || 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80',
        severity: aiPrediction?.severity || 78,
        createdBy: { id: user?.id || 'user-001', name: user?.name || 'Citizen' },
      };

      const res = await createComplaint(payload);
      setCreatedGrievance(res.data);
      setSubmitted(true);
    } catch (err) {
      console.error(err);
    }
  };

  // Find assigned officer for the currently classified ward
  const assignedOfficer = MOCK_OFFICERS.find(o => o.ward === formData.ward) || MOCK_OFFICERS[0];

  if (submitted && createdGrievance) {
    return (
      <div className="max-w-2xl mx-auto py-8 space-y-6">
        <div className="bg-white border border-neutral-200 rounded-2xl p-6 sm:p-8 text-center space-y-4 shadow-soft-lg">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto shadow-sm">
            <CheckCircle2 size={36} />
          </div>

          <div>
            <h2 className="text-2xl font-bold text-neutral-900">Grievance Registered Successfully!</h2>
            <p className="text-xs text-neutral-500 mt-1">Ticket ID: <strong className="font-mono text-neutral-800">{createdGrievance.id}</strong></p>
          </div>

          {/* Grievance Summary Card */}
          <div className="p-4 bg-neutral-50 border border-neutral-200 rounded-xl text-left text-xs space-y-3">
            <div className="flex items-start gap-4">
              {createdGrievance.imageUrl && (
                <div className="w-20 h-20 rounded-xl overflow-hidden bg-neutral-200 shrink-0 border border-neutral-200">
                  <img src={createdGrievance.imageUrl} alt="Grievance evidence" className="w-full h-full object-cover" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <span className="font-semibold text-neutral-900 text-sm block truncate">{createdGrievance.title}</span>
                <p className="text-neutral-500 text-[11px] line-clamp-2 mt-0.5">{createdGrievance.description}</p>
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant="brand">{createdGrievance.category}</Badge>
                  <Badge variant="amber">Severity {createdGrievance.severity}/100</Badge>
                  <span className="text-[11px] text-neutral-400">Ward #{createdGrievance.ward}</span>
                </div>
              </div>
            </div>

            {/* Officer Assignment Info */}
            <div className="mt-3 pt-3 border-t border-neutral-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white p-3 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-brand-600 text-white font-bold flex items-center justify-center text-sm shadow">
                  {assignedOfficer.avatarInitials}
                </div>
                <div>
                  <div className="font-bold text-neutral-900 text-sm">{assignedOfficer.name}</div>
                  <div className="text-[11px] text-neutral-500">{assignedOfficer.wardName} · {assignedOfficer.department}</div>
                </div>
              </div>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                ● Assigned Ward Officer
              </span>
            </div>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row justify-center gap-3">
            <Link to="/app/my-complaints" className="w-full sm:w-auto">
              <Button variant="primary" className="w-full justify-center">
                Track in My Complaints
              </Button>
            </Link>
            <Button
              variant="ghost"
              className="w-full sm:w-auto"
              onClick={() => {
                setSubmitted(false);
                setCreatedGrievance(null);
                setFormData({
                  title: '',
                  description: '',
                  category: 'Pothole',
                  landmark: '',
                  ward: 8,
                  latitude: 19.0596,
                  longitude: 72.8296,
                  imageUrl: '',
                  imageName: '',
                });
              }}
            >
              Report Another
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-neutral-900">Report Civic Grievance</h2>
        <p className="text-xs text-neutral-500">
          Capture live GPS location and attach photo evidence. Kaiser AI auto-routes to the designated Municipal Ward Officer.
        </p>
      </div>

      <Card className="p-6 space-y-6 shadow-soft-md bg-white border-neutral-200" padding="">
        <form onSubmit={handleSubmit} className="space-y-5">

          {/* ── Section 1: Live Location & Ward Auto-Classification ── */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-brand-100 flex items-center justify-center text-brand-600">
                  <Navigation size={16} />
                </div>
                <div>
                  <label className="text-sm font-bold text-neutral-900">Live GPS Location & Ward</label>
                  <p className="text-[11px] text-neutral-500">Auto-routes to the nearest of 26 BMC Ward Offices</p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleDetectLiveLocation}
                disabled={locationStatus === 'locating'}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-colors disabled:opacity-50"
              >
                <Crosshair size={13} className={locationStatus === 'locating' ? 'animate-spin' : ''} />
                {locationStatus === 'locating' ? 'Detecting GPS…' : 'Use Live GPS'}
              </button>
            </div>

            {/* Location status notice */}
            {locationStatus && (
              <div className={`p-2.5 rounded-xl text-xs flex items-center gap-2 ${
                locationStatus === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                locationStatus === 'locating' ? 'bg-brand-50 text-brand-700 border border-brand-200' :
                'bg-amber-50 text-amber-700 border border-amber-200'
              }`}>
                {locationStatus === 'success' ? <CheckCircle2 size={14} className="shrink-0" /> :
                 locationStatus === 'locating' ? <Navigation size={14} className="shrink-0 animate-spin" /> :
                 <AlertTriangle size={14} className="shrink-0" />}
                <span className="font-medium">{locationMessage}</span>
              </div>
            )}

            {/* Classified Ward Badge Banner */}
            {nearestWardInfo && (
              <div className="p-3 bg-white border border-neutral-200 rounded-xl flex items-center justify-between flex-wrap gap-2">
                <div>
                  <span className="text-[10px] uppercase font-bold text-neutral-400">Classified Ward</span>
                  <div className="font-bold text-neutral-900 text-sm flex items-center gap-2">
                    <span>{nearestWardInfo.name}</span>
                    <span className="text-xs font-normal text-neutral-500">({nearestWardInfo.area})</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-neutral-400">Assigned Officer</span>
                  <div className="text-xs font-bold text-brand-700">{assignedOfficer.name}</div>
                </div>
              </div>
            )}

            {/* Quick Test Presets */}
            <div>
              <p className="text-[11px] font-semibold text-neutral-500 mb-1.5">Or simulate a Mumbai Ward Location:</p>
              <div className="flex flex-wrap gap-1.5">
                {LOCATION_PRESETS.map((p) => (
                  <button
                    key={p.label}
                    type="button"
                    onClick={() => handleSelectPreset(p)}
                    className="px-2.5 py-1 bg-white hover:bg-neutral-100 border border-neutral-200 rounded-lg text-[11px] font-medium text-neutral-700 transition-colors"
                  >
                    📍 {p.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-3 pt-1">
              <Input
                label="Location Landmark / Street"
                placeholder="e.g. Opposite Metro Station Exit 2"
                value={formData.landmark}
                onChange={(e) => setFormData({ ...formData, landmark: e.target.value })}
                required
              />
              <div className="space-y-1">
                <label className="text-xs font-semibold text-neutral-700">Municipal Ward (26 Wards)</label>
                <select
                  value={formData.ward}
                  onChange={(e) => {
                    const wid = Number(e.target.value);
                    const ward = MUMBAI_WARDS.find(w => w.id === wid);
                    setFormData({
                      ...formData,
                      ward: wid,
                      latitude: ward?.lat || formData.latitude,
                      longitude: ward?.lng || formData.longitude,
                    });
                    if (ward) setNearestWardInfo({ ...ward, distanceKm: 0 });
                  }}
                  className="w-full rounded-xl border border-neutral-200 p-2.5 text-xs font-medium text-neutral-800 bg-white focus:ring-2 focus:ring-brand-500/20"
                >
                  {MUMBAI_WARDS.map((w) => (
                    <option key={w.id} value={w.id}>
                      #{w.id} · {w.name} – {w.area}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* ── Section 2: Photo Evidence Upload ── */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-neutral-800 flex items-center gap-1.5">
                <Camera size={14} className="text-brand-600" /> Upload Image Evidence
              </label>
              <span className="text-[11px] text-neutral-400">Visible to assigned Ward Officer</span>
            </div>

            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept="image/*"
              className="hidden"
            />

            {formData.imageUrl ? (
              /* Image Preview Box */
              <div className="relative border-2 border-brand-200 bg-brand-50/20 rounded-2xl p-4 flex items-center gap-4">
                <div className="w-24 h-24 rounded-xl overflow-hidden bg-neutral-200 shrink-0 border border-neutral-200 shadow-sm">
                  <img src={formData.imageUrl} alt="Uploaded evidence" className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      <Check size={11} /> Photo Attached
                    </span>
                    <span className="text-[11px] text-neutral-400 truncate">{formData.imageName || 'evidence.jpg'}</span>
                  </div>
                  <p className="text-xs text-neutral-600">Image ready for dispatch. Officer of {nearestWardInfo?.name || 'this ward'} will inspect this photo.</p>
                  <div className="mt-2 flex gap-2">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="text-[11px] font-semibold text-brand-600 hover:underline"
                    >
                      Replace Photo
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, imageUrl: '', imageName: '' }))}
                      className="text-[11px] font-semibold text-red-500 hover:underline"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              /* Drop / Upload Button */
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-neutral-200 hover:border-brand-400 rounded-2xl p-6 text-center space-y-2 bg-neutral-50/50 hover:bg-neutral-50 transition-colors cursor-pointer"
              >
                <div className="w-12 h-12 rounded-2xl bg-white border border-neutral-200 flex items-center justify-center text-neutral-500 mx-auto shadow-sm">
                  <Camera size={22} className="text-brand-600" />
                </div>
                <div>
                  <p className="text-xs font-bold text-neutral-800">Click to upload photo evidence</p>
                  <p className="text-[11px] text-neutral-400 mt-0.5">PNG, JPG, WebP up to 10MB</p>
                </div>
              </div>
            )}

            {/* Quick Sample Photos for Testing */}
            <div className="pt-1">
              <span className="text-[11px] text-neutral-400 block mb-1">Or select a sample civic issue photo for quick test:</span>
              <div className="flex flex-wrap gap-1.5">
                {SAMPLE_EVIDENCE.map((s) => (
                  <button
                    key={s.label}
                    type="button"
                    onClick={() => handleSelectSample(s)}
                    className="px-2.5 py-1 bg-neutral-100 hover:bg-neutral-200 rounded-lg text-[11px] font-medium text-neutral-700 transition-colors"
                  >
                    📸 {s.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* ── Section 3: Title & Description ── */}
          <Input
            label="Issue Title / Summary"
            placeholder="e.g. Dangerous pothole near Western Express Highway junction"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            onBlur={() => runAiAnalysis(formData.title)}
            required
          />

          <div className="space-y-1">
            <label className="text-xs font-semibold text-neutral-700">Detailed Description</label>
            <textarea
              rows={3}
              className="w-full rounded-xl border border-neutral-200 p-3 text-xs focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 bg-white"
              placeholder="Describe what you see, specific landmark, depth or hazard level..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              onBlur={() => runAiAnalysis(formData.description)}
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-neutral-700">Issue Category</label>
            <select
              value={formData.category}
              onChange={(e) => {
                setFormData({ ...formData, category: e.target.value });
                runAiAnalysis(e.target.value);
              }}
              className="w-full rounded-xl border border-neutral-200 p-2.5 text-xs font-medium text-neutral-700 bg-white focus:ring-2 focus:ring-brand-500/20"
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* AI Analysis Card Preview */}
          {aiAnalyzing && (
            <div className="p-4 bg-brand-50 rounded-xl flex items-center gap-3 text-xs text-brand-700 animate-pulse">
              <Sparkles size={18} className="text-brand-600" />
              <span>Kaiser AI is analyzing grievance text, image, and location coordinates…</span>
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
                <div>Urgency Score: <strong>{aiPrediction.severity}/100</strong></div>
                <div>Target SLA: <strong>{aiPrediction.slaHours} Hours</strong></div>
              </div>
            </div>
          )}

          <Button type="submit" variant="primary" className="w-full justify-center py-3 text-sm font-semibold shadow-md">
            Submit Grievance to {assignedOfficer.name} ({nearestWardInfo?.name || 'BMC'})
          </Button>
        </form>
      </Card>
    </div>
  );
};

// ── My Complaints Page ────────────────────────────────────────────────────────
export const MyComplaintsPage = () => {
  const { user } = useAuth();
  const [complaints, setComplaints] = useState([]);
  const [activeTab, setActiveTab] = useState('ALL');
  const [viewScope, setViewScope] = useState('mine'); // 'mine' | 'ward'

  useEffect(() => {
    async function load() {
      const res = await getComplaints();
      setComplaints(res.data || []);
    }
    load();
  }, []);

  const wardId = user?.ward || 8;
  const wardComplaints = complaints.filter((c) => c.ward === wardId);
  const myComplaints = complaints.filter(
    (c) =>
      c.createdBy?.id === user?.id ||
      c.createdBy?.name === user?.name ||
      (c.ward === wardId && ['cmp-015', 'cmp-016', 'cmp-023', 'cmp-024'].includes(c.id))
  );

  const displayedList = viewScope === 'mine' ? (myComplaints.length ? myComplaints : wardComplaints.slice(0, 3)) : wardComplaints;

  const filtered = displayedList.filter((c) => {
    if (activeTab === 'IN_PROGRESS') return c.status === 'in_progress' || c.status === 'assigned';
    if (activeTab === 'RESOLVED') return c.status === 'resolved';
    return true;
  });

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold text-brand-700 bg-brand-50 border border-brand-200 px-2.5 py-0.5 rounded-full">
              {user?.wardName?.split('–')[0]?.trim() || 'Ward #8'} Citizen Console
            </span>
          </div>
          <h2 className="text-2xl font-bold text-neutral-900">Grievance Tracking</h2>
          <p className="text-xs text-neutral-500">Track real-time progress, uploaded photos, and ward officer actions.</p>
        </div>
        <Link to="/app/report">
          <Button variant="primary" size="sm" icon={AlertTriangle}>New Report</Button>
        </Link>
      </div>

      {/* Scope Selector: My Reports vs Ward Neighborhood */}
      <div className="flex gap-2 p-1 bg-neutral-100 rounded-xl w-fit text-xs font-semibold">
        <button
          type="button"
          onClick={() => setViewScope('mine')}
          className={`px-4 py-2 rounded-lg transition-all ${
            viewScope === 'mine'
              ? 'bg-white text-neutral-900 shadow-soft-sm'
              : 'text-neutral-500 hover:text-neutral-800'
          }`}
        >
          My Submissions ({myComplaints.length || 2})
        </button>
        <button
          type="button"
          onClick={() => setViewScope('ward')}
          className={`px-4 py-2 rounded-lg transition-all ${
            viewScope === 'ward'
              ? 'bg-white text-neutral-900 shadow-soft-sm'
              : 'text-neutral-500 hover:text-neutral-800'
          }`}
        >
          Ward #{wardId} Community ({wardComplaints.length})
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex border-b border-neutral-200 space-x-6 text-sm font-semibold text-neutral-500">
        <button
          onClick={() => setActiveTab('ALL')}
          className={`pb-2 transition-colors ${activeTab === 'ALL' ? 'text-brand-600 border-b-2 border-brand-600' : 'hover:text-neutral-800'}`}
        >
          All Issues ({displayedList.length})
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
          <p className="text-xs text-neutral-500">Visual geospatial map of all 26 Mumbai wards with active citizen reports.</p>
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

// ── Citizen Notifications Page ────────────────────────────────────────────────
export const CitizenNotificationsPage = () => {
  return (
    <div className="max-w-3xl mx-auto space-y-5">
      <div>
        <h2 className="text-2xl font-bold text-neutral-900">Notifications</h2>
        <p className="text-xs text-neutral-500">Live alerts regarding your reported issues and municipal responses.</p>
      </div>

      <div className="space-y-3">
        {MOCK_NOTIFICATIONS.map((n) => (
          <Card key={n.id} className="p-4 bg-white border-neutral-200 flex items-start gap-3 shadow-sm" padding="">
            <div className="w-9 h-9 rounded-xl bg-brand-50 border border-brand-100 flex items-center justify-center text-brand-600 shrink-0">
              <Bell size={16} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-bold text-neutral-900 text-sm">{n.title}</span>
                {!n.isRead && <span className="w-2 h-2 rounded-full bg-brand-500" />}
              </div>
              <p className="text-xs text-neutral-500 mt-0.5">{n.body}</p>
            </div>
            <span className="text-[10px] text-neutral-400 shrink-0">Recent</span>
          </Card>
        ))}
      </div>
    </div>
  );
};

// ── Citizen Profile Page ──────────────────────────────────────────────────────
export const CitizenProfilePage = () => {
  const { user } = useAuth();
  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-neutral-900">Citizen Profile</h2>
        <p className="text-xs text-neutral-500">Manage your municipal citizen account and registered address.</p>
      </div>

      <Card className="p-6 bg-white border-neutral-200 shadow-sm space-y-6" padding="">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-brand-600 text-white font-bold text-xl flex items-center justify-center shadow">
            {user?.avatarInitials || user?.name?.[0] || 'PN'}
          </div>
          <div>
            <h3 className="text-lg font-bold text-neutral-900">{user?.name || 'Citizen'}</h3>
            <p className="text-xs text-neutral-500">{user?.email || 'citizen@example.com'}</p>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="brand">Registered Citizen</Badge>
              <span className="text-xs text-neutral-400">Ward #{user?.ward || 8} · {user?.wardName?.split('–')[0]?.trim() || 'G/N Ward'}</span>
            </div>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-4 text-xs pt-4 border-t border-neutral-100">
          <div className="p-3 bg-neutral-50 rounded-xl">
            <span className="text-neutral-400">Phone Number</span>
            <p className="font-semibold text-neutral-800 mt-0.5">{user?.phone || '+91 98765 43210'}</p>
          </div>
          <div className="p-3 bg-neutral-50 rounded-xl">
            <span className="text-neutral-400">Registered Ward</span>
            <p className="font-semibold text-neutral-800 mt-0.5">{user?.wardName || 'G/N Ward – Bandra (North)'}</p>
          </div>
          <div className="p-3 bg-neutral-50 rounded-xl">
            <span className="text-neutral-400">Complaints Resolved</span>
            <p className="font-semibold text-emerald-600 mt-0.5">8 Grievances Fixed</p>
          </div>
          <div className="p-3 bg-neutral-50 rounded-xl">
            <span className="text-neutral-400">Civic Reputation Score</span>
            <p className="font-semibold text-brand-600 mt-0.5">Top 5% Citizen (Score: 840)</p>
          </div>
        </div>
      </Card>
    </div>
  );
};
