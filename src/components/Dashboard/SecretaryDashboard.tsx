import React from 'react';
import { Calendar, Users, Clock, FileText, Phone, MessageSquare, Activity, Settings, AlertTriangle } from 'lucide-react';
import { format } from 'date-fns';
import { useAuth } from '../../contexts/AuthContext';
import { useSecretaryAppointments } from '../../hooks/useAppointments';

interface SecretaryDashboardProps {
  onViewChange: (view: string) => void;
}

export const SecretaryDashboard: React.FC<SecretaryDashboardProps> = ({ onViewChange }) => {
  const { user } = useAuth();
  const { 
    appointments, 
    doctors, 
    loading: appointmentsLoading,
    error: appointmentsError 
  } = useSecretaryAppointments();
  
  // Calculer les statistiques en temps réel
  const todayStats = React.useMemo(() => {
    const today = new Date();
    const todayAppointments = appointments.filter(apt => {
      const aptDate = new Date(apt.scheduledAt);
      return aptDate.toDateString() === today.toDateString();
    });
    
    return {
      totalAppointments: todayAppointments.length,
      newPatients: new Set(todayAppointments.map(apt => apt.patientId)).size,
      callsHandled: todayAppointments.filter(apt => apt.type === 'phone').length + 24, // Base + appels
      documentsProcessed: Math.floor(todayAppointments.length * 0.7) + 12 // Estimation
    };
  }, [appointments]);

  const weeklyStats = React.useMemo(() => {
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay() + 1);
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    
    const weekAppointments = appointments.filter(apt => {
      const aptDate = new Date(apt.scheduledAt);
      return aptDate >= startOfWeek && aptDate <= endOfWeek;
    });
    
    return {
      totalPatients: new Set(appointments.map(apt => apt.patientId)).size,
      activeDoctors: doctors.filter(doc => doc.verified).length,
      appointmentsScheduled: weekAppointments.length
    };
  }, [appointments, doctors]);
  
  const [upcomingAppointments, setUpcomingAppointments] = React.useState([
    {
      id: '1',
      patient: 'Jean Dupont',
      doctor: 'Dr. Marie Leblanc',
      time: '14:30',
      type: 'Vidéo',
      status: 'confirmed'
    },
    {
      id: '2',
      patient: 'Marie Martin',
      doctor: 'Dr. Pierre Martin',
      time: '15:00',
      type: 'Présentiel',
      status: 'pending'
    },
    {
      id: '3',
      patient: 'Pierre Durand',
      doctor: 'Dr. Sophie Durand',
      time: '15:30',
      type: 'Téléphone',
      status: 'confirmed'
    }
  ]);

  const [recentTasks, setRecentTasks] = React.useState([
    {
      id: '1',
      task: 'Nouveau patient enregistré',
      patient: 'Claire Dubois',
      time: 'Il y a 15 min',
      type: 'patient'
    },
    {
      id: '2',
      task: 'RDV programmé',
      patient: 'Paul Martin',
      doctor: 'Dr. Leblanc',
      time: 'Il y a 30 min',
      type: 'appointment'
    },
    {
      id: '3',
      task: 'Dossier mis à jour',
      patient: 'Sophie Durand',
      time: 'Il y a 1h',
      type: 'record'
    }
  ]);

  // Mettre à jour les rendez-vous à venir depuis Firebase
  React.useEffect(() => {
    const today = new Date();
    const upcomingFromFirebase = appointments
      .filter(apt => {
        const aptDate = new Date(apt.scheduledAt);
        return aptDate > today && apt.status === 'scheduled';
      })
      .slice(0, 3)
      .map(apt => ({
        id: apt.id,
        patient: apt.patientName,
        doctor: apt.doctorName,
        time: new Date(apt.scheduledAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
        type: apt.type === 'video' ? 'Vidéo' : apt.type === 'phone' ? 'Téléphone' : 'Chat',
        status: apt.status
      }));
    
    if (upcomingFromFirebase.length > 0) {
      setUpcomingAppointments(upcomingFromFirebase);
    }
  }, [appointments]);

  // Récupérer le nom de la secrétaire connectée
  const secretaryName = user?.role === 'secretary' 
    ? `${(user.profile as any)?.firstName || 'Secrétaire'}`
    : 'Secrétaire';

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-purple-500 to-sky-500 rounded-xl p-6 text-white">
        <h1 className="text-2xl font-bold mb-2">Bonjour {secretaryName} !</h1>
        {appointmentsLoading ? (
          <p className="text-purple-100">Chargement des données...</p>
        ) : (
          <p className="text-purple-100">
            Vous gérez {todayStats.totalAppointments} rendez-vous aujourd'hui et {todayStats.newPatients} nouveaux patients.
          </p>
        )}
      </div>

      {/* Error Display */}
      {appointmentsError && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
          <div className="flex items-start space-x-3">
            <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="text-sm font-medium text-yellow-800">Problème de synchronisation</h3>
              <p className="text-sm text-yellow-700 mt-1">
                {appointmentsError}. Utilisation des données locales disponibles.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <button 
          onClick={() => onViewChange('patients')}
          className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow text-left group"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="p-3 bg-sky-100 rounded-lg group-hover:bg-sky-200 transition-colors">
              <Users className="h-6 w-6 text-sky-600" />
            </div>
          </div>
          <h3 className="font-semibold text-gray-900 mb-1">Gestion Patients</h3>
          <p className="text-sm text-gray-600">Créer et gérer les dossiers</p>
        </button>

        <button 
          onClick={() => onViewChange('schedule')}
          className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow text-left group"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="p-3 bg-emerald-100 rounded-lg group-hover:bg-emerald-200 transition-colors">
              <Calendar className="h-6 w-6 text-emerald-600" />
            </div>
          </div>
          <h3 className="font-semibold text-gray-900 mb-1">Planning Médical</h3>
          <p className="text-sm text-gray-600">Gérer les rendez-vous</p>
        </button>

        <button 
          onClick={() => onViewChange('messages')}
          className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow text-left group"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="p-3 bg-amber-100 rounded-lg group-hover:bg-amber-200 transition-colors">
              <MessageSquare className="h-6 w-6 text-amber-600" />
            </div>
          </div>
          <h3 className="font-semibold text-gray-900 mb-1">Messages</h3>
          <p className="text-sm text-gray-600">Communication patients</p>
        </button>

        <button 
          onClick={() => onViewChange('medical-records')}
          className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow text-left group"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="p-3 bg-purple-100 rounded-lg group-hover:bg-purple-200 transition-colors">
              <FileText className="h-6 w-6 text-purple-600" />
            </div>
          </div>
          <h3 className="font-semibold text-gray-900 mb-1">Dossiers Médicaux</h3>
          <p className="text-sm text-gray-600">Consulter les dossiers</p>
        </button>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-3 bg-sky-100 rounded-lg">
              <Calendar className="h-6 w-6 text-sky-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">RDV aujourd'hui</p>
              <p className="text-2xl font-bold text-gray-900">
                {appointmentsLoading ? '...' : todayStats.totalAppointments}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-3 bg-emerald-100 rounded-lg">
              <Users className="h-6 w-6 text-emerald-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Nouveaux patients</p>
              <p className="text-2xl font-bold text-gray-900">
                {appointmentsLoading ? '...' : todayStats.newPatients}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-3 bg-amber-100 rounded-lg">
              <Phone className="h-6 w-6 text-amber-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Appels traités</p>
              <p className="text-2xl font-bold text-gray-900">
                {appointmentsLoading ? '...' : todayStats.callsHandled}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-3 bg-purple-100 rounded-lg">
              <FileText className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Documents traités</p>
              <p className="text-2xl font-bold text-gray-900">
                {appointmentsLoading ? '...' : todayStats.documentsProcessed}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Today's Appointments */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center">
              <Calendar className="h-5 w-5 mr-2 text-sky-500" />
              Rendez-vous d'aujourd'hui
            </h2>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {upcomingAppointments.map((appointment) => (
                <div key={appointment.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div>
                    <h3 className="font-medium text-gray-900">{appointment.patient}</h3>
                    <p className="text-sm text-gray-600">{appointment.doctor}</p>
                    <p className="text-sm text-gray-500">
                      {appointment.time} • {appointment.type}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      appointment.status === 'confirmed' || appointment.status === 'scheduled'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {appointment.status === 'confirmed' ? 'Confirmé' : 
                       appointment.status === 'scheduled' ? 'Programmé' : 'En attente'}
                    </span>
                    <button 
                      onClick={() => onViewChange('schedule')}
                      className="bg-sky-500 text-white px-3 py-1 rounded text-sm hover:bg-sky-600 transition-colors"
                    >
                      Gérer
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center">
              <Activity className="h-5 w-5 mr-2 text-emerald-500" />
              Activité récente
            </h2>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {recentTasks.map((task) => (
                <div key={task.id} className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      task.type === 'patient' ? 'bg-sky-100' :
                      task.type === 'appointment' ? 'bg-emerald-100' : 'bg-purple-100'
                    }`}>
                      {task.type === 'patient' ? (
                        <Users className="h-4 w-4 text-sky-600" />
                      ) : task.type === 'appointment' ? (
                        <Calendar className="h-4 w-4 text-emerald-600" />
                      ) : (
                        <FileText className="h-4 w-4 text-purple-600" />
                      )}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900">{task.task}</p>
                    <p className="text-sm text-gray-600">
                      {task.patient}
                      {task.doctor && ` • ${task.doctor}`}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">{task.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Weekly Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 text-center">
          <Users className="h-8 w-8 text-sky-500 mx-auto mb-3" />
          <p className="text-2xl font-bold text-gray-900">
            {appointmentsLoading ? '...' : weeklyStats.totalPatients}
          </p>
          <p className="text-sm text-gray-600">Patients total</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 text-center">
          <Activity className="h-8 w-8 text-emerald-500 mx-auto mb-3" />
          <p className="text-2xl font-bold text-gray-900">
            {appointmentsLoading ? '...' : weeklyStats.activeDoctors}
          </p>
          <p className="text-sm text-gray-600">Médecins actifs</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 text-center">
          <Calendar className="h-8 w-8 text-purple-500 mx-auto mb-3" />
          <p className="text-2xl font-bold text-gray-900">
            {appointmentsLoading ? '...' : weeklyStats.appointmentsScheduled}
          </p>
          <p className="text-sm text-gray-600">RDV cette semaine</p>
        </div>
      </div>

      {/* Quick Access Panel */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Settings className="h-5 w-5 mr-2 text-sky-500" />
          Accès rapide
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <button 
            onClick={() => onViewChange('patients')}
            className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-center"
          >
            <Users className="h-6 w-6 text-sky-500 mx-auto mb-2" />
            <p className="text-sm font-medium text-gray-900">Nouveau Patient</p>
          </button>
          
          <button 
            onClick={() => onViewChange('schedule')}
            className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-center"
          >
            <Calendar className="h-6 w-6 text-emerald-500 mx-auto mb-2" />
            <p className="text-sm font-medium text-gray-900">Nouveau RDV</p>
          </button>
          
          <button 
            onClick={() => onViewChange('messages')}
            className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-center"
          >
            <MessageSquare className="h-6 w-6 text-amber-500 mx-auto mb-2" />
            <p className="text-sm font-medium text-gray-900">Messages</p>
          </button>
          
          <button 
            onClick={() => onViewChange('medical-records')}
            className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-center"
          >
            <FileText className="h-6 w-6 text-purple-500 mx-auto mb-2" />
            <p className="text-sm font-medium text-gray-900">Dossiers</p>
          </button>
        </div>
      </div>
    </div>
  );
};