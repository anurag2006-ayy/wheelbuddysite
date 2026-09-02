// Mock data standing in for the real API described in the architecture diagram
// (Driver App -> Backend -> Database -> Parent Portal, GPS/attendance/trip endpoints).
// Swap these for real fetch() calls against your Node/Express + MySQL backend.

export const routePath = [
    { x: 40, y: 210 }, { x: 90, y: 170 }, { x: 150, y: 185 }, { x: 210, y: 130 },
    { x: 260, y: 140 }, { x: 320, y: 90 }, { x: 380, y: 100 }, { x: 430, y: 60 },
];

export const stops = [
    { id: 1, name: 'GLA University Gate', time: '7:05 AM', boarded: true },
    { id: 2, name: 'Krishna Nagar Chowk', time: '7:14 AM', boarded: true },
    { id: 3, name: 'Vrindavan Road Junction', time: '7:22 AM', boarded: true },
    { id: 4, name: 'Civil Lines', time: '7:31 AM', boarded: false },
    { id: 5, name: 'Mathura Cantt Station', time: '7:40 AM', boarded: false },
    { id: 6, name: 'Holi Gate', time: '7:48 AM', boarded: false },
];

export const students = [
    { id: 1, name: 'Aarav Sharma', stop: 'GLA University Gate', present: true },
    { id: 2, name: 'Diya Patel', stop: 'GLA University Gate', present: true },
    { id: 3, name: 'Vihaan Gupta', stop: 'Krishna Nagar Chowk', present: true },
    { id: 4, name: 'Ananya Singh', stop: 'Krishna Nagar Chowk', present: false },
    { id: 5, name: 'Reyansh Verma', stop: 'Vrindavan Road Junction', present: true },
    { id: 6, name: 'Ishita Yadav', stop: 'Civil Lines', present: false },
];

export const buses = [
    { id: 'BUS-101', number: 'BUS-01', registration: 'UP85 AB 1234', driver: 'Rahul Kumar', driverId: 'DRV001', phone: '+91 9812345621', route: 'GLA -> Mathura', startPoint: 'GLA University', endPoint: 'Mathura', password: 'password123', avgSpeed: 38, delays: 0, harshBraking: 1, status: 'Active' },
    { id: 'BUS-102', number: 'BUS-02', registration: 'UP85 AB 5566', driver: 'Amit Sharma', driverId: 'DRV002', phone: '+91 9712345645', route: 'GLA -> Agra', startPoint: 'GLA University', endPoint: 'Agra', password: 'password123', avgSpeed: 29, delays: 2, harshBraking: 3, status: 'Active' },
    { id: 'BUS-103', number: 'BUS-03', registration: 'UP85 AB 7788', driver: 'Meena Devi', driverId: 'DRV003', phone: '+91 9810034567', route: 'Govardhan -> City Center', startPoint: 'Govardhan', endPoint: 'City Center', password: 'password123', avgSpeed: 41, delays: 0, harshBraking: 0, status: 'Active' },
    { id: 'BUS-104', number: 'BUS-04', registration: 'UP85 AB 9012', driver: 'Anil Chauhan', driverId: 'DRV004', phone: '+91 9810045678', route: 'Farah -> Sadar Bazaar', startPoint: 'Farah', endPoint: 'Sadar Bazaar', password: 'password123', avgSpeed: 22, delays: 4, harshBraking: 5, status: 'Inactive' },
    { id: 'BUS-105', number: 'BUS-05', registration: 'UP85 AB 3344', driver: 'Pooja Sharma', driverId: 'DRV005', phone: '+91 9810056789', route: 'Baldeo -> Station Road', startPoint: 'Baldeo', endPoint: 'Station Road', password: 'password123', avgSpeed: 35, delays: 1, harshBraking: 1, status: 'Active' },
    { id: 'BUS-106', number: 'BUS-06', registration: 'UP85 AB 6677', driver: null, driverId: null, phone: null, route: 'Unassigned', startPoint: '-', endPoint: '-', password: null, avgSpeed: 0, delays: 0, harshBraking: 0, status: 'Unassigned' },
    { id: 'BUS-107', number: 'BUS-07', registration: 'UP85 AB 8899', driver: 'Kavita Joshi', driverId: 'DRV007', phone: '+91 9810078901', route: 'Mant Road -> Central', startPoint: 'Mant Road', endPoint: 'Central', password: 'password123', avgSpeed: 33, delays: 0, harshBraking: 2, status: 'Active' },
    { id: 'BUS-108', number: 'BUS-08', registration: 'UP85 AB 2233', driver: 'Manoj Tiwari', driverId: 'DRV008', phone: '+91 9810089012', route: 'Chhata -> GT Road', startPoint: 'Chhata', endPoint: 'GT Road', password: 'password123', avgSpeed: 27, delays: 3, harshBraking: 2, status: 'Active' },
];

export const parentBus = buses[0];

