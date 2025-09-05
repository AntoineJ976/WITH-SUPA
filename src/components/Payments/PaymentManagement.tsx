import React, { useState } from 'react';
import { CreditCard, Plus, Trash2, Shield, Calendar, Euro, Eye, Download, Check } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useAuth } from '../../contexts/AuthContext';

export const PaymentManagement: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'cards' | 'history' | 'invoices'>('cards');
  const [showAddCardModal, setShowAddCardModal] = useState(false);
  const [cardForm, setCardForm] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardholderName: ''
  });
  const [savedCards, setSavedCards] = useState([
    {
      id: '1',
      last4: '4242',
      brand: 'Visa',
      expiryMonth: 12,
      expiryYear: 2027,
      cardholderName: 'ANTOINE JAOMBELO',
      isDefault: true
    }
  ]);

  const paymentHistory = [
    {
      id: '1',
      amount: 50,
      date: '2025-01-10T10:00:00Z',
      doctor: 'Dr. Marie Leblanc',
      consultation: 'Consultation vidéo',
      status: 'completed',
      paymentMethod: 'Visa •••• 4242'
    },
    {
      id: '2',
      amount: 80,
      date: '2024-12-15T14:30:00Z',
      doctor: 'Dr. Pierre Martin',
      consultation: 'Consultation cardiologie',
      status: 'completed',
      paymentMethod: 'Visa •••• 4242'
    },
    {
      id: '3',
      amount: 50,
      date: '2024-11-20T09:00:00Z',
      doctor: 'Dr. Marie Leblanc',
      consultation: 'Consultation de suivi',
      status: 'refunded',
      paymentMethod: 'Visa •••• 4242'
    }
  ];

  const invoices = [
    {
      id: 'INV-2025-001',
      amount: 50,
      date: '2025-01-10T10:00:00Z',
      doctor: 'Dr. Marie Leblanc',
      consultation: 'Consultation vidéo',
      status: 'paid'
    },
    {
      id: 'INV-2024-089',
      amount: 80,
      date: '2024-12-15T14:30:00Z',
      doctor: 'Dr. Pierre Martin',
      consultation: 'Consultation cardiologie',
      status: 'paid'
    }
  ];

  const handleAddCard = () => {
    setShowAddCardModal(true);
  };

  const handleSubmitCard = () => {
    if (!cardForm.cardNumber || !cardForm.expiryDate || !cardForm.cvv || !cardForm.cardholderName) {
      alert('Veuillez remplir tous les champs');
      return;
    }

    const newCard = {
      id: Date.now().toString(),
      last4: cardForm.cardNumber.slice(-4),
      brand: 'Visa', // Simulé
      expiryMonth: parseInt(cardForm.expiryDate.split('/')[0]),
      expiryYear: parseInt('20' + cardForm.expiryDate.split('/')[1]),
      cardholderName: cardForm.cardholderName.toUpperCase(),
      isDefault: savedCards.length === 0
    };

    setSavedCards(prev => [...prev, newCard]);
    localStorage.setItem('savedPaymentCards', JSON.stringify([...savedCards, newCard]));
    
    setShowAddCardModal(false);
    setCardForm({
      cardNumber: '',
      expiryDate: '',
      cvv: '',
      cardholderName: ''
    });
  };

  const handleDeleteCard = (cardId: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette carte ?')) {
      const updatedCards = savedCards.filter(card => card.id !== cardId);
      setSavedCards(updatedCards);
      localStorage.setItem('savedPaymentCards', JSON.stringify(updatedCards));
    }
  };

  const handleSetDefaultCard = (cardId: string) => {
    setSavedCards(prev => prev.map(card => ({
      ...card,
      isDefault: card.id === cardId
    })));
  };

  const downloadInvoice = (invoice: any) => {
    const invoiceContent = `FACTURE ${invoice.id}

Docteurs O.I
Plateforme de télémédecine
contact@docteurs-oi.fr

---

Date: ${format(new Date(invoice.date), 'dd/MM/yyyy', { locale: fr })}
Patient: ${user?.role === 'patient' 
  ? `${(user.profile as any)?.firstName} ${(user.profile as any)?.lastName}`
  : 'Patient'
}

Consultation: ${invoice.consultation}
Médecin: ${invoice.doctor}
Montant: ${invoice.amount}€ TTC

Statut: ${invoice.status === 'paid' ? 'Payé' : 'En attente'}

---

Merci pour votre confiance.`;

    const blob = new Blob([invoiceContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `facture-${invoice.id}.txt`;
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
            <CreditCard className="h-8 w-8 text-sky-500" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Gestion des paiements</h1>
              <p className="text-gray-600">
                Gérez vos moyens de paiement et consultez votre historique.
              </p>
            </div>
          </div>
          {activeTab === 'cards' && (
            <button 
              onClick={handleAddCard}
              className="flex items-center space-x-2 px-4 py-2 bg-sky-500 text-white rounded-lg hover:bg-sky-600 transition-colors"
            >
              <Plus className="h-4 w-4" />
              <span>Ajouter une carte</span>
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            <button
              onClick={() => setActiveTab('cards')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'cards'
                  ? 'border-sky-500 text-sky-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Cartes enregistrées ({savedCards.length})
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'history'
                  ? 'border-sky-500 text-sky-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Historique ({paymentHistory.length})
            </button>
            <button
              onClick={() => setActiveTab('invoices')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'invoices'
                  ? 'border-sky-500 text-sky-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Factures ({invoices.length})
            </button>
          </nav>
        </div>

        <div className="p-6">
          {/* Cards Tab */}
          {activeTab === 'cards' && (
            <div className="space-y-4">
              {savedCards.length === 0 ? (
                <div className="text-center py-8">
                  <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune carte enregistrée</h3>
                  <p className="text-gray-600 mb-4">Ajoutez une carte bancaire pour faciliter vos paiements.</p>
                  <button 
                    onClick={handleAddCard}
                    className="bg-sky-500 text-white px-4 py-2 rounded-lg hover:bg-sky-600 transition-colors"
                  >
                    Ajouter ma première carte
                  </button>
                </div>
              ) : (
                savedCards.map((card) => (
                  <div key={card.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded flex items-center justify-center">
                          <span className="text-white text-xs font-bold">{card.brand}</span>
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-900">
                            {card.brand} •••• {card.last4}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {card.cardholderName} • Expire {card.expiryMonth.toString().padStart(2, '0')}/{card.expiryYear}
                          </p>
                          {card.isDefault && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 mt-1">
                              <Check className="h-3 w-3 mr-1" />
                              Carte par défaut
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {!card.isDefault && (
                          <button
                            onClick={() => handleSetDefaultCard(card.id)}
                            className="text-sm text-sky-600 hover:text-sky-700 font-medium"
                          >
                            Définir par défaut
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteCard(card.id)}
                          className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* History Tab */}
          {activeTab === 'history' && (
            <div className="space-y-4">
              {paymentHistory.map((payment) => (
                <div key={payment.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className={`p-2 rounded-lg ${
                        payment.status === 'completed' ? 'bg-green-100' : 
                        payment.status === 'refunded' ? 'bg-yellow-100' : 'bg-red-100'
                      }`}>
                        <Euro className={`h-5 w-5 ${
                          payment.status === 'completed' ? 'text-green-600' : 
                          payment.status === 'refunded' ? 'text-yellow-600' : 'text-red-600'
                        }`} />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">{payment.consultation}</h3>
                        <p className="text-sm text-gray-600">{payment.doctor}</p>
                        <p className="text-sm text-gray-500">
                          {format(new Date(payment.date), 'dd/MM/yyyy à HH:mm', { locale: fr })} • {payment.paymentMethod}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-gray-900">{payment.amount}€</p>
                      <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                        payment.status === 'completed' ? 'bg-green-100 text-green-800' :
                        payment.status === 'refunded' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {payment.status === 'completed' ? 'Payé' :
                         payment.status === 'refunded' ? 'Remboursé' : 'Échoué'}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Invoices Tab */}
          {activeTab === 'invoices' && (
            <div className="space-y-4">
              {invoices.map((invoice) => (
                <div key={invoice.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="p-2 bg-sky-100 rounded-lg">
                        <Calendar className="h-5 w-5 text-sky-600" />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">Facture {invoice.id}</h3>
                        <p className="text-sm text-gray-600">{invoice.consultation} - {invoice.doctor}</p>
                        <p className="text-sm text-gray-500">
                          {format(new Date(invoice.date), 'dd/MM/yyyy', { locale: fr })}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <p className="text-lg font-bold text-gray-900">{invoice.amount}€</p>
                        <span className="inline-flex px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Payé
                        </span>
                      </div>
                      <div className="flex space-x-2">
                        <button 
                          onClick={() => alert(`Visualisation de la facture ${invoice.id}`)}
                          className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button 
                          onClick={() => downloadInvoice(invoice)}
                          className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                        >
                          <Download className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Payment Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 text-center">
          <Euro className="h-8 w-8 text-green-500 mx-auto mb-3" />
          <p className="text-2xl font-bold text-gray-900">
            {paymentHistory.filter(p => p.status === 'completed').reduce((sum, p) => sum + p.amount, 0)}€
          </p>
          <p className="text-sm text-gray-600">Total dépensé</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 text-center">
          <Calendar className="h-8 w-8 text-sky-500 mx-auto mb-3" />
          <p className="text-2xl font-bold text-gray-900">{paymentHistory.length}</p>
          <p className="text-sm text-gray-600">Consultations payées</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 text-center">
          <CreditCard className="h-8 w-8 text-purple-500 mx-auto mb-3" />
          <p className="text-2xl font-bold text-gray-900">{savedCards.length}</p>
          <p className="text-sm text-gray-600">Cartes enregistrées</p>
        </div>
      </div>

      {/* Security Notice */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
        <div className="flex items-start space-x-3">
          <Shield className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
          <div>
            <h3 className="text-sm font-medium text-blue-900 mb-2">
              Sécurité des paiements
            </h3>
            <div className="text-sm text-blue-800 space-y-1">
              <p>• Toutes les transactions sont sécurisées par chiffrement SSL/TLS</p>
              <p>• Vos données bancaires sont protégées selon les standards PCI DSS</p>
              <p>• Conformité RGPD pour la protection des données personnelles</p>
              <p>• Authentification sécurisée pour tous les paiements</p>
            </div>
          </div>
        </div>
      </div>

      {/* Modal Ajouter une carte */}
      {showAddCardModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">Ajouter une carte bancaire</h2>
                <button
                  onClick={() => setShowAddCardModal(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  ✕
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-4">
              {/* Nom du porteur */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nom du porteur de carte *
                </label>
                <input
                  type="text"
                  value={cardForm.cardholderName}
                  onChange={(e) => setCardForm(prev => ({ ...prev, cardholderName: e.target.value }))}
                  placeholder="Jean Dupont"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                />
              </div>

              {/* Numéro de carte */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Numéro de carte *
                </label>
                <input
                  type="text"
                  value={cardForm.cardNumber}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '').replace(/(\d{4})(?=\d)/g, '$1 ');
                    if (value.replace(/\s/g, '').length <= 16) {
                      setCardForm(prev => ({ ...prev, cardNumber: value }));
                    }
                  }}
                  placeholder="1234 5678 9012 3456"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Date d'expiration */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date d'expiration *
                  </label>
                  <input
                    type="text"
                    value={cardForm.expiryDate}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, '');
                      if (value.length <= 4) {
                        const formatted = value.length >= 2 ? `${value.slice(0, 2)}/${value.slice(2)}` : value;
                        setCardForm(prev => ({ ...prev, expiryDate: formatted }));
                      }
                    }}
                    placeholder="MM/AA"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                  />
                </div>

                {/* CVV */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    CVV *
                  </label>
                  <input
                    type="text"
                    value={cardForm.cvv}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, '');
                      if (value.length <= 3) {
                        setCardForm(prev => ({ ...prev, cvv: value }));
                      }
                    }}
                    placeholder="123"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Notice de sécurité */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <div className="flex items-start space-x-2">
                  <Shield className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-green-800">Paiement sécurisé</p>
                    <p className="text-xs text-green-700">
                      Vos données sont chiffrées et protégées selon les standards PCI DSS.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 flex justify-end space-x-3">
              <button
                onClick={() => setShowAddCardModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={handleSubmitCard}
                className="px-4 py-2 bg-sky-500 text-white rounded-lg hover:bg-sky-600 transition-colors flex items-center space-x-2"
              >
                <CreditCard className="h-4 w-4" />
                <span>Enregistrer la carte</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};