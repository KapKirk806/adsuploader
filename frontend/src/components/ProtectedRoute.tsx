import { Navigate } from 'react-router-dom';
import { useStore } from '../store/useStore';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const user = useStore((state) => state.user);
  const token = localStorage.getItem('auth_token');

  if (!token && !user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}
