import { useState, useEffect } from 'react'
import BookingModal from './BookingModal'
import { useAuthStore } from '../stores/authStore'
import { useAppointmentStore } from '../stores/appointmentStore'
import { PatientAppointmentsData } from '../services/types'

export default function BookedAppointments() {
  const [showModal, setShowModal] = useState(false)
  const [selectedAppointment, setSelectedAppointment] = useState<PatientAppointmentsData | undefined>(undefined)
  
  const user = useAuthStore((state) => state.user)
  const { id } = user?.data || {}
  
  const { appointments, isLoading, error, fetchAppointments, cancelAppointment, fetchAllAppointments } = useAppointmentStore()

  useEffect(() => {
    if (id) {
      fetchAppointments(id)
      fetchAllAppointments()
    }
  }, [id, fetchAppointments, fetchAllAppointments])

  const handleReschedule = (id: number) => {
    const appointment = appointments.find(appointment => appointment.id === id)
    if (appointment) {
      setSelectedAppointment(appointment)
      setShowModal(true)
    }
  }

  const handleCancel = async (id: number) => {
    const isConfirmed = window.confirm('Are you sure you want to cancel this appointment?')
    if (!isConfirmed) return
    
    await cancelAppointment(id)
  }

  const handleCloseModal = () => {
    setShowModal(false)
  }

  if (isLoading) {
    return <div>Loading appointments...</div>
  }

  if (error) {
    return <div className="text-red-500">{error}</div>
  }

  return (
    <div className="space-y-4">
      {appointments.length === 0 ? (
        <div className="text-gray-500">No appointments found</div>
      ) : (
        appointments.map(appointment => (
          <div key={appointment.id} className="bg-gray-50 p-4 rounded-md">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-medium text-gray-800">
                  {new Date(appointment.appointmentDatetime).toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: 'numeric',
                    minute: 'numeric',
                    hour12: true
                  })}
                </p>
                <p className="font-sm text-gray-500">{appointment.dentist}</p>
                <p className={`text-sm font-bold ${
                  appointment.status === 'confirmed' ? 'text-green-500' :
                  appointment.status === 'rescheduled' ? 'text-orange-500' :
                  appointment.status === 'cancelled' ? 'text-red-500' :
                  'text-gray-500'
                }`}>
                  Status: {appointment.status}
                </p>
              </div>
              {appointment.status !== 'cancelled' && (
                <div className="space-x-2">
                  <button
                    onClick={() => handleReschedule(appointment.id)}
                    className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 text-sm"
                  >
                    Reschedule
                  </button>
                  <button 
                    onClick={() => handleCancel(appointment.id)}
                    className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 text-sm"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
          </div>
        ))
      )}
      <BookingModal 
        show={showModal}
        onClose={handleCloseModal}
        previousAppointment={selectedAppointment}
      />
    </div>
  )
}