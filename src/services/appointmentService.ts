import { SupabaseService } from './supabaseService';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

export interface Appointment {
  id: string;
  patient_id: string;
  patient_name: string;
  patient_email: string;
  patient_phone: string;
  doctor_id: string;
  doctor_name: string;
  scheduled_at: string;
  duration: number;
  type: 'video' | 'phone' | 'chat';
  reason: string;
  notes?: string;
  status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled';
  fee: number;
  created_by: string;
  created_by_role: 'patient' | 'doctor' | 'secretary';
  created_at: string;
  updated_at: string;
  // Champs pour la synchronisation
  version: number;
  last_modified_by: string;
  conflict_resolution?: 'auto' | 'manual';
}

export interface Doctor {
  id: string;
  first_name: string;
  last_name: string;
  specialty: string;
  email: string;
  phone: string;
  consultation_fee: number;
  verified: boolean;
  available_slots: string[];
  working_hours: {
    [key: string]: {
      start: string;
      end: string;
      available: boolean;
    };
  };
}

export class AppointmentService {
  private static readonly TABLE_NAME = 'appointments';
  private static readonly DOCTORS_TABLE = 'doctors';
  
  /**
   * Créer un nouveau rendez-vous avec gestion des conflits
   */
  static async createAppointment(
    appointmentData: Omit<Appointment, 'id' | 'created_at' | 'updated_at' | 'version' | 'last_modified_by'>,
    userId: string
  ): Promise<{ success: boolean; appointmentId?: string; error?: string }> {
    try {
      if (!isSupabaseConfigured()) {
        return this.createLocalAppointment(appointmentData, userId);
      }

      // 1. Vérifier les conflits de créneaux
      const conflictCheck = await this.checkSlotConflict(
        appointmentData.doctor_id,
        appointmentData.scheduled_at,
        appointmentData.duration
      );

      if (conflictCheck.hasConflict) {
        return {
          success: false,
          error: `Conflit détecté: ${conflictCheck.conflictDetails}`
        };
      }

      // 2. Créer l'objet rendez-vous avec métadonnées de synchronisation
      const appointmentDoc = {
        ...appointmentData,
        version: 1,
        last_modified_by: userId
      };

      // 3. Utiliser Supabase pour créer le rendez-vous
      const result = await SupabaseService.createDocument(
        this.TABLE_NAME,
        appointmentDoc,
        userId,
        { auditAction: 'create_appointment' }
      );

      if (!result.success) {
        return {
          success: false,
          error: result.error
        };
      }

      // 4. Mettre à jour les statistiques du médecin
      if (supabase) {
        await supabase
          .from('users')
          .update({ 
            last_appointment_created: new Date().toISOString()
          })
          .eq('id', appointmentData.doctor_id);
      }

      return {
        success: true,
        appointmentId: result.data?.id
      };

    } catch (error) {
      console.error('Erreur création rendez-vous:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue'
      };
    }
  }

  /**
   * Vérifier les conflits de créneaux
   */
  private static async checkSlotConflict(
    doctorId: string,
    scheduledAt: string,
    duration: number
  ): Promise<{ hasConflict: boolean; conflictDetails?: string }> {
    try {
      if (!isSupabaseConfigured() || !supabase) {
        return { hasConflict: false };
      }

      const appointmentTime = new Date(scheduledAt);
      const endTime = new Date(appointmentTime.getTime() + duration * 60000);

      // Obtenir les rendez-vous existants pour ce médecin
      const { data: existingAppointments, error } = await supabase
        .from(this.TABLE_NAME)
        .select('*')
        .eq('doctor_id', doctorId)
        .in('status', ['scheduled', 'confirmed'])
        .gte('scheduled_at', appointmentTime.toISOString())
        .lte('scheduled_at', new Date(appointmentTime.getTime() + 4 * 60 * 60 * 1000).toISOString()); // 4h window

      if (error) {
        console.warn('Erreur vérification conflits:', error);
        return { hasConflict: false };
      }

      for (const existingAppointment of existingAppointments || []) {
        const existingStart = new Date(existingAppointment.scheduled_at);
        const existingEnd = new Date(existingStart.getTime() + existingAppointment.duration * 60000);

        // Vérifier le chevauchement
        if (
          (appointmentTime >= existingStart && appointmentTime < existingEnd) ||
          (endTime > existingStart && endTime <= existingEnd) ||
          (appointmentTime <= existingStart && endTime >= existingEnd)
        ) {
          return {
            hasConflict: true,
            conflictDetails: `Conflit avec le rendez-vous de ${existingAppointment.patient_name} de ${existingStart.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })} à ${existingEnd.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`
          };
        }
      }

      return { hasConflict: false };

    } catch (error) {
      console.error('Erreur vérification conflit:', error);
      return { hasConflict: false }; // En cas d'erreur, permettre la création
    }
  }

