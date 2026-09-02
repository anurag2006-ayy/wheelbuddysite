import { parentsDB, studentsDB, routesDB, busesDB, driversDB } from './mockData';

export const initDB = () => {
  if (!localStorage.getItem('wb_boardingRecords')) {
    localStorage.setItem('wb_boardingRecords', JSON.stringify([]));
  }
};

export const getBoardingRecords = () => {
  initDB();
  return JSON.parse(localStorage.getItem('wb_boardingRecords'));
};

export const addBoardingRecord = (record) => {
  const records = getBoardingRecords();
  const newRecord = { ...record, boardingId: 'BRD' + Date.now() };
  records.push(newRecord);
  localStorage.setItem('wb_boardingRecords', JSON.stringify(records));
};

export const clearBoardingRecordsForStudentToday = (studentId) => {
    const records = getBoardingRecords();
    const today = new Date().toLocaleDateString();
    const updated = records.filter(r => !(r.studentId === studentId && r.boardingDate === today));
    localStorage.setItem('wb_boardingRecords', JSON.stringify(updated));
};

export const getParentByEmailOrName = (identifier) => {
  return parentsDB.find(p => 
    p.email.toLowerCase() === identifier.toLowerCase() || 
    p.name.toLowerCase() === identifier.toLowerCase()
  ) || parentsDB[0]; // fallback to first parent
};

export const getStudentByParentId = (parentId) => {
  return studentsDB.find(s => s.parentId === parentId);
};

export const getFullStudentDetails = (studentId) => {
  const student = studentsDB.find(s => s.studentId === studentId);
  if (!student) return null;
  const parent = parentsDB.find(p => p.parentId === student.parentId);
  const bus = busesDB.find(b => b.busId === student.busId);
  const route = routesDB.find(r => r.routeId === student.routeId);
  const driver = driversDB.find(d => d.busId === student.busId);
  return { student, parent, bus, route, driver };
};

export const initEmergencyDB = () => {
  if (!localStorage.getItem('wb_emergencyMessages')) {
    localStorage.setItem('wb_emergencyMessages', JSON.stringify([]));
  }
  if (!localStorage.getItem('wb_parentNotifications')) {
    localStorage.setItem('wb_parentNotifications', JSON.stringify([]));
  }
};

// --- EMERGENCY MESSAGES (Driver -> Admin) ---

export const getEmergencyMessages = () => {
  initEmergencyDB();
  return JSON.parse(localStorage.getItem('wb_emergencyMessages'));
};

export const createEmergencyMessage = (driverId, busId, routeId, location, driverMessage) => {
  const msgs = getEmergencyMessages();
  const newEmergency = {
    emergencyId: 'EMG' + Date.now(),
    driverId,
    busId,
    routeId,
    location,
    driverMessage,
    createdAt: new Date().toISOString(),
    status: 'NEW', // NEW, UNDER REVIEW, PARENT NOTIFIED, RESOLVED
    adminResponse: null,
    resolvedAt: null
  };
  msgs.push(newEmergency);
  localStorage.setItem('wb_emergencyMessages', JSON.stringify(msgs));
  return newEmergency;
};

export const updateEmergencyStatus = (emergencyId, status) => {
  const msgs = getEmergencyMessages();
  const updated = msgs.map(m => {
    if (m.emergencyId === emergencyId) {
      return { 
        ...m, 
        status, 
        resolvedAt: status === 'RESOLVED' ? new Date().toISOString() : m.resolvedAt 
      };
    }
    return m;
  });
  localStorage.setItem('wb_emergencyMessages', JSON.stringify(updated));
};

// --- PARENT NOTIFICATIONS (Admin -> Parent) ---

export const getParentNotifications = () => {
  initEmergencyDB();
  return JSON.parse(localStorage.getItem('wb_parentNotifications'));
};

export const sendParentNotification = (emergencyId, busId, routeId, adminMessage) => {
  const notifications = getParentNotifications();
  const affectedStudents = studentsDB.filter(s => s.busId === busId);
  const notifiedParents = [...new Set(affectedStudents.map(s => s.parentId))];
  
  const newNotifs = notifiedParents.map(parentId => {
    return {
      notificationId: 'NOTIF' + Date.now() + Math.random().toString(36).substr(2, 5),
      emergencyId,
      parentId,
      busId,
      routeId,
      adminMessage,
      sentAt: new Date().toISOString(),
      readAt: null,
      status: 'UNREAD'
    };
  });

  localStorage.setItem('wb_parentNotifications', JSON.stringify([...notifications, ...newNotifs]));
  
  // Update Emergency status
  updateEmergencyStatus(emergencyId, 'PARENT NOTIFIED');
  return newNotifs;
};

