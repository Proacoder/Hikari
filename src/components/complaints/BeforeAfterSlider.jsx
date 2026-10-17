import React, { useState, useRef, useCallback } from 'react';
import { CheckCircle2, AlertTriangle, ArrowLeftRight, Calendar, Sparkles } from 'lucide-react';
import { sound } from '../../utils/soundEffects';

export const BeforeAfterSlider = ({
  beforeUrl = 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80',
  afterUrl = 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=800&q=80',
  title = 'Pothole Restored on SV Road',
  wardName = 'Ward K/E – Andheri East',
  resolvedDate = '14 Oct 2026',
}) => {
  const [sliderPos, setSliderPos] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef(null);

  const handleMove = useCallback((clientX) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSliderPos(percentage);
  }, []);

  const handleTouchMove = (e) => {
    if (!isDragging) return;
    handleMove(e.touches[0].clientX);
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    handleMove(e.clientX);
  };

  const startDrag = () => {
    setIsDragging(true);
    sound.play('click');
  };

  const stopDrag = () => {
    setIsDragging(false);
  };

  return (
    <div className="bg-white rounded-2xl border border-neutral-200/80 p-5 shadow-soft-lg space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 size={13} className="text-emerald-600" />
            <span>Verified BMC Resolution</span>
          </div>
          <h3 className="text-base font-bold text-neutral-900 mt-1">{title}</h3>
          <p className="text-xs text-neutral-500">{wardName}</p>
        </div>
        <div className="flex items-center gap-2 text-xs font-medium text-neutral-500 bg-neutral-100 px-3 py-1.5 rounded-xl">
          <Calendar size={14} className="text-neutral-400" />
          <span>Completed: {resolvedDate}</span>
        </div>
      </div>

      {/* Interactive Slider Container */}
      <div
        ref={containerRef}
        onMouseDown={startDrag}
        onMouseUp={stopDrag}
        onMouseLeave={stopDrag}
        onMouseMove={handleMouseMove}
        onTouchStart={startDrag}
        onTouchEnd={stopDrag}
        onTouchMove={handleTouchMove}
        className="relative h-64 sm:h-80 w-full rounded-xl overflow-hidden select-none cursor-ew-resize border border-neutral-300 shadow-inner group"
      >
        {/* "After" Image (Background Full) */}
        <img
          src={afterUrl}
          alt="After resolution"
          className="absolute inset-0 w-full h-full object-cover pointer-events-none"
        />

        {/* "Before" Image (Clipped by slider position) */}
        <img
          src={beforeUrl}
          alt="Before resolution"
          className="absolute inset-0 w-full h-full object-cover pointer-events-none"
          style={{ clipPath: `inset(0 ${100 - sliderPos}% 0 0)` }}
        />

        {/* Vertical Divider Line with Glow */}
        <div
          className="absolute top-0 bottom-0 w-1 bg-white shadow-[0_0_12px_rgba(0,0,0,0.6)] pointer-events-none z-10"
          style={{ left: `${sliderPos}%` }}
        >
          {/* Circular Drag Handle */}
          <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-9 h-9 rounded-full bg-white border-2 border-emerald-600 shadow-xl flex items-center justify-center text-emerald-700 transition-transform group-hover:scale-110">
            <ArrowLeftRight size={15} />
          </div>
        </div>

        {/* Badges Overlay */}
        <div className="absolute top-3 left-3 bg-red-600/90 backdrop-blur-sm text-white px-2.5 py-1 rounded-lg text-xs font-bold tracking-wide uppercase shadow flex items-center gap-1.5 pointer-events-none z-20">
          <AlertTriangle size={12} /> Before (Hazard)
        </div>
        <div className="absolute top-3 right-3 bg-emerald-600/90 backdrop-blur-sm text-white px-2.5 py-1 rounded-lg text-xs font-bold tracking-wide uppercase shadow flex items-center gap-1.5 pointer-events-none z-20">
          <Sparkles size={12} /> After (Resolved)
        </div>

        {/* Micro-hint */}
        <div className="absolute bottom-3 inset-x-0 flex justify-center pointer-events-none z-20">
          <span className="bg-slate-900/75 backdrop-blur-md text-white text-[11px] font-medium px-3 py-1 rounded-full shadow">
            Drag slider left or right to inspect repair
          </span>
        </div>
      </div>
    </div>
  );
};
