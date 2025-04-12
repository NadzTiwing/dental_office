import { 
  LoginResponse, 
  RegisterData, 
  RegisterResponse,
  UpdateUserData,
  AppointmentData,
  RescheduleAppointmentData,
  CancelAppointmentData,
  DentistData,
  AddDentistData,
  ApiResponse
} from './types';

const API_URL = 'http://localhost:5000/api';

// Auth functions
export const login = async (email: string, password: string): Promise<LoginResponse> => {
  try {
    const response = await fetch(`${API_URL}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Login failed');
    }

    return data;
  } catch (error) {
    console.error('Login API error:', error);
    throw error;
  }
};

export const register = async (userData: RegisterData): Promise<RegisterResponse> => {
  try {
    const response = await fetch(`${API_URL}/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(userData),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Registration failed');
    }

    return data;
  } catch (error) {
    console.error('Registration API error:', error);
    throw error;
  }
};

// User functions
export const updateUser = async (userId: number, userData: UpdateUserData): Promise<ApiResponse> => {
  try {
    const response = await fetch(`${API_URL}/update-user/${userId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(userData),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Update failed');
    }

    return data;
  } catch (error) {
    console.error('Update user API error:', error);
    throw error;
  }
};

// Appointment functions
export const addAppointment = async (appointmentData: AppointmentData): Promise<ApiResponse> => {
  try {
    const response = await fetch(`${API_URL}/add-appointment`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(appointmentData),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to add appointment');
    }

    return data;
  } catch (error) {
    console.error('Add appointment API error:', error);
    throw error;
  }
};

export const rescheduleAppointment = async (appointmentData: RescheduleAppointmentData): Promise<ApiResponse> => {
  try {
    const response = await fetch(`${API_URL}/reschedule-appointment`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(appointmentData),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to reschedule appointment');
    }

    return data;
  } catch (error) {
    console.error('Reschedule appointment API error:', error);
    throw error;
  }
};

export const cancelAppointment = async (appointmentData: CancelAppointmentData): Promise<ApiResponse> => {
  try {
    const response = await fetch(`${API_URL}/cancel-appointment`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(appointmentData),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to cancel appointment');
    }

    return data;
  } catch (error) {
    console.error('Cancel appointment API error:', error);
    throw error;
  }
};

export const getUserAppointments = async (userId: number): Promise<ApiResponse> => {
  try {
    const response = await fetch(`${API_URL}/user-appointments/${userId}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch user appointments');
    }

    return data;
  } catch (error) {
    console.error('Get user appointments API error:', error);
    throw error;
  }
};

export const getAllAppointments = async (): Promise<ApiResponse> => {
  try {
    const response = await fetch(`${API_URL}/all-appointments`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch all appointments');
    }

    return data;
  } catch (error) {
    console.error('Get all appointments API error:', error);
    throw error;
  }
};



// Dentist functions
export const getAllDentists = async (): Promise<DentistData[]> => {
  try {
    const response = await fetch(`${API_URL}/dentists`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch dentists');
    }

    return data.data;
  } catch (error) {
    console.error('Get dentists API error:', error);
    throw error;
  }
};

export const addDentist = async (dentistData: AddDentistData): Promise<ApiResponse> => {
  try {
    const response = await fetch(`${API_URL}/add-dentist`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(dentistData),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to add dentist');
    }

    return data;
  } catch (error) {
    console.error('Add dentist API error:', error);
    throw error;
  }
};

export const deleteDentist = async (dentistId: number): Promise<ApiResponse> => {
  try {
    const response = await fetch(`${API_URL}/delete-dentist/${dentistId}`, {
      method: 'DELETE',
      headers: {
        'Accept': 'application/json',
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to delete dentist');
    }

    return data;
  } catch (error) {
    console.error('Delete dentist API error:', error);
    throw error;
  }
}; 

export type { LoginResponse };
