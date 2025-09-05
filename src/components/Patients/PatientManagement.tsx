import React, { useState } from 'react';
import { Users, Search, Filter, Plus, Eye, MessageSquare, Calendar, FileText, ArrowRight } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { NewPatientModal } from './NewPatientModal';
import { PatientListView } from './PatientListView';

export const PatientManagement: React.FC = () => {
  const [viewMode, setViewMode] = useState<'overview' | 'detailed'>('overview');

  return (
    <>
      {viewMode === 'overview' ? (
        <div className="space-y-6">
          {/* Header */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Users className="h-8 w-8 text-sky-500" />
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Gestion des patients</h1>
                  <p className="text-gray-600">
                    Consultez et gérez vos patients en toute sécurité.
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <button 
                  onClick={() => setViewMode('detailed')}
                  className="flex items-center space-x-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <span>Vue détaillée</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
          
          {/* Quick Overview - Keep existing simple view */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Aperçu rapide des patients
            </h2>
            <p className="text-gray-600">
              Cliquez sur "Vue détaillée" pour accéder à la gestion complète des patients avec consultations et traitements.
            </p>
          </div>
        </div>
      ) : (
        <PatientListView />
      )}
    </>
  );
};