export const getNotificationsForParent = (parentId) => {
  const notifications = getParentNotifications();
  return notifications.filter(n => n.parentId === parentId);
};

export const markNotificationAsRead = (notificationId) => {
  const notifications = getParentNotifications();
  const updated = notifications.map(n => {
    if (n.notificationId === notificationId) {
      return { ...n, readAt: new Date().toISOString(), status: 'READ' };
    }
    return n;
  });
  localStorage.setItem('wb_parentNotifications', JSON.stringify(updated));
};

// --- DRIVER COMMUNICATION MESSAGES (Text + Voice) ---

export const initDriverMessagesDB = () => {
  if (!localStorage.getItem('wb_driverMessages')) {
    localStorage.setItem('wb_driverMessages', JSON.stringify([]));
  }
};

export const getDriverMessages = () => {
  initDriverMessagesDB();
  return JSON.parse(localStorage.getItem('wb_driverMessages') || '[]');
};

export const addDriverTextMessage = ({ driverId, driverName, busId, busNumber, routeId, routeName, text }) => {
  const messages = getDriverMessages();
  const newMessage = {
    id: 'MSG' + Date.now() + Math.random().toString(36).slice(2, 8),
    driverId,
    driverName,
    busId,
    busNumber,
    routeId,
    routeName,
    type: 'text',
    text: String(text || '').trim(),
    audioDataUrl: null,
    duration: null,
    createdAt: new Date().toISOString(),
    status: 'UNREAD',
    readAt: null
  };

  if (!newMessage.text) {
    throw new Error('Message cannot be empty.');
  }

  messages.unshift(newMessage);
  localStorage.setItem('wb_driverMessages', JSON.stringify(messages));
  return newMessage;
};

export const addDriverVoiceMessage = ({ driverId, driverName, busId, busNumber, routeId, routeName, audioDataUrl, duration }) => {
  const messages = getDriverMessages();
  const cleanDuration = Number(duration || 0);
  const newMessage = {
    id: 'MSG' + Date.now() + Math.random().toString(36).slice(2, 8),
    driverId,
    driverName,
    busId,
    busNumber,
    routeId,
    routeName,
    type: 'voice',
    text: null,
    audioDataUrl: audioDataUrl || null,
    duration: cleanDuration > 0 ? cleanDuration : null,
    createdAt: new Date().toISOString(),
    status: 'UNREAD',
    readAt: null
  };

  if (!newMessage.audioDataUrl || !newMessage.duration) {
    throw new Error('Please record a valid voice message before sending.');
  }

  messages.unshift(newMessage);
  localStorage.setItem('wb_driverMessages', JSON.stringify(messages));
  return newMessage;
};

export const markDriverMessageAsRead = (messageId) => {
  const messages = getDriverMessages();
  const updated = messages.map(message => {
    if (message.id === messageId) {
      return { ...message, status: 'READ', readAt: new Date().toISOString() };
    }
    return message;
  });
  localStorage.setItem('wb_driverMessages', JSON.stringify(updated));
  return updated;
};

// ==========================================
// CENTRAL BUS SCHEDULE & FLEET TIMETABLE ENGINE
// ==========================================

