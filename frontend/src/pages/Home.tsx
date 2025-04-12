import { Link } from 'react-router-dom'
import { useState } from 'react'
import PatientDetails from '../components/PatientDetails'
import BookedAppointments from '../components/BookedAppointments'
import BookingModal from '../components/BookingModal'

export default function Home() {
  const [showBooking, setShowBooking] = useState(false)
  
  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-gray-800">Dental Office</h1>
            </div>
            <div className="flex items-center">
              <Link
                to="/login"
                className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
              >
                Logout
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="bg-white shadow rounded-lg divide-y divide-gray-200">
            {/* Personal Details Section */}
            <PatientDetails />

            {/* Appointments Section */}
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-800">Upcoming Appointments</h2>
                <button
                  onClick={() => setShowBooking(true)}
                  className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
                >
                  Book New Appointment
                </button>
              </div>
              
              <BookedAppointments />
            </div>

            {/* Booking Modal */}
            {showBooking && (
              <BookingModal show={showBooking} onClose={() => setShowBooking(false)}/>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
