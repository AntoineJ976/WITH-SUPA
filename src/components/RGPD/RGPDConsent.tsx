import React, { useState } from 'react';
import { Shield, Check, AlertCircle, FileText, Download, Trash2 } from 'lucide-react';

export const RGPDConsent: React.FC = () => {
  const [consents, setConsents] = useState({
    dataProcessing: true,
    marketing: false,
    medicalRecords: true,
    consultationRecording: false
  });

  const consentItems = [
    {
      id: 'dataProcessing',
      title: 'Traitement des données personnelles',
      description: 'Autoriser le traitement de vos données personnelles pour la fourniture des services de télémédecine.',
      required: true,
      category: 'essential'
    },
    {
      id: 'marketing',
      title: 'Communications marketing',
      description: 'Recevoir des informations sur nos nouveaux services et promotions par e-mail.',
      required: false,
      category: 'marketing'
    },
    {
      id: 'medicalRecords',
      title: 'Stockage du dossier médical',
      description: 'Conserver votre historique médical et vos consultations pour un meilleur suivi.',
      required: true,
      category: 'medical'
    },
    {
      id: 'consultationRecording',
      title: 'Enregistrement des consultations',
      description: 'Enregistrer les consultations vidéo à des fins de qualité et de formation (anonymisé).',
      required: false,
      category: 'quality'
    }
  ];

  const handleConsentChange = (consentId: string, value: boolean) => {
    setConsents(prev => ({
      ...prev,
      [consentId]: value
    }));
  };

  const exportData = () => {
    try {
      // Export complet des données RGPD
      const userData = {
        personalInfo: {
          email: "antoine.jaombelo@email.com",
          firstName: "Antoine",
          lastName: "Jaombelo",
          role: "Patient",
          createdAt: "2025-01-14T10:00:00Z"
        },
        consultations: [
          {
            date: "2025-01-10T10:00:00Z",
            doctor: "Dr. Marie Leblanc",
            type: "Vidéo consultation",
            diagnosis: "Infection respiratoire haute"
          }
        ],
        messages: [
          {
            date: "2025-01-14T09:00:00Z",
            from: "Dr. Marie Leblanc",
            content: "Bonjour, comment vous sentez-vous ?"
          }
        ],
        prescriptions: [
          {
            date: "2025-01-10T10:00:00Z",
            medication: "Amoxicilline 500mg",
            doctor: "Dr. Marie Leblanc"
          }
        ],
        rgpdConsents: Object.entries(consents).map(([key, value]) => ({
          type: key,
          granted: value,
          timestamp: new Date().toISOString()
        })),
        exportInfo: {
          exportDate: new Date().toISOString(),
          format: "JSON",
          version: "1.0"
        }
      };
      
      const dataStr = JSON.stringify(userData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `docteurs-oi-donnees-rgpd-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      // Feedback utilisateur
      alert('✅ Export réussi ! Vos données ont été téléchargées.');
    } catch (error) {
      console.error('Erreur lors de l\'export:', error);
      alert('❌ Erreur lors de l\'export. Veuillez réessayer.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center space-x-3">
          <Shield className="h-8 w-8 text-sky-500" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Gestion des données RGPD</h1>
            <p className="text-gray-600">
              Contrôlez vos données personnelles et vos préférences de confidentialité.
            </p>
          </div>
        </div>
      </div>

      {/* Consent Management */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Consentements</h2>
          <p className="text-sm text-gray-600 mt-1">
            Gérez vos autorisations pour le traitement de vos données personnelles.
          </p>
        </div>
        <div className="p-6">
          <div className="space-y-6">
            {consentItems.map((item) => (
              <div key={item.id} className="flex items-start space-x-4">
                <div className="flex-shrink-0 mt-1">
                  <button
                    onClick={() => handleConsentChange(item.id, !consents[item.id as keyof typeof consents])}
                    disabled={item.required}
                    className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                      consents[item.id as keyof typeof consents]
                        ? 'bg-sky-500 border-sky-500'
                        : 'bg-white border-gray-300 hover:border-gray-400'
                    } ${item.required ? 'cursor-not-allowed opacity-75' : 'cursor-pointer'}`}
                  >
                    {consents[item.id as keyof typeof consents] && (
                      <Check className="w-3 h-3 text-white" />
                    )}
                  </button>
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <h3 className="font-medium text-gray-900">{item.title}</h3>
                    {item.required && (
                      <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">
                        Obligatoire
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Data Rights */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Vos droits sur les données</h2>
          <p className="text-sm text-gray-600 mt-1">
            Exercez vos droits conformément au Règlement Général sur la Protection des Données (RGPD).
          </p>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Export Data */}
            <button
              onClick={exportData}
              className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left"
            >
              <Download className="h-5 w-5 text-sky-500" />
              <div>
                <h3 className="font-medium text-gray-900">Exporter mes données</h3>
                <p className="text-sm text-gray-600">Télécharger toutes vos données</p>
              </div>
            </button>

            {/* View Privacy Policy */}
            <button className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left">
              <FileText className="h-5 w-5 text-emerald-500" />
              <div>
                <h3 className="font-medium text-gray-900">Politique de confidentialité</h3>
                <p className="text-sm text-gray-600">Consulter nos pratiques</p>
              </div>
            </button>

            {/* Delete Account */}
            <button className="flex items-center space-x-3 p-4 border border-red-200 rounded-lg hover:bg-red-50 transition-colors text-left">
              <Trash2 className="h-5 w-5 text-red-500" />
              <div>
                <h3 className="font-medium text-red-900">Supprimer mon compte</h3>
                <p className="text-sm text-red-600">Action irréversible</p>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Data Processing Information */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
        <div className="flex items-start space-x-3">
          <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
          <div>
            <h3 className="text-sm font-medium text-blue-900 mb-2">
              Information sur le traitement des données
            </h3>
            <div className="text-sm text-blue-800 space-y-2">
              <p>• <strong>Finalité :</strong> Fourniture de services de télémédecine et gestion du dossier médical</p>
              <p>• <strong>Base légale :</strong> Consentement et intérêt légitime pour les soins de santé</p>
              <p>• <strong>Conservation :</strong> Données médicales conservées 20 ans, autres données 3 ans après dernière activité</p>
              <p>• <strong>Destinataires :</strong> Médecins autorisés, personnel médical, prestataires techniques certifiés</p>
              <p>• <strong>Localisation :</strong> Serveurs hébergés en France, conformes aux exigences HDS</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};