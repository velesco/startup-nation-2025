import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  ArrowLeft, 
  Save, 
  Upload, 
  Download, 
  Trash2, 
  FileText, 
  Mail, 
  Phone, 
  Calendar, 
  Shield, 
  Building, 
  Clock,
  User,
  Send,
  ExternalLink
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import DashboardLayout from '../../components/layouts/DashboardLayout';
import LoadingScreen from '../../components/client/LoadingScreen';
import UserDocumentsPanel from '../../components/users/UserDocumentsPanel';
import EditUserForm from '../../components/users/EditUserForm';
import SendEmailModal from '../../components/admin/SendEmailModal';

const UserDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [isSendingData, setIsSendingData] = useState(false);
  const [dataSentSuccess, setDataSentSuccess] = useState(false);

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const options = { day: '2-digit', month: '2-digit', year: 'numeric' };
    return new Date(dateString).toLocaleDateString('ro-RO', options);
  };

  // Fetch user data
  useEffect(() => {
    const fetchUser = async () => {
      setLoading(true);
      try {
        const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5003/api';
        const response = await axios.get(`${API_URL}/admin/users/${id}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        });

        if (response.data && response.data.success) {
          setUser(response.data.data);
        } else {
          throw new Error(response.data?.message || 'Failed to load user details');
        }
      } catch (err) {
        console.error('Error loading user details:', err);
        setError(err.response?.data?.message || err.message || 'Failed to load user details');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchUser();
    }
  }, [id]);

  // Handle form submission for user updates
  const handleUpdateUser = async (updatedData) => {
    try {
      setLoading(true);
      const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5003/api';
      
      const response = await axios.put(`${API_URL}/admin/users/${id}`, updatedData, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.data && response.data.success) {
        setUser(response.data.data);
        setIsEditing(false);
      } else {
        throw new Error(response.data?.message || 'Failed to update user');
      }
    } catch (err) {
      console.error('Error updating user:', err);
      setError(err.response?.data?.message || err.message || 'Failed to update user');
    } finally {
      setLoading(false);
    }
  };

  // Trimite datele utilizatorului către API-ul extern (Google Sheet)
  const sendUserDataToSheet = async () => {
    if (!user || !user._id) return;
    
    try {
      setIsSendingData(true);
      setError(null);
      const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5003/api';
      
      const response = await axios.post(`${API_URL}/admin/users/${user._id}/send-data`, {}, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.data && response.data.success) {
        // Actualizăm utilizatorul în stare
        setUser(prevUser => ({
          ...prevUser,
          dataSentToSheet: true,
          dataSentToSheetAt: new Date()
        }));
        
        setDataSentSuccess(true);
        
        // Resetare dupa 3 secunde
        setTimeout(() => {
          setDataSentSuccess(false);
        }, 3000);
      } else {
        throw new Error(response.data?.message || 'Failed to send user data');
      }
    } catch (err) {
      console.error('Error sending user data:', err);
      setError(err.response?.data?.message || err.message || 'Nu s-au putut trimite datele utilizatorului');
    } finally {
      setIsSendingData(false);
    }
  };

  if (loading && !user) {
    return <LoadingScreen />;
  }

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-6">
        {/* Header with back button */}
        <div className="flex items-center mb-6">
          <button
            onClick={() => navigate('/admin/users')}
            className="mr-4 p-2 rounded-full hover:bg-gray-100"
          >
            <ArrowLeft className="h-5 w-5 text-gray-600" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              {user ? user.name : 'Detalii utilizator'}
            </h1>
            <p className="text-gray-500">
              {user ? `${user.role} • ${user.email}` : 'Încărcare...'}
            </p>
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Succes message pentru trimiterea datelor */}
        {dataSentSuccess && (
          <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-green-500" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-green-700">Datele utilizatorului au fost trimise cu succes către Google Sheets!</p>
              </div>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="flex border-b border-gray-200 mb-6">
          <button
            className={`py-3 px-4 font-medium ${
              activeTab === 'profile'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('profile')}
          >
            <User className="h-5 w-5 inline-block mr-2" />
            Profil
          </button>
          <button
            className={`py-3 px-4 font-medium ${
              activeTab === 'documents'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('documents')}
          >
            <FileText className="h-5 w-5 inline-block mr-2" />
            Documente
          </button>
        </div>

        {/* Tab content */}
        {user && (
          <div className="glassmorphism p-6 rounded-xl shadow-md">
            {activeTab === 'profile' && (
              <div>
                {isEditing ? (
                  <EditUserForm 
                    user={user} 
                    onSubmit={handleUpdateUser} 
                    onCancel={() => setIsEditing(false)} 
                  />
                ) : (
                  <div>
                    <div className="flex justify-between items-center mb-6">
                      <h2 className="text-xl font-semibold text-gray-800">Detalii profil</h2>
                      <div className="flex space-x-2">
                        {currentUser && (currentUser.role === 'admin' || currentUser.role === 'super-admin') && (
                          <>
                            <button
                              onClick={sendUserDataToSheet}
                              disabled={isSendingData || user.dataSentToSheet}
                              className={`${
                                user.dataSentToSheet
                                  ? 'bg-gray-300 cursor-not-allowed'
                                  : 'bg-gradient-to-r from-indigo-500 to-blue-600 hover:opacity-90'
                              } text-white px-4 py-2 rounded-lg transition-colors flex items-center`}
                              title={user.dataSentToSheet ? 'Datele au fost deja trimise' : 'Trimite datele utilizatorului către Google Sheets'}
                            >
                              <ExternalLink className="h-4 w-4 mr-2" />
                              {isSendingData ? 'Se trimite...' : (user.dataSentToSheet ? 'Date trimise' : 'Trimite la Sheet')}
                            </button>
                            
                            <button
                              onClick={() => setIsEmailModalOpen(true)}
                              className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-4 py-2 rounded-lg hover:opacity-90 transition-colors flex items-center"
                            >
                              <Send className="h-4 w-4 mr-2" />
                              Trimite email
                            </button>
                            
                            <button
                              onClick={() => setIsEditing(true)}
                              className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-2 rounded-lg hover:opacity-90 transition-colors flex items-center"
                            >
                              <Save className="h-4 w-4 mr-2" />
                              Editează
                            </button>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div>
                          <h3 className="text-sm font-medium text-gray-500">Nume complet</h3>
                          <p className="mt-1 text-lg text-gray-900">{user.name}</p>
                        </div>
                        
                        <div>
                          <h3 className="text-sm font-medium text-gray-500">Email</h3>
                          <div className="mt-1 flex items-center">
                            <Mail className="h-5 w-5 text-gray-400 mr-2" />
                            <a href={`mailto:${user.email}`} className="text-blue-600 hover:text-blue-800">
                              {user.email}
                            </a>
                          </div>
                        </div>
                        
                        <div>
                          <h3 className="text-sm font-medium text-gray-500">Telefon</h3>
                          <div className="mt-1 flex items-center">
                            <Phone className="h-5 w-5 text-gray-400 mr-2" />
                            <p className="text-gray-900">
                              {user.phone || 'Nu a fost specificat'}
                            </p>
                          </div>
                        </div>
                        
                        <div>
                          <h3 className="text-sm font-medium text-gray-500">Date Buletin</h3>
                          <div className="mt-1 space-y-2">
                            <div className="flex items-center">
                              <span className="text-gray-500 w-24">Nume complet:</span>
                              <p className="text-gray-900">
                                {user.idCard?.fullName || user.name || 'Nespecificat'}
                              </p>
                            </div>
                            <div className="flex items-center">
                              <span className="text-gray-500 w-24">Serie:</span>
                              <p className="text-gray-900">
                                {user.idCard?.series || 'Nespecificat'}
                              </p>
                            </div>
                            <div className="flex items-center">
                              <span className="text-gray-500 w-24">Număr:</span>
                              <p className="text-gray-900">
                                {user.idCard?.number || 'Nespecificat'}
                              </p>
                            </div>
                            <div className="flex items-center">
                              <span className="text-gray-500 w-24">CNP:</span>
                              <p className="text-gray-900">
                                {user.idCard?.CNP || 'Nespecificat'}
                              </p>
                            </div>
                            <div className="flex items-center">
                              <span className="text-gray-500 w-24">Emisă de:</span>
                              <p className="text-gray-900">
                                {user.idCard?.issuedBy || 'Nespecificat'}
                              </p>
                            </div>
                            <div className="flex items-center">
                              <span className="text-gray-500 w-24">Data emiterii:</span>
                              <p className="text-gray-900">
                                {user.idCard?.issueDate ? formatDate(user.idCard.issueDate) : 'Nespecificat'}
                              </p>
                            </div>
                            <div className="flex items-center">
                              <span className="text-gray-500 w-24">Data expirării:</span>
                              <p className="text-gray-900">
                                {user.idCard?.expiryDate ? formatDate(user.idCard.expiryDate) : 'Nespecificat'}
                              </p>
                            </div>
                            <div className="flex items-center">
                              <span className="text-gray-500 w-24">Adresă:</span>
                              <p className="text-gray-900">
                                {user.idCard?.address || 'Nespecificat'}
                              </p>
                            </div>
                          </div>
                        </div>
                        
                        <div>
                          <h3 className="text-sm font-medium text-gray-500">Rol</h3>
                          <div className="mt-1 flex items-center">
                            <Shield className="h-5 w-5 text-gray-400 mr-2" />
                            <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full 
                              ${user.role === 'admin' ? 'bg-purple-100 text-purple-800' : 
                                user.role === 'client' ? 'bg-green-100 text-green-800' : 
                                user.role === 'partner' ? 'bg-blue-100 text-blue-800' : 
                                'bg-gray-100 text-gray-800'}`}
                            >
                              {user.role === 'admin' ? 'Administrator' : 
                               user.role === 'client' ? 'Client' : 
                               user.role === 'partner' ? 'Partener' : 
                               user.role === 'super-admin' ? 'Super Admin' : 
                               'Utilizator'}
                            </span>
                          </div>
                        </div>

                        {user.dataSentToSheet && (
                          <div>
                            <h3 className="text-sm font-medium text-gray-500">Date trimise la Google Sheets</h3>
                            <div className="mt-1 flex items-center">
                              <div className="flex items-center text-green-600">
                                <svg className="h-5 w-5 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                                <span>Da, la {formatDate(user.dataSentToSheetAt)}</span>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="space-y-4">
                        <div>
                          <h3 className="text-sm font-medium text-gray-500">Organizație</h3>
                          <div className="mt-1 flex items-center">
                            <Building className="h-5 w-5 text-gray-400 mr-2" />
                            <p className="text-gray-900">
                              {user.organization || 'Nespecificat'}
                              {user.position && <span className="text-gray-500 ml-2">({user.position})</span>}
                            </p>
                          </div>
                        </div>
                        
                        <div>
                          <h3 className="text-sm font-medium text-gray-500">Înregistrat la</h3>
                          <div className="mt-1 flex items-center">
                            <Calendar className="h-5 w-5 text-gray-400 mr-2" />
                            <p className="text-gray-900">{formatDate(user.createdAt)}</p>
                          </div>
                        </div>
                        
                        <div>
                          <h3 className="text-sm font-medium text-gray-500">Ultima conectare</h3>
                          <div className="mt-1 flex items-center">
                            <Clock className="h-5 w-5 text-gray-400 mr-2" />
                            <p className="text-gray-900">
                              {user.lastLogin ? formatDate(user.lastLogin) : 'Niciodată'}
                            </p>
                          </div>
                        </div>
                        
                        <div>
                          <h3 className="text-sm font-medium text-gray-500">Status cont</h3>
                          <div className="mt-1 flex items-center">
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                              user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                            }`}>
                              {user.isActive ? 'Activ' : 'Inactiv'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'documents' && (
              <UserDocumentsPanel userId={id} />
            )}
          </div>
        )}
      </div>

      {/* Modal pentru trimitere email */}
      {isEmailModalOpen && user && (
        <SendEmailModal
          isOpen={isEmailModalOpen}
          onClose={() => setIsEmailModalOpen(false)}
          userId={user._id}
          userEmail={user.email}
          userName={user.name}
        />
      )}
    </DashboardLayout>
  );
};

export default UserDetailPage;