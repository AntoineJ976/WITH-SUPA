import React, { useState } from 'react';
import { Eye, EyeOff, Stethoscope, Heart, UserCheck } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';

interface LoginFormProps {
  onShowRegistration: () => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({ onShowRegistration }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'patient' | 'doctor' | 'secretary'>('patient');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('📝 Connexion Supabase:', { email, role });
    
    setError('');
    setIsLoading(true);
    
    try {
      await login(email, password, role);
      console.log('✅ Connexion Supabase réussie');
    } catch (error) {
      console.error('❌ Erreur connexion Supabase:', error);
      setError(error instanceof Error ? error.message : 'Erreur de connexion. Veuillez réessayer.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 to-emerald-50 flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="flex justify-center">
            <div className="w-16 h-16 bg-sky-500 rounded-2xl flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-2xl">D</span>
            </div>
          </div>
          <h2 className="mt-6 text-3xl font-bold text-gray-900">Docteurs O.I</h2>
          <p className="mt-2 text-sm text-gray-600">
            Plateforme de télémédecine sécurisée
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            {/* Role Selection */}
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-3">
                Je suis un(e) :
              </label>
              <div className="grid grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => setRole('patient')}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    role === 'patient'
                      ? 'border-sky-500 bg-sky-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <Heart className={`h-6 w-6 mx-auto mb-2 ${
                    role === 'patient' ? 'text-sky-500' : 'text-gray-400'
                  }`} />
                  <span className={`text-sm font-medium ${
                    role === 'patient' ? 'text-sky-700' : 'text-gray-700'
                  }`}>
                    Patient
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => setRole('doctor')}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    role === 'doctor'
                      ? 'border-sky-500 bg-sky-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <Stethoscope className={`h-6 w-6 mx-auto mb-2 ${
                    role === 'doctor' ? 'text-sky-500' : 'text-gray-400'
                  }`} />
                  <span className={`text-sm font-medium ${
                    role === 'doctor' ? 'text-sky-700' : 'text-gray-700'
                  }`}>
                    Médecin
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => setRole('secretary')}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    role === 'secretary'
                      ? 'border-sky-500 bg-sky-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <UserCheck className={`h-6 w-6 mx-auto mb-2 ${
                    role === 'secretary' ? 'text-sky-500' : 'text-gray-400'
                  }`} />
                  <span className={`text-sm font-medium ${
                    role === 'secretary' ? 'text-sky-700' : 'text-gray-700'
                  }`}>
                    Secrétaire
                  </span>
                </button>
              </div>
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Adresse e-mail
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 appearance-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent focus:z-10 sm:text-sm"
                placeholder="votre@email.com"
              />
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Mot de passe
              </label>
              <div className="mt-1 relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none relative block w-full px-3 py-3 pr-10 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent focus:z-10 sm:text-sm"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-500" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400 hover:text-gray-500" />
                  )}
                </button>
              </div>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-sky-600 hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? 'Connexion...' : 'Se connecter'}
            </button>
          </div>

          <div className="text-center">
            <p className="text-sm text-gray-600">
              Pas encore de compte ?{' '}
              <button 
                onClick={onShowRegistration}
                className="font-medium text-sky-600 hover:text-sky-500 transition-colors"
              >
                S'inscrire
              </button>
            </p>
          </div>
        </form>

        {/* RGPD Notice */}
        <div className="mt-8 p-4 bg-gray-50 rounded-lg border">
          <p className="text-xs text-gray-600 text-center">
            En vous connectant via Supabase, vous acceptez notre{' '}
            <a href="#" className="text-sky-600 hover:underline">politique de confidentialité</a>{' '}
            et nos{' '}
            <a href="#" className="text-sky-600 hover:underline">conditions d'utilisation</a>.
            Vos données sont sécurisées avec Supabase et protégées selon le RGPD.
          </p>
        </div>
      </div>
    </div>
  );
};