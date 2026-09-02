import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calendar, Clock, Bus, MapPin, Navigation, Bell, User, 
  ChevronRight, RefreshCw, AlertTriangle, CheckCircle, Route, X, Info, HelpCircle, ArrowRight
} from 'lucide-react';
import ParentSidebar from '../components/ParentSidebar';
import TopNav from '../components/TopNav';
import LiveRouteMap from '../components/LiveRouteMap';
import StatusBadge from '../components/StatusBadge';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../i18n/LanguageContext';
import { parentsDB, studentsDB } from '../data/mockData';
import { getFleetSchedules, getAltBusRequests, createAltBusRequest } from '../data/db';
import './ParentSchedule.css';

const ParentSchedule = () => {
  const { user, logout } = useAuth();
  const { t } = useLanguage();
  
  const [activeTab, setActiveTab] = useState('morning');
  const [selectedStudentId, setSelectedStudentId] = useState('STU001');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedStop, setSelectedStop] = useState(null);
  const [schedules, setSchedules] = useState([]);
  const [altRequests, setAltRequests] = useState([]);

  // "Missed Bus" Modal State
  const [isMissedBusOpen, setIsMissedBusOpen] = useState(false);
  const [requestSuccess, setRequestSuccess] = useState(false);

  const fetchCentralData = () => {
    setSchedules(getFleetSchedules());
    setAltRequests(getAltBusRequests());
  };

  useEffect(() => {
    fetchCentralData();
    const interval = setInterval(fetchCentralData, 2500);
    return () => clearInterval(interval);
  }, []);

  const currentStudent = studentsDB.find(s => s.studentId === selectedStudentId) || studentsDB[0];
  const assignedSchedule = schedules.find(sch => sch.busId === currentStudent.busId) || schedules[0];
  
  // Alternate buses for missed bus workflow calling at Krishna Nagar or the student's stop
  const studentPickupStop = currentStudent.pickupPoint || 'Krishna Nagar';
  const eligibleAltBuses = useMemo(() => {
    return schedules.filter(sch => {
      if (sch.scheduleId === assignedSchedule?.scheduleId) return false;
      return sch.stops.some(st => st.name.toLowerCase().includes(studentPickupStop.toLowerCase()));
    });
  }, [schedules, assignedSchedule, studentPickupStop]);

  // Existing request for this student
  const activeStudentRequest = altRequests.find(r => r.studentId === currentStudent.studentId);

  const handleRequestAltBus = (altBus) => {
    createAltBusRequest(
      currentStudent.studentId,
      currentStudent.name,
      currentStudent.parentId,
      currentStudent.parentName,
      assignedSchedule.busId,
      assignedSchedule.busNumber,
      altBus.busId,
      altBus.busNumber,
      studentPickupStop
    );
    setRequestSuccess(true);
    fetchCentralData();
    setTimeout(() => {
      setIsMissedBusOpen(false);
      setRequestSuccess(false);
    }, 2000);
  };

  const formatDate = (date) => {
    return new Intl.DateTimeFormat('en-US', { weekday: 'long', month: 'short', day: 'numeric' }).format(date);
  };

  const nextDay = () => {
    const next = new Date(selectedDate);
    next.setDate(next.getDate() + 1);
    setSelectedDate(next);
  };

  const prevDay = () => {
    const prev = new Date(selectedDate);
    prev.setDate(prev.getDate() - 1);
    setSelectedDate(prev);
  };

  return (
    <div style={{ display: 'flex' }}>
      <ParentSidebar onLogout={logout} />
      
      <div style={{ 
        flex: 1, 
        marginLeft: 'var(--sidebar-w)', 
        display: 'flex', 
        flexDirection: 'column', 
        minHeight: '100vh', 
        background: 'var(--bg-primary)' 
      }}>
        <TopNav name={user?.name || 'Parent'} roleLabel={t('roleParent')} onLogout={logout} />
        
        <main className="ps-main-content">
          {/* Header */}
          <header className="ps-header">
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-2)' }}>
                <span className="eyebrow">Parent Portal</span>
                <span className="badge badge-success">● Live Sync</span>
              </div>
              <h1 className="ps-title">Bus Timetable & Route Schedule</h1>
              <p className="ps-subtitle">Your child's daily bus schedule, stops and expected arrival times.</p>
            </div>
            
            <div className="ps-student-selector">
              {studentsDB.slice(0, 2).map(student => (
                <button 
                  key={student.studentId}
                  className={`ps-student-btn ${selectedStudentId === student.studentId ? 'active' : ''}`}
                  onClick={() => setSelectedStudentId(student.studentId)}
                >
                  <User size={16} />
                  <span>{student.name} ({student.class}-{student.section})</span>
                </button>
              ))}
            </div>
          </header>

          {/* Replacement Bus / Alternate Bus Banner */}
          {assignedSchedule?.status === 'Replacement Assigned' && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="card" style={{ borderLeft: '4px solid var(--warning)', background: 'var(--bg-surface)', padding: 'var(--space-4)', marginBottom: 'var(--space-6)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                <AlertTriangle size={24} color="var(--warning)" />
                <div>
                  <h3 style={{ fontSize: 'var(--text-body-m)', fontWeight: 600, color: 'var(--text-primary)' }}>Emergency Replacement Bus Assigned</h3>
                  <p className="text-muted" style={{ fontSize: 'var(--text-body-s)' }}>Standby Bus {assignedSchedule.busNumber} has taken over this route.</p>
                </div>
              </div>
              <span className="badge badge-warning">Replacement Active</span>
            </motion.div>
          )}

          {activeStudentRequest && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="card" style={{ borderLeft: `4px solid ${activeStudentRequest.status === 'APPROVED' ? 'var(--success)' : 'var(--warning)'}`, background: 'var(--bg-surface)', padding: 'var(--space-4)', marginBottom: 'var(--space-6)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <strong style={{ color: 'var(--text-primary)' }}>Alternative Bus Request: {activeStudentRequest.requestedBusNumber}</strong>
                <p className="text-muted" style={{ fontSize: 'var(--text-body-s)' }}>
                  Pickup at {activeStudentRequest.stopName} • Status: <strong>{activeStudentRequest.status}</strong>
                </p>
              </div>
              <StatusBadge status={activeStudentRequest.status === 'APPROVED' ? 'RESOLVED' : 'WARNING'} label={activeStudentRequest.status} />
            </motion.div>
          )}

          <div className="ps-layout">
            <div className="ps-left-col">
              
              {/* Date Navigation */}
              <div className="ps-date-picker">
                <button className="ps-icon-btn" onClick={prevDay}><ChevronRight size={18} style={{ transform: 'rotate(180deg)' }} /></button>
                <div className="ps-current-date">
                  <Calendar size={18} className="ps-text-accent" />
                  <span>{formatDate(selectedDate)}</span>
                  {selectedDate.toDateString() === new Date().toDateString() && (
                    <span className="ps-badge-today">Today</span>
                  )}
                </div>
                <button className="ps-icon-btn" onClick={nextDay}><ChevronRight size={18} /></button>
              </div>

              {/* Today's Journey Card */}
              <div className="ps-journey-card">
                <div className="ps-journey-header">
                  <div className="ps-journey-title">
                    <Route size={20} className="ps-text-accent" />
                    <h2>Today's Journey</h2>
                  </div>
                  <div className={`ps-status-badge ${assignedSchedule?.status === 'On Route' ? 'live' : 'delayed'}`}>
                    {assignedSchedule?.status === 'On Route' && <span className="ps-live-dot" />}
                    {assignedSchedule?.status || 'SCHEDULED'}
                  </div>
                </div>
                
                <div className="ps-journey-details">
                  <div className="ps-detail-item">
                    <Bus size={18} />
                    <div>
                      <label>Bus</label>
                      <span>{assignedSchedule?.busNumber || 'BUS-01'}</span>
                    </div>
                  </div>
                  <div className="ps-detail-item">
                    <User size={18} />
                    <div>
                      <label>Driver</label>
                      <span>{assignedSchedule?.driverName || 'Rahul Kumar'}</span>
                    </div>
                  </div>
                  <div className="ps-detail-item">
                    <MapPin size={18} />
                    <div>
                      <label>Route</label>
                      <span>{assignedSchedule?.routeName || 'GLA -> Mathura'}</span>
                    </div>
                  </div>
                </div>

                {/* "I Missed My Bus" CTA */}
                <div style={{ marginTop: 'var(--space-4)', paddingTop: 'var(--space-4)', borderTop: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span className="text-muted" style={{ fontSize: 'var(--text-body-s)' }}>Missed the scheduled morning bus?</span>
                  <button className="btn btn-warning btn-sm" onClick={() => setIsMissedBusOpen(true)}>
                    <HelpCircle size={14} /> I Missed My Bus
                  </button>
                </div>
              </div>

              {/* Tabs */}
              <div className="ps-tabs">
                <button 
                  className={`ps-tab ${activeTab === 'morning' ? 'active' : ''}`}
                  onClick={() => setActiveTab('morning')}
                >
                  🌅 Morning Pick-up
                </button>
                <button 
                  className={`ps-tab ${activeTab === 'afternoon' ? 'active' : ''}`}
                  onClick={() => setActiveTab('afternoon')}
                >
                  🌆 Afternoon Drop-off
                </button>
              </div>

              {/* Living Timeline */}
              <div className="ps-timeline">
                {assignedSchedule?.stops?.map((stop, index) => {
                  const isPast = stop.status === 'Completed';
                  const isCurrent = stop.status === 'Approaching' || stop.status === 'At Stop';
                  const isStudentStop = stop.name.toLowerCase().includes(studentPickupStop.toLowerCase());

                  return (
                    <motion.div 
                      key={stop.stopId}
                      className={`ps-timeline-item ${isPast ? 'past' : ''} ${isCurrent ? 'current' : ''} ${isStudentStop ? 'student-stop' : ''}`}
                      onClick={() => setSelectedStop(stop)}
                      whileHover={{ scale: 1.02, x: 5 }}
                      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                    >
                      <div className="ps-time-col">
                        <span className="ps-time">{stop.scheduledArrival}</span>
                        {isCurrent && <span className="ps-eta">{stop.eta || '2m'}</span>}
                      </div>
                      
                      <div className="ps-node-col">
                        <div className="ps-line"></div>
                        <div className="ps-node">
                          {isCurrent && <div className="ps-node-pulse"></div>}
                          {isPast ? <CheckCircle size={14} className="ps-icon-past" /> : <div className="ps-dot"></div>}
                        </div>
                      </div>
                      
                      <div className="ps-content-col">
                        <div className="ps-stop-info">
                          <h4>{stop.name}</h4>
                          <span className="text-muted" style={{ fontSize: 'var(--text-micro)' }}>
                            Arr: {stop.scheduledArrival} • Dep: {stop.scheduledDeparture}
                          </span>
                          {isStudentStop && (
                            <span className="ps-tag-mystop" style={{ marginTop: '4px', display: 'inline-block' }}>Your Assigned Stop</span>
                          )}
                        </div>
                        <ChevronRight size={16} className="ps-chevron" />
                      </div>
                    </motion.div>
                  );
                })}
              </div>

            </div>
            
            {/* Right Column: Live Map Preview */}
            <div className="ps-right-col">
              <div className="ps-map-container">
                <LiveRouteMap speed={38} />
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* MODAL: "I Missed My Bus" & Alternate Bus Selection */}
      <AnimatePresence>
        {isMissedBusOpen && (
          <div className="modal-overlay" onClick={() => setIsMissedBusOpen(false)}>
            <motion.div 
              className="modal-content"
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={e => e.stopPropagation()}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)' }}>
                <h3 style={{ fontSize: 'var(--text-heading-m)', color: 'var(--text-primary)' }}>
                  Find Next Available Bus
                </h3>
                <button className="btn btn-ghost btn-icon" onClick={() => setIsMissedBusOpen(false)}><X size={18} /></button>
              </div>

              {requestSuccess ? (
                <div style={{ textAlign: 'center', padding: 'var(--space-6)' }}>
                  <CheckCircle size={48} color="var(--success)" style={{ margin: '0 auto var(--space-4)' }} />
                  <h4 style={{ color: 'var(--text-primary)', fontSize: 'var(--text-heading-m)' }}>Transfer Request Sent!</h4>
                  <p className="text-muted" style={{ marginTop: 'var(--space-2)' }}>School Administration has been notified to authorize your child's alternate boarding.</p>
                </div>
              ) : (
                <>
                  <div className="card" style={{ background: 'var(--bg-surface-hover)', padding: 'var(--space-4)', marginBottom: 'var(--space-6)' }}>
                    <span className="eyebrow" style={{ color: 'var(--danger)' }}>Scheduled Bus Departed</span>
                    <h4 style={{ color: 'var(--text-primary)', margin: '4px 0' }}>{assignedSchedule.busNumber} left {studentPickupStop}</h4>
                    <p className="text-muted" style={{ fontSize: 'var(--text-body-s)' }}>
                      Below are other school buses passing through <strong>{studentPickupStop}</strong> with available seats.
                    </p>
                  </div>

                  <h4 style={{ fontSize: 'var(--text-body-m)', fontWeight: 600, color: 'var(--text-primary)', marginBottom: 'var(--space-3)' }}>
                    Next Available Buses
                  </h4>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)', marginBottom: 'var(--space-6)' }}>
                    {eligibleAltBuses.map(alt => (
                      <div key={alt.scheduleId} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 'var(--space-4)' }}>
                        <div>
                          <strong style={{ color: 'var(--text-primary)', fontSize: 'var(--text-body-m)' }}>{alt.busNumber} ({alt.routeName})</strong>
                          <span className="text-muted" style={{ display: 'block', fontSize: 'var(--text-caption)' }}>
                            Expected Arrival: <strong>07:45 AM</strong> • Driver: {alt.driverName}
                          </span>
                        </div>
                        <button className="btn btn-primary btn-sm" onClick={() => handleRequestAltBus(alt)}>
                          Request Boarding <ArrowRight size={14} />
                        </button>
                      </div>
                    ))}
                    {eligibleAltBuses.length === 0 && (
                      <p className="text-muted" style={{ textAlign: 'center', padding: 'var(--space-4)' }}>
                        No other buses are currently calling at this stop. Please contact the school transportation office.
                      </p>
                    )}
                  </div>
                </>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Stop Details Side Drawer */}
      <AnimatePresence>
        {selectedStop && (
          <div className="modal-overlay" onClick={() => setSelectedStop(null)}>
            <motion.div 
              className="ps-side-panel"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              onClick={e => e.stopPropagation()}
            >
              <div className="ps-panel-header">
                <h2>Stop Details</h2>
                <button className="ps-close-btn" onClick={() => setSelectedStop(null)}>
                  <X size={20} />
                </button>
              </div>
              
              <div className="ps-panel-content">
                <div className="ps-stop-hero">
                  <div className="ps-stop-icon">
                    <MapPin size={32} className="ps-text-accent" />
                  </div>
                  <h3>{selectedStop.name}</h3>
                  <div className="ps-stop-time">
                    <Clock size={16} />
                    <span>Scheduled: {selectedStop.scheduledArrival}</span>
                  </div>
                </div>

                <div className="ps-panel-section">
                  <h4>Timetable Breakdown</h4>
                  <div className="card" style={{ padding: 'var(--space-4)', background: 'var(--bg-elevated)', display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span className="text-muted">Scheduled Arrival:</span>
                      <strong style={{ color: 'var(--text-primary)' }}>{selectedStop.scheduledArrival}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span className="text-muted">Scheduled Departure:</span>
                      <strong style={{ color: 'var(--text-primary)' }}>{selectedStop.scheduledDeparture}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span className="text-muted">Actual Arrival:</span>
                      <span className="text-accent">{selectedStop.actualArrival || 'En Route'}</span>
                    </div>
                  </div>
                </div>

                <div className="ps-panel-section">
                  <h4>Quick Actions</h4>
                  <div className="ps-action-buttons">
                    <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
                      <Navigation size={18} /> Track Live Bus
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ParentSchedule;
