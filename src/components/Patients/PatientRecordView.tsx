import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  User, 
  Calendar, 
  FileText, 
  Plus, 
  Edit, 
  Save, 
  X,
  Phone,
  Mail,
  MapPin,
  Heart,
  AlertTriangle,
  Clock,
  Activity,
  Pill,
  Eye,
  Download,
  MessageSquare,
  Search,
  Filter,
  CheckCircle,
  XCircle,
  Video,
  Users
} from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { ConsultationReportModal } from './ConsultationReportModal';
import { TreatmentHistoryView } from './TreatmentHistoryView';

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

interface Consultation {
  id: string;
  patientId: string;
  doctorId: string;
  doctorName: string;
  date: string;
  type: 'video' | 'phone' | 'in-person';
  duration: number;
  symptoms: string;
  diagnosis: string;
  recommendations: string;
  notes: string;
  status: 'scheduled' | 'completed' | 'cancelled';
  treatments: Treatment[];
  attachments: string[];
  followUpRequired: boolean;
  followUpDate?: string;
  createdAt: string;
  updatedAt: string;
}

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

interface PatientRecordViewProps {
  patient: Patient;
  onClose: () => void;
  onPatientUpdate: (patient: Patient) => void;
}

export const PatientRecordView: React.FC<PatientRecordViewProps> = ({
  patient,
  onClose,
  onPatientUpdate
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'consultations' | 'treatments' | 'documents'>('overview');
  const [showConsultationModal, setShowConsultationModal] = useState(false);
  const [editingPatient, setEditingPatient] = useState(false);
  const [patientForm, setPatientForm] = useState(patient);
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [treatments, setTreatments] = useState<Treatment[]>([]);
  const [searchConsultations, setSearchConsultations] = useState('');
  const [consultationFilter, setConsultationFilter] = useState<'all' | 'completed' | 'scheduled' | 'cancelled'>('all');
  const [consultationSort, setConsultationSort] = useState<'date-desc' | 'date-asc' | 'doctor' | 'type'>('date-desc');

  // Mock consultation data with comprehensive details
  useEffect(() => {
    const mockConsultations: Consultation[] = [
      {
        id: '1',
        patientId: patient.id,
        doctorId: 'doc1',
        doctorName: 'Dr. Marie Leblanc',
        date: '2025-01-10T10:00:00Z',
        type: 'video',
        duration: 30,
        symptoms: 'Toux persistante depuis 5 jours, fièvre légère (38°C), maux de gorge, fatigue générale',
        diagnosis: 'Infection respiratoire haute d\'origine virale probable',
        recommendations: 'Repos complet pendant 3-5 jours, hydratation abondante (2L/jour), prise des médicaments prescrits selon posologie, éviter les efforts physiques',
        notes: 'Patient coopératif et bien informé. Symptômes typiques d\'une infection virale saisonnière. Pas de signes de complications. Amélioration attendue sous 7 jours avec le traitement prescrit.',
        status: 'completed',
        treatments: [
          {
            id: 't1',
            consultationId: '1',
            medication: 'Amoxicilline 500mg',
            dosage: '1 comprimé',
            frequency: '3 fois par jour',
            duration: '7 jours',
            instructions: 'À prendre au moment des repas avec un grand verre d\'eau',
            startDate: '2025-01-10T10:00:00Z',
            endDate: '2025-01-17T10:00:00Z',
            status: 'active',
            effectiveness: 'good'
          },
          {
            id: 't2',
            consultationId: '1',
            medication: 'Paracétamol 1000mg',
            dosage: '1 comprimé',
            frequency: 'Selon besoin',
            duration: '7 jours',
            instructions: 'Maximum 4 comprimés par jour, espacer de 6h minimum',
            startDate: '2025-01-10T10:00:00Z',
            endDate: '2025-01-17T10:00:00Z',
            status: 'active'
          }
        ],
        attachments: ['ordonnance_20250110.pdf', 'certificat_arret_travail.pdf'],
        followUpRequired: true,
        followUpDate: '2025-01-17T10:00:00Z',
        createdAt: '2025-01-10T10:00:00Z',
        updatedAt: '2025-01-10T10:00:00Z'
      },
      {
        id: '2',
        patientId: patient.id,
        doctorId: 'doc1',
        doctorName: 'Dr. Marie Leblanc',
        date: '2024-12-15T14:30:00Z',
        type: 'in-person',
        duration: 45,
        symptoms: 'Contrôle de routine annuel, aucun symptôme particulier signalé',
        diagnosis: 'Bilan de santé général - Résultats dans les normes',
        recommendations: 'Maintenir le mode de vie actuel, activité physique régulière, alimentation équilibrée, contrôle dans 6 mois',
        notes: 'Patient en excellente santé générale. Tous les paramètres vitaux normaux. Tension artérielle stable. Poids dans la norme. Recommandation de continuer les bonnes habitudes de vie.',
        status: 'completed',
        treatments: [
          {
            id: 't3',
            consultationId: '2',
            medication: 'Vitamine D3 1000UI',
            dosage: '1 comprimé',
            frequency: '1 fois par jour',
            duration: '3 mois',
            instructions: 'À prendre le matin avec le petit-déjeuner',
            startDate: '2024-12-15T14:30:00Z',
            endDate: '2025-03-15T14:30:00Z',
            status: 'completed',
            effectiveness: 'excellent',
            notes: 'Complément préventif pour la période hivernale'
          }
        ],
        attachments: ['bilan_sanguin_20241215.pdf', 'ecg_20241215.pdf'],
        followUpRequired: true,
        followUpDate: '2025-06-15T14:30:00Z',
        createdAt: '2024-12-15T14:30:00Z',
        updatedAt: '2024-12-15T14:30:00Z'
      },
      {
        id: '3',
        patientId: patient.id,
        doctorId: 'doc2',
        doctorName: 'Dr. Pierre Martin',
        date: '2024-11-20T09:00:00Z',
        type: 'video',
        duration: 25,
        symptoms: 'Douleurs thoraciques occasionnelles, essoufflement à l\'effort',
        diagnosis: 'Consultation cardiologique - Stress et anxiété',
        recommendations: 'Gestion du stress, techniques de relaxation, activité physique modérée',
        notes: 'Examen cardiologique normal. Symptômes liés au stress professionnel. Pas de pathologie cardiaque détectée.',
        status: 'completed',
        treatments: [],
        attachments: ['ecg_stress_20241120.pdf'],
        followUpRequired: false,
        createdAt: '2024-11-20T09:00:00Z',
        updatedAt: '2024-11-20T09:00:00Z'
      }
    ];

    setConsultations(mockConsultations);
    
    // Extract all treatments from consultations
    const allTreatments = mockConsultations.flatMap(consultation => consultation.treatments);
    setTreatments(allTreatments);
  }, [patient.id]);

  // Calculate age
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

  // Handle patient form update
  const handlePatientFormChange = (field: string, value: string) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setPatientForm(prev => ({
        ...prev,
        [parent]: {
          ...(prev[parent as keyof typeof prev] as any),
          [child]: value
        }
      }));
    } else {
      setPatientForm(prev => ({ ...prev, [field]: value }));
    }
  };

  // Save patient changes
  const handleSavePatient = () => {
    const updatedPatient = {
      ...patientForm,
      updatedAt: new Date().toISOString()
    };
    onPatientUpdate(updatedPatient);
    setEditingPatient(false);
    
    // Show success notification
    const notification = document.createElement('div');
    notification.className = 'fixed top-4 right-4 bg-green-500 text-white p-4 rounded-lg z-50 transition-all';
    notification.textContent = `✅ Informations de ${patient.firstName} ${patient.lastName} mises à jour`;
    document.body.appendChild(notification);
    
    setTimeout(() => {
      if (document.body.contains(notification)) {
        document.body.removeChild(notification);
      }
    }, 3000);
  };

  // Handle new consultation
  const handleConsultationCreated = (newConsultation: Consultation) => {
    setConsultations(prev => [newConsultation, ...prev]);
    
    // Update patient consultation count
    const updatedPatient = {
      ...patient,
      consultationsCount: patient.consultationsCount + 1,
      lastConsultation: newConsultation.date,
      updatedAt: new Date().toISOString()
    };
    onPatientUpdate(updatedPatient);
    
    // Add treatments from the consultation
    if (newConsultation.treatments.length > 0) {
      setTreatments(prev => [...newConsultation.treatments, ...prev]);
    }
  };

  // Filter and sort consultations
  const filteredAndSortedConsultations = consultations.filter(consultation => {
    const matchesSearch = !searchConsultations || 
      consultation.diagnosis.toLowerCase().includes(searchConsultations.toLowerCase()) ||
      consultation.symptoms.toLowerCase().includes(searchConsultations.toLowerCase()) ||
      consultation.doctorName.toLowerCase().includes(searchConsultations.toLowerCase()) ||
      consultation.notes.toLowerCase().includes(searchConsultations.toLowerCase());
    
    const matchesFilter = consultationFilter === 'all' || consultation.status === consultationFilter;
    
    return matchesSearch && matchesFilter;
  }).sort((a, b) => {
    switch (consultationSort) {
      case 'date-desc':
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      case 'date-asc':
        return new Date(a.date).getTime() - new Date(b.date).getTime();
      case 'doctor':
        return a.doctorName.localeCompare(b.doctorName);
      case 'type':
        return a.type.localeCompare(b.type);
      default:
        return 0;
    }
  });

  // Get active treatments
  const activeTreatments = treatments.filter(treatment => treatment.status === 'active');
  const completedTreatments = treatments.filter(treatment => treatment.status === 'completed');

  // Handle consultation actions
  const handleViewConsultation = (consultation: Consultation) => {
    alert(`Consultation du ${format(new Date(consultation.date), 'dd/MM/yyyy à HH:mm', { locale: fr })}

Médecin: ${consultation.doctorName}
Type: ${consultation.type === 'video' ? 'Vidéo' : consultation.type === 'phone' ? 'Téléphone' : 'Présentiel'}
Durée: ${consultation.duration} minutes

Diagnostic: ${consultation.diagnosis}

Symptômes: ${consultation.symptoms}

Recommandations: ${consultation.recommendations}

${consultation.notes ? `Notes: ${consultation.notes}` : ''}

Traitements prescrits: ${consultation.treatments.length}
${consultation.followUpRequired ? `Suivi prévu le ${format(new Date(consultation.followUpDate!), 'dd/MM/yyyy', { locale: fr })}` : 'Aucun suivi requis'}`);
  };

  const handleDownloadConsultation = (consultation: Consultation) => {
    const consultationContent = `RAPPORT DE CONSULTATION

Patient: ${patient.firstName} ${patient.lastName}
N° Dossier Médical: ${patient.medicalRecordNumber}
Date de consultation: ${format(new Date(consultation.date), 'dd/MM/yyyy à HH:mm', { locale: fr })}
Médecin: ${consultation.doctorName}
Type: ${consultation.type === 'video' ? 'Vidéo consultation' : consultation.type === 'phone' ? 'Consultation téléphonique' : 'Consultation en présentiel'}
Durée: ${consultation.duration} minutes

SYMPTÔMES OBSERVÉS:
${consultation.symptoms}

DIAGNOSTIC:
${consultation.diagnosis}

RECOMMANDATIONS:
${consultation.recommendations}

${consultation.notes ? `NOTES COMPLÉMENTAIRES:\n${consultation.notes}` : ''}

TRAITEMENTS PRESCRITS:
${consultation.treatments.map((treatment, index) => `
${index + 1}. ${treatment.medication}
   Dosage: ${treatment.dosage}
   Fréquence: ${treatment.frequency}
   Durée: ${treatment.duration}
   Instructions: ${treatment.instructions}
`).join('')}

${consultation.followUpRequired ? `SUIVI MÉDICAL:\nSuivi prévu le ${format(new Date(consultation.followUpDate!), 'dd/MM/yyyy à HH:mm', { locale: fr })}` : 'SUIVI MÉDICAL:\nAucun suivi spécifique requis'}

Statut: ${consultation.status === 'completed' ? 'Consultation terminée' : consultation.status === 'scheduled' ? 'Consultation programmée' : 'Consultation annulée'}

---
Rapport généré le ${format(new Date(), 'dd/MM/yyyy à HH:mm', { locale: fr })}
Docteurs O.I - Plateforme de télémédecine sécurisée`;

    const blob = new Blob([consultationContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `consultation-${patient.firstName}-${patient.lastName}-${format(new Date(consultation.date), 'yyyy-MM-dd')}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={onClose}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors group"
              >
                <ArrowLeft className="h-5 w-5 group-hover:-translate-x-1 transition-transform" />
                <span className="hidden sm:inline">Retour à la liste</span>
                <span className="sm:hidden">Retour</span>
              </button>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-sky-400 to-emerald-400 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-lg">
                    {patient.id}
                  </span>
                </div>
                <div className="min-w-0 flex-1">
                  <h1 className="text-lg sm:text-xl font-bold text-gray-900 truncate">
                    {patient.firstName} {patient.lastName}
                  </h1>
                  <p className="text-xs sm:text-sm text-gray-600 truncate">
                    N°: {patient.medicalRecordNumber} • {calculateAge(patient.dateOfBirth)} ans
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                patient.status === 'active' 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-gray-100 text-gray-800'
              }`}>
                {patient.status === 'active' ? 'Actif' : 'Inactif'}
              </span>
              <button
                onClick={() => setShowConsultationModal(true)}
                className="bg-sky-500 text-white px-2 sm:px-4 py-2 rounded-lg hover:bg-sky-600 transition-colors flex items-center space-x-2 shadow-sm hover:shadow-md"
              >
                <Plus className="h-4 w-4" />
                <span className="hidden sm:inline">Nouvelle consultation</span>
                <span className="sm:hidden">Nouveau</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8 py-4 sm:py-8">
        {/* Patient Overview Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
          {/* Basic Info */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Informations</h3>
              <button
                onClick={() => setEditingPatient(!editingPatient)}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors rounded-lg hover:bg-gray-100"
              >
                <Edit className="h-4 w-4" />
              </button>
            </div>
            
            {editingPatient ? (
              <div className="space-y-3">
                <input
                  type="text"
                  value={patientForm.firstName}
                  onChange={(e) => handlePatientFormChange('firstName', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 text-sm"
                  placeholder="Prénom"
                />
                <input
                  type="text"
                  value={patientForm.lastName}
                  onChange={(e) => handlePatientFormChange('lastName', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 text-sm"
                  placeholder="Nom"
                />
                <input
                  type="email"
                  value={patientForm.email}
                  onChange={(e) => handlePatientFormChange('email', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 text-sm"
                  placeholder="Email"
                />
                <input
                  type="tel"
                  value={patientForm.phone}
                  onChange={(e) => handlePatientFormChange('phone', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 text-sm"
                  placeholder="Téléphone"
                />
                <div className="flex space-x-2">
                  <button
                    onClick={handleSavePatient}
                    className="flex-1 bg-sky-500 text-white px-3 py-2 rounded-lg hover:bg-sky-600 transition-colors flex items-center justify-center space-x-1"
                  >
                    <Save className="h-4 w-4" />
                    <span>Sauver</span>
                  </button>
                  <button
                    onClick={() => {
                      setEditingPatient(false);
                      setPatientForm(patient);
                    }}
                    className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-3 text-sm">
                <div className="flex items-center space-x-2">
                  <User className="h-4 w-4 text-gray-400" />
                  <span className="font-medium">{calculateAge(patient.dateOfBirth)} ans</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Mail className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-700 break-all">{patient.email}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Phone className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-700">{patient.phone}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <MapPin className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-700">{patient.address.city}, {patient.address.postalCode}</span>
                </div>
              </div>
            )}
          </div>

          {/* Medical Info */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Heart className="h-5 w-5 mr-2 text-red-500" />
              Informations médicales
            </h3>
            <div className="space-y-3 text-sm">
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

          {/* Statistics */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Activity className="h-5 w-5 mr-2 text-emerald-500" />
              Statistiques
            </h3>
            <div className="space-y-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-sky-600">{patient.consultationsCount}</p>
                <p className="text-sm text-gray-600">Consultations</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-emerald-600">{activeTreatments.length}</p>
                <p className="text-sm text-gray-600">Traitements actifs</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-purple-600">{consultations.length}</p>
                <p className="text-sm text-gray-600">Rapports médicaux</p>
              </div>
            </div>
          </div>

          {/* Emergency Contact */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <AlertTriangle className="h-5 w-5 mr-2 text-amber-500" />
              Contact d'urgence
            </h3>
            <div className="space-y-2 text-sm">
              <div className="font-medium text-gray-900">{patient.emergencyContact.name}</div>
              <div className="text-gray-600">{patient.emergencyContact.relationship}</div>
              <div className="flex items-center space-x-2">
                <Phone className="h-3 w-3 text-gray-400" />
                <span className="text-gray-700">{patient.emergencyContact.phone}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs Navigation */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex px-2 sm:px-6 overflow-x-auto">
              <button
                onClick={() => setActiveTab('overview')}
                className={`py-4 px-2 sm:px-4 border-b-2 font-medium text-sm transition-colors whitespace-nowrap ${
                  activeTab === 'overview'
                    ? 'border-sky-500 text-sky-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <span className="hidden sm:inline">Vue d'ensemble</span>
                <span className="sm:hidden">Vue</span>
              </button>
              <button
                onClick={() => setActiveTab('consultations')}
                className={`py-4 px-2 sm:px-4 border-b-2 font-medium text-sm transition-colors whitespace-nowrap ${
                  activeTab === 'consultations'
                    ? 'border-sky-500 text-sky-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <span className="hidden sm:inline">Consultations ({consultations.length})</span>
                <span className="sm:hidden">Consult. ({consultations.length})</span>
              </button>
              <button
                onClick={() => setActiveTab('treatments')}
                className={`py-4 px-2 sm:px-4 border-b-2 font-medium text-sm transition-colors whitespace-nowrap ${
                  activeTab === 'treatments'
                    ? 'border-sky-500 text-sky-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <span className="hidden sm:inline">Traitements ({treatments.length})</span>
                <span className="sm:hidden">Trait. ({treatments.length})</span>
              </button>
              <button
                onClick={() => setActiveTab('documents')}
                className={`py-4 px-2 sm:px-4 border-b-2 font-medium text-sm transition-colors whitespace-nowrap ${
                  activeTab === 'documents'
                    ? 'border-sky-500 text-sky-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Documents
              </button>
            </nav>
          </div>

          <div className="p-4 sm:p-6">
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                {/* Recent Activity */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Dernières consultations</h3>
                    <div className="space-y-3">
                      {consultations.slice(0, 3).map((consultation) => (
                        <div key={consultation.id} className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-medium text-gray-900">{consultation.doctorName}</h4>
                            <span className="text-sm text-gray-500">
                              {format(new Date(consultation.date), 'dd/MM/yyyy', { locale: fr })}
                            </span>
                          </div>
                          <p className="text-sm text-gray-700 mb-2">{consultation.diagnosis}</p>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                consultation.status === 'completed' ? 'bg-green-100 text-green-800' :
                                consultation.status === 'scheduled' ? 'bg-blue-100 text-blue-800' :
                                'bg-gray-100 text-gray-800'
                              }`}>
                                {consultation.status === 'completed' ? 'Terminée' :
                                 consultation.status === 'scheduled' ? 'Programmée' : 'Annulée'}
                              </span>
                              <span className="text-xs text-gray-500">
                                {consultation.duration} min • {consultation.type === 'video' ? 'Vidéo' : consultation.type === 'phone' ? 'Téléphone' : 'Présentiel'}
                              </span>
                            </div>
                            <button
                              onClick={() => handleViewConsultation(consultation)}
                              className="text-sky-600 hover:text-sky-800 transition-colors"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                      {consultations.length === 0 && (
                        <p className="text-gray-500 text-center py-4">Aucune consultation enregistrée</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Traitements en cours</h3>
                    <div className="space-y-3">
                      {activeTreatments.slice(0, 3).map((treatment) => (
                        <div key={treatment.id} className="p-4 border border-gray-200 rounded-lg">
                          <h4 className="font-medium text-gray-900">{treatment.medication}</h4>
                          <div className="text-sm text-gray-600 mt-1">
                            {treatment.dosage} • {treatment.frequency}
                          </div>
                          <div className="text-sm text-gray-500 mt-1">
                            Jusqu'au {format(new Date(treatment.endDate), 'dd/MM/yyyy', { locale: fr })}
                          </div>
                          {treatment.effectiveness && (
                            <div className="mt-2">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                treatment.effectiveness === 'excellent' ? 'bg-green-100 text-green-800' :
                                treatment.effectiveness === 'good' ? 'bg-emerald-100 text-emerald-800' :
                                treatment.effectiveness === 'fair' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-red-100 text-red-800'
                              }`}>
                                Efficacité: {treatment.effectiveness === 'excellent' ? 'Excellente' :
                                           treatment.effectiveness === 'good' ? 'Bonne' :
                                           treatment.effectiveness === 'fair' ? 'Moyenne' : 'Faible'}
                              </span>
                            </div>
                          )}
                        </div>
                      ))}
                      {activeTreatments.length === 0 && (
                        <p className="text-gray-500 text-center py-4">Aucun traitement en cours</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Medical History Summary */}
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-amber-900 mb-3">Antécédents médicaux</h3>
                  <p className="text-amber-800">{patient.medicalInfo.medicalHistory}</p>
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <button
                    onClick={() => setShowConsultationModal(true)}
                    className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-center group"
                  >
                    <Plus className="h-6 w-6 text-sky-500 mx-auto mb-2 group-hover:scale-110 transition-transform" />
                    <p className="text-sm font-medium text-gray-900">Consultation</p>
                    <p className="text-xs text-gray-600 hidden sm:block">Créer un rapport de consultation</p>
                  </button>
                  
                  <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-center group">
                    <MessageSquare className="h-6 w-6 text-emerald-500 mx-auto mb-2 group-hover:scale-110 transition-transform" />
                    <p className="text-sm font-medium text-gray-900">Message</p>
                    <p className="text-xs text-gray-600 hidden sm:block">Communication sécurisée</p>
                  </button>
                  
                  <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-center group">
                    <Calendar className="h-6 w-6 text-purple-500 mx-auto mb-2 group-hover:scale-110 transition-transform" />
                    <p className="text-sm font-medium text-gray-900">RDV</p>
                    <p className="text-xs text-gray-600 hidden sm:block">Nouveau rendez-vous</p>
                  </button>
                </div>
              </div>
            )}

            {/* Consultations Tab */}
            {activeTab === 'consultations' && (
              <div className="space-y-6">
                {/* Search and Filter for Consultations */}
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Rechercher dans les consultations..."
                      value={searchConsultations}
                      onChange={(e) => setSearchConsultations(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                    />
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
                    <select
                      value={consultationFilter}
                      onChange={(e) => setConsultationFilter(e.target.value as any)}
                      className="w-full sm:w-auto px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                    >
                      <option value="all">Toutes</option>
                      <option value="completed">Terminées</option>
                      <option value="scheduled">Programmées</option>
                      <option value="cancelled">Annulées</option>
                    </select>
                    <select
                      value={consultationSort}
                      onChange={(e) => setConsultationSort(e.target.value as any)}
                      className="w-full sm:w-auto px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                    >
                      <option value="date-desc">Plus récentes</option>
                      <option value="date-asc">Plus anciennes</option>
                      <option value="doctor">Par médecin</option>
                      <option value="type">Par type</option>
                    </select>
                  </div>
                </div>

                {/* Consultations List */}
                <div className="space-y-4">
                  {filteredAndSortedConsultations.length === 0 ? (
                    <div className="text-center py-12">
                      <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        Aucune consultation trouvée
                      </h3>
                      <p className="text-gray-600 mb-4">
                        {searchConsultations || consultationFilter !== 'all'
                          ? 'Aucune consultation ne correspond à vos critères.'
                          : 'Aucune consultation enregistrée pour ce patient.'
                        }
                      </p>
                      <button
                        onClick={() => setShowConsultationModal(true)}
                        className="bg-sky-500 text-white px-4 py-2 rounded-lg hover:bg-sky-600 transition-colors"
                      >
                        Créer la première consultation
                      </button>
                    </div>
                  ) : (
                    filteredAndSortedConsultations.map((consultation) => (
                      <div key={consultation.id} className="border border-gray-200 rounded-lg p-4 sm:p-6 hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <h3 className="text-base sm:text-lg font-semibold text-gray-900">
                                Consultation du {format(new Date(consultation.date), 'dd MMMM yyyy', { locale: fr })}
                              </h3>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                consultation.status === 'completed' ? 'bg-green-100 text-green-800' :
                                consultation.status === 'scheduled' ? 'bg-blue-100 text-blue-800' :
                                'bg-gray-100 text-gray-800'
                              }`}>
                                {consultation.status === 'completed' ? 'Terminée' :
                                 consultation.status === 'scheduled' ? 'Programmée' : 'Annulée'}
                              </span>
                            </div>
                            <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 text-sm text-gray-600 mb-3 space-y-1 sm:space-y-0">
                              <div className="flex items-center space-x-1">
                                <User className="h-4 w-4" />
                                <span>{consultation.doctorName}</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <Clock className="h-4 w-4" />
                                <span>{consultation.duration} minutes</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                {consultation.type === 'video' ? <Video className="h-4 w-4" /> :
                                 consultation.type === 'phone' ? <Phone className="h-4 w-4" /> :
                                 <Users className="h-4 w-4" />}
                                <span className="capitalize">
                                  {consultation.type === 'video' ? 'Vidéo' : 
                                   consultation.type === 'phone' ? 'Téléphone' : 'Présentiel'}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="flex flex-col sm:flex-row items-end sm:items-center space-y-2 sm:space-y-0 sm:space-x-2">
                            <button
                              onClick={() => handleViewConsultation(consultation)}
                              className="p-2 text-gray-400 hover:text-gray-600 transition-colors rounded-lg hover:bg-gray-100"
                              title="Voir les détails"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDownloadConsultation(consultation)}
                              className="p-2 text-gray-400 hover:text-gray-600 transition-colors rounded-lg hover:bg-gray-100"
                              title="Télécharger le rapport"
                            >
                              <Download className="h-4 w-4" />
                            </button>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                          <div>
                            <h4 className="font-medium text-gray-900 mb-2">Diagnostic</h4>
                            <p className="text-gray-700 text-sm">{consultation.diagnosis}</p>
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-900 mb-2">Symptômes</h4>
                            <p className="text-gray-700 text-sm">{consultation.symptoms}</p>
                          </div>
                          <div className="md:col-span-2">
                            <h4 className="font-medium text-gray-900 mb-2">Recommandations</h4>
                            <p className="text-gray-700 text-sm">{consultation.recommendations}</p>
                          </div>
                          {consultation.notes && (
                            <div className="md:col-span-2">
                              <h4 className="font-medium text-gray-900 mb-2">Notes</h4>
                              <p className="text-gray-700 text-sm">{consultation.notes}</p>
                            </div>
                          )}
                        </div>

                        {/* Treatments for this consultation */}
                        {consultation.treatments.length > 0 && (
                          <div className="mt-4 pt-4 border-t border-gray-200">
                            <h4 className="font-medium text-gray-900 mb-3">Traitements prescrits ({consultation.treatments.length})</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              {consultation.treatments.map((treatment) => (
                                <div key={treatment.id} className="bg-gray-50 rounded-lg p-3">
                                  <h5 className="font-medium text-gray-900 text-sm">{treatment.medication}</h5>
                                  <div className="text-xs text-gray-600 mt-1">
                                    {treatment.dosage} • {treatment.frequency} • {treatment.duration}
                                  </div>
                                  {treatment.instructions && (
                                    <div className="text-xs text-gray-500 mt-1">{treatment.instructions}</div>
                                  )}
                                  <div className="mt-2">
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                      treatment.status === 'active' ? 'bg-green-100 text-green-800' :
                                      treatment.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                                      'bg-red-100 text-red-800'
                                    }`}>
                                      {treatment.status === 'active' ? 'En cours' :
                                       treatment.status === 'completed' ? 'Terminé' : 'Arrêté'}
                                    </span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Follow-up */}
                        {consultation.followUpRequired && consultation.followUpDate && (
                          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                            <div className="flex items-center space-x-2">
                              <Clock className="h-4 w-4 text-blue-600" />
                              <span className="text-sm font-medium text-blue-900">
                                Suivi prévu le {format(new Date(consultation.followUpDate), 'dd/MM/yyyy à HH:mm', { locale: fr })}
                              </span>
                            </div>
                          </div>
                        )}

                        {/* Attachments */}
                        {consultation.attachments.length > 0 && (
                          <div className="mt-4 pt-4 border-t border-gray-200">
                            <h4 className="font-medium text-gray-900 mb-2">Documents joints</h4>
                            <div className="flex flex-wrap gap-2">
                              {consultation.attachments.map((attachment, index) => (
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
                    ))
                  )}
                </div>
              </div>
            )}

            {/* Treatments Tab */}
            {activeTab === 'treatments' && (
              <TreatmentHistoryView 
                treatments={treatments} 
                consultations={consultations}
                patientId={patient.id}
              />
            )}

            {/* Documents Tab */}
            {activeTab === 'documents' && (
              <div className="space-y-4">
                <div className="text-center py-12">
                  <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Documents médicaux</h3>
                  <p className="text-gray-600">
                    Les documents médicaux de {patient.firstName} apparaîtront ici.
                  </p>
                  <button className="mt-4 bg-sky-500 text-white px-4 py-2 rounded-lg hover:bg-sky-600 transition-colors">
                    Ajouter un document
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Consultation Report Modal */}
      <ConsultationReportModal
        isOpen={showConsultationModal}
        onClose={() => setShowConsultationModal(false)}
        patient={patient}
        onConsultationCreated={handleConsultationCreated}
      />
    </div>
  );
};