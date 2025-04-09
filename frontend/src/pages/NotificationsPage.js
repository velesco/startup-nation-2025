import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Bell,
  Filter,
  ChevronDown,
  Check,
  CheckCircle,
  Trash2,
  AlertCircle,
  RefreshCw
} from 'lucide-react';
import DashboardLayout from '../components/layouts/DashboardLayout';
import NotificationList from '../components/notifications/NotificationList';
import LoadingScreen from '../components/client/LoadingScreen';

const filterOptions = [
  { value: 'all', label: 'Toate notificările' },
  { value: 'unread', label: 'Necitite' },
  { value: 'read', label: 'Citite' }
];

const typeOptions = [
  { value: 'all', label: 'Toate tipurile' },
  { value: 'info', label: 'Informare' },
  { value: 'success', label: 'Succes' },
  { value: 'warning', label: 'Avertisment' },
  { value: 'error', label: 'Eroare' },
  { value: 'meeting', label: 'Întâlnire' },
  { value: 'document', label: 'Document' }
];

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [readFilter, setReadFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [isFilterDropdownOpen, setIsFilterDropdownOpen] = useState(false);
  const [isTypeDropdownOpen, setIsTypeDropdownOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [unreadCount, setUnreadCount] = useState(0);

  // Funcție pentru încărcarea notificărilor
  const fetchNotifications = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5003/api';
      
      // Construim parametrii pentru filtrare
      let queryParams = `page=${page}&limit=10`;
      
      if (readFilter === 'unread') {
        queryParams += '&read=false';
      } else if (readFilter === 'read') {
        queryParams += '&read=true';
      }
      
      if (typeFilter !== 'all') {
        queryParams += `&type=${typeFilter}`;
      }
      
      const [notificationsResponse, countResponse] = await Promise.all([
        axios.get(`${API_URL}/notifications?${queryParams}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }),
        axios.get(`${API_URL}/notifications/count`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        })
      ]);
      
      if (notificationsResponse.data && notificationsResponse.data.success) {
        setNotifications(notificationsResponse.data.data);
        setTotalPages(notificationsResponse.data.pagination.pages);
      } else {
        throw new Error('Failed to load notifications');
      }
      
      if (countResponse.data && countResponse.data.success) {
        setUnreadCount(countResponse.data.unreadCount);
      }
    } catch (err) {
      console.error('Error fetching notifications:', err);
      setError(err.response?.data?.message || err.message || 'Nu s-au putut încărca notificările');
    } finally {
      setIsLoading(false);
    }
  };

  // Încarcă notificările la inițializare și când se schimbă filtrele sau pagina
  useEffect(() => {
    fetchNotifications();
  }, [page, readFilter, typeFilter]);

  // Funcție pentru marcarea unei notificări ca citită
  const markAsRead = async (notificationId) => {
    try {
      const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5003/api';
      
      const response = await axios.put(`${API_URL}/notifications/${notificationId}/read`, {}, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.data && response.data.success) {
        // Actualizează notificarea în listă
        setNotifications(prevNotifications => 
          prevNotifications.map(notification => 
            notification._id === notificationId
              ? { ...notification, read: true }
              : notification
          )
        );
        
        // Actualizează contorul de necitite
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  };

  // Funcție pentru marcarea tuturor notificărilor ca citite
  const markAllAsRead = async () => {
    try {
      const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5003/api';
      
      const response = await axios.put(`${API_URL}/notifications/read-all`, {}, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.data && response.data.success) {
        // Actualizează notificările din listă
        setNotifications(prevNotifications => 
          prevNotifications.map(notification => ({ ...notification, read: true }))
        );
        
        // Resetează contorul de necitite
        setUnreadCount(0);
      }
    } catch (err) {
      console.error('Error marking all notifications as read:', err);
    }
  };

  // Funcție pentru ștergerea unei notificări
  const deleteNotification = async (notificationId) => {
    if (!window.confirm('Sigur doriți să ștergeți această notificare?')) {
      return;
    }
    
    try {
      const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5003/api';
      
      const response = await axios.delete(`${API_URL}/notifications/${notificationId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.data && response.data.success) {
        // Eliminăm notificarea din listă
        setNotifications(prevNotifications => 
          prevNotifications.filter(notification => notification._id !== notificationId)
        );
        
        // Dacă notificarea era necitită, actualizăm contorul
        const wasUnread = notifications.find(n => n._id === notificationId)?.read === false;
        if (wasUnread) {
          setUnreadCount(prev => Math.max(0, prev - 1));
        }
      }
    } catch (err) {
      console.error('Error deleting notification:', err);
    }
  };

  // Funcție pentru resetarea filtrelor
  const resetFilters = () => {
    setReadFilter('all');
    setTypeFilter('all');
    setPage(1);
  };

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center">
            <Bell className="h-6 w-6 text-blue-500 mr-3" />
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Notificările mele</h1>
              <p className="text-gray-600">
                {unreadCount > 0 
                  ? `Ai ${unreadCount} notificări necitite`
                  : 'Nu ai notificări necitite'
                }
              </p>
            </div>
          </div>
          
          <div className="flex space-x-2">
            <button
              onClick={fetchNotifications}
              className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50"
              title="Reîmprospătează"
            >
              <RefreshCw className="h-5 w-5 text-gray-600" />
            </button>
            
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="flex items-center px-4 py-2 bg-blue-50 text-blue-700 rounded-lg border border-blue-200 hover:bg-blue-100 transition-colors"
              >
                <CheckCircle className="h-5 w-5 mr-2" />
                <span>Marchează toate ca citite</span>
              </button>
            )}
          </div>
        </div>

        {/* Filtru */}
        <div className="bg-white p-4 rounded-xl shadow-sm mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:space-x-4 space-y-2 md:space-y-0">
            <div className="relative">
              <button
                onClick={() => {
                  setIsFilterDropdownOpen(!isFilterDropdownOpen);
                  setIsTypeDropdownOpen(false);
                }}
                className="flex items-center justify-between px-4 py-2 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 w-full md:w-auto"
              >
                <div className="flex items-center">
                  <Filter className="h-5 w-5 text-gray-400 mr-2" />
                  <span>{filterOptions.find(opt => opt.value === readFilter)?.label}</span>
                </div>
                <ChevronDown className="h-4 w-4 text-gray-500 ml-2" />
              </button>
              
              {isFilterDropdownOpen && (
                <div className="absolute mt-2 w-56 bg-white rounded-md shadow-lg z-20 border border-gray-200">
                  <div className="py-1">
                    {filterOptions.map(option => (
                      <button
                        key={option.value}
                        onClick={() => {
                          setReadFilter(option.value);
                          setIsFilterDropdownOpen(false);
                          setPage(1);
                        }}
                        className={`w-full text-left px-4 py-2 hover:bg-gray-100 ${
                          readFilter === option.value ? 'bg-blue-50 text-blue-600' : 'text-gray-700'
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            <div className="relative">
              <button
                onClick={() => {
                  setIsTypeDropdownOpen(!isTypeDropdownOpen);
                  setIsFilterDropdownOpen(false);
                }}
                className="flex items-center justify-between px-4 py-2 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 w-full md:w-auto"
              >
                <div className="flex items-center">
                  <span>{typeOptions.find(opt => opt.value === typeFilter)?.label}</span>
                </div>
                <ChevronDown className="h-4 w-4 text-gray-500 ml-2" />
              </button>
              
              {isTypeDropdownOpen && (
                <div className="absolute mt-2 w-56 bg-white rounded-md shadow-lg z-20 border border-gray-200">
                  <div className="py-1">
                    {typeOptions.map(option => (
                      <button
                        key={option.value}
                        onClick={() => {
                          setTypeFilter(option.value);
                          setIsTypeDropdownOpen(false);
                          setPage(1);
                        }}
                        className={`w-full text-left px-4 py-2 hover:bg-gray-100 ${
                          typeFilter === option.value ? 'bg-blue-50 text-blue-600' : 'text-gray-700'
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            <button
              onClick={resetFilters}
              className="flex items-center px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Resetează filtrele
            </button>
          </div>
        </div>

        {/* Eroare */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded-lg">
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

        {/* Lista de notificări */}
        {isLoading ? (
          <LoadingScreen />
        ) : notifications.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl shadow-sm">
            <Bell className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900">Nicio notificare găsită</h3>
            <p className="mt-2 text-sm text-gray-500">
              {readFilter !== 'all' || typeFilter !== 'all'
                ? 'Încercați să modificați filtrele pentru a vedea notificările'
                : 'Nu aveți notificări în acest moment'}
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm p-4">
            <NotificationList 
              notifications={notifications} 
              onDelete={deleteNotification}
              onMarkAsRead={markAsRead}
            />
            
            {/* Paginare */}
            {totalPages > 1 && (
              <div className="flex justify-center mt-6">
                <div className="inline-flex items-center">
                  <button
                    onClick={() => setPage(prev => Math.max(1, prev - 1))}
                    disabled={page === 1}
                    className={`px-3 py-1 rounded-l-md ${
                      page === 1 
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                        : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                    }`}
                  >
                    &laquo; Anterior
                  </button>
                  
                  <div className="px-4 py-1 bg-blue-50 text-blue-700 border-t border-b border-gray-300">
                    Pagina {page} din {totalPages}
                  </div>
                  
                  <button
                    onClick={() => setPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={page === totalPages}
                    className={`px-3 py-1 rounded-r-md ${
                      page === totalPages 
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                        : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                    }`}
                  >
                    Următor &raquo;
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default NotificationsPage;