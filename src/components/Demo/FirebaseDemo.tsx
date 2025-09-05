import React from 'react';
import { FirebaseTest } from '../Firebase/FirebaseTest';
import { Database } from 'lucide-react';

export const FirebaseDemo: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center space-x-3">
          <Database className="h-8 w-8 text-emerald-500" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Demo Supabase</h1>
            <p className="text-gray-600">
              Test Supabase authentication and database connection
            </p>
          </div>
        </div>
      </div>

      {/* Supabase Test Component */}
      <FirebaseTest />
    </div>
  );
};