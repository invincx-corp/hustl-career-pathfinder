import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Navigate, useLocation } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireOnboarding?: boolean;
}

export default function ProtectedRoute({ children, requireOnboarding = false }: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const location = useLocation();

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <Card className="w-96">
          <CardContent className="flex flex-col items-center justify-center p-8">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600 mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Loading...</h2>
            <p className="text-gray-600 text-center">
              Please wait while we verify your authentication.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Define app routes that should be accessible after login
  const appRoutes = [
    '/dashboard', '/learning-paths', '/projects', '/project-playground', '/settings', '/skill-assessment', 
    '/mentor-matchmaking', '/curiosity-compass', '/skill-stacker', '/adaptive-capsules',
    '/ai-roadmap', '/living-resume', '/community', '/self-graph', '/project-showcase', '/career-coach',
    '/career-therapist', '/job-matching', '/domain-supply-demand', '/career-explorer',
    '/calendar', '/achievements', '/notifications', '/help'
  ];

  // Allow access to all app routes if user is authenticated
  if (appRoutes.includes(location.pathname)) {
    console.log('ProtectedRoute: Allowing access to app route:', location.pathname);
    return <>{children}</>;
  }

  // For onboarding page, allow access
  if (location.pathname === '/onboarding') {
    return <>{children}</>;
  }

  // For any other route, redirect to dashboard
  console.log('ProtectedRoute: Redirecting unknown route to dashboard:', location.pathname);
  return <Navigate to="/dashboard" replace />;

  return <>{children}</>;
}

