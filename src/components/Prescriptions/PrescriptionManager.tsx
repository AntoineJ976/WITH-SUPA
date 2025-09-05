import React, { useState } from 'react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { FileText, Download, Eye, Calendar, Clock, AlertTriangle, Plus, X, Send, Search } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export const PrescriptionManager: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'current' | 'history' | 'search'>('current');
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [requestForm, setRequestForm] = useState({
    doctor: '',
    reason: '',
    symptoms: '',
    urgency: 'normal',
    message: ''
  });

  const availableDoctors = [
    { id: '1', name: 'Dr. Marie Leblanc', specialty: 'Médecine générale' },
    { id: '2', name: 'Dr. Pierre Martin', specialty: 'Cardiologie' },
    { id: '3', name: 'Dr. Sophie Durand', specialty: 'Dermatologie' }
  ];

  const handleSubmitRequest = () => {
    // Logique pour envoyer la demande
    console.log('Demande envoyée:', requestForm);
    setShowRequestModal(false);
    setRequestForm({
      doctor: '',
      reason: '',
      symptoms: '',
      urgency: 'normal',
      message: ''
    });
  };

  const currentPrescriptions = [
    {
      id: '1',
      medication: 'Amoxicilline 500mg',
      dosage: '1 comprimé',
      frequency: '3 fois par jour',
      duration: '7 jours',
      doctor: 'Dr. Marie Leblanc',
      prescribedDate: '2025-01-10T10:00:00Z',
      remainingDays: 5,
      instructions: 'À prendre au moment des repas'
    },
    {
      id: '2',
      medication: 'Paracétamol 1000mg',
      dosage: '1 comprimé',
      frequency: 'Selon besoin',
      duration: '30 jours',
      doctor: 'Dr. Marie Leblanc',
      prescribedDate: '2025-01-08T14:30:00Z',
      remainingDays: 28,
      instructions: 'Maximum 4 comprimés par jour'
    }
  ];

  const prescriptionHistory = [
    {
      id: '3',
      medication: 'Ibuprofen 400mg',
      doctor: 'Dr. Pierre Martin',
      prescribedDate: '2024-12-15T09:00:00Z',
      completed: true
    },
    {
      id: '4',
      medication: 'Vitamine D3',
      doctor: 'Dr. Marie Leblanc',
      prescribedDate: '2024-11-20T11:00:00Z',
      completed: true
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <FileText className="h-8 w-8 text-sky-500" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Mes ordonnances</h1>
              <p className="text-gray-600">
                Gérez vos prescriptions et suivez vos traitements en cours.
              </p>
            </div>
          </div>
          <button 
            onClick={() => setShowRequestModal(true)}
            className="bg-sky-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-sky-600 transition-colors flex items-center space-x-2"
          >
            <Plus className="h-4 w-4" />
            <span>Demander une ordonnance</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            <button
              onClick={() => setActiveTab('current')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'current'
                  ? 'border-sky-500 text-sky-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Traitements en cours ({currentPrescriptions.length})
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'history'
                  ? 'border-sky-500 text-sky-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Historique ({prescriptionHistory.length})
            </button>
            <button
              onClick={() => setActiveTab('search')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'search'
                  ? 'border-sky-500 text-sky-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Recherche par patient
            </button>
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'current' && (
            <div className="space-y-4">
              {currentPrescriptions.map((prescription) => (
                <div key={prescription.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-gray-900 text-lg">{prescription.medication}</h3>
                      <p className="text-sm text-gray-600">
                        Prescrit par {prescription.doctor}
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                        <Eye className="h-4 w-4" />
                      </button>
                      <button 
                        onClick={() => {
                          // Créer un PDF factice pour l'ordonnance
                          const pdfContent = `Ordonnance - ${prescription.medication}

Patient: Jean Dupont
Médecin: ${prescription.doctor}
Date: ${new Date(prescription.prescribedDate).toLocaleDateString('fr-FR')}

Médicament: ${prescription.medication}
Dosage: ${prescription.dosage}
Fréquence: ${prescription.frequency}
Durée: ${prescription.duration}

Instructions: ${prescription.instructions}`;
                          
                          const blob = new Blob([pdfContent], { type: 'text/plain' });
                          const url = URL.createObjectURL(blob);
                          const link = document.createElement('a');
                          link.href = url;
                          link.download = `ordonnance-${prescription.medication.replace(/\s+/g, '-').toLowerCase()}-${new Date().toISOString().split('T')[0]}.txt`;
                          document.body.appendChild(link);
                          link.click();
                          document.body.removeChild(link);
                          URL.revokeObjectURL(url);
                        }}
                        className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        <Download className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wide">Dosage</p>
                      <p className="font-medium text-gray-900">{prescription.dosage}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wide">Fréquence</p>
                      <p className="font-medium text-gray-900">{prescription.frequency}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wide">Durée</p>
                      <p className="font-medium text-gray-900">{prescription.duration}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wide">Reste</p>
                      <p className="font-medium text-gray-900">{prescription.remainingDays} jours</p>
                    </div>
                  </div>

                  {prescription.instructions && (
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                      <div className="flex items-start space-x-2">
                        <AlertTriangle className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-sm font-medium text-amber-800">Instructions spéciales</p>
                          <p className="text-sm text-amber-700">{prescription.instructions}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="mt-3 flex items-center justify-between text-sm text-gray-500">
                    <span className="flex items-center space-x-1">
                      <Calendar className="h-4 w-4" />
                      <span>Prescrit le {format(new Date(prescription.prescribedDate), 'dd/MM/yyyy', { locale: fr })}</span>
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      prescription.remainingDays > 7 
                        ? 'bg-green-100 text-green-800'
                        : prescription.remainingDays > 3
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {prescription.remainingDays > 0 ? `${prescription.remainingDays} jours restants` : 'Terminé'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'history' && (
            <div className="space-y-3">
              {prescriptionHistory.map((prescription) => (
                <div key={prescription.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div>
                    <h3 className="font-medium text-gray-900">{prescription.medication}</h3>
                    <p className="text-sm text-gray-600">
                      Prescrit par {prescription.doctor}
                    </p>
                    <p className="text-sm text-gray-500">
                      {format(new Date(prescription.prescribedDate), 'dd/MM/yyyy', { locale: fr })}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                      Terminé
                    </span>
                    <button 
                      onClick={() => {
                        // Créer un PDF factice pour l'ordonnance historique
                        const pdfContent = `Ordonnance - ${prescription.medication}

Patient: Jean Dupont
Médecin: ${prescription.doctor}
Date: ${new Date(prescription.prescribedDate).toLocaleDateString('fr-FR')}

Médicament: ${prescription.medication}
Statut: Terminé`;
                        
                        const blob = new Blob([pdfContent], { type: 'text/plain' });
                        const url = URL.createObjectURL(blob);
                        const link = document.createElement('a');
                        link.href = url;
                        link.download = `ordonnance-${prescription.medication.replace(/\s+/g, '-').toLowerCase()}-${new Date(prescription.prescribedDate).toISOString().split('T')[0]}.txt`;
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                        URL.revokeObjectURL(url);
                      }}
                      className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      <Download className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Reminder Settings */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Clock className="h-5 w-5 mr-2 text-sky-500" />
          Rappels de médicaments
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <label className="flex items-center space-x-3">
              <input type="checkbox" defaultChecked className="rounded border-gray-300 text-sky-600 focus:ring-sky-500" />
              <span className="text-sm text-gray-700">Notifications push</span>
            </label>
            <label className="flex items-center space-x-3">
              <input type="checkbox" defaultChecked className="rounded border-gray-300 text-sky-600 focus:ring-sky-500" />
              <span className="text-sm text-gray-700">Rappels par e-mail</span>
            </label>
            <label className="flex items-center space-x-3">
              <input type="checkbox" className="rounded border-gray-300 text-sky-600 focus:ring-sky-500" />
              <span className="text-sm text-gray-700">SMS (service premium)</span>
            </label>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Avance des rappels
            </label>
            <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent">
              <option value="15">15 minutes avant</option>
              <option value="30">30 minutes avant</option>
              <option value="60">1 heure avant</option>
              <option value="120">2 heures avant</option>
            </select>
          </div>
        </div>
      </div>

      {/* Modal Demander une ordonnance */}
      {showRequestModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">Demander une ordonnance</h2>
                <button
                  onClick={() => setShowRequestModal(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-4">
              {/* Sélection du médecin */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Médecin *
                </label>
                <select
                  value={requestForm.doctor}
                  onChange={(e) => setRequestForm(prev => ({ ...prev, doctor: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                >
                  <option value="">Sélectionner un médecin</option>
                  {availableDoctors.map((doctor) => (
                    <option key={doctor.id} value={doctor.id}>
                      {doctor.name} - {doctor.specialty}
                    </option>
                  ))}
                </select>
              </div>

              {/* Motif de la demande */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Motif de la demande *
                </label>
                <select
                  value={requestForm.reason}
                  onChange={(e) => setRequestForm(prev => ({ ...prev, reason: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                >
                  <option value="">Sélectionner un motif</option>
                  <option value="renouvellement">Renouvellement d'ordonnance</option>
                  <option value="nouveau_traitement">Nouveau traitement</option>
                  <option value="ajustement">Ajustement de dosage</option>
                  <option value="effet_secondaire">Effet secondaire</option>
                  <option value="autre">Autre</option>
                </select>
              </div>

              {/* Symptômes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Symptômes actuels
                </label>
                <textarea
                  value={requestForm.symptoms}
                  onChange={(e) => setRequestForm(prev => ({ ...prev, symptoms: e.target.value }))}
                  placeholder="Décrivez vos symptômes..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent resize-none"
                />
              </div>

              {/* Urgence */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Niveau d'urgence
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setRequestForm(prev => ({ ...prev, urgency: 'low' }))}
                    className={`p-2 text-sm rounded-lg border transition-colors ${
                      requestForm.urgency === 'low'
                        ? 'border-green-500 bg-green-50 text-green-700'
                        : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    Faible
                  </button>
                  <button
                    type="button"
                    onClick={() => setRequestForm(prev => ({ ...prev, urgency: 'normal' }))}
                    className={`p-2 text-sm rounded-lg border transition-colors ${
                      requestForm.urgency === 'normal'
                        ? 'border-yellow-500 bg-yellow-50 text-yellow-700'
                        : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    Normal
                  </button>
                  <button
                    type="button"
                    onClick={() => setRequestForm(prev => ({ ...prev, urgency: 'high' }))}
                    className={`p-2 text-sm rounded-lg border transition-colors ${
                      requestForm.urgency === 'high'
                        ? 'border-red-500 bg-red-50 text-red-700'
                        : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    Urgent
                  </button>
                </div>
              </div>

              {/* Message complémentaire */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Message complémentaire
                </label>
                <textarea
                  value={requestForm.message}
                  onChange={(e) => setRequestForm(prev => ({ ...prev, message: e.target.value }))}
                  placeholder="Informations complémentaires pour le médecin..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent resize-none"
                />
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 flex justify-end space-x-3">
              <button
                onClick={() => setShowRequestModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={handleSubmitRequest}
                disabled={!requestForm.doctor || !requestForm.reason}
                className="px-4 py-2 bg-sky-500 text-white rounded-lg hover:bg-sky-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                <Send className="h-4 w-4" />
                <span>Envoyer la demande</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};