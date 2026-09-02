import { useState, useMemo, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../i18n/LanguageContext';
import Sidebar from '../components/Sidebar';
import TopNav from '../components/TopNav';
import StatusBadge from '../components/StatusBadge';
import { parentsDB, driversDB, busesDB, routesDB } from '../data/mockData';
import { getStudentByParentId, getFullStudentDetails, getBoardingRecords, getNotificationsForParent, markNotificationAsRead } from '../data/db';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, User, Bus, MapPin, AlertTriangle, Eye, CheckCircle } from 'lucide-react';
import './Dashboard.css';

export default function AdminParentPortal() {
  const { user, logout } = useAuth();
  const { t } = useLanguage();

  const [inputId, setInputId] = useState('');
  const [submittedId, setSubmittedId] = useState('');
  const [records, setRecords] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [historyFilter, setHistoryFilter] = useState('All');

  const myParent = useMemo(() => {
    if (!submittedId) return null;
    return parentsDB.find(p => p.parentId.toLowerCase() === submittedId.toLowerCase());
  }, [submittedId]);
  
  const studentDetails = useMemo(() => {
    if (!myParent) return null;
    const student = getStudentByParentId(myParent.parentId);
    if (!student) return null;
    return getFullStudentDetails(student.studentId);
  }, [myParent]);

  useEffect(() => {
    const fetchData = () => {
      setRecords(getBoardingRecords());
      if (myParent) {
        setNotifications(getNotificationsForParent(myParent.parentId));
      }
    };
    fetchData();
    const interval = setInterval(fetchData, 2000);
    return () => clearInterval(interval);
  }, [myParent]);

  const todayStr = new Date().toLocaleDateString();

  const myChildRecords = useMemo(() => {
    if (!studentDetails?.student) return [];
    return records.filter(r => r.studentId === studentDetails.student.studentId).reverse();
  }, [records, studentDetails]);

  const todaysBoarding = useMemo(() => {
    return myChildRecords.find(r => r.boardingDate === todayStr);
  }, [myChildRecords, todayStr]);

  const filteredHistory = useMemo(() => {
    if (historyFilter === 'All') return myChildRecords;
    if (historyFilter === 'Today') return myChildRecords.filter(r => r.boardingDate === todayStr);
    if (historyFilter === 'This Week') return myChildRecords.slice(0, 5);
    return myChildRecords;
  }, [myChildRecords, historyFilter, todayStr]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmittedId(inputId.trim());
  };

  const activeUnread = useMemo(() => {
    if (!myParent) return [];
    return notifications.filter(n => n.status === 'UNREAD');
  }, [notifications, myParent]);

  const handleMarkAsRead = (notificationId) => {
    if (myParent) {
      markNotificationAsRead(notificationId);
      setNotifications(getNotificationsForParent(myParent.parentId));
    }
  };

  return (
    <div style={{ display: 'flex' }}>
      <Sidebar onLogout={logout} />

      <div style={{ flex: 1, marginLeft: 'var(--sidebar-w)', display: 'flex', flexDirection: 'column', minHeight: '100vh', background: 'var(--bg-primary)' }}>
        <TopNav name={user?.name} roleLabel={t('roleAdmin')} onLogout={logout} />

        <main className="parent-content">
          <header style={{ marginBottom: 'var(--space-6)' }}>
            <p className="eyebrow">{t('adminDashboard')}</p>
            <h1 style={{ fontSize: 'var(--text-heading-xl)', fontWeight: 600, color: 'var(--text-primary)' }}>
              Parent Portal Preview
            </h1>
          </header>

          {!myParent ? (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="card" style={{ padding: 'var(--space-8)', textAlign: 'center', maxWidth: 480, margin: '0 auto' }}>
              <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'var(--bg-surface-hover)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto var(--space-4)', color: 'var(--text-tertiary)' }}>
                <Search size={32} />
              </div>
              <h2 style={{ fontSize: 'var(--text-heading-l)', marginBottom: 'var(--space-2)', color: 'var(--text-primary)' }}>Enter Parent ID</h2>
              <p className="text-muted" style={{ marginBottom: 'var(--space-6)' }}>Preview the portal exactly as a specific parent sees it.</p>
              
              <form onSubmit={handleSubmit} style={{ display: 'flex', gap: 'var(--space-3)' }}>
                <input 
                  type="text" 
                  className="input"
                  value={inputId} 
                  onChange={(e) => setInputId(e.target.value)} 
                  placeholder="e.g., PAR001"
                />
                <button type="submit" className="btn btn-primary" style={{ whiteSpace: 'nowrap' }}>
                  Preview
                </button>
              </form>
            </motion.div>
          ) : (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-6)' }}>
                <h2 style={{ fontSize: 'var(--text-heading-m)', fontWeight: 600, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                  <User size={20} className="text-accent" />
                  Viewing as: {myParent.name}
                </h2>
                <button className="btn btn-secondary btn-sm" onClick={() => {setSubmittedId(''); setInputId('');}}>
                  Change Parent
                </button>
              </div>

              {studentDetails && (
                <>
                  <AnimatePresence>
                    {activeUnread.map(notif => {
                      const bus = busesDB.find(b => b.busId === notif.busId);
                      const route = routesDB.find(r => r.routeId === notif.routeId);
                      return (
                        <motion.div 
                          initial={{ opacity: 0, height: 0, scale: 0.95 }}
                          animate={{ opacity: 1, height: 'auto', scale: 1 }}
                          exit={{ opacity: 0, height: 0, scale: 0.95 }}
                          key={notif.notificationId} 
                          className="parent-emergency-banner"
                        >
                          <div style={{ color: 'var(--danger)', flexShrink: 0 }}>
                            <AlertTriangle size={24} />
                          </div>
                          <div style={{ flex: 1 }}>
                            <h3 style={{ color: 'var(--danger)', fontSize: 'var(--text-body-m)', fontWeight: 600, marginBottom: 'var(--space-2)', textTransform: 'uppercase', letterSpacing: 'var(--tracking-wide)' }}>
                              School Bus Update
                            </h3>
                            <div style={{ display: 'flex', gap: 'var(--space-4)', marginBottom: 'var(--space-3)', fontSize: 'var(--text-body-s)', color: 'var(--text-secondary)' }}>
                              <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Bus size={14}/> {bus?.busNumber}</span>
                              <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><MapPin size={14}/> {route?.routeName}</span>
                            </div>
                            <p style={{ fontSize: 'var(--text-body-m)', color: 'var(--text-primary)', marginBottom: 'var(--space-3)' }}>
                              {notif.adminMessage}
                            </p>
                            <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
                              <button className="btn btn-sm" style={{ background: 'var(--danger-muted)', color: 'var(--danger)' }}>
                                <Eye size={14} /> View Details
                              </button>
                              <button className="btn btn-sm btn-ghost" onClick={() => handleMarkAsRead(notif.notificationId)}>
                                <CheckCircle size={14} /> Mark as Read
                              </button>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>

                  <div className="card" style={{ marginBottom: 'var(--space-6)' }}>
                    <h3 style={{ fontSize: 'var(--text-heading-m)', fontWeight: 600, color: 'var(--text-primary)', marginBottom: 'var(--space-4)' }}>Student & Transport Information</h3>
                    <div className="data-table-wrap">
                      <table className="data-table">
                        <thead>
                          <tr>
                            <th>Student</th>
                            <th>Class</th>
                            <th>Bus No</th>
                            <th>Route</th>
                            <th>Driver</th>
                            <th>Today's Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td>
                              <strong style={{ display: 'block', color: 'var(--text-primary)' }}>{studentDetails.student.name}</strong>
                              <span className="text-muted">{studentDetails.student.studentId}</span>
                            </td>
                            <td>{studentDetails.student.class} - {studentDetails.student.section}</td>
                            <td>{studentDetails.bus?.busNumber}</td>
                            <td>{studentDetails.route?.routeName}</td>
                            <td>
                              <strong style={{ display: 'block', color: 'var(--text-primary)' }}>{studentDetails.driver?.name}</strong>
                              <span className="text-muted">{studentDetails.driver?.phone}</span>
                            </td>
                            <td>
                              {todaysBoarding ? (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                                  <StatusBadge status={todaysBoarding.status} label={todaysBoarding.status} />
                                  <span className="text-faint" style={{ fontSize: 'var(--text-micro)' }}>{todaysBoarding.boardingTime}</span>
                                </div>
                              ) : (
                                <span className="text-muted">Not boarded</span>
                              )}
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <div className="card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)' }}>
                      <h3 style={{ fontSize: 'var(--text-heading-m)', fontWeight: 600, color: 'var(--text-primary)' }}>Boarding History</h3>
                      <select 
                        className="input"
                        style={{ width: 'auto', height: 36, padding: '0 12px' }}
                        value={historyFilter} 
                        onChange={e => setHistoryFilter(e.target.value)}
                      >
                        <option value="All">All Time</option>
                        <option value="Today">Today</option>
                        <option value="This Week">This Week</option>
                      </select>
                    </div>
                    
                    <div className="data-table-wrap">
                      <table className="data-table">
                        <thead>
                          <tr>
                            <th>Date</th>
                            <th>Time</th>
                            <th>Pickup Point</th>
                            <th>Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredHistory.map(record => (
                            <tr key={record.boardingId}>
                              <td>{record.boardingDate}</td>
                              <td className="col-number">{record.boardingTime}</td>
                              <td>{record.pickupPoint}</td>
                              <td><StatusBadge status={record.status} label={record.status} /></td>
                            </tr>
                          ))}
                          {filteredHistory.length === 0 && (
                            <tr>
                              <td colSpan="4" style={{ textAlign: 'center', padding: 'var(--space-8)', color: 'var(--text-tertiary)' }}>
                                No boarding records found for the selected filter.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </>
              )}
            </motion.div>
          )}
        </main>
      </div>
    </div>
  );
}
