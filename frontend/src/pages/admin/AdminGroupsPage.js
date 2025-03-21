import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  Search, 
  Filter, 
  PlusCircle,
  ChevronLeft,
  ChevronRight,
  Calendar,
  Users,
  MoreHorizontal,
  Edit2,
  Trash2
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import DashboardLayout from '../../components/layouts/DashboardLayout';
import LoadingScreen from '../../components/client/LoadingScreen';
import AddGroupModal from '../../components/admin/AddGroupModal';

const statusColors = {
  'Active': 'bg-green-100 text-green-700',
  'Completed': 'bg-blue-100 text-blue-700',
  'Cancelled': 'bg-red-100 text-red-700',
  'Planned': 'bg-purple-100 text-purple-700'
};

const AdminGroupsPage = () => {
  const { currentUser, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [groups, setGroups] = useState([]);
  const [error, setError] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [openMenuId, setOpenMenuId] = useState(null);
  const menuRef = useRef(null);
  
  // Pagination and filtering
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Verificăm dacă utilizatorul este autentificat și are rolul potrivit
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    } else if (currentUser && currentUser.role !== 'admin' && currentUser.role !== 'partner') {
      navigate('/');
    }
  }, [isAuthenticated, currentUser, navigate]);

  // Încărcăm grupele cu paginare și filtre
  const fetchGroups = useCallback(async () => {
    try {
      setLoading(true);
      const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5003/api';
      
      let queryString = `?page=${page}&limit=${limit}`;
      if (searchTerm) queryString += `&search=${encodeURIComponent(searchTerm)}`;
      if (statusFilter) queryString += `&status=${encodeURIComponent(statusFilter)}`;
      
      const response = await axios.get(`${API_URL}/admin/groups${queryString}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.data && response.data.success) {
        console.log('Groups data received:', response.data.data);
        setGroups(response.data.data);
        setTotal(response.data.pagination.total);
        setTotalPages(response.data.pagination.pages);
      } else {
        throw new Error('Failed to load groups');
      }
    } catch (err) {
      console.error('Error loading groups:', err);
      setError('Nu s-au putut încărca datele grupelor. Vă rugăm să încercați din nou.');
    } finally {
      setLoading(false);
    }
  }, [page, limit, searchTerm, statusFilter]);

  // Încărcăm datele la inițializare și când se schimbă filtrele
  useEffect(() => {
    if (isAuthenticated && currentUser) {
      fetchGroups();
    }
  }, [isAuthenticated, currentUser, fetchGroups]);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpenMenuId(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Gestionarea căutării
  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1); // Reset to first page on new search
    fetchGroups();
  };

  // Adăugare grupă nouă
  const handleAddGroup = (groupData) => {
    // După adăugarea grupei, reîmprospătăm lista
    fetchGroups();
    setIsAddModalOpen(false);
  };

  // Formatare dată pentru afișare
  const formatDate = (dateString) => {
    const options = { day: '2-digit', month: '2-digit', year: 'numeric' };
    return dateString ? new Date(dateString).toLocaleDateString('ro-RO', options) : 'N/A';
  };

  // Ștergere grupă
  const handleDeleteGroup = async (groupId) => {
    try {
      setLoading(true);
      const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5003/api';
      
      const response = await axios.delete(`${API_URL}/admin/groups/${groupId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.data && response.data.success) {
        // Reîmprospătăm lista de grupe
        fetchGroups();
      } else {
        throw new Error(response.data?.message || 'Failed to delete group');
      }
    } catch (err) {
      console.error('Error deleting group:', err);
      setError('Nu s-a putut șterge grupa. Vă rugăm să încercați din nou.');
    } finally {
      setLoading(false);
    }
  };

  // Calcularea procentului de ocupare
  const calculateOccupancyPercent = (clientCount, capacity) => {
    if (!capacity) return 0;
    return Math.round((clientCount / capacity) * 100);
  };

  if (loading && groups.length === 0) {
    return <LoadingScreen />;
  }

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Grupe de Curs</h1>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="bg-gradient-to-r from-green-500 to-teal-400 text-white px-5 py-2 rounded-full font-medium shadow-md hover:shadow-lg transition-all duration-300 flex items-center"
          >
            <PlusCircle className="h-5 w-5 mr-2" />
            <span>Adaugă grupă</span>
          </button>
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

        {/* Bara de acțiuni */}
        <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4 mb-6">
          <form onSubmit={handleSearch} className="md:flex-1">
            <div className="relative">
              <input
                type="text"
                placeholder="Caută după nume grupă..."
                className="glassmorphism w-full h-full pl-10 pr-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
            </div>
          </form>
          
          <div className="flex space-x-2">
            <button className="glassmorphism px-4 py-2 rounded-lg flex items-center text-gray-700 hover:bg-white/80 transition-colors">
              <Filter className="h-5 w-5 mr-2" />
              <span>Filtrează</span>
            </button>
          </div>
        </div>

        {/* Grid cu grupe */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {groups.length > 0 ? (
            groups.map((group) => (
              <div 
                key={group._id}
                className="glassmorphism p-6 rounded-xl shadow-lg cursor-pointer hover:shadow-xl transition-shadow"
                onClick={() => {
                  console.log('Navigating to group with ID:', group._id);
                  navigate(`/admin/groups/${group._id}`);
                }}
              >
                <div className="flex justify-between items-start">
                  <h3 className="text-lg font-semibold text-gray-800">{group.name}</h3>
                  <span className={`text-xs px-2 py-1 rounded-full ${statusColors[group.status] || 'bg-gray-100 text-gray-800'}`}>
                    {group.status}
                  </span>
                </div>
                
                <div className="mt-4 space-y-2">
                  <div className="flex items-center text-gray-600">
                    <Calendar className="h-4 w-4 mr-2" />
                    <span className="text-sm">
                      {formatDate(group.startDate)} - {formatDate(group.endDate)}
                    </span>
                  </div>
                  
                  <div className="flex items-center text-gray-600">
                    <Users className="h-4 w-4 mr-2" />
                    <span className="text-sm">
                      {group.clientCount || 0} / {group.capacity || 0} participanți
                    </span>
                  </div>
                  
                  <div className="mt-2">
                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                      <span>Ocupare</span>
                      <span>{calculateOccupancyPercent(group.clientCount || 0, group.capacity)}%</span>
                    </div>
                    <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-blue-500 to-purple-600" 
                        style={{ width: `${calculateOccupancyPercent(group.clientCount || 0, group.capacity)}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
                
                <div className="mt-6 flex justify-between items-center">
                  <div className="text-sm text-gray-500">
                    {group.instructor 
                      ? `Instructor: ${group.instructor.name}` 
                      : 'Fără instructor asignat'}
                  </div>
                  <div className="relative">
                    <button 
                      className="text-gray-400 hover:text-gray-600"
                      onClick={(e) => {
                        e.stopPropagation();
                        setOpenMenuId(openMenuId === group._id ? null : group._id);
                      }}
                    >
                      <MoreHorizontal className="h-5 w-5" />
                    </button>
                    
                    {openMenuId === group._id && (
                      <div 
                        ref={menuRef}
                        className="absolute z-10 right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 text-sm"
                      >
                        <button 
                          className="block px-4 py-2 text-gray-700 hover:bg-gray-100 w-full text-left flex items-center"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/admin/groups/${group._id}`);
                          }}
                        >
                          <Users className="h-4 w-4 mr-2" />
                          Vizualizare grupă
                        </button>
                        <button 
                          className="block px-4 py-2 text-gray-700 hover:bg-gray-100 w-full text-left flex items-center"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/admin/groups/${group._id}/edit`);
                          }}
                        >
                          <Edit2 className="h-4 w-4 mr-2" />
                          Editare grupă
                        </button>
                        <button 
                          className="block px-4 py-2 text-red-600 hover:bg-gray-100 w-full text-left flex items-center"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (window.confirm('Sigur doriți să ștergeți această grupă?')) {
                              handleDeleteGroup(group._id)
                            }
                          }}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Ștergere grupă
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-3 text-center py-10 glassmorphism rounded-xl">
              <p className="text-gray-500">Nu există grupe disponibile.</p>
            </div>
          )}
        </div>

        {/* Paginare */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setPage(page > 1 ? page - 1 : 1)}
                disabled={page === 1}
                className={`glassmorphism p-2 rounded-lg ${page === 1 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-white/80'}`}
              >
                <ChevronLeft className="h-5 w-5 text-gray-700" />
              </button>
              
              {Array.from({ length: Math.min(totalPages, 3) }).map((_, i) => {
                // Show current page and adjacent pages
                let pageNumber;
                if (totalPages <= 3) {
                  pageNumber = i + 1;
                } else if (page === 1) {
                  pageNumber = i + 1;
                } else if (page === totalPages) {
                  pageNumber = totalPages - 2 + i;
                } else {
                  pageNumber = page - 1 + i;
                }
                
                return (
                  <button
                    key={pageNumber}
                    onClick={() => setPage(pageNumber)}
                    className={`h-10 w-10 rounded-lg font-medium ${
                      page === pageNumber
                        ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white'
                        : 'glassmorphism text-gray-700 hover:bg-white/80'
                    }`}
                  >
                    {pageNumber}
                  </button>
                );
              })}
              
              <button
                onClick={() => setPage(page < totalPages ? page + 1 : totalPages)}
                disabled={page === totalPages}
                className={`glassmorphism p-2 rounded-lg ${page === totalPages ? 'opacity-50 cursor-not-allowed' : 'hover:bg-white/80'}`}
              >
                <ChevronRight className="h-5 w-5 text-gray-700" />
              </button>
            </div>
            
            <div className="text-sm text-gray-500">
              Afișare {(page - 1) * limit + 1} la {Math.min(page * limit, total)} din {total} rezultate
            </div>
          </div>
        )}
      </div>

      {/* Modal pentru adăugare grupă */}
      {isAddModalOpen && (
        <AddGroupModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          onAddGroup={handleAddGroup}
        />
      )}
    </DashboardLayout>
  );
};

export default AdminGroupsPage;