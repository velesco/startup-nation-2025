import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { X, Check, Search, AlertCircle, Share2 } from 'lucide-react';

const MaterialShareModal = ({ isOpen, onClose, material, onSuccess }) => {
  const [groups, setGroups] = useState([]);
  const [selectedGroups, setSelectedGroups] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Încărcarea listei de grupe și utilizatori pentru partajare
  useEffect(() => {
    const fetchShareOptions = async () => {
      try {
        setLoading(true);
        const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5003/api';
        
        // Încărcăm grupele
        const groupsResponse = await axios.get(`${API_URL}/admin/groups?limit=100`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        });
        
        if (groupsResponse.data && groupsResponse.data.success) {
          setGroups(groupsResponse.data.data);
        }
        
        // Încărcăm utilizatorii (parteneri și clienți)
        const usersResponse = await axios.get(`${API_URL}/admin/users?limit=100&role=partner,client`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        });
        
        if (usersResponse.data && usersResponse.data.success) {
          setUsers(usersResponse.data.data);
        }
      } catch (err) {
        console.error('Error loading share options:', err);
        setError('Nu s-au putut încărca opțiunile pentru partajare. Vă rugăm să încercați din nou.');
      } finally {
        setLoading(false);
      }
    };
    
    if (isOpen && material) {
      fetchShareOptions();
    }
  }, [isOpen, material]);
  
  if (!isOpen || !material) return null;
  
  // Filtrarea grupelor și utilizatorilor în funcție de termenul de căutare
  const filteredGroups = groups.filter(group => 
    group.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (user.email && user.email.toLowerCase().includes(searchTerm.toLowerCase()))
  );
  
  // Toggle selecție grupă
  const toggleGroupSelection = (groupId) => {
    if (selectedGroups.includes(groupId)) {
      setSelectedGroups(selectedGroups.filter(id => id !== groupId));
    } else {
      setSelectedGroups([...selectedGroups, groupId]);
    }
  };
  
  // Toggle selecție utilizator
  const toggleUserSelection = (userId) => {
    if (selectedUsers.includes(userId)) {
      setSelectedUsers(selectedUsers.filter(id => id !== userId));
    } else {
      setSelectedUsers([...selectedUsers, userId]);
    }
  };
  
  // Handler pentru partajare
  const handleShare = async () => {
    if (selectedGroups.length === 0 && selectedUsers.length === 0) {
      setError('Selectați cel puțin o grupă sau un utilizator pentru partajare.');
      return;
    }
    
    try {
      setSubmitting(true);
      setError(null);
      const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5003/api';
      
      const response = await axios.post(
        `${API_URL}/admin/materials/${material.id}/share`,
        {
          groupIds: selectedGroups,
          userIds: selectedUsers
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      
      if (response.data && response.data.success) {
        onSuccess();
      } else {
        throw new Error(response.data?.message || 'Failed to share material');
      }
    } catch (err) {
      console.error('Error sharing material:', err);
      setError(err.response?.data?.message || 'Nu s-a putut partaja materialul. Vă rugăm să încercați din nou.');
    } finally {
      setSubmitting(false);
    }
  };
  
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4">
        <div className="fixed inset-0 bg-black bg-opacity-30 backdrop-blur-sm" onClick={onClose}></div>
        
        <div className="relative bg-white/90 rounded-2xl shadow-xl max-w-md w-full p-6 z-10">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-800">Partajează material</h2>
            <button 
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 transition-colors"
              disabled={submitting}
            >
              <X className="h-6 w-6" />
            </button>
          </div>
          
          <p className="text-sm text-gray-600 mb-4">
            Partajați <span className="font-medium">{typeof material.name === 'string' ? material.name : JSON.stringify(material.name)}</span> cu grupele sau utilizatorii selectați.
          </p>
          
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
          
          {/* Caută grupe sau utilizatori */}
          <div className="mb-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Caută grupe sau utilizatori..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                disabled={loading || submitting}
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
            </div>
          </div>
          
          {/* Tabs pentru grupe și utilizatori */}
          <div className="mb-4 border-b">
            <div className="flex -mb-px">
              <button
                className={`mr-8 py-2 border-b-2 ${
                  true
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Selectează destinatari
              </button>
            </div>
          </div>
          
          {loading ? (
            <div className="py-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-sm text-gray-500">Se încarcă opțiunile...</p>
            </div>
          ) : (
            <div className="max-h-60 overflow-y-auto mb-4">
              {/* Grupe */}
              {filteredGroups.length > 0 && (
                <div className="mb-2">
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                    Grupe
                  </h3>
                  <div className="space-y-1">
                    {filteredGroups.map(group => (
                      <div
                        key={group._id}
                        className={`flex items-center p-2 hover:bg-gray-50 rounded cursor-pointer ${
                          selectedGroups.includes(group._id) ? 'bg-blue-50' : ''
                        }`}
                        onClick={() => toggleGroupSelection(group._id)}
                      >
                        <div className={`w-5 h-5 mr-3 flex items-center justify-center rounded border ${
                          selectedGroups.includes(group._id)
                            ? 'bg-blue-500 border-blue-500'
                            : 'border-gray-300'
                        }`}>
                          {selectedGroups.includes(group._id) && (
                            <Check className="h-3 w-3 text-white" />
                          )}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-800">{typeof group.name === 'string' ? group.name : JSON.stringify(group.name)}</p>
                          <p className="text-xs text-gray-500">
                            {group.participantsCount || 0} participanți
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Utilizatori */}
              {filteredUsers.length > 0 && (
                <div>
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                    Utilizatori
                  </h3>
                  <div className="space-y-1">
                    {filteredUsers.map(user => (
                      <div
                        key={user._id}
                        className={`flex items-center p-2 hover:bg-gray-50 rounded cursor-pointer ${
                          selectedUsers.includes(user._id) ? 'bg-blue-50' : ''
                        }`}
                        onClick={() => toggleUserSelection(user._id)}
                      >
                        <div className={`w-5 h-5 mr-3 flex items-center justify-center rounded border ${
                          selectedUsers.includes(user._id)
                            ? 'bg-blue-500 border-blue-500'
                            : 'border-gray-300'
                        }`}>
                          {selectedUsers.includes(user._id) && (
                            <Check className="h-3 w-3 text-white" />
                          )}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-800">{typeof user.name === 'string' ? user.name : JSON.stringify(user.name)}</p>
                          <p className="text-xs text-gray-500">{user.email || user.role}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {filteredGroups.length === 0 && filteredUsers.length === 0 && (
                <div className="py-4 text-center">
                  <p className="text-sm text-gray-500">Nu s-au găsit rezultate.</p>
                </div>
              )}
            </div>
          )}
          
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors"
              disabled={submitting}
            >
              Anulează
            </button>
            <button
              type="button"
              onClick={handleShare}
              className="px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:opacity-90 text-white rounded-lg font-medium transition-all flex items-center"
              disabled={submitting || (selectedGroups.length === 0 && selectedUsers.length === 0)}
            >
              {submitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Se partajează...
                </>
              ) : (
                <>
                  <Share2 className="h-4 w-4 mr-2" />
                  Partajează
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MaterialShareModal;