export const initialFleetSchedules = [
  {
    scheduleId: 'SCH-01',
    busId: 'B101',
    busNumber: 'BUS-01',
    driverId: 'DRV001',
    driverName: 'Rahul Kumar',
    routeId: 'R01',
    routeName: 'GLA -> Mathura',
    direction: 'Morning Pickup',
    status: 'On Route', // Scheduled, On Route, Delayed, Breakdown, Replacement Assigned, Completed
    specialDayType: 'Regular Day', // Regular Day, Exam Day, Holiday, Half Day
    version: 1,
    lastUpdated: new Date().toISOString(),
    stops: [
      { stopId: 'STP-01', name: 'GLA Depot', scheduledArrival: '07:00 AM', scheduledDeparture: '07:05 AM', actualArrival: '07:00 AM', actualDeparture: '07:04 AM', status: 'Completed', distance: '0.0 km', eta: 'Completed' },
      { stopId: 'STP-02', name: 'Krishna Nagar', scheduledArrival: '07:20 AM', scheduledDeparture: '07:22 AM', actualArrival: '07:21 AM', actualDeparture: '07:23 AM', status: 'Completed', distance: '4.2 km', eta: 'Completed' },
      { stopId: 'STP-03', name: 'Main Road Chowk', scheduledArrival: '07:35 AM', scheduledDeparture: '07:37 AM', actualArrival: null, actualDeparture: null, status: 'Approaching', distance: '7.5 km', eta: '3 min' },
      { stopId: 'STP-04', name: 'Civil Lines', scheduledArrival: '07:50 AM', scheduledDeparture: '07:52 AM', actualArrival: null, actualDeparture: null, status: 'Upcoming', distance: '10.8 km', eta: '18 min' },
      { stopId: 'STP-05', name: 'GLA Main Campus', scheduledArrival: '08:15 AM', scheduledDeparture: '08:20 AM', actualArrival: null, actualDeparture: null, status: 'Upcoming', distance: '14.5 km', eta: '43 min' }
    ]
  },
  {
    scheduleId: 'SCH-02',
    busId: 'B102',
    busNumber: 'BUS-02',
    driverId: 'DRV002',
    driverName: 'Amit Sharma',
    routeId: 'R02',
    routeName: 'GLA -> Agra',
    direction: 'Morning Pickup',
    status: 'Delayed',
    specialDayType: 'Regular Day',
    version: 2,
    lastUpdated: new Date().toISOString(),
    stops: [
      { stopId: 'STP-06', name: 'Agra Cantt', scheduledArrival: '07:15 AM', scheduledDeparture: '07:18 AM', actualArrival: '07:22 AM', actualDeparture: '07:25 AM', status: 'Completed', distance: '0.0 km', eta: 'Completed' },
      { stopId: 'STP-07', name: 'Sikandra Crossing', scheduledArrival: '07:35 AM', scheduledDeparture: '07:38 AM', actualArrival: null, actualDeparture: null, status: 'Approaching', distance: '6.5 km', eta: '8 min' },
      { stopId: 'STP-08', name: 'Farah Toll Plaza', scheduledArrival: '07:55 AM', scheduledDeparture: '07:57 AM', actualArrival: null, actualDeparture: null, status: 'Upcoming', distance: '18.2 km', eta: '28 min' },
      { stopId: 'STP-09', name: 'GLA Main Campus', scheduledArrival: '08:20 AM', scheduledDeparture: '08:25 AM', actualArrival: null, actualDeparture: null, status: 'Upcoming', distance: '26.0 km', eta: '53 min' }
    ]
  },
  {
    scheduleId: 'SCH-03',
    busId: 'B103',
    busNumber: 'BUS-03',
    driverId: 'DRV003',
    driverName: 'Meena Devi',
    routeId: 'R03',
    routeName: 'Govardhan -> City Center',
    direction: 'Morning Pickup',
    status: 'On Route',
    specialDayType: 'Regular Day',
    version: 1,
    lastUpdated: new Date().toISOString(),
    stops: [
      { stopId: 'STP-10', name: 'Govardhan Bus Stand', scheduledArrival: '07:10 AM', scheduledDeparture: '07:12 AM', actualArrival: '07:10 AM', actualDeparture: '07:12 AM', status: 'Completed', distance: '0.0 km', eta: 'Completed' },
      { stopId: 'STP-11', name: 'Krishna Nagar', scheduledArrival: '07:45 AM', scheduledDeparture: '07:47 AM', actualArrival: null, actualDeparture: null, status: 'Approaching', distance: '12.0 km', eta: '12 min' },
      { stopId: 'STP-12', name: 'GLA Main Campus', scheduledArrival: '08:15 AM', scheduledDeparture: '08:20 AM', actualArrival: null, actualDeparture: null, status: 'Upcoming', distance: '18.4 km', eta: '42 min' }
    ]
  }
];

