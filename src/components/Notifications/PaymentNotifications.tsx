import React, { useState, useEffect } from 'react';
import { 
  Bell, 
  CreditCard, 
  CheckCircle, 
  AlertTriangle, 
  Clock, 
  X,
  Eye,
  Trash2
} from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface PaymentNotification {
  id: string;
  type: 'payment_link_sent' | 'payment_success' | 'payment_failed' | 'payment_expired' | 'payment_reminder';
  appointmentId: string;
  patientName: string;
  doctorName: string;
  amount: number;
  message: string;
  timestamp: string;
  read: boolean;
  urgent: boolean;
}

interface PaymentNotificationsProps {
  userRole: 'doctor' | 'secretary' | 'patient';
  userId: string;
}

export const PaymentNotifications: React.FC<PaymentNotificationsProps> = ({ 
  userRole, 
  userId 
}) => {
  const [notifications, setNotifications] = useState<PaymentNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const [loading, setLoading] = useState(false);

  // Données simulées de notifications de paiement
  const mockNotifications: PaymentNotification[] = [
    {
      id: '1',
      type: 'payment_success',
      appointmentId: 'apt-1',
      patientName: 'Jean Dupont',
      doctorName: 'Dr. Marie Leblanc',
      amount: 50,
      message: 'Paiement confirmé pour le rendez-vous de Jean Dupont (50€)',
      timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // 30 min ago
      read: false,
      urgent: false
    },
    {
      id: '2',
      type: 'payment_expired',
      appointmentId: 'apt-2',
      patientName: 'Marie Martin',
      doctorName: 'Dr. Pierre Martin',
      amount: 80,
      message: 'Paiement expiré - Rendez-vous de Marie Martin annulé automatiquement',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2h ago
      read: false,
      urgent: true
    },
    {
      id: '3',
      type: 'payment_link_sent',
      appointmentId: 'apt-3',
      patientName: 'Pierre Durand',
      doctorName: 'Dr. Sophie Durand',
      amount: 70,
      message: 'Lien de paiement envoyé à Pierre Durand pour confirmation du RDV',
      timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(), // 4h ago
      read: true,
      urgent: false
    }
  ];

  useEffect(() => {
    loadNotifications();
  }, [userId, userRole]);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      
      // En production, charger depuis Firebase
      // const notificationsData = await PaymentNotificationService.getUserNotifications(userId, userRole);
      
      // Simulation pour la démo
      await new Promise(resolve => setTimeout(resolve, 500));
      setNotifications(mockNotifications);
      
      const unread = mockNotifications.filter(n => !n.read).length;
      setUnreadCount(unread);
      
    } catch (error) {
      console.error('Erreur chargement notifications paiement:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      // En production, mettre à jour dans Firebase
      // await PaymentNotificationService.markAsRead(notificationId);
      
      setNotifications(prev => 
        prev.map(notification => 
          notification.id === notificationId 
            ? { ...notification, read: true }
            : notification
        )
      );
      
      setUnreadCount(prev => Math.max(0, prev - 1));
      
    } catch (error) {
      console.error('Erreur marquage notification lue:', error);
    }
  };

  const deleteNotification = async (notificationId: string) => {
    try {
      // En production, supprimer de Firebase
      // await PaymentNotificationService.deleteNotification(notificationId);
      
      const notification = notifications.find(n => n.id === notificationId);
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
      
      if (notification && !notification.read) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
      
    } catch (error) {
      console.error('Erreur suppression notification:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      // En production, mettre à jour toutes les notifications dans Firebase
      // await PaymentNotificationService.markAllAsRead(userId);
      
      setNotifications(prev => 
        prev.map(notification => ({ ...notification, read: true }))
      );
      setUnreadCount(0);
      
    } catch (error) {
      console.error('Erreur marquage toutes notifications lues:', error);
    }
  };

  const getNotificationIcon = (type: string) => {
    const icons = {
      payment_success: CheckCircle,
      payment_failed: AlertTriangle,
      payment_expired: Clock,
      payment_link_sent: CreditCard,
      payment_reminder: Bell
    };
    return icons[type as keyof typeof icons] || Bell;
  };

  const getNotificationColor = (type: string, urgent: boolean) => {
    if (urgent) return 'text-red-600 bg-red-100';
    
    const colors = {
      payment_success: 'text-green-600 bg-green-100',
      payment_failed: 'text-red-600 bg-red-100',
      payment_expired: 'text-amber-600 bg-amber-100',
      payment_link_sent: 'text-sky-600 bg-sky-100',
      payment_reminder: 'text-purple-600 bg-purple-100'
    };
    return colors[type as keyof typeof colors] || 'text-gray-600 bg-gray-100';
  };

  return (
    <div className="relative">
      {/* Notification Bell */}
      <button
        onClick={() => setShowNotifications(!showNotifications)}
        className="relative p-2 text-gray-600 hover:text-gray-900 transition-colors"
      >
        <Bell className="h-6 w-6" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notifications Dropdown */}
      {showNotifications && (
        <div className="absolute right-0 top-full mt-2 w-96 bg-white border border-gray-200 rounded-xl shadow-lg z-50 max-h-96 overflow-hidden">
          {/* Header */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-gray-900">
                Notifications de paiement ({notifications.length})
              </h3>
              <div className="flex items-center space-x-2">
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="text-sm text-sky-600 hover:text-sky-700 font-medium"
                  >
                    Tout marquer lu
                  </button>
                )}
                <button
                  onClick={() => setShowNotifications(false)}
                  className="p-1 text-gray-400 hover:text-gray-600"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Notifications List */}
          <div className="max-h-80 overflow-y-auto">
            {loading ? (
              <div className="p-8 text-center">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-sky-500 mx-auto mb-2"></div>
                <p className="text-sm text-gray-600">Chargement...</p>
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-8 text-center">
                <Bell className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600">Aucune notification de paiement</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {notifications.map((notification) => {
                  const Icon = getNotificationIcon(notification.type);
                  const colorClass = getNotificationColor(notification.type, notification.urgent);
                  
                  return (
                    <div
                      key={notification.id}
                      className={`p-4 hover:bg-gray-50 transition-colors ${
                        !notification.read ? 'bg-blue-50' : ''
                      }`}
                    >
                      <div className="flex items-start space-x-3">
                        <div className={`p-2 rounded-lg ${colorClass}`}>
                          <Icon className="h-4 w-4" />
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <p className={`text-sm ${!notification.read ? 'font-semibold' : 'font-medium'} text-gray-900`}>
                                {notification.message}
                              </p>
                              <div className="flex items-center space-x-2 text-xs text-gray-500 mt-1">
                                <span>{format(new Date(notification.timestamp), 'dd/MM à HH:mm', { locale: fr })}</span>
                                <span>•</span>
                                <span>{notification.amount}€</span>
                                {notification.urgent && (
                                  <>
                                    <span>•</span>
                                    <span className="text-red-600 font-medium">Urgent</span>
                                  </>
                                )}
                              </div>
                            </div>
                            
                            <div className="flex items-center space-x-1 ml-2">
                              {!notification.read && (
                                <button
                                  onClick={() => markAsRead(notification.id)}
                                  className="p-1 text-gray-400 hover:text-gray-600"
                                  title="Marquer comme lu"
                                >
                                  <Eye className="h-3 w-3" />
                                </button>
                              )}
                              <button
                                onClick={() => deleteNotification(notification.id)}
                                className="p-1 text-gray-400 hover:text-red-600"
                                title="Supprimer"
                              >
                                <Trash2 className="h-3 w-3" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="p-3 border-t border-gray-200 text-center">
              <button
                onClick={() => {
                  setShowNotifications(false);
                  // En production, naviguer vers la page complète des notifications
                  console.log('Ouvrir toutes les notifications de paiement');
                }}
                className="text-sm text-sky-600 hover:text-sky-700 font-medium"
              >
                Voir toutes les notifications
              </button>
            </div>
          )}
        </div>
      )}

      {/* Overlay */}
      {showNotifications && (
        <div 
          className="fixed inset-0 z-40"
          onClick={() => setShowNotifications(false)}
        />
      )}
    </div>
  );
};