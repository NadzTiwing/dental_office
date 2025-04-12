import { useState } from 'react'
import { useAuthStore } from '../stores/authStore'
import { updateUser } from '../services/api'

interface UserData {
  id: number;
  name: string;
  email: string;
  phone?: string;
  is_admin: boolean;
}

export default function PatientDetails() {
  const user = useAuthStore((state) => state.user)
  const { name, email, phone } = user?.data || {}
  
  const [patient, setPatient] = useState({
    name: name || '',
    email: email || '',
    phone: phone || ''
  })
  
  const [isEditing, setIsEditing] = useState(false)
  const [editedDetails, setEditedDetails] = useState({
    name: '',
    email: '',
    phone: ''
  })

  const handleEdit = () => {
    setEditedDetails(patient)
    setIsEditing(true)
  }

  const handleSave = async () => {
    if (!user?.data?.id) return;
    
    try {
      const updatedUser = await updateUser(user.data.id, editedDetails)
      alert(updatedUser.message)
      setIsEditing(false)

      const { name, email, phone } = updatedUser.data as UserData
      setPatient({
        name: name,
        email: email,
        phone: phone || ''
      });
    } catch (error) {
      alert('Unable to update details, please try again')
      console.error('Error updating user:', error)  
    }
  }

  const handleCancel = () => {
    setIsEditing(false)
    setEditedDetails({
      name: '',
      email: '',
      phone: ''
    })
  }

  if (!user) {
    return (
      <div className="p-4 bg-white rounded-lg shadow">
        <p className="text-gray-600">Please login to view your details</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-800">Personal Details</h2>
        {!isEditing && (
          <button
            onClick={handleEdit}
            className="text-blue-500 hover:text-blue-600 text-sm font-medium"
          >
            Edit Details
          </button>
        )}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {isEditing ? (
          <>
            <div>
              <label className="text-sm font-medium text-gray-500">Name</label>
              <input
                type="text"
                value={editedDetails.name}
                onChange={(e) => setEditedDetails({...editedDetails, name: e.target.value})}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Email</label>
              <input
                type="email"
                value={editedDetails.email}
                onChange={(e) => setEditedDetails({...editedDetails, email: e.target.value})}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Phone</label>
              <input
                type="tel"
                value={editedDetails.phone}
                onChange={(e) => setEditedDetails({...editedDetails, phone: e.target.value})}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div className="md:col-span-3 flex justify-end space-x-3 mt-4">
              <button
                onClick={handleCancel}
                className="bg-gray-200 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
              >
                Save Changes
              </button>
            </div>
          </>
        ) : (
          <>
            <div>
              <p className="text-sm font-medium text-gray-500">Name</p>
              <p className="mt-1 text-sm text-gray-900">{patient.name}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Email</p>
              <p className="mt-1 text-sm text-gray-900">{patient.email}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Phone</p>
              <p className="mt-1 text-sm text-gray-900">{patient.phone}</p>
            </div>
          </>
        )}
      </div>
    </div>
  )
} 