  /**
   * Obtenir tous les rendez-vous avec synchronisation temps réel
   */
  static subscribeToAppointments(
    callback: (appointments: Appointment[]) => void,
    filters?: {
      doctorId?: string;
      patientId?: string;
      status?: string[];
      dateRange?: { start: Date; end: Date };
    }
  ): () => void {
    try {
      if (!isSupabaseConfigured() || !supabase) {
        console.log('Supabase non disponible, utilisation des données locales');
        const localAppointments = this.getLocalAppointments();
        callback(localAppointments);
        return () => {};
      }

      let query = supabase
        .from(this.TABLE_NAME)
        .select('*')
        .order('scheduled_at', { ascending: false });

      // Appliquer les filtres
      if (filters?.doctorId) {
        query = query.eq('doctor_id', filters.doctorId);
      }
      if (filters?.patientId) {
        query = query.eq('patient_id', filters.patientId);
      }
      if (filters?.status && filters.status.length > 0) {
        query = query.in('status', filters.status);
      }

      const subscription = query
        .subscribe((payload) => {
          console.log('Changement appointments:', payload);
          // Recharger les données après changement
          this.loadAppointments(callback, filters);
        });

      // Charger les données initiales
      this.loadAppointments(callback, filters);

      return () => {
        subscription?.unsubscribe();
      };

    } catch (error) {
      console.error('Erreur abonnement rendez-vous:', error);
      const localAppointments = this.getLocalAppointments();
      callback(localAppointments);
      return () => {};
    }
  }

  /**
   * Charger les rendez-vous depuis Supabase
   */
  private static async loadAppointments(
    callback: (appointments: Appointment[]) => void,
    filters?: {
      doctorId?: string;
      patientId?: string;
      status?: string[];
      dateRange?: { start: Date; end: Date };
    }
  ): Promise<void> {
    try {
      if (!supabase) return;

      let query = supabase
        .from(this.TABLE_NAME)
        .select('*')
        .order('scheduled_at', { ascending: false });

      // Appliquer les filtres
      if (filters?.doctorId) {
        query = query.eq('doctor_id', filters.doctorId);
      }
      if (filters?.patientId) {
        query = query.eq('patient_id', filters.patientId);
      }
      if (filters?.status && filters.status.length > 0) {
        query = query.in('status', filters.status);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Erreur chargement appointments:', error);
        const localAppointments = this.getLocalAppointments();
        callback(localAppointments);
        return;
      }

      const appointments = (data || []) as Appointment[];
      
      // Sauvegarder localement pour la résilience
      localStorage.setItem('docteurs-oi-appointments', JSON.stringify(appointments));
      callback(appointments);

    } catch (error) {
      console.error('Erreur chargement appointments:', error);
      const localAppointments = this.getLocalAppointments();
      callback(localAppointments);
    }
  }

