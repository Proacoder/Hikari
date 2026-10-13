import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  MapPin, Filter, Search, Layers, AlertTriangle, CheckCircle2,
  ChevronRight, X, SlidersHorizontal
} from 'lucide-react';
import { getMapData } from '../../api/complaints.api';
import { LeafletMap } from '../../components/map/LeafletMap';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { MUMBAI_WARDS, CATEGORIES } from '../../utils/mockData';

export const CitizenMapPage = () => {
  const [complaints, setComplaints] = useState([]);
  const [selectedWard, setSelectedWard] = useState('ALL');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [minSeverity, setMinSeverity] = useState(0);
  const [search, setSearch] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mapCenter, setMapCenter] = useState([19.0760, 72.8777]);
  const [mapZoom, setMapZoom] = useState(12);

  useEffect(() => {
    async function load() {
      try {
        const res = await getMapData();
        setComplaints(res.data || []);
      } catch (err) {
        console.error(err);
      }
    }
    load();
  }, []);

  const filtered = complaints.filter(c => {
    if (selectedWard !== 'ALL' && c.ward !== Number(selectedWard)) return false;
    if (selectedCategory !== 'ALL' && c.category !== selectedCategory) return false;
    if (selectedStatus !== 'ALL' && c.status !== selectedStatus) return false;
    if (c.severity < minSeverity) return false;
    if (search && !c.title.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const handleWardJump = (wId) => {
    setSelectedWard(wId);
    if (wId !== 'ALL') {
      const wardObj = MUMBAI_WARDS.find(w => w.id === Number(wId));
      if (wardObj) {
        setMapCenter([wardObj.lat, wardObj.lng]);
        setMapZoom(14);
      }
    } else {
      setMapCenter([19.0760, 72.8777]);
      setMapZoom(12);
    }
  };

  return (
    <div className="space-y-4 max-w-7xl mx-auto h-[calc(100vh-100px)] flex flex-col">
      {/* Top Controls Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-neutral-200 shadow-soft-sm shrink-0">
        <div>
          <h1 className="text-xl font-bold text-neutral-900 flex items-center gap-2">
            <MapPin size={20} className="text-brand-600" />
            Greater Mumbai Geospatial Grievance Map
          </h1>
          <p className="text-xs text-neutral-500">Live telemetry of reported potholes, garbage, and drainage across 26 municipal wards.</p>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={14} />
            <input
              type="text"
              placeholder="Search area / keyword..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 pr-3 py-1.5 text-xs bg-neutral-50 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-brand-500/20 w-48 sm:w-60"
            />
          </div>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 bg-neutral-100 hover:bg-neutral-200 rounded-xl text-neutral-700 transition-colors flex items-center gap-1.5 text-xs font-semibold cursor-pointer"
          >
            <SlidersHorizontal size={14} />
            <span className="hidden sm:inline">Filters</span>
          </button>
          <Link to="/app/report">
            <button className="px-4 py-1.5 bg-accent-600 hover:bg-accent-700 text-white rounded-full text-xs font-bold shadow-accent cursor-pointer flex items-center gap-1.5 transition-all">
              <AlertTriangle size={14} /> Report
            </button>
          </Link>
        </div>
      </div>

      {/* Main Map + Filter Sidebar */}
      <div className="flex-1 flex gap-4 min-h-0 relative">
        
        {/* Filter Sidebar */}
        {sidebarOpen && (
          <div className="w-72 bg-white rounded-2xl border border-neutral-200 shadow-soft-sm p-4 overflow-y-auto space-y-5 shrink-0 animate-fade-in">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-2">
              <span className="font-bold text-sm text-neutral-900">Map Filter Controls</span>
              <button onClick={() => setSidebarOpen(false)} className="text-neutral-400 hover:text-neutral-600">
                <X size={16} />
              </button>
            </div>

            {/* Ward Selector */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-neutral-700">Municipal Ward</label>
              <select
                value={selectedWard}
                onChange={(e) => handleWardJump(e.target.value)}
                className="w-full text-xs bg-neutral-50 border border-neutral-200 rounded-xl p-2 font-medium"
              >
                <option value="ALL">All 26 Mumbai Wards</option>
                {MUMBAI_WARDS.map(w => (
                  <option key={w.id} value={w.id}>{w.name} ({w.area})</option>
                ))}
              </select>
            </div>

            {/* Category Selector */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-neutral-700">Category</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full text-xs bg-neutral-50 border border-neutral-200 rounded-xl p-2 font-medium"
              >
                <option value="ALL">All Categories</option>
                {CATEGORIES.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            {/* Status Filter */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-neutral-700">Status</label>
              <div className="grid grid-cols-2 gap-1 text-xs">
                {['ALL', 'reported', 'assigned', 'in_progress', 'resolved'].map(s => (
                  <button
                    key={s}
                    onClick={() => setSelectedStatus(s)}
                    className={`py-1 px-2 rounded-lg text-left capitalize transition-colors ${
                      selectedStatus === s
                        ? 'bg-brand-600 text-white font-bold'
                        : 'bg-neutral-50 text-neutral-600 hover:bg-neutral-100'
                    }`}
                  >
                    {s === 'ALL' ? 'All Status' : s.replace('_', ' ')}
                  </button>
                ))}
              </div>
            </div>

            {/* Severity Slider */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-bold text-neutral-700">
                <span>Minimum Urgency:</span>
                <span className="text-brand-700">{minSeverity}/100</span>
              </div>
              <input
                type="range"
                min="0"
                max="90"
                step="10"
                value={minSeverity}
                onChange={(e) => setMinSeverity(Number(e.target.value))}
                className="w-full accent-brand-600 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-neutral-400">
                <span>Any Severity</span>
                <span>Critical Only (90+)</span>
              </div>
            </div>

            {/* Legend */}
            <div className="pt-2 border-t border-neutral-100 space-y-2 text-xs">
              <span className="font-bold text-neutral-700 block">Marker Severity Colors:</span>
              <div className="space-y-1 text-[11px] text-neutral-600">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-red-600 shrink-0" />
                  <span>Critical (Score 80–100)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-orange-500 shrink-0" />
                  <span>High (Score 60–79)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-amber-500 shrink-0" />
                  <span>Medium (Score 40–59)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-emerald-600 shrink-0" />
                  <span>Low / Resolved (&lt; 40)</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Full Interactive Leaflet Map */}
        <div className="flex-1 rounded-2xl overflow-hidden border border-neutral-200 relative shadow-soft-sm">
          <LeafletMap
            center={mapCenter}
            zoom={mapZoom}
            complaints={filtered}
            height="100%"
          />
          <div className="absolute bottom-4 left-4 bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-xl shadow-soft-sm text-xs font-semibold text-neutral-700 border border-neutral-200 z-[1000]">
            Showing <strong>{filtered.length}</strong> geocoded incidents on OpenStreetMap
          </div>
        </div>

      </div>
    </div>
  );
};
