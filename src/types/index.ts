export interface User {
  uid: string;
  email: string;
  role: 'admin' | 'receptionist' | 'doctor' | 'nurse' | 'patient';
  displayName?: string;
  department?: string;
  createdAt: Date;
}

export interface Patient {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  phone: string;
  email: string;
  address: string;
  emergencyContact: {
    name: string;
    phone: string;
    relationship: string;
  };
  medicalHistory: string[];
  allergies: string[];
  insurance?: {
    provider: string;
    policyNumber: string;
  };
  createdAt: Date;
}

export interface Appointment {
  id: string;
  patientId: string;
  doctorId: string;
  department: string;
  appointmentDate: Date;
  timeSlot: string;
  status: 'scheduled' | 'checked-in' | 'in-consultation' | 'completed' | 'cancelled';
  qrCode?: string;
  symptoms?: string;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  createdAt: Date;
}

export interface QueueItem {
  id: string;
  appointmentId: string;
  patientId: string;
  patientName: string;
  department: string;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  estimatedTime: number;
  status: 'waiting' | 'in-consultation' | 'completed';
  checkedInAt: Date;
  position: number;
}

export interface Department {
  id: string;
  name: string;
  code: string;
  color: string;
  icon: string;
}