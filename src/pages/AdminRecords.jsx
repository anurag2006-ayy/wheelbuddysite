import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../i18n/LanguageContext';
import Sidebar from '../components/Sidebar';
import LanguageSwitcher from '../components/LanguageSwitcher';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, Route, MapPin, GraduationCap, BarChart3,
  Search, ChevronRight, Phone, Bus, User, ArrowLeft, 
  AlertTriangle, Calendar, Clock, CheckCircle, XCircle, 
  AlertCircle, Filter, X, Shield, FileText, DollarSign,
  Briefcase, Hash, ExternalLink
} from 'lucide-react';
import { 
  busesDB, routesDB, driversDB, studentsDB, parentsDB, 
  stopsDB, feesDB, driversExtendedDB 
} from '../data/mockData';
import { getEmergencyMessages, getSOSHistory } from '../data/db';
import './Admin.css';

export default function AdminRecords({ section: initialSection = 'overview' }) {
  const { user, logout } = useAuth();
  const { t } = useLanguage();
  
  const [activeSection, setActiveSection] = useState(initialSection);
  const [globalSearch, setGlobalSearch] = useState('');
  
  // Selected Detail Item states (for relational traversal)
  const [selectedDriverId, setSelectedDriverId] = useState(null);
  const [selectedRouteId, setSelectedRouteId] = useState(null);
  const [selectedStopId, setSelectedStopId] = useState(null);
  const [selectedStudentId, setSelectedStudentId] = useState(null);

  // Driver SOS filter state
  const [driverSosFilter, setDriverSosFilter] = useState('ALL'); // ALL, TODAY, YESTERDAY, 7DAYS, 30DAYS
  const [driverSosSort, setDriverSosSort] = useState('NEWEST'); // NEWEST, OLDEST

  // Student Filters
  const [classFilter, setClassFilter] = useState('ALL');
  const [routeFilter, setRouteFilter] = useState('ALL');
  const [feeStatusFilter, setFeeStatusFilter] = useState('ALL');

  useEffect(() => {
    setActiveSection(initialSection);
  }, [initialSection]);

  // Compute Drivers with relationships
  const driversList = useMemo(() => {
    const activeSOSList = getEmergencyMessages();
    const historySOSList = getSOSHistory();
    const allSOS = [...activeSOSList, ...historySOSList];

    return driversDB.map(d => {
      const ext = driversExtendedDB.find(e => e.driverId === d.driverId) || {};
      const bus = busesDB.find(b => b.busId === d.busId);
      const route = routesDB.find(r => r.routeId === d.routeId);
      const driverSOS = allSOS.filter(s => s.driverId === d.driverId);
      
      return {
        ...d,
        alternatePhone: ext.alternatePhone || d.phone,
        address: ext.address || 'Mathura, Uttar Pradesh',
        emergencyContact: ext.emergencyContact || '+91 99999 00000',
        joiningDate: ext.joiningDate || '2023-01-15',
        dob: ext.dob || '1988-05-20',
        busNumber: bus?.busNumber || 'N/A',
        registrationNumber: bus?.registrationNumber || 'N/A',
        routeName: route?.routeName || 'N/A',
        startPoint: route?.startPoint || 'N/A',
        endPoint: route?.endPoint || 'N/A',
        totalSOS: driverSOS.length,
        activeSOS: driverSOS.filter(s => s.status === 'NEW' || s.status === 'UNDER REVIEW').length,
        resolvedSOS: driverSOS.filter(s => s.status === 'RESOLVED').length,
        lastSOS: driverSOS.length > 0 ? driverSOS[0] : null,
        sosHistory: driverSOS
      };
    });
  }, []);

  // Compute Routes with relationships
  const routesList = useMemo(() => {
    return routesDB.map(r => {
      const bus = busesDB.find(b => b.routeId === r.routeId);
      const driver = driversDB.find(d => d.routeId === r.routeId);
      const routeStudents = studentsDB.filter(s => s.routeId === r.routeId);
      const routeStops = stopsDB.filter(st => st.routeId === r.routeId);

      return {
        ...r,
        busNumber: bus?.busNumber || 'N/A',
        registrationNumber: bus?.registrationNumber || 'N/A',
        busId: bus?.busId,
        driverName: driver?.name || 'Unassigned',
        driverId: driver?.driverId,
        driverPhone: driver?.phone || 'N/A',
        totalStudents: routeStudents.length,
        stops: routeStops,
        status: 'Active'
      };
    });
  }, []);

  // Compute Stops with relationships
  const stopsList = useMemo(() => {
    return stopsDB.map(st => {
      const route = routesDB.find(r => r.routeId === st.routeId);
      const bus = busesDB.find(b => b.routeId === st.routeId);
      const driver = driversDB.find(d => d.routeId === st.routeId);
      const stopStudents = studentsDB.filter(s => s.pickupPoint === st.name || s.routeId === st.routeId);

      return {
        ...st,
        routeName: route?.routeName || 'N/A',
        busNumber: bus?.busNumber || 'N/A',
        driverName: driver?.name || 'Unassigned',
        driverPhone: driver?.phone || 'N/A',
        totalStudents: stopStudents.length,
        assignedStudents: stopStudents
      };
    });
  }, []);

  // Compute Students with relationships & computed Age
  const studentsList = useMemo(() => {
    return studentsDB.map(s => {
      const parent = parentsDB.find(p => p.parentId === s.parentId) || {};
      const bus = busesDB.find(b => b.busId === s.busId) || {};
      const route = routesDB.find(r => r.routeId === s.routeId) || {};
      const driver = driversDB.find(d => d.busId === s.busId) || {};
      const fee = feesDB.find(f => f.studentId === s.studentId) || {
        status: 'Paid', feePerMonth: 3000, totalPaid: 15000, totalDue: 0, lastPaymentDate: '2026-08-01', nextDueDate: '2026-09-01'
      };

      // Calculate Age from DOB dynamically
      let age = 13;
      if (s.dob) {
        const birthDate = new Date(s.dob);
        const today = new Date();
        age = today.getFullYear() - birthDate.getFullYear();
        const m = today.getMonth() - birthDate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
          age--;
        }
      }

      return {
        ...s,
        age,
        dob: s.dob || '2013-05-10',
        parentName: parent.name || s.parentName,
        parentPhone: parent.phone || s.parentPhone,
        alternatePhone: parent.alternatePhone || s.alternatePhone,
        address: parent.address || s.address,
        busNumber: bus.busNumber || 'N/A',
        registrationNumber: bus.registrationNumber || 'N/A',
        routeName: route.routeName || 'N/A',
        driverName: driver.name || 'N/A',
        driverId: driver.driverId || 'N/A',
        feeDetails: fee,
        feeStatus: fee.status
      };
    });
  }, []);

  // Filtered lists based on search
  const filteredDrivers = driversList.filter(d => {
    if (!globalSearch) return true;
    const q = globalSearch.toLowerCase();
    return (
      d.name.toLowerCase().includes(q) ||
      d.driverId.toLowerCase().includes(q) ||
      d.phone.toLowerCase().includes(q) ||
      d.busNumber.toLowerCase().includes(q) ||
      d.routeName.toLowerCase().includes(q)
    );
  });

  const filteredRoutes = routesList.filter(r => {
    if (!globalSearch) return true;
    const q = globalSearch.toLowerCase();
    return (
      r.routeName.toLowerCase().includes(q) ||
      r.routeId.toLowerCase().includes(q) ||
      r.busNumber.toLowerCase().includes(q) ||
      r.driverName.toLowerCase().includes(q)
    );
  });

  const filteredStops = stopsList.filter(st => {
    if (!globalSearch) return true;
    const q = globalSearch.toLowerCase();
    return (
      st.name.toLowerCase().includes(q) ||
      st.stopId.toLowerCase().includes(q) ||
      st.routeName.toLowerCase().includes(q) ||
      st.busNumber.toLowerCase().includes(q)
    );
  });

  const filteredStudents = studentsList.filter(s => {
    if (classFilter !== 'ALL' && s.class !== classFilter) return false;
    if (routeFilter !== 'ALL' && s.routeId !== routeFilter) return false;
    if (feeStatusFilter !== 'ALL' && s.feeStatus !== feeStatusFilter) return false;
    if (!globalSearch) return true;
    const q = globalSearch.toLowerCase();
    return (
      s.name.toLowerCase().includes(q) ||
      s.studentId.toLowerCase().includes(q) ||
      s.parentName.toLowerCase().includes(q) ||
      s.parentPhone.toLowerCase().includes(q) ||
      s.pickupPoint.toLowerCase().includes(q)
    );
  });

  // Active Driver Object for Driver Profile
  const activeDriver = selectedDriverId ? driversList.find(d => d.driverId === selectedDriverId) : null;
  // Active Route Object for Route Details
  const activeRoute = selectedRouteId ? routesList.find(r => r.routeId === selectedRouteId) : null;
  // Active Stop Object for Stop Details
  const activeStop = selectedStopId ? stopsList.find(st => st.stopId === selectedStopId) : null;
  // Active Student Object for Student Profile
  const activeStudent = selectedStudentId ? studentsList.find(s => s.studentId === selectedStudentId) : null;

  return (
    <>
      <Sidebar onLogout={logout} />

      <div className="admin-page" style={{ marginLeft: 'var(--sidebar-w)', minHeight: '100vh', background: 'var(--bg-primary)' }}>
        {/* Page Header */}
        <header style={{ padding: 'var(--space-6) var(--space-8)', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-secondary)' }}>
          <div>
            <p className="eyebrow" style={{ color: 'var(--text-secondary)' }}>Central Fleet Management</p>
            <h1 style={{ color: 'var(--text-primary)', margin: '4px 0 0 0', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <BarChart3 color="var(--accent)" size={26} />
              Records System
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

        <div style={{ display: 'flex', minHeight: 'calc(100vh - 90px)' }}>
          {/* RECORDS INNER SIDEBAR NAVIGATION */}
          <div style={{
            width: '240px',
            background: 'var(--bg-secondary)',
            borderRight: '1px solid var(--border)',
            padding: 'var(--space-6) var(--space-3)',
            flexShrink: 0,
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--space-2)'
          }}>
            <div style={{ color: 'var(--text-tertiary)', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', padding: '0 12px 8px' }}>
              Records Directory
            </div>

            {[
              { id: 'overview', label: 'Overview', icon: BarChart3, count: null },
              { id: 'drivers', label: 'Drivers', icon: Users, count: driversList.length },
              { id: 'routes', label: 'Routes', icon: Route, count: routesList.length },
              { id: 'stops', label: 'Stops', icon: MapPin, count: stopsList.length },
              { id: 'students', label: 'Students', icon: GraduationCap, count: studentsList.length },
              { id: 'sos-history', label: 'SOS History', icon: AlertTriangle, count: getSOSHistory().length }
            ].map(item => {
              const Icon = item.icon;
              const isActive = activeSection === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveSection(item.id);
                    setSelectedDriverId(null);
                    setSelectedRouteId(null);
                    setSelectedStopId(null);
                    setSelectedStudentId(null);
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justify: 'space-between',
                    padding: '10px 14px',
                    borderRadius: 'var(--radius-md)',
                    border: 'none',
                    background: isActive ? 'var(--accent)' : 'transparent',
                    color: isActive ? '#fff' : 'var(--text-secondary)',
                    fontWeight: isActive ? 600 : 500,
                    cursor: 'pointer',
                    fontSize: '0.9rem',
                    textAlign: 'left',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Icon size={18} />
                    <span>{item.label}</span>
                  </div>
                  {item.count !== null && (
                    <span style={{
                      fontSize: '0.75rem',
                      padding: '2px 8px',
                      borderRadius: '999px',
                      background: isActive ? 'rgba(255,255,255,0.25)' : 'var(--bg-surface)',
                      color: isActive ? '#fff' : 'var(--text-tertiary)'
                    }}>
                      {item.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* MAIN CONTENT AREA */}
          <div style={{ flex: 1, padding: 'var(--space-6) var(--space-8)', overflowY: 'auto' }}>
            {/* Global Search Bar */}
            <div style={{ marginBottom: 'var(--space-6)' }}>
              <div style={{ position: 'relative', maxWidth: '600px' }}>
                <Search size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
                <input
                  type="text"
                  className="input"
                  placeholder="Global Records Search: Drivers, Routes, Stops, Students..."
                  style={{ paddingLeft: '42px', height: '46px', fontSize: '0.95rem' }}
                  value={globalSearch}
                  onChange={(e) => setGlobalSearch(e.target.value)}
                />
                {globalSearch && (
                  <button 
                    onClick={() => setGlobalSearch('')}
                    style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-tertiary)', cursor: 'pointer' }}
                  >
                    <X size={16} />
                  </button>
                )}
              </div>
            </div>

            {/* 1. OVERVIEW SECTION */}
            {activeSection === 'overview' && !selectedDriverId && !selectedRouteId && !selectedStopId && !selectedStudentId && (
              <div>
                <h2 style={{ color: 'var(--text-primary)', marginBottom: 'var(--space-6)' }}>Records Summary Dashboard</h2>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--space-5)', marginBottom: 'var(--space-8)' }}>
                  <div className="card" onClick={() => setActiveSection('drivers')} style={{ cursor: 'pointer', padding: 'var(--space-5)', borderLeft: '4px solid var(--accent)' }}>
                    <div style={{ color: 'var(--text-tertiary)', fontSize: '0.8rem', textTransform: 'uppercase' }}>Total Drivers</div>
                    <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '4px' }}>{driversList.length}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--accent)', marginTop: '8px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      View Driver Profiles <ChevronRight size={14} />
                    </div>
                  </div>

                  <div className="card" onClick={() => setActiveSection('routes')} style={{ cursor: 'pointer', padding: 'var(--space-5)', borderLeft: '4px solid var(--success)' }}>
                    <div style={{ color: 'var(--text-tertiary)', fontSize: '0.8rem', textTransform: 'uppercase' }}>Total Routes</div>
                    <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '4px' }}>{routesList.length}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--success)', marginTop: '8px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      View All Routes <ChevronRight size={14} />
                    </div>
                  </div>

                  <div className="card" onClick={() => setActiveSection('stops')} style={{ cursor: 'pointer', padding: 'var(--space-5)', borderLeft: '4px solid #3b82f6' }}>
                    <div style={{ color: 'var(--text-tertiary)', fontSize: '0.8rem', textTransform: 'uppercase' }}>Total Stops</div>
                    <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '4px' }}>{stopsList.length}</div>
                    <div style={{ fontSize: '0.8rem', color: '#3b82f6', marginTop: '8px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      View Bus Stops <ChevronRight size={14} />
                    </div>
                  </div>

                  <div className="card" onClick={() => setActiveSection('students')} style={{ cursor: 'pointer', padding: 'var(--space-5)', borderLeft: '4px solid #8b5cf6' }}>
                    <div style={{ color: 'var(--text-tertiary)', fontSize: '0.8rem', textTransform: 'uppercase' }}>Total Students</div>
                    <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '4px' }}>{studentsList.length}</div>
                    <div style={{ fontSize: '0.8rem', color: '#8b5cf6', marginTop: '8px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      View Student Roster <ChevronRight size={14} />
                    </div>
                  </div>

                  <div className="card" onClick={() => setActiveSection('sos-history')} style={{ cursor: 'pointer', padding: 'var(--space-5)', borderLeft: '4px solid var(--danger)' }}>
                    <div style={{ color: 'var(--text-tertiary)', fontSize: '0.8rem', textTransform: 'uppercase' }}>Active / Total SOS</div>
                    <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--danger)', marginTop: '4px' }}>
                      {getEmergencyMessages().filter(m => m.status === 'NEW').length} / {getEmergencyMessages().length + getSOSHistory().length}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--danger)', marginTop: '8px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      View SOS Log <ChevronRight size={14} />
                    </div>
                  </div>

                  <div className="card" onClick={() => setActiveSection('students')} style={{ cursor: 'pointer', padding: 'var(--space-5)', borderLeft: '4px solid var(--warning)' }}>
                    <div style={{ color: 'var(--text-tertiary)', fontSize: '0.8rem', textTransform: 'uppercase' }}>Pending Fees</div>
                    <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--warning)', marginTop: '4px' }}>
                      {feesDB.filter(f => f.status === 'Pending' || f.status === 'Overdue').length}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--warning)', marginTop: '8px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      View Fee Details <ChevronRight size={14} />
                    </div>
                  </div>
                </div>

                {/* Quick Driver Roster Table */}
                <div className="card" style={{ padding: 'var(--space-6)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)' }}>
                    <h3 style={{ color: 'var(--text-primary)', margin: 0 }}>Driver Overview</h3>
                    <button className="btn btn-ghost btn-sm" onClick={() => setActiveSection('drivers')}>View All Drivers →</button>
                  </div>
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Driver Name</th>
                        <th>Driver ID</th>
                        <th>Phone Number</th>
                        <th>Assigned Bus</th>
                        <th>Route</th>
                        <th>Total SOS</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {driversList.map(d => (
                        <tr key={d.driverId}>
                          <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{d.name}</td>
                          <td><span className="badge badge-neutral">{d.driverId}</span></td>
                          <td style={{ color: 'var(--text-secondary)' }}>{d.phone}</td>
                          <td style={{ color: 'var(--text-primary)' }}>{d.busNumber}</td>
                          <td style={{ color: 'var(--text-secondary)' }}>{d.routeName}</td>
                          <td>
                            <span className={`badge ${d.totalSOS > 0 ? 'badge-danger' : 'badge-neutral'}`}>{d.totalSOS}</span>
                          </td>
                          <td>
                            <button
                              className="btn btn-outline btn-sm"
                              onClick={() => {
                                setSelectedDriverId(d.driverId);
                                setActiveSection('drivers');
                              }}
                            >
                              View Profile
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* 2. DRIVERS SECTION */}
            {activeSection === 'drivers' && (
              <div>
                {!selectedDriverId ? (
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-6)' }}>
                      <div>
                        <h2 style={{ color: 'var(--text-primary)', margin: 0 }}>Driver Records Directory</h2>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '4px' }}>All registered school bus drivers and operational safety histories.</p>
                      </div>
                      <div style={{ color: 'var(--text-tertiary)', fontSize: '0.85rem' }}>Showing {filteredDrivers.length} Drivers</div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 'var(--space-5)' }}>
                      {filteredDrivers.map(driver => (
                        <motion.div
                          key={driver.driverId}
                          whileHover={{ y: -3 }}
                          className="card card-interactive"
                          style={{ padding: 'var(--space-6)', display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
                            <div style={{
                              width: '52px', height: '52px', borderRadius: '50%',
                              background: 'var(--accent-muted)', color: 'var(--accent)',
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              fontWeight: 700, fontSize: '1.25rem', border: '1px solid var(--border)',
                              flexShrink: 0
                            }}>
                              {driver.name.charAt(0)}
                            </div>
                            <div style={{ flex: 1 }}>
                              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <h3 style={{ color: 'var(--text-primary)', margin: 0, fontSize: '1.1rem' }}>{driver.name}</h3>
                                <span className="badge badge-neutral">{driver.driverId}</span>
                              </div>
                              <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <Phone size={12} /> {driver.phone}
                              </div>
                            </div>
                          </div>

                          <div style={{ background: 'var(--bg-elevated)', padding: 'var(--space-4)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.85rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                              <span style={{ color: 'var(--text-tertiary)' }}>Assigned Bus:</span>
                              <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{driver.busNumber} ({driver.registrationNumber})</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                              <span style={{ color: 'var(--text-tertiary)' }}>Assigned Route:</span>
                              <span style={{ color: 'var(--text-secondary)' }}>{driver.routeName}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                              <span style={{ color: 'var(--text-tertiary)' }}>Total SOS Alerts:</span>
                              <span className={`badge ${driver.totalSOS > 0 ? 'badge-danger' : 'badge-success'}`}>{driver.totalSOS} Alerts</span>
                            </div>
                          </div>

                          <button
                            className="btn btn-primary"
                            onClick={() => setSelectedDriverId(driver.driverId)}
                            style={{ width: '100%', marginTop: '4px' }}
                          >
                            View Full Driver Profile
                          </button>
                        </motion.div>
                      ))}

                      {filteredDrivers.length === 0 && (
                        <div style={{ gridColumn: '1 / -1', padding: 'var(--space-12)', textAlign: 'center', color: 'var(--text-tertiary)' }}>
                          No drivers found matching your search.
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  /* DRIVER PROFILE DETAILS VIEW */
                  <div>
                    <button
                      className="btn btn-ghost btn-sm"
                      onClick={() => setSelectedDriverId(null)}
                      style={{ marginBottom: 'var(--space-4)', display: 'flex', alignItems: 'center', gap: '6px' }}
                    >
                      <ArrowLeft size={16} /> Back to Driver List
                    </button>

                    {activeDriver && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
                        {/* Driver Header Card */}
                        <div className="card" style={{ padding: 'var(--space-6)', borderLeft: '4px solid var(--accent)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-5)' }}>
                            <div style={{
                              width: '64px', height: '64px', borderRadius: '50%',
                              background: 'var(--accent)', color: '#fff',
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              fontWeight: 700, fontSize: '1.75rem'
                            }}>
                              {activeDriver.name.charAt(0)}
                            </div>
                            <div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <h1 style={{ color: 'var(--text-primary)', margin: 0, fontSize: '1.5rem' }}>{activeDriver.name}</h1>
                                <span className="badge badge-info">{activeDriver.driverId}</span>
                                <span className="badge badge-success">Active Driver</span>
                              </div>
                              <div style={{ color: 'var(--text-secondary)', marginTop: '4px', fontSize: '0.9rem' }}>
                                Assigned Bus: <strong>{activeDriver.busNumber}</strong> ({activeDriver.registrationNumber}) | Route: <strong>{activeDriver.routeName}</strong>
                              </div>
                            </div>
                          </div>

                          <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
                            <button
                              className="btn btn-outline"
                              onClick={() => {
                                setSelectedRouteId(activeDriver.routeId);
                                setActiveSection('routes');
                              }}
                              style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                            >
                              <Route size={16} /> View Assigned Route
                            </button>
                          </div>
                        </div>

                        {/* Two Columns: Info & SOS Summary */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 'var(--space-6)' }}>
                          {/* Personal & Employment Info */}
                          <div className="card" style={{ padding: 'var(--space-6)' }}>
                            <h3 style={{ color: 'var(--text-primary)', borderBottom: '1px solid var(--border)', paddingBottom: '12px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <User size={18} color="var(--accent)" /> Personal & Employment Information
                            </h3>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.9rem' }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span style={{ color: 'var(--text-secondary)' }}>Full Name:</span>
                                <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{activeDriver.name}</span>
                              </div>
                              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span style={{ color: 'var(--text-secondary)' }}>Driver ID:</span>
                                <span style={{ color: 'var(--text-primary)' }}>{activeDriver.driverId}</span>
                              </div>
                              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span style={{ color: 'var(--text-secondary)' }}>Phone Number:</span>
                                <span style={{ color: 'var(--text-primary)' }}>{activeDriver.phone}</span>
                              </div>
                              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span style={{ color: 'var(--text-secondary)' }}>Alternate Phone:</span>
                                <span style={{ color: 'var(--text-primary)' }}>{activeDriver.alternatePhone}</span>
                              </div>
                              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span style={{ color: 'var(--text-secondary)' }}>Complete Address:</span>
                                <span style={{ color: 'var(--text-primary)' }}>{activeDriver.address}</span>
                              </div>
                              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span style={{ color: 'var(--text-secondary)' }}>Emergency Contact:</span>
                                <span style={{ color: 'var(--danger)', fontWeight: 600 }}>{activeDriver.emergencyContact}</span>
                              </div>
                              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span style={{ color: 'var(--text-secondary)' }}>Joining Date:</span>
                                <span style={{ color: 'var(--text-primary)' }}>{activeDriver.joiningDate}</span>
                              </div>
                            </div>
                          </div>

                          {/* SOS Summary */}
                          <div className="card" style={{ padding: 'var(--space-6)' }}>
                            <h3 style={{ color: 'var(--text-primary)', borderBottom: '1px solid var(--border)', paddingBottom: '12px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <AlertTriangle size={18} color="var(--danger)" /> Driver SOS Summary
                            </h3>

                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px', marginBottom: '16px' }}>
                              <div style={{ background: 'var(--bg-elevated)', padding: '12px', borderRadius: '8px', textAlign: 'center' }}>
                                <div style={{ color: 'var(--text-tertiary)', fontSize: '0.75rem' }}>Total SOS Alerts</div>
                                <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '2px' }}>{activeDriver.totalSOS}</div>
                              </div>
                              <div style={{ background: 'var(--bg-elevated)', padding: '12px', borderRadius: '8px', textAlign: 'center' }}>
                                <div style={{ color: 'var(--text-tertiary)', fontSize: '0.75rem' }}>Active SOS</div>
                                <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--danger)', marginTop: '2px' }}>{activeDriver.activeSOS}</div>
                              </div>
                              <div style={{ background: 'var(--bg-elevated)', padding: '12px', borderRadius: '8px', textAlign: 'center' }}>
                                <div style={{ color: 'var(--text-tertiary)', fontSize: '0.75rem' }}>Resolved SOS</div>
                                <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--success)', marginTop: '2px' }}>{activeDriver.resolvedSOS}</div>
                              </div>
                              <div style={{ background: 'var(--bg-elevated)', padding: '12px', borderRadius: '8px', textAlign: 'center' }}>
                                <div style={{ color: 'var(--text-tertiary)', fontSize: '0.75rem' }}>Last SOS Alert</div>
                                <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginTop: '6px' }}>
                                  {activeDriver.lastSOS ? new Date(activeDriver.lastSOS.createdAt).toLocaleDateString() : 'None'}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* DRIVER SOS HISTORY LOG */}
                        <div className="card" style={{ padding: 'var(--space-6)' }}>
                          <h3 style={{ color: 'var(--text-primary)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <History size={18} color="var(--accent)" /> Driver SOS History
                          </h3>

                          <table className="data-table">
                            <thead>
                              <tr>
                                <th>SOS ID</th>
                                <th>Date & Time</th>
                                <th>Bus & Route</th>
                                <th>Location</th>
                                <th>SOS Message</th>
                                <th>Status</th>
                              </tr>
                            </thead>
                            <tbody>
                              {activeDriver.sosHistory.map((sos) => (
                                <tr key={sos.emergencyId}>
                                  <td><span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{sos.emergencyId}</span></td>
                                  <td>
                                    <div style={{ color: 'var(--text-primary)', fontSize: '0.85rem' }}>{new Date(sos.createdAt).toLocaleDateString()}</div>
                                    <div style={{ color: 'var(--text-tertiary)', fontSize: '0.75rem' }}>{new Date(sos.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                                  </td>
                                  <td style={{ color: 'var(--text-secondary)' }}>{activeDriver.busNumber} ({activeDriver.routeName})</td>
                                  <td style={{ color: 'var(--text-secondary)' }}>{sos.location}</td>
                                  <td style={{ color: 'var(--text-primary)' }}>{sos.driverMessage}</td>
                                  <td>
                                    <span className={`badge ${sos.status === 'NEW' ? 'badge-danger' : sos.status === 'RESOLVED' ? 'badge-success' : 'badge-warning'}`}>
                                      {sos.status}
                                    </span>
                                  </td>
                                </tr>
                              ))}
                              {activeDriver.sosHistory.length === 0 && (
                                <tr>
                                  <td colSpan={6} style={{ textAlign: 'center', padding: 'var(--space-8)', color: 'var(--text-tertiary)' }}>
                                    No SOS alerts recorded for this driver. Clean record!
                                  </td>
                                </tr>
                              )}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* 3. ROUTES SECTION */}
            {activeSection === 'routes' && (
              <div>
                {!selectedRouteId ? (
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-6)' }}>
                      <div>
                        <h2 style={{ color: 'var(--text-primary)', margin: 0 }}>School Bus Routes Directory</h2>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '4px' }}>All active transportation routes and coverage pathways.</p>
                      </div>
                      <div style={{ color: 'var(--text-tertiary)', fontSize: '0.85rem' }}>Showing {filteredRoutes.length} Routes</div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 'var(--space-5)' }}>
                      {filteredRoutes.map(route => (
                        <motion.div
                          key={route.routeId}
                          whileHover={{ y: -3 }}
                          className="card card-interactive"
                          style={{ padding: 'var(--space-6)', display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <div>
                              <span className="badge badge-info" style={{ marginBottom: '6px' }}>{route.routeId}</span>
                              <h3 style={{ color: 'var(--text-primary)', margin: '4px 0 0 0', fontSize: '1.25rem' }}>{route.routeName}</h3>
                            </div>
                            <span className="badge badge-success">Active</span>
                          </div>

                          <div style={{ background: 'var(--bg-elevated)', padding: 'var(--space-4)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.85rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                              <span style={{ color: 'var(--text-tertiary)' }}>Driver:</span>
                              <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{route.driverName}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                              <span style={{ color: 'var(--text-tertiary)' }}>Assigned Bus:</span>
                              <span style={{ color: 'var(--text-primary)' }}>{route.busNumber} ({route.registrationNumber})</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                              <span style={{ color: 'var(--text-tertiary)' }}>Pathway:</span>
                              <span style={{ color: 'var(--text-secondary)' }}>{route.startPoint} → {route.endPoint}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                              <span style={{ color: 'var(--text-tertiary)' }}>Total Stops:</span>
                              <span className="badge badge-neutral">{route.stops.length} Stops</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                              <span style={{ color: 'var(--text-tertiary)' }}>Assigned Students:</span>
                              <span className="badge badge-info">{route.totalStudents} Students</span>
                            </div>
                          </div>

                          <button
                            className="btn btn-primary"
                            onClick={() => setSelectedRouteId(route.routeId)}
                            style={{ width: '100%', marginTop: '4px' }}
                          >
                            View Full Route Details & Map
                          </button>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                ) : (
                  /* ROUTE DETAILS VIEW WITH SEQUENCED STOPS */
                  <div>
                    <button
                      className="btn btn-ghost btn-sm"
                      onClick={() => setSelectedRouteId(null)}
                      style={{ marginBottom: 'var(--space-4)', display: 'flex', alignItems: 'center', gap: '6px' }}
                    >
                      <ArrowLeft size={16} /> Back to Routes List
                    </button>

                    {activeRoute && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
                        <div className="card" style={{ padding: 'var(--space-6)', borderLeft: '4px solid var(--success)' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <h1 style={{ color: 'var(--text-primary)', margin: 0 }}>{activeRoute.routeName}</h1>
                                <span className="badge badge-info">{activeRoute.routeId}</span>
                                <span className="badge badge-success">Active Route</span>
                              </div>
                              <p style={{ color: 'var(--text-secondary)', marginTop: '6px', margin: 0 }}>
                                Start: <strong>{activeRoute.startPoint}</strong> → Destination: <strong>{activeRoute.endPoint}</strong>
                              </p>
                            </div>

                            <div style={{ textAlign: 'right' }}>
                              <div style={{ color: 'var(--text-primary)', fontWeight: 600 }}>Bus: {activeRoute.busNumber}</div>
                              <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Driver: {activeRoute.driverName}</div>
                            </div>
                          </div>
                        </div>

                        {/* Sequenced Route Path Visualization */}
                        <div className="card" style={{ padding: 'var(--space-6)' }}>
                          <h3 style={{ color: 'var(--text-primary)', marginBottom: 'var(--space-6)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Route size={18} color="var(--accent)" /> Sequenced Route Stops Pathway
                          </h3>

                          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            {activeRoute.stops.map((st, idx) => (
                              <div
                                key={st.stopId}
                                onClick={() => {
                                  setSelectedStopId(st.stopId);
                                  setActiveSection('stops');
                                }}
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  justify: 'space-between',
                                  padding: '14px 20px',
                                  background: 'var(--bg-elevated)',
                                  borderRadius: 'var(--radius-md)',
                                  border: '1px solid var(--border)',
                                  cursor: 'pointer',
                                  transition: 'all 0.15s ease'
                                }}
                              >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                  <div style={{
                                    width: '32px', height: '32px', borderRadius: '50%',
                                    background: 'var(--accent-muted)', color: 'var(--accent)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontWeight: 700, fontSize: '0.85rem'
                                  }}>
                                    {idx + 1}
                                  </div>
                                  <div>
                                    <div style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{st.name}</div>
                                    <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>{st.address}</div>
                                  </div>
                                </div>

                                <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                                  <div style={{ textAlign: 'right' }}>
                                    <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>Scheduled Arrival</div>
                                    <div style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{st.arrivalTime}</div>
                                  </div>
                                  <ChevronRight size={18} color="var(--text-tertiary)" />
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* 4. STOPS SECTION */}
            {activeSection === 'stops' && (
              <div>
                {!selectedStopId ? (
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-6)' }}>
                      <div>
                        <h2 style={{ color: 'var(--text-primary)', margin: 0 }}>Bus Stops Directory</h2>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '4px' }}>Click any stop to view assigned student passengers.</p>
                      </div>
                      <div style={{ color: 'var(--text-tertiary)', fontSize: '0.85rem' }}>Showing {filteredStops.length} Stops</div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 'var(--space-5)' }}>
                      {filteredStops.map(st => (
                        <motion.div
                          key={st.stopId}
                          whileHover={{ y: -3 }}
                          className="card card-interactive"
                          onClick={() => setSelectedStopId(st.stopId)}
                          style={{ padding: 'var(--space-6)', display: 'flex', flexDirection: 'column', gap: 'var(--space-3)', cursor: 'pointer' }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <h3 style={{ color: 'var(--text-primary)', margin: 0, fontSize: '1.1rem' }}>{st.name}</h3>
                            <span className="badge badge-info">{st.stopId}</span>
                          </div>

                          <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                            <MapPin size={14} style={{ display: 'inline', marginRight: '4px' }} /> {st.address}
                          </div>

                          <div style={{ background: 'var(--bg-elevated)', padding: '10px 14px', borderRadius: 'var(--radius-md)', display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                            <span>Route: <strong style={{ color: 'var(--text-primary)' }}>{st.routeName}</strong></span>
                            <span>Arrival: <strong style={{ color: 'var(--accent)' }}>{st.arrivalTime}</strong></span>
                          </div>

                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px' }}>
                            <span className="badge badge-neutral">{st.totalStudents} Assigned Students</span>
                            <span style={{ color: 'var(--accent)', fontSize: '0.85rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '2px' }}>
                              View Students <ChevronRight size={14} />
                            </span>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                ) : (
                  /* STOP DETAILS & PASSENGER STUDENT ROSTER */
                  <div>
                    <button
                      className="btn btn-ghost btn-sm"
                      onClick={() => setSelectedStopId(null)}
                      style={{ marginBottom: 'var(--space-4)', display: 'flex', alignItems: 'center', gap: '6px' }}
                    >
                      <ArrowLeft size={16} /> Back to Stops Directory
                    </button>

                    {activeStop && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
                        <div className="card" style={{ padding: 'var(--space-6)', borderLeft: '4px solid #3b82f6' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <h1 style={{ color: 'var(--text-primary)', margin: 0 }}>{activeStop.name}</h1>
                                <span className="badge badge-info">{activeStop.stopId}</span>
                              </div>
                              <p style={{ color: 'var(--text-secondary)', marginTop: '6px', margin: 0 }}>
                                Address: {activeStop.address} | Route: <strong>{activeStop.routeName}</strong> | Bus: <strong>{activeStop.busNumber}</strong>
                              </p>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                              <div style={{ color: 'var(--accent)', fontWeight: 700, fontSize: '1.1rem' }}>Arr: {activeStop.arrivalTime}</div>
                              <div style={{ color: 'var(--text-tertiary)', fontSize: '0.8rem' }}>Dep: {activeStop.departureTime}</div>
                            </div>
                          </div>
                        </div>

                        <div className="card" style={{ padding: 'var(--space-6)' }}>
                          <h3 style={{ color: 'var(--text-primary)', marginBottom: 'var(--space-4)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <GraduationCap size={18} color="var(--accent)" /> Students Assigned to {activeStop.name} ({activeStop.assignedStudents.length})
                          </h3>

                          <table className="data-table">
                            <thead>
                              <tr>
                                <th>Student Name</th>
                                <th>Student ID</th>
                                <th>Class & Sec</th>
                                <th>Parent Name</th>
                                <th>Parent Phone</th>
                                <th>Action</th>
                              </tr>
                            </thead>
                            <tbody>
                              {activeStop.assignedStudents.map(student => (
                                <tr key={student.studentId}>
                                  <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{student.name}</td>
                                  <td><span className="badge badge-neutral">{student.studentId}</span></td>
                                  <td style={{ color: 'var(--text-secondary)' }}>{student.class} - {student.section}</td>
                                  <td style={{ color: 'var(--text-primary)' }}>{student.parentName}</td>
                                  <td style={{ color: 'var(--text-secondary)' }}>{student.parentPhone}</td>
                                  <td>
                                    <button
                                      className="btn btn-outline btn-sm"
                                      onClick={() => {
                                        setSelectedStudentId(student.studentId);
                                        setActiveSection('students');
                                      }}
                                    >
                                      View Student Profile
                                    </button>
                                  </td>
                                </tr>
                              ))}
                              {activeStop.assignedStudents.length === 0 && (
                                <tr>
                                  <td colSpan={6} style={{ textAlign: 'center', padding: 'var(--space-8)', color: 'var(--text-tertiary)' }}>
                                    No students are currently assigned to this stop.
                                  </td>
                                </tr>
                              )}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* 5. STUDENTS SECTION */}
            {activeSection === 'students' && (
              <div>
                {!selectedStudentId ? (
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)' }}>
                      <div>
                        <h2 style={{ color: 'var(--text-primary)', margin: 0 }}>Student Records & Fee Directory</h2>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '4px' }}>Complete transportation roster and fee status monitoring.</p>
                      </div>
                    </div>

                    {/* Filters Row */}
                    <div style={{ display: 'flex', gap: 'var(--space-4)', marginBottom: 'var(--space-6)', flexWrap: 'wrap' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-tertiary)', marginBottom: '4px' }}>Class Filter</label>
                        <select className="input" style={{ height: '38px', width: '130px' }} value={classFilter} onChange={e => setClassFilter(e.target.value)}>
                          <option value="ALL">All Classes</option>
                          <option value="6th">6th</option>
                          <option value="7th">7th</option>
                          <option value="8th">8th</option>
                          <option value="9th">9th</option>
                        </select>
                      </div>

                      <div>
                        <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-tertiary)', marginBottom: '4px' }}>Route Filter</label>
                        <select className="input" style={{ height: '38px', width: '150px' }} value={routeFilter} onChange={e => setRouteFilter(e.target.value)}>
                          <option value="ALL">All Routes</option>
                          <option value="R01">R01 (GLA-Mathura)</option>
                          <option value="R02">R02 (GLA-Agra)</option>
                          <option value="R03">R03 (Govardhan)</option>
                        </select>
                      </div>

                      <div>
                        <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-tertiary)', marginBottom: '4px' }}>Fee Status</label>
                        <select className="input" style={{ height: '38px', width: '150px' }} value={feeStatusFilter} onChange={e => setFeeStatusFilter(e.target.value)}>
                          <option value="ALL">All Fee Status</option>
                          <option value="Paid">Paid</option>
                          <option value="Pending">Pending</option>
                          <option value="Overdue">Overdue</option>
                        </select>
                      </div>
                    </div>

                    {/* Students Table */}
                    <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                      <table className="data-table">
                        <thead>
                          <tr>
                            <th>Student Name</th>
                            <th>Student ID</th>
                            <th>Class & Sec</th>
                            <th>Age</th>
                            <th>Parent Details</th>
                            <th>Boarding Stop</th>
                            <th>Bus & Route</th>
                            <th>Fee Status</th>
                            <th>Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredStudents.map(st => (
                            <tr key={st.studentId}>
                              <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{st.name}</td>
                              <td><span className="badge badge-neutral">{st.studentId}</span></td>
                              <td style={{ color: 'var(--text-secondary)' }}>{st.class} - {st.section}</td>
                              <td style={{ color: 'var(--text-primary)' }}>{st.age} yrs</td>
                              <td>
                                <div style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{st.parentName}</div>
                                <div style={{ color: 'var(--text-tertiary)', fontSize: '0.75rem' }}>{st.parentPhone}</div>
                              </td>
                              <td style={{ color: 'var(--text-secondary)' }}>{st.pickupPoint}</td>
                              <td>
                                <div style={{ color: 'var(--text-primary)' }}>{st.busNumber}</div>
                                <div style={{ color: 'var(--text-tertiary)', fontSize: '0.75rem' }}>{st.routeName}</div>
                              </td>
                              <td>
                                <span className={`badge ${st.feeStatus === 'Paid' ? 'badge-success' : st.feeStatus === 'Pending' ? 'badge-warning' : 'badge-danger'}`}>
                                  {st.feeStatus}
                                </span>
                              </td>
                              <td>
                                <button
                                  className="btn btn-outline btn-sm"
                                  onClick={() => setSelectedStudentId(st.studentId)}
                                >
                                  View Profile
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ) : (
                  /* STUDENT PROFILE MODAL/PANEL */
                  <div>
                    <button
                      className="btn btn-ghost btn-sm"
                      onClick={() => setSelectedStudentId(null)}
                      style={{ marginBottom: 'var(--space-4)', display: 'flex', alignItems: 'center', gap: '6px' }}
                    >
                      <ArrowLeft size={16} /> Back to Student Roster
                    </button>

                    {activeStudent && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
                        <div className="card" style={{ padding: 'var(--space-6)', borderLeft: '4px solid #8b5cf6' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <h1 style={{ color: 'var(--text-primary)', margin: 0 }}>{activeStudent.name}</h1>
                                <span className="badge badge-info">{activeStudent.studentId}</span>
                                <span className="badge badge-success">{activeStudent.status}</span>
                              </div>
                              <p style={{ color: 'var(--text-secondary)', marginTop: '6px', margin: 0 }}>
                                Class: <strong>{activeStudent.class} ({activeStudent.section})</strong> | Age: <strong>{activeStudent.age} Years</strong> (DOB: {activeStudent.dob})
                              </p>
                            </div>

                            <span className={`badge ${activeStudent.feeStatus === 'Paid' ? 'badge-success' : 'badge-danger'}`} style={{ fontSize: '1rem', padding: '6px 16px' }}>
                              Fee: {activeStudent.feeStatus}
                            </span>
                          </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 'var(--space-6)' }}>
                          {/* Parent Details */}
                          <div className="card" style={{ padding: 'var(--space-6)' }}>
                            <h3 style={{ color: 'var(--text-primary)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <User size={18} color="var(--accent)" /> Parent / Guardian Information
                            </h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.9rem' }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span style={{ color: 'var(--text-secondary)' }}>Parent Name:</span>
                                <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{activeStudent.parentName}</span>
                              </div>
                              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span style={{ color: 'var(--text-secondary)' }}>Phone Number:</span>
                                <span style={{ color: 'var(--text-primary)' }}>{activeStudent.parentPhone}</span>
                              </div>
                              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span style={{ color: 'var(--text-secondary)' }}>Alternate Phone:</span>
                                <span style={{ color: 'var(--text-primary)' }}>{activeStudent.alternatePhone}</span>
                              </div>
                              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span style={{ color: 'var(--text-secondary)' }}>Residential Address:</span>
                                <span style={{ color: 'var(--text-primary)' }}>{activeStudent.address}</span>
                              </div>
                            </div>
                          </div>

                          {/* Transportation Details */}
                          <div className="card" style={{ padding: 'var(--space-6)' }}>
                            <h3 style={{ color: 'var(--text-primary)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <Bus size={18} color="var(--accent)" /> Transportation Details
                            </h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.9rem' }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span style={{ color: 'var(--text-secondary)' }}>Assigned Bus:</span>
                                <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{activeStudent.busNumber} ({activeStudent.registrationNumber})</span>
                              </div>
                              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span style={{ color: 'var(--text-secondary)' }}>Route Name:</span>
                                <span style={{ color: 'var(--text-primary)' }}>{activeStudent.routeName}</span>
                              </div>
                              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span style={{ color: 'var(--text-secondary)' }}>Boarding Stop:</span>
                                <span style={{ color: 'var(--accent)', fontWeight: 600 }}>{activeStudent.pickupPoint}</span>
                              </div>
                              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span style={{ color: 'var(--text-secondary)' }}>Driver Name:</span>
                                <span style={{ color: 'var(--text-primary)' }}>{activeStudent.driverName} ({activeStudent.driverId})</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Fee Status Card */}
                        <div className="card" style={{ padding: 'var(--space-6)' }}>
                          <h3 style={{ color: 'var(--text-primary)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <DollarSign size={18} color="var(--warning)" /> Fee Status & Payment History
                          </h3>

                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                            <div style={{ background: 'var(--bg-elevated)', padding: '14px', borderRadius: '8px' }}>
                              <div style={{ color: 'var(--text-tertiary)', fontSize: '0.8rem' }}>Monthly Fee</div>
                              <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '4px' }}>₹{activeStudent.feeDetails.feePerMonth} / mo</div>
                            </div>

                            <div style={{ background: 'var(--bg-elevated)', padding: '14px', borderRadius: '8px' }}>
                              <div style={{ color: 'var(--text-tertiary)', fontSize: '0.8rem' }}>Total Paid</div>
                              <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--success)', marginTop: '4px' }}>₹{activeStudent.feeDetails.totalPaid}</div>
                            </div>

                            <div style={{ background: 'var(--bg-elevated)', padding: '14px', borderRadius: '8px' }}>
                              <div style={{ color: 'var(--text-tertiary)', fontSize: '0.8rem' }}>Pending Due</div>
                              <div style={{ fontSize: '1.25rem', fontWeight: 700, color: activeStudent.feeDetails.totalDue > 0 ? 'var(--danger)' : 'var(--text-secondary)', marginTop: '4px' }}>₹{activeStudent.feeDetails.totalDue}</div>
                            </div>

                            <div style={{ background: 'var(--bg-elevated)', padding: '14px', borderRadius: '8px' }}>
                              <div style={{ color: 'var(--text-tertiary)', fontSize: '0.8rem' }}>Last Payment Date</div>
                              <div style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)', marginTop: '4px' }}>{activeStudent.feeDetails.lastPaymentDate}</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* 6. SOS HISTORY SECTION */}
            {activeSection === 'sos-history' && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-6)' }}>
                  <div>
                    <h2 style={{ color: 'var(--text-primary)', margin: 0 }}>Archived SOS Incident Log</h2>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '4px' }}>Historical record of all resolved or removed emergency SOS alerts.</p>
                  </div>
                  <div style={{ color: 'var(--text-tertiary)', fontSize: '0.85rem' }}>Total Records: {getSOSHistory().length}</div>
                </div>

                <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>SOS ID</th>
                        <th>Timestamp</th>
                        <th>Driver & Bus</th>
                        <th>Location</th>
                        <th>Incident Details</th>
                        <th>Status</th>
                        <th>Archived By</th>
                      </tr>
                    </thead>
                    <tbody>
                      {getSOSHistory().map(sos => (
                        <tr key={sos.emergencyId}>
                          <td><span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{sos.emergencyId}</span></td>
                          <td style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{new Date(sos.createdAt).toLocaleString()}</td>
                          <td>
                            <div style={{ color: 'var(--text-primary)' }}>{sos.driverId}</div>
                            <div style={{ color: 'var(--text-tertiary)', fontSize: '0.75rem' }}>{sos.busId}</div>
                          </td>
                          <td style={{ color: 'var(--text-secondary)' }}>{sos.location}</td>
                          <td style={{ color: 'var(--text-primary)' }}>{sos.driverMessage}</td>
                          <td><span className="badge badge-success">{sos.status}</span></td>
                          <td style={{ color: 'var(--text-tertiary)', fontSize: '0.8rem' }}>{sos.archivedBy || 'Admin'}</td>
                        </tr>
                      ))}
                      {getSOSHistory().length === 0 && (
                        <tr>
                          <td colSpan={7} style={{ textAlign: 'center', padding: 'var(--space-8)', color: 'var(--text-tertiary)' }}>
                            No archived SOS records found.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
