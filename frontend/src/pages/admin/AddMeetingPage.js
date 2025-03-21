import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Save, 
  ChevronLeft,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import DashboardLayout from '../../components/layouts/DashboardLayout';
import LoadingScreen from '../../components/client/LoadingScreen';

const AddMeetingPage = () => {
  const { groupId } = useParams();
  const navigate = useNavigate();
  const { currentUser, isAuthenticated } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [group, setGroup] = useState(null);
  const [error, setError] = useState(null);
  
  // Form state
  const [formData, setFormData] = useState({
    title: '',
    date: '',
    time: '10:00',
    duration: 120,
    location: 'Online',
    locationDetails: {
      address: '',
      city: '',
      meetingUrl: '',
      meetingId: '',
      meetingPassword: ''
    },
    description: '',
    agenda: '',
    status: 'Planned',
    recurring: false,
    recurringPattern: {
      frequency: 'Weekly',
      interval: 1,
      endDate: ''
    }
  });
  
  // Verificăm dacă utilizatorul este autentificat și are rolul potrivit
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    } else if (currentUser && currentUser.role !== 'admin' && currentUser.role !== 'partner') {
      navigate('/');
    }
  }, [isAuthenticated, currentUser, navigate]);
  
  // Încărcarea datelor grupei
  useEffect(() => {
    const fetchGroupData = async () => {
      try {
        setLoading(true);
        const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5003/api';
        
        const response = await axios.get(`${API_URL}/groups/${groupId}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        
        if (response.data && response.data.success) {
          setGroup(response.data.data);
          
          // Inițializăm data cu ziua curentă
          const today = new Date();
          const formattedDate = today.toISOString().split('T')[0];
          setFormData(prev => ({
            ...prev,
            date: formattedDate
          }));
        } else {
          throw new Error(response.data?.message || 'Failed to load group data');
        }
      } catch (err) {
        console.error('Error loading group data:', err);
        setError('Nu s-au putut încărca datele grupei. Vă rugăm să încercați din nou.');
      } finally {
        setLoading(false);
      }
    };
    
    if (isAuthenticated && currentUser && groupId) {
      fetchGroupData();
    }
  }, [isAuthenticated, currentUser, groupId]);
  
  // Handler pentru schimbări în formular
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name.includes('.')) {
      // Handle nested fields (like locationDetails.address)
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else if (type === 'checkbox') {
      setFormData(prev => ({
        ...prev,
        [name]: checked
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };
  
  // Handler pentru schimbări în pattern-ul recurent
  const handleRecurringChange = (e) => {
    const { name, value } = e.target;
    
    setFormData(prev => ({
      ...prev,
      recurringPattern: {
        ...prev.recurringPattern,
        [name]: value
      }
    }));
  };
  
  // Salvarea întâlnirii
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validare date formular
    if (!formData.title || !formData.date || !formData.time) {
      setError('Completați toate câmpurile obligatorii');
      return;
    }
    
    try {
      setSaving(true);
      const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5003/api';
      
      // Combine date and time for API
      const dateTime = new Date(`${formData.date}T${formData.time}`);
      
      // Prepare data for API
      const meetingData = {
        title: formData.title,
        group: groupId,
        date: dateTime.toISOString(),
        duration: parseInt(formData.duration),
        location: formData.location,
        locationDetails: formData.location === 'Online' ? {
          meetingUrl: formData.locationDetails.meetingUrl,
          meetingId: formData.locationDetails.meetingId,
          meetingPassword: formData.locationDetails.meetingPassword
        } : {
          address: formData.locationDetails.address,
          city: formData.locationDetails.city
        },
        description: formData.description,
        agenda: formData.agenda,
        status: formData.status,
        organizer: currentUser.id,
        recurring: formData.recurring
      };
      
      // Add recurring pattern if meeting is recurring
      if (formData.recurring) {
        meetingData.recurringPattern = {
          frequency: formData.recurringPattern.frequency,
          interval: parseInt(formData.recurringPattern.interval),
          endDate: formData.recurringPattern.endDate ? new Date(formData.recurringPattern.endDate).toISOString() : null
        };
      }
      
      const response = await axios.post(
        `${API_URL}/meetings`,
        meetingData,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        }
      );
      
      if (response.data && response.data.success) {
        // Redirecționăm către pagina de detalii a grupei
        navigate(`/admin/groups/${groupId}`, { 
          state: { success: 'Întâlnire adăugată cu succes!' } 
        });
      } else {
        throw new Error(response.data?.message || 'Failed to create meeting');
      }
    } catch (err) {
      console.error('Error creating meeting:', err);
      setError(err.response?.data?.message || 'Nu s-a putut crea întâlnirea. Vă rugăm să încercați din nou.');
      setSaving(false);
    }
  };
  
  if (loading && !group) {
    return <LoadingScreen />;
  }
  
  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center">
            <button
              className="mr-4 text-gray-600 hover:text-gray-900"
              onClick={() => navigate(`/admin/groups/${groupId}`)}
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
            <h1 className="text-2xl font-bold text-gray-800">Adaugă întâlnire nouă</h1>
          </div>
          <div className="mt-1 text-sm text-gray-500">
            Grupa: {group?.name || 'Loading...'}
          </div>
        </div>
        
        {/* Error Message */}
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
        
        {/* Form */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Informații de bază */}
              <div className="md:col-span-2">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">Informații de bază</h2>
                
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="title">
                    Titlu întâlnire <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Ex: Introducere în antreprenoriat"
                    required
                  />
                </div>
              </div>
              
              {/* Date și oră */}
              <div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="date">
                    Data <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Calendar className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="date"
                      id="date"
                      name="date"
                      value={formData.date}
                      onChange={handleChange}
                      className="w-full pl-10 px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                </div>
                
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="time">
                    Ora <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Clock className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="time"
                      id="time"
                      name="time"
                      value={formData.time}
                      onChange={handleChange}
                      className="w-full pl-10 px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                </div>
              </div>
              
              {/* Durată și status */}
              <div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="duration">
                    Durată (minute)
                  </label>
                  <select
                    id="duration"
                    name="duration"
                    value={formData.duration}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="30">30 minute</option>
                    <option value="60">1 oră</option>
                    <option value="90">1 oră și 30 minute</option>
                    <option value="120">2 ore</option>
                    <option value="180">3 ore</option>
                    <option value="240">4 ore</option>
                  </select>
                </div>
                
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="status">
                    Status
                  </label>
                  <select
                    id="status"
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="Planned">Planificată</option>
                    <option value="InProgress">În desfășurare</option>
                    <option value="Completed">Finalizată</option>
                    <option value="Cancelled">Anulată</option>
                  </select>
                </div>
              </div>
              
              {/* Locație */}
              <div className="md:col-span-2">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">Locație</h2>
                
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tip locație
                  </label>
                  <div className="flex space-x-4">
                    <label className="inline-flex items-center">
                      <input
                        type="radio"
                        name="location"
                        value="Online"
                        checked={formData.location === 'Online'}
                        onChange={handleChange}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                      />
                      <span className="ml-2 text-sm text-gray-700">Online</span>
                    </label>
                    <label className="inline-flex items-center">
                      <input
                        type="radio"
                        name="location"
                        value="Fizic"
                        checked={formData.location === 'Fizic'}
                        onChange={handleChange}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                      />
                      <span className="ml-2 text-sm text-gray-700">Fizic</span>
                    </label>
                  </div>
                </div>
                
                {formData.location === 'Online' ? (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="meetingUrl">
                        Link întâlnire
                      </label>
                      <input
                        type="url"
                        id="meetingUrl"
                        name="locationDetails.meetingUrl"
                        value={formData.locationDetails.meetingUrl}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Ex: https://zoom.us/j/123456789"
                      />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="meetingId">
                          ID întâlnire
                        </label>
                        <input
                          type="text"
                          id="meetingId"
                          name="locationDetails.meetingId"
                          value={formData.locationDetails.meetingId}
                          onChange={handleChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Ex: 123 456 7890"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="meetingPassword">
                          Parolă
                        </label>
                        <input
                          type="text"
                          id="meetingPassword"
                          name="locationDetails.meetingPassword"
                          value={formData.locationDetails.meetingPassword}
                          onChange={handleChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Ex: abc123"
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="address">
                        Adresă
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <MapPin className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          type="text"
                          id="address"
                          name="locationDetails.address"
                          value={formData.locationDetails.address}
                          onChange={handleChange}
                          className="w-full pl-10 px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Ex: Calea Victoriei nr. 1"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="city">
                        Oraș
                      </label>
                      <input
                        type="text"
                        id="city"
                        name="locationDetails.city"
                        value={formData.locationDetails.city}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Ex: București"
                      />
                    </div>
                  </div>
                )}
              </div>
              
              {/* Descriere și agendă */}
              <div className="md:col-span-2">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">Detalii întâlnire</h2>
                
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="description">
                    Descriere
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows="3"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Descrieți pe scurt întâlnirea..."
                  ></textarea>
                </div>
                
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="agenda">
                    Agendă
                  </label>
                  <textarea
                    id="agenda"
                    name="agenda"
                    value={formData.agenda}
                    onChange={handleChange}
                    rows="4"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Detaliați agenda întâlnirii..."
                  ></textarea>
                </div>
              </div>
              
              {/* Recurring options */}
              <div className="md:col-span-2">
                <div className="flex items-center mb-4">
                  <input
                    type="checkbox"
                    id="recurring"
                    name="recurring"
                    checked={formData.recurring}
                    onChange={handleChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="recurring" className="ml-2 block text-sm text-gray-700">
                    Întâlnire recurentă
                  </label>
                </div>
                
                {formData.recurring && (
                  <div className="pl-6 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="frequency">
                          Frecvență
                        </label>
                        <select
                          id="frequency"
                          name="frequency"
                          value={formData.recurringPattern.frequency}
                          onChange={handleRecurringChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="Daily">Zilnic</option>
                          <option value="Weekly">Săptămânal</option>
                          <option value="Biweekly">La două săptămâni</option>
                          <option value="Monthly">Lunar</option>
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="interval">
                          Interval
                        </label>
                        <input
                          type="number"
                          id="interval"
                          name="interval"
                          min="1"
                          value={formData.recurringPattern.interval}
                          onChange={handleRecurringChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="endDate">
                        Dată de încheiere
                      </label>
                      <input
                        type="date"
                        id="endDate"
                        name="endDate"
                        value={formData.recurringPattern.endDate}
                        onChange={handleRecurringChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            {/* Butoane de acțiune */}
            <div className="mt-8 flex justify-end space-x-3">
              <button
                type="button"
                className="px-4 py-2 bg-white border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                onClick={() => navigate(`/admin/groups/${groupId}`)}
              >
                Anulează
              </button>
              
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 flex items-center"
                disabled={saving}
              >
                {saving ? (
                  <>
                    <span className="mr-2">Se salvează...</span>
                    <div className="animate-spin h-4 w-4 border-2 border-white border-opacity-50 border-t-transparent rounded-full"></div>
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Salvează întâlnire
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

export default AddMeetingPage;