import { useState, useEffect } from "react";
import Calendar from "./Calendar";
import { getAllDentists } from "../services/api";
import { DentistData, AppointmentData, PatientAppointmentsData } from "../services/types";
import { useAuthStore } from "../stores/authStore";
import { useAppointmentStore } from "../stores/appointmentStore";

export default function BookingModal({ 
  show, 
  onClose,
  previousAppointment
}: { 
  show: boolean, 
  onClose: () => void,
  previousAppointment?: PatientAppointmentsData
}) {
  if (!show) return null;
  
  const user = useAuthStore((state) => state.user)
  const { id } = user?.data || {}
  const rescheduleAppointment = useAppointmentStore((state) => state.rescheduleAppointment)
  const addAppointment = useAppointmentStore((state) => state.addAppointment)
  const { allAppointments } = useAppointmentStore()

  const [selectedDentist, setSelectedDentist] = useState(previousAppointment?.dentistId.toString() || '')
  const [selectedDate, setSelectedDate] = useState('')
  const [selectedTime, setSelectedTime] = useState('')
  const [dentists, setDentists] = useState<DentistData[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [availableTimes, setAvailableTimes] = useState<string[]>([])

  useEffect(() => {
    const fetchDentists = async () => {
      setIsLoading(true)
      setError(null)
      try {
        const dentistsData = await getAllDentists()
        setDentists(dentistsData)
      } catch (err) {
        setError('Failed to load dentists. Please try again.')
        console.error('Error fetching dentists:', err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchDentists()
  }, [])

  const handleDateSelect = (date: string) => {
    const selectedDate = new Date(date);
    selectedDate.setDate(selectedDate.getDate() + 1); // Add one day for accuracy
    const adjustedDate = selectedDate.toISOString().split('T')[0];
    setSelectedDate(adjustedDate)
    setSelectedTime('') // Reset time when date changes
    updateAvailableTimes(adjustedDate)
  }

  const updateAvailableTimes = (date: string) => {
    if (!selectedDentist || !date) {
      setAvailableTimes([])
      return
    }

    const dentist = dentists.find(d => d.id.toString() === selectedDentist)
    if (!dentist) {
      setAvailableTimes([])
      return
    }

    const selectedDate = new Date(date)
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
    const dayOfWeek = dayNames[selectedDate.getDay()]
    const availability = dentist.availability.find(avail => avail.dayOfWeek === dayOfWeek)
    if (!availability) {
      setAvailableTimes([])
      return
    }

    const [startHour, startMinute] = availability.startTime.split(':').map(Number)
    const [endHour, endMinute] = availability.endTime.split(':').map(Number)

    const times: string[] = []
    
    // Calculate total minutes for start and end times
    const startTimeInMinutes = (startHour * 60) + startMinute
    const endTimeInMinutes = (endHour * 60) + endMinute

    // Get existing appointments for the selected date and dentist
    const existingAppointments = allAppointments.filter(appointment => {
      const appointmentDate = new Date(appointment.appointmentDatetime)
      return (
        appointmentDate.toDateString() === selectedDate.toDateString() &&
        appointment.dentistId.toString() === selectedDentist &&
        appointment.status !== 'cancelled'
      )
    })

    // Generate times in hourly intervals, excluding the last hour
    for (let mins = startTimeInMinutes; mins < endTimeInMinutes - 60; mins += 60) {
      const hour = Math.floor(mins / 60)
      const minute = mins % 60
      
      // Check if this time slot is already booked
      const isBooked = existingAppointments.some(appointment => {
        const appointmentHour = new Date(appointment.appointmentDatetime).getHours()
        return appointmentHour === hour
      })

      if (!isBooked) {
        const period = hour >= 12 ? 'PM' : 'AM'
        const displayHour = hour > 12 ? hour - 12 : (hour === 0 ? 12 : hour)
        times.push(`${displayHour}:${minute.toString().padStart(2, '0')} ${period}`)
      }
    }
    setAvailableTimes(times)
  }

  const handleDentistChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedDentist(e.target.value)
    setSelectedDate('')
    setSelectedTime('')
    setAvailableTimes([])
  }

  const handleBook = async () => {
    if (!selectedDentist || !selectedDate || !selectedTime) {
      setError('Please select a dentist, date and time')
      return
    }

    if (!id) {
      setError('You must be logged in to book an appointment')
      return
    }

    if (previousAppointment) {
      const confirmed = window.confirm('Are you sure you want to reschedule this appointment?')
      if (!confirmed) return
    }
    
    setIsLoading(true)
   
    try {
      // Convert time to 24-hour format
      const [time, period] = selectedTime.split(' ')
      let [hours, minutes] = time.split(':').map(Number)
      if (period === 'PM' && hours !== 12) hours += 12
      if (period === 'AM' && hours === 12) hours = 0
      
      const appointmentDatetime = `${selectedDate}T${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:00`

      if (previousAppointment) {
        await rescheduleAppointment(previousAppointment.id, appointmentDatetime)
      } else {
        const appointmentData: AppointmentData = {
          patientId: id,
          dentistId: parseInt(selectedDentist),
          appointmentDatetime
        }
        await addAppointment(appointmentData)
      }
      
      onClose()
    } catch (err) {
      setError('Failed to book appointment. Please try again.')
      console.error('Error booking appointment:', err)
      setError(err as string)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center overflow-y-auto">
      <div className="bg-white p-6 rounded-lg w-full max-w-md">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          {previousAppointment ? 'Reschedule Appointment' : 'Book New Appointment'}
        </h3>
        
        <div className="space-y-4">
          {error && (
            <div className="text-red-500 text-sm">{error}</div>
          )}
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Select Dentist</label>
            <select
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              value={selectedDentist}
              onChange={handleDentistChange}
              disabled={isLoading || !!previousAppointment}
            >
              <option value="">Choose a dentist</option>
              {dentists.map(dentist => (
                <option key={dentist.id} value={dentist.id}>
                  {dentist.name}
                </option>
              ))}
            </select>
          </div>

          <Calendar 
            selectedDentist={selectedDentist}
            dentists={dentists}
            onDateSelect={handleDateSelect}
          />

          <div>
            <label className="block text-sm font-medium text-gray-700">Select Time</label>
            <select
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              value={selectedTime}
              onChange={(e) => setSelectedTime(e.target.value)}
              disabled={!selectedDentist || !selectedDate || availableTimes.length === 0}
            >
              <option value="">Choose a time</option>
              {availableTimes.map(time => (
                <option key={time} value={time}>
                  {time}
                </option>
              ))}
            </select>
          </div>

          <div className="flex justify-end space-x-3">
            <button
              onClick={onClose}
              className="bg-gray-200 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-300"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              onClick={handleBook}
              className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
              disabled={!selectedDentist || !selectedDate || !selectedTime || isLoading}
            >
              {isLoading ? 'Processing...' : previousAppointment ? 'Reschedule Appointment' : 'Book Appointment'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
