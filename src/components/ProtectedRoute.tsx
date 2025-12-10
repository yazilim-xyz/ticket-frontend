import React from 'react';
import { Navigate } from 'react-router-dom';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'admin' | 'user';
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requiredRole }) => {
  const user = localStorage.getItem('user');
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole) {
    const userData = JSON.parse(user);
    
    if (userData.role !== requiredRole) {
      if (userData.role === 'admin') {
        return <Navigate to="/admin/dashboard" replace />;
      } else {
        return <Navigate to="/dashboard" replace />;
      }
    }
  }

  return <>{children}</>;
};

export default ProtectedRoute;