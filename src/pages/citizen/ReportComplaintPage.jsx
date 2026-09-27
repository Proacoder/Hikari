import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Camera, MapPin, Upload, Sparkles, AlertTriangle, CheckCircle2,
  ArrowRight, ArrowLeft, Trash2, Shield, Eye
} from 'lucide-react';
import { createComplaint } from '../../api/complaints.api';
import { LeafletMap } from '../../components/map/LeafletMap';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Badge } from '../../components/common/Badge';
import { MUMBAI_WARDS, CATEGORIES } from '../../utils/mockData';

const STEPS = [
  { step: 1, title: 'Category' },
  { step: 2, title: 'Location' },
  { step: 3, title: 'Details & AI' },
  { step: 4, title: 'Review & Submit' },
];

const CATEGORY_ITEMS = [
  { name: 'Pothole',        icon: '🕳️', desc: 'Road cracks, craters, uneven asphalt' },
  { name: 'Garbage',        icon: '🗑️', desc: 'Overflowing dustbins, street litter piles' },
  { name: 'Drainage',       icon: '💧', desc: 'Open manholes, blocked storm drains' },
  { name: 'Streetlight',    icon: '💡', desc: 'Dark poles, flickering lights, exposed wires' },
  { name: 'Water Leakage',  icon: '🚰', desc: 'Burst water mains, pipeline seepage' },
  { name: 'Other',          icon: '📋', desc: 'Fallen trees, illegal debris, encroachment' },
];

