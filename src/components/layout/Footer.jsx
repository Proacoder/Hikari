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
  <footer className="bg-neutral-900 text-neutral-300">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
        {/* Brand */}
        <div className="lg:col-span-1">
          <div className="flex items-center gap-2.5 mb-4">
            <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center">
              <Shield size={18} className="text-white" strokeWidth={2.5} />
            </div>
            <span className="font-bold text-lg text-white">
              Kaiser <span className="text-brand-400">AI</span>
            </span>
          </div>
          <p className="text-sm text-neutral-400 leading-relaxed mb-5">
            AI-powered civic issue reporting and resolution for Mumbai's 26 municipal wards. Making cities responsive, one report at a time.
          </p>
          <div className="flex items-center gap-2 text-xs text-neutral-500">
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-neutral-800 rounded-lg">
              <span className="w-2 h-2 rounded-full bg-brand-500 animate-pulse-slow" />
              In partnership with BMC
            </span>
          </div>
        </div>

        {/* Quick links */}
        <div>
          <h4 className="text-sm font-semibold text-white mb-4 uppercase tracking-wider">Quick Links</h4>
          <ul className="space-y-2.5">
            {QUICK_LINKS.map((l) => (
              <li key={l.to}>
                <Link to={l.to} className="text-sm text-neutral-400 hover:text-brand-400 transition-colors">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Ward contacts */}
        <div>
          <h4 className="text-sm font-semibold text-white mb-4 uppercase tracking-wider">Ward Offices</h4>
          <ul className="space-y-3">
            {WARD_CONTACTS.map((w) => (
              <li key={w.ward} className="text-sm">
                <p className="font-medium text-neutral-300">{w.ward}</p>
                <p className="text-neutral-500 text-xs">{w.area}</p>
                <a href={`tel:${w.phone}`} className="text-neutral-400 hover:text-brand-400 text-xs flex items-center gap-1 mt-0.5 transition-colors">
                  <Phone size={11} />
                  {w.phone}
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h4 className="text-sm font-semibold text-white mb-4 uppercase tracking-wider">Contact</h4>
          <ul className="space-y-3 text-sm">
            <li className="flex items-start gap-2 text-neutral-400">
              <MapPin size={15} className="shrink-0 mt-0.5 text-brand-500" />
              <span>Municipal Commissioner's Office, Mahapalika Marg, Fort, Mumbai 400001</span>
            </li>
            <li>
              <a href="tel:1916" className="flex items-center gap-2 text-neutral-400 hover:text-brand-400 transition-colors">
                <Phone size={14} className="text-brand-500" />
                BMC Helpline: 1916
              </a>
            </li>
            <li>
              <a href="mailto:help@kaisarai.bmc.gov.in" className="flex items-center gap-2 text-neutral-400 hover:text-brand-400 transition-colors">
                <Mail size={14} className="text-brand-500" />
                help@kaisarai.bmc.gov.in
              </a>
            </li>
            <li>
              <a
                href="https://portal.mcgm.gov.in"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-neutral-400 hover:text-brand-400 transition-colors"
              >
                <ExternalLink size={14} className="text-brand-500" />
                MCGM Portal
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="mt-12 pt-6 border-t border-neutral-800 flex flex-col sm:flex-row justify-between items-center gap-3">
        <p className="text-xs text-neutral-500">
          © 2025 Kaiser AI. Built in partnership with Brihanmumbai Municipal Corporation (BMC). All rights reserved.
        </p>
        <p className="text-xs text-neutral-600">
          This is a civic technology platform. Not an official BMC portal.
        </p>
      </div>
    </div>
  </footer>
);
