import { useState, useEffect } from 'react';
import { AppointmentService, Appointment, Doctor } from '../services/appointmentService';

interface UseAppointmentsOptions {
  doctorId?: string;
  patientId?: string;
  status?: string[];
  dateRange?: { start: Date; end: Date };
  realTime?: boolean;
}

interface UseAppointmentsResult {
  appointments: Appointment[];
  doctors: Doctor[];
  loading: boolean;
  error: string | null;
  createAppointment: (appointmentData: any, userId: string) => Promise<{ success: boolean; appointmentId?: string; error?: string }>;
  updateAppointment: (appointmentId: string, updates: Partial<Appointment>, userId: string) => Promise<{ success: boolean; error?: string }>;
  deleteAppointment: (appointmentId: string, userId: string, userRole: string) => Promise<{ success: boolean; error?: string }>;
  getAvailableSlots: (doctorId: string, date: Date) => Promise<string[]>;
  refreshData: () => void;
}

export const useAppointments = (options: UseAppointmentsOptions = {}): UseAppointmentsResult => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Charger les données initiales
  useEffect(() => {
    let appointmentsUnsubscribe: (() => void) | null = null;
    let doctorsUnsubscribe: (() => void) | null = null;

    const initializeData = async () => {
      try {
        setLoading(true);
        setError(null);

        // S'abonner aux rendez-vous avec synchronisation temps réel
        if (options.realTime !== false) {
          appointmentsUnsubscribe = AppointmentService.subscribeToAppointments(
            (appointmentsData) => {
              console.log('📅 Rendez-vous synchronisés:', appointmentsData.length);
              setAppointments(appointmentsData);
              setLoading(false);
            },
            {
              doctorId: options.doctorId,
              patientId: options.patientId,
              status: options.status,
              dateRange: options.dateRange
            }
          );

          // S'abonner aux médecins
          doctorsUnsubscribe = AppointmentService.subscribeToDoctors(
            (doctorsData) => {
              console.log('👨‍⚕️ Médecins synchronisés:', doctorsData.length);
              setDoctors(doctorsData);
            }
          );
        } else {
          // Chargement unique sans synchronisation temps réel
          const stats = await AppointmentService.getAppointmentStatistics(options.doctorId);
          console.log('📊 Statistiques chargées:', stats);
          setLoading(false);
        }

      } catch (err) {
        console.error('❌ Erreur initialisation données:', err);
        setError(err instanceof Error ? err.message : 'Erreur de chargement');
        setLoading(false);
      }
    };

    initializeData();

    // Nettoyage des abonnements
    return () => {
      if (appointmentsUnsubscribe) {
        appointmentsUnsubscribe();
      }
      if (doctorsUnsubscribe) {
        doctorsUnsubscribe();
      }
    };
  }, [options.doctorId, options.patientId, JSON.stringify(options.status), JSON.stringify(options.dateRange), options.realTime]);

  // Fonctions d'action
  const createAppointment = async (
    appointmentData: any,
    userId: string
  ): Promise<{ success: boolean; appointmentId?: string; error?: string }> => {
    try {
      setError(null);
      const result = await AppointmentService.createAppointment(appointmentData, userId);
      
      if (!result.success && result.error?.includes('Firebase non disponible')) {
        // Fallback vers le mode local
        const localResult = AppointmentService.createLocalAppointment(appointmentData, userId);
        return {
          success: true,
          appointmentId: localResult.appointmentId
        };
      }
      
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur création rendez-vous';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const updateAppointment = async (
    appointmentId: string,
    updates: Partial<Appointment>,
    userId: string
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      setError(null);
      return await AppointmentService.updateAppointment(appointmentId, updates, userId);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur mise à jour rendez-vous';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const deleteAppointment = async (
    appointmentId: string,
    userId: string,
    userRole: string
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      setError(null);
      return await AppointmentService.deleteAppointment(appointmentId, userId, userRole);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur suppression rendez-vous';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const getAvailableSlots = async (doctorId: string, date: Date): Promise<string[]> => {
    try {
      return await AppointmentService.getAvailableSlots(doctorId, date);
    } catch (err) {
      console.error('Erreur récupération créneaux:', err);
      return ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00']; // Fallback
    }
  };

  const refreshData = () => {
    // Forcer le rechargement des données
    setLoading(true);
    // Les abonnements se rechargeront automatiquement
  };

  return {
    appointments,
    doctors,
    loading,
    error,
    createAppointment,
    updateAppointment,
    deleteAppointment,
    getAvailableSlots,
    refreshData
  };
};

// Hook spécialisé pour les médecins
export const useDoctorAppointments = (doctorId: string) => {
  return useAppointments({
    doctorId,
    realTime: true
  });
};

// Hook spécialisé pour les patients
export const usePatientAppointments = (patientId: string) => {
  return useAppointments({
    patientId,
    realTime: true
  });
};

// Hook pour les secrétaires (tous les rendez-vous)
export const useSecretaryAppointments = () => {
  return useAppointments({
    realTime: true
  });
};