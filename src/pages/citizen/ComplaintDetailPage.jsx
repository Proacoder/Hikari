import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ThumbsUp, MessageSquare, Clock, MapPin, Share2,
  Send, Star, AlertTriangle, ShieldCheck, Lock,
  RotateCcw, CheckCircle, X
} from 'lucide-react';
import {
  getComplaintById, upvoteComplaint, getComments, addComment,
  reopenComplaint, affirmComplaint, submitComplaintFeedback, getComplaintWhatsApp
} from '../../api/complaints.api';
import { getCurrentSessionUser } from '../../api/auth.api';
import { StatusTimeline, SeverityBadge, StatusBadge, CategoryIcon } from '../../components/complaints/ComplaintComponents';
import { LeafletMap } from '../../components/map/LeafletMap';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { formatRelative, formatDateTime } from '../../utils/formatters';
import toast from 'react-hot-toast';

export const ComplaintDetailPage = () => {
  const { id } = useParams();
  const [complaint, setComplaint] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [upvotes, setUpvotes] = useState(0);
  const [hasUpvoted, setHasUpvoted] = useState(false);
  const [activePhoto, setActivePhoto] = useState(0);

  // Auth Context
  const currentUser = getCurrentSessionUser();
  const isStaff = currentUser?.role === 'officer' || currentUser?.role === 'admin';

  // Feedback State
  const [selectedRating, setSelectedRating] = useState(5);
  const [selectedTags, setSelectedTags] = useState([]);
  const [feedbackComment, setFeedbackComment] = useState('');
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  const [feedbackSubmitting, setFeedbackSubmitting] = useState(false);

  // Re-open Modal State (Anti-Abuse Protocol)
  const [showReopenModal, setShowReopenModal] = useState(false);
  const [reopenReason, setReopenReason] = useState('');
  const [reopenPhotoUrl, setReopenPhotoUrl] = useState('');
  const [reopenSubmitting, setReopenSubmitting] = useState(false);

  // Supervisory Affirmation Modal State (Anti-Vexatious Lock)
  const [showAffirmModal, setShowAffirmModal] = useState(false);
  const [affirmNotes, setAffirmNotes] = useState('Supervisory field audit confirmed repair meets MCGM municipal standards. Reopen dismissed as vexatious.');
  const [affirmSubmitting, setAffirmSubmitting] = useState(false);

  // WhatsApp Loading State
  const [whatsAppLoading, setWhatsAppLoading] = useState(false);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isCancelled = false;
    async function load() {
      setLoading(true);
      setError(null);
      setComplaint(null);
      try {
        const [compRes, commRes] = await Promise.all([
          getComplaintById(id || 'cmp-001'),
          getComments(id || 'cmp-001')
        ]);
        if (isCancelled) return;
        const comp = compRes?.data;
        if (!comp) {
          setError({ type: 'notFound', message: `Grievance #${id} could not be found or may have been archived.` });
          return;
        }
        setComplaint(comp);
        setUpvotes(comp.upvoteCount || 0);
        setComments(commRes?.data || []);
        if (comp.rating) {
          setSelectedRating(comp.rating);
          setSelectedTags(comp.feedbackTags || []);
          setFeedbackComment(comp.feedbackComment || '');
          setFeedbackSubmitted(true);
        }
      } catch (err) {
        if (isCancelled) return;
        console.error('Failed to load complaint details:', err);
        const status = err?.response?.status;
        if (status === 404) {
          setError({ type: 'notFound', message: `Grievance #${id} does not exist in the municipal registry.` });
        } else {
          setError({ type: 'network', message: err?.message || 'Failed to connect to municipal telemetry. Please check your connection and retry.' });
        }
      } finally {
        if (!isCancelled) setLoading(false);
      }
    }
    load();
    return () => {
      isCancelled = true;
    };
  }, [id]);

  const handleUpvote = async () => {
    if (hasUpvoted) return;
    try {
      await upvoteComplaint(complaint.id);
      setUpvotes(prev => prev + 1);
      setHasUpvoted(true);
      toast.success('Grievance upvoted! Priority escalated.');
    } catch (err) {
      console.error('Failed to upvote complaint:', err);
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success('Complaint link copied to clipboard!');
  };

  const handleWhatsAppAction = async () => {
    try {
      setWhatsAppLoading(true);
      const res = await getComplaintWhatsApp(complaint.id);
      if (res?.data?.shareUrl) {
        window.open(res.data.shareUrl, '_blank', 'noopener,noreferrer');
        toast.success('Official WhatsApp telemetry receipt opened!');
      }
    } catch (err) {
      console.error(err);
      toast.error('Could not generate WhatsApp receipt.');
    } finally {
      setWhatsAppLoading(false);
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    try {
      const res = await addComment(complaint.id, { text: newComment });
      setComments(prev => [...prev, res.data]);
      setNewComment('');
      toast.success('Comment posted.');
    } catch (err) {
      console.error('Failed to add comment:', err);
    }
  };

  // ── Anti-Abuse Reopen Submission ───────────────────────────────────────────
  const handleReopenSubmit = async (e) => {
    e.preventDefault();
    if (!reopenReason.trim() || reopenReason.trim().length < 10) {
      toast.error('Please enter at least 10 characters detailing why the repair remains deficient.');
      return;
    }
    if (!reopenPhotoUrl.trim()) {
      toast.error('Under MCGM Bylaws, photographic evidence of defect is mandatory.');
      return;
    }

    try {
      setReopenSubmitting(true);
      const res = await reopenComplaint(complaint.id, {
        reason: reopenReason.trim(),
        photoUrl: reopenPhotoUrl.trim(),
      });
      setComplaint(res.data);
      setShowReopenModal(false);
      setReopenReason('');
      setReopenPhotoUrl('');
      toast.success('Ticket contested & escalated to Executive Engineer for re-inspection.');
    } catch (err) {
      const msg = err.response?.data?.detail || err.response?.data?.message || err.message || 'Failed to reopen complaint.';
      toast.error(msg);
    } finally {
      setReopenSubmitting(false);
    }
  };

  // ── Supervisory Final Affirmation ──────────────────────────────────────────
  const handleAffirmSubmit = async (e) => {
    e.preventDefault();
    try {
      setAffirmSubmitting(true);
      const res = await affirmComplaint(complaint.id, {
        notes: affirmNotes.trim(),
      });
      setComplaint(res.data);
      setShowAffirmModal(false);
      toast.success('Supervisory Affirmation applied. Grievance permanently finalized.');
    } catch (err) {
      const msg = err.response?.data?.detail || err.message || 'Failed to affirm resolution.';
      toast.error(msg);
    } finally {
      setAffirmSubmitting(false);
    }
  };

  // ── Citizen Feedback Rating ────────────────────────────────────────────────
  const handleFeedbackSubmit = async (e) => {
    e.preventDefault();
    try {
      setFeedbackSubmitting(true);
      const res = await submitComplaintFeedback(complaint.id, {
        rating: selectedRating,
        tags: selectedTags,
        comment: feedbackComment.trim(),
      });
      setComplaint(res.data);
      setFeedbackSubmitted(true);
      toast.success('Thank you! Your resolution rating was submitted to MCGM Quality Audit.');
    } catch (err) {
      console.error('Feedback submit error:', err);
      toast.error('Failed to submit feedback.');
    } finally {
      setFeedbackSubmitting(false);
    }
  };

  const toggleTag = (tag) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter(t => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto py-24 text-center space-y-4">
        <div className="w-10 h-10 border-3 border-brand-200 border-t-brand-600 rounded-full animate-spin mx-auto" />
        <p className="text-sm text-neutral-500 font-medium">Loading grievance telemetry & audit trails...</p>
      </div>
    );
  }

  if (error || !complaint) {
    const isNotFound = error?.type === 'notFound' || !complaint;
    return (
      <div className="max-w-2xl mx-auto py-20 px-4">
        <Card className="p-8 text-center space-y-5 border-neutral-200 shadow-sm">
          <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto text-2xl font-bold border border-amber-200">
            {isNotFound ? '🔍' : '⚠️'}
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-bold text-neutral-900">
              {isNotFound ? 'Grievance Not Found' : 'Connection Failure'}
            </h2>
            <p className="text-sm text-neutral-500 max-w-md mx-auto">
              {error?.message || `Grievance #${id} could not be found or may have been archived.`}
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            {!isNotFound && (
              <Button
                variant="outline"
                onClick={() => {
                  setError(null);
                  setLoading(true);
                  getComplaintById(id || 'cmp-001')
                    .then(r => setComplaint(r.data))
                    .catch(e => setError({ type: 'network', message: e.message }))
                    .finally(() => setLoading(false));
                }}
              >
                Retry
              </Button>
            )}
            <Link
              to="/app/my-complaints"
              className="inline-flex items-center px-4 py-2 rounded-xl text-xs font-semibold bg-brand-600 text-white hover:bg-brand-700 transition"
            >
              Back to My Complaints
            </Link>
            <Link
              to="/app"
              className="inline-flex items-center px-4 py-2 rounded-xl text-xs font-semibold bg-neutral-100 text-neutral-700 hover:bg-neutral-200 transition"
            >
              Citizen Dashboard
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  const DEFAULT_PHOTO = 'https://images.unsplash.com/photo-1541888946425-d0fbb18f15f6?w=600&q=80';
  const resolvedPhoto = complaint.resolvedImageUrl || (complaint.status === 'resolved' ? 'https://images.unsplash.com/photo-1584467735871-8e85353a8413?w=600&q=80' : null);
  const reopenProofPhoto = complaint.reopenPhotoUrl;

  const photos = [
    complaint.imageUrl || DEFAULT_PHOTO,
    resolvedPhoto,
    reopenProofPhoto,
  ].filter(Boolean);

  // 48-Hour SLA Check
  const isWithin48Hours = Boolean(
    complaint.resolvedAt &&
    (Date.now() - new Date(complaint.resolvedAt).getTime()) <= 48 * 3600 * 1000
  );

  const FEEDBACK_TAG_OPTIONS = [
    'Fixed Promptly',
    'Clean Finish',
    'Courteous Crew',
    'Durable Material',
    'Minimal Traffic Disruption'
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Top Breadcrumb & Actions */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link to="/app/my-complaints" className="text-xs font-semibold text-brand-700 hover:underline">
          ← Back to Complaints
        </Link>
        <div className="flex items-center gap-2">
          {/* WhatsApp Direct Grievance Receipt */}
          <button
            type="button"
            onClick={handleWhatsAppAction}
            disabled={whatsAppLoading}
            className="px-3.5 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 transition-all bg-emerald-600 hover:bg-emerald-700 text-white shadow-soft-sm cursor-pointer disabled:opacity-50"
            title="Open official WhatsApp telemetry receipt"
          >
            <span>📱 WhatsApp Receipt</span>
          </button>

          <Button variant="outline" size="sm" onClick={handleShare} icon={Share2} className="rounded-full">
            Share
          </Button>

          <button
            onClick={handleUpvote}
            disabled={hasUpvoted}
            className={`px-4 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              hasUpvoted
                ? 'bg-brand-600 text-white shadow-soft-sm'
                : 'bg-white border border-brand-300 text-brand-700 hover:bg-brand-50'
            }`}
          >
            <ThumbsUp size={14} />
            <span>{upvotes} Upvotes</span>
          </button>
        </div>
      </div>

      {/* Reopened Grievance Urgent Alert Banner */}
      {complaint.status === 'reopened' && (
        <div className="p-4 bg-amber-500/10 border-2 border-amber-500/40 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-amber-950">
          <div className="space-y-1">
            <div className="flex items-center gap-2 font-black text-sm text-amber-900">
              <AlertTriangle className="text-amber-600 shrink-0" size={18} />
              <span>Grievance Contested by Citizen • Escalated to Executive Engineer</span>
            </div>
            <p className="text-xs text-amber-800 leading-relaxed">
              <strong>Contest Reason:</strong> "{complaint.reopenReason || 'Citizen reported continuing defect with photo proof'}"
              {complaint.reopenedAt && <span className="block text-[11px] text-amber-700/80 mt-0.5">Contested on: {formatDateTime(complaint.reopenedAt)}</span>}
            </p>
          </div>

          {/* Supervisor Final Affirmation (Staff Only) */}
          {isStaff && (
            <Button
              variant="primary"
              size="sm"
              onClick={() => setShowAffirmModal(true)}
              icon={ShieldCheck}
              className="bg-amber-700 hover:bg-amber-800 border-amber-800 shrink-0 text-xs font-bold"
            >
              Supervisory Affirmation
            </Button>
          )}
        </div>
      )}

      {/* Permanently Locked Notice */}
      {complaint.isPermanentlyLocked && (
        <div className="p-4 bg-neutral-900 text-white rounded-2xl flex items-center gap-3 text-xs shadow-soft-md">
          <Lock className="text-amber-400 shrink-0" size={18} />
          <div>
            <strong className="text-amber-400 block font-bold">Executive Municipal Determination Affirmation</strong>
            <span>This grievance was audited and permanently affirmed by the Superintending Municipal Engineer. Resolution is certified as meeting MCGM standards.</span>
          </div>
        </div>
      )}

      {/* Main Grid */}
      <div className="grid lg:grid-cols-12 gap-8">
        
        {/* Left Column (Images, Details, Citizen Feedback, Comments) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Photos Showcase */}
          <Card className="overflow-hidden p-0 border border-neutral-200">
            <div className="relative h-72 bg-neutral-900">
              <img
                src={photos[activePhoto] || DEFAULT_PHOTO}
                alt={complaint.title}
                onError={(e) => { e.currentTarget.src = DEFAULT_PHOTO; }}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-3 left-3 flex gap-2">
                <SeverityBadge score={complaint.severity} />
                <StatusBadge status={complaint.status} />
              </div>
            </div>

            {photos.length > 1 && (
              <div className="flex flex-wrap gap-2 p-3 bg-neutral-50 border-t border-neutral-100">
                <button
                  onClick={() => setActivePhoto(0)}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold cursor-pointer ${activePhoto === 0 ? 'bg-brand-600 text-white' : 'bg-white text-neutral-600 border'}`}
                >
                  1. Incident Photo
                </button>
                {resolvedPhoto && (
                  <button
                    onClick={() => setActivePhoto(1)}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold cursor-pointer ${activePhoto === 1 ? 'bg-emerald-600 text-white' : 'bg-white text-neutral-600 border'}`}
                  >
                    2. Resolution Proof
                  </button>
                )}
                {reopenProofPhoto && (
                  <button
                    onClick={() => setActivePhoto(photos.length - 1)}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold cursor-pointer ${activePhoto === photos.length - 1 ? 'bg-amber-600 text-white' : 'bg-white text-neutral-600 border'}`}
                  >
                    3. Citizen Contest Proof
                  </button>
                )}
              </div>
            )}
          </Card>

          {/* Details & Description */}
          <Card className="p-6 space-y-4">
            <div className="flex items-center gap-2">
              <CategoryIcon category={complaint.category} size="sm" />
              <span className="text-xs font-bold uppercase tracking-wider text-brand-700">{complaint.category}</span>
            </div>

            <h1 className="text-2xl font-bold text-neutral-900 leading-snug">{complaint.title}</h1>
            <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed">{complaint.description}</p>

            <div className="pt-3 border-t border-neutral-100 flex flex-wrap items-center justify-between gap-2 text-xs text-neutral-500">
              <div className="flex items-center gap-1.5">
                <MapPin size={14} className="text-brand-600" />
                <span>Ward #{complaint.ward}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock size={14} />
                <span>Reported {formatDateTime(complaint.createdAt)}</span>
              </div>
            </div>
          </Card>

          {/* Citizen Resolution Quality Feedback & Anti-Abuse Contest Section */}
          {complaint.status === 'resolved' && (
            <Card className="p-6 border-2 border-emerald-500/30 bg-emerald-50/20 space-y-5">
              <div className="flex items-start justify-between flex-wrap gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="text-emerald-600" size={18} />
                    <h3 className="font-extrabold text-neutral-900 text-sm">Citizen Resolution Feedback & Audit</h3>
                  </div>
                  <p className="text-xs text-neutral-500 mt-0.5">
                    Rate the repair quality completed by Ward #{complaint.ward} municipal crews.
                  </p>
                </div>
                <Badge variant="success" size="sm">Resolution Certified</Badge>
              </div>

              {/* Rating and Tags Form */}
              <form onSubmit={handleFeedbackSubmit} className="space-y-4">
                {/* 5-Star Rating */}
                <div className="space-y-1.5">
                  <span className="text-xs font-bold text-neutral-700 block">Work Quality Rating:</span>
                  <div className="flex items-center gap-1.5">
                    {[1, 2, 3, 4, 5].map((num) => (
                      <button
                        type="button"
                        key={num}
                        onClick={() => setSelectedRating(num)}
                        disabled={feedbackSubmitted}
                        className="p-1 text-amber-400 hover:scale-110 transition cursor-pointer disabled:cursor-default"
                      >
                        <Star
                          size={22}
                          className={num <= selectedRating ? 'fill-amber-400 text-amber-400' : 'text-neutral-300'}
                        />
                      </button>
                    ))}
                    <span className="text-xs font-bold text-neutral-600 ml-2">
                      {selectedRating === 5 ? 'Excellent Quality' : selectedRating === 4 ? 'Good Repair' : selectedRating === 3 ? 'Average' : 'Needs Improvement'}
                    </span>
                  </div>
                </div>

                {/* Feedback Tags */}
                <div className="space-y-1.5">
                  <span className="text-xs font-bold text-neutral-700 block">Feedback Highlights:</span>
                  <div className="flex flex-wrap gap-2">
                    {FEEDBACK_TAG_OPTIONS.map((tag) => {
                      const isSelected = selectedTags.includes(tag);
                      return (
                        <button
                          type="button"
                          key={tag}
                          disabled={feedbackSubmitted}
                          onClick={() => toggleTag(tag)}
                          className={`px-3 py-1 rounded-full text-xs font-semibold transition cursor-pointer ${
                            isSelected
                              ? 'bg-emerald-600 text-white shadow-soft-sm'
                              : 'bg-white border border-neutral-200 text-neutral-600 hover:bg-neutral-50'
                          }`}
                        >
                          {isSelected ? '✓ ' : ''}{tag}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Optional Comment */}
                {!feedbackSubmitted ? (
                  <div className="space-y-2">
                    <input
                      type="text"
                      placeholder="Add an optional review or thank-you note for the ward crew..."
                      value={feedbackComment}
                      onChange={(e) => setFeedbackComment(e.target.value)}
                      className="w-full text-xs rounded-xl border border-neutral-200 p-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                    />
                    <Button
                      type="submit"
                      variant="primary"
                      size="sm"
                      disabled={feedbackSubmitting}
                      className="bg-emerald-600 hover:bg-emerald-700 text-xs"
                    >
                      {feedbackSubmitting ? 'Submitting...' : 'Submit Resolution Feedback'}
                    </Button>
                  </div>
                ) : (
                  <div className="p-3 bg-white rounded-xl border border-emerald-200 text-xs text-emerald-800 flex items-center justify-between">
                    <span>Feedback recorded in MCGM Annual Ward Performance Audit.</span>
                    <span className="font-bold">Rating: {selectedRating}/5 ★</span>
                  </div>
                )}
              </form>

              {/* Anti-Abuse Contest Resolution Section */}
              <div className="pt-4 border-t border-emerald-200/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <span className="text-xs font-bold text-neutral-900 block">Repair Unsatisfactory or Incomplete?</span>
                  <span className="text-[11px] text-neutral-500 block">
                    Under MCGM Civic Bylaws, you may contest resolution within 48h with mandatory defect photo proof.
                  </span>
                </div>

                {complaint.isPermanentlyLocked ? (
                  <span className="text-xs font-bold text-neutral-500 inline-flex items-center gap-1 bg-neutral-100 px-3 py-1.5 rounded-full">
                    <Lock size={12} /> Resolution Locked
                  </span>
                ) : (complaint.reopenCount || 0) >= 1 ? (
                  <span className="text-xs font-bold text-amber-700 inline-flex items-center gap-1 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-full">
                    Contest Limit Reached (1/1)
                  </span>
                ) : isWithin48Hours ? (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowReopenModal(true)}
                    icon={RotateCcw}
                    className="border-amber-300 text-amber-800 hover:bg-amber-50 text-xs shrink-0"
                  >
                    Contest Resolution / Reopen
                  </Button>
                ) : (
                  <span className="text-xs text-neutral-400 italic">48h Reopen Window Expired</span>
                )}
              </div>
            </Card>
          )}

          {/* Comments Section */}
          <Card className="p-6 space-y-4">
            <h3 className="font-bold text-neutral-900 text-sm flex items-center gap-2">
              <MessageSquare size={16} className="text-brand-600" />
              Community & Officer Updates ({comments.length})
            </h3>

            <div className="space-y-3">
              {comments.map((comm) => (
                <div
                  key={comm.id}
                  className={`p-3.5 rounded-2xl text-xs space-y-1 ${
                    comm.author?.role === 'officer'
                      ? 'bg-sky-50 border border-sky-200'
                      : 'bg-neutral-50 border border-neutral-100'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-neutral-900 flex items-center gap-1.5">
                      {comm.author?.name}
                      {comm.author?.role === 'officer' && (
                        <span className="bg-sky-600 text-white text-[10px] px-2 py-0.2 rounded-full font-bold">BMC Officer</span>
                      )}
                    </span>
                    <span className="text-[11px] text-neutral-400">{formatRelative(comm.createdAt)}</span>
                  </div>
                  <p className="text-neutral-700 leading-relaxed">{comm.text}</p>
                </div>
              ))}
            </div>

            <form onSubmit={handleAddComment} className="flex gap-2 pt-2">
              <input
                type="text"
                placeholder="Add citizen comment or follow-up note..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="flex-1 rounded-xl border border-neutral-200 px-3 py-2 text-xs focus:ring-2 focus:ring-brand-500/20"
              />
              <Button type="submit" variant="primary" size="sm" icon={Send} className="rounded-xl">
                Post
              </Button>
            </form>
          </Card>
        </div>

        {/* Right Column (Status Timeline, Officer Card, Map) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Status Timeline */}
          <Card className="p-6 space-y-4 border border-neutral-200">
            <h3 className="font-bold text-neutral-900 text-sm">Resolution Lifecycle</h3>
            <StatusTimeline status={complaint.status} complaint={complaint} />
          </Card>

          {/* Assigned Officer Card */}
          <Card className="p-5 border border-neutral-200 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-neutral-500">Assigned Ward Official</span>
              <Badge variant="brand">Active Duty</Badge>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-brand-100 text-brand-700 font-bold flex items-center justify-center text-sm">
                {complaint.assignedOfficer?.name?.[0] || 'SP'}
              </div>
              <div>
                <div className="font-bold text-xs text-neutral-900">
                  {complaint.assignedOfficer?.name || 'Suresh Patil (Junior Engineer)'}
                </div>
                <div className="text-[11px] text-neutral-400">Roads & Infrastructure Maintenance</div>
              </div>
            </div>
          </Card>

          {/* Location on OpenStreetMap */}
          <Card className="p-4 space-y-3 border border-neutral-200">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-neutral-800 flex items-center gap-1.5">
                <MapPin size={14} className="text-brand-600" />
                Exact Pinned Location
              </span>
              <span className="text-[11px] text-neutral-400 font-mono">
                {complaint.latitude?.toFixed(4)}, {complaint.longitude?.toFixed(4)}
              </span>
            </div>
            <div className="rounded-xl overflow-hidden border border-neutral-200">
              <LeafletMap
                center={[complaint.latitude || 19.0596, complaint.longitude || 72.8296]}
                zoom={15}
                complaints={[complaint]}
                height="220px"
              />
            </div>
          </Card>
        </div>

      </div>

      {/* ── Anti-Abuse Contest / Re-open Modal ───────────────────────────────── */}
      {showReopenModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/80 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-5 shadow-2xl border border-neutral-200">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-amber-700 font-black text-base">
                  <RotateCcw size={18} />
                  <span>Contest Resolution (Official MCGM Protocol)</span>
                </div>
                <p className="text-xs text-neutral-500">
                  Ticket #{complaint.id} • Ward #{complaint.ward}
                </p>
              </div>
              <button
                onClick={() => setShowReopenModal(false)}
                className="p-1 rounded-full text-neutral-400 hover:text-neutral-600"
              >
                <X size={18} />
              </button>
            </div>

            {/* Anti-Abuse Legal Disclosure Box */}
            <div className="p-3.5 bg-amber-50 rounded-2xl border border-amber-200/80 text-xs text-amber-900 space-y-1">
              <div className="font-bold flex items-center gap-1.5 text-amber-800">
                <AlertTriangle size={14} /> Municipal Anti-Abuse Safeguards
              </div>
              <p className="text-[11px] text-amber-800/90 leading-relaxed">
                Citizens may contest resolutions within 48 hours if physical work remains defective. To prevent frivolous disruptions, <strong>mandatory photographic proof</strong> and an exact description are required. Reopenings are restricted to 1 occurrence per ticket and escalate directly to the Executive Engineer.
              </p>
            </div>

            <form onSubmit={handleReopenSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-neutral-800 block">
                  Detailed Defect Justification <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="Explain why the repair is incomplete or defective (e.g. 'Pothole gravel washed away after rain, edge remains exposed')..."
                  value={reopenReason}
                  onChange={(e) => setReopenReason(e.target.value)}
                  className="w-full text-xs rounded-xl border border-neutral-200 p-3 focus:outline-none focus:ring-2 focus:ring-amber-500/30"
                />
                <span className="text-[10px] text-neutral-400 block text-right font-mono">
                  {reopenReason.length}/10 min characters
                </span>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-neutral-800 block">
                  Mandatory Photographic Evidence URL <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    required
                    placeholder="https://... photo showing continuing defect"
                    value={reopenPhotoUrl}
                    onChange={(e) => setReopenPhotoUrl(e.target.value)}
                    className="flex-1 text-xs rounded-xl border border-neutral-200 p-2.5 focus:outline-none focus:ring-2 focus:ring-amber-500/30"
                  />
                </div>
                {/* Preset quick sample evidence */}
                <div className="flex items-center gap-1.5 pt-1">
                  <span className="text-[10px] text-neutral-400">Quick Test Proof:</span>
                  <button
                    type="button"
                    onClick={() => setReopenPhotoUrl('https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=600&q=80')}
                    className="text-[10px] text-brand-600 underline hover:text-brand-800 cursor-pointer"
                  >
                    Sample Incomplete Work Photo
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-neutral-100">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowReopenModal(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  disabled={reopenSubmitting}
                  className="bg-amber-600 hover:bg-amber-700"
                >
                  {reopenSubmitting ? 'Verifying & Reopening...' : 'Submit Contest & Escalate'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Supervisory Final Affirmation Modal (Anti-Vexatious Lock) ───────── */}
      {showAffirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/80 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-5 shadow-2xl border border-neutral-200">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-neutral-900 font-black text-base">
                  <ShieldCheck className="text-amber-600" size={20} />
                  <span>Supervisory Final Affirmation & Lock</span>
                </div>
                <p className="text-xs text-neutral-500">
                  Brihanmumbai Executive Engineer Review Panel
                </p>
              </div>
              <button
                onClick={() => setShowAffirmModal(false)}
                className="p-1 rounded-full text-neutral-400 hover:text-neutral-600"
              >
                <X size={18} />
              </button>
            </div>

            <p className="text-xs text-neutral-600 leading-relaxed">
              If citizen reopening is verified to be <strong>frivolous, without defect, or intended to disrupt municipal operations</strong>, this affirmation permanently locks the grievance as resolved under MCGM Executive Bylaws.
            </p>

            <form onSubmit={handleAffirmSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-neutral-800 block">
                  Executive Field Audit Findings <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={3}
                  required
                  value={affirmNotes}
                  onChange={(e) => setAffirmNotes(e.target.value)}
                  className="w-full text-xs rounded-xl border border-neutral-200 p-3 focus:outline-none focus:ring-2 focus:ring-amber-500/30"
                />
              </div>

              <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200 text-[11px] text-neutral-600 flex items-center gap-2">
                <Lock size={14} className="text-amber-600 shrink-0" />
                <span>Affirming will change status to <strong>Resolved</strong> and flag as <strong>Permanently Locked</strong>.</span>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-neutral-100">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowAffirmModal(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  disabled={affirmSubmitting}
                  className="bg-neutral-900 hover:bg-neutral-800 text-white"
                >
                  {affirmSubmitting ? 'Affirming...' : 'Affirm & Permanently Lock'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
