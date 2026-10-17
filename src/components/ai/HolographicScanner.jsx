import React, { useState, useEffect } from 'react';
import { Scan, ShieldCheck, Cpu } from 'lucide-react';
import { sound } from '../../utils/soundEffects';

export const HolographicScanner = ({
  imageUrl,
  defectData,
  isScanning,
  onScanComplete,
}) => {
  const [prevScanning, setPrevScanning] = useState(isScanning);
  const [scanStep, setScanStep] = useState(isScanning ? 0 : 2); // 0: scanning, 1: bbox, 2: complete
  const [telemetryCount, setTelemetryCount] = useState(0);

  if (isScanning !== prevScanning) {
    setPrevScanning(isScanning);
    setScanStep(isScanning ? 0 : 2);
  }

  useEffect(() => {
    if (!isScanning) {
      return;
    }

    sound.play('scan');

    // Telemetry tick counter simulation
    const interval = setInterval(() => {
      setTelemetryCount((prev) => (prev + 13) % 100);
    }, 70);

    const step1 = setTimeout(() => {
      setScanStep(1);
      sound.play('pop');
    }, 900);

    const step2 = setTimeout(() => {
      setScanStep(2);
      clearInterval(interval);
      sound.play('success');
      if (onScanComplete) onScanComplete();
    }, 1800);

    return () => {
      clearInterval(interval);
      clearTimeout(step1);
      clearTimeout(step2);
    };
  }, [isScanning, onScanComplete]);

  if (!imageUrl) return null;

  return (
    <div className="relative rounded-2xl overflow-hidden border border-cyan-500/40 shadow-2xl bg-slate-950 group select-none">
      {/* Target Image */}
      <img
        src={imageUrl}
        alt="AI Telemetry Evidence"
        className="w-full h-72 sm:h-80 object-cover filter contrast-[1.05]"
      />

      {/* Cyberpunk Vignette & Grid */}
      <div className="absolute inset-0 bg-radial from-transparent via-cyan-950/20 to-slate-950/70 pointer-events-none" />
      <div
        className="absolute inset-0 pointer-events-none opacity-20"
        style={{
          backgroundImage:
            'linear-gradient(rgba(6, 182, 212, 0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(6, 182, 212, 0.4) 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }}
      />

      {/* Laser Scanning Beam */}
      {isScanning && (
        <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_15px_3px_rgba(6,182,212,0.9)] animate-laser-scan pointer-events-none z-20">
          <div className="absolute right-4 -top-3 text-[10px] font-mono text-cyan-300 font-bold bg-slate-900/80 px-1.5 py-0.5 rounded border border-cyan-500/50">
            YOLOv8 RADAR ACTIVE · {telemetryCount}%
          </div>
        </div>
      )}

      {/* Top Telemetry Header */}
      <div className="absolute top-3 inset-x-3 flex items-center justify-between z-10 pointer-events-none">
        <div className="flex items-center gap-2 bg-slate-900/85 backdrop-blur-md px-3 py-1 rounded-full border border-cyan-500/40 text-cyan-300 text-xs font-mono font-semibold">
          <Cpu size={14} className={isScanning ? 'animate-spin text-cyan-400' : 'text-emerald-400'} />
          <span>{isScanning ? 'NEURAL TRIAGE IN PROGRESS' : 'VISION TELEMETRY VERIFIED'}</span>
        </div>
        <div className="bg-slate-900/85 backdrop-blur-md px-2.5 py-1 rounded-full border border-slate-700 text-[11px] font-mono text-slate-300">
          BMC GIS: 19.076° N, 72.877° E
        </div>
      </div>

      {/* Bounding Box HUD Reticle (Appears on detected defect) */}
      {defectData && scanStep >= 1 && (
        <div className="absolute inset-8 sm:inset-12 border-2 border-dashed border-cyan-400/80 rounded-xl animate-reticle-pulse pointer-events-none z-10 flex flex-col justify-between p-2">
          {/* Corner brackets */}
          <div className="flex justify-between items-start">
            <span className="w-4 h-4 border-t-2 border-l-2 border-cyan-400 -mt-2 -ml-2" />
            <div className="bg-cyan-500/90 text-slate-950 font-mono text-[10px] font-black px-2 py-0.5 rounded shadow">
              TARGET: {defectData.defectType?.toUpperCase() || 'CIVIC DEFECT'}
            </div>
            <span className="w-4 h-4 border-t-2 border-r-2 border-cyan-400 -mt-2 -mr-2" />
          </div>

          <div className="flex justify-between items-end">
            <span className="w-4 h-4 border-b-2 border-l-2 border-cyan-400 -mb-2 -ml-2" />
            <div className="bg-slate-900/90 text-cyan-300 border border-cyan-500/50 font-mono text-[11px] font-semibold px-2 py-0.5 rounded backdrop-blur">
              CONFIDENCE: {Math.round((defectData.confidence || 0.94) * 100)}%
            </div>
            <span className="w-4 h-4 border-b-2 border-r-2 border-cyan-400 -mb-2 -mr-2" />
          </div>
        </div>
      )}

      {/* Bottom Live Analysis Telemetry Bar */}
      <div className="absolute bottom-3 inset-x-3 bg-slate-900/90 backdrop-blur-md p-3 rounded-xl border border-cyan-500/30 text-white z-10 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-300 shrink-0">
            {isScanning ? <Scan size={18} className="animate-pulse" /> : <ShieldCheck size={18} className="text-emerald-400" />}
          </div>
          <div>
            <div className="text-xs font-mono font-bold text-cyan-300 flex items-center gap-1.5">
              <span>{defectData?.defectType || 'Analyzing Target Surface...'}</span>
              {!isScanning && (
                <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399]" />
              )}
            </div>
            <p className="text-[11px] text-slate-400 line-clamp-1">
              {defectData?.recommendedCategory
                ? `Mapped Category: ${defectData.recommendedCategory} · Severity: ${defectData.recommendedSeverity}/100`
                : 'Extracting geometry, depth, and spatial coordinates...'}
            </p>
          </div>
        </div>

        {defectData?.recommendedSeverity && (
          <div className="flex items-center gap-2">
            <div className="text-right font-mono text-[11px] text-slate-300">
              <span className="text-amber-400 font-bold">{defectData.recommendedSeverity}</span> / 100
            </div>
            <div className="w-16 h-2 bg-slate-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-emerald-400 via-amber-400 to-red-500 transition-all duration-700 ease-out"
                style={{ width: `${Math.min(100, defectData.recommendedSeverity)}%` }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
