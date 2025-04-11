import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlusCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import DashboardLayout from '../../components/layouts/DashboardLayout';
import LoadingScreen from '../../components/client/LoadingScreen';
import AddUserModal from '../../components/admin/AddUserModal';
import SendEmailModal from '../../components/admin/SendEmailModal';
import UsersTable from '../../components/admin/UsersTable';
import UsersFilter from '../../components/admin/UsersFilter';
import UsersFilterModal from '../../components/admin/UsersFilterModal';
import UpdateDocumentFlagsButton from '../../components/admin/UpdateDocumentFlagsButton';
import UpdateContractsButton from '../../components/admin/UpdateContractsButton';
import UserStatistics from '../../components/admin/UserStatistics';
import useUsersData from '../../hooks/useUsersData';
import useUserStatistics from '../../hooks/useUserStatistics';

const AdminUsersPage = () => {
  const { currentUser, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  // Stări pentru modale
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  // Utilizăm hook-ul pentru date utilizatori
  const {
    loading: loadingUsers,
    users,
    error: usersError,
    page, 
    setPage,
    limit,
    total,
    totalPages,
    searchTerm,
    setSearchTerm,
    roleFilter,
    setRoleFilter,
    activeFilter, 
    setActiveFilter,
    organizationFilter,
    setOrganizationFilter,
    fetchUsers,
    resetFilters
  } = useUsersData();

  // Utilizăm hook-ul pentru statistici utilizatori
  const {
    loading: loadingStats,
    stats,
    error: statsError,
    refreshStatistics
  } = useUserStatistics();

  // Verificăm dacă utilizatorul este autentificat și are rolul potrivit
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    } else if (currentUser && currentUser.role !== 'admin' && currentUser.role !== 'super-admin') {
      navigate('/');
    }
  }, [isAuthenticated, currentUser, navigate]);

  // Gestionarea căutării
  const handleSearch = () => {
    setPage(1); // Reset to first page on new search
    fetchUsers();
  };

  // Aplicarea filtrelor
  const applyFilters = () => {
    setPage(1);
    fetchUsers();
    setIsFilterModalOpen(false);
  };

  const handleAddUser = (userData) => {
    // După adăugarea utilizatorului, reîmprospătăm lista și statisticile
    fetchUsers();
    refreshStatistics();
    setIsAddModalOpen(false);
  };

  const handleSendEmail = (user) => {
    setSelectedUser(user);
    setIsEmailModalOpen(true);
  };

  // Afișăm ecranul de încărcare doar dacă ambele date sunt în curs de încărcare și nu avem date
  if ((loadingUsers && users.length === 0) || (loadingStats && !stats)) {
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

        {/* Afișează statisticile utilizatorilor */}
        {stats && <UserStatistics stats={stats} />}
        
        {/* Afișează statisticile contractelor */}

        {/* Afișăm erori dacă există */}
        {(usersError || statsError) && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{usersError || statsError}</p>
              </div>
            </div>
          </div>
        )}

        {/* Bara de filtre */}
        <UsersFilter 
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          roleFilter={roleFilter}
          setRoleFilter={setRoleFilter}
          activeFilter={activeFilter}
          setActiveFilter={setActiveFilter}
          organizationFilter={organizationFilter}
          setOrganizationFilter={setOrganizationFilter}
          resetFilters={resetFilters}
          handleSearch={handleSearch}
          onOpenFilterModal={() => setIsFilterModalOpen(true)}
        />
        
        {/* Butoane pentru actualizare documente și contracte */}
        {currentUser && (currentUser.role === 'super-admin' || currentUser.role === 'admin') && (
          <div className="flex justify-end mb-4 space-x-4">
            <UpdateDocumentFlagsButton onSuccess={refreshStatistics} />
            <UpdateContractsButton onSuccess={refreshStatistics} />
          </div>
        )}

        {/* Tabel Utilizatori */}
        <UsersTable 
          users={users}
          handleSendEmail={handleSendEmail}
          page={page}
          setPage={setPage}
          totalPages={totalPages}
          total={total}
          limit={limit}
        />
      </div>

      {/* Modal pentru trimitere email */}
      {isEmailModalOpen && selectedUser && (
        <SendEmailModal
          isOpen={isEmailModalOpen}
          onClose={() => setIsEmailModalOpen(false)}
          userId={selectedUser._id}
          userEmail={selectedUser.email}
          userName={selectedUser.name}
        />
      )}

      {/* Modal pentru adăugare utilizator */}
      {isAddModalOpen && (
        <AddUserModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          onAddUser={handleAddUser}
        />
      )}

      {/* Modal pentru filtre avansate */}
      {isFilterModalOpen && (
        <UsersFilterModal 
          isOpen={isFilterModalOpen}
          onClose={() => setIsFilterModalOpen(false)}
          roleFilter={roleFilter}
          setRoleFilter={setRoleFilter}
          activeFilter={activeFilter}
          setActiveFilter={setActiveFilter}
          organizationFilter={organizationFilter}
          setOrganizationFilter={setOrganizationFilter}
          applyFilters={applyFilters}
        />
      )}
    </DashboardLayout>
  );
};

export default AdminUsersPage;