import { NavLink } from 'react-router-dom';
import { useLanguage } from '../i18n/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import {
  LayoutDashboard,
  Map,
  Bus,
  Calendar,
  Users,
  AlertTriangle,
  FileText,
  UserCircle,
  Settings,
  LogOut,
  Sun,
  Moon,
  Monitor,
  Database,
  ChevronDown,
  ChevronRight,
} from 'lucide-react';
import { useState } from 'react';
import './Sidebar.css';

const mainItems = [
  { to: '/admin', end: true, icon: LayoutDashboard, key: 'navDashboard' },
  { to: '/admin/live-map', icon: Map, key: 'navLiveMap' },
  { to: '/admin/buses', icon: Bus, key: 'navBuses' },
  { to: '/admin/schedule', icon: Calendar, key: 'Fleet Schedule' },
  { to: '/admin/drivers', icon: Users, key: 'navDrivers' },
];

const sosItems = [
  { to: '/admin/sos', end: true, icon: AlertTriangle, key: 'Active Alerts', label: 'Active Alerts' },
];

const recordItems = [
  { to: '/admin/records', end: true, icon: Database, key: 'Records', label: 'Records' },
];

const bottomItems = [
  { to: '/admin/reports', icon: FileText, key: 'navReports' },
  { to: '/admin/parent', icon: UserCircle, key: 'Parent' },
  { to: '/admin/settings', icon: Settings, key: 'navSettings' },
];

const themeIcons = { dark: Moon, light: Sun, system: Monitor };
const themeOrder = ['dark', 'light', 'system'];

export default function Sidebar({ onLogout }) {
  const { t } = useLanguage();
  const { theme, setTheme } = useTheme();
  const [sosOpen, setSosOpen] = useState(true);
  const [recordsOpen, setRecordsOpen] = useState(false);

  const cycleTheme = () => {
    const idx = themeOrder.indexOf(theme);
    setTheme(themeOrder[(idx + 1) % themeOrder.length]);
  };

  const ThemeIcon = themeIcons[theme] || Moon;

  return (
    <aside className="sidebar">
      <div className="sidebar__brand">
        <span className="sidebar__brand-mark">W</span>
        <span className="sidebar__brand-name">{t('appName')}</span>
      </div>

      <nav className="sidebar__nav">
        {/* Main Items */}
        {mainItems.map(({ to, end, icon: Icon, key }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) => `sidebar__link ${isActive ? 'sidebar__link--active' : ''}`}
          >
            <Icon size={20} strokeWidth={1.75} />
            <span>{t(key)}</span>
          </NavLink>
        ))}

        {/* SOS Section */}
        <div className="sidebar__section-header" onClick={() => setSosOpen(o => !o)}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <AlertTriangle size={16} strokeWidth={1.75} style={{ color: 'var(--danger)' }} />
            <span style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-tertiary)' }}>SOS Alerts</span>
          </div>
          {sosOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
        </div>
        {sosOpen && (
          <>
            <NavLink
              to="/admin/sos"
              end
              className={({ isActive }) => `sidebar__link sidebar__link--sub ${isActive ? 'sidebar__link--active' : ''}`}
            >
              <AlertTriangle size={18} strokeWidth={1.75} style={{ color: 'var(--danger)' }} />
              <span>Active Alerts</span>
            </NavLink>
            <NavLink
              to="/admin/sos-history"
              end
              className={({ isActive }) => `sidebar__link sidebar__link--sub ${isActive ? 'sidebar__link--active' : ''}`}
            >
              <FileText size={18} strokeWidth={1.75} />
              <span>SOS History</span>
            </NavLink>
          </>
        )}

        {/* Records Section */}
        <div className="sidebar__section-header" onClick={() => setRecordsOpen(o => !o)}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Database size={16} strokeWidth={1.75} style={{ color: 'var(--accent)' }} />
            <span style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-tertiary)' }}>Records</span>
          </div>
          {recordsOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
        </div>
        {recordsOpen && (
          <>
            <NavLink
              to="/admin/records"
              end
              className={({ isActive }) => `sidebar__link sidebar__link--sub ${isActive ? 'sidebar__link--active' : ''}`}
            >
              <LayoutDashboard size={18} strokeWidth={1.75} />
              <span>Overview</span>
            </NavLink>
            <NavLink
              to="/admin/records/drivers"
              className={({ isActive }) => `sidebar__link sidebar__link--sub ${isActive ? 'sidebar__link--active' : ''}`}
            >
              <Users size={18} strokeWidth={1.75} />
              <span>Drivers</span>
            </NavLink>
            <NavLink
              to="/admin/records/routes"
              className={({ isActive }) => `sidebar__link sidebar__link--sub ${isActive ? 'sidebar__link--active' : ''}`}
            >
              <Map size={18} strokeWidth={1.75} />
              <span>Routes</span>
            </NavLink>
            <NavLink
              to="/admin/records/stops"
              className={({ isActive }) => `sidebar__link sidebar__link--sub ${isActive ? 'sidebar__link--active' : ''}`}
            >
              <Bus size={18} strokeWidth={1.75} />
              <span>Stops</span>
            </NavLink>
            <NavLink
              to="/admin/records/students"
              className={({ isActive }) => `sidebar__link sidebar__link--sub ${isActive ? 'sidebar__link--active' : ''}`}
            >
              <UserCircle size={18} strokeWidth={1.75} />
              <span>Students</span>
            </NavLink>
          </>
        )}

        {/* Bottom Items */}
        <div style={{ height: 1, background: 'var(--border)', margin: '8px 12px' }} />
        {bottomItems.map(({ to, icon: Icon, key }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) => `sidebar__link ${isActive ? 'sidebar__link--active' : ''}`}
          >
            <Icon size={20} strokeWidth={1.75} />
            <span>{t(key)}</span>
          </NavLink>
        ))}
      </nav>

      <div className="sidebar__bottom">
        <button className="sidebar__theme-btn" onClick={cycleTheme} title={`Theme: ${theme}`}>
          <ThemeIcon size={18} strokeWidth={1.75} />
          <span>{theme.charAt(0).toUpperCase() + theme.slice(1)}</span>
        </button>
        <button className="sidebar__logout" onClick={onLogout}>
          <LogOut size={18} strokeWidth={1.75} />
          <span>{t('logout')}</span>
        </button>
      </div>
    </aside>
  );
}
