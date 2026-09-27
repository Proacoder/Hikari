import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ThumbsUp, MessageSquare, Clock, MapPin, Share2, AlertTriangle,
  ChevronDown, ChevronUp, CheckCircle2, Shield, Send
} from 'lucide-react';
import { getComplaintById, upvoteComplaint, getComments, addComment } from '../../api/complaints.api';
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
  const [showScoreInfo, setShowScoreInfo] = useState(false);
  const [activePhoto, setActivePhoto] = useState(0);

  useEffect(() => {
    async function load() {
      try {
        const [compRes, commRes] = await Promise.all([
          getComplaintById(id || 'cmp-001'),
          getComments(id || 'cmp-001')
        ]);
        const comp = compRes.data;
        setComplaint(comp);
        setUpvotes(comp.upvoteCount || 0);
        setComments(commRes.data || []);
      } catch (err) {
        console.error(err);
      }
    }
    load();
  }, [id]);

  const handleUpvote = async () => {
    if (hasUpvoted) return;
    try {
      await upvoteComplaint(complaint.id);
      setUpvotes(prev => prev + 1);
      setHasUpvoted(true);
      toast.success('Grievance upvoted! Priority escalated.');
    } catch (err) {
      console.error(err);
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success('Complaint link copied to clipboard!');
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
      console.error(err);
    }
  };

  if (!complaint) {
    return (
      <div className="py-20 text-center text-xs text-neutral-400">
        Loading complaint telemetry...
      </div>
    );
  }

  const photos = [
    complaint.imageUrl,
    complaint.status === 'resolved' ? 'https://images.unsplash.com/photo-1584467735871-8e85353a8413?w=600&q=80' : null
  ].filter(Boolean);

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Top Breadcrumb & Share */}
      <div className="flex items-center justify-between">
        <Link to="/app/my-complaints" className="text-xs font-semibold text-brand-700 hover:underline">
          ← Back to Complaints
        </Link>
        <div className="flex items-center gap-2">
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

      {/* Main Grid */}
      <div className="grid lg:grid-cols-12 gap-8">
        
        {/* Left Column (Images, Details, Comments) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Photos Showcase */}
          <Card className="overflow-hidden p-0 border border-neutral-200">
            <div className="relative h-72 bg-neutral-900">
              <img
                src={photos[activePhoto]}
                alt={complaint.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-3 left-3 flex gap-2">
                <SeverityBadge score={complaint.severity} />
                <StatusBadge status={complaint.status} />
              </div>
            </div>

            {photos.length > 1 && (
              <div className="flex gap-2 p-3 bg-neutral-50 border-t border-neutral-100">
                <button
                  onClick={() => setActivePhoto(0)}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold ${activePhoto === 0 ? 'bg-brand-600 text-white' : 'bg-white text-neutral-600 border'}`}
                >
                  Original Report
                </button>
                <button
                  onClick={() => setActivePhoto(1)}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold ${activePhoto === 1 ? 'bg-emerald-600 text-white' : 'bg-white text-neutral-600 border'}`}
                >
                  Resolution Proof Photo
                </button>
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

          {/* Why This Score (Expandable Trust Panel) */}
          <Card className="p-5 border border-brand-100 bg-brand-50/40 space-y-3">
            <button
              onClick={() => setShowScoreInfo(!showScoreInfo)}
              className="w-full flex items-center justify-between text-xs font-bold text-brand-900 cursor-pointer"
            >
              <span>Why this severity score ({complaint.severity}/100)?</span>
              {showScoreInfo ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>

            {showScoreInfo && (
              <div className="text-xs text-neutral-600 space-y-2 pt-2 border-t border-brand-100">
                <p>
                  Kaiser AI uses a weighted algorithm factoring in hazard type, weather telemetry, and citizen engagement:
                </p>
                <div className="grid grid-cols-2 gap-2 text-[11px] pt-1">
                  <div className="p-2 bg-white rounded-lg border border-brand-100">
                    <span className="text-neutral-400 block">AI Vision Confidence:</span>
                    <strong className="text-brand-700">{complaint.aiAnalysis?.confidence ? `${(complaint.aiAnalysis.confidence * 100).toFixed(0)}%` : '94%'}</strong>
                  </div>
                  <div className="p-2 bg-white rounded-lg border border-brand-100">
                    <span className="text-neutral-400 block">Monsoon Risk Factor:</span>
                    <strong className="text-amber-700">{complaint.aiAnalysis?.weatherCondition || 'High Risk'}</strong>
                  </div>
                  <div className="p-2 bg-white rounded-lg border border-brand-100">
                    <span className="text-neutral-400 block">Air Quality Index (AQI):</span>
                    <strong className="text-sky-700">{complaint.aiAnalysis?.aqiAtLocation || 112} AQI</strong>
                  </div>
                  <div className="p-2 bg-white rounded-lg border border-brand-100">
                    <span className="text-neutral-400 block">Community Upvote Weight:</span>
                    <strong className="text-emerald-700">+{upvotes * 0.2} pts</strong>
                  </div>
                </div>
              </div>
            )}
          </Card>

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

        {/* Right Column (Status Timeline & Map) */}
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
    </div>
  );
};
