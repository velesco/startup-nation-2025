import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Eye, 
  Mail,
  ChevronLeft,
  ChevronRight,
  Check,
  X,
  FileText,
  Trash2,
  UserPlus,
  UserCog
} from 'lucide-react';

/**
 * Componenta pentru tabelul de utilizatori
 */
const UsersTable = ({ 
  users, 
  selectedUsers, 
  toggleUserSelection,
  toggleSelectAllUsers,
  handleSendEmail,
  handleDeleteUser,
  page,
  setPage,
  totalPages,
  total,
  limit
}) => {
  const navigate = useNavigate();

  // Role colors
  const roleColors = {
    'admin': 'bg-purple-100 text-purple-700',
    'partner': 'bg-blue-100 text-blue-700',
    'client': 'bg-green-100 text-green-700',
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
    if (!dateString) return 'N/A';
    const options = { day: '2-digit', month: '2-digit', year: 'numeric' };
    return new Date(dateString).toLocaleDateString('ro-RO', options);
  };

  // Get creator name
  const getCreatorName = (user) => {
    if (!user.added_by) return 'N/A';
    return typeof user.added_by === 'object' ? user.added_by.name : 'Necunoscut';
  };

  return (
    <>
      {/* Tabel Utilizatori */}
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
                      checked={selectedUsers.length === users.length && users.length > 0}
                      onChange={toggleSelectAllUsers}
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
                  Rol
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Documente
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Adăugat de
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Data înregistrării
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
                  <td className="p-4 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                        checked={selectedUsers.includes(user._id)}
                        onChange={() => toggleUserSelection(user._id)}
                      />
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-10 w-10 flex-shrink-0">
                        <div className="h-10 w-10 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-bold">
                          {getInitials(user.name)}
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="flex items-center flex-wrap gap-1">
                          <div className="text-sm font-medium text-gray-900">{user.name}</div>
                        </div>
                        <div className="text-sm text-gray-500">ID: {user._id.substr(-5)}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{user.email}</div>
                    <div className="text-sm text-gray-500">{user.phone || 'N/A'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${roleColors[user.role] || 'bg-gray-100 text-gray-800'}`}>
                      {user.role === 'admin' ? 'Administrator' : 
                       user.role === 'partner' ? 'Partener' : 
                       user.role === 'client' ? 'Client' : user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-col gap-1">
                      {user.documents && user.documents.id_cardUploaded ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                          <Check className="h-3 w-3 mr-1" />
                          Buletin
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-600">
                          <X className="h-3 w-3 mr-1" />
                          Buletin
                        </span>
                      )}
                      
                      {user.documents && user.documents.contractGenerated ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
                          <Check className="h-3 w-3 mr-1" />
                          Contract Curs
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-600">
                          <X className="h-3 w-3 mr-1" />
                          Contract Curs
                        </span>
                      )}
                      
                      {user.documents && user.documents.consultingContractGenerated ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                          <Check className="h-3 w-3 mr-1" />
                          Contract Consultanță
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-600">
                          <X className="h-3 w-3 mr-1" />
                          Contract Consultanță
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {user.isActive ? (
                      <div className="flex items-center">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          <Check className="h-3 w-3 mr-1" />
                          Activ
                        </span>
                      </div>
                    ) : (
                      <div className="flex items-center">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          <X className="h-3 w-3 mr-1" />
                          Inactiv
                        </span>
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {getCreatorName(user)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(user.createdAt)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-center space-x-2">
                      <button 
                        className="p-2 text-orange-600 hover:bg-orange-50 rounded-md transition-colors"
                        onClick={(e) => handleSendEmail(user, e)}
                        title="Trimite email"
                      >
                        <Mail className="h-5 w-5" />
                      </button>
                      
                      <button 
                        className="p-2 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (window.confirm(`Sigur doriți să ștergeți utilizatorul ${user.name}?`)) {
                            handleDeleteUser(user._id);
                          }
                        }}
                        title="Șterge utilizator"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                      
                      <button 
                        className="text-blue-600 hover:text-blue-800 px-4 py-2 rounded-lg bg-blue-50 hover:bg-blue-100 transition-colors"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/admin/users/${user._id}`);
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
              {users.length === 0 && (
                <tr>
                  <td colSpan="9" className="px-6 py-10 text-center text-gray-500">
                    Nu există utilizatori care să corespundă criteriilor de căutare.
                  </td>
                </tr>
              )}
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
          Afișare {users.length > 0 ? (page - 1) * limit + 1 : 0} la {Math.min(page * limit, total)} din {total} rezultate
        </div>
      </div>
    </>
  );
};

export default UsersTable;