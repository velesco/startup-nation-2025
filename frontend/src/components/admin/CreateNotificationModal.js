import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  X,
  Send,
  Bell,
  Info,
  AlertTriangle,
  AlertCircle,
  Activity,
  FileText,
  Check,
  Users,
  Search,
  Filter,
  Calendar
} from 'lucide-react';

const typeOptions = [
  { value: 'info', label: 'Informare', icon: <Info className="h-4 w-4 text-blue-500" /> },
  { value: 'success', label: 'Succes', icon: <Check className="h-4 w-4 text-green-500" /> },
  { value: 'warning', label: 'Avertisment', icon: <AlertTriangle className="h-4 w-4 text-yellow-500" /> },
  { value: 'error', label: 'Eroare', icon: <AlertCircle className="h-4 w-4 text-red-500" /> },
  { value: 'meeting', label: 'Întâlnire', icon: <Activity className="h-4 w-4 text-purple-500" /> },
  { value: 'document', label: 'Document', icon: <FileText className="h-4 w-4 text-orange-500" /> }
];

const targetOptions = [
  { value: 'user', label: 'Utilizator specific' },
  { value: 'multiple', label: 'Utilizatori multipli' },
  { value: 'role', label: 'Tip de utilizator' },
  { value: 'all', label: 'Toți utilizatorii' }
];

const roleOptions = [
  { value: 'client', label: 'Clienți' },
  { value: 'partner', label: 'Parteneri' },
  { value: 'admin', label: 'Administratori' },
  { value: 'user', label: 'Utilizatori obișnuiți' }
];

const priorityOptions = [
  { value: 'Low', label: 'Redusă' },
  { value: 'Medium', label: 'Normală' },
  { value: 'High', label: 'Înaltă' }
];

