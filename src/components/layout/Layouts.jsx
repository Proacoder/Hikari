// ─── Layout components ────────────────────────────────────────────────────
import { Outlet, Link, NavLink, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import {
  Shield, Home, Map, FileText, Bell, User, BarChart3,
  Users, Building2, Settings, LogOut, Menu, X, ChevronRight,
  AlertTriangle, TrendingUp, ClipboardList, Layers
} from 'lucide-react';
import { Navbar } from './Navbar';
import { Footer } from './Footer';
import { useAuth } from '../../context/AuthContext';
import { classNames } from '../../utils/formatters';

// ── Public layout (marketing site) ───────────────────────────────────────────
export const PublicLayout = () => (
  <div className="flex flex-col min-h-screen bg-neutral-50">
    <Navbar />
    <main className="flex-1 page-enter">
      <Outlet />
    </main>
    <Footer />
  </div>
);

// ── Shared app top bar for logged-in layouts ──────────────────────────────────
const AppTopBar = ({ title, sidebarOpen, setSidebarOpen }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  return (
    <header className="bg-white border-b border-neutral-100 h-14 flex items-center justify-between px-4 lg:px-6 shrink-0 shadow-soft-sm">
      <div className="flex items-center gap-3">
        <button
          onClick={() => setSidebarOpen(true)}
          className="lg:hidden p-2 rounded-xl text-neutral-500 hover:bg-neutral-100 transition-colors"
          aria-label="Open sidebar"
        >
          <Menu size={20} />
        </button>
        <h1 className="text-sm font-semibold text-neutral-800 hidden sm:block">{title}</h1>
      </div>
      <div className="flex items-center gap-2">
        <Link
          to={user?.role === 'officer' ? '/officer/notifications' : user?.role === 'admin' ? '/admin/notifications' : '/app/notifications'}
          className="relative p-2 rounded-xl text-neutral-500 hover:bg-neutral-100 transition-colors"
          aria-label="Notifications"
        >
          <Bell size={18} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
        </Link>
        <div className="flex items-center gap-2 pl-2 border-l border-neutral-200">
          <div className="w-8 h-8 rounded-full bg-brand-100 flex items-center justify-center text-brand-700 font-semibold text-xs">
            {user?.avatarInitials || user?.name?.[0]}
          </div>
          <button
            onClick={async () => { await logout(); navigate('/'); }}
            className="hidden sm:flex items-center gap-1 text-xs text-neutral-500 hover:text-neutral-900 transition-colors px-2 py-1.5 rounded-lg hover:bg-neutral-100"
            aria-label="Sign out"
          >
            <LogOut size={14} />
            Sign out
          </button>
        </div>
      </div>
    </header>
  );
};

// ── Sidebar nav link ──────────────────────────────────────────────────────────
const SideLink = ({ to, icon: Icon, label, end = false, onClick }) => (
  <NavLink
    to={to}
    end={end}
    onClick={onClick}
    className={({ isActive }) =>
      classNames(
        'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group',
        isActive
          ? 'bg-brand-50 text-brand-700 shadow-soft-sm'
          : 'text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900'
      )
    }
  >
    {({ isActive }) => (
      <>
        <Icon size={17} className={classNames('shrink-0', isActive ? 'text-brand-600' : 'text-neutral-400 group-hover:text-neutral-600')} />
        <span>{label}</span>
      </>
    )}
  </NavLink>
);

// ── Sidebar brand mark ───────────────────────────────────────────────────────
const SidebarBrand = () => (
  <Link to="/" className="flex items-center gap-2.5 px-4 h-14 border-b border-neutral-100 shrink-0">
    <div className="w-7 h-7 bg-brand-600 rounded-lg flex items-center justify-center shadow-brand">
      <Shield size={15} className="text-white" strokeWidth={2.5} />
    </div>
    <span className="font-bold text-base text-neutral-900">Kaiser <span className="text-brand-600">AI</span></span>
  </Link>
);

// ── Citizen Sidebar + Layout ─────────────────────────────────────────────────
const CITIZEN_NAV = [
  { to: '/app',               icon: Home,         label: 'Home',          end: true },
  { to: '/app/report',        icon: FileText,      label: 'Report Issue' },
  { to: '/app/my-complaints', icon: ClipboardList, label: 'My Complaints' },
  { to: '/app/map',           icon: Map,           label: 'Issue Map'    },
  { to: '/app/notifications', icon: Bell,          label: 'Notifications'},
  { to: '/app/profile',       icon: User,          label: 'Profile'      },
];

const CitizenSidebar = ({ open, onClose }) => (
  <>
    {open && <div className="fixed inset-0 bg-neutral-900/30 z-30 lg:hidden" onClick={onClose} />}
    <aside
      className={classNames(
        'fixed inset-y-0 left-0 z-40 w-60 bg-white border-r border-neutral-100 flex flex-col shadow-soft-md transition-transform duration-250 lg:static lg:translate-x-0 lg:shadow-none',
        open ? 'translate-x-0' : '-translate-x-full'
      )}
    >
      <div className="flex items-center justify-between">
        <SidebarBrand />
        <button onClick={onClose} className="lg:hidden p-2 mr-2 rounded-xl text-neutral-400 hover:bg-neutral-100">
          <X size={18} />
        </button>
      </div>
      <nav className="flex-1 overflow-y-auto p-3 space-y-0.5" aria-label="Citizen navigation">
        {CITIZEN_NAV.map((l) => <SideLink key={l.to} {...l} onClick={onClose} />)}
      </nav>
      <div className="p-3 border-t border-neutral-100">
        <div className="bg-brand-50 border border-brand-100 rounded-xl p-3 text-xs text-brand-700">
          <p className="font-semibold mb-0.5">BMC Helpline</p>
          <a href="tel:1916" className="text-brand-600 font-bold text-sm">1916</a>
          <p className="text-brand-500/80 mt-0.5">Available 24/7</p>
        </div>
      </div>
    </aside>
  </>
);

export const CitizenLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  return (
    <div className="flex h-screen bg-neutral-50 overflow-hidden">
      <CitizenSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 flex flex-col min-w-0">
        <AppTopBar title="Citizen Portal" sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        <main className="flex-1 overflow-y-auto p-4 lg:p-6 page-enter">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

// ── Officer Sidebar + Layout ──────────────────────────────────────────────────
const OFFICER_NAV = [
  { to: '/officer',              icon: Home,        label: 'Dashboard',    end: true },
  { to: '/officer/ward-overview',icon: Map,         label: 'Ward Overview' },
  { to: '/officer/performance',  icon: TrendingUp,  label: 'Performance'   },
  { to: '/officer/notifications', icon: Bell,       label: 'Notifications' },
  { to: '/officer/profile',      icon: User,        label: 'Profile'       },
];

const OfficerSidebar = ({ open, onClose }) => (
  <>
    {open && <div className="fixed inset-0 bg-neutral-900/30 z-30 lg:hidden" onClick={onClose} />}
    <aside
      className={classNames(
        'fixed inset-y-0 left-0 z-40 w-60 bg-white border-r border-neutral-100 flex flex-col shadow-soft-md transition-transform duration-250 lg:static lg:translate-x-0 lg:shadow-none',
        open ? 'translate-x-0' : '-translate-x-full'
      )}
    >
      <div className="flex items-center justify-between">
        <SidebarBrand />
        <button onClick={onClose} className="lg:hidden p-2 mr-2 rounded-xl text-neutral-400 hover:bg-neutral-100">
          <X size={18} />
        </button>
      </div>
      <div className="mx-3 mt-3 mb-2 px-3 py-2 bg-sky-50 border border-sky-100 rounded-xl">
        <p className="text-xs font-semibold text-sky-700">Officer Portal</p>
        <p className="text-xs text-sky-500">K/E Ward – Andheri East</p>
      </div>
      <nav className="flex-1 overflow-y-auto p-3 space-y-0.5" aria-label="Officer navigation">
        {OFFICER_NAV.map((l) => <SideLink key={l.to} {...l} onClick={onClose} />)}
      </nav>
    </aside>
  </>
);

export const OfficerLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  return (
    <div className="flex h-screen bg-neutral-50 overflow-hidden">
      <OfficerSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 flex flex-col min-w-0">
        <AppTopBar title="Officer Portal" sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        <main className="flex-1 overflow-y-auto p-4 lg:p-6 page-enter">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

// ── Admin Sidebar + Layout ────────────────────────────────────────────────────
const ADMIN_NAV = [
  { to: '/admin',            icon: BarChart3,    label: 'Dashboard',    end: true },
  { to: '/admin/wards',      icon: Building2,    label: 'Wards'         },
  { to: '/admin/officers',   icon: Users,        label: 'Officers'      },
  { to: '/admin/analytics',  icon: TrendingUp,   label: 'Analytics'     },
  { to: '/admin/complaints', icon: ClipboardList,label: 'Complaints'    },
  { to: '/admin/reports',    icon: Layers,       label: 'Reports'       },
];

const AdminSidebar = ({ open, onClose }) => (
  <>
    {open && <div className="fixed inset-0 bg-neutral-900/30 z-30 lg:hidden" onClick={onClose} />}
    <aside
      className={classNames(
        'fixed inset-y-0 left-0 z-40 w-60 bg-white border-r border-neutral-100 flex flex-col shadow-soft-md transition-transform duration-250 lg:static lg:translate-x-0 lg:shadow-none',
        open ? 'translate-x-0' : '-translate-x-full'
      )}
    >
      <div className="flex items-center justify-between">
        <SidebarBrand />
        <button onClick={onClose} className="lg:hidden p-2 mr-2 rounded-xl text-neutral-400 hover:bg-neutral-100">
          <X size={18} />
        </button>
      </div>
      <div className="mx-3 mt-3 mb-2 px-3 py-2 bg-amber-50 border border-amber-100 rounded-xl">
        <p className="text-xs font-semibold text-amber-700">BMC Admin Console</p>
        <p className="text-xs text-amber-500">City-wide Operations</p>
      </div>
      <nav className="flex-1 overflow-y-auto p-3 space-y-0.5" aria-label="Admin navigation">
        {ADMIN_NAV.map((l) => <SideLink key={l.to} {...l} onClick={onClose} />)}
      </nav>
      <div className="p-3 border-t border-neutral-100">
        <div className="flex items-center gap-1.5 text-xs text-neutral-400 bg-neutral-50 rounded-xl px-3 py-2">
          <AlertTriangle size={12} className="text-amber-500" />
          <span>127 high-priority open</span>
        </div>
      </div>
    </aside>
  </>
);

export const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  return (
    <div className="flex h-screen bg-neutral-50 overflow-hidden">
      <AdminSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 flex flex-col min-w-0">
        <AppTopBar title="BMC Admin Console" sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        <main className="flex-1 overflow-y-auto p-4 lg:p-6 page-enter">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
