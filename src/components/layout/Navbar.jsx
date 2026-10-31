// ─── Sovereign Civic Adaptive Navbar (Light & Dark Mode) ───────────────────────
import { useState, useEffect, useRef, useLayoutEffect, useMemo } from 'react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { Menu, X, Globe, ChevronDown, Bell, Search, Volume2, VolumeX, Sun, Moon, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { useNotifications } from '../../context/NotificationContext';
import { useTheme } from '../../context/ThemeContext';
import { Button } from '../common/Button';
import { classNames } from '../../utils/formatters';
import { CommandPalette } from '../common/CommandPalette';
import { sound } from '../../utils/soundEffects';

export const Navbar = () => {
  const { user, role, logout } = useAuth();
  const { language, setLanguage, t, supportedLanguages } = useLanguage();
  const { unreadCount, toggleDrawer } = useNotifications();
  const { theme, isDark, setTheme } = useTheme();
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
  const isHome = location.pathname === '/';
  const navIsDark = isDark;

  const userInitials = useMemo(() => {
    if (!user) return '';
    if (user.avatarInitials) return user.avatarInitials;
    if (user.name) {
      const parts = user.name.trim().split(/\s+/);
      if (parts.length >= 2) {
        return (parts[0][0] + parts[1][0]).toUpperCase();
      }
      return user.name.slice(0, 2).toUpperCase();
    }
    return user.email ? user.email.slice(0, 2).toUpperCase() : 'U';
  }, [user]);

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
    { label: t('nav.about', 'About Us'),            to: '/about'        },
    { label: t('nav.howItWorks', 'How It Works'),   to: '/how-it-works' },
    { label: t('nav.contact', 'Contact Us'),        to: '/contact'      },
  ];

  const currentLangObj = supportedLanguages.find((l) => l.code === language) || supportedLanguages[0];
  const dashboardPath = role === 'admin' ? '/admin' : role === 'officer' ? '/officer' : '/app';

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-40 w-full px-2 sm:px-6 pt-2 pb-1 transition-all duration-300 bg-transparent">
      {/* Scroll Progress Bar */}
      <div
        className="absolute top-0 left-0 h-[2.5px] bg-gradient-to-r from-emerald-500 via-teal-400 to-sky-400 z-50 transition-[width] duration-150"
        style={{ width: `${progress * 100}%` }}
      />
      
      <div
        className={classNames(
          'w-full max-w-[1060px] xl:max-w-[1120px] mx-auto rounded-2xl border transition-all duration-300',
          navIsDark
            ? scrolled
              ? 'bg-neutral-950/92 backdrop-blur-xl border-white/20 text-white shadow-[0_16px_40px_rgba(0,0,0,0.7)]'
              : 'bg-neutral-950/65 backdrop-blur-xl border-white/25 text-white shadow-[0_8px_32px_rgba(0,0,0,0.45)]'
            : scrolled
              ? 'bg-white/95 backdrop-blur-xl border-neutral-200/90 text-neutral-900 shadow-[0_16px_40px_rgba(0,0,0,0.12)]'
              : 'bg-white/90 backdrop-blur-xl border-neutral-200/80 text-neutral-900 shadow-[0_8px_24px_rgba(0,0,0,0.06)]'
        )}
      >
        <div className="px-3 sm:px-4 lg:px-5">
          <div className={classNames('flex items-center justify-between transition-all duration-300', scrolled ? 'h-14' : 'h-16')}>
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2.5 shrink-0 group mr-2 sm:mr-3 lg:mr-4" onClick={() => sound.play('click')}>
              <div className="relative w-10 h-10 rounded-xl bg-white shadow-brand flex items-center justify-center p-0.5 overflow-hidden group-hover:scale-105 group-hover:rotate-2 transition-all duration-300">
                <img src="/kaiser-mark.png" alt="Kaiser AI" className="w-full h-full object-contain" />
                <span className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/70 to-transparent translate-x-[-120%] group-hover:translate-x-[120%] transition-transform duration-700" />
              </div>
              <span className={classNames('font-display font-extrabold text-lg tracking-tight', navIsDark ? 'text-white' : 'text-neutral-900')}>
                Kaiser<span className="bg-gradient-to-r from-emerald-500 to-teal-400 bg-clip-text text-transparent ml-0.5">AI</span>
              </span>
            </Link>

            {/* Desktop Nav Links */}
            <nav ref={navRef} onMouseLeave={resetPill} className="hidden md:flex items-center gap-1 lg:gap-1.5 relative shrink-0 whitespace-nowrap" aria-label="Main navigation">
              <span
                aria-hidden
                className={classNames(
                  'absolute top-0 bottom-0 rounded-xl transition-all duration-300 ease-out',
                  navIsDark ? 'bg-white/10 shadow-xs border border-white/10' : 'bg-neutral-100/90 shadow-xs border border-neutral-200/60'
                )}
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
                      'relative z-10 px-3 lg:px-3.5 py-1.5 rounded-xl text-sm font-semibold transition-colors duration-200 whitespace-nowrap shrink-0 inline-block',
                      isActive
                        ? navIsDark ? 'text-emerald-400 font-bold' : 'text-emerald-600 font-bold'
                        : navIsDark ? 'text-white/80 hover:text-white' : 'text-neutral-600 hover:text-neutral-950'
                    )
                  }
                >
                  <span className="whitespace-nowrap">{link.label}</span>
                </NavLink>
              ))}
            </nav>

            {/* Right Controls */}
            <div className="hidden md:flex items-center gap-1 sm:gap-1.5 xl:gap-2">
              {/* Quick Spotlight Search trigger */}
              <button
                onClick={() => {
                  sound.play('pop');
                  setCmdOpen(true);
                }}
                className={classNames(
                  'flex items-center gap-2 px-3 py-1.5 text-xs rounded-xl transition-all shadow-xs cursor-pointer active:scale-95',
                  navIsDark
                    ? 'border border-white/15 bg-white/10 hover:bg-white/15 text-white/90 hover:text-white'
                    : 'border border-neutral-200/80 bg-neutral-100/80 hover:bg-neutral-200/70 text-neutral-700'
                )}
                title="Spotlight Search (Ctrl+K)"
              >
                <Search size={14} className={navIsDark ? 'text-white/70' : 'text-neutral-500'} />
                <span className="font-semibold whitespace-nowrap">{t('nav.quickFind', 'Quick Find')}</span>
                <kbd className={classNames(
                  'hidden xl:inline-flex items-center text-[10px] font-mono font-bold px-1.5 py-0.5 rounded border leading-none',
                  navIsDark ? 'bg-white/10 border-white/15 text-white/60' : 'bg-white border-neutral-300 text-neutral-500'
                )}>
                  Ctrl+K
                </kbd>
              </button>

              {/* Sound Effects Toggle */}
              <button
                onClick={() => {
                  const s = sound.toggle();
                  setSoundOn(s);
                }}
                className={classNames(
                  'p-2 rounded-xl transition-colors cursor-pointer',
                  navIsDark ? 'text-white/70 hover:text-white hover:bg-white/10' : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
                )}
                title={soundOn ? 'Sound Effects Active (Click to mute)' : 'Sound Effects Muted (Click to enable)'}
              >
                {soundOn ? <Volume2 size={16} className={navIsDark ? 'text-emerald-400' : 'text-emerald-600'} /> : <VolumeX size={16} className={navIsDark ? 'text-white/40' : 'text-neutral-400'} />}
              </button>

              {/* ── Sovereign Theme Mode Switcher (Light / Dark) ── */}
              <div
                className={classNames(
                  'relative flex items-center p-1 rounded-full border transition-all duration-300 backdrop-blur-xl',
                  navIsDark
                    ? 'border-white/15 bg-neutral-900/90 shadow-[inset_0_1px_3px_rgba(0,0,0,0.5)]'
                    : 'border-neutral-200/90 bg-neutral-100/95 shadow-[inset_0_1px_3px_rgba(0,0,0,0.06)]'
                )}
                role="group"
                aria-label="Theme mode switcher"
              >
                <button
                  type="button"
                  onClick={() => {
                    if (isDark) {
                      sound.play('click');
                      setTheme('light');
                    }
                  }}
                  className={classNames(
                    'relative z-10 flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition-all duration-300 cursor-pointer select-none active:scale-95',
                    !isDark
                      ? 'bg-white text-neutral-900 font-bold shadow-[0_2px_8px_rgba(0,0,0,0.12),0_1px_2px_rgba(0,0,0,0.06)] border border-neutral-200/80 scale-[1.02]'
                      : 'text-neutral-400 hover:text-neutral-200 hover:bg-white/5'
                  )}
                  title="Switch to Light Mode"
                >
                  <Sun
                    size={14}
                    className={classNames(
                      'transition-all duration-300',
                      !isDark
                        ? 'text-amber-500 drop-shadow-[0_0_8px_rgba(245,158,11,0.55)] rotate-0 scale-110'
                        : 'text-neutral-400 hover:text-amber-300 rotate-45'
                    )}
                  />
                  <span className="hidden 2xl:inline text-[11px] font-semibold tracking-wide">{t('nav.light', 'Light')}</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (!isDark) {
                      sound.play('click');
                      setTheme('dark');
                    }
                  }}
                  className={classNames(
                    'relative z-10 flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition-all duration-300 cursor-pointer select-none active:scale-95',
                    isDark
                      ? 'bg-gradient-to-b from-neutral-800 to-neutral-850 text-white font-bold shadow-[0_2px_8px_rgba(0,0,0,0.5),0_1px_2px_rgba(255,255,255,0.08)] border border-white/20 scale-[1.02]'
                      : 'text-neutral-500 hover:text-neutral-900 hover:bg-black/5'
                  )}
                  title="Switch to Dark Mode"
                >
                  <Moon
                    size={14}
                    className={classNames(
                      'transition-all duration-300',
                      isDark
                        ? 'text-sky-300 drop-shadow-[0_0_8px_rgba(56,189,248,0.6)] -rotate-12 scale-110'
                        : 'text-neutral-400 hover:text-sky-500 rotate-0'
                    )}
                  />
                  <span className="hidden 2xl:inline text-[11px] font-semibold tracking-wide">{t('nav.dark', 'Dark')}</span>
                </button>
              </div>

              {/* Language Selector */}
              <div className="relative" ref={langRef}>
                <button
                  onClick={() => {
                    sound.play('pop');
                    setLangOpen((p) => !p);
                  }}
                  className={classNames(
                    'flex items-center gap-1.5 px-2.5 py-1.5 text-xs rounded-xl transition-colors cursor-pointer font-semibold',
                    navIsDark ? 'text-white/80 hover:text-white hover:bg-white/10' : 'text-neutral-700 hover:text-neutral-900 hover:bg-neutral-100'
                  )}
                  aria-label="Select language"
                >
                  <Globe size={14} className={navIsDark ? 'text-emerald-400' : 'text-emerald-600'} />
                  <span className="hidden 2xl:inline">{currentLangObj.native}</span><span className="2xl:hidden uppercase font-mono text-[10px]">{language}</span>
                  <ChevronDown size={12} className={classNames('transition-transform', langOpen && 'rotate-180')} />
                </button>
                {langOpen && (
                  <div className={classNames(
                    'absolute right-0 mt-2 w-48 rounded-2xl border py-1.5 z-50 animate-fade-in shadow-2xl backdrop-blur-2xl overflow-hidden',
                    isDark ? 'border-white/20 bg-neutral-900/95 text-white' : 'border-neutral-200 bg-white/98 text-neutral-900 shadow-soft-xl'
                  )}>
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
                            ? isDark
                              ? 'bg-emerald-500/20 text-emerald-300 font-bold border-l-2 border-emerald-400'
                              : 'bg-emerald-50 text-emerald-800 font-bold border-l-2 border-emerald-600'
                            : isDark
                            ? 'text-white/80 hover:bg-white/10 hover:text-white'
                            : 'text-neutral-700 hover:bg-neutral-100 hover:text-neutral-900'
                        )}
                      >
                        <span className="font-semibold text-xs">{lang.native}</span>
                        <span className={classNames(
                          'text-[10px] uppercase font-mono px-1.5 py-0.5 rounded',
                          language === lang.code
                            ? isDark ? 'bg-emerald-400/25 text-emerald-300 font-bold' : 'bg-emerald-100 text-emerald-800 font-bold'
                            : isDark ? 'bg-white/10 text-white/50' : 'bg-neutral-100 text-neutral-500'
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
                <div className="flex items-center gap-1.5 lg:gap-2 shrink-0">
                  <button
                    onClick={toggleDrawer}
                    className={classNames(
                      'relative p-2 rounded-xl transition-colors cursor-pointer shrink-0',
                      navIsDark ? 'text-white/80 hover:text-white hover:bg-white/10' : 'text-neutral-700 hover:text-neutral-900 hover:bg-neutral-100'
                    )}
                    aria-label="Notifications"
                  >
                    <Bell size={17} />
                    {unreadCount > 0 && (
                      <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white rounded-full text-[9px] font-bold flex items-center justify-center animate-pulse">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </button>

                  <button
                    onClick={() => navigate(dashboardPath)}
                    className={classNames(
                      'hidden 2xl:inline-flex items-center px-2.5 py-1 rounded-xl text-xs font-semibold transition-colors cursor-pointer shrink-0 whitespace-nowrap',
                      navIsDark ? 'text-white hover:bg-white/10' : 'text-neutral-800 hover:bg-neutral-100'
                    )}
                  >
                    {t('nav.dashboard', 'Dashboard')}
                  </button>

                  <div className={classNames('flex items-center gap-1.5 pl-1.5 sm:pl-2 border-l shrink-0', navIsDark ? 'border-white/20' : 'border-neutral-200')}>
                    <button
                      onClick={() => navigate(dashboardPath)}
                      className={classNames(
                        'flex items-center p-0.5 rounded-full transition-all cursor-pointer group shrink-0 ring-2 ring-emerald-500/30',
                        navIsDark ? 'hover:ring-emerald-400' : 'hover:ring-emerald-600'
                      )}
                      title={`Logged in as ${user.name || user.email} (${user.role || 'Citizen'})`}
                      aria-label="User Profile"
                    >
                      <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-400 text-neutral-950 flex items-center justify-center font-bold text-xs shrink-0 shadow-sm">
                        {userInitials}
                      </div>
                    </button>

                    <button
                      onClick={handleLogout}
                      className={classNames(
                        'flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer shrink-0',
                        navIsDark
                          ? 'text-rose-400 hover:text-rose-300 hover:bg-rose-500/15'
                          : 'text-rose-600 hover:text-rose-700 hover:bg-rose-50'
                      )}
                      title={t('nav.signOut', 'Sign Out')}
                      aria-label="Sign Out"
                    >
                      <LogOut size={13} className="shrink-0 text-rose-500" />
                      <span className="whitespace-nowrap font-bold text-[11px]">{t('nav.signOut', 'Sign Out')}</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 lg:gap-2 shrink-0">
                  <Link
                    to="/login"
                    onClick={() => sound.play('click')}
                    className={classNames(
                      'text-xs font-semibold px-3 py-2 rounded-xl transition-colors whitespace-nowrap',
                      navIsDark ? 'text-white/90 hover:text-white hover:bg-white/10' : 'text-neutral-700 hover:text-neutral-900 hover:bg-neutral-100'
                    )}
                  >
                    {t('nav.signIn', 'Sign In')}
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => sound.play('click')}
                    className="glow-btn relative overflow-hidden shine px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500 via-brand-500 to-teal-400 text-neutral-950 font-black text-xs tracking-wider uppercase shadow-[0_0_20px_rgba(52,211,153,0.35)] hover:scale-105 active:scale-95 transition-all whitespace-nowrap"
                  >
                    {t('nav.signUp', 'Sign Up')}
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile Menu Toggle & Theme Toggle */}
            <div className="flex items-center gap-1 md:hidden">
              <button
                type="button"
                onClick={() => {
                  sound.play('click');
                  toggleTheme();
                }}
                className={classNames(
                  'p-2 rounded-xl transition-colors cursor-pointer',
                  isDark ? 'text-white/80 hover:bg-white/10' : 'text-neutral-700 hover:bg-neutral-100'
                )}
                title={`Switch to ${isDark ? 'Light' : 'Dark'} Mode`}
              >
                {isDark ? <Sun size={17} className="text-amber-400" /> : <Moon size={17} className="text-neutral-700" />}
              </button>

              {user && (
                <button
                  onClick={toggleDrawer}
                  className={classNames('relative p-2 rounded-xl', isDark ? 'text-white/80 hover:bg-white/10' : 'text-neutral-700 hover:bg-neutral-100')}
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
                className={classNames('p-2 rounded-xl transition-colors', isDark ? 'text-white/90 hover:bg-white/10' : 'text-neutral-800 hover:bg-neutral-100')}
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
          <div className={classNames(
            'md:hidden border-t px-4 py-3 space-y-2 animate-fade-in rounded-b-2xl backdrop-blur-2xl',
            isDark ? 'border-white/15 bg-neutral-950/95 text-white' : 'border-neutral-200 bg-white/98 text-neutral-900 shadow-xl'
          )}>
            {/* Theme Switcher in Mobile Drawer */}
            <div className={classNames(
              'flex items-center justify-between p-2.5 rounded-xl border',
              isDark ? 'bg-white/5 border-white/10' : 'bg-neutral-100 border-neutral-200'
            )}>
              <span className={classNames('text-xs font-semibold', isDark ? 'text-white/80' : 'text-neutral-700')}>
                Theme Appearance:
              </span>
              <div
                className={classNames(
                  'flex items-center p-0.5 rounded-lg border',
                  isDark ? 'border-white/15 bg-white/10' : 'border-neutral-200 bg-white'
                )}
              >
                <button
                  type="button"
                  onClick={() => {
                    sound.play('click');
                    setTheme('light');
                  }}
                  className={classNames(
                    'flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold cursor-pointer transition-all',
                    !isDark ? 'bg-neutral-100 text-emerald-700 font-bold shadow-xs' : 'text-neutral-400 hover:text-white'
                  )}
                >
                  <Sun size={13} className={!isDark ? 'text-amber-500' : ''} />
                  <span>Light</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    sound.play('click');
                    setTheme('dark');
                  }}
                  className={classNames(
                    'flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold cursor-pointer transition-all',
                    isDark ? 'bg-neutral-800 text-emerald-300 font-bold shadow-xs' : 'text-neutral-500 hover:text-neutral-900'
                  )}
                >
                  <Moon size={13} className={isDark ? 'text-cyan-400' : ''} />
                  <span>Dark</span>
                </button>
              </div>
            </div>

            {/* Sound Effects Toggle */}
            <div className={classNames(
              'flex items-center justify-between p-2.5 rounded-xl border',
              isDark ? 'bg-white/5 border-white/10' : 'bg-neutral-100 border-neutral-200'
            )}>
              <div className="flex items-center gap-2">
                {soundOn ? <Volume2 size={15} className="text-emerald-400" /> : <VolumeX size={15} className={isDark ? 'text-white/40' : 'text-neutral-400'} />}
                <span className={classNames('text-xs font-semibold', isDark ? 'text-white/80' : 'text-neutral-700')}>Sound Effects:</span>
              </div>
              <button
                onClick={() => {
                  const s = sound.toggle();
                  setSoundOn(s);
                }}
                className={classNames(
                  'px-2.5 py-1 rounded-lg text-xs font-medium cursor-pointer',
                  isDark ? 'bg-white/10 border border-white/15 text-white' : 'bg-white border border-neutral-200 text-neutral-800 shadow-xs'
                )}
              >
                {soundOn ? 'Enabled (Mute)' : 'Muted (Enable)'}
              </button>
            </div>

            {/* Language Selector */}
            <div className={classNames(
              'flex items-center gap-2 p-2.5 rounded-xl border',
              isDark ? 'bg-white/5 border-white/10' : 'bg-neutral-100 border-neutral-200'
            )}>
              <Globe size={15} className={isDark ? 'text-emerald-400' : 'text-emerald-600'} />
              <span className={classNames('text-xs font-semibold', isDark ? 'text-white/80' : 'text-neutral-700')}>{t('common.language', 'Language')}:</span>
              <div className="flex gap-1.5 ml-auto">
                {supportedLanguages.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => setLanguage(lang.code)}
                    className={classNames(
                      'px-2 py-1 rounded-lg text-xs font-medium transition-colors',
                      language === lang.code
                        ? 'bg-emerald-500 text-neutral-950 font-bold'
                        : isDark ? 'text-white/80 bg-white/10 border border-white/15' : 'text-neutral-700 bg-white border border-neutral-200'
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
                    isActive
                      ? isDark ? 'text-emerald-400 bg-white/10 font-bold' : 'text-emerald-600 bg-emerald-50 font-bold'
                      : isDark ? 'text-white/80 hover:bg-white/5' : 'text-neutral-700 hover:bg-neutral-50'
                  )
                }
              >
                <span className="whitespace-nowrap">{link.label}</span>
                </NavLink>
            ))}

            <div className={classNames('pt-2 border-t flex flex-col gap-2', isDark ? 'border-white/10' : 'border-neutral-200')}>
              {user ? (
                <>
                  <div className="flex items-center gap-3 px-2 py-1">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-400 text-neutral-950 flex items-center justify-center font-bold text-sm shrink-0">
                      {user.avatarInitials || (user.name ? user.name.slice(0, 2).toUpperCase() : 'U')}
                    </div>
                    <div className="flex flex-col text-left">
                      <span className={classNames('text-sm font-bold', navIsDark ? 'text-white' : 'text-neutral-900')}>
                        {user.name || user.email?.split('@')[0] || 'User'}
                      </span>
                      <span className={classNames('text-xs font-semibold capitalize', isDark ? 'text-emerald-400' : 'text-emerald-600')}>
                        {user.role || 'Citizen'}
                      </span>
                    </div>
                  </div>
                  <Button fullWidth size="sm" variant="secondary" onClick={() => { navigate(dashboardPath); setMenuOpen(false); }}>
                    {t('nav.dashboard', 'Go to Dashboard')}
                  </Button>
                  <Button fullWidth size="sm" variant="ghost" onClick={handleLogout} className={isDark ? 'text-white/70' : 'text-neutral-600'}>
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
