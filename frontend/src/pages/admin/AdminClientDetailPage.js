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
  Upload, 
  Download, 
  Trash2, 
  Save,
  Eye, // Adăugat pentru previzualizare document
  X, // Adăugat pentru închidere modal
  UsersRound // Adăugat pentru iconul de grupă
} from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';
import DashboardLayout from '../../components/layouts/DashboardLayout';
import LoadingScreen from '../../components/client/LoadingScreen';

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
  const [documents, setDocuments] = useState([]);
  const [uploadingDoc, setUploadingDoc] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [documentType, setDocumentType] = useState('identity');
  const [documentName, setDocumentName] = useState('');
  const [previewDocument, setPreviewDocument] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  const [showAssignGroupModal, setShowAssignGroupModal] = useState(false);
  const [groups, setGroups] = useState([]);
  const [selectedGroupId, setSelectedGroupId] = useState('');
  const [assigningGroup, setAssigningGroup] = useState(false);

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
      const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5003/api';
      
      const response = await axios.get(`${API_URL}/admin/clients/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.data && response.data.success) {
        setClient(response.data.data);
        setEditedClient(response.data.data);
        
        // Încarcă documentele clientului
        fetchClientDocuments();
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

  // Încarcă documentele clientului
  const fetchClientDocuments = async () => {
    try {
      const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5003/api';
      
      const response = await axios.get(`${API_URL}/admin/clients/${id}/documents`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.data && response.data.success) {
        setDocuments(response.data.data);
      }
    } catch (err) {
      console.error('Error loading client documents:', err);
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
      const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5003/api';
      
      const response = await axios.put(`${API_URL}/admin/clients/${id}`, editedClient, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.data && response.data.success) {
        setClient(response.data.data);
        setEditedClient(response.data.data);
        setIsEditing(false);
      } else {
        throw new Error('Failed to update client data');
      }
    } catch (err) {
      console.error('Error updating client data:', err);
      setError('Nu s-au putut actualiza datele clientului. Vă rugăm să încercați din nou.');
    } finally {
      setLoading(false);
    }
  };

  // Funcție pentru încărcarea documentelor
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  // Funcție pentru încărcarea documentului
  const handleUploadDocument = async (e) => {
    e.preventDefault();
    
    if (!selectedFile) {
      return;
    }

    try {
      setUploadingDoc(true);
      const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5003/api';
      
      const formData = new FormData();
      formData.append('document', selectedFile); // Folosim 'document' pentru a se potrivi cu middlewar-ul express-fileupload
      formData.append('type', documentType);
      formData.append('name', documentName || selectedFile.name);
      
      const response = await axios.post(`${API_URL}/admin/clients/${id}/documents`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.data && response.data.success) {
        // Resetăm câmpurile și reîncărcăm documentele
        setSelectedFile(null);
        setDocumentType('identity');
        setDocumentName('');
        fetchClientDocuments();
      } else {
        throw new Error('Failed to upload document');
      }
    } catch (err) {
      console.error('Error uploading document:', err);
      setError('Nu s-a putut încărca documentul. Vă rugăm să încercați din nou.');
    } finally {
      setUploadingDoc(false);
    }
  };

  // Funcție pentru descărcarea documentului
  const handleDownloadDocument = async (docId) => {
    try {
      const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5003/api';
      
      const response = await axios.get(`${API_URL}/admin/documents/${docId}/download`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        responseType: 'blob'
      });
      
      // Crează un URL pentru blob și descarcă fișierul
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      
      // Găsește documentul pentru a obține numele
      const doc = documents.find(d => d._id === docId);
      link.setAttribute('download', doc ? doc.name : 'document');
      
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error('Error downloading document:', err);
      setError('Nu s-a putut descărca documentul. Vă rugăm să încercați din nou.');
    }
  };

  // Funcție pentru ștergerea documentului
  const handleDeleteDocument = async (docId) => {
    if (!window.confirm('Sigur doriți să ștergeți acest document?')) {
      return;
    }
    
    try {
      const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5003/api';
      
      const response = await axios.delete(`${API_URL}/admin/documents/${docId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.data && response.data.success) {
        // Reîncărcăm documentele
        fetchClientDocuments();
      } else {
        throw new Error('Failed to delete document');
      }
    } catch (err) {
      console.error('Error deleting document:', err);
      setError('Nu s-a putut șterge documentul. Vă rugăm să încercați din nou.');
    }
  };

  // Funcție pentru previzualizarea documentului
  const handlePreviewDocument = async (docId, docType) => {
    try {
      const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5003/api';
      
      const response = await axios.get(`${API_URL}/admin/documents/${docId}/download`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        responseType: 'blob'
      });
      
      // Creăm un URL pentru blob
      const url = window.URL.createObjectURL(new Blob([response.data]));
      
      // Găsim documentul pentru a obține numele
      const doc = documents.find(d => d._id === docId);
      
      setPreviewDocument({
        url,
        type: docType || 'unknown',
        name: doc ? doc.name : 'document',
        mimeType: doc ? doc.mimeType : 'application/octet-stream'
      });
      
      setShowPreview(true);
    } catch (err) {
      console.error('Error previewing document:', err);
      setError('Nu s-a putut previzualiza documentul. Vă rugăm să încercați din nou.');
    }
  };

  // Funcție pentru încărcarea grupelor disponibile
  const fetchGroups = async () => {
    // Clear groups before fetching
    setGroups([]);
    try {
      const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5003/api';
      
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
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        console.error('Response data:', err.response.data);
        console.error('Response status:', err.response.status);
        console.error('Response headers:', err.response.headers);
      } else if (err.request) {
        // The request was made but no response was received
        console.error('Request made but no response received:', err.request);
      } else {
        // Something happened in setting up the request that triggered an Error
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
      const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5003/api';
      
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
              onClick={() => navigate('/clients')}
              className="mr-4 p-2 bg-white rounded-full shadow-sm hover:shadow-md transition-all"
            >
              <ArrowLeft className="h-5 w-5 text-gray-600" />
            </button>
            <h1 className="text-2xl font-bold text-gray-800">Detalii Client</h1>
          </div>

      {/* Modal pentru atribuire la grupă */}
      {showAssignGroupModal && (
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
                {/* Debug section */}
                {console.log('Rendering groups:', groups)}
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
      
      {/* Modal pentru previzualizare document */}
      {showPreview && previewDocument && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-75 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            <div className="p-4 border-b flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-800 truncate flex-1">
                {previewDocument.name}
              </h3>
              <button 
                className="p-1 rounded-full hover:bg-gray-100"
                onClick={() => setShowPreview(false)}
              >
                <X className="h-6 w-6 text-gray-500" />
              </button>
            </div>
            
            <div className="flex-1 overflow-auto flex items-center justify-center p-4 bg-gray-100">
              {previewDocument.mimeType.startsWith('image/') ? (
                <img 
                  src={previewDocument.url} 
                  alt={previewDocument.name} 
                  className="max-w-full max-h-[70vh] object-contain"
                />
              ) : previewDocument.mimeType === 'application/pdf' ? (
                <iframe
                  src={`${previewDocument.url}#toolbar=0&view=FitH`}
                  title={previewDocument.name}
                  className="w-full h-[70vh]"
                  frameBorder="0"
                ></iframe>
              ) : (
                <div className="py-20 px-10 text-center">
                  <FileText className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                  <p className="text-lg text-gray-600 mb-2">Documentul nu poate fi previzualizat direct.</p>
                  <p className="text-gray-500">Tip de fișier: {previewDocument.mimeType}</p>
                  <a 
                    href={previewDocument.url} 
                    download={previewDocument.name}
                    className="mt-4 inline-flex items-center px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Download className="h-5 w-5 mr-2" />
                    Descarcă documentul
                  </a>
                </div>
              )}
            </div>
            
            <div className="p-4 border-t flex justify-end space-x-3">
              <a 
                href={previewDocument.url} 
                download={previewDocument.name}
                className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors flex items-center"
              >
                <Download className="h-5 w-5 mr-2" />
                Descarcă
              </a>
              <button 
                className="px-4 py-2 bg-gray-200 text-gray-800 font-medium rounded-lg hover:bg-gray-300 transition-colors"
                onClick={() => setShowPreview(false)}
              >
                Închide
              </button>
            </div>
          </div>
        </div>
      )}
          
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
                  <span>{client.group ? 'Schimbă Grupa' : 'Atribuie la Grupă'}</span>
                </button>
                
                <button
                  className="px-4 py-2 rounded-lg border border-gray-300 bg-white text-red-600 font-medium hover:bg-red-50 transition-colors flex items-center"
                  onClick={() => {
                    if (window.confirm('Sigur doriți să ștergeți acest client? Această acțiune este ireversibilă.'))
                    {
                      // Implementați logica de ștergere aici
                      alert('Funcționalitate în curs de implementare');
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
                    <span className="text-gray-800">{client.address || 'Nicio adresă specificată'}</span>
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
                    <span className="text-gray-800">Companie: {client.company || 'Nespecificat'}</span>
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
                        <p><span className="font-medium">CNP:</span> {client.cnp || 'Nespecificat'}</p>
                        <p><span className="font-medium">Serie și Număr CI:</span> {client.idCard || 'Nespecificat'}</p>
                        <p><span className="font-medium">Informații Suplimentare:</span></p>
                        <p className="text-gray-600 whitespace-pre-line">{client.notes || 'Nu există informații suplimentare.'}</p>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'documents' && (
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Documente Client</h3>
                    
                    <div className="bg-blue-50 p-4 rounded-lg mb-6">
                      <h4 className="font-medium text-blue-700 mb-2">Încărcare Document Nou</h4>
                      <form onSubmit={handleUploadDocument} className="space-y-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Tip Document</label>
                          <select
                            value={documentType}
                            onChange={(e) => setDocumentType(e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                          >
                            <option value="identity">Act de Identitate</option>
                            <option value="registration">Certificat Înregistrare</option>
                            <option value="contract">Contract</option>
                            <option value="other">Alt Document</option>
                          </select>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Nume Document</label>
                          <input
                            type="text"
                            value={documentName}
                            onChange={(e) => setDocumentName(e.target.value)}
                            placeholder="Opțional - se va folosi numele fișierului dacă nu este completat"
                            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Fișier</label>
                          <input
                            type="file"
                            onChange={handleFileChange}
                            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                          />
                        </div>
                        
                        <button
                          type="submit"
                          disabled={uploadingDoc || !selectedFile}
                          className={`w-full bg-blue-600 text-white p-2 rounded-md font-medium flex items-center justify-center ${
                            uploadingDoc || !selectedFile ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-700'
                          }`}
                        >
                          {uploadingDoc ? (
                            <>
                              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              Încărcare...
                            </>
                          ) : (
                            <>
                              <Upload className="h-5 w-5 mr-2" />
                              Încarcă Document
                            </>
                          )}
                        </button>
                      </form>
                    </div>
                    
                    {documents.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        <FileText className="h-12 w-12 mx-auto text-gray-300 mb-2" />
                        <p>Nu există documente încărcate pentru acest client.</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {documents.map((doc) => (
                          <div key={doc._id} className="bg-white p-4 rounded-lg border border-gray-200 hover:shadow-md transition-shadow flex items-center justify-between">
                            <div className="flex items-center">
                              <div className="h-10 w-10 rounded-md bg-blue-100 flex items-center justify-center text-blue-600">
                                <FileText className="h-6 w-6" />
                              </div>
                              <div className="ml-3">
                                <h4 className="font-medium text-gray-800">{doc.name}</h4>
                                <div className="flex items-center text-sm text-gray-500">
                                  <span className="capitalize">{doc.type}</span>
                                  <span className="mx-1">•</span>
                                  <span>{formatDate(doc.uploadedAt)}</span>
                                </div>
                              </div>
                            </div>
                            <div className="flex space-x-2">
                              <button
                                onClick={() => handlePreviewDocument(doc._id, doc.type)}
                                className="p-2 text-green-600 hover:bg-green-50 rounded-md transition-colors"
                                title="Previzualizare"
                              >
                                <Eye className="h-5 w-5" />
                              </button>
                              <button
                                onClick={() => handleDownloadDocument(doc._id)}
                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                                title="Descarcă"
                              >
                                <Download className="h-5 w-5" />
                              </button>
                              <button
                                onClick={() => handleDeleteDocument(doc._id)}
                                className="p-2 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                                title="Șterge"
                              >
                                <Trash2 className="h-5 w-5" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default AdminClientDetailPage;