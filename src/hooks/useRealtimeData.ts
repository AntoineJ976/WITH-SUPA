import { useState, useEffect, useCallback, useRef } from 'react';
import { RealtimeService, RealtimeSubscription } from '../services/realtimeService';
import { useAuth } from '../contexts/AuthContext';

export interface UseRealtimeDataOptions {
  enabled?: boolean;
  autoReconnect?: boolean;
  maxReconnectAttempts?: number;
  reconnectDelay?: number;
}

export interface RealtimeDataState<T> {
  data: T;
  loading: boolean;
  error: string | null;
  connected: boolean;
  lastUpdated: Date | null;
}

/**
 * Hook for managing real-time data subscriptions with automatic reconnection
 */
export const useRealtimeData = <T>(
  initialData: T,
  options: UseRealtimeDataOptions = {}
) => {
  const { user } = useAuth();
  const [state, setState] = useState<RealtimeDataState<T>>({
    data: initialData,
    loading: true,
    error: null,
    connected: false,
    lastUpdated: null
  });

  const subscriptionRef = useRef<RealtimeSubscription | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const {
    enabled = true,
    autoReconnect = true,
    maxReconnectAttempts = 5,
    reconnectDelay = 3000
  } = options;

  // Update data and state
  const updateData = useCallback((newData: T) => {
    setState(prev => ({
      ...prev,
      data: newData,
      loading: false,
      error: null,
      connected: true,
      lastUpdated: new Date()
    }));
    reconnectAttemptsRef.current = 0; // Reset reconnect attempts on successful update
  }, []);

  // Handle connection errors
  const handleError = useCallback((error: string) => {
    setState(prev => ({
      ...prev,
      error,
      connected: false,
      loading: false
    }));

    // Attempt reconnection if enabled
    if (autoReconnect && reconnectAttemptsRef.current < maxReconnectAttempts) {
      reconnectAttemptsRef.current++;
      
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }

      reconnectTimeoutRef.current = setTimeout(() => {
        console.log(`Tentative de reconnexion ${reconnectAttemptsRef.current}/${maxReconnectAttempts}`);
        // The subscription will be recreated by the useEffect
        setState(prev => ({ ...prev, loading: true }));
      }, reconnectDelay * reconnectAttemptsRef.current);
    }
  }, [autoReconnect, maxReconnectAttempts, reconnectDelay]);

  // Cleanup function
  const cleanup = useCallback(() => {
    if (subscriptionRef.current) {
      subscriptionRef.current.unsubscribe();
      subscriptionRef.current = null;
    }
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
  }, []);

  // Manual reconnection
  const reconnect = useCallback(() => {
    cleanup();
    reconnectAttemptsRef.current = 0;
    setState(prev => ({ ...prev, loading: true, error: null }));
  }, [cleanup]);

  // Force refresh data
  const refresh = useCallback(() => {
    reconnect();
  }, [reconnect]);

  // Cleanup on unmount
  useEffect(() => {
    return cleanup;
  }, [cleanup]);

  return {
    ...state,
    reconnect,
    refresh,
    updateData,
    handleError,
    isReconnecting: reconnectAttemptsRef.current > 0,
    reconnectAttempts: reconnectAttemptsRef.current,
    maxReconnectAttempts
  };
};

/**
 * Hook for user-specific real-time updates
 */
export const useUserRealtimeUpdates = (options: UseRealtimeDataOptions = {}) => {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [prescriptions, setPrescriptions] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [connected, setConnected] = useState(false);
  const [loading, setLoading] = useState(true);

  const subscriptionRef = useRef<RealtimeSubscription | null>(null);

  useEffect(() => {
    if (!user || !options.enabled) {
      setLoading(false);
      return;
    }

    setLoading(true);

    // Subscribe to user updates
    subscriptionRef.current = RealtimeService.subscribeToUserUpdates(
      user.id,
      user.role,
      {
        onAppointments: (data) => {
          setAppointments(data);
          setConnected(true);
          setLoading(false);
        },
        onMessages: (data) => {
          setMessages(data);
          setConnected(true);
        },
        onPrescriptions: (data) => {
          setPrescriptions(data);
          setConnected(true);
        },
        onNotifications: (data) => {
          setNotifications(data);
          setConnected(true);
        },
        onPayments: (data) => {
          setPayments(data);
          setConnected(true);
        }
      }
    );

    return () => {
      if (subscriptionRef.current) {
        subscriptionRef.current.unsubscribe();
      }
    };
  }, [user, options.enabled]);

  return {
    appointments,
    messages,
    prescriptions,
    notifications,
    payments,
    connected,
    loading,
    unreadMessagesCount: messages.reduce((sum, conv) => sum + (conv.unreadCounts?.[user?.id] || 0), 0),
    unreadNotificationsCount: notifications.filter(n => !n.read).length,
    pendingAppointmentsCount: appointments.filter(a => a.status === 'scheduled').length
  };
};

/**
 * Hook for conversation real-time updates
 */
