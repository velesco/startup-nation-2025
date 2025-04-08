import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  PlusCircle, 
  User, 
  Mail, 
  Phone, 
  Calendar, 
  Search, 
  UserPlus, 
  UserMinus,
  X, 
  Check,
  MoreVertical,
  ExternalLink
} from 'lucide-react';

const ParticipantsTab = ({ 
  groupId, 
  participants,
  availableParticipants,
  onParticipantsUpdated,
  setError,
  setSuccess
}) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedClients, setSelectedClients] = useState([]);
  const [activeDropdown, setActiveDropdown] = useState(null);
  
  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const options = { day: '2-digit', month: '2-digit', year: 'numeric' };
    return new Date(dateString).toLocaleDateString('ro-RO', options);
  };
  
  // Handle search
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };
  
  // Filter participants based on search term
  const filteredParticipants = participants.filter(participant => {
    if (!searchTerm) return true;
    
    const searchLower = searchTerm.toLowerCase();
    return (
      participant.name?.toLowerCase().includes(searchLower) ||
      participant.email?.toLowerCase().includes(searchLower) ||
      participant.phone?.includes(searchTerm)
    );
  });
  
  // Toggle client selection in add modal
  const toggleClientSelection = (clientId) => {
    if (selectedClients.includes(clientId)) {
      setSelectedClients(selectedClients.filter(id => id !== clientId));
    } else {
      setSelectedClients([...selectedClients, clientId]);
    }
  };
  
  // Remove participant from group
  const handleRemoveParticipant = async (participantId) => {
    if (!window.confirm('Sigur doriți să eliminați acest participant din grupă?')) {
      return;
    }
    
    try {
      setLoading(true);
      const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5003/api';
      
      const response = await axios.delete(
        `${API_URL}/groups/${groupId}/clients/${participantId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      
      if (response.data && response.data.success) {
        setSuccess('Participant eliminat cu succes');
        onParticipantsUpdated();
      } else {
        throw new Error(response.data?.message || 'Failed to remove participant');
      }
    } catch (error) {
      console.error('Error removing participant:', error);
      setError(error.response?.data?.message || 'Nu s-a putut elimina participantul. Vă rugăm să încercați din nou.');
    } finally {
      setLoading(false);
      setActiveDropdown(null);
    }
  };
  
  // Add participants to group
  const handleAddParticipants = async () => {
    if (selectedClients.length === 0) {
      setError('Selectați cel puțin un client');
      return;
    }
    
    try {
      setLoading(true);
      const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5003/api';
      
      const response = await axios.post(
        `${API_URL}/groups/${groupId}/clients`,
        { clientIds: selectedClients },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      
      if (response.data && response.data.success) {
        setSuccess(`${selectedClients.length} participanți adăugați cu succes`);
        setSelectedClients([]);
        setShowAddModal(false);
        onParticipantsUpdated();
      } else {
        throw new Error(response.data?.message || 'Failed to add participants');
      }
    } catch (error) {
      console.error('Error adding participants:', error);
      setError(error.response?.data?.message || 'Nu s-au putut adăuga participanții. Vă rugăm să încercați din nou.');
    } finally {
      setLoading(false);
    }
  };
  
  // Toggle action dropdown for mobile view
  const toggleDropdown = (participantId) => {
    if (activeDropdown === participantId) {
      setActiveDropdown(null);
    } else {
      setActiveDropdown(participantId);
    }
  };
  
  // Filter available clients based on search term in modal
  const filteredAvailableClients = availableParticipants.filter(client => {
    if (!searchTerm && showAddModal) return true;
    
    const searchLower = searchTerm.toLowerCase();
    return (
      client.name?.toLowerCase().includes(searchLower) ||
      client.email?.toLowerCase().includes(searchLower) ||
      client.phone?.includes(searchTerm)
    );
  });
  
  return (
    <div>
      {/* Header with search and add button */}
      <div className="mb-4 sm:mb-6 flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
        <div className="relative flex-1 min-w-0">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Caută participant..."
            className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            value={searchTerm}
            onChange={handleSearch}
          />
        </div>
        
        <button
          onClick={() => {
            setSearchTerm('');
            setSelectedClients([]);
            setShowAddModal(true);
          }}
          className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-4 py-2 rounded-lg flex items-center justify-center sm:justify-start shadow-md hover:shadow-lg transition-all"
          disabled={loading}
        >
          <UserPlus className="h-5 w-5 mr-2" />
          <span>Adaugă participanți</span>
        </button>
      </div>
      
      {/* Participants list */}
      {filteredParticipants.length === 0 ? (
        <div className="glassmorphism rounded-xl p-6 sm:p-10 shadow-lg text-center">
          <User className="h-10 w-10 sm:h-12 sm:w-12 mx-auto text-gray-400 mb-3" />
          <h3 className="text-lg font-medium text-gray-700 mb-2">Nu există participanți în această grupă</h3>
          <p className="text-gray-500 mb-4">Adăugați participanți pentru a începe cursurile cu această grupă.</p>
          <button
            onClick={() => {
              setSearchTerm('');
              setSelectedClients([]);
              setShowAddModal(true);
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg inline-flex items-center"
            disabled={loading}
          >
            <UserPlus className="h-4 w-4 mr-2" />
            <span>Adaugă participanți</span>
          </button>
        </div>
      ) : (
        <>
          {/* Desktop Table View */}
          <div className="hidden md:block overflow-x-auto glassmorphism rounded-xl shadow-lg">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-white/70">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nume
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Înregistrare
                  </th>
                  <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acțiuni
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white/50 divide-y divide-gray-200">
                {filteredParticipants.map((participant) => (
                  <tr key={participant._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 flex-shrink-0">
                          <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center text-white text-sm font-bold">
                            {getInitials(participant.name)}
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{participant.name}</div>
                          <div className="text-sm text-gray-500">ID: {participant._id.substring(participant._id.length - 6)}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        <div className="flex items-center mb-1">
                          <Mail className="h-4 w-4 mr-2 text-gray-400" />
                          {participant.email}
                        </div>
                        <div className="flex items-center">
                          <Phone className="h-4 w-4 mr-2 text-gray-400" />
                          {participant.phone}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        participant.status === 'Nou' ? 'bg-orange-100 text-orange-700' :
                        participant.status === 'În progres' ? 'bg-blue-100 text-blue-700' :
                        participant.status === 'Complet' ? 'bg-green-100 text-green-700' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {participant.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                        {formatDate(participant.registrationDate)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <div className="flex justify-center space-x-2">
                        <button
                          onClick={() => navigate(`/admin/clients/${participant._id}`)}
                          className="text-blue-600 hover:text-blue-900 hover:bg-blue-50 p-1 rounded"
                          title="Vizualizare detalii"
                        >
                          <User className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleRemoveParticipant(participant._id)}
                          className="text-red-600 hover:text-red-900 hover:bg-red-50 p-1 rounded"
                          title="Eliminare din grupă"
                          disabled={loading}
                        >
                          <UserMinus className="h-5 w-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {/* Mobile Card View */}
          <div className="md:hidden space-y-3">
            {filteredParticipants.map((participant) => (
              <div key={participant._id} className="glassmorphism rounded-lg p-3 shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center text-white text-sm font-bold">
                      {getInitials(participant.name)}
                    </div>
                    <div className="ml-3">
                      <div className="text-sm font-medium text-gray-900">{participant.name}</div>
                      <div className="text-xs text-gray-500">ID: {participant._id.substring(participant._id.length - 4)}</div>
                    </div>
                  </div>
                  
                  {/* Mobile actions dropdown */}
                  <div className="relative">
                    <button 
                      onClick={() => toggleDropdown(participant._id)}
                      className="p-1 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                    >
                      <MoreVertical className="h-5 w-5" />
                    </button>
                    
                    {activeDropdown === participant._id && (
                      <div className="absolute right-0 mt-1 w-48 bg-white rounded-md shadow-lg z-10 border border-gray-200">
                        <div className="py-1">
                          <button
                            onClick={() => {
                              navigate(`/admin/clients/${participant._id}`);
                              setActiveDropdown(null);
                            }}
                            className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                          >
                            <ExternalLink className="h-4 w-4 mr-2 text-blue-500" />
                            Vizualizare detalii
                          </button>
                          <button
                            onClick={() => handleRemoveParticipant(participant._id)}
                            className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 flex items-center"
                            disabled={loading}
                          >
                            <UserMinus className="h-4 w-4 mr-2" />
                            Eliminare din grupă
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="mt-3 space-y-1 text-xs text-gray-600">
                  <div className="flex items-center">
                    <Mail className="h-3.5 w-3.5 mr-2 flex-shrink-0" />
                    <span className="truncate">{participant.email}</span>
                  </div>
                  <div className="flex items-center">
                    <Phone className="h-3.5 w-3.5 mr-2 flex-shrink-0" />
                    <span>{participant.phone}</span>
                  </div>
                  <div className="flex items-center">
                    <Calendar className="h-3.5 w-3.5 mr-2 flex-shrink-0" />
                    <span>{formatDate(participant.registrationDate)}</span>
                  </div>
                </div>
                
                <div className="mt-3">
                  <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    participant.status === 'Nou' ? 'bg-orange-100 text-orange-700' :
                    participant.status === 'În progres' ? 'bg-blue-100 text-blue-700' :
                    participant.status === 'Complet' ? 'bg-green-100 text-green-700' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {participant.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
      
      {/* Add clients modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen"></span>&#8203;
            
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-3xl sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="w-full">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg leading-6 font-medium text-gray-900">
                        Adaugă participanți în grupă
                      </h3>
                      <button
                        onClick={() => setShowAddModal(false)}
                        className="text-gray-400 hover:text-gray-500 focus:outline-none"
                      >
                        <X className="h-5 w-5" />
                      </button>
                    </div>
                    
                    {/* Search */}
                    <div className="relative mb-4">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="text"
                        placeholder="Caută clienți..."
                        className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        value={searchTerm}
                        onChange={handleSearch}
                      />
                    </div>
                    
                    {/* Client list */}
                    <div className="max-h-96 overflow-y-auto border border-gray-200 rounded-lg">
                      {filteredAvailableClients.length === 0 ? (
                        <div className="p-4 text-center text-gray-500">
                          Nu s-au găsit clienți disponibili pentru adăugare.
                        </div>
                      ) : (
                        <ul className="divide-y divide-gray-200">
                          {filteredAvailableClients.map((client) => (
                            <li key={client._id} className="hover:bg-gray-50">
                              <div 
                                className="py-3 px-4 flex items-center cursor-pointer"
                                onClick={() => toggleClientSelection(client._id)}
                              >
                                <div className="h-6 w-6 mr-4">
                                  <div className={`h-6 w-6 rounded-md border ${
                                    selectedClients.includes(client._id) 
                                      ? 'bg-blue-600 border-blue-600 flex items-center justify-center' 
                                      : 'border-gray-300'
                                  }`}>
                                    {selectedClients.includes(client._id) && (
                                      <Check className="h-4 w-4 text-white" />
                                    )}
                                  </div>
                                </div>
                                
                                <div className="flex-1 flex items-center">
                                  <div className="h-8 w-8 flex-shrink-0">
                                    <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-700 text-xs font-bold">
                                      {getInitials(client.name)}
                                    </div>
                                  </div>
                                  <div className="ml-3">
                                    <div className="text-sm font-medium text-gray-900">{client.name}</div>
                                    <div className="text-xs text-gray-500">{client.email}</div>
                                  </div>
                                </div>
                                
                                <div className="text-sm text-gray-500">
                                  <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                    client.status === 'Nou' ? 'bg-orange-100 text-orange-700' :
                                    client.status === 'În progres' ? 'bg-blue-100 text-blue-700' :
                                    client.status === 'Complet' ? 'bg-green-100 text-green-700' :
                                    'bg-gray-100 text-gray-800'
                                  }`}>
                                    {client.status}
                                  </span>
                                </div>
                              </div>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  className={`w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm ${
                    loading ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                  onClick={handleAddParticipants}
                  disabled={loading || selectedClients.length === 0}
                >
                  {loading ? 'Se adaugă...' : `Adaugă ${selectedClients.length} client(i)`}
                </button>
                <button
                  type="button"
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={() => setShowAddModal(false)}
                  disabled={loading}
                >
                  Anulează
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Helper function to get initials from name
const getInitials = (name) => {
  if (!name) return '';
  return name.split(' ')
    .filter(part => part.length > 0)
    .map(part => part[0].toUpperCase())
    .slice(0, 2)
    .join('');
};

export default ParticipantsTab;