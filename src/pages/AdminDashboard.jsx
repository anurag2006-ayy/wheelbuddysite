import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../i18n/LanguageContext';
import Sidebar from '../components/Sidebar';
import StatCard from '../components/StatCard';
import StatusBadge from '../components/StatusBadge';
import DataTable from '../components/DataTable';
import LanguageSwitcher from '../components/LanguageSwitcher';
import { IconBus, IconSpeed, IconClock, IconBrake } from '../components/Icons';
import { buses, fleetSummary } from '../data/mockData';
import { getDriverMessages, markDriverMessageAsRead } from '../data/db';
import './Admin.css';

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const { t } = useLanguage();
  const [driverMessages, setDriverMessages] = useState([]);
  const [typeFilter, setTypeFilter] = useState('all');
  const [driverFilter, setDriverFilter] = useState('all');
  const [busFilter, setBusFilter] = useState('all');
  const [routeFilter, setRouteFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('');

  const currentDate = new Date().toLocaleDateString('en-US', { 
    weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' 
  });

  useEffect(() => {
    const refreshMessages = () => {
      setDriverMessages(
        [...getDriverMessages()].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      );
    };

    refreshMessages();
    const interval = setInterval(refreshMessages, 1500);
    return () => clearInterval(interval);
  }, []);

  const filteredMessages = useMemo(() => {
    return driverMessages.filter((message) => {
      const matchesType = typeFilter === 'all' || message.type === typeFilter;
      const matchesDriver = driverFilter === 'all' || message.driverName?.toLowerCase() === driverFilter.toLowerCase();
      const matchesBus = busFilter === 'all' || message.busNumber?.toLowerCase() === busFilter.toLowerCase();
      const matchesRoute = routeFilter === 'all' || message.routeName?.toLowerCase() === routeFilter.toLowerCase();
      const matchesDate = !dateFilter || new Date(message.createdAt).toISOString().slice(0, 10) === dateFilter;
      return matchesType && matchesDriver && matchesBus && matchesRoute && matchesDate;
    });
  }, [driverMessages, typeFilter, driverFilter, busFilter, routeFilter, dateFilter]);

  const unreadCount = driverMessages.filter((message) => message.status === 'UNREAD').length;

  const uniqueDrivers = [...new Set(driverMessages.map((message) => message.driverName).filter(Boolean))];
  const uniqueBuses = [...new Set(driverMessages.map((message) => message.busNumber).filter(Boolean))];
  const uniqueRoutes = [...new Set(driverMessages.map((message) => message.routeName).filter(Boolean))];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  const formatTime = (iso) => {
    const date = new Date(iso);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (iso) => {
    const date = new Date(iso);
    return date.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const handleMessageOpen = (messageId) => {
    const updated = markDriverMessageAsRead(messageId);
    setDriverMessages(
      updated.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    );
  };

  return (
    <div className="admin-page">
      <Sidebar onLogout={logout} />

      <div className="admin-content">
        <header className="admin-header">
          <div className="admin-greeting">
            <h1>Good morning, {user?.name || 'Admin'}.</h1>
            <p>{currentDate}</p>
          </div>
          <div className="admin-topbar-right">
            <LanguageSwitcher />
            <div className="topnav-user">
              <span className="topnav-avatar">{(user?.name || '?').charAt(0).toUpperCase()}</span>
              <div className="topnav-user-text">
                <span className="topnav-user-name">{user?.name}</span>
                <span className="topnav-user-role">{t('roleAdmin') || 'Admin'}</span>
              </div>
            </div>
          </div>
        </header>

        <motion.div 
          className="admin-body"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div className="admin-stats" variants={itemVariants}>
            <StatCard icon={IconBus} label={t('totalBuses') || 'Total Buses'} value={fleetSummary.activeBuses} suffix={`/ ${fleetSummary.totalBuses}`} />
            <StatCard icon={IconSpeed} label={t('avgFleetSpeed') || 'Avg Speed'} value={fleetSummary.avgFleetSpeed} suffix="km/h" />
            <StatCard icon={IconClock} label={t('delaysToday') || 'Delays Today'} value={fleetSummary.delayCount} tone="warning" />
            <StatCard icon={IconBrake} label={t('harshBraking') || 'Harsh Braking'} value={fleetSummary.harshBrakingCount} tone="danger" />
          </motion.div>

          <motion.div variants={itemVariants}>
            <div className="admin-section-head">
              <h2 className="admin-section-title">{t('activeBuses') || 'Active Buses'}</h2>
            </div>
            
            <div className="admin-grid">
              {buses.map((b) => (
                <motion.div key={b.id} className="bus-card" whileHover={{ y: -2 }}>
                  <div className="bus-card-header">
                    <span className="bus-card-number">{b.number}</span>
                    <StatusBadge status={b.status} />
                  </div>
                  <div className="bus-card-info">
                    <span>{b.route}</span>
                    <span className="text-muted">{b.driver}</span>
                  </div>
                  <div className="bus-card-footer">
                    <span className="data-table-mono">{b.avgSpeed} km/h</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          <motion.div variants={itemVariants} className="admin-section-block admin-driver-message-section">
            <div className="admin-section-head admin-message-head">
              <div>
                <h2 className="admin-section-title">Driver Messages / Communications</h2>
                <p className="text-muted">Unified message history for text and voice updates</p>
              </div>
              <span className="admin-message-badge">{unreadCount} unread</span>
            </div>

            <div className="admin-message-filters">
              <select value={typeFilter} onChange={(event) => setTypeFilter(event.target.value)}>
                <option value="all">All</option>
                <option value="text">Text Messages</option>
                <option value="voice">Voice Messages</option>
              </select>
              <select value={driverFilter} onChange={(event) => setDriverFilter(event.target.value)}>
                <option value="all">Driver</option>
                {uniqueDrivers.map((driver) => (
                  <option key={driver} value={driver}>{driver}</option>
                ))}
              </select>
              <select value={busFilter} onChange={(event) => setBusFilter(event.target.value)}>
                <option value="all">Bus</option>
                {uniqueBuses.map((bus) => (
                  <option key={bus} value={bus}>{bus}</option>
                ))}
              </select>
              <select value={routeFilter} onChange={(event) => setRouteFilter(event.target.value)}>
                <option value="all">Route</option>
                {uniqueRoutes.map((route) => (
                  <option key={route} value={route}>{route}</option>
                ))}
              </select>
              <input
                type="date"
                value={dateFilter}
                onChange={(event) => setDateFilter(event.target.value)}
                aria-label="Filter by date"
              />
            </div>

            <div className="admin-message-list">
              {filteredMessages.length === 0 ? (
                <div className="admin-empty-message">No driver messages match the current filters.</div>
              ) : (
                filteredMessages.map((message) => (
                  <div
                    key={message.id}
                    className={`admin-message-item ${message.status === 'UNREAD' ? 'unread' : ''}`}
                    onClick={() => handleMessageOpen(message.id)}
                  >
                    <div className="admin-message-topline">
                      <span className="admin-message-time">{formatTime(message.createdAt)}</span>
                      <span className={`admin-message-type ${message.type === 'voice' ? 'voice' : 'text'}`}>
                        {message.type === 'voice' ? '🎙️ Voice' : '⌨️ Text'}
                      </span>
                      <span className={`admin-message-status ${message.status === 'UNREAD' ? 'unread' : 'read'}`}>
                        {message.status}
                      </span>
                    </div>

                    <div className="admin-message-meta">
                      <strong>Driver:</strong> {message.driverName}
                      <span>•</span>
                      <strong>Driver ID:</strong> {message.driverId}
                      <span>•</span>
                      <strong>Bus:</strong> {message.busNumber || 'N/A'}
                      <span>•</span>
                      <strong>Route:</strong> {message.routeName || 'N/A'}
                    </div>

                    <div className="admin-message-date">{formatDate(message.createdAt)}</div>

                    {message.type === 'text' ? (
                      <p className="admin-message-body">{message.text}</p>
                    ) : (
                      <div className="admin-message-body voice-body">
                        <div className="admin-message-audio-label">🎙️ Voice Message</div>
                        {message.audioDataUrl ? (
                          <audio controls src={message.audioDataUrl} />
                        ) : (
                          <span className="text-muted">Audio unavailable</span>
                        )}
                        {message.duration && <span className="admin-audio-duration">{message.duration}s</span>}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </motion.div>

          <motion.div variants={itemVariants} className="admin-table-section">
            <h2>Fleet detail</h2>
            <DataTable rows={buses} />
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
