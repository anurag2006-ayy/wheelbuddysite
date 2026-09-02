import { useState, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../i18n/LanguageContext';
import Sidebar from '../components/Sidebar';
import LanguageSwitcher from '../components/LanguageSwitcher';
import StatCard from '../components/StatCard';
import StatusBadge from '../components/StatusBadge';
import { routesDB, busesDB, driversDB, studentsDB } from '../data/mockData';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, X, User, Users, Shield, MapPin, 
  Phone, AlertCircle, Bus, Map as MapIcon, ChevronRight, UserCheck, UserX
} from 'lucide-react';
import './Admin.css';
import '../components/DataTable.css';

export default function AdminDrivers() {
  const { user, logout } = useAuth();
  const { t } = useLanguage();
  
  // Search state
  const [driverSearchQuery, setDriverSearchQuery] = useState('');
  const [selectedDriver, setSelectedDriver] = useState(null);

  // Filter state for students table
  const [studentSearch, setStudentSearch] = useState('');
  const [classFilter, setClassFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  // Modal state
  const [selectedStudent, setSelectedStudent] = useState(null);

  const handleDriverSearch = () => {
    const q = driverSearchQuery.trim().toLowerCase();
    if (!q) return;
    
    const found = driversDB.find(d => 
      d.driverId.toLowerCase() === q || d.name.toLowerCase().includes(q)
    );
    
    if (found) {
      setSelectedDriver(found);
    } else {
      alert('Driver not found. Please try another Driver ID or Name.');
      setSelectedDriver(null);
    }
  };

  const assignedBus = useMemo(() => {
    if (!selectedDriver) return null;
    return busesDB.find(b => b.busId === selectedDriver.busId) || null;
  }, [selectedDriver]);

  const assignedRoute = useMemo(() => {
    if (!selectedDriver) return null;
    return routesDB.find(r => r.routeId === selectedDriver.routeId) || null;
  }, [selectedDriver]);

  const routeStudents = useMemo(() => {
    if (!selectedDriver) return [];
    return studentsDB.filter(s => s.routeId === selectedDriver.routeId);
  }, [selectedDriver]);

  const activeStudents = routeStudents.filter(s => s.status === 'Active').length;
  const inactiveStudents = routeStudents.length - activeStudents;

  const filteredStudents = useMemo(() => {
    return routeStudents.filter(s => {
      const matchSearch = s.name.toLowerCase().includes(studentSearch.toLowerCase()) || 
                          s.studentId.toLowerCase().includes(studentSearch.toLowerCase());
      const matchClass = classFilter === 'All' || s.class === classFilter;
      const matchStatus = statusFilter === 'All' || s.status === statusFilter;
      return matchSearch && matchClass && matchStatus;
    });
  }, [routeStudents, studentSearch, classFilter, statusFilter]);

  const uniqueClasses = useMemo(() => {
    const classes = new Set(studentsDB.map(s => s.class));
    return Array.from(classes).sort();
  }, []);

  return (
    <div className="admin">
      <Sidebar onLogout={logout} />

      <div className="admin-page" style={{ marginLeft: 'var(--sidebar-w)', minHeight: '100vh', padding: 'var(--space-8)', background: 'var(--bg-primary)' }}>
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-8)' }}>
          <div>
            <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 'var(--space-1)' }}>
              {t('adminDashboard') || 'Fleet Overview'}
            </p>
            <h1 style={{ color: 'var(--text-primary)', fontSize: 'var(--text-3xl)', fontWeight: '600', margin: 0, letterSpacing: '-0.02em' }}>
              Driver & Route Details
            </h1>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
            <LanguageSwitcher />
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', background: 'var(--bg-surface)', padding: 'var(--space-2) var(--space-4)', borderRadius: 'var(--radius-full)', border: '1px solid var(--border-color)' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--accent)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '600' }}>
                {(user?.name || '?').charAt(0).toUpperCase()}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ color: 'var(--text-primary)', fontSize: 'var(--text-sm)', fontWeight: '500' }}>{user?.name}</span>
                <span style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-xs)' }}>{t('roleAdmin')}</span>
              </div>
            </div>
          </div>
        </header>

        <div className="container" style={{ maxWidth: '1200px', margin: '0 auto' }}>
          {/* Search Section */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="card" 
            style={{ marginBottom: 'var(--space-6)', padding: 'var(--space-6)' }}
          >
            <h2 style={{ marginBottom: 'var(--space-4)', fontSize: 'var(--text-lg)', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
              <Search size={20} color="var(--accent)" /> Search Driver Route
            </h2>
            <div style={{ display: 'flex', gap: 'var(--space-3)', flexWrap: 'wrap' }}>
              <div style={{ flex: '1', minWidth: '300px', position: 'relative' }}>
                <input 
                  type="text" 
                  placeholder="Enter Driver ID (e.g. DRV001) or Name..." 
                  value={driverSearchQuery}
                  onChange={e => setDriverSearchQuery(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleDriverSearch()}
                  style={{ 
                    width: '100%', padding: 'var(--space-3) var(--space-4)', paddingLeft: 'var(--space-10)',
                    borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', 
                    background: 'var(--bg-primary)', color: 'var(--text-primary)', outline: 'none' 
                  }}
                />
                <Search size={18} style={{ position: 'absolute', left: 'var(--space-3)', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
              </div>
              <button 
                onClick={handleDriverSearch}
                style={{ 
                  padding: 'var(--space-3) var(--space-6)', background: 'var(--accent)', color: '#fff', 
                  border: 'none', borderRadius: 'var(--radius-md)', fontWeight: '500', cursor: 'pointer',
                  transition: 'opacity 0.2s'
                }}
              >
                Search
              </button>
              {selectedDriver && (
                <button 
                  onClick={() => { setSelectedDriver(null); setDriverSearchQuery(''); }}
                  style={{ 
                    padding: 'var(--space-3) var(--space-4)', background: 'transparent', color: 'var(--text-secondary)', 
                    border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', gap: 'var(--space-2)', cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  <X size={16} /> Clear
                </button>
              )}
            </div>
          </motion.div>

          <AnimatePresence mode="wait">
            {!selectedDriver ? (
              <motion.div 
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                style={{ textAlign: 'center', padding: 'var(--space-12) var(--space-4)', color: 'var(--text-secondary)' }}
              >
                <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'var(--bg-surface)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto var(--space-4)', border: '1px solid var(--border-color)' }}>
                  <User size={32} color="var(--text-secondary)" />
                </div>
                <h3 style={{ color: 'var(--text-primary)', marginBottom: 'var(--space-2)', fontSize: 'var(--text-xl)' }}>No Driver Selected</h3>
                <p>Search for a Driver ID or Name to view their assigned route and students.</p>
              </motion.div>
            ) : (
              <motion.div
                key="content"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ staggerChildren: 0.1 }}
              >
                {/* Driver / Route Info Cards */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 'var(--space-5)', marginBottom: 'var(--space-6)' }}>
                  <motion.div className="card" style={{ padding: 'var(--space-5)' }}>
                    <h3 style={{ marginBottom: 'var(--space-4)', fontSize: 'var(--text-lg)', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                      <Shield size={20} color="var(--accent)" /> Driver Details
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: 'var(--space-2)', borderBottom: '1px solid var(--border-color)' }}>
                        <span style={{ color: 'var(--text-secondary)' }}>ID</span>
                        <span style={{ color: 'var(--text-primary)', fontWeight: '500' }}>{selectedDriver.driverId}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: 'var(--space-2)', borderBottom: '1px solid var(--border-color)' }}>
                        <span style={{ color: 'var(--text-secondary)' }}>Name</span>
                        <span style={{ color: 'var(--text-primary)', fontWeight: '500' }}>{selectedDriver.name}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: 'var(--space-2)', borderBottom: '1px solid var(--border-color)' }}>
                        <span style={{ color: 'var(--text-secondary)' }}>Phone</span>
                        <span style={{ color: 'var(--text-primary)', fontWeight: '500' }}>{selectedDriver.phone}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: 'var(--text-secondary)' }}>Status</span>
                        <span><StatusBadge status={selectedDriver.status} /></span>
                      </div>
                    </div>
                  </motion.div>

                  <motion.div className="card" style={{ padding: 'var(--space-5)' }}>
                    <h3 style={{ marginBottom: 'var(--space-4)', fontSize: 'var(--text-lg)', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                      <Bus size={20} color="var(--accent)" /> Bus Details
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: 'var(--space-2)', borderBottom: '1px solid var(--border-color)' }}>
                        <span style={{ color: 'var(--text-secondary)' }}>Bus No</span>
                        <span style={{ color: 'var(--text-primary)', fontWeight: '500' }}>{assignedBus?.busNumber || '-'}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: 'var(--space-2)', borderBottom: '1px solid var(--border-color)' }}>
                        <span style={{ color: 'var(--text-secondary)' }}>Reg No</span>
                        <span style={{ color: 'var(--text-primary)', fontWeight: '500' }}>{assignedBus?.registrationNumber || '-'}</span>
                      </div>
                    </div>
                  </motion.div>

                  <motion.div className="card" style={{ padding: 'var(--space-5)' }}>
                    <h3 style={{ marginBottom: 'var(--space-4)', fontSize: 'var(--text-lg)', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                      <MapIcon size={20} color="var(--accent)" /> Route Details
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: 'var(--space-2)', borderBottom: '1px solid var(--border-color)' }}>
                        <span style={{ color: 'var(--text-secondary)' }}>Route Name</span>
                        <span style={{ color: 'var(--text-primary)', fontWeight: '500' }}>{assignedRoute?.routeName || '-'}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: 'var(--space-2)', borderBottom: '1px solid var(--border-color)' }}>
                        <span style={{ color: 'var(--text-secondary)' }}>Start</span>
                        <span style={{ color: 'var(--text-primary)', fontWeight: '500' }}>{assignedRoute?.startPoint || '-'}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: 'var(--text-secondary)' }}>End</span>
                        <span style={{ color: 'var(--text-primary)', fontWeight: '500' }}>{assignedRoute?.endPoint || '-'}</span>
                      </div>
                    </div>
                  </motion.div>
                </div>

                {/* Dashboard Summary Cards */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--space-5)', marginBottom: 'var(--space-8)' }}>
                  <div className="card" style={{ padding: 'var(--space-5)', display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
                    <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(59,130,246,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Users size={24} color="var(--accent)" />
                    </div>
                    <div>
                      <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)', marginBottom: 'var(--space-1)' }}>Total Students</p>
                      <h4 style={{ color: 'var(--text-primary)', fontSize: 'var(--text-2xl)', margin: 0 }}>{routeStudents.length}</h4>
                    </div>
                  </div>
                  <div className="card" style={{ padding: 'var(--space-5)', display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
                    <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(16,185,129,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <UserCheck size={24} color="#10b981" />
                    </div>
                    <div>
                      <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)', marginBottom: 'var(--space-1)' }}>Active Students</p>
                      <h4 style={{ color: 'var(--text-primary)', fontSize: 'var(--text-2xl)', margin: 0 }}>{activeStudents}</h4>
                    </div>
                  </div>
                  <div className="card" style={{ padding: 'var(--space-5)', display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
                    <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(245,158,11,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <UserX size={24} color="#f59e0b" />
                    </div>
                    <div>
                      <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)', marginBottom: 'var(--space-1)' }}>Inactive Students</p>
                      <h4 style={{ color: 'var(--text-primary)', fontSize: 'var(--text-2xl)', margin: 0 }}>{inactiveStudents}</h4>
                    </div>
                  </div>
                </div>

                {/* Students Section */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)', flexWrap: 'wrap', gap: 'var(--space-4)' }}>
                  <h2 style={{ fontSize: 'var(--text-xl)', color: 'var(--text-primary)', margin: 0 }}>Students on This Route</h2>
                  <div style={{ display: 'flex', gap: 'var(--space-3)', flexWrap: 'wrap' }}>
                    <div style={{ position: 'relative' }}>
                      <input 
                        type="text" 
                        placeholder="Search Student..." 
                        value={studentSearch}
                        onChange={e => setStudentSearch(e.target.value)}
                        style={{ 
                          padding: 'var(--space-2) var(--space-3)', paddingLeft: 'var(--space-8)',
                          borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', 
                          background: 'var(--bg-surface)', color: 'var(--text-primary)', outline: 'none',
                          width: '200px'
                        }}
                      />
                      <Search size={14} style={{ position: 'absolute', left: 'var(--space-3)', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                    </div>
                    <select 
                      value={classFilter} 
                      onChange={e => setClassFilter(e.target.value)}
                      style={{ 
                        padding: 'var(--space-2) var(--space-3)', borderRadius: 'var(--radius-md)', 
                        border: '1px solid var(--border-color)', background: 'var(--bg-surface)', 
                        color: 'var(--text-primary)', outline: 'none', cursor: 'pointer' 
                      }}
                    >
                      <option value="All">All Classes</option>
                      {uniqueClasses.map(c => <option key={c} value={c}>Class {c}</option>)}
                    </select>
                    <select 
                      value={statusFilter} 
                      onChange={e => setStatusFilter(e.target.value)}
                      style={{ 
                        padding: 'var(--space-2) var(--space-3)', borderRadius: 'var(--radius-md)', 
                        border: '1px solid var(--border-color)', background: 'var(--bg-surface)', 
                        color: 'var(--text-primary)', outline: 'none', cursor: 'pointer' 
                      }}
                    >
                      <option value="All">All Statuses</option>
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                    </select>
                  </div>
                </div>

                <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                  <div style={{ overflowX: 'auto' }}>
                    <table className="data-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                      <thead>
                        <tr>
                          <th>Student Name</th>
                          <th>Class</th>
                          <th>Parent Phone</th>
                          <th>Alt Phone</th>
                          <th>Pickup Point</th>
                          <th>Status</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        <AnimatePresence>
                          {filteredStudents.map((s) => (
                            <motion.tr 
                              key={s.studentId}
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              exit={{ opacity: 0 }}
                            >
                              <td>
                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                  <strong style={{ color: 'var(--text-primary)' }}>{s.name}</strong>
                                  <small style={{ color: 'var(--text-secondary)' }}>{s.studentId}</small>
                                </div>
                              </td>
                              <td>{s.class}</td>
                              <td style={{ fontFamily: 'monospace', color: 'var(--text-secondary)' }}>{s.parentPhone}</td>
                              <td style={{ fontFamily: 'monospace', color: 'var(--text-secondary)' }}>{s.alternatePhone || '-'}</td>
                              <td>{s.pickupPoint}</td>
                              <td><StatusBadge status={s.status} /></td>
                              <td>
                                <button 
                                  onClick={() => setSelectedStudent(s)}
                                  style={{ 
                                    padding: 'var(--space-2) var(--space-3)', background: 'transparent', 
                                    color: 'var(--accent)', border: '1px solid var(--accent)', 
                                    borderRadius: 'var(--radius-sm)', cursor: 'pointer', fontSize: 'var(--text-xs)',
                                    display: 'flex', alignItems: 'center', gap: 'var(--space-1)'
                                  }}
                                >
                                  View Details <ChevronRight size={14} />
                                </button>
                              </td>
                            </motion.tr>
                          ))}
                        </AnimatePresence>
                        {filteredStudents.length === 0 && (
                          <tr>
                            <td colSpan="7" style={{ textAlign: 'center', padding: 'var(--space-10)', color: 'var(--text-secondary)' }}>
                              <AlertCircle size={32} style={{ margin: '0 auto var(--space-3)', opacity: 0.5 }} />
                              No students found matching your criteria.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Student Details Modal */}
      <AnimatePresence>
        {selectedStudent && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
              backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', zIndex: 9999, 
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              padding: 'var(--space-4)'
            }}
            onClick={() => setSelectedStudent(null)}
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="card" 
              style={{ width: '100%', maxWidth: '600px', padding: 'var(--space-6)', maxHeight: '90vh', overflowY: 'auto', background: 'var(--bg-surface)' }}
              onClick={e => e.stopPropagation()}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-5)', borderBottom: '1px solid var(--border-color)', paddingBottom: 'var(--space-4)' }}>
                <div>
                  <h2 style={{ fontSize: 'var(--text-2xl)', color: 'var(--text-primary)', marginBottom: 'var(--space-1)' }}>{selectedStudent.name}</h2>
                  <span style={{ color: 'var(--text-secondary)' }}>{selectedStudent.studentId} • Class {selectedStudent.class} ({selectedStudent.section})</span>
                </div>
                <button onClick={() => setSelectedStudent(null)} style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                  <X size={24} />
                </button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-6)', marginBottom: 'var(--space-6)' }}>
                <div>
                  <h4 style={{ color: 'var(--text-primary)', marginBottom: 'var(--space-3)', display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                    <User size={16} color="var(--accent)" /> Parent/Guardian
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                    <p style={{ margin: 0, color: 'var(--text-secondary)' }}><strong>Name:</strong> <span style={{ color: 'var(--text-primary)' }}>{selectedStudent.parentName}</span></p>
                    <p style={{ margin: 0, color: 'var(--text-secondary)' }}><strong>Phone 1:</strong> <span style={{ color: 'var(--text-primary)' }}>{selectedStudent.parentPhone}</span></p>
                    <p style={{ margin: 0, color: 'var(--text-secondary)' }}><strong>Phone 2:</strong> <span style={{ color: 'var(--text-primary)' }}>{selectedStudent.alternatePhone || 'N/A'}</span></p>
                  </div>
                </div>
                <div>
                  <h4 style={{ color: 'var(--text-primary)', marginBottom: 'var(--space-3)', display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                    <MapPin size={16} color="var(--accent)" /> Location
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                    <p style={{ margin: 0, color: 'var(--text-secondary)' }}><strong>Address:</strong><br/><span style={{ color: 'var(--text-primary)' }}>{selectedStudent.address}</span></p>
                    <p style={{ margin: 0, color: 'var(--text-secondary)', marginTop: 'var(--space-2)' }}><strong>Pickup:</strong> <span style={{ color: 'var(--text-primary)' }}>{selectedStudent.pickupPoint}</span></p>
                    <p style={{ margin: 0, color: 'var(--text-secondary)' }}><strong>Drop:</strong> <span style={{ color: 'var(--text-primary)' }}>{selectedStudent.dropPoint}</span></p>
                  </div>
                </div>
              </div>

              <div style={{ backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-color)', padding: 'var(--space-4)', borderRadius: 'var(--radius-md)', marginBottom: 'var(--space-6)' }}>
                <h4 style={{ color: 'var(--text-primary)', marginBottom: 'var(--space-3)', display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                  <Bus size={16} color="var(--accent)" /> Transport Assignment
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                  <p style={{ margin: 0, color: 'var(--text-secondary)' }}><strong>Assigned Bus:</strong> <span style={{ color: 'var(--text-primary)' }}>{assignedBus?.busNumber} ({assignedBus?.registrationNumber})</span></p>
                  <p style={{ margin: 0, color: 'var(--text-secondary)' }}><strong>Assigned Driver:</strong> <span style={{ color: 'var(--text-primary)' }}>{selectedDriver?.name} ({selectedDriver?.driverId})</span></p>
                  <p style={{ margin: 0, color: 'var(--text-secondary)' }}><strong>Route:</strong> <span style={{ color: 'var(--text-primary)' }}>{assignedRoute?.routeName}</span></p>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <StatusBadge status={selectedStudent.status} />
                <button 
                  style={{ 
                    padding: 'var(--space-2) var(--space-6)', background: 'var(--accent)', color: '#fff', 
                    border: 'none', borderRadius: 'var(--radius-md)', fontWeight: '500', cursor: 'pointer' 
                  }} 
                  onClick={() => setSelectedStudent(null)}
                >
                  Done
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
