import React, { useState } from 'react';
import {
  Award, Trophy, TrendingUp,
  Gift, CheckCircle2, ChevronRight, Sparkles, MapPin
} from 'lucide-react';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import toast from 'react-hot-toast';

const createVoucher = (reward) => ({
  id: `VCH-${Date.now().toString(36).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`,
  title: reward.title,
  cost: reward.cost,
  icon: reward.icon,
  desc: reward.desc,
  code: `BMC-${reward.id.toUpperCase()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`,
  claimedAt: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
  validUntil: new Date(Date.now() + 30 * 86400000).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
});

export const CivicLeaderboardPage = () => {
  const [activeTab, setActiveTab] = useState('citizens'); // 'citizens' | 'wards' | 'badges' | 'rewards' | 'vouchers'

  // User karma stats stored persistently
  const [karmaPoints, setKarmaPoints] = useState(() => {
    try {
      const stored = localStorage.getItem('kaiser_citizen_karma');
      return stored !== null ? Number(stored) : 840;
    } catch {
      return 840;
    }
  });

  const [claimedVouchers, setClaimedVouchers] = useState(() => {
    try {
      const stored = localStorage.getItem('kaiser_claimed_vouchers');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const rank = karmaPoints > 1500 ? 5 : karmaPoints > 800 ? 42 : 118;
  const currentTier = karmaPoints > 1500 ? 'Mayor’s Vanguard' : karmaPoints > 600 ? 'BMC Civic Champion' : 'Civic Contributor';

  // Badges data
  const badges = [
    { id: 'b1', title: 'First Responder', desc: 'First citizen to report an urgent hazard in your ward', icon: '⚡', unlocked: true, date: '14 Sept 2026' },
    { id: 'b2', title: 'Monsoon Vigilante', desc: 'Reported 3 drainage/flood hazards resolved before heavy rains', icon: '🌧️', unlocked: true, date: '21 Sept 2026' },
    { id: 'b3', title: 'Pothole Patrol', desc: '5 road defect reports verified and successfully resurfaced', icon: '🛣️', unlocked: true, date: '28 Sept 2026' },
    { id: 'b4', title: 'Community Anchor', desc: 'Upvoted 20 civic grievances to expedite municipal attention', icon: '🤝', unlocked: true, date: '04 Oct 2026' },
    { id: 'b5', title: 'Night Watchman', desc: 'Helped restore 10 broken street lights in ward alleys', icon: '💡', unlocked: false, progress: '7/10' },
    { id: 'b6', title: 'Mayor’s Honor Roll', desc: 'Rank in the top 1% of Mumbai civic contributors for 3 months', icon: '🎖️', unlocked: false, progress: '1/3 mos' },
  ];

  // Top citizen champions
  const topCitizens = [
    { rank: 1, name: 'Aarav Mehta', ward: 'K/E Ward (Andheri East)', points: 1940, tier: 'Mayor’s Vanguard', badge: '🥇' },
    { rank: 2, name: 'Sunita Deshmukh', ward: 'G/N Ward (Bandra West)', points: 1820, tier: 'Mayor’s Vanguard', badge: '🥈' },
    { rank: 3, name: 'Farhan Shaikh', ward: 'H/W Ward (Khar / Bandra)', points: 1690, tier: 'Mayor’s Vanguard', badge: '🥉' },
    { rank: 4, name: 'Priya Nair (You)', ward: 'G/N Ward (Bandra)', points: 840, tier: 'BMC Champion', isUser: true },
    { rank: 5, name: 'Vikram Joshi', ward: 'F/N Ward (Matunga)', points: 790, tier: 'BMC Champion' },
    { rank: 6, name: 'Ananya Rao', ward: 'D Ward (Malabar Hill)', points: 760, tier: 'BMC Champion' },
    { rank: 7, name: 'Rajesh Kadam', ward: 'S Ward (Bhandup)', points: 710, tier: 'BMC Champion' },
  ];

  // Top ward rankings
  const wardRankings = [
    { rank: 1, name: 'G/N Ward', area: 'Bandra / Dadar', resolved: 412, speedDays: 1.8, score: 96.4, trend: '+4.2%' },
    { rank: 2, name: 'K/E Ward', area: 'Andheri East', resolved: 389, speedDays: 2.1, score: 94.8, trend: '+3.1%' },
    { rank: 3, name: 'H/W Ward', area: 'Bandra West / Khar', resolved: 362, speedDays: 2.2, score: 93.1, trend: '+1.8%' },
    { rank: 4, name: 'A Ward', area: 'Colaba / Fort / Nariman Pt', resolved: 320, speedDays: 2.4, score: 91.5, trend: '+0.9%' },
    { rank: 5, name: 'D Ward', area: 'Malabar Hill / Grant Road', resolved: 298, speedDays: 2.6, score: 89.2, trend: '-0.4%' },
    { rank: 6, name: 'F/N Ward', area: 'Matunga / Sion', resolved: 275, speedDays: 2.9, score: 87.0, trend: '+2.0%' },
  ];

  // Civic Rewards Store
  const rewards = [
    { id: 'r1', title: 'Mumbai Metro Card Credit', cost: 400, desc: '₹100 recharge voucher for Maha Mumbai Metro Card', icon: '🚇' },
    { id: 'r2', title: 'BMC Public Parking Pass', cost: 600, desc: '3 Free full-day parking vouchers across BMC lots', icon: '🅿️' },
    { id: 'r3', title: 'Municipal Garden Eco Kit', cost: 500, desc: 'Compost kit & saplings from BMC Horticulture Dept', icon: '🌱' },
    { id: 'r4', title: 'Property Tax Rebate Token', cost: 1200, desc: '1% municipal rebate voucher on annual BMC property tax', icon: '🏛️' },
  ];

  const handleRedeem = (reward) => {
    if (karmaPoints >= reward.cost) {
      const remaining = karmaPoints - reward.cost;
      setKarmaPoints(remaining);
      try {
        localStorage.setItem('kaiser_citizen_karma', String(remaining));
      } catch (e) {
        console.warn(e);
      }

      const newVoucher = createVoucher(reward);

      const updated = [newVoucher, ...claimedVouchers];
      setClaimedVouchers(updated);
      try {
        localStorage.setItem('kaiser_claimed_vouchers', JSON.stringify(updated));
      } catch (e) {
        console.warn(e);
      }

      toast.success(`Redeemed "${reward.title}"! Voucher Code: ${newVoucher.code} (${reward.cost} pts deducted)`, { duration: 5000 });
      setActiveTab('vouchers');
    } else {
      toast.error(`Need ${reward.cost - karmaPoints} more Karma Points to redeem this reward.`);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-800 via-teal-800 to-cyan-900 text-white rounded-3xl p-6 sm:p-8 shadow-soft-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/15 backdrop-blur-md rounded-full text-xs font-semibold text-emerald-200">
              <Sparkles size={14} className="text-amber-300" /> Swachh Mumbai Civic Gamification
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Mumbai Civic Karma & Champions
            </h2>
            <p className="text-xs sm:text-sm text-emerald-100 leading-relaxed">
              Earn Karma Points for verified civic grievance reports, community upvotes, and resolution confirmations. Climb the city-wide leaderboard and redeem municipal rewards!
            </p>
          </div>

          {/* User Karma Spotlight Badge */}
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-4 sm:p-5 text-center min-w-[200px] shadow-lg shrink-0">
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-200">Your Civic Karma</span>
            <div className="text-3xl sm:text-4xl font-black text-amber-300 my-1">{karmaPoints}</div>
            <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/30 text-emerald-100 text-xs font-semibold border border-emerald-400/30">
              <Award size={12} /> {currentTier}
            </div>
            <p className="text-[10px] text-emerald-200/80 mt-1.5">Rank #{rank} across Mumbai</p>
          </div>
        </div>

        {/* Decorative background circle */}
        <div className="absolute -right-12 -bottom-12 w-64 h-64 bg-white/5 rounded-full blur-2xl pointer-events-none" />
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-neutral-200 gap-6 text-sm font-bold text-neutral-500">
        <button
          type="button"
          onClick={() => setActiveTab('citizens')}
          className={`pb-3 transition-colors flex items-center gap-2 ${
            activeTab === 'citizens' ? 'text-brand-600 border-b-2 border-brand-600' : 'hover:text-neutral-800'
          }`}
        >
          <Trophy size={16} /> Top Citizens
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('wards')}
          className={`pb-3 transition-colors flex items-center gap-2 ${
            activeTab === 'wards' ? 'text-brand-600 border-b-2 border-brand-600' : 'hover:text-neutral-800'
          }`}
        >
          <MapPin size={16} /> 26 Ward Rankings
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('badges')}
          className={`pb-3 transition-colors flex items-center gap-2 ${
            activeTab === 'badges' ? 'text-brand-600 border-b-2 border-brand-600' : 'hover:text-neutral-800'
          }`}
        >
          <Award size={16} /> Badges ({badges.filter((b) => b.unlocked).length}/{badges.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('rewards')}
          className={`pb-3 transition-colors flex items-center gap-2 ${
            activeTab === 'rewards' ? 'text-brand-600 border-b-2 border-brand-600' : 'hover:text-neutral-800'
          }`}
        >
          <Gift size={16} /> Civic Rewards Store
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('vouchers')}
          className={`pb-3 transition-colors flex items-center gap-2 ${
            activeTab === 'vouchers' ? 'text-brand-600 border-b-2 border-brand-600' : 'hover:text-neutral-800'
          }`}
        >
          <CheckCircle2 size={16} /> My Vouchers ({claimedVouchers.length})
        </button>
      </div>

      {/* Tab 1: Top Citizens Leaderboard */}
      {activeTab === 'citizens' && (
        <div className="space-y-4">
          <Card className="p-0 overflow-hidden bg-white border-neutral-200 shadow-sm" padding="">
            <div className="p-4 border-b border-neutral-100 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-neutral-900 text-sm">Mumbai Top Citizen Champions</h3>
                <p className="text-xs text-neutral-500">Calculated weekly from verified grievances and municipal confirmations</p>
              </div>
              <Badge variant="emerald">Live Leaderboard</Badge>
            </div>

            <div className="divide-y divide-neutral-100">
              {topCitizens.map((c) => (
                <div
                  key={c.rank}
                  className={`p-4 flex items-center justify-between gap-4 transition-colors ${
                    c.isUser ? 'bg-brand-50/50 font-semibold' : 'hover:bg-neutral-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="w-7 text-center font-bold text-neutral-500 text-sm">
                      {c.badge || `#${c.rank}`}
                    </span>
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-600 to-sky-600 text-white font-bold flex items-center justify-center text-xs shadow-sm">
                      {c.name.split(' ').map((n) => n[0]).join('')}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-neutral-900 text-sm font-bold">{c.name}</span>
                        {c.isUser && (
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-brand-100 text-brand-700">
                            YOU
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-neutral-500">{c.ward}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-right">
                    <div>
                      <div className="font-mono font-extrabold text-brand-700 text-sm">{c.points} pts</div>
                      <div className="text-[11px] text-neutral-400">{c.tier}</div>
                    </div>
                    <ChevronRight size={16} className="text-neutral-400 hidden sm:block" />
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* Tab 2: 26 Ward Rankings */}
      {activeTab === 'wards' && (
        <Card className="p-0 overflow-hidden bg-white border-neutral-200 shadow-sm" padding="">
          <div className="p-4 border-b border-neutral-100 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-neutral-900 text-sm">Inter-Ward Governance Rankings</h3>
              <p className="text-xs text-neutral-500">Ranked by resolution speed, citizen feedback, and SLA compliance</p>
            </div>
            <span className="text-xs text-neutral-400">Updated Daily · 26 BMC Wards</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-neutral-50 text-neutral-500 font-bold border-b border-neutral-100 uppercase text-[10px]">
                <tr>
                  <th className="p-3.5">Rank</th>
                  <th className="p-3.5">Ward & Location</th>
                  <th className="p-3.5">Resolved Issues</th>
                  <th className="p-3.5">Avg Speed</th>
                  <th className="p-3.5">Civic Score</th>
                  <th className="p-3.5">Trend</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {wardRankings.map((w) => (
                  <tr key={w.rank} className="hover:bg-neutral-50 transition-colors">
                    <td className="p-3.5 font-bold text-neutral-700">#{w.rank}</td>
                    <td className="p-3.5">
                      <div className="font-bold text-neutral-900">{w.name}</div>
                      <div className="text-[11px] text-neutral-400">{w.area}</div>
                    </td>
                    <td className="p-3.5 font-semibold text-emerald-600">{w.resolved} Grievances</td>
                    <td className="p-3.5 text-neutral-600 font-mono">{w.speedDays} Days</td>
                    <td className="p-3.5">
                      <span className="px-2 py-0.5 rounded-full font-bold bg-brand-50 text-brand-700 border border-brand-200">
                        {w.score} / 100
                      </span>
                    </td>
                    <td className="p-3.5 font-semibold text-emerald-600 flex items-center gap-1">
                      <TrendingUp size={12} /> {w.trend}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Tab 3: Badges Gallery */}
      {activeTab === 'badges' && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {badges.map((b) => (
            <Card
              key={b.id}
              className={`p-4 border transition-all ${
                b.unlocked
                  ? 'bg-white border-neutral-200 shadow-soft-xs hover:shadow-soft-md'
                  : 'bg-neutral-50/60 border-neutral-200 opacity-70'
              }`}
              padding=""
            >
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 rounded-2xl bg-neutral-100 flex items-center justify-center text-2xl shadow-inner shrink-0">
                  {b.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <h4 className="font-bold text-neutral-900 text-xs truncate">{b.title}</h4>
                    {b.unlocked ? (
                      <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                        Unlocked
                      </span>
                    ) : (
                      <span className="text-[10px] text-neutral-400 font-semibold">{b.progress}</span>
                    )}
                  </div>
                  <p className="text-[11px] text-neutral-500 mt-1 leading-snug">{b.desc}</p>
                  {b.unlocked && (
                    <span className="text-[10px] text-neutral-400 block mt-2">Earned {b.date}</span>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Tab 4: Civic Rewards Store */}
      {activeTab === 'rewards' && (
        <div className="space-y-4">
          <div className="p-4 bg-amber-50/80 border border-amber-200 rounded-2xl text-xs text-amber-800 flex items-center justify-between flex-wrap gap-2">
            <span className="flex items-center gap-1.5">
              <Gift size={16} className="text-amber-600" />
              <strong>Municipal Civic Redemption:</strong> Points can be redeemed for public transit subsidies, park admissions, and civic tax credits.
            </span>
            <span className="font-bold font-mono">Available: {karmaPoints} Karma Points</span>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            {rewards.map((r) => (
              <Card key={r.id} className="p-4 bg-white border-neutral-200 shadow-sm flex flex-col justify-between" padding="">
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-12 h-12 rounded-2xl bg-brand-50 flex items-center justify-center text-2xl shadow-inner shrink-0">
                    {r.icon}
                  </div>
                  <div>
                    <h4 className="font-bold text-neutral-900 text-sm">{r.title}</h4>
                    <p className="text-xs text-neutral-500 mt-0.5 leading-snug">{r.desc}</p>
                    <span className="text-xs font-bold text-brand-700 font-mono mt-1.5 inline-block">
                      Cost: {r.cost} Points
                    </span>
                  </div>
                </div>

                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => handleRedeem(r)}
                  className="w-full justify-center"
                >
                  Redeem Reward Voucher →
                </Button>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Tab 5: My Claimed Vouchers */}
      {activeTab === 'vouchers' && (
        <div className="space-y-4">
          <div className="p-4 bg-emerald-50/80 border border-emerald-200 rounded-2xl text-xs text-emerald-900 flex items-center justify-between flex-wrap gap-2">
            <span className="flex items-center gap-1.5 font-medium">
              <CheckCircle2 size={16} className="text-emerald-600" />
              <strong>Municipal Pass Ledger:</strong> Present these digital codes at BMC ward desks, metro stations, or municipal lots for instant redemption.
            </span>
            <span className="font-mono font-bold text-emerald-800">{claimedVouchers.length} Claimed Vouchers</span>
          </div>

          {claimedVouchers.length === 0 ? (
            <Card className="p-12 text-center bg-white border-neutral-200">
              <Gift size={36} className="mx-auto text-neutral-300 mb-3" />
              <h4 className="font-bold text-neutral-900 text-sm">No vouchers claimed yet</h4>
              <p className="text-xs text-neutral-500 mt-1 mb-4">Redeem your civic karma points for parking vouchers, metro transit credit, or property rebates.</p>
              <Button variant="primary" size="sm" onClick={() => setActiveTab('rewards')}>
                Browse Rewards Store →
              </Button>
            </Card>
          ) : (
            <div className="grid sm:grid-cols-2 gap-4">
              {claimedVouchers.map((v) => (
                <Card key={v.id} className="p-5 bg-white border-neutral-200 shadow-sm space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-xl shadow-inner">
                        {v.icon}
                      </div>
                      <div>
                        <h4 className="font-bold text-neutral-900 text-sm">{v.title}</h4>
                        <span className="text-[10px] text-neutral-400">Claimed {v.claimedAt} · Valid until {v.validUntil}</span>
                      </div>
                    </div>
                    <Badge variant="success" size="sm">Active</Badge>
                  </div>
                  <p className="text-xs text-neutral-600">{v.desc}</p>
                  <div className="p-2.5 bg-neutral-50 border border-neutral-200 rounded-xl flex items-center justify-between">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-neutral-400 block tracking-wider">Pass Code</span>
                      <span className="font-mono font-black text-sm text-brand-700">{v.code}</span>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        navigator.clipboard.writeText(v.code);
                        toast.success('Voucher code copied to clipboard!');
                      }}
                      className="text-xs py-1"
                    >
                      Copy Code
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
