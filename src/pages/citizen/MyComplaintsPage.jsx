import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, Filter, Plus, Search } from 'lucide-react';
import { getMyComplaints } from '../../api/complaints.api';
import { ComplaintCard } from '../../components/complaints/ComplaintComponents';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';

export const MyComplaintsPage = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('ALL');
  const [search, setSearch] = useState('');

  useEffect(() => {
    async function load() {
      try {
        const res = await getMyComplaints();
        setComplaints(res.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const filtered = complaints.filter(c => {
    const matchesSearch = c.title.toLowerCase().includes(search.toLowerCase()) ||
                          c.category.toLowerCase().includes(search.toLowerCase());
    if (!matchesSearch) return false;
    if (activeTab === 'REPORTED') return c.status === 'reported';
    if (activeTab === 'ASSIGNED') return c.status === 'assigned';
    if (activeTab === 'IN_PROGRESS') return c.status === 'in_progress';
    if (activeTab === 'RESOLVED') return c.status === 'resolved';
    return true;
  });

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-neutral-900">My Reported Issues</h1>
          <p className="text-xs text-neutral-500">Track progress, upvotes, and resolution photos for your submitted complaints.</p>
        </div>
        <Link to="/app/report">
          <Button variant="primary" className="rounded-full shadow-brand" icon={AlertTriangle}>
            Report New Issue
          </Button>
        </Link>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-200 pb-3">
        <div className="flex space-x-2 overflow-x-auto pb-1 text-xs font-semibold">
          {[
            { id: 'ALL', label: `All (${complaints.length})` },
            { id: 'REPORTED', label: 'Reported' },
            { id: 'ASSIGNED', label: 'Assigned' },
            { id: 'IN_PROGRESS', label: 'In Progress' },
            { id: 'RESOLVED', label: 'Resolved' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3 py-1.5 rounded-full transition-all cursor-pointer ${
                activeTab === tab.id
                  ? 'bg-brand-600 text-white shadow-soft-sm'
                  : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={14} />
          <input
            type="text"
            placeholder="Search by title or category..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 pr-3 py-1.5 text-xs bg-white border border-neutral-200 rounded-xl focus:ring-2 focus:ring-brand-500/20 w-full sm:w-60"
          />
        </div>
      </div>

      {/* Complaints List or Empty State */}
      {filtered.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((item) => (
            <ComplaintCard key={item.id} complaint={item} />
          ))}
        </div>
      ) : (
        <Card className="p-12 text-center space-y-4 max-w-md mx-auto my-8">
          <div className="w-16 h-16 rounded-full bg-brand-50 text-brand-600 flex items-center justify-center mx-auto">
            <AlertTriangle size={32} />
          </div>
          <h3 className="font-bold text-neutral-900 text-base">No Complaints in this view</h3>
          <p className="text-xs text-neutral-500">
            {search ? 'Try adjusting your search keywords.' : "You haven't submitted any complaints with this status yet."}
          </p>
          <Link to="/app/report" className="inline-block pt-2">
            <Button variant="primary" size="sm" className="rounded-full">Report an Issue Now</Button>
          </Link>
        </Card>
      )}
    </div>
  );
};
