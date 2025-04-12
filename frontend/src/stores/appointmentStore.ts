import { create } from 'zustand'
import { PatientAppointmentsData, AppointmentData, AllAppointmentsData } from '../services/types'
import { getUserAppointments, cancelAppointment, rescheduleAppointment, addAppointment, getAllAppointments } from '../services/api'

interface AppointmentState {
  appointments: PatientAppointmentsData[]
  allAppointments: AllAppointmentsData[]
  isLoading: boolean
  error: string | null
  fetchAppointments: (userId: number) => Promise<void>
  fetchAllAppointments: () => Promise<void>
  cancelAppointment: (appointmentId: number) => Promise<void>
  rescheduleAppointment: (appointmentId: number, newDatetime: string) => Promise<void>
  addAppointment: (appointmentData: AppointmentData) => Promise<void>
}

export const useAppointmentStore = create<AppointmentState>((set) => ({
  appointments: [],
  allAppointments: [],
  isLoading: false,
  error: null,

  fetchAppointments: async (userId: number) => {
    set({ isLoading: true, error: null })
    try {
      const response = await getUserAppointments(userId)
      const { data } = response
      set({ appointments: data })
    } catch (err) {
      set({ error: 'Failed to load appointments' })
      console.error('Error fetching appointments:', err)
    } finally {
      set({ isLoading: false })
    }
  },

  fetchAllAppointments: async () => {
    set({ isLoading: true, error: null })
    try {
      const response = await getAllAppointments()
      const { data } = response
      set({ allAppointments: data })
    } catch (err) {
      set({ error: 'Failed to load all appointments' })
      console.error('Error fetching all appointments:', err)
    } finally {
      set({ isLoading: false })
    }
  },

  cancelAppointment: async (appointmentId: number) => {
    try {
      await cancelAppointment({ appointmentId })
      set((state) => ({
        appointments: state.appointments.map(appointment => 
          appointment.id === appointmentId 
            ? { ...appointment, status: 'cancelled' }
            : appointment
        ),
        allAppointments: state.allAppointments.map(appointment =>
          appointment.id === appointmentId
            ? { ...appointment, status: 'cancelled' }
            : appointment
        )
      }))
    } catch (err) {
      set({ error: 'Failed to cancel appointment' })
      console.error('Error cancelling appointment:', err)
    }
  },

  rescheduleAppointment: async (appointmentId: number, newDatetime: string) => {
    try {
      await rescheduleAppointment({ appointmentId, newAppointmentDatetime: newDatetime })
      set((state) => ({
        appointments: state.appointments.map(appointment => 
          appointment.id === appointmentId 
            ? { ...appointment, appointmentDatetime: newDatetime, status: 'rescheduled' }
            : appointment
        ),
        allAppointments: state.allAppointments.map(appointment =>
          appointment.id === appointmentId
            ? { ...appointment, appointmentDatetime: newDatetime, status: 'rescheduled' }
            : appointment
        )
      }))
    } catch (err) {
      set({ error: 'Failed to reschedule appointment' })
      console.error('Error rescheduling appointment:', err)
    }
  },

  addAppointment: async (appointmentData: AppointmentData) => {
    try {
      const response = await addAppointment(appointmentData)
      set((state) => {
        // Ensure we have a valid date string before creating Date object
        let appointmentDatetime = response.data.appointment_datetime;
        try {
          // Only try to format if not already in ISO format
          if (!appointmentDatetime.includes('T')) {
            appointmentDatetime = new Date(appointmentDatetime).toISOString();
          }
        } catch (err) {
          console.error('Error formatting date:', err);
          // Keep original format if conversion fails
        }

        const newAppointment = {
          ...response.data,
          appointmentDatetime
        }
        return {
          appointments: [...state.appointments, newAppointment].sort((a, b) =>
            new Date(a.appointmentDatetime).getTime() - new Date(b.appointmentDatetime).getTime()
          ),
          allAppointments: [...state.allAppointments, newAppointment].sort((a, b) =>
            new Date(a.appointmentDatetime).getTime() - new Date(b.appointmentDatetime).getTime()
          )
        }
      })
    } catch (err) {
      set({ error: 'Failed to add appointment' })
      console.error('Error adding appointment:', err)
    }
  }
}))