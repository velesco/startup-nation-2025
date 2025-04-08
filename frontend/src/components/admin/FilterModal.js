import React, { useState } from 'react';
import { X, Calendar, Check } from 'lucide-react';

/**
 * Modal pentru filtrare avansată a clienților
 */
const FilterModal = ({ 
  isOpen, 
  onClose, 
  statusFilter, 
  setStatusFilter,
  groupFilter,
  setGroupFilter,
  dateFilter,
  setDateFilter,
  availableGroups,
  applyFilters
}) => {
  // State-uri locale pentru filtre
  const [localStatusFilter, setLocalStatusFilter] = useState(statusFilter);
  const [localGroupFilter, setLocalGroupFilter] = useState(groupFilter);
  const [localDateFilter, setLocalDateFilter] = useState(dateFilter);

  // Opțiuni de status
  const statusOptions = ['Nou', 'În progres', 'Complet', 'Respins'];

  // Opțiuni pentru filtrarea pe dată
  const dateOptions = [
    { value: 'today', label: 'Astăzi' },
    { value: 'yesterday', label: 'Ieri' },
    { value: 'last_week', label: 'Ultima săptămână' },
    { value: 'last_month', label: 'Ultima lună' }
  ];

  // Resetăm filtrele locale
  const resetLocalFilters = () => {
    setLocalStatusFilter('');
    setLocalGroupFilter('');
    setLocalDateFilter('');
  };

  // Aplicăm filtrele
  const handleApplyFilters = () => {
    setStatusFilter(localStatusFilter);
    setGroupFilter(localGroupFilter);
    setDateFilter(localDateFilter);
    applyFilters();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity">
          <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
        </div>

        <span className="hidden sm:inline-block sm:align-middle sm:h-screen"></span>&#8203;
        
        <div className="inline-block align-bottom bg-white rounded-xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Filtrare avansată
              </h3>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-500 focus:outline-none"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <div className="mt-4 space-y-4">
              {/* Status filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status client
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {statusOptions.map(status => (
                    <button
                      key={status}
                      type="button"
                      onClick={() => setLocalStatusFilter(status === localStatusFilter ? '' : status)}
                      className={`flex items-center justify-between px-4 py-2 border rounded-md ${
                        status === localStatusFilter
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-300 text-gray-700'
                      }`}
                    >
                      {status}
                      {status === localStatusFilter && (
                        <Check className="h-4 w-4 text-blue-500" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
              
              {/* Group filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Grupă
                </label>
                <select
                  value={localGroupFilter}
                  onChange={e => setLocalGroupFilter(e.target.value)}
                  className="block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Toate grupele</option>
                  {availableGroups.map(group => (
                    <option key={group._id} value={group._id}>
                      {group.name}
                    </option>
                  ))}
                </select>
              </div>
              
              {/* Date filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Dată înregistrare
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {dateOptions.map(option => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setLocalDateFilter(option.value === localDateFilter ? '' : option.value)}
                      className={`flex items-center justify-between px-4 py-2 border rounded-md ${
                        option.value === localDateFilter
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-300 text-gray-700'
                      }`}
                    >
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-2" />
                        {option.label}
                      </div>
                      {option.value === localDateFilter && (
                        <Check className="h-4 w-4 text-blue-500" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button
              type="button"
              className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
              onClick={handleApplyFilters}
            >
              Aplică filtre
            </button>
            <button
              type="button"
              className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
              onClick={resetLocalFilters}
            >
              Resetează
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FilterModal;