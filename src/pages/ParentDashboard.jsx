import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../i18n/LanguageContext';
import TopNav from '../components/TopNav';
import ParentSidebar from '../components/ParentSidebar';
import StatusBadge from '../components/StatusBadge';
import { parentsDB, driversDB, busesDB, routesDB } from '../data/mockData';
import { getStudentByParentId, getFullStudentDetails, getBoardingRecords, getNotificationsForParent, markNotificationAsRead } from '../data/db';
import { Search, AlertTriangle, User, Bus, MapPin, Calendar, Clock, CheckCircle, Info, X } from 'lucide-react';
import './Dashboard.css';

export default function ParentDashboard() {
  const { user, logout } = useAuth();
  const { t } = useLanguage();

  const [inputId, setInputId] = useState('');
  const [submittedId, setSubmittedId] = useState('');
  const [records, setRecords] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [historyFilter, setHistoryFilter] = useState('All');

  // Fetch parent based on the submitted Parent ID
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
    // Poll records every few seconds to sync with driver app
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

  const pastNotifications = useMemo(() => {
    return notifications;
  }, [notifications]);

  const handleMarkAsRead = (notificationId) => {
    if (myParent) {
      markNotificationAsRead(notificationId);
      setNotifications(getNotificationsForParent(myParent.parentId));
    }
  };

  return (
    <div style={{ display: 'flex' }}>
      <ParentSidebar onLogout={logout} />
      <div style={{ flex: 1, marginLeft: 'var(--sidebar-w)', display: 'flex', flexDirection: 'column', minHeight: '100vh', background: 'var(--bg-primary)' }}>
        <TopNav name={user?.name || 'Parent'} roleLabel={t('roleParent') || 'Parent'} onLogout={logout} />

        <main className="parent-content">
        <motion.div 
          className="parent-header"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="parent-title">Track Your Child's Transport</h1>
          <p className="parent-subtitle">Real-time updates and boarding history</p>
        </motion.div>

        {/* Parent ID Input Form */}
        <motion.div 
          className="parent-search-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <form onSubmit={handleSubmit} className="parent-search-form">
            <div className="parent-search-input-group">
              <label>Enter Parent ID</label>
              <div className="parent-search-input-wrapper">
                <Search className="parent-search-icon" size={18} />
                <input 
                  type="text" 
                  value={inputId}
                  onChange={(e) => setInputId(e.target.value)}
                  placeholder="e.g. PAR001" 
                  className="parent-search-input"
                />
              </div>
            </div>
            <button type="submit" className="parent-btn parent-btn-primary">
              Submit
            </button>
            {submittedId && (
               <button type="button" className="parent-btn parent-btn-outline" onClick={() => { setSubmittedId(''); setInputId(''); }}>
                 Clear
               </button>
            )}
          </form>
        </motion.div>

        {submittedId && !myParent && (
          <motion.div 
            className="parent-card" 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }}
            style={{ textAlign: 'center', color: 'var(--danger)' }}
          >
            <strong>Invalid Parent ID.</strong> Please check your ID and try again.
          </motion.div>
        )}

        {/* Tabular Information Display */}
        {myParent && studentDetails && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
          >
            <AnimatePresence>
              {activeUnread.map(notif => {
                const bus = busesDB.find(b => b.busId === notif.busId);
                const route = routesDB.find(r => r.routeId === notif.routeId);
                return (
                  <motion.div 
                    key={notif.notificationId} 
                    className="parent-emergency-banner"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                  >
                    <AlertTriangle className="parent-emergency-icon" size={24} />
                    <div className="parent-emergency-content">
                      <h2 className="parent-emergency-title">School Bus Update</h2>
                      <div className="parent-emergency-details">
                        <span><strong>Bus:</strong> {bus?.busNumber}</span>
                        <span>•</span>
                        <span><strong>Route:</strong> {route?.routeName}</span>
                      </div>
                      <p className="parent-emergency-message">"{notif.adminMessage}"</p>
                      <div className="parent-emergency-details">
                        <span><User size={14} style={{display:'inline', verticalAlign:'text-bottom', marginRight:'4px'}}/>School Administration</span>
                        <span><Calendar size={14} style={{display:'inline', verticalAlign:'text-bottom', marginRight:'4px'}}/>{new Date(notif.sentAt).toLocaleDateString()}</span>
                        <span><Clock size={14} style={{display:'inline', verticalAlign:'text-bottom', marginRight:'4px'}}/>{new Date(notif.sentAt).toLocaleTimeString()}</span>
                      </div>
                      <div className="parent-emergency-actions">
                        <button className="parent-btn" style={{ background: 'var(--danger)', color: '#fff', border: 'none' }}>View Details</button>
                        <button className="parent-btn parent-btn-outline" style={{ color: 'var(--danger)', borderColor: 'var(--danger)' }} onClick={() => handleMarkAsRead(notif.notificationId)}>Mark as Read</button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>

            <div className="parent-card">
              <div className="parent-card-header">
                <h3 className="parent-card-title"><User size={20} /> Student & Transport Information</h3>
              </div>
              <table className="parent-table">
                <thead>
                  <tr>
                    <th>Parent Details</th>
                    <th>Student Details</th>
                    <th>Class</th>
                    <th>Bus & Route</th>
                    <th>Driver Details</th>
                    <th>Today's Status</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>
                      <strong>{myParent.name}</strong>
                      <span className="parent-table-muted">{myParent.phone}</span>
                    </td>
                    <td>
                      <strong>{studentDetails.student.name}</strong>
                      <span className="parent-table-muted">{studentDetails.student.studentId}</span>
                    </td>
                    <td>
                      {studentDetails.student.class} - {studentDetails.student.section}
                    </td>
                    <td>
                      <div>{studentDetails.bus?.busNumber}</div>
                      <span className="parent-table-muted">{studentDetails.route?.routeName}</span>
                    </td>
                    <td>
                      <div>{studentDetails.driver?.name}</div>
                      <span className="parent-table-muted">{studentDetails.driver?.phone}</span>
                    </td>
                    <td>
                      {todaysBoarding ? (
                        <div>
                          <StatusBadge status={todaysBoarding.status} label={todaysBoarding.status} />
                          <div className="parent-table-muted" style={{ marginTop: '4px' }}>{todaysBoarding.boardingTime}</div>
                        </div>
                      ) : (
                        <span className="parent-table-muted">Not boarded yet</span>
                      )}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Boarding History Table */}
            <div className="parent-card">
              <div className="parent-card-header">
                <h3 className="parent-card-title"><Calendar size={20} /> Boarding History</h3>
                <select 
                  value={historyFilter} 
                  onChange={e => setHistoryFilter(e.target.value)}
                  className="parent-select"
                >
                  <option value="All">All Time</option>
                  <option value="Today">Today</option>
                  <option value="This Week">This Week</option>
                </select>
              </div>
              
              <table className="parent-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Time</th>
                    <th>Pickup Point</th>
                    <th>Bus</th>
                    <th>Route</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredHistory.map(record => (
                    <tr key={record.boardingId}>
                      <td>{record.boardingDate}</td>
                      <td>{record.boardingTime}</td>
                      <td>{record.pickupPoint}</td>
                      <td>{studentDetails?.bus?.busNumber}</td>
                      <td>{studentDetails?.route?.routeName}</td>
                      <td>
                        <StatusBadge status={record.status} label={record.status} />
                      </td>
                    </tr>
                  ))}
                  {filteredHistory.length === 0 && (
                    <tr>
                      <td colSpan="6" style={{ padding: '30px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                        No boarding records found for the selected filter.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Notifications History Table */}
            <div className="parent-card">
              <div className="parent-card-header">
                <h3 className="parent-card-title"><Info size={20} /> Bus Updates</h3>
              </div>
              <table className="parent-table">
                <thead>
                  <tr>
                    <th>Date & Time</th>
                    <th>Bus</th>
                    <th>Route</th>
                    <th>Message</th>
                    <th>Sender</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {pastNotifications.map(notif => {
                    const bus = busesDB.find(b => b.busId === notif.busId);
                    const route = routesDB.find(r => r.routeId === notif.routeId);
                    return (
                      <tr key={notif.notificationId}>
                        <td>
                          {new Date(notif.sentAt).toLocaleDateString()}
                          <span className="parent-table-muted">{new Date(notif.sentAt).toLocaleTimeString()}</span>
                        </td>
                        <td>{bus?.busNumber}</td>
                        <td>{route?.routeName}</td>
                        <td>{notif.adminMessage}</td>
                        <td>School Admin</td>
                        <td>
                          <StatusBadge status={notif.status === 'UNREAD' ? 'ACTIVE' : 'RESOLVED'} label={notif.status} />
                        </td>
                      </tr>
                    );
                  })}
                  {pastNotifications.length === 0 && (
                    <tr>
                      <td colSpan="6" style={{ padding: '30px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                        No updates received.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}
      </main>
      </div>
    </div>
  );
}
