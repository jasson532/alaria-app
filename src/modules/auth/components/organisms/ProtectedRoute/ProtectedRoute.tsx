import { Navigate } from 'react-router-dom';
import { useAppSelector } from 'modules/shared/hooks/useAppDispatch';
import { ROUTES } from 'modules/shared/constants/routes';
import type { UserRole } from 'modules/auth/types';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: UserRole;
}

const ProtectedRoute = ({ children, requiredRole }: ProtectedRouteProps) => {
  const { isAuthenticated, isLoading, role } = useAppSelector((state) => state.auth);

  if (isLoading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
        <p>Cargando...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to={ROUTES.LOGIN} replace />;
  }

  if (requiredRole && role !== requiredRole) {
    return <Navigate to={ROUTES.PROPERTIES} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
