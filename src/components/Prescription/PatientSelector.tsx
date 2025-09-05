import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Filter, 
  User, 
  Calendar, 
  Phone, 
  Mail, 
  MapPin,
  ChevronDown,
  ChevronUp,
  X,
  Users,
  Activity,
  Clock,
  FileText,
  Plus,
  Eye,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  medicalRecordNumber: string;
  gender: string;
  address: {
    street: string;
    city: string;
    postalCode: string;
    country: string;
  };
  status: 'active' | 'inactive';
  consultationsCount: number;
  lastConsultation?: string;
  nextAppointment?: string;
  medicalInfo: {
    allergies: string;
    bloodType: string;
    currentMedications: string;
    medicalHistory: string;
  };
  insurance: {
    provider: string;
    policyNumber: string;
  };
  createdAt: string;
  updatedAt: string;
}

interface PatientSelectorProps {
  onPatientSelect: (patient: Patient) => void;
  selectedPatient: Patient | null;
  onCreatePrescription: (patient: Patient) => void;
}

export const PatientSelector: React.FC<PatientSelectorProps> = ({
  onPatientSelect,
  selectedPatient,
  onCreatePrescription
}) => {
  // State management
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [genderFilter, setGenderFilter] = useState<'all' | 'Homme' | 'Femme' | 'Autre'>('all');
  const [ageRange, setAgeRange] = useState({ min: '', max: '' });
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [patientsPerPage] = useState(10);
  const [sortBy, setSortBy] = useState<'name' | 'age' | 'lastConsultation' | 'status'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [loading, setLoading] = useState(false);
  const [expandedPatient, setExpandedPatient] = useState<string | null>(null);

  // Mock patient data - In production, this would come from Firebase/API
  const [allPatients] = useState<Patient[]>([
    {
      id: 'P001',
      firstName: 'Jean',
      lastName: 'Dupont',
      email: 'jean.dupont@email.com',
      phone: '+33123456789',
      dateOfBirth: '1985-06-15',
      medicalRecordNumber: 'MRN001234',
      gender: 'Homme',
      address: {
        street: '123 Rue de la République',
        city: 'Paris',
        postalCode: '75001',
        country: 'France'
      },
      status: 'active',
      consultationsCount: 12,
      lastConsultation: '2025-01-10T10:00:00Z',
      nextAppointment: '2025-01-20T14:30:00Z',
      medicalInfo: {
        allergies: 'Pénicilline',
        bloodType: 'A+',
        currentMedications: 'Lisinopril 10mg',
        medicalHistory: 'Hypertension artérielle'
      },
      insurance: {
        provider: 'CPAM Paris',
        policyNumber: '1234567890123'
      },
      createdAt: '2024-01-15T08:00:00Z',
      updatedAt: '2025-01-10T10:00:00Z'
    },
    {
      id: 'P002',
      firstName: 'Marie',
      lastName: 'Martin',
      email: 'marie.martin@email.com',
      phone: '+33234567890',
      dateOfBirth: '1992-03-22',
      medicalRecordNumber: 'MRN001235',
      gender: 'Femme',
      address: {
        street: '45 Avenue des Champs',
        city: 'Lyon',
        postalCode: '69002',
        country: 'France'
      },
      status: 'active',
      consultationsCount: 5,
      lastConsultation: '2025-01-08T15:00:00Z',
      nextAppointment: undefined,
      medicalInfo: {
        allergies: 'Aucune allergie connue',
        bloodType: 'O-',
        currentMedications: 'Ventoline',
        medicalHistory: 'Asthme léger'
      },
      insurance: {
        provider: 'Mutuelle Lyon',
        policyNumber: '2345678901234'
      },
      createdAt: '2024-03-10T09:30:00Z',
      updatedAt: '2025-01-08T15:00:00Z'
    },
    {
      id: 'P003',
      firstName: 'Pierre',
      lastName: 'Durand',
      email: 'pierre.durand@email.com',
      phone: '+33345678901',
      dateOfBirth: '1978-11-08',
      medicalRecordNumber: 'MRN001236',
      gender: 'Homme',
      address: {
        street: '78 Boulevard Saint-Germain',
        city: 'Marseille',
        postalCode: '13001',
        country: 'France'
      },
      status: 'inactive',
      consultationsCount: 8,
      lastConsultation: '2024-12-15T11:30:00Z',
      nextAppointment: '2025-01-16T09:00:00Z',
      medicalInfo: {
        allergies: 'Arachides, Fruits de mer',
        bloodType: 'B+',
        currentMedications: 'Atorvastatine 20mg',
        medicalHistory: 'Cholestérol élevé, Diabète type 2'
      },
      insurance: {
        provider: 'CPAM Marseille',
        policyNumber: '3456789012345'
      },
      createdAt: '2024-02-20T14:15:00Z',
      updatedAt: '2024-12-15T11:30:00Z'
    },
    {
      id: 'P004',
      firstName: 'Sophie',
      lastName: 'Dubois',
      email: 'sophie.dubois@email.com',
      phone: '+33456789012',
      dateOfBirth: '1990-09-12',
      medicalRecordNumber: 'MRN001237',
      gender: 'Femme',
      address: {
        street: '12 Rue Victor Hugo',
        city: 'Toulouse',
        postalCode: '31000',
        country: 'France'
      },
      status: 'active',
      consultationsCount: 3,
      lastConsultation: '2025-01-05T09:30:00Z',
      nextAppointment: undefined,
      medicalInfo: {
        allergies: 'Latex',
        bloodType: 'AB+',
        currentMedications: 'Aucun',
        medicalHistory: 'Aucun antécédent particulier'
      },
      insurance: {
        provider: 'Mutuelle Toulouse',
        policyNumber: '4567890123456'
      },
      createdAt: '2024-05-12T11:20:00Z',
      updatedAt: '2025-01-05T09:30:00Z'
    },
    {
      id: 'P005',
      firstName: 'Antoine',
      lastName: 'Jaombelo',
      email: 'antoine.jaombelo@email.com',
      phone: '+33567890123',
      dateOfBirth: '1988-04-25',
      medicalRecordNumber: 'MRN001238',
      gender: 'Homme',
      address: {
        street: '89 Rue de Rivoli',
        city: 'Nice',
        postalCode: '06000',
        country: 'France'
      },
      status: 'active',
      consultationsCount: 7,
      lastConsultation: '2025-01-12T16:45:00Z',
      nextAppointment: '2025-01-18T10:15:00Z',
      medicalInfo: {
        allergies: 'Aspirine',
        bloodType: 'O+',
        currentMedications: 'Oméprazole 20mg',
        medicalHistory: 'Reflux gastro-œsophagien'
      },
      insurance: {
        provider: 'CPAM Nice',
        policyNumber: '5678901234567'
      },
      createdAt: '2024-04-08T13:45:00Z',
      updatedAt: '2025-01-12T16:45:00Z'
    }
  ]);

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

  // Filter and sort patients
  const filteredAndSortedPatients = useMemo(() => {
    let filtered = allPatients;

    // Apply search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(patient => 
        patient.firstName.toLowerCase().includes(searchLower) ||
        patient.lastName.toLowerCase().includes(searchLower) ||
        `${patient.firstName} ${patient.lastName}`.toLowerCase().includes(searchLower) ||
        patient.email.toLowerCase().includes(searchLower) ||
        patient.medicalRecordNumber.toLowerCase().includes(searchLower) ||
        patient.id.toLowerCase().includes(searchLower) ||
        patient.phone.includes(searchTerm)
      );
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(patient => patient.status === statusFilter);
    }

    // Apply gender filter
    if (genderFilter !== 'all') {
      filtered = filtered.filter(patient => patient.gender === genderFilter);
    }

    // Apply age range filter
    if (ageRange.min || ageRange.max) {
      filtered = filtered.filter(patient => {
        const age = calculateAge(patient.dateOfBirth);
        const minAge = ageRange.min ? parseInt(ageRange.min) : 0;
        const maxAge = ageRange.max ? parseInt(ageRange.max) : 150;
        return age >= minAge && age <= maxAge;
      });
    }

    // Sort patients
    const sorted = [...filtered].sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'name':
          comparison = `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`);
          break;
        case 'age':
          comparison = calculateAge(a.dateOfBirth) - calculateAge(b.dateOfBirth);
          break;
        case 'lastConsultation':
          const dateA = a.lastConsultation ? new Date(a.lastConsultation).getTime() : 0;
          const dateB = b.lastConsultation ? new Date(b.lastConsultation).getTime() : 0;
          comparison = dateA - dateB;
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
  }, [allPatients, searchTerm, statusFilter, genderFilter, ageRange, sortBy, sortOrder]);

  // Pagination
  const totalPages = Math.ceil(filteredAndSortedPatients.length / patientsPerPage);
  const startIndex = (currentPage - 1) * patientsPerPage;
  const endIndex = startIndex + patientsPerPage;
  const currentPatients = filteredAndSortedPatients.slice(startIndex, endIndex);

  // Reset pagination when filters change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, genderFilter, ageRange]);

  // Handle sort change
  const handleSortChange = (field: typeof sortBy) => {
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
    setGenderFilter('all');
    setAgeRange({ min: '', max: '' });
    setCurrentPage(1);
  };

  // Handle patient selection with confirmation
  const handlePatientSelect = (patient: Patient) => {
    if (selectedPatient?.id === patient.id) {
      // Deselect if clicking the same patient
      onPatientSelect(null as any);
    } else {
      onPatientSelect(patient);
      setExpandedPatient(patient.id);
    }
  };

  // Handle prescription creation with confirmation
  const handleCreatePrescription = (patient: Patient) => {
    const confirmMessage = `Créer une nouvelle ordonnance pour :\n\n${patient.firstName} ${patient.lastName}\nN° Dossier: ${patient.medicalRecordNumber}\nÂge: ${calculateAge(patient.dateOfBirth)} ans\n\nContinuer ?`;
    
    if (confirm(confirmMessage)) {
      onCreatePrescription(patient);
    }
  };

  // Get highlighted search text
  const highlightSearchTerm = (text: string, searchTerm: string) => {
    if (!searchTerm) return text;
    
    const regex = new RegExp(`(${searchTerm})`, 'gi');
    const parts = text.split(regex);
    
    return parts.map((part, index) => 
      regex.test(part) ? (
        <mark key={index} className="bg-yellow-200 text-yellow-900 px-1 rounded">
          {part}
        </mark>
      ) : part
    );
  };

  // Calculate statistics
  const stats = useMemo(() => {
    const total = filteredAndSortedPatients.length;
    const active = filteredAndSortedPatients.filter(p => p.status === 'active').length;
    const inactive = filteredAndSortedPatients.filter(p => p.status === 'inactive').length;
    const withUpcomingAppointments = filteredAndSortedPatients.filter(p => p.nextAppointment).length;
    
    return { total, active, inactive, withUpcomingAppointments };
  }, [filteredAndSortedPatients]);

  return (
    <div className="space-y-6">
      {/* Header with Statistics */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <Users className="h-8 w-8 text-sky-500" />
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Sélection du patient</h2>
              <p className="text-gray-600">
                Choisissez un patient pour créer une ordonnance
              </p>
            </div>
          </div>
          
          {/* Quick Stats */}
          <div className="hidden md:grid grid-cols-4 gap-4 text-center">
            <div className="bg-sky-50 rounded-lg p-3">
              <p className="text-2xl font-bold text-sky-600">{stats.total}</p>
              <p className="text-xs text-gray-600">Total</p>
            </div>
            <div className="bg-green-50 rounded-lg p-3">
              <p className="text-2xl font-bold text-green-600">{stats.active}</p>
              <p className="text-xs text-gray-600">Actifs</p>
            </div>
            <div className="bg-amber-50 rounded-lg p-3">
              <p className="text-2xl font-bold text-amber-600">{stats.inactive}</p>
              <p className="text-xs text-gray-600">Inactifs</p>
            </div>
            <div className="bg-purple-50 rounded-lg p-3">
              <p className="text-2xl font-bold text-purple-600">{stats.withUpcomingAppointments}</p>
              <p className="text-xs text-gray-600">RDV à venir</p>
            </div>
          </div>
        </div>

        {/* Selected Patient Display */}
        {selectedPatient && (
          <div className="bg-gradient-to-r from-sky-50 to-emerald-50 border border-sky-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-br from-sky-400 to-emerald-400 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold">
                    {selectedPatient.id}
                  </span>
                </div>
                <div>
                  <h3 className="font-bold text-sky-900">
                    Patient sélectionné: {selectedPatient.firstName} {selectedPatient.lastName}
                  </h3>
                  <div className="flex items-center space-x-4 text-sm text-sky-700">
                    <span>N°: {selectedPatient.medicalRecordNumber}</span>
                    <span>Âge: {calculateAge(selectedPatient.dateOfBirth)} ans</span>
                    <span>Email: {selectedPatient.email}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => handleCreatePrescription(selectedPatient)}
                  className="bg-emerald-500 text-white px-4 py-2 rounded-lg hover:bg-emerald-600 transition-colors flex items-center space-x-2 shadow-sm hover:shadow-md"
                >
                  <Plus className="h-4 w-4" />
                  <span>Créer ordonnance</span>
                </button>
                <button
                  onClick={() => onPatientSelect(null as any)}
                  className="p-2 text-sky-600 hover:text-sky-800 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex flex-col gap-4">
            {/* Main Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher par nom, ID, téléphone, email ou date de naissance..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent text-base"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* Quick Filters */}
            <div className="flex flex-col sm:flex-row gap-3">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="w-full sm:w-auto px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
              >
                <option value="all">Tous les statuts</option>
                <option value="active">Patients actifs</option>
                <option value="inactive">Patients inactifs</option>
              </select>

              <select
                value={genderFilter}
                onChange={(e) => setGenderFilter(e.target.value as any)}
                className="w-full sm:w-auto px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
              >
                <option value="all">Tous les genres</option>
                <option value="Homme">Homme</option>
                <option value="Femme">Femme</option>
                <option value="Autre">Autre</option>
              </select>

              <button
                onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                className="w-full sm:w-auto flex items-center justify-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Filter className="h-4 w-4" />
                <span>Filtres avancés</span>
                {showAdvancedFilters ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </button>

              {(searchTerm || statusFilter !== 'all' || genderFilter !== 'all' || ageRange.min || ageRange.max) && (
                <button
                  onClick={clearFilters}
                  className="w-full sm:w-auto flex items-center justify-center space-x-2 px-3 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  <X className="h-4 w-4" />
                  <span>Effacer</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Advanced Filters */}
        {showAdvancedFilters && (
          <div className="p-6 border-b border-gray-200 bg-gray-50">
            <h3 className="text-sm font-medium text-gray-900 mb-4">Filtres avancés</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Age Range */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tranche d'âge
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="number"
                    placeholder="Min"
                    value={ageRange.min}
                    onChange={(e) => setAgeRange(prev => ({ ...prev, min: e.target.value }))}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 text-sm"
                  />
                  <input
                    type="number"
                    placeholder="Max"
                    value={ageRange.max}
                    onChange={(e) => setAgeRange(prev => ({ ...prev, max: e.target.value }))}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 text-sm"
                  />
                </div>
              </div>

              {/* Sort Options */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Trier par
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 text-sm"
                  >
                    <option value="name">Nom</option>
                    <option value="age">Âge</option>
                    <option value="lastConsultation">Dernière consultation</option>
                    <option value="status">Statut</option>
                  </select>
                  <select
                    value={sortOrder}
                    onChange={(e) => setSortOrder(e.target.value as any)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 text-sm"
                  >
                    <option value="asc">Croissant</option>
                    <option value="desc">Décroissant</option>
                  </select>
                </div>
              </div>

              {/* Results per page */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Résultats par page
                </label>
                <select
                  value={patientsPerPage}
                  onChange={(e) => {
                    const newPerPage = parseInt(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 text-sm"
                >
                  <option value={5}>5 patients</option>
                  <option value={10}>10 patients</option>
                  <option value={20}>20 patients</option>
                  <option value={50}>50 patients</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Results Summary */}
        <div className="p-6">
          <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
            <span>
              {filteredAndSortedPatients.length} patient{filteredAndSortedPatients.length > 1 ? 's' : ''} trouvé{filteredAndSortedPatients.length > 1 ? 's' : ''}
              {searchTerm && ` pour "${searchTerm}"`}
            </span>
            <span>
              Page {currentPage} sur {totalPages} • Affichage de {startIndex + 1}-{Math.min(endIndex, filteredAndSortedPatients.length)}
            </span>
          </div>
        </div>
      </div>

      {/* Patient List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-500 mx-auto mb-4"></div>
              <p className="text-gray-600">Chargement des patients...</p>
            </div>
          ) : currentPatients.length === 0 ? (
            <div className="text-center py-12">
              <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Aucun patient trouvé
              </h3>
              <p className="text-gray-600 mb-4">
                {searchTerm || statusFilter !== 'all' || genderFilter !== 'all' || ageRange.min || ageRange.max
                  ? 'Aucun patient ne correspond à vos critères de recherche.'
                  : 'Aucun patient enregistré pour le moment.'
                }
              </p>
              {(searchTerm || statusFilter !== 'all' || genderFilter !== 'all' || ageRange.min || ageRange.max) && (
                <button
                  onClick={clearFilters}
                  className="bg-sky-500 text-white px-4 py-2 rounded-lg hover:bg-sky-600 transition-colors"
                >
                  Effacer les filtres
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {currentPatients.map((patient) => (
                <div
                  key={patient.id}
                  className={`border-2 rounded-lg transition-all cursor-pointer ${
                    selectedPatient?.id === patient.id
                      ? 'border-sky-500 bg-sky-50 shadow-md'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {/* Main Patient Info */}
                  <div 
                    onClick={() => handlePatientSelect(patient)}
                    className="p-4 sm:p-6"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4 flex-1 min-w-0">
                        <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-sky-400 to-emerald-400 rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-white font-bold text-lg">
                            {patient.id}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-3 mb-2">
                            <h3 className="text-lg sm:text-xl font-bold text-gray-900">
                              {highlightSearchTerm(`${patient.firstName} ${patient.lastName}`, searchTerm)}
                            </h3>
                            <div className="flex items-center space-x-2 mt-1 sm:mt-0">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                patient.status === 'active'
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-gray-100 text-gray-800'
                              }`}>
                                {patient.status === 'active' ? 'Actif' : 'Inactif'}
                              </span>
                              <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                                {patient.gender} • {calculateAge(patient.dateOfBirth)} ans
                              </span>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 text-sm">
                            <div className="flex items-center space-x-2">
                              <FileText className="h-4 w-4 text-gray-400" />
                              <span className="text-gray-700">
                                {highlightSearchTerm(patient.medicalRecordNumber, searchTerm)}
                              </span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Mail className="h-4 w-4 text-gray-400" />
                              <span className="text-gray-700 truncate">
                                {highlightSearchTerm(patient.email, searchTerm)}
                              </span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Phone className="h-4 w-4 text-gray-400" />
                              <span className="text-gray-700">
                                {highlightSearchTerm(patient.phone, searchTerm)}
                              </span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <MapPin className="h-4 w-4 text-gray-400" />
                              <span className="text-gray-700">{patient.address.city}</span>
                            </div>
                          </div>

                          <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-6 text-sm text-gray-600 mt-3 space-y-1 sm:space-y-0">
                            <div className="flex items-center space-x-2">
                              <Activity className="h-4 w-4" />
                              <span>{patient.consultationsCount} consultation{patient.consultationsCount > 1 ? 's' : ''}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Clock className="h-4 w-4" />
                              <span>
                                {patient.lastConsultation 
                                  ? `Dernière: ${format(new Date(patient.lastConsultation), 'dd/MM/yyyy', { locale: fr })}`
                                  : 'Aucune consultation'
                                }
                              </span>
                            </div>
                            {patient.nextAppointment && (
                              <div className="flex items-center space-x-2">
                                <Calendar className="h-4 w-4 text-emerald-500" />
                                <span className="text-emerald-600 font-medium">
                                  RDV: {format(new Date(patient.nextAppointment), 'dd/MM/yyyy', { locale: fr })}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex flex-col items-end space-y-2 ml-4">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCreatePrescription(patient);
                          }}
                          className="bg-emerald-500 text-white px-3 py-2 rounded-lg hover:bg-emerald-600 transition-colors flex items-center space-x-2 text-sm shadow-sm hover:shadow-md"
                        >
                          <Plus className="h-4 w-4" />
                          <span className="hidden sm:inline">Ordonnance</span>
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setExpandedPatient(expandedPatient === patient.id ? null : patient.id);
                          }}
                          className="p-2 text-gray-400 hover:text-gray-600 transition-colors rounded-lg hover:bg-gray-100"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Expanded Patient Details */}
                  {expandedPatient === patient.id && (
                    <div className="border-t border-gray-200 p-4 sm:p-6 bg-gray-50">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Medical Information */}
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                            <FileText className="h-4 w-4 mr-2 text-red-500" />
                            Informations médicales
                          </h4>
                          <div className="space-y-2 text-sm">
                            <div>
                              <span className="font-medium text-gray-700">Groupe sanguin:</span>
                              <span className="ml-2 text-gray-900">{patient.medicalInfo.bloodType}</span>
                            </div>
                            <div>
                              <span className="font-medium text-gray-700">Allergies:</span>
                              <span className="ml-2 text-gray-900">{patient.medicalInfo.allergies}</span>
                            </div>
                            <div>
                              <span className="font-medium text-gray-700">Médicaments actuels:</span>
                              <span className="ml-2 text-gray-900">{patient.medicalInfo.currentMedications}</span>
                            </div>
                            <div>
                              <span className="font-medium text-gray-700">Antécédents:</span>
                              <span className="ml-2 text-gray-900">{patient.medicalInfo.medicalHistory}</span>
                            </div>
                          </div>
                        </div>

                        {/* Contact and Insurance */}
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                            <User className="h-4 w-4 mr-2 text-blue-500" />
                            Contact et assurance
                          </h4>
                          <div className="space-y-2 text-sm">
                            <div>
                              <span className="font-medium text-gray-700">Adresse:</span>
                              <span className="ml-2 text-gray-900">
                                {patient.address.street}, {patient.address.city} {patient.address.postalCode}
                              </span>
                            </div>
                            <div>
                              <span className="font-medium text-gray-700">Assurance:</span>
                              <span className="ml-2 text-gray-900">{patient.insurance.provider}</span>
                            </div>
                            <div>
                              <span className="font-medium text-gray-700">N° Police:</span>
                              <span className="ml-2 text-gray-900">{patient.insurance.policyNumber}</span>
                            </div>
                            <div>
                              <span className="font-medium text-gray-700">Inscrit le:</span>
                              <span className="ml-2 text-gray-900">
                                {format(new Date(patient.createdAt), 'dd/MM/yyyy', { locale: fr })}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Medical Alerts */}
                      {patient.medicalInfo.allergies !== 'Aucune allergie connue' && patient.medicalInfo.allergies && (
                        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                          <div className="flex items-start space-x-2">
                            <AlertTriangle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                            <div>
                              <span className="text-sm font-medium text-red-900">Allergies importantes:</span>
                              <span className="ml-2 text-red-800">{patient.medicalInfo.allergies}</span>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Quick Actions */}
                      <div className="mt-4 flex flex-wrap gap-2">
                        <button
                          onClick={() => handleCreatePrescription(patient)}
                          className="bg-emerald-500 text-white px-4 py-2 rounded-lg hover:bg-emerald-600 transition-colors flex items-center space-x-2 text-sm"
                        >
                          <Plus className="h-4 w-4" />
                          <span>Créer ordonnance</span>
                        </button>
                        <button className="bg-sky-500 text-white px-4 py-2 rounded-lg hover:bg-sky-600 transition-colors flex items-center space-x-2 text-sm">
                          <Calendar className="h-4 w-4" />
                          <span>Nouveau RDV</span>
                        </button>
                        <button className="bg-purple-500 text-white px-4 py-2 rounded-lg hover:bg-purple-600 transition-colors flex items-center space-x-2 text-sm">
                          <FileText className="h-4 w-4" />
                          <span>Voir dossier</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Affichage de {startIndex + 1} à {Math.min(endIndex, filteredAndSortedPatients.length)} sur {filteredAndSortedPatients.length} patients
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Précédent
              </button>
              
              <div className="flex space-x-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const pageNumber = i + 1;
                  return (
                    <button
                      key={pageNumber}
                      onClick={() => setCurrentPage(pageNumber)}
                      className={`px-3 py-2 text-sm rounded-lg transition-colors ${
                        currentPage === pageNumber
                          ? 'bg-sky-500 text-white'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      {pageNumber}
                    </button>
                  );
                })}
                {totalPages > 5 && (
                  <>
                    <span className="px-2 py-2 text-gray-500">...</span>
                    <button
                      onClick={() => setCurrentPage(totalPages)}
                      className={`px-3 py-2 text-sm rounded-lg transition-colors ${
                        currentPage === totalPages
                          ? 'bg-sky-500 text-white'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      {totalPages}
                    </button>
                  </>
                )}
              </div>
              
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Suivant
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Keyboard Navigation Help */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <div className="flex items-start space-x-3">
          <CheckCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
          <div>
            <h3 className="text-sm font-medium text-blue-900 mb-1">
              Navigation clavier
            </h3>
            <div className="text-sm text-blue-800 space-y-1">
              <p>• <kbd className="bg-white px-2 py-1 rounded text-xs">Tab</kbd> pour naviguer entre les patients</p>
              <p>• <kbd className="bg-white px-2 py-1 rounded text-xs">Entrée</kbd> pour sélectionner un patient</p>
              <p>• <kbd className="bg-white px-2 py-1 rounded text-xs">Ctrl+F</kbd> pour rechercher</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};