export const initScheduleDB = () => {
  if (!localStorage.getItem('wb_fleetSchedules')) {
    localStorage.setItem('wb_fleetSchedules', JSON.stringify(initialFleetSchedules));
  }
  if (!localStorage.getItem('wb_altBusRequests')) {
    localStorage.setItem('wb_altBusRequests', JSON.stringify([
      {
        requestId: 'REQ-101',
        studentId: 'STU001',
        studentName: 'Aarav Kumar',
        parentId: 'PAR001',
        parentName: 'Rajesh Kumar',
        originalBusId: 'B101',
        originalBusNumber: 'BUS-01',
        requestedBusId: 'B103',
        requestedBusNumber: 'BUS-03',
        stopName: 'Krishna Nagar',
        requestedAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
        status: 'PENDING', // PENDING, APPROVED, REJECTED
        reason: 'Missed scheduled BUS-01 at Krishna Nagar'
      }
    ]));
  }
  if (!localStorage.getItem('wb_scheduleAuditLog')) {
    localStorage.setItem('wb_scheduleAuditLog', JSON.stringify([
      {
        logId: 'LOG-01',
        action: 'SCHEDULE_CREATED',
        adminName: 'Admin System',
        details: 'Initial master schedule initialized for Routes R01, R02, R03',
        timestamp: new Date().toISOString()
      }
    ]));
  }
};

export const getFleetSchedules = () => {
  initScheduleDB();
  return JSON.parse(localStorage.getItem('wb_fleetSchedules'));
};

export const saveFleetSchedules = (schedules) => {
  localStorage.setItem('wb_fleetSchedules', JSON.stringify(schedules));
};

export const updateStopTiming = (scheduleId, stopId, newArrival, newDeparture, adminName = 'Admin') => {
  const schedules = getFleetSchedules();
  let updatedSchedule = null;
  const updated = schedules.map(sch => {
    if (sch.scheduleId === scheduleId) {
      const updatedStops = sch.stops.map(st => {
        if (st.stopId === stopId) {
          return { ...st, scheduledArrival: newArrival, scheduledDeparture: newDeparture };
        }
        return st;
      });
      updatedSchedule = {
        ...sch,
        version: sch.version + 1,
        lastUpdated: new Date().toISOString(),
        stops: updatedStops
      };
      return updatedSchedule;
    }
    return sch;
  });

  saveFleetSchedules(updated);
  logScheduleAction('STOP_TIMING_UPDATED', adminName, `Updated timing for ${updatedSchedule?.busNumber} at stop ${stopId}: Arr ${newArrival}, Dep ${newDeparture}`);
  return updated;
};

export const markStopArrivalDeparture = (scheduleId, stopId, type, timeStr) => {
  const schedules = getFleetSchedules();
  const updated = schedules.map(sch => {
    if (sch.scheduleId === scheduleId) {
      const updatedStops = sch.stops.map(st => {
        if (st.stopId === stopId) {
          if (type === 'ARRIVED') {
            return { ...st, actualArrival: timeStr, status: 'At Stop' };
          }
          if (type === 'DEPARTED') {
            return { ...st, actualDeparture: timeStr, status: 'Completed' };
          }
        }
        return st;
      });
      return { ...sch, stops: updatedStops, lastUpdated: new Date().toISOString() };
    }
    return sch;
  });
  saveFleetSchedules(updated);
  return updated;
};

export const assignReplacementBus = (originalBusId, replacementBusId, replacementBusNumber, adminName = 'Admin') => {
  const schedules = getFleetSchedules();
  const updated = schedules.map(sch => {
    if (sch.busId === originalBusId) {
      return {
        ...sch,
        busId: replacementBusId,
        busNumber: replacementBusNumber,
        status: 'Replacement Assigned',
        version: sch.version + 1,
        lastUpdated: new Date().toISOString()
      };
    }
    return sch;
  });
  saveFleetSchedules(updated);
  logScheduleAction('REPLACEMENT_BUS_ASSIGNED', adminName, `Assigned replacement bus ${replacementBusNumber} for original bus ${originalBusId}`);
  return updated;
};

export const detectScheduleConflicts = (busId, driverId, startTime, endTime) => {
  const schedules = getFleetSchedules();
  const conflicts = [];
  schedules.forEach(sch => {
    if (sch.busId === busId) {
      conflicts.push(`Bus ${sch.busNumber} is already scheduled on ${sch.routeName}`);
    }
    if (sch.driverId === driverId) {
      conflicts.push(`Driver ${sch.driverName} is already assigned on ${sch.routeName}`);
    }
  });
  return conflicts;
};

// Alternative Bus Requests ("I Missed My Bus")
export const getAltBusRequests = () => {
  initScheduleDB();
  return JSON.parse(localStorage.getItem('wb_altBusRequests'));
};