export const fleetSummary = {
    totalBuses: buses.length,
    activeBuses: buses.filter(b => b.status === 'Active').length,
    unassignedBuses: buses.filter(b => b.status === 'Unassigned').length,
    avgFleetSpeed: Math.round(buses.reduce((s, b) => s + b.avgSpeed, 0) / buses.length),
    delayCount: buses.reduce((s, b) => s + b.delays, 0),
    harshBrakingCount: buses.reduce((s, b) => s + b.harshBraking, 0),
};
// New Relational DB Mock Data
export const routesDB = [
    { routeId: 'R01', routeName: 'GLA -> Mathura', startPoint: 'GLA University', endPoint: 'Mathura' },
    { routeId: 'R02', routeName: 'GLA -> Agra', startPoint: 'GLA University', endPoint: 'Agra' },
    { routeId: 'R03', routeName: 'Govardhan -> City Center', startPoint: 'Govardhan', endPoint: 'City Center' }
];

export const busesDB = [
    { busId: 'B101', busNumber: 'BUS-01', registrationNumber: 'UP85 AB 1234', routeId: 'R01' },
    { busId: 'B102', busNumber: 'BUS-02', registrationNumber: 'UP85 AB 5566', routeId: 'R02' },
    { busId: 'B103', busNumber: 'BUS-03', registrationNumber: 'UP85 AB 7788', routeId: 'R03' }
];

export const driversDB = [
    { driverId: 'DRV001', name: 'Rahul Kumar', phone: '98XXXXXX21', busId: 'B101', routeId: 'R01', status: 'Active' },
    { driverId: 'DRV002', name: 'Amit Sharma', phone: '97XXXXXX45', busId: 'B102', routeId: 'R02', status: 'Active' },
    { driverId: 'DRV003', name: 'Meena Devi', phone: '96XXXXXX33', busId: 'B103', routeId: 'R03', status: 'Active' }
];

export const parentsDB = [
    { parentId: 'PAR001', name: 'Rajesh Kumar', phone: '98XXXXXX21', alternatePhone: '97XXXXXX22', address: '123 Main St, Mathura', email: 'rajesh@example.com' },
    { parentId: 'PAR002', name: 'Vikram Singh', phone: '96XXXXXX33', alternatePhone: '95XXXXXX44', address: '456 Govardhan Rd, Mathura', email: 'vikram@example.com' },
    { parentId: 'PAR003', name: 'Suresh Gupta', phone: '94XXXXXX55', alternatePhone: '93XXXXXX66', address: '789 Civil Lines, Mathura', email: 'suresh@example.com' },
    { parentId: 'PAR004', name: 'Rajesh Patel', phone: '91XXXXXX77', alternatePhone: '92XXXXXX88', address: '321 Cantonment, Agra', email: 'rajesh.patel@example.com' },
    { parentId: 'PAR005', name: 'Amit Verma', phone: '99XXXXXX99', alternatePhone: '98XXXXXX00', address: '654 Station Rd, Agra', email: 'amit@example.com' }
];

export const studentsDB = [
    { studentId: 'STU001', name: 'Aarav Kumar', class: '8th', section: 'A', dob: '2012-03-15', parentId: 'PAR001', parentName: 'Rajesh Kumar', parentPhone: '98XXXXXX21', alternatePhone: '97XXXXXX22', address: '123 Main St, Mathura', pickupPoint: 'Krishna Nagar', dropPoint: 'GLA Gate', routeId: 'R01', busId: 'B101', status: 'Active' },
    { studentId: 'STU002', name: 'Ananya Singh', class: '7th', section: 'B', dob: '2013-07-22', parentId: 'PAR002', parentName: 'Vikram Singh', parentPhone: '96XXXXXX33', alternatePhone: '95XXXXXX44', address: '456 Govardhan Rd, Mathura', pickupPoint: 'Govardhan Road', dropPoint: 'GLA Gate', routeId: 'R01', busId: 'B101', status: 'Active' },
    { studentId: 'STU003', name: 'Vihaan Gupta', class: '9th', section: 'C', dob: '2011-11-08', parentId: 'PAR003', parentName: 'Suresh Gupta', parentPhone: '94XXXXXX55', alternatePhone: '93XXXXXX66', address: '789 Civil Lines, Mathura', pickupPoint: 'Civil Lines', dropPoint: 'GLA Gate', routeId: 'R01', busId: 'B101', status: 'Inactive' },
    { studentId: 'STU004', name: 'Diya Patel', class: '8th', section: 'A', dob: '2012-05-30', parentId: 'PAR004', parentName: 'Rajesh Patel', parentPhone: '91XXXXXX77', alternatePhone: '92XXXXXX88', address: '321 Cantonment, Agra', pickupPoint: 'Agra Cantt', dropPoint: 'GLA Gate', routeId: 'R02', busId: 'B102', status: 'Active' },
    { studentId: 'STU005', name: 'Reyansh Verma', class: '6th', section: 'A', dob: '2014-01-17', parentId: 'PAR005', parentName: 'Amit Verma', parentPhone: '99XXXXXX99', alternatePhone: '98XXXXXX00', address: '654 Station Rd, Agra', pickupPoint: 'Agra Station', dropPoint: 'GLA Gate', routeId: 'R02', busId: 'B102', status: 'Active' }
];

