import React, { useState } from 'react';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { PatientDashboard } from '../Dashboard/PatientDashboard';
import { DoctorDashboard } from '../Dashboard/DoctorDashboard';
import { SecretaryDashboard } from '../Dashboard/SecretaryDashboard';
import { ConsultationBooking } from '../Consultations/ConsultationBooking';
import { VideoConsultation } from '../Consultations/VideoConsultation';
import { SecretarySchedule } from '../Schedule/SecretarySchedule';
import { SecureMessaging } from '../Messages/SecureMessaging';
import { DoctorPrescriptionManager } from '../Prescriptions/DoctorPrescriptionManager';
import { PrescriptionManager } from '../Prescriptions/PrescriptionManager';
import { RGPDConsent } from '../RGPD/RGPDConsent';
import { MedicalRecords } from '../MedicalRecords/MedicalRecords';
import { SecretaryMedicalRecords } from '../MedicalRecords/SecretaryMedicalRecords';
import { DoctorSchedule } from '../Schedule/DoctorSchedule';
import { PatientManagement } from '../Patients/PatientManagement';
import { Settings } from '../Settings/Settings';
import { PaymentManagement } from '../Payments/PaymentManagement';
import { Prescription } from '../Prescription/VidalPrescription';
import { FirebaseDemo } from '../Demo/FirebaseDemo';
import { FirestoreArchitectureDemo } from '../Demo/FirestoreArchitectureDemo';
import { useAuth } from '../../contexts/AuthContext';

export const MainLayout: React.FC = () => {
  const [activeView, setActiveView] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user } = useAuth();

  const renderContent = () => {
    switch (activeView) {
      case 'dashboard':
        if (user?.role === 'doctor') {
          return <DoctorDashboard onViewChange={setActiveView} />;
        } else if (user?.role === 'secretary') {
          return <SecretaryDashboard onViewChange={setActiveView} />;
        } else {
          return <PatientDashboard onViewChange={setActiveView} />;
        }
      case 'consultations':
        // Restrict LAP access to doctors only - patients cannot access prescription assistance software
        if (user?.role !== 'doctor') {
          return <ConsultationBooking onViewChange={setActiveView} />;
        }
        return <Prescription onBack={() => setActiveView('dashboard')} />;
      case 'video-call':
        return <VideoConsultation onEndCall={() => setActiveView('dashboard')} />;
      case 'messages':
        return <SecureMessaging />;
      case 'records':
      case 'prescriptions':
        // Different prescription views for different roles
        if (user?.role === 'doctor') {
          return <DoctorPrescriptionManager />;
        } else {
          return <PrescriptionManager />;
        }
      case 'medical-records':
        // Different medical records view for secretaries vs patients
        if (user?.role === 'secretary') {
          return <SecretaryMedicalRecords />;
        } else {
          return <MedicalRecords />;
        }
      case 'schedule':
        if (user?.role === 'secretary') {
          return <SecretarySchedule />;
        } else {
          return <DoctorSchedule />;
        }
      case 'patients':
        // Allow both doctors and secretaries to manage patients
        if (user?.role === 'doctor' || user?.role === 'secretary') {
          return <PatientManagement />;
        } else {
          return <PatientDashboard onViewChange={setActiveView} />;
        }
      case 'rgpd':
        return <RGPDConsent />;
      case 'settings':
        return <Settings />;
      case 'payments':
        return <PaymentManagement />;
      case 'firebase-demo':
        return <FirebaseDemo />;
      case 'firestore-architecture':
        return <FirestoreArchitectureDemo />;
      default:
        return <PatientDashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <Sidebar 
        activeView={activeView} 
        onViewChange={setActiveView}
        isOpen={sidebarOpen}
      />

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-gray-600 bg-opacity-50 lg:hidden z-30"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col lg:ml-0">
        <Header 
          onMenuToggle={() => setSidebarOpen(!sidebarOpen)}
          showMenu={sidebarOpen}
        />
        <main className="flex-1 p-2 sm:p-4 lg:p-8 overflow-auto">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};