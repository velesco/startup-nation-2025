import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import AddClientModal from './admin/AddClientModal';
import ImportClientsModal from './clients/ImportClientsModal';
import ExportClientsModal from './clients/ExportClientsModal';

const ClientList = () => {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClients, setSelectedClients] = useState([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  
  const navigate = useNavigate();

  // Fetch clients on component mount
  useEffect(() => {
    fetchClients();
  }, []);

  // Handle search
  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
  };

  // Filter clients based on search term
  const filteredClients = clients.filter((client) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      client.name.toLowerCase().includes(searchLower) ||
      client.email.toLowerCase().includes(searchLower) ||
      client.phone.includes(searchTerm)
    );
  });

  // Handle add new client
  const handleAddClient = () => {
    setIsAddModalOpen(true);
  };

  // Handle export clients
  const handleExportClients = () => {
    setIsExportModalOpen(true);
  };

  // Handle import clients
  const handleImportClients = () => {
    setIsImportModalOpen(true);
  };

  // Fetch clients function that can be reused
  const fetchClients = async () => {
    try {
      setLoading(true);
      // Folosim API real cu tratarea erorilor
      const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5003/api';
      
      let response;
      try {
        response = await axios.get(`${API_URL}/clients`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        });
      } catch (apiError) {
        console.warn('Nu s-au putut încărca datele clienților din API:', apiError);
        // În cazul unei erori, inițializăm cu un array gol
        response = { data: { success: true, data: [] } };
      }

      // Procesăm datele în format uniform
      const processedClients = Array.isArray(response.data.data) 
        ? response.data.data.map(client => {
            // Extragem inițialele din nume
            let initials = '';
            if (client.name) {
              const nameParts = client.name.split(' ');
              if (nameParts.length >= 2) {
                initials = nameParts[0].charAt(0) + nameParts[1].charAt(0);
              } else if (nameParts.length === 1) {
                initials = nameParts[0].charAt(0);
              }
            }

            // Formatăm data de înregistrare
            const registrationDate = client.registrationDate ? 
              new Date(client.registrationDate).toLocaleDateString('ro-RO', { day: '2-digit', month: '2-digit', year: 'numeric' }) : 
              'N/A';

            // Determinăm grupul din care face parte (dacă e alocat)
            const group = client.groupId ? 
              (client.groupName || `Grupa ${client.groupId}`) : 'Nealocat';

            // Mapăm statusul pentru consistență
            let status = 'Nou';
            if (client.status) {
              switch(client.status.toLowerCase()) {
                case 'complete':
                case 'completed':
                case 'complet':
                  status = 'Complet';
                  break;
                case 'in progress':
                case 'in_progress':
                case 'în progres':
                  status = 'În progres';
                  break;
                case 'new':
                case 'nou':
                  status = 'Nou';
                  break;
                default:
                  status = client.status;
              }
            }
            
            return {
              id: client._id || client.id || Math.random().toString(),
              initials: initials.toUpperCase() || 'NA',
              name: client.name || 'Client necunoscut',
              email: client.email || 'N/A',
              phone: client.phone || 'N/A',
              status,
              registrationDate,
              group
            };
          })
        : [];
      
      setClients(processedClients);
    } catch (error) {
      console.error('Error fetching clients:', error);
      // Pentru cazul în care apare o eroare generală, setăm lista de clienți ca array gol
      setClients([]);
    } finally {
      setLoading(false);
    }
  };

  // Handle client added successfully
  const handleClientAdded = (clientData) => {
    fetchClients();
    setIsAddModalOpen(false);
  };

  // Handle import success
  const handleImportSuccess = () => {
    fetchClients();
    setIsImportModalOpen(false);
  };

  // Handle client selection
  const handleSelectClient = (clientId) => {
    if (selectedClients.includes(clientId)) {
      setSelectedClients(selectedClients.filter(id => id !== clientId));
    } else {
      setSelectedClients([...selectedClients, clientId]);
    }
  };

  // Handle select all clients
  const handleSelectAllClients = (event) => {
    if (event.target.checked) {
      setSelectedClients(filteredClients.map(client => client.id));
    } else {
      setSelectedClients([]);
    }
  };


  // Get status badge
  const getStatusBadge = (status) => {
    switch (status) {
      case 'Complet':
        return {
          bgClass: 'bg-gradient-green-teal',
          icon: (
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
          )
        };
      case 'În progres':
        return {
          bgClass: 'bg-gradient-blue-purple',
          icon: (
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
              <circle cx="12" cy="12" r="10"></circle>
              <polyline points="12 6 12 12 16 14"></polyline>
            </svg>
          )
        };
      case 'Nou':
        return {
          bgClass: 'bg-gradient-orange-pink',
          icon: (
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
              <path d="M3 12h18"></path>
              <path d="M12 3v18"></path>
            </svg>
          )
        };
      default:
        return {
          bgClass: 'bg-gray-200',
          icon: null
        };
    }
  };

  return (
    <>
      <div className="mb-8 flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gradient-gray">Lista Clienți</h2>
        <button 
          onClick={handleAddClient}
          className="bg-gradient-orange-pink text-white px-5 py-2.5 rounded-full flex items-center font-medium text-sm shadow-md hover:shadow-lg transition-all duration-300"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="16"></line>
            <line x1="8" y1="12" x2="16" y2="12"></line>
          </svg>
          Adaugă client nou
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-6 mb-8">
        <div className="glassmorphism rounded-2xl p-6 shadow-md relative overflow-hidden hover-scale">
          <div className="absolute top-0 right-0 w-24 h-24 rounded-full bg-blue-500/10 -mr-10 -mt-10"></div>
          <div className="text-sm font-medium text-gray-500 mb-2">Total Clienți</div>
          <div className="text-3xl font-bold text-gradient-blue-purple">{clients.length}</div>
          <div className="mt-4 text-sm text-gray-500">
            Clienți înregistrați în sistem
          </div>
        </div>
        
        <div className="glassmorphism rounded-2xl p-6 shadow-md relative overflow-hidden hover-scale">
          <div className="absolute top-0 right-0 w-24 h-24 rounded-full bg-green-500/10 -mr-10 -mt-10"></div>
          <div className="text-sm font-medium text-gray-500 mb-2">Clienți Înscriși la Curs</div>
          <div className="text-3xl font-bold text-gradient-green-teal">
            {clients.filter(client => client.status === 'Complet' || client.status === 'În progres').length}
          </div>
          <div className="mt-4 text-sm text-gray-500">
            <span className="font-medium text-green-500">
              {clients.length > 0 
                ? Math.round((clients.filter(client => client.status === 'Complet' || client.status === 'În progres').length / clients.length) * 100)
                : 0}%
            </span> rată de conversie
          </div>
        </div>
        
        <div className="glassmorphism rounded-2xl p-6 shadow-md relative overflow-hidden hover-scale">
          <div className="absolute top-0 right-0 w-24 h-24 rounded-full bg-orange-500/10 -mr-10 -mt-10"></div>
          <div className="text-sm font-medium text-gray-500 mb-2">Clienți Noi</div>
          <div className="text-3xl font-bold text-gradient-orange-pink">
            {clients.filter(client => client.status === 'Nou').length}
          </div>
          <div className="mt-4 text-sm text-gray-500">
            Clienți care așteaptă procesarea
          </div>
        </div>
      </div>

      {/* Filters and Search Bar */}
      <div className="mb-6 flex flex-wrap gap-3 items-center justify-between">
        <div className="flex-1 min-w-[300px] relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
          </div>
          <input
            type="text"
            placeholder="Caută după nume, email sau telefon..."
            className="block w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-xl glassmorphism focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm shadow-sm"
            value={searchTerm}
            onChange={handleSearch}
          />
        </div>
        
        <div className="flex items-center space-x-3">
          <button 
            className="flex items-center px-4 py-2.5 border border-gray-200 rounded-xl glassmorphism text-sm font-medium text-gray-700 hover:bg-white/80 transition-all duration-300 shadow-sm"
            onClick={handleExportClients}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 text-gray-500">
              <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
            </svg>
            Filtrează
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-2 text-gray-500">
              <path d="M6 9l6 6 6-6"/>
            </svg>
          </button>
          
          <button 
            onClick={handleExportClients}
            className="flex items-center px-4 py-2.5 border border-gray-200 rounded-xl glassmorphism text-sm font-medium text-gray-700 hover:bg-white/80 transition-all duration-300 shadow-sm"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 text-gray-500">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="7 10 12 15 17 10"></polyline>
              <line x1="12" y1="15" x2="12" y2="3"></line>
            </svg>
            Export
          </button>
          
          <button 
            onClick={handleImportClients}
            className="flex items-center px-4 py-2.5 border border-gray-200 rounded-xl glassmorphism text-sm font-medium text-gray-700 hover:bg-white/80 transition-all duration-300 shadow-sm"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 text-gray-500">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="17 8 12 3 7 8"></polyline>
              <line x1="12" y1="3" x2="12" y2="15"></line>
            </svg>
            Import
          </button>
        </div>
      </div>

      {/* Clients List */}
      <div className="space-y-4 mb-8">
        {/* Header */}
        <div className="glassmorphism rounded-xl p-4 flex items-center text-xs font-medium text-gray-500 uppercase tracking-wider shadow-sm">
          <div className="w-8 flex items-center">
            <input 
              type="checkbox" 
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              onChange={handleSelectAllClients}
              checked={selectedClients.length === filteredClients.length && filteredClients.length > 0}
            />
          </div>
          <div className="flex-1 ml-2">Nume</div>
          <div className="w-64">Contact</div>
          <div className="w-32 text-center">Status</div>
          <div className="w-32">Înregistrare</div>
          <div className="w-48">Grupă</div>
          <div className="w-24 text-center">Acțiuni</div>
        </div>
        
        {loading ? (
          <div className="glassmorphism-darker rounded-xl p-16 flex justify-center items-center">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
          </div>
        ) : filteredClients.length === 0 ? (
          <div className="glassmorphism-darker rounded-xl p-16 text-center">
            <p className="text-gray-500">Nu s-au găsit clienți care să corespundă criteriilor de căutare.</p>
          </div>
        ) : (
          filteredClients.map((client) => {
            const { bgClass, icon } = getStatusBadge(client.status);
            return (
              <div key={client.id} className="glassmorphism-darker rounded-xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden hover-scale">
                <div className="p-4 flex items-center">
                  <div className="w-8 flex items-center">
                    <input 
                      type="checkbox" 
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      checked={selectedClients.includes(client.id)}
                      onChange={() => handleSelectClient(client.id)}
                    />
                  </div>
                  
                  <div className="flex-1 ml-2 flex items-center">
                    <div className="flex-shrink-0 h-10 w-10 rounded-xl bg-gradient-blue-purple flex items-center justify-center text-white shadow-sm">
                      <span className="font-medium text-sm">{client.initials}</span>
                    </div>
                    <div className="ml-3">
                      <div className="font-medium text-gray-900">{client.name}</div>
                      <div className="text-gray-500 text-xs">ID: {client.id}</div>
                    </div>
                  </div>
                  
                  <div className="w-64">
                    <div className="flex items-center text-gray-500 mb-1 text-sm">
                      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1 text-gray-400">
                        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                        <polyline points="22,6 12,13 2,6"></polyline>
                      </svg>
                      <span className="truncate">{client.email}</span>
                    </div>
                    <div className="flex items-center text-gray-500 text-sm">
                      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1 text-gray-400">
                        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                      </svg>
                      <span>{client.phone}</span>
                    </div>
                  </div>
                  
                  <div className="w-32 flex justify-center">
                    <span className={`flex items-center px-3 py-1 rounded-full text-xs font-medium ${bgClass} text-white shadow-sm`}>
                      {icon}
                      {client.status}
                    </span>
                  </div>
                  
                  <div className="w-32 flex items-center">
                    <div className="flex items-center text-gray-500 text-sm">
                      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1 text-gray-400">
                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                        <line x1="16" y1="2" x2="16" y2="6"></line>
                        <line x1="8" y1="2" x2="8" y2="6"></line>
                        <line x1="3" y1="10" x2="21" y2="10"></line>
                      </svg>
                      <span>{client.registrationDate}</span>
                    </div>
                  </div>
                  
                  <div className="w-48 flex items-center">
                    <span className="px-3 py-1 text-xs text-gray-700 bg-gray-100 rounded-full">
                      {client.group}
                    </span>
                  </div>
                  
                  <div className="w-24 flex items-center justify-around relative">
                    <button 
                      className="text-blue-600 hover:text-blue-800 px-2 py-1 rounded hover:bg-blue-50 transition-colors flex items-center"
                      onClick={() => navigate(`/admin/clients/${client.id}`)}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                        <circle cx="12" cy="12" r="3"></circle>
                      </svg>
                      <span className="text-xs">Vizualizare</span>
                    </button>
                    
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Add Client Modal */}
      <AddClientModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAddClient={handleClientAdded}
      />
      
      {/* Import Clients Modal */}
      <ImportClientsModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImportSuccess={handleImportSuccess}
      />
      
      {/* Export Clients Modal */}
      <ExportClientsModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        clients={filteredClients}
      />
    </>
  );
};

export default ClientList;
