import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  AlertTriangle, MapPin, Camera, Mic, Sparkles, CheckCircle2,
  Upload, CloudRain, Wind, Thermometer, Eye, Crosshair
} from 'lucide-react';
import { getComplaints, createComplaint, getMapData } from '../api/complaints.api';
import { getWeatherAQI } from '../api/weather.api';
import { MUMBAI_WARDS, CATEGORIES } from '../utils/mockData';
import { findClosestWard, reverseGeocodeCoordinates, analyzeComplaintDynamic } from '../utils/geoUtils';
import { useLanguage } from '../context/LanguageContext';
import { useNotifications } from '../context/NotificationContext';
import { ComplaintCard } from '../components/complaints/ComplaintComponents';
import { Button } from '../components/common/Button';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { Input } from '../components/common/Input';
import { LeafletMap } from '../components/map/LeafletMap';

// ── Citizen Dashboard ────────────────────────────────────────────────────────
export const CitizenDashboard = () => {
  const { t } = useLanguage();
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
          <h2 className="text-2xl sm:text-3xl font-bold">{t('citizen.seeIssuePrompt', 'See a civic issue in your ward?')}</h2>
          <p className="text-sm text-brand-100 max-w-lg">
            {t('citizen.seeIssueSub', 'Snap a photo or record audio. Our AI will auto-fill category, severity, and location for instant municipal routing.')}
          </p>
        </div>
        <Link to="/app/report">
          <Button variant="secondary" size="lg" icon={AlertTriangle} className="shadow-lg whitespace-nowrap">
            {t('nav.reportIssue', 'Report Issue Now')}
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
          <span className="text-xs font-semibold text-neutral-500 uppercase">{t('citizen.mySubmissions', 'My Submissions')}</span>
          <div className="text-2xl font-bold text-neutral-900">3 Active</div>
        </Card>
        <Card className="p-4 border-l-4 border-l-amber-500 space-y-1">
          <span className="text-xs font-semibold text-neutral-500 uppercase">{t('citizen.inProgress', 'In Progress')}</span>
          <div className="text-2xl font-bold text-amber-600">2 Issues</div>
        </Card>
        <Card className="p-4 border-l-4 border-l-emerald-500 space-y-1">
          <span className="text-xs font-semibold text-neutral-500 uppercase">{t('citizen.resolved', 'Resolved')}</span>
          <div className="text-2xl font-bold text-emerald-600">8 Fixed</div>
        </Card>
        <Card className="p-4 border-l-4 border-l-sky-500 space-y-1">
          <span className="text-xs font-semibold text-neutral-500 uppercase">{t('citizen.wardRanking', 'Ward Ranking')}</span>
          <div className="text-2xl font-bold text-sky-700">Top 5% Citizen</div>
        </Card>
      </div>

      {/* Recent Ward Activity Feed */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-neutral-900">{t('citizen.recentNeighborhood', 'Recent Complaints in Your Neighborhood')}</h3>
          <Link to="/app/my-complaints" className="text-xs font-semibold text-brand-600 hover:underline">
            {t('citizen.viewAll', 'View My Complaints →')}
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

// ── Report Issue Form with Real GPS & Interactive Map ─────────────────────────
export const ReportIssuePage = () => {
  const { t, translateCategory } = useLanguage();
  const { dispatchNotification } = useNotifications();

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Pothole',
    landmark: '',
    ward: 12, // Default K/E Ward
    latitude: 19.1152,
    longitude: 72.8680,
    image: null,
  });

  const [isDetectingGps, setIsDetectingGps] = useState(false);
  const [detectedWardInfo, setDetectedWardInfo] = useState(() => findClosestWard(19.1152, 72.8680));
  const [aiAnalyzing, setAiAnalyzing] = useState(false);
  const [aiPrediction, setAiPrediction] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [submittedTicket, setSubmittedTicket] = useState(null);

  // Dynamic AI categorization without hardcoded text
  const handleAiCategorize = useCallback(() => {
    if (!formData.description && !formData.title) return;
    setAiAnalyzing(true);

    setTimeout(() => {
      const result = analyzeComplaintDynamic(formData.title, formData.description);
      if (result) {
        setAiPrediction(result);
        setFormData((prev) => ({
          ...prev,
          category: result.category,
        }));
      }
      setAiAnalyzing(false);
    }, 600);
  }, [formData.title, formData.description]);

  // GPS Auto-locate function
  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by your current browser.');
      return;
    }

    setIsDetectingGps(true);
    const toastId = toast.loading(t('citizen.detectingGps', 'Fetching GPS coordinates from device...'));

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = parseFloat(pos.coords.latitude.toFixed(6));
        const lng = parseFloat(pos.coords.longitude.toFixed(6));

        const closest = findClosestWard(lat, lng);
        setDetectedWardInfo(closest);

        setFormData((prev) => ({
          ...prev,
          latitude: lat,
          longitude: lng,
          ward: closest.ward.id,
        }));

        // Reverse geocoding via OpenStreetMap Nominatim
        const address = await reverseGeocodeCoordinates(lat, lng);
        if (address) {
          setFormData((prev) => ({
            ...prev,
            landmark: address,
          }));
        }

        setIsDetectingGps(false);
        toast.success(
          `${t('citizen.gpsSuccess', 'Location detected!')} ${closest.ward.name} (${closest.distanceKm} km away)`,
          { id: toastId }
        );
      },
      (error) => {
        setIsDetectingGps(false);
        console.warn('Geolocation error:', error);
        toast.error(
          t('citizen.gpsError', 'Could not access device GPS. Click on the map to set location.'),
          { id: toastId }
        );
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000,
      }
    );
  };

  // Map pin position change handler (drag or click)
  const handleMapPositionChange = async ({ lat, lng }) => {
    const roundedLat = parseFloat(lat.toFixed(6));
    const roundedLng = parseFloat(lng.toFixed(6));

    const closest = findClosestWard(roundedLat, roundedLng);
    setDetectedWardInfo(closest);

    setFormData((prev) => ({
      ...prev,
      latitude: roundedLat,
      longitude: roundedLng,
      ward: closest.ward.id,
    }));

    // Reverse geocode to suggest landmark
    const street = await reverseGeocodeCoordinates(roundedLat, roundedLng);
    if (street) {
      setFormData((prev) => ({
        ...prev,
        landmark: prev.landmark ? prev.landmark : street,
      }));
    }
  };

  // Submit Complaint
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        ...formData,
        severity: aiPrediction?.severity || 65,
        confidence: aiPrediction?.confidence || '94.0%',
      };

      const res = await createComplaint(payload);
      const created = res.data;
      setSubmittedTicket(created);

      // Dispatch real notification to Notifications center
      const currentWard = MUMBAI_WARDS.find((w) => w.id === formData.ward) || detectedWardInfo.ward;
      await dispatchNotification({
        title: `Grievance Registered: ${formData.category}`,
        body: `Ticket #${created.id} was dispatched to ${currentWard.name} (${currentWard.area}). Target SLA: ${aiPrediction?.slaHours || 24}h.`,
        type: 'status_update',
        complaintId: created.id,
      });

      toast.success(t('citizen.successHeading', 'Grievance Registered Successfully!'));
    } catch (err) {
      console.error(err);
      toast.error('Failed to submit grievance. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // Reset form
  const handleReset = () => {
    setSubmittedTicket(null);
    setAiPrediction(null);
    setFormData({
      title: '',
      description: '',
      category: 'Pothole',
      landmark: '',
      ward: 12,
      latitude: 19.1152,
      longitude: 72.8680,
      image: null,
    });
  };

  // Success view
  if (submittedTicket) {
    const assignedWard = MUMBAI_WARDS.find((w) => w.id === submittedTicket.ward) || { name: 'K/E Ward', area: 'Andheri East' };
    return (
      <div className="max-w-xl mx-auto py-12 text-center space-y-5 animate-fade-in">
        <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-soft-md">
          <CheckCircle2 size={36} />
        </div>
        <div className="space-y-1">
          <h2 className="text-2xl font-bold text-neutral-900">{t('citizen.successHeading', 'Grievance Registered Successfully!')}</h2>
          <p className="text-sm text-neutral-600 max-w-md mx-auto">
            {t('citizen.successSub', 'Your grievance has been auto-triaged and assigned to your local Ward Assistant Engineer.')}
          </p>
        </div>

        {/* Ticket Details Card */}
        <Card className="p-5 text-left text-xs space-y-3 bg-neutral-50/60 border-neutral-200">
          <div className="flex items-center justify-between pb-2 border-b border-neutral-200">
            <span className="text-neutral-500 font-semibold">{t('citizen.ticketId', 'Ticket ID')}</span>
            <span className="font-mono font-bold text-brand-700 bg-brand-50 px-2 py-0.5 rounded-md">
              {submittedTicket.id}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-3 text-neutral-700">
            <div>
              <span className="text-neutral-400 block text-[11px]">Assigned Ward</span>
              <span className="font-bold">{assignedWard.name}</span> ({assignedWard.area})
            </div>
            <div>
              <span className="text-neutral-400 block text-[11px]">Category</span>
              <span className="font-bold">{translateCategory(submittedTicket.category)}</span>
            </div>
            <div>
              <span className="text-neutral-400 block text-[11px]">Severity Score</span>
              <span className="font-bold text-red-600">{submittedTicket.severity}/100</span>
            </div>
            <div>
              <span className="text-neutral-400 block text-[11px]">GPS Location</span>
              <span className="font-mono text-[11px]">{submittedTicket.latitude.toFixed(4)}, {submittedTicket.longitude.toFixed(4)}</span>
            </div>
          </div>
          {submittedTicket.landmark && (
            <div className="pt-2 border-t border-neutral-200 text-neutral-600">
              <span className="text-neutral-400 block text-[11px]">Landmark</span>
              <span className="font-medium">{submittedTicket.landmark}</span>
            </div>
          )}
        </Card>

        <div className="pt-4 flex justify-center gap-3">
          <Link to="/app/my-complaints">
            <Button variant="primary">{t('citizen.trackStatus', 'Track Status')}</Button>
          </Link>
          <Button variant="outline" onClick={handleReset}>
            {t('citizen.reportAnother', 'Report Another Issue')}
          </Button>
        </div>
      </div>
    );
  }

  const currentWardObj = MUMBAI_WARDS.find((w) => w.id === formData.ward) || MUMBAI_WARDS[0];

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-neutral-900">{t('citizen.reportHeading', 'Report Civic Issue')}</h2>
        <p className="text-xs text-neutral-500">{t('citizen.reportSub', 'Provide details or let Kaiser AI auto-detect category, urgency & coordinates.')}</p>
      </div>

      <Card className="p-6 space-y-6 shadow-soft-md">
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Issue Title */}
          <Input
            label={t('citizen.titleLabel', 'Issue Title / Summary')}
            placeholder={t('citizen.titlePlaceholder', 'e.g. Dangerous open manhole cover near Western Express Highway')}
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            onBlur={handleAiCategorize}
            required
          />

          {/* Description */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-neutral-700">{t('citizen.descLabel', 'Detailed Description')}</label>
            <textarea
              rows={3}
              className="w-full rounded-xl border border-neutral-200 p-3 text-xs focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
              placeholder={t('citizen.descPlaceholder', 'Describe what you see, specific landmark, or hazard level...')}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              onBlur={handleAiCategorize}
            />
          </div>

          {/* Category Dropdown */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-neutral-700">{t('citizen.categoryLabel', 'Issue Category')}</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full rounded-xl border border-neutral-200 p-2.5 text-xs font-medium text-neutral-700 focus:ring-2 focus:ring-brand-500/20"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {translateCategory(cat)}
                  </option>
                ))}
              </select>
            </div>

            {/* Municipal Ward Selector (All 26 Wards) */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-neutral-700">{t('citizen.wardLabel', 'Municipal Ward')}</label>
                <span className="text-[10px] text-brand-600 font-medium">26 BMC Wards</span>
              </div>
              <select
                value={formData.ward}
                onChange={(e) => {
                  const wardId = Number(e.target.value);
                  const selectedW = MUMBAI_WARDS.find((w) => w.id === wardId);
                  setFormData((prev) => ({
                    ...prev,
                    ward: wardId,
                    latitude: selectedW ? selectedW.lat : prev.latitude,
                    longitude: selectedW ? selectedW.lng : prev.longitude,
                  }));
                }}
                className="w-full rounded-xl border border-neutral-200 p-2.5 text-xs font-medium text-neutral-700 focus:ring-2 focus:ring-brand-500/20"
              >
                {MUMBAI_WARDS.map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.name} – {w.area}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* ── Feature 5: GPS Location & Interactive Draggable Pin Map ──────────────── */}
          <div className="space-y-3 pt-2 border-t border-neutral-100">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <label className="text-xs font-bold text-neutral-800 flex items-center gap-1.5">
                  <MapPin size={15} className="text-brand-600" />
                  <span>{t('citizen.pinLocation', 'Pinpoint Location on Map')}</span>
                </label>
                <p className="text-[11px] text-neutral-500">
                  {t('citizen.pinHint', 'Click map or drag the orange pin to set the exact street coordinate.')}
                </p>
              </div>

              {/* Detect My Location GPS Button */}
              <button
                type="button"
                onClick={handleDetectLocation}
                disabled={isDetectingGps}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-brand-50 text-brand-700 hover:bg-brand-100 border border-brand-200 transition-colors disabled:opacity-50 shadow-soft-xs"
              >
                <Crosshair size={14} className={isDetectingGps ? 'animate-spin' : ''} />
                <span>{isDetectingGps ? t('citizen.detectingGps', 'Detecting GPS...') : t('citizen.detectGps', 'Detect My GPS Location')}</span>
              </button>
            </div>

            {/* Interactive Leaflet Mini Map */}
            <div className="rounded-2xl overflow-hidden border border-neutral-200 shadow-soft-sm relative">
              <LeafletMap
                pickerMode={true}
                center={[formData.latitude, formData.longitude]}
                zoom={14}
                selectedPosition={{ lat: formData.latitude, lng: formData.longitude }}
                onPositionChange={handleMapPositionChange}
                height="260px"
              />
            </div>

            {/* Live GPS Coordinates and Ward Badge */}
            <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200/70 flex flex-wrap items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-2">
                <span className="text-neutral-500 font-medium">{t('citizen.detectedCoords', 'Coordinates')}:</span>
                <span className="font-mono font-semibold text-neutral-800 bg-white px-2 py-0.5 rounded border border-neutral-200">
                  {formData.latitude.toFixed(5)}, {formData.longitude.toFixed(5)}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-neutral-500 font-medium">{t('citizen.detectedWard', 'Nearest Ward')}:</span>
                <span className="font-bold text-brand-700 bg-brand-100/60 px-2 py-0.5 rounded">
                  {currentWardObj.name} ({currentWardObj.area})
                </span>
              </div>
            </div>

            {/* Landmark text input */}
            <Input
              label={t('citizen.landmarkLabel', 'Location Landmark / Street Details')}
              placeholder={t('citizen.landmarkPlaceholder', 'e.g. Opposite Metro Station Exit 2, Andheri East')}
              value={formData.landmark}
              onChange={(e) => setFormData({ ...formData, landmark: e.target.value })}
              required
            />
          </div>

          {/* Media Evidence Upload */}
          <div className="space-y-2 pt-2 border-t border-neutral-100">
            <label className="text-xs font-semibold text-neutral-700">Upload Media Evidence (Photo / Voice)</label>
            <div className="border-2 border-dashed border-neutral-200 hover:border-brand-400 rounded-xl p-5 text-center space-y-2 bg-neutral-50/60 transition-colors cursor-pointer">
              <div className="flex justify-center gap-3 text-neutral-400">
                <Camera size={22} />
                <Mic size={22} />
                <Upload size={22} />
              </div>
              <p className="text-xs font-medium text-neutral-600">Click to upload photo or record voice description</p>
              <p className="text-[11px] text-neutral-400">PNG, JPG, MP3 up to 10MB</p>
            </div>
          </div>

          {/* Dynamic AI Analysis Feedback */}
          {aiAnalyzing && (
            <div className="p-4 bg-brand-50 rounded-xl flex items-center gap-3 text-xs text-brand-700 animate-pulse border border-brand-100">
              <Sparkles size={18} className="text-brand-600 shrink-0" />
              <span>Analyzing grievance description and context for automatic categorization...</span>
            </div>
          )}

          {aiPrediction && !aiAnalyzing && (
            <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-xl space-y-2 text-xs animate-fade-in">
              <div className="flex items-center justify-between font-bold text-emerald-800">
                <span className="flex items-center gap-1.5">
                  <Sparkles size={14} className="text-emerald-600" />
                  AI Triage & Urgency Evaluation
                </span>
                <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded text-[11px]">
                  Confidence: {aiPrediction.confidence}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-neutral-700 pt-1">
                <div>Detected: <strong>{translateCategory(aiPrediction.category)}</strong></div>
                <div>Routing: <strong>{aiPrediction.assignedDept}</strong></div>
                <div>Severity Score: <strong className="text-red-600">{aiPrediction.severity}/100</strong></div>
                <div>Target SLA: <strong>{aiPrediction.slaHours} Hours</strong></div>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <Button
            type="submit"
            variant="primary"
            disabled={submitting}
            className="w-full justify-center py-3 text-sm font-bold shadow-brand"
          >
            {submitting ? t('citizen.submittingBtn', 'Submitting to BMC Ward Officer...') : t('citizen.submitBtn', 'Submit Grievance to BMC')}
          </Button>
        </form>
      </Card>
    </div>
  );
};

