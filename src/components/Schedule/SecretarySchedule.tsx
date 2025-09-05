import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Plus, Edit, Trash2, Users, Video, Phone, Filter, Search, User, ChevronDown, AlertTriangle } from 'lucide-react';
import { format, addDays, subWeeks, addWeeks, startOfWeek, isSameDay } from 'date-fns';
import { fr } from 'date-fns/locale';
import { NewAppointmentModal } from './NewAppointmentModal';
import { useAuth } from '../../contexts/AuthContext';
import { useSecretaryAppointments } from '../../hooks/useAppointments';
import { Doctor } from '../../services/appointmentService';

interface Appointment {
  id: string;
  patientName: string;
  doctorId: string;
  doctorName: string;
  time: string;
  duration: number;
  type: 'video' | 'phone' | 'chat';
  reason: string;
  status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled';
  date: Date;
  patientEmail: string;
  patientPhone: string;
  fee: number;
}

export const SecretarySchedule: React.FC = () => {
  const { user } = useAuth();
  const { 
    appointments: firebaseAppointments, 
    doctors: firebaseDoctors, 
    loading: appointmentsLoading,
    error: appointmentsError,
    createAppointment,
    updateAppointment,
    deleteAppointment,
    getAvailableSlots
  } = useSecretaryAppointments();
  
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedDoctor, setSelectedDoctor] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'week' | 'day'>('week');
  const [showNewAppointmentModal, setShowNewAppointmentModal] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<{ date: Date; time: string; doctorId?: string } | null>(null);
  const [showDoctorDropdown, setShowDoctorDropdown] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);

  // Utiliser les données Firebase avec fallback local
  const doctors = firebaseDoctors.length > 0 ? firebaseDoctors : [
    {
      id: 'doc1',
      firstName: 'Marie',
      lastName: 'Leblanc',
      specialty: 'Médecine générale',
      email: 'marie.leblanc@docteurs-oi.fr',
      phone: '+33123456789',
      consultationFee: 50,
      verified: true,
      availableSlots: ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00'],
      workingHours: {}
    },
    {
      id: 'doc2',
      firstName: 'Pierre',
      lastName: 'Martin',
      specialty: 'Cardiologie',
      email: 'pierre.martin@docteurs-oi.fr',
      phone: '+33234567890',
      consultationFee: 80,
      verified: true,
      availableSlots: ['08:30', '10:30', '14:30', '16:00'],
      workingHours: {}
    }
  ];

  // Transformer les rendez-vous Firebase en format local
  const allAppointments = React.useMemo(() => {
    return firebaseAppointments.map(apt => ({
      id: apt.id,
      patientName: apt.patientName,
      doctorId: apt.doctorId,
      doctorName: apt.doctorName,
      time: format(new Date(apt.scheduledAt), 'HH:mm'),
      duration: apt.duration,
      type: apt.type,
      reason: apt.reason,
      status: apt.status,
      date: new Date(apt.scheduledAt),
      patientEmail: apt.patientEmail,
      patientPhone: apt.patientPhone,
      fee: apt.fee
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

  // Filtrer les rendez-vous selon le médecin sélectionné
  const filteredAppointments = React.useMemo(() => {
    let filtered = allAppointments;
    
    // Filtrer par médecin
    if (selectedDoctor !== 'all') {
      filtered = filtered.filter(apt => apt.doctorId === selectedDoctor);
    }
    
    // Filtrer par recherche textuelle
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(apt => 
        apt.patientName.toLowerCase().includes(searchLower) ||
        apt.doctorName.toLowerCase().includes(searchLower) ||
        apt.reason.toLowerCase().includes(searchLower)
      );
    }
    
    return filtered;
  }, [allAppointments, selectedDoctor, searchTerm]);

  const getAppointmentsForDate = (date: Date) => {
    return filteredAppointments.filter(apt => isSameDay(new Date(apt.date), date));
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
    setSelectedSlot({ 
      date, 
      time, 
      doctorId: selectedDoctor !== 'all' ? selectedDoctor : undefined 
    });
    setShowNewAppointmentModal(true);
  };

  const handleAppointmentCreated = (newAppointment: any) => {
    console.log('✅ Nouveau rendez-vous créé:', newAppointment);
    // Les données seront automatiquement synchronisées via Firebase
  };

  const handleEditAppointment = (appointmentId: string) => {
    const appointment = allAppointments.find(apt => apt.id === appointmentId);
    if (appointment) {
      alert(`Modification du rendez-vous:\n\nPatient: ${appointment.patientName}\nMédecin: ${appointment.doctorName}\nDate: ${format(appointment.date, 'dd/MM/yyyy')} à ${appointment.time}`);
    }
  };

  const handleCancelAppointment = (appointmentId: string) => {
    const appointment = allAppointments.find(apt => apt.id === appointmentId);
    if (appointment && confirm(`Êtes-vous sûr de vouloir annuler le rendez-vous de ${appointment.patientName} ?`)) {
      // Utiliser le service Firebase pour annuler
      deleteAppointment(appointmentId, user?.id || 'unknown', user?.role || 'secretary')
        .then(result => {
          if (result.success) {
            console.log('✅ Rendez-vous annulé');
          } else {
            console.error('❌ Erreur annulation:', result.error);
            alert('Erreur lors de l\'annulation du rendez-vous');
          }
        });
    }
  };

  const selectedDoctorData = doctors.find(doc => doc.id === selectedDoctor);
  const totalAppointments = filteredAppointments.length;
  const todayAppointments = filteredAppointments.filter(apt => isSameDay(apt.date, new Date())).length;
  const confirmedAppointments = filteredAppointments.filter(apt => apt.status === 'confirmed').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Calendar className="h-8 w-8 text-sky-500" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Planning médical</h1>
              <p className="text-gray-600">
                Gérez les consultations et disponibilités de tous les médecins.
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
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

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Doctor Filter */}
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Filtrer par médecin
            </label>
            <div className="relative">
              <button
                onClick={() => setShowDoctorDropdown(!showDoctorDropdown)}
                className="w-full flex items-center justify-between px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent bg-white hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <User className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-900">
                    {selectedDoctor === 'all' 
                      ? 'Tous les médecins' 
                      : `Dr. ${selectedDoctorData?.firstName} ${selectedDoctorData?.lastName}`
                    }
                  </span>
                </div>
                <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform ${
                  showDoctorDropdown ? 'rotate-180' : ''
                }`} />
              </button>
              
              {showDoctorDropdown && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-64 overflow-y-auto">
                  <div className="p-2">
                    <button
                      onClick={() => {
                        setSelectedDoctor('all');
                        setShowDoctorDropdown(false);
                      }}
                      className={`w-full text-left px-3 py-2 rounded-md transition-colors ${
                        selectedDoctor === 'all' 
                          ? 'bg-sky-50 text-sky-700' 
                          : 'hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <Users className="h-4 w-4 text-gray-400" />
                        <span className="font-medium">Tous les médecins</span>
                      </div>
                    </button>
                    
                    {doctors.map((doctor) => (
                      <button
                        key={doctor.id}
                        onClick={() => {
                          setSelectedDoctor(doctor.id);
                          setShowDoctorDropdown(false);
                        }}
                        className={`w-full text-left px-3 py-2 rounded-md transition-colors ${
                          selectedDoctor === doctor.id 
                            ? 'bg-sky-50 text-sky-700' 
                            : 'hover:bg-gray-50'
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-gradient-to-br from-sky-400 to-emerald-400 rounded-full flex items-center justify-center">
                            <span className="text-white font-bold text-xs">
                              {doctor.firstName[0]}{doctor.lastName[0]}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">
                              Dr. {doctor.firstName} {doctor.lastName}
                            </p>
                            <p className="text-sm text-gray-600">{doctor.specialty}</p>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Search */}
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Rechercher
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Patient, médecin, motif..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Statistics */}
          <div className="flex items-end">
            <div className="bg-sky-50 rounded-lg p-3 min-w-[200px]">
              <div className="text-center">
                <p className="text-sm text-gray-600">Rendez-vous filtrés</p>
                <p className="text-2xl font-bold text-sky-600">
                  {appointmentsLoading ? '...' : totalAppointments}
                </p>
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>Aujourd'hui: {todayAppointments}</span>
                  <span>Confirmés: {confirmedAppointments}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Selected Doctor Info */}
        {selectedDoctor !== 'all' && selectedDoctorData && (
          <div className="mt-4 p-4 bg-gradient-to-r from-sky-50 to-emerald-50 rounded-lg border border-sky-200">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-sky-400 to-emerald-400 rounded-full flex items-center justify-center">
                <span className="text-white font-bold">
                  {selectedDoctorData.firstName[0]}{selectedDoctorData.lastName[0]}
                </span>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">
                  Dr. {selectedDoctorData.firstName} {selectedDoctorData.lastName}
                </h3>
                <p className="text-sm text-gray-600">{selectedDoctorData.specialty}</p>
                <div className="flex items-center space-x-4 text-xs text-gray-500 mt-1">
                  <span>Tarif: {selectedDoctorData.consultationFee}€</span>
                  <span>•</span>
                  <span>{selectedDoctorData.email}</span>
                  {selectedDoctorData.verified && (
                    <>
                      <span>•</span>
                      <span className="text-green-600 font-medium">✓ Vérifié</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
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
              onClick={() => setSelectedDate(subWeeks(selectedDate, 1))}
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
              onClick={() => setSelectedDate(addWeeks(selectedDate, 1))}
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
                            isClickable ? 'cursor-pointer hover:bg-sky-50' : ''
                          } ${appointment ? 'hover:bg-gray-50' : ''}`}
                          onClick={() => isClickable && handleSlotClick(day, time)}
                          title={
                            appointment 
                              ? `${appointment.patientName} - ${appointment.doctorName} - ${appointment.reason}` 
                              : isClickable 
                              ? 'Cliquer pour créer un rendez-vous' 
                              : ''
                          }
                        >
                          {appointment && (
                            <div 
                              className={`absolute inset-1 rounded p-1 text-xs transition-all select-none ${
                                appointment.status === 'confirmed' 
                                  ? 'bg-sky-100 border border-sky-300' 
                                  : appointment.status === 'cancelled'
                                  ? 'bg-red-100 border border-red-300'
                                  : 'bg-yellow-100 border border-yellow-300'
                              }`}
                            >
                              <div className="flex items-center space-x-1 mb-1">
                                {appointment.type === 'video' ? (
                                  <Video className="h-3 w-3 flex-shrink-0" />
                                ) : (
                                  <Phone className="h-3 w-3 flex-shrink-0" />
                                )}
                                <span className="font-medium truncate">
                                  {appointment.patientName}
                                </span>
                              </div>
                              <div className="text-gray-600 truncate text-xs">
                                {selectedDoctor === 'all' && (
                                  <div className="font-medium text-gray-700 mb-1">
                                    {appointment.doctorName}
                                  </div>
                                )}
                                <div>{appointment.reason}</div>
                              </div>
                              
                              {/* Action buttons on hover */}
                              <div className="absolute top-1 right-1 opacity-0 hover:opacity-100 transition-opacity">
                                <div className="flex space-x-1">
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleEditAppointment(appointment.id);
                                    }}
                                    className="p-1 bg-white rounded shadow hover:bg-gray-50"
                                    title="Modifier"
                                  >
                                    <Edit className="h-3 w-3 text-gray-600" />
                                  </button>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleCancelAppointment(appointment.id);
                                    }}
                                    className="p-1 bg-white rounded shadow hover:bg-gray-50"
                                    title="Annuler"
                                  >
                                    <Trash2 className="h-3 w-3 text-red-600" />
                                  </button>
                                </div>
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
            Rendez-vous {selectedDoctor !== 'all' ? `- Dr. ${selectedDoctorData?.firstName} ${selectedDoctorData?.lastName}` : ''}
            <span className="ml-2 text-sm text-gray-500">({filteredAppointments.length})</span>
          </h2>
        </div>
        <div className="p-6">
          {filteredAppointments.length === 0 ? (
            <div className="text-center py-8">
              {appointmentsLoading ? (
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-500 mx-auto mb-4"></div>
              ) : (
                <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              )}
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {appointmentsLoading ? 'Chargement des rendez-vous...' :
                 selectedDoctor === 'all' ? 'Aucun rendez-vous' : 'Aucun rendez-vous pour ce médecin'}
              </h3>
              {!appointmentsLoading && (
                <>
                  <p className="text-gray-600 mb-4">
                    {selectedDoctor === 'all' 
                      ? 'Aucun rendez-vous programmé actuellement.'
                      : `Dr. ${selectedDoctorData?.firstName} ${selectedDoctorData?.lastName} n'a pas de rendez-vous programmés.`
                    }
                  </p>
                  <button 
                    onClick={handleNewAppointment}
                    className="bg-sky-500 text-white px-4 py-2 rounded-lg hover:bg-sky-600 transition-colors"
                  >
                    Créer le premier rendez-vous
                  </button>
                </>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredAppointments.map((appointment) => (
                <div key={appointment.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex items-center space-x-4">
                    <div className={`p-2 rounded-lg ${
                      appointment.type === 'video' ? 'bg-sky-100' : 
                      appointment.type === 'phone' ? 'bg-emerald-100' : 'bg-purple-100'
                    }`}>
                      {appointment.type === 'video' ? (
                        <Video className="h-5 w-5 text-sky-600" />
                      ) : appointment.type === 'phone' ? (
                        <Phone className="h-5 w-5 text-emerald-600" />
                      ) : (
                        <Users className="h-5 w-5 text-purple-600" />
                      )}
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">{appointment.patientName}</h3>
                      <p className="text-sm text-gray-600">{appointment.doctorName}</p>
                      <p className="text-sm text-gray-500">
                        {format(appointment.date, 'dd/MM/yyyy', { locale: fr })} à {appointment.time} 
                        ({appointment.duration} min) • {appointment.reason}
                      </p>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className="text-xs text-gray-500">{appointment.patientEmail}</span>
                        <span className="text-xs text-gray-400">•</span>
                        <span className="text-xs text-gray-500">{appointment.fee}€</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      appointment.status === 'confirmed' 
                        ? 'bg-green-100 text-green-800'
                        : appointment.status === 'cancelled'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {appointment.status === 'confirmed' ? 'Confirmé' : 
                       appointment.status === 'cancelled' ? 'Annulé' : 'En attente'}
                    </span>
                    <button 
                      onClick={() => handleEditAppointment(appointment.id)}
                      className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                      title="Modifier"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button 
                      onClick={() => handleCancelAppointment(appointment.id)}
                      className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                      title="Annuler"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Statistics by Doctor */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {doctors.map((doctor) => {
          const doctorAppointments = filteredAppointments.filter(apt => apt.doctorId === doctor.id);
          const todayDoctorAppointments = doctorAppointments.filter(apt => isSameDay(apt.date, new Date()));
          
          return (
            <div key={doctor.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-10 h-10 bg-gradient-to-br from-sky-400 to-emerald-400 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-sm">
                    {doctor.firstName[0]}{doctor.lastName[0]}
                  </span>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900 text-sm">
                    Dr. {doctor.firstName} {doctor.lastName}
                  </h3>
                  <p className="text-xs text-gray-600">{doctor.specialty}</p>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Aujourd'hui:</span>
                  <span className="font-medium text-gray-900">{todayDoctorAppointments.length}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Total:</span>
                  <span className="font-medium text-gray-900">{doctorAppointments.length}</span>
                </div>
                <button
                  onClick={() => setSelectedDoctor(doctor.id)}
                  className="w-full mt-2 text-xs bg-sky-500 text-white py-1 px-2 rounded hover:bg-sky-600 transition-colors"
                >
                  Voir planning
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal Nouveau Rendez-vous */}
      <NewAppointmentModal
        isOpen={showNewAppointmentModal}
        onClose={() => setShowNewAppointmentModal(false)}
        onAppointmentCreated={handleAppointmentCreated}
        selectedDate={selectedSlot?.date}
        selectedTime={selectedSlot?.time}
        preSelectedDoctorId={selectedSlot?.doctorId}
      />

      {/* Overlay to close doctor dropdown */}
      {showDoctorDropdown && (
        <div 
          className="fixed inset-0 z-40"
          onClick={() => setShowDoctorDropdown(false)}
        />
      )}
    </div>
  );
};