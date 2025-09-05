import React, { useState, useMemo } from 'react';
import { Calendar, Clock, Video, Phone, MessageSquare, ChevronRight, CreditCard, MapPin, Star, Filter, Search, SortAsc, Users, Award } from 'lucide-react';
import { useSupabaseQuery } from '../../hooks/useSupabase';
import { format, addDays, isBefore, isAfter, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';

interface ConsultationBookingProps {
  onViewChange?: (view: string) => void;
}

interface Doctor {
  id: string;
  name: string;
  specialty: string;
  experience: string;
  rating: number;
  fee: number;
  nextAvailable: string;
  languages: string[];
  verified: boolean;
  location: {
    city: string;
    distance?: number; // Distance en km depuis le patient
  };
  availableSlots: string[];
  totalPatients: number;
  responseTime: string; // Temps de réponse moyen
}

export const ConsultationBooking: React.FC<ConsultationBookingProps> = ({ onViewChange }) => {
  const [selectedDoctor, setSelectedDoctor] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [consultationType, setConsultationType] = useState<'video' | 'phone' | 'chat'>('video');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [specialtyFilter, setSpecialtyFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'availability' | 'distance' | 'rating' | 'price'>('availability');
  const [showFilters, setShowFilters] = useState(false);

  // Charger les médecins depuis Supabase
  const { data: doctorsData, loading: doctorsLoading, error: doctorsError } = useSupabaseQuery(
    'users',
    [{ column: 'role', operator: 'eq', value: 'doctor' }]
  );

  // Simuler l'état de paiement du patient
  const [hasValidPaymentMethod, setHasValidPaymentMethod] = useState(false);

  // Vérifier si le patient a une méthode de paiement valide
  React.useEffect(() => {
    const savedCards = localStorage.getItem('savedPaymentCards');
    setHasValidPaymentMethod(savedCards && JSON.parse(savedCards).length > 0);
  }, []);

  // Transformer les données Supabase en format attendu avec données enrichies
  const doctors = useMemo(() => {
    if (!doctorsData || doctorsData.length === 0) {
      // Données de fallback enrichies si Supabase n'est pas disponible
      return [
        {
          id: '1',
          name: 'Dr. Marie Leblanc',
          specialty: 'Médecine générale',
          experience: '10 ans',
          rating: 4.9,
          fee: 50,
          nextAvailable: '2025-01-15',
          languages: ['Français', 'Anglais'],
          verified: true,
          location: { city: 'Paris 8ème', distance: 2.3 },
          availableSlots: ['09:00', '10:30', '14:00', '15:30', '16:00'],
          totalPatients: 1250,
          responseTime: '< 2h'
        },
        {
          id: '2',
          name: 'Dr. Pierre Martin',
          specialty: 'Cardiologie',
          experience: '15 ans',
          rating: 4.8,
          fee: 80,
          nextAvailable: '2025-01-16',
          languages: ['Français'],
          verified: true,
          location: { city: 'Paris 16ème', distance: 5.7 },
          availableSlots: ['08:30', '11:00', '14:30', '17:00'],
          totalPatients: 890,
          responseTime: '< 4h'
        },
        {
          id: '3',
          name: 'Dr. Sophie Durand',
          specialty: 'Dermatologie',
          experience: '8 ans',
          rating: 4.7,
          fee: 70,
          nextAvailable: '2025-01-15',
          languages: ['Français', 'Anglais', 'Espagnol'],
          verified: true,
          location: { city: 'Paris 7ème', distance: 1.8 },
          availableSlots: ['09:30', '11:30', '15:00', '16:30'],
          totalPatients: 650,
          responseTime: '< 1h'
        },
        {
          id: '4',
          name: 'Dr. Jean Moreau',
          specialty: 'Pédiatrie',
          experience: '12 ans',
          rating: 4.9,
          fee: 60,
          nextAvailable: '2025-01-17',
          languages: ['Français'],
          verified: true,
          location: { city: 'Paris 15ème', distance: 8.2 },
          availableSlots: ['10:00', '13:30', '15:00'],
          totalPatients: 420,
          responseTime: '< 3h'
        },
        {
          id: '5',
          name: 'Dr. Claire Dubois',
          specialty: 'Gynécologie',
          experience: '18 ans',
          rating: 4.8,
          fee: 75,
          nextAvailable: '2025-01-15',
          languages: ['Français', 'Anglais'],
          verified: true,
          location: { city: 'Paris 12ème', distance: 4.1 },
          availableSlots: ['08:00', '12:00', '14:00', '17:30'],
          totalPatients: 980,
          responseTime: '< 2h'
        }
      ];
    }

    return doctorsData.map((doctor: any) => ({
      id: doctor.id,
      name: `Dr. ${doctor.profile?.firstName || ''} ${doctor.profile?.lastName || ''}`.trim(),
      specialty: doctor.profile?.speciality || 'Médecine générale',
      experience: `${doctor.profile?.experience || 0} ans`,
      rating: 4.8, // Note par défaut
      fee: doctor.profile?.consultationFee || 50,
      nextAvailable: '2025-01-15',
      languages: doctor.profile?.languages || ['Français'],
      verified: doctor.profile?.verified || false,
      location: { city: 'Paris', distance: Math.random() * 10 },
      availableSlots: ['09:00', '10:30', '14:00', '15:30'],
      totalPatients: Math.floor(Math.random() * 1000) + 100,
      responseTime: '< 2h'
    }));
  }, [doctorsData]);

  // Filtrer et trier les médecins
  const filteredAndSortedDoctors = useMemo(() => {
    let filtered = doctors;

    // Filtrer par recherche textuelle
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(doctor => 
        doctor.name.toLowerCase().includes(searchLower) ||
        doctor.specialty.toLowerCase().includes(searchLower) ||
        doctor.location.city.toLowerCase().includes(searchLower)
      );
    }

    // Filtrer par spécialité
    if (specialtyFilter !== 'all') {
      filtered = filtered.filter(doctor => doctor.specialty === specialtyFilter);
    }

    // Trier selon le critère sélectionné
    const sorted = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'availability':
          // Trier par disponibilité (plus tôt = mieux) puis par nombre de créneaux
          const dateA = new Date(a.nextAvailable);
          const dateB = new Date(b.nextAvailable);
          if (dateA.getTime() !== dateB.getTime()) {
            return dateA.getTime() - dateB.getTime();
          }
          return b.availableSlots.length - a.availableSlots.length;
        
        case 'distance':
          // Trier par distance (plus proche = mieux)
          return (a.location.distance || 0) - (b.location.distance || 0);
        
        case 'rating':
          // Trier par note (meilleure = mieux)
          return b.rating - a.rating;
        
        case 'price':
          // Trier par prix (moins cher = mieux)
          return a.fee - b.fee;
        
        default:
          return 0;
      }
    });

    return sorted;
  }, [doctors, searchTerm, specialtyFilter, sortBy]);

  // Obtenir les spécialités uniques pour le filtre
  const specialties = useMemo(() => {
    const uniqueSpecialties = [...new Set(doctors.map(d => d.specialty))];
    return uniqueSpecialties.sort();
  }, [doctors]);

  const availableSlots = [
    '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '14:00', '14:30', '15:00', '15:30', '16:00', '16:30'
  ];

  const consultationTypes = [
    { id: 'video', label: 'Vidéo consultation', icon: Video, description: 'Consultation par vidéo', popular: true },
    { id: 'phone', label: 'Consultation Cabinet', icon: Phone, description: 'Consultation au cabinet', popular: false },
    { id: 'chat', label: 'Messagerie sécurisée', icon: MessageSquare, description: 'Consultation par messages', popular: false }
  ];

  const selectedDoctorData = filteredAndSortedDoctors.find(d => d.id === selectedDoctor);

  const handleConfirmBooking = () => {
    if (!hasValidPaymentMethod) {
      setShowPaymentModal(true);
      return;
    }
    
    // Simulation du paiement réussi
    alert(`✅ Consultation confirmée avec ${selectedDoctorData?.name} le ${selectedDate} à ${selectedTime}`);
    
    // Réinitialiser le formulaire
    setSelectedDoctor(null);
    setSelectedDate('');
    setSelectedTime('');
    setConsultationType('video');
  };

  const handleGoToPayments = () => {
    setShowPaymentModal(false);
    if (onViewChange) {
      onViewChange('payments');
    }
  };

  const getSortLabel = (sortType: string) => {
    const labels = {
      availability: 'Disponibilité',
      distance: 'Proximité',
      rating: 'Note',
      price: 'Prix'
    };
    return labels[sortType as keyof typeof labels] || sortType;
  };

  const getNextAvailableSlots = (doctor: Doctor) => {
    // Simuler les prochains créneaux disponibles
    const today = new Date();
    const slots = [];
    
    for (let i = 0; i < 3; i++) {
      const date = addDays(today, i);
      const availableToday = doctor.availableSlots.slice(0, 2); // 2 premiers créneaux
      
      availableToday.forEach(time => {
        slots.push({
          date: format(date, 'yyyy-MM-dd'),
          time,
          dateLabel: format(date, 'EEE dd MMM', { locale: fr })
        });
      });
    }
    
    return slots.slice(0, 4); // Limiter à 4 créneaux
  };

  return (
    <div className="space-y-6">
      {/* Header avec navigation breadcrumb */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center space-x-2 text-sm text-gray-500 mb-3">
          <span>Patient</span>
          <ChevronRight className="h-4 w-4" />
          <span className="text-sky-600 font-medium">Réserver une consultation</span>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Réserver une consultation</h1>
        <p className="text-gray-600">
          Trouvez le médecin idéal et réservez votre consultation en quelques clics.
        </p>
      </div>

      {/* Recherche et filtres */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Barre de recherche */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher un médecin, spécialité ou ville..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent text-base"
              />
            </div>
          </div>

          {/* Filtres */}
          <div className="flex flex-col sm:flex-row gap-3">
            <select
              value={specialtyFilter}
              onChange={(e) => setSpecialtyFilter(e.target.value)}
              className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
            >
              <option value="all">Toutes spécialités</option>
              {specialties.map(specialty => (
                <option key={specialty} value={specialty}>{specialty}</option>
              ))}
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
            >
              <option value="availability">Trier par disponibilité</option>
              <option value="distance">Trier par proximité</option>
              <option value="rating">Trier par note</option>
              <option value="price">Trier par prix</option>
            </select>

            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center space-x-2 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Filter className="h-4 w-4" />
              <span>Filtres</span>
            </button>
          </div>
        </div>

        {/* Filtres avancés */}
        {showFilters && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Distance maximale
                </label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500">
                  <option value="all">Toutes distances</option>
                  <option value="2">Moins de 2 km</option>
                  <option value="5">Moins de 5 km</option>
                  <option value="10">Moins de 10 km</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Prix maximum
                </label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500">
                  <option value="all">Tous prix</option>
                  <option value="50">Jusqu'à 50€</option>
                  <option value="70">Jusqu'à 70€</option>
                  <option value="100">Jusqu'à 100€</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Disponibilité
                </label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500">
                  <option value="all">Toutes disponibilités</option>
                  <option value="today">Aujourd'hui</option>
                  <option value="tomorrow">Demain</option>
                  <option value="week">Cette semaine</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Indicateur de tri actuel */}
        <div className="mt-4 flex items-center space-x-2 text-sm text-gray-600">
          <SortAsc className="h-4 w-4" />
          <span>Trié par: <strong>{getSortLabel(sortBy)}</strong></span>
          <span>•</span>
          <span>{filteredAndSortedDoctors.length} médecin{filteredAndSortedDoctors.length > 1 ? 's' : ''} trouvé{filteredAndSortedDoctors.length > 1 ? 's' : ''}</span>
        </div>
      </div>

      {/* Liste des médecins */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">1. Choisir un médecin</h2>
          <p className="text-sm text-gray-600 mt-1">
            Médecins triés par {getSortLabel(sortBy).toLowerCase()}
          </p>
        </div>
        <div className="p-6">
          {doctorsLoading && (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-500 mx-auto mb-4"></div>
              <p className="text-gray-600">Recherche des médecins disponibles...</p>
            </div>
          )}
          
          {doctorsError && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
              <p className="text-yellow-800 text-sm">
                ⚠️ Impossible de charger les médecins depuis Firebase. 
                Affichage des médecins de démonstration.
              </p>
            </div>
          )}

          {filteredAndSortedDoctors.length === 0 ? (
            <div className="text-center py-12">
              <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun médecin trouvé</h3>
              <p className="text-gray-600 mb-4">
                Aucun médecin ne correspond à vos critères de recherche.
              </p>
              <button
                onClick={() => {
                  setSearchTerm('');
                  setSpecialtyFilter('all');
                }}
                className="bg-sky-500 text-white px-4 py-2 rounded-lg hover:bg-sky-600 transition-colors"
              >
                Réinitialiser les filtres
              </button>
            </div>
          ) : (
            <div className="grid gap-4">
              {filteredAndSortedDoctors.map((doctor) => (
                <div
                  key={doctor.id}
                  onClick={() => setSelectedDoctor(doctor.id)}
                  className={`p-6 rounded-lg border-2 cursor-pointer transition-all hover:shadow-md ${
                    selectedDoctor === doctor.id
                      ? 'border-sky-500 bg-sky-50 shadow-md'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4 flex-1">
                      <div className="w-16 h-16 bg-gradient-to-br from-sky-400 to-emerald-400 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-white font-bold text-lg">
                          {doctor.name.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-2">
                          <h3 className="font-bold text-lg text-gray-900">{doctor.name}</h3>
                          {doctor.verified && (
                            <div className="flex items-center space-x-1 bg-green-100 px-2 py-1 rounded-full">
                              <Award className="h-3 w-3 text-green-600" />
                              <span className="text-xs font-medium text-green-800">Vérifié</span>
                            </div>
                          )}
                        </div>
                        
                        <p className="text-sky-600 font-medium mb-2">{doctor.specialty}</p>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-sm">
                          <div className="flex items-center space-x-2">
                            <Star className="h-4 w-4 text-yellow-500" />
                            <span className="font-medium text-gray-900">{doctor.rating}</span>
                            <span className="text-gray-500">({doctor.totalPatients} patients)</span>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <MapPin className="h-4 w-4 text-gray-400" />
                            <span className="text-gray-700">{doctor.location.city}</span>
                            {doctor.location.distance && (
                              <span className="text-gray-500">({doctor.location.distance.toFixed(1)} km)</span>
                            )}
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <Clock className="h-4 w-4 text-gray-400" />
                            <span className="text-gray-700">Répond {doctor.responseTime}</span>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <Calendar className="h-4 w-4 text-gray-400" />
                            <span className="text-gray-700">{doctor.experience} d'expérience</span>
                          </div>
                        </div>

                        {/* Créneaux disponibles aperçu */}
                        <div className="mt-4">
                          <p className="text-sm font-medium text-gray-700 mb-2">Prochains créneaux disponibles :</p>
                          <div className="flex flex-wrap gap-2">
                            {getNextAvailableSlots(doctor).slice(0, 4).map((slot, index) => (
                              <div key={index} className="bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full text-xs font-medium">
                                {slot.dateLabel} à {slot.time}
                              </div>
                            ))}
                            {doctor.availableSlots.length > 4 && (
                              <div className="text-emerald-600 text-xs font-medium px-2 py-1">
                                +{doctor.availableSlots.length - 4} autres créneaux
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Langues parlées */}
                        <div className="mt-3 flex items-center space-x-2">
                          <span className="text-sm text-gray-600">Langues :</span>
                          <div className="flex space-x-1">
                            {doctor.languages.map((lang, index) => (
                              <span key={index} className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs">
                                {lang}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right flex-shrink-0 ml-4">
                      <div className="mb-2">
                        <p className="text-2xl font-bold text-gray-900">{doctor.fee}€</p>
                        <p className="text-sm text-gray-500">par consultation</p>
                      </div>
                      
                      {sortBy === 'availability' && (
                        <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-medium mb-2">
                          Disponible {format(new Date(doctor.nextAvailable), 'dd/MM', { locale: fr })}
                        </div>
                      )}
                      
                      {sortBy === 'distance' && doctor.location.distance && (
                        <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-medium mb-2">
                          À {doctor.location.distance.toFixed(1)} km
                        </div>
                      )}
                      
                      <ChevronRight className={`h-6 w-6 transition-colors ${
                        selectedDoctor === doctor.id ? 'text-sky-500' : 'text-gray-400'
                      }`} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Type de consultation */}
      {selectedDoctor && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">2. Type de consultation</h2>
            <p className="text-sm text-gray-600 mt-1">
              Choisissez le mode de consultation qui vous convient
            </p>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {consultationTypes.map((type) => {
                const Icon = type.icon;
                return (
                  <button
                    key={type.id}
                    onClick={() => setConsultationType(type.id as any)}
                    className={`p-6 rounded-lg border-2 transition-all relative ${
                      consultationType === type.id
                        ? 'border-sky-500 bg-sky-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    {type.popular && (
                      <div className="absolute -top-2 -right-2 bg-emerald-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                        Populaire
                      </div>
                    )}
                    <Icon className={`h-8 w-8 mx-auto mb-3 ${
                      consultationType === type.id ? 'text-sky-500' : 'text-gray-400'
                    }`} />
                    <h3 className={`font-medium mb-2 ${
                      consultationType === type.id ? 'text-sky-700' : 'text-gray-900'
                    }`}>
                      {type.label}
                    </h3>
                    <p className="text-sm text-gray-600">{type.description}</p>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Sélection date et heure */}
      {selectedDoctor && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">3. Date et heure</h2>
            <p className="text-sm text-gray-600 mt-1">
              Créneaux disponibles avec {selectedDoctorData?.name}
            </p>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Sélection de date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Choisir une date
                </label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  max={addDays(new Date(), 30).toISOString().split('T')[0]}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                />
              </div>

              {/* Créneaux horaires */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Créneaux disponibles
                  {selectedDoctorData && (
                    <span className="ml-2 text-emerald-600 font-medium">
                      ({selectedDoctorData.availableSlots.length} créneaux)
                    </span>
                  )}
                </label>
                <div className="grid grid-cols-3 gap-2 max-h-48 overflow-y-auto">
                  {selectedDoctorData?.availableSlots.map((time) => (
                    <button
                      key={time}
                      onClick={() => setSelectedTime(time)}
                      className={`p-3 text-sm rounded-lg border transition-all ${
                        selectedTime === time
                          ? 'border-sky-500 bg-sky-50 text-sky-700 font-medium'
                          : 'border-gray-200 text-gray-700 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {time}
                    </button>
                  ))}
                </div>
                
                {selectedDate && selectedDoctorData && (
                  <div className="mt-3 p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
                    <p className="text-sm text-emerald-800">
                      ✅ {selectedDoctorData.availableSlots.length} créneaux disponibles le {format(new Date(selectedDate), 'dd MMMM yyyy', { locale: fr })}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Récapitulatif de réservation */}
      {selectedDoctor && selectedDate && selectedTime && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">4. Récapitulatif de la réservation</h2>
          </div>
          <div className="p-6">
            <div className="bg-gradient-to-r from-sky-50 to-emerald-50 rounded-lg p-6 border border-sky-200">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Médecin :</span>
                    <span className="font-medium text-gray-900">{selectedDoctorData?.name}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Spécialité :</span>
                    <span className="font-medium text-gray-900">{selectedDoctorData?.specialty}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Localisation :</span>
                    <span className="font-medium text-gray-900">{selectedDoctorData?.location.city}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Note :</span>
                    <div className="flex items-center space-x-1">
                      <Star className="h-4 w-4 text-yellow-500" />
                      <span className="font-medium text-gray-900">{selectedDoctorData?.rating}</span>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Date :</span>
                    <span className="font-medium text-gray-900">
                      {format(new Date(selectedDate), 'dd MMMM yyyy', { locale: fr })}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Heure :</span>
                    <span className="font-medium text-gray-900">{selectedTime}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Type :</span>
                    <span className="font-medium text-gray-900 capitalize">
                      {consultationTypes.find(t => t.id === consultationType)?.label}
                    </span>
                  </div>
                  <div className="flex justify-between items-center border-t pt-4">
                    <span className="text-lg font-semibold text-gray-900">Total :</span>
                    <span className="text-2xl font-bold text-sky-600">{selectedDoctorData?.fee}€</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex items-center space-x-3 text-sm text-gray-600">
                <Clock className="h-4 w-4" />
                <span>Temps de réponse estimé : {selectedDoctorData?.responseTime}</span>
                <span>•</span>
                <span>Confirmation automatique</span>
              </div>
            </div>

            <button 
              onClick={handleConfirmBooking}
              className="w-full mt-6 bg-sky-600 text-white py-4 px-6 rounded-lg font-semibold text-lg hover:bg-sky-700 transition-colors shadow-md hover:shadow-lg"
            >
              Confirmer la réservation - {selectedDoctorData?.fee}€
            </button>
          </div>
        </div>
      )}

      {/* Modal de vérification de paiement */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Méthode de paiement requise</h2>
            </div>
            
            <div className="p-6">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CreditCard className="h-8 w-8 text-amber-600" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Carte bancaire requise
                </h3>
                <p className="text-gray-600 text-sm">
                  Pour finaliser votre réservation, vous devez d'abord enregistrer une méthode de paiement sécurisée.
                </p>
              </div>

              {selectedDoctorData && (
                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                  <h4 className="font-medium text-gray-900 mb-2">Consultation sélectionnée :</h4>
                  <div className="text-sm text-gray-600 space-y-1">
                    <p><strong>Médecin :</strong> {selectedDoctorData.name}</p>
                    <p><strong>Date :</strong> {format(new Date(selectedDate), 'dd MMMM yyyy', { locale: fr })} à {selectedTime}</p>
                    <p><strong>Type :</strong> {consultationTypes.find(t => t.id === consultationType)?.label}</p>
                    <p><strong>Tarif :</strong> {selectedDoctorData.fee}€</p>
                  </div>
                </div>
              )}
            </div>

            <div className="p-6 border-t border-gray-200 flex justify-end space-x-3">
              <button
                onClick={() => setShowPaymentModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={handleGoToPayments}
                className="px-4 py-2 bg-sky-500 text-white rounded-lg hover:bg-sky-600 transition-colors flex items-center space-x-2"
              >
                <CreditCard className="h-4 w-4" />
                <span>Ajouter une carte</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};