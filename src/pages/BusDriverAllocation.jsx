import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../i18n/LanguageContext';
import Sidebar from '../components/Sidebar';
import LanguageSwitcher from '../components/LanguageSwitcher';
import StatusBadge from '../components/StatusBadge';
import { Bus, UserSquare, AlertCircle, ShieldAlert, Search, Filter, Edit, Trash2, KeyRound, ArrowRight } from 'lucide-react';
import { buses as initialBuses } from '../data/mockData';
import './Admin.css';
import '../components/DataTable.css';

const PremiumStatCard = ({ title, value, icon, isWarning }) => (
  <motion.div 
    whileHover={{ y: -5 }}
    className="card"
    style={{ 
      background: 'var(--bg-surface, #1a1a1a)', 
      padding: '1.5rem', 
      borderRadius: '16px', 
      border: `1px solid ${isWarning ? '#ff4d4f' : 'var(--border-color, #333)'}`,
      display: 'flex',
      alignItems: 'center',
      gap: '1.5rem',
      position: 'relative',
      overflow: 'hidden'
    }}
  >
    <div style={{ 
      background: isWarning ? 'rgba(255, 77, 79, 0.1)' : 'rgba(0, 112, 243, 0.1)', 
      color: isWarning ? '#ff4d4f' : 'var(--accent, #0070f3)',
      padding: '1rem',
      borderRadius: '12px'
    }}>
      {icon}
    </div>
    <div>
      <p style={{ margin: 0, color: 'var(--text-secondary, #888)', fontSize: '0.9rem', fontWeight: 500 }}>{title}</p>
      <h3 style={{ margin: 0, color: '#fff', fontSize: '1.8rem', fontWeight: 700 }}>{value}</h3>
    </div>
  </motion.div>
);

