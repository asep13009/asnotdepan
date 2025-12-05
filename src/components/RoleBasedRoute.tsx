import React from 'react';
import { Navigate } from 'react-router';
import { useUser } from '../hooks/useUser';
import { UserRole } from '../context/UserContext';

interface RoleBasedRouteProps {
  children: React.ReactNode;
  allowedRoles: UserRole[];
}

const RoleBasedRoute: React.FC<RoleBasedRouteProps> = ({ children, allowedRoles }) => {
  const { user, isLoading } = useUser();

  if (isLoading) {
    return <div>Loading...</div>; // Or a proper loading component
  }

  if (!user) {
    return <Navigate to="/signin" replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />; // Redirect to home or an unauthorized page
  }

  return <>{children}</>;
};

export default RoleBasedRoute;
