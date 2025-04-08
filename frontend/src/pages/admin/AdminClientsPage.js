import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlusCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import DashboardLayout from '../../components/layouts/DashboardLayout';
import LoadingScreen from '../../components/client/LoadingScreen';
import AddClientModal from '../../components/admin/AddClientModal';
import ImportClientsModal from '../../components/clients/ImportClientsModal';
import ExportClientsModal from '../../components/clients/ExportClientsModal';
import SendEmailToClientModal from '../../components/admin/SendEmailToClientModal';
import ClientsStats from '../../components/admin/ClientsStats';
import ClientsFilter from '../../components/admin/ClientsFilter';
import ClientsTable from '../../components/admin/ClientsTable';
import FilterModal from '../../components/admin/FilterModal';
import useClientsData from '../../hooks/useClientsData';

const AdminClientsPage = () => {
  const { currentUser, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  // Stări pentru modale
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);
  const [selectedClients, setSelectedClients] = useState([]);

  // Utilizăm hook-ul pentru date
  const {
    loading,
    clients,
    error,
    page, 
    setPage,
    limit,
    total,
    totalPages,
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    groupFilter, 
    setGroupFilter,
    dateFilter,
    setDateFilter,
    availableGroups,
    fetchClients,
    fetchStatistics,
    resetFilters
  } = useClientsData();

  // Verificăm dacă utilizatorul este autentificat și are rolul potrivit
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    } else if (currentUser && currentUser.role !== 'admin' && currentUser.role !== 'partner') {
      navigate('/');
    }
  }, [isAuthenticated, currentUser, navigate]);

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
  const handleSearch = () => {
    setPage(1); // Reset to first page on new search
    fetchClients();
  };

  // Aplicarea filtrelor
  const applyFilters = () => {
    setPage(1);
    fetchClients();
    setIsFilterModalOpen(false);
  };

  const handleAddClient = (clientData) => {
    // După adăugarea clientului, reîmprospătăm lista
    fetchClients();
    fetchStatistics();
    setIsAddModalOpen(false);
  };

  const handleSendEmail = (client, e) => {
    e.stopPropagation(); // Prevent navigating to client details
    setSelectedClient(client);
    setIsEmailModalOpen(true);
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
        <ClientsStats clients={clients} />

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

        {/* Bara de filtre */}
        <ClientsFilter 
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          groupFilter={groupFilter}
          setGroupFilter={setGroupFilter}
          dateFilter={dateFilter}
          setDateFilter={setDateFilter}
          availableGroups={availableGroups}
          resetFilters={resetFilters}
          handleSearch={handleSearch}
          onOpenExportModal={() => setIsExportModalOpen(true)}
          onOpenImportModal={() => setIsImportModalOpen(true)}
          onOpenFilterModal={() => setIsFilterModalOpen(true)}
        />

        {/* Tabel Clienți */}
        <ClientsTable 
          clients={clients}
          selectedClients={selectedClients}
          toggleClientSelection={toggleClientSelection}
          toggleSelectAllClients={toggleSelectAllClients}
          handleSendEmail={handleSendEmail}
          page={page}
          setPage={setPage}
          totalPages={totalPages}
          total={total}
          limit={limit}
        />
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

      {/* Modal pentru filtre avansate */}
      {isFilterModalOpen && (
        <FilterModal 
          isOpen={isFilterModalOpen}
          onClose={() => setIsFilterModalOpen(false)}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          groupFilter={groupFilter}
          setGroupFilter={setGroupFilter}
          dateFilter={dateFilter}
          setDateFilter={setDateFilter}
          availableGroups={availableGroups}
          applyFilters={applyFilters}
        />
      )}
    </DashboardLayout>
  );
};

export default AdminClientsPage;