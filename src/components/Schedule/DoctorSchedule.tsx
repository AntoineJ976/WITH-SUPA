import React, { useState } from 'react';
import { Calendar, Clock, Plus, Edit, Trash2, Users, Video, Phone } from 'lucide-react';
import { format, addDays, startOfWeek, isSameDay } from 'date-fns';
import { fr } from 'date-fns/locale';
import { NewAppointmentModal } from './NewAppointmentModal';
import { useDoctorAppointments } from '../../hooks/useAppointments';
import { useAuth } from '../../contexts/AuthContext';

export const DoctorSchedule: React.FC = () => {
  const { user } = useAuth();
  const { 
    appointments: firebaseAppointments, 
    loading: appointmentsLoading,
    error: appointmentsError,
    createAppointment,
    deleteAppointment
  } = useDoctorAppointments(user?.id || 'doc1');
  
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'week' | 'day'>('week');
  const [showNewAppointmentModal, setShowNewAppointmentModal] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<{ date: Date; time: string } | null>(null);

  // Transformer les rendez-vous Firebase en format local
  const appointments = React.useMemo(() => {
    return firebaseAppointments.map(apt => ({
      id: apt.id,
      patientName: apt.patientName,
      time: format(new Date(apt.scheduledAt), 'HH:mm'),
      duration: apt.duration,
      type: apt.type,
      reason: apt.reason,
      status: apt.status === 'scheduled' ? 'confirmed' : apt.status,
      date: new Date(apt.scheduledAt)
    }));
  }, [firebaseAppointments]);

  const timeSlots = [
    '08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '12:00', '12:30', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30',
    '16:00', '16:30', '17:00', '17:30', '18:00'
  ];

  const weekDays = Array.from({ length: 7 }, (_, i) => 
    addDays(startOfWeek(selectedDate, { weekStartsOn: 1 }), i)
  );

  const getAppointmentsForDate = (date: Date) => {
    return appointments.filter(apt => isSameDay(new Date(apt.date), date));
  };

  const getAppointmentAtTime = (date: Date, time: string) => {
    const dayAppointments = getAppointmentsForDate(date);
    return dayAppointments.find(apt => apt.time === time);
  };

  const handleNewAppointment = () => {
    setSelectedSlot(null);
    setShowNewAppointmentModal(true);
  };

  const handleSlotClick = (date: Date, time: string) => {
    // Vérifier si le créneau est libre
    const existingAppointment = getAppointmentAtTime(date, time);
    if (existingAppointment) {
      return; // Créneau occupé
    }
    
    // Vérifier si ce n'est pas dans le passé
    const now = new Date();
    const slotDateTime = new Date(date);
    const [hours, minutes] = time.split(':').map(Number);
    slotDateTime.setHours(hours, minutes);

    if (slotDateTime < now) {
      return; // Créneau dans le passé
    }

    // Ouvrir le modal avec le créneau pré-sélectionné
    setSelectedSlot({ date, time });
    setShowNewAppointmentModal(true);
  };

  const handleAppointmentCreated = (newAppointment: any) => {
    console.log('✅ Nouveau rendez-vous créé:', newAppointment);
    // Les données seront automatiquement synchronisées via Firebase
  };

  return (
    <div className="space-y-6 relative">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Calendar className="h-8 w-8 text-sky-500" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Planning médical</h1>
              <p className="text-gray-600">
                Gérez vos consultations et disponibilités.
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            {appointmentsLoading && (
              <div className="flex items-center space-x-2 text-gray-600">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-sky-500"></div>
                <span className="text-sm">Synchronisation...</span>
              </div>
            )}
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode('week')}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                  viewMode === 'week' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600'
                }`}
              >
                Semaine
              </button>
              <button
                onClick={() => setViewMode('day')}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                  viewMode === 'day' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600'
                }`}
              >
                Jour
              </button>
            </div>
            <button 
              onClick={handleNewAppointment}
              className="flex items-center space-x-2 px-4 py-2 bg-sky-500 text-white rounded-lg hover:bg-sky-600 transition-colors"
            >
              <Plus className="h-4 w-4" />
              <span>Nouveau créneau</span>
            </button>
          </div>
        </div>
      </div>

      {/* Error Display */}
      {appointmentsError && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
          <div className="flex items-start space-x-3">
            <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="text-sm font-medium text-yellow-800">Problème de synchronisation</h3>
              <p className="text-sm text-yellow-700 mt-1">
                {appointmentsError}. Utilisation des données locales.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Calendar Navigation */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">
            {format(selectedDate, 'MMMM yyyy', { locale: fr })}
          </h2>
          <div className="flex space-x-2">
            <button
              onClick={() => setSelectedDate(addDays(selectedDate, -7))}
              className="px-3 py-1 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            >
              ← Précédent
            </button>
            <button
              onClick={() => setSelectedDate(new Date())}
              className="px-3 py-1 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            >
              Aujourd'hui
            </button>
            <button
              onClick={() => setSelectedDate(addDays(selectedDate, 7))}
              className="px-3 py-1 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            >
              Suivant →
            </button>
          </div>
        </div>

        {/* Week View */}
        {viewMode === 'week' && (
          <div className="overflow-x-auto">
            <div className="min-w-full">
              {/* Days Header */}
              <div className="grid grid-cols-8 gap-px bg-gray-200 rounded-lg overflow-hidden">
                <div className="bg-gray-50 p-3 text-center font-medium text-gray-700">
                  Heure
                </div>
                {weekDays.map((day, index) => (
                  <div key={index} className="bg-gray-50 p-3 text-center">
                    <div className="font-medium text-gray-900">
                      {format(day, 'EEE', { locale: fr })}
                    </div>
                    <div className="text-sm text-gray-600">
                      {format(day, 'dd', { locale: fr })}
                    </div>
                  </div>
                ))}
              </div>

              {/* Time Slots */}
              <div className="mt-2">
                {timeSlots.map((time) => (
                  <div key={time} className="grid grid-cols-8 gap-px mb-1">
                    <div className="bg-gray-50 p-2 text-center text-sm text-gray-600 border rounded-l">
                      {time}
                    </div>
                    {weekDays.map((day, dayIndex) => {
                      const appointment = getAppointmentAtTime(day, time);
                      const isClickable = !appointment && new Date(`${format(day, 'yyyy-MM-dd')}T${time}`) > new Date();
                      
                      return (
                        <div 
                          key={dayIndex} 
                          className={`bg-white border h-16 relative transition-colors ${
                            isClickable ? 'cursor-pointer hover:bg-sky-50' : 
                            appointment ? 'cursor-pointer hover:bg-gray-50' : 'cursor-not-allowed bg-gray-50'
                          }`}
                          onClick={() => isClickable && handleSlotClick(day, time)}
                          title={
                            appointment 
                              ? `${appointment.patientName} - ${appointment.reason}` 
                              : isClickable 
                              ? 'Cliquer pour créer un rendez-vous' 
                              : 'Créneau indisponible (passé)'
                          }
                        >
                          {appointment && (
                            <div 
                              className={`absolute inset-1 rounded p-1 text-xs transition-all select-none ${
                                appointment.status === 'confirmed' 
                                  ? 'bg-sky-100 border border-sky-300' 
                                  : 'bg-yellow-100 border border-yellow-300'
                              }`}
                            >
                              <div className="flex items-center space-x-1">
                                {appointment.type === 'video' ? (
                                  <Video className="h-3 w-3 flex-shrink-0" />
                                ) : (
                                  <Phone className="h-3 w-3 flex-shrink-0" />
                                )}
                                <span className="font-medium truncate">
                                  {appointment.patientName}
                                </span>
                              </div>
                              <div className="text-gray-600 truncate">
                                {appointment.reason}
                              </div>
                            </div>
                          )}
                          {!appointment && isClickable && (
                            <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                              <div className="bg-sky-500 text-white rounded-full p-1">
                                <Plus className="h-4 w-4" />
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Appointments List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center">
            <Users className="h-5 w-5 mr-2 text-sky-500" />
            Rendez-vous à venir
          </h2>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {appointments.map((appointment) => (
              <div key={appointment.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex items-center space-x-4">
                  <div className={`p-2 rounded-lg ${
                    appointment.type === 'video' ? 'bg-sky-100' : 'bg-emerald-100'
                  }`}>
                    {appointment.type === 'video' ? (
                      <Video className={`h-5 w-5 ${
                        appointment.type === 'video' ? 'text-sky-600' : 'text-emerald-600'
                      }`} />
                    ) : (
                      <Phone className="h-5 w-5 text-emerald-600" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">{appointment.patientName}</h3>
                    <p className="text-sm text-gray-600">{appointment.reason}</p>
                    <p className="text-sm text-gray-500">
                      {format(appointment.date, 'dd/MM/yyyy', { locale: fr })} à {appointment.time} 
                      ({appointment.duration} min)
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    appointment.status === 'confirmed' 
                      ? 'bg-green-100 text-green-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {appointment.status === 'confirmed' ? 'Confirmé' : 'En attente'}
                  </span>
                  <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                    <Edit className="h-4 w-4" />
                  </button>
                  <button className="p-2 text-gray-400 hover:text-red-600 transition-colors">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 text-center">
          <Clock className="h-8 w-8 text-sky-500 mx-auto mb-3" />
          <p className="text-2xl font-bold text-gray-900">8h30</p>
          <p className="text-sm text-gray-600">Temps moyen par consultation</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 text-center">
          <Users className="h-8 w-8 text-emerald-500 mx-auto mb-3" />
          <p className="text-2xl font-bold text-gray-900">24</p>
          <p className="text-sm text-gray-600">Consultations cette semaine</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 text-center">
          <Calendar className="h-8 w-8 text-amber-500 mx-auto mb-3" />
          <p className="text-2xl font-bold text-gray-900">92%</p>
          <p className="text-sm text-gray-600">Taux de présence</p>
        </div>
      </div>

      {/* Modal Nouveau Rendez-vous */}
      <NewAppointmentModal
        isOpen={showNewAppointmentModal}
        onClose={() => setShowNewAppointmentModal(false)}
        onAppointmentCreated={handleAppointmentCreated}
        selectedDate={selectedSlot?.date}
        selectedTime={selectedSlot?.time}
      />
    </div>
  );
};