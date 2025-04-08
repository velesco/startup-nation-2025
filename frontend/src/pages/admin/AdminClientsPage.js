import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  Search, 
  Filter, 
  Download, 
  Upload, 
  PlusCircle,
  ChevronLeft,
  ChevronRight,
  Eye,
  Users,
  Send,
  Mail
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import DashboardLayout from '../../components/layouts/DashboardLayout';
import LoadingScreen from '../../components/client/LoadingScreen';
import AddClientModal from '../../components/admin/AddClientModal';
import ImportClientsModal from '../../components/clients/ImportClientsModal';
import ExportClientsModal from '../../components/clients/ExportClientsModal';
import SendEmailToClientModal from '../../components/admin/SendEmailToClientModal';

const statusColors = {
  'Nou': 'bg-orange-100 text-orange-700',
  'În progres': 'bg-blue-100 text-blue-700',
  'Complet': 'bg-green-100 text-green-700',
  'Respins': 'bg-red-100 text-red-700'
};

const AdminClientsPage = () => {
  const { currentUser, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [clients, setClients] = useState([]);
  const [error, setError] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);
  const [statsData, setStatsData] = useState(null);
  
  // Pagination and filtering
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedClients, setSelectedClients] = useState([]);

  // Verificăm dacă utilizatorul este autentificat și are rolul potrivit
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    } else if (currentUser && currentUser.role !== 'admin' && currentUser.role !== 'partner') {
      navigate('/');
    }
  }, [isAuthenticated, currentUser, navigate]);

  // Încărcare date statistice
  const fetchStatistics = async () => {
    try {
      const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5003/api';
      
      const response = await axios.get(`${API_URL}/admin/clients/statistics`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.data && response.data.success) {
        setStatsData(response.data.data);
      }
    } catch (err) {
      console.error('Error loading client statistics:', err);
    }
  };

  // Încărcăm clienții cu paginare și filtre
  const fetchClients = useCallback(async () => {
    try {
      setLoading(true);
      const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5003/api';
      
      // Fetch all groups first to have them available
      let groups = [];
      try {
        const groupsResponse = await axios.get(`${API_URL}/admin/groups?limit=100`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        });
        
        if (groupsResponse.data && groupsResponse.data.success) {
          groups = groupsResponse.data.data;
          console.log('Available groups:', groups);
        }
      } catch (err) {
        console.error('Error loading groups:', err);
      }
      
      // Fetch clients
      let queryString = `?page=${page}&limit=${limit}`;
      if (searchTerm) queryString += `&search=${encodeURIComponent(searchTerm)}`;
      if (statusFilter) queryString += `&status=${encodeURIComponent(statusFilter)}`;
      
      const response = await axios.get(`${API_URL}/admin/clients${queryString}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.data && response.data.success) {
        console.log('Raw client data:', response.data.data);
        
        const processedClients = response.data.data.map(client => {
          // Log raw client data
        console.log(`Raw client data for ${client.name}:`, JSON.stringify(client));
        
        // Construiește un obiect groupInfo indiferent de forma datelor
        const hasGroup = client.group !== null && client.group !== undefined;
        const isGroupObject = hasGroup && typeof client.group === 'object' && client.group !== null;
        const isGroupId = hasGroup && typeof client.group === 'string';
        
        let groupInfo = {
          id: null,
          name: 'Nealocat'
        };
        
        // Dacă client.group este un obiect
        if (isGroupObject && client.group._id) {
          groupInfo = {
            id: client.group._id,
            name: client.group.name || 'Grupă 1'
        };
        }
        // Dacă client.group este un string (ID)
        else if (isGroupId) {
        const foundGroup = groups.find(g => g._id === client.group);
        groupInfo = {
            id: client.group,
              name: foundGroup ? foundGroup.name : 'Grupă 1'
            };
        }
        
        // Hack: Forțăm un grup pentru toți clienții pentru a rezolva problema
       
            return {
                ...client,
                groupInfo
            };
        });
        
        console.log('Processed clients with group info:', processedClients);
        setClients(processedClients);
        setTotal(response.data.pagination.total);
        setTotalPages(response.data.pagination.pages);
      } else {
        throw new Error('Failed to load clients');
      }
    } catch (err) {
      console.error('Error loading clients:', err);
      setError('Nu s-au putut încărca datele clienților. Vă rugăm să încercați din nou.');
    } finally {
      setLoading(false);
    }
  }, [page, limit, searchTerm, statusFilter]);

  // Încărcăm datele la inițializare și când se schimbă filtrele
  useEffect(() => {
    if (isAuthenticated && currentUser) {
      fetchClients();
      fetchStatistics();
    }
  }, [isAuthenticated, currentUser, fetchClients]);

  // Gestionarea selecției clienților
  const toggleClientSelection = (clientId) => {
    setSelectedClients(prev => 
      prev.includes(clientId) 
        ? prev.filter(id => id !== clientId) 
        : [...prev, clientId]
    );
  };

  // Gestionarea selecției tuturor clienților
  const toggleSelectAllClients = () => {
    if (selectedClients.length === clients.length) {
      setSelectedClients([]);
    } else {
      setSelectedClients(clients.map(client => client._id));
    }
  };

  // Gestionarea căutării
  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1); // Reset to first page on new search
    fetchClients();
  };

  const handleAddClient = (clientData) => {
    // După adăugarea clientului, reîmprospătăm lista
    fetchClients();
    fetchStatistics();
    setIsAddModalOpen(false);
  };

  // Generam inițialele pentru client
  const getInitials = (name) => {
    if (!name) return '';
    return name.split(' ')
      .filter(part => part.length > 0)
      .map(part => part[0].toUpperCase())
      .slice(0, 2)
      .join('');
  };

  const handleSendEmail = (client, e) => {
    e.stopPropagation(); // Prevent navigating to client details
    setSelectedClient(client);
    setIsEmailModalOpen(true);
  };

  // Formatare dată pentru afișare
  const formatDate = (dateString) => {
    const options = { day: '2-digit', month: '2-digit', year: 'numeric' };
    return new Date(dateString).toLocaleDateString('ro-RO', options);
  };

  if (loading && clients.length === 0) {
    return <LoadingScreen />;
  }

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Lista Clienți</h1>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="bg-gradient-to-r from-orange-500 to-pink-500 text-white px-5 py-2 rounded-full font-medium shadow-md hover:shadow-lg transition-all duration-300 flex items-center"
          >
            <PlusCircle className="h-5 w-5 mr-2" />
            <span>Adaugă client</span>
          </button>
        </div>

        {/* Statistici */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <div className="glassmorphism rounded-xl p-6 shadow-lg overflow-hidden relative">
            <div className="relative z-10">
              <h3 className="text-gray-500 text-sm">Total Clienți</h3>
              <p className="text-3xl font-bold mt-2 bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
                {clients.length || 0}
              </p>
              <div className="mt-2 h-0.5 w-7 bg-gray-200 rounded-full"></div>
              <div className="mt-4 flex items-center">
                <span className="text-gray-500">
                  {clients.filter(client => client.status === 'În progres').length || 0} în progres
                </span>
              </div>
            </div>
            <div className="absolute top-0 right-0 w-48 h-48 rounded-full opacity-5 bg-blue-500 transform translate-x-12 -translate-y-12"></div>
          </div>
          <div className="glassmorphism rounded-xl p-6 shadow-lg overflow-hidden relative">
            <div className="relative z-10">
              <h3 className="text-gray-500 text-sm">Înscriși la Curs</h3>
              <p className="text-3xl font-bold mt-2 bg-gradient-to-r from-green-500 to-teal-400 bg-clip-text text-transparent">
                {clients.filter(client => client.status === 'Complet').length || 0}
              </p>
              <div className="mt-2 h-0.5 w-7 bg-gray-200 rounded-full"></div>
              <div className="mt-4 flex items-center">
                <span className="text-green-500">
                  {clients.length > 0
                    ? Math.round((clients.filter(client => client.status === 'Complet').length / clients.length) * 100)
                    : 0}%
                </span>
                <span className="text-gray-500 ml-1">rată de conversie</span>
              </div>
            </div>
            <div className="absolute top-0 right-0 w-48 h-48 rounded-full opacity-5 bg-green-500 transform translate-x-12 -translate-y-12"></div>
          </div>
          <div className="glassmorphism rounded-xl p-6 shadow-lg overflow-hidden relative">
            <div className="relative z-10">
              <h3 className="text-gray-500 text-sm">Clienți Noi (Luna curentă)</h3>
              <p className="text-3xl font-bold mt-2 bg-gradient-to-r from-orange-500 to-pink-500 bg-clip-text text-transparent">
                {clients.filter(client => client.status === 'Nou').length || 0}
              </p>
              <div className="mt-2 h-0.5 w-7 bg-gray-200 rounded-full"></div>
              <div className="mt-4 flex items-center">
                <span className="text-gray-500">
                  Necesită procesare
                </span>
              </div>
            </div>
            <div className="absolute top-0 right-0 w-48 h-48 rounded-full opacity-5 bg-orange-500 transform translate-x-12 -translate-y-12"></div>
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

        {/* Bara de acțiuni */}
        <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4 mb-6">
          <form onSubmit={handleSearch} className="md:flex-1">
            <div className="relative">
              <input
                type="text"
                placeholder="Caută după nume, email sau telefon..."
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
            
            <button 
              className="glassmorphism px-4 py-2 rounded-lg flex items-center text-gray-700 hover:bg-white/80 transition-colors"
              onClick={() => setIsExportModalOpen(true)}
            >
              <Download className="h-5 w-5 mr-2" />
              <span>Export</span>
            </button>
            
            <button 
              className="glassmorphism px-4 py-2 rounded-lg flex items-center text-gray-700 hover:bg-white/80 transition-colors"
              onClick={() => setIsImportModalOpen(true)}
            >
              <Upload className="h-5 w-5 mr-2" />
              <span>Import</span>
            </button>
          </div>
        </div>

        {/* Tabel Clienți */}
        <div className="overflow-x-auto">
          <div className="glassmorphism p-1 rounded-xl shadow-lg mb-6">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr className="bg-white/70">
                  <th scope="col" className="p-4 text-left">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                        checked={selectedClients.length === clients.length && clients.length > 0}
                        onChange={toggleSelectAllClients}
                      />
                    </div>
                  </th>
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
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Grupă
                  </th>
                  <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acțiuni
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white/50">
                {clients.map((client) => (
                  <tr 
                    key={client._id}
                    className="hover:bg-gray-50 transition-colors cursor-pointer"
                    onClick={() => navigate(`/admin/clients/${client._id}`)}
                  >
                    <td className="p-4 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                          checked={selectedClients.includes(client._id)}
                          onChange={() => toggleClientSelection(client._id)}
                        />
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 flex-shrink-0">
                          <div className="h-10 w-10 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-bold">
                            {getInitials(client.name)}
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{client.name}</div>
                          <div className="text-sm text-gray-500">ID: {client._id.substr(-5)}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{client.email}</div>
                      <div className="text-sm text-gray-500">{client.phone}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${statusColors[client.status] || 'bg-gray-100 text-gray-800'}`}>
                        {client.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(client.registrationDate)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {client.groupInfo?.id ? (
                        <span 
                          className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-700 items-center"
                          onClick={(e) => {
                            e.stopPropagation();
                          }}
                        >
                          <Users className="h-3 w-3 mr-1" />
                          {client.groupInfo.name}
                        </span>
                      ) : (
                        <span className="text-sm text-gray-500">Nealocat</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-center space-x-2">
                        <button 
                          className="p-2 text-orange-600 hover:bg-orange-50 rounded-md transition-colors"
                          onClick={(e) => handleSendEmail(client, e)}
                          title="Trimite email"
                        >
                          <Mail className="h-5 w-5" />
                        </button>
                        
                        <button 
                          className="text-blue-600 hover:text-blue-800 px-4 py-2 rounded-lg bg-blue-50 hover:bg-blue-100 transition-colors"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/admin/clients/${client._id}`);
                          }}
                        >
                          <div className="flex items-center">
                            <Eye className="h-5 w-5 mr-2" />
                            <span className="font-medium">Vizualizare</span>
                          </div>
                        </button>
                      </div>
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

      {/* Modal pentru trimitere email */}
      {isEmailModalOpen && selectedClient && (
        <SendEmailToClientModal
          isOpen={isEmailModalOpen}
          onClose={() => setIsEmailModalOpen(false)}
          clientId={selectedClient._id}
          clientEmail={selectedClient.email}
          clientName={selectedClient.name}
        />
      )}

      {/* Modal pentru adăugare client */}
      {isAddModalOpen && (
        <AddClientModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          onAddClient={handleAddClient}
        />
      )}

      {/* Modal pentru import clienți */}
      {isImportModalOpen && (
        <ImportClientsModal
          isOpen={isImportModalOpen}
          onClose={() => setIsImportModalOpen(false)}
          onImportSuccess={() => {
            fetchClients();
            fetchStatistics();
            setIsImportModalOpen(false);
          }}
        />
      )}

      {/* Modal pentru export clienți */}
      {isExportModalOpen && (
        <ExportClientsModal
          isOpen={isExportModalOpen}
          onClose={() => setIsExportModalOpen(false)}
          clients={clients}
        />
      )}
    </DashboardLayout>
  );
};

export default AdminClientsPage;