import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Landing } from './pages/Landing';
import { EmployeeDashboard } from './pages/EmployeeDashboard';
import { AdminPortal } from './pages/AdminPortal';
import AppTadaPage from './pages/apptada';
import { UserRole } from './types';

// Protected Route Wrapper
const ProtectedRoute: React.FC<{ 
  children: React.ReactNode; 
  allowedRoles?: UserRole[] 
}> = ({ children, allowedRoles }) => {
  const { user, isAuthenticated, authLoading } = useAuth();
  const location = useLocation();

  if (authLoading) {
    return null;
  }

  if (!isAuthenticated || !user) {
    if (typeof window !== 'undefined') {
      try {
        sessionStorage.setItem('postLoginRedirect', location.pathname);
      } catch (error) {
        console.warn('Unable to store post-login redirect.', error);
      }
    }
    return <Navigate to="/" replace state={{ redirectTo: location.pathname }} />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // If Admin tries to go to Emp dashboard, we might allow it or redirect.
    // If Emp tries to go to Admin, redirect to Dashboard.
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

const AppShell = () => {
  const location = useLocation();

  return (
      <div className="relative z-10 min-h-screen text-white font-sans antialiased overflow-x-hidden selection:bg-cyan-500/30">
      
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route
          path="/apptada.tsx"
          element={
            <ProtectedRoute>
              <AppTadaPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/apptada"
          element={
            <ProtectedRoute>
              <AppTadaPage />
            </ProtectedRoute>
          }
        />
        
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute allowedRoles={[UserRole.EMPLOYEE, UserRole.ADMIN]}>
              <EmployeeDashboard />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/admin" 
          element={
            <ProtectedRoute allowedRoles={[UserRole.ADMIN]}>
              <AdminPortal />
            </ProtectedRoute>
          } 
        />
        
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
};

const AppContent = () => {
  return (
    <BrowserRouter>
      <AppShell />
    </BrowserRouter>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
