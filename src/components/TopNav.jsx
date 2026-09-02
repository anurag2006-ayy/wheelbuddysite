import { useLanguage } from '../i18n/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import LanguageSwitcher from './LanguageSwitcher';
import { LogOut, Sun, Moon, Monitor } from 'lucide-react';
import './TopNav.css';

const themeIcons = { dark: Moon, light: Sun, system: Monitor };
const themeOrder = ['dark', 'light', 'system'];

export default function TopNav({ name, roleLabel, onLogout }) {
  const { t } = useLanguage();
  const { theme, setTheme } = useTheme();
  const initial = (name || '?').trim().charAt(0).toUpperCase();

  const cycleTheme = () => {
    const idx = themeOrder.indexOf(theme);
    setTheme(themeOrder[(idx + 1) % themeOrder.length]);
  };

  const ThemeIcon = themeIcons[theme] || Moon;

  return (
    <header className="topnav">
      <div className="topnav__inner">
        <div className="topnav__brand">
          <span className="topnav__brand-mark">W</span>
          <span className="topnav__brand-name">{t('appName')}</span>
        </div>

        <div className="topnav__right">
          <button className="topnav__icon-btn" onClick={cycleTheme} title={`Theme: ${theme}`}>
            <ThemeIcon size={18} strokeWidth={1.75} />
          </button>
          <LanguageSwitcher />
          <div className="topnav__user">
            <span className="topnav__avatar">{initial}</span>
            <div className="topnav__user-text">
              <span className="topnav__user-name">{name}</span>
              <span className="topnav__user-role">{roleLabel}</span>
            </div>
          </div>
          <button className="topnav__logout-btn" onClick={onLogout}>
            <LogOut size={16} strokeWidth={1.75} />
          </button>
        </div>
      </div>
    </header>
  );
}
