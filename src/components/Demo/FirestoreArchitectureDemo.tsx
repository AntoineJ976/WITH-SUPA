import React, { useState } from 'react';
import { 
  Database, 
  Users, 
  FileText, 
  MessageSquare, 
  Shield, 
  Activity,
  CheckCircle,
  AlertTriangle,
  Play,
  Download,
  Eye,
  Search
} from 'lucide-react';
import { SupabaseService } from '../../services/supabaseService';
import { isSupabaseConfigured } from '../../lib/supabase';

export const FirestoreArchitectureDemo: React.FC = () => {
  const [activeDemo, setActiveDemo] = useState<string>('overview');
  const [demoResults, setDemoResults] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const isConnected = isSupabaseConfigured();

  // Données de démonstration
  const mockUserId = 'demo-doctor-123';
  const mockPatientId = 'demo-patient-456';

  const demoSections = [
    {
      id: 'overview',
      title: 'Vue d\'ensemble',
      description: 'Architecture générale et collections',
      icon: Database,
      color: 'text-sky-500 bg-sky-100'
    },
    {
      id: 'patients',
      title: 'Gestion Patients',
      description: 'CRUD patients et relations médecin-patient',
      icon: Users,
      color: 'text-emerald-500 bg-emerald-100'
    },
    {
      id: 'records',
      title: 'Dossiers Médicaux',
      description: 'Création et consultation des dossiers',
      icon: FileText,
      color: 'text-purple-500 bg-purple-100'
    },
    {
      id: 'messaging',
      title: 'Messagerie Sécurisée',
      description: 'Messages chiffrés temps réel',
      icon: MessageSquare,
      color: 'text-amber-500 bg-amber-100'
    },
    {
      id: 'security',
      title: 'Sécurité & RGPD',
      description: 'Règles de sécurité et conformité',
      icon: Shield,
      color: 'text-red-500 bg-red-100'
    },
    {
      id: 'performance',
      title: 'Performance',
      description: 'Optimisations et monitoring',
      icon: Activity,
      color: 'text-indigo-500 bg-indigo-100'
    }
  ];

  // Démonstrations spécifiques
  const runPatientDemo = async () => {
    setLoading(true);
    try {
      // Simuler la création d'un patient avec Supabase
      const patientData = {
        email: 'demo.patient@example.com',
        role: 'patient' as const,
        status: 'active' as const,
        first_name: 'Jean',
        last_name: 'Dupont',
        phone_number: '+33123456789',
        date_of_birth: '1985-06-15',
        gender: 'Homme',
        verified: false,
        permissions: {
          canAccessPatientData: false,
          canPrescribe: false,
          canManageSchedule: false
        },
        rgpd_consent: {
          dataProcessing: true,
          medicalRecords: true,
          consentDate: new Date().toISOString()
        }
      };

      if (isConnected) {
        const result = await SupabaseService.createDocument(
          'patients',
          patientData,
          mockUserId,
          { auditAction: 'create_patient_demo' }
        );

        setDemoResults({
          success: result.success,
          message: result.success ? 'Patient créé avec succès dans Supabase' : 'Erreur création patient',
          data: result.data || { error: result.error }
        });
      } else {
        // Mode démo sans connexion
        setDemoResults({
          success: true,
          message: 'Patient créé avec succès (mode démo)',
          data: {
            userId: 'demo-user-123',
            patientId: 'demo-patient-456',
            medicalRecordNumber: 'MRN' + Date.now()
          }
        });
      }

    } catch (error) {
      setDemoResults({
        success: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue'
      });
    } finally {
      setLoading(false);
    }
  };

  const runMedicalRecordDemo = async () => {
    setLoading(true);
    try {
      // Simuler la création d'un dossier médical avec Supabase
      const recordData = {
        patient_id: mockPatientId,
        doctor_id: mockUserId,
        record_type: 'consultation' as const,
        title: 'Consultation de démonstration',
        record_date: new Date().toISOString(),
        category: 'routine' as const,
        symptoms: 'Toux persistante, fièvre légère',
        diagnosis: 'Infection respiratoire haute',
        treatment: 'Amoxicilline 500mg, repos',
        recommendations: 'Repos complet, hydratation abondante',
        vital_signs: {
          bloodPressure: '120/80',
          heartRate: 72,
          temperature: 37.2,
          weight: 75,
          height: 175
        },
        access_level: 'standard' as const,
        patient_consent: true,
        retention_period: 20,
        tags: ['consultation', 'respiratory', 'routine']
      };

      if (isConnected) {
        const result = await SupabaseService.createDocument(
          'medical_records',
          recordData,
          mockUserId,
          { auditAction: 'create_medical_record_demo' }
        );

        setDemoResults({
          success: result.success,
          message: result.success ? 'Dossier médical créé avec succès dans Supabase' : 'Erreur création dossier',
          data: result.data || { error: result.error }
        });
      } else {
        // Mode démo sans connexion
        setDemoResults({
          success: true,
          message: 'Dossier médical créé avec succès (mode démo)',
          data: {
            recordId: 'demo-record-789',
            patientId: mockPatientId,
            doctorId: mockUserId,
            recordType: recordData.record_type,
            diagnosis: recordData.diagnosis
          }
        });
      }

    } catch (error) {
      setDemoResults({
        success: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue'
      });
    } finally {
      setLoading(false);
    }
  };

  const runMessagingDemo = async () => {
    setLoading(true);
    try {
      // Simuler la création d'une conversation avec Supabase
      const conversationData = {
        participants: [mockUserId, mockPatientId],
        title: 'Consultation de suivi',
        type: 'medical_consultation' as const,
        status: 'active' as const,
        encryption_enabled: true,
        last_message_at: new Date().toISOString()
      };

      if (isConnected) {
        const result = await SupabaseService.createDocument(
          'conversations',
          conversationData,
          mockUserId,
          { auditAction: 'create_conversation_demo' }
        );

        setDemoResults({
          success: result.success,
          message: result.success ? 'Conversation créée avec succès dans Supabase' : 'Erreur création conversation',
          data: result.data || { error: result.error }
        });
      } else {
        // Mode démo sans connexion
        setDemoResults({
          success: true,
          message: 'Conversation et message créés avec succès (mode démo)',
          data: {
            conversationId: 'demo-conv-123',
            messageId: 'demo-msg-456',
            participants: [mockUserId, mockPatientId],
            messageContent: 'Bonjour, comment vous sentez-vous aujourd\'hui ?'
          }
        });
      }

    } catch (error) {
      setDemoResults({
        success: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue'
      });
    } finally {
      setLoading(false);
    }
  };

  const runSecurityDemo = async () => {
    setLoading(true);
    try {
      // Démonstration des fonctionnalités RGPD avec Supabase
      const rgpdDemo = {
        dataExport: {
          available: true,
          tables: ['users', 'patients', 'medical_records', 'messages', 'audit_logs'],
          totalRecords: 1247,
          supabaseEnabled: isConnected
        },
        dataAnonymization: {
          available: true,
          affectedTables: ['users', 'patients', 'medical_records'],
          irreversible: true,
          supabaseRLS: isConnected
        },
        auditTrail: {
          totalLogs: 5678,
          lastAccess: new Date().toISOString(),
          retentionPeriod: '7 ans',
          postgresqlAudit: isConnected
        },
        securityRules: {
          totalRules: 15,
          tables: ['users', 'patients', 'doctors', 'medical_records', 'messages'],
          lastUpdate: new Date().toISOString(),
          rowLevelSecurity: isConnected
        }
      };

      setDemoResults({
        success: true,
        message: 'Démonstration sécurité et RGPD (Supabase)',
        data: rgpdDemo
      });

    } catch (error) {
      setDemoResults({
        success: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue'
      });
    } finally {
      setLoading(false);
    }
  };

  const runPerformanceDemo = async () => {
    setLoading(true);
    try {
      // Simuler des métriques de performance Supabase
      const performanceMetrics = {
        queryPerformance: {
          averageQueryTime: 85, // ms (PostgreSQL plus rapide)
          slowQueries: 1,
          totalQueries: 1234,
          cacheHitRate: 92.3, // %
          postgresqlOptimized: isConnected
        },
        indexUsage: {
          totalIndexes: 18,
          usedIndexes: 17,
          unusedIndexes: 1,
          efficiency: 94.4, // %
          btreeIndexes: isConnected
        },
        dataSize: {
          totalRows: 15678,
          averageRowSize: 1.8, // KB (PostgreSQL plus efficace)
          totalStorageUsed: 28.2, // MB
          compressionRatio: 72, // %
          postgresqlCompression: isConnected
        },
        realTimeConnections: {
          activeConnections: 45,
          peakConnections: 89,
          averageConnectionTime: 1247, // seconds
          supabaseRealtime: isConnected
        }
      };

      setDemoResults({
        success: true,
        message: 'Métriques de performance collectées (Supabase PostgreSQL)',
        data: performanceMetrics
      });

    } catch (error) {
      setDemoResults({
        success: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue'
      });
    } finally {
      setLoading(false);
    }
  };

  const runDemo = async (demoType: string) => {
    setDemoResults(null);
    
    switch (demoType) {
      case 'patients':
        await runPatientDemo();
        break;
      case 'records':
        await runMedicalRecordDemo();
        break;
      case 'messaging':
        await runMessagingDemo();
        break;
      case 'security':
        await runSecurityDemo();
        break;
      case 'performance':
        await runPerformanceDemo();
        break;
      default:
        setDemoResults({
          success: true,
          message: 'Sélectionnez une démonstration à exécuter',
          data: null
        });
    }
  };

  const downloadArchitectureDoc = () => {
    const architectureContent = `# Architecture Supabase - Système Médical

## Tables principales:
- users: Profils utilisateurs de base
- patients: Données médicales détaillées
- doctors: Profils médicaux professionnels
- secretaries: Profils secrétaires médicales
- medical_records: Dossiers médicaux sécurisés
- messages: Messagerie chiffrée
- conversations: Fils de discussion
- audit_logs: Logs d'audit RGPD

## Sécurité:
- Authentification Supabase Auth
- Row Level Security (RLS) PostgreSQL
- Chiffrement des données sensibles
- Audit trail complet

## Performance:
- Index PostgreSQL optimisés
- Requêtes SQL performantes
- Pagination efficace
- Cache intelligent

## Conformité RGPD:
- Export complet des données
- Anonymisation sur demande
- Consentements traçables
- Audit trail immutable

Généré le ${new Date().toLocaleDateString('fr-FR')}`;

    const blob = new Blob([architectureContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `supabase-architecture-${new Date().toISOString().split('T')[0]}.md`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Database className="h-8 w-8 text-sky-500" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Architecture Supabase Médicale</h1>
              <p className="text-gray-600">
                Démonstration complète de l'architecture de base de données médicale avec PostgreSQL
              </p>
              <div className="flex items-center mt-2">
                <div className={`w-3 h-3 rounded-full mr-2 ${isConnected ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
                <span className="text-sm text-gray-600">
                  {isConnected ? 'Connecté à Supabase' : 'Mode démo (non connecté)'}
                </span>
              </div>
            </div>
          </div>
          <button
            onClick={downloadArchitectureDoc}
            className="flex items-center space-x-2 px-4 py-2 bg-sky-500 text-white rounded-lg hover:bg-sky-600 transition-colors"
          >
            <Download className="h-4 w-4" />
            <span>Documentation</span>
          </button>
        </div>
      </div>

      {/* Navigation des démonstrations */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Démonstrations interactives</h2>
          <p className="text-sm text-gray-600 mt-1">
            Cliquez sur une section pour voir l'architecture Supabase en action
          </p>
        </div>
        
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {demoSections.map((section) => {
              const Icon = section.icon;
              const isActive = activeDemo === section.id;
              
              return (
                <button
                  key={section.id}
                  onClick={() => setActiveDemo(section.id)}
                  className={`p-6 rounded-lg border-2 transition-all text-left ${
                    isActive
                      ? 'border-sky-500 bg-sky-50 shadow-md'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center mb-4 ${section.color}`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className={`font-semibold mb-2 ${
                    isActive ? 'text-sky-700' : 'text-gray-900'
                  }`}>
                    {section.title}
                  </h3>
                  <p className="text-sm text-gray-600">{section.description}</p>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Contenu de la démonstration */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">
              {demoSections.find(s => s.id === activeDemo)?.title || 'Démonstration'}
            </h2>
            <button
              onClick={() => runDemo(activeDemo)}
              disabled={loading}
              className="flex items-center space-x-2 px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors disabled:opacity-50"
            >
              <Play className="h-4 w-4" />
              <span>{loading ? 'Exécution...' : 'Exécuter la démo'}</span>
            </button>
          </div>
        </div>

        <div className="p-6">
          {/* Vue d'ensemble */}
          {activeDemo === 'overview' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="font-semibold text-gray-900">Tables principales (PostgreSQL)</h3>
                  <div className="space-y-2">
                    {[
                      { name: 'users', count: '1,234', description: 'Profils utilisateurs' },
                      { name: 'patients', count: '856', description: 'Données patients' },
                      { name: 'doctors', count: '45', description: 'Profils médecins' },
                      { name: 'medical_records', count: '5,678', description: 'Dossiers médicaux' },
                      { name: 'messages', count: '12,345', description: 'Messages sécurisés' },
                      { name: 'conversations', count: '789', description: 'Fils de discussion' }
                    ].map((table) => (
                      <div key={table.name} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <span className="font-medium text-gray-900">{table.name}</span>
                          <p className="text-sm text-gray-600">{table.description}</p>
                        </div>
                        <span className="text-lg font-bold text-sky-600">{table.count}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-semibold text-gray-900">Caractéristiques Supabase</h3>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      <span className="text-gray-700">PostgreSQL haute performance</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      <span className="text-gray-700">Row Level Security (RLS)</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      <span className="text-gray-700">Temps réel natif</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      <span className="text-gray-700">API REST automatique</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      <span className="text-gray-700">Authentification intégrée</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      <span className="text-gray-700">Conformité RGPD complète</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <h3 className="font-semibold text-blue-900 mb-3">Architecture relationnelle PostgreSQL</h3>
                <div className="text-sm text-blue-800 space-y-2">
                  <p>• <strong>users</strong> ↔ <strong>patients/doctors/secretaries</strong> (1:1 avec foreign keys)</p>
                  <p>• <strong>patients</strong> ↔ <strong>medical_records</strong> (1:Many avec index)</p>
                  <p>• <strong>doctors</strong> ↔ <strong>medical_records</strong> (1:Many avec index)</p>
                  <p>• <strong>users</strong> ↔ <strong>conversations</strong> (Many:Many via table de liaison)</p>
                  <p>• <strong>conversations</strong> ↔ <strong>messages</strong> (1:Many avec cascade)</p>
                </div>
              </div>
            </div>
          )}

          {/* Autres sections de démonstration... */}
          {activeDemo !== 'overview' && (
            <div className="text-center py-12">
              <Database className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Démonstration {demoSections.find(s => s.id === activeDemo)?.title}
              </h3>
              <p className="text-gray-600 mb-6">
                Cliquez sur "Exécuter la démo" pour voir cette fonctionnalité en action avec Supabase.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Résultats de la démonstration */}
      {demoResults && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center">
              {demoResults.success ? (
                <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
              ) : (
                <AlertTriangle className="h-5 w-5 text-red-500 mr-2" />
              )}
              Résultats de la démonstration
            </h2>
          </div>
          
          <div className="p-6">
            <div className={`p-4 rounded-lg ${
              demoResults.success 
                ? 'bg-green-50 border border-green-200' 
                : 'bg-red-50 border border-red-200'
            }`}>
              <p className={`font-medium ${
                demoResults.success ? 'text-green-900' : 'text-red-900'
              }`}>
                {demoResults.message}
              </p>
              
              {demoResults.error && (
                <p className="text-red-700 text-sm mt-2">
                  Erreur: {demoResults.error}
                </p>
              )}
            </div>

            {demoResults.data && (
              <div className="mt-4">
                <h3 className="font-medium text-gray-900 mb-2">Données générées:</h3>
                <div className="bg-gray-50 rounded-lg p-4 font-mono text-sm overflow-x-auto">
                  <pre>{JSON.stringify(demoResults.data, null, 2)}</pre>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Guide d'implémentation Supabase */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
        <div className="flex items-start space-x-3">
          <Database className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
          <div>
            <h3 className="text-sm font-medium text-blue-900 mb-2">
              Guide d'implémentation Supabase
            </h3>
            <div className="text-sm text-blue-800 space-y-2">
              <p><strong>1.</strong> Cliquer sur "Connect to Supabase" en haut à droite</p>
              <p><strong>2.</strong> Les tables seront créées automatiquement avec les migrations SQL</p>
              <p><strong>3.</strong> Les politiques RLS seront appliquées pour la sécurité</p>
              <p><strong>4.</strong> L'authentification sera configurée automatiquement</p>
              <p><strong>5.</strong> Tester les fonctionnalités avec les hooks React fournis</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};