export const useConversationMessages = (conversationId: string | null) => {
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [connected, setConnected] = useState(false);

  const subscriptionRef = useRef<RealtimeSubscription | null>(null);

  useEffect(() => {
    if (!conversationId) {
      setMessages([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    subscriptionRef.current = RealtimeService.subscribeToConversationMessages(
      conversationId,
      (data) => {
        setMessages(data);
        setConnected(true);
        setLoading(false);
      }
    );

    return () => {
      if (subscriptionRef.current) {
        subscriptionRef.current.unsubscribe();
      }
    };
  }, [conversationId]);

  return {
    messages,
    loading,
    connected
  };
};

/**
 * Hook for doctor schedule real-time updates
 */
export const useDoctorSchedule = (
  doctorId: string | null,
  dateRange: { start: Date; end: Date }
) => {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [connected, setConnected] = useState(false);

  const subscriptionRef = useRef<RealtimeSubscription | null>(null);

  useEffect(() => {
    if (!doctorId) {
      setAppointments([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    subscriptionRef.current = RealtimeService.subscribeToDoctorSchedule(
      doctorId,
      dateRange,
      (data) => {
        setAppointments(data);
        setConnected(true);
        setLoading(false);
      }
    );

    return () => {
      if (subscriptionRef.current) {
        subscriptionRef.current.unsubscribe();
      }
    };
  }, [doctorId, dateRange.start.getTime(), dateRange.end.getTime()]);

  return {
    appointments,
    loading,
    connected,
    todayAppointments: appointments.filter(apt => {
      const aptDate = new Date(apt.scheduledAt);
      const today = new Date();
      return aptDate.toDateString() === today.toDateString();
    }),
    upcomingAppointments: appointments.filter(apt => {
      const aptDate = new Date(apt.scheduledAt);
      return aptDate > new Date();
    })
  };
};

/**
 * Hook for patient treatment monitoring
 */
export const usePatientTreatments = (patientId: string | null) => {
  const [treatments, setTreatments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [connected, setConnected] = useState(false);

  const subscriptionRef = useRef<RealtimeSubscription | null>(null);

  useEffect(() => {
    if (!patientId) {
      setTreatments([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    subscriptionRef.current = RealtimeService.subscribeToPatientTreatments(
      patientId,
      (data) => {
        setTreatments(data);
        setConnected(true);
        setLoading(false);
      }
    );

    return () => {
      if (subscriptionRef.current) {
        subscriptionRef.current.unsubscribe();
      }
    };
  }, [patientId]);

  return {
    treatments,
    loading,
    connected,
    activeTreatments: treatments.filter(t => t.status === 'active'),
    expiringTreatments: treatments.filter(t => {
      if (t.status !== 'active') return false;
      const expiryDate = new Date(t.expiryDate);
      const nextWeek = new Date();
      nextWeek.setDate(nextWeek.getDate() + 7);
      return expiryDate <= nextWeek;
    })
  };
};

/**
 * Hook for system-wide updates (for medical staff)
 */
export const useSystemUpdates = (userRole: 'doctor' | 'secretary' | null) => {
  const [newPatients, setNewPatients] = useState<any[]>([]);
  const [urgentNotifications, setUrgentNotifications] = useState<any[]>([]);
  const [paymentAlerts, setPaymentAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [connected, setConnected] = useState(false);

  const subscriptionRef = useRef<RealtimeSubscription | null>(null);

  useEffect(() => {
    if (!userRole || !['doctor', 'secretary'].includes(userRole)) {
      setLoading(false);
      return;
    }

    setLoading(true);

    subscriptionRef.current = RealtimeService.subscribeToSystemUpdates(
      userRole,
      {
        onNewPatients: (data) => {
          setNewPatients(data);
          setConnected(true);
          setLoading(false);
        },
        onUrgentNotifications: (data) => {
          setUrgentNotifications(data);
          setConnected(true);
        },
        onPaymentAlerts: (data) => {
          setPaymentAlerts(data);
          setConnected(true);
        }
      }
    );

    return () => {
      if (subscriptionRef.current) {
        subscriptionRef.current.unsubscribe();
      }
    };
  }, [userRole]);

  return {
    newPatients,
    urgentNotifications,
    paymentAlerts,
    loading,
    connected,
    totalAlerts: urgentNotifications.length + paymentAlerts.length,
    hasUrgentAlerts: urgentNotifications.some(n => n.priority === 'urgent')
  };
};

/**
 * Hook for connection status monitoring
 */
export const useConnectionStatus = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [lastDisconnected, setLastDisconnected] = useState<Date | null>(null);
  const [reconnectAttempts, setReconnectAttempts] = useState(0);

  const subscriptionRef = useRef<RealtimeSubscription | null>(null);

  useEffect(() => {
    subscriptionRef.current = RealtimeService.subscribeToConnectionStatus((online) => {
      setIsOnline(online);
      
      if (!online) {
        setLastDisconnected(new Date());
      } else {
        setReconnectAttempts(0);
      }
    });

    return () => {
      if (subscriptionRef.current) {
        subscriptionRef.current.unsubscribe();
      }
    };
  }, []);

  const forceReconnect = useCallback(() => {
    setReconnectAttempts(prev => prev + 1);
    // Trigger a manual reconnection attempt
    window.dispatchEvent(new Event('online'));
  }, []);

  return {
    isOnline,
    lastDisconnected,
    reconnectAttempts,
    forceReconnect,
    connectionQuality: isOnline ? 'good' : 'poor' // Could be enhanced with actual connection quality metrics
  };
};