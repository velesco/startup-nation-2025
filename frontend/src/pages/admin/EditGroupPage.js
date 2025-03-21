import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  ChevronLeft, 
  Save, 
  Calendar, 
  User, 
  Users,
  Info,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import DashboardLayout from '../../components/layouts/DashboardLayout';
import LoadingScreen from '../../components/client/LoadingScreen';

const EditGroupPage = () => {
  const { groupId } = useParams();
  const navigate = useNavigate();
  const { currentUser, isAuthenticated } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [group, setGroup] = useState(null);
  const [instructors, setInstructors] = useState([]);
  const [error, setError] = useState(null);
  
  // Form data state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    startDate: '',
    endDate: '',
    capacity: 25,
    status: 'Planned',
    instructor: ''
  });
  
  // Verificăm dacă utilizatorul este autentificat și are rolul potrivit
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    } else if (currentUser && currentUser.role !== 'admin' && currentUser.role !== 'partner') {
      navigate('/');
    }
  }, [isAuthenticated, currentUser, navigate]);
  
  // Fetch instructors
  const fetchInstructors = useCallback(async () => {
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
    } catch (err) {
      console.error('Error fetching instructors:', err);
    }
  }, []);
  
  // Fetch group data
  const fetchGroupData = useCallback(async () => {
    try {
    setLoading(true);
    const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5003/api';
    
    console.log('Loading group details for editing, ID:', groupId);
    
    // Try both endpoints
    let response;
    try {
          response = await axios.get(`${API_URL}/admin/groups/${groupId}`, {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`
            }
          });
        } catch (firstError) {
          console.log('First endpoint failed when loading group for edit, trying alternate endpoint...');
          response = await axios.get(`${API_URL}/groups/${groupId}`, {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`
            }
          });
        }
      
      if (response.data && response.data.success) {
        const groupData = response.data.data;
        setGroup(groupData);
        
        // Set form data
        setFormData({
          name: groupData.name || '',
          description: groupData.description || '',
          startDate: groupData.startDate ? new Date(groupData.startDate).toISOString().split('T')[0] : '',
          endDate: groupData.endDate ? new Date(groupData.endDate).toISOString().split('T')[0] : '',
          capacity: groupData.capacity || 25,
          status: groupData.status || 'Planned',
          instructor: groupData.instructor?._id || groupData.instructor || ''
        });
      } else {
        throw new Error(response.data?.message || 'Failed to load group data');
      }
    } catch (err) {
      console.error('Error loading group data:', err);
      setError('Nu s-au putut încărca datele grupei. Vă rugăm să încercați din nou.');
    } finally {
      setLoading(false);
    }
  }, [groupId]);
  
  // Load data on initial render
  useEffect(() => {
    if (isAuthenticated && currentUser && groupId) {
      fetchGroupData();
      fetchInstructors();
    }
  }, [isAuthenticated, currentUser, groupId, fetchGroupData, fetchInstructors]);
  
  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  // Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setSaving(true);
      const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5003/api';
      
      console.log('Updating group with ID:', groupId, 'Data:', formData);
      
      // Try both endpoints
      let response;
      try {
        response = await axios.put(
          `${API_URL}/admin/groups/${groupId}`,
          formData,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`,
              'Content-Type': 'application/json'
            }
          }
        );
      } catch (firstError) {
        console.log('First update endpoint failed, trying alternate endpoint...');
        response = await axios.put(
          `${API_URL}/groups/${groupId}`,
          formData,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`,
              'Content-Type': 'application/json'
            }
          }
        );
      }
      
      if (response.data && response.data.success) {
        // Navigate back to the group detail page
        navigate(`/admin/groups/${groupId}`);
      } else {
        throw new Error(response.data?.message || 'Failed to update group');
      }
    } catch (err) {
      console.error('Error updating group:', err);
      setError(err.response?.data?.message || 'Nu s-a putut actualiza grupa. Vă rugăm să încercați din nou.');
      window.scrollTo(0, 0);
    } finally {
      setSaving(false);
    }
  };
  
  if (loading) {
    return <LoadingScreen />;
  }
  
  if (!group) {
    return (
      <DashboardLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-10">
            <h2 className="text-2xl font-semibold text-gray-700">Grupa nu a fost găsită</h2>
            <button 
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg flex items-center mx-auto"
              onClick={() => navigate('/admin/groups')}
            >
              <ChevronLeft className="h-5 w-5 mr-1" />
              Înapoi la grupe
            </button>
          </div>
        </div>
      </DashboardLayout>
    );
  }
  
  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-6 flex items-center">
          <button 
            className="mr-4 text-gray-600 hover:text-gray-900"
            onClick={() => navigate(`/admin/groups/${groupId}`)}
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
          <h1 className="text-2xl font-bold text-gray-800">Editare grupă: {group.name}</h1>
        </div>
        
        {/* Error message */}
        {error && (
          <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <AlertCircle className="h-5 w-5 text-red-500" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}
        
        {/* Edit form */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <form onSubmit={handleSubmit}>
            <div className="p-6">
              <div className="space-y-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                    Nume grupă<span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                    Descriere
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    rows={4}
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Introduceți o descriere pentru această grupă (opțional)"
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">
                      Data de început<span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Calendar className="h-5 w-5 text-gray-400" />
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
                    <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-1">
                      Data de sfârșit
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Calendar className="h-5 w-5 text-gray-400" />
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
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="capacity" className="block text-sm font-medium text-gray-700 mb-1">
                      Capacitate
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Users className="h-5 w-5 text-gray-400" />
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
                    <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                      Status
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Info className="h-5 w-5 text-gray-400" />
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
                  <label htmlFor="instructor" className="block text-sm font-medium text-gray-700 mb-1">
                    Instructor
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User className="h-5 w-5 text-gray-400" />
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
            
            <div className="bg-gray-50 px-6 py-4 flex justify-end space-x-3">
              <button
                type="button"
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                onClick={() => navigate(`/admin/groups/${groupId}`)}
                disabled={saving}
              >
                Anulează
              </button>
              <button
                type="submit"
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 flex items-center"
                disabled={saving}
              >
                {saving ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Salvare...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Salvează grupa
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default EditGroupPage;