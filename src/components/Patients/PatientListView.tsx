import React, { useState, useMemo } from 'react';
import { 
  Users, 
  Search, 
  Filter, 
  Eye, 
  MessageSquare, 
  Calendar, 
  SortAsc, 
  SortDesc,
  Plus,
  Phone,
  Mail,
  User,
  Activity,
  Clock,
  FileText,
  ChevronDown,
  X
} from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { PatientRecordView } from './PatientRecordView';
import { NewPatientModal } from './NewPatientModal';

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
    country: string;
  };
  status: 'active' | 'inactive';
  consultationsCount: number;
  lastConsultation?: string;
  nextAppointment?: string;
  emergencyContact: {
    name: string;
    relationship: string;
    phone: string;
  };
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

type SortField = 'name' | 'age' | 'lastConsultation' | 'consultationsCount' | 'status' | 'nextAppointment';
type SortOrder = 'asc' | 'desc';

export const PatientListView: React.FC = () => {
  // State management
  const [patients, setPatients] = useState<Patient[]>([
    {
      id: 'JD',
      firstName: 'Jean',
      lastName: 'Dupont',
      email: 'jean.dupont@email.com',
      phone: '+33123456789',
      dateOfBirth: '1985-06-15',
      medicalRecordNumber: 'MRN001234',
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
      emergencyContact: {
        name: 'Marie Dupont',
        relationship: 'Épouse',
        phone: '+33987654321'
      },
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
      id: 'MM',
      firstName: 'Marie',
      lastName: 'Martin',
      email: 'marie.martin@email.com',
      phone: '+33234567890',
      dateOfBirth: '1992-03-22',
      medicalRecordNumber: 'MRN001235',
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
      emergencyContact: {
        name: 'Paul Martin',
        relationship: 'Époux',
        phone: '+33876543210'
      },
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
      id: 'PD',
      firstName: 'Pierre',
      lastName: 'Durand',
      email: 'pierre.durand@email.com',
      phone: '+33345678901',
      dateOfBirth: '1978-11-08',
      medicalRecordNumber: 'MRN001236',
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
      emergencyContact: {
        name: 'Sophie Durand',
        relationship: 'Fille',
        phone: '+33765432109'
      },
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
    }
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [sortBy, setSortBy] = useState<SortField>('name');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [showPatientRecord, setShowPatientRecord] = useState(false);
  const [showNewPatientModal, setShowNewPatientModal] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

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
    let filtered = patients;

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

    // Apply sorting
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
        case 'nextAppointment':
          const nextA = a.nextAppointment ? new Date(a.nextAppointment).getTime() : Infinity;
          const nextB = b.nextAppointment ? new Date(b.nextAppointment).getTime() : Infinity;
          comparison = nextA - nextB;
          break;
        case 'consultationsCount':
          comparison = a.consultationsCount - b.consultationsCount;
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
  }, [patients, searchTerm, statusFilter, sortBy, sortOrder]);

  // Handle sort change
  const handleSortChange = (field: SortField) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  // Handle patient selection
  const handlePatientSelect = (patient: Patient) => {
    setSelectedPatient(patient);
    setShowPatientRecord(true);
  };

  // Handle patient record close
  const handleClosePatientRecord = () => {
    setShowPatientRecord(false);
    setSelectedPatient(null);
  };

  // Handle patient data update
  const handlePatientUpdate = (updatedPatient: Patient) => {
    setPatients(prev => 
      prev.map(patient => 
        patient.id === updatedPatient.id ? updatedPatient : patient
      )
    );
    setSelectedPatient(updatedPatient);
  };

  // Handle new patient creation
  const handlePatientCreated = (newPatient: Patient) => {
    setPatients(prev => [newPatient, ...prev]);
  };

  // Get sort icon
  const getSortIcon = (field: SortField) => {
    if (sortBy !== field) return null;
    return sortOrder === 'asc' ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />;
  };

  // Calculate statistics
  const stats = useMemo(() => {
    const total = patients.length;
    const active = patients.filter(p => p.status === 'active').length;
    const inactive = patients.filter(p => p.status === 'inactive').length;
    const totalConsultations = patients.reduce((sum, p) => sum + p.consultationsCount, 0);
    const avgConsultations = total > 0 ? Math.round(totalConsultations / total) : 0;
    const upcomingAppointments = patients.filter(p => p.nextAppointment).length;
    
    return { total, active, inactive, totalConsultations, avgConsultations, upcomingAppointments };
  }, [patients]);

  // Clear all filters
  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setSortBy('name');
    setSortOrder('asc');
  };

  if (showPatientRecord && selectedPatient) {
    return (
      <PatientRecordView
        patient={selectedPatient}
        onClose={handleClosePatientRecord}
        onPatientUpdate={handlePatientUpdate}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Users className="h-8 w-8 text-sky-500" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Liste des patients ({filteredAndSortedPatients.length})</h1>
              <p className="text-gray-600">
                Gérez vos patients et accédez à leurs dossiers médicaux complets.
              </p>
            </div>
          </div>
          <button 
            onClick={() => setShowNewPatientModal(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-sky-500 text-white rounded-lg hover:bg-sky-600 transition-colors shadow-sm hover:shadow-md"
          >
            <Plus className="h-4 w-4" />
            <span>Nouveau patient</span>
          </button>
        </div>
      </div>

      {/* Statistics Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 text-center hover:shadow-md transition-shadow">
          <Users className="h-8 w-8 text-sky-500 mx-auto mb-3" />
          <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
          <p className="text-sm text-gray-600">Total patients</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 text-center hover:shadow-md transition-shadow">
          <Activity className="h-8 w-8 text-green-500 mx-auto mb-3" />
          <p className="text-2xl font-bold text-green-600">{stats.active}</p>
          <p className="text-sm text-gray-600">Patients actifs</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 text-center hover:shadow-md transition-shadow">
          <Clock className="h-8 w-8 text-amber-500 mx-auto mb-3" />
          <p className="text-2xl font-bold text-amber-600">{stats.inactive}</p>
          <p className="text-sm text-gray-600">Patients inactifs</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 text-center hover:shadow-md transition-shadow">
          <FileText className="h-8 w-8 text-purple-500 mx-auto mb-3" />
          <p className="text-2xl font-bold text-purple-600">{stats.totalConsultations}</p>
          <p className="text-sm text-gray-600">Total consultations</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 text-center hover:shadow-md transition-shadow">
          <Calendar className="h-8 w-8 text-emerald-500 mx-auto mb-3" />
          <p className="text-2xl font-bold text-emerald-600">{stats.avgConsultations}</p>
          <p className="text-sm text-gray-600">Moy. consultations</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 text-center hover:shadow-md transition-shadow">
          <Calendar className="h-8 w-8 text-blue-500 mx-auto mb-3" />
          <p className="text-2xl font-bold text-blue-600">{stats.upcomingAppointments}</p>
          <p className="text-sm text-gray-600">RDV à venir</p>
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
                placeholder="Rechercher un patient..."
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
                className="w-full sm:w-auto px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
              >
                <option value="all">Tous les statuts</option>
                <option value="active">Patients actifs</option>
                <option value="inactive">Patients inactifs</option>
              </select>

              <button
                onClick={() => setShowFilters(!showFilters)}
                className="w-full sm:w-auto flex items-center justify-center space-x-2 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Filter className="h-4 w-4" />
                <span>Tri</span>
                <ChevronDown className={`h-4 w-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
              </button>

              {(searchTerm || statusFilter !== 'all') && (
                <button
                  onClick={clearFilters}
                  className="w-full sm:w-auto flex items-center justify-center space-x-2 px-3 py-3 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  <X className="h-4 w-4" />
                  <span>Effacer</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Advanced Sorting Options */}
        {showFilters && (
          <div className="p-6 border-b border-gray-200 bg-gray-50">
            <h3 className="text-sm font-medium text-gray-900 mb-3">Options de tri</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
              {[
                { field: 'name', label: 'Nom (A-Z)' },
                { field: 'age', label: 'Âge' },
                { field: 'lastConsultation', label: 'Dernière consultation' },
                { field: 'nextAppointment', label: 'Prochain RDV' },
                { field: 'consultationsCount', label: 'Nb consultations' },
                { field: 'status', label: 'Statut' }
              ].map((option) => (
                <button
                  key={option.field}
                  onClick={() => handleSortChange(option.field as SortField)}
                  className={`flex items-center justify-between px-3 py-2 text-sm rounded-lg border transition-colors ${
                    sortBy === option.field
                      ? 'border-sky-500 bg-sky-50 text-sky-700'
                      : 'border-gray-200 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <span>{option.label}</span>
                  {getSortIcon(option.field as SortField)}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Results Summary */}
        <div className="p-6">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>
              {filteredAndSortedPatients.length} patient{filteredAndSortedPatients.length > 1 ? 's' : ''} affiché{filteredAndSortedPatients.length > 1 ? 's' : ''}
              {searchTerm && ` pour "${searchTerm}"`}
            </span>
            <span>
              Triés par {sortBy === 'name' ? 'nom' : 
                        sortBy === 'age' ? 'âge' :
                        sortBy === 'lastConsultation' ? 'dernière consultation' :
                        sortBy === 'nextAppointment' ? 'prochain RDV' :
                        sortBy === 'consultationsCount' ? 'nombre de consultations' : 'statut'} 
              ({sortOrder === 'asc' ? 'croissant' : 'décroissant'})
            </span>
          </div>
        </div>
      </div>

      {/* Patient List Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {/* Mobile Card View */}
        <div className="block md:hidden">
          <div className="p-4 space-y-4">
            {filteredAndSortedPatients.length === 0 ? (
              <div className="text-center py-12">
                <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Aucun patient trouvé
                </h3>
                <p className="text-gray-600 mb-4">
                  {searchTerm || statusFilter !== 'all'
                    ? 'Aucun patient ne correspond à vos critères de recherche.'
                    : 'Aucun patient enregistré pour le moment.'
                  }
                </p>
                {(searchTerm || statusFilter !== 'all') ? (
                  <button
                    onClick={clearFilters}
                    className="bg-sky-500 text-white px-4 py-2 rounded-lg hover:bg-sky-600 transition-colors"
                  >
                    Effacer les filtres
                  </button>
                ) : (
                  <button
                    onClick={() => setShowNewPatientModal(true)}
                    className="bg-sky-500 text-white px-4 py-2 rounded-lg hover:bg-sky-600 transition-colors"
                  >
                    Ajouter le premier patient
                  </button>
                )}
              </div>
            ) : (
              filteredAndSortedPatients.map((patient) => (
                <div
                  key={patient.id}
                  onClick={() => handlePatientSelect(patient)}
                  className="bg-white border border-gray-200 rounded-lg p-4 hover:bg-sky-50 hover:border-sky-300 transition-all cursor-pointer"
                >
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-sky-400 to-emerald-400 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold text-sm">
                        {patient.id}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 truncate">
                        {patient.firstName} {patient.lastName}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {calculateAge(patient.dateOfBirth)} ans • {patient.consultationsCount} consultation{patient.consultationsCount > 1 ? 's' : ''}
                      </p>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      patient.status === 'active'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {patient.status === 'active' ? 'Actif' : 'Inactif'}
                    </span>
                  </div>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center space-x-2">
                      <Mail className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-700 truncate">{patient.email}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Phone className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-700">{patient.phone}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <span className="text-gray-600">
                          {patient.lastConsultation 
                            ? format(new Date(patient.lastConsultation), 'dd/MM/yyyy', { locale: fr })
                            : 'Aucune consultation'
                          }
                        </span>
                      </div>
                      {patient.nextAppointment && (
                        <div className="flex items-center space-x-1">
                          <Clock className="h-3 w-3 text-emerald-500" />
                          <span className="text-emerald-600 text-xs font-medium">
                            RDV {format(new Date(patient.nextAppointment), 'dd/MM', { locale: fr })}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left">
                  <button
                    onClick={() => handleSortChange('name')}
                    className="flex items-center space-x-1 text-xs font-medium text-gray-500 uppercase tracking-wider hover:text-gray-700 transition-colors"
                  >
                    <span>Patient</span>
                    {getSortIcon('name')}
                  </button>
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-6 py-4 text-left">
                  <button
                    onClick={() => handleSortChange('age')}
                    className="flex items-center space-x-1 text-xs font-medium text-gray-500 uppercase tracking-wider hover:text-gray-700 transition-colors"
                  >
                    <span>Âge</span>
                    {getSortIcon('age')}
                  </button>
                </th>
                <th className="px-6 py-4 text-left">
                  <button
                    onClick={() => handleSortChange('lastConsultation')}
                    className="flex items-center space-x-1 text-xs font-medium text-gray-500 uppercase tracking-wider hover:text-gray-700 transition-colors"
                  >
                    <span>Dernière consultation</span>
                    {getSortIcon('lastConsultation')}
                  </button>
                </th>
                <th className="px-6 py-4 text-left">
                  <button
                    onClick={() => handleSortChange('nextAppointment')}
                    className="flex items-center space-x-1 text-xs font-medium text-gray-500 uppercase tracking-wider hover:text-gray-700 transition-colors"
                  >
                    <span>Prochain RDV</span>
                    {getSortIcon('nextAppointment')}
                  </button>
                </th>
                <th className="px-6 py-4 text-left">
                  <button
                    onClick={() => handleSortChange('status')}
                    className="flex items-center space-x-1 text-xs font-medium text-gray-500 uppercase tracking-wider hover:text-gray-700 transition-colors"
                  >
                    <span>Statut</span>
                    {getSortIcon('status')}
                  </button>
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredAndSortedPatients.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center">
                      <Users className="h-16 w-16 text-gray-400 mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        Aucun patient trouvé
                      </h3>
                      <p className="text-gray-600 mb-4">
                        {searchTerm || statusFilter !== 'all'
                          ? 'Aucun patient ne correspond à vos critères de recherche.'
                          : 'Aucun patient enregistré pour le moment.'
                        }
                      </p>
                      {(searchTerm || statusFilter !== 'all') ? (
                        <button
                          onClick={clearFilters}
                          className="bg-sky-500 text-white px-4 py-2 rounded-lg hover:bg-sky-600 transition-colors"
                        >
                          Effacer les filtres
                        </button>
                      ) : (
                        <button
                          onClick={() => setShowNewPatientModal(true)}
                          className="bg-sky-500 text-white px-4 py-2 rounded-lg hover:bg-sky-600 transition-colors"
                        >
                          Ajouter le premier patient
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                filteredAndSortedPatients.map((patient) => (
                  <tr 
                    key={patient.id} 
                    className="hover:bg-sky-50 cursor-pointer transition-colors group"
                    onClick={() => handlePatientSelect(patient)}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-gradient-to-br from-sky-400 to-emerald-400 rounded-full flex items-center justify-center group-hover:scale-105 transition-transform">
                          <span className="text-white font-bold text-sm">
                            {patient.id}
                          </span>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900 group-hover:text-sky-700 transition-colors">
                            {patient.firstName} {patient.lastName}
                          </div>
                          <div className="text-sm text-gray-500">
                            {patient.consultationsCount} consultation{patient.consultationsCount > 1 ? 's' : ''}
                          </div>
                          <div className="text-xs text-gray-400">
                            N°: {patient.medicalRecordNumber}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 flex items-center space-x-1">
                        <Mail className="h-3 w-3 text-gray-400" />
                        <span className="truncate max-w-[150px]">{patient.email}</span>
                      </div>
                      <div className="text-sm text-gray-500 flex items-center space-x-1 mt-1">
                        <Phone className="h-3 w-3 text-gray-400" />
                        <span>{patient.phone}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="font-medium">{calculateAge(patient.dateOfBirth)} ans</div>
                      <div className="text-xs text-gray-500">
                        {format(new Date(patient.dateOfBirth), 'dd/MM/yyyy', { locale: fr })}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {patient.lastConsultation ? (
                        <div>
                          <div className="font-medium">
                            {format(new Date(patient.lastConsultation), 'dd/MM/yyyy', { locale: fr })}
                          </div>
                          <div className="text-xs text-gray-500">
                            {format(new Date(patient.lastConsultation), 'HH:mm', { locale: fr })}
                          </div>
                        </div>
                      ) : (
                        <span className="text-gray-400">Aucune</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {patient.nextAppointment ? (
                        <div>
                          <div className="font-medium text-emerald-600">
                            {format(new Date(patient.nextAppointment), 'dd/MM/yyyy', { locale: fr })}
                          </div>
                          <div className="text-xs text-emerald-500">
                            {format(new Date(patient.nextAppointment), 'HH:mm', { locale: fr })}
                          </div>
                        </div>
                      ) : (
                        <span className="text-gray-400">Aucun</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${
                        patient.status === 'active'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {patient.status === 'active' ? 'Actif' : 'Inactif'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            handlePatientSelect(patient);
                          }}
                          className="text-sky-600 hover:text-sky-900 transition-colors p-1 rounded hover:bg-sky-100"
                          title="Voir le dossier complet"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            alert(`Ouverture de la messagerie avec ${patient.firstName} ${patient.lastName}`);
                          }}
                          className="text-emerald-600 hover:text-emerald-900 transition-colors p-1 rounded hover:bg-emerald-100"
                          title="Envoyer un message"
                        >
                          <MessageSquare className="h-4 w-4" />
                        </button>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            alert(`Programmation d'un rendez-vous pour ${patient.firstName} ${patient.lastName}`);
                          }}
                          className="text-amber-600 hover:text-amber-900 transition-colors p-1 rounded hover:bg-amber-100"
                          title="Programmer un RDV"
                        >
                          <Calendar className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick Actions Panel */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Actions rapides</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button 
            onClick={() => setShowNewPatientModal(true)}
            className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-center group"
          >
            <Plus className="h-6 w-6 text-sky-500 mx-auto mb-2 group-hover:scale-110 transition-transform" />
            <p className="text-sm font-medium text-gray-900">Nouveau</p>
            <p className="text-xs text-gray-600 hidden sm:block">Créer un nouveau dossier</p>
          </button>
          
          <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-center group">
            <Calendar className="h-6 w-6 text-emerald-500 mx-auto mb-2 group-hover:scale-110 transition-transform" />
            <p className="text-sm font-medium text-gray-900">RDV</p>
            <p className="text-xs text-gray-600 hidden sm:block">Nouveau rendez-vous</p>
          </button>
          
          <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-center group">
            <FileText className="h-6 w-6 text-purple-500 mx-auto mb-2 group-hover:scale-110 transition-transform" />
            <p className="text-sm font-medium text-gray-900">Rapport</p>
            <p className="text-xs text-gray-600 hidden sm:block">Créer un rapport</p>
          </button>
          
          <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-center group">
            <MessageSquare className="h-6 w-6 text-amber-500 mx-auto mb-2 group-hover:scale-110 transition-transform" />
            <p className="text-sm font-medium text-gray-900">Messages</p>
            <p className="text-xs text-gray-600 hidden sm:block">Envoyer à plusieurs patients</p>
          </button>
        </div>
      </div>

      {/* New Patient Modal */}
      <NewPatientModal
        isOpen={showNewPatientModal}
        onClose={() => setShowNewPatientModal(false)}
        onPatientCreated={handlePatientCreated}
      />
    </div>
  );
};