  /**
   * Obtenir tous les médecins avec synchronisation temps réel
   */
  static subscribeToDoctors(
    callback: (doctors: Doctor[]) => void
  ): () => void {
    try {
      if (!isSupabaseConfigured() || !supabase) {
        console.log('Supabase non disponible, utilisation des données locales');
        const localDoctors = this.getLocalDoctors();
        callback(localDoctors);
        return () => {};
      }

      const subscription = supabase
        .from('users')
        .select('*')
        .eq('role', 'doctor')
        .subscribe((payload) => {
          console.log('Changement doctors:', payload);
          this.loadDoctors(callback);
        });

      // Charger les données initiales
      this.loadDoctors(callback);

      return () => {
        subscription?.unsubscribe();
      };

    } catch (error) {
      console.error('Erreur abonnement médecins:', error);
      const localDoctors = this.getLocalDoctors();
      callback(localDoctors);
      return () => {};
    }
  }

  /**
   * Charger les médecins depuis Supabase
   */
  private static async loadDoctors(
    callback: (doctors: Doctor[]) => void
  ): Promise<void> {
    try {
      if (!supabase) return;

      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('role', 'doctor')
        .order('last_name', { ascending: true });

      if (error) {
        console.error('Erreur chargement doctors:', error);
        const localDoctors = this.getLocalDoctors();
        callback(localDoctors);
        return;
      }

      const doctors: Doctor[] = (data || []).map(user => ({
        id: user.id,
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        specialty: user.specialty || 'Médecine générale',
        email: user.email || '',
        phone: user.phone_number || '',
        consultation_fee: user.consultation_fee || 50,
        verified: user.verified || false,
        available_slots: user.available_hours || [],
        working_hours: user.working_hours || {}
      }));

      // Sauvegarder localement
      localStorage.setItem('docteurs-oi-doctors', JSON.stringify(doctors));
      callback(doctors);

    } catch (error) {
      console.error('Erreur chargement doctors:', error);
      const localDoctors = this.getLocalDoctors();
      callback(localDoctors);
    }
  }

