import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  Search, 
  Filter, 
  PlusCircle,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  Building,
  Mail,
  Calendar,
  Clock
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import DashboardLayout from '../../components/layouts/DashboardLayout';
import LoadingScreen from '../../components/client/LoadingScreen';
import AddUserModal from '../../components/admin/AddUserModal';

const roleColors = {
  'admin': 'bg-purple-100 text-purple-700',
  'partner': 'bg-blue-100 text-blue-700',
  'client': 'bg-green-100 text-green-700',
  'user': 'bg-gray-100 text-gray-700',
  'super-admin': 'bg-red-100 text-red-700'
};

const AdminUsersPage = () => {
  const { currentUser, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [error, setError] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  
  // Pagination and filtering
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');

  // Verificăm dacă utilizatorul este autentificat și are rolul potrivit
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    } else if (currentUser && currentUser.role !== 'admin' && currentUser.role !== 'super-admin') {
      navigate('/');
    }
  }, [isAuthenticated, currentUser, navigate]);

  // Încărcăm utilizatorii cu paginare și filtre
  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5003/api';
      
      let queryString = `?page=${page}&limit=${limit}`;
      if (searchTerm) queryString += `&search=${encodeURIComponent(searchTerm)}`;
      if (roleFilter) queryString += `&role=${encodeURIComponent(roleFilter)}`;
      
      const response = await axios.get(`${API_URL}/admin/users${queryString}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.data && response.data.success) {
        setUsers(response.data.data);
        setTotal(response.data.pagination.total);
        setTotalPages(response.data.pagination.pages);
      } else {
        throw new Error('Failed to load users');
      }
    } catch (err) {
      console.error('Error loading users:', err);
      setError('Nu s-au putut încărca datele utilizatorilor. Vă rugăm să încercați din nou.');
    } finally {
      setLoading(false);
    }
  }, [page, limit, searchTerm, roleFilter]);

  // Încărcăm datele la inițializare și când se schimbă filtrele
  useEffect(() => {
    if (isAuthenticated && currentUser) {
      fetchUsers();
    }
  }, [isAuthenticated, currentUser, fetchUsers]);

  // Gestionarea căutării
  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1); // Reset to first page on new search
    fetchUsers();
  };

  // Adăugare utilizator nou
  const handleAddUser = (userData) => {
    // După adăugarea utilizatorului, reîmprospătăm lista
    fetchUsers();
    setIsAddModalOpen(false);
  };

  // Generam inițialele pentru utilizator
  const getInitials = (name) => {
    if (!name) return '';
    return name.split(' ')
      .filter(part => part.length > 0)
      .map(part => part[0].toUpperCase())
      .slice(0, 2)
      .join('');
  };

  // Formatare dată pentru afișare
  const formatDate = (dateString) => {
    const options = { day: '2-digit', month: '2-digit', year: 'numeric' };
    return new Date(dateString).toLocaleDateString('ro-RO', options);
  };

  // Formatare data ultimei conectări
  const formatLastLogin = (dateString) => {
    if (!dateString) return 'Niciodată';
    
    const now = new Date();
    const lastLogin = new Date(dateString);
    const diffMs = now - lastLogin;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      if (diffHours === 0) {
        const diffMinutes = Math.floor(diffMs / (1000 * 60));
        return `Acum ${diffMinutes} minute`;
      }
      return `Acum ${diffHours} ore`;
    } else if (diffDays === 1) {
      return 'Ieri';
    } else if (diffDays < 7) {
      return `Acum ${diffDays} zile`;
    }
    
    return formatDate(dateString);
  };

  if (loading && users.length === 0) {
    return <LoadingScreen />;
  }

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Utilizatori</h1>
          {currentUser && currentUser.role === 'admin' && (
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-5 py-2 rounded-full font-medium shadow-md hover:shadow-lg transition-all duration-300 flex items-center"
            >
              <PlusCircle className="h-5 w-5 mr-2" />
              <span>Adaugă utilizator</span>
            </button>
          )}
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
                placeholder="Caută după nume, email sau organizație..."
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
            <select
              className="glassmorphism px-4 py-2 rounded-lg text-gray-700"
              value={roleFilter}
              onChange={(e) => {
                setRoleFilter(e.target.value);
                setPage(1);
              }}
            >
              <option value="">Toate rolurile</option>
              <option value="admin">Administrator</option>
              <option value="partner">Partener</option>
              <option value="client">Client</option>
              <option value="user">Utilizator</option>
            </select>
            
            <button className="glassmorphism px-4 py-2 rounded-lg flex items-center text-gray-700 hover:bg-white/80 transition-colors">
              <Filter className="h-5 w-5 mr-2" />
              <span>Mai multe filtre</span>
            </button>
          </div>
        </div>

        {/* Tabel Utilizatori */}
        <div className="overflow-x-auto">
          <div className="glassmorphism p-1 rounded-xl shadow-lg mb-6">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr className="bg-white/70">
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Utilizator
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Organizație
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rol
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ultima conectare
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Înregistrat
                  </th>
                  <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acțiuni
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white/50">
                {users.map((user) => (
                  <tr 
                    key={user._id}
                    className="hover:bg-gray-50 transition-colors cursor-pointer"
                    onClick={() => navigate(`/admin/users/${user._id}`)}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 flex-shrink-0">
                          <div className="h-10 w-10 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-bold">
                            {getInitials(user.name)}
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{user.name}</div>
                          <div className="text-sm text-gray-500">ID: {user._id.substr(-5)}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-900">
                        <Mail className="h-4 w-4 mr-1 text-gray-400" />
                        {user.email}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-900">
                        {user.organization ? (
                          <>
                            <Building className="h-4 w-4 mr-1 text-gray-400" />
                            {user.organization}
                            {user.position && <span className="text-xs text-gray-500 ml-1">({user.position})</span>}
                          </>
                        ) : (
                          <span className="text-gray-500">-</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${roleColors[user.role] || 'bg-gray-100 text-gray-800'}`}>
                        {user.role === 'admin' ? 'Administrator' : 
                          user.role === 'partner' ? 'Partener' : 
                          user.role === 'client' ? 'Client' : 
                          user.role === 'super-admin' ? 'Super Admin' : 
                          'Utilizator'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-500">
                        <Clock className="h-4 w-4 mr-1 text-gray-400" />
                        {formatLastLogin(user.lastLogin)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-500">
                        <Calendar className="h-4 w-4 mr-1 text-gray-400" />
                        {formatDate(user.createdAt)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center" onClick={(e) => e.stopPropagation()}>
                      <button className="text-gray-500 hover:text-gray-700">
                        <MoreHorizontal className="h-5 w-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Paginare */}
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
      </div>

      {/* Modal pentru adăugare utilizator */}
      {isAddModalOpen && (
        <AddUserModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          onAddUser={handleAddUser}
        />
      )}
    </DashboardLayout>
  );
};

export default AdminUsersPage;