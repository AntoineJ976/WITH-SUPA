import React, { useState } from 'react';
import { 
  X, 
  Calendar, 
  Clock, 
  FileText, 
  Save, 
  Plus, 
  Trash2,
  AlertCircle,
  User,
  Activity,
  Pill,
  CheckCircle,
  Video,
  Phone,
  Users
} from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  medicalRecordNumber: string;
}

interface Treatment {
  id: string;
  consultationId: string;
  medication: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions: string;
  startDate: string;
  endDate: string;
  status: 'active' | 'completed' | 'discontinued';
  sideEffects?: string;
  effectiveness?: 'excellent' | 'good' | 'fair' | 'poor';
  notes?: string;
}

interface Consultation {
  id: string;
  patientId: string;
  doctorId: string;
  doctorName: string;
  date: string;
  type: 'video' | 'phone' | 'in-person';
  duration: number;
  symptoms: string;
  diagnosis: string;
  recommendations: string;
  notes: string;
  status: 'scheduled' | 'completed' | 'cancelled';
  treatments: Treatment[];
  attachments: string[];
  followUpRequired: boolean;
  followUpDate?: string;
  createdAt: string;
  updatedAt: string;
}

interface ConsultationReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  patient: Patient;
  onConsultationCreated: (consultation: Consultation) => void;
}

interface ConsultationForm {
  date: string;
  time: string;
  type: 'video' | 'phone' | 'in-person';
  duration: number;
  symptoms: string;
  diagnosis: string;
  recommendations: string;
  notes: string;
  followUpRequired: boolean;
  followUpDate: string;
  followUpTime: string;
}

interface TreatmentForm {
  medication: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions: string;
}

