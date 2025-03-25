import React, { useEffect } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

// Middleware pentru rute protejate - utilizatori neautentificați nu pot accesa
export const ProtectedRoute = ({ children, allowedRoles = [] }) => {
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
    return <Navigate to="/login" replace />;
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

// Middleware pentru rute publice - utilizatori autentificați sunt redirecționați la dashboard
export const PublicRoute = ({ children }) => {
  const { isAuthenticated, currentUser, loading } = useAuth();
  const navigate = useNavigate();
  
  useEffect(() => {
    if (!loading && isAuthenticated && currentUser) {
      // Redirecționare în funcție de rol
      if (currentUser.role === 'client' || currentUser.role === 'user') {
        navigate('/client/dashboard', { replace: true });
      } else if (currentUser.role === 'trainer') {
        navigate('/trainer/dashboard', { replace: true });
      } else {
        navigate('/admin/dashboard', { replace: true });
      }
    }
  }, [isAuthenticated, currentUser, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  if (isAuthenticated) {
    return null; // Va fi tratat de useEffect pentru redirecționare
  }
  
  return children;
};

// Componenta pentru redirecționare bazată pe rol
export const RoleBasedRedirect = () => {
  const { currentUser, isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
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