  /**
   * Mettre à jour un rendez-vous avec gestion des conflits
   */
  static async updateAppointment(
    appointmentId: string,
    updates: Partial<Appointment>,
    userId: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      if (!isSupabaseConfigured()) {
        throw new Error('Supabase non disponible');
      }

      // Obtenir le rendez-vous actuel
      const currentResult = await SupabaseService.readDocument<Appointment>(
        this.TABLE_NAME,
        appointmentId,
        userId
      );

      if (!currentResult.success || !currentResult.data) {
        return {
          success: false,
          error: 'Rendez-vous non trouvé'
        };
      }

      const currentData = currentResult.data;

      // Vérifier la version pour éviter les conflits de mise à jour
      if (updates.version && updates.version <= currentData.version) {
        return {
          success: false,
          error: 'Conflit de version détecté. Le rendez-vous a été modifié par un autre utilisateur.'
        };
      }

      // Si on modifie l'heure, vérifier les conflits
      if (updates.scheduled_at && updates.scheduled_at !== currentData.scheduled_at) {
        const conflictCheck = await this.checkSlotConflict(
          updates.doctor_id || currentData.doctor_id,
          updates.scheduled_at,
          updates.duration || currentData.duration
        );

        if (conflictCheck.hasConflict) {
          return {
            success: false,
            error: `Conflit détecté: ${conflictCheck.conflictDetails}`
          };
        }
      }

      // Mettre à jour avec nouvelle version
      const updateData = {
        ...updates,
        version: (currentData.version || 0) + 1,
        last_modified_by: userId
      };

      const result = await SupabaseService.updateDocument(
        this.TABLE_NAME,
        appointmentId,
        updateData,
        userId,
        { auditAction: 'update_appointment' }
      );

      return { success: result.success, error: result.error };

    } catch (error) {
      console.error('Erreur mise à jour rendez-vous:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue'
      };
    }
  }

  /**
   * Supprimer un rendez-vous
   */
  static async deleteAppointment(
    appointmentId: string,
    userId: string,
    userRole: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      if (!isSupabaseConfigured()) {
        throw new Error('Supabase non disponible');
      }

      // Marquer comme supprimé au lieu de supprimer définitivement (pour audit)
      const result = await SupabaseService.updateDocument(
        this.TABLE_NAME,
        appointmentId,
        {
          status: 'cancelled',
          cancelled_by: userId,
          cancelled_at: new Date().toISOString(),
          cancellation_reason: 'Supprimé par ' + userRole
        },
        userId,
        { auditAction: 'cancel_appointment' }
      );

      return { success: result.success, error: result.error };

    } catch (error) {
      console.error('Erreur suppression rendez-vous:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue'
      };
    }
  }

  /**
   * Obtenir les créneaux disponibles pour un médecin
   */
  static async getAvailableSlots(
    doctorId: string,
    date: Date
  ): Promise<string[]> {
    try {
      if (!isSupabaseConfigured() || !supabase) {
        return ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00']; // Fallback
      }

      // Obtenir les rendez-vous existants pour ce médecin à cette date
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);

      const { data: appointments, error } = await supabase
        .from(this.TABLE_NAME)
        .select('scheduled_at, duration')
        .eq('doctor_id', doctorId)
        .in('status', ['scheduled', 'confirmed'])
        .gte('scheduled_at', startOfDay.toISOString())
        .lte('scheduled_at', endOfDay.toISOString());

      if (error) {
        console.error('Erreur récupération créneaux:', error);
        return ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00']; // Fallback
      }

      const bookedSlots = (appointments || []).map(apt => {
        const date = new Date(apt.scheduled_at);
        return date.toTimeString().slice(0, 5);
      });

      // Créneaux standards (à personnaliser par médecin)
      const allSlots = [
        '08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
        '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00', '17:30'
      ];

      // Filtrer les créneaux déjà réservés
      const availableSlots = allSlots.filter(slot => !bookedSlots.includes(slot));

      return availableSlots;

    } catch (error) {
      console.error('Erreur récupération créneaux:', error);
      return ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00']; // Fallback
    }
  }

  /**
   * Données locales de fallback pour les médecins
   */
  private static getLocalDoctors(): Doctor[] {
    try {
      const stored = localStorage.getItem('docteurs-oi-doctors');
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      console.error('Erreur lecture médecins locaux:', error);
    }

    // Données par défaut
    return [
      {
        id: 'doc1',
        first_name: 'Marie',
        last_name: 'Leblanc',
        specialty: 'Médecine générale',
        email: 'marie.leblanc@docteurs-oi.fr',
        phone: '+33123456789',
        consultation_fee: 50,
        verified: true,
        available_slots: ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00'],
        working_hours: {
          monday: { start: '08:00', end: '18:00', available: true },
          tuesday: { start: '08:00', end: '18:00', available: true },
          wednesday: { start: '08:00', end: '18:00', available: true },
          thursday: { start: '08:00', end: '18:00', available: true },
          friday: { start: '08:00', end: '17:00', available: true },
          saturday: { start: '09:00', end: '12:00', available: true },
          sunday: { start: '00:00', end: '00:00', available: false }
        }
      },
      {
        id: 'doc2',
        first_name: 'Pierre',
        last_name: 'Martin',
        specialty: 'Cardiologie',
        email: 'pierre.martin@docteurs-oi.fr',
        phone: '+33234567890',
        consultation_fee: 80,
        verified: true,
        available_slots: ['08:30', '10:30', '14:30', '16:00'],
        working_hours: {
          monday: { start: '08:00', end: '17:00', available: true },
          tuesday: { start: '08:00', end: '17:00', available: true },
          wednesday: { start: '08:00', end: '17:00', available: true },
          thursday: { start: '08:00', end: '17:00', available: true },
          friday: { start: '08:00', end: '16:00', available: true },
          saturday: { start: '00:00', end: '00:00', available: false },
          sunday: { start: '00:00', end: '00:00', available: false }
        }
      },
      {
        id: 'doc3',
        first_name: 'Sophie',
        last_name: 'Durand',
        specialty: 'Dermatologie',
        email: 'sophie.durand@docteurs-oi.fr',
        phone: '+33345678901',
        consultation_fee: 70,
        verified: true,
        available_slots: ['09:30', '11:00', '15:00', '16:30'],
        working_hours: {
          monday: { start: '09:00', end: '18:00', available: true },
          tuesday: { start: '09:00', end: '18:00', available: true },
          wednesday: { start: '09:00', end: '18:00', available: true },
          thursday: { start: '09:00', end: '18:00', available: true },
          friday: { start: '09:00', end: '17:00', available: true },
          saturday: { start: '00:00', end: '00:00', available: false },
          sunday: { start: '00:00', end: '00:00', available: false }
        }
      }
    ];
  }

  /**
   * Données locales de fallback pour les rendez-vous
   */
  private static getLocalAppointments(): Appointment[] {
    try {
      const stored = localStorage.getItem('docteurs-oi-appointments');
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      console.error('Erreur lecture rendez-vous locaux:', error);
    }

    return [];
  }

  /**
   * Créer un rendez-vous en mode local (fallback)
   */
  static createLocalAppointment(
    appointmentData: Omit<Appointment, 'id' | 'created_at' | 'updated_at' | 'version' | 'last_modified_by'>,
    userId: string
  ): { success: boolean; appointmentId: string } {
    try {
      const localAppointment: Appointment = {
        id: `local-${Date.now()}`,
        ...appointmentData,
        version: 1,
        last_modified_by: userId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const existingAppointments = this.getLocalAppointments();
      const updatedAppointments = [localAppointment, ...existingAppointments];
      
      localStorage.setItem('docteurs-oi-appointments', JSON.stringify(updatedAppointments));

      return {
        success: true,
        appointmentId: localAppointment.id
      };

    } catch (error) {
      console.error('Erreur création rendez-vous local:', error);
      throw error;
    }
  }

  /**
   * Obtenir les statistiques des rendez-vous
   */
  static async getAppointmentStatistics(
    doctorId?: string
  ): Promise<{
    total: number;
    scheduled: number;
    confirmed: number;
    completed: number;
    cancelled: number;
    todayCount: number;
    weekCount: number;
  }> {
    try {
      if (!isSupabaseConfigured() || !supabase) {
        const localAppointments = this.getLocalAppointments();
        return this.calculateStatistics(localAppointments, doctorId);
      }

      let query = supabase.from(this.TABLE_NAME).select('*');
      
      if (doctorId) {
        query = query.eq('doctor_id', doctorId);
      }

      const { data: appointments, error } = await query;

      if (error) {
        console.error('Erreur statistiques rendez-vous:', error);
        const localAppointments = this.getLocalAppointments();
        return this.calculateStatistics(localAppointments, doctorId);
      }

      return this.calculateStatistics(appointments || [], doctorId);

    } catch (error) {
      console.error('Erreur statistiques rendez-vous:', error);
      const localAppointments = this.getLocalAppointments();
      return this.calculateStatistics(localAppointments, doctorId);
    }
  }

  /**
   * Calculer les statistiques à partir des données
   */
  private static calculateStatistics(
    appointments: Appointment[],
    doctorId?: string
  ): {
    total: number;
    scheduled: number;
    confirmed: number;
    completed: number;
    cancelled: number;
    todayCount: number;
    weekCount: number;
  } {
    const filtered = doctorId 
      ? appointments.filter(apt => apt.doctor_id === doctorId)
      : appointments;

    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay() + 1); // Lundi
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6); // Dimanche

    return {
      total: filtered.length,
      scheduled: filtered.filter(apt => apt.status === 'scheduled').length,
      confirmed: filtered.filter(apt => apt.status === 'confirmed').length,
      completed: filtered.filter(apt => apt.status === 'completed').length,
      cancelled: filtered.filter(apt => apt.status === 'cancelled').length,
      todayCount: filtered.filter(apt => {
        const aptDate = new Date(apt.scheduled_at);
        return aptDate.toDateString() === today.toDateString();
      }).length,
      weekCount: filtered.filter(apt => {
        const aptDate = new Date(apt.scheduled_at);
        return aptDate >= startOfWeek && aptDate <= endOfWeek;
      }).length
    };
  }
}