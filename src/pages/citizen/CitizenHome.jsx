import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  AlertTriangle, MapPin, Camera, Sparkles, Clock, CheckCircle2,
  ThumbsUp, MessageSquare, Shield, ArrowRight, Filter
} from 'lucide-react';
import { getComplaints } from '../../api/complaints.api';
import { ComplaintCard, StatusBadge, SeverityBadge, CategoryIcon } from '../../components/complaints/ComplaintComponents';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { LeafletMap } from '../../components/map/LeafletMap';
import { useAuth } from '../../context/AuthContext';

export const CitizenHome = () => {
  const { user } = useAuth();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await getComplaints({ ward: user?.ward || 8 });
        setComplaints(res.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [user]);

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Quick Action Hero Banner */}
      <div className="bg-gradient-to-r from-brand-600 to-emerald-700 text-white rounded-3xl p-6 sm:p-10 shadow-soft-xl flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2 text-center md:text-left">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-white text-xs font-semibold">
            <Sparkles size={14} /> Kaiser AI Auto-Assistance Active
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold">Welcome back, {user?.name || 'Citizen'}!</h2>
          <p className="text-xs sm:text-sm text-brand-100 max-w-lg leading-relaxed">
            Spot a road pothole, leaking water main, or open drain? Snap a photo and Kaiser AI will auto-categorize and dispatch it to your ward engineer.
          </p>
        </div>
        <div className="shrink-0 flex flex-col sm:flex-row gap-3">
          <Link to="/app/report">
            <button className="px-6 py-3.5 rounded-full font-bold text-sm bg-accent-600 hover:bg-accent-700 text-white shadow-lg flex items-center gap-2 cursor-pointer transition-all transform active:scale-95">
              <AlertTriangle size={18} />
              Report Issue Now
            </button>
          </Link>
          <Link to="/app/map">
            <button className="px-5 py-3.5 rounded-full font-semibold text-sm bg-white/15 hover:bg-white/25 text-white border border-white/20 flex items-center gap-2 cursor-pointer transition-all">
              <MapPin size={18} />
              Explore Ward Map
            </button>
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 border-l-4 border-l-brand-600 space-y-1">
          <span className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">My Submissions</span>
          <div className="text-2xl font-bold text-neutral-900">3 Active</div>
          <div className="text-[11px] text-brand-600 font-semibold">G/N Ward Bandra</div>
        </Card>

        <Card className="p-4 border-l-4 border-l-amber-500 space-y-1">
          <span className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">In Progress</span>
          <div className="text-2xl font-bold text-amber-600">2 In Repair</div>
          <div className="text-[11px] text-neutral-400">Crew on site</div>
        </Card>

        <Card className="p-4 border-l-4 border-l-emerald-500 space-y-1">
          <span className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">Resolved</span>
          <div className="text-2xl font-bold text-emerald-600">8 Completed</div>
          <div className="text-[11px] text-emerald-600 font-semibold">Photo verified</div>
        </Card>

        <Card className="p-4 border-l-4 border-l-sky-500 space-y-1">
          <span className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">Citizen Score</span>
          <div className="text-2xl font-bold text-sky-700">Top 5%</div>
          <div className="text-[11px] text-sky-600 font-semibold">Community champion</div>
        </Card>
      </div>

      {/* Map & Recent Feed Split */}
      <div className="grid lg:grid-cols-12 gap-8">
        {/* Nearby Map Widget */}
        <div className="lg:col-span-6 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-neutral-900 text-base flex items-center gap-2">
              <MapPin size={18} className="text-brand-600" />
              Issues in Your Ward on OpenStreetMap
            </h3>
            <Link to="/app/map" className="text-xs text-brand-700 font-semibold hover:underline">
              Full Map →
            </Link>
          </div>

          <div className="rounded-2xl overflow-hidden border border-neutral-200">
            <LeafletMap
              center={[19.0596, 72.8296]}
              zoom={13}
              complaints={complaints}
              height="360px"
            />
          </div>
        </div>

        {/* Recent Ward Complaints */}
        <div className="lg:col-span-6 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-neutral-900 text-base">Live Ward Activity</h3>
            <Link to="/app/my-complaints" className="text-xs text-brand-700 font-semibold hover:underline">
              View My Reports →
            </Link>
          </div>

          <div className="space-y-3 max-h-[360px] overflow-y-auto pr-1">
            {complaints.slice(0, 3).map((item) => (
              <ComplaintCard key={item.id} complaint={item} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
