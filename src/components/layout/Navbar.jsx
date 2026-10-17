// ─── Public Navbar ────────────────────────────────────────────────────────
import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Menu, X, Shield, Globe, ChevronDown, Bell, Search, Volume2, VolumeX } from 'lucide-react';
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
    <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-neutral-100 shadow-soft-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 shrink-0 group">
            <div className="w-9 h-9 bg-gradient-to-tr from-brand-600 via-brand-500 to-emerald-400 rounded-xl flex items-center justify-center shadow-brand group-hover:scale-105 transition-all duration-200">
              <Shield size={19} className="text-white" strokeWidth={2.5} />
            </div>
            <span className="font-extrabold text-lg text-neutral-900 tracking-tight">
              Kaiser<span className="text-brand-600 ml-0.5">AI</span>
            </span>
          </Link>

          {/* Desktop nav links */}
          <nav className="hidden md:flex items-center gap-1.5" aria-label="Main navigation">
            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.to === '/'}
                className={({ isActive }) =>
                  classNames(
                    'px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-150',
                    isActive
                      ? 'text-brand-700 bg-brand-50/80 shadow-xs'
                      : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100/70'
                  )
                }
              >
                {link.label}
              </NavLink>
            ))}
          </nav>

          {/* Right side */}
          <div className="hidden md:flex items-center gap-2.5">
            {/* Quick Spotlight Search trigger */}
            <button
              onClick={() => {
                sound.play('pop');
                setCmdOpen(true);
              }}
              className="flex items-center gap-2 px-3 py-1.5 text-xs text-neutral-600 hover:text-neutral-900 bg-neutral-100/90 hover:bg-neutral-200/70 rounded-xl transition-all border border-neutral-200/80 shadow-xs cursor-pointer active:scale-95"
              title="Spotlight Search (Ctrl+K)"
            >
              <Search size={14} className="text-neutral-500" />
              <span className="hidden lg:inline font-semibold">Quick Find</span>
              <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[9px] font-mono font-bold bg-white text-neutral-500 rounded border border-neutral-300/80 shadow-xs">
                Ctrl K
              </kbd>
            </button>

            {/* Sound Effects Toggle */}
            <button
              onClick={() => {
                const s = sound.toggle();
                setSoundOn(s);
              }}
              className="p-2 text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 rounded-xl transition-colors"
              title={soundOn ? 'Sound Effects Active (Click to mute)' : 'Sound Effects Muted (Click to enable)'}
            >
              {soundOn ? <Volume2 size={16} className="text-emerald-600" /> : <VolumeX size={16} className="text-neutral-400" />}
            </button>

            {/* Language selector */}
            <div className="relative">
              <button
                onClick={() => setLangOpen((p) => !p)}
                className="flex items-center gap-1.5 px-3 py-2 text-sm text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50 rounded-xl transition-colors border border-transparent hover:border-neutral-200"
                aria-label="Select language"
              >
                <Globe size={15} className="text-brand-600" />
                <span className="font-medium">{currentLangObj.native}</span>
                <ChevronDown size={13} className={classNames('transition-transform', langOpen && 'rotate-180')} />
              </button>
              {langOpen && (
                <div className="absolute right-0 mt-1.5 w-40 bg-white border border-neutral-100 rounded-xl shadow-soft-md py-1 z-50">
                  {supportedLanguages.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => { setLanguage(lang.code); setLangOpen(false); }}
                      className={classNames(
                        'w-full text-left px-3.5 py-2 text-xs flex items-center justify-between transition-colors',
                        language === lang.code
                          ? 'text-brand-700 bg-brand-50 font-bold'
                          : 'text-neutral-700 hover:bg-neutral-50'
                      )}
                    >
                      <span>{lang.native}</span>
                      <span className="text-[10px] text-neutral-400 uppercase font-mono">{lang.code}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {user ? (
              <>
                {/* Notification Bell */}
                <button
                  onClick={toggleDrawer}
                  className="relative p-2 rounded-xl text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50 transition-colors"
                  aria-label="Notifications"
                >
                  <Bell size={18} />
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white rounded-full text-[9px] font-bold flex items-center justify-center animate-pulse">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </button>

                <Button variant="ghost" size="sm" onClick={() => navigate(dashboardPath)}>
                  {t('nav.dashboard', 'Dashboard')}
                </Button>
                <div className="flex items-center gap-2 pl-2 border-l border-neutral-200">
                  <div className="w-8 h-8 rounded-full bg-brand-100 flex items-center justify-center text-brand-700 font-semibold text-xs">
                    {user.avatarInitials || user.name?.[0]}
                  </div>
                  <Button variant="ghost" size="sm" onClick={handleLogout} className="text-neutral-500 text-xs">
                    {t('nav.signOut', 'Sign Out')}
                  </Button>
                </div>
              </>
            ) : (
              <>
                <Link to="/login" className="text-sm font-medium text-brand-700 hover:text-brand-800 px-3 py-2 rounded-xl hover:bg-brand-50 transition-colors">
                  {t('nav.signIn', 'Sign In')}
                </Link>
                <Button size="sm" onClick={() => navigate('/register')}>
                  {t('nav.signUp', 'Sign Up')}
                </Button>
              </>
            )}
          </div>

          {/* Mobile menu toggle */}
          <div className="flex items-center gap-1 md:hidden">
            {user && (
              <button
                onClick={toggleDrawer}
                className="relative p-2 rounded-xl text-neutral-600 hover:bg-neutral-100"
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
              className="p-2 rounded-xl text-neutral-600 hover:bg-neutral-100 transition-colors"
              onClick={() => setMenuOpen((p) => !p)}
              aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            >
              {menuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-neutral-100 bg-white px-4 py-3 space-y-2 animate-fade-in">
          {/* Sound effects toggle in mobile menu */}
          <div className="flex items-center justify-between p-2 bg-neutral-50 rounded-xl">
            <div className="flex items-center gap-2">
              {soundOn ? <Volume2 size={15} className="text-emerald-600" /> : <VolumeX size={15} className="text-neutral-400" />}
              <span className="text-xs font-semibold text-neutral-600">Sound Effects:</span>
            </div>
            <button
              onClick={() => {
                const s = sound.toggle();
                setSoundOn(s);
              }}
              className="px-2.5 py-1 rounded-lg text-xs font-medium bg-white border border-neutral-200 text-neutral-700 cursor-pointer"
            >
              {soundOn ? 'Enabled (Mute)' : 'Muted (Enable)'}
            </button>
          </div>

          {/* Language selector in mobile menu */}
          <div className="flex items-center gap-2 p-2 bg-neutral-50 rounded-xl">
            <Globe size={15} className="text-brand-600 shrink-0" />
            <span className="text-xs font-semibold text-neutral-600">{t('common.language', 'Language')}:</span>
            <div className="flex gap-1.5 ml-auto">
              {supportedLanguages.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => setLanguage(lang.code)}
                  className={classNames(
                    'px-2 py-1 rounded-lg text-xs font-medium transition-colors',
                    language === lang.code
                      ? 'bg-brand-600 text-white'
                      : 'text-neutral-700 bg-white border border-neutral-200'
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
                  {t('nav.dashboard', 'Go to Dashboard')}
                </Button>
                <Button fullWidth size="sm" variant="ghost" onClick={handleLogout}>
                  {t('nav.signOut', 'Sign Out')}
                </Button>
              </>
            ) : (
              <>
                <Button fullWidth size="sm" variant="secondary" onClick={() => { navigate('/login'); setMenuOpen(false); }}>
                  {t('nav.signIn', 'Sign In')}
                </Button>
                <Button fullWidth size="sm" onClick={() => { navigate('/register'); setMenuOpen(false); }}>
                  {t('nav.signUp', 'Sign Up')}
                </Button>
              </>
            )}
          </div>
        </div>
      )}
      {/* Global Command Palette */}
      <CommandPalette isOpen={cmdOpen} onClose={() => setCmdOpen(false)} onOpen={() => setCmdOpen(true)} />
    </header>
  );
};

