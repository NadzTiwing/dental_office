import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { addDentist, deleteDentist, getAllDentists } from '../services/api'
import { DentistData, AddDentistData } from '../services/types'

export default function Admin() {
  const navigate = useNavigate()
  const [dentists, setDentists] = useState<DentistData[]>([])
  const [formData, setFormData] = useState<AddDentistData>({
    name: '',
    dayOfWeek: [],
    startTime: '',
    endTime: ''
  })
  const [editingId, setEditingId] = useState<number | null>(null)

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

  useEffect(() => {
    const fetchDentists = async () => {
      try {
        const dentists = await getAllDentists()
        setDentists(dentists)
      } catch (error) {
        alert('Error fetching dentists: ' + (error instanceof Error ? error.message : 'Unknown error'))
      }
    }
    fetchDentists()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validate start time is before end time
    const startTimeDate = new Date(`1970-01-01T${formData.startTime}`)
    const endTimeDate = new Date(`1970-01-01T${formData.endTime}`)
    
    if (startTimeDate >= endTimeDate) {
      alert('End time must be later than start time')
      return
    }

    try {
      if (editingId !== null) {
        // Update existing dentist
        setDentists(dentists.map(dentist => 
          dentist.id === editingId ? 
          { ...dentist, name: formData.name } : 
          dentist
        ))
        setEditingId(null)
      } else {
        // Add new dentist
        const response = await addDentist(formData)

        if (response.status === 'success') {
          const newDentist: DentistData = {
            id: response.data.id,
            name: formData.name,
            availability: formData.dayOfWeek.map(day => ({
              dayOfWeek: day,
              startTime: formData.startTime,
              endTime: formData.endTime
            }))
          }
          setDentists([...dentists, newDentist])
          alert('Dentist added successfully')
        } else {
          alert(response.message || 'Failed to add dentist')
        }
      }
      // Reset form
      setFormData({
        name: '',
        dayOfWeek: [],
        startTime: '',
        endTime: ''
      })
    } catch (error) {
      alert('Error adding dentist: ' + (error instanceof Error ? error.message : 'Unknown error'))
    }
  }

  const handleDayChange = (day: string) => {
    setFormData(prev => ({
      ...prev,
      dayOfWeek: prev.dayOfWeek.includes(day) 
        ? prev.dayOfWeek.filter(d => d !== day)
        : [...prev.dayOfWeek, day]
    }))
  }

  const handleDelete = async (id: number) => {
    try {
      const response = await deleteDentist(id)
      if (response.status === 'success') {
        setDentists(dentists.filter(dentist => dentist.id !== id))
        alert('Dentist deleted successfully')
      } else {
        alert(response.message || 'Failed to delete dentist')
      }
    } catch (error) {
      alert('Error deleting dentist: ' + (error instanceof Error ? error.message : 'Unknown error'))
    }
  }

  const handleLogout = () => {
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-gray-100 py-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dentist Management</h1>
          <button
            onClick={handleLogout}
            className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600"
          >
            Logout
          </button>
        </div>
        
        {/* Add/Edit Form */}
        <div className="bg-white shadow rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">
            {editingId !== null ? 'Edit Dentist' : 'Add New Dentist'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Available Days</label>
              <div className="mt-2 space-x-2">
                {daysOfWeek.map(day => (
                  <label key={day} className="inline-flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.dayOfWeek.includes(day)}
                      onChange={() => handleDayChange(day)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2">{day}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Start Time</label>
                <input
                  type="time"
                  value={formData.startTime}
                  onChange={(e) => setFormData(prev => ({ ...prev, startTime: e.target.value }))}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">End Time</label>
                <input
                  type="time"
                  value={formData.endTime}
                  onChange={(e) => setFormData(prev => ({ ...prev, endTime: e.target.value }))}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
            >
              {editingId !== null ? 'Update Dentist' : 'Add Dentist'}
            </button>
          </form>
        </div>

        {/* Dentists List */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Available Days</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hours</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {dentists.map(dentist => (
                <tr key={dentist.id}>
                  <td className="px-6 py-4 whitespace-nowrap">{dentist.name}</td>
                  <td className="px-6 py-4">
                    {dentist.availability.map(avail => avail.dayOfWeek).join(', ')}
                  </td>
                  <td className="px-6 py-4">
                    {dentist.availability[0] && `${dentist.availability[0].startTime} - ${dentist.availability[0].endTime}`}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => handleDelete(dentist.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
