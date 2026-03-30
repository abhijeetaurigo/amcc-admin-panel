import type { ReactNode } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import type { AdminRole } from '@/types/auth';
import { isAuthSessionExpired } from './auth-storage';
import { useAuthStore } from '@/store/authStore';

interface ProtectedRouteProps {
  children?: ReactNode;
  redirectTo?: string;
  requiredRole?: AdminRole | AdminRole[];
}

interface GuestRouteProps {
  children?: ReactNode;
  redirectTo?: string;
}

export function ProtectedRoute({
  children,
  redirectTo = '/login',
  requiredRole,
}: ProtectedRouteProps) {
  const location = useLocation();
  const session = useAuthStore((state) => state.session);

  if (!session || isAuthSessionExpired(session)) {
    return <Navigate to={redirectTo} replace state={{ from: location.pathname }} />;
  }

  if (requiredRole) {
    const roles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
    if (!roles.includes(session.admin.role)) {
      return <Navigate to={redirectTo} replace state={{ from: location.pathname }} />;
    }
  }

  return children ?? <Outlet />;
}

export function GuestRoute({ children, redirectTo = '/' }: GuestRouteProps) {
  const session = useAuthStore((state) => state.session);

  if (session && !isAuthSessionExpired(session)) {
    return <Navigate to={redirectTo} replace />;
  }

  return children ?? <Outlet />;
}

export function hasSessionAccess(requiredRole: AdminRole | AdminRole[] | undefined): boolean {
  const session = useAuthStore.getState().session;
  if (!session || isAuthSessionExpired(session)) {
    return false;
  }

  if (!requiredRole) {
    return true;
  }

  const roles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
  return roles.includes(session.admin.role);
}
