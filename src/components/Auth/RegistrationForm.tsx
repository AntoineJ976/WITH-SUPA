import React, { useState } from 'react';
import { Eye, EyeOff, Stethoscope, Heart, ArrowLeft, UserCheck } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';

interface RegistrationFormProps {
  onBackToLogin: () => void;
  preSelectedRole?: 'patient' | 'doctor' | 'secretary' | null;
}

export const RegistrationForm: React.FC<RegistrationFormProps> = ({ 
  onBackToLogin, 
  preSelectedRole = null 
}) => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    role: (preSelectedRole || 'patient') as 'patient' | 'doctor' | 'secretary',
    firstName: '',
    lastName: '',
    phoneNumber: '',
    dateOfBirth: '',
    // Doctor specific fields
    speciality: '',
    licenseNumber: '',
    experience: '',
    // Patient specific fields
    address: {
      street: '',
      city: '',
      postalCode: '',
      country: 'France'
    },
    emergencyContact: {
      name: '',
      relationship: '',
      phoneNumber: ''
    }
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const { register } = useAuth();

  const validateForm = () => {
    const newErrors: string[] = [];

    if (!formData.email) newErrors.push('L\'adresse e-mail est requise');
    if (!formData.password) newErrors.push('Le mot de passe est requis');
    if (formData.password.length < 8) newErrors.push('Le mot de passe doit contenir au moins 8 caractères');
    if (formData.password !== formData.confirmPassword) newErrors.push('Les mots de passe ne correspondent pas');
    if (!formData.firstName) newErrors.push('Le prénom est requis');
    if (!formData.lastName) newErrors.push('Le nom est requis');
    if (!formData.phoneNumber) newErrors.push('Le numéro de téléphone est requis');

    if (formData.role === 'doctor' || formData.role === 'secretary') {
      if (!formData.speciality) newErrors.push('La spécialité est requise');
      if (!formData.licenseNumber) newErrors.push('Le numéro de licence est requis');
    } else if (formData.role === 'patient') {
      if (!formData.dateOfBirth) newErrors.push('La date de naissance est requise');
      if (!formData.address.street) newErrors.push('L\'adresse est requise');
      if (!formData.address.city) newErrors.push('La ville est requise');
      if (!formData.address.postalCode) newErrors.push('Le code postal est requis');
    }

    setErrors(newErrors);
    return newErrors.length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsLoading(true);
    
    try {
      const userData = {
        email: formData.email,
        password: formData.password,
        role: formData.role,
        profile: formData.role === 'doctor' ? {
          firstName: formData.firstName,
          lastName: formData.lastName,
          speciality: formData.speciality,
          licenseNumber: formData.licenseNumber,
          verified: false,
          experience: parseInt(formData.experience) || 0,
          languages: ['Français'],
          consultationFee: 50,
          availableHours: []
        } : {
          firstName: formData.firstName,
          lastName: formData.lastName,
          dateOfBirth: formData.dateOfBirth,
          phoneNumber: formData.phoneNumber,
          address: formData.address,
          emergencyContact: formData.emergencyContact,
          medicalHistory: []
        },
        rgpdConsent: [
          {
            id: '1',
            userId: '',
            consentType: 'data_processing' as const,
            granted: true,
            timestamp: new Date().toISOString(),
            ipAddress: '192.168.1.1',
            version: '1.0'
          }
        ]
      };

      await register(userData);
    } catch (error) {
      console.error('Erreur inscription:', error);
      setErrors([error instanceof Error ? error.message : 'Erreur lors de l\'inscription. Veuillez réessayer.']);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...(prev[parent as keyof typeof prev] as any || {}),
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 to-emerald-50 flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl w-full space-y-8">
        <div className="text-center">
          <button
            onClick={onBackToLogin}
            className="inline-flex items-center text-sky-600 hover:text-sky-700 mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour à la connexion
          </button>
          
          <div className="flex justify-center">
            <div className="w-16 h-16 bg-sky-500 rounded-2xl flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-2xl">D</span>
            </div>
          </div>
          <h2 className="mt-6 text-3xl font-bold text-gray-900">Créer un compte</h2>
          <p className="mt-2 text-sm text-gray-600">
            Rejoignez notre plateforme de télémédecine sécurisée
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {errors.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <ul className="text-sm text-red-600 space-y-1">
                {errors.map((error, index) => (
                  <li key={index}>• {error}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="space-y-4">
            {/* Role Selection */}
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-3">
                Je suis un(e) :
              </label>
              <div className="grid grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, role: 'patient' }))}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    formData.role === 'patient'
                      ? 'border-sky-500 bg-sky-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <Heart className={`h-6 w-6 mx-auto mb-2 ${
                    formData.role === 'patient' ? 'text-sky-500' : 'text-gray-400'
                  }`} />
                  <span className={`text-sm font-medium ${
                    formData.role === 'patient' ? 'text-sky-700' : 'text-gray-700'
                  }`}>
                    Patient
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, role: 'doctor' }))}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    formData.role === 'doctor'
                      ? 'border-sky-500 bg-sky-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <Stethoscope className={`h-6 w-6 mx-auto mb-2 ${
                    formData.role === 'doctor' ? 'text-sky-500' : 'text-gray-400'
                  }`} />
                  <span className={`text-sm font-medium ${
                    formData.role === 'doctor' ? 'text-sky-700' : 'text-gray-700'
                  }`}>
                    Médecin
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, role: 'secretary' }))}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    formData.role === 'secretary'
                      ? 'border-sky-500 bg-sky-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <UserCheck className={`h-6 w-6 mx-auto mb-2 ${
                    formData.role === 'secretary' ? 'text-sky-500' : 'text-gray-400'
                  }`} />
                  <span className={`text-sm font-medium ${
                    formData.role === 'secretary' ? 'text-sky-700' : 'text-gray-700'
                  }`}>
                    Secrétaire
                  </span>
                </button>
              </div>
            </div>

            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Prénom</label>
                <input
                  type="text"
                  required
                  value={formData.firstName}
                  onChange={(e) => handleInputChange('firstName', e.target.value)}
                  className="mt-1 w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Nom</label>
                <input
                  type="text"
                  required
                  value={formData.lastName}
                  onChange={(e) => handleInputChange('lastName', e.target.value)}
                  className="mt-1 w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Adresse e-mail</label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className="mt-1 w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Téléphone</label>
              <input
                type="tel"
                required
                value={formData.phoneNumber}
                onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                className="mt-1 w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
              />
            </div>

            {/* Doctor specific fields */}
            {(formData.role === 'doctor' || formData.role === 'secretary') && (
              <div className="space-y-4 border-t pt-4">
                <h3 className="text-lg font-medium text-gray-900">
                  {formData.role === 'doctor' ? 'Informations professionnelles' : 'Informations secrétariat'}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      {formData.role === 'doctor' ? 'Spécialité' : 'Service'}
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.speciality}
                      onChange={(e) => handleInputChange('speciality', e.target.value)}
                      placeholder={formData.role === 'doctor' ? 'Médecine générale' : 'Secrétariat médical'}
                      className="mt-1 w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      {formData.role === 'doctor' ? 'Numéro de licence' : 'Numéro d\'employé'}
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.licenseNumber}
                      onChange={(e) => handleInputChange('licenseNumber', e.target.value)}
                      placeholder={formData.role === 'doctor' ? 'FR123456789' : 'EMP001'}
                      className="mt-1 w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    {formData.role === 'doctor' ? 'Années d\'expérience' : 'Années d\'expérience en secrétariat'}
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.experience}
                    onChange={(e) => handleInputChange('experience', e.target.value)}
                    className="mt-1 w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                  />
                </div>
              </div>
            )}

            {/* Patient specific fields */}
            {formData.role === 'patient' && (
              <div className="space-y-4 border-t pt-4">
                <h3 className="text-lg font-medium text-gray-900">Informations personnelles</h3>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Date de naissance</label>
                  <input
                    type="date"
                    required
                    value={formData.dateOfBirth}
                    onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                    className="mt-1 w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Genre *</label>
                  <select
                    required
                    value={formData.gender || ''}
                    onChange={(e) => handleInputChange('gender', e.target.value)}
                    className="mt-1 w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                  >
                    <option value="">Sélectionner</option>
                    <option value="Homme">Homme</option>
                    <option value="Femme">Femme</option>
                    <option value="Autre">Autre</option>
                    <option value="Non spécifié">Préfère ne pas dire</option>
                  </select>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Adresse</label>
                    <input
                      type="text"
                      required
                      value={formData.address.street}
                      onChange={(e) => handleInputChange('address.street', e.target.value)}
                      className="mt-1 w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Ville</label>
                    <input
                      type="text"
                      required
                      value={formData.address.city}
                      onChange={(e) => handleInputChange('address.city', e.target.value)}
                      className="mt-1 w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Code postal</label>
                  <input
                    type="text"
                    required
                    value={formData.address.postalCode}
                    onChange={(e) => handleInputChange('address.postalCode', e.target.value)}
                    className="mt-1 w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Pays</label>
                  <select
                    value={formData.address.country}
                    onChange={(e) => handleInputChange('address.country', e.target.value)}
                    className="mt-1 w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                  >
                    <option value="France">France</option>
                    <option value="Belgique">Belgique</option>
                    <option value="Suisse">Suisse</option>
                    <option value="Canada">Canada</option>
                  </select>
                </div>
                
                {/* Contact d'urgence */}
                <div className="border-t pt-4">
                  <h4 className="text-md font-medium text-gray-900 mb-4">Contact d'urgence *</h4>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Nom complet *</label>
                      <input
                        type="text"
                        required
                        value={formData.emergencyContact.name}
                        onChange={(e) => handleInputChange('emergencyContact.name', e.target.value)}
                        className="mt-1 w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                        placeholder="Marie Dupont"
                      />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Relation *</label>
                        <select
                          required
                          value={formData.emergencyContact.relationship}
                          onChange={(e) => handleInputChange('emergencyContact.relationship', e.target.value)}
                          className="mt-1 w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
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
                        <label className="block text-sm font-medium text-gray-700">Téléphone *</label>
                        <input
                          type="tel"
                          required
                          value={formData.emergencyContact.phoneNumber}
                          onChange={(e) => handleInputChange('emergencyContact.phoneNumber', e.target.value)}
                          className="mt-1 w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                          placeholder="+33987654321"
                        />
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Informations médicales */}
                <div className="border-t pt-4">
                  <h4 className="text-md font-medium text-gray-900 mb-4">Informations médicales</h4>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Groupe sanguin</label>
                      <select
                        value={formData.medicalInfo?.bloodType || ''}
                        onChange={(e) => handleInputChange('medicalInfo.bloodType', e.target.value)}
                        className="mt-1 w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
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
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Allergies connues</label>
                      <textarea
                        value={formData.medicalInfo?.allergies || ''}
                        onChange={(e) => handleInputChange('medicalInfo.allergies', e.target.value)}
                        rows={3}
                        className="mt-1 w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent resize-none"
                        placeholder="Pénicilline, arachides, etc."
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Médicaments actuels</label>
                      <textarea
                        value={formData.medicalInfo?.currentMedications || ''}
                        onChange={(e) => handleInputChange('medicalInfo.currentMedications', e.target.value)}
                        rows={3}
                        className="mt-1 w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent resize-none"
                        placeholder="Liste des médicaments pris actuellement..."
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Antécédents médicaux</label>
                      <textarea
                        value={formData.medicalInfo?.medicalHistory || ''}
                        onChange={(e) => handleInputChange('medicalInfo.medicalHistory', e.target.value)}
                        rows={4}
                        className="mt-1 w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent resize-none"
                        placeholder="Maladies chroniques, opérations, hospitalisations..."
                      />
                    </div>
                  </div>
                </div>
                
                {/* Assurance maladie */}
                <div className="border-t pt-4">
                  <h4 className="text-md font-medium text-gray-900 mb-4">Assurance maladie</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Organisme d'assurance</label>
                      <input
                        type="text"
                        value={formData.insurance?.provider || ''}
                        onChange={(e) => handleInputChange('insurance.provider', e.target.value)}
                        className="mt-1 w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                        placeholder="CPAM, Mutuelle..."
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Numéro de police</label>
                      <input
                        type="text"
                        value={formData.insurance?.policyNumber || ''}
                        onChange={(e) => handleInputChange('insurance.policyNumber', e.target.value)}
                        className="mt-1 w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                        placeholder="123456789012345"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Password fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Mot de passe</label>
                <div className="mt-1 relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    className="w-full px-3 py-3 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400" />
                    )}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Confirmer le mot de passe</label>
                <div className="mt-1 relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    value={formData.confirmPassword}
                    onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                    className="w-full px-3 py-3 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-sky-600 hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? 'Création du compte...' : 'Créer mon compte'}
            </button>
          </div>
        </form>

        {/* RGPD Notice */}
        <div className="mt-8 p-4 bg-gray-50 rounded-lg border">
          <p className="text-xs text-gray-600 text-center">
            En créant un compte Supabase, vous acceptez notre{' '}
            <a href="#" className="text-sky-600 hover:underline">politique de confidentialité</a>{' '}
            et nos{' '}
            <a href="#" className="text-sky-600 hover:underline">conditions d'utilisation</a>.
            Vos données sont sécurisées avec Supabase et protégées selon le RGPD.
          </p>
        </div>
      </div>
    </div>
  );
};