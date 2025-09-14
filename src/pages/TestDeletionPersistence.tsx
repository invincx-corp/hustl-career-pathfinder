import React from 'react';
import { DeletionPersistenceTestPanel } from '@/components/testing/DeletionPersistenceTestPanel';

const TestDeletionPersistence: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Deletion Persistence Test Suite
          </h1>
          <p className="text-gray-600">
            Test the fix for deleted content reappearing after page refresh
          </p>
        </div>
        
        <DeletionPersistenceTestPanel />
      </div>
    </div>
  );
};

export default TestDeletionPersistence;
