import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useParams } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import { ProtectedRoute, PublicRoute, RoleBasedRedirect } from './components/AuthMiddleware';

// Pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import SetPasswordPage from './pages/SetPasswordPage';
import AboutProgramPage from './pages/AboutProgramPage';
import DashboardPage from './pages/DashboardPage';
import TermsAndConditionsPage from './pages/TermsAndConditionsPage';
import PrivacyPolicyPage from './pages/PrivacyPolicyPage';
import NotFoundPage from './pages/NotFoundPage';
import ClientDashboardPage from './pages/client/ClientDashboardPage';
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import AdminUsersPage from './pages/admin/AdminUsersPage';
import UserDetailPage from './pages/admin/UserDetailPage';
import TrainerDashboardPage from './pages/trainer/TrainerDashboardPage';

// Admin Pages
import AdminClientDetailPage from './pages/admin/AdminClientDetailPage';
import GroupDetailPage from './pages/admin/GroupDetailPage';
import AddMeetingPage from './pages/admin/AddMeetingPage';
import EditGroupPage from './pages/admin/EditGroupPage';
import EditMeetingPage from './pages/admin/EditMeetingPage';
import ReportsPage from './pages/admin/ReportsPage';
import AdminGroupsPage from './pages/admin/AdminGroupsPage';
import AdminClientsPage from './pages/admin/AdminClientsPage';
import MaterialsLibraryPage from './pages/admin/MaterialsLibraryPage';

// Componenta pentru redirecționare de la /clients/:id la /admin/clients/:id
const ClientIdRedirect = () => {
  const { id } = useParams();
  const redirectPath = `/admin/clients/${id}`;
  
  return <Navigate to={redirectPath} replace />;
};

// Componenta principala
function App() {
  const { setDemoMode } = useAuth();
  
  // Activam modul demo pentru dezvoltare
  useEffect(() => {
    // In implementarea reala, eliminati acest cod
    // sau comentati-l
    // setDemoMode(true, 'client');
  }, [setDemoMode]);

  return (
    <Router>
      <Routes>
        {/* Rute publice */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
        <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />
        <Route path="/set-password" element={<PublicRoute><SetPasswordPage /></PublicRoute>} />
        <Route path="/despre-program" element={<AboutProgramPage />} />
        <Route path="/termeni-conditii" element={<TermsAndConditionsPage />} />
        <Route path="/politica-confidentialitate" element={<PrivacyPolicyPage />} />
        
        {/* Redirecționare după autentificare în funcție de rol */}
        <Route 
          path="/redirect" 
          element={<RoleBasedRedirect />} 
        />
        
        {/* Rute protejate pentru parteneri/administratori */}
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute allowedRoles={['admin', 'partner', 'super-admin']}>
              <AdminDashboardPage />
            </ProtectedRoute>
          }
        />

        {/* Rută de redirecționare pentru compatibilitate cu versiunea anterioară */}
        <Route
          path="/dashboard"
          element={<Navigate to="/admin/dashboard" replace />}
        />

        {/* Ruta pentru redirectionare /clients la /admin/clients */}
        <Route
          path="/clients"
          element={
            <ProtectedRoute allowedRoles={['admin', 'partner', 'super-admin']}>
              <Navigate to="/admin/clients" replace />
            </ProtectedRoute>
          }
        />

        {/* Pagina de clients */}
        <Route
          path="/admin/clients"
          element={
            <ProtectedRoute allowedRoles={['admin', 'partner', 'super-admin']}>
              <AdminClientsPage />
            </ProtectedRoute>
          }
        />

        {/* Pagina de users - doar pentru admin */}
        <Route
          path="/admin/users"
          element={
            <ProtectedRoute allowedRoles={['admin', 'super-admin']}>
              <AdminUsersPage />
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/admin/users/:id"
          element={
            <ProtectedRoute allowedRoles={['admin', 'super-admin']}>
              <UserDetailPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/groups"
          element={
            <ProtectedRoute allowedRoles={['admin', 'partner', 'super-admin']}>
              <AdminGroupsPage />
            </ProtectedRoute>
          }
        />

        <Route path="/clients/:id" element={<ClientIdRedirect />} />
        
        <Route
          path="/admin/groups/:groupId"
          element={
            <ProtectedRoute allowedRoles={['admin', 'partner', 'super-admin']}>
              <GroupDetailPage />
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/admin/groups/:groupId/edit"
          element={
            <ProtectedRoute allowedRoles={['admin', 'partner', 'super-admin']}>
              <EditGroupPage />
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/admin/groups/:groupId/meetings/add"
          element={
            <ProtectedRoute allowedRoles={['admin', 'partner', 'super-admin']}>
              <AddMeetingPage />
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/admin/groups/:groupId/meetings/:meetingId/edit"
          element={
            <ProtectedRoute allowedRoles={['admin', 'partner', 'super-admin']}>
              <EditMeetingPage />
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/admin/clients/:id"
          element={
            <ProtectedRoute allowedRoles={['admin', 'partner', 'super-admin']}>
              <AdminClientDetailPage />
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/admin/reports"
          element={
            <ProtectedRoute allowedRoles={['admin', 'partner', 'super-admin']}>
              <ReportsPage />
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/admin/materials"
          element={
            <ProtectedRoute allowedRoles={['admin', 'partner', 'super-admin']}>
              <MaterialsLibraryPage />
            </ProtectedRoute>
          }
        />
        
        {/* Rute protejate pentru clienți */}
        <Route
          path="/client/dashboard"
          element={
            <ProtectedRoute allowedRoles={['client', 'user']}>
              <ClientDashboardPage />
            </ProtectedRoute>
          }
        />
        
        {/* Rute protejate pentru traineri */}
        <Route
          path="/trainer/dashboard"
          element={
            <ProtectedRoute allowedRoles={['trainer']}>
              <TrainerDashboardPage />
            </ProtectedRoute>
          }
        />
        
        {/* Rută implicită care redirecționează către pagina corespunzătoare rolului */}
        <Route path="*" element={<RoleBasedRedirect />} />
      </Routes>
    </Router>
  );
}

export default App;