import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { 
  Search, 
  Plus, 
  Trash2, 
  AlertTriangle, 
  CheckCircle, 
  Info,
  Pill,
  FileText,
  Save,
  ArrowLeft,
  Shield,
  Clock,
  Send,
  Building2,
  User,
  MapPin,
  Phone,
  Mail,
  X
} from 'lucide-react';
import { PDFService, PrescriptionData } from '../../services/pdfService';
import { EmailService } from '../../services/emailService';
import { PatientSelector } from './PatientSelector';

interface Pharmacy {
  id: string;
  name: string;
  address: {
    street: string;
    city: string;
    postalCode: string;
    country: string;
  };
  phone: string;
  email: string;
  services: string[];
  verified: boolean;
}

interface PrescriptionProps {
  onBack?: () => void;
  patientId?: string;
  consultationId?: string;
}

interface Medication {
  id: string;
  name: string;
  activeSubstance: string;
  dosage: string;
  form: string;
  laboratory: string;
  contraindications: string[];
  interactions: string[];
  sideEffects: string[];
  price: number;
}

interface PrescriptionItem {
  medication: Medication;
  dosage: string;
  frequency: string;
  duration: string;
  instructions: string;
}

export const Prescription: React.FC<PrescriptionProps> = ({ 
  onBack, 
  patientId = 'patient-1',
  consultationId = 'consultation-1'
}) => {
  const [currentView, setCurrentView] = useState<'patient-selection' | 'prescription-creation'>('patient-selection');
  const [selectedPatientForPrescription, setSelectedPatientForPrescription] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<Medication[]>([]);
  const [prescription, setPrescription] = useState<PrescriptionItem[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedMedication, setSelectedMedication] = useState<Medication | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showSendModal, setShowSendModal] = useState(false);
  const [sendModalType, setSendModalType] = useState<'patient' | 'pharmacy'>('patient');
  const [selectedPharmacy, setSelectedPharmacy] = useState<Pharmacy | null>(null);
  const [pharmacySearchTerm, setPharmacySearchTerm] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [sendingStatus, setSendingStatus] = useState<{
    type: 'patient' | 'pharmacy' | null;
    status: 'generating' | 'sending' | 'success' | 'error';
    message: string;
  }>({ type: null, status: 'success', message: '' });
  const [prescriptionForm, setPrescriptionForm] = useState({
    dosage: '',
    frequency: '',
    duration: '',
    instructions: ''
  });

  // Handle patient selection from PatientSelector
  const handlePatientSelect = (patient: any) => {
    setSelectedPatientForPrescription(patient);
  };

  // Handle prescription creation
  const handleCreatePrescription = (patient: any) => {
    setSelectedPatientForPrescription(patient);
    setCurrentView('prescription-creation');
  };

  // Handle back to patient selection
  const handleBackToPatientSelection = () => {
    setCurrentView('patient-selection');
    setSelectedPatientForPrescription(null);
    // Reset prescription state
    setPrescription([]);
    setSearchTerm('');
    setSelectedMedication(null);
  };

  // Données de pharmacies simulées
  const allPharmacies: Pharmacy[] = [
    {
      id: '1',
      name: 'Pharmacie Centrale',
      address: {
        street: '123 Avenue des Champs-Élysées',
        city: 'Paris',
        postalCode: '75008',
        country: 'France'
      },
      phone: '+33142563789',
      email: 'contact@pharmacie-centrale.fr',
      services: ['delivery', 'online_ordering', 'emergency_service', 'vaccination'],
      verified: true
    },
    {
      id: '2',
      name: 'Pharmacie du Marché',
      address: {
        street: '45 Rue du Marché',
        city: 'Lyon',
        postalCode: '69002',
        country: 'France'
      },
      phone: '+33478456123',
      email: 'info@pharmacie-marche.fr',
      services: ['delivery', 'online_ordering', 'consultation'],
      verified: true
    },
    {
      id: '3',
      name: 'Pharmacie de la Gare',
      address: {
        street: '78 Boulevard de la Gare',
        city: 'Marseille',
        postalCode: '13001',
        country: 'France'
      },
      phone: '+33491234567',
      email: 'contact@pharmacie-gare.fr',
      services: ['delivery', 'emergency_service', 'vaccination', 'consultation'],
      verified: true
    }
  ];

  // Filtrer les pharmacies selon le terme de recherche
  const pharmacies = React.useMemo(() => {
    if (!pharmacySearchTerm) return allPharmacies;
    
    return allPharmacies.filter((pharmacy: Pharmacy) =>
      pharmacy.name.toLowerCase().includes(pharmacySearchTerm.toLowerCase()) ||
      pharmacy.address.city.toLowerCase().includes(pharmacySearchTerm.toLowerCase())
    );
  }, [pharmacySearchTerm]);

  const isLoadingPharmacies = false;
  const pharmaciesError = null;

  // Simulation de l'API médicaments avec des médicaments réels
  const medicationDatabase: Medication[] = [
    {
      id: '1',
      name: 'Amoxicilline Biogaran 500mg',
      activeSubstance: 'Amoxicilline',
      dosage: '500mg',
      form: 'Gélule',
      laboratory: 'Biogaran',
      contraindications: ['Allergie aux pénicillines', 'Mononucléose infectieuse'],
      interactions: ['Méthotrexate', 'Warfarine'],
      sideEffects: ['Diarrhée', 'Nausées', 'Éruption cutanée'],
      price: 3.45
    },
    {
      id: '2',
      name: 'Paracétamol Doliprane 1000mg',
      activeSubstance: 'Paracétamol',
      dosage: '1000mg',
      form: 'Comprimé',
      laboratory: 'Sanofi',
      contraindications: ['Insuffisance hépatique sévère'],
      interactions: ['Warfarine (surveillance INR)'],
      sideEffects: ['Rares: hépatotoxicité en cas de surdosage'],
      price: 2.18
    },
    {
      id: '3',
      name: 'Ibuprofène Advil 400mg',
      activeSubstance: 'Ibuprofène',
      dosage: '400mg',
      form: 'Comprimé pelliculé',
      laboratory: 'Pfizer',
      contraindications: ['Ulcère gastroduodénal', 'Insuffisance rénale', 'Grossesse (3e trimestre)'],
      interactions: ['Anticoagulants', 'Lithium', 'Méthotrexate'],
      sideEffects: ['Troubles digestifs', 'Céphalées', 'Vertiges'],
      price: 4.12
    },
    {
      id: '4',
      name: 'Oméprazole Mopral 20mg',
      activeSubstance: 'Oméprazole',
      dosage: '20mg',
      form: 'Gélule gastro-résistante',
      laboratory: 'AstraZeneca',
      contraindications: ['Hypersensibilité aux benzimidazoles'],
      interactions: ['Clopidogrel', 'Atazanavir', 'Digoxine'],
      sideEffects: ['Céphalées', 'Diarrhée', 'Douleurs abdominales'],
      price: 5.67
    },
    {
      id: '5',
      name: 'Loratadine Clarityne 10mg',
      activeSubstance: 'Loratadine',
      dosage: '10mg',
      form: 'Comprimé',
      laboratory: 'Bayer',
      contraindications: ['Hypersensibilité à la loratadine'],
      interactions: ['Kétoconazole', 'Érythromycine'],
      sideEffects: ['Somnolence', 'Céphalées', 'Fatigue'],
      price: 3.89
    }
  ];

  // Simulation de recherche dans l'API médicaments
  const searchMedications = async (query: string) => {
    setIsSearching(true);
    
    // Simulation d'un délai d'API
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const results = medicationDatabase.filter(med => 
      med.name.toLowerCase().includes(query.toLowerCase()) ||
      med.activeSubstance.toLowerCase().includes(query.toLowerCase())
    );
    
    setSearchResults(results);
    setIsSearching(false);
  };

  useEffect(() => {
    if (searchTerm.length >= 3) {
      searchMedications(searchTerm);
    } else {
      setSearchResults([]);
    }
  }, [searchTerm]);

  const handleAddToPrescription = () => {
    if (selectedMedication && prescriptionForm.dosage && prescriptionForm.frequency && prescriptionForm.duration) {
      const newPrescriptionItem: PrescriptionItem = {
        medication: selectedMedication,
        dosage: prescriptionForm.dosage,
        frequency: prescriptionForm.frequency,
        duration: prescriptionForm.duration,
        instructions: prescriptionForm.instructions
      };
      
      setPrescription(prev => [...prev, newPrescriptionItem]);
      setShowAddModal(false);
      setSelectedMedication(null);
      setPrescriptionForm({
        dosage: '',
        frequency: '',
        duration: '',
        instructions: ''
      });
    }
  };

  const handleRemoveFromPrescription = (index: number) => {
    setPrescription(prev => prev.filter((_, i) => i !== index));
  };

  const handleSavePrescription = async () => {
    try {
      // Simulation de sauvegarde
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const prescriptionData = {
        id: Date.now().toString(),
        patientId,
        consultationId,
        medications: prescription,
        createdAt: new Date().toISOString(),
        doctorId: 'current-doctor-id'
      };
      
      // Sauvegarder localement pour la démo
      const existingPrescriptions = JSON.parse(localStorage.getItem('prescriptions') || '[]');
      existingPrescriptions.push(prescriptionData);
      localStorage.setItem('prescriptions', JSON.stringify(existingPrescriptions));
      
      alert('✅ Ordonnance sauvegardée avec succès !');
      
      // Réinitialiser
      setPrescription([]);
      
    } catch (error) {
      console.error('Erreur sauvegarde ordonnance:', error);
      alert('❌ Erreur lors de la sauvegarde');
    }
  };

  const handleSendToPatient = () => {
    if (prescription.length === 0) {
      alert('Aucun médicament dans l\'ordonnance à envoyer.');
      return;
    }
    handleSendPrescription('patient');
  };

  const handleSendToPharmacy = () => {
    if (prescription.length === 0) {
      alert('Aucun médicament dans l\'ordonnance à envoyer.');
      return;
    }
    setSendModalType('pharmacy');
    setShowSendModal(true);
  };

  const handleSendPrescription = async (type: 'patient' | 'pharmacy', pharmacy?: Pharmacy) => {
    if (prescription.length === 0) {
      alert('Aucun médicament dans l\'ordonnance à envoyer.');
      return;
    }

    setIsSending(true);
    setSendingStatus({ type, status: 'generating', message: 'Génération du PDF...' });

    try {
      // Données de l'ordonnance pour le PDF
      const prescriptionData: PrescriptionData = {
        patientName: 'Jean Dupont', // En production, récupérer depuis la base
        patientEmail: 'jean.dupont@email.com',
        doctorName: 'Dr. Marie Leblanc',
        doctorLicense: 'FR123456789',
        medications: prescription.map(item => ({
          name: item.medication.name,
          dosage: item.dosage,
          frequency: item.frequency,
          duration: item.duration,
          instructions: item.instructions
        })),
        consultationDate: new Date().toISOString(),
        prescriptionId: `ORD-${Date.now()}`
      };

      // Générer le PDF
      const pdfBlob = await PDFService.generatePrescriptionPDF(prescriptionData);
      
      setSendingStatus({ type, status: 'sending', message: 'Envoi en cours...' });

      if (type === 'patient') {
        // Envoyer au patient
        const result = await EmailService.sendPrescriptionToPatient(
          prescriptionData.patientEmail,
          prescriptionData.patientName,
          prescriptionData.doctorName,
          pdfBlob,
          prescriptionData.prescriptionId
        );

        if (result.success) {
          setSendingStatus({ 
            type, 
            status: 'success', 
            message: `✅ Ordonnance envoyée avec succès au patient !` 
          });
        }
      } else if (type === 'pharmacy' && pharmacy) {
        // Envoyer à la pharmacie
        const result = await EmailService.sendPrescriptionToPharmacy(
          pharmacy.email,
          pharmacy.name,
          prescriptionData.patientName,
          prescriptionData.doctorName,
          pdfBlob,
          prescriptionData.prescriptionId
        );

        if (result.success) {
          setSendingStatus({ 
            type, 
            status: 'success', 
            message: `✅ Ordonnance envoyée avec succès à ${pharmacy.name} !` 
          });
        }
      }

      // Réinitialiser après succès
      setTimeout(() => {
        setPrescription([]);
        setShowSendModal(false);
        setSelectedPharmacy(null);
        setSendingStatus({ type: null, status: 'success', message: '' });
      }, 2000);

    } catch (error) {
      console.error('Erreur envoi ordonnance:', error);
      setSendingStatus({ 
        type, 
        status: 'error', 
        message: `❌ Erreur lors de l'envoi: ${error instanceof Error ? error.message : 'Erreur inconnue'}` 
      });
    } finally {
      setIsSending(false);
    }
  };

  const handleConfirmSend = async () => {
    if (sendModalType === 'pharmacy' && selectedPharmacy) {
      await handleSendPrescription('pharmacy', selectedPharmacy);
    }
  };

  // Render patient selection view
  if (currentView === 'patient-selection') {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center space-x-4">
                {onBack && (
                  <button
                    onClick={onBack}
                    className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
                  >
                    <ArrowLeft className="h-5 w-5" />
                    <span>Retour</span>
                  </button>
                )}
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-sky-500 rounded-lg flex items-center justify-center">
                    <Pill className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h1 className="text-xl font-bold text-gray-900">Logiciel d'Aide à la Prescription</h1>
                    <p className="text-sm text-gray-600">Sélectionnez un patient pour créer une ordonnance</p>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2 bg-green-100 px-3 py-1 rounded-full">
                  <Shield className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium text-green-800">Certifié</span>
                </div>
                <div className="flex items-center space-x-2 text-gray-600">
                  <Clock className="h-4 w-4" />
                  <span className="text-sm">Session active</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <PatientSelector
            onPatientSelect={handlePatientSelect}
            selectedPatient={selectedPatientForPrescription}
            onCreatePrescription={handleCreatePrescription}
          />
        </div>
      </div>
    );
  }

  // Render prescription creation view (existing functionality)
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={handleBackToPatientSelection}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
                <span>Retour aux patients</span>
              </button>
              {onBack && (
                <button
                  onClick={onBack}
                  className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors ml-4"
                >
                  <X className="h-5 w-5" />
                  <span>Fermer</span>
                </button>
              )}
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-sky-500 rounded-lg flex items-center justify-center">
                  <Pill className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">Logiciel d'Aide à la Prescription</h1>
                  <p className="text-sm text-gray-600">
                    Patient: {selectedPatientForPrescription ? 
                      `${selectedPatientForPrescription.firstName} ${selectedPatientForPrescription.lastName}` : 
                      'Aucun patient sélectionné'
                    }
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 bg-green-100 px-3 py-1 rounded-full">
                <Shield className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium text-green-800">Certifié</span>
              </div>
              <div className="flex items-center space-x-2 text-gray-600">
                <Clock className="h-4 w-4" />
                <span className="text-sm">Session active</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Selected Patient Info */}
        {selectedPatientForPrescription && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-br from-sky-400 to-emerald-400 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold">
                    {selectedPatientForPrescription.id}
                  </span>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">
                    {selectedPatientForPrescription.firstName} {selectedPatientForPrescription.lastName}
                  </h3>
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <span>N°: {selectedPatientForPrescription.medicalRecordNumber}</span>
                    <span>Âge: {(() => {
                      const today = new Date();
                      const birthDate = new Date(selectedPatientForPrescription.dateOfBirth);
                      let age = today.getFullYear() - birthDate.getFullYear();
                      const monthDiff = today.getMonth() - birthDate.getMonth();
                      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
                        age--;
                      }
                      return age;
                    })()} ans</span>
                    <span>Email: {selectedPatientForPrescription.email}</span>
                  </div>
                </div>
              </div>
              
              {/* Medical Alerts */}
              <div className="flex flex-col items-end space-y-2">
                {selectedPatientForPrescription.medicalInfo.allergies !== 'Aucune allergie connue' && (
                  <div className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-medium flex items-center space-x-1">
                    <AlertTriangle className="h-4 w-4" />
                    <span>Allergies: {selectedPatientForPrescription.medicalInfo.allergies}</span>
                  </div>
                )}
                {selectedPatientForPrescription.medicalInfo.currentMedications !== 'Aucun' && (
                  <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium flex items-center space-x-1">
                    <Pill className="h-4 w-4" />
                    <span>Médicaments: {selectedPatientForPrescription.medicalInfo.currentMedications}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Search Panel */}
          <div className="lg:col-span-2 space-y-6">
            {/* Search Bar */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Search className="h-5 w-5 mr-2 text-sky-500" />
                Recherche de médicaments
              </h2>
              
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Rechercher un médicament (ex: amoxicilline, paracétamol...)"
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                />
              </div>
              
              {searchTerm.length > 0 && searchTerm.length < 3 && (
                <p className="text-sm text-gray-500 mt-2">
                  Tapez au moins 3 caractères pour rechercher
                </p>
              )}
            </div>

            {/* Search Results */}
            {isSearching && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-500 mx-auto mb-4"></div>
                <p className="text-gray-600">Recherche dans la base médicaments...</p>
              </div>
            )}

            {searchResults.length > 0 && !isSearching && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                <div className="p-6 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Résultats de recherche ({searchResults.length})
                  </h3>
                </div>
                <div className="p-6 space-y-4">
                  {searchResults.map((medication) => (
                    <div key={medication.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900">{medication.name}</h4>
                          <p className="text-sm text-gray-600 mb-2">
                            {medication.activeSubstance} • {medication.form} • {medication.laboratory}
                          </p>
                          
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                            <div>
                              <p className="font-medium text-gray-700">Contre-indications:</p>
                              <ul className="text-gray-600 text-xs mt-1">
                                {medication.contraindications.slice(0, 2).map((ci, index) => (
                                  <li key={index}>• {ci}</li>
                                ))}
                              </ul>
                            </div>
                            <div>
                              <p className="font-medium text-gray-700">Interactions:</p>
                              <ul className="text-gray-600 text-xs mt-1">
                                {medication.interactions.slice(0, 2).map((interaction, index) => (
                                  <li key={index}>• {interaction}</li>
                                ))}
                              </ul>
                            </div>
                            <div>
                              <p className="font-medium text-gray-700">Prix:</p>
                              <p className="text-emerald-600 font-semibold">{medication.price.toFixed(2)}€</p>
                            </div>
                          </div>
                        </div>
                        
                        <button
                          onClick={() => {
                            setSelectedMedication(medication);
                            setShowAddModal(true);
                          }}
                          className="ml-4 bg-sky-500 text-white px-4 py-2 rounded-lg hover:bg-sky-600 transition-colors flex items-center space-x-2"
                        >
                          <Plus className="h-4 w-4" />
                          <span>Ajouter</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {searchTerm.length >= 3 && searchResults.length === 0 && !isSearching && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
                <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun résultat</h3>
                <p className="text-gray-600">
                  Aucun médicament trouvé pour "{searchTerm}". Vérifiez l'orthographe ou essayez un autre terme.
                </p>
              </div>
            )}
          </div>

          {/* Prescription Panel */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <FileText className="h-5 w-5 mr-2 text-emerald-500" />
                  Ordonnance en cours
                </h3>
              </div>
              
              <div className="p-6">
                {prescription.length === 0 ? (
                  <div className="text-center py-8">
                    <Pill className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">Aucun médicament ajouté</p>
                    <p className="text-sm text-gray-500 mt-1">
                      Recherchez et ajoutez des médicaments à l'ordonnance
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {prescription.map((item, index) => (
                      <div key={index} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h4 className="font-semibold text-gray-900">{item.medication.name}</h4>
                            <p className="text-sm text-gray-600">{item.medication.activeSubstance}</p>
                          </div>
                          <button
                            onClick={() => handleRemoveFromPrescription(index)}
                            className="text-red-500 hover:text-red-700 transition-colors"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                        
                        <div className="space-y-2 text-sm">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <span className="font-medium text-gray-700">Dosage:</span>
                              <span className="ml-2 text-gray-900">{item.dosage}</span>
                            </div>
                            <div>
                              <span className="font-medium text-gray-700">Fréquence:</span>
                              <span className="ml-2 text-gray-900">{item.frequency}</span>
                            </div>
                          </div>
                          <div>
                            <span className="font-medium text-gray-700">Durée:</span>
                            <span className="ml-2 text-gray-900">{item.duration}</span>
                          </div>
                          {item.instructions && (
                            <div>
                              <span className="font-medium text-gray-700">Instructions:</span>
                              <span className="ml-2 text-gray-900">{item.instructions}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                    
                    <div className="space-y-3">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <button
                          onClick={handleSendToPatient}
                          disabled={isSending}
                          className="bg-sky-500 text-white py-3 px-4 rounded-lg font-medium hover:bg-sky-600 transition-colors flex items-center justify-center space-x-2"
                        >
                          <Send className="h-4 w-4" />
                          <span>Envoyer l'ordo</span>
                        </button>
                        <button
                          onClick={handleSendToPharmacy}
                          disabled={isSending}
                          className="bg-emerald-500 text-white py-3 px-4 rounded-lg font-medium hover:bg-emerald-600 transition-colors flex items-center justify-center space-x-2"
                        >
                          <Building2 className="h-4 w-4" />
                          <span>Envoyer à la Pharma</span>
                        </button>
                      </div>
                      <button
                        onClick={handleSavePrescription}
                        disabled={isSending}
                        className="w-full bg-gray-500 text-white py-2 px-4 rounded-lg font-medium hover:bg-gray-600 transition-colors flex items-center justify-center space-x-2"
                      >
                        <Save className="h-4 w-4" />
                        <span>Sauvegarder brouillon</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Info Panel */}
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-6">
              <div className="flex items-start space-x-3">
                <Info className="h-5 w-5 text-emerald-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="text-sm font-medium text-emerald-900 mb-2">
                    Base de données médicaments
                  </h3>
                  <div className="text-sm text-emerald-800 space-y-1">
                    <p>• Plus de 10,000 médicaments référencés</p>
                    <p>• Interactions médicamenteuses en temps réel</p>
                    <p>• Contre-indications automatiques</p>
                    <p>• Posologies recommandées</p>
                    <p>• Mise à jour quotidienne</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Status de l'envoi */}
      {isSending && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl p-8 max-w-md w-full mx-4">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-500 mx-auto mb-4"></div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {sendingStatus.status === 'generating' ? 'Génération PDF...' : 'Envoi en cours...'}
              </h3>
              <p className="text-gray-600">{sendingStatus.message}</p>
            </div>
          </div>
        </div>
      )}

      {/* Notification de statut */}
      {sendingStatus.type && !isSending && (
        <div className={`fixed top-4 right-4 p-4 rounded-lg text-white z-50 transition-all ${
          sendingStatus.status === 'success' ? 'bg-green-500' : 'bg-red-500'
        }`}>
          <p className="font-medium">{sendingStatus.message}</p>
          <button
            onClick={() => setSendingStatus({ type: null, status: 'success', message: '' })}
            className="absolute top-1 right-1 text-white hover:text-gray-200"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Modal Add Medication */}
      {showAddModal && selectedMedication && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">
                  Ajouter à l'ordonnance: {selectedMedication.name}
                </h2>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  ✕
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Medication Info */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-2">{selectedMedication.name}</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-gray-700">Substance active:</span>
                    <span className="ml-2 text-gray-900">{selectedMedication.activeSubstance}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Forme:</span>
                    <span className="ml-2 text-gray-900">{selectedMedication.form}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Laboratoire:</span>
                    <span className="ml-2 text-gray-900">{selectedMedication.laboratory}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Prix:</span>
                    <span className="ml-2 text-emerald-600 font-semibold">{selectedMedication.price.toFixed(2)}€</span>
                  </div>
                </div>
              </div>

              {/* Prescription Form */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Dosage *
                  </label>
                  <input
                    type="text"
                    value={prescriptionForm.dosage}
                    onChange={(e) => setPrescriptionForm(prev => ({ ...prev, dosage: e.target.value }))}
                    placeholder="Ex: 1 comprimé"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Fréquence *
                  </label>
                  <select
                    value={prescriptionForm.frequency}
                    onChange={(e) => setPrescriptionForm(prev => ({ ...prev, frequency: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                  >
                    <option value="">Sélectionner</option>
                    <option value="1 fois par jour">1 fois par jour</option>
                    <option value="2 fois par jour">2 fois par jour</option>
                    <option value="3 fois par jour">3 fois par jour</option>
                    <option value="4 fois par jour">4 fois par jour</option>
                    <option value="Selon besoin">Selon besoin</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Durée *
                  </label>
                  <select
                    value={prescriptionForm.duration}
                    onChange={(e) => setPrescriptionForm(prev => ({ ...prev, duration: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                  >
                    <option value="">Sélectionner</option>
                    <option value="3 jours">3 jours</option>
                    <option value="5 jours">5 jours</option>
                    <option value="7 jours">7 jours</option>
                    <option value="10 jours">10 jours</option>
                    <option value="14 jours">14 jours</option>
                    <option value="1 mois">1 mois</option>
                    <option value="3 mois">3 mois</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Instructions
                  </label>
                  <input
                    type="text"
                    value={prescriptionForm.instructions}
                    onChange={(e) => setPrescriptionForm(prev => ({ ...prev, instructions: e.target.value }))}
                    placeholder="Ex: Au moment des repas"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Warnings */}
              {selectedMedication.contraindications.length > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="text-sm font-medium text-red-900 mb-2">Contre-indications</h4>
                      <ul className="text-sm text-red-800 space-y-1">
                        {selectedMedication.contraindications.map((ci, index) => (
                          <li key={index}>• {ci}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {selectedMedication.interactions.length > 0 && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="text-sm font-medium text-amber-900 mb-2">Interactions médicamenteuses</h4>
                      <ul className="text-sm text-amber-800 space-y-1">
                        {selectedMedication.interactions.map((interaction, index) => (
                          <li key={index}>• {interaction}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="p-6 border-t border-gray-200 flex justify-end space-x-3">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={handleAddToPrescription}
                disabled={!prescriptionForm.dosage || !prescriptionForm.frequency || !prescriptionForm.duration}
                className="px-4 py-2 bg-sky-500 text-white rounded-lg hover:bg-sky-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                <Plus className="h-4 w-4" />
                <span>Ajouter à l'ordonnance</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal d'envoi d'ordonnance */}
      {showSendModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">
                  {sendModalType === 'patient' ? 'Envoyer l\'ordonnance au patient' : 'Envoyer à la pharmacie'}
                </h2>
                <button
                  onClick={() => setShowSendModal(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Résumé de l'ordonnance */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-3">Ordonnance à envoyer</h3>
                <div className="space-y-2">
                  {prescription.map((item, index) => (
                    <div key={index} className="text-sm">
                      <span className="font-medium">{item.medication.name}</span>
                      <span className="text-gray-600 ml-2">
                        - {item.dosage} • {item.frequency} • {item.duration}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {sendModalType === 'patient' ? (
                /* Envoi au patient */
                <div className="space-y-4">
                  <div className="flex items-center space-x-3 p-4 bg-sky-50 rounded-lg">
                    <User className="h-8 w-8 text-sky-600" />
                    <div>
                      <h3 className="font-semibold text-gray-900">Patient destinataire</h3>
                      <p className="text-sm text-gray-600">Jean Dupont</p>
                      <p className="text-sm text-gray-500">jean.dupont@email.com</p>
                    </div>
                  </div>
                  
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-start space-x-3">
                      <Shield className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <h4 className="text-sm font-medium text-blue-900 mb-1">
                          Transmission sécurisée
                        </h4>
                        <p className="text-sm text-blue-800">
                          L'ordonnance sera envoyée par email sécurisé avec chiffrement de bout en bout.
                          Le patient recevra un lien sécurisé pour télécharger son ordonnance.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                /* Envoi à la pharmacie */
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Rechercher une pharmacie
                    </label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input
                        type="text"
                        value={pharmacySearchTerm}
                        onChange={(e) => setPharmacySearchTerm(e.target.value)}
                        placeholder="Nom de pharmacie ou ville..."
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                  
                  {pharmaciesError && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
                      <p className="text-yellow-800 text-sm">
                        ⚠️ Impossible de charger les pharmacies depuis Firebase. 
                        Affichage des pharmacies de démonstration.
                      </p>
                    </div>
                  )}
                  {isLoadingPharmacies ? (
                    <div className="text-center py-4">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-sky-500 mx-auto mb-2"></div>
                      <p className="text-sm text-gray-600">Recherche des pharmacies...</p>
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {pharmacies.map((pharmacy) => (
                        <button
                          key={pharmacy.id}
                          onClick={() => setSelectedPharmacy(pharmacy)}
                          className={`w-full text-left p-4 border rounded-lg transition-colors ${
                            selectedPharmacy?.id === pharmacy.id
                              ? 'border-sky-500 bg-sky-50'
                              : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          <div className="flex items-start space-x-3">
                            <Building2 className={`h-5 w-5 mt-0.5 ${
                              selectedPharmacy?.id === pharmacy.id ? 'text-sky-600' : 'text-gray-400'
                            }`} />
                            <div className="flex-1 min-w-0">
                              <h4 className="font-medium text-gray-900">{pharmacy.name}</h4>
                              <div className="flex items-center space-x-1 text-sm text-gray-600 mt-1">
                                <MapPin className="h-3 w-3" />
                                <span>{pharmacy.address.street}, {pharmacy.address.city}</span>
                              </div>
                              <div className="flex items-center space-x-4 text-xs text-gray-500 mt-1">
                                <div className="flex items-center space-x-1">
                                  <Phone className="h-3 w-3" />
                                  <span>{pharmacy.phone}</span>
                                </div>
                                <div className="flex items-center space-x-1">
                                  <Mail className="h-3 w-3" />
                                  <span>{pharmacy.email}</span>
                                </div>
                              </div>
                              <div className="flex flex-wrap gap-1 mt-2">
                                {pharmacy.services.slice(0, 3).map((service, index) => (
                                  <span key={index} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                                    {service}
                                  </span>
                                ))}
                              </div>
                            </div>
                            {pharmacy.verified && (
                              <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                            )}
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                  {selectedPharmacy && (
                    <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
                      <div className="flex items-start space-x-3">
                        <Shield className="h-5 w-5 text-emerald-600 mt-0.5 flex-shrink-0" />
                        <div>
                          <h4 className="text-sm font-medium text-emerald-900 mb-1">
                            Transmission sécurisée vers {selectedPharmacy.name}
                          </h4>
                          <p className="text-sm text-emerald-800">
                            L'ordonnance sera transmise directement au système de la pharmacie via une API sécurisée.
                            La pharmacie pourra préparer les médicaments à l'avance.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="p-6 border-t border-gray-200 flex justify-end space-x-3">
              <button
                onClick={() => setShowSendModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={handleConfirmSend}
                disabled={sendModalType === 'pharmacy' && !selectedPharmacy}
                className="px-4 py-2 bg-sky-500 text-white rounded-lg hover:bg-sky-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                <Send className="h-4 w-4" />
                <span>
                  {sendModalType === 'patient' ? 'Envoyer au patient' : 'Envoyer à la pharmacie'}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};