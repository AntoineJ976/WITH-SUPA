import React, { useState } from 'react';
import { FileText, Download, Eye, Calendar, User, Activity, Plus, Search, Filter, Upload, X } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useAuth } from '../../contexts/AuthContext';

export const MedicalRecords: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'consultations' | 'prescriptions' | 'documents'>('consultations');
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddDocumentModal, setShowAddDocumentModal] = useState(false);
  const [newDocument, setNewDocument] = useState({
    name: '',
    type: 'Analyse',
    description: '',
    file: null as File | null
  });
  const [documents, setDocuments] = useState([
    {
      id: '1',
      name: 'Ordonnance - 10/01/2025',
      type: 'Prescription',
      date: '2025-01-10T10:00:00Z',
      doctor: 'Dr. Marie Leblanc',
      size: '245 KB'
    },
    {
      id: '2',
      name: 'Résultats analyses sanguines',
      type: 'Analyses',
      date: '2024-12-15T14:30:00Z',
      doctor: 'Dr. Pierre Martin',
      size: '1.2 MB'
    },
    {
      id: '3',
      name: 'ECG - Contrôle cardiaque',
      type: 'Examen',
      date: '2024-12-15T14:30:00Z',
      doctor: 'Dr. Pierre Martin',
      size: '890 KB'
    }
  ]);

  const handleAddDocument = () => {
    setShowAddDocumentModal(true);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setNewDocument(prev => ({
        ...prev,
        file,
        name: prev.name || file.name.split('.')[0]
      }));
    }
  };

  const handleSubmitDocument = () => {
    if (newDocument.name && newDocument.file) {
      const newDoc = {
        id: Date.now().toString(),
        name: newDocument.name,
        type: newDocument.type,
        date: new Date().toISOString(),
        doctor: 'Patient',
        size: `${Math.round(newDocument.file.size / 1024)} KB`,
        description: newDocument.description,
        fileData: newDocument.file // Stocker le fichier pour pouvoir le télécharger
      };
      
      setDocuments(prev => [newDoc, ...prev]);
      setShowAddDocumentModal(false);
      setNewDocument({
        name: '',
        type: 'Analyse',
        description: '',
        file: null
      });
      
      // Basculer vers l'onglet Documents pour voir le nouveau document
      setActiveTab('documents');
    }
  };

  const handleViewDocument = (doc: any) => {
    // Pour les documents ajoutés par l'utilisateur avec fileData
    if (doc.fileData) {
      const fileURL = URL.createObjectURL(doc.fileData);
      window.open(fileURL, '_blank');
      // Nettoyer l'URL après un délai pour libérer la mémoire
      setTimeout(() => URL.revokeObjectURL(fileURL), 1000);
    } else {
      // Pour les documents existants, simuler l'ouverture
      alert(`Ouverture du document: ${doc.name}\n\nEn production, ce document s'ouvrirait dans un nouvel onglet sécurisé.`);
    }
  };

  const handleDownloadDocument = (doc: any) => {
    // Pour les documents ajoutés par l'utilisateur avec fileData
    if (doc.fileData) {
      const fileURL = URL.createObjectURL(doc.fileData);
      const link = document.createElement('a');
      link.href = fileURL;
      link.download = doc.name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(fileURL);
    } else {
      // Pour les documents existants, simuler le téléchargement
      const link = document.createElement('a');
      // Créer un fichier PDF factice pour la démo
      const pdfContent = `%PDF-1.4
1 0 obj
<<
/Type /Catalog
/Pages 2 0 R
>>
endobj

2 0 obj
<<
/Type /Pages
/Kids [3 0 R]
/Count 1
>>
endobj

3 0 obj
<<
/Type /Page
/Parent 2 0 R
/MediaBox [0 0 612 792]
/Contents 4 0 R
>>
endobj

4 0 obj
<<
/Length 44
>>
stream
BT
/F1 12 Tf
100 700 Td
(${doc.name}) Tj
ET
endstream
endobj

xref
0 5
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000206 00000 n 
trailer
<<
/Size 5
/Root 1 0 R
>>
startxref
299
%%EOF`;
      
      const blob = new Blob([pdfContent], { type: 'application/pdf' });
      const fileURL = URL.createObjectURL(blob);
      link.href = fileURL;
      link.download = `${doc.name}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(fileURL);
    }
  };
  const handleExportData = () => {
    const exportData = {
      patient: {
        name: user?.role === 'patient' 
          ? `${(user.profile as any)?.firstName} ${(user.profile as any)?.lastName}`
          : user?.role === 'doctor'
          ? `Dr. ${(user.profile as any)?.firstName} ${(user.profile as any)?.lastName}`
          : 'Utilisateur',
        email: user?.email || '',
        exportDate: new Date().toISOString()
      },
      consultations: consultationHistory,
      prescriptions: prescriptions,
      documents: documents,
      summary: {
        totalConsultations: consultationHistory.length,
        totalPrescriptions: prescriptions.length,
        totalDocuments: documents.length
      }
    };

    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    const userName = user?.role === 'patient' 
      ? `${(user.profile as any)?.firstName}-${(user.profile as any)?.lastName}`
      : 'patient';
    link.download = `dossier-medical-${userName?.replace(/\s+/g, '-').toLowerCase() || 'patient'}-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const consultationHistory = [
    {
      id: '1',
      date: '2025-01-10T10:00:00Z',
      doctor: 'Dr. Marie Leblanc',
      specialty: 'Médecine générale',
      type: 'Vidéo consultation',
      diagnosis: 'Infection respiratoire haute',
      symptoms: 'Toux, fièvre, maux de gorge',
      treatment: 'Amoxicilline 500mg, repos',
      notes: 'Patient en bonne voie de guérison. Contrôle dans 1 semaine si symptômes persistent.',
      attachments: ['ordonnance_20250110.pdf']
    },
    {
      id: '2',
      date: '2024-12-15T14:30:00Z',
      doctor: 'Dr. Pierre Martin',
      specialty: 'Cardiologie',
      type: 'Consultation physique',
      diagnosis: 'Contrôle de routine',
      symptoms: 'Aucun symptôme particulier',
      treatment: 'Poursuite du traitement actuel',
      notes: 'Tension artérielle stable. Prochain contrôle dans 6 mois.',
      attachments: ['ecg_20241215.pdf', 'analyses_sang.pdf']
    }
  ];

  const prescriptions = [
    {
      id: '1',
      date: '2025-01-10T10:00:00Z',
      doctor: 'Dr. Marie Leblanc',
      medications: [
        { name: 'Amoxicilline 500mg', dosage: '1 comprimé 3x/jour', duration: '7 jours' },
        { name: 'Paracétamol 1000mg', dosage: 'Si besoin', duration: '7 jours' }
      ],
      status: 'active'
    },
    {
      id: '2',
      date: '2024-12-15T14:30:00Z',
      doctor: 'Dr. Pierre Martin',
      medications: [
        { name: 'Lisinopril 10mg', dosage: '1 comprimé/jour', duration: '3 mois' }
      ],
      status: 'completed'
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
              <h1 className="text-2xl font-bold text-gray-900">Dossier médical</h1>
              <p className="text-gray-600">
                Consultez votre historique médical complet et vos documents.
              </p>
            </div>
          </div>
          <div className="flex space-x-3">
            <button 
              onClick={handleAddDocument}
              className="flex items-center space-x-2 px-4 py-2 bg-sky-500 text-white rounded-lg hover:bg-sky-600 transition-colors"
            >
              <Plus className="h-4 w-4" />
              <span>Ajouter document</span>
            </button>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher dans votre dossier médical..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
            />
          </div>
          <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
            <Filter className="h-4 w-4" />
            <span>Filtres</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            <button
              onClick={() => setActiveTab('consultations')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'consultations'
                  ? 'border-sky-500 text-sky-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Consultations ({consultationHistory.length})
            </button>
            <button
              onClick={() => setActiveTab('prescriptions')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'prescriptions'
                  ? 'border-sky-500 text-sky-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Ordonnances ({prescriptions.length})
            </button>
            <button
              onClick={() => setActiveTab('documents')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'documents'
                  ? 'border-sky-500 text-sky-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Documents ({documents.length})
            </button>
          </nav>
        </div>

        <div className="p-6">
          {/* Consultations Tab */}
          {activeTab === 'consultations' && (
            <div className="space-y-6">
              {consultationHistory.map((consultation) => (
                <div key={consultation.id} className="border border-gray-200 rounded-lg p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {consultation.doctor} - {consultation.specialty}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {format(new Date(consultation.date), 'dd MMMM yyyy à HH:mm', { locale: fr })} • {consultation.type}
                      </p>
                    </div>
                    <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                      <Eye className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Diagnostic</h4>
                      <p className="text-gray-700">{consultation.diagnosis}</p>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Symptômes</h4>
                      <p className="text-gray-700">{consultation.symptoms}</p>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Traitement</h4>
                      <p className="text-gray-700">{consultation.treatment}</p>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Notes</h4>
                      <p className="text-gray-700">{consultation.notes}</p>
                    </div>
                  </div>

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
              ))}
            </div>
          )}

          {/* Prescriptions Tab */}
          {activeTab === 'prescriptions' && (
            <div className="space-y-4">
              {prescriptions.map((prescription) => (
                <div key={prescription.id} className="border border-gray-200 rounded-lg p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        Ordonnance - {prescription.doctor}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {format(new Date(prescription.date), 'dd MMMM yyyy à HH:mm', { locale: fr })}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        prescription.status === 'active' 
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {prescription.status === 'active' ? 'En cours' : 'Terminé'}
                      </span>
                      <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                        <Download className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {prescription.medications.map((med, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <h4 className="font-medium text-gray-900">{med.name}</h4>
                          <p className="text-sm text-gray-600">{med.dosage} • {med.duration}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Documents Tab */}
          {activeTab === 'documents' && (
            <div className="space-y-3">
              {documents.map((doc) => (
                <div key={doc.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex items-center space-x-4">
                    <div className="p-2 bg-sky-100 rounded-lg">
                      <FileText className="h-5 w-5 text-sky-600" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">{doc.name}</h3>
                      <p className="text-sm text-gray-600">
                        {doc.type} • {doc.doctor} • {format(new Date(doc.date), 'dd/MM/yyyy', { locale: fr })}
                      </p>
                      <p className="text-xs text-gray-500">{doc.size}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button 
                      onClick={() => handleViewDocument(doc)}
                      className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      <Eye 
                        className="h-4 w-4" 
                      />
                    </button>
                    <button 
                      onClick={() => handleDownloadDocument(doc)}
                      className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      <Download 
                        className="h-4 w-4" 
                      />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modal Ajouter Document */}
      {showAddDocumentModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">Ajouter un document</h2>
                <button
                  onClick={() => setShowAddDocumentModal(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-4">
              {/* Upload de fichier */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fichier *
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                  <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600 mb-2">
                    Cliquez pour sélectionner un document
                  </p>
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx,.txt"
                    onChange={handleFileChange}
                    className="hidden"
                    id="file-upload"
                  />
                  <label
                    htmlFor="file-upload"
                    className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 cursor-pointer"
                  >
                    Choisir un fichier
                  </label>
                  {newDocument.file && (
                    <p className="text-sm text-green-600 mt-2">
                      ✓ {newDocument.file.name}
                    </p>
                  )}
                  <p className="text-sm text-gray-500 mt-2">
                    Formats acceptés : PDF, Word, Texte uniquement
                  </p>
                </div>
              </div>

              {/* Nom du document */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nom du document *
                </label>
                <input
                  type="text"
                  value={newDocument.name}
                  onChange={(e) => setNewDocument(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Ex: Analyses de sang janvier 2025"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                />
              </div>

              {/* Type de document */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Type de document
                </label>
                <select
                  value={newDocument.type}
                  onChange={(e) => setNewDocument(prev => ({ ...prev, type: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                >
                  <option value="Analyse">Analyse</option>
                  <option value="Examen">Examen</option>
                  <option value="Prescription">Prescription</option>
                  <option value="Rapport">Rapport médical</option>
                  <option value="Imagerie">Imagerie médicale</option>
                  <option value="Autre">Autre</option>
                </select>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description (optionnel)
                </label>
                <textarea
                  value={newDocument.description}
                  onChange={(e) => setNewDocument(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Ajoutez une description ou des notes..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent resize-none"
                />
              </div>
            </div>
            <div className="p-6 border-t border-gray-200 flex justify-end space-x-3">
              <button
                onClick={() => setShowAddDocumentModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={handleSubmitDocument}
                disabled={!newDocument.name || !newDocument.file}
                className="px-4 py-2 bg-sky-500 text-white rounded-lg hover:bg-sky-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Ajouter le document
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};