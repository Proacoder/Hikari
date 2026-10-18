import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search, MapPin, AlertTriangle, Shield, BarChart3,
  Phone, Volume2, VolumeX, ArrowRight, CornerDownLeft, Sparkles, X,
  Compass
} from 'lucide-react';
import { MUMBAI_WARDS } from '../../utils/mockData';
import { sound } from '../../utils/soundEffects';

export const CommandPalette = ({ isOpen, onClose, onOpen }) => {
  // Global keydown listener for Cmd+K / Ctrl+K & ESC
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (isOpen) {
          onClose?.();
        } else if (onOpen) {
          onOpen();
        }
      } else if (e.key === 'Escape' && isOpen) {
        onClose?.();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, onOpen]);

  if (!isOpen) return null;

  return <CommandPaletteModal onClose={onClose} />;
};

const CommandPaletteModal = ({ onClose }) => {
  const [query, setQuery] = useState('');
  const [soundActive, setSoundActive] = useState(sound.isEnabled());
  const inputRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => inputRef.current?.focus(), 40);
    sound.play('pop');
    return () => clearTimeout(timer);
  }, []);

  const handleAction = (cb) => {
    sound.play('click');
    onClose?.();
    if (typeof cb === 'function') cb();
  };

  const navTo = (path) => {
    handleAction(() => navigate(path));
  };

  const toggleSound = () => {
    const nextState = sound.toggle();
    setSoundActive(nextState);
  };

  // Filter wards
  const filteredWards = query.trim()
    ? MUMBAI_WARDS.filter(
        (w) =>
          w.name.toLowerCase().includes(query.toLowerCase()) ||
          w.areas?.some((a) => a.toLowerCase().includes(query.toLowerCase())) ||
          String(w.id) === query.trim()
      ).slice(0, 5)
    : MUMBAI_WARDS.slice(0, 4);

  const quickLinks = [
    {
      title: 'Report Civic Grievance',
      desc: 'AI image analysis, severity scoring & GPS auto-triage',
      path: '/app/report',
      icon: AlertTriangle,
      color: 'bg-emerald-50 text-emerald-700 border-emerald-200/60',
      iconColor: 'text-emerald-600',
    },
    {
      title: 'Live Mumbai GIS Map',
      desc: '24 ward boundaries, flood sensors & live tickets',
      path: '/app/map',
      icon: MapPin,
      color: 'bg-sky-50 text-sky-700 border-sky-200/60',
      iconColor: 'text-sky-600',
    },
    {
      title: 'Ward Officer Dispatch Portal',
      desc: 'Junior engineer login, SLA tracking & field inspection',
      path: '/officer-login',
      icon: Shield,
      color: 'bg-amber-50 text-amber-700 border-amber-200/60',
      iconColor: 'text-amber-600',
    },
    {
      title: 'BMC City Administrator Console',
      desc: 'Municipal analytics, flood forecaster & ward rankings',
      path: '/admin',
      icon: BarChart3,
      color: 'bg-indigo-50 text-indigo-700 border-indigo-200/60',
      iconColor: 'text-indigo-600',
    },
    {
      title: 'Civic Karma Leaderboard',
      desc: 'Top citizen contributors, badges & municipal rewards',
      path: '/app/leaderboard',
      icon: Sparkles,
      color: 'bg-purple-50 text-purple-700 border-purple-200/60',
      iconColor: 'text-purple-600',
    },
  ];

  const filteredQuickLinks = query.trim()
    ? quickLinks.filter(
        (l) =>
          l.title.toLowerCase().includes(query.toLowerCase()) ||
          l.desc.toLowerCase().includes(query.toLowerCase())
      )
    : quickLinks;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-12 sm:pt-20 px-4 bg-neutral-950/45 backdrop-blur-md transition-all duration-200"
      onClick={() => onClose?.()}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-neutral-200/80 overflow-hidden flex flex-col max-h-[82vh] transition-all duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="relative flex items-center px-4 py-3.5 border-b border-neutral-100 bg-neutral-50/70">
          <Search size={18} className="text-neutral-400 shrink-0 mr-3" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search commands, wards, or tools... (e.g. Andheri, report, map)"
            className="w-full bg-transparent text-sm text-neutral-800 placeholder-neutral-400 border-0 outline-none ring-0 focus:outline-none focus:ring-0 focus:border-0"
            style={{ outline: 'none', border: 'none', boxShadow: 'none' }}
          />
          <div className="flex items-center gap-1.5 shrink-0 ml-2">
            <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-mono font-semibold text-neutral-500 bg-white border border-neutral-200 rounded shadow-xs">
              ESC
            </kbd>
            <button
              onClick={() => onClose?.()}
              className="p-1 rounded-lg text-neutral-400 hover:text-neutral-700 hover:bg-neutral-200/70 transition-colors"
              title="Close (ESC)"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Results List */}
        <div className="p-3 overflow-y-auto space-y-4">
          {/* Quick Portals & Pages */}
          {filteredQuickLinks.length > 0 && (
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 px-3 mb-1.5 flex items-center justify-between">
                <span>Quick Portals & Pages</span>
                <span>Select ↵</span>
              </div>
              <div className="space-y-1">
                {filteredQuickLinks.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.path}
                      onClick={() => navTo(item.path)}
                      className="w-full flex items-center justify-between px-3 py-2 text-left rounded-xl transition-all duration-150 group hover:bg-neutral-100/90"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 border ${item.color}`}>
                          <Icon size={16} className={item.iconColor} />
                        </div>
                        <div className="truncate">
                          <div className="font-semibold text-neutral-900 text-xs sm:text-sm group-hover:text-brand-700 transition-colors">
                            {item.title}
                          </div>
                          <div className="text-[11px] text-neutral-500 truncate">
                            {item.desc}
                          </div>
                        </div>
                      </div>
                      <CornerDownLeft size={14} className="text-neutral-300 group-hover:text-neutral-600 shrink-0 ml-2 transition-colors" />
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Mumbai Wards Section */}
          {filteredWards.length > 0 && (
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 px-3 mb-1.5">
                Mumbai Municipal Wards {query && `(${filteredWards.length} matches)`}
              </div>
              <div className="space-y-1">
                {filteredWards.map((w) => (
                  <button
                    key={w.id}
                    onClick={() => navTo(`/app/map?ward=${w.id}`)}
                    className="w-full flex items-center justify-between px-3 py-2 text-left rounded-xl transition-all duration-150 group hover:bg-neutral-100/90"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 rounded-xl bg-neutral-100 text-neutral-700 border border-neutral-200/80 flex items-center justify-center text-xs font-mono font-bold shrink-0">
                        #{w.id}
                      </div>
                      <div className="truncate">
                        <div className="font-semibold text-neutral-900 text-xs sm:text-sm">
                          {w.name} Ward
                        </div>
                        <div className="text-[11px] text-neutral-500 truncate">
                          {w.area}
                        </div>
                      </div>
                    </div>
                    <ArrowRight size={14} className="text-neutral-300 group-hover:text-neutral-600 shrink-0 ml-2 group-hover:translate-x-0.5 transition-all" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Empty State */}
          {filteredQuickLinks.length === 0 && filteredWards.length === 0 && (
            <div className="py-8 text-center text-neutral-500 space-y-2">
              <Compass size={28} className="mx-auto text-neutral-300 animate-spin" />
              <p className="text-xs font-medium">No results found for "{query}"</p>
              <p className="text-[11px] text-neutral-400">Try searching for "report", "map", "officer", or "Andheri"</p>
            </div>
          )}

          {/* Preferences & Helplines */}
          <div className="pt-2 border-t border-neutral-100">
            <div className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 px-3 mb-1.5">
              Preferences & Emergency Response
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <button
                onClick={toggleSound}
                className="flex items-center justify-between px-3 py-2 border border-neutral-200/80 rounded-xl text-xs font-semibold text-neutral-700 hover:bg-neutral-50 transition-colors"
              >
                <div className="flex items-center gap-2">
                  {soundActive ? <Volume2 size={15} className="text-emerald-600" /> : <VolumeX size={15} className="text-neutral-400" />}
                  <span>UI Audio Feedback</span>
                </div>
                <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${soundActive ? 'bg-emerald-100 text-emerald-800' : 'bg-neutral-100 text-neutral-500'}`}>
                  {soundActive ? 'ON' : 'MUTED'}
                </span>
              </button>

              <a
                href="tel:1916"
                className="flex items-center justify-between px-3 py-2 border border-red-200/80 bg-red-50/50 rounded-xl text-xs font-semibold text-red-700 hover:bg-red-50 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Phone size={15} className="text-red-600" />
                  <span>BMC Disaster Helpline</span>
                </div>
                <span className="font-mono font-bold">1916</span>
              </a>
            </div>
          </div>
        </div>

        {/* Footer shortcuts hint */}
        <div className="px-4 py-2.5 bg-neutral-50 border-t border-neutral-100 text-[11px] text-neutral-400 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles size={13} className="text-amber-500" />
            <span className="font-medium text-neutral-600">Kaiser AI Spotlight</span>
          </div>
          <div className="text-[10px] text-neutral-400">
            Press <kbd className="font-mono bg-neutral-200/80 px-1 py-0.5 rounded text-[9px] text-neutral-700 font-bold">Ctrl</kbd> + <kbd className="font-mono bg-neutral-200/80 px-1 py-0.5 rounded text-[9px] text-neutral-700 font-bold">K</kbd> anytime
          </div>
        </div>
      </div>
    </div>
  );
};
