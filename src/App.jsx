import { Navigate, Route, Routes } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import ParentDashboard from './pages/ParentDashboard';
import ParentSchedule from './pages/ParentSchedule';
import ParentPlaceholder from './pages/ParentPlaceholder';
import DriverDashboard from './pages/DriverDashboard';
import AdminDashboard from './pages/AdminDashboard';
import AdminPlaceholder from './pages/AdminPlaceholder';
import BusDriverAllocation from './pages/BusDriverAllocation';
import AdminDrivers from './pages/AdminDrivers';
import AdminParents from './pages/AdminParents';
import AdminParentPortal from './pages/AdminParentPortal';
import AdminSchedule from './pages/AdminSchedule';
import AdminSOS from './pages/AdminSOS';
import AdminRecords from './pages/AdminRecords';
import NotFound from './pages/NotFound';
import RequireRole from './components/RequireRole';

export default function App() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<Login />} />

      {/* Parent Portal */}
      <Route path="/parent" element={<RequireRole role="parent"><ParentDashboard /></RequireRole>} />
      <Route path="/parent/track" element={<RequireRole role="parent"><ParentPlaceholder title="Track Live Bus" type="map" showMap /></RequireRole>} />
      <Route path="/parent/schedule" element={<RequireRole role="parent"><ParentSchedule /></RequireRole>} />
      <Route path="/parent/notifications" element={<RequireRole role="parent"><ParentPlaceholder title="Notifications" type="notifications" /></RequireRole>} />
      <Route path="/parent/history" element={<RequireRole role="parent"><ParentPlaceholder title="Trip History" type="history" /></RequireRole>} />
      <Route path="/parent/profile" element={<RequireRole role="parent"><ParentPlaceholder title="Parent Profile" type="profile" /></RequireRole>} />

      {/* Driver Portal */}
      <Route path="/driver" element={<RequireRole role="driver"><DriverDashboard /></RequireRole>} />

      {/* School Admin Portal */}
      <Route path="/admin" element={<RequireRole role="admin"><AdminDashboard /></RequireRole>} />
      <Route path="/admin/live-map" element={<RequireRole role="admin"><AdminPlaceholder titleKey="navLiveMap" showMap /></RequireRole>} />
      <Route path="/admin/buses" element={<RequireRole role="admin"><BusDriverAllocation /></RequireRole>} />
      <Route path="/admin/schedule" element={<RequireRole role="admin"><AdminSchedule /></RequireRole>} />
      <Route path="/admin/drivers" element={<RequireRole role="admin"><AdminDrivers /></RequireRole>} />
      <Route path="/admin/reports" element={<RequireRole role="admin"><AdminParents /></RequireRole>} />
      <Route path="/admin/sos" element={<RequireRole role="admin"><AdminSOS /></RequireRole>} />
      <Route path="/admin/sos-history" element={<RequireRole role="admin"><AdminSOS defaultTab="history" /></RequireRole>} />
      <Route path="/admin/parent" element={<RequireRole role="admin"><AdminParentPortal /></RequireRole>} />
      <Route path="/admin/settings" element={<RequireRole role="admin"><AdminPlaceholder titleKey="navSettings" /></RequireRole>} />

      {/* Records Routes */}
      <Route path="/admin/records" element={<RequireRole role="admin"><AdminRecords section="overview" /></RequireRole>} />
      <Route path="/admin/records/drivers" element={<RequireRole role="admin"><AdminRecords section="drivers" /></RequireRole>} />
      <Route path="/admin/records/routes" element={<RequireRole role="admin"><AdminRecords section="routes" /></RequireRole>} />
      <Route path="/admin/records/stops" element={<RequireRole role="admin"><AdminRecords section="stops" /></RequireRole>} />
      <Route path="/admin/records/students" element={<RequireRole role="admin"><AdminRecords section="students" /></RequireRole>} />

      {/* 404 */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
