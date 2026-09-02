import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../i18n/LanguageContext';
import ParentSidebar from '../components/ParentSidebar';
import TopNav from '../components/TopNav';
import LiveRouteMap from '../components/LiveRouteMap';
import { Map, Bell, History, User } from 'lucide-react';

const icons = {
  map: Map,
  notifications: Bell,
  history: History,
  profile: User
};

export default function ParentPlaceholder({ title, type = 'map', showMap = false }) {
  const { user, logout } = useAuth();
  const { t } = useLanguage();
  const Icon = icons[type] || Map;

  return (
    <div style={{ display: 'flex' }}>
      <ParentSidebar onLogout={logout} />
      <div style={{ flex: 1, marginLeft: 'var(--sidebar-w)', display: 'flex', flexDirection: 'column', minHeight: '100vh', background: 'var(--bg-primary)' }}>
        <TopNav name={user?.name || 'Parent'} roleLabel={t('roleParent') || 'Parent'} onLogout={logout} />
        
        <main style={{ padding: 'var(--space-8)', flex: 1 }}>
          <header style={{ marginBottom: 'var(--space-8)' }}>
            <p className="eyebrow">WheelBuddy Parent</p>
            <h1 style={{ fontSize: 'var(--text-heading-xl)', fontWeight: 600, color: 'var(--text-primary)' }}>
              {title}
            </h1>
          </header>

          <div className="container" style={{ maxWidth: 'var(--max-w)', margin: 0, padding: 0 }}>
            {showMap ? (
              <div className="card" style={{ padding: 'var(--space-2)' }}>
                <LiveRouteMap variant="card" speed={32} />
              </div>
            ) : (
              <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '120px 20px', textAlign: 'center' }}>
                <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'var(--bg-surface-hover)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 'var(--space-4)', color: 'var(--text-tertiary)' }}>
                  <Icon size={32} />
                </div>
                <p style={{ fontSize: 'var(--text-heading-m)', fontWeight: 500, color: 'var(--text-primary)' }}>
                  {title} Module
                </p>
                <p style={{ color: 'var(--text-secondary)', marginTop: 'var(--space-2)' }}>
                  Real-time updates and features are connected for your account.
                </p>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
