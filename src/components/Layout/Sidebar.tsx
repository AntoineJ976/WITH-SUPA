import React from 'react';
import { 
  Calendar, 
  MessageSquare, 
  FileText, 
  CreditCard, 
  Settings, 
  Users,
  Activity,
  Shield,
  Clock,
  Database
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface SidebarProps {
  activeView: string;
  onViewChange: (view: string) => void;
  isOpen?: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeView, onViewChange, isOpen = true }) => {
  const { user } = useAuth();

  const patientMenuItems = [
    { id: 'dashboard', label: 'Tableau de bord', icon: Activity },
    { id: 'consultations', label: 'Réserver consultation', icon: Calendar },
    { id: 'messages', label: 'Messages', icon: MessageSquare },
    { id: 'medical-records', label: 'Dossier médical', icon: FileText },
    { id: 'prescriptions', label: 'Mes ordonnances', icon: FileText },
    { id: 'payments', label: 'Paiements', icon: CreditCard },
    { id: 'rgpd', label: 'Mes données (RGPD)', icon: Shield },
    { id: 'settings', label: 'Paramètres', icon: Settings }
  ];

  const doctorMenuItems = [
    { id: 'dashboard', label: 'Tableau de bord', icon: Activity },
    { id: 'schedule', label: 'Planning', icon: Clock },
    { id: 'patients', label: 'Patients', icon: Users },
    { id: 'consultations', label: 'Prescription', icon: Calendar },
    { id: 'messages', label: 'Messages', icon: MessageSquare },
    { id: 'prescriptions', label: 'Gestion Ordonnances', icon: FileText },
    { id: 'rgpd', label: 'Conformité RGPD', icon: Shield },
    { id: 'settings', label: 'Paramètres', icon: Settings }
  ];

  const secretaryMenuItems = [
    { id: 'dashboard', label: 'Tableau de bord', icon: Activity },
    { id: 'patients', label: 'Gestion Patients', icon: Users },
    { id: 'schedule', label: 'Planning Médical', icon: Clock },
    { id: 'messages', label: 'Messages', icon: MessageSquare },
    { id: 'medical-records', label: 'Dossiers Médicaux', icon: FileText },
    { id: 'firebase-demo', label: 'Demo Supabase', icon: Settings },
    { id: 'firestore-architecture', label: 'Architecture Supabase', icon: Database },
    { id: 'rgpd', label: 'Conformité RGPD', icon: Shield },
    { id: 'settings', label: 'Paramètres', icon: Settings }
  ];

  const menuItems = user?.role === 'doctor' ? doctorMenuItems : 
                   user?.role === 'secretary' ? secretaryMenuItems : 
                   patientMenuItems;

  return (
    <aside className={`bg-white shadow-sm border-r border-gray-200 transition-transform duration-300 ease-in-out ${
      isOpen ? 'translate-x-0' : '-translate-x-full'
    } lg:translate-x-0 fixed lg:static inset-y-0 left-0 z-40 w-64`}>
      <div className="h-full flex flex-col">
        <div className="flex-1 flex flex-col min-h-0 pt-5 pb-4 overflow-y-auto">
          <nav className="mt-8 flex-1 px-4 space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeView === item.id;
              
              return (
                <button
                  key={item.id}
                  onClick={() => onViewChange(item.id)}
                  className={`group flex items-center px-3 py-2 text-sm font-medium rounded-md w-full text-left transition-colors ${
                    isActive
                      ? 'bg-sky-50 text-sky-700 border-r-2 border-sky-500'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <Icon
                    className={`mr-3 flex-shrink-0 h-5 w-5 ${
                      isActive ? 'text-sky-500' : 'text-gray-400 group-hover:text-gray-500'
                    }`}
                  />
                  {item.label}
                </button>
              );
            })}
          </nav>
        </div>
      </div>
    </aside>
  );
};