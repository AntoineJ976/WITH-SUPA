import React from 'react';
import { User, LogOut, Menu, X } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { PaymentNotifications } from '../Notifications/PaymentNotifications';

interface HeaderProps {
  onMenuToggle?: () => void;
  showMenu?: boolean;
}

export const Header: React.FC<HeaderProps> = ({ onMenuToggle, showMenu }) => {
  const { user, logout } = useAuth();

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            {onMenuToggle && (
              <button
                onClick={onMenuToggle}
                className="lg:hidden p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
              >
                {showMenu ? <X size={24} /> : <Menu size={24} />}
              </button>
            )}
            <div className="flex items-center ml-2 lg:ml-0">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-sky-500 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">D</span>
                </div>
                <span className="text-xl font-bold text-gray-900">Docteurs O.I</span>
              </div>
            </div>
          </div>

          {/* User Menu */}
          {user && (
            <div className="flex items-center space-x-4">
              {/* Payment Notifications for Medical Staff */}
              {(user.role === 'doctor' || user.role === 'secretary') && (
                <PaymentNotifications userRole={user.role} userId={user.id} />
              )}
              
              <div className="hidden sm:flex items-center space-x-3">
                <div className="flex items-center space-x-2">
                  <User size={20} className="text-gray-600" />
                  <span className="text-sm font-medium text-gray-900">
                    {user.role === 'patient' 
                      ? `${(user.profile as any).firstName} ${(user.profile as any).lastName}`
                      : user.role === 'doctor'
                      ? `Dr. ${(user.profile as any).lastName}`
                      : `${(user.profile as any).firstName} ${(user.profile as any).lastName}`
                    }
                  </span>
                </div>
                <div className="h-6 w-px bg-gray-300" />
                <span className="text-xs text-gray-500 capitalize bg-sky-50 px-2 py-1 rounded-full">
                  {user.role}
                </span>
              </div>
              
              <button
                onClick={logout}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors p-2 rounded-md hover:bg-gray-100"
              >
                <LogOut size={18} />
                <span className="hidden sm:inline text-sm">Déconnexion</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};