// ── My Complaints Page ────────────────────────────────────────────────────────
export const MyComplaintsPage = () => {
  const { t } = useLanguage();
  const [complaints, setComplaints] = useState([]);
  const [activeTab, setActiveTab] = useState('ALL');

  useEffect(() => {
    async function load() {
      const res = await getComplaints();
      setComplaints(res.data || []);
    }
    load();
  }, []);

  const filtered = complaints.filter((c) => {
    if (activeTab === 'IN_PROGRESS') return c.status === 'in_progress' || c.status === 'assigned';
    if (activeTab === 'RESOLVED') return c.status === 'resolved';
    return true;
  });

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-neutral-900">{t('nav.myComplaints', 'My Reported Complaints')}</h2>
          <p className="text-xs text-neutral-500">Track real-time progress and status of your submitted issues.</p>
        </div>
        <Link to="/app/report">
          <Button variant="primary" size="sm" icon={AlertTriangle}>
            {t('nav.reportIssue', 'New Report')}
          </Button>
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
          {t('citizen.inProgress', 'In Progress')}
        </button>
        <button
          onClick={() => setActiveTab('RESOLVED')}
          className={`pb-2 transition-colors ${activeTab === 'RESOLVED' ? 'text-brand-600 border-b-2 border-brand-600' : 'hover:text-neutral-800'}`}
        >
          {t('citizen.resolved', 'Resolved')}
        </button>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {filtered.map((c) => (
          <ComplaintCard key={c.id} complaint={c} />
        ))}
      </div>
    </div>
  );
};

// ── Interactive Issue Map Page with Real Leaflet ──────────────────────────────
export const IssueMapPage = () => {
  const { t, translateCategory } = useLanguage();
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
    : mapComplaints.filter((c) => c.category === selectedCategory);

  const categories = ['All', 'Pothole', 'Garbage', 'Drainage', 'Streetlight', 'Water Leakage'];

  const totalOpen = mapComplaints.filter((c) => c.status !== 'resolved').length;
  const totalCritical = mapComplaints.filter((c) => c.severity >= 80).length;

  return (
    <div className="space-y-4 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-neutral-900">{t('nav.issueMap', 'Mumbai Interactive Ward Map')}</h2>
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
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border ${
              selectedCategory === cat
                ? 'bg-brand-600 text-white border-brand-600 shadow-brand'
                : 'bg-white text-neutral-600 border-neutral-200 hover:border-brand-300 hover:text-brand-700'
            }`}
          >
            {cat === 'All' ? 'All' : translateCategory(cat)}
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
              {t('citizen.detectGps', 'Report at My GPS Location')}
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};
