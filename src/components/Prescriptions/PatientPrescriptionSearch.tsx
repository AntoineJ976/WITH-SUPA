import React, { useState, useEffect, useMemo } from 'react';
import { 
  Search, 
  Filter, 
  SortAsc, 
  SortDesc, 
  X, 
  User, 
  Calendar, 
  FileText,
  Clock,
  CheckCircle,
  AlertTriangle,
  XCircle,
  ChevronDown,
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
  dateOfBirth: string;
}

interface Prescription {
  id: string;
  patientId: string;
  patientName: string;
  patientEmail: string;
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
  createdAt: string;
}

interface PatientPrescriptionSearchProps {
  onPrescriptionSelect?: (prescription: Prescription) => void;
  onPatientSelect?: (patient: Patient) => void;
}

export const PatientPrescriptionSearch: React.FC<PatientPrescriptionSearchProps> = ({
  onPrescriptionSelect,
  onPatientSelect
}) => {
  // Search and filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [sortBy, setSortBy] = useState<'patient' | 'date' | 'status'>('patient');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [showFilters, setShowFilters] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Mock data - In production, this would come from Firebase/API
  const [patients] = useState<Patient[]>([
    {
      id: '1',
      firstName: 'Jean',
      lastName: 'Dupont',
      email: 'jean.dupont@email.com',
      phone: '+33123456789',
      dateOfBirth: '1985-06-15'
    },
    {
      id: '2',
      firstName: 'Marie',
      lastName: 'Martin',
      email: 'marie.martin@email.com',
      phone: '+33234567890',
      dateOfBirth: '1992-03-22'
    },
    {
      id: '3',
      firstName: 'Pierre',
      lastName: 'Durand',
      email: 'pierre.durand@email.com',
      phone: '+33345678901',
      dateOfBirth: '1978-11-08'
    },
    {
      id: '4',
      firstName: 'Sophie',
      lastName: 'Dubois',
      email: 'sophie.dubois@email.com',
      phone: '+33456789012',
      dateOfBirth: '1990-09-12'
    },
    {
      id: '5',
      firstName: 'Antoine',
      lastName: 'Jaombelo',
      email: 'antoine.jaombelo@email.com',
      phone: '+33567890123',
      dateOfBirth: '1988-04-25'
    }
  ]);

  const [prescriptions] = useState<Prescription[]>([
    {
      id: '1',
      patientId: '1',
      patientName: 'Jean Dupont',
      patientEmail: 'jean.dupont@email.com',
      doctorId: 'doc1',
      doctorName: 'Dr. Marie Leblanc',
      medications: [
        {
          name: 'Amoxicilline 500mg',
          dosage: '1 comprimé',
          frequency: '3 fois par jour',
          duration: '7 jours',
          instructions: 'À prendre au moment des repas'
        }
      ],
      prescribedDate: '2025-01-10T10:00:00Z',
      expiryDate: '2025-01-17T10:00:00Z',
      status: 'active',
      notes: 'Infection respiratoire haute',
      createdAt: '2025-01-10T10:00:00Z'
    },
    {
      id: '2',
      patientId: '2',
      patientName: 'Marie Martin',
      patientEmail: 'marie.martin@email.com',
      doctorId: 'doc1',
      doctorName: 'Dr. Marie Leblanc',
      medications: [
        {
          name: 'Ventoline 100µg',
          dosage: '2 bouffées',
          frequency: 'Selon besoin',
          duration: '1 mois',
          instructions: 'En cas de crise d\'asthme'
        }
      ],
      prescribedDate: '2025-01-08T15:00:00Z',
      expiryDate: '2025-02-08T15:00:00Z',
      status: 'active',
      notes: 'Crise d\'asthme légère',
      createdAt: '2025-01-08T15:00:00Z'
    },
    {
      id: '3',
      patientId: '3',
      patientName: 'Pierre Durand',
      patientEmail: 'pierre.durand@email.com',
      doctorId: 'doc2',
      doctorName: 'Dr. Pierre Martin',
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
      notes: 'Hypertension artérielle',
      createdAt: '2024-12-15T14:30:00Z'
    },
    {
      id: '4',
      patientId: '4',
      patientName: 'Sophie Dubois',
      patientEmail: 'sophie.dubois@email.com',
      doctorId: 'doc1',
      doctorName: 'Dr. Marie Leblanc',
      medications: [
        {
          name: 'Paracétamol 1000mg',
          dosage: '1 comprimé',
          frequency: 'Selon besoin',
          duration: '15 jours',
          instructions: 'Maximum 4 comprimés par jour'
        }
      ],
      prescribedDate: '2024-11-20T09:00:00Z',
      expiryDate: '2024-12-05T09:00:00Z',
      status: 'expired',
      notes: 'Douleurs post-opératoires',
      createdAt: '2024-11-20T09:00:00Z'
    },
    {
      id: '5',
      patientId: '5',
      patientName: 'Antoine Jaombelo',
      patientEmail: 'antoine.jaombelo@email.com',
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
      createdAt: '2025-01-12T11:30:00Z'
    }
  ]);

  // Real-time search with autocomplete suggestions
  const searchSuggestions = useMemo(() => {
    if (!searchTerm || searchTerm.length < 2) return [];
    
    const suggestions = new Set<string>();
    const searchLower = searchTerm.toLowerCase();
    
    patients.forEach(patient => {
      const fullName = `${patient.firstName} ${patient.lastName}`;
      if (fullName.toLowerCase().includes(searchLower)) {
        suggestions.add(fullName);
      }
      if (patient.firstName.toLowerCase().includes(searchLower)) {
        suggestions.add(patient.firstName);
      }
      if (patient.lastName.toLowerCase().includes(searchLower)) {
        suggestions.add(patient.lastName);
      }
      if (patient.id.toLowerCase().includes(searchLower)) {
        suggestions.add(`ID: ${patient.id}`);
      }
    });
    
    return Array.from(suggestions).slice(0, 5);
  }, [searchTerm, patients]);

  // Filter and sort prescriptions
  const filteredAndSortedPrescriptions = useMemo(() => {
    let filtered = prescriptions;

    // Filter by search term (patient name or ID)
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(prescription => {
        const patient = patients.find(p => p.id === prescription.patientId);
        if (!patient) return false;
        
        const fullName = `${patient.firstName} ${patient.lastName}`.toLowerCase();
        return (
          fullName.includes(searchLower) ||
          patient.firstName.toLowerCase().includes(searchLower) ||
          patient.lastName.toLowerCase().includes(searchLower) ||
          patient.id.toLowerCase().includes(searchLower) ||
          prescription.patientName.toLowerCase().includes(searchLower)
        );
      });
    }

    // Filter by selected patient
    if (selectedPatient) {
      filtered = filtered.filter(prescription => prescription.patientId === selectedPatient.id);
    }

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(prescription => prescription.status === statusFilter);
    }

    // Filter by date range
    if (dateRange.start) {
      filtered = filtered.filter(prescription => 
        new Date(prescription.prescribedDate) >= new Date(dateRange.start)
      );
    }
    if (dateRange.end) {
      filtered = filtered.filter(prescription => 
        new Date(prescription.prescribedDate) <= new Date(dateRange.end)
      );
    }

    // Sort prescriptions
    const sorted = [...filtered].sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'patient':
          comparison = a.patientName.localeCompare(b.patientName);
          break;
        case 'date':
          comparison = new Date(a.prescribedDate).getTime() - new Date(b.prescribedDate).getTime();
          break;
        case 'status':
          comparison = a.status.localeCompare(b.status);
          break;
      }
      
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return sorted;
  }, [prescriptions, patients, searchTerm, selectedPatient, statusFilter, dateRange, sortBy, sortOrder]);

  // Handle search input change
  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setShowSuggestions(value.length >= 2);
    
    // Clear selected patient if search term doesn't match
    if (selectedPatient && value) {
      const fullName = `${selectedPatient.firstName} ${selectedPatient.lastName}`;
      if (!fullName.toLowerCase().includes(value.toLowerCase())) {
        setSelectedPatient(null);
      }
    }
  };

  // Handle suggestion selection
  const handleSuggestionSelect = (suggestion: string) => {
    if (suggestion.startsWith('ID: ')) {
      const patientId = suggestion.replace('ID: ', '');
      const patient = patients.find(p => p.id === patientId);
      if (patient) {
        setSelectedPatient(patient);
        setSearchTerm(`${patient.firstName} ${patient.lastName}`);
      }
    } else {
      const patient = patients.find(p => 
        `${p.firstName} ${p.lastName}` === suggestion ||
        p.firstName === suggestion ||
        p.lastName === suggestion
      );
      if (patient) {
        setSelectedPatient(patient);
        setSearchTerm(`${patient.firstName} ${patient.lastName}`);
      } else {
        setSearchTerm(suggestion);
      }
    }
    setShowSuggestions(false);
  };

  // Clear all filters
  const clearFilters = () => {
    setSearchTerm('');
    setSelectedPatient(null);
    setStatusFilter('all');
    setDateRange({ start: '', end: '' });
    setSortBy('patient');
    setSortOrder('asc');
    setShowSuggestions(false);
  };

  // Get status color and icon
  const getStatusDisplay = (status: string) => {
    const statusConfig = {
      active: { color: 'text-green-700 bg-green-100', icon: CheckCircle, label: 'Active' },
      expired: { color: 'text-red-700 bg-red-100', icon: XCircle, label: 'Expirée' },
      completed: { color: 'text-blue-700 bg-blue-100', icon: CheckCircle, label: 'Terminée' },
      cancelled: { color: 'text-gray-700 bg-gray-100', icon: XCircle, label: 'Annulée' }
    };
    
    return statusConfig[status as keyof typeof statusConfig] || statusConfig.active;
  };

  // Calculate prescription statistics
  const prescriptionStats = useMemo(() => {
    const total = filteredAndSortedPrescriptions.length;
    const active = filteredAndSortedPrescriptions.filter(p => p.status === 'active').length;
    const expired = filteredAndSortedPrescriptions.filter(p => p.status === 'expired').length;
    const completed = filteredAndSortedPrescriptions.filter(p => p.status === 'completed').length;
    
    return { total, active, expired, completed };
  }, [filteredAndSortedPrescriptions]);

  return (
    <div className="space-y-6">
      {/* Search Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <Users className="h-8 w-8 text-sky-500" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Recherche d'ordonnances par patient</h1>
              <p className="text-gray-600">
                Trouvez rapidement les ordonnances de vos patients
              </p>
            </div>
          </div>
          
          {/* Quick Stats */}
          <div className="hidden md:flex items-center space-x-4 text-sm">
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">{prescriptionStats.total}</p>
              <p className="text-gray-600">Total</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">{prescriptionStats.active}</p>
              <p className="text-gray-600">Actives</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-red-600">{prescriptionStats.expired}</p>
              <p className="text-gray-600">Expirées</p>
            </div>
          </div>
        </div>

        {/* Search Bar with Autocomplete */}
        <div className="relative">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher par nom de patient, prénom, ou ID..."
              value={searchTerm}
              onChange={(e) => handleSearchChange(e.target.value)}
              onFocus={() => setShowSuggestions(searchTerm.length >= 2)}
              className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent text-base"
            />
            {searchTerm && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setSelectedPatient(null);
                  setShowSuggestions(false);
                }}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Autocomplete Suggestions */}
          {showSuggestions && searchSuggestions.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-64 overflow-y-auto">
              <div className="p-2">
                {searchSuggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => handleSuggestionSelect(suggestion)}
                    className="w-full text-left px-3 py-2 rounded-md hover:bg-gray-50 transition-colors flex items-center space-x-2"
                  >
                    <User className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-900">{suggestion}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Selected Patient Display */}
        {selectedPatient && (
          <div className="mt-4 p-4 bg-sky-50 border border-sky-200 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-sky-400 to-emerald-400 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-sm">
                    {selectedPatient.firstName[0]}{selectedPatient.lastName[0]}
                  </span>
                </div>
                <div>
                  <h3 className="font-semibold text-sky-900">
                    {selectedPatient.firstName} {selectedPatient.lastName}
                  </h3>
                  <p className="text-sm text-sky-700">
                    ID: {selectedPatient.id} • {selectedPatient.email}
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setSelectedPatient(null);
                  setSearchTerm('');
                }}
                className="p-2 text-sky-600 hover:text-sky-800 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Filters and Sorting */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center">
              <Filter className="h-5 w-5 mr-2 text-emerald-500" />
              Filtres et tri
            </h2>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center space-x-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Filter className="h-4 w-4" />
                <span>Filtres avancés</span>
                <ChevronDown className={`h-4 w-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
              </button>
              <button
                onClick={clearFilters}
                className="flex items-center space-x-2 px-3 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                <X className="h-4 w-4" />
                <span>Effacer</span>
              </button>
            </div>
          </div>
        </div>

        <div className="p-6">
          {/* Basic Filters */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Statut
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
              >
                <option value="all">Tous les statuts</option>
                <option value="active">Actives</option>
                <option value="expired">Expirées</option>
                <option value="completed">Terminées</option>
                <option value="cancelled">Annulées</option>
              </select>
            </div>

            {/* Sort By */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Trier par
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
              >
                <option value="patient">Nom du patient</option>
                <option value="date">Date de prescription</option>
                <option value="status">Statut</option>
              </select>
            </div>

            {/* Sort Order */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ordre
              </label>
              <button
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                className="w-full flex items-center justify-center space-x-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                {sortOrder === 'asc' ? (
                  <SortAsc className="h-4 w-4" />
                ) : (
                  <SortDesc className="h-4 w-4" />
                )}
                <span>{sortOrder === 'asc' ? 'Croissant' : 'Décroissant'}</span>
              </button>
            </div>

            {/* Results Count */}
            <div className="flex items-end">
              <div className="w-full p-3 bg-gray-50 rounded-lg text-center">
                <p className="text-sm text-gray-600">Résultats</p>
                <p className="text-xl font-bold text-gray-900">{filteredAndSortedPrescriptions.length}</p>
              </div>
            </div>
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <div className="border-t border-gray-200 pt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Date Range */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Période de prescription
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="date"
                      value={dateRange.start}
                      onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                      placeholder="Date de début"
                    />
                    <input
                      type="date"
                      value={dateRange.end}
                      onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                      placeholder="Date de fin"
                    />
                  </div>
                </div>

                {/* Quick Date Filters */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Raccourcis temporels
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      onClick={() => {
                        const today = new Date();
                        const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
                        setDateRange({
                          start: weekAgo.toISOString().split('T')[0],
                          end: today.toISOString().split('T')[0]
                        });
                      }}
                      className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      7 jours
                    </button>
                    <button
                      onClick={() => {
                        const today = new Date();
                        const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
                        setDateRange({
                          start: monthAgo.toISOString().split('T')[0],
                          end: today.toISOString().split('T')[0]
                        });
                      }}
                      className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      30 jours
                    </button>
                    <button
                      onClick={() => {
                        const today = new Date();
                        const yearAgo = new Date(today.getTime() - 365 * 24 * 60 * 60 * 1000);
                        setDateRange({
                          start: yearAgo.toISOString().split('T')[0],
                          end: today.toISOString().split('T')[0]
                        });
                      }}
                      className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      1 an
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Results */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            Ordonnances trouvées ({filteredAndSortedPrescriptions.length})
          </h2>
          {selectedPatient && (
            <p className="text-sm text-gray-600 mt-1">
              Filtré pour: {selectedPatient.firstName} {selectedPatient.lastName}
            </p>
          )}
        </div>

        <div className="p-6">
          {filteredAndSortedPrescriptions.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Aucune ordonnance trouvée
              </h3>
              <p className="text-gray-600 mb-4">
                {searchTerm || selectedPatient || statusFilter !== 'all' || dateRange.start || dateRange.end
                  ? 'Aucune ordonnance ne correspond à vos critères de recherche.'
                  : 'Aucune ordonnance disponible.'
                }
              </p>
              {(searchTerm || selectedPatient || statusFilter !== 'all' || dateRange.start || dateRange.end) && (
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
              {filteredAndSortedPrescriptions.map((prescription) => {
                const patient = patients.find(p => p.id === prescription.patientId);
                const statusDisplay = getStatusDisplay(prescription.status);
                const StatusIcon = statusDisplay.icon;
                
                return (
                  <div
                    key={prescription.id}
                    className="border border-gray-200 rounded-lg p-6 hover:bg-gray-50 transition-colors cursor-pointer"
                    onClick={() => onPrescriptionSelect?.(prescription)}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-start space-x-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-sky-400 to-emerald-400 rounded-full flex items-center justify-center">
                          <span className="text-white font-bold">
                            {prescription.patientName.split(' ').map(n => n[0]).join('')}
                          </span>
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">
                            {prescription.patientName}
                          </h3>
                          <p className="text-sm text-gray-600">
                            ID: {prescription.patientId} • {prescription.patientEmail}
                          </p>
                          <div className="flex items-center space-x-4 text-sm text-gray-500 mt-1">
                            <div className="flex items-center space-x-1">
                              <Calendar className="h-4 w-4" />
                              <span>
                                Prescrite le {format(new Date(prescription.prescribedDate), 'dd/MM/yyyy', { locale: fr })}
                              </span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Clock className="h-4 w-4" />
                              <span>
                                Expire le {format(new Date(prescription.expiryDate), 'dd/MM/yyyy', { locale: fr })}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-3">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${statusDisplay.color}`}>
                          <StatusIcon className="h-4 w-4 mr-1" />
                          {statusDisplay.label}
                        </span>
                      </div>
                    </div>

                    {/* Medications */}
                    <div className="space-y-2">
                      <h4 className="font-medium text-gray-900">Médicaments prescrits:</h4>
                      {prescription.medications.map((med, index) => (
                        <div key={index} className="bg-gray-50 rounded-lg p-3">
                          <div className="flex items-start justify-between">
                            <div>
                              <h5 className="font-medium text-gray-900">{med.name}</h5>
                              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-sm text-gray-600 mt-1">
                                <span><strong>Dosage:</strong> {med.dosage}</span>
                                <span><strong>Fréquence:</strong> {med.frequency}</span>
                                <span><strong>Durée:</strong> {med.duration}</span>
                              </div>
                              {med.instructions && (
                                <p className="text-sm text-gray-600 mt-1">
                                  <strong>Instructions:</strong> {med.instructions}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Notes */}
                    {prescription.notes && (
                      <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <p className="text-sm text-blue-800">
                          <strong>Notes:</strong> {prescription.notes}
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Overlay to close suggestions */}
      {showSuggestions && (
        <div 
          className="fixed inset-0 z-40"
          onClick={() => setShowSuggestions(false)}
        />
      )}
    </div>
  );
};