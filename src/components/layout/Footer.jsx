// ─── Public Footer ────────────────────────────────────────────────────────
import { Link } from 'react-router-dom';
import { Shield, Phone, Mail, MapPin, ExternalLink } from 'lucide-react';

const QUICK_LINKS = [
  { label: 'How It Works', to: '/how-it-works' },
  { label: 'About Us',     to: '/about'        },
  { label: 'Contact Us',   to: '/contact'      },
  { label: 'Sign In',      to: '/login'        },
  { label: 'Register',     to: '/register'     },
];

const WARD_CONTACTS = [
  { ward: 'K/E Ward Office', phone: '022-2616-6000', area: 'Andheri East' },
  { ward: 'G/N Ward Office', phone: '022-2640-5555', area: 'Bandra North'  },
  { ward: 'P/N Ward Office', phone: '022-2871-7070', area: 'Goregaon North' },
];

export const Footer = () => (
  <footer className="bg-neutral-950 border-t border-white/10 text-neutral-400 select-none">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
        {/* Brand */}
        <div className="lg:col-span-1">
          <div className="flex items-center gap-2.5 mb-4">
            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center p-1 shadow-brand">
              <img src="/kaiser-mark.png" alt="Kaiser AI" className="w-full h-full object-contain" />
            </div>
            <span className="font-display font-extrabold text-lg text-white">
              Kaiser<span className="bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent ml-0.5">AI</span>
            </span>
          </div>
          <p className="text-sm text-white/60 leading-relaxed mb-5">
            Sovereign AI-driven civic issue reporting and telemetry for Mumbai's 24 municipal wards.
          </p>
          <div className="flex items-center gap-2 text-xs text-neutral-500">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/5 border border-white/10 rounded-full text-emerald-400 font-mono text-[11px]">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_#34d399]" />
              BMC GIS Grid Online (1916 Helpline)
            </span>
          </div>
        </div>

        {/* Quick links */}
        <div>
          <h4 className="text-xs font-mono font-bold text-white mb-4 uppercase tracking-[.2em]">Quick Links</h4>
          <ul className="space-y-2.5">
            {QUICK_LINKS.map((l) => (
              <li key={l.to}>
                <Link to={l.to} className="text-sm text-white/60 hover:text-emerald-400 transition-colors">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Ward contacts */}
        <div>
          <h4 className="text-xs font-mono font-bold text-white mb-4 uppercase tracking-[.2em]">Key Ward Offices</h4>
          <ul className="space-y-3">
            {WARD_CONTACTS.map((w) => (
              <li key={w.ward} className="text-sm">
                <p className="font-medium text-white/80">{w.ward}</p>
                <p className="text-white/40 text-xs">{w.area}</p>
                <a href={`tel:${w.phone}`} className="text-white/60 hover:text-emerald-400 text-xs flex items-center gap-1 mt-0.5 transition-colors font-mono">
                  <Phone size={11} className="text-emerald-400" />
                  {w.phone}
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h4 className="text-xs font-mono font-bold text-white mb-4 uppercase tracking-[.2em]">Central Contact</h4>
          <ul className="space-y-3 text-sm">
            <li className="flex items-start gap-2 text-white/60">
              <MapPin size={15} className="shrink-0 mt-0.5 text-emerald-400" />
              <span>Municipal Commissioner's Office, Mahapalika Marg, Fort, Mumbai 400001</span>
            </li>
            <li>
              <a href="tel:1916" className="flex items-center gap-2 text-white/60 hover:text-emerald-400 transition-colors">
                <Phone size={14} className="text-emerald-400" />
                Disaster Helpline: 1916
              </a>
            </li>
            <li>
              <a href="mailto:help@kaisarai.bmc.gov.in" className="flex items-center gap-2 text-white/60 hover:text-emerald-400 transition-colors">
                <Mail size={14} className="text-emerald-400" />
                help@kaisarai.bmc.gov.in
              </a>
            </li>
            <li>
              <a
                href="https://portal.mcgm.gov.in"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-white/60 hover:text-emerald-400 transition-colors"
              >
                <ExternalLink size={14} className="text-emerald-400" />
                MCGM Official Portal
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="mt-12 pt-6 border-t border-white/10 flex flex-col sm:flex-row justify-between items-center gap-3 font-mono text-[11px] text-white/40">
        <p>
          © 2026 Kaiser AI Civic Command. Built for Mumbai's 24 Municipal Wards.
        </p>
        <p>
          Aligned with open municipal governance and IMD Doppler telemetry standards.
        </p>
      </div>
    </div>
  </footer>
);
