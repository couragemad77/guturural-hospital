import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import LandingPage from './components/LandingPage';
import Sidebar from './components/Layout/Sidebar';
import TopBar from './components/Layout/TopBar';
import PatientDashboard from './components/dashboard/PatientDashboard';
import StaffDashboard from './components/dashboard/StaffDashboard';
import AdminDashboard from './components/dashboard/AdminDashboard';
import SettingsPage from './components/settings/SettingsPage';
import AppointmentBooking from './components/patient/AppointmentBooking';
import QueueStatus from './components/patient/QueueStatus';
import MedicalRecords from './components/patient/MedicalRecords';
import UserManagement from './components/admin/UserManagement';
import Analytics from './components/admin/Analytics';
import PatientCheckIn from './components/staff/PatientCheckIn';
import MyPatients from './components/staff/MyPatients';
import Consultations from './components/staff/Consultations';
import QueueManagement from './components/staff/QueueManagement';

const AppContent: React.FC = () => {
  const { currentUser, userRole, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-900 to-teal-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500"></div>
      </div>
    );
  }

  if (!currentUser) {
    return <LandingPage />;
  }

  const isPatient = userRole?.role === 'patient';
  const isStaff = userRole?.role === 'doctor' || userRole?.role === 'nurse' || userRole?.role === 'receptionist';
  const isAdmin = userRole?.role === 'admin';

  const getDashboard = () => {
    if (isPatient) return <PatientDashboard />;
    if (isAdmin) return <AdminDashboard />;
    if (isStaff) return <StaffDashboard />;
    return <div>Dashboard not available for your role</div>;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-900 to-teal-900">
      {isPatient ? (
        // Patient Layout - Top Navigation
        <div>
          <TopBar />
          <main className="p-6">
            <Routes>
              <Route path="/dashboard" element={getDashboard()} />
              <Route path="/appointments" element={<AppointmentBooking />} />
              <Route path="/queue" element={<QueueStatus />} />
              <Route path="/records" element={<MedicalRecords />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="/" element={<Navigate to="/dashboard" />} />
              <Route path="*" element={<Navigate to="/dashboard" />} />
            </Routes>
          </main>
        </div>
      ) : (
        // Staff/Admin Layout - Sidebar Navigation
        <div className="flex">
          <Sidebar />
          <div className="flex-1 ml-64">
            <TopBar showMenu={false} />
            <main className="p-6">
              <Routes>
                <Route path="/dashboard" element={getDashboard()} />
                <Route path="/settings" element={<SettingsPage />} />
                
                {/* Admin Routes */}
                {isAdmin && (
                  <>
                    <Route path="/users" element={<UserManagement />} />
                    <Route path="/reports" element={<Analytics />} />
                  </>
                )}
                
                {/* Staff Routes */}
                {(isStaff || isAdmin) && (
                  <>
                    <Route path="/queue" element={<QueueManagement />} />
                    <Route path="/appointments" element={<div className="text-white">All Appointments (Coming Soon)</div>} />
                  </>
                )}
                
                {/* Receptionist Routes */}
                {(userRole?.role === 'receptionist' || isAdmin) && (
                  <Route path="/checkin" element={<PatientCheckIn />} />
                )}
                
                {/* Doctor/Nurse Routes */}
                {((userRole?.role === 'doctor' || userRole?.role === 'nurse') || isAdmin) && (
                  <>
                    <Route path="/patients" element={<MyPatients />} />
                    <Route path="/consultations" element={<Consultations />} />
                  </>
                )}
                
                <Route path="/" element={<Navigate to="/dashboard" />} />
                <Route path="*" element={<Navigate to="/dashboard" />} />
              </Routes>
            </main>
          </div>
        </div>
      )}
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}

export default App;