export default function BusDriverAllocation() {
  const { user, logout } = useAuth();
  const { t } = useLanguage();
  const [buses, setBuses] = useState(initialBuses);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');

  // Dashboard Stats
  const totalBuses = buses.length;
  const assignedBuses = buses.filter(b => b.driver).length;
  const unassignedBuses = buses.filter(b => !b.driver).length;
  const activeDrivers = new Set(buses.filter(b => b.driver && b.status === 'Active').map(b => b.driverId)).size;

  // Handlers for Admin Actions
  const handleAssign = (busId) => {
    alert(`Assign Driver/Bus dialog for ${busId} would open here.`);
  };

  const handleResetPassword = (driverName) => {
    if(window.confirm(`Are you sure you want to reset the portal password for ${driverName}?`)) {
      alert(`Password reset link sent for ${driverName}`);
    }
  };

  const handleUnassign = (busId) => {
    if(window.confirm('Are you sure you want to unassign this driver?')) {
      setBuses(buses.map(b => b.id === busId ? { 
        ...b, 
        driver: null, 
        driverId: null, 
        phone: null, 
        password: null, 
        status: 'Unassigned' 
      } : b));
    }
  };

  const filteredBuses = useMemo(() => {
    return buses.filter(b => {
      const matchSearch = (b.number?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                           b.driver?.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchStatus = filterStatus === 'All' || b.status === filterStatus;
      return matchSearch && matchStatus;
    });
  }, [buses, searchTerm, filterStatus]);

  return (
    <>
      <Sidebar onLogout={logout} />
      <div 
        className="admin-page" 
        style={{ 
          marginLeft: 'var(--sidebar-w, 280px)', 
          minHeight: '100vh', 
          padding: 'var(--space-8, 2rem)', 
          background: 'var(--bg-primary, #0a0a0a)' 
        }}
      >
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
          <div>
            <p style={{ color: 'var(--accent)', textTransform: 'uppercase', fontSize: '0.85rem', letterSpacing: '0.05em', marginBottom: '0.5rem', fontWeight: 600 }}>
              {t('adminDashboard') || 'Fleet overview'}
            </p>
            <h1 style={{ fontSize: '2.5rem', fontWeight: 700, margin: 0, color: '#fff', letterSpacing: '-0.02em' }}>
              Bus & Driver Allocation
            </h1>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
            <LanguageSwitcher />
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '1rem', 
              background: 'var(--bg-surface)', 
              padding: '0.5rem 1rem', 
              borderRadius: '50px', 
              border: '1px solid var(--border-color)' 
            }}>
              <div style={{ 
                width: '36px', 
                height: '36px', 
                borderRadius: '50%', 
                background: 'var(--accent)', 
                color: '#000', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                fontWeight: 600, 
                fontSize: '1.1rem' 
              }}>
                {(user?.name || '?').charAt(0).toUpperCase()}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontWeight: 500, fontSize: '0.95rem', color: '#fff' }}>{user?.name}</span>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{t('roleAdmin')}</span>
              </div>
            </div>
          </div>
        </header>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
          <PremiumStatCard title="Total Buses" value={totalBuses} icon={<Bus size={24} />} />
          <PremiumStatCard title="Assigned Buses" value={assignedBuses} icon={<UserSquare size={24} />} />
          <PremiumStatCard title="Unassigned Buses" value={unassignedBuses} icon={<AlertCircle size={24} />} isWarning={unassignedBuses > 0} />
          <PremiumStatCard title="Active Drivers" value={activeDrivers} icon={<ShieldAlert size={24} />} />
        </div>

        <div className="card" style={{ 
          background: 'var(--bg-surface)', 
          padding: '1.5rem', 
          borderRadius: '16px', 
          border: '1px solid var(--border-color)', 
          marginBottom: '1.5rem', 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem'
        }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#fff', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            Detailed Allocation
          </h2>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <div style={{ position: 'relative' }}>
              <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
              <input 
                type="text" 
                placeholder="Search bus or driver..." 
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                style={{ 
                  background: 'var(--bg-primary)', 
                  border: '1px solid var(--border-color)', 
                  color: '#fff',
                  padding: '10px 16px 10px 40px',
                  borderRadius: '8px',
                  outline: 'none',
                  minWidth: '260px',
                  transition: 'border-color 0.2s'
                }}
              />
            </div>
            <div style={{ position: 'relative' }}>
              <Filter size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
              <select 
                value={filterStatus} 
                onChange={e => setFilterStatus(e.target.value)}
                style={{ 
                  background: 'var(--bg-primary)', 
                  border: '1px solid var(--border-color)', 
                  color: '#fff',
                  padding: '10px 16px 10px 40px',
                  borderRadius: '8px',
                  outline: 'none',
                  appearance: 'none',
                  cursor: 'pointer',
                  minWidth: '160px'
                }}
              >
                <option value="All">All Status</option>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
                <option value="Unassigned">Unassigned</option>
              </select>
            </div>
          </div>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card" 
          style={{ 
            background: 'var(--bg-surface)', 
            borderRadius: '16px', 
            border: '1px solid var(--border-color)', 
            overflow: 'hidden' 
          }}
        >
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead style={{ background: 'rgba(0,0,0,0.2)', borderBottom: '1px solid var(--border-color)' }}>
                <tr>
                  <th style={{ padding: '1rem 1.5rem', color: 'var(--text-secondary)', fontWeight: 500, fontSize: '0.85rem' }}>Bus & Reg</th>
                  <th style={{ padding: '1rem 1.5rem', color: 'var(--text-secondary)', fontWeight: 500, fontSize: '0.85rem' }}>Route</th>
                  <th style={{ padding: '1rem 1.5rem', color: 'var(--text-secondary)', fontWeight: 500, fontSize: '0.85rem' }}>Driver Info</th>
                  <th style={{ padding: '1rem 1.5rem', color: 'var(--text-secondary)', fontWeight: 500, fontSize: '0.85rem' }}>Security</th>
                  <th style={{ padding: '1rem 1.5rem', color: 'var(--text-secondary)', fontWeight: 500, fontSize: '0.85rem' }}>Status</th>
                  <th style={{ padding: '1rem 1.5rem', color: 'var(--text-secondary)', fontWeight: 500, fontSize: '0.85rem', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredBuses.map((b, i) => (
                  <motion.tr 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.05 }}
                    key={b.id}
                    style={{ borderBottom: '1px solid var(--border-color)' }}
                  >
                    <td style={{ padding: '1.25rem 1.5rem' }}>
                      <div style={{ color: '#fff', fontWeight: 600, fontSize: '1rem' }}>{b.number}</div>
                      <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', fontFamily: 'monospace' }}>{b.registration}</div>
                    </td>
                    <td style={{ padding: '1.25rem 1.5rem' }}>
                      <div style={{ color: '#fff' }}>{b.route}</div>
                      <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        {b.startPoint} <ArrowRight size={12} /> {b.endPoint}
                      </div>
                    </td>
                    <td style={{ padding: '1.25rem 1.5rem' }}>
                      {b.driver ? (
                        <>
                          <div style={{ color: '#fff', fontWeight: 500 }}>{b.driver}</div>
                          <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>ID: {b.driverId} • {b.phone}</div>
                        </>
                      ) : (
                        <span style={{ color: 'var(--text-secondary)', fontStyle: 'italic' }}>No Driver Assigned</span>
                      )}
                    </td>
                    <td style={{ padding: '1.25rem 1.5rem' }}>
                      {b.password ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                          <KeyRound size={14} /> ••••••••
                        </div>
                      ) : '-'}
                    </td>
                    <td style={{ padding: '1.25rem 1.5rem' }}>
                      <StatusBadge status={b.status} />
                    </td>
                    <td style={{ padding: '1.25rem 1.5rem', textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                        <button 
                          onClick={() => handleAssign(b.id)}
                          style={{ 
                            background: b.driver ? 'transparent' : 'var(--accent)', 
                            color: b.driver ? 'var(--text-secondary)' : '#000',
                            border: b.driver ? '1px solid var(--border-color)' : 'none',
                            padding: '6px 12px',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            fontWeight: b.driver ? 500 : 600,
                            fontSize: '0.85rem',
                            transition: 'all 0.2s'
                          }}
                        >
                          <Edit size={14} /> {b.driver ? 'Edit' : 'Assign'}
                        </button>
                        {b.driver && (
                          <>
                            <button 
                              onClick={() => handleResetPassword(b.driver)}
                              title="Reset Password"
                              style={{ 
                                background: 'transparent',
                                color: 'var(--text-secondary)',
                                border: '1px solid var(--border-color)',
                                padding: '6px',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                transition: 'all 0.2s'
                              }}
                            >
                              <KeyRound size={16} />
                            </button>
                            <button 
                              onClick={() => handleUnassign(b.id)}
                              title="Unassign Driver"
                              style={{ 
                                background: 'rgba(255, 77, 79, 0.1)',
                                color: '#ff4d4f',
                                border: '1px solid rgba(255, 77, 79, 0.2)',
                                padding: '6px',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                transition: 'all 0.2s'
                              }}
                            >
                              <Trash2 size={16} />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </motion.tr>
                ))}
                {filteredBuses.length === 0 && (
                  <tr>
                    <td colSpan="6" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
                      <AlertCircle size={48} style={{ opacity: 0.2, margin: '0 auto 1rem' }} />
                      <p>No allocations found matching your search.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>
    </>
  );
}
