import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../i18n/LanguageContext';
import Sidebar from '../components/Sidebar';
import LanguageSwitcher from '../components/LanguageSwitcher';
import StatusBadge from '../components/StatusBadge';
import { 
  getEmergencyMessages, 
  updateEmergencyStatus, 
  sendParentNotification,
  archiveEmergencyMessage,
  getSOSHistory,
  logAdminAction
} from '../data/db';
import { busesDB, routesDB, driversDB, studentsDB } from '../data/mockData';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  AlertTriangle, Clock, MapPin, Bus, User, Send, Check, Eye, X, MessageSquare, 
  Trash2, Archive, History, Shield, Phone, CheckCircle, AlertCircle, Search, RefreshCw
} from 'lucide-react';
import './Admin.css';

export default function AdminSOS({ defaultTab = 'active' }) {
  const { user, logout } = useAuth();
  const { t } = useLanguage();
  
  const [activeTab, setActiveTab] = useState(defaultTab);
  const [messages, setMessages] = useState([]);
  const [historyMessages, setHistoryMessages] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Toast state
  const [toast, setToast] = useState(null);

  // Compose Message Modal state
  const [composeModalOpen, setComposeModalOpen] = useState(false);
  const [selectedEmergency, setSelectedEmergency] = useState(null);
  const [adminMessageInput, setAdminMessageInput] = useState('');

  // Delete Confirmation Modal state
  const [removeModalOpen, setRemoveModalOpen] = useState(false);
  const [sosToRemove, setSosToRemove] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const loadData = () => {
    setMessages(getEmergencyMessages());
    setHistoryMessages(getSOSHistory());
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleAcknowledge = (emergencyId) => {
    updateEmergencyStatus(emergencyId, 'UNDER REVIEW');
    logAdminAction(user?.id || 'ADMIN', user?.name || 'Admin', 'ACKNOWLEDGE_SOS', emergencyId, `Acknowledged SOS ${emergencyId}`);
    loadData();
    showToast("SOS Alert marked as Acknowledged (Under Review).", "info");
  };

  const handleResolve = (emergencyId) => {
    updateEmergencyStatus(emergencyId, 'RESOLVED');
    logAdminAction(user?.id || 'ADMIN', user?.name || 'Admin', 'RESOLVE_SOS', emergencyId, `Resolved SOS ${emergencyId}`);
    loadData();
    showToast("SOS Alert marked as Resolved.", "success");
  };

  const openRemoveModal = (emergency) => {
    setSosToRemove(emergency);
    setRemoveModalOpen(true);
  };

  const handleConfirmRemove = () => {
    if (!sosToRemove) return;
    try {
      const success = archiveEmergencyMessage(sosToRemove.emergencyId, user?.id || 'ADMIN', user?.name || 'Admin');
      if (success) {
        setRemoveModalOpen(false);
        setSosToRemove(null);
        loadData();
        showToast("SOS alert removed successfully.", "success");
      } else {
        showToast("Unable to remove SOS alert. Please try again.", "error");
      }
    } catch (err) {
      showToast("Unable to remove SOS alert. Please try again.", "error");
    }
  };

  const openComposeModal = (emergency) => {
    setSelectedEmergency(emergency);
    setAdminMessageInput('');
    setComposeModalOpen(true);
  };

  const handleSendToParents = () => {
    if (!adminMessageInput.trim()) return;

    sendParentNotification(
      selectedEmergency.emergencyId,
      selectedEmergency.busId,
      selectedEmergency.routeId,
      adminMessageInput.trim()
    );

    setComposeModalOpen(false);
    setSelectedEmergency(null);
    loadData();
    showToast("Official message sent to affected parents.", "success");
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'NEW':
        return <span className="badge badge-danger" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}><span className="pulse-dot-red"></span> Active SOS</span>;
      case 'UNDER REVIEW':
        return <span className="badge badge-warning" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>Acknowledged</span>;
      case 'PARENT NOTIFIED':
        return <span className="badge badge-info" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>Parents Notified</span>;
      case 'RESOLVED':
        return <span className="badge badge-success" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>Resolved</span>;
      default:
        return <span className="badge badge-neutral">{status}</span>;
    }
  };

  const activeCount = messages.filter(m => m.status === 'NEW').length;
  const reviewCount = messages.filter(m => m.status === 'UNDER REVIEW' || m.status === 'PARENT NOTIFIED').length;
  const resolvedCount = messages.filter(m => m.status === 'RESOLVED').length;

  const filteredHistory = historyMessages.filter(h => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    const bus = busesDB.find(b => b.busId === h.busId);
    const driver = driversDB.find(d => d.driverId === h.driverId);
    return (
      h.emergencyId?.toLowerCase().includes(q) ||
      driver?.name?.toLowerCase().includes(q) ||
      bus?.busNumber?.toLowerCase().includes(q) ||
      h.location?.toLowerCase().includes(q) ||
      h.driverMessage?.toLowerCase().includes(q)
    );
  });

  return (
    <>
      <Sidebar onLogout={logout} />

      <div className="admin-page" style={{ marginLeft: 'var(--sidebar-w)', minHeight: '100vh', padding: 'var(--space-8)', background: 'var(--bg-primary)' }}>
        {/* Toast Notification */}
        <AnimatePresence>
          {toast && (
            <motion.div
              initial={{ opacity: 0, y: -20, x: 20 }}
              animate={{ opacity: 1, y: 0, x: 0 }}
              exit={{ opacity: 0, y: -20 }}
              style={{
                position: 'fixed',
                top: '24px',
                right: '24px',
                zIndex: 2000,
                background: toast.type === 'error' ? 'var(--danger-muted)' : toast.type === 'info' ? 'var(--accent-muted)' : 'rgba(34, 197, 94, 0.15)',
                border: `1px solid ${toast.type === 'error' ? 'var(--danger)' : toast.type === 'info' ? 'var(--accent)' : 'var(--success)'}`,
                color: toast.type === 'error' ? 'var(--danger)' : toast.type === 'info' ? 'var(--accent)' : 'var(--success)',
                padding: '12px 20px',
                borderRadius: 'var(--radius-md)',
                boxShadow: 'var(--shadow-lg)',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                fontWeight: 500
              }}
            >
              {toast.type === 'error' ? <AlertCircle size={18} /> : <CheckCircle size={18} />}
              <span>{toast.message}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Page Header */}
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-6)' }}>
          <div>
            <p className="eyebrow" style={{ color: 'var(--text-secondary)' }}>{t('adminDashboard')}</p>
            <h1 style={{ color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 'var(--space-3)', margin: 'var(--space-2) 0 0 0' }}>
              <AlertTriangle color="var(--danger)" size={28} />
              SOS Alert Management Center
            </h1>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
            <LanguageSwitcher />
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
              <div style={{
                width: '40px', height: '40px', borderRadius: '50%',
                background: 'var(--accent-muted)', color: 'var(--accent)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 700, border: '1px solid var(--border)'
              }}>
                {(user?.name || 'A').charAt(0).toUpperCase()}
              </div>
              <div>
                <div style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{user?.name || 'Admin'}</div>
                <div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>{t('roleAdmin')}</div>
              </div>
            </div>
          </div>
        </header>

        {/* Stat Summary Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 'var(--space-4)', marginBottom: 'var(--space-6)' }}>
          <div className="card" style={{ padding: 'var(--space-5)', borderLeft: '4px solid var(--danger)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Active SOS</div>
                <div style={{ fontSize: '1.875rem', fontWeight: 700, color: 'var(--danger)', marginTop: '4px' }}>{activeCount}</div>
              </div>
              <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: 'rgba(239, 68, 68, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--danger)' }}>
                <AlertTriangle size={22} />
              </div>
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginTop: '8px' }}>Requires immediate attention</div>
          </div>

          <div className="card" style={{ padding: 'var(--space-5)', borderLeft: '4px solid var(--warning)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Acknowledged</div>
                <div style={{ fontSize: '1.875rem', fontWeight: 700, color: 'var(--warning)', marginTop: '4px' }}>{reviewCount}</div>
              </div>
              <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: 'rgba(245, 158, 11, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--warning)' }}>
                <Eye size={22} />
              </div>
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginTop: '8px' }}>Under review by admin</div>
          </div>

          <div className="card" style={{ padding: 'var(--space-5)', borderLeft: '4px solid var(--success)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Resolved Today</div>
                <div style={{ fontSize: '1.875rem', fontWeight: 700, color: 'var(--success)', marginTop: '4px' }}>{resolvedCount}</div>
              </div>
              <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: 'rgba(34, 197, 94, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--success)' }}>
                <CheckCircle size={22} />
              </div>
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginTop: '8px' }}>Emergency handled successfully</div>
          </div>

          <div className="card" style={{ padding: 'var(--space-5)', borderLeft: '4px solid var(--accent)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Total Archived</div>
                <div style={{ fontSize: '1.875rem', fontWeight: 700, color: 'var(--accent)', marginTop: '4px' }}>{historyMessages.length}</div>
              </div>
              <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: 'var(--accent-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent)' }}>
                <Archive size={22} />
              </div>
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginTop: '8px' }}>Stored in SOS History</div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)', marginBottom: 'var(--space-6)' }}>
          <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
            <button
              onClick={() => setActiveTab('active')}
              style={{
                padding: '12px 24px',
                background: 'none',
                border: 'none',
                borderBottom: activeTab === 'active' ? '3px solid var(--accent)' : '3px solid transparent',
                color: activeTab === 'active' ? 'var(--accent)' : 'var(--text-secondary)',
                fontWeight: activeTab === 'active' ? 600 : 400,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '0.95rem'
              }}
            >
              <AlertTriangle size={18} /> Active SOS Alerts ({messages.length})
            </button>
            <button
              onClick={() => setActiveTab('history')}
              style={{
                padding: '12px 24px',
                background: 'none',
                border: 'none',
                borderBottom: activeTab === 'history' ? '3px solid var(--accent)' : '3px solid transparent',
                color: activeTab === 'history' ? 'var(--accent)' : 'var(--text-secondary)',
                fontWeight: activeTab === 'history' ? 600 : 400,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '0.95rem'
              }}
            >
              <History size={18} /> SOS History / Archived ({historyMessages.length})
            </button>
          </div>

          <button 
            className="btn btn-secondary btn-sm" 
            onClick={loadData}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}
          >
            <RefreshCw size={14} /> Refresh
          </button>
        </div>

        {/* TAB 1: ACTIVE ALERTS */}
        {activeTab === 'active' && (
          <div style={{ maxWidth: '1200px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
              <AnimatePresence>
                {messages.map(msg => {
                  const bus = busesDB.find(b => b.busId === msg.busId);
                  const route = routesDB.find(r => r.routeId === msg.routeId);
                  const driver = driversDB.find(d => d.driverId === msg.driverId);
                  const createdDate = new Date(msg.createdAt);

                  return (
                    <motion.div
                      key={msg.emergencyId}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      layout
                      className="card"
                      style={{ 
                        padding: 'var(--space-6)',
                        borderLeft: `4px solid ${
                          msg.status === 'NEW' ? 'var(--danger)' : 
                          msg.status === 'UNDER REVIEW' ? 'var(--warning)' : 
                          msg.status === 'PARENT NOTIFIED' ? 'var(--accent)' : 'var(--success)'
                        }`,
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 'var(--space-4)'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '12px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                          <span style={{ fontWeight: 700, color: 'var(--text-primary)', background: 'var(--bg-elevated)', padding: '4px 10px', borderRadius: '4px', fontSize: '0.85rem' }}>
                            {msg.emergencyId}
                          </span>
                          <Clock size={16} color="var(--text-tertiary)" />
                          <span style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                            {createdDate.toLocaleDateString()} at {createdDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                          {getStatusBadge(msg.status)}
                          <button
                            className="btn btn-danger btn-sm"
                            onClick={() => openRemoveModal(msg)}
                            style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '4px 12px', fontSize: '0.8rem' }}
                            title="Remove SOS Alert"
                          >
                            <Trash2 size={14} /> Remove
                          </button>
                        </div>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 'var(--space-6)' }}>
                        <div>
                          <div style={{ color: 'var(--text-tertiary)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>Driver Details</div>
                          <div style={{ color: 'var(--text-primary)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <User size={16} color="var(--accent)" /> {driver?.name || 'Rahul Sharma'}
                          </div>
                          <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '2px' }}>ID: {msg.driverId || 'DRV001'}</div>
                          <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Phone size={12} /> {driver?.phone || '+91 98123 45678'}
                          </div>
                        </div>

                        <div>
                          <div style={{ color: 'var(--text-tertiary)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>Bus & Route</div>
                          <div style={{ color: 'var(--text-primary)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <Bus size={16} color="var(--accent)" /> {bus?.busNumber || 'BUS-01'}
                          </div>
                          <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '2px' }}>Reg: {bus?.registrationNumber || 'UP85 AB 1234'}</div>
                          <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '2px' }}>Route: {route?.routeName || 'GLA -> Mathura'}</div>
                        </div>

                        <div>
                          <div style={{ color: 'var(--text-tertiary)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>Current Location</div>
                          <div style={{ color: 'var(--text-primary)', fontWeight: 500, display: 'flex', alignItems: 'flex-start', gap: '6px' }}>
                            <MapPin size={16} color="var(--danger)" style={{ flexShrink: 0, marginTop: '2px' }} />
                            <span>{msg.location}</span>
                          </div>
                        </div>
                      </div>

                      <div style={{ 
                        background: 'var(--bg-elevated)', 
                        padding: 'var(--space-4)', 
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid var(--border)' 
                      }}>
                        <div style={{ color: 'var(--text-tertiary)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <MessageSquare size={14} /> SOS Reason / Message
                        </div>
                        <div style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{msg.driverMessage}</div>
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'var(--space-2)' }}>
                        <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
                          {msg.status === 'NEW' && (
                            <button className="btn btn-primary btn-sm" onClick={() => handleAcknowledge(msg.emergencyId)} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <Eye size={16} /> Acknowledge Alert
                            </button>
                          )}
                          {(msg.status === 'UNDER REVIEW' || msg.status === 'PARENT NOTIFIED') && (
                            <button className="btn btn-secondary btn-sm" onClick={() => openComposeModal(msg)} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <Send size={16} /> Update Parents
                            </button>
                          )}
                          {msg.status !== 'RESOLVED' && (
                            <button className="btn btn-success btn-sm" onClick={() => handleResolve(msg.emergencyId)} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <Check size={16} /> Mark Resolved
                            </button>
                          )}
                        </div>

                        <button
                          className="btn btn-ghost btn-sm text-danger"
                          onClick={() => openRemoveModal(msg)}
                          style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                        >
                          <Trash2 size={14} /> Remove SOS
                        </button>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>

              {messages.length === 0 && (
                <div className="card" style={{ padding: 'var(--space-12)', textAlign: 'center' }}>
                  <CheckCircle size={56} color="var(--success)" style={{ margin: '0 auto var(--space-4)', opacity: 0.8 }} />
                  <h3 style={{ color: 'var(--text-primary)', marginBottom: 'var(--space-2)' }}>All Clear</h3>
                  <p style={{ color: 'var(--text-secondary)' }}>No active emergency SOS alerts at this time.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: SOS HISTORY / ARCHIVED */}
        {activeTab === 'history' && (
          <div style={{ maxWidth: '1200px' }}>
            <div style={{ marginBottom: 'var(--space-4)', display: 'flex', gap: 'var(--space-4)' }}>
              <div style={{ position: 'relative', flex: 1 }}>
                <Search size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
                <input
                  type="text"
                  className="input"
                  placeholder="Search SOS History by ID, Driver, Bus, Location or Message..."
                  style={{ paddingLeft: '42px' }}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>SOS ID</th>
                    <th>Date & Time</th>
                    <th>Driver Details</th>
                    <th>Bus & Route</th>
                    <th>Location</th>
                    <th>Reason / Message</th>
                    <th>Status</th>
                    <th>Archived By</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredHistory.map((item) => {
                    const bus = busesDB.find(b => b.busId === item.busId);
                    const driver = driversDB.find(d => d.driverId === item.driverId);
                    const route = routesDB.find(r => r.routeId === item.routeId);
                    const createdDate = new Date(item.createdAt);

                    return (
                      <tr key={item.emergencyId}>
                        <td>
                          <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{item.emergencyId}</span>
                        </td>
                        <td>
                          <div style={{ color: 'var(--text-primary)', fontSize: '0.85rem' }}>{createdDate.toLocaleDateString()}</div>
                          <div style={{ color: 'var(--text-tertiary)', fontSize: '0.75rem' }}>{createdDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                        </td>
                        <td>
                          <div style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{driver?.name || 'Driver'}</div>
                          <div style={{ color: 'var(--text-tertiary)', fontSize: '0.75rem' }}>ID: {item.driverId}</div>
                        </td>
                        <td>
                          <div style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{bus?.busNumber || item.busId}</div>
                          <div style={{ color: 'var(--text-tertiary)', fontSize: '0.75rem' }}>{route?.routeName || item.routeId}</div>
                        </td>
                        <td style={{ color: 'var(--text-secondary)', maxWidth: '160px' }} className="truncate">
                          {item.location}
                        </td>
                        <td style={{ color: 'var(--text-primary)', maxWidth: '220px' }} className="truncate">
                          {item.driverMessage}
                        </td>
                        <td>
                          {getStatusBadge(item.status)}
                        </td>
                        <td>
                          <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>{item.archivedBy || 'Admin'}</div>
                          <div style={{ color: 'var(--text-tertiary)', fontSize: '0.7rem' }}>
                            {item.archivedAt ? new Date(item.archivedAt).toLocaleDateString() : '-'}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  {filteredHistory.length === 0 && (
                    <tr>
                      <td colSpan={8} style={{ textAlign: 'center', padding: 'var(--space-8)', color: 'var(--text-tertiary)' }}>
                        No SOS history records found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* REMOVE SOS CONFIRMATION MODAL */}
      <AnimatePresence>
        {removeModalOpen && sosToRemove && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="modal-overlay"
            style={{
              position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
              backgroundColor: 'rgba(0,0,0,0.75)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              zIndex: 2000, padding: 'var(--space-4)',
              backdropFilter: 'blur(6px)'
            }}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="modal-content card"
              style={{
                padding: 'var(--space-6)',
                width: '100%',
                maxWidth: '520px',
                borderTop: '4px solid var(--danger)',
                display: 'flex',
                flexDirection: 'column',
                gap: 'var(--space-5)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--space-4)' }}>
                <div style={{
                  width: '48px', height: '48px', borderRadius: '50%',
                  background: 'rgba(239, 68, 68, 0.15)', color: 'var(--danger)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0
                }}>
                  <AlertTriangle size={24} />
                </div>
                <div>
                  <h2 style={{ color: 'var(--text-primary)', margin: 0, fontSize: '1.25rem' }}>Remove SOS Alert</h2>
                  <p style={{ color: 'var(--text-secondary)', marginTop: '8px', fontSize: '0.9rem', lineHeight: '1.5' }}>
                    Are you sure you want to remove this SOS alert? This action will remove the alert from the active SOS list but will not delete the driver's, bus's, route's or student's information.
                  </p>
                </div>
              </div>

              <div style={{
                background: 'var(--bg-elevated)',
                padding: 'var(--space-3) var(--space-4)',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.85rem',
                border: '1px solid var(--border)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                  <span>SOS ID: <strong>{sosToRemove.emergencyId}</strong></span>
                  <span>Location: <strong>{sosToRemove.location}</strong></span>
                </div>
                <div style={{ color: 'var(--text-primary)' }}>Message: "{sosToRemove.driverMessage}"</div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-3)', marginTop: 'var(--space-2)' }}>
                <button
                  className="btn btn-secondary"
                  onClick={() => setRemoveModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  className="btn btn-danger"
                  onClick={handleConfirmRemove}
                  style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  <Trash2 size={16} /> Remove SOS
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* COMPOSE MESSAGE TO PARENTS MODAL */}
      <AnimatePresence>
        {composeModalOpen && selectedEmergency && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="modal-overlay"
            style={{
              position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
              backgroundColor: 'rgba(0,0,0,0.75)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              zIndex: 2000, padding: 'var(--space-4)'
            }}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="modal-content card"
              style={{
                padding: 'var(--space-8)',
                width: '100%',
                maxWidth: '600px',
                display: 'flex',
                flexDirection: 'column',
                gap: 'var(--space-6)'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2 style={{ color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 'var(--space-2)', margin: 0 }}>
                  <Send size={24} color="var(--accent)" /> Send Update to Parents
                </h2>
                <button
                  onClick={() => setComposeModalOpen(false)}
                  style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: 'var(--space-2)' }}
                >
                  <X size={24} />
                </button>
              </div>

              <div style={{
                padding: 'var(--space-4)',
                backgroundColor: 'var(--bg-surface)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border)',
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: 'var(--space-4)'
              }}>
                <div>
                  <div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Affected Bus</div>
                  <div style={{ color: 'var(--text-primary)', fontWeight: 500 }}>
                    {busesDB.find(b => b.busId === selectedEmergency.busId)?.busNumber}
                  </div>
                </div>
                <div>
                  <div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Affected Route</div>
                  <div style={{ color: 'var(--text-primary)', fontWeight: 500 }}>
                    {routesDB.find(r => r.routeId === selectedEmergency.routeId)?.routeName}
                  </div>
                </div>
                <div>
                  <div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Affected Students</div>
                  <div style={{ color: 'var(--text-primary)', fontWeight: 500 }}>
                    {studentsDB.filter(s => s.busId === selectedEmergency.busId).length}
                  </div>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', color: 'var(--text-primary)', fontWeight: 500, marginBottom: 'var(--space-3)' }}>
                  Official Message
                </label>
                <textarea
                  rows={5}
                  style={{
                    width: '100%',
                    padding: 'var(--space-4)',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border)',
                    background: 'var(--bg-surface)',
                    color: 'var(--text-primary)',
                    resize: 'vertical',
                    fontFamily: 'inherit'
                  }}
                  placeholder="E.g., Dear Parents, Bus BUS-01 has broken down at Krishna Nagar. We have arranged another bus..."
                  value={adminMessageInput}
                  onChange={(e) => setAdminMessageInput(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-3)', marginTop: 'var(--space-2)' }}>
                <button className="btn btn-secondary" onClick={() => setComposeModalOpen(false)}>
                  Cancel
                </button>
                <button className="btn btn-primary" onClick={handleSendToParents} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                  <Send size={16} /> Send to Affected Parents
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
