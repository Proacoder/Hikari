import React, { useState } from 'react';
import { X } from 'lucide-react';
import { sound } from '../../utils/soundEffects';

export const EmergencyTicker = () => {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  const alerts = [
    { type: 'tide', text: 'BMC High Tide Advisory: 4.22m predicted at 14:15 hrs across Marine Drive & Worli Sea Face.', badge: 'HIGH TIDE 4.2M', badgeColor: 'bg-sky-500/20 text-sky-300 border-sky-400/30' },
    { type: 'rain', text: 'IMD Monsoon Radar: Moderate to Heavy monsoon showers expected over Suburbs (Andheri, Kurla, Chembur).', badge: 'DOPPLER RADAR', badgeColor: 'bg-blue-500/20 text-blue-300 border-blue-400/30' },
    { type: 'traffic', text: 'Hindmata & King’s Circle Flyover: Dewatering submersible pumps active; roads clear for traffic.', badge: 'DRAINAGE SLA', badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-400/30' },
    { type: 'phone', text: 'BMC 24x7 Disaster Management Central Control Room: Dial 1916 or 022-22694727.', badge: 'HELPLINE 1916', badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-400/30' },
  ];

  return (
    <div className="bg-neutral-950 text-neutral-300 text-xs py-2 px-3 sm:px-4 border-b border-neutral-800/80 overflow-hidden relative flex items-center select-none shadow-sm z-30">
      {/* Live Radar Badge */}
      <div className="flex items-center gap-1.5 bg-red-950/80 text-red-400 border border-red-500/30 font-mono font-bold px-2.5 py-0.5 rounded-full text-[10px] tracking-wider uppercase shrink-0 mr-3 z-10 shadow-xs">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
        </span>
        <span className="hidden sm:inline">BMC LIVE RADAR</span>
        <span className="sm:hidden">RADAR</span>
      </div>

      {/* Marquee Track with Smooth Edge Gradient Masks */}
      <div
        className="overflow-hidden flex-1 relative flex items-center"
        style={{
          maskImage: 'linear-gradient(to right, transparent, black 24px, black calc(100% - 24px), transparent)',
          WebkitMaskImage: 'linear-gradient(to right, transparent, black 24px, black calc(100% - 24px), transparent)',
        }}
      >
        <div className="animate-marquee flex items-center gap-10 whitespace-nowrap">
          {alerts.concat(alerts).map((alert, idx) => (
            <div
              key={idx}
              className="flex items-center gap-2 text-neutral-300 hover:text-white transition-colors cursor-pointer"
              onClick={() => sound.play('click')}
            >
              <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${alert.badgeColor}`}>
                {alert.badge}
              </span>
              <span className="font-medium text-xs text-neutral-200">{alert.text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Close button */}
      <button
        onClick={() => {
          sound.play('click');
          setDismissed(true);
        }}
        className="ml-3 text-neutral-400 hover:text-white p-1 rounded-lg hover:bg-neutral-800 shrink-0 z-10 transition-colors"
        title="Dismiss Alert Bar"
      >
        <X size={14} />
      </button>
    </div>
  );
};
