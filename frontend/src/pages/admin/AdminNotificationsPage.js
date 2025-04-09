import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Bell,
  Users,
  Send,
  Search,
  Filter,
  Plus,
  ChevronDown,
  Check,
  X,
  Info,
  AlertTriangle,
  AlertCircle,
  Activity,
  FileText
} from 'lucide-react';
import DashboardLayout from '../../components/layouts/DashboardLayout';
import LoadingScreen from '../../components/client/LoadingScreen';
import CreateNotificationModal from '../../components/admin/CreateNotificationModal';
import NotificationList from '../../components/notifications/NotificationList';
import { useAuth } from '../../contexts/AuthContext';

const typeOptions = [
  { value: 'all', label: 'Toate tipurile', icon: <Bell className="h-4 w-4" /> },
  { value: 'info', label: 'Informare', icon: <Info className="h-4 w-4 text-blue-500" /> },
  { value: 'success', label: 'Succes', icon: <Check className="h-4 w-4 text-green-500" /> },
  { value: 'warning', label: 'Avertisment', icon: <AlertTriangle className="h-4 w-4 text-yellow-500" /> },
  { value: 'error', label: 'Eroare', icon: <AlertCircle className="h-4 w-4 text-red-500" /> },
  { value: 'meeting', label: 'Întâlnire', icon: <Activity className="h-4 w-4 text-purple-500" /> },
  { value: 'document', label: 'Document', icon: <FileText className="h-4 w-4 text-orange-500" /> }
];

const AdminNotificationsPage = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [isTypeDropdownOpen, setIsTypeDropdownOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Verifică dacă utilizatorul are drepturile necesare
  useEffect(() => {
    if (currentUser && (currentUser.role !== 'admin' && currentUser.role !== 'super-admin')) {
      navigate('/dashboard');
    }
  }, [currentUser, navigate]);

  // Funcție pentru încărcarea notificărilor
  const fetchNotifications = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5003/api';
      
      // Construiește parametrii de query pentru filtrare
      let queryParams = `page=${page}&limit=10`;
      
      if (selectedType !== 'all') {
        queryParams += `&type=${selectedType}`;
      }
      
      if (searchTerm) {
        queryParams += `&search=${encodeURIComponent(searchTerm)}`;
      }
      
      const response = await axios.get(
        `${API_URL}/admin/notifications?${queryParams}`, 
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      
      if (response.data && response.data.success) {
        setNotifications(response.data.data);
        setTotalPages(response.data.pagination.pages);
      } else {
        throw new Error('Failed to load notifications');
      }
    } catch (err) {
      console.error('Error loading notifications:', err);
      setError(err.response?.data?.message || err.message || 'Nu s-au putut încărca notificările');
    } finally {
      setIsLoading(false);
    }
  };

  // Încarcă notificările la inițializare și când se schimbă filtrele
  useEffect(() => {
    fetchNotifications();
  }, [page, selectedType, searchTerm]);

  // Funcție pentru gestionarea căutării
  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1); // Reset la prima pagină
    fetchNotifications();
  };

  // Funcție pentru resetarea filtrelor
  const resetFilters = () => {
    setSearchTerm('');
    setSelectedType('all');
    setPage(1);
  };

  // Funcție pentru ștergerea unei notificări
  const handleDeleteNotification = async (notificationId) => {
    if (!window.confirm('Sigur doriți să ștergeți această notificare?')) {
      return;
    }
    
    try {
      const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5003/api';
      
      const response = await axios.delete(
        `${API_URL}/admin/notifications/${notificationId}`, 
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      
      if (response.data && response.data.success) {
        // Filtrăm notificarea din lista existentă
        setNotifications(prevNotifications => 
          prevNotifications.filter(notification => notification._id !== notificationId)
        );
      } else {
        throw new Error('Failed to delete notification');
      }
    } catch (err) {
      console.error('Error deleting notification:', err);
      setError(err.response?.data?.message || err.message || 'Nu s-a putut șterge notificarea');
    }
  };

  // Funcție pentru trimiterea unei notificări către toți utilizatorii
  const handleNotificationCreated = () => {
    setIsCreateModalOpen(false);
    fetchNotifications(); // Reîncarcă lista de notificări
  };

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Gestionare Notificări</h1>
            <p className="text-gray-600">Trimiteți și gestionați notificări către utilizatori</p>
          </div>
          
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-2 rounded-lg hover:opacity-90 transition-colors flex items-center"
          >
            <Plus className="h-5 w-5 mr-2" />
            <span>Notificare Nouă</span>
          </button>
        </div>

        {/* Filtru și căutare */}
        <div className="bg-white p-4 rounded-xl shadow-sm mb-6">
          <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
            <div className="flex-1">
              <form onSubmit={handleSearch} className="relative">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Caută în titlu sau conținut..."
                  className="w-full p-2 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <Search className="absolute top-2.5 left-3 h-5 w-5 text-gray-400" />
              </form>
            </div>
            
            <div className="relative">
              <button
                onClick={() => setIsTypeDropdownOpen(!isTypeDropdownOpen)}
                className="w-full sm:w-auto flex items-center justify-between px-4 py-2 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <div className="flex items-center">
                  <Filter className="h-5 w-5 text-gray-400 mr-2" />
                  <span>
                    {typeOptions.find(opt => opt.value === selectedType)?.label || 'Tip'}
                  </span>
                </div>
                <ChevronDown className="h-4 w-4 text-gray-500 ml-2" />
              </button>
              
              {isTypeDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-md shadow-lg z-20 border border-gray-200">
                  <div className="py-1">
                    {typeOptions.map((option) => (
                      <button
                        key={option.value}
                        onClick={() => {
                          setSelectedType(option.value);
                          setIsTypeDropdownOpen(false);
                          setPage(1);
                        }}
                        className={`w-full text-left px-4 py-2 flex items-center hover:bg-gray-100 ${
                          selectedType === option.value ? 'bg-blue-50 text-blue-600' : 'text-gray-700'
                        }`}
                      >
                        {option.icon}
                        <span className="ml-3">{option.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            <button
              onClick={resetFilters}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-gray-700"
            >
              Resetează
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
              {searchTerm || selectedType !== 'all' 
                ? 'Încercați să modificați filtrele pentru a găsi notificări'
                : 'Nu există notificări în sistem. Creați o notificare nouă pentru a începe.'}
            </p>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="mt-4 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <Plus className="h-4 w-4 mr-2" />
              Notificare Nouă
            </button>
          </div>
        ) : (
          <NotificationList 
            notifications={notifications} 
            onDelete={handleDeleteNotification}
            isAdmin={true}
          />
        )}

        {/* Paginare */}
        {totalPages > 1 && (
          <div className="flex justify-center mt-6">
            <div className="flex space-x-2">
              <button
                onClick={() => setPage(page => Math.max(1, page - 1))}
                disabled={page === 1}
                className={`px-4 py-2 rounded-md ${
                  page === 1
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Anterior
              </button>
              
              <div className="flex items-center px-4 py-2 bg-white border border-gray-300 rounded-md">
                <span className="text-gray-700">
                  Pagina {page} din {totalPages}
                </span>
              </div>
              
              <button
                onClick={() => setPage(page => Math.min(totalPages, page + 1))}
                disabled={page === totalPages}
                className={`px-4 py-2 rounded-md ${
                  page === totalPages
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Următor
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal pentru crearea notificărilor */}
      {isCreateModalOpen && (
        <CreateNotificationModal 
          onClose={() => setIsCreateModalOpen(false)}
          onSuccess={handleNotificationCreated}
        />
      )}
    </DashboardLayout>
  );
};

export default AdminNotificationsPage;