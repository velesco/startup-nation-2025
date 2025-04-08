import React, { useState } from 'react';
import { 
  Filter, 
  Search, 
  Download, 
  Upload, 
  X 
} from 'lucide-react';

/**
 * Componentă pentru filtrarea și acțiuni asupra clienților
 */
const ClientsFilter = ({ 
  searchTerm, 
  setSearchTerm, 
  statusFilter, 
  setStatusFilter, 
  groupFilter, 
  setGroupFilter, 
  dateFilter, 
  setDateFilter, 
  availableGroups,
  resetFilters,
  handleSearch,
  onOpenExportModal,
  onOpenImportModal,
  onOpenFilterModal,
}) => {
  // Statut pentru a determina dacă s-a modificat searchTerm-ul
  const [searchTermChanged, setSearchTermChanged] = useState(false);

  const handleInputChange = (e) => {
    setSearchTerm(e.target.value);
    setSearchTermChanged(true);
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    handleSearch();
    setSearchTermChanged(false);
  };

  // Funcție pentru a afișa eticheta filtru dată
  const getDateFilterLabel = (dateFilterValue) => {
    switch(dateFilterValue) {
      case 'today':
        return 'Astăzi';
      case 'yesterday':
        return 'Ieri';
      case 'last_week':
        return 'Ultima săptămână';
      case 'last_month':
        return 'Ultima lună';
      default:
        return dateFilterValue;
    }
  };

  return (
    <>
      {/* Bara de acțiuni */}
      <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4 mb-6">
        <form onSubmit={handleFormSubmit} className="md:flex-1">
          <div className="relative">
            <input
              type="text"
              placeholder="Caută după nume, email sau telefon..."
              className="glassmorphism w-full h-full pl-10 pr-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchTerm}
              onChange={handleInputChange}
            />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
          </div>
        </form>
        
        <div className="flex space-x-2">
          <button 
            className="glassmorphism px-4 py-2 rounded-lg flex items-center text-gray-700 hover:bg-white/80 transition-colors"
            onClick={onOpenFilterModal}
          >
            <Filter className="h-5 w-5 mr-2" />
            <span>Filtrează</span>
          </button>
          
          <button 
            className="glassmorphism px-4 py-2 rounded-lg flex items-center text-gray-700 hover:bg-white/80 transition-colors"
            onClick={onOpenExportModal}
          >
            <Download className="h-5 w-5 mr-2" />
            <span>Export</span>
          </button>
          
          <button 
            className="glassmorphism px-4 py-2 rounded-lg flex items-center text-gray-700 hover:bg-white/80 transition-colors"
            onClick={onOpenImportModal}
          >
            <Upload className="h-5 w-5 mr-2" />
            <span>Import</span>
          </button>
        </div>
      </div>

      {/* Filtre active */}
      {(statusFilter || groupFilter || dateFilter) && (
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <span className="text-sm text-gray-500 mr-2">Filtre active:</span>
          
          {statusFilter && (
            <div className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm flex items-center">
              Status: {statusFilter}
              <button 
                className="ml-2 text-blue-500 hover:text-blue-700"
                onClick={() => {
                  setStatusFilter('');
                  handleSearch();
                }}
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}
          
          {groupFilter && (
            <div className="bg-purple-50 text-purple-700 px-3 py-1 rounded-full text-sm flex items-center">
              Grupă: {availableGroups.find(g => g._id === groupFilter)?.name || 'Selectată'}
              <button 
                className="ml-2 text-purple-500 hover:text-purple-700"
                onClick={() => {
                  setGroupFilter('');
                  handleSearch();
                }}
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}
          
          {dateFilter && (
            <div className="bg-green-50 text-green-700 px-3 py-1 rounded-full text-sm flex items-center">
              Dată: {getDateFilterLabel(dateFilter)}
              <button 
                className="ml-2 text-green-500 hover:text-green-700"
                onClick={() => {
                  setDateFilter('');
                  handleSearch();
                }}
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}
          
          <button 
            className="text-gray-500 hover:text-gray-700 text-sm underline"
            onClick={() => {
              resetFilters();
              handleSearch();
            }}
          >
            Resetează toate
          </button>
        </div>
      )}
    </>
  );
};

export default ClientsFilter;