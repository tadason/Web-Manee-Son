import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThreeBackground } from './components/ThreeBackground';
import { InvisibleNav } from './components/InvisibleNav';
import { Landing } from './pages/Landing';
import { EmployeeDashboard } from './pages/EmployeeDashboard';
import { AdminPortal } from './pages/AdminPortal';
import { UserRole } from './types';

// Protected Route Wrapper
const ProtectedRoute: React.FC<{ 
  children: React.ReactNode; 
  allowedRoles?: UserRole[] 
}> = ({ children, allowedRoles }) => {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated || !user) {
    return <Navigate to="/" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // If Admin tries to go to Emp dashboard, we might allow it or redirect.
    // If Emp tries to go to Admin, redirect to Dashboard.
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

const AppContent = () => {
  return (
    <HashRouter>
      <div className="relative min-h-screen text-white font-sans antialiased overflow-x-hidden selection:bg-cyan-500/30">
        <ThreeBackground />
        <InvisibleNav />
        
        <Routes>
          <Route path="/" element={<Landing />} />
          
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
    </HashRouter>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
