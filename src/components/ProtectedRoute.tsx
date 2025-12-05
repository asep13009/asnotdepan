import React from 'react';
import { Navigate } from 'react-router';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
    const token: string | null = localStorage.getItem('token');
  // Jika token tidak ada, redirect ke /signin
  if (!token) {
    return <Navigate to="/signin" replace />;;
  }

  // Jika sudah login, render komponen anak (misalnya, Dashboard)
  return <>{children}</>;
};

export default ProtectedRoute;