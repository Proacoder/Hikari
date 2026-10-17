import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  AlertTriangle, MapPin, Camera, Sparkles, CheckCircle2,
  Navigation, CloudRain, Wind, Thermometer, Eye,
  Crosshair
} from 'lucide-react';
import { getComplaints, createComplaint, getMapData, getStoredComplaints, saveStoredComplaints } from '../api/complaints.api';
import { getWeatherAQI } from '../api/weather.api';
import { detectDefectWithYOLO, checkDuplicateWithDBSCAN } from '../api/ml.api';
import { MUMBAI_WARDS, MOCK_OFFICERS, CATEGORIES } from '../utils/mockData';
import { findClosestWard, reverseGeocodeCoordinates, analyzeComplaintDynamic } from '../utils/geoUtils';
import { useLanguage } from '../context/LanguageContext';
import { useNotifications } from '../context/NotificationContext';
import { useAuth } from '../context/AuthContext';
import { ComplaintCard } from '../components/complaints/ComplaintComponents';
import { Button } from '../components/common/Button';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { Input } from '../components/common/Input';
import { LeafletMap } from '../components/map/LeafletMap';
import { Skeleton, SkeletonCard } from '../components/common/Skeleton';
import { HolographicScanner } from '../components/ai/HolographicScanner';
import { BeforeAfterSlider } from '../components/complaints/BeforeAfterSlider';
import { sound } from '../utils/soundEffects';
import { triggerConfetti } from '../utils/confetti';



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
  const { t } = useLanguage();
  const { user } = useAuth();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [weather, setWeather] = useState(null);

  // Dynamic assigned ward officer for this citizen's ward
  const assignedOfficer = useMemo(() => {
    const wardId = user?.ward || 8;
    return MOCK_OFFICERS.find((o) => o.ward === wardId) || MOCK_OFFICERS[0];
  }, [user]);

  const userSubmissions = useMemo(() => {
    const allStored = getStoredComplaints();
    return allStored.filter(
      (c) =>
        (user?.id && c.createdBy?.id === user.id) ||
        (user?.name && c.createdBy?.name === user.name) ||
        (user?.email && c.createdBy?.email === user.email)
    );
  }, [user]);

  const activeSubmissionsCount = userSubmissions.filter((c) => c.status !== 'resolved').length;
  const inProgressCount = userSubmissions.filter((c) => c.status === 'in_progress' || c.status === 'assigned').length;
  const resolvedCount = userSubmissions.filter((c) => c.status === 'resolved').length;

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
        console.error('Failed to load dashboard data:', err);
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
          <h2 className="text-2xl sm:text-3xl font-bold">
            {user ? `Welcome back, ${user.name}!` : t('citizen.seeIssuePrompt', 'See a civic issue in Mumbai?')}
          </h2>
          <p className="text-sm text-brand-100 max-w-lg leading-relaxed">
            {t('citizen.seeIssueSub', 'Upload a photo & detect your live GPS location. Kaiser AI automatically routes your report to the designated Ward Officer among all 26 Mumbai wards.')}
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <Link to="/app/report">
            <Button variant="secondary" size="lg" icon={AlertTriangle} className="shadow-lg whitespace-nowrap bg-white text-brand-700 hover:bg-neutral-100">
              {t('nav.reportIssue', 'Report Issue Now')}
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
          <span className="text-xs font-semibold text-neutral-500 uppercase">{t('citizen.mySubmissions', 'My Submissions')}</span>
          <div className="text-2xl font-bold text-neutral-900">{activeSubmissionsCount} Active</div>
        </Card>
        <Card className="p-4 bg-white border-neutral-200 border-l-4 border-l-amber-500 space-y-1 shadow-sm" padding="">
          <span className="text-xs font-semibold text-neutral-500 uppercase">{t('citizen.inProgress', 'In Progress')}</span>
          <div className="text-2xl font-bold text-amber-600">{inProgressCount} Issues</div>
        </Card>
        <Card className="p-4 bg-white border-neutral-200 border-l-4 border-l-emerald-500 space-y-1 shadow-sm" padding="">
          <span className="text-xs font-semibold text-neutral-500 uppercase">{t('citizen.resolved', 'Resolved')}</span>
          <div className="text-2xl font-bold text-emerald-600">{resolvedCount} Fixed</div>
        </Card>
        <Card className="p-4 bg-white border-neutral-200 border-l-4 border-l-sky-500 space-y-1 shadow-sm" padding="">
          <span className="text-xs font-semibold text-neutral-500 uppercase">{t('citizen.wardRanking', 'Wards Covered')}</span>
          <div className="text-2xl font-bold text-sky-700">26 Wards Active</div>
        </Card>
      </div>

      {/* Verified Municipal Resolutions Showcase */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-neutral-900">Verified BMC Road Restorations</h3>
            <p className="text-xs text-neutral-500">Live before-and-after proof of completed civic resolutions</p>
          </div>
          <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 rounded-full text-xs font-bold font-mono">
            100% SLA COMPLIANT
          </span>
        </div>
        <BeforeAfterSlider
          beforeUrl="https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80"
          afterUrl="https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=800&q=80"
          title="Major Crater Restored at Andheri-Kurla Junction"
          wardName="Ward K/E – Andheri East (BMC Road Maintenance Dept)"
          resolvedDate="14 Oct 2026 · Closed in 18 hrs"
        />
      </div>

      {/* Recent Ward Activity Feed */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-neutral-900">{t('citizen.recentNeighborhood', 'Recent Complaints in Your Neighborhood')}</h3>
          <Link to="/app/my-complaints" className="text-xs font-semibold text-brand-600 hover:underline">
            {t('citizen.viewAll', 'View My Complaints →')}
          </Link>
        </div>
        {loading ? (
          <div className="grid md:grid-cols-2 gap-4">
            <SkeletonCard />
            <SkeletonCard />
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {complaints.slice(0, 4).map((c) => (
              <ComplaintCard key={c.id} complaint={c} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// ── Report Issue Form with Live GPS, Interactive Pin Map & Image Upload ───────
export const ReportIssuePage = () => {
  const { user } = useAuth();
  const { t, translateCategory } = useLanguage();
  const { dispatchNotification } = useNotifications();
  const fileInputRef = useRef(null);

  const defaultWard = user?.ward || 12;
  const initialWardObj = MUMBAI_WARDS.find((w) => w.id === defaultWard) || MUMBAI_WARDS[0];

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Pothole',
    landmark: '',
    ward: defaultWard,
    latitude: initialWardObj.lat,
    longitude: initialWardObj.lng,
    imageUrl: '',
    imageName: '',
  });

  const [isDetectingGps, setIsDetectingGps] = useState(false);
  const [locationStatus, setLocationStatus] = useState(null); // 'locating' | 'success' | 'error'
  const [locationMessage, setLocationMessage] = useState('');
  const [detectedWardInfo, setDetectedWardInfo] = useState(() => findClosestWard(initialWardObj.lat, initialWardObj.lng));

  const [aiAnalyzing, setAiAnalyzing] = useState(false);
  const [aiPrediction, setAiPrediction] = useState(null);
  const [showAnnotatedOverlay, setShowAnnotatedOverlay] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submittedTicket, setSubmittedTicket] = useState(null);


  // Dynamic AI categorization
  const runAiAnalysis = useCallback((hint) => {
    if (!formData.description && !formData.title && !hint) return;
    setAiAnalyzing(true);

    setTimeout(() => {
      const result = analyzeComplaintDynamic(formData.title || hint, formData.description || hint);
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

  // Handle GPS Live Location
  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by your browser.');
      setLocationStatus('error');
      setLocationMessage('Geolocation is not supported by your browser.');
      return;
    }

    setIsDetectingGps(true);
    setLocationStatus('locating');
    setLocationMessage('Acquiring real-time GPS coordinates…');
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
        setLocationStatus('success');
        setLocationMessage(`Live location detected (${lat}° N, ${lng}° E) · Auto-classified to ${closest.ward.name}`);
        toast.success(
          `${t('citizen.gpsSuccess', 'Location detected!')} ${closest.ward.name} (${closest.distanceKm} km away)`,
          { id: toastId }
        );
      },
      (error) => {
        setIsDetectingGps(false);
        setLocationStatus('error');
        setLocationMessage(`GPS permission denied or timeout (${error.message}). Pick a Mumbai preset location below!`);
        toast.error(
          t('citizen.gpsError', 'Could not access device GPS. Click on the map to set location.'),
          { id: toastId }
        );
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  // Preset location selection
  const handleSelectPreset = (p) => {
    const closest = findClosestWard(p.lat, p.lng);
    setFormData((prev) => ({
      ...prev,
      latitude: p.lat,
      longitude: p.lng,
      ward: closest.ward.id,
      landmark: p.landmark,
    }));
    setDetectedWardInfo(closest);
    setLocationStatus('success');
    setLocationMessage(`Location set to ${p.label} · Auto-classified to ${closest.ward.name}`);
  };

  // Map pin position change handler (drag or click on Leaflet map)
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

    const street = await reverseGeocodeCoordinates(roundedLat, roundedLng);
    if (street) {
      setFormData((prev) => ({
        ...prev,
        landmark: prev.landmark ? prev.landmark : street,
      }));
    }
  };

  // Handle file image upload with local YOLOv8 Defect Detector
  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async () => {
      const base64Data = reader.result;
      setFormData((prev) => ({
        ...prev,
        imageUrl: base64Data,
        imageName: file.name,
      }));

      // Send to local YOLOv8 service
      setAiAnalyzing(true);
      const yolo = await detectDefectWithYOLO(file, file.name.replace(/\.[^/.]+$/, ''));
      if (yolo && yolo.success) {
        setAiPrediction({
          category: yolo.category,
          confidence: yolo.confidence,
          severity: yolo.severity,
          slaHours: yolo.sla_hours,
          assignedDept: yolo.assigned_department,
          detections: yolo.detections,
          annotatedImage: yolo.annotated_image,
          source: 'YOLOv8 Computer Vision',
        });
        setFormData((prev) => ({
          ...prev,
          category: yolo.category,
        }));
        toast.success(`YOLOv8 Detected: ${yolo.category} (${yolo.confidence})`, { icon: '🎯' });
        setAiAnalyzing(false);
      } else {
        // Fallback to text heuristic
        runAiAnalysis(file.name.replace(/\.[^/.]+$/, ''));
      }
    };
    reader.readAsDataURL(file);
  };


  // Submit Complaint with DBSCAN Deduplication
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      // 1. Run local DBSCAN geodesic clustering for duplicate detection
      const allExisting = getStoredComplaints();
      const dupCheck = await checkDuplicateWithDBSCAN(
        {
          latitude: formData.latitude,
          longitude: formData.longitude,
          category: formData.category,
          title: formData.title,
        },
        allExisting.map((c) => ({
          id: c.id,
          latitude: c.latitude,
          longitude: c.longitude,
          category: c.category,
          title: c.title,
          status: c.status,
        })),
        25.0
      );

      if (dupCheck && dupCheck.is_duplicate) {
        const parent = allExisting.find((c) => c.id === dupCheck.parent_complaint_id);
        if (parent) {
          // Increment priority and attach citizen report
          parent.upvoteCount = (parent.upvoteCount || 0) + 1;
          if (!parent.mergedReports) parent.mergedReports = [];
          parent.mergedReports.push({
            reportedAt: new Date().toISOString(),
            by: user?.name || 'Citizen',
            landmark: formData.landmark || 'Nearby Street',
            imageUrl: (aiPrediction?.annotatedImage) || formData.imageUrl,
          });

          saveStoredComplaints(allExisting);

          // Award +25 karma points for helping prevent municipal duplicate queues
          try {
            const currentKarma = Number(localStorage.getItem('kaiser_citizen_karma') || 840) + 25;
            localStorage.setItem('kaiser_citizen_karma', String(currentKarma));
          } catch {}

          setSubmittedTicket({
            ...parent,
            isMergedDuplicate: true,
            distanceMeters: dupCheck.distance_meters,
          });

          await dispatchNotification({
            title: `Report Consolidated: #${parent.id} Upvoted`,
            body: `Matched active defect #${parent.id} (${dupCheck.distance_meters}m away). Community priority escalated! (+25 Karma Points)`,
            type: 'upvote',
            complaintId: parent.id,
          });

          toast.success(`DBSCAN Match: Merged into active Ticket #${parent.id} (+25 Karma Points)!`, { icon: '🔄', duration: 5000 });
          setSubmitting(false);
          return;
        }
      }

      const payload = {
        title: formData.title || 'Civic Issue Grievance',
        description: formData.description || 'Reported civic infrastructure defect in Mumbai ward.',
        category: formData.category,
        latitude: formData.latitude,
        longitude: formData.longitude,
        ward: formData.ward,
        landmark: formData.landmark,
        imageUrl: (aiPrediction?.annotatedImage) || formData.imageUrl || 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80',
        severity: aiPrediction?.severity || 65,
        confidence: aiPrediction?.confidence || '94.0%',
        duplicateLinkedTo: dupCheck?.is_duplicate ? dupCheck.parent_complaint_id : null,
        createdBy: user ? {
          id: user.id,
          name: user.name,
          email: user.email,
          ward: user.ward || formData.ward,
        } : { id: 'anonymous', name: 'Citizen' },
      };

      const res = await createComplaint(payload);
      const created = res.data;
      setSubmittedTicket(created);
      sound.play('fanfare');
      triggerConfetti();

      // Dispatch real notification to Notification Center
      const currentWard = MUMBAI_WARDS.find((w) => w.id === formData.ward) || detectedWardInfo.ward;
      await dispatchNotification({
        title: `Grievance Registered: ${formData.category}`,
        body: `Ticket #${created.id} was dispatched to ${currentWard.name} (${currentWard.area}). Target SLA: ${aiPrediction?.slaHours || 24}h.${dupCheck?.is_duplicate ? ` (DBSCAN Clustered with #${dupCheck.parent_complaint_id})` : ''}`,
        type: 'status_update',
        complaintId: created.id,
      });

      toast.success(t('citizen.successHeading', 'Grievance Registered Successfully!'));
    } catch (err) {
      console.error('Failed to submit complaint:', err);
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
      ward: defaultWard,
      latitude: initialWardObj.lat,
      longitude: initialWardObj.lng,
      imageUrl: '',
      imageName: '',
    });
  };

  // Find assigned officer for the currently classified ward
  const assignedOfficer = MOCK_OFFICERS.find((o) => o.ward === formData.ward) || MOCK_OFFICERS[0];

  // Success view
  if (submittedTicket) {
    const assignedWard = MUMBAI_WARDS.find((w) => w.id === submittedTicket.ward) || detectedWardInfo.ward;
    return (
      <div className="max-w-2xl mx-auto py-8 space-y-6 animate-fade-in">
        <div className="bg-white border border-neutral-200 rounded-2xl p-6 sm:p-8 text-center space-y-4 shadow-soft-lg">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto shadow-sm">
            <CheckCircle2 size={36} />
          </div>

          <div>
            <h2 className="text-2xl font-bold text-neutral-900">
              {submittedTicket.isMergedDuplicate
                ? 'DBSCAN Geodesic Match: Report Merged & Upvoted!'
                : t('citizen.successHeading', 'Grievance Registered Successfully!')}
            </h2>
            <p className="text-xs text-neutral-500 mt-1">
              Active Investigation Ticket ID: <strong className="font-mono text-neutral-800">#{submittedTicket.id}</strong>
            </p>
            {submittedTicket.isMergedDuplicate && (
              <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 border border-amber-200 text-amber-800 rounded-full text-xs font-semibold">
                <span>🔄 Clustered with issue {submittedTicket.distanceMeters}m away · Priority boosted (+25 Karma Points)</span>
              </div>
            )}
          </div>

          {/* Grievance Summary Card */}
          <div className="p-4 bg-neutral-50 border border-neutral-200 rounded-xl text-left text-xs space-y-3">
            <div className="flex items-start gap-4">
              {submittedTicket.imageUrl && (
                <div className="w-20 h-20 rounded-xl overflow-hidden bg-neutral-200 shrink-0 border border-neutral-200 shadow-sm">
                  <img src={submittedTicket.imageUrl} alt="Grievance evidence" className="w-full h-full object-cover" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <span className="font-semibold text-neutral-900 text-sm block truncate">{submittedTicket.title}</span>
                <p className="text-neutral-500 text-[11px] line-clamp-2 mt-0.5">{submittedTicket.description}</p>
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant="brand">{translateCategory(submittedTicket.category)}</Badge>
                  <Badge variant="amber">Severity {submittedTicket.severity}/100</Badge>
                  <span className="text-[11px] text-neutral-400">Ward #{submittedTicket.ward}</span>
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
                  <div className="text-[11px] text-neutral-500">{assignedWard.name} ({assignedWard.area}) · {assignedOfficer.department}</div>
                </div>
              </div>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                ● Assigned Ward Officer
              </span>
            </div>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row justify-center gap-3">
            <Link to={`/officer/${assignedOfficer.id}`} className="w-full sm:w-auto">
              <Button variant="primary" className="w-full justify-center">
                Open {assignedOfficer.name}'s Dashboard →
              </Button>
            </Link>
            <Link to="/app/my-complaints" className="w-full sm:w-auto">
              <Button variant="outline" className="w-full justify-center">
                {t('citizen.trackStatus', 'Track in My Complaints')}
              </Button>
            </Link>
            <Button variant="ghost" className="w-full sm:w-auto" onClick={handleReset}>
              {t('citizen.reportAnother', 'Report Another Issue')}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const currentWardObj = MUMBAI_WARDS.find((w) => w.id === formData.ward) || detectedWardInfo.ward;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-neutral-900">{t('citizen.reportHeading', 'Report Civic Issue')}</h2>
        <p className="text-xs text-neutral-500">
          {t('citizen.reportSub', 'Provide details or let Kaiser AI auto-detect category, urgency & coordinates.')}
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
                onClick={handleDetectLocation}
                disabled={isDetectingGps}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-colors disabled:opacity-50"
              >
                <Crosshair size={13} className={isDetectingGps ? 'animate-spin' : ''} />
                {isDetectingGps ? t('citizen.detectingGps', 'Detecting GPS…') : t('citizen.detectGps', 'Use Live GPS')}
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

            {/* Interactive Leaflet Mini Map Picker */}
            <div className="space-y-1.5 pt-1">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-neutral-800 flex items-center gap-1.5">
                  <MapPin size={14} className="text-brand-600" />
                  <span>{t('citizen.pinLocation', 'Pinpoint Location on Map')}</span>
                </label>
                <span className="text-[11px] text-neutral-400">
                  {t('citizen.pinHint', 'Click or drag pin to update coordinate')}
                </span>
              </div>
              <div className="rounded-2xl overflow-hidden border border-neutral-200 shadow-soft-sm relative">
                <LeafletMap
                  pickerMode={true}
                  center={[formData.latitude, formData.longitude]}
                  zoom={14}
                  selectedPosition={{ lat: formData.latitude, lng: formData.longitude }}
                  onPositionChange={handleMapPositionChange}
                  height="220px"
                />
              </div>
            </div>

            {/* Classified Ward Badge Banner */}
            {detectedWardInfo && (
              <div className="p-3 bg-white border border-neutral-200 rounded-xl flex items-center justify-between flex-wrap gap-2">
                <div>
                  <span className="text-[10px] uppercase font-bold text-neutral-400">Classified Ward</span>
                  <div className="font-bold text-neutral-900 text-sm flex items-center gap-2">
                    <span>{currentWardObj.name}</span>
                    <span className="text-xs font-normal text-neutral-500">({currentWardObj.area})</span>
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
                label={t('citizen.landmarkLabel', 'Location Landmark / Street')}
                placeholder={t('citizen.landmarkPlaceholder', 'e.g. Opposite Metro Station Exit 2')}
                value={formData.landmark}
                onChange={(e) => setFormData({ ...formData, landmark: e.target.value })}
                required
              />
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-neutral-700">{t('citizen.wardLabel', 'Municipal Ward')}</label>
                  <span className="text-[10px] text-brand-600 font-medium">26 BMC Wards</span>
                </div>
                <select
                  value={formData.ward}
                  onChange={(e) => {
                    const wid = Number(e.target.value);
                    const ward = MUMBAI_WARDS.find((w) => w.id === wid);
                    setFormData({
                      ...formData,
                      ward: wid,
                      latitude: ward?.lat || formData.latitude,
                      longitude: ward?.lng || formData.longitude,
                    });
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
              <div className="space-y-3">
                <HolographicScanner
                  imageUrl={showAnnotatedOverlay && aiPrediction?.annotatedImage ? aiPrediction.annotatedImage : formData.imageUrl}
                  defectData={aiPrediction}
                  isScanning={aiAnalyzing}
                />
                <div className="flex flex-wrap items-center justify-between gap-2 p-3 bg-neutral-100 rounded-xl">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-neutral-700 truncate max-w-xs">{formData.imageName || 'evidence.jpg'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {aiPrediction?.annotatedImage && (
                      <button
                        type="button"
                        onClick={() => setShowAnnotatedOverlay(!showAnnotatedOverlay)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-brand-600 hover:bg-brand-700 text-white shadow-sm transition-all"
                      >
                        <Crosshair size={12} />
                        {showAnnotatedOverlay ? 'Show Original Photo' : 'Show YOLOv8 BBoxes'}
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="text-xs font-semibold text-brand-700 hover:underline px-2 py-1"
                    >
                      Replace Photo
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        sound.play('click');
                        setFormData((prev) => ({ ...prev, imageUrl: '', imageName: '' }));
                        setAiPrediction(null);
                      }}
                      className="text-xs font-semibold text-red-600 hover:underline px-2 py-1"
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

          </div>

          {/* ── Section 3: Title & Description ── */}
          <Input
            label={t('citizen.titleLabel', 'Issue Title / Summary')}
            placeholder={t('citizen.titlePlaceholder', 'e.g. Dangerous pothole near Western Express Highway junction')}
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            onBlur={() => runAiAnalysis(formData.title)}
            required
          />

          <div className="space-y-1">
            <label className="text-xs font-semibold text-neutral-700">{t('citizen.descLabel', 'Detailed Description')}</label>
            <textarea
              rows={3}
              className="w-full rounded-xl border border-neutral-200 p-3 text-xs focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 bg-white"
              placeholder={t('citizen.descPlaceholder', 'Describe what you see, specific landmark, depth or hazard level...')}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              onBlur={() => runAiAnalysis(formData.description)}
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-neutral-700">{t('citizen.categoryLabel', 'Issue Category')}</label>
            <select
              value={formData.category}
              onChange={(e) => {
                setFormData({ ...formData, category: e.target.value });
                runAiAnalysis(e.target.value);
              }}
              className="w-full rounded-xl border border-neutral-200 p-2.5 text-xs font-medium text-neutral-700 bg-white focus:ring-2 focus:ring-brand-500/20"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {translateCategory(cat)}
                </option>
              ))}
            </select>
          </div>

          {/* AI Analysis Preview */}
          {aiAnalyzing && (
            <div className="p-4 bg-brand-50 rounded-xl flex items-center gap-3 text-xs text-brand-700 animate-pulse border border-brand-100">
              <Sparkles size={18} className="text-brand-600 shrink-0" />
              <span>Scanning image & description with local YOLOv8 & NLP engine...</span>
            </div>
          )}

          {aiPrediction && !aiAnalyzing && (
            <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-xl space-y-2 text-xs animate-fade-in">
              <div className="flex items-center justify-between font-bold text-emerald-800">
                <span className="flex items-center gap-1.5">
                  <Sparkles size={14} className="text-emerald-600" />
                  AI Triage & Urgency Evaluation
                  {aiPrediction.source && (
                    <span className="ml-1.5 px-2 py-0.5 rounded-full text-[10px] bg-brand-600 text-white font-mono uppercase">
                      {aiPrediction.source}
                    </span>
                  )}
                </span>
                <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded text-[11px]">
                  Confidence: {aiPrediction.confidence}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-neutral-700 pt-1">
                <div>Detected: <strong>{translateCategory(aiPrediction.category)}</strong></div>
                <div>Routing: <strong>{aiPrediction.assignedDept}</strong></div>
                <div>Urgency Score: <strong className="text-red-600">{aiPrediction.severity}/100</strong></div>
                <div>Target SLA: <strong>{aiPrediction.slaHours} Hours</strong></div>
              </div>
              {aiPrediction.detections && aiPrediction.detections.length > 0 && (
                <div className="pt-2 border-t border-emerald-200/60 flex items-center justify-between text-[11px] text-emerald-900">
                  <span>Detected Object Boxes: <strong>{aiPrediction.detections.length} region(s) identified</strong></span>
                  <span className="text-emerald-700 font-medium">BBox coordinates sealed</span>
                </div>
              )}
            </div>
          )}

          <Button
            type="submit"
            variant="primary"
            disabled={submitting}
            className="w-full justify-center py-3 text-sm font-bold shadow-brand"
          >
            {submitting ? t('citizen.submittingBtn', 'Submitting to BMC Ward Officer...') : `Submit Grievance to ${assignedOfficer.name} (${currentWardObj.name})`}
          </Button>
        </form>
      </Card>
    </div>
  );
};

// ── My Complaints Page ────────────────────────────────────────────────────────
export const MyComplaintsPage = () => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('ALL');
  const [viewScope, setViewScope] = useState('mine'); // 'mine' | 'ward'

  useEffect(() => {
    async function load() {
      try {
        const res = await getComplaints();
        setComplaints(res.data || []);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const wardId = user?.ward || 8;
  const wardComplaints = complaints.filter((c) => c.ward === wardId);
  const myComplaints = complaints.filter(
    (c) =>
      (user?.id && c.createdBy?.id === user.id) ||
      (user?.name && c.createdBy?.name === user.name) ||
      (user?.email && c.createdBy?.email === user.email)
  );

  const displayedList = viewScope === 'mine' ? myComplaints : wardComplaints;

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
          <h2 className="text-2xl font-bold text-neutral-900">{t('nav.myComplaints', 'My Reported Complaints')}</h2>
          <p className="text-xs text-neutral-500">Track real-time progress, uploaded photos, and ward officer actions.</p>
        </div>
        <Link to="/app/report">
          <Button variant="primary" size="sm" icon={AlertTriangle}>
            {t('nav.reportIssue', 'New Report')}
          </Button>
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
          {t('citizen.inProgress', 'In Progress')}
        </button>
        <button
          onClick={() => setActiveTab('RESOLVED')}
          className={`pb-2 transition-colors ${activeTab === 'RESOLVED' ? 'text-brand-600 border-b-2 border-brand-600' : 'hover:text-neutral-800'}`}
        >
          {t('citizen.resolved', 'Resolved')}
        </button>
      </div>

      {loading ? (
        <div className="grid md:grid-cols-2 gap-4">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-2xl border border-neutral-200">
          <p className="text-sm text-neutral-500 font-medium">No complaints found in this category.</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {filtered.map((c) => (
            <ComplaintCard key={c.id} complaint={c} />
          ))}
        </div>
      )}
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
        console.error('Failed to load map data:', err);
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
        {loading ? (
          <Skeleton className="w-full h-[550px] rounded-2xl" />
        ) : (
          <LeafletMap
            complaints={filteredComplaints}
            height="550px"
            zoom={12}
          />
        )}

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


// ── Citizen Profile Page ──────────────────────────────────────────────────────
export const CitizenProfilePage = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({ total: 0, resolved: 0, score: 500 });

  useEffect(() => {
    async function fetchUserStats() {
      try {
        const res = await getComplaints();
        const all = res.data || [];
        const mine = all.filter(
          (c) =>
            (user?.id && c.createdBy?.id === user.id) ||
            (user?.name && c.createdBy?.name === user.name) ||
            (user?.email && c.createdBy?.email === user.email)
        );
        const resolved = mine.filter((c) => c.status === 'resolved' || c.status === 'Resolved').length;
        const total = mine.length;
        const score = Math.min(990, 500 + total * 25 + resolved * 50);
        setStats({ total, resolved, score });
      } catch {
        // Fallback gracefully
      }
    }
    fetchUserStats();
  }, [user]);

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
            <p className="font-semibold text-emerald-600 mt-0.5">
              {stats.total > 0 ? `${stats.resolved} of ${stats.total} Grievances Fixed` : 'No Grievances Filed Yet'}
            </p>
          </div>
          <div className="p-3 bg-neutral-50 rounded-xl">
            <span className="text-neutral-400">Civic Reputation Score</span>
            <p className="font-semibold text-brand-600 mt-0.5">
              {stats.score >= 700 ? `Top Tier Citizen (Score: ${stats.score})` : `Active Citizen (Score: ${stats.score})`}
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};
