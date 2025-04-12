export interface LoginResponse {
  status: string;
  data?: {
    id: number;
    name: string;
    email: string;
    phone?: string;
    is_admin: boolean;
  };
  isAdmin: boolean;
  message?: string;
}

export interface RegisterResponse {
  status: string;
  data?: {
    id: number;
    name: string;
    email: string;
    phone?: string;
    is_admin: boolean;
  };
  message?: string;
}

export interface RegisterData {
  name: string;
  email: string;
  phone?: string;
  password: string;
}

export interface UpdateUserData {
  name: string;
  email: string;
  phone?: string;
}

export interface AppointmentData {
  patientId: number;
  dentistId: number;
  appointmentDatetime: string;
}

export interface PatientAppointmentsData {
  id: number;
  appointmentDatetime: string;
  status: string;
  dentist: string;
  dentistId: number;
}

export interface AllAppointmentsData extends PatientAppointmentsData {
  patient: string;
  patientId: number;
}

export interface RescheduleAppointmentData {
  appointmentId: number;
  newAppointmentDatetime: string;
}

export interface CancelAppointmentData {
  appointmentId: number;
}

interface DentistAvailability {
  dayOfWeek: string;
  startTime: string;
  endTime: string;
}

export interface DentistData {
  id: number;
  name: string;
  availability: DentistAvailability[];
}

export interface AddDentistData {
  name: string;
  dayOfWeek: string[];
  startTime: string;
  endTime: string;
}

export interface ApiResponse {
  status: string;
  data?: any;
  message?: string;
}