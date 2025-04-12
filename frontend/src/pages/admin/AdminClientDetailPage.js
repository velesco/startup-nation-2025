import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Phone, 
  Mail, 
  Calendar, 
  MapPin, 
  User, 
  Building, 
  Edit2, 
  FileText, 
  Trash2, 
  Save,
  X, 
  UsersRound,
  Send
} from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';
import DashboardLayout from '../../components/layouts/DashboardLayout';
import LoadingScreen from '../../components/client/LoadingScreen';
import SendEmailToClientModal from '../../components/admin/SendEmailToClientModal';
import ClientDocumentsPanel from '../../components/clients/ClientDocumentsPanel';

// Funcție pentru extragerea și formatarea datelor clientului
const extractIdCardInfo = (clientData) => {
  console.log('Extract ID Card Info called with:', clientData);
  return {
    ...clientData,
    // Extragem date de afaceri
    company: clientData.businessDetails?.companyName || '',
    address: clientData.businessDetails?.address || '',
    // Formatăm date buletin pentru editare
    idCard: clientData.idCard ? `${clientData.idCard.series || ''}${clientData.idCard.number || ''}` : '',
    cnp: clientData.idCard?.CNP || ''
  };
};

const statusColors = {
  'Nou': 'bg-orange-100 text-orange-700',
  'În progres': 'bg-blue-100 text-blue-700',
  'Complet': 'bg-green-100 text-green-700',
  'Respins': 'bg-red-100 text-red-700'
};

const AdminClientDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser, isAuthenticated } = useAuth();
  const [client, setClient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [editedClient, setEditedClient] = useState(null);
  const [showAssignGroupModal, setShowAssignGroupModal] = useState(false);
  const [groups, setGroups] = useState([]);
  const [selectedGroupId, setSelectedGroupId] = useState('');
  const [assigningGroup, setAssigningGroup] = useState(false);
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);

  // Verificăm dacă utilizatorul este autentificat și are rolul potrivit
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    } else if (currentUser && currentUser.role !== 'admin' && currentUser.role !== 'partner') {
      navigate('/');
    }
  }, [isAuthenticated, currentUser, navigate]);

  // Funcție pentru încărcarea datelor clientului
  const fetchClientData = async () => {
    try {
      setLoading(true);
      const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5002/api';
      
      console.log(`Încarcă datele clientului cu ID: ${id}`);
      
      const response = await axios.get(`${API_URL}/admin/clients/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.data && response.data.success) {
        const clientData = response.data.data;
        console.log('Date primite de la server în fetchClientData:', clientData);
        
        if (!clientData) {
          throw new Error('Datele clientului lipsesc din răspunsul serverului');
        }
        
        // Folosim funcția de extragere pentru formatarea datelor
        const formattedClientData = extractIdCardInfo(clientData);
        console.log('Date formatate pentru editare:', formattedClientData);
        
        setClient(clientData);
        setEditedClient(formattedClientData);
        
        // Verificăm dacă s-au încărcat corect datele CNP și idCard
        console.log('Verificare date idCard după încărcare:', {
          'CNP din server': clientData.idCard?.CNP,
          'CNP formatat': formattedClientData.cnp,
          'Serie+Număr din server': clientData.idCard ? `${clientData.idCard.series || ''}${clientData.idCard.number || ''}` : '',
          'Serie+Număr formatat': formattedClientData.idCard
        });
      } else {
        throw new Error('Failed to load client data');
      }
    } catch (err) {
      console.error('Error loading client data:', err);
      setError('Nu s-au putut încărca datele clientului. Vă rugăm să încercați din nou.');
    } finally {
      setLoading(false);
    }
  };

  // Încărcăm datele la inițializare
  useEffect(() => {
    if (isAuthenticated && currentUser && id) {
      fetchClientData();
    }
  }, [isAuthenticated, currentUser, id]);

  // Funcție pentru actualizarea datelor clientului
  const handleSaveChanges = async () => {
    try {
      setLoading(true);
      console.log('Datele de editat înainte de formatare:', editedClient);
      const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5002/api';
      
      // Creem un obiect idCard înainte pentru a simplifica procesarea
      let idCard = {};
      
      // Adaugăm CNP în idCard dacă există
      if (editedClient.cnp) {
        idCard.CNP = editedClient.cnp;
      }
      
      // Adaugăm serie și număr CI în idCard dacă există
      if (editedClient.idCard && typeof editedClient.idCard === 'string' && editedClient.idCard.length >= 2) {
        idCard.series = editedClient.idCard.substring(0, 2);
        idCard.number = editedClient.idCard.substring(2);
      }
      
      // Construim obiectul complet pentru backend
      const formattedClientData = {
        name: editedClient.name,
        email: editedClient.email,
        phone: editedClient.phone,
        status: editedClient.status,
        businessDetails: {
          companyName: editedClient.company,
          address: editedClient.address || '',
        },
        notes: editedClient.notes || '',
        // Includem idCard doar dacă avem cel puțin un câmp completat
        idCard: Object.keys(idCard).length > 0 ? idCard : null
      };
      
      console.log('Data trimisă la server:', formattedClientData);
      
      const response = await axios.put(`${API_URL}/admin/clients/${id}`, formattedClientData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.data && response.data.success) {
        console.log('Răspuns de la server după salvare:', response.data);
        // Setăm loading pentru a indica utilizatorului că datele se reîncărcă
        setLoading(true);
        
        try {
          // Adăugăm un timp de așteptare pentru a ne asigura că datele sunt disponibile pe server
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          // Reîncărcăm datele complete ale clientului pentru a ne asigura că primim toate modificările
          await fetchClientData();
          alert('Datele clientului au fost actualizate cu succes!');
        } catch (fetchError) {
          console.error('Eroare la reîncărcarea datelor clientului:', fetchError);
          // Forțăm un reload complet al paginii în caz de eroare
          window.location.reload();
        } finally {
          setIsEditing(false);
          setLoading(false);
        }
      } else {
        throw new Error('Failed to update client data');
      }
    } catch (err) {
      console.error('Error updating client data:', err);
      setError(`Nu s-au putut actualiza datele clientului: ${err.response?.data?.message || err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Funcție pentru încărcarea grupelor disponibile
  const fetchGroups = async () => {
    // Clear groups before fetching
    setGroups([]);
    try {
      const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5002/api';
      
      // First try to get all groups without filtering by status
      const response = await axios.get(`${API_URL}/admin/groups`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        params: {
          limit: 100
          // Removed status filter to get all groups regardless of status
        }
      });
      
      if (response.data && response.data.success) {
        console.log('Fetched groups:', response.data);
        setGroups(response.data.data);
      }
    } catch (err) {
      console.error('Error loading groups:', err);
      if (err.response) {
        console.error('Response data:', err.response.data);
        console.error('Response status:', err.response.status);
        console.error('Response headers:', err.response.headers);
      } else if (err.request) {
        console.error('Request made but no response received:', err.request);
      } else {
        console.error('Error during request setup:', err.message);
      }
      setError('Nu s-au putut încărca grupele disponibile. Vă rugăm să încercați din nou.');
    }
  };

  // Funcție pentru atribuirea clientului la o grupă
  const handleAssignGroup = async () => {
    if (!selectedGroupId) {
      setError('Vă rugăm să selectați o grupă');
      return;
    }

    try {
      setAssigningGroup(true);
      const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5002/api';
      
      const response = await axios.put(`${API_URL}/admin/clients/${id}/assign-group`, 
        { groupId: selectedGroupId },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      
      if (response.data && response.data.success) {
        // Actualizăm datele clientului
        fetchClientData();
        setShowAssignGroupModal(false);
        setSelectedGroupId('');
      } else {
        throw new Error('Failed to assign client to group');
      }
    } catch (err) {
      console.error('Error assigning client to group:', err);
      setError('Nu s-a putut atribui clientul la grupa selectată. Vă rugăm să încercați din nou.');
    } finally {
      setAssigningGroup(false);
    }
  };

  // Funcție pentru deschiderea modalului de atribuire grupă
  const openAssignGroupModal = () => {
    // Reset any previous errors
    setError(null);
    // Reset selected group
    setSelectedGroupId('');
    // Fetch groups
    fetchGroups();
    // Show the modal
    setShowAssignGroupModal(true);
  };

  // Funcție pentru formatarea datei
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const options = { day: '2-digit', month: '2-digit', year: 'numeric' };
    return new Date(dateString).toLocaleDateString('ro-RO', options);
  };

  // Funcție pentru obținerea inițialelor
  const getInitials = (name) => {
    if (!name) return '';
    return name.split(' ')
      .filter(part => part.length > 0)
      .map(part => part[0].toUpperCase())
      .slice(0, 2)
      .join('');
  };

  if (loading && !client) {
    return <LoadingScreen />;
  }

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <div className="flex items-center">
            <button
              onClick={() => navigate('/admin/clients')}
              className="mr-4 p-2 bg-white rounded-full shadow-sm hover:shadow-md transition-all"
            >
              <ArrowLeft className="h-5 w-5 text-gray-600" />
            </button>
            <h1 className="text-2xl font-bold text-gray-800">Detalii Client</h1>
          </div>
          
          <div className="flex mt-4 md:mt-0 space-x-3">
            {isEditing ? (
              <>
                <button
                  onClick={() => {
                    setEditedClient(client);
                    setIsEditing(false);
                  }}
                  className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                >
                  Anulează
                </button>
                <button
                  onClick={handleSaveChanges}
                  className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-5 py-2 rounded-lg font-medium shadow-md hover:shadow-lg transition-all duration-300 flex items-center"
                >
                  <Save className="h-5 w-5 mr-2" />
                  <span>Salvează</span>
                </button>
              </>
            ) : (
              <div className="flex space-x-3">
                <button
                  onClick={() => setIsEditing(true)}
                  className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-5 py-2 rounded-lg font-medium shadow-md hover:shadow-lg transition-all duration-300 flex items-center"
                >
                  <Edit2 className="h-5 w-5 mr-2" />
                  <span>Editează</span>
                </button>
                
                <button
                  className="px-4 py-2 rounded-lg border border-gray-300 bg-white text-orange-600 font-medium hover:bg-orange-50 transition-colors flex items-center mr-2"
                  onClick={() => setIsEmailModalOpen(true)}
                >
                  <Send className="h-5 w-5 mr-2 text-orange-500" />
                  <span>Trimite Email</span>
                </button>
                
                <button
                  className="px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-700 font-medium hover:bg-gray-50 transition-colors flex items-center"
                  onClick={() => setActiveTab('documents')}
                >
                  <FileText className="h-5 w-5 mr-2 text-gray-500" />
                  <span>Documente</span>
                </button>
                
                <button
                  className="px-4 py-2 rounded-lg border border-gray-300 bg-white text-blue-700 font-medium hover:bg-blue-50 transition-colors flex items-center"
                  onClick={openAssignGroupModal}
                >
                  <UsersRound className="h-5 w-5 mr-2 text-blue-600" />
                  <span>{client?.group ? 'Schimbă Grupa' : 'Atribuie la Grupă'}</span>
                </button>
                
                <button
                  className="px-4 py-2 rounded-lg border border-gray-300 bg-white text-red-600 font-medium hover:bg-red-50 transition-colors flex items-center"
                  onClick={() => {
                    if (window.confirm('Sigur doriți să ștergeți acest client? Această acțiune este ireversibilă.'))
                    {
                      // Implementăm logica de ștergere
                      const deleteClient = async () => {
                        try {
                          const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5002/api';
                          const response = await axios.delete(`${API_URL}/clients/${client._id}?permanent=true`, {
                            headers: {
                              Authorization: `Bearer ${localStorage.getItem('token')}`
                            }
                          });
                          
                          if (response.data && response.data.success) {
                            alert('Clientul a fost șters cu succes!');
                            navigate('/admin/clients');
                          }
                        } catch (error) {
                          console.error('Error deleting client:', error);
                          setError(`Eroare la ștergerea clientului: ${error.response?.data?.message || error.message}`);
                        }
                      };
                      
                      deleteClient();
                    }
                  }}
                >
                  <Trash2 className="h-5 w-5 mr-2 text-red-500" />
                  <span>Șterge</span>
                </button>
              </div>
            )}
          </div>
        </div>

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

        {client && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Coloana din stânga cu informații de bază */}
            <div className="glassmorphism rounded-xl p-6 shadow-lg">
              <div className="flex items-center mb-6">
                <div className="h-20 w-20 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold">
                  {getInitials(client.name)}
                </div>
                <div className="ml-5">
                  <h2 className="text-xl font-semibold text-gray-800">{client.name}</h2>
                  <div className="flex items-center mt-1">
                    <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${statusColors[client.status] || 'bg-gray-100 text-gray-800'}`}>
                      {client.status}
                    </span>
                    <span className="ml-2 text-sm text-gray-500">ID: {client._id}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center">
                  <Phone className="h-5 w-5 text-gray-400 mr-3" />
                  {isEditing ? (
                    <input
                      type="text"
                      value={editedClient.phone || ''}
                      onChange={(e) => setEditedClient({...editedClient, phone: e.target.value})}
                      className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  ) : (
                    <span className="text-gray-800">{client.phone}</span>
                  )}
                </div>
                
                <div className="flex items-center">
                  <Mail className="h-5 w-5 text-gray-400 mr-3" />
                  {isEditing ? (
                    <input
                      type="email"
                      value={editedClient.email || ''}
                      onChange={(e) => setEditedClient({...editedClient, email: e.target.value})}
                      className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  ) : (
                    <span className="text-gray-800">{client.email}</span>
                  )}
                </div>
                
                <div className="flex items-center">
                  <Calendar className="h-5 w-5 text-gray-400 mr-3" />
                  <span className="text-gray-800">Înregistrare: {formatDate(client.registrationDate)}</span>
                </div>
                
                <div className="flex items-center">
                  <MapPin className="h-5 w-5 text-gray-400 mr-3" />
                  {isEditing ? (
                    <input
                      type="text"
                      value={editedClient.address || ''}
                      onChange={(e) => setEditedClient({...editedClient, address: e.target.value})}
                      className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  ) : (
                    <span className="text-gray-800">{client.businessDetails?.address || 'Nicio adresă specificată'}</span>
                  )}
                </div>
                
                <div className="flex items-center">
                  <User className="h-5 w-5 text-gray-400 mr-3" />
                  {isEditing ? (
                    <select
                      value={editedClient.status || 'Nou'}
                      onChange={(e) => setEditedClient({...editedClient, status: e.target.value})}
                      className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="Nou">Nou</option>
                      <option value="În progres">În progres</option>
                      <option value="Complet">Complet</option>
                      <option value="Respins">Respins</option>
                    </select>
                  ) : (
                    <span className="text-gray-800">Status: {client.status}</span>
                  )}
                </div>
                
                <div className="flex items-center">
                  <Building className="h-5 w-5 text-gray-400 mr-3" />
                  {isEditing ? (
                    <input
                      type="text"
                      value={editedClient.company || ''}
                      onChange={(e) => setEditedClient({...editedClient, company: e.target.value})}
                      className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  ) : (
                    <span className="text-gray-800">Companie: {client.businessDetails?.companyName || 'Nespecificat'}</span>
                  )}
                </div>
                
                <div className="flex items-center">
                  <UsersRound className="h-5 w-5 text-gray-400 mr-3" />
                  <span className="text-gray-800">
                    Grupă: {client.group ? (
                      <span className="text-blue-600 font-medium">{client.group.name}</span>
                    ) : (
                      <span className="text-gray-500 italic">Nealocat</span>
                    )}
                  </span>
                </div>
              </div>
            </div>

            {/* Coloana din mijloc și dreapta cu detalii și documente */}
            <div className="lg:col-span-2">
              <div className="glassmorphism rounded-xl p-6 shadow-lg">
                {/* Tabs pentru navigare */}
                <div className="border-b border-gray-200 mb-6">
                  <div className="flex space-x-8">
                    <button
                      onClick={() => setActiveTab('profile')}
                      className={`py-4 px-1 border-b-2 font-medium text-sm ${
                        activeTab === 'profile'
                          ? 'border-blue-500 text-blue-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      Profil Client
                    </button>
                    <button
                      onClick={() => setActiveTab('documents')}
                      className={`py-4 px-1 border-b-2 font-medium text-sm ${
                        activeTab === 'documents'
                          ? 'border-blue-500 text-blue-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      Documente
                    </button>
                  </div>
                </div>

                {/* Conținutul în funcție de tab-ul activ */}
                {activeTab === 'profile' && (
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Informații Suplimentare</h3>
                    
                    {isEditing ? (
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">CNP</label>
                          <input
                            type="text"
                            value={editedClient.cnp || ''}
                            onChange={(e) => setEditedClient({...editedClient, cnp: e.target.value})}
                            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Serie și Număr CI</label>
                          <input
                            type="text"
                            value={editedClient.idCard || ''}
                            onChange={(e) => setEditedClient({...editedClient, idCard: e.target.value})}
                            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Informații Suplimentare</label>
                          <textarea
                            value={editedClient.notes || ''}
                            onChange={(e) => setEditedClient({...editedClient, notes: e.target.value})}
                            rows={4}
                            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <p><span className="font-medium">CNP:</span> {client.idCard?.CNP || 'Nespecificat'}</p>
                        <p><span className="font-medium">Serie și Număr CI:</span> {client.idCard && (client.idCard.series || client.idCard.number) ? `${client.idCard.series || ''}${client.idCard.number || ''}` : 'Nespecificat'}</p>
                        <p><span className="font-medium">Informații Suplimentare:</span></p>
                        <p className="text-gray-600 whitespace-pre-line">{client.notes || 'Nu există informații suplimentare.'}</p>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'documents' && (
                  <ClientDocumentsPanel clientId={id} />
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modal pentru atribuire la grupă */}
      {showAssignGroupModal && client && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-75 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-800">
                {client.group ? 'Schimbă Grupa Clientului' : 'Atribuie Client la Grupă'}
              </h3>
              <button 
                className="p-1 rounded-full hover:bg-gray-100"
                onClick={() => setShowAssignGroupModal(false)}
              >
                <X className="h-6 w-6 text-gray-500" />
              </button>
            </div>
            
            {client.group && (
              <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-800">
                  Clientul este atribuit în prezent la grupa: <span className="font-medium">{client.group.name}</span>
                </p>
              </div>
            )}
            
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Selectează Grupa
              </label>
              <select
                value={selectedGroupId}
                onChange={(e) => setSelectedGroupId(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">-- Selectează o grupă --</option>
                {groups.length === 0 ? (
                  <option disabled>Nu există grupe disponibile</option>
                ) : (
                  groups.map((group) => (
                    <option key={group._id} value={group._id}>
                      {group.name} ({group.clientCount || 0}/{group.capacity || 25} locuri)
                    </option>
                  ))
                )}
              </select>
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowAssignGroupModal(false)}
                className="px-4 py-2 bg-gray-200 text-gray-800 font-medium rounded-lg hover:bg-gray-300 transition-colors"
              >
                Anulează
              </button>
              <button
                onClick={handleAssignGroup}
                disabled={assigningGroup || !selectedGroupId}
                className={`px-4 py-2 bg-blue-600 text-white font-medium rounded-lg flex items-center ${assigningGroup || !selectedGroupId ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-700'} transition-colors`}
              >
                {assigningGroup ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Se procesează...
                  </>
                ) : (
                  'Confirmă'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal pentru trimitere email */}
      {isEmailModalOpen && client && (
        <SendEmailToClientModal
          isOpen={isEmailModalOpen}
          onClose={() => setIsEmailModalOpen(false)}
          clientId={client._id}
          clientEmail={client.email}
          clientName={client.name}
        />
      )}
    </DashboardLayout>
  );
};

export default AdminClientDetailPage;