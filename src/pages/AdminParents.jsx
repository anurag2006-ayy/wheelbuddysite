import { useState, useMemo, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../i18n/LanguageContext';
import Sidebar from '../components/Sidebar';
import LanguageSwitcher from '../components/LanguageSwitcher';
import StatusBadge from '../components/StatusBadge';
import { parentsDB, studentsDB } from '../data/mockData';
import { getBoardingRecords, getFullStudentDetails } from '../data/db';
import { Search, X, User, Users, MapPin, Clock, Calendar, Bus, Phone, Shield } from 'lucide-react';
import { motion } from 'framer-motion';

export default function AdminParents() {
  const { user, logout } = useAuth();
  const { t } = useLanguage();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedResult, setSelectedResult] = useState(null);
  const [records, setRecords] = useState([]);

  useEffect(() => {
    setRecords(getBoardingRecords());
  }, []);

  const handleSearch = () => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return;

    let matchedParent = parentsDB.find(p => p.parentId.toLowerCase() === q || p.name.toLowerCase().includes(q));
    let matchedStudent = null;

    if (!matchedParent) {
      matchedStudent = studentsDB.find(s => s.studentId.toLowerCase() === q || s.name.toLowerCase().includes(q));
      if (matchedStudent) {
        matchedParent = parentsDB.find(p => p.parentId === matchedStudent.parentId);
      }
    } else {
      matchedStudent = studentsDB.find(s => s.parentId === matchedParent.parentId);
    }

    if (matchedParent && matchedStudent) {
      setSelectedResult({
        parent: matchedParent,
        studentDetails: getFullStudentDetails(matchedStudent.studentId)
      });
    } else {
      alert('No exact match found for that ID or name.');
      setSelectedResult(null);
    }
  };

  const studentRecords = useMemo(() => {
    if (!selectedResult) return [];
    return records.filter(r => r.studentId === selectedResult.studentDetails.student.studentId).reverse();
  }, [selectedResult, records]);

  const todayStr = new Date().toLocaleDateString();
  const todaysBoarding = useMemo(() => {
    return studentRecords.find(r => r.boardingDate === todayStr);
  }, [studentRecords, todayStr]);

  return (
    <div style={{ background: 'var(--bg-primary)', minHeight: '100vh', color: 'var(--text-primary)' }}>
      <Sidebar onLogout={logout} />

      <div className="admin-page" style={{ marginLeft: 'var(--sidebar-w)', minHeight: '100vh', padding: 'var(--space-8)', background: 'var(--bg-primary)' }}>
        
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-8)' }}>
          <div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 'var(--space-2)' }}>
              {t('adminDashboard') || 'Fleet overview'}
            </p>
            <h1 style={{ fontSize: '2rem', fontWeight: '600', color: 'var(--text-primary)', margin: 0 }}>
              Parent & Student Management
            </h1>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
            <LanguageSwitcher />
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', padding: 'var(--space-2) var(--space-4)', background: 'var(--bg-surface)', borderRadius: 'var(--radius-full)', border: '1px solid var(--border-subtle)' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--accent)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                {(user?.name || '?').charAt(0).toUpperCase()}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '0.875rem', fontWeight: '500' }}>{user?.name}</span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{t('roleAdmin')}</span>
              </div>
            </div>
          </div>
        </header>

        <div style={{ maxWidth: '1200px' }}>
          {/* Search Section */}
          <div className="card" style={{ marginBottom: 'var(--space-6)', padding: 'var(--space-6)', background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-lg)' }}>
            <h2 style={{ marginBottom: 'var(--space-4)', fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
              <Search size={20} color="var(--accent)" /> Search Parent / Student
            </h2>
            <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
              <div style={{ position: 'relative', flex: 1, maxWidth: '500px' }}>
                <input 
                  type="text" 
                  placeholder="Enter Parent ID/Name or Student ID/Name..." 
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSearch()}
                  style={{ 
                    width: '100%', 
                    padding: '12px 16px 12px 40px', 
                    borderRadius: 'var(--radius-md)', 
                    border: '1px solid var(--border-subtle)', 
                    background: 'var(--bg-primary)', 
                    color: 'var(--text-primary)',
                    outline: 'none',
                    transition: 'border-color 0.2s',
                    boxSizing: 'border-box'
                  }}
                />
                <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
              </div>
              <button 
                onClick={handleSearch}
                style={{
                  padding: '0 var(--space-6)',
                  background: 'var(--accent)',
                  color: 'white',
                  border: 'none',
                  borderRadius: 'var(--radius-md)',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'opacity 0.2s'
                }}
                onMouseOver={e => e.currentTarget.style.opacity = '0.9'}
                onMouseOut={e => e.currentTarget.style.opacity = '1'}
              >
                Search
              </button>
              {selectedResult && (
                <button 
                  onClick={() => { setSelectedResult(null); setSearchQuery(''); }}
                  style={{
                    padding: '0 var(--space-4)',
                    background: 'transparent',
                    color: 'var(--text-secondary)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-md)',
                    fontWeight: '500',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--space-2)',
                    transition: 'all 0.2s'
                  }}
                  onMouseOver={e => { e.currentTarget.style.color = 'var(--text-primary)'; e.currentTarget.style.borderColor = 'var(--text-primary)'; }}
                  onMouseOut={e => { e.currentTarget.style.color = 'var(--text-secondary)'; e.currentTarget.style.borderColor = 'var(--border-subtle)'; }}
                >
                  <X size={18} /> Clear
                </button>
              )}
            </div>
          </div>

          {selectedResult && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
              {/* Parent & Child Info */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: 'var(--space-6)', marginBottom: 'var(--space-6)' }}>
                <div className="card" style={{ padding: 'var(--space-6)', background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-lg)' }}>
                  <h3 style={{ marginBottom: 'var(--space-5)', display: 'flex', alignItems: 'center', gap: 'var(--space-2)', fontSize: '1.125rem' }}>
                    <Users size={20} color="var(--accent)" /> Parent Information
                  </h3>
                  <div style={{ display: 'grid', gap: 'var(--space-4)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle)', paddingBottom: 'var(--space-3)' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>Name</span>
                      <span style={{ fontWeight: '500' }}>{selectedResult.parent.name}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle)', paddingBottom: 'var(--space-3)' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>ID</span>
                      <span style={{ fontWeight: '500' }}>{selectedResult.parent.parentId}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle)', paddingBottom: 'var(--space-3)' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>Phone</span>
                      <span style={{ fontWeight: '500', display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                        <Phone size={14} color="var(--text-secondary)" /> {selectedResult.parent.phone}
                      </span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle)', paddingBottom: 'var(--space-3)' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>Alt Phone</span>
                      <span style={{ fontWeight: '500' }}>{selectedResult.parent.alternatePhone}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>Address</span>
                      <span style={{ fontWeight: '500', textAlign: 'right', maxWidth: '60%' }}>{selectedResult.parent.address}</span>
                    </div>
                  </div>
                </div>

                <div className="card" style={{ padding: 'var(--space-6)', background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-lg)' }}>
                  <h3 style={{ marginBottom: 'var(--space-5)', display: 'flex', alignItems: 'center', gap: 'var(--space-2)', fontSize: '1.125rem' }}>
                    <User size={20} color="var(--accent)" /> Student Information
                  </h3>
                  <div style={{ display: 'grid', gap: 'var(--space-4)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle)', paddingBottom: 'var(--space-3)' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>Name</span>
                      <span style={{ fontWeight: '500' }}>{selectedResult.studentDetails.student.name}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle)', paddingBottom: 'var(--space-3)' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>ID & Class</span>
                      <span style={{ fontWeight: '500' }}>
                        {selectedResult.studentDetails.student.studentId} • {selectedResult.studentDetails.student.class}-{selectedResult.studentDetails.student.section}
                      </span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle)', paddingBottom: 'var(--space-3)' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>Bus & Route</span>
                      <span style={{ fontWeight: '500', display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                        <Bus size={14} color="var(--text-secondary)" /> 
                        {selectedResult.studentDetails.bus?.busNumber} • {selectedResult.studentDetails.route?.routeName}
                      </span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle)', paddingBottom: 'var(--space-3)' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>Driver</span>
                      <span style={{ fontWeight: '500' }}>
                        {selectedResult.studentDetails.driver?.name} ({selectedResult.studentDetails.driver?.phone})
                      </span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>Route Points</span>
                      <span style={{ fontWeight: '500', display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                        <MapPin size={14} color="var(--text-secondary)" />
                        {selectedResult.studentDetails.student.pickupPoint} / {selectedResult.studentDetails.student.dropPoint}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Boarding Information */}
              <div className="card" style={{ padding: 'var(--space-6)', background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-lg)' }}>
                <h3 style={{ marginBottom: 'var(--space-5)', display: 'flex', alignItems: 'center', gap: 'var(--space-2)', fontSize: '1.125rem' }}>
                  <Shield size={20} color="var(--accent)" /> Boarding History
                </h3>
                
                <div style={{ marginBottom: 'var(--space-6)', padding: 'var(--space-5)', background: 'rgba(0,0,0,0.2)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                  <h4 style={{ marginBottom: 'var(--space-4)', fontSize: '0.875rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Today's Status</h4>
                  {todaysBoarding ? (
                    <div style={{ display: 'flex', gap: 'var(--space-6)', alignItems: 'center', flexWrap: 'wrap' }}>
                      <StatusBadge status={todaysBoarding.status} label={todaysBoarding.status} />
                      <span style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                        <Clock size={16} color="var(--text-secondary)" /> 
                        <span style={{ color: 'var(--text-secondary)' }}>Time:</span>
                        <span style={{ fontWeight: '500' }}>{todaysBoarding.boardingTime}</span>
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                        <MapPin size={16} color="var(--text-secondary)" /> 
                        <span style={{ color: 'var(--text-secondary)' }}>Location:</span>
                        <span style={{ fontWeight: '500' }}>{todaysBoarding.pickupPoint}</span>
                      </span>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', color: 'var(--text-secondary)' }}>
                      <Calendar size={16} /> Not boarded yet today.
                    </div>
                  )}
                </div>

                <div className="data-table-wrapper" style={{ overflowX: 'auto', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                  <table className="data-table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                      <tr style={{ background: 'rgba(0,0,0,0.2)', borderBottom: '1px solid var(--border-subtle)' }}>
                        <th style={{ padding: 'var(--space-4)', fontWeight: '500', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Date</th>
                        <th style={{ padding: 'var(--space-4)', fontWeight: '500', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Time</th>
                        <th style={{ padding: 'var(--space-4)', fontWeight: '500', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Pickup Point</th>
                        <th style={{ padding: 'var(--space-4)', fontWeight: '500', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Bus</th>
                        <th style={{ padding: 'var(--space-4)', fontWeight: '500', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Route</th>
                        <th style={{ padding: 'var(--space-4)', fontWeight: '500', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {studentRecords.map((record, idx) => (
                        <tr key={record.boardingId} style={{ borderBottom: idx === studentRecords.length - 1 ? 'none' : '1px solid var(--border-subtle)' }}>
                          <td style={{ padding: 'var(--space-4)' }}>{record.boardingDate}</td>
                          <td style={{ padding: 'var(--space-4)' }}>{record.boardingTime}</td>
                          <td style={{ padding: 'var(--space-4)' }}>{record.pickupPoint}</td>
                          <td style={{ padding: 'var(--space-4)' }}>{selectedResult.studentDetails.bus?.busNumber}</td>
                          <td style={{ padding: 'var(--space-4)' }}>{selectedResult.studentDetails.route?.routeName}</td>
                          <td style={{ padding: 'var(--space-4)' }}>
                            <StatusBadge status={record.status} label={record.status} />
                          </td>
                        </tr>
                      ))}
                      {studentRecords.length === 0 && (
                        <tr>
                          <td colSpan="6" style={{ padding: 'var(--space-8)', textAlign: 'center', color: 'var(--text-secondary)' }}>
                            No boarding history found.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
