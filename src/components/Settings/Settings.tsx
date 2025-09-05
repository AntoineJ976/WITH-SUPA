import React, { useState } from 'react';
import { Settings as SettingsIcon, User, Bell, Shield, CreditCard, Globe, Save } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export const Settings: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);
  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    sms: false,
    appointments: true,
    messages: true,
    prescriptions: true
  });

  const handlePhotoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    // Fonctionnalité de photo de profil désactivée pour des raisons de sécurité
    alert('La modification de photo de profil n\'est pas disponible pour des raisons de sécurité.');
  };

  const triggerPhotoUpload = () => {
    // Fonctionnalité désactivée
    alert('L\'upload de photo n\'est pas disponible pour des raisons de sécurité.');
  };

  const tabs = [
    { id: 'profile', label: 'Profil', icon: User },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Sécurité', icon: Shield },
    { id: 'billing', label: 'Facturation', icon: CreditCard },
    { id: 'preferences', label: 'Préférences', icon: Globe }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center space-x-3">
          <SettingsIcon className="h-8 w-8 text-sky-500" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Paramètres</h1>
            <p className="text-gray-600">
              Gérez vos préférences et paramètres de compte.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <nav className="space-y-1">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center space-x-3 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                      activeTab === tab.id
                        ? 'bg-sky-50 text-sky-700 border-r-2 border-sky-500'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <Icon className={`h-4 w-4 ${
                      activeTab === tab.id ? 'text-sky-500' : 'text-gray-400'
                    }`} />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Content */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <div className="p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-6">Informations du profil</h2>
                <div className="space-y-6">
                  <div className="flex items-center space-x-6">
                    <div className="relative">
                      {profilePhoto ? (
                        <img 
                          src={profilePhoto} 
                          alt="Photo de profil" 
                          className="w-20 h-20 rounded-full object-cover border-2 border-gray-200"
                        />
                      ) : (
                        <div className="w-20 h-20 bg-gradient-to-br from-sky-400 to-emerald-400 rounded-full flex items-center justify-center">
                          <span className="text-white font-bold text-2xl">
                            {user?.role === 'patient' 
                              ? `${(user.profile as any).firstName?.[0]}${(user.profile as any).lastName?.[0]}`
                              : `${(user.profile as any).firstName?.[0]}${(user.profile as any).lastName?.[0]}`
                            }
                          </span>
                        </div>
                      )}
                    </div>
                    <div>
                      <button 
                        onClick={triggerPhotoUpload}
                        className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors opacity-50 cursor-not-allowed"
                        disabled
                      >
                        Changer la photo
                      </button>
                      <p className="text-sm text-gray-500 mt-1">Fonctionnalité désactivée pour la sécurité.</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Prénom
                      </label>
                      <input
                        type="text"
                        defaultValue={user?.role === 'patient' 
                          ? (user.profile as any).firstName 
                          : (user.profile as any).firstName
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nom
                      </label>
                      <input
                        type="text"
                        defaultValue={user?.role === 'patient' 
                          ? (user.profile as any).lastName 
                          : (user.profile as any).lastName
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email
                      </label>
                      <input
                        type="email"
                        defaultValue={user?.email}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Téléphone
                      </label>
                      <input
                        type="tel"
                        defaultValue={user?.role === 'patient' 
                          ? (user.profile as any).phoneNumber 
                          : '+33123456789'
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  {user?.role === 'doctor' && (
                    <div className="border-t pt-6">
                      <h3 className="text-md font-medium text-gray-900 mb-4">Informations professionnelles</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Spécialité
                          </label>
                          <input
                            type="text"
                            defaultValue={(user.profile as any).speciality}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Numéro de licence
                          </label>
                          <input
                            type="text"
                            defaultValue={(user.profile as any).licenseNumber}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Tarif de consultation (€)
                          </label>
                          <input
                            type="number"
                            defaultValue={(user.profile as any).consultationFee}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Années d'expérience
                          </label>
                          <input
                            type="number"
                            defaultValue={(user.profile as any).experience}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="flex justify-end">
                    <button className="flex items-center space-x-2 px-6 py-2 bg-sky-500 text-white rounded-lg hover:bg-sky-600 transition-colors">
                      <Save className="h-4 w-4" />
                      <span>Sauvegarder</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Notifications Tab */}
            {activeTab === 'notifications' && (
              <div className="p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-6">Préférences de notification</h2>
                <div className="space-y-6">
                  <div>
                    <h3 className="text-md font-medium text-gray-900 mb-4">Canaux de notification</h3>
                    <div className="space-y-4">
                      <label className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          checked={notifications.email}
                          onChange={(e) => setNotifications({...notifications, email: e.target.checked})}
                          className="rounded border-gray-300 text-sky-600 focus:ring-sky-500"
                        />
                        <span className="text-sm text-gray-700">Notifications par e-mail</span>
                      </label>
                      <label className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          checked={notifications.push}
                          onChange={(e) => setNotifications({...notifications, push: e.target.checked})}
                          className="rounded border-gray-300 text-sky-600 focus:ring-sky-500"
                        />
                        <span className="text-sm text-gray-700">Notifications push</span>
                      </label>
                      <label className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          checked={notifications.sms}
                          onChange={(e) => setNotifications({...notifications, sms: e.target.checked})}
                          className="rounded border-gray-300 text-sky-600 focus:ring-sky-500"
                        />
                        <span className="text-sm text-gray-700">SMS (service premium)</span>
                      </label>
                    </div>
                  </div>

                  <div className="border-t pt-6">
                    <h3 className="text-md font-medium text-gray-900 mb-4">Types de notifications</h3>
                    <div className="space-y-4">
                      <label className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          checked={notifications.appointments}
                          onChange={(e) => setNotifications({...notifications, appointments: e.target.checked})}
                          className="rounded border-gray-300 text-sky-600 focus:ring-sky-500"
                        />
                        <span className="text-sm text-gray-700">Rappels de rendez-vous</span>
                      </label>
                      <label className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          checked={notifications.messages}
                          onChange={(e) => setNotifications({...notifications, messages: e.target.checked})}
                          className="rounded border-gray-300 text-sky-600 focus:ring-sky-500"
                        />
                        <span className="text-sm text-gray-700">Nouveaux messages</span>
                      </label>
                      <label className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          checked={notifications.prescriptions}
                          onChange={(e) => setNotifications({...notifications, prescriptions: e.target.checked})}
                          className="rounded border-gray-300 text-sky-600 focus:ring-sky-500"
                        />
                        <span className="text-sm text-gray-700">Rappels de médicaments</span>
                      </label>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <button className="flex items-center space-x-2 px-6 py-2 bg-sky-500 text-white rounded-lg hover:bg-sky-600 transition-colors">
                      <Save className="h-4 w-4" />
                      <span>Sauvegarder</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Security Tab */}
            {activeTab === 'security' && (
              <div className="p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-6">Sécurité et confidentialité</h2>
                <div className="space-y-6">
                  <div>
                    <h3 className="text-md font-medium text-gray-900 mb-4">Changer le mot de passe</h3>
                    <div className="space-y-4 max-w-md">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Mot de passe actuel
                        </label>
                        <input
                          type="password"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Nouveau mot de passe
                        </label>
                        <input
                          type="password"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Confirmer le nouveau mot de passe
                        </label>
                        <input
                          type="password"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                        />
                      </div>
                      <button className="px-4 py-2 bg-sky-500 text-white rounded-lg hover:bg-sky-600 transition-colors">
                        Mettre à jour le mot de passe
                      </button>
                    </div>
                  </div>

                  <div className="border-t pt-6">
                    <h3 className="text-md font-medium text-gray-900 mb-4">Authentification à deux facteurs</h3>
                    <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">2FA par SMS</p>
                        <p className="text-sm text-gray-600">Sécurisez votre compte avec un code SMS</p>
                      </div>
                      <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                        Activer
                      </button>
                    </div>
                  </div>

                  <div className="border-t pt-6">
                    <h3 className="text-md font-medium text-gray-900 mb-4">Sessions actives</h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-900">Session actuelle</p>
                          <p className="text-sm text-gray-600">Chrome sur Windows • Paris, France</p>
                        </div>
                        <span className="text-sm text-green-600 font-medium">Actuelle</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Other tabs placeholder */}
            {(activeTab === 'billing' || activeTab === 'preferences') && (
              <div className="p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-6">
                  {activeTab === 'billing' ? 'Facturation' : 'Préférences'}
                </h2>
                <p className="text-gray-600">Cette section sera disponible prochainement.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};