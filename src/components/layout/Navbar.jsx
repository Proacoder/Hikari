// ─── Sovereign Civic Dark Cyber Navbar ─────────────────────────────────────────
import { useState, useEffect, useRef, useLayoutEffect } from 'react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { Menu, X, Globe, ChevronDown, Bell, Search, Volume2, VolumeX } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { useNotifications } from '../../context/NotificationContext';
import { Button } from '../common/Button';
import { classNames } from '../../utils/formatters';
import { CommandPalette } from '../common/CommandPalette';
import { sound } from '../../utils/soundEffects';

export const Navbar = () => {
  const { user, role, logout } = useAuth();
  const { language, setLanguage, t, supportedLanguages } = useLanguage();
  const { unreadCount, toggleDrawer } = useNotifications();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen]   = useState(false);
  const [langOpen, setLangOpen]   = useState(false);
  const [cmdOpen, setCmdOpen]     = useState(false);
  const [soundOn, setSoundOn]     = useState(sound.isEnabled());
  const [scrolled, setScrolled]  = useState(false);
  const [progress, setProgress]  = useState(0);
  const [pill, setPill]          = useState({ left: 0, width: 0, show: false });
  const navRef = useRef(null);
  const langRef = useRef(null);
  const location = useLocation();

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (langRef.current && !langRef.current.contains(e.target)) {
        setLangOpen(false);
      }
    };
    if (langOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
    }
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [langOpen]);

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      setScrolled(y > 10);
      setProgress(max > 0 ? Math.min(y / max, 1) : 0);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Sliding highlight pill that follows hover / active route
  const movePill = (el) => {
    if (!el || !navRef.current) return setPill((p) => ({ ...p, show: false }));
    const nr = navRef.current.getBoundingClientRect();
    const r = el.getBoundingClientRect();
    setPill({ left: r.left - nr.left, width: r.width, show: true });
  };
  const resetPill = () => movePill(navRef.current?.querySelector('[aria-current="page"]'));
  useLayoutEffect(() => { resetPill(); }, [location.pathname, language]);

  const navLinks = [
    { label: t('nav.home', 'Home'),                 to: '/'             },
    { label: t('nav.howItWorks', 'How It Works'),   to: '/how-it-works' },
    { label: t('nav.about', 'About Us'),            to: '/about'        },
    { label: t('nav.contact', 'Contact Us'),        to: '/contact'      },
  ];

  const currentLangObj = supportedLanguages.find((l) => l.code === language) || supportedLanguages[0];
  const dashboardPath = role === 'admin' ? '/admin' : role === 'officer' ? '/officer' : '/app';

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-40 w-full px-2 sm:px-6 pt-2 pb-1 transition-all duration-300">
      {/* Scroll Progress Bar */}
      <div
        className="absolute top-0 left-0 h-[2.5px] bg-gradient-to-r from-emerald-500 via-teal-400 to-sky-400 z-50 transition-[width] duration-150"
        style={{ width: `${progress * 100}%` }}
      />
      
      <div
        className={classNames(
          'max-w-7xl mx-auto rounded-2xl border transition-all duration-300',
          scrolled
            ? 'bg-neutral-950/90 backdrop-blur-xl border-white/20 text-white shadow-[0_12px_36px_rgba(0,0,0,0.65)]'
            : 'bg-neutral-950/65 backdrop-blur-md border-white/15 text-white shadow-soft-sm'
        )}
      >
        <div className="px-3 sm:px-5">
          <div className={classNames('flex items-center justify-between transition-all duration-300', scrolled ? 'h-14' : 'h-16')}>
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2.5 shrink-0 group" onClick={() => sound.play('click')}>
              <div className="relative w-10 h-10 rounded-xl bg-white shadow-brand flex items-center justify-center p-0.5 overflow-hidden group-hover:scale-105 group-hover:rotate-2 transition-all duration-300">
                <img src="/kaiser-mark.png" alt="Kaiser AI" className="w-full h-full object-contain" />
                <span className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/70 to-transparent translate-x-[-120%] group-hover:translate-x-[120%] transition-transform duration-700" />
              </div>
              <span className="font-display font-extrabold text-lg tracking-tight text-white">
                Kaiser<span className="bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent ml-0.5">AI</span>
              </span>
            </Link>

            {/* Desktop Nav Links */}
            <nav ref={navRef} onMouseLeave={resetPill} className="hidden md:flex items-center gap-1 relative" aria-label="Main navigation">
              <span
                aria-hidden
                className="absolute top-0 bottom-0 rounded-xl shadow-xs transition-all duration-300 ease-out bg-white/10"
                style={{ left: pill.left, width: pill.width, opacity: pill.show ? 1 : 0 }}
              />
              {navLinks.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  end={link.to === '/'}
                  onMouseEnter={(e) => movePill(e.currentTarget)}
                  className={({ isActive }) =>
                    classNames(
                      'relative z-10 px-4 py-2 rounded-xl text-sm font-semibold transition-colors duration-200',
                      isActive ? 'text-emerald-400 font-bold' : 'text-white/80 hover:text-white'
                    )
                  }
                >
                  {link.label}
                </NavLink>
              ))}
            </nav>

            {/* Right Controls */}
            <div className="hidden md:flex items-center gap-2.5">
              {/* Quick Spotlight Search trigger */}
              <button
                onClick={() => {
                  sound.play('pop');
                  setCmdOpen(true);
                }}
                className="flex items-center gap-2 px-3 py-1.5 text-xs rounded-xl transition-all border border-white/15 bg-white/10 hover:bg-white/20 text-white/80 hover:text-white shadow-xs cursor-pointer active:scale-95"
                title="Spotlight Search (Ctrl+K)"
              >
                <Search size={14} className="text-white/70" />
                <span className="hidden lg:inline font-semibold">Quick Find</span>
                <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[9px] font-mono font-bold rounded border border-white/20 bg-white/15 text-white/80 shadow-xs">
                  Ctrl K
                </kbd>
              </button>

              {/* Sound Effects Toggle */}
              <button
                onClick={() => {
                  const s = sound.toggle();
                  setSoundOn(s);
                }}
                className="p-2 rounded-xl transition-colors text-white/70 hover:text-white hover:bg-white/10 cursor-pointer"
                title={soundOn ? 'Sound Effects Active (Click to mute)' : 'Sound Effects Muted (Click to enable)'}
              >
                {soundOn ? <Volume2 size={16} className="text-emerald-400" /> : <VolumeX size={16} className="text-white/40" />}
              </button>

              {/* Language Selector */}
              <div className="relative" ref={langRef}>
                <button
                  onClick={() => {
                    sound.play('pop');
                    setLangOpen((p) => !p);
                  }}
                  className="flex items-center gap-1.5 px-3 py-2 text-sm rounded-xl transition-colors border border-transparent text-white/80 hover:text-white hover:bg-white/10 cursor-pointer"
                  aria-label="Select language"
                >
                  <Globe size={15} className="text-emerald-400" />
                  <span className="font-semibold text-xs">{currentLangObj.native}</span>
                  <ChevronDown size={13} className={classNames('transition-transform', langOpen && 'rotate-180')} />
                </button>
                {langOpen && (
                  <div className="absolute right-0 mt-2 w-48 rounded-2xl border border-white/20 py-1.5 z-50 animate-fade-in shadow-2xl bg-neutral-900/95 backdrop-blur-2xl text-white overflow-hidden">
                    {supportedLanguages.map((lang) => (
                      <button
                        key={lang.code}
                        onClick={() => {
                          sound.play('pop');
                          setLanguage(lang.code);
                          setLangOpen(false);
                        }}
                        className={classNames(
                          'w-full text-left px-4 py-2.5 text-xs flex items-center justify-between transition-all cursor-pointer',
                          language === lang.code
                            ? 'bg-emerald-500/20 text-emerald-300 font-bold border-l-2 border-emerald-400'
                            : 'text-white/80 hover:bg-white/10 hover:text-white'
                        )}
                      >
                        <span className="font-semibold text-xs">{lang.native}</span>
                        <span className={classNames(
                          'text-[10px] uppercase font-mono px-1.5 py-0.5 rounded',
                          language === lang.code ? 'bg-emerald-400/25 text-emerald-300 font-bold' : 'bg-white/10 text-white/50'
                        )}>
                          {lang.code}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* User / Auth CTA */}
              {user ? (
                <>
                  <button
                    onClick={toggleDrawer}
                    className="relative p-2 rounded-xl transition-colors text-white/80 hover:text-white hover:bg-white/10"
                    aria-label="Notifications"
                  >
                    <Bell size={18} />
                    {unreadCount > 0 && (
                      <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white rounded-full text-[9px] font-bold flex items-center justify-center animate-pulse">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </button>

                  <button
                    onClick={() => navigate(dashboardPath)}
                    className="px-3 py-1.5 rounded-xl text-xs font-semibold text-white hover:bg-white/10 transition-colors"
                  >
                    {t('nav.dashboard', 'Dashboard')}
                  </button>
                  <div className="flex items-center gap-2 pl-2 border-l border-white/20">
                    <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 flex items-center justify-center font-semibold text-xs">
                      {user.avatarInitials || user.name?.[0]}
                    </div>
                    <button
                      onClick={handleLogout}
                      className="text-xs text-white/60 hover:text-white transition-colors"
                    >
                      {t('nav.signOut', 'Sign Out')}
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    onClick={() => sound.play('click')}
                    className="text-sm font-semibold px-3 py-2 rounded-xl transition-colors text-white/90 hover:text-white hover:bg-white/10"
                  >
                    {t('nav.signIn', 'Sign In')}
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => sound.play('click')}
                    className="glow-btn relative overflow-hidden shine px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 via-brand-500 to-teal-400 text-neutral-950 font-black text-xs tracking-wider uppercase shadow-[0_0_20px_rgba(52,211,153,0.35)] hover:scale-105 active:scale-95 transition-all"
                  >
                    {t('nav.signUp', 'Sign Up')}
                  </Link>
                </>
              )}
            </div>

            {/* Mobile Menu Toggle */}
            <div className="flex items-center gap-1 md:hidden">
              {user && (
                <button
                  onClick={toggleDrawer}
                  className="relative p-2 rounded-xl text-white/80 hover:bg-white/10"
                  aria-label="Notifications"
                >
                  <Bell size={18} />
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 w-3.5 h-3.5 bg-red-500 text-white rounded-full text-[8px] font-bold flex items-center justify-center">
                      {unreadCount}
                    </span>
                  )}
                </button>
              )}
              <button
                className="p-2 rounded-xl text-white/90 hover:bg-white/10 transition-colors"
                onClick={() => setMenuOpen((p) => !p)}
                aria-label={menuOpen ? 'Close menu' : 'Open menu'}
              >
                {menuOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu Drawer */}
        {menuOpen && (
          <div className="md:hidden border-t border-white/15 bg-neutral-950/95 backdrop-blur-2xl px-4 py-3 space-y-2 text-white animate-fade-in rounded-b-2xl">
            {/* Sound Effects Toggle */}
            <div className="flex items-center justify-between p-2.5 bg-white/5 rounded-xl border border-white/10">
              <div className="flex items-center gap-2">
                {soundOn ? <Volume2 size={15} className="text-emerald-400" /> : <VolumeX size={15} className="text-white/40" />}
                <span className="text-xs font-semibold text-white/80">Sound Effects:</span>
              </div>
              <button
                onClick={() => {
                  const s = sound.toggle();
                  setSoundOn(s);
                }}
                className="px-2.5 py-1 rounded-lg text-xs font-medium bg-white/10 border border-white/15 text-white cursor-pointer"
              >
                {soundOn ? 'Enabled (Mute)' : 'Muted (Enable)'}
              </button>
            </div>

            {/* Language Selector */}
            <div className="flex items-center gap-2 p-2.5 bg-white/5 rounded-xl border border-white/10">
              <Globe size={15} className="text-emerald-400 shrink-0" />
              <span className="text-xs font-semibold text-white/80">{t('common.language', 'Language')}:</span>
              <div className="flex gap-1.5 ml-auto">
                {supportedLanguages.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => setLanguage(lang.code)}
                    className={classNames(
                      'px-2 py-1 rounded-lg text-xs font-medium transition-colors',
                      language === lang.code
                        ? 'bg-emerald-500 text-neutral-950 font-bold'
                        : 'text-white/80 bg-white/10 border border-white/15'
                    )}
                  >
                    {lang.native}
                  </button>
                ))}
              </div>
            </div>

            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.to === '/'}
                onClick={() => setMenuOpen(false)}
                className={({ isActive }) =>
                  classNames(
                    'block px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors',
                    isActive ? 'text-emerald-400 bg-white/10 font-bold' : 'text-white/80 hover:bg-white/5'
                  )
                }
              >
                {link.label}
              </NavLink>
            ))}

            <div className="pt-2 border-t border-white/10 flex flex-col gap-2">
              {user ? (
                <>
                  <Button fullWidth size="sm" variant="secondary" onClick={() => { navigate(dashboardPath); setMenuOpen(false); }}>
                    {t('nav.dashboard', 'Go to Dashboard')}
                  </Button>
                  <Button fullWidth size="sm" variant="ghost" onClick={handleLogout} className="text-white/70">
                    {t('nav.signOut', 'Sign Out')}
                  </Button>
                </>
              ) : (
                <>
                  <Button fullWidth size="sm" variant="secondary" onClick={() => { navigate('/login'); setMenuOpen(false); }}>
                    {t('nav.signIn', 'Sign In')}
                  </Button>
                  <Button
                    fullWidth
                    size="sm"
                    className="bg-gradient-to-r from-emerald-500 via-brand-500 to-teal-400 text-neutral-950 font-black shadow-[0_0_15px_rgba(52,211,153,0.4)]"
                    onClick={() => { navigate('/register'); setMenuOpen(false); }}
                  >
                    {t('nav.signUp', 'Sign Up')}
                  </Button>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Global Command Palette */}
      <CommandPalette isOpen={cmdOpen} onClose={() => setCmdOpen(false)} onOpen={() => setCmdOpen(true)} />
    </header>
  );
};