const CreateNotificationModal = ({ onClose, onSuccess }) => {
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [type, setType] = useState('info');
  const [priority, setPriority] = useState('Medium');
  const [targetType, setTargetType] = useState('user');
  const [selectedUser, setSelectedUser] = useState('');
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [selectedRole, setSelectedRole] = useState('client');
  const [actionLink, setActionLink] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState(null);
  const [searchResults, setSearchResults] = useState([]);
  
  // Încarcă lista de utilizatori
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setIsLoading(true);
        const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5003/api';
        
        const response = await axios.get(`${API_URL}/admin/users?limit=100`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        });
        
        if (response.data && response.data.success) {
          setUsers(response.data.data);
        } else {
          throw new Error('Failed to load users');
        }
      } catch (err) {
        console.error('Error loading users:', err);
        setError('Nu s-au putut încărca utilizatorii. Te rugăm să încerci din nou.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchUsers();
  }, []);

  // Filtrare utilizatori în funcție de căutare
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setSearchResults([]);
      return;
    }
    
    const results = users.filter(user => 
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    setSearchResults(results);
  }, [searchTerm, users]);

  // Adaugă un utilizator în lista de destinatari
  const addUserToSelection = (user) => {
    if (targetType === 'user') {
      setSelectedUser(user._id);
    } else if (targetType === 'multiple' && !selectedUsers.some(u => u._id === user._id)) {
      setSelectedUsers([...selectedUsers, user]);
    }
    setSearchTerm('');
    setSearchResults([]);
  };

  // Elimină un utilizator din lista de destinatari
  const removeUser = (userId) => {
    setSelectedUsers(selectedUsers.filter(user => user._id !== userId));
  };

  // Trimite notificarea
  const sendNotification = async () => {
    // Validare
    if (!title.trim()) {
      setError('Te rugăm să introduci un titlu');
      return;
    }
    
    if (!message.trim()) {
      setError('Te rugăm să introduci un mesaj');
      return;
    }
    
    if (targetType === 'user' && !selectedUser) {
      setError('Te rugăm să selectezi un utilizator');
      return;
    }
    
    if (targetType === 'multiple' && selectedUsers.length === 0) {
      setError('Te rugăm să selectezi cel puțin un utilizator');
      return;
    }
    
    if (targetType === 'role' && !selectedRole) {
      setError('Te rugăm să selectezi un rol');
      return;
    }
    
    try {
      setIsSending(true);
      setError(null);
      const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5003/api';
      
      // Pregătim datele în funcție de tipul de destinatar
      const notificationData = {
        title,
        message,
        type,
        priority,
        actionLink: actionLink || undefined,
        expiresAt: expiryDate ? new Date(expiryDate).toISOString() : undefined
      };
      
      let response;
      
      if (targetType === 'user') {
        // Trimite către un singur utilizator
        notificationData.recipient = selectedUser;
        response = await axios.post(`${API_URL}/notifications`, notificationData, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        });
      } else if (targetType === 'multiple') {
        // Trimite către mai mulți utilizatori
        notificationData.recipients = selectedUsers.map(user => user._id);
        response = await axios.post(`${API_URL}/notifications/batch`, notificationData, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        });
      } else if (targetType === 'role') {
        // Trimite către toți utilizatorii cu un anumit rol
        notificationData.role = selectedRole;
        response = await axios.post(`${API_URL}/notifications/role`, notificationData, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        });
      } else if (targetType === 'all') {
        // Trimite către toți utilizatorii - folosim endpointul de notificare pe rol, dar specificăm toate rolurile
        const roles = ['client', 'partner', 'admin', 'user'];
        const allPromises = roles.map(role => {
          const data = { ...notificationData, role };
          return axios.post(`${API_URL}/notifications/role`, data, {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`
            }
          });
        });
        
        // Așteptăm ca toate cererile să fie completate
        await Promise.all(allPromises);
        response = { data: { success: true } };
      }
      
      if (response.data && response.data.success) {
        // Notificarea a fost trimisă cu succes
        if (onSuccess) {
          onSuccess();
        }
      } else {
        throw new Error('Failed to send notification');
      }
    } catch (err) {
      console.error('Error sending notification:', err);
      setError(err.response?.data?.message || err.message || 'Nu s-a putut trimite notificarea. Te rugăm să încerci din nou.');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-3xl max-h-[90vh] overflow-hidden">
        <div className="flex justify-between items-center border-b px-6 py-4">
          <h2 className="text-xl font-semibold text-gray-800 flex items-center">
            <Bell className="h-5 w-5 mr-2 text-blue-500" />
            Trimite Notificare Nouă
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>
        
        <div className="overflow-y-auto p-6" style={{ maxHeight: 'calc(90vh - 130px)' }}>
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded-md">
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
          
          <div className="space-y-6">
            {/* Informații de bază */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Informații de bază</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Titlu <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Titlul notificării"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tip
                  </label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {typeOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mesaj <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Conținutul notificării"
                  rows={4}
                  required
                />
              </div>
            </div>
            
            {/* Destinatari */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Destinatari</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tip destinatar
                  </label>
                  <select
                    value={targetType}
                    onChange={(e) => setTargetType(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {targetOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
                
                {targetType === 'role' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Rol utilizator
                    </label>
                    <select
                      value={selectedRole}
                      onChange={(e) => setSelectedRole(e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {roleOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
                
                {(targetType === 'user' || targetType === 'multiple') && (
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {targetType === 'user' ? 'Selectează utilizator' : 'Caută utilizatori'}
                    </label>
                    
                    <div className="relative">
                      <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full p-2 pl-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Caută după nume sau email..."
                      />
                      <Search className="absolute top-2.5 left-3 h-5 w-5 text-gray-400" />
                      
                      {searchResults.length > 0 && (
                        <div className="absolute z-10 mt-1 w-full bg-white shadow-lg rounded-md border border-gray-200 max-h-60 overflow-y-auto">
                          {searchResults.map((user) => (
                            <button
                              key={user._id}
                              onClick={() => addUserToSelection(user)}
                              className="w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center border-b border-gray-100"
                            >
                              <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 mr-3">
                                {user.name.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <div className="font-medium text-gray-800">{user.name}</div>
                                <div className="text-sm text-gray-500">{user.email}</div>
                              </div>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
              
              {/* Lista utilizatorilor selectați pentru trimitere multiplă */}
              {targetType === 'multiple' && selectedUsers.length > 0 && (
                <div className="mt-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">
                    Utilizatori selectați ({selectedUsers.length})
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedUsers.map((user) => (
                      <div 
                        key={user._id}
                        className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full flex items-center"
                      >
                        <span>{user.name}</span>
                        <button
                          onClick={() => removeUser(user._id)}
                          className="ml-2 text-blue-500 hover:text-blue-700"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Utilizator selectat pentru trimitere către un singur utilizator */}
              {targetType === 'user' && selectedUser && (
                <div className="mt-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">
                    Utilizator selectat
                  </h4>
                  <div className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full inline-flex items-center">
                    <span>{users.find(u => u._id === selectedUser)?.name || 'Utilizator'}</span>
                    <button
                      onClick={() => setSelectedUser('')}
                      className="ml-2 text-blue-500 hover:text-blue-700"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
            
            {/* Opțiuni suplimentare */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Opțiuni suplimentare</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Prioritate
                  </label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {priorityOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Data expirării
                  </label>
                  <div className="flex items-center">
                    <Calendar className="h-5 w-5 text-gray-400 mr-2" />
                    <input
                      type="datetime-local"
                      value={expiryDate}
                      onChange={(e) => setExpiryDate(e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Opțional - notificarea va fi ștearsă automat după această dată
                  </p>
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Link de acțiune
                  </label>
                  <input
                    type="url"
                    value={actionLink}
                    onChange={(e) => setActionLink(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="https://example.com/action"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Opțional - adaugă un link pe care utilizatorii îl pot accesa
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="border-t px-6 py-4 flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50"
            disabled={isSending}
          >
            Anulează
          </button>
          <button
            onClick={sendNotification}
            disabled={isSending}
            className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-5 py-2 rounded-lg font-medium hover:opacity-90 transition-colors flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSending ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-r-2 border-white mr-2"></div>
                Se trimite...
              </>
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Trimite Notificare
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateNotificationModal;