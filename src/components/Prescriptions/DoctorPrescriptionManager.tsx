import React, { useState, useEffect, useMemo } from 'react';
import { 
  Search, 
  Filter, 
  SortAsc, 
  SortDesc, 
  User, 
  Calendar, 
  FileText,
  Clock,
  CheckCircle,
  AlertTriangle,
  XCircle,
  ChevronDown,
  Users,
  Pill,
  Eye,
  Download,
  Send,
  Plus,
  Phone,
  Mail,
  MapPin,
  Activity,
  X
} from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useAuth } from '../../contexts/AuthContext';

interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  medicalRecordNumber: string;
  address: {
    street: string;
    city: string;
    postalCode: string;
  };
  status: 'active' | 'inactive';
  lastConsultation?: string;
}

interface Prescription {
  id: string;
  patientId: string;
  patientName: string;
  patientEmail: string;
  patientPhone: string;
  medicalRecordNumber: string;
  doctorId: string;
  doctorName: string;
  medications: Array<{
    name: string;
    dosage: string;
    frequency: string;
    duration: string;
    instructions?: string;
  }>;
  prescribedDate: string;
  expiryDate: string;
  status: 'active' | 'expired' | 'completed' | 'cancelled';
  notes?: string;
  consultationId?: string;
  transmissionStatus: 'pending' | 'sent_to_patient' | 'sent_to_pharmacy' | 'both';
  createdAt: string;
}

type SortField = 'patientName' | 'prescribedDate' | 'status' | 'expiryDate';
type SortOrder = 'asc' | 'desc';