export const createAltBusRequest = (studentId, studentName, parentId, parentName, originalBusId, originalBusNumber, requestedBusId, requestedBusNumber, stopName) => {
  const requests = getAltBusRequests();
  const newReq = {
    requestId: 'REQ-' + Date.now(),
    studentId,
    studentName,
    parentId,
    parentName,
    originalBusId,
    originalBusNumber,
    requestedBusId,
    requestedBusNumber,
    stopName,
    requestedAt: new Date().toISOString(),
    status: 'PENDING',
    reason: `Missed scheduled ${originalBusNumber} at ${stopName}`
  };
  requests.unshift(newReq);
  localStorage.setItem('wb_altBusRequests', JSON.stringify(requests));
  return newReq;
};

export const updateAltBusRequestStatus = (requestId, status, adminName = 'Admin') => {
  const requests = getAltBusRequests();
  const updated = requests.map(r => {
    if (r.requestId === requestId) {
      return { ...r, status, reviewedAt: new Date().toISOString(), reviewedBy: adminName };
    }
    return r;
  });
  localStorage.setItem('wb_altBusRequests', JSON.stringify(updated));
  logScheduleAction('ALT_BUS_REQUEST_REVIEWED', adminName, `${status} alternate bus request ${requestId}`);
  return updated;
};

export const getScheduleAuditLog = () => {
  initScheduleDB();
  return JSON.parse(localStorage.getItem('wb_scheduleAuditLog'));
};

export const logScheduleAction = (action, adminName, details) => {
  const logs = getScheduleAuditLog();
  const newLog = {
    logId: 'LOG-' + Date.now(),
    action,
    adminName,
    details,
    timestamp: new Date().toISOString()
  };
  logs.unshift(newLog);
  localStorage.setItem('wb_scheduleAuditLog', JSON.stringify(logs.slice(0, 50)));
};

// ==========================================
// SOS ARCHIVE / HISTORY SYSTEM
// ==========================================

export const initSOSArchive = () => {
  if (!localStorage.getItem('wb_sosArchive')) {
    localStorage.setItem('wb_sosArchive', JSON.stringify([]));
  }
  if (!localStorage.getItem('wb_adminActionLog')) {
    localStorage.setItem('wb_adminActionLog', JSON.stringify([]));
  }
};

export const getSOSHistory = () => {
  initSOSArchive();
  return JSON.parse(localStorage.getItem('wb_sosArchive') || '[]');
};

export const archiveEmergencyMessage = (emergencyId, adminId = 'ADMIN', adminName = 'Admin') => {
  initSOSArchive();
  const messages = getEmergencyMessages();
  const target = messages.find(m => m.emergencyId === emergencyId);
  if (!target) return false;

  // Move to archive
  const archive = getSOSHistory();
  archive.unshift({
    ...target,
    archivedAt: new Date().toISOString(),
    archivedBy: adminName,
    archiveReason: 'Admin removed from active list'
  });
  localStorage.setItem('wb_sosArchive', JSON.stringify(archive));

  // Remove from active
  const remaining = messages.filter(m => m.emergencyId !== emergencyId);
  localStorage.setItem('wb_emergencyMessages', JSON.stringify(remaining));

  // Log admin action
  logAdminAction(adminId, adminName, 'REMOVE_SOS', emergencyId, `Removed SOS alert ${emergencyId} from active list`);

  return true;
};

export const deleteEmergencyMessage = (emergencyId) => {
  const messages = getEmergencyMessages();
  const remaining = messages.filter(m => m.emergencyId !== emergencyId);
  localStorage.setItem('wb_emergencyMessages', JSON.stringify(remaining));
  return remaining;
};

// ==========================================
// ADMIN ACTION LOG
// ==========================================

export const logAdminAction = (adminId, adminName, action, targetId, details) => {
  initSOSArchive();
  const logs = JSON.parse(localStorage.getItem('wb_adminActionLog') || '[]');
  const newLog = {
    logId: 'ACT-' + Date.now(),
    adminId,
    adminName,
    action,
    targetId,
    details,
    timestamp: new Date().toISOString()
  };
  logs.unshift(newLog);
  localStorage.setItem('wb_adminActionLog', JSON.stringify(logs.slice(0, 200)));
  return newLog;
};

export const getAdminActionLog = () => {
  initSOSArchive();
  return JSON.parse(localStorage.getItem('wb_adminActionLog') || '[]');
};


