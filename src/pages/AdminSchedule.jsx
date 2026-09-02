import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calendar, Clock, Bus, MapPin, Navigation, User, Users, Search, 
  Plus, Edit3, Trash2, CheckCircle2, AlertTriangle, RefreshCw, 
  Printer, ArrowRight, Shield, Filter, ChevronRight, X, AlertCircle, ArrowDownUp
} from 'lucide-react';
import Sidebar from '../components/Sidebar';
import TopNav from '../components/TopNav';
import LiveRouteMap from '../components/LiveRouteMap';
import StatusBadge from '../components/StatusBadge';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../i18n/LanguageContext';
import { 
  getFleetSchedules, 
  saveFleetSchedules, 
  updateStopTiming, 
  assignReplacementBus, 
  detectScheduleConflicts, 
  getAltBusRequests, 
  updateAltBusRequestStatus, 
  getScheduleAuditLog 
} from '../data/db';
import { busesDB, driversDB, routesDB } from '../data/mockData';
import './AdminSchedule.css';

export default function AdminSchedule() {
  const { user, logout } = useAuth();
  const { t } = useLanguage();

  const [schedules, setSchedules] = useState([]);
  const [altRequests, setAltRequests] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [activeView, setActiveView] = useState('table'); // table, timeline, map, stopwise, requests, audit
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRouteFilter, setSelectedRouteFilter] = useState('ALL');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('ALL');
  const [specialDay, setSpecialDay] = useState('Regular Day');

  // Modals
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isReplacementOpen, setIsReplacementOpen] = useState(false);
  const [editingStop, setEditingStop] = useState(null);
  const [newArrTime, setNewArrTime] = useState('');
  const [newDepTime, setNewDepTime] = useState('');

  // Conflict state
  const [conflictWarning, setConflictWarning] = useState(null);

  const fetchAllData = () => {
    setSchedules(getFleetSchedules());
    setAltRequests(getAltBusRequests());
    setAuditLogs(getScheduleAuditLog());
  };

  useEffect(() => {
    fetchAllData();
    const interval = setInterval(fetchAllData, 2500);
    return () => clearInterval(interval);
  }, []);

  // Filtered schedules
  const filteredSchedules = useMemo(() => {
    return schedules.filter(sch => {
      const matchRoute = selectedRouteFilter === 'ALL' || sch.routeId === selectedRouteFilter;
      const matchStatus = selectedStatusFilter === 'ALL' || sch.status.toLowerCase() === selectedStatusFilter.toLowerCase();
      const matchSearch = sch.busNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          sch.driverName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          sch.routeName.toLowerCase().includes(searchQuery.toLowerCase());
      return matchRoute && matchStatus && matchSearch;
    });
  }, [schedules, selectedRouteFilter, selectedStatusFilter, searchQuery]);

  // All unique stops for stop-wise view
  const allUniqueStops = useMemo(() => {
    const stopsMap = {};
    schedules.forEach(sch => {
      sch.stops.forEach(st => {
        if (!stopsMap[st.name]) {
          stopsMap[st.name] = [];
        }
        stopsMap[st.name].push({
          busNumber: sch.busNumber,
          routeName: sch.routeName,
          scheduledArrival: st.scheduledArrival,
          scheduledDeparture: st.scheduledDeparture,
          status: st.status,
          driverName: sch.driverName
        });
      });
    });
    return stopsMap;
  }, [schedules]);

  const handleUpdateTiming = (e) => {
    e.preventDefault();
    if (!editingStop) return;
    updateStopTiming(editingStop.scheduleId, editingStop.stopId, newArrTime, newDepTime, user?.name || 'Admin');
    setEditingStop(null);
    fetchAllData();
  };

  const handleApproveRequest = (reqId) => {
    updateAltBusRequestStatus(reqId, 'APPROVED', user?.name || 'Admin');
    fetchAllData();
  };

  const handleRejectRequest = (reqId) => {
    updateAltBusRequestStatus(reqId, 'REJECTED', user?.name || 'Admin');
    fetchAllData();
  };

  const handleAssignReplacement = (origBusId, replBusId, replBusNumber) => {
    assignReplacementBus(origBusId, replBusId, replBusNumber, user?.name || 'Admin');
    setIsReplacementOpen(false);
    fetchAllData();
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div style={{ display: 'flex' }}>
      <Sidebar onLogout={logout} />
      
      <div style={{ flex: 1, marginLeft: 'var(--sidebar-w)', display: 'flex', flexDirection: 'column', minHeight: '100vh', background: 'var(--bg-primary)' }}>
        <TopNav name={user?.name || 'Admin'} roleLabel={t('roleAdmin')} onLogout={logout} />

        <main className="admin-sch-main">
          {/* Header */}
          <header className="admin-sch-header">
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-2)' }}>
                <span className="eyebrow">Fleet Operations Center</span>
                <span className="badge badge-info" style={{ textTransform: 'uppercase' }}>● Version Sync Active</span>
              </div>
              <h1 style={{ fontSize: 'var(--text-heading-xl)', fontWeight: 700, color: 'var(--text-primary)' }}>
                Central Bus Schedule & Timetable
              </h1>
              <p className="text-muted" style={{ marginTop: '4px' }}>
                Master dispatch control for routes, arrival & departure sequences, and alternative bus transfers.
              </p>
            </div>

            <div className="admin-sch-actions">
              <button className="btn btn-secondary btn-sm" onClick={handlePrint}>
                <Printer size={16} /> Print Sheet
              </button>
              <button className="btn btn-secondary btn-sm" onClick={() => setIsReplacementOpen(true)}>
                <AlertTriangle size={16} color="var(--warning)" /> Assign Replacement
              </button>
              <button className="btn btn-primary btn-sm" onClick={() => setIsCreateOpen(true)}>
                <Plus size={16} /> Create Schedule
              </button>
            </div>
          </header>

          {/* Quick Metrics Bar */}
          <div className="admin-sch-metrics">
            <div className="sch-metric-card">
              <span className="sch-metric-label">Active Fleet Schedules</span>
              <span className="sch-metric-val">{schedules.length} Routes</span>
            </div>
            <div className="sch-metric-card">
              <span className="sch-metric-label">Pending Alt-Bus Requests</span>
              <span className="sch-metric-val" style={{ color: altRequests.filter(r => r.status === 'PENDING').length > 0 ? 'var(--warning)' : 'var(--text-primary)' }}>
                {altRequests.filter(r => r.status === 'PENDING').length} Pending
              </span>
            </div>
            <div className="sch-metric-card">
              <span className="sch-metric-label">Special Day Calendar</span>
              <select 
                className="input sch-metric-select" 
                value={specialDay} 
                onChange={(e) => setSpecialDay(e.target.value)}
              >
                <option value="Regular Day">Regular School Day</option>
                <option value="Exam Day">Exam Day (Late Pickup)</option>
                <option value="Half Day">Half Day (12:30 PM Drop)</option>
                <option value="Holiday">School Holiday (No Service)</option>
              </select>
            </div>
          </div>

          {/* Navigation Views Tab Bar */}
          <div className="sch-view-tabs">
            <button className={`sch-tab-btn ${activeView === 'table' ? 'active' : ''}`} onClick={() => setActiveView('table')}>
              📋 Master Table View
            </button>
            <button className={`sch-tab-btn ${activeView === 'timeline' ? 'active' : ''}`} onClick={() => setActiveView('timeline')}>
              ⏱️ Living Timeline
            </button>
            <button className={`sch-tab-btn ${activeView === 'stopwise' ? 'active' : ''}`} onClick={() => setActiveView('stopwise')}>
              🚏 Stop-Wise View (Missed Bus Hub)
            </button>
            <button className={`sch-tab-btn ${activeView === 'requests' ? 'active' : ''}`} onClick={() => setActiveView('requests')}>
              🔄 Alt-Bus Requests ({altRequests.filter(r => r.status === 'PENDING').length})
            </button>
            <button className={`sch-tab-btn ${activeView === 'map' ? 'active' : ''}`} onClick={() => setActiveView('map')}>
              🗺️ Route Map
            </button>
            <button className={`sch-tab-btn ${activeView === 'audit' ? 'active' : ''}`} onClick={() => setActiveView('audit')}>
              📜 Audit History
            </button>
          </div>

          {/* Filters Bar */}
          <div className="sch-filters-bar">
            <div className="sch-search-wrap">
              <Search size={16} className="sch-search-icon" />
              <input 
                type="text" 
                className="input" 
                placeholder="Search bus number, driver or route..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <div className="sch-filter-selects">
              <select 
                className="input" 
                value={selectedRouteFilter} 
                onChange={(e) => setSelectedRouteFilter(e.target.value)}
              >
                <option value="ALL">All Routes</option>
                {routesDB.map(r => (
                  <option key={r.routeId} value={r.routeId}>{r.routeName}</option>
                ))}
              </select>

              <select 
                className="input" 
                value={selectedStatusFilter} 
                onChange={(e) => setSelectedStatusFilter(e.target.value)}
              >
                <option value="ALL">All Statuses</option>
                <option value="On Route">On Route</option>
                <option value="Delayed">Delayed</option>
                <option value="Completed">Completed</option>
              </select>
            </div>
          </div>

          {/* VIEW: Master Table View */}
          {activeView === 'table' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="card sch-table-card">
              <div className="data-table-wrap">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Bus & Route</th>
                      <th>Driver</th>
                      <th>Direction</th>
                      <th>Stops Sequence</th>
                      <th>Status</th>
                      <th>Version</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredSchedules.map((sch) => (
                      <tr key={sch.scheduleId}>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Bus size={18} className="text-accent" />
                            <div>
                              <strong style={{ color: 'var(--text-primary)' }}>{sch.busNumber}</strong>
                              <span className="text-muted" style={{ display: 'block', fontSize: 'var(--text-micro)' }}>{sch.routeName}</span>
                            </div>
                          </div>
                        </td>
                        <td>
                          <span style={{ color: 'var(--text-primary)' }}>{sch.driverName}</span>
                        </td>
                        <td>
                          <span className="badge badge-neutral">{sch.direction}</span>
                        </td>
                        <td>
                          <div className="sch-stops-badges">
                            {sch.stops.map((st, idx) => (
                              <span 
                                key={st.stopId} 
                                className={`sch-stop-chip ${st.status === 'Completed' ? 'done' : st.status === 'At Stop' ? 'active' : ''}`}
                                onClick={() => {
                                  setEditingStop({ scheduleId: sch.scheduleId, stopId: st.stopId, name: st.name, scheduledArrival: st.scheduledArrival, scheduledDeparture: st.scheduledDeparture });
                                  setNewArrTime(st.scheduledArrival);
                                  setNewDepTime(st.scheduledDeparture);
                                }}
                                title="Click to edit timings"
                              >
                                {idx + 1}. {st.name} ({st.scheduledArrival})
                              </span>
                            ))}
                          </div>
                        </td>
                        <td>
                          <StatusBadge status={sch.status === 'On Route' ? 'ACTIVE' : sch.status.toUpperCase()} label={sch.status} />
                        </td>
                        <td>
                          <span className="text-muted">v{sch.version}</span>
                        </td>
                        <td>
                          <button 
                            className="btn btn-secondary btn-sm" 
                            onClick={() => {
                              const firstStop = sch.stops[0];
                              setEditingStop({ scheduleId: sch.scheduleId, stopId: firstStop.stopId, name: firstStop.name, scheduledArrival: firstStop.scheduledArrival, scheduledDeparture: firstStop.scheduledDeparture });
                              setNewArrTime(firstStop.scheduledArrival);
                              setNewDepTime(firstStop.scheduledDeparture);
                            }}
                          >
                            <Edit3 size={14} /> Edit Timings
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}

          {/* VIEW: Living Timeline View */}
          {activeView === 'timeline' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="sch-timeline-grid">
              {filteredSchedules.map((sch) => (
                <div key={sch.scheduleId} className="card sch-timeline-card">
                  <div className="sch-tl-header">
                    <div>
                      <h3 style={{ fontSize: 'var(--text-heading-m)', color: 'var(--text-primary)' }}>{sch.busNumber}</h3>
                      <p className="text-muted">{sch.routeName} • {sch.driverName}</p>
                    </div>
                    <StatusBadge status={sch.status === 'On Route' ? 'ACTIVE' : sch.status.toUpperCase()} label={sch.status} />
                  </div>

                  <div className="sch-tl-chain">
                    {sch.stops.map((st, idx) => (
                      <div key={st.stopId} className={`sch-tl-step ${st.status === 'Completed' ? 'completed' : st.status === 'At Stop' || st.status === 'Approaching' ? 'live' : ''}`}>
                        <div className="sch-tl-node">
                          {st.status === 'Completed' ? <CheckCircle2 size={16} /> : <div className="sch-tl-dot" />}
                        </div>
                        <div className="sch-tl-info">
                          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <strong style={{ color: 'var(--text-primary)' }}>{st.name}</strong>
                            <span className="text-accent" style={{ fontSize: 'var(--text-caption)' }}>{st.eta}</span>
                          </div>
                          <div className="sch-tl-times">
                            <span>Arr: <strong>{st.scheduledArrival}</strong> (Act: {st.actualArrival || '--'})</span>
                            <span>•</span>
                            <span>Dep: <strong>{st.scheduledDeparture}</strong> (Act: {st.actualDeparture || '--'})</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </motion.div>
          )}

          {/* VIEW: Stop-Wise View (Crucial for Missed Bus & Next Bus Matching) */}
          {activeView === 'stopwise' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="card sch-stopwise-card">
              <h2 style={{ fontSize: 'var(--text-heading-m)', color: 'var(--text-primary)', marginBottom: 'var(--space-4)' }}>
                Stop-Centric Multi-Bus Timetable
              </h2>
              <p className="text-muted" style={{ marginBottom: 'var(--space-6)' }}>
                View all scheduled and active buses calling at a specific stop to facilitate alternate bus transfers.
              </p>

              <div className="sch-stops-accordion">
                {Object.keys(allUniqueStops).map(stopName => (
                  <div key={stopName} className="sch-stop-group card" style={{ background: 'var(--bg-elevated)', marginBottom: 'var(--space-4)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-3)' }}>
                      <MapPin size={20} className="text-accent" />
                      <h3 style={{ fontSize: 'var(--text-heading-m)', color: 'var(--text-primary)' }}>{stopName} Stop</h3>
                      <span className="badge badge-info">{allUniqueStops[stopName].length} Bus Lines</span>
                    </div>

                    <div className="data-table-wrap">
                      <table className="data-table">
                        <thead>
                          <tr>
                            <th>Bus</th>
                            <th>Route</th>
                            <th>Scheduled Arrival</th>
                            <th>Scheduled Departure</th>
                            <th>Assigned Driver</th>
                            <th>Current Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {allUniqueStops[stopName].map((item, idx) => (
                            <tr key={idx}>
                              <td><strong>{item.busNumber}</strong></td>
                              <td>{item.routeName}</td>
                              <td><Clock size={14} style={{ display: 'inline', marginRight: 4 }} />{item.scheduledArrival}</td>
                              <td>{item.scheduledDeparture}</td>
                              <td>{item.driverName}</td>
                              <td><StatusBadge status={item.status === 'Completed' ? 'COMPLETED' : 'ACTIVE'} label={item.status} /></td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* VIEW: Alternative Bus Requests */}
          {activeView === 'requests' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="card">
              <h2 style={{ fontSize: 'var(--text-heading-m)', color: 'var(--text-primary)', marginBottom: 'var(--space-4)' }}>
                "I Missed My Bus" — Parent Transfer Authorization
              </h2>
              <p className="text-muted" style={{ marginBottom: 'var(--space-6)' }}>
                Review and approve parents' requests to board an alternative scheduled bus at the same pickup stop.
              </p>

              <div className="data-table-wrap">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Student / Parent</th>
                      <th>Pickup Stop</th>
                      <th>Original Bus</th>
                      <th>Requested Alternative</th>
                      <th>Reason</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {altRequests.map(req => (
                      <tr key={req.requestId}>
                        <td>
                          <strong style={{ color: 'var(--text-primary)', display: 'block' }}>{req.studentName}</strong>
                          <span className="text-muted">{req.parentName}</span>
                        </td>
                        <td><MapPin size={14} style={{ display: 'inline', marginRight: 4 }} />{req.stopName}</td>
                        <td><span className="badge badge-neutral">{req.originalBusNumber}</span></td>
                        <td><span className="badge badge-info">{req.requestedBusNumber}</span></td>
                        <td className="text-muted">{req.reason}</td>
                        <td>
                          <StatusBadge status={req.status === 'APPROVED' ? 'RESOLVED' : req.status === 'PENDING' ? 'WARNING' : 'INACTIVE'} label={req.status} />
                        </td>
                        <td>
                          {req.status === 'PENDING' ? (
                            <div style={{ display: 'flex', gap: '8px' }}>
                              <button className="btn btn-success btn-sm" onClick={() => handleApproveRequest(req.requestId)}>
                                Approve Transfer
                              </button>
                              <button className="btn btn-danger btn-sm" onClick={() => handleRejectRequest(req.requestId)}>
                                Reject
                              </button>
                            </div>
                          ) : (
                            <span className="text-faint">Processed</span>
                          )}
                        </td>
                      </tr>
                    ))}
                    {altRequests.length === 0 && (
                      <tr>
                        <td colSpan="7" style={{ textAlign: 'center', padding: 'var(--space-8)', color: 'var(--text-tertiary)' }}>
                          No alternate bus requests at this time.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}

          {/* VIEW: Route Map */}
          {activeView === 'map' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="card" style={{ padding: 'var(--space-2)' }}>
              <LiveRouteMap variant="card" speed={35} />
            </motion.div>
          )}

          {/* VIEW: Audit History */}
          {activeView === 'audit' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="card">
              <h2 style={{ fontSize: 'var(--text-heading-m)', color: 'var(--text-primary)', marginBottom: 'var(--space-4)' }}>
                Schedule Change Log & Versioning Audit Trail
              </h2>
              <div className="data-table-wrap">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Timestamp</th>
                      <th>Action</th>
                      <th>Admin</th>
                      <th>Change Details</th>
                    </tr>
                  </thead>
                  <tbody>
                    {auditLogs.map(log => (
                      <tr key={log.logId}>
                        <td className="text-muted">{new Date(log.timestamp).toLocaleTimeString()} • {new Date(log.timestamp).toLocaleDateString()}</td>
                        <td><span className="badge badge-info">{log.action}</span></td>
                        <td><strong>{log.adminName}</strong></td>
                        <td style={{ color: 'var(--text-primary)' }}>{log.details}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}
        </main>
      </div>

      {/* MODAL: Edit Stop Timings */}
      <AnimatePresence>
        {editingStop && (
          <div className="modal-overlay" onClick={() => setEditingStop(null)}>
            <motion.div 
              className="modal-content"
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={e => e.stopPropagation()}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)' }}>
                <h3 style={{ fontSize: 'var(--text-heading-m)', color: 'var(--text-primary)' }}>
                  Update Stop Timing: {editingStop.name}
                </h3>
                <button className="btn btn-ghost btn-icon" onClick={() => setEditingStop(null)}><X size={18} /></button>
              </div>

              <form onSubmit={handleUpdateTiming}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)', marginBottom: 'var(--space-6)' }}>
                  <div>
                    <label className="input-label">Scheduled Arrival</label>
                    <input 
                      type="text" 
                      className="input" 
                      value={newArrTime} 
                      onChange={e => setNewArrTime(e.target.value)} 
                      placeholder="e.g. 07:20 AM"
                      required
                    />
                  </div>
                  <div>
                    <label className="input-label">Scheduled Departure</label>
                    <input 
                      type="text" 
                      className="input" 
                      value={newDepTime} 
                      onChange={e => setNewDepTime(e.target.value)} 
                      placeholder="e.g. 07:22 AM"
                      required
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-3)' }}>
                  <button type="button" className="btn btn-secondary" onClick={() => setEditingStop(null)}>Cancel</button>
                  <button type="submit" className="btn btn-primary">Publish Timing Change</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL: Emergency Replacement Bus Assigner */}
      <AnimatePresence>
        {isReplacementOpen && (
          <div className="modal-overlay" onClick={() => setIsReplacementOpen(false)}>
            <motion.div 
              className="modal-content"
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={e => e.stopPropagation()}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)' }}>
                <h3 style={{ fontSize: 'var(--text-heading-m)', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <AlertTriangle size={20} color="var(--warning)" /> Emergency Replacement Bus Assigner
                </h3>
                <button className="btn btn-ghost btn-icon" onClick={() => setIsReplacementOpen(false)}><X size={18} /></button>
              </div>

              <p className="text-muted" style={{ marginBottom: 'var(--space-6)' }}>
                In the event of a mechanical breakdown or delay, reassign all scheduled stops to a standby bus.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)', marginBottom: 'var(--space-6)' }}>
                {schedules.map(sch => (
                  <div key={sch.scheduleId} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 'var(--space-4)', background: 'var(--bg-surface-hover)' }}>
                    <div>
                      <strong style={{ color: 'var(--text-primary)' }}>{sch.busNumber} ({sch.routeName})</strong>
                      <span className="text-muted" style={{ display: 'block', fontSize: 'var(--text-micro)' }}>Driver: {sch.driverName}</span>
                    </div>
                    <button 
                      className="btn btn-warning btn-sm"
                      onClick={() => handleAssignReplacement(sch.busId, 'B106', 'BUS-06 (Standby)')}
                    >
                      Assign Standby BUS-06
                    </button>
                  </div>
                ))}
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button className="btn btn-secondary" onClick={() => setIsReplacementOpen(false)}>Close</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL: Create Schedule with Conflict Detection */}
      <AnimatePresence>
        {isCreateOpen && (
          <div className="modal-overlay" onClick={() => setIsCreateOpen(false)}>
            <motion.div 
              className="modal-content"
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={e => e.stopPropagation()}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)' }}>
                <h3 style={{ fontSize: 'var(--text-heading-m)', color: 'var(--text-primary)' }}>
                  Create Master Route Schedule
                </h3>
                <button className="btn btn-ghost btn-icon" onClick={() => setIsCreateOpen(false)}><X size={18} /></button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)', marginBottom: 'var(--space-6)' }}>
                <div>
                  <label className="input-label">Select Bus</label>
                  <select className="input" onChange={e => {
                    const conflicts = detectScheduleConflicts(e.target.value, 'DRV001', '07:00 AM', '08:30 AM');
                    setConflictWarning(conflicts.length > 0 ? conflicts[0] : null);
                  }}>
                    {busesDB.map(b => (
                      <option key={b.busId} value={b.busId}>{b.busNumber} ({b.registrationNumber})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="input-label">Select Driver</label>
                  <select className="input">
                    {driversDB.map(d => (
                      <option key={d.driverId} value={d.driverId}>{d.name} ({d.phone})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="input-label">Select Route</label>
                  <select className="input">
                    {routesDB.map(r => (
                      <option key={r.routeId} value={r.routeId}>{r.routeName}</option>
                    ))}
                  </select>
                </div>

                {conflictWarning && (
                  <div className="card" style={{ borderLeft: '3px solid var(--danger)', padding: 'var(--space-3)', background: 'var(--danger-muted)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--danger)' }}>
                      <AlertCircle size={18} />
                      <span style={{ fontSize: 'var(--text-body-s)', fontWeight: 600 }}>Conflict Detected: {conflictWarning}</span>
                    </div>
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-3)' }}>
                <button className="btn btn-secondary" onClick={() => setIsCreateOpen(false)}>Cancel</button>
                <button className="btn btn-primary" onClick={() => { setIsCreateOpen(false); fetchAllData(); }}>
                  Validate & Publish Schedule
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
