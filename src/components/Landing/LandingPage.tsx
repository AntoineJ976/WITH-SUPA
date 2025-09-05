import React, { useState } from 'react';
import { 
  Video, 
  Shield, 
  Clock, 
  Users, 
  Star, 
  CheckCircle, 
  ArrowRight, 
  Play,
  Heart,
  Stethoscope,
  UserCheck,
  Phone,
  MessageSquare,
  Calendar,
  FileText,
  Award,
  Globe,
  Lock,
  Zap,
  ChevronDown,
  Menu,
  X,
  Monitor,
  Smartphone,
  Tablet,
  Wifi,
  Download,
  Upload,
  Camera,
  Headphones
} from 'lucide-react';
import { RegistrationForm } from '../Auth/RegistrationForm';
import { LoginForm } from '../Auth/LoginForm';

export const LandingPage: React.FC = () => {
  const [showRegistration, setShowRegistration] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [selectedRole, setSelectedRole] = useState<'patient' | 'doctor' | 'secretary' | null>(null);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const [activeFAQ, setActiveFAQ] = useState<number | null>(null);

  const features = [
    {
      icon: Video,
      title: 'Consultations vidéo HD',
      description: 'Consultez vos médecins en haute définition avec notre technologie de pointe',
      color: 'text-sky-500 bg-sky-100'
    },
    {
      icon: Shield,
      title: 'Sécurité RGPD',
      description: 'Vos données médicales sont protégées selon les standards européens les plus stricts',
      color: 'text-emerald-500 bg-emerald-100'
    },
    {
      icon: Clock,
      title: 'Disponible 24h/7j',
      description: 'Accédez aux soins médicaux à tout moment, où que vous soyez',
      color: 'text-purple-500 bg-purple-100'
    },
    {
      icon: Users,
      title: 'Médecins certifiés',
      description: 'Plus de 500 médecins vérifiés et spécialisés à votre service',
      color: 'text-amber-500 bg-amber-100'
    },
    {
      icon: MessageSquare,
      title: 'Messagerie chiffrée',
      description: 'Communiquez en toute sécurité avec vos professionnels de santé',
      color: 'text-red-500 bg-red-100'
    },
    {
      icon: FileText,
      title: 'Dossier médical numérique',
      description: 'Votre historique médical centralisé et accessible partout',
      color: 'text-indigo-500 bg-indigo-100'
    }
  ];

  const platformFeatures = [
    {
      icon: Monitor,
      title: 'Multi-plateforme',
      description: 'Accessible sur ordinateur, tablette et smartphone'
    },
    {
      icon: Wifi,
      title: 'Connexion optimisée',
      description: 'Fonctionne même avec une connexion internet limitée'
    },
    {
      icon: Camera,
      title: 'Qualité vidéo adaptative',
      description: 'Ajustement automatique selon votre bande passante'
    },
    {
      icon: Headphones,
      title: 'Audio cristallin',
      description: 'Technologie de réduction de bruit pour une communication claire'
    }
  ];

  const faqData = [
    {
      question: 'Comment fonctionne une téléconsultation ?',
      answer: 'Une téléconsultation se déroule comme une consultation classique, mais à distance via vidéo. Vous prenez rendez-vous, rejoignez la consultation à l\'heure prévue, échangez avec votre médecin et recevez votre ordonnance électronique si nécessaire.'
    },
    {
      question: 'Mes données médicales sont-elles sécurisées ?',
      answer: 'Absolument. Nous utilisons un chiffrement de bout en bout, sommes certifiés HDS (Hébergement de Données de Santé) et respectons strictement le RGPD. Vos données sont hébergées en France sur des serveurs sécurisés.'
    },
    {
      question: 'Puis-je être remboursé par ma mutuelle ?',
      answer: 'Oui, de nombreuses mutuelles remboursent les téléconsultations. Le remboursement dépend de votre contrat. Nous vous fournissons tous les documents nécessaires pour vos démarches.'
    },
    {
      question: 'Que faire en cas de problème technique ?',
      answer: 'Notre support technique est disponible 24h/7j. En cas de problème pendant une consultation, vous pouvez basculer en consultation téléphonique ou reprogrammer sans frais supplémentaires.'
    },
    {
      question: 'Les médecins sont-ils vraiment qualifiés ?',
      answer: 'Tous nos médecins sont diplômés, inscrits au Conseil de l\'Ordre et vérifiés. Nous contrôlons leurs diplômes, leur expérience et leur droit d\'exercer avant de les accepter sur la plateforme.'
    }
  ];

  const testimonials = [
    {
      name: 'Marie Dubois',
      role: 'Patiente',
      avatar: 'MD',
      content: 'Docteurs O.I a révolutionné ma façon de consulter. Plus besoin de me déplacer, je peux voir mon médecin depuis chez moi en quelques clics.',
      rating: 5
    },
    {
      name: 'Dr. Pierre Martin',
      role: 'Cardiologue',
      avatar: 'PM',
      content: 'Une plateforme exceptionnelle qui me permet de suivre mes patients plus efficacement. L\'interface est intuitive et sécurisée.',
      rating: 5
    },
    {
      name: 'Sophie Leblanc',
      role: 'Secrétaire médicale',
      avatar: 'SL',
      content: 'La gestion des rendez-vous n\'a jamais été aussi simple. Tout est centralisé et automatisé, un vrai gain de temps.',
      rating: 5
    }
  ];

  const stats = [
    { number: '75,000+', label: 'Patients satisfaits' },
    { number: '500+', label: 'Médecins certifiés' },
    { number: '150,000+', label: 'Consultations réalisées' },
    { number: '4.9/5', label: 'Note moyenne' }
  ];

  const handleGetStarted = (role: 'patient' | 'doctor' | 'secretary') => {
    setSelectedRole(role);
    setShowRegistration(true);
  };

  const handleLogin = () => {
    setShowLogin(true);
  };

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    setShowMobileMenu(false);
  };

  if (showLogin) {
    return (
      <LoginForm 
        onShowRegistration={() => {
          setShowLogin(false);
          setShowRegistration(true);
        }}
      />
    );
  }

  if (showRegistration) {
    return (
      <RegistrationForm 
        onBackToLogin={() => {
          setShowRegistration(false);
          setShowLogin(true);
        }}
        preSelectedRole={selectedRole}
      />
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-sky-500 to-emerald-500 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-lg">D</span>
              </div>
              <span className="text-2xl font-bold text-gray-900">Docteurs O.I</span>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <button 
                onClick={() => scrollToSection('features')}
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                Fonctionnalités
              </button>
              <button 
                onClick={() => scrollToSection('how-it-works')}
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                Comment ça marche
              </button>
              <button 
                onClick={() => scrollToSection('testimonials')}
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                Témoignages
              </button>
              <button 
                onClick={() => scrollToSection('pricing')}
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                Tarifs
              </button>
              <button 
                onClick={handleLogin}
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                Se connecter
              </button>
              <button 
                onClick={() => handleGetStarted('patient')}
                className="bg-sky-500 text-white px-6 py-2 rounded-lg hover:bg-sky-600 transition-colors font-medium"
              >
                Commencer
              </button>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="md:hidden p-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              {showMobileMenu ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>

          {/* Mobile Navigation */}
          {showMobileMenu && (
            <div className="md:hidden border-t border-gray-200 py-4">
              <div className="space-y-3">
                <button 
                  onClick={() => scrollToSection('features')}
                  className="block w-full text-left px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors"
                >
                  Fonctionnalités
                </button>
                <button 
                  onClick={() => scrollToSection('how-it-works')}
                  className="block w-full text-left px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors"
                >
                  Comment ça marche
                </button>
                <button 
                  onClick={() => scrollToSection('testimonials')}
                  className="block w-full text-left px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors"
                >
                  Témoignages
                </button>
                <button 
                  onClick={() => scrollToSection('pricing')}
                  className="block w-full text-left px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors"
                >
                  Tarifs
                </button>
                <button 
                  onClick={handleLogin}
                  className="block w-full text-left px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors"
                >
                  Se connecter
                </button>
                <button 
                  onClick={() => handleGetStarted('patient')}
                  className="block w-full bg-sky-500 text-white px-4 py-2 rounded-lg hover:bg-sky-600 transition-colors font-medium"
                >
                  Commencer
                </button>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-sky-50 via-white to-emerald-50 pt-16 pb-20 overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Content */}
            <div className="text-center lg:text-left">
              <div className="inline-flex items-center space-x-2 bg-sky-100 text-sky-800 px-4 py-2 rounded-full text-sm font-medium mb-6">
                <Award className="h-4 w-4" />
                <span>Plateforme certifiée HDS et conforme RGPD</span>
              </div>
              
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
                Votre médecin
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-sky-500 to-emerald-500">
                  à portée de clic
                </span>
              </h1>
              
              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                Consultations médicales en ligne sécurisées • Ordonnances électroniques • 
                Suivi personnalisé • Disponible 24h/7j depuis chez vous
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <button 
                  onClick={() => handleGetStarted('patient')}
                  className="group bg-sky-500 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-sky-600 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                >
                  <span className="flex items-center justify-center space-x-2">
                    <span>Consulter maintenant</span>
                    <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </span>
                </button>
                <button 
                  onClick={handleLogin}
                  className="group flex items-center justify-center space-x-2 border-2 border-gray-300 text-gray-700 px-8 py-4 rounded-xl font-semibold text-lg hover:border-gray-400 hover:bg-gray-50 transition-all"
                >
                  <span>J'ai déjà un compte</span>
                </button>
              </div>

              {/* Quick Benefits */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span>Consultation en 5 min</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span>Ordonnance immédiate</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span>Remboursé par la mutuelle</span>
                </div>
              </div>

              {/* Demo Video Button */}
              <div className="flex justify-center lg:justify-start">
                <button className="group flex items-center space-x-3 text-sky-600 hover:text-sky-700 transition-colors">
                  <Play className="h-5 w-5" />
                  <span className="font-medium">Voir comment ça marche (2 min)</span>
                </button>
              </div>
            </div>

            {/* Hero Image/Video */}
            <div className="relative">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                <img 
                  src="https://images.pexels.com/photos/5215024/pexels-photo-5215024.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop"
                  alt="Médecin consultant un patient en téléconsultation"
                  className="w-full h-96 object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                
                {/* Overlay indicators */}
                <div className="absolute top-4 left-4 flex items-center space-x-2">
                  <div className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium flex items-center space-x-1">
                    <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                    <span>Consultation en cours</span>
                  </div>
                </div>
                
                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-medium text-gray-800">
                  🔒 Chiffré E2E
                </div>
                
                <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-medium text-gray-800">
                  📹 Qualité HD
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Statistics Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
              La confiance de milliers d'utilisateurs
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Rejoignez une communauté grandissante de patients et professionnels de santé
            </p>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center group">
                <div className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-sky-500 to-emerald-500 bg-clip-text text-transparent mb-2 group-hover:scale-110 transition-transform">
                  {stat.number}
                </div>
                <div className="text-gray-600 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
          
          {/* Trust Indicators */}
          <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-12 text-sm text-gray-600 mt-12">
            <div className="flex items-center space-x-2">
              <Shield className="h-5 w-5 text-green-500" />
              <span className="font-medium">Données hébergées en France</span>
            </div>
            <div className="flex items-center space-x-2">
              <Award className="h-5 w-5 text-blue-500" />
              <span className="font-medium">Certification HDS</span>
            </div>
            <div className="flex items-center space-x-2">
              <Globe className="h-5 w-5 text-purple-500" />
              <span className="font-medium">100% conforme RGPD</span>
            </div>
          </div>
        </div>
      </section>

      {/* Platform Compatibility Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
              Accessible partout, sur tous vos appareils
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Consultez depuis votre ordinateur, tablette ou smartphone. 
              Notre technologie s'adapte automatiquement à votre appareil.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {platformFeatures.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div key={index} className="text-center group">
                  <div className="w-16 h-16 bg-gradient-to-br from-sky-100 to-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                    <Icon className="h-8 w-8 text-sky-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">{feature.title}</h3>
                  <p className="text-sm text-gray-600">{feature.description}</p>
                </div>
              );
            })}
          </div>

          {/* Device Mockups */}
          <div className="mt-16 flex justify-center items-end space-x-8">
            <div className="hidden lg:block">
              <div className="w-32 h-20 bg-gray-800 rounded-lg flex items-center justify-center">
                <Monitor className="h-8 w-8 text-gray-400" />
              </div>
              <p className="text-center text-sm text-gray-600 mt-2">Ordinateur</p>
            </div>
            <div className="hidden md:block">
              <div className="w-24 h-32 bg-gray-800 rounded-xl flex items-center justify-center">
                <Tablet className="h-8 w-8 text-gray-400" />
              </div>
              <p className="text-center text-sm text-gray-600 mt-2">Tablette</p>
            </div>
            <div>
              <div className="w-16 h-28 bg-gray-800 rounded-2xl flex items-center justify-center">
                <Smartphone className="h-6 w-6 text-gray-400" />
              </div>
              <p className="text-center text-sm text-gray-600 mt-2">Smartphone</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Tout ce dont vous avez besoin pour votre santé
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Une suite complète d'outils médicaux conçus pour simplifier vos soins 
              et améliorer votre suivi de santé.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div 
                  key={index} 
                  className="group p-8 bg-white border border-gray-200 rounded-2xl hover:shadow-xl transition-all duration-300 hover:-translate-y-2 hover:border-sky-200"
                >
                  <div className={`w-16 h-16 ${feature.color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                    <Icon className="h-8 w-8" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {feature.description}
                  </p>
                  <div className="mt-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    <ArrowRight className="h-5 w-5 text-sky-500" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 bg-gradient-to-br from-sky-50 to-emerald-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              3 étapes pour consulter votre médecin
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Simple, rapide et sécurisé. Consultez un médecin en moins de 5 minutes.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: '01',
                title: 'Créez votre compte',
                description: 'Inscription gratuite en 2 minutes. Vos données médicales sont immédiatement sécurisées.',
                icon: UserCheck,
                color: 'from-sky-400 to-sky-600'
              },
              {
                step: '02',
                title: 'Réservez votre consultation',
                description: 'Choisissez votre médecin, votre créneau et le type de consultation qui vous convient.',
                icon: Stethoscope,
                color: 'from-emerald-400 to-emerald-600'
              },
              {
                step: '03',
                title: 'Consultez et recevez votre ordonnance',
                description: 'Consultation vidéo HD sécurisée. Ordonnance électronique envoyée instantanément.',
                icon: Video,
                color: 'from-purple-400 to-purple-600'
              }
            ].map((step, index) => {
              const Icon = step.icon;
              return (
                <div key={index} className="relative text-center group">
                  <div className={`w-20 h-20 bg-gradient-to-br ${step.color} rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg`}>
                    <Icon className="h-10 w-10 text-white" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-white border-2 border-gray-200 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                    <span className="text-sm font-bold text-gray-700">{step.step}</span>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">
                    {step.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {step.description}
                  </p>
                  
                  {/* Connector line */}
                  {index < 2 && (
                    <div className="hidden md:block absolute top-10 left-full w-full h-0.5 bg-gradient-to-r from-sky-300 to-emerald-300 transform translate-x-4"></div>
                  )}
                </div>
              );
            })}
          </div>
          
          {/* Call to Action */}
          <div className="text-center mt-16">
            <button 
              onClick={() => handleGetStarted('patient')}
              className="bg-gradient-to-r from-sky-500 to-emerald-500 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:shadow-lg transition-all transform hover:-translate-y-1"
            >
              Commencer ma première consultation
            </button>
            <p className="text-sm text-gray-500 mt-3">
              Gratuit • Sans engagement • Remboursé par votre mutuelle
            </p>
          </div>
        </div>
      </section>

      {/* User Types Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Conçu pour tous les professionnels de santé
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Une interface adaptée à chaque utilisateur avec des fonctionnalités 
              spécialisées pour optimiser votre expérience.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                role: 'patient' as const,
                icon: Heart,
                title: 'Patients',
                description: 'Interface intuitive pour consulter, gérer vos ordonnances et suivre votre santé au quotidien.',
                features: [
                  'Consultations vidéo HD',
                  'Dossier médical numérique',
                  'Rappels de médicaments',
                  'Messagerie sécurisée',
                  'Prise de rendez-vous 24h/7j'
                ],
                cta: 'Créer mon compte patient',
                gradient: 'from-sky-500 to-sky-600'
              },
              {
                role: 'doctor' as const,
                icon: Stethoscope,
                title: 'Médecins',
                description: 'Outils professionnels avancés pour exercer la télémédecine dans les meilleures conditions.',
                features: [
                  'Interface de consultation avancée',
                  'Gestion des patients',
                  'Prescription électronique',
                  'Planning intelligent',
                  'Statistiques détaillées'
                ],
                cta: 'Rejoindre comme médecin',
                gradient: 'from-emerald-500 to-emerald-600'
              },
              {
                role: 'secretary' as const,
                icon: UserCheck,
                title: 'Secrétaires médicales',
                description: 'Simplifiez la gestion administrative et optimisez l\'organisation du cabinet médical.',
                features: [
                  'Gestion des rendez-vous',
                  'Suivi des patients',
                  'Communication centralisée',
                  'Rapports automatisés',
                  'Interface multi-médecins'
                ],
                cta: 'Rejoindre l\'équipe',
                gradient: 'from-purple-500 to-purple-600'
              }
            ].map((userType, index) => {
              const Icon = userType.icon;
              return (
                <div 
                  key={index}
                  className="group bg-white border border-gray-200 rounded-2xl p-8 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 hover:border-sky-200"
                >
                  <div className={`w-16 h-16 bg-gradient-to-br ${userType.gradient} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                    <Icon className="h-8 w-8 text-white" />
                  </div>
                  
                  <h3 className="text-2xl font-semibold text-gray-900 mb-4">
                    {userType.title}
                  </h3>
                  
                  <p className="text-gray-600 mb-6 leading-relaxed">
                    {userType.description}
                  </p>
                  
                  <ul className="space-y-3 mb-8">
                    {userType.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center space-x-3">
                        <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                        <span className="text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  
                  <button 
                    onClick={() => handleGetStarted(userType.role)}
                    className={`w-full bg-gradient-to-r ${userType.gradient} text-white py-3 px-6 rounded-xl font-semibold hover:shadow-lg transition-all group-hover:scale-105`}
                  >
                    {userType.cta}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Ils nous font confiance
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Découvrez pourquoi des milliers d'utilisateurs choisissent Docteurs O.I 
              pour leurs soins médicaux en ligne.
            </p>
          </div>

          <div className="relative">
            <div className="bg-white rounded-3xl shadow-xl p-8 lg:p-12 border border-gray-100">
              <div className="text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-sky-400 to-emerald-400 rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="text-white font-bold text-2xl">
                    {testimonials[activeTestimonial].avatar}
                  </span>
                </div>
                
                <div className="flex justify-center mb-4">
                  {Array.from({ length: testimonials[activeTestimonial].rating }).map((_, i) => (
                    <Star key={i} className="h-6 w-6 text-yellow-400 fill-current" />
                  ))}
                </div>
                
                <blockquote className="text-xl lg:text-2xl text-gray-700 mb-6 leading-relaxed italic">
                  "{testimonials[activeTestimonial].content}"
                </blockquote>
                
                <div className="text-center">
                  <div className="font-semibold text-gray-900 text-lg">
                    {testimonials[activeTestimonial].name}
                  </div>
                  <div className="text-gray-600">
                    {testimonials[activeTestimonial].role}
                  </div>
                </div>
              </div>
            </div>

            {/* Testimonial Navigation */}
            <div className="flex justify-center mt-8 space-x-2">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setActiveTestimonial(index)}
                  className={`w-3 h-3 rounded-full transition-all ${
                    activeTestimonial === index 
                      ? 'bg-sky-500 scale-125' 
                      : 'bg-gray-300 hover:bg-gray-400'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Questions fréquentes
            </h2>
            <p className="text-xl text-gray-600">
              Tout ce que vous devez savoir sur la téléconsultation
            </p>
          </div>

          <div className="space-y-4">
            {faqData.map((faq, index) => (
              <div key={index} className="border border-gray-200 rounded-xl overflow-hidden">
                <button
                  onClick={() => setActiveFAQ(activeFAQ === index ? null : index)}
                  className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
                >
                  <span className="font-semibold text-gray-900">{faq.question}</span>
                  <ChevronDown className={`h-5 w-5 text-gray-500 transition-transform ${
                    activeFAQ === index ? 'rotate-180' : ''
                  }`} />
                </button>
                {activeFAQ === index && (
                  <div className="px-6 pb-4">
                    <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Tarifs simples et transparents
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Aucun abonnement. Payez uniquement vos consultations. 
              Remboursement possible selon votre mutuelle.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              {
                name: 'Médecine générale',
                price: '50',
                description: 'Consultation avec un médecin généraliste',
                features: [
                  'Consultation vidéo 30 min',
                  'Ordonnance électronique',
                  'Dossier médical',
                  'Suivi post-consultation',
                  'Messagerie sécurisée'
                ],
                popular: true
              },
              {
                name: 'Spécialistes',
                price: '80',
                description: 'Consultation avec un médecin spécialiste',
                features: [
                  'Consultation vidéo 45 min',
                  'Expertise spécialisée',
                  'Ordonnance électronique',
                  'Rapport détaillé',
                  'Suivi personnalisé',
                  'Accès prioritaire'
                ],
                popular: false
              },
              {
                name: 'Urgences',
                price: '120',
                description: 'Consultation d\'urgence disponible 24h/7j',
                features: [
                  'Disponibilité immédiate',
                  'Médecin d\'urgence',
                  'Consultation prioritaire',
                  'Orientation si nécessaire',
                  'Support 24h/7j'
                ],
                popular: false
              }
            ].map((plan, index) => (
              <div 
                key={index}
                className={`relative bg-white border-2 rounded-2xl p-8 transition-all hover:shadow-xl ${
                  plan.popular 
                    ? 'border-sky-500 shadow-lg scale-105' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-gradient-to-r from-sky-500 to-emerald-500 text-white px-4 py-2 rounded-full text-sm font-semibold">
                      Le plus populaire
                    </span>
                  </div>
                )}
                
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-semibold text-gray-900 mb-2">
                    {plan.name}
                  </h3>
                  <p className="text-gray-600 mb-4">
                    {plan.description}
                  </p>
                  <div className="flex items-baseline justify-center">
                    <span className="text-5xl font-bold text-gray-900">{plan.price}</span>
                    <span className="text-xl text-gray-600 ml-1">€</span>
                  </div>
                  <p className="text-gray-500 mt-2">par consultation</p>
                </div>
                
                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center space-x-3">
                      <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <button 
                  onClick={() => handleGetStarted('patient')}
                  className={`w-full py-3 px-6 rounded-xl font-semibold transition-all ${
                    plan.popular
                      ? 'bg-gradient-to-r from-sky-500 to-emerald-500 text-white hover:shadow-lg'
                      : 'border-2 border-gray-300 text-gray-700 hover:border-gray-400 hover:bg-gray-50'
                  }`}
                >
                  Commencer maintenant
                </button>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <p className="text-gray-600 mb-4">
              💡 <strong>Bon à savoir :</strong> La plupart des mutuelles remboursent les téléconsultations
            </p>
            <div className="flex items-center justify-center space-x-6 text-sm text-gray-500">
              <div className="flex items-center space-x-2">
                <Shield className="h-4 w-4 text-green-500" />
                <span>Paiement sécurisé</span>
              </div>
              <div className="flex items-center space-x-2">
                <Lock className="h-4 w-4 text-blue-500" />
                <span>Données protégées</span>
              </div>
              <div className="flex items-center space-x-2">
                <Zap className="h-4 w-4 text-purple-500" />
                <span>Confirmation immédiate</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-sky-500 to-emerald-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
            Votre santé mérite le meilleur
          </h2>
          <p className="text-xl text-sky-100 mb-8 max-w-3xl mx-auto">
            Rejoignez plus de 75 000 patients qui ont choisi la téléconsultation 
            pour des soins de qualité, accessibles et sécurisés.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              onClick={() => handleGetStarted('patient')}
              className="bg-white text-sky-600 px-8 py-4 rounded-xl font-semibold text-lg hover:bg-gray-50 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1 flex items-center justify-center space-x-2"
            >
              <Video className="h-5 w-5" />
              <span>Ma première consultation</span>
            </button>
            <button 
              onClick={handleLogin}
              className="border-2 border-white text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-white hover:text-sky-600 transition-all"
            >
              J'ai déjà un compte
            </button>
          </div>

          <div className="mt-12 grid grid-cols-1 sm:grid-cols-4 gap-8 text-center">
            <div className="text-sky-100">
              <div className="text-2xl font-bold text-white mb-2">2 min</div>
              <div>pour créer votre compte</div>
            </div>
            <div className="text-sky-100">
              <div className="text-2xl font-bold text-white mb-2">0€</div>
              <div>d'inscription</div>
            </div>
            <div className="text-sky-100">
              <div className="text-2xl font-bold text-white mb-2">5 min</div>
              <div>pour votre première consultation</div>
            </div>
            <div className="text-sky-100">
              <div className="text-2xl font-bold text-white mb-2">24h/7j</div>
              <div>médecins disponibles</div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Company Info */}
            <div className="md:col-span-2">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-sky-500 to-emerald-500 rounded-xl flex items-center justify-center">
                  <span className="text-white font-bold text-lg">D</span>
                </div>
                <span className="text-2xl font-bold">Docteurs O.I</span>
              </div>
              <p className="text-gray-400 mb-6 leading-relaxed">
                La première plateforme française de téléconsultation médicale. 
                Sécurisée, certifiée HDS et conforme RGPD pour votre tranquillité d'esprit.
              </p>
              <div className="flex space-x-4">
                <div className="flex items-center space-x-2 text-sm text-gray-400">
                  <Shield className="h-4 w-4 text-green-400" />
                  <span>Certifié HDS</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-400">
                  <Lock className="h-4 w-4 text-blue-400" />
                  <span>Conforme RGPD</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-400">
                  <Globe className="h-4 w-4 text-purple-400" />
                  <span>Hébergé en France</span>
                </div>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="text-lg font-semibold mb-6">Liens rapides</h3>
              <ul className="space-y-3">
                <li><a href="#features" className="text-gray-400 hover:text-white transition-colors">Fonctionnalités</a></li>
                <li><a href="#how-it-works" className="text-gray-400 hover:text-white transition-colors">Comment ça marche</a></li>
                <li><a href="#pricing" className="text-gray-400 hover:text-white transition-colors">Tarifs</a></li>
                <li><button onClick={handleLogin} className="text-gray-400 hover:text-white transition-colors">Se connecter</button></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Support</a></li>
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h3 className="text-lg font-semibold mb-6">Légal</h3>
              <ul className="space-y-3">
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Mentions légales</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Politique de confidentialité</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">CGU</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">RGPD</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">
              © 2025 Docteurs O.I. Tous droits réservés.
            </p>
            <div className="flex items-center space-x-6 mt-4 md:mt-0">
              <span className="text-gray-400 text-sm">🇫🇷 Hébergé en France</span>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-gray-400 text-sm">Tous systèmes opérationnels</span>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};