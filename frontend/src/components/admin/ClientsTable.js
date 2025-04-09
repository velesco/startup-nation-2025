import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Eye, 
  Mail,
  Users,
  ChevronLeft,
  ChevronRight,
  Check,
  X,
  FileText
} from 'lucide-react';

/**
 * Componenta pentru tabelul de clienți
 */
const ClientsTable = ({ 
  clients, 
  selectedClients, 
  toggleClientSelection,
  toggleSelectAllClients,
  handleSendEmail,
  page,
  setPage,
  totalPages,
  total,
  limit
}) => {
  const navigate = useNavigate();

  // Status colors
  const statusColors = {
    'Nou': 'bg-orange-100 text-orange-700',
    'În progres': 'bg-blue-100 text-blue-700',
    'Complet': 'bg-green-100 text-green-700',
    'Respins': 'bg-red-100 text-red-700'
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

  // Formatare dată pentru afișare
  const formatDate = (dateString) => {
    const options = { day: '2-digit', month: '2-digit', year: 'numeric' };
    return new Date(dateString).toLocaleDateString('ro-RO', options);
  };

  return (
    <>
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
                  Contract
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
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Users className="h-3 w-3 mr-1" />
                        {client.groupInfo.name}
                      </span>
                    ) : (
                      <span className="text-sm text-gray-500">Nealocat</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    {client.contractSigned || client.documents?.contractGenerated || (client.userId && client.userId.documents?.contractGenerated) ? (
                      <div className="flex items-center justify-center">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          <Check className="h-3 w-3 mr-1" />
                          {client.contractSigned ? 'Semnat' : 'Generat'}
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
                    {client.documents?.id_cardUploaded || 
                     (client.userId && client.userId.documents?.id_cardUploaded) || 
                     (client.userId && client.userId.idCard?.verified) ? (
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
          Afișare {clients.length > 0 ? (page - 1) * limit + 1 : 0} la {Math.min(page * limit, total)} din {total} rezultate
        </div>
      </div>
    </>
  );
};

export default ClientsTable;