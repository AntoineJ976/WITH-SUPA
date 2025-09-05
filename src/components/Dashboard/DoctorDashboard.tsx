import React from 'react';
import { Calendar, Users, Clock, TrendingUp, MessageSquare, FileText } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface DoctorDashboardProps {
  onViewChange: (view: string) => void;
}

export const DoctorDashboard: React.FC<DoctorDashboardProps> = ({ onViewChange }) => {
  const { user } = useAuth();
  
  // Static values based on completed consultations only
  const todayStats = {
    totalPatients: 11, // Exact number of patients seen today
    completedConsultations: 11, // Only completed consultations
    upcomingConsultations: 4, // Exact number of scheduled appointments
    revenue: 517 // Revenue from completed consultations only (11 × 47€ average)
  };

  const monthlyStats = {
    prescriptions: 24,
    activePatients: 156,
    averageRating: 4.9
  };

  // Static upcoming consultations - no dynamic updates
  const upcomingConsultations = [
    {
      id: '1',
      patient: 'Jean Dupont',
      time: '14:30',
      type: 'Vidéo',
      reason: 'Consultation de suivi',
      status: 'scheduled'
    },
    {
      id: '2',
      patient: 'Marie Martin',
      time: '15:00',
      type: 'Vidéo',
      reason: 'Première consultation',
      status: 'scheduled'
    }
  ];

  // Static recent messages - no dynamic updates
  const recentMessages = [
    {
      id: '1',
      from: 'Claire Dubois',
      message: 'Pouvez-vous renouveler mon ordonnance ?',
      time: 'À l\'instant',
      read: false
    },
    {
      id: '2',
      from: 'Jean Dupont',
      message: 'Merci pour la consultation, je me sens déjà mieux.',
      time: 'Il y a 2h',
      read: true
    },
    {
      id: '3',
      from: 'Marie Martin',
      message: 'Les résultats de mes analyses sont arrivés.',
      time: 'Il y a 4h',
      read: false
    }
  ];

  // Récupérer le nom du docteur connecté
  const doctorName = user?.role === 'doctor' 
    ? `Dr. ${(user.profile as any)?.lastName || (user.profile as any)?.firstName || 'Leblanc'}`
    : 'Dr. Leblanc';

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-emerald-500 to-sky-500 rounded-xl p-6 text-white">
        <h1 className="text-2xl font-bold mb-2">Bonjour {doctorName} !</h1>
        <p className="text-emerald-100">
          Vous avez {todayStats.upcomingConsultations} consultations programmées aujourd'hui.
        </p>
      </div>

      {/* Statistics - Static Values Only */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-3 bg-sky-100 rounded-lg">
              <Users className="h-6 w-6 text-sky-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Patients aujourd'hui</p>
              <p className="text-2xl font-bold text-gray-900">{todayStats.totalPatients}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-3 bg-emerald-100 rounded-lg">
              <Calendar className="h-6 w-6 text-emerald-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Consultations terminées</p>
              <p className="text-2xl font-bold text-gray-900">{todayStats.completedConsultations}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-3 bg-amber-100 rounded-lg">
              <Clock className="h-6 w-6 text-amber-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">À venir</p>
              <p className="text-2xl font-bold text-gray-900">{todayStats.upcomingConsultations}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-lg">
              <TrendingUp className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Revenus du jour</p>
              <p className="text-2xl font-bold text-gray-900">{todayStats.revenue}€</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Today's Schedule - Static Data */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center">
              <Calendar className="h-5 w-5 mr-2 text-sky-500" />
              Planning d'aujourd'hui
            </h2>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {upcomingConsultations.map((consultation) => (
                <div key={consultation.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div>
                    <h3 className="font-medium text-gray-900">{consultation.patient}</h3>
                    <p className="text-sm text-gray-600">{consultation.reason}</p>
                    <p className="text-sm text-gray-500">
                      {consultation.time} • {consultation.type}
                    </p>
                  </div>
                  <button 
                    onClick={() => onViewChange('video-call')}
                    className="bg-sky-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-sky-600 transition-colors"
                  >
                    Démarrer
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Activity - Static Data */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center">
              <MessageSquare className="h-5 w-5 mr-2 text-emerald-500" />
              Activité récente
            </h2>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {recentMessages.map((message) => (
                <div key={message.id} className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center">
                      <MessageSquare className="h-4 w-4 text-emerald-600" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900">
                      Message de <span className="font-medium">{message.from}</span>
                    </p>
                    <p className="text-sm text-gray-600 truncate">{message.message}</p>
                    <p className="text-xs text-gray-500 mt-1">{message.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats - Static Values */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 text-center">
          <FileText className="h-8 w-8 text-sky-500 mx-auto mb-3" />
          <p className="text-2xl font-bold text-gray-900">{monthlyStats.prescriptions}</p>
          <p className="text-sm text-gray-600">Ordonnances ce mois</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 text-center">
          <Users className="h-8 w-8 text-emerald-500 mx-auto mb-3" />
          <p className="text-2xl font-bold text-gray-900">{monthlyStats.activePatients}</p>
          <p className="text-sm text-gray-600">Patients actifs</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 text-center">
          <TrendingUp className="h-8 w-8 text-green-500 mx-auto mb-3" />
          <p className="text-2xl font-bold text-gray-900">{monthlyStats.averageRating}</p>
          <p className="text-sm text-gray-600">Note moyenne</p>
        </div>
      </div>
    </div>
  );
};