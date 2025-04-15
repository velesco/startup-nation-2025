import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserPlus, FileText, Calendar } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';
import DashboardLayout from '../../components/layouts/DashboardLayout';
import LoadingScreen from '../../components/client/LoadingScreen';
import AddUserModal from '../../components/admin/AddUserModal';
import SendEmailToClientModal from '../../components/admin/SendEmailToClientModal';
import ImportUsersModal from '../../components/admin/ImportUsersModal';
import UsersFilter from '../../components/admin/UsersFilter';
import UsersFilterModal from '../../components/admin/UsersFilterModal';
import UsersTable from '../../components/admin/UsersTable';
import useUsersData from '../../hooks/useUsersData';

const AdminUsersPage = () => {
  const { currentUser, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  // State for modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedUsers, setSelectedUsers] = useState([]);

  // Use the users data hook
  const {
    loading,
    users,
    error,
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
    fetchUsers,
    fetchStatistics,
    resetFilters,
    statsData
  } = useUsersData();

  // Check if user is authenticated and has the appropriate role
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    } else if (currentUser && currentUser.role !== 'admin' && currentUser.role !== 'partner') {
      navigate('/');
    }
  }, [isAuthenticated, currentUser, navigate]);

  // Handle user selection
  const toggleUserSelection = (userId) => {
    setSelectedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId) 
        : [...prev, userId]
    );
  };

  // Handle selecting all users
  const toggleSelectAllUsers = () => {
    if (selectedUsers.length === users.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(users.map(user => user._id));
    }
  };

  // Handle search
  const handleSearch = () => {
    setPage(1); // Reset to first page on new search
    fetchUsers();
  };

  // Apply filters
  const applyFilters = () => {
    setPage(1);
    fetchUsers();
    setIsFilterModalOpen(false);
  };

  const handleAddUser = (userData) => {
    // After adding the user, refresh the list
    fetchUsers();
    fetchStatistics();
    setIsAddModalOpen(false);
  };

  const handleSendEmail = (user, e) => {
    e.stopPropagation(); // Prevent navigating to user details
    setSelectedUser(user);
    setIsEmailModalOpen(true);
  };

  // Handle user deletion
  const handleDeleteUser = async (userId) => {
    try {
      const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5002/api';
      const response = await axios.delete(`${API_URL}/admin/users/${userId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.data && response.data.success) {
        // Update the users list
        fetchUsers();
        fetchStatistics();
        alert('Utilizatorul a fost șters cu succes!');
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      alert(`Eroare la ștergerea utilizatorului: ${error.response?.data?.message || error.message}`);
    }
  };

  if (loading && users.length === 0) {
    return <LoadingScreen />;
  }

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Utilizatori</h1>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-5 py-2 rounded-full font-medium shadow-md hover:shadow-lg transition-all duration-300 flex items-center"
          >
            <UserPlus className="h-5 w-5 mr-2" />
            <span>Adaugă utilizator</span>
          </button>
        </div>

        {/* User Statistics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="glassmorphism p-4 rounded-xl shadow-sm">
            <div className="flex items-center">
              <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                <UserPlus className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-500">Aplicări Azi</h3>
                <p className="text-2xl font-bold text-gray-800">{statsData?.appliedToday || 0}</p>
                {statsData?.appliedYesterday > 0 && (
                  <p className="text-xs text-green-600">
                    +{Math.round((statsData.appliedToday - statsData.appliedYesterday) / statsData.appliedYesterday * 100)}% față de ieri
                  </p>
                )}
              </div>
            </div>
          </div>
          
          <div className="glassmorphism p-4 rounded-xl shadow-sm">
            <div className="flex items-center">
              <div className="h-12 w-12 rounded-full bg-indigo-100 flex items-center justify-center">
                <Calendar className="h-6 w-6 text-indigo-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-500">Aplicări Ieri</h3>
                <p className="text-2xl font-bold text-gray-800">{statsData?.appliedYesterday || 0}</p>
                <p className="text-xs text-gray-500">utilizatori înregistrați</p>
              </div>
            </div>
          </div>
          
          <div className="glassmorphism p-4 rounded-xl shadow-sm">
            <div className="flex items-center">
              <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center">
                <FileText className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-500">Cu buletin</h3>
                <p className="text-2xl font-bold text-gray-800">
                  {(statsData?.idCardUploaded || 0)}
                </p>
              </div>
            </div>
          </div>
          
          <div className="glassmorphism p-4 rounded-xl shadow-sm">
            <div className="flex items-center">
              <div className="h-12 w-12 rounded-full bg-yellow-100 flex items-center justify-center">
                <FileText className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-500">Cu contract</h3>
                <p className="text-2xl font-bold text-gray-800">
                  {(statsData?.contractsGenerated || 0)}
                </p>
              </div>
            </div>
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

        {/* Filters Bar */}
        <UsersFilter 
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          roleFilter={roleFilter}
          setRoleFilter={setRoleFilter}
          activeFilter={activeFilter}
          setActiveFilter={setActiveFilter}
          resetFilters={resetFilters}
          handleSearch={handleSearch}
          onOpenExportModal={() => setIsExportModalOpen(true)}
          onOpenImportModal={() => setIsImportModalOpen(true)}
          onOpenFilterModal={() => setIsFilterModalOpen(true)}
        />

        {/* Users Table */}
        <UsersTable 
          users={users}
          selectedUsers={selectedUsers}
          toggleUserSelection={toggleUserSelection}
          toggleSelectAllUsers={toggleSelectAllUsers}
          handleSendEmail={handleSendEmail}
          handleDeleteUser={handleDeleteUser}
          page={page}
          setPage={setPage}
          totalPages={totalPages}
          total={total}
          limit={limit}
          fetchUsers={fetchUsers}
        />
      </div>

      {/* Email modal */}
      {isEmailModalOpen && selectedUser && (
        <SendEmailToClientModal
          isOpen={isEmailModalOpen}
          onClose={() => setIsEmailModalOpen(false)}
          clientId={selectedUser._id}
          clientEmail={selectedUser.email}
          clientName={selectedUser.name}
        />
      )}

      {/* Add user modal */}
      {isAddModalOpen && (
        <AddUserModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          onAddUser={handleAddUser}
        />
      )}

      {/* Import users modal */}
      {isImportModalOpen && (
        <ImportUsersModal
          isOpen={isImportModalOpen}
          onClose={() => setIsImportModalOpen(false)}
          onImportSuccess={() => {
            fetchUsers();
            fetchStatistics();
            setIsImportModalOpen(false);
          }}
        />
      )}

      {/* Filter modal */}
      {isFilterModalOpen && (
        <UsersFilterModal 
          isOpen={isFilterModalOpen}
          onClose={() => setIsFilterModalOpen(false)}
          roleFilter={roleFilter}
          setRoleFilter={setRoleFilter}
          activeFilter={activeFilter}
          setActiveFilter={setActiveFilter}
          applyFilters={applyFilters}
        />
      )}
    </DashboardLayout>
  );
};

export default AdminUsersPage;