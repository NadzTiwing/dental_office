export interface UserRegistration {
  name: string;
  email: string;
  phone: string;
  password: string;
}

// dentists datatype

export interface DentistWithAvailability {
  name: string;
  dayOfWeek: string[];
  startTime: string;
  endTime: string;
}