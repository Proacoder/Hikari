// ─── Public Navbar ────────────────────────────────────────────────────────
import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Menu, X, Shield, Globe, ChevronDown, Bell, User } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../common/Button';
import { classNames } from '../../utils/formatters';

const NAV_LINKS = [
  { label: 'Home',         to: '/'              },
  { label: 'How It Works', to: '/how-it-works'  },
  { label: 'About Us',     to: '/about'         },
  { label: 'Contact Us',   to: '/contact'       },
];

const LANGUAGES = ['English', 'हिन्दी', 'मराठी'];

export const Navbar = () => {
  const { user, role, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen]   = useState(false);
  const [langOpen, setLangOpen]   = useState(false);
  const [activeLang, setActiveLang] = useState('English');

  const dashboardPath = role === 'admin' ? '/admin' : role === 'officer' ? '/officer' : '/app';

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-neutral-100 shadow-soft-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 shrink-0 group">
            <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center shadow-brand group-hover:shadow-brand-lg transition-shadow">
              <Shield size={18} className="text-white" strokeWidth={2.5} />
            </div>
            <span className="font-bold text-lg text-neutral-900 tracking-tight">
              Kaiser <span className="text-brand-600">AI</span>
            </span>
          </Link>

          {/* Desktop nav links */}
          <nav className="hidden md:flex items-center gap-1" aria-label="Main navigation">
            {NAV_LINKS.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.to === '/'}
                className={({ isActive }) =>
                  classNames(
                    'px-3.5 py-2 rounded-xl text-sm font-medium transition-colors',
                    isActive
                      ? 'text-brand-700 bg-brand-50'
                      : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50'
                  )
                }
              >
                {link.label}
              </NavLink>
            ))}
          </nav>

          {/* Right side */}
          <div className="hidden md:flex items-center gap-2">
            {/* Language selector */}
            <div className="relative">
              <button
                onClick={() => setLangOpen((p) => !p)}
                className="flex items-center gap-1.5 px-3 py-2 text-sm text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50 rounded-xl transition-colors"
                aria-label="Select language"
              >
                <Globe size={15} />
                <span>{activeLang}</span>
                <ChevronDown size={13} className={classNames('transition-transform', langOpen && 'rotate-180')} />
              </button>
              {langOpen && (
                <div className="absolute right-0 mt-1.5 w-36 bg-white border border-neutral-100 rounded-xl shadow-soft-md py-1 z-10">
                  {LANGUAGES.map((lang) => (
                    <button
                      key={lang}
                      onClick={() => { setActiveLang(lang); setLangOpen(false); }}
                      className={classNames(
                        'w-full text-left px-3.5 py-2 text-sm transition-colors',
                        activeLang === lang
                          ? 'text-brand-700 bg-brand-50 font-medium'
                          : 'text-neutral-700 hover:bg-neutral-50'
                      )}
                    >
                      {lang}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {user ? (
              <>
                <Button variant="ghost" size="sm" onClick={() => navigate(dashboardPath)}>
                  Dashboard
                </Button>
                <div className="flex items-center gap-2 pl-2 border-l border-neutral-200">
                  <div className="w-8 h-8 rounded-full bg-brand-100 flex items-center justify-center text-brand-700 font-semibold text-xs">
                    {user.avatarInitials || user.name?.[0]}
                  </div>
                  <Button variant="ghost" size="sm" onClick={handleLogout} className="text-neutral-500 text-xs">
                    Sign Out
                  </Button>
                </div>
              </>
            ) : (
              <>
                <Link to="/login" className="text-sm font-medium text-brand-700 hover:text-brand-800 px-3 py-2 rounded-xl hover:bg-brand-50 transition-colors">
                  Sign In
                </Link>
                <Button size="sm" onClick={() => navigate('/register')}>
                  Sign Up
                </Button>
              </>
            )}
          </div>

          {/* Mobile menu toggle */}
          <button
            className="md:hidden p-2 rounded-xl text-neutral-600 hover:bg-neutral-100 transition-colors"
            onClick={() => setMenuOpen((p) => !p)}
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          >
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-neutral-100 bg-white px-4 py-3 space-y-1 animate-fade-in">
          {NAV_LINKS.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === '/'}
              onClick={() => setMenuOpen(false)}
              className={({ isActive }) =>
                classNames(
                  'block px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors',
                  isActive
                    ? 'text-brand-700 bg-brand-50'
                    : 'text-neutral-700 hover:bg-neutral-50'
                )
              }
            >
              {link.label}
            </NavLink>
          ))}
          <div className="pt-2 border-t border-neutral-100 flex flex-col gap-2">
            {user ? (
              <>
                <Button fullWidth size="sm" variant="secondary" onClick={() => { navigate(dashboardPath); setMenuOpen(false); }}>
                  Go to Dashboard
                </Button>
                <Button fullWidth size="sm" variant="ghost" onClick={handleLogout}>Sign Out</Button>
              </>
            ) : (
              <>
                <Button fullWidth size="sm" variant="secondary" onClick={() => { navigate('/login'); setMenuOpen(false); }}>Sign In</Button>
                <Button fullWidth size="sm" onClick={() => { navigate('/register'); setMenuOpen(false); }}>Sign Up</Button>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
