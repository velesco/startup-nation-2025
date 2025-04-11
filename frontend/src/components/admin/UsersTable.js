import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Mail, 
  Building, 
  Clock, 
  Calendar,
  ChevronLeft,
  ChevronRight,
  Send,
  Check,
  X,
  FileText,
  UserCheck,
  Phone
} from 'lucide-react';

/**
 * Componenta pentru tabelul de utilizatori
 */
const UsersTable = ({ 
  users, 
  handleSendEmail,
  page,
  setPage,
  totalPages,
  total,
  limit
}) => {
  const navigate = useNavigate();

  // Status colors
  const roleColors = {
    'admin': 'bg-purple-100 text-purple-700',
    'partner': 'bg-blue-100 text-blue-700',
    'client': 'bg-green-100 text-green-700',
    'user': 'bg-gray-100 text-gray-700',
    'super-admin': 'bg-red-100 text-red-700'
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

  return (
    <>
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
                  Email
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Telefon
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
                  Contract
                </th>
                <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cons.
                </th>
                <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Buletin
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
                      <a 
                        href={`mailto:${user.email}`} 
                        className="text-blue-600 hover:text-blue-800"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {user.email}
                      </a>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm text-gray-900">
                      <Phone className="h-4 w-4 mr-1 text-gray-400" />
                      {user.phone || <span className="text-gray-500">-</span>}
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
                    {/* Contract */}
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      {user.contractSigned || 
                       user.documents?.contractSigned || 
                       user.documents?.contractGenerated || 
                       user.documents?.contractPath ? (
                      <div className="flex items-center justify-center">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          <Check className="h-3 w-3 mr-1" />
                          {user.contractSigned ? 'Semnat' : 'Generat'}
                        </span>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          <X className="h-3 w-3 mr-1" />
                          Lipsă
                        </span>
                      </div>
                    )}
                  </td>
                      {/* Contract de consultanță */}
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        {user.documents?.consultingContractSigned || 
                         user.documents?.consultingContractGenerated || 
                         user.documents?.consultingContractPath ? (
                      <div className="flex items-center justify-center">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          <Check className="h-3 w-3 mr-1" />
                          {user.documents?.consultingContractSigned ? 'Semnat' : 'Generat'}
                        </span>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          <X className="h-3 w-3 mr-1" />
                          Lipsă
                        </span>
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    {user.documents?.id_cardUploaded || user.idCard?.verified ? (
                      <div className="flex items-center justify-center">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          <FileText className="h-3 w-3 mr-1" />
                          Încărcat
                        </span>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          <X className="h-3 w-3 mr-1" />
                          Lipsă
                        </span>
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <button
                      onClick={(e) => {
                        e.stopPropagation(); // Oprim propagarea pentru a nu naviga la profil
                        handleSendEmail(user);
                      }}
                      className="bg-gradient-to-r from-green-500 to-emerald-600 text-white p-2 rounded-lg hover:opacity-90 transition-all focus:outline-none focus:ring-2 focus:ring-green-500 mr-2"
                      title="Trimite email"
                    >
                      <Send className="h-4 w-4" />
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
          Afișare {users.length > 0 ? (page - 1) * limit + 1 : 0} la {Math.min(page * limit, total)} din {total} rezultate
        </div>
      </div>
    </>
  );
};

export default UsersTable;