import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  Users, 
  Calendar, 
  Info, 
  Edit2, 
  Mail, 
  ChevronLeft,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import DashboardLayout from '../../components/layouts/DashboardLayout';
import LoadingScreen from '../../components/client/LoadingScreen';

// Import componente pentru tab-uri
import GeneralInfoTab from '../../components/admin/group/GeneralInfoTab';
import MeetingsTab from '../../components/admin/group/MeetingsTab';
import ParticipantsTab from '../../components/admin/group/ParticipantsTab';
import EmailModal from '../../components/admin/group/EmailModal';

const GroupDetailPage = () => {
  const { groupId } = useParams();
  const navigate = useNavigate();
  const { currentUser, isAuthenticated } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [group, setGroup] = useState(null);
  const [meetings, setMeetings] = useState([]);
  const [participants, setParticipants] = useState([]);
  const [availableParticipants, setAvailableParticipants] = useState([]);
  const [activeTab, setActiveTab] = useState('general');
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  
  // State pentru email
  const [emailModal, setEmailModal] = useState(false);
  const [selectedParticipants, setSelectedParticipants] = useState([]);
  
  // Verificăm dacă utilizatorul este autentificat și are rolul potrivit
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    } else if (currentUser && currentUser.role !== 'admin' && currentUser.role !== 'partner') {
      navigate('/');
    }
  }, [isAuthenticated, currentUser, navigate]);
  
  // Încărcarea datelor grupei
  const fetchGroupData = useCallback(async () => {
    try {
      setLoading(true);
      const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5003/api';
      
      console.log('Fetching group data for ID:', groupId);

      // Use a fallback approach to try both API endpoints
      let response;
      try {
        response = await axios.get(`${API_URL}/admin/groups/${groupId}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        });
      } catch (firstError) {
        console.log('First endpoint failed, trying alternate endpoint...');
        response = await axios.get(`${API_URL}/groups/${groupId}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        });
      }
      
      console.log('Group data response:', response.data);
      
      if (response.data && response.data.success) {
        setGroup(response.data.data);
        setMeetings(response.data.data.meetings || []);
      } else {
        throw new Error(response.data?.message || 'Failed to load group data');
      }
    } catch (err) {
      console.error('Error loading group data:', err);
      console.error('Error response:', err.response?.data);
      setError('Nu s-au putut încărca datele grupei. Vă rugăm să încercați din nou.');
    } finally {
      setLoading(false);
    }
  }, [groupId]);
  
  // Încărcarea participanților
  const fetchParticipants = useCallback(async () => {
    try {
      const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5003/api';
      
      // Try both endpoints for consistency
      let response;
      try {
        response = await axios.get(`${API_URL}/admin/groups/${groupId}/participants`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        });
      } catch (firstError) {
        console.log('First participants endpoint failed, trying alternate endpoint...');
        response = await axios.get(`${API_URL}/groups/${groupId}/participants`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        });
      }
      
      if (response.data && response.data.success) {
        setParticipants(response.data.data || []);
      } else {
        throw new Error(response.data?.message || 'Failed to load participants');
      }
    } catch (err) {
      console.error('Error loading participants:', err);
      setError('Nu s-au putut încărca participanții. Vă rugăm să încercați din nou.');
    }
  }, [groupId]);
  
  // Încărcarea clienților disponibili pentru a fi adăugați în grupă
  const fetchAvailableParticipants = useCallback(async () => {
    try {
      const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5003/api';
      
      const response = await axios.get(`${API_URL}/admin/clients?notInGroup=${groupId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.data && response.data.success) {
        setAvailableParticipants(response.data.data || []);
      } else {
        throw new Error(response.data?.message || 'Failed to load available clients');
      }
    } catch (err) {
      console.error('Error loading available clients:', err);
    }
  }, [groupId]);
  
  // Încărcarea datelor la inițializare
  useEffect(() => {
    if (isAuthenticated && currentUser && groupId) {
      fetchGroupData();
      
      if (activeTab === 'participants') {
        fetchParticipants();
        fetchAvailableParticipants();
      }
    }
  }, [isAuthenticated, currentUser, groupId, fetchGroupData, activeTab, fetchParticipants, fetchAvailableParticipants]);
  
  // Încărcarea participanților când se schimbă tab-ul
  useEffect(() => {
    if (activeTab === 'participants' && isAuthenticated && currentUser) {
      fetchParticipants();
      fetchAvailableParticipants();
    }
  }, [activeTab, fetchParticipants, fetchAvailableParticipants, isAuthenticated, currentUser]);
  
  // Formatare dată pentru afișare
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const options = { day: '2-digit', month: '2-digit', year: 'numeric' };
    return new Date(dateString).toLocaleDateString('ro-RO', options);
  };
  
  // Handler pentru trimiterea de email
  const handleSendEmail = async (emailData) => {
    try {
      const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5003/api';
      
      const response = await axios.post(
        `${API_URL}/admin/groups/${groupId}/send-email`,
        emailData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      
      if (response.data && response.data.success) {
        setSuccess('Email trimis cu succes!');
        setEmailModal(false);
        // Resetăm mesajul de succes după 3 secunde
        setTimeout(() => setSuccess(null), 3000);
        return true;
      } else {
        throw new Error(response.data?.message || 'Failed to send email');
      }
    } catch (err) {
      console.error('Error sending email:', err);
      setError(err.response?.data?.message || 'Nu s-a putut trimite emailul. Vă rugăm să încercați din nou.');
      // Resetăm mesajul de eroare după 3 secunde
      setTimeout(() => setError(null), 3000);
      return false;
    }
  };
  
  if (loading && !group) {
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
        {/* Header cu informații de bază și navigare */}
        <div className="mb-6 flex flex-wrap justify-between items-center">
          <div>
            <div className="flex items-center">
              <button 
                className="mr-4 text-gray-600 hover:text-gray-900"
                onClick={() => navigate('/admin/groups')}
              >
                <ChevronLeft className="h-6 w-6" />
              </button>
              <h1 className="text-2xl font-bold text-gray-800">{group.name}</h1>
              <span className={`ml-3 text-xs px-2 py-1 rounded-full ${
                group.status === 'Active' ? 'bg-green-100 text-green-700' :
                group.status === 'Completed' ? 'bg-blue-100 text-blue-700' :
                group.status === 'Cancelled' ? 'bg-red-100 text-red-700' :
                'bg-purple-100 text-purple-700'
              }`}>
                {group.status}
              </span>
            </div>
            <div className="mt-1 text-sm text-gray-500">
              {formatDate(group.startDate)} - {formatDate(group.endDate)}
            </div>
          </div>
          
          {/* Acțiuni rapide */}
          <div className="flex space-x-2 mt-3 sm:mt-0">
            <button 
              className="px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg flex items-center"
              onClick={() => {
                setSelectedParticipants([]);
                setEmailModal(true);
              }}
            >
              <Mail className="h-4 w-4 mr-2" />
              Email participanți
            </button>
            <button 
              className="px-4 py-2 bg-gray-800 text-white rounded-lg flex items-center"
              onClick={() => navigate(`/admin/groups/${groupId}/edit`)}
            >
              <Edit2 className="h-4 w-4 mr-2" />
              Editează
            </button>
          </div>
        </div>
        
        {/* Alerte de succes/eroare */}
        {success && (
          <div className="mb-4 bg-green-50 border-l-4 border-green-500 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <CheckCircle className="h-5 w-5 text-green-500" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-green-700">{success}</p>
              </div>
            </div>
          </div>
        )}
        
        {error && (
          <div className="mb-4 bg-red-50 border-l-4 border-red-500 p-4">
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
        
        {/* Tab-uri pentru navigare */}
        <div className="mb-6 border-b">
          <nav className="flex space-x-8" aria-label="Tabs">
            <button
              onClick={() => setActiveTab('general')}
              className={`px-1 py-4 text-sm font-medium border-b-2 ${
                activeTab === 'general'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center">
                <Info className="h-5 w-5 mr-2" />
                Informații generale
              </div>
            </button>
            
            <button
              onClick={() => setActiveTab('meetings')}
              className={`px-1 py-4 text-sm font-medium border-b-2 ${
                activeTab === 'meetings'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center">
                <Calendar className="h-5 w-5 mr-2" />
                Întâlniri
                {meetings.length > 0 && (
                  <span className="ml-2 bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                    {meetings.length}
                  </span>
                )}
              </div>
            </button>
            
            <button
              onClick={() => setActiveTab('participants')}
              className={`px-1 py-4 text-sm font-medium border-b-2 ${
                activeTab === 'participants'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center">
                <Users className="h-5 w-5 mr-2" />
                Participanți
                {participants.length > 0 && (
                  <span className="ml-2 bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                    {participants.length}
                  </span>
                )}
              </div>
            </button>
          </nav>
        </div>
        
        {/* Conținut tab-uri */}
        {activeTab === 'general' && (
          <GeneralInfoTab 
            group={group} 
            participants={participants} 
            formatDate={formatDate} 
          />
        )}
        
        {activeTab === 'meetings' && (
          <MeetingsTab 
            groupId={groupId} 
            meetings={meetings} 
            onMeetingsUpdated={fetchGroupData}
            setError={setError}
            setSuccess={setSuccess}
          />
        )}
        
        {activeTab === 'participants' && (
          <ParticipantsTab 
            groupId={groupId}
            participants={participants}
            availableParticipants={availableParticipants}
            onParticipantsUpdated={() => {
              fetchParticipants();
              fetchAvailableParticipants();
            }}
            setError={setError}
            setSuccess={setSuccess}
          />
        )}
        
        {/* Modal pentru trimitere email */}
        {emailModal && (
          <EmailModal 
            isOpen={emailModal}
            onClose={() => setEmailModal(false)}
            participants={participants}
            initialSelectedParticipants={selectedParticipants}
            onSendEmail={handleSendEmail}
          />
        )}
      </div>
    </DashboardLayout>
  );
};

export default GroupDetailPage;