// ─── Layout components (Adaptive Marketing Theme + Sovereign Light Mode Portals) ───
import { Outlet, Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useState, useMemo, useEffect } from 'react';
import {
  Newspaper, Shield, Home, Map, FileText, Bell, User, BarChart3,
  Users, Building2, LogOut, Menu, X,
  AlertTriangle, TrendingUp, ClipboardList, Layers, Globe, ChevronDown, BadgeCheck, Trophy, CloudRain,
  Search, Volume2, VolumeX
} from 'lucide-react';
import { Navbar } from './Navbar';
import { Footer } from './Footer';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { useNotifications } from '../../context/NotificationContext';
import { useTheme } from '../../context/ThemeContext';
import { NotificationDrawer } from '../notifications/NotificationDrawer';
import { classNames } from '../../utils/formatters';
import { MOCK_OFFICERS } from '../../utils/mockData';
import { EmergencyTicker } from '../common/EmergencyTicker';
import { CommandPalette } from '../common/CommandPalette';
import { sound } from '../../utils/soundEffects';

// ── Public layout (marketing site — supports adaptive Light & Dark mode) ─────
export const PublicLayout = () => {
  const { isDark } = useTheme();
  const location = useLocation();
  const isHome = location.pathname === '/';

  return (
    <div
      className={classNames(
        'flex flex-col min-h-screen transition-colors duration-300',
        isDark || isHome
          ? 'bg-neutral-950 text-neutral-100 selection:bg-emerald-500/30 selection:text-emerald-200'
          : 'bg-slate-50 text-neutral-900 selection:bg-emerald-500/20 selection:text-emerald-800'
      )}
    >
      <EmergencyTicker />
      <Navbar />
      <NotificationDrawer />
      <main className={classNames('flex-1 page-enter', isHome && '-mt-[72px] sm:-mt-[76px]')}>
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

// ── Shared app top bar for logged-in portal layouts (Light Mode Only) ────────
const AppTopBar = ({ title, setSidebarOpen }) => {
  const { user, logout } = useAuth();
  const { language, setLanguage, t, supportedLanguages } = useLanguage();
  const { unreadCount, toggleDrawer } = useNotifications();
  const { setTheme } = useTheme();
  const [langOpen, setLangOpen] = useState(false);
  const [cmdOpen, setCmdOpen] = useState(false);
  const [soundOn, setSoundOn] = useState(sound.isEnabled());
  const navigate = useNavigate();

  // Enforce Light Mode strictly across Citizen, Ward Officer, and Admin HQ portals
  useEffect(() => {
    setTheme('light');
    document.documentElement.classList.remove('dark');
    document.documentElement.classList.add('light');
    document.documentElement.setAttribute('data-theme', 'light');
  }, [setTheme]);

  const currentLangObj = supportedLanguages.find((l) => l.code === language) || supportedLanguages[0];

  return (
    <>
      <header className="h-14 flex items-center justify-between px-4 lg:px-6 shrink-0 relative z-30 transition-colors duration-200 bg-white border-b border-neutral-200 text-neutral-800 shadow-soft-sm">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 rounded-xl text-neutral-500 hover:bg-neutral-100 transition-colors"
            aria-label="Open sidebar"
          >
            <Menu size={20} />
          </button>
          <h1 className="text-sm font-semibold hidden sm:block text-neutral-800">
            {title}
          </h1>
        </div>

        <div className="flex items-center gap-2">
          {/* Quick Spotlight Search trigger */}
          <button
            onClick={() => {
              sound.play('pop');
              setCmdOpen(true);
            }}
            className="flex items-center gap-2 px-2.5 py-1.5 text-xs rounded-xl transition-all border bg-neutral-100 hover:bg-neutral-200/70 text-neutral-500 hover:text-neutral-900 border-neutral-200/60"
            title="Search commands, wards, or complaints (Ctrl+K)"
          >
            <Search size={14} className="text-neutral-500" />
            <span className="hidden md:inline font-medium text-neutral-600">
              Quick Find
            </span>
            <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[9px] font-mono font-bold rounded border bg-white text-neutral-500 border-neutral-300">
              Ctrl K
            </kbd>
          </button>

          {/* Sound Effects Toggle */}
          <button
            onClick={() => {
              const s = sound.toggle();
              setSoundOn(s);
            }}
            className="p-2 rounded-xl transition-colors text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100"
            title={soundOn ? 'Sound Effects Active' : 'Sound Effects Muted'}
          >
            {soundOn ? <Volume2 size={16} className="text-emerald-500" /> : <VolumeX size={16} className="text-neutral-400" />}
          </button>

          {/* Language selector in dashboard topbar */}
          <div className="relative">
            <button
              onClick={() => setLangOpen((p) => !p)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs rounded-xl transition-colors border bg-white border-neutral-200/70 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50"
              aria-label="Select language"
            >
              <Globe size={14} className="text-brand-500" />
              <span className="font-medium hidden sm:inline">{currentLangObj.native}</span>
              <span className="font-bold sm:hidden uppercase text-[10px]">{language}</span>
              <ChevronDown size={12} className={classNames('transition-transform', langOpen && 'rotate-180')} />
            </button>
            {langOpen && (
              <div className="absolute right-0 mt-1 w-36 rounded-xl py-1 z-50 border shadow-soft-md bg-white border-neutral-100 text-neutral-700">
                {supportedLanguages.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => {
                      setLanguage(lang.code);
                      setLangOpen(false);
                    }}
                    className={classNames(
                      'w-full text-left px-3 py-1.5 text-xs flex items-center justify-between transition-colors',
                      language === lang.code
                        ? 'text-brand-700 bg-brand-50 font-bold'
                        : 'text-neutral-700 hover:bg-neutral-50'
                    )}
                  >
                    <span>{lang.native}</span>
                    <span className="text-[10px] uppercase font-mono text-neutral-400">
                      {lang.code}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Notifications Drawer Toggle */}
          <button
            onClick={toggleDrawer}
            className="relative p-2 rounded-xl transition-colors text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100"
            aria-label="Toggle notifications drawer"
          >
            <Bell size={18} />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 min-w-[16px] h-4 px-1 bg-red-500 text-white rounded-full text-[9px] font-bold flex items-center justify-center animate-pulse">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          <div className="flex items-center gap-2 pl-2 border-l border-neutral-200">
            <div className="w-8 h-8 rounded-full bg-brand-500/15 text-brand-700 flex items-center justify-center font-semibold text-xs border border-brand-200">
              {user?.avatarInitials || user?.name?.[0]}
            </div>
            <button
              onClick={async () => {
                await logout();
                navigate('/');
              }}
              className="hidden sm:flex items-center gap-1 text-xs transition-colors px-2 py-1.5 rounded-lg text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100"
              aria-label="Sign out"
            >
              <LogOut size={14} />
              {t('nav.signOut', 'Sign out')}
            </button>
          </div>
        </div>
      </header>
      <CommandPalette isOpen={cmdOpen} onClose={() => setCmdOpen(false)} onOpen={() => setCmdOpen(true)} />
    </>
  );
};

// ── Sidebar nav link (Light Mode Only) ────────────────────────────────────────
const SideLink = ({ to, icon: Icon, label, badge, end = false, onClick }) => {
  return (
    <NavLink
      to={to}
      end={end}
      onClick={onClick}
      className={({ isActive }) =>
        classNames(
          'flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all group',
          isActive
            ? 'bg-brand-50 text-brand-700 shadow-soft-sm font-semibold'
            : 'text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900'
        )
      }
    >
      {({ isActive }) => (
        <>
          <div className="flex items-center gap-3">
            <Icon
              size={17}
              className={classNames(
                'shrink-0',
                isActive
                  ? 'text-brand-600'
                  : 'text-neutral-400 group-hover:text-neutral-600'
              )}
            />
            <span>{label}</span>
          </div>
          {badge > 0 && (
            <span className="px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-red-100 text-red-700">
              {badge > 9 ? '9+' : badge}
            </span>
          )}
        </>
      )}
    </NavLink>
  );
};

// ── Sidebar brand mark (Light Mode Only) ─────────────────────────────────────
const SidebarBrand = () => {
  return (
    <Link
      to="/"
      className="flex items-center gap-2.5 px-4 h-14 border-b shrink-0 border-neutral-200 text-neutral-900"
    >
      <div className="w-7 h-7 bg-brand-600 rounded-lg flex items-center justify-center shadow-brand">
        <Shield size={15} className="text-white" strokeWidth={2.5} />
      </div>
      <span className="font-bold text-base text-neutral-900">
        Kaiser <span className="text-brand-500">AI</span>
      </span>
    </Link>
  );
};

// ── Citizen Sidebar + Layout (Light Mode Only) ───────────────────────────────
const CitizenSidebar = ({ open, onClose }) => {
  const { t } = useLanguage();
  const { unreadCount } = useNotifications();

  const citizenNav = [
    { to: '/app', icon: Home, label: t('nav.home', 'Home'), end: true },
    { to: '/app/report', icon: FileText, label: t('nav.reportIssue', 'Report Issue') },
    { to: '/app/my-complaints', icon: ClipboardList, label: t('nav.myComplaints', 'My Complaints') },
    { to: '/app/map', icon: Map, label: t('nav.issueMap', 'Issue Map') },
    { to: '/app/news', icon: Newspaper, label: t('nav.civicNews', 'Civic News') },
    { to: '/app/leaderboard', icon: Trophy, label: t('nav.leaderboard', 'Civic Champions') },
    { to: '/app/notifications', icon: Bell, label: t('nav.notifications', 'Notifications'), badge: unreadCount },
    { to: '/app/profile', icon: User, label: t('nav.profile', 'Profile') },
  ];

  return (
    <>
      {open && <div className="fixed inset-0 bg-neutral-900/30 z-30 lg:hidden" onClick={onClose} />}
      <aside
        className={classNames(
          'fixed inset-y-0 left-0 z-40 w-60 border-r flex flex-col shadow-soft-md transition-transform duration-250 lg:static lg:translate-x-0 lg:shadow-none bg-white border-neutral-200 text-neutral-900',
          open ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex items-center justify-between">
          <SidebarBrand />
          <button
            onClick={onClose}
            className="lg:hidden p-2 mr-2 rounded-xl text-neutral-400 hover:bg-neutral-100"
          >
            <X size={18} />
          </button>
        </div>
        <nav className="flex-1 overflow-y-auto p-3 space-y-0.5" aria-label="Citizen navigation">
          {citizenNav.map((l) => <SideLink key={l.to} {...l} onClick={onClose} />)}
        </nav>
        <div className="p-3 border-t border-neutral-200">
          <div className="border rounded-xl p-3 text-xs bg-brand-50 border-brand-100 text-brand-700">
            <p className="font-semibold mb-0.5">{t('nav.bmcHelpline', 'BMC Helpline')}</p>
            <a href="tel:1916" className="text-brand-500 font-bold text-sm">
              1916
            </a>
            <p className="mt-0.5 text-brand-500/80">
              {t('nav.available247', 'Available 24/7')}
            </p>
          </div>
        </div>
      </aside>
    </>
  );
};

export const CitizenLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { setTheme } = useTheme();

  useEffect(() => {
    setTheme('light');
    document.documentElement.classList.remove('dark');
    document.documentElement.classList.add('light');
    document.documentElement.setAttribute('data-theme', 'light');
  }, [setTheme]);

  return (
    <div className="flex h-screen overflow-hidden bg-neutral-50 text-neutral-900">
      <CitizenSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <NotificationDrawer />
      <div className="flex-1 flex flex-col min-w-0">
        <AppTopBar title="Citizen Portal" sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        <main className="flex-1 overflow-y-auto p-4 lg:p-6 page-enter bg-neutral-50 text-neutral-900">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

// ── Officer Sidebar + Layout (Light Mode Only) ────────────────────────────────
const OfficerSidebar = ({ open, onClose }) => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const { unreadCount } = useNotifications();
  const location = useLocation();

  // Extract officer ID from current path: /officer/:officerId/...
  const parts = location.pathname.split('/').filter(Boolean);
  const subPages = ['ward-overview', 'performance', 'notifications', 'profile'];
  const officerParam = parts[1] && !subPages.includes(parts[1]) ? parts[1] : null;

  const currentOfficer = useMemo(() => {
    // ACCESS CONTROL: The authenticated officer ALWAYS sees only their own profile
    if (user?.role === 'officer' && user?.id) {
      const match = MOCK_OFFICERS.find(o => o.id === user.id);
      if (match) return match;
    }
    const stored = localStorage.getItem('kaiser_officer_id');
    if (stored) {
      const match = MOCK_OFFICERS.find(o => o.id === stored);
      if (match) return match;
    }
    if (officerParam) {
      const match = MOCK_OFFICERS.find(o => o.id === officerParam || String(o.ward) === officerParam);
      if (match) return match;
    }
    return MOCK_OFFICERS[0];
  }, [user, officerParam]);

  const base = `/officer/${currentOfficer.id}`;
  const navItems = [
    { to: base, icon: Home, label: t('nav.dashboard', 'Complaint Queue'), end: true },
    { to: `${base}/ward-overview`, icon: Map, label: t('nav.wardOverview', 'Ward Overview') },
    { to: `${base}/performance`, icon: TrendingUp, label: t('nav.performance', 'Performance') },
    { to: `${base}/notifications`, icon: Bell, label: t('nav.notifications', 'Notifications'), badge: unreadCount },
    { to: `${base}/profile`, icon: User, label: t('nav.profile', 'Profile') },
  ];

  return (
    <>
      {open && <div className="fixed inset-0 bg-neutral-900/30 z-30 lg:hidden" onClick={onClose} />}
      <aside
        className={classNames(
          'fixed inset-y-0 left-0 z-40 w-60 border-r flex flex-col shadow-soft-md transition-transform duration-250 lg:static lg:translate-x-0 lg:shadow-none bg-white border-neutral-200 text-neutral-900',
          open ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex items-center justify-between">
          <SidebarBrand />
          <button
            onClick={onClose}
            className="lg:hidden p-2 mr-2 rounded-xl text-neutral-400 hover:bg-neutral-100"
          >
            <X size={18} />
          </button>
        </div>

        {/* Officer Profile Card in Sidebar */}
        <div className="mx-3 mt-3 mb-1">
          <div className="bg-gradient-to-br from-slate-800 to-blue-900 rounded-xl p-3 text-white shadow-sm">
            <div className="flex items-center gap-2.5 mb-2">
              <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center text-xs font-bold shrink-0">
                {currentOfficer.avatarInitials}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold truncate">{currentOfficer.name}</p>
                <p className="text-[10px] text-white/70 truncate">{currentOfficer.wardName.split('–')[0]?.trim()}</p>
              </div>
            </div>
            <div className="flex items-center gap-1 text-[10px] text-white/70">
              <BadgeCheck size={11} className="text-brand-300" />
              <span className="font-mono truncate">{currentOfficer.employeeId}</span>
            </div>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto p-3 space-y-0.5" aria-label="Officer navigation">
          {navItems.map((l) => <SideLink key={l.to} {...l} onClick={onClose} />)}
        </nav>

        {/* Dept Badge */}
        <div className="p-3 border-t border-neutral-200">
          <div className="px-3 py-2 border rounded-xl text-xs bg-sky-50 border-sky-100 text-sky-700">
            <p className="font-semibold">{currentOfficer.department}</p>
            <p className="text-[10px] mt-0.5 text-sky-500/80">{currentOfficer.status} Officer</p>
          </div>
        </div>
      </aside>
    </>
  );
};

export const OfficerLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { setTheme } = useTheme();

  useEffect(() => {
    setTheme('light');
    document.documentElement.classList.remove('dark');
    document.documentElement.classList.add('light');
    document.documentElement.setAttribute('data-theme', 'light');
  }, [setTheme]);

  return (
    <div className="flex h-screen overflow-hidden bg-neutral-50 text-neutral-900">
      <OfficerSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <NotificationDrawer />
      <div className="flex-1 flex flex-col min-w-0">
        <AppTopBar title="Officer Portal" sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        <main className="flex-1 overflow-y-auto p-4 lg:p-6 page-enter bg-neutral-50 text-neutral-900">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

// ── Admin Sidebar + Layout (Light Mode Only) ──────────────────────────────────
const AdminSidebar = ({ open, onClose }) => {
  const { t } = useLanguage();

  const adminNav = [
    { to: '/admin', icon: BarChart3, label: t('nav.dashboard', 'Dashboard'), end: true },
    { to: '/admin/wards', icon: Building2, label: t('nav.wards', 'Wards') },
    { to: '/admin/officers', icon: Users, label: t('nav.officers', 'Officers') },
    { to: '/admin/analytics', icon: TrendingUp, label: t('nav.analytics', 'Analytics') },
    { to: '/admin/disaster', icon: CloudRain, label: 'Disaster & Floods ⚡' },
    { to: '/admin/complaints', icon: ClipboardList, label: t('nav.complaints', 'Complaints') },
    { to: '/admin/reports', icon: Layers, label: t('nav.reports', 'Reports') },
  ];

  return (
    <>
      {open && <div className="fixed inset-0 bg-neutral-900/30 z-30 lg:hidden" onClick={onClose} />}
      <aside
        className={classNames(
          'fixed inset-y-0 left-0 z-40 w-60 border-r flex flex-col shadow-soft-md transition-transform duration-250 lg:static lg:translate-x-0 lg:shadow-none bg-white border-neutral-200 text-neutral-900',
          open ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex items-center justify-between">
          <SidebarBrand />
          <button
            onClick={onClose}
            className="lg:hidden p-2 mr-2 rounded-xl text-neutral-400 hover:bg-neutral-100"
          >
            <X size={18} />
          </button>
        </div>
        <div className="mx-3 mt-3 mb-2 px-3 py-2 border rounded-xl bg-amber-50 border-amber-100">
          <p className="text-xs font-semibold text-amber-700">BMC Admin Console</p>
          <p className="text-xs text-amber-500">City-wide Operations</p>
        </div>
        <nav className="flex-1 overflow-y-auto p-3 space-y-0.5" aria-label="Admin navigation">
          {adminNav.map((l) => <SideLink key={l.to} {...l} onClick={onClose} />)}
        </nav>
        <div className="p-3 border-t border-neutral-200">
          <div className="flex items-center gap-1.5 text-xs rounded-xl px-3 py-2 border bg-neutral-50 border-neutral-200 text-neutral-600">
            <AlertTriangle size={12} className="text-amber-500" />
            <span>127 high-priority open</span>
          </div>
        </div>
      </aside>
    </>
  );
};

export const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { setTheme } = useTheme();

  useEffect(() => {
    setTheme('light');
    document.documentElement.classList.remove('dark');
    document.documentElement.classList.add('light');
    document.documentElement.setAttribute('data-theme', 'light');
  }, [setTheme]);

  return (
    <div className="flex h-screen overflow-hidden bg-neutral-50 text-neutral-900">
      <AdminSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <NotificationDrawer />
      <div className="flex-1 flex flex-col min-w-0">
        <AppTopBar title="BMC Admin Console" sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        <main className="flex-1 overflow-y-auto p-4 lg:p-6 page-enter bg-neutral-50 text-neutral-900">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
