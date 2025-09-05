import { useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

interface SupabaseError {
  message: string;
  details?: string;
  hint?: string;
  code?: string;
}

interface SupabaseError {
  message: string;
  details?: string;
  hint?: string;
  code?: string;
}

interface SupabaseFilter {
  column: string;
  operator: string;
  value: any;
}

interface SupabaseOrderBy {
  column: string;
  ascending?: boolean;
}

interface UseSupabaseQueryResult {
  data: any[];
  loading: boolean;
  error: string | null;
}

export const useSupabaseQuery = (
  tableName: string,
  filters: SupabaseFilter[] = [],
  orderBy?: SupabaseOrderBy,
  limit?: number
): UseSupabaseQueryResult => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isSupabaseConfigured() || !supabase) {
      console.log('Supabase not configured, returning empty data');
      setData([]);
      setError('Supabase not configured - Please click "Connect to Supabase" button');
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        let query = supabase.from(tableName).select('*');

        // Apply filters
        filters.forEach(filter => {
          query = query.filter(filter.column, filter.operator, filter.value);
        });

        // Apply ordering
        if (orderBy) {
          query = query.order(orderBy.column, { ascending: orderBy.ascending ?? true });
        }

        // Apply limit
        if (limit) {
          query = query.limit(limit);
        }

        const { data: results, error } = await query;

        if (error) throw error;

        setData(results || []);
        setError(null);
      } catch (err: unknown) {
        const error = err as SupabaseError;
        console.error('Supabase query error:', error);
        
        if (error.message?.includes('Could not find the table')) {
          setError('Database tables not created yet - Please run the migration first');
        } else {
          setError(error.message || 'Unknown database error');
        }
        setData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [tableName, JSON.stringify(filters), JSON.stringify(orderBy), limit]);

  return { data, loading, error };
};

// Specialized hooks for different tables
export const useUserConsultations = (userId: string, role: 'patient' | 'doctor') => {
  const column = role === 'patient' ? 'patient_id' : 'doctor_id';
  const filters: SupabaseFilter[] = [{ column, operator: 'eq', value: userId }];
  const orderBy: SupabaseOrderBy = { column: 'scheduled_at', ascending: false };
  
  return useSupabaseQuery('consultations', filters, orderBy);
};

export const useUserMessages = (userId: string) => {
  const filters: SupabaseFilter[] = [{ column: 'participants', operator: 'cs', value: `{${userId}}` }];
  const orderBy: SupabaseOrderBy = { column: 'last_message_timestamp', ascending: false };
  
  return useSupabaseQuery('conversations', filters, orderBy);
};

export const useMedicalRecords = (patientId: string) => {
  const filters: SupabaseFilter[] = [{ column: 'patient_id', operator: 'eq', value: patientId }];
  const orderBy: SupabaseOrderBy = { column: 'consultation_date', ascending: false };
  
  return useSupabaseQuery('medical_records', filters, orderBy);
};

// Supabase-specific utility functions
export const useSupabaseTable = (tableName: string) => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isSupabaseConfigured() || !supabase) {
      setData([]);
      setError('Supabase not configured - Please click "Connect to Supabase" button');
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        const { data: results, error } = await supabase
          .from(tableName)
          .select('*');

        if (error) throw error;

        setData(results || []);
        setError(null);
      } catch (err: unknown) {
        const error = err as SupabaseError;
        console.error('Supabase query error:', error);
        
        if (error.message?.includes('Could not find the table')) {
          setError('Database tables not created yet - Please run the migration first');
        } else {
          setError(error.message || 'Unknown database error');
        }
        setData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [tableName]);

  return { data, loading, error };
};

// Real-time subscription hook
export const useSupabaseSubscription = (
  tableName: string,
  callback: (payload: any) => void,
  filters?: SupabaseFilter[]
) => {
  useEffect(() => {
    if (!isSupabaseConfigured() || !supabase) {
      return;
    }

    let subscription = supabase
      .channel(`${tableName}_changes`)
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: tableName 
        }, 
        callback
      )
      .subscribe();

    return () => {
      if (subscription) {
        supabase.removeChannel(subscription);
      }
    };
  }, [tableName, callback]);
};

// Hook for appointments with real-time updates
export const useSupabaseAppointments = (
  userId: string,
  userRole: 'patient' | 'doctor' | 'secretary'
) => {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isSupabaseConfigured() || !supabase) {
      setAppointments([]);
      setError('Supabase not configured - Please click "Connect to Supabase" button');
      setLoading(false);
      return;
    }

    const fetchAppointments = async () => {
      try {
        let query = supabase.from('appointments').select('*');

        // Apply role-based filters
        if (userRole === 'patient') {
          query = query.eq('patient_id', userId);
        } else if (userRole === 'doctor') {
          query = query.eq('doctor_id', userId);
        }
        // Secretary can see all appointments

        query = query.order('scheduled_at', { ascending: false });

        const { data, error } = await query;

        if (error) throw error;

        setAppointments(data || []);
        setError(null);
      } catch (err: unknown) {
        const error = err as SupabaseError;
        console.error('Error fetching appointments:', error);
        
        if (error.message?.includes('Could not find the table')) {
          setError('Appointments table not created yet - Please run the migration first');
        } else {
          setError(error.message || 'Unknown error fetching appointments');
        }
        
        if (error.message?.includes('Could not find the table')) {
          setError('Appointments table not created yet - Please run the migration first');
        } else {
          setError(error.message || 'Unknown error fetching appointments');
        }
        setAppointments([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();

    // Set up real-time subscription
    const subscription = supabase
      .channel('appointments_changes')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'appointments'
        }, 
        () => {
          fetchAppointments();
        }
      )
      .subscribe();

    return () => {
      if (subscription) {
        supabase.removeChannel(subscription);
      }
    };
  }, [userId, userRole]);

  return { appointments, loading, error };
};

// Hook for doctors list
export const useSupabaseDoctors = () => {
  const [doctors, setDoctors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isSupabaseConfigured() || !supabase) {
      setDoctors([]);
      setError('Supabase not configured - Please click "Connect to Supabase" button');
      setLoading(false);
      return;
    }

    const fetchDoctors = async () => {
      try {
        const { data, error } = await supabase
          .from('doctors')
          .select('*')
          .eq('verified', true)
          .order('last_name', { ascending: true });
        if (error) throw error;

        setDoctors(data || []);
        setError(null);
      } catch (err: unknown) {
        const fetchError = err as SupabaseError;
        console.error('Error fetching doctors:', fetchError);
        
        if (fetchError.message?.includes('Could not find the table')) {
          setError('Doctors table not created yet - Please run the migration first');
        } else {
          setError(fetchError.message || 'Unknown error fetching doctors');
        }
        setDoctors([]);
      } finally {
        setLoading(false);
      }
    };

    fetchDoctors();
  }, []);

  return { doctors, loading, error };
};