import { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../i18n/LanguageContext';
import TopNav from '../components/TopNav';
import { driversDB, studentsDB, busesDB } from '../data/mockData';
import { 
  addBoardingRecord, 
  getBoardingRecords, 
  clearBoardingRecordsForStudentToday, 
  createEmergencyMessage, 
  getFleetSchedules, 
  markStopArrivalDeparture,
  getAltBusRequests,
  addDriverTextMessage,
  addDriverVoiceMessage
} from '../data/db';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Power, UserCheck, UserX, MapPin, Bus, ShieldAlert, Check, Clock, CheckCircle2, Navigation, Phone, PhoneCall, Mic, MessageSquareText, Send, Trash2, AudioLines } from 'lucide-react';
import './Dashboard.css';
import './Driver.css';

export default function DriverDashboard() {
  const { user, logout } = useAuth();
  const { t } = useLanguage();
  const [tripActive, setTripActive] = useState(true);
  const [schedules, setSchedules] = useState([]);
  const [altRequests, setAltRequests] = useState([]);
  const [messageMode, setMessageMode] = useState('text');
  const [messageInput, setMessageInput] = useState('');
  const [messageNotice, setMessageNotice] = useState('');
  const [recording, setRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [audioUrl, setAudioUrl] = useState('');
  const [audioDuration, setAudioDuration] = useState(0);
  const [isSending, setIsSending] = useState(false);
  const mediaRecorderRef = useRef(null);
  const mediaStreamRef = useRef(null);
  const recordingStartRef = useRef(null);
  
  // Find logged in driver, fallback to first driver
  const myDriver = useMemo(() => {
    return driversDB.find(d => d.name.toLowerCase() === user?.name?.toLowerCase()) || driversDB[0];
  }, [user]);

  const myBus = useMemo(() => busesDB.find(b => b.busId === myDriver.busId), [myDriver]);
  const routeStudents = useMemo(() => studentsDB.filter(s => s.routeId === myDriver.routeId && s.status === 'Active'), [myDriver]);

  const [records, setRecords] = useState([]);
  
  const refreshData = useCallback(() => {
    setRecords(getBoardingRecords());
    setSchedules(getFleetSchedules());
    setAltRequests(getAltBusRequests());
  }, []);

  useEffect(() => {
    refreshData();
    const interval = setInterval(refreshData, 2000);
    return () => clearInterval(interval);
  }, [refreshData]);

  const mySchedule = useMemo(() => {
    return schedules.find(sch => sch.busId === myDriver.busId) || schedules[0];
  }, [schedules, myDriver]);

  // Approved passenger transfers assigned to this bus
  const myApprovedTransfers = useMemo(() => {
    return altRequests.filter(r => r.requestedBusId === myDriver.busId && r.status === 'APPROVED');
  }, [altRequests, myDriver]);

  const todayStr = new Date().toLocaleDateString();

  const formatRecordingTime = (seconds) => {
    const total = Math.max(0, Number(seconds) || 0);
    const mins = String(Math.floor(total / 60)).padStart(2, '0');
    const secs = String(total % 60).padStart(2, '0');
    return `${mins}:${secs}`;
  };

  const cleanupVoiceStream = () => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
      mediaStreamRef.current = null;
    }
  };

  const discardVoiceMessage = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      try {
        mediaRecorderRef.current.stop();
      } catch (error) {
        // ignored
      }
    }

    cleanupVoiceStream();
    mediaRecorderRef.current = null;
    recordingStartRef.current = null;
    setRecording(false);
    setRecordingSeconds(0);
    setAudioUrl('');
    setAudioDuration(0);
    setMessageNotice('Voice message discarded.');
  };

  const startVoiceRecording = useCallback(async () => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setMessageNotice('Voice recording is not supported on this device/browser.');
      return;
    }

    try {
      cleanupVoiceStream();
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;
      const recorder = new MediaRecorder(stream);
      const chunks = [];

      recorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          chunks.push(event.data);
        }
      };

      recorder.onstop = async () => {
        cleanupVoiceStream();

        if (!chunks.length) {
          setMessageNotice('The recording was empty. Please try again.');
          setRecording(false);
          setAudioUrl('');
          setAudioDuration(0);
          setRecordingSeconds(0);
          return;
        }

        const blob = new Blob(chunks, { type: recorder.mimeType || 'audio/webm' });
        const reader = new FileReader();
        reader.onloadend = () => {
          setAudioUrl(String(reader.result || ''));
          const duration = recordingStartRef.current ? Math.max(1, Math.floor((Date.now() - recordingStartRef.current) / 1000)) : 0;
          setAudioDuration(duration);
          setRecordingSeconds(duration);
          setRecording(false);
          recordingStartRef.current = null;
        };
        reader.readAsDataURL(blob);
      };

      mediaRecorderRef.current = recorder;
      recordingStartRef.current = Date.now();
      setRecordingSeconds(0);
      setAudioUrl('');
      setAudioDuration(0);
      setRecording(true);
      setMessageNotice('');
      recorder.start();
    } catch (error) {
      const isDenied = error?.name === 'NotAllowedError' || error?.name === 'PermissionDeniedError';
      setMessageNotice(
        isDenied
          ? 'Microphone access was denied. Please allow microphone permission to record a voice message.'
          : 'Microphone could not be accessed on this device.'
      );
    }
  }, []);

  const stopVoiceRecording = useCallback(() => {
    if (!mediaRecorderRef.current || mediaRecorderRef.current.state === 'inactive') {
      setMessageNotice('No active recording to stop.');
      return;
    }

    setRecording(false);
    mediaRecorderRef.current.stop();
  }, []);

  const handleSendTextMessage = () => {
    const trimmed = messageInput.trim();
    if (!trimmed) {
      setMessageNotice('Please type a message before sending.');
      return;
    }

    setIsSending(true);
    try {
      addDriverTextMessage({
        driverId: myDriver.driverId,
        driverName: myDriver.name,
        busId: myBus?.busId || myDriver.busId,
        busNumber: myBus?.busNumber || 'BUS',
        routeId: myDriver.routeId,
        routeName: mySchedule?.routeName || 'School Route',
        text: trimmed
      });
      setMessageInput('');
      setMessageMode('text');
      setMessageNotice('Text message sent to the school admin.');
    } catch (error) {
      setMessageNotice(error.message || 'Text message could not be sent.');
    } finally {
      setIsSending(false);
    }
  };

  const handleSendVoiceMessage = () => {
    if (!audioUrl || !audioDuration || isSending) {
      setMessageNotice('Please record a valid voice message before sending.');
      return;
    }

    setIsSending(true);
    try {
      addDriverVoiceMessage({
        driverId: myDriver.driverId,
        driverName: myDriver.name,
        busId: myBus?.busId || myDriver.busId,
        busNumber: myBus?.busNumber || 'BUS',
        routeId: myDriver.routeId,
        routeName: mySchedule?.routeName || 'School Route',
        audioDataUrl: audioUrl,
        duration: audioDuration
      });
      setAudioUrl('');
      setAudioDuration(0);
      setRecordingSeconds(0);
      setMessageMode('text');
      setMessageNotice('Voice message sent to the school admin.');
    } catch (error) {
      setMessageNotice(error.message || 'Voice message could not be sent.');
    } finally {
      setIsSending(false);
    }
  };

  useEffect(() => {
    if (!recording) return;
    const interval = setInterval(() => {
      setRecordingSeconds(Math.max(0, Math.floor((Date.now() - (recordingStartRef.current || Date.now())) / 1000)));
    }, 250);
    return () => clearInterval(interval);
  }, [recording]);

  useEffect(() => {
    return () => {
      cleanupVoiceStream();
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        try {
          mediaRecorderRef.current.stop();
        } catch (error) {
          // ignored
        }
      }
    };
  }, []);

  const isStudentBoarded = (studentId) => {
    return records.some(r => r.studentId === studentId && r.boardingDate === todayStr && r.status === 'Boarded');
  };

  const toggleStudentBoarding = (student) => {
    if (!tripActive) {
      alert("Please start the trip first.");
      return;
    }
    
    if (isStudentBoarded(student.studentId)) {
      clearBoardingRecordsForStudentToday(student.studentId);
      refreshData();
    } else {
      const now = new Date();
      addBoardingRecord({
        studentId: student.studentId,
        parentId: student.parentId,
        busId: student.busId,
        driverId: myDriver.driverId,
        routeId: student.routeId,
        pickupPoint: student.pickupPoint,
        boardingDate: todayStr,
        boardingTime: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        status: 'Boarded'
      });
      refreshData();
    }
  };

  const handleMarkStop = (stopId, type) => {
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    markStopArrivalDeparture(mySchedule.scheduleId, stopId, type, timeStr);
    refreshData();
  };

  const handleSOS = () => {
    const location = window.prompt("Enter current location for SOS dispatch:", "Near Krishna Nagar Flyover");
    if (!location) return;
    const msg = window.prompt("Enter brief description of issue:", "Engine failure / breakdown");
    if (!msg) return;

    createEmergencyMessage(myDriver.driverId, myDriver.busId, myDriver.routeId, location, msg);
    alert("🚨 Emergency SOS dispatched! School Administration has been alerted and a replacement bus protocol is initialized.");
  };

  const presentCount = routeStudents.filter(s => isStudentBoarded(s.studentId)).length;
  const absentCount = routeStudents.length - presentCount;

  return (
    <div className="driver-page">
      <TopNav name={myDriver.name} roleLabel={t('roleDriver') || 'Driver'} onLogout={logout} />

      <main className="driver-content">
        {/* Driver Header */}
        <motion.div 
          className="driver-header"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="driver-title-group">
            <h1 className="driver-title">Operational Drive Console</h1>
            <p className="driver-subtitle">{myBus?.busNumber} • {mySchedule?.routeName} • Shift: Morning</p>
          </div>
          <button 
            className="driver-sos-btn"
            onClick={handleSOS}
            aria-label="Emergency SOS"
          >
            <ShieldAlert size={20} />
            <span>DISPATCH SOS ALERT</span>
          </button>
        </motion.div>

        {/* Emergency SOS Hotlines & Helplines Card */}
        <motion.div 
          className="driver-info-card"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ 
            marginBottom: 'var(--space-6)',
            borderLeft: '4px solid var(--danger)',
            background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.08) 0%, var(--bg-surface) 100%)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-4)', flexWrap: 'wrap', gap: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ background: 'var(--danger-muted)', color: 'var(--danger)', padding: '8px', borderRadius: '10px', display: 'flex' }}>
                <PhoneCall size={20} />
              </div>
              <div>
                <h3 style={{ fontSize: 'var(--text-heading-m)', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
                  Emergency SOS Helplines (आपातकालीन नंबर)
                </h3>
                <span className="text-muted" style={{ fontSize: 'var(--text-caption)' }}>
                  Tap any number to call immediately in case of breakdown, accident, or medical need.
                </span>
              </div>
            </div>
            <span className="badge badge-danger">24x7 Priority Support</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 'var(--space-3)' }}>
            <a 
              href="tel:+919812345678" 
              className="card" 
              style={{ 
                padding: 'var(--space-3) var(--space-4)', 
                background: 'var(--bg-elevated)', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between',
                textDecoration: 'none',
                color: 'inherit',
                border: '1px solid var(--border)'
              }}
            >
              <div>
                <span className="text-muted" style={{ fontSize: 'var(--text-micro)', textTransform: 'uppercase', display: 'block' }}>School Transport Control</span>
                <strong style={{ color: 'var(--text-primary)', fontSize: 'var(--text-body-m)' }}>+91 98123 45678</strong>
              </div>
              <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--accent-muted)', color: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Phone size={16} />
              </div>
            </a>

            <a 
              href="tel:+919899887766" 
              className="card" 
              style={{ 
                padding: 'var(--space-3) var(--space-4)', 
                background: 'var(--bg-elevated)', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between',
                textDecoration: 'none',
                color: 'inherit',
                border: '1px solid var(--border)'
              }}
            >
              <div>
                <span className="text-muted" style={{ fontSize: 'var(--text-micro)', textTransform: 'uppercase', display: 'block' }}>Breakdown & Mechanic SOS</span>
                <strong style={{ color: 'var(--text-primary)', fontSize: 'var(--text-body-m)' }}>+91 98998 87766</strong>
              </div>
              <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(234, 179, 8, 0.15)', color: 'var(--warning)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Phone size={16} />
              </div>
            </a>

            <a 
              href="tel:112" 
              className="card" 
              style={{ 
                padding: 'var(--space-3) var(--space-4)', 
                background: 'var(--bg-elevated)', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between',
                textDecoration: 'none',
                color: 'inherit',
                border: '1px solid var(--border)'
              }}
            >
              <div>
                <span className="text-muted" style={{ fontSize: 'var(--text-micro)', textTransform: 'uppercase', display: 'block' }}>Police / Medical Emergency</span>
                <strong style={{ color: 'var(--danger)', fontSize: 'var(--text-body-m)' }}>112 (National SOS)</strong>
              </div>
              <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--danger-muted)', color: 'var(--danger)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Phone size={16} />
              </div>
            </a>
          </div>
        </motion.div>

        {/* Approved Alternate Passenger Notifications */}
        <AnimatePresence>
          {myApprovedTransfers.map(trans => (
            <motion.div 
              key={trans.requestId}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="card"
              style={{ borderLeft: '4px solid var(--accent)', background: 'var(--bg-surface)', padding: 'var(--space-4)', marginBottom: 'var(--space-6)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <UserCheck size={18} className="text-accent" />
                  <strong style={{ color: 'var(--text-primary)' }}>New Authorized Passenger: {trans.studentName}</strong>
                </div>
                <p className="text-muted" style={{ fontSize: 'var(--text-body-s)', marginTop: '4px' }}>
                  Missed regular bus. Authorized by School Admin to board at <strong>{trans.stopName}</strong>.
                </p>
              </div>
              <span className="badge badge-info">Transfer Approved</span>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Trip Controls */}
        <motion.div 
          className="driver-info-card driver-trip-card"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <div className="driver-trip-header">
            <div>
              <span className="card-eyebrow">ACTIVE ROUTE RUN</span>
              <h2 className="driver-trip-title">{mySchedule?.routeName}</h2>
            </div>
            <span className={`trip-badge ${tripActive ? 'active' : 'idle'}`}>
              {tripActive ? '● TRIP IN PROGRESS' : 'TRIP NOT STARTED'}
            </span>
          </div>

          <button 
            className={`btn driver-trip-btn ${tripActive ? 'btn-danger' : 'btn-success'}`}
            onClick={() => setTripActive(!tripActive)}
          >
            <Power size={20} />
            <span>{tripActive ? 'END TRIP' : 'START TRIP'}</span>
          </button>
        </motion.div>

        {/* Driver Communication Center */}
        <motion.div 
          className="driver-info-card driver-message-panel"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ marginBottom: 'var(--space-6)' }}
        >
          <div className="driver-message-header">
            <div>
              <span className="card-eyebrow">COMMUNICATION CENTER</span>
              <h3 className="driver-message-title">Choose how you want to send your message</h3>
            </div>
          </div>

          <div className="driver-message-mode">
            <button
              type="button"
              className={`driver-mode-btn ${messageMode === 'text' ? 'active' : ''}`}
              onClick={() => setMessageMode('text')}
            >
              <MessageSquareText size={18} />
              <span>Type Message</span>
            </button>
            <button
              type="button"
              className={`driver-mode-btn ${messageMode === 'voice' ? 'active' : ''}`}
              onClick={() => setMessageMode('voice')}
            >
              <Mic size={18} />
              <span>Record Voice</span>
            </button>
          </div>

          {messageNotice && <div className="driver-message-status">{messageNotice}</div>}

          {messageMode === 'text' ? (
            <div className="driver-message-form">
              <textarea
                value={messageInput}
                onChange={(event) => setMessageInput(event.target.value)}
                placeholder="Type your message to the school admin..."
                rows={4}
                disabled={isSending}
              />
              <button className="btn btn-primary driver-send-btn" onClick={handleSendTextMessage} disabled={isSending}>
                <Send size={18} />
                <span>{isSending ? 'Sending...' : 'Send'}</span>
              </button>
            </div>
          ) : (
            <div className="driver-recording-panel">
              {!recording && !audioUrl && (
                <div className="driver-voice-actions">
                  <button className="btn btn-primary driver-voice-btn" onClick={startVoiceRecording} disabled={isSending}>
                    <Mic size={18} />
                    <span>🎙️ Record Voice</span>
                  </button>
                </div>
              )}

              {recording && (
                <div className="driver-recording-box">
                  <div className="driver-recording-indicator">
                    <span className="recording-dot" />
                    <span>Recording... {formatRecordingTime(recordingSeconds)}</span>
                  </div>
                  <button className="btn btn-secondary driver-stop-btn" onClick={stopVoiceRecording}>
                    <AudioLines size={18} />
                    <span>Stop Recording</span>
                  </button>
                </div>
              )}

              {!recording && audioUrl && (
                <div className="driver-audio-preview">
                  <audio controls src={audioUrl} />
                  <div className="driver-audio-controls">
                    <span className="driver-audio-duration">Duration: {formatRecordingTime(audioDuration)}</span>
                    <div className="driver-audio-buttons">
                      <button className="btn btn-secondary btn-sm" onClick={discardVoiceMessage}>
                        <Trash2 size={16} />
                        <span>Delete</span>
                      </button>
                      <button className="btn btn-primary btn-sm" onClick={handleSendVoiceMessage} disabled={isSending}>
                        <Send size={16} />
                        <span>{isSending ? 'Sending...' : 'Send Voice Message'}</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </motion.div>

        {/* Master Route Timetable Operational Checklist */}
        <motion.div 
          className="driver-info-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ marginBottom: 'var(--space-6)' }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)' }}>
            <div>
              <span className="card-eyebrow">ROUTE TIMETABLE DISPATCH</span>
              <h3 style={{ fontSize: 'var(--text-heading-m)', color: 'var(--text-primary)' }}>Stop Arrival & Departure Log</h3>
            </div>
            <span className="badge badge-info">Live Sync</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
            {mySchedule?.stops?.map((stop, idx) => (
              <div 
                key={stop.stopId}
                className="card"
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 'var(--space-3) var(--space-4)', background: stop.status === 'Completed' ? 'var(--bg-surface)' : 'var(--bg-elevated)' }}
              >
                <div>
                  <strong style={{ color: 'var(--text-primary)' }}>{idx + 1}. {stop.name}</strong>
                  <div className="text-muted" style={{ fontSize: 'var(--text-caption)', marginTop: '2px' }}>
                    Scheduled: Arr <strong>{stop.scheduledArrival}</strong> • Dep <strong>{stop.scheduledDeparture}</strong>
                    {stop.actualArrival && <span style={{ marginLeft: 8, color: 'var(--accent)' }}>(Actual Arr: {stop.actualArrival})</span>}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                  {stop.status !== 'Completed' && (
                    <>
                      <button 
                        className="btn btn-secondary btn-sm"
                        onClick={() => handleMarkStop(stop.stopId, 'ARRIVED')}
                      >
                        <Clock size={14} /> Mark Arrived
                      </button>
                      <button 
                        className="btn btn-primary btn-sm"
                        onClick={() => handleMarkStop(stop.stopId, 'DEPARTED')}
                      >
                        <Navigation size={14} /> Mark Departed
                      </button>
                    </>
                  )}
                  {stop.status === 'Completed' && (
                    <span className="badge badge-success" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <CheckCircle2 size={14} /> Stop Completed
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Speed Gauge & Attendance */}
        <div className="driver-grid">
          <motion.div 
            className="driver-info-card driver-speed-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h3 className="card-eyebrow">{t('liveTelemetry') || 'SPEED TELEMETRY'}</h3>
            <div className="driver-speed-display">
              <div className="driver-speed-value">{tripActive ? '38' : '0'}</div>
              <div className="driver-speed-unit">km/h</div>
            </div>
            <div className="driver-speed-bar">
              <div className="driver-speed-fill" style={{ width: tripActive ? '55%' : '0%' }}></div>
            </div>
            <div className="driver-speed-footer">
              <span>Speed Limit: 50 km/h</span>
              <span className="text-success">Normal Range</span>
            </div>
          </motion.div>

          <motion.div 
            className="driver-info-card driver-attendance-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <h3 className="card-eyebrow">{t('studentsBoarding') || 'STUDENTS BOARDING'}</h3>
            <div className="attendance-stats">
              <div className="stat-box present">
                <UserCheck size={32} className="stat-icon" />
                <div>
                  <div className="stat-value">{presentCount}</div>
                  <div className="stat-label">{t('present') || 'Present'}</div>
                </div>
              </div>
              <div className="stat-box absent">
                <UserX size={32} className="stat-icon" />
                <div>
                  <div className="stat-value">{absentCount}</div>
                  <div className="stat-label">{t('absent') || 'Absent'}</div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Passenger Boarding Manifest Checklist */}
        <motion.div 
          className="driver-info-card driver-students-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h3 className="card-eyebrow">Students on Route Manifest</h3>
          <div className="driver-student-list">
            {routeStudents.map((s) => {
              const boarded = isStudentBoarded(s.studentId);
              return (
                <div key={s.studentId} className={`driver-student-item ${boarded ? 'boarded' : ''}`}>
                  <button
                    className={`student-checkbox ${boarded ? 'checked' : ''}`}
                    onClick={() => toggleStudentBoarding(s)}
                    aria-pressed={boarded}
                  >
                    {boarded && <Check size={16} strokeWidth={3} />}
                  </button>
                  <div className="student-info">
                    <span className="student-name">{s.name}</span>
                    <span className="student-pickup">{s.pickupPoint}</span>
                  </div>
                  {boarded && (
                    <span className="student-badge success">Boarded</span>
                  )}
                </div>
              );
            })}
            {routeStudents.length === 0 && (
              <div className="empty-state">No active students on this route.</div>
            )}
          </div>
        </motion.div>
      </main>
    </div>
  );
}
