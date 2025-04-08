import React, { useState } from 'react';
import { X, Check, Building, Activity } from 'lucide-react';

/**
 * Modal pentru filtrare avansată a utilizatorilor
 */
const UsersFilterModal = ({ 
  isOpen, 
  onClose, 
  roleFilter, 
  setRoleFilter,
  activeFilter,
  setActiveFilter,
  organizationFilter,
  setOrganizationFilter,
  applyFilters
}) => {
  // State-uri locale pentru filtre
  const [localRoleFilter, setLocalRoleFilter] = useState(roleFilter);
  const [localActiveFilter, setLocalActiveFilter] = useState(activeFilter);
  const [localOrganizationFilter, setLocalOrganizationFilter] = useState(organizationFilter);
  
  // Opțiuni de roluri
  const roleOptions = [
    { value: 'admin', label: 'Administrator' },
    { value: 'partner', label: 'Partener' },
    { value: 'client', label: 'Client' },
    { value: 'user', label: 'Utilizator' }
  ];

  // Opțiuni pentru status
  const statusOptions = [
    { value: 'true', label: 'Activ' },
    { value: 'false', label: 'Inactiv' }
  ];

  // Opțiuni de organizații (în practică, acestea ar trebui încărcate de la server)
  const organizationOptions = [
    'Startup Nation',
    'Ministerul Economiei',
    'Asociația Antreprenorilor',
    'Universitatea Tehnică',
    'Asociația pentru Digitalizare'
  ];

  // Resetăm filtrele locale
  const resetLocalFilters = () => {
    setLocalRoleFilter('');
    setLocalActiveFilter('');
    setLocalOrganizationFilter('');
  };

  // Aplicăm filtrele
  const handleApplyFilters = () => {
    setRoleFilter(localRoleFilter);
    setActiveFilter(localActiveFilter);
    setOrganizationFilter(localOrganizationFilter);
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
                Filtrare avansată utilizatori
              </h3>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-500 focus:outline-none"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <div className="mt-4 space-y-4">
              {/* Rol filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rol utilizator
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {roleOptions.map(role => (
                    <button
                      key={role.value}
                      type="button"
                      onClick={() => setLocalRoleFilter(role.value === localRoleFilter ? '' : role.value)}
                      className={`flex items-center justify-between px-4 py-2 border rounded-md ${
                        role.value === localRoleFilter
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-300 text-gray-700'
                      }`}
                    >
                      {role.label}
                      {role.value === localRoleFilter && (
                        <Check className="h-4 w-4 text-blue-500" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
              
              {/* Status filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status cont
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {statusOptions.map(status => (
                    <button
                      key={status.value}
                      type="button"
                      onClick={() => setLocalActiveFilter(status.value === localActiveFilter ? '' : status.value)}
                      className={`flex items-center justify-between px-4 py-2 border rounded-md ${
                        status.value === localActiveFilter
                          ? 'border-green-500 bg-green-50 text-green-700'
                          : 'border-gray-300 text-gray-700'
                      }`}
                    >
                      <div className="flex items-center">
                        <Activity className="h-4 w-4 mr-2" />
                        {status.label}
                      </div>
                      {status.value === localActiveFilter && (
                        <Check className="h-4 w-4 text-green-500" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
              
              {/* Organization filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Organizație
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Building className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="Caută organizație..."
                    className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    value={localOrganizationFilter}
                    onChange={e => setLocalOrganizationFilter(e.target.value)}
                    list="organization-options"
                  />
                  <datalist id="organization-options">
                    {organizationOptions.map(org => (
                      <option key={org} value={org} />
                    ))}
                  </datalist>
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

export default UsersFilterModal;