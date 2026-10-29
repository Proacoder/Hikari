// ─── Animated Kaiser AI loading screen ─────────────────────────────────────
import { useEffect, useState } from 'react';
import { Leaf } from 'lucide-react';

const STEPS = [
  'Connecting to Mumbai ward network…',
  'Syncing live civic grievances…',
  'Calibrating AI triage engine…',
  'Loading GIS & flood sensors…',
  'Ready — welcome to Kaiser AI',
];
const DURATION = 3200;

export const SplashScreen = ({ onDone }) => {
  const [progress, setProgress] = useState(0);
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    let raf; const t0 = performance.now();
    const tick = (now) => {
      const p = Math.min((now - t0) / DURATION, 1);
      setProgress(1 - Math.pow(1 - p, 2.2));
      if (p < 1) raf = requestAnimationFrame(tick);
      else { setLeaving(true); setTimeout(onDone, 750); }
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [onDone]);

  const step = STEPS[Math.min(Math.floor(progress * STEPS.length), STEPS.length - 1)];

  return (
    <div
      className="fixed inset-0 z-[200] flex flex-col items-center justify-center overflow-hidden transition-all duration-700 ease-out"
      style={{
        background: 'radial-gradient(circle at 50% 40%, #ffffff 0%, #f0fdf4 45%, #dcfce7 75%, #e0f2fe 100%)',
        opacity: leaving ? 0 : 1, transform: leaving ? 'scale(1.06)' : 'scale(1)', filter: leaving ? 'blur(8px)' : 'none',
        pointerEvents: leaving ? 'none' : 'auto',
      }}
    >
      {/* falling leaves */}
      {Array.from({ length: 14 }).map((_, i) => (
        <Leaf key={i} className="absolute text-brand-500/60" size={14 + (i % 4) * 7}
          style={{ left: `${(i * 7.3) % 100}%`, top: 0, '--dx': `${(i % 2 ? 1 : -1) * (40 + i * 6)}px`,
            animation: `leafDrift ${6 + (i % 5)}s linear ${i * 0.45}s infinite` }} />
      ))}
      {/* ambient glow orbs */}
      <div className="absolute w-[520px] h-[520px] rounded-full bg-emerald-300/30 blur-3xl" style={{ animation: 'glowPulse 4s ease-in-out infinite' }} />
      <div className="absolute w-[380px] h-[380px] rounded-full bg-sky-300/30 blur-3xl translate-x-24 translate-y-16" style={{ animation: 'glowPulse 5s ease-in-out 1s infinite' }} />

      {/* logo with orbiting rings */}
      <div className="relative w-[300px] h-[300px] sm:w-[380px] sm:h-[380px] flex items-center justify-center">
        <div className="absolute inset-0 rounded-full border-2 border-dashed border-brand-400/40" style={{ animation: 'ringSpin 16s linear infinite' }} />
        <div className="absolute inset-6 rounded-full border border-sky-400/40" style={{ animation: 'ringSpin 11s linear infinite reverse' }}>
          <span className="absolute -top-1.5 left-1/2 w-3 h-3 rounded-full bg-brand-500 shadow-[0_0_14px_#22c55e]" />
        </div>
        <div className="absolute inset-0" style={{ animation: 'orbit 7s linear infinite' }}>
          <span className="absolute top-1/2 -right-1.5 w-3 h-3 rounded-full bg-sky-500 shadow-[0_0_14px_#0ea5e9]" />
        </div>
        <img src="/kaiser-logo.png" alt="Kaiser AI" draggable="false"
          className="relative w-[88%] mix-blend-multiply select-none"
          style={{ animation: 'logoIn 1.3s cubic-bezier(.2,.8,.2,1) both' }} />
      </div>

      {/* progress */}
      <div className="relative mt-4 w-[270px] sm:w-[340px]" style={{ animation: 'slideIn .8s ease .9s both' }}>
        <div className="h-1.5 rounded-full bg-white/80 overflow-hidden shadow-inner border border-brand-200/60">
          <div className="h-full rounded-full bg-gradient-to-r from-brand-500 via-emerald-400 to-sky-500 animate-gradient relative overflow-hidden shine"
            style={{ width: `${progress * 100}%` }} />
        </div>
        <div className="flex items-center justify-between mt-3 text-[11px] font-mono font-semibold text-neutral-500">
          <span key={step} style={{ animation: 'fadeIn .4s ease' }}>{step}</span>
          <span className="text-brand-700">{Math.round(progress * 100)}%</span>
        </div>
      </div>
    </div>
  );
};
