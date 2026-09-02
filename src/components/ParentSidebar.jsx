import { NavLink } from 'react-router-dom';
import { useLanguage } from '../i18n/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import {
  Home,
  Map,
  CalendarDays,
  Bell,
  History,
  UserCircle,
  LogOut,
  Sun,
  Moon,
  Monitor,
} from 'lucide-react';
import './Sidebar.css';

const items = [
  { to: '/parent', end: true, icon: Home, key: 'Home' },
  { to: '/parent/track', icon: Map, key: 'Track Bus' },
  { to: '/parent/schedule', icon: CalendarDays, key: 'Bus Schedule' },
  { to: '/parent/notifications', icon: Bell, key: 'Notifications' },
  { to: '/parent/history', icon: History, key: 'Trip History' },
  { to: '/parent/profile', icon: UserCircle, key: 'Profile' },
];

const themeIcons = { dark: Moon, light: Sun, system: Monitor };
const themeOrder = ['dark', 'light', 'system'];

export default function ParentSidebar({ onLogout }) {
  const { t } = useLanguage();
  const { theme, setTheme } = useTheme();

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
        {items.map(({ to, end, icon: Icon, key }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) => `sidebar__link ${isActive ? 'sidebar__link--active' : ''}`}
          >
            <Icon size={20} strokeWidth={1.75} />
            <span>{t(key) || key}</span>
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
