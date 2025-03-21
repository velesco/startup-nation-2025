import React, { useState } from 'react';
import { X } from 'lucide-react';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';

const ExportClientsModal = ({ isOpen, onClose, clients }) => {
  const [exportFormat, setExportFormat] = useState('csv');
  const [exportFields, setExportFields] = useState({
    name: true,
    email: true,
    phone: true,
    status: true,
    registrationDate: true,
    group: true
  });
  const [exporting, setExporting] = useState(false);

  // Reset the modal when it closes
  React.useEffect(() => {
    if (!isOpen) {
      setExportFormat('csv');
      setExportFields({
        name: true,
        email: true,
        phone: true,
        status: true,
        registrationDate: true,
        group: true
      });
      setExporting(false);
    }
  }, [isOpen]);

  // Toggle field selection
  const handleFieldToggle = (field) => {
    setExportFields({
      ...exportFields,
      [field]: !exportFields[field]
    });
  };

  // Select or deselect all fields
  const handleSelectAll = (selected) => {
    setExportFields({
      name: selected,
      email: selected,
      phone: selected,
      status: selected,
      registrationDate: selected,
      group: selected
    });
  };

  // Handle export
  const handleExport = () => {
    if (!clients || clients.length === 0) {
      alert('Nu există clienți pentru export.');
      return;
    }

    try {
      setExporting(true);

      // Filter client data based on selected fields
      const exportData = clients.map(client => {
        const filteredClient = {};
        
        if (exportFields.name) filteredClient['Nume'] = client.name || '';
        if (exportFields.email) filteredClient['Email'] = client.email || '';
        if (exportFields.phone) filteredClient['Telefon'] = client.phone || '';
        if (exportFields.status) filteredClient['Status'] = client.status || '';
        if (exportFields.registrationDate) filteredClient['Data Înregistrării'] = client.registrationDate || '';
        if (exportFields.group) filteredClient['Grupă'] = client.group || '';
        
        return filteredClient;
      });

      if (exportFormat === 'csv') {
        // Export as CSV
        const csv = Papa.unparse(exportData);
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', `clients_export_${new Date().toISOString().slice(0, 10)}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else if (exportFormat === 'xlsx') {
        // Export as Excel
        const worksheet = XLSX.utils.json_to_sheet(exportData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Clienți');
        
        // Generate Excel file
        const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
        const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', `clients_export_${new Date().toISOString().slice(0, 10)}.xlsx`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else if (exportFormat === 'json') {
        // Export as JSON
        const json = JSON.stringify(exportData, null, 2);
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', `clients_export_${new Date().toISOString().slice(0, 10)}.json`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }

      // Close modal after export
      setTimeout(() => {
        setExporting(false);
        onClose();
      }, 1000);
    } catch (error) {
      console.error('Error exporting clients:', error);
      setExporting(false);
      alert('A apărut o eroare la exportul clienților. Încercați din nou.');
    }
  };

  // If the modal is not open, don't render anything
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
          <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
        </div>

        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

        <div className="inline-block align-bottom bg-white rounded-3xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 px-4 py-5 sm:px-6 flex justify-between items-center">
            <h3 className="text-lg leading-6 font-medium text-gradient-blue-purple">
              Export Clienți
            </h3>
            <button
              type="button"
              className="text-gray-400 hover:text-gray-500"
              onClick={onClose}
            >
              <X size={20} />
            </button>
          </div>
          
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <p className="text-sm text-gray-500 mb-4">
              Selectați formatul și câmpurile pe care doriți să le exportați.
            </p>
            
            {/* Export Format */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Format Export
              </label>
              <div className="flex space-x-4">
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    className="form-radio text-blue-600"
                    name="exportFormat"
                    value="csv"
                    checked={exportFormat === 'csv'}
                    onChange={() => setExportFormat('csv')}
                  />
                  <span className="ml-2">CSV</span>
                </label>
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    className="form-radio text-blue-600"
                    name="exportFormat"
                    value="xlsx"
                    checked={exportFormat === 'xlsx'}
                    onChange={() => setExportFormat('xlsx')}
                  />
                  <span className="ml-2">Excel (XLSX)</span>
                </label>
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    className="form-radio text-blue-600"
                    name="exportFormat"
                    value="json"
                    checked={exportFormat === 'json'}
                    onChange={() => setExportFormat('json')}
                  />
                  <span className="ml-2">JSON</span>
                </label>
              </div>
            </div>
            
            {/* Field Selection */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  Câmpuri de Exportat
                </label>
                <div className="flex space-x-3">
                  <button
                    type="button"
                    className="text-xs text-blue-600 hover:text-blue-800"
                    onClick={() => handleSelectAll(true)}
                  >
                    Selectează toate
                  </button>
                  <button
                    type="button"
                    className="text-xs text-gray-500 hover:text-gray-700"
                    onClick={() => handleSelectAll(false)}
                  >
                    Deselectează toate
                  </button>
                </div>
              </div>
              
              <div className="bg-gray-50 p-3 rounded-lg grid grid-cols-2 gap-2">
                <label className="inline-flex items-center">
                  <input
                    type="checkbox"
                    className="form-checkbox text-blue-600 rounded"
                    checked={exportFields.name}
                    onChange={() => handleFieldToggle('name')}
                  />
                  <span className="ml-2 text-sm text-gray-700">Nume</span>
                </label>
                
                <label className="inline-flex items-center">
                  <input
                    type="checkbox"
                    className="form-checkbox text-blue-600 rounded"
                    checked={exportFields.email}
                    onChange={() => handleFieldToggle('email')}
                  />
                  <span className="ml-2 text-sm text-gray-700">Email</span>
                </label>
                
                <label className="inline-flex items-center">
                  <input
                    type="checkbox"
                    className="form-checkbox text-blue-600 rounded"
                    checked={exportFields.phone}
                    onChange={() => handleFieldToggle('phone')}
                  />
                  <span className="ml-2 text-sm text-gray-700">Telefon</span>
                </label>
                
                <label className="inline-flex items-center">
                  <input
                    type="checkbox"
                    className="form-checkbox text-blue-600 rounded"
                    checked={exportFields.status}
                    onChange={() => handleFieldToggle('status')}
                  />
                  <span className="ml-2 text-sm text-gray-700">Status</span>
                </label>
                
                <label className="inline-flex items-center">
                  <input
                    type="checkbox"
                    className="form-checkbox text-blue-600 rounded"
                    checked={exportFields.registrationDate}
                    onChange={() => handleFieldToggle('registrationDate')}
                  />
                  <span className="ml-2 text-sm text-gray-700">Data Înregistrării</span>
                </label>
                
                <label className="inline-flex items-center">
                  <input
                    type="checkbox"
                    className="form-checkbox text-blue-600 rounded"
                    checked={exportFields.group}
                    onChange={() => handleFieldToggle('group')}
                  />
                  <span className="ml-2 text-sm text-gray-700">Grupă</span>
                </label>
              </div>
            </div>
            
            {/* Number of clients */}
            <div className="mt-4 bg-blue-50 p-3 rounded-lg flex items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-blue-500 mr-2"
              >
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                <circle cx="9" cy="7" r="4"></circle>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
              </svg>
              <span className="text-sm text-gray-700">
                {clients ? `${clients.length} clienți vor fi exportați` : 'Nu există clienți pentru export'}
              </span>
            </div>
          </div>
          
          <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button
              type="button"
              className={`w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 
                ${(!Object.values(exportFields).some(field => field) || !clients || clients.length === 0 || exporting) ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-gradient-blue-purple text-white hover:bg-blue-700'} 
                text-base font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm`}
              onClick={handleExport}
              disabled={!Object.values(exportFields).some(field => field) || !clients || clients.length === 0 || exporting}
            >
              {exporting ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Export în curs...
                </span>
              ) : (
                'Exportă'
              )}
            </button>
            <button
              type="button"
              className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
              onClick={onClose}
              disabled={exporting}
            >
              Anulare
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExportClientsModal;