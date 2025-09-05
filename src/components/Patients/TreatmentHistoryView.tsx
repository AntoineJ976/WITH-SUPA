import React, { useState, useMemo } from 'react';
import { 
  Pill, 
  Search, 
  Filter, 
  Calendar, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Minus,
  Eye,
  Edit,
  Activity,
  User,
  FileText,
  Plus,
  Save,
  X
} from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

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
  date: string;
  doctorName: string;
  diagnosis: string;
  status: string;
  type: string;
}

interface TreatmentHistoryViewProps {
  treatments: Treatment[];
  consultations: Consultation[];
  patientId: string;
}

export const TreatmentHistoryView: React.FC<TreatmentHistoryViewProps> = ({
  treatments,
  consultations,
  patientId
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'completed' | 'discontinued'>('all');
  const [selectedTreatment, setSelectedTreatment] = useState<Treatment | null>(null);
  const [showTreatmentModal, setShowTreatmentModal] = useState(false);
  const [editingTreatment, setEditingTreatment] = useState<Treatment | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [treatmentForm, setTreatmentForm] = useState<Partial<Treatment>>({});

  // Filter and sort treatments
  const filteredTreatments = useMemo(() => {
    let filtered = treatments;

    // Apply search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(treatment => 
        treatment.medication.toLowerCase().includes(searchLower) ||
        treatment.instructions.toLowerCase().includes(searchLower) ||
        treatment.dosage.toLowerCase().includes(searchLower) ||
        treatment.frequency.toLowerCase().includes(searchLower)
      );
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(treatment => treatment.status === statusFilter);
    }

    // Sort by start date (newest first)
    return filtered.sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());
  }, [treatments, searchTerm, statusFilter]);

  // Get consultation for treatment
  const getConsultationForTreatment = (consultationId: string) => {
    return consultations.find(c => c.id === consultationId);
  };

  // Get status display
  const getStatusDisplay = (status: string) => {
    const statusConfig = {
      active: { color: 'text-green-700 bg-green-100', icon: CheckCircle, label: 'En cours' },
      completed: { color: 'text-blue-700 bg-blue-100', icon: CheckCircle, label: 'Terminé' },
      discontinued: { color: 'text-red-700 bg-red-100', icon: XCircle, label: 'Arrêté' }
    };
    
    return statusConfig[status as keyof typeof statusConfig] || statusConfig.active;
  };

  // Get effectiveness display
  const getEffectivenessDisplay = (effectiveness?: string) => {
    if (!effectiveness) return null;
    
    const effectivenessConfig = {
      excellent: { color: 'text-green-700', icon: TrendingUp, label: 'Excellent' },
      good: { color: 'text-emerald-700', icon: TrendingUp, label: 'Bon' },
      fair: { color: 'text-yellow-700', icon: Minus, label: 'Moyen' },
      poor: { color: 'text-red-700', icon: TrendingDown, label: 'Faible' }
    };
    
    return effectivenessConfig[effectiveness as keyof typeof effectivenessConfig];
  };

  // Calculate treatment duration in days
  const calculateTreatmentDays = (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  // Calculate remaining days for active treatments
  const calculateRemainingDays = (endDate: string) => {
    const end = new Date(endDate);
    const today = new Date();
    const diffTime = end.getTime() - today.getTime();
    const remainingDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, remainingDays);
  };

  // Handle treatment view
  const handleViewTreatment = (treatment: Treatment) => {
    setSelectedTreatment(treatment);
    setShowTreatmentModal(true);
  };

  // Handle treatment edit
  const handleEditTreatment = (treatment: Treatment) => {
    setEditingTreatment(treatment);
    setTreatmentForm(treatment);
    setShowEditModal(true);
  };

  // Handle treatment update
  const handleUpdateTreatment = () => {
    if (editingTreatment && treatmentForm) {
      // In production, update in database
      console.log('Updating treatment:', treatmentForm);
      setShowEditModal(false);
      setEditingTreatment(null);
      setTreatmentForm({});
      
      // Show success notification
      const notification = document.createElement('div');
      notification.className = 'fixed top-4 right-4 bg-green-500 text-white p-4 rounded-lg z-50 transition-all';
      notification.textContent = `✅ Traitement ${treatmentForm.medication} mis à jour`;
      document.body.appendChild(notification);
      
      setTimeout(() => {
        if (document.body.contains(notification)) {
          document.body.removeChild(notification);
        }
      }, 3000);
    }
  };

  // Calculate statistics
  const treatmentStats = useMemo(() => {
    const total = treatments.length;
    const active = treatments.filter(t => t.status === 'active').length;
    const completed = treatments.filter(t => t.status === 'completed').length;
    const discontinued = treatments.filter(t => t.status === 'discontinued').length;
    const withSideEffects = treatments.filter(t => t.sideEffects).length;
    
    return { total, active, completed, discontinued, withSideEffects };
  }, [treatments]);

  return (
    <div className="space-y-6">
      {/* Statistics */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        <div className="bg-white p-4 rounded-lg border border-gray-200 text-center hover:shadow-md transition-shadow">
          <Pill className="h-6 w-6 text-sky-500 mx-auto mb-2" />
          <p className="text-xl font-bold text-gray-900">{treatmentStats.total}</p>
          <p className="text-xs sm:text-sm text-gray-600">Total</p>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200 text-center hover:shadow-md transition-shadow">
          <Activity className="h-6 w-6 text-green-500 mx-auto mb-2" />
          <p className="text-xl font-bold text-green-600">{treatmentStats.active}</p>
          <p className="text-xs sm:text-sm text-gray-600">En cours</p>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200 text-center hover:shadow-md transition-shadow">
          <CheckCircle className="h-6 w-6 text-blue-500 mx-auto mb-2" />
          <p className="text-xl font-bold text-blue-600">{treatmentStats.completed}</p>
          <p className="text-xs sm:text-sm text-gray-600">Terminés</p>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200 text-center hover:shadow-md transition-shadow">
          <XCircle className="h-6 w-6 text-red-500 mx-auto mb-2" />
          <p className="text-xl font-bold text-red-600">{treatmentStats.discontinued}</p>
          <p className="text-xs sm:text-sm text-gray-600">Arrêtés</p>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200 text-center hover:shadow-md transition-shadow col-span-2 sm:col-span-1">
          <AlertTriangle className="h-6 w-6 text-amber-500 mx-auto mb-2" />
          <p className="text-xl font-bold text-amber-600">{treatmentStats.withSideEffects}</p>
          <p className="text-xs sm:text-sm text-gray-600">Effets 2nd.</p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher un traitement..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
            />
          </div>
          <div className="flex items-center space-x-3">
            <Filter className="h-4 w-4 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="w-full sm:w-auto px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
            >
              <option value="all">Tous les statuts</option>
              <option value="active">En cours</option>
              <option value="completed">Terminés</option>
              <option value="discontinued">Arrêtés</option>
            </select>
          </div>
        </div>
      </div>

      {/* Treatments List */}
      <div className="space-y-4">
        {filteredTreatments.length === 0 ? (
          <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
            <Pill className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Aucun traitement trouvé
            </h3>
            <p className="text-gray-600 mb-4">
              {searchTerm || statusFilter !== 'all'
                ? 'Aucun traitement ne correspond à vos critères.'
                : 'Aucun traitement prescrit pour ce patient.'}
            </p>
            {(searchTerm || statusFilter !== 'all') && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setStatusFilter('all');
                }}
                className="bg-sky-500 text-white px-4 py-2 rounded-lg hover:bg-sky-600 transition-colors"
              >
                Effacer les filtres
              </button>
            )}
          </div>
        ) : (
          filteredTreatments.map((treatment) => {
            const consultation = getConsultationForTreatment(treatment.consultationId);
            const statusDisplay = getStatusDisplay(treatment.status);
            const effectivenessDisplay = getEffectivenessDisplay(treatment.effectiveness);
            const StatusIcon = statusDisplay.icon;
            const treatmentDays = calculateTreatmentDays(treatment.startDate, treatment.endDate);
            const remainingDays = treatment.status === 'active' ? calculateRemainingDays(treatment.endDate) : 0;
            
            return (
              <div key={treatment.id} className="bg-white border border-gray-200 rounded-lg p-4 sm:p-6 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-3 mb-2 space-y-2 sm:space-y-0">
                      <h3 className="text-base sm:text-lg font-semibold text-gray-900">{treatment.medication}</h3>
                      <div className="flex items-center space-x-2">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${statusDisplay.color}`}>
                        <StatusIcon className="h-4 w-4 mr-1" />
                        {statusDisplay.label}
                      </span>
                      {effectivenessDisplay && (
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 ${effectivenessDisplay.color}`}>
                          <effectivenessDisplay.icon className="h-3 w-3 mr-1" />
                          {effectivenessDisplay.label}
                        </span>
                      )}
                      </div>
                    </div>
                    
                    {consultation && (
                      <p className="text-xs sm:text-sm text-gray-600 mb-2 flex items-center space-x-2">
                        <User className="h-4 w-4" />
                        <span>
                          Prescrit le {format(new Date(consultation.date), 'dd/MM/yyyy', { locale: fr })} 
                          par {consultation.doctorName}
                        </span>
                      </p>
                    )}

                    {treatment.status === 'active' && remainingDays > 0 && (
                      <div className="flex items-center space-x-2 text-xs sm:text-sm">
                        <Clock className="h-4 w-4 text-emerald-500" />
                        <span className="text-emerald-700 font-medium">
                          {remainingDays} jour{remainingDays > 1 ? 's' : ''} restant{remainingDays > 1 ? 's' : ''}
                        </span>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex flex-col sm:flex-row items-end sm:items-center space-y-2 sm:space-y-0 sm:space-x-2">
                    <button
                      onClick={() => handleViewTreatment(treatment)}
                      className="p-2 text-gray-400 hover:text-gray-600 transition-colors rounded-lg hover:bg-gray-100"
                      title="Voir les détails"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleEditTreatment(treatment)}
                      className="p-2 text-gray-400 hover:text-gray-600 transition-colors rounded-lg hover:bg-gray-100"
                      title="Modifier le traitement"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
                  <div>
                    <span className="text-sm font-medium text-gray-700">Dosage:</span>
                    <p className="text-sm text-gray-900">{treatment.dosage}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-700">Fréquence:</span>
                    <p className="text-sm text-gray-900">{treatment.frequency}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-700">Durée:</span>
                    <p className="text-sm text-gray-900">{treatment.duration} ({treatmentDays} jours)</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-700">Période:</span>
                    <p className="text-sm text-gray-900">
                      {format(new Date(treatment.startDate), 'dd/MM', { locale: fr })} - {format(new Date(treatment.endDate), 'dd/MM/yyyy', { locale: fr })}
                    </p>
                  </div>
                </div>

                {treatment.instructions && (
                  <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-start space-x-2">
                      <AlertTriangle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <span className="text-sm font-medium text-blue-900">Instructions:</span>
                        <p className="text-sm text-blue-800">{treatment.instructions}</p>
                      </div>
                    </div>
                  </div>
                )}

                {treatment.sideEffects && (
                  <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                    <div className="flex items-start space-x-2">
                      <AlertTriangle className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <span className="text-sm font-medium text-amber-900">Effets secondaires observés:</span>
                        <p className="text-sm text-amber-800">{treatment.sideEffects}</p>
                      </div>
                    </div>
                  </div>
                )}

                {treatment.notes && (
                  <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
                    <span className="text-sm font-medium text-gray-900">Notes:</span>
                    <p className="text-sm text-gray-700 mt-1">{treatment.notes}</p>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Treatment Detail Modal */}
      {showTreatmentModal && selectedTreatment && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-emerald-500 rounded-lg flex items-center justify-center">
                    <Pill className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">
                      Détails du traitement
                    </h2>
                    <p className="text-sm text-gray-600">{selectedTreatment.medication}</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowTreatmentModal(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 transition-colors rounded-lg hover:bg-gray-100"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Treatment Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Informations du traitement</h3>
                  <div className="space-y-3 text-sm">
                    <div>
                      <span className="font-medium text-gray-700">Médicament:</span>
                      <span className="ml-2 text-gray-900">{selectedTreatment.medication}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Dosage:</span>
                      <span className="ml-2 text-gray-900">{selectedTreatment.dosage}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Fréquence:</span>
                      <span className="ml-2 text-gray-900">{selectedTreatment.frequency}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Durée:</span>
                      <span className="ml-2 text-gray-900">{selectedTreatment.duration}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Période de traitement</h3>
                  <div className="space-y-3 text-sm">
                    <div>
                      <span className="font-medium text-gray-700">Début:</span>
                      <span className="ml-2 text-gray-900">
                        {format(new Date(selectedTreatment.startDate), 'dd/MM/yyyy à HH:mm', { locale: fr })}
                      </span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Fin:</span>
                      <span className="ml-2 text-gray-900">
                        {format(new Date(selectedTreatment.endDate), 'dd/MM/yyyy à HH:mm', { locale: fr })}
                      </span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Durée totale:</span>
                      <span className="ml-2 text-gray-900">
                        {calculateTreatmentDays(selectedTreatment.startDate, selectedTreatment.endDate)} jours
                      </span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Statut:</span>
                      <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${getStatusDisplay(selectedTreatment.status).color}`}>
                        {getStatusDisplay(selectedTreatment.status).label}
                      </span>
                    </div>
                    {selectedTreatment.status === 'active' && (
                      <div>
                        <span className="font-medium text-gray-700">Temps restant:</span>
                        <span className="ml-2 text-emerald-600 font-medium">
                          {calculateRemainingDays(selectedTreatment.endDate)} jour{calculateRemainingDays(selectedTreatment.endDate) > 1 ? 's' : ''}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Instructions */}
              {selectedTreatment.instructions && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h3 className="font-semibold text-blue-900 mb-2">Instructions particulières</h3>
                  <p className="text-blue-800">{selectedTreatment.instructions}</p>
                </div>
              )}

              {/* Effectiveness */}
              {selectedTreatment.effectiveness && (
                <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
                  <h3 className="font-semibold text-emerald-900 mb-2">Efficacité du traitement</h3>
                  <div className="flex items-center space-x-2">
                    {(() => {
                      const effectiveness = getEffectivenessDisplay(selectedTreatment.effectiveness);
                      if (!effectiveness) return null;
                      const EffectivenessIcon = effectiveness.icon;
                      return (
                        <>
                          <EffectivenessIcon className={`h-5 w-5 ${effectiveness.color}`} />
                          <span className={`font-medium ${effectiveness.color}`}>
                            {effectiveness.label}
                          </span>
                        </>
                      );
                    })()}
                  </div>
                </div>
              )}

              {/* Side Effects */}
              {selectedTreatment.sideEffects && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <h3 className="font-semibold text-red-900 mb-2">Effets secondaires observés</h3>
                  <p className="text-red-800">{selectedTreatment.sideEffects}</p>
                </div>
              )}

              {/* Notes */}
              {selectedTreatment.notes && (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-2">Notes complémentaires</h3>
                  <p className="text-gray-700">{selectedTreatment.notes}</p>
                </div>
              )}

              {/* Related Consultation */}
              {(() => {
                const consultation = getConsultationForTreatment(selectedTreatment.consultationId);
                if (!consultation) return null;
                
                return (
                  <div className="bg-sky-50 border border-sky-200 rounded-lg p-4">
                    <h3 className="font-semibold text-sky-900 mb-2">Consultation associée</h3>
                    <div className="text-sm text-sky-800 space-y-1">
                      <p><strong>Date:</strong> {format(new Date(consultation.date), 'dd/MM/yyyy', { locale: fr })}</p>
                      <p><strong>Médecin:</strong> {consultation.doctorName}</p>
                      <p><strong>Diagnostic:</strong> {consultation.diagnosis}</p>
                      <p><strong>Type:</strong> {consultation.type === 'video' ? 'Vidéo' : consultation.type === 'phone' ? 'Téléphone' : 'Présentiel'}</p>
                    </div>
                  </div>
                );
              })()}
            </div>

            <div className="p-6 border-t border-gray-200 flex justify-between">
              <button
                onClick={() => handleEditTreatment(selectedTreatment)}
                className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <Edit className="h-4 w-4" />
                <span>Modifier</span>
              </button>
              <button
                onClick={() => setShowTreatmentModal(false)}
                className="px-4 py-2 bg-sky-500 text-white rounded-lg hover:bg-sky-600 transition-colors"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Treatment Edit Modal */}
      {showEditModal && editingTreatment && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">
                  Modifier le traitement: {editingTreatment.medication}
                </h2>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Statut du traitement
                  </label>
                  <select
                    value={treatmentForm.status || editingTreatment.status}
                    onChange={(e) => setTreatmentForm(prev => ({ ...prev, status: e.target.value as any }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                  >
                    <option value="active">En cours</option>
                    <option value="completed">Terminé</option>
                    <option value="discontinued">Arrêté</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Efficacité
                  </label>
                  <select
                    value={treatmentForm.effectiveness || editingTreatment.effectiveness || ''}
                    onChange={(e) => setTreatmentForm(prev => ({ ...prev, effectiveness: e.target.value as any }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                  >
                    <option value="">Non évaluée</option>
                    <option value="excellent">Excellente</option>
                    <option value="good">Bonne</option>
                    <option value="fair">Moyenne</option>
                    <option value="poor">Faible</option>
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Effets secondaires observés
                </label>
                <textarea
                  value={treatmentForm.sideEffects || editingTreatment.sideEffects || ''}
                  onChange={(e) => setTreatmentForm(prev => ({ ...prev, sideEffects: e.target.value }))}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent resize-none"
                  placeholder="Décrivez les effets secondaires observés..."
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notes complémentaires
                </label>
                <textarea
                  value={treatmentForm.notes || editingTreatment.notes || ''}
                  onChange={(e) => setTreatmentForm(prev => ({ ...prev, notes: e.target.value }))}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent resize-none"
                  placeholder="Notes additionnelles sur le traitement..."
                />
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 flex justify-end space-x-3">
              <button
                onClick={() => setShowEditModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={handleUpdateTreatment}
                className="px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors flex items-center space-x-2"
              >
                <Save className="h-4 w-4" />
                <span>Sauvegarder</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};