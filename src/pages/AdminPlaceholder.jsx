import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../i18n/LanguageContext';
import Sidebar from '../components/Sidebar';
import TopNav from '../components/TopNav';
import LiveRouteMap from '../components/LiveRouteMap';
import { Map } from 'lucide-react';

export default function AdminPlaceholder({ titleKey, showMap = false }) {
  const { user, logout } = useAuth();
  const { t } = useLanguage();

  return (
    <div style={{ display: 'flex' }}>
      <Sidebar onLogout={logout} />
      <div style={{ flex: 1, marginLeft: 'var(--sidebar-w)', display: 'flex', flexDirection: 'column', minHeight: '100vh', background: 'var(--bg-primary)' }}>
        <TopNav name={user?.name} roleLabel={t('roleAdmin')} onLogout={logout} />
        
        <main style={{ padding: 'var(--space-8)', flex: 1 }}>
          <header style={{ marginBottom: 'var(--space-8)' }}>
            <p className="eyebrow">{t('appName')}</p>
            <h1 style={{ fontSize: 'var(--text-heading-xl)', fontWeight: 600, color: 'var(--text-primary)' }}>
              {t(titleKey)}
            </h1>
          </header>

          <div className="container" style={{ maxWidth: 'var(--max-w)', margin: 0, padding: 0 }}>
            {showMap ? (
              <div className="card" style={{ padding: 'var(--space-2)' }}>
                <LiveRouteMap variant="card" speed={38} />
              </div>
            ) : (
              <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '120px 20px', textAlign: 'center' }}>
                <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'var(--bg-surface-hover)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 'var(--space-4)', color: 'var(--text-tertiary)' }}>
                  <Map size={32} />
                </div>
                <p style={{ fontSize: 'var(--text-heading-m)', fontWeight: 500, color: 'var(--text-primary)' }}>
                  {t('comingSoon') || 'This section is coming soon'}
                </p>
                <p style={{ color: 'var(--text-secondary)', marginTop: 'var(--space-2)' }}>
                  We're working on bringing this feature to WheelBuddy.
                </p>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