export const stopsDB = [
    { stopId: 'STP-R01-1', routeId: 'R01', name: 'GLA University Gate', sequence: 1, address: 'GLA University, Mathura-Delhi Hwy', arrivalTime: '07:05 AM', departureTime: '07:08 AM', status: 'Active' },
    { stopId: 'STP-R01-2', routeId: 'R01', name: 'Krishna Nagar Chowk', sequence: 2, address: 'Krishna Nagar, Mathura', arrivalTime: '07:20 AM', departureTime: '07:22 AM', status: 'Active' },
    { stopId: 'STP-R01-3', routeId: 'R01', name: 'Govardhan Road', sequence: 3, address: 'Govardhan Road, Mathura', arrivalTime: '07:30 AM', departureTime: '07:32 AM', status: 'Active' },
    { stopId: 'STP-R01-4', routeId: 'R01', name: 'Civil Lines', sequence: 4, address: 'Civil Lines, Mathura', arrivalTime: '07:42 AM', departureTime: '07:44 AM', status: 'Active' },
    { stopId: 'STP-R01-5', routeId: 'R01', name: 'Mathura Cantt Station', sequence: 5, address: 'Mathura Railway Station, Mathura', arrivalTime: '07:55 AM', departureTime: '07:58 AM', status: 'Active' },
    { stopId: 'STP-R02-1', routeId: 'R02', name: 'Agra Cantt', sequence: 1, address: 'Agra Cantonment, Agra', arrivalTime: '07:00 AM', departureTime: '07:03 AM', status: 'Active' },
    { stopId: 'STP-R02-2', routeId: 'R02', name: 'Agra Station', sequence: 2, address: 'Agra Railway Station, Agra', arrivalTime: '07:15 AM', departureTime: '07:18 AM', status: 'Active' },
    { stopId: 'STP-R02-3', routeId: 'R02', name: 'Sikandra', sequence: 3, address: 'Sikandra, Agra-Mathura Road', arrivalTime: '07:35 AM', departureTime: '07:37 AM', status: 'Active' },
    { stopId: 'STP-R03-1', routeId: 'R03', name: 'Govardhan Bus Stand', sequence: 1, address: 'Govardhan, Mathura', arrivalTime: '07:10 AM', departureTime: '07:13 AM', status: 'Active' },
    { stopId: 'STP-R03-2', routeId: 'R03', name: 'Vrindavan Gate', sequence: 2, address: 'Vrindavan, Mathura', arrivalTime: '07:25 AM', departureTime: '07:27 AM', status: 'Active' },
];

export const feesDB = [
    { feeId: 'FEE001', studentId: 'STU001', feePerMonth: 3000, totalPaid: 15000, totalDue: 0, lastPaymentDate: '2026-08-01', nextDueDate: '2026-09-01', status: 'Paid' },
    { feeId: 'FEE002', studentId: 'STU002', feePerMonth: 3000, totalPaid: 12000, totalDue: 3000, lastPaymentDate: '2026-07-01', nextDueDate: '2026-08-01', status: 'Pending' },
    { feeId: 'FEE003', studentId: 'STU003', feePerMonth: 3000, totalPaid: 15000, totalDue: 0, lastPaymentDate: '2026-08-01', nextDueDate: '2026-09-01', status: 'Paid' },
    { feeId: 'FEE004', studentId: 'STU004', feePerMonth: 3000, totalPaid: 9000, totalDue: 6000, lastPaymentDate: '2026-06-01', nextDueDate: '2026-07-01', status: 'Overdue' },
    { feeId: 'FEE005', studentId: 'STU005', feePerMonth: 3000, totalPaid: 12000, totalDue: 3000, lastPaymentDate: '2026-07-01', nextDueDate: '2026-08-01', status: 'Pending' },
];

export const driversExtendedDB = [
    { driverId: 'DRV001', alternatePhone: '+91 98000 11111', address: 'Sector 5, Mathura, UP', emergencyContact: '+91 97000 22222', joiningDate: '2023-06-15', dob: '1988-04-12' },
    { driverId: 'DRV002', alternatePhone: '+91 97000 33333', address: 'Civil Lines, Agra, UP', emergencyContact: '+91 96000 44444', joiningDate: '2022-09-01', dob: '1985-11-23' },
    { driverId: 'DRV003', alternatePhone: '+91 96000 55555', address: 'Govardhan, Mathura, UP', emergencyContact: '+91 95000 66666', joiningDate: '2024-01-10', dob: '1992-07-08' },
];

