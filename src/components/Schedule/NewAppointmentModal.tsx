import React, { useState, useEffect } from 'react';
import { X, Calendar, Clock, User, Video, Phone, MessageSquare, Save, AlertCircle } from 'lucide-react';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { useAuth } from '../../contexts/AuthContext';
import { useSecretaryAppointments } from '../../hooks/useAppointments';

interface NewAppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAppointmentCreated: (appointment: any) => void;
  selectedDate?: Date;
  selectedTime?: string;
  preSelectedDoctorId?: string;
}

interface AppointmentFormData {
  doctorId: string;
  patientName: string;
  patientEmail: string;
  patientPhone: string;
  date: string;
  time: string;
  duration: number;
  type: 'video' | 'phone' | 'chat';
  reason: string;
  notes: string;
  fee: number;
}

export const NewAppointmentModal: React.FC<NewAppointmentModalProps> = ({
  isOpen,
  onClose,
  onAppointmentCreated,
  selectedDate,
  selectedTime,
  preSelectedDoctorId
}) => {
  const { user } = useAuth();
  const { createAppointment, doctors: availableDoctors } = useSecretaryAppointments();
  
  const [formData, setFormData] = useState<AppointmentFormData>({
    doctorId: preSelectedDoctorId || '',
    patientName: '',
    patientEmail: '',
    patientPhone: '',
    date: selectedDate ? selectedDate.toISOString().split('T')[0] : '',
    time: selectedTime || '',
    duration: 30,
    type: 'video',
    reason: '',
    notes: '',
    fee: 50
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  // Utiliser les médecins avec fallback
  const doctorsWithFallback = availableDoctors.length > 0 ? availableDoctors : [
    {
      id: 'doc1',
      firstName: 'Marie',
      lastName: 'Leblanc',
      specialty: 'Médecine générale',
      consultationFee: 50,
      verified: true,
      email: 'marie.leblanc@docteurs-oi.fr',
      phone: '+33123456789',
      availableSlots: [],
      workingHours: {}
    }
  ];

  // Mettre à jour le tarif quand le médecin change
  useEffect(() => {
    const selectedDoctor = doctorsWithFallback.find(doc => doc.id === formData.doctorId);
    if (selectedDoctor) {
      setFormData(prev => ({ ...prev, fee: selectedDoctor.consultationFee }));
    }
  }, [formData.doctorId, doctorsWithFallback]);

  const consultationTypes = [
    { id: 'video', label: 'Vidéo consultation', icon: Video, description: 'Consultation par vidéo' },
    { id: 'phone', label: 'Consultation Cabinet', icon: Phone, description: 'Consultation au cabinet' },
    { id: 'chat', label: 'Messagerie sécurisée', icon: MessageSquare, description: 'Consultation par messages' }
  ];

  const durations = [
    { value: 15, label: '15 minutes' },
    { value: 30, label: '30 minutes' },
    { value: 45, label: '45 minutes' },
    { value: 60, label: '1 heure' }
  ];

  const validateForm = (): boolean => {
    const newErrors: string[] = [];

    if (!formData.doctorId) newErrors.push('Le médecin est requis');
    if (!formData.patientName.trim()) newErrors.push('Le nom du patient est requis');
    if (!formData.patientEmail.trim()) newErrors.push('L\'email du patient est requis');
    if (!formData.patientPhone.trim()) newErrors.push('Le téléphone du patient est requis');
    if (!formData.date) newErrors.push('La date est requise');
    if (!formData.time) newErrors.push('L\'heure est requise');
    if (!formData.reason.trim()) newErrors.push('Le motif de consultation est requis');

    // Validation format email
    if (formData.patientEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.patientEmail)) {
      newErrors.push('Format d\'email invalide');
    }

    // Validation date (ne pas programmer dans le passé)
    if (formData.date && formData.time) {
      const appointmentDateTime = new Date(`${formData.date}T${formData.time}`);
      if (appointmentDateTime < new Date()) {
        newErrors.push('Impossible de programmer un rendez-vous dans le passé');
      }
    }

    setErrors(newErrors);
    return newErrors.length === 0;
  };

  const handleInputChange = (field: keyof AppointmentFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    setErrors([]);

    try {
      // Créer l'objet rendez-vous avec validation de paiement
      const appointmentData = {
        // Informations patient
        patientId: `patient-${Date.now()}`, // En production, récupérer l'ID réel
        patientName: formData.patientName.trim(),
        patientEmail: formData.patientEmail.trim().toLowerCase(),
        patientPhone: formData.patientPhone.trim(),
        doctorId: formData.doctorId,
        doctorName: doctorsWithFallback.find(doc => doc.id === formData.doctorId)?.firstName 
          ? `Dr. ${doctorsWithFallback.find(doc => doc.id === formData.doctorId)?.firstName} ${doctorsWithFallback.find(doc => doc.id === formData.doctorId)?.lastName}`
          : 'Dr. Docteur',
        
        // Informations rendez-vous
        scheduledAt: new Date(`${formData.date}T${formData.time}`).toISOString(),
        duration: formData.duration,
        type: formData.type,
        reason: formData.reason.trim(),
        notes: formData.notes.trim(),
        fee: formData.fee,
        status: 'scheduled' as const,
        
        // Statut et métadonnées
        createdBy: user?.id || 'current-user',
        createdByRole: user?.role || 'secretary',
      };

      // Utiliser le service Firebase
      const result = await createAppointment(appointmentData, user?.id || 'current-user');
      
      if (result.success) {
        console.log('✅ Rendez-vous créé:', result.appointmentId);
        
        const newAppointment = {
          id: result.appointmentId!,
          ...appointmentData
        };
        
        onAppointmentCreated(newAppointment);
        onClose();
        resetForm();
        
        showNotification(`✅ Rendez-vous avec ${formData.patientName} créé avec succès !`, 'success');
      } else {
        console.error('❌ Erreur création:', result.error);
        setErrors([result.error || 'Erreur lors de la création du rendez-vous']);
        showNotification('❌ Erreur lors de la création du rendez-vous', 'error');
      }

    } catch (error: any) {
      console.error('❌ Erreur création rendez-vous:', error);
      setErrors([error.message || 'Erreur lors de la création du rendez-vous']);
      showNotification('❌ Erreur lors de la création du rendez-vous', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      doctorId: preSelectedDoctorId || '',
      patientName: '',
      patientEmail: '',
      patientPhone: '',
      date: selectedDate ? selectedDate.toISOString().split('T')[0] : '',
      time: selectedTime || '',
      duration: 30,
      type: 'video',
      reason: '',
      notes: '',
      fee: 50
    });
    setErrors([]);
  };

  const showNotification = (message: string, type: 'success' | 'error') => {
    const notification = document.createElement('div');
    notification.className = `fixed top-4 right-4 p-4 rounded-lg text-white z-50 transition-all ${
      type === 'success' ? 'bg-green-500' : 'bg-red-500'
    }`;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
      if (document.body.contains(notification)) {
        document.body.removeChild(notification);
      }
    }, 4000);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[95vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-sky-500 rounded-lg flex items-center justify-center">
                <Calendar className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Nouveau créneau</h2>
                <p className="text-sm text-gray-600">Créer un nouveau rendez-vous patient</p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Erreurs */}
          {errors.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="text-sm font-medium text-red-800 mb-2">Erreurs de validation :</h3>
                  <ul className="text-sm text-red-700 space-y-1">
                    {errors.map((error, index) => (
                      <li key={index}>• {error}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Sélection du médecin */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Médecin *
            </label>
            <select
              value={formData.doctorId}
              onChange={(e) => setFormData(prev => ({ ...prev, doctorId: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
            >
              <option value="">Sélectionner un médecin</option>
              {doctorsWithFallback.map((doctor) => (
                <option key={doctor.id} value={doctor.id}>
                  Dr. {doctor.firstName} {doctor.lastName} - {doctor.specialty} ({doctor.consultationFee}€)
                </option>
              ))}
            </select>
          </div>

          {/* Informations patient */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <User className="h-5 w-5 mr-2 text-sky-500" />
              Informations patient
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nom complet *
                </label>
                <input
                  type="text"
                  value={formData.patientName}
                  onChange={(e) => handleInputChange('patientName', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                  placeholder="Jean Dupont"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  value={formData.patientEmail}
                  onChange={(e) => handleInputChange('patientEmail', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                  placeholder="jean.dupont@email.com"
                />
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Téléphone *
                </label>
                <input
                  type="tel"
                  value={formData.patientPhone}
                  onChange={(e) => handleInputChange('patientPhone', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                  placeholder="+33123456789"
                />
              </div>
            </div>
          </div>

          {/* Date et heure */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <Clock className="h-5 w-5 mr-2 text-emerald-500" />
              Planification
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date *
                </label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => handleInputChange('date', e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Heure *
                </label>
                <input
                  type="time"
                  value={formData.time}
                  onChange={(e) => handleInputChange('time', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Durée
                </label>
                <select
                  value={formData.duration}
                  onChange={(e) => handleInputChange('duration', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                >
                  {durations.map((duration) => (
                    <option key={duration.value} value={duration.value}>
                      {duration.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Type de consultation */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Type de consultation</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {consultationTypes.map((type) => {
                const Icon = type.icon;
                return (
                  <button
                    key={type.id}
                    type="button"
                    onClick={() => handleInputChange('type', type.id)}
                    className={`p-4 rounded-lg border-2 transition-all text-left ${
                      formData.type === type.id
                        ? 'border-sky-500 bg-sky-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <Icon className={`h-5 w-5 mb-2 ${
                      formData.type === type.id ? 'text-sky-500' : 'text-gray-400'
                    }`} />
                    <h4 className={`font-medium text-sm ${
                      formData.type === type.id ? 'text-sky-700' : 'text-gray-900'
                    }`}>
                      {type.label}
                    </h4>
                    <p className="text-xs text-gray-600 mt-1">{type.description}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Motif et notes */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Motif de consultation *
              </label>
              <input
                type="text"
                value={formData.reason}
                onChange={(e) => handleInputChange('reason', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                placeholder="Consultation de suivi, première consultation..."
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notes (optionnel)
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent resize-none"
                placeholder="Notes additionnelles pour la consultation..."
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tarif (€)
              </label>
              <input
                type="number"
                value={formData.fee}
                onChange={(e) => handleInputChange('fee', parseFloat(e.target.value) || 0)}
                min="0"
                step="0.01"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Récapitulatif */}
          {formData.patientName && formData.date && formData.time && (
            <div className="bg-sky-50 border border-sky-200 rounded-lg p-4">
              <h4 className="font-medium text-sky-900 mb-2">Récapitulatif du rendez-vous :</h4>
              <div className="text-sm text-sky-800 space-y-1">
                <p><strong>Patient :</strong> {formData.patientName}</p>
                <p><strong>Date :</strong> {new Date(formData.date).toLocaleDateString('fr-FR')} à {formData.time}</p>
                <p><strong>Durée :</strong> {formData.duration} minutes</p>
                <p><strong>Type :</strong> {consultationTypes.find(t => t.id === formData.type)?.label}</p>
                <p><strong>Tarif :</strong> {formData.fee}€</p>
              </div>
            </div>
          )}
        </form>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 flex justify-end space-x-3">
          <button
            onClick={handleClose}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Annuler
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="px-4 py-2 bg-sky-500 text-white rounded-lg hover:bg-sky-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Création...</span>
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                <span>Créer le rendez-vous</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};