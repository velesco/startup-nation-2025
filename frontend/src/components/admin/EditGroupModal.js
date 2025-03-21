import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  X, 
  Calendar, 
  User, 
  Users,
  Info,
  Edit2
} from 'lucide-react';

const EditGroupModal = ({ isOpen, onClose, group, onGroupUpdated }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    startDate: '',
    endDate: '',
    capacity: 25,
    status: 'Planned',
    instructor: ''
  });
  const [instructors, setInstructors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Load group data when modal opens
  useEffect(() => {
    if (isOpen && group) {
      setFormData({
        name: group.name || '',
        description: group.description || '',
        startDate: group.startDate ? new Date(group.startDate).toISOString().split('T')[0] : '',
        endDate: group.endDate ? new Date(group.endDate).toISOString().split('T')[0] : '',
        capacity: group.capacity || 25,
        status: group.status || 'Planned',
        instructor: group.instructor?._id || group.instructor || ''
      });
      
      fetchInstructors();
    }
  }, [isOpen, group]);
  
  // Fetch instructors (partners and admins)
  const fetchInstructors = async () => {
    try {
      const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5003/api';
      
      const response = await axios.get(`${API_URL}/admin/users?role=partner,admin`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.data && response.data.success) {
        setInstructors(response.data.data || []);
      }
    } catch (error) {
      console.error('Error fetching instructors:', error);
    }
  };
  
  // Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    if (!formData.name.trim()) {
      setError('Numele grupei este obligatoriu');
      return;
    }
    
    if (!formData.startDate) {
      setError('Data de început este obligatorie');
      return;
    }
    
    try {
      setLoading(true);
      setError('');
      
      const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5003/api';
      
      const response = await axios.put(
        `${API_URL}/groups/${group._id}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      if (response.data && response.data.success) {
        // Call the onGroupUpdated callback
        onGroupUpdated(response.data.data);
        
        // Close modal
        onClose();
      } else {
        throw new Error(response.data?.message || 'Failed to update group');
      }
    } catch (error) {
      console.error('Error updating group:', error);
      setError(error.response?.data?.message || 'Nu s-a putut actualiza grupa. Vă rugăm să încercați din nou.');
    } finally {
      setLoading(false);
    }
  };
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity">
          <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
        </div>
        
        <span className="hidden sm:inline-block sm:align-middle sm:h-screen"></span>&#8203;
        
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <form onSubmit={handleSubmit}>
            <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
              <div className="sm:flex sm:items-start">
                <div className="w-full">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg leading-6 font-medium text-gray-900 flex items-center">
                      <Edit2 className="h-5 w-5 mr-2 text-blue-600" />
                      Editează grupa
                    </h3>
                    <button
                      type="button"
                      onClick={onClose}
                      className="text-gray-400 hover:text-gray-500 focus:outline-none"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                  
                  {/* Error message */}
                  {error && (
                    <div className="mb-4 bg-red-50 border-l-4 border-red-500 p-4">
                      <div className="flex">
                        <div className="flex-shrink-0">
                          <X className="h-5 w-5 text-red-500" />
                        </div>
                        <div className="ml-3">
                          <p className="text-sm text-red-700">{error}</p>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* Form fields */}
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                        Nume grupă<span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        className="mt-1 p-2 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="Introduceți numele grupei"
                        required
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                        Descriere
                      </label>
                      <textarea
                        id="description"
                        name="description"
                        rows={3}
                        className="mt-1 p-2 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        value={formData.description}
                        onChange={handleChange}
                        placeholder="Descrieți grupa (opțional)"
                      />
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="startDate" className="block text-sm font-medium text-gray-700">
                          Data de început<span className="text-red-500">*</span>
                        </label>
                        <div className="mt-1 relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Calendar className="h-4 w-4 text-gray-400" />
                          </div>
                          <input
                            type="date"
                            id="startDate"
                            name="startDate"
                            className="pl-10 p-2 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            value={formData.startDate}
                            onChange={handleChange}
                            required
                          />
                        </div>
                      </div>
                      
                      <div>
                        <label htmlFor="endDate" className="block text-sm font-medium text-gray-700">
                          Data de sfârșit
                        </label>
                        <div className="mt-1 relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Calendar className="h-4 w-4 text-gray-400" />
                          </div>
                          <input
                            type="date"
                            id="endDate"
                            name="endDate"
                            className="pl-10 p-2 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            value={formData.endDate}
                            onChange={handleChange}
                          />
                        </div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="capacity" className="block text-sm font-medium text-gray-700">
                          Capacitate
                        </label>
                        <div className="mt-1 relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Users className="h-4 w-4 text-gray-400" />
                          </div>
                          <input
                            type="number"
                            id="capacity"
                            name="capacity"
                            min="1"
                            max="1000"
                            className="pl-10 p-2 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            value={formData.capacity}
                            onChange={handleChange}
                          />
                        </div>
                      </div>
                      
                      <div>
                        <label htmlFor="status" className="block text-sm font-medium text-gray-700">
                          Status
                        </label>
                        <div className="mt-1 relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Info className="h-4 w-4 text-gray-400" />
                          </div>
                          <select
                            id="status"
                            name="status"
                            className="pl-10 p-2 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            value={formData.status}
                            onChange={handleChange}
                          >
                            <option value="Planned">Planificată</option>
                            <option value="Active">Activă</option>
                            <option value="Completed">Finalizată</option>
                            <option value="Cancelled">Anulată</option>
                          </select>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <label htmlFor="instructor" className="block text-sm font-medium text-gray-700">
                        Instructor
                      </label>
                      <div className="mt-1 relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <User className="h-4 w-4 text-gray-400" />
                        </div>
                        <select
                          id="instructor"
                          name="instructor"
                          className="pl-10 p-2 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          value={formData.instructor}
                          onChange={handleChange}
                        >
                          <option value="">Selectați instructor</option>
                          {instructors.map((instructor) => (
                            <option key={instructor._id} value={instructor._id}>
                              {instructor.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
              <button
                type="submit"
                className={`w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm ${
                  loading ? 'opacity-50 cursor-not-allowed' : ''
                }`}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Se actualizează...
                  </>
                ) : (
                  <>
                    <Edit2 className="h-4 w-4 mr-2" />
                    Salvează modificările
                  </>
                )}
              </button>
              <button
                type="button"
                className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                onClick={onClose}
                disabled={loading}
              >
                Anulează
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditGroupModal;