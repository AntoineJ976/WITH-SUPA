import React from 'react';
import { Calendar, Clock, MessageSquare, FileText, AlertCircle, Plus, CreditCard } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface PatientDashboardProps {
  onViewChange?: (view: string) => void;
}

export const PatientDashboard: React.FC<PatientDashboardProps> = ({ onViewChange }) => {
  const { user } = useAuth();
  
  // Simuler le compteur de messages non lus (en production, ceci viendrait d'un contexte global)
  const [unreadMessagesCount, setUnreadMessagesCount] = React.useState(() => {
    // Récupérer le nombre de messages non lus depuis le localStorage ou un contexte
    const stored = localStorage.getItem('unreadMessagesCount');
    return stored ? parseInt(stored, 10) : 1;
  });

  // Écouter les changements du localStorage pour mettre à jour le compteur
  React.useEffect(() => {
    const handleStorageChange = () => {
      const stored = localStorage.getItem('unreadMessagesCount');
      setUnreadMessagesCount(stored ? parseInt(stored, 10) : 0);
    };

    // Écouter les changements du localStorage
    window.addEventListener('storage', handleStorageChange);
    
    // Vérifier périodiquement les changements (pour les changements dans la même fenêtre)
    const interval = setInterval(handleStorageChange, 1000);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, []);

  const upcomingConsultations = [
    {
      id: '1',
      doctor: 'Dr. Marie Leblanc',
      specialty: 'Médecine générale',
      date: '2025-01-15',
      time: '14:30',
      type: 'Vidéo'
    }
  ];

  const totalUnreadMessages = unreadMessagesCount;
  
  // Récupérer le prénom de l'utilisateur connecté
  const userFirstName = user?.role === 'patient' 
    ? (user.profile as any)?.firstName 
    : user?.role === 'doctor' 
    ? (user.profile as any)?.firstName
    : 'Utilisateur';

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-sky-500 to-emerald-500 rounded-xl p-6 text-white">
        <h1 className="text-2xl font-bold mb-2">Bonjour {userFirstName} !</h1>
        <p className="text-sky-100">
          Gérez vos consultations et suivez votre santé en toute sécurité.
        </p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <button 
          onClick={() => onViewChange && onViewChange('consultations')}
          className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow text-left group"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="p-3 bg-sky-100 rounded-lg group-hover:bg-sky-200 transition-colors">
              <Calendar className="h-6 w-6 text-sky-600" />
            </div>
            <Plus className="h-5 w-5 text-gray-400 group-hover:text-gray-600" />
          </div>
          <h3 className="font-semibold text-gray-900 mb-1">Réserver consultation</h3>
          <p className="text-sm text-gray-600">Réserver une consultation</p>
        </button>

        <button 
          onClick={() => onViewChange && onViewChange('messages')}
          className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow text-left group"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="p-3 bg-emerald-100 rounded-lg group-hover:bg-emerald-200 transition-colors">
              <MessageSquare className="h-6 w-6 text-emerald-600" />
            </div>
            {totalUnreadMessages > 0 && (
              <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                {totalUnreadMessages}
              </span>
            )}
          </div>
          <h3 className="font-semibold text-gray-900 mb-1">Messages</h3>
          <p className="text-sm text-gray-600">
            {totalUnreadMessages > 0 
              ? `${totalUnreadMessages} nouveau${totalUnreadMessages > 1 ? 'x' : ''} message${totalUnreadMessages > 1 ? 's' : ''}`
              : 'Aucun nouveau message'
            }
          </p>
        </button>

        <button 
          onClick={() => onViewChange && onViewChange('medical-records')}
          className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow text-left group"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="p-3 bg-amber-100 rounded-lg group-hover:bg-amber-200 transition-colors">
              <FileText className="h-6 w-6 text-amber-600" />
            </div>
          </div>
          <h3 className="font-semibold text-gray-900 mb-1">Dossier médical</h3>
          <p className="text-sm text-gray-600">Consulter votre historique</p>
        </button>

        <button 
          onClick={() => onViewChange && onViewChange('prescriptions')}
          className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow text-left group"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="p-3 bg-purple-100 rounded-lg group-hover:bg-purple-200 transition-colors">
              <FileText className="h-6 w-6 text-purple-600" />
            </div>
          </div>
          <h3 className="font-semibold text-gray-900 mb-1">Mes ordonnances</h3>
          <p className="text-sm text-gray-600">Gérer vos prescriptions</p>
        </button>

        <button 
          onClick={() => onViewChange && onViewChange('payments')}
          className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow text-left group"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="p-3 bg-green-100 rounded-lg group-hover:bg-green-200 transition-colors">
              <CreditCard className="h-6 w-6 text-green-600" />
            </div>
          </div>
          <h3 className="font-semibold text-gray-900 mb-1">Paiements</h3>
          <p className="text-sm text-gray-600">Gérer vos cartes bancaires</p>
        </button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Upcoming Consultations */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center">
              <Clock className="h-5 w-5 mr-2 text-sky-500" />
              Prochaines consultations
            </h2>
          </div>
          <div className="p-6">
            {upcomingConsultations.length === 0 ? (
              <p className="text-gray-500 text-center py-4">
                Aucune consultation programmée
              </p>
            ) : (
              <div className="space-y-4">
                {upcomingConsultations.map((consultation) => (
                  <div key={consultation.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-gray-50 rounded-lg gap-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-gray-900">{consultation.doctor}</h3>
                      <p className="text-sm text-gray-600">{consultation.specialty}</p>
                      <p className="text-sm text-gray-500">
                        {consultation.date} à {consultation.time} • {consultation.type}
                      </p>
                    </div>
                    <button 
                      onClick={() => onViewChange && onViewChange('video-call')}
                      className="bg-sky-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-sky-600 transition-colors flex-shrink-0 w-full sm:w-auto text-center"
                    >
                      Rejoindre
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Recent Messages */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center">
              <MessageSquare className="h-5 w-5 mr-2 text-emerald-500" />
              Messages récents
            </h2>
          </div>
          <div className="p-6">
            {totalUnreadMessages === 0 ? (
              <p className="text-gray-500 text-center py-4">
                Aucun nouveau message
              </p>
            ) : (
              <div className="text-center py-4">
                <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <MessageSquare className="h-6 w-6 text-emerald-600" />
                </div>
                <p className="text-sm font-medium text-gray-900 mb-1">
                  {totalUnreadMessages} nouveau{totalUnreadMessages > 1 ? 'x' : ''} message{totalUnreadMessages > 1 ? 's' : ''}
                </p>
                <button 
                  onClick={() => onViewChange && onViewChange('messages')}
                  className="text-sm text-emerald-600 hover:text-emerald-700 font-medium"
                >
                  Voir les messages →
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Health Alerts */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-6">
        <div className="flex items-start">
          <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5 mr-3 flex-shrink-0" />
          <div>
            <h3 className="text-sm font-medium text-amber-800">
              Rappel de santé
            </h3>
            <p className="mt-1 text-sm text-amber-700">
              N'oubliez pas de prendre vos médicaments prescrits par Dr. Leblanc.
              Prochaine prise dans 2 heures.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};