export const ReportComplaintPage = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [submittedId, setSubmittedId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [category, setCategory] = useState('Pothole');
  const [coordinates, setCoordinates] = useState({ lat: 19.0596, lng: 72.8296 });
  const [wardId, setWardId] = useState(8); // G/N Bandra
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [imagePreview, setImagePreview] = useState('https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80');
  const [aiAnalyzing, setAiAnalyzing] = useState(false);
  const [aiResult, setAiResult] = useState({
    detectedCategory: 'Pothole',
    confidence: '94%',
    severityScore: 87,
    assignedDept: 'Roads & Infrastructure Department',
    slaTargetHours: 24
  });

  const currentWard = MUMBAI_WARDS.find(w => w.id === wardId) || MUMBAI_WARDS[0];

  const handlePositionChange = ({ lat, lng }) => {
    setCoordinates({ lat, lng });
    // Simulate detecting nearest ward
    if (lat > 19.11) setWardId(12); // Andheri K/E
    else if (lat > 19.05) setWardId(8); // Bandra G/N
    else setWardId(1); // Colaba A
  };

  const handlePhotoUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setImagePreview(url);
      triggerAiAnalysis();
    }
  };

  const triggerAiAnalysis = () => {
    setAiAnalyzing(true);
    setTimeout(() => {
      setAiResult({
        detectedCategory: category,
        confidence: '96.2%',
        severityScore: category === 'Pothole' ? 87 : category === 'Water Leakage' ? 95 : 68,
        assignedDept: category === 'Pothole' ? 'Roads & Infrastructure' : category === 'Garbage' ? 'Solid Waste Management' : 'Drainage Dept',
        slaTargetHours: 24
      });
      setAiAnalyzing(false);
    }, 1200);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const res = await createComplaint({
        title: title || `${category} reported near ${currentWard.area}`,
        description: description || `Severe civic issue requiring inspection in ${currentWard.name}.`,
        category,
        lat: coordinates.lat,
        lng: coordinates.lng,
        ward: wardId,
        severity: aiResult.severityScore,
        imageUrl: imagePreview
      });
      setSubmittedId(res.data?.id || 'cmp-new-9821');
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submittedId) {
    return (
      <div className="max-w-xl mx-auto py-12 text-center space-y-6">
        <div className="w-20 h-20 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-soft-sm">
          <CheckCircle2 size={48} />
        </div>
        <div className="space-y-2">
          <Badge variant="success">Complaint Dispatched to BMC</Badge>
          <h2 className="text-3xl font-extrabold text-neutral-900">Grievance Registered Successfully</h2>
          <p className="text-sm text-neutral-600">
            Assigned Ticket ID <strong>#{submittedId}</strong>. Dispatched directly to {currentWard.name} Assistant Engineer.
          </p>
        </div>

        <Card className="p-6 text-left space-y-3 bg-neutral-50/80 border border-neutral-200">
          <div className="flex justify-between text-xs text-neutral-500">
            <span>Category: <strong>{category}</strong></span>
            <span>Target SLA: <strong className="text-brand-700">24 Hours</strong></span>
          </div>
          <div className="flex justify-between text-xs text-neutral-500">
            <span>Ward: <strong>{currentWard.name} ({currentWard.area})</strong></span>
            <span>Urgency: <strong className="text-red-600">Score {aiResult.severityScore}/100</strong></span>
          </div>
        </Card>

        <div className="flex justify-center gap-3 pt-2">
          <Link to={`/app/complaint/${submittedId}`}>
            <Button variant="primary" className="rounded-full px-6">
              Track Status in Real-Time
            </Button>
          </Link>
          <Button
            variant="outline"
            className="rounded-full px-6"
            onClick={() => {
              setSubmittedId(null);
              setCurrentStep(1);
              setTitle('');
              setDescription('');
            }}
          >
            Report Another Issue
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-neutral-900">Report a Civic Grievance</h1>
        <p className="text-xs text-neutral-500">Kaiser AI guides you through 4 steps to notify your local ward engineer.</p>
      </div>

      {/* Stepper Header */}
      <div className="grid grid-cols-4 gap-2">
        {STEPS.map((s) => (
          <div
            key={s.step}
            className={`p-3 rounded-2xl border text-center transition-all ${
              currentStep === s.step
                ? 'bg-brand-50 border-brand-500 text-brand-700 font-bold shadow-soft-sm'
                : currentStep > s.step
                ? 'bg-white border-neutral-200 text-neutral-700 font-semibold'
                : 'bg-neutral-50 border-neutral-100 text-neutral-400'
            }`}
          >
            <div className="text-[11px] uppercase tracking-wider">Step {s.step}</div>
            <div className="text-xs sm:text-sm truncate">{s.title}</div>
          </div>
        ))}
      </div>

      {/* Step 1: Category Picker */}
      {currentStep === 1 && (
        <Card className="p-6 space-y-6">
          <div>
            <h3 className="text-lg font-bold text-neutral-900">Select Issue Category</h3>
            <p className="text-xs text-neutral-500">Pick the primary municipal issue you are reporting.</p>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            {CATEGORY_ITEMS.map((cat) => (
              <div
                key={cat.name}
                onClick={() => setCategory(cat.name)}
                className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-start gap-4 ${
                  category === cat.name
                    ? 'border-brand-600 bg-brand-50/50 shadow-soft-sm'
                    : 'border-neutral-200 hover:border-neutral-300 bg-white'
                }`}
              >
                <div className="text-3xl shrink-0">{cat.icon}</div>
                <div>
                  <h4 className="font-bold text-sm text-neutral-900">{cat.name}</h4>
                  <p className="text-xs text-neutral-500 mt-0.5">{cat.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-end pt-4">
            <Button
              variant="primary"
              className="rounded-full px-6"
              onClick={() => setCurrentStep(2)}
            >
              Continue to Location <ArrowRight size={16} />
            </Button>
          </div>
        </Card>
      )}

      {/* Step 2: OpenStreetMap Location Picker */}
      {currentStep === 2 && (
        <Card className="p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-neutral-900">Pin Exact Street Location</h3>
              <p className="text-xs text-neutral-500">Click on the OpenStreetMap or drag the orange pin to your spot.</p>
            </div>
            <Badge variant="brand">{currentWard.name}</Badge>
          </div>

          {/* Interactive Leaflet Map Picker */}
          <div className="rounded-2xl overflow-hidden border border-neutral-200">
            <LeafletMap
              center={[coordinates.lat, coordinates.lng]}
              zoom={14}
              pickerMode={true}
              selectedPosition={coordinates}
              onPositionChange={handlePositionChange}
              height="350px"
            />
          </div>

          <div className="p-4 bg-brand-50/70 rounded-2xl border border-brand-100 flex items-center justify-between text-xs">
            <div>
              <span className="text-neutral-500">Detected Municipal Ward:</span>
              <div className="font-bold text-brand-900 text-sm">{currentWard.name} – {currentWard.area}</div>
              <div className="text-[11px] text-neutral-400">Lat: {coordinates.lat.toFixed(4)}, Lng: {coordinates.lng.toFixed(4)}</div>
            </div>
            <button
              onClick={() => {
                if (navigator.geolocation) {
                  navigator.geolocation.getCurrentPosition((pos) => {
                    handlePositionChange({ lat: pos.coords.latitude, lng: pos.coords.longitude });
                  });
                }
              }}
              className="px-3 py-1.5 bg-white border border-brand-200 text-brand-700 font-bold rounded-xl text-xs hover:bg-brand-50 cursor-pointer shadow-soft-sm"
            >
              Use My Current GPS
            </button>
          </div>

          <div className="flex justify-between pt-4">
            <Button variant="outline" className="rounded-full px-6" onClick={() => setCurrentStep(1)}>
              <ArrowLeft size={16} /> Back
            </Button>
            <Button variant="primary" className="rounded-full px-6" onClick={() => setCurrentStep(3)}>
              Continue to Details <ArrowRight size={16} />
            </Button>
          </div>
        </Card>
      )}

      {/* Step 3: Details & AI Telemetry */}
      {currentStep === 3 && (
        <Card className="p-6 space-y-6">
          <div>
            <h3 className="text-lg font-bold text-neutral-900">Upload Photo & Description</h3>
            <p className="text-xs text-neutral-500">Provide context for the municipal inspection crew.</p>
          </div>

          <div className="space-y-4">
            <Input
              label="Issue Summary / Title"
              placeholder={`e.g. Deep ${category.toLowerCase()} near ${currentWard.area}`}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />

            <div className="space-y-1">
              <label className="text-xs font-semibold text-neutral-700">Detailed Landmark / Description</label>
              <textarea
                rows={3}
                placeholder="Mention specific shop, metro pillar, or crossroad landmark..."
                className="w-full rounded-xl border border-neutral-200 p-3 text-xs focus:ring-2 focus:ring-brand-500/20"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            {/* Photo Upload Zone */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-neutral-700">Upload Evidence Photo</label>
              <div className="border-2 border-dashed border-neutral-200 hover:border-brand-500 rounded-2xl p-6 text-center bg-neutral-50 relative cursor-pointer transition-colors">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                />
                {imagePreview ? (
                  <div className="flex flex-col items-center gap-2">
                    <img src={imagePreview} alt="Preview" className="w-36 h-24 object-cover rounded-xl shadow-soft-sm" />
                    <span className="text-xs font-semibold text-brand-600">Click to change photo</span>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Upload size={24} className="mx-auto text-neutral-400" />
                    <div className="text-xs font-medium text-neutral-600">Drag & drop photo or click to browse</div>
                    <div className="text-[11px] text-neutral-400">JPG, PNG up to 5MB</div>
                  </div>
                )}
              </div>
            </div>

            {/* AI Analysis Preview Card */}
            {aiAnalyzing ? (
              <div className="p-4 bg-brand-50 rounded-2xl border border-brand-100 flex items-center gap-3 text-xs text-brand-700 animate-pulse">
                <Sparkles size={20} className="text-brand-600 animate-spin" />
                <span>Kaiser AI neural network is analyzing photo evidence & predicting SLA...</span>
              </div>
            ) : (
              <div className="p-4 bg-emerald-50/80 border border-emerald-200 rounded-2xl space-y-2 text-xs">
                <div className="flex items-center justify-between font-bold text-emerald-900">
                  <span className="flex items-center gap-1.5"><Sparkles size={15} /> AI Telemetry Assessment</span>
                  <span>Confidence: {aiResult.confidence}</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-neutral-700 pt-1 text-[11px]">
                  <div>Classified Category: <strong>{aiResult.detectedCategory}</strong></div>
                  <div>Assigned Ward Unit: <strong>{aiResult.assignedDept}</strong></div>
                  <div>Urgency Level: <strong className="text-red-600">Score {aiResult.severityScore}/100</strong></div>
                  <div>Max Resolution SLA: <strong className="text-brand-700">{aiResult.slaTargetHours} Hours</strong></div>
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-between pt-4">
            <Button variant="outline" className="rounded-full px-6" onClick={() => setCurrentStep(2)}>
              <ArrowLeft size={16} /> Back
            </Button>
            <Button variant="primary" className="rounded-full px-6" onClick={() => setCurrentStep(4)}>
              Review & Finalize <ArrowRight size={16} />
            </Button>
          </div>
        </Card>
      )}

      {/* Step 4: Review & Submit */}
      {currentStep === 4 && (
        <Card className="p-6 space-y-6">
          <div>
            <h3 className="text-lg font-bold text-neutral-900">Review Grievance Submission</h3>
            <p className="text-xs text-neutral-500">Confirm all details before submitting to Brihanmumbai Municipal Corporation.</p>
          </div>

          <div className="space-y-4">
            <div className="p-4 bg-neutral-50 rounded-2xl border border-neutral-100 space-y-3 text-xs">
              <div className="flex items-center justify-between border-b border-neutral-200 pb-2">
                <span className="font-semibold text-neutral-500">Category</span>
                <span className="font-bold text-neutral-900">{category}</span>
              </div>
              <div className="flex items-center justify-between border-b border-neutral-200 pb-2">
                <span className="font-semibold text-neutral-500">Assigned Ward</span>
                <span className="font-bold text-neutral-900">{currentWard.name} ({currentWard.area})</span>
              </div>
              <div className="flex items-center justify-between border-b border-neutral-200 pb-2">
                <span className="font-semibold text-neutral-500">GPS Coordinates</span>
                <span className="font-mono text-neutral-700">{coordinates.lat.toFixed(4)}, {coordinates.lng.toFixed(4)}</span>
              </div>
              <div className="flex items-center justify-between border-b border-neutral-200 pb-2">
                <span className="font-semibold text-neutral-500">Issue Title</span>
                <span className="font-bold text-neutral-900">{title || `${category} on ${currentWard.area}`}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-semibold text-neutral-500">AI Priority SLA</span>
                <span className="font-bold text-emerald-700">24-Hour Municipal Resolution</span>
              </div>
            </div>

            {imagePreview && (
              <div className="flex items-center gap-3 p-3 bg-white rounded-2xl border border-neutral-200">
                <img src={imagePreview} alt="Evidence" className="w-16 h-12 object-cover rounded-xl" />
                <div className="text-xs">
                  <div className="font-bold text-neutral-900">Photo Evidence Attached</div>
                  <div className="text-neutral-400 text-[11px]">Ready for field inspection crew</div>
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-between pt-4">
            <Button variant="outline" className="rounded-full px-6" onClick={() => setCurrentStep(3)}>
              <ArrowLeft size={16} /> Edit Details
            </Button>
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="px-8 py-3.5 rounded-full font-bold text-sm bg-accent-600 hover:bg-accent-700 text-white shadow-accent hover:shadow-lg transition-all cursor-pointer flex items-center gap-2"
            >
              {isSubmitting ? 'Submitting to BMC...' : 'Confirm & Dispatch Grievance'}
            </button>
          </div>
        </Card>
      )}
    </div>
  );
};
