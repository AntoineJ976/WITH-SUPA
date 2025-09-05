import React, { useState, useEffect } from 'react';
import { FileText, Search, Filter, User, Calendar, Eye, Download, Plus, AlertCircle, Users, Activity } from 'lucide-react';
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
  status: 'active' | 'inactive';
  consultationsCount: number;
  lastConsultation?: string;
}

interface MedicalRecord {
  id: string;
  patientId: string;
  doctorId: string;
  doctorName: string;
  consultationDate: string;
  diagnosis: string;
  symptoms: string;
  treatment: string;
  notes: string;
  attachments: string[];
  type: 'consultation' | 'prescription' | 'analysis' | 'imaging';
  status: 'active' | 'archived';
}

export const SecretaryMedicalRecords: React.FC = () => {
  const { user } = useAuth();
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [medicalRecords, setMedicalRecords] = useState<MedicalRecord[]>([]);
  const [filteredRecords, setFilteredRecords] = useState<MedicalRecord[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [recordTypeFilter, setRecordTypeFilter] = useState<string>('all');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  // Données simulées pour les patients
  const mockPatients: Patient[] = [
    {
      id: '1',
      firstName: 'Jean',
      lastName: 'Dupont',
      email: 'jean.dupont@email.com',
      phone: '+33123456789',
      dateOfBirth: '1985-06-15',
      status: 'active',
      consultationsCount: 12,
      lastConsultation: '2025-01-10T10:00:00Z'
    },
    {
      id: '2',
      firstName: 'Marie',
      lastName: 'Martin',
      email: 'marie.martin@email.com',
      phone: '+33234567890',
      dateOfBirth: '1992-03-22',
      status: 'active',
      consultationsCount: 5,
      lastConsultation: '2025-01-08T15:00:00Z'
    },
    {
      id: '3',
      firstName: 'Pierre',
      lastName: 'Durand',
      email: 'pierre.durand@email.com',
      phone: '+33345678901',
      dateOfBirth: '1978-11-08',
      status: 'active',
      consultationsCount: 8,
      lastConsultation: '2024-12-15T11:30:00Z'
    }
  ];

  // Données simulées pour les dossiers médicaux
  const mockMedicalRecords: MedicalRecord[] = [
    {
      id: '1',
      patientId: '1',
      doctorId: 'doc1',
      doctorName: 'Dr. Marie Leblanc',
      consultationDate: '2025-01-10T10:00:00Z',
      diagnosis: 'Infection respiratoire haute',
      symptoms: 'Toux, fièvre, maux de gorge',
      treatment: 'Amoxicilline 500mg, repos',
      notes: 'Patient en bonne voie de guérison. Contrôle dans 1 semaine si symptômes persistent.',
      attachments: ['ordonnance_20250110.pdf'],
      type: 'consultation',
      status: 'active'
    },
    {
      id: '2',
      patientId: '1',
      doctorId: 'doc2',
      doctorName: 'Dr. Pierre Martin',
      consultationDate: '2024-12-15T14:30:00Z',
      diagnosis: 'Contrôle de routine',
      symptoms: 'Aucun symptôme particulier',
      treatment: 'Poursuite du traitement actuel',
      notes: 'Tension artérielle stable. Prochain contrôle dans 6 mois.',
      attachments: ['ecg_20241215.pdf', 'analyses_sang.pdf'],
      type: 'analysis',
      status: 'active'
    },
    {
      id: '3',
      patientId: '2',
      doctorId: 'doc1',
      doctorName: 'Dr. Marie Leblanc',
      consultationDate: '2025-01-08T15:00:00Z',
      diagnosis: 'Crise d\'asthme légère',
      symptoms: 'Difficultés respiratoires, sifflements',
      treatment: 'Ventoline, corticoïdes',
      notes: 'Ajustement du traitement de fond recommandé.',
      attachments: ['ordonnance_asthme.pdf'],
      type: 'prescription',
      status: 'active'
    },
    {
      id: '4',
      patientId: '3',
      doctorId: 'doc2',
      doctorName: 'Dr. Pierre Martin',
      consultationDate: '2024-12-15T11:30:00Z',
      diagnosis: 'Hypercholestérolémie',
      symptoms: 'Fatigue, essoufflement',
      treatment: 'Statines, régime alimentaire',
      notes: 'Surveillance lipidique dans 3 mois.',
      attachments: ['bilan_lipidique.pdf'],
      type: 'analysis',
      status: 'active'
    }
  ];

  // Charger les données au montage du composant
  useEffect(() => {
    loadPatients();
    loadMedicalRecords();
  }, []);

  // Filtrer les dossiers médicaux quand le patient sélectionné change
  useEffect(() => {
    if (selectedPatient) {
      filterRecordsByPatient(selectedPatient.id);
    } else {
      setFilteredRecords([]);
    }
  }, [selectedPatient, medicalRecords, recordTypeFilter]);

  const loadPatients = async () => {
    try {
      setLoading(true);
      // En production, charger depuis Firebase
      // const patientsData = await PatientService.getAllPatients();
      setPatients(mockPatients);
    } catch (error) {
      console.error('Erreur chargement patients:', error);
      setError('Impossible de charger la liste des patients');
      setPatients(mockPatients); // Fallback
    } finally {
      setLoading(false);
    }
  };

  const loadMedicalRecords = async () => {
    try {
      // En production, charger depuis Firebase
      // const recordsData = await MedicalRecordService.getAllRecords();
      setMedicalRecords(mockMedicalRecords);
    } catch (error) {
      console.error('Erreur chargement dossiers médicaux:', error);
      setError('Impossible de charger les dossiers médicaux');
      setMedicalRecords(mockMedicalRecords); // Fallback
    }
  };

  const filterRecordsByPatient = (patientId: string) => {
    let filtered = medicalRecords.filter(record => record.patientId === patientId);
    
    // Appliquer le filtre par type si sélectionné
    if (recordTypeFilter !== 'all') {
      filtered = filtered.filter(record => record.type === recordTypeFilter);
    }
    
    // Appliquer la recherche textuelle
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(record => 
        record.diagnosis.toLowerCase().includes(searchLower) ||
        record.symptoms.toLowerCase().includes(searchLower) ||
        record.treatment.toLowerCase().includes(searchLower) ||
        record.doctorName.toLowerCase().includes(searchLower)
      );
    }
    
    // Trier par date de consultation (plus récent en premier)
    filtered.sort((a, b) => new Date(b.consultationDate).getTime() - new Date(a.consultationDate).getTime());
    
    setFilteredRecords(filtered);
  };

  const handlePatientSelect = (patient: Patient) => {
    setSelectedPatient(patient);
    setSearchTerm(''); // Réinitialiser la recherche
    setRecordTypeFilter('all'); // Réinitialiser le filtre
  };

  const handleViewRecord = (record: MedicalRecord) => {
    alert(`Consultation du dossier médical:\n\nPatient: ${selectedPatient?.firstName} ${selectedPatient?.lastName}\nDate: ${format(new Date(record.consultationDate), 'dd/MM/yyyy à HH:mm', { locale: fr })}\nMédecin: ${record.doctorName}\nDiagnostic: ${record.diagnosis}`);
  };

  const handleDownloadRecord = (record: MedicalRecord) => {
    const recordContent = `DOSSIER MÉDICAL

Patient: ${selectedPatient?.firstName} ${selectedPatient?.lastName}
Date de consultation: ${format(new Date(record.consultationDate), 'dd/MM/yyyy à HH:mm', { locale: fr })}
Médecin: ${record.doctorName}

DIAGNOSTIC:
${record.diagnosis}

SYMPTÔMES:
${record.symptoms}

TRAITEMENT:
${record.treatment}

NOTES:
${record.notes}

---
Document généré le ${new Date().toLocaleDateString('fr-FR')}
Docteurs O.I - Plateforme de télémédecine sécurisée`;

    const blob = new Blob([recordContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `dossier-medical-${selectedPatient?.firstName}-${selectedPatient?.lastName}-${format(new Date(record.consultationDate), 'yyyy-MM-dd')}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const calculateAge = (dateOfBirth: string) => {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  };

  const getRecordTypeLabel = (type: string) => {
    const types = {
      consultation: 'Consultation',
      prescription: 'Ordonnance',
      analysis: 'Analyses',
      imaging: 'Imagerie'
    };
    return types[type as keyof typeof types] || type;
  };

  const getRecordTypeColor = (type: string) => {
    const colors = {
      consultation: 'bg-sky-100 text-sky-800',
      prescription: 'bg-emerald-100 text-emerald-800',
      analysis: 'bg-amber-100 text-amber-800',
      imaging: 'bg-purple-100 text-purple-800'
    };
    return colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center space-x-3">
          <FileText className="h-8 w-8 text-sky-500" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Dossiers médicaux</h1>
            <p className="text-gray-600">
              Consultez et gérez les dossiers médicaux des patients.
            </p>
          </div>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <div className="flex items-start space-x-3">
            <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="text-sm font-medium text-red-800">Erreur</h3>
              <p className="text-sm text-red-700 mt-1">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Patient Selection */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center">
            <Users className="h-5 w-5 mr-2 text-sky-500" />
            Sélection du patient
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Choisissez un patient pour consulter ses dossiers médicaux
          </p>
        </div>
        
        <div className="p-6">
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-500 mx-auto mb-4"></div>
              <p className="text-gray-600">Chargement des patients...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {patients.map((patient) => (
                <button
                  key={patient.id}
                  onClick={() => handlePatientSelect(patient)}
                  className={`p-4 rounded-lg border-2 transition-all text-left ${
                    selectedPatient?.id === patient.id
                      ? 'border-sky-500 bg-sky-50'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-sky-400 to-emerald-400 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold">
                        {patient.firstName[0]}{patient.lastName[0]}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900">
                        {patient.firstName} {patient.lastName}
                      </h3>
                      <p className="text-sm text-gray-600 truncate">{patient.email}</p>
                      <div className="flex items-center space-x-2 text-xs text-gray-500 mt-1">
                        <span>{calculateAge(patient.dateOfBirth)} ans</span>
                        <span>•</span>
                        <span>{patient.consultationsCount} consultations</span>
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Medical Records Section */}
      {selectedPatient ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          {/* Patient Info Header */}
          <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-sky-50 to-emerald-50">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-gradient-to-br from-sky-400 to-emerald-400 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-xl">
                    {selectedPatient.firstName[0]}{selectedPatient.lastName[0]}
                  </span>
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    Dossier de {selectedPatient.firstName} {selectedPatient.lastName}
                  </h2>
                  <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                    <span>{calculateAge(selectedPatient.dateOfBirth)} ans</span>
                    <span>•</span>
                    <span>{selectedPatient.email}</span>
                    <span>•</span>
                    <span>{selectedPatient.phone}</span>
                  </div>
                  <div className="flex items-center space-x-2 mt-2">
                    <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                      {selectedPatient.consultationsCount} consultations
                    </span>
                    {selectedPatient.lastConsultation && (
                      <span className="text-xs text-gray-500">
                        Dernière: {format(new Date(selectedPatient.lastConsultation), 'dd/MM/yyyy', { locale: fr })}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <button
                onClick={() => setSelectedPatient(null)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Changer de patient
              </button>
            </div>
          </div>

          {/* Filters and Search */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Rechercher dans les dossiers..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                />
              </div>
              <div className="flex items-center space-x-3">
                <Filter className="h-4 w-4 text-gray-400" />
                <select
                  value={recordTypeFilter}
                  onChange={(e) => setRecordTypeFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                >
                  <option value="all">Tous les types</option>
                  <option value="consultation">Consultations</option>
                  <option value="prescription">Ordonnances</option>
                  <option value="analysis">Analyses</option>
                  <option value="imaging">Imagerie</option>
                </select>
              </div>
            </div>
          </div>

          {/* Medical Records List */}
          <div className="p-6">
            {filteredRecords.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {medicalRecords.filter(r => r.patientId === selectedPatient.id).length === 0
                    ? 'Aucun dossier médical'
                    : 'Aucun résultat'
                  }
                </h3>
                <p className="text-gray-600">
                  {medicalRecords.filter(r => r.patientId === selectedPatient.id).length === 0
                    ? `${selectedPatient.firstName} ${selectedPatient.lastName} n'a pas encore de dossier médical.`
                    : 'Aucun dossier ne correspond à vos critères de recherche.'
                  }
                </p>
                {medicalRecords.filter(r => r.patientId === selectedPatient.id).length === 0 && (
                  <button className="mt-4 bg-sky-500 text-white px-4 py-2 rounded-lg hover:bg-sky-600 transition-colors flex items-center space-x-2 mx-auto">
                    <Plus className="h-4 w-4" />
                    <span>Créer le premier dossier</span>
                  </button>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Dossiers médicaux ({filteredRecords.length})
                  </h3>
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Activity className="h-4 w-4" />
                    <span>Dernière mise à jour: {format(new Date(), 'dd/MM/yyyy à HH:mm', { locale: fr })}</span>
                  </div>
                </div>

                {filteredRecords.map((record) => (
                  <div key={record.id} className="border border-gray-200 rounded-lg p-6 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {record.doctorName}
                          </h3>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRecordTypeColor(record.type)}`}>
                            {getRecordTypeLabel(record.type)}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 flex items-center space-x-2">
                          <Calendar className="h-4 w-4" />
                          <span>{format(new Date(record.consultationDate), 'dd MMMM yyyy à HH:mm', { locale: fr })}</span>
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button 
                          onClick={() => handleViewRecord(record)}
                          className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                          title="Consulter le dossier"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button 
                          onClick={() => handleDownloadRecord(record)}
                          className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                          title="Télécharger le dossier"
                        >
                          <Download className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Diagnostic</h4>
                        <p className="text-gray-700 text-sm">{record.diagnosis}</p>
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Symptômes</h4>
                        <p className="text-gray-700 text-sm">{record.symptoms}</p>
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Traitement</h4>
                        <p className="text-gray-700 text-sm">{record.treatment}</p>
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Notes</h4>
                        <p className="text-gray-700 text-sm">{record.notes}</p>
                      </div>
                    </div>

                    {record.attachments.length > 0 && (
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <h4 className="font-medium text-gray-900 mb-2">Documents joints</h4>
                        <div className="flex flex-wrap gap-2">
                          {record.attachments.map((attachment, index) => (
                            <button
                              key={index}
                              className="flex items-center space-x-2 px-3 py-1 bg-gray-100 rounded-full text-sm text-gray-700 hover:bg-gray-200 transition-colors"
                            >
                              <FileText className="h-3 w-3" />
                              <span>{attachment}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : (
        /* No Patient Selected */
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <User className="h-12 w-12 text-gray-400" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Sélectionnez un patient
          </h2>
          <p className="text-gray-600 mb-6">
            Choisissez un patient dans la liste ci-dessus pour consulter ses dossiers médicaux.
          </p>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-md mx-auto">
            <div className="flex items-start space-x-3">
              <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="text-sm font-medium text-blue-900 mb-1">
                  Sécurité des données
                </h3>
                <p className="text-sm text-blue-800">
                  L'accès aux dossiers médicaux est strictement contrôlé. 
                  Seuls les dossiers du patient sélectionné sont affichés pour garantir la confidentialité.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Statistics */}
      {selectedPatient && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 text-center">
            <FileText className="h-8 w-8 text-sky-500 mx-auto mb-3" />
            <p className="text-2xl font-bold text-gray-900">
              {medicalRecords.filter(r => r.patientId === selectedPatient.id).length}
            </p>
            <p className="text-sm text-gray-600">Total dossiers</p>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 text-center">
            <Calendar className="h-8 w-8 text-emerald-500 mx-auto mb-3" />
            <p className="text-2xl font-bold text-gray-900">
              {medicalRecords.filter(r => r.patientId === selectedPatient.id && r.type === 'consultation').length}
            </p>
            <p className="text-sm text-gray-600">Consultations</p>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 text-center">
            <FileText className="h-8 w-8 text-amber-500 mx-auto mb-3" />
            <p className="text-2xl font-bold text-gray-900">
              {medicalRecords.filter(r => r.patientId === selectedPatient.id && r.type === 'prescription').length}
            </p>
            <p className="text-sm text-gray-600">Ordonnances</p>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 text-center">
            <Activity className="h-8 w-8 text-purple-500 mx-auto mb-3" />
            <p className="text-2xl font-bold text-gray-900">
              {medicalRecords.filter(r => r.patientId === selectedPatient.id && r.type === 'analysis').length}
            </p>
            <p className="text-sm text-gray-600">Analyses</p>
          </div>
        </div>
      )}
    </div>
  );
};