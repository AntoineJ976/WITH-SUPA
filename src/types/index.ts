export interface User {
  id: string;
  email: string;
  role: 'patient' | 'doctor' | 'secretary';
  profile: PatientProfile | DoctorProfile | SecretaryProfile;
  rgpdConsent: RGPDConsent[];
  createdAt: string;
  updatedAt: string;
}

export interface PatientProfile {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  phoneNumber: string;
  address: Address;
  emergencyContact: EmergencyContact;
  medicalHistory: MedicalRecord[];
}

export interface DoctorProfile {
  firstName: string;
  lastName: string;
  speciality: string;
  licenseNumber: string;
  verified: boolean;
  experience: number;
  languages: string[];
  consultationFee: number;
  availableHours: AvailabilitySlot[];
}

export interface SecretaryProfile {
  firstName: string;
  lastName: string;
  speciality: string;
  licenseNumber: string;
  verified: boolean;
  experience: number;
  languages: string[];
  department: string;
  permissions: string[];
}

export interface Address {
  street: string;
  city: string;
  postalCode: string;
  country: string;
}

export interface EmergencyContact {
  name: string;
  relationship: string;
  phoneNumber: string;
}

export interface MedicalRecord {
  id: string;
  patientId: string;
  doctorId: string;
  consultationDate: string;
  diagnosis: string;
  prescriptions: Prescription[];
  notes: string;
  attachments: string[];
}

export interface Prescription {
  id: string;
  medication: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions: string;
}

export interface Consultation {
  id: string;
  patientId: string;
  doctorId: string;
  scheduledAt: string;
  status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled';
  type: 'video' | 'phone' | 'chat';
  duration: number;
  fee: number;
  notes: string;
  prescription?: Prescription[];
}

export interface AvailabilitySlot {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
}

export interface RGPDConsent {
  id: string;
  userId: string;
  consentType: 'data_processing' | 'marketing' | 'medical_records' | 'consultation_recording';
  granted: boolean;
  timestamp: string;
  ipAddress: string;
  version: string;
}

export interface Message {
  id: string;
  consultationId: string;
  senderId: string;
  content: string;
  timestamp: string;
  encrypted: boolean;
  read: boolean;
}

export interface Pharmacy {
  id: string;
  name: string;
  address: {
    street: string;
    city: string;
    postalCode: string;
    country: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
  };
  phone: string;
  email: string;
  licenseNumber: string;
  operatingHours: {
    [key: string]: {
      open?: string;
      close?: string;
      closed?: boolean;
    };
  };
  services: string[];
  verified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PrescriptionTransmission {
  id: string;
  prescriptionId: string;
  patientId: string;
  doctorId: string;
  pharmacyId?: string;
  transmissionType: 'patient' | 'pharmacy';
  status: 'pending' | 'sent' | 'delivered' | 'failed' | 'cancelled';
  sentAt: string;
  deliveredAt?: string;
  trackingNumber?: string;
  metadata: any;
  createdAt: string;
}

export interface PatientPreferredPharmacy {
  id: string;
  patientId: string;
  pharmacyId: string;
  isPrimary: boolean;
  createdAt: string;
}