export const ConsultationReportModal: React.FC<ConsultationReportModalProps> = ({
  isOpen,
  onClose,
  patient,
  onConsultationCreated
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [consultationForm, setConsultationForm] = useState<ConsultationForm>({
    date: new Date().toISOString().split('T')[0],
    time: new Date().toTimeString().slice(0, 5),
    type: 'video',
    duration: 30,
    symptoms: '',
    diagnosis: '',
    recommendations: '',
    notes: '',
    followUpRequired: false,
    followUpDate: '',
    followUpTime: ''
  });
  
  const [treatments, setTreatments] = useState<TreatmentForm[]>([]);
  const [currentTreatment, setCurrentTreatment] = useState<TreatmentForm>({
    medication: '',
    dosage: '',
    frequency: '',
    duration: '',
    instructions: ''
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  const steps = [
    { id: 1, title: 'Informations consultation', icon: Calendar },
    { id: 2, title: 'Rapport médical', icon: FileText },
    { id: 3, title: 'Traitements', icon: Pill },
    { id: 4, title: 'Suivi', icon: CheckCircle }
  ];

  const consultationTypes = [
    { id: 'video', label: 'Vidéo consultation', description: 'Consultation par vidéo', icon: Video },
    { id: 'phone', label: 'Consultation Cabinet', description: 'Consultation au cabinet', icon: Phone },
    { id: 'in-person', label: 'Consultation physique', description: 'Consultation en présentiel', icon: Users }
  ];

  const durations = [
    { value: 15, label: '15 minutes' },
    { value: 30, label: '30 minutes' },
    { value: 45, label: '45 minutes' },
    { value: 60, label: '1 heure' },
    { value: 90, label: '1h30' }
  ];

  const frequencies = [
    '1 fois par jour',
    '2 fois par jour',
    '3 fois par jour',
    '4 fois par jour',
    'Selon besoin',
    'Matin',
    'Soir',
    'Matin et soir',
    'Avant les repas',
    'Après les repas'
  ];

  const durations_treatment = [
    '3 jours',
    '5 jours',
    '7 jours',
    '10 jours',
    '14 jours',
    '21 jours',
    '1 mois',
    '2 mois',
    '3 mois',
    '6 mois',
    '1 an'
  ];

  // Common medications for quick selection
  const commonMedications = [
    'Paracétamol 1000mg',
    'Ibuprofène 400mg',
    'Amoxicilline 500mg',
    'Doliprane 1000mg',
    'Aspirine 500mg',
    'Oméprazole 20mg',
    'Ventoline 100µg',
    'Lisinopril 10mg',
    'Atorvastatine 20mg',
    'Metformine 500mg'
  ];

  // Validation functions
  const validateStep = (step: number): boolean => {
    const newErrors: string[] = [];

    switch (step) {
      case 1:
        if (!consultationForm.date) newErrors.push('La date est requise');
        if (!consultationForm.time) newErrors.push('L\'heure est requise');
        if (!consultationForm.type) newErrors.push('Le type de consultation est requis');
        if (consultationForm.duration < 15) newErrors.push('La durée minimum est de 15 minutes');
        break;
      case 2:
        if (!consultationForm.symptoms.trim()) newErrors.push('Les symptômes sont requis');
        if (!consultationForm.diagnosis.trim()) newErrors.push('Le diagnostic est requis');
        if (!consultationForm.recommendations.trim()) newErrors.push('Les recommandations sont requises');
        break;
      case 3:
        // Treatments are optional, but if added, they must be complete
        if (currentTreatment.medication && (!currentTreatment.dosage || !currentTreatment.frequency || !currentTreatment.duration)) {
          newErrors.push('Veuillez compléter le traitement en cours ou le supprimer');
        }
        break;
      case 4:
        if (consultationForm.followUpRequired && !consultationForm.followUpDate) {
          newErrors.push('La date de suivi est requise');
        }
        if (consultationForm.followUpRequired && consultationForm.followUpDate) {
          const followUpDateTime = new Date(`${consultationForm.followUpDate}T${consultationForm.followUpTime || '09:00'}`);
          const consultationDateTime = new Date(`${consultationForm.date}T${consultationForm.time}`);
          if (followUpDateTime <= consultationDateTime) {
            newErrors.push('La date de suivi doit être postérieure à la consultation');
          }
        }
        break;
    }

    setErrors(newErrors);
    return newErrors.length === 0;
  };

  // Handle form changes
  const handleConsultationFormChange = (field: keyof ConsultationForm, value: any) => {
    setConsultationForm(prev => ({ ...prev, [field]: value }));
  };

  const handleTreatmentFormChange = (field: keyof TreatmentForm, value: string) => {
    setCurrentTreatment(prev => ({ ...prev, [field]: value }));
  };

  // Add treatment to list
  const handleAddTreatment = () => {
    if (currentTreatment.medication && currentTreatment.dosage && currentTreatment.frequency && currentTreatment.duration) {
      setTreatments(prev => [...prev, currentTreatment]);
      setCurrentTreatment({
        medication: '',
        dosage: '',
        frequency: '',
        duration: '',
        instructions: ''
      });
    }
  };

  // Remove treatment from list
  const handleRemoveTreatment = (index: number) => {
    setTreatments(prev => prev.filter((_, i) => i !== index));
  };

  // Quick add medication
  const handleQuickAddMedication = (medication: string) => {
    setCurrentTreatment(prev => ({ ...prev, medication }));
  };

  // Navigation functions
  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 4));
    }
  };

  const handlePrevious = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  // Submit consultation
  const handleSubmit = async () => {
    if (!validateStep(4)) return;

    setIsSubmitting(true);
    setErrors([]);

    try {
      // Create consultation object
      const consultationDateTime = new Date(`${consultationForm.date}T${consultationForm.time}`);
      
      // Create treatments with proper dates
      const consultationTreatments: Treatment[] = treatments.map((treatment, index) => {
        const startDate = consultationDateTime.toISOString();
        const endDate = new Date(consultationDateTime);
        
        // Calculate end date based on duration
        const durationMatch = treatment.duration.match(/(\d+)\s*(jour|mois|an)/);
        if (durationMatch) {
          const [, amount, unit] = durationMatch;
          const durationAmount = parseInt(amount);
          
          switch (unit) {
            case 'jour':
              endDate.setDate(endDate.getDate() + durationAmount);
              break;
            case 'mois':
              endDate.setMonth(endDate.getMonth() + durationAmount);
              break;
            case 'an':
              endDate.setFullYear(endDate.getFullYear() + durationAmount);
              break;
          }
        } else {
          // Default to 7 days if duration format is not recognized
          endDate.setDate(endDate.getDate() + 7);
        }

        return {
          id: `treatment-${Date.now()}-${index}`,
          consultationId: `consultation-${Date.now()}`,
          medication: treatment.medication,
          dosage: treatment.dosage,
          frequency: treatment.frequency,
          duration: treatment.duration,
          instructions: treatment.instructions,
          startDate,
          endDate: endDate.toISOString(),
          status: 'active' as const
        };
      });

      const newConsultation: Consultation = {
        id: `consultation-${Date.now()}`,
        patientId: patient.id,
        doctorId: 'current-doctor-id',
        doctorName: 'Dr. Marie Leblanc', // En production, récupérer depuis l'utilisateur connecté
        date: consultationDateTime.toISOString(),
        type: consultationForm.type,
        duration: consultationForm.duration,
        symptoms: consultationForm.symptoms.trim(),
        diagnosis: consultationForm.diagnosis.trim(),
        recommendations: consultationForm.recommendations.trim(),
        notes: consultationForm.notes.trim(),
        status: 'completed',
        treatments: consultationTreatments,
        attachments: [],
        followUpRequired: consultationForm.followUpRequired,
        followUpDate: consultationForm.followUpRequired && consultationForm.followUpDate 
          ? new Date(`${consultationForm.followUpDate}T${consultationForm.followUpTime || '09:00'}`).toISOString()
          : undefined,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));

      onConsultationCreated(newConsultation);
      onClose();
      resetForm();

      // Show success notification
      const notification = document.createElement('div');
      notification.className = 'fixed top-4 right-4 bg-green-500 text-white p-4 rounded-lg z-50 transition-all';
      notification.textContent = `✅ Consultation créée avec succès pour ${patient.firstName} ${patient.lastName}`;
      document.body.appendChild(notification);
      
      setTimeout(() => {
        if (document.body.contains(notification)) {
          document.body.removeChild(notification);
        }
      }, 4000);

    } catch (error: any) {
      console.error('Erreur création consultation:', error);
      setErrors([error.message || 'Erreur lors de la création de la consultation']);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Reset form
  const resetForm = () => {
    setConsultationForm({
      date: new Date().toISOString().split('T')[0],
      time: new Date().toTimeString().slice(0, 5),
      type: 'video',
      duration: 30,
      symptoms: '',
      diagnosis: '',
      recommendations: '',
      notes: '',
      followUpRequired: false,
      followUpDate: '',
      followUpTime: ''
    });
    setTreatments([]);
    setCurrentTreatment({
      medication: '',
      dosage: '',
      frequency: '',
      duration: '',
      instructions: ''
    });
    setCurrentStep(1);
    setErrors([]);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-5xl w-full max-h-[95vh] overflow-hidden mx-2">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-sky-500 rounded-lg flex items-center justify-center">
                <FileText className="h-6 w-6 text-white" />
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="text-lg sm:text-xl font-semibold text-gray-900 truncate">Nouveau rapport</h2>
                <p className="text-xs sm:text-sm text-gray-600 truncate">
                  {patient.firstName} {patient.lastName} • N°: {patient.medicalRecordNumber}
                </p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors rounded-lg hover:bg-gray-100"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Progress Steps */}
        <div className="px-2 sm:px-6 py-4 border-b border-gray-200 bg-gray-50 overflow-x-auto">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isActive = currentStep === step.id;
              const isCompleted = currentStep > step.id;
              
              return (
                <div key={step.id} className="flex items-center">
                  <div className={`flex items-center space-x-2 ${
                    index < steps.length - 1 ? 'flex-1' : ''
                  }`}>
                    <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-colors ${
                      isCompleted ? 'bg-green-500 text-white' :
                      isActive ? 'bg-sky-500 text-white' :
                      'bg-gray-200 text-gray-500'
                    }`}>
                      {isCompleted ? '✓' : <Icon className="h-4 w-4 sm:h-5 sm:w-5" />}
                    </div>
                    <span className={`text-xs sm:text-sm font-medium hidden lg:inline ${
                      isActive ? 'text-sky-600' : 
                      isCompleted ? 'text-green-600' : 'text-gray-500'
                    }`}>
                      {step.title}
                    </span>
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`flex-1 h-px mx-4 ${
                      isCompleted ? 'bg-green-500' : 'bg-gray-200'
                    }`} />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Form Content */}
        <div className="p-4 sm:p-6 overflow-y-auto max-h-[60vh]">
          {errors.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
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

          {/* Step 1: Consultation Information */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Informations de la consultation</h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date de consultation *
                  </label>
                  <input
                    type="date"
                    value={consultationForm.date}
                    onChange={(e) => handleConsultationFormChange('date', e.target.value)}
                    max={new Date().toISOString().split('T')[0]}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Heure de consultation *
                  </label>
                  <input
                    type="time"
                    value={consultationForm.time}
                    onChange={(e) => handleConsultationFormChange('time', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                  />
                </div>
                
                <div className="sm:col-span-2 lg:col-span-1">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Durée de consultation
                  </label>
                  <select
                    value={consultationForm.duration}
                    onChange={(e) => handleConsultationFormChange('duration', parseInt(e.target.value))}
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

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Type de consultation *
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {consultationTypes.map((type) => {
                    const Icon = type.icon;
                    return (
                      <button
                        key={type.id}
                        type="button"
                        onClick={() => handleConsultationFormChange('type', type.id)}
                        className={`p-4 rounded-lg border-2 transition-all text-left ${
                          consultationForm.type === type.id
                            ? 'border-sky-500 bg-sky-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <Icon className={`h-6 w-6 mb-2 ${
                          consultationForm.type === type.id ? 'text-sky-500' : 'text-gray-400'
                        }`} />
                        <h4 className={`font-medium text-xs sm:text-sm ${
                          consultationForm.type === type.id ? 'text-sky-700' : 'text-gray-900'
                        }`}>
                          {type.label}
                        </h4>
                        <p className="text-xs text-gray-600 mt-1 hidden sm:block">{type.description}</p>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Medical Report */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Rapport médical détaillé</h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Symptômes observés *
                </label>
                <textarea
                  value={consultationForm.symptoms}
                  onChange={(e) => handleConsultationFormChange('symptoms', e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent resize-none"
                  placeholder="Décrivez en détail les symptômes présentés par le patient (durée, intensité, facteurs déclenchants, etc.)..."
                />
                <p className="text-xs text-gray-500 mt-1">
                  Soyez précis dans la description des symptômes pour un suivi optimal
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Diagnostic médical *
                </label>
                <textarea
                  value={consultationForm.diagnosis}
                  onChange={(e) => handleConsultationFormChange('diagnosis', e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent resize-none"
                  placeholder="Diagnostic médical établi suite à l'examen du patient..."
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Recommandations et conseils *
                </label>
                <textarea
                  value={consultationForm.recommendations}
                  onChange={(e) => handleConsultationFormChange('recommendations', e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent resize-none"
                  placeholder="Recommandations pour le patient (repos, activités à éviter, conseils d'hygiène de vie, etc.)..."
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notes complémentaires
                </label>
                <textarea
                  value={consultationForm.notes}
                  onChange={(e) => handleConsultationFormChange('notes', e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent resize-none"
                  placeholder="Notes additionnelles, observations particulières, éléments à surveiller..."
                />
              </div>
            </div>
          )}

          {/* Step 3: Treatments */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Traitements prescrits</h3>
              
              {/* Current Treatments List */}
              {treatments.length > 0 && (
                <div className="space-y-3 mb-6">
                  <h4 className="font-medium text-gray-900">Traitements ajoutés ({treatments.length})</h4>
                  {treatments.map((treatment, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4 bg-green-50">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h5 className="font-medium text-gray-900">{treatment.medication}</h5>
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-sm text-gray-600 mt-1">
                            <span><strong>Dosage:</strong> {treatment.dosage}</span>
                            <span><strong>Fréquence:</strong> {treatment.frequency}</span>
                            <span><strong>Durée:</strong> {treatment.duration}</span>
                          </div>
                          {treatment.instructions && (
                            <p className="text-sm text-gray-600 mt-1">
                              <strong>Instructions:</strong> {treatment.instructions}
                            </p>
                          )}
                        </div>
                        <button
                          onClick={() => handleRemoveTreatment(index)}
                          className="ml-4 p-2 text-red-500 hover:text-red-700 transition-colors rounded-lg hover:bg-red-100"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Add New Treatment Form */}
              <div className="border border-gray-200 rounded-lg p-6 bg-gray-50">
                <h4 className="font-medium text-gray-900 mb-4">Ajouter un traitement</h4>
                
                {/* Quick medication selection */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Médicaments courants (clic rapide)
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {commonMedications.map((med) => (
                      <button
                        key={med}
                        type="button"
                        onClick={() => handleQuickAddMedication(med)}
                        className="px-3 py-1 bg-white border border-gray-300 rounded-full text-sm text-gray-700 hover:bg-sky-50 hover:border-sky-300 transition-colors"
                      >
                        {med}
                      </button>
                    ))}
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Médicament
                    </label>
                    <input
                      type="text"
                      value={currentTreatment.medication}
                      onChange={(e) => handleTreatmentFormChange('medication', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                      placeholder="Ex: Amoxicilline 500mg"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Dosage
                    </label>
                    <input
                      type="text"
                      value={currentTreatment.dosage}
                      onChange={(e) => handleTreatmentFormChange('dosage', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                      placeholder="Ex: 1 comprimé, 2 gélules"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Fréquence
                    </label>
                    <select
                      value={currentTreatment.frequency}
                      onChange={(e) => handleTreatmentFormChange('frequency', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                    >
                      <option value="">Sélectionner la fréquence</option>
                      {frequencies.map((freq) => (
                        <option key={freq} value={freq}>{freq}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Durée du traitement
                    </label>
                    <select
                      value={currentTreatment.duration}
                      onChange={(e) => handleTreatmentFormChange('duration', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                    >
                      <option value="">Sélectionner la durée</option>
                      {durations_treatment.map((duration) => (
                        <option key={duration} value={duration}>{duration}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Instructions particulières
                    </label>
                    <input
                      type="text"
                      value={currentTreatment.instructions}
                      onChange={(e) => handleTreatmentFormChange('instructions', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                      placeholder="Ex: À prendre au moment des repas, avec un grand verre d'eau"
                    />
                  </div>
                </div>

                <div className="mt-4 flex justify-end">
                  <button
                    onClick={handleAddTreatment}
                    disabled={!currentTreatment.medication || !currentTreatment.dosage || !currentTreatment.frequency || !currentTreatment.duration}
                    className="bg-emerald-500 text-white px-4 py-2 rounded-lg hover:bg-emerald-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Ajouter le traitement</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Follow-up */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Planification du suivi médical</h3>
              
              <div className="space-y-4">
                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={consultationForm.followUpRequired}
                    onChange={(e) => handleConsultationFormChange('followUpRequired', e.target.checked)}
                    className="rounded border-gray-300 text-sky-600 focus:ring-sky-500"
                  />
                  <span className="text-sm font-medium text-gray-700">
                    Un suivi médical est nécessaire pour ce patient
                  </span>
                </label>

                {consultationForm.followUpRequired && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 ml-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Date de suivi *
                      </label>
                      <input
                        type="date"
                        value={consultationForm.followUpDate}
                        onChange={(e) => handleConsultationFormChange('followUpDate', e.target.value)}
                        min={new Date().toISOString().split('T')[0]}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Heure de suivi
                      </label>
                      <input
                        type="time"
                        value={consultationForm.followUpTime}
                        onChange={(e) => handleConsultationFormChange('followUpTime', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Summary */}
              <div className="bg-sky-50 border border-sky-200 rounded-lg p-6">
                <h4 className="font-medium text-sky-900 mb-4">Récapitulatif de la consultation</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-sky-800">Patient:</span>
                    <span className="ml-2 text-sky-700">{patient.firstName} {patient.lastName}</span>
                  </div>
                  <div>
                    <span className="font-medium text-sky-800">Date:</span>
                    <span className="ml-2 text-sky-700">
                      {format(new Date(`${consultationForm.date}T${consultationForm.time}`), 'dd/MM/yyyy à HH:mm', { locale: fr })}
                    </span>
                  </div>
                  <div>
                    <span className="font-medium text-sky-800">Type:</span>
                    <span className="ml-2 text-sky-700">
                      {consultationTypes.find(t => t.id === consultationForm.type)?.label}
                    </span>
                  </div>
                  <div>
                    <span className="font-medium text-sky-800">Durée:</span>
                    <span className="ml-2 text-sky-700">{consultationForm.duration} minutes</span>
                  </div>
                  <div className="sm:col-span-2">
                    <span className="font-medium text-sky-800">Diagnostic:</span>
                    <span className="ml-2 text-sky-700">{consultationForm.diagnosis}</span>
                  </div>
                  <div className="sm:col-span-2">
                    <span className="font-medium text-sky-800">Traitements:</span>
                    <span className="ml-2 text-sky-700">
                      {treatments.length > 0 
                        ? `${treatments.length} traitement${treatments.length > 1 ? 's' : ''} prescrit${treatments.length > 1 ? 's' : ''}`
                        : 'Aucun traitement prescrit'
                      }
                    </span>
                  </div>
                  {consultationForm.followUpRequired && (
                    <div className="sm:col-span-2">
                      <span className="font-medium text-sky-800">Suivi:</span>
                      <span className="ml-2 text-sky-700">
                        Prévu le {format(new Date(`${consultationForm.followUpDate}T${consultationForm.followUpTime || '09:00'}`), 'dd/MM/yyyy à HH:mm', { locale: fr })}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-6 border-t border-gray-200 flex flex-col sm:flex-row justify-between gap-3 bg-gray-50">
          <div className="flex space-x-3 order-2 sm:order-1">
            {currentStep > 1 && (
              <button
                onClick={handlePrevious}
                className="flex-1 sm:flex-none px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Précédent
              </button>
            )}
          </div>
          
          <div className="flex space-x-3 order-1 sm:order-2">
            <button
              onClick={handleClose}
              className="flex-1 sm:flex-none px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Annuler
            </button>
            
            {currentStep < 4 ? (
              <button
                onClick={handleNext}
                className="flex-1 sm:flex-none px-4 py-2 bg-sky-500 text-white rounded-lg hover:bg-sky-600 transition-colors"
              >
                Suivant
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="flex-1 sm:flex-none px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span className="hidden sm:inline">Création en cours...</span>
                    <span className="sm:hidden">Création...</span>
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    <span className="hidden sm:inline">Créer la consultation</span>
                    <span className="sm:hidden">Créer</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};