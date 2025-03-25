import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useParams } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';

// Pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import SetPasswordPage from './pages/SetPasswordPage';
import AboutProgramPage from './pages/AboutProgramPage';
import DashboardPage from './pages/DashboardPage';
import NotFoundPage from './pages/NotFoundPage';
import ClientDashboardPage from './pages/client/ClientDashboardPage';
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
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

// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { isAuthenticated, loading, currentUser } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  // Verifică dacă utilizatorul este autentificat
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
  
  // Verifică rolul utilizatorului (dacă s-au specificat roluri permise)
  if (allowedRoles.length > 0) {
    const userRole = currentUser?.role;
    if (!allowedRoles.includes(userRole)) {
      // Redirecționare în funcție de rol
      if (userRole === 'client' || userRole === 'user') {
        return <Navigate to="/client/dashboard" />;
      } else if (userRole === 'trainer') {
        return <Navigate to="/trainer/dashboard" />;
      } else {
        return <Navigate to="/admin/dashboard" />;
      }
    }
  }
  
  return children;
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
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/set-password" element={<SetPasswordPage />} />
        <Route path="/despre-program" element={<AboutProgramPage />} />
        
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

// Componenta pentru redirecționare de la /clients/:id la /admin/clients/:id
const ClientIdRedirect = () => {
  const { id } = useParams();
  const redirectPath = `/admin/clients/${id}`;
  
  return <Navigate to={redirectPath} replace />;
};

// Componenta pentru redirecționare bazată pe rol
const RoleBasedRedirect = () => {
  const { currentUser, isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
  
  // Redirecționare în funcție de rol
  const userRole = currentUser?.role;
  if (userRole === 'client' || userRole === 'user') {
    return <Navigate to="/client/dashboard" />;
  } else if (userRole === 'trainer') {
    return <Navigate to="/trainer/dashboard" />;
  } else {
    return <Navigate to="/admin/dashboard" />;
  }
};

export default App;