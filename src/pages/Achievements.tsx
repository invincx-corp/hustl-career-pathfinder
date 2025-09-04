import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import AchievementSystem from '@/components/gamification/AchievementSystem';

const Achievements: React.FC = () => {
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Please log in</h2>
          <p className="text-gray-600">You need to be logged in to view your achievements.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Achievements</h1>
          <p className="text-gray-600 mt-1">
            Track your progress, unlock achievements, and see how you rank in the community
          </p>
        </div>
      </div>

      {/* Achievement System Component */}
      <AchievementSystem userId={user.id} />
    </div>
  );
};

export default Achievements;