export const DoctorPrescriptionManager: React.FC = () => {
  const { user } = useAuth();
  
  // State management
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<SortField>('prescribedDate');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedPrescription, setSelectedPrescription] = useState<Prescription | null>(null);
  const [showPrescriptionModal, setShowPrescriptionModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  // Mock data - In production, this would come from Firebase/API
  const [patients] = useState<Patient[]>([
    {
      id: '1',
      firstName: 'Jean',
      lastName: 'Dupont',
      email: 'jean.dupont@email.com',
      phone: '+33123456789',
      dateOfBirth: '1985-06-15',
      medicalRecordNumber: 'MRN001234',
      address: {
        street: '123 Rue de la République',
        city: 'Paris',
        postalCode: '75001'
      },
      status: 'active',
      lastConsultation: '2025-01-10T10:00:00Z'
    },
    {
      id: '2',
      firstName: 'Marie',
      lastName: 'Martin',
      email: 'marie.martin@email.com',
      phone: '+33234567890',
      dateOfBirth: '1992-03-22',
      medicalRecordNumber: 'MRN001235',
      address: {
        street: '45 Avenue des Champs',
        city: 'Lyon',
        postalCode: '69002'
      },
      status: 'active',
      lastConsultation: '2025-01-08T15:00:00Z'
    },
    {
      id: '3',
      firstName: 'Pierre',
      lastName: 'Durand',
      email: 'pierre.durand@email.com',
      phone: '+33345678901',
      dateOfBirth: '1978-11-08',
      medicalRecordNumber: 'MRN001236',
      address: {
        street: '78 Boulevard Saint-Germain',
        city: 'Marseille',
        postalCode: '13001'
      },
      status: 'active',
      lastConsultation: '2024-12-15T11:30:00Z'
    },
    {
      id: '4',
      firstName: 'Sophie',
      lastName: 'Dubois',
      email: 'sophie.dubois@email.com',
      phone: '+33456789012',
      dateOfBirth: '1990-09-12',
      medicalRecordNumber: 'MRN001237',
      address: {
        street: '12 Rue Victor Hugo',
        city: 'Toulouse',
        postalCode: '31000'
      },
      status: 'active',
      lastConsultation: '2025-01-05T09:30:00Z'
    },
    {
      id: '5',
      firstName: 'Antoine',
      lastName: 'Jaombelo',
      email: 'antoine.jaombelo@email.com',
      phone: '+33567890123',
      dateOfBirth: '1988-04-25',
      medicalRecordNumber: 'MRN001238',
      address: {
        street: '89 Rue de Rivoli',
        city: 'Nice',
        postalCode: '06000'
      },
      status: 'active',
      lastConsultation: '2025-01-12T16:45:00Z'
    }
  ]);

  const [prescriptions] = useState<Prescription[]>([
    {
      id: '1',
      patientId: '1',
      patientName: 'Jean Dupont',
      patientEmail: 'jean.dupont@email.com',
      patientPhone: '+33123456789',
      medicalRecordNumber: 'MRN001234',
      doctorId: 'doc1',
      doctorName: 'Dr. Marie Leblanc',
      medications: [
        {
          name: 'Amoxicilline 500mg',
          dosage: '1 comprimé',
          frequency: '3 fois par jour',
          duration: '7 jours',
          instructions: 'À prendre au moment des repas'
        },
        {
          name: 'Paracétamol 1000mg',
          dosage: '1 comprimé',
          frequency: 'Selon besoin',
          duration: '7 jours',
          instructions: 'Maximum 4 comprimés par jour'
        }
      ],
      prescribedDate: '2025-01-10T10:00:00Z',
      expiryDate: '2025-01-17T10:00:00Z',
      status: 'active',
      notes: 'Infection respiratoire haute - Contrôle dans 1 semaine',
      consultationId: 'cons1',
      transmissionStatus: 'sent_to_patient',
      createdAt: '2025-01-10T10:00:00Z'
    },
    {
      id: '2',
      patientId: '2',
      patientName: 'Marie Martin',
      patientEmail: 'marie.martin@email.com',
      patientPhone: '+33234567890',
      medicalRecordNumber: 'MRN001235',
      doctorId: 'doc1',
      doctorName: 'Dr. Marie Leblanc',
      medications: [
        {
          name: 'Ventoline 100µg',
          dosage: '2 bouffées',
          frequency: 'Selon besoin',
          duration: '1 mois',
          instructions: 'En cas de crise d\'asthme'
        },
        {
          name: 'Seretide 25/125µg',
          dosage: '2 bouffées',
          frequency: '2 fois par jour',
          duration: '3 mois',
          instructions: 'Traitement de fond - matin et soir'
        }
      ],
      prescribedDate: '2025-01-08T15:00:00Z',
      expiryDate: '2025-02-08T15:00:00Z',
      status: 'active',
      notes: 'Crise d\'asthme légère - Ajustement du traitement de fond',
      consultationId: 'cons2',
      transmissionStatus: 'both',
      createdAt: '2025-01-08T15:00:00Z'
    },
    {
      id: '3',
      patientId: '3',
      patientName: 'Pierre Durand',
      patientEmail: 'pierre.durand@email.com',
      patientPhone: '+33345678901',
      medicalRecordNumber: 'MRN001236',
      doctorId: 'doc1',
      doctorName: 'Dr. Marie Leblanc',
      medications: [
        {
          name: 'Lisinopril 10mg',
          dosage: '1 comprimé',
          frequency: '1 fois par jour',
          duration: '3 mois',
          instructions: 'Le matin à jeun'
        }
      ],
      prescribedDate: '2024-12-15T14:30:00Z',
      expiryDate: '2025-03-15T14:30:00Z',
      status: 'completed',
      notes: 'Hypertension artérielle - Surveillance dans 3 mois',
      consultationId: 'cons3',
      transmissionStatus: 'sent_to_patient',
      createdAt: '2024-12-15T14:30:00Z'
    },
    {
      id: '4',
      patientId: '4',
      patientName: 'Sophie Dubois',
      patientEmail: 'sophie.dubois@email.com',
      patientPhone: '+33456789012',
      medicalRecordNumber: 'MRN001237',
      doctorId: 'doc1',
      doctorName: 'Dr. Marie Leblanc',
      medications: [
        {
          name: 'Ibuprofène 400mg',
          dosage: '1 comprimé',
          frequency: '3 fois par jour',
          duration: '5 jours',
          instructions: 'Pendant les repas'
        }
      ],
      prescribedDate: '2024-11-20T09:00:00Z',
      expiryDate: '2024-11-25T09:00:00Z',
      status: 'expired',
      notes: 'Douleurs post-opératoires',
      consultationId: 'cons4',
      transmissionStatus: 'pending',
      createdAt: '2024-11-20T09:00:00Z'
    },
    {
      id: '5',
      patientId: '5',
      patientName: 'Antoine Jaombelo',
      patientEmail: 'antoine.jaombelo@email.com',
      patientPhone: '+33567890123',
      medicalRecordNumber: 'MRN001238',
      doctorId: 'doc1',
      doctorName: 'Dr. Marie Leblanc',
      medications: [
        {
          name: 'Oméprazole 20mg',
          dosage: '1 gélule',
          frequency: '1 fois par jour',
          duration: '1 mois',
          instructions: 'Le matin avant le petit-déjeuner'
        }
      ],
      prescribedDate: '2025-01-12T11:30:00Z',
      expiryDate: '2025-02-12T11:30:00Z',
      status: 'active',
      notes: 'Reflux gastro-œsophagien',
      consultationId: 'cons5',
      transmissionStatus: 'sent_to_pharmacy',
      createdAt: '2025-01-12T11:30:00Z'
    }
  ]);

  // Real-time search and filtering
  const filteredAndSortedPrescriptions = useMemo(() => {
    let filtered = prescriptions;

    // Filter by search term (patient name, ID, or medical record number)
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(prescription => {
        const patient = patients.find(p => p.id === prescription.patientId);
        if (!patient) return false;
        
        return (
          prescription.patientName.toLowerCase().includes(searchLower) ||
          patient.firstName.toLowerCase().includes(searchLower) ||
          patient.lastName.toLowerCase().includes(searchLower) ||
          patient.id.toLowerCase().includes(searchLower) ||
          patient.medicalRecordNumber.toLowerCase().includes(searchLower) ||
          prescription.medicalRecordNumber.toLowerCase().includes(searchLower) ||
          prescription.medications.some(med => 
            med.name.toLowerCase().includes(searchLower)
          )
        );
      });
    }

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(prescription => prescription.status === statusFilter);
    }

    // Sort prescriptions
    const sorted = [...filtered].sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'patientName':
          comparison = a.patientName.localeCompare(b.patientName);
          break;
        case 'prescribedDate':
          comparison = new Date(a.prescribedDate).getTime() - new Date(b.prescribedDate).getTime();
          break;
        case 'expiryDate':
          comparison = new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime();
          break;
        case 'status':
          comparison = a.status.localeCompare(b.status);
          break;
        default:
          comparison = 0;
      }
      
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return sorted;
  }, [prescriptions, patients, searchTerm, statusFilter, sortBy, sortOrder]);

  // Get patient details for a prescription
  const getPatientDetails = (patientId: string): Patient | null => {
    return patients.find(p => p.id === patientId) || null;
  };

  // Calculate age from date of birth
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

  // Get status display configuration
  const getStatusDisplay = (status: string) => {
    const statusConfig = {
      active: { color: 'text-green-700 bg-green-100', icon: CheckCircle, label: 'Active' },
      expired: { color: 'text-red-700 bg-red-100', icon: XCircle, label: 'Expirée' },
      completed: { color: 'text-blue-700 bg-blue-100', icon: CheckCircle, label: 'Terminée' },
      cancelled: { color: 'text-gray-700 bg-gray-100', icon: XCircle, label: 'Annulée' }
    };
    
    return statusConfig[status as keyof typeof statusConfig] || statusConfig.active;
  };

  // Get transmission status display
  const getTransmissionStatusDisplay = (status: string) => {
    const statusConfig = {
      pending: { color: 'text-amber-700 bg-amber-100', label: 'En attente' },
      sent_to_patient: { color: 'text-blue-700 bg-blue-100', label: 'Envoyée au patient' },
      sent_to_pharmacy: { color: 'text-emerald-700 bg-emerald-100', label: 'Envoyée à la pharmacie' },
      both: { color: 'text-purple-700 bg-purple-100', label: 'Envoyée (patient + pharmacie)' }
    };
    
    return statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
  };

  // Handle sort change
  const handleSortChange = (field: SortField) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  // Clear all filters
  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setSortBy('prescribedDate');
    setSortOrder('desc');
  };

  // Handle prescription actions
  const handleViewPrescription = (prescription: Prescription) => {
    setSelectedPrescription(prescription);
    setShowPrescriptionModal(true);
  };

  const handleDownloadPrescription = (prescription: Prescription) => {
    const patient = getPatientDetails(prescription.patientId);
    
    const prescriptionContent = `ORDONNANCE MÉDICALE

Patient: ${prescription.patientName}
N° Dossier Médical: ${prescription.medicalRecordNumber}
Email: ${prescription.patientEmail}
Téléphone: ${prescription.patientPhone}
${patient ? `Adresse: ${patient.address.street}, ${patient.address.city} ${patient.address.postalCode}` : ''}

Médecin: ${prescription.doctorName}
Date de prescription: ${format(new Date(prescription.prescribedDate), 'dd/MM/yyyy à HH:mm', { locale: fr })}
Date d'expiration: ${format(new Date(prescription.expiryDate), 'dd/MM/yyyy', { locale: fr })}

MÉDICAMENTS PRESCRITS:
${prescription.medications.map((med, index) => `
${index + 1}. ${med.name}
   Dosage: ${med.dosage}
   Fréquence: ${med.frequency}
   Durée: ${med.duration}
   ${med.instructions ? `Instructions: ${med.instructions}` : ''}
`).join('')}

${prescription.notes ? `NOTES MÉDICALES:\n${prescription.notes}` : ''}

Statut: ${getStatusDisplay(prescription.status).label}
Transmission: ${getTransmissionStatusDisplay(prescription.transmissionStatus).label}

---
Document généré le ${format(new Date(), 'dd/MM/yyyy à HH:mm', { locale: fr })}
Docteurs O.I - Plateforme de télémédecine sécurisée`;

    const blob = new Blob([prescriptionContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `ordonnance-${prescription.patientName.replace(/\s+/g, '-').toLowerCase()}-${format(new Date(prescription.prescribedDate), 'yyyy-MM-dd')}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleSendPrescription = (prescription: Prescription, target: 'patient' | 'pharmacy') => {
    alert(`Envoi de l'ordonnance de ${prescription.patientName} ${target === 'patient' ? 'au patient' : 'à la pharmacie'}`);
  };

  // Calculate statistics
  const prescriptionStats = useMemo(() => {
    const total = prescriptions.length;
    const active = prescriptions.filter(p => p.status === 'active').length;
    const expired = prescriptions.filter(p => p.status === 'expired').length;
    const completed = prescriptions.filter(p => p.status === 'completed').length;
    const uniquePatients = new Set(prescriptions.map(p => p.patientId)).size;
    
    return { total, active, expired, completed, uniquePatients };
  }, [prescriptions]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-sky-500 rounded-lg flex items-center justify-center">
              <Pill className="h-7 w-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Gestion des ordonnances</h1>
              <p className="text-gray-600">
                Consultez et gérez toutes les ordonnances prescrites à vos patients
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="hidden md:flex items-center space-x-4 text-sm text-gray-600">
              <div className="text-center">
                <p className="text-xl font-bold text-gray-900">{prescriptionStats.total}</p>
                <p>Total</p>
              </div>
              <div className="text-center">
                <p className="text-xl font-bold text-green-600">{prescriptionStats.active}</p>
                <p>Actives</p>
              </div>
              <div className="text-center">
                <p className="text-xl font-bold text-sky-600">{prescriptionStats.uniquePatients}</p>
                <p>Patients</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex flex-col gap-4">
            {/* Search Bar */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher patient ou médicament..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent text-base"
              />
            </div>

            {/* Quick Filters */}
            <div className="flex flex-col sm:flex-row gap-3">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full sm:w-auto px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
              >
                <option value="all">Tous les statuts</option>
                <option value="active">Actives</option>
                <option value="expired">Expirées</option>
                <option value="completed">Terminées</option>
                <option value="cancelled">Annulées</option>
              </select>

              <button
                onClick={() => setShowFilters(!showFilters)}
                className="w-full sm:w-auto flex items-center justify-center space-x-2 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Filter className="h-4 w-4" />
                <span>Filtres</span>
                <ChevronDown className={`h-4 w-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
              </button>
            </div>
          </div>
        </div>

        {/* Advanced Filters */}
        {showFilters && (
          <div className="p-6 border-b border-gray-200 bg-gray-50">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Trier par
                  </label>
                  <div className="space-y-2">
                    {[
                      { value: 'patientName', label: 'Nom du patient' },
                      { value: 'prescribedDate', label: 'Date de prescription' },
                      { value: 'expiryDate', label: 'Date d\'expiration' },
                      { value: 'status', label: 'Statut' }
                    ].map((option) => (
                      <button
                        key={option.value}
                        onClick={() => handleSortChange(option.value as SortField)}
                        className={`w-full flex items-center justify-between px-3 py-2 text-sm rounded-lg border transition-colors ${
                          sortBy === option.value
                            ? 'border-sky-500 bg-sky-50 text-sky-700'
                            : 'border-gray-200 text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        <span>{option.label}</span>
                        {sortBy === option.value && (
                          sortOrder === 'asc' ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Patient Status Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Statut patient
                  </label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent">
                    <option value="all">Tous les patients</option>
                    <option value="active">Patients actifs</option>
                    <option value="inactive">Patients inactifs</option>
                  </select>
                </div>

                {/* Transmission Status Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Statut d'envoi
                  </label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent">
                    <option value="all">Tous les envois</option>
                    <option value="pending">En attente</option>
                    <option value="sent_to_patient">Envoyée au patient</option>
                    <option value="sent_to_pharmacy">Envoyée à la pharmacie</option>
                    <option value="both">Envoyée (patient + pharmacie)</option>
                  </select>
                </div>

                {/* Clear Filters */}
                <div className="flex items-end">
                  <button
                    onClick={clearFilters}
                    className="w-full flex items-center justify-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <X className="h-4 w-4" />
                    <span>Effacer filtres</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Results Summary */}
        <div className="p-6">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>
              {filteredAndSortedPrescriptions.length} ordonnance{filteredAndSortedPrescriptions.length > 1 ? 's' : ''} trouvée{filteredAndSortedPrescriptions.length > 1 ? 's' : ''}
              {searchTerm && ` pour "${searchTerm}"`}
            </span>
            <span>
              Triées par {sortBy === 'patientName' ? 'nom du patient' : 
                         sortBy === 'prescribedDate' ? 'date de prescription' :
                         sortBy === 'expiryDate' ? 'date d\'expiration' : 'statut'} 
              ({sortOrder === 'asc' ? 'croissant' : 'décroissant'})
            </span>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 text-center">
          <FileText className="h-8 w-8 text-sky-500 mx-auto mb-3" />
          <p className="text-2xl font-bold text-gray-900">{prescriptionStats.total}</p>
          <p className="text-sm text-gray-600">Total ordonnances</p>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 text-center">
          <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-3" />
          <p className="text-2xl font-bold text-green-600">{prescriptionStats.active}</p>
          <p className="text-sm text-gray-600">Actives</p>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 text-center">
          <XCircle className="h-8 w-8 text-red-500 mx-auto mb-3" />
          <p className="text-2xl font-bold text-red-600">{prescriptionStats.expired}</p>
          <p className="text-sm text-gray-600">Expirées</p>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 text-center">
          <CheckCircle className="h-8 w-8 text-blue-500 mx-auto mb-3" />
          <p className="text-2xl font-bold text-blue-600">{prescriptionStats.completed}</p>
          <p className="text-sm text-gray-600">Terminées</p>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 text-center">
          <Users className="h-8 w-8 text-purple-500 mx-auto mb-3" />
          <p className="text-2xl font-bold text-purple-600">{prescriptionStats.uniquePatients}</p>
          <p className="text-sm text-gray-600">Patients uniques</p>
        </div>
      </div>

      {/* Prescriptions List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            Ordonnances prescrites
          </h2>
        </div>

        <div className="p-6">
          {filteredAndSortedPrescriptions.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Aucune ordonnance trouvée
              </h3>
              <p className="text-gray-600 mb-4">
                {searchTerm || statusFilter !== 'all'
                  ? 'Aucune ordonnance ne correspond à vos critères de recherche.'
                  : 'Aucune ordonnance prescrite pour le moment.'
                }
              </p>
              {(searchTerm || statusFilter !== 'all') && (
                <button
                  onClick={clearFilters}
                  className="w-full sm:w-auto flex items-center justify-center space-x-2 px-3 py-3 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Effacer les filtres
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredAndSortedPrescriptions.map((prescription) => {
                const patient = getPatientDetails(prescription.patientId);
                const statusDisplay = getStatusDisplay(prescription.status);
                const transmissionDisplay = getTransmissionStatusDisplay(prescription.transmissionStatus);
                const StatusIcon = statusDisplay.icon;
                
                return (
                  <div
                    key={prescription.id}
                    className="border border-gray-200 rounded-lg p-4 sm:p-6 hover:bg-gray-50 transition-colors"
                  >
                    {/* Header with Patient Info */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-start space-x-4">
                        <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-sky-400 to-emerald-400 rounded-full flex items-center justify-center">
                          <span className="text-white font-bold text-lg">
                            {prescription.patientName.split(' ').map(n => n[0]).join('')}
                          </span>
                        </div>
                        <div className="min-w-0 flex-1">
                          <h3 className="text-lg sm:text-xl font-semibold text-gray-900 truncate">
                            {prescription.patientName}
                          </h3>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 sm:gap-2 text-xs sm:text-sm text-gray-600 mt-1">
                            <div className="flex items-center space-x-1">
                              <User className="h-4 w-4" />
                              <span className="truncate">ID: {prescription.patientId}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <FileText className="h-4 w-4" />
                              <span className="truncate">N°: {prescription.medicalRecordNumber}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Mail className="h-4 w-4" />
                              <span className="truncate">{prescription.patientEmail}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Phone className="h-4 w-4" />
                              <span>{prescription.patientPhone}</span>
                            </div>
                          </div>
                          {patient && (
                            <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 text-xs sm:text-sm text-gray-500 mt-2 space-y-1 sm:space-y-0">
                              <span>Âge: {calculateAge(patient.dateOfBirth)} ans</span>
                              <span className="hidden sm:inline">•</span>
                              <div className="flex items-center space-x-1">
                                <MapPin className="h-3 w-3" />
                                <span>{patient.address.city} ({patient.address.postalCode})</span>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex flex-col items-end space-y-2">
                        <div className="text-right">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${statusDisplay.color}`}>
                            <StatusIcon className="h-4 w-4 mr-1" />
                            {statusDisplay.label}
                          </span>
                          <div className="mt-1">
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${transmissionDisplay.color}`}>
                              {transmissionDisplay.label}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Prescription Details */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-4">
                      <div>
                        <h4 className="font-medium text-gray-900 mb-3">Informations de prescription</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex items-center space-x-2">
                            <Calendar className="h-4 w-4 text-gray-400" />
                            <span className="text-gray-600">Prescrite le:</span>
                            <span className="font-medium text-gray-900">
                              {format(new Date(prescription.prescribedDate), 'dd/MM/yyyy à HH:mm', { locale: fr })}
                            </span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Clock className="h-4 w-4 text-gray-400" />
                            <span className="text-gray-600">Expire le:</span>
                            <span className="font-medium text-gray-900">
                              {format(new Date(prescription.expiryDate), 'dd/MM/yyyy', { locale: fr })}
                            </span>
                          </div>
                          {prescription.consultationId && (
                            <div className="flex items-center space-x-2">
                              <Activity className="h-4 w-4 text-gray-400" />
                              <span className="text-gray-600">Consultation:</span>
                              <span className="font-medium text-gray-900">{prescription.consultationId}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div>
                        <h4 className="font-medium text-gray-900 mb-3">Médicaments prescrits ({prescription.medications.length})</h4>
                        <div className="space-y-2">
                          {prescription.medications.slice(0, 2).map((med, index) => (
                            <div key={index} className="bg-gray-50 rounded-lg p-3">
                              <h5 className="font-medium text-gray-900 text-sm">{med.name}</h5>
                              <div className="grid grid-cols-1 sm:grid-cols-3 gap-1 sm:gap-2 text-xs text-gray-600 mt-1">
                                <span><strong>Dosage:</strong> {med.dosage}</span>
                                <span><strong>Fréquence:</strong> {med.frequency}</span>
                                <span><strong>Durée:</strong> {med.duration}</span>
                              </div>
                            </div>
                          ))}
                          {prescription.medications.length > 2 && (
                            <div className="text-sm text-gray-500 text-center py-2">
                              +{prescription.medications.length - 2} autre{prescription.medications.length - 2 > 1 ? 's' : ''} médicament{prescription.medications.length - 2 > 1 ? 's' : ''}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Notes */}
                    {prescription.notes && (
                      <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <p className="text-sm text-blue-800">
                          <strong>Notes médicales:</strong> {prescription.notes}
                        </p>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pt-4 border-t border-gray-200 space-y-3 sm:space-y-0">
                      <div className="flex flex-wrap gap-2 sm:gap-3">
                        <button
                          onClick={() => handleViewPrescription(prescription)}
                          className="flex items-center space-x-2 px-3 py-2 text-sky-600 hover:text-sky-700 hover:bg-sky-50 rounded-lg transition-colors text-sm"
                        >
                          <Eye className="h-4 w-4" />
                          <span className="hidden sm:inline">Voir détails</span>
                          <span className="sm:hidden">Voir</span>
                        </button>
                        <button
                          onClick={() => handleDownloadPrescription(prescription)}
                          className="flex items-center space-x-2 px-3 py-2 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors text-sm"
                        >
                          <Download className="h-4 w-4" />
                          <span className="hidden sm:inline">Télécharger</span>
                          <span className="sm:hidden">PDF</span>
                        </button>
                      </div>
                      
                      <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                        {prescription.transmissionStatus === 'pending' && (
                          <>
                            <button
                              onClick={() => handleSendPrescription(prescription, 'patient')}
                              className="flex-1 sm:flex-none flex items-center justify-center space-x-2 px-3 py-2 bg-sky-500 text-white rounded-lg hover:bg-sky-600 transition-colors text-sm"
                            >
                              <Send className="h-4 w-4" />
                              <span className="hidden sm:inline">Envoyer au patient</span>
                              <span className="sm:hidden">Patient</span>
                            </button>
                            <button
                              onClick={() => handleSendPrescription(prescription, 'pharmacy')}
                              className="flex-1 sm:flex-none flex items-center justify-center space-x-2 px-3 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors text-sm"
                            >
                              <Send className="h-4 w-4" />
                              <span className="hidden sm:inline">Envoyer à la pharmacie</span>
                              <span className="sm:hidden">Pharmacie</span>
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Prescription Detail Modal */}
      {showPrescriptionModal && selectedPrescription && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[95vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-sky-400 to-emerald-400 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold">
                      {selectedPrescription.patientName.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">
                      Ordonnance - {selectedPrescription.patientName}
                    </h2>
                    <p className="text-sm text-gray-600">
                      N° {selectedPrescription.id} • {selectedPrescription.medicalRecordNumber}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowPrescriptionModal(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Patient Information */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-3">Informations patient</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-gray-700">Nom complet:</span>
                    <span className="ml-2 text-gray-900">{selectedPrescription.patientName}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">N° Dossier médical:</span>
                    <span className="ml-2 text-gray-900">{selectedPrescription.medicalRecordNumber}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Email:</span>
                    <span className="ml-2 text-gray-900">{selectedPrescription.patientEmail}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Téléphone:</span>
                    <span className="ml-2 text-gray-900">{selectedPrescription.patientPhone}</span>
                  </div>
                  {(() => {
                    const patient = getPatientDetails(selectedPrescription.patientId);
                    return patient ? (
                      <>
                        <div>
                          <span className="font-medium text-gray-700">Âge:</span>
                          <span className="ml-2 text-gray-900">{calculateAge(patient.dateOfBirth)} ans</span>
                        </div>
                        <div>
                          <span className="font-medium text-gray-700">Adresse:</span>
                          <span className="ml-2 text-gray-900">
                            {patient.address.street}, {patient.address.city} {patient.address.postalCode}
                          </span>
                        </div>
                      </>
                    ) : null;
                  })()}
                </div>
              </div>

              {/* Prescription Details */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Détails de l'ordonnance</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm mb-4">
                  <div>
                    <span className="font-medium text-gray-700">Date de prescription:</span>
                    <span className="ml-2 text-gray-900">
                      {format(new Date(selectedPrescription.prescribedDate), 'dd/MM/yyyy à HH:mm', { locale: fr })}
                    </span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Date d'expiration:</span>
                    <span className="ml-2 text-gray-900">
                      {format(new Date(selectedPrescription.expiryDate), 'dd/MM/yyyy', { locale: fr })}
                    </span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Statut:</span>
                    <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${getStatusDisplay(selectedPrescription.status).color}`}>
                      {getStatusDisplay(selectedPrescription.status).label}
                    </span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Transmission:</span>
                    <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${getTransmissionStatusDisplay(selectedPrescription.transmissionStatus).color}`}>
                      {getTransmissionStatusDisplay(selectedPrescription.transmissionStatus).label}
                    </span>
                  </div>
                </div>

                {/* Medications */}
                <div className="space-y-3">
                  <h4 className="font-medium text-gray-900">Médicaments prescrits:</h4>
                  {selectedPrescription.medications.map((med, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4">
                      <h5 className="font-semibold text-gray-900 mb-2">{med.name}</h5>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
                        <div>
                          <span className="font-medium text-gray-700">Dosage:</span>
                          <span className="ml-2 text-gray-900">{med.dosage}</span>
                        </div>
                        <div>
                          <span className="font-medium text-gray-700">Fréquence:</span>
                          <span className="ml-2 text-gray-900">{med.frequency}</span>
                        </div>
                        <div>
                          <span className="font-medium text-gray-700">Durée:</span>
                          <span className="ml-2 text-gray-900">{med.duration}</span>
                        </div>
                      </div>
                      {med.instructions && (
                        <div className="mt-2 p-2 bg-amber-50 border border-amber-200 rounded">
                          <span className="font-medium text-amber-800">Instructions:</span>
                          <span className="ml-2 text-amber-700">{med.instructions}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Notes */}
                {selectedPrescription.notes && (
                  <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <h4 className="font-medium text-blue-900 mb-2">Notes médicales:</h4>
                    <p className="text-blue-800">{selectedPrescription.notes}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Modal Actions */}
            <div className="p-6 border-t border-gray-200 flex justify-between">
              <div className="flex space-x-3">
                <button
                  onClick={() => handleDownloadPrescription(selectedPrescription)}
                  className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <Download className="h-4 w-4" />
                  <span>Télécharger PDF</span>
                </button>
              </div>
              
              <div className="flex space-x-3">
                {selectedPrescription.transmissionStatus === 'pending' && (
                  <>
                    <button
                      onClick={() => handleSendPrescription(selectedPrescription, 'patient')}
                      className="flex items-center space-x-2 px-4 py-2 bg-sky-500 text-white rounded-lg hover:bg-sky-600 transition-colors"
                    >
                      <Send className="h-4 w-4" />
                      <span>Envoyer au patient</span>
                    </button>
                    <button
                      onClick={() => handleSendPrescription(selectedPrescription, 'pharmacy')}
                      className="flex items-center space-x-2 px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors"
                    >
                      <Send className="h-4 w-4" />
                      <span>Envoyer à la pharmacie</span>
                    </button>
                  </>
                )}
                <button
                  onClick={() => setShowPrescriptionModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Fermer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};