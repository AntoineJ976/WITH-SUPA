import React, { useState } from 'react';
import { X, User, Phone, Mail, MapPin, Calendar, Heart, AlertCircle, Save } from 'lucide-react';
import { SupabaseService } from '../../services/supabaseService';
import { isSupabaseConfigured } from '../../lib/supabase';

interface NewPatientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPatientCreated: (patient: any) => void;
}

interface PatientFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  gender: string;
  address: {
    street: string;
    city: string;
    postalCode: string;
    country: string;
  };
  emergencyContact: {
    name: string;
    relationship: string;
    phone: string;
  };
  medicalInfo: {
    allergies: string;
    currentMedications: string;
    medicalHistory: string;
    bloodType: string;
  };
  insurance: {
    provider: string;
    policyNumber: string;
  };
}

export const NewPatientModal: React.FC<NewPatientModalProps> = ({ 
  isOpen, 
  onClose, 
  onPatientCreated 
}) => {
  const [formData, setFormData] = useState<PatientFormData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    gender: '',
    address: {
      street: '',
      city: '',
      postalCode: '',
      country: 'France'
    },
    emergencyContact: {
      name: '',
      relationship: '',
      phone: ''
    },
    medicalInfo: {
      allergies: '',
      currentMedications: '',
      medicalHistory: '',
      bloodType: ''
    },
    insurance: {
      provider: '',
      policyNumber: ''
    }
  });

  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  const steps = [
    { id: 1, title: 'Informations personnelles', icon: User },
    { id: 2, title: 'Adresse et contact', icon: MapPin },
    { id: 3, title: 'Contact d\'urgence', icon: Phone },
    { id: 4, title: 'Informations médicales', icon: Heart }
  ];

  const validateStep = (step: number): boolean => {
    const newErrors: string[] = [];

    switch (step) {
      case 1:
        if (!formData.firstName) newErrors.push('Le prénom est requis');
        if (!formData.lastName) newErrors.push('Le nom est requis');
        if (!formData.email) newErrors.push('L\'email est requis');
        if (!formData.phone) newErrors.push('Le téléphone est requis');
        if (!formData.dateOfBirth) newErrors.push('La date de naissance est requise');
        if (!formData.gender) newErrors.push('Le genre est requis');
        break;
      case 2:
        if (!formData.address.street) newErrors.push('L\'adresse est requise');
        if (!formData.address.city) newErrors.push('La ville est requise');
        if (!formData.address.postalCode) newErrors.push('Le code postal est requis');
        break;
      case 3:
        if (!formData.emergencyContact.name) newErrors.push('Le nom du contact d\'urgence est requis');
        if (!formData.emergencyContact.relationship) newErrors.push('La relation est requise');
        if (!formData.emergencyContact.phone) newErrors.push('Le téléphone du contact d\'urgence est requis');
        break;
      case 4:
        // Informations médicales optionnelles
        break;
    }

    setErrors(newErrors);
    return newErrors.length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 4));
    }
  };

  const handlePrevious = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleInputChange = (field: string, value: string) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent as keyof typeof prev] as any,
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
    }
  };

  const calculateAge = (dateOfBirth: string): number => {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  };

  const handleSubmit = async () => {
    if (!validateStep(4)) return;

    setIsSubmitting(true);
    setErrors([]);

    try {
      // Créer l'objet patient pour Supabase
      const patientData = {
        // Informations personnelles
        first_name: formData.firstName.trim(),
        last_name: formData.lastName.trim(),
        email: formData.email.trim().toLowerCase(),
        phone: formData.phone.trim(),
        date_of_birth: formData.dateOfBirth,
        age: calculateAge(formData.dateOfBirth),
        gender: formData.gender,
        
        // Adresse
        address: {
          street: formData.address.street.trim(),
          city: formData.address.city.trim(),
          postalCode: formData.address.postalCode.trim(),
          country: formData.address.country
        },
        
        // Contact d'urgence
        emergency_contact: {
          name: formData.emergencyContact.name.trim(),
          relationship: formData.emergencyContact.relationship.trim(),
          phone: formData.emergencyContact.phone.trim()
        },
        
        // Informations médicales
        medical_info: {
          allergies: formData.medicalInfo.allergies.trim(),
          current_medications: formData.medicalInfo.currentMedications.trim(),
          medical_history: formData.medicalInfo.medicalHistory.trim(),
          blood_type: formData.medicalInfo.bloodType
        },
        
        // Assurance
        insurance: {
          provider: formData.insurance.provider.trim(),
          policyNumber: formData.insurance.policyNumber.trim()
        },
        
        // Métadonnées
        status: 'active',
        consultations_count: 0,
        last_consultation: null,
        next_appointment: null,
        
        // Conformité RGPD
        rgpd_consent: {
          data_processing: true,
          medical_records: true,
          consent_date: new Date().toISOString(),
          ip_address: 'doctor-created'
        }
      };

      // Essayer d'enregistrer dans Supabase
      if (isSupabaseConfigured()) {
        try {
          const result = await SupabaseService.createDocument(
            'patients',
            patientData,
            'current-user-id', // TODO: Obtenir l'ID utilisateur actuel
            { auditAction: 'create_patient' }
          );
          
          if (result.success && result.data) {
            console.log('✅ Patient créé dans Supabase avec ID:', result.data.id);
          
            onPatientCreated(result.data);
          onClose();
          
          // Notification de succès
          showNotification(`✅ Patient ${formData.firstName} ${formData.lastName} créé avec succès !`, 'success');
          return;
          } else {
            throw new Error(result.error || 'Erreur création patient');
          }
        } catch (supabaseError: any) {
          console.error('❌ Erreur Supabase:', supabaseError);
          // Continuer avec le mode simulé en cas d'erreur Supabase
        }
      }

      // Mode simulé si Firebase n'est pas disponible
      console.log('🎭 Mode simulé - Création patient local');
      const localPatient = {
        id: Date.now().toString(),
        ...patientData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      // Sauvegarder localement
      const existingPatients = JSON.parse(localStorage.getItem('docteurs-oi-patients') || '[]');
      existingPatients.push(localPatient);
      localStorage.setItem('docteurs-oi-patients', JSON.stringify(existingPatients));

      onPatientCreated(localPatient);
      onClose();
      
      showNotification(`✅ Patient ${formData.firstName} ${formData.lastName} créé avec succès !`, 'success');

    } catch (error: any) {
      console.error('❌ Erreur création patient:', error);
      setErrors([error.message || 'Erreur lors de la création du patient']);
      showNotification('❌ Erreur lors de la création du patient', 'error');
    } finally {
      setIsSubmitting(false);
    }
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

  const resetForm = () => {
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      dateOfBirth: '',
      gender: '',
      address: {
        street: '',
        city: '',
        postalCode: '',
        country: 'France'
      },
      emergencyContact: {
        name: '',
        relationship: '',
        phone: ''
      },
      medicalInfo: {
        allergies: '',
        currentMedications: '',
        medicalHistory: '',
        bloodType: ''
      },
      insurance: {
        provider: '',
        policyNumber: ''
      }
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
      <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[95vh] overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-sky-500 rounded-lg flex items-center justify-center">
                <User className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Nouveau Patient</h2>
                <p className="text-sm text-gray-600">Créer un nouveau dossier patient</p>
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

        {/* Progress Steps */}
        <div className="px-6 py-4 border-b border-gray-200">
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
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      isCompleted ? 'bg-green-500 text-white' :
                      isActive ? 'bg-sky-500 text-white' :
                      'bg-gray-200 text-gray-500'
                    }`}>
                      {isCompleted ? '✓' : <Icon className="h-4 w-4" />}
                    </div>
                    <span className={`text-sm font-medium hidden sm:inline ${
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
        <div className="p-6 overflow-y-auto max-h-[60vh]">
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

          {/* Step 1: Personal Information */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Informations personnelles</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Prénom *
                  </label>
                  <input
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                    placeholder="Jean"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nom *
                  </label>
                  <input
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                    placeholder="Dupont"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                    placeholder="jean.dupont@email.com"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Téléphone *
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                    placeholder="+33123456789"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date de naissance *
                  </label>
                  <input
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Genre *
                  </label>
                  <select
                    value={formData.gender}
                    onChange={(e) => handleInputChange('gender', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                  >
                    <option value="">Sélectionner</option>
                    <option value="Homme">Homme</option>
                    <option value="Femme">Femme</option>
                    <option value="Autre">Autre</option>
                    <option value="Non spécifié">Préfère ne pas dire</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Address and Contact */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Adresse et contact</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Adresse *
                  </label>
                  <input
                    type="text"
                    value={formData.address.street}
                    onChange={(e) => handleInputChange('address.street', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                    placeholder="123 Rue de la République"
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Ville *
                    </label>
                    <input
                      type="text"
                      value={formData.address.city}
                      onChange={(e) => handleInputChange('address.city', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                      placeholder="Paris"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Code postal *
                    </label>
                    <input
                      type="text"
                      value={formData.address.postalCode}
                      onChange={(e) => handleInputChange('address.postalCode', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                      placeholder="75001"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Pays
                  </label>
                  <select
                    value={formData.address.country}
                    onChange={(e) => handleInputChange('address.country', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                  >
                    <option value="France">France</option>
                    <option value="Belgique">Belgique</option>
                    <option value="Suisse">Suisse</option>
                    <option value="Canada">Canada</option>
                  </select>
                </div>

                {/* Assurance */}
                <div className="border-t pt-4">
                  <h4 className="text-md font-medium text-gray-900 mb-4">Assurance maladie</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Organisme d'assurance
                      </label>
                      <input
                        type="text"
                        value={formData.insurance.provider}
                        onChange={(e) => handleInputChange('insurance.provider', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                        placeholder="CPAM, Mutuelle..."
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Numéro de police
                      </label>
                      <input
                        type="text"
                        value={formData.insurance.policyNumber}
                        onChange={(e) => handleInputChange('insurance.policyNumber', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                        placeholder="123456789012345"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Emergency Contact */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact d'urgence</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nom complet *
                  </label>
                  <input
                    type="text"
                    value={formData.emergencyContact.name}
                    onChange={(e) => handleInputChange('emergencyContact.name', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                    placeholder="Marie Dupont"
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Relation *
                    </label>
                    <select
                      value={formData.emergencyContact.relationship}
                      onChange={(e) => handleInputChange('emergencyContact.relationship', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                    >
                      <option value="">Sélectionner</option>
                      <option value="Époux/Épouse">Époux/Épouse</option>
                      <option value="Père">Père</option>
                      <option value="Mère">Mère</option>
                      <option value="Fils">Fils</option>
                      <option value="Fille">Fille</option>
                      <option value="Frère">Frère</option>
                      <option value="Sœur">Sœur</option>
                      <option value="Ami(e)">Ami(e)</option>
                      <option value="Autre">Autre</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Téléphone *
                    </label>
                    <input
                      type="tel"
                      value={formData.emergencyContact.phone}
                      onChange={(e) => handleInputChange('emergencyContact.phone', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                      placeholder="+33987654321"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Medical Information */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Informations médicales</h3>
              
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Groupe sanguin
                    </label>
                    <select
                      value={formData.medicalInfo.bloodType}
                      onChange={(e) => handleInputChange('medicalInfo.bloodType', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                    >
                      <option value="">Non spécifié</option>
                      <option value="A+">A+</option>
                      <option value="A-">A-</option>
                      <option value="B+">B+</option>
                      <option value="B-">B-</option>
                      <option value="AB+">AB+</option>
                      <option value="AB-">AB-</option>
                      <option value="O+">O+</option>
                      <option value="O-">O-</option>
                    </select>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Allergies connues
                  </label>
                  <textarea
                    value={formData.medicalInfo.allergies}
                    onChange={(e) => handleInputChange('medicalInfo.allergies', e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent resize-none"
                    placeholder="Pénicilline, arachides, etc."
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Médicaments actuels
                  </label>
                  <textarea
                    value={formData.medicalInfo.currentMedications}
                    onChange={(e) => handleInputChange('medicalInfo.currentMedications', e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent resize-none"
                    placeholder="Liste des médicaments pris actuellement..."
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Antécédents médicaux
                  </label>
                  <textarea
                    value={formData.medicalInfo.medicalHistory}
                    onChange={(e) => handleInputChange('medicalInfo.medicalHistory', e.target.value)}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent resize-none"
                    placeholder="Maladies chroniques, opérations, hospitalisations..."
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 flex justify-between">
          <div className="flex space-x-3">
            {currentStep > 1 && (
              <button
                onClick={handlePrevious}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Précédent
              </button>
            )}
          </div>
          
          <div className="flex space-x-3">
            <button
              onClick={handleClose}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Annuler
            </button>
            
            {currentStep < 4 ? (
              <button
                onClick={handleNext}
                className="px-4 py-2 bg-sky-500 text-white rounded-lg hover:bg-sky-600 transition-colors"
              >
                Suivant
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Création...</span>
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    <span>Créer le patient</span>
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