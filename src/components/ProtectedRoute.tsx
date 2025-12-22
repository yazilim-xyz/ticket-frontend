import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: string; // "admin" veya "user"
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requiredRole }) => {
  const { isAuthenticated, loading, user } = useAuth();
  const location = useLocation();
  
  // Auth yüklenirken loading göster
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-teal-600 animate-spin mx-auto" />
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Giriş yapmamışsa login'e yönlendir
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Role kontrolü (eğer requiredRole belirtilmişse)
  if (requiredRole && user) {
    const userRole = user.role?.toLowerCase();
    const required = requiredRole.toLowerCase();
    
    if (userRole !== required) {
      // Yetkisiz erişim - 403 sayfasına yönlendir
      return <Navigate to="/403" replace />;
    }
  }

  return <>{children}</>;
};

export default ProtectedRoute;