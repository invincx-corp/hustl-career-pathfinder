import { useAuth } from '@/hooks/useAuth';
import { Navigate } from 'react-router-dom';
import LivingResume from '@/components/identity/LivingResume';

const LivingResumePage = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <LivingResume />
    </div>
  );
};

export default LivingResumePage;
