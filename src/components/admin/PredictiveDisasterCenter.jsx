import React, { useState } from 'react';
import {
  CloudRain, Waves, Droplets, Zap, Siren
} from 'lucide-react';
import toast from 'react-hot-toast';
import { predictMonsoonRiskML } from '../../api/ml.api';

export const PredictiveDisasterCenter = () => {
  const [simulationActive, setSimulationActive] = useState(false);
  const [mobilizing, setMobilizing] = useState(false);
  const [deployedTeams, setDeployedTeams] = useState(8);
  const [mlInference, setMlInference] = useState(null);

  // Ward vulnerability states
  const wards = [
    { code: 'F/N', name: 'Matunga / Hindmata', risk: simulationActive ? 94 : 78, level: 'Critical', rainfall: simulationActive ? '88 mm/h' : '46 mm/h', pump: 'Britannia Station (100%)' },
    { code: 'G/S', name: 'Lower Parel / Worli', risk: simulationActive ? 82 : 64, level: 'High Alert', rainfall: simulationActive ? '74 mm/h' : '38 mm/h', pump: 'Love Grove (85%)' },
    { code: 'K/W', name: 'Andheri Subway / Juhu', risk: simulationActive ? 91 : 72, level: 'Critical', rainfall: simulationActive ? '82 mm/h' : '42 mm/h', pump: 'Irla Pumping (90%)' },
    { code: 'L',   name: 'Kurla / Chunabhatti', risk: simulationActive ? 88 : 69, level: 'High Alert', rainfall: simulationActive ? '76 mm/h' : '35 mm/h', pump: 'Gazdarbandh (80%)' },
    { code: 'H/W', name: 'Bandra West / Khar', risk: simulationActive ? 52 : 31, level: 'Moderate', rainfall: simulationActive ? '44 mm/h' : '22 mm/h', pump: 'Cleaveland Bunder (60%)' },
    { code: 'D',   name: 'Grant Road / Malabar Hill', risk: simulationActive ? 38 : 19, level: 'Low Risk', rainfall: simulationActive ? '32 mm/h' : '15 mm/h', pump: 'Haji Ali (55%)' },
  ];

  const pumpingStations = [
    { name: 'Britannia Pumping Station', pumps: '6/6 Active', capacity: '36,000 m³/hr', status: 'Full Throttle', color: 'emerald' },
    { name: 'Love Grove Pumping Station', pumps: '5/6 Active', capacity: '30,000 m³/hr', status: 'Operational', color: 'emerald' },
    { name: 'Cleaveland Bunder', pumps: '4/4 Active', capacity: '24,000 m³/hr', status: 'Operational', color: 'emerald' },
    { name: 'Irla Stormwater Station', pumps: '4/4 Active', capacity: '24,000 m³/hr', status: 'High Discharge', color: 'amber' },
    { name: 'Gazdarbandh Station', pumps: '5/6 Active', capacity: '30,000 m³/hr', status: 'Operational', color: 'emerald' },
  ];

  const handleTriggerQRT = () => {
    setMobilizing(true);
    setTimeout(() => {
      setMobilizing(false);
      setDeployedTeams(prev => prev + 6);
      toast.success('Disaster Protocol Alpha Activated! 6 National Disaster / Ward QRT Crews Dispatched to Low-Lying Hotspots.');
    }, 1000);
  };

  const toggleSimulation = async () => {
    const nextState = !simulationActive;
    setSimulationActive(nextState);
    if (nextState) {
      toast.error('Simulation: Extreme Cloudburst Event (100mm/hr) Triggered on Model!');
      // Call local ML endpoint for Hindmata Ward F/N
      const res = await predictMonsoonRiskML('F/N', 100.0, 4.8, 3.9);
      if (res) {
        setMlInference(res);
        toast(`ML Model Alert: ${res.alert_level} (${res.protocol})`, { icon: '🌊', duration: 5000 });
      }
    } else {
      setMlInference(null);
      toast.success('Model returned to Live Sensor Baseline.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Control Bar */}
      <div className="bg-gradient-to-r from-neutral-900 via-neutral-950 to-neutral-900 text-white rounded-2xl p-6 border border-neutral-800 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="flex h-2.5 w-2.5 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
            </span>
            <span className="text-[11px] font-mono tracking-widest uppercase text-red-400 font-bold">
              BMC DISASTER MANAGEMENT CELL · REAL-TIME PREDICTIVE TWIN
            </span>
          </div>
          <h2 className="text-xl font-bold tracking-tight">Monsoon Waterlogging & River Basin Resilience Forecaster</h2>
          <p className="text-xs text-neutral-400 mt-1 max-w-xl">
            Correlating radar Doppler telemetry, Arabian Sea tidal clocks, and 24-ward micro-drainage sensors to predict civic inundations before citizen distress calls occur.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={toggleSimulation}
            className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 border transition-all ${
              simulationActive
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-lg shadow-amber-500/10'
                : 'bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border-neutral-700'
            }`}
          >
            <Zap size={15} className={simulationActive ? 'text-amber-400' : 'text-neutral-400'} />
            {simulationActive ? 'Reset Baseline Radar' : 'Simulate 100mm Cloudburst'}
          </button>

          <button
            onClick={handleTriggerQRT}
            disabled={mobilizing}
            className="px-4 py-2.5 rounded-xl font-bold text-xs bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-600/30 flex items-center gap-2 transition-all"
          >
            <Siren size={15} />
            {mobilizing ? 'Mobilizing QRT Units…' : 'One-Click QRT Emergency Dispatch'}
          </button>
        </div>
      </div>

      {mlInference && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-4 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-red-900 shadow-sm animate-fade-in">
          <div className="flex items-center gap-2 font-bold">
            <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-ping"></span>
            <span>ML Simulation Output: {mlInference.alert_level || 'Critical Inundation Risk'}</span>
          </div>
          <div className="font-mono text-neutral-700 bg-white/80 px-3 py-1 rounded-lg border border-red-200">
            Protocol: <span className="font-bold text-red-700">{mlInference.protocol || 'QRT Evacuation & Dewatering'}</span>
          </div>
        </div>
      )}

      {/* Primary Telemetry Triad: Tide, Mithi River, Rainfall */}
      <div className="grid sm:grid-cols-3 gap-4">
        {/* Arabian Sea High Tide Gauge */}
        <div className="bg-white rounded-2xl border border-neutral-200 p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider flex items-center gap-1.5">
              <Waves size={15} className="text-sky-600" />
              Arabian Sea Tidal Clock
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-sky-100 text-sky-800 font-bold">
              Gateway of India Sensor
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <div className="text-3xl font-extrabold text-neutral-900 font-mono">4.82m</div>
            <span className="text-xs font-bold text-red-600">▲ Rising (Sluice Gates Shut)</span>
          </div>
          <div className="w-full bg-neutral-100 h-2.5 rounded-full overflow-hidden">
            <div className="bg-sky-500 h-full rounded-full transition-all duration-700" style={{ width: '88%' }}></div>
          </div>
          <div className="flex justify-between text-[11px] text-neutral-500">
            <span>Peak Expected: 15:42 IST</span>
            <span className="font-semibold text-neutral-800">Critical Barrier: 4.50m</span>
          </div>
        </div>

        {/* Mithi River Level */}
        <div className="bg-white rounded-2xl border border-neutral-200 p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider flex items-center gap-1.5">
              <Droplets size={15} className="text-teal-600" />
              Mithi River Catchment Level
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-teal-100 text-teal-800 font-bold">
              Kranti Nagar Bridge
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <div className="text-3xl font-extrabold text-neutral-900 font-mono">2.65m</div>
            <span className={`text-xs font-bold ${simulationActive ? 'text-red-600' : 'text-amber-600'}`}>
              {simulationActive ? '▲ Above Warning Mark' : '■ Alert Level Approaching'}
            </span>
          </div>
          <div className="w-full bg-neutral-100 h-2.5 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-700 ${simulationActive ? 'bg-red-500' : 'bg-teal-500'}`}
              style={{ width: simulationActive ? '85%' : '66%' }}
            ></div>
          </div>
          <div className="flex justify-between text-[11px] text-neutral-500">
            <span>Danger Mark: 3.50m</span>
            <span className="font-semibold text-neutral-800">Safe: &lt; 2.20m</span>
          </div>
        </div>

        {/* Precipitation Radar */}
        <div className="bg-white rounded-2xl border border-neutral-200 p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider flex items-center gap-1.5">
              <CloudRain size={15} className="text-brand-600" />
              Doppler Rain Intensity
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-brand-100 text-brand-800 font-bold">
              Santacruz IMD Radar
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <div className="text-3xl font-extrabold text-neutral-900 font-mono">
              {simulationActive ? '88 mm/h' : '46 mm/h'}
            </div>
            <span className="text-xs font-bold text-red-600">Heavy Downpour</span>
          </div>
          <div className="w-full bg-neutral-100 h-2.5 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-700 ${simulationActive ? 'bg-red-500' : 'bg-brand-500'}`}
              style={{ width: simulationActive ? '92%' : '58%' }}
            ></div>
          </div>
          <div className="flex justify-between text-[11px] text-neutral-500">
            <span>Cumulative: 142mm (24h)</span>
            <span className="font-semibold text-neutral-800">Active Storm Band</span>
          </div>
        </div>
      </div>

      {/* Ward Vulnerability Matrix Table */}
      <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-neutral-200 flex items-center justify-between bg-neutral-50/50">
          <div>
            <h3 className="font-bold text-sm text-neutral-900">Ward Vulnerability & Inundation Index</h3>
            <p className="text-xs text-neutral-500 mt-0.5">
              Predictive simulation ranking wards by drainage saturation and low-lying topography
            </p>
          </div>
          <div className="text-xs font-bold text-neutral-700">
            Deployed Municipal QRT Squads: <span className="font-mono text-brand-600">{deployedTeams}</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-neutral-50 border-b border-neutral-200 text-neutral-500 font-semibold uppercase text-[10px] tracking-wider">
              <tr>
                <th className="px-5 py-3">Ward</th>
                <th className="px-5 py-3">Low-Lying Micro Hotspots</th>
                <th className="px-5 py-3">Inundation Risk</th>
                <th className="px-5 py-3">Hourly Precipitation</th>
                <th className="px-5 py-3">Pumping Telemetry</th>
                <th className="px-5 py-3 text-right">Emergency Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {wards.map((w) => (
                <tr key={w.code} className="hover:bg-neutral-50/80 transition-colors">
                  <td className="px-5 py-3.5 font-mono font-bold text-neutral-900">
                    Ward {w.code}
                  </td>
                  <td className="px-5 py-3.5 font-medium text-neutral-800">
                    {w.name}
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2">
                      <div className="w-16 bg-neutral-100 h-2 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            w.risk > 80 ? 'bg-red-500' : w.risk > 60 ? 'bg-amber-500' : 'bg-emerald-500'
                          }`}
                          style={{ width: `${w.risk}%` }}
                        ></div>
                      </div>
                      <span className={`font-mono font-bold ${
                        w.risk > 80 ? 'text-red-600' : w.risk > 60 ? 'text-amber-600' : 'text-emerald-600'
                      }`}>
                        {w.risk}% ({w.level})
                      </span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 font-mono text-neutral-600">
                    {w.rainfall}
                  </td>
                  <td className="px-5 py-3.5 text-neutral-700">
                    {w.pump}
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <button
                      onClick={() => toast.success(`Ward ${w.code} Dewatering Submersible Pump Auto-Engaged!`)}
                      className="px-3 py-1.5 rounded-lg border border-neutral-300 hover:bg-neutral-100 font-bold text-neutral-800 text-[11px] transition-colors"
                    >
                      Engage Dewatering
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Stormwater Pumping Stations Telemetry */}
      <div className="bg-white rounded-2xl border border-neutral-200 p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-sm text-neutral-900">Mumbai Mega Stormwater Pumping Stations</h3>
            <p className="text-xs text-neutral-500 mt-0.5">High-volume discharge capacity active during Arabian Sea high tides</p>
          </div>
          <span className="text-xs font-mono font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
            Total Grid Capacity: 144,000 m³/hr
          </span>
        </div>

        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-3">
          {pumpingStations.map((station) => (
            <div key={station.name} className="p-3.5 rounded-xl border border-neutral-200 bg-neutral-50/50 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-neutral-900">{station.name}</span>
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              </div>
              <div className="flex justify-between text-[11px] text-neutral-500">
                <span>Pumps Online:</span>
                <span className="font-mono font-bold text-neutral-800">{station.pumps}</span>
              </div>
              <div className="flex justify-between text-[11px] text-neutral-500">
                <span>Discharge Rate:</span>
                <span className="font-mono text-neutral-700">{station.capacity}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
