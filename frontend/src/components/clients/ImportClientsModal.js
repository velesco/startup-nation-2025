import React, { useState, useRef } from 'react';
import axios from 'axios';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import { X } from 'lucide-react';

const ImportClientsModal = ({ isOpen, onClose, onImportSuccess }) => {
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState('');
  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState(1);
  const [headers, setHeaders] = useState([]);
  const [preview, setPreview] = useState([]);
  const [fieldMapping, setFieldMapping] = useState({
    name: '',
    email: '',
    phone: '',
    status: '',
    company: '',
    group: ''
  });
  const fileInputRef = useRef(null);

  // Reset the modal when it closes
  React.useEffect(() => {
    if (!isOpen) {
      setFile(null);
      setFileName('');
      setUploading(false);
      setSuccess(false);
      setError('');
      setStep(1);
      setHeaders([]);
      setPreview([]);
      setFieldMapping({
        name: '',
        email: '',
        phone: '',
        status: '',
        company: '',
        group: ''
      });
    }
  }, [isOpen]);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    // Check file type
    const fileExtension = selectedFile.name.split('.').pop().toLowerCase();
    if (!['csv', 'xlsx', 'xls'].includes(fileExtension)) {
      setError('Doar fișierele CSV și Excel (XLSX/XLS) sunt acceptate.');
      return;
    }

    setFile(selectedFile);
    setFileName(selectedFile.name);
    setError('');

    // Parse the file based on its type
    
    if (fileExtension === 'csv') {
      // Parse CSV file
      Papa.parse(selectedFile, {
        header: true,
        preview: 5, // Parse only the first 5 rows for preview
        skipEmptyLines: true,
        complete: function(results) {
        if (results.data && results.data.length > 0) {
          setHeaders(results.meta.fields || []);
          
          // Clean preview data
          const cleanPreview = results.data.map(row => {
            const cleanRow = {};
            Object.keys(row).forEach(key => {
              cleanRow[key] = row[key] || 'N/A';
            });
            return cleanRow;
          });
          
          setPreview(cleanPreview);
          
          // Auto-map fields if possible
          const mapping = {...fieldMapping};
          results.meta.fields.forEach(field => {
            const lowerField = field.toLowerCase();
            
            if (lowerField.includes('nume') || lowerField === 'name') {
              mapping.name = field;
            } else if (lowerField.includes('email')) {
              mapping.email = field;
            } else if (lowerField.includes('telefon') || lowerField.includes('phone')) {
              mapping.phone = field;
            } else if (lowerField.includes('status') || lowerField.includes('stare')) {
              mapping.status = field;
            } else if (lowerField.includes('companie') || lowerField.includes('firma') || 
                      lowerField.includes('company') || lowerField.includes('business')) {
              mapping.company = field;
            } else if (lowerField.includes('grupa') || lowerField.includes('group')) {
              mapping.group = field;
            }
          });
          
          setFieldMapping(mapping);
          setStep(2);
        } else {
          setError('Fișierul CSV este gol sau are un format invalid.');
        }
      },
      error: function(error) {
        setError(`Eroare la citirea fișierului CSV: ${error.message}`);
      }
    });
    } else if (['xlsx', 'xls'].includes(fileExtension)) {
      // Parse Excel file
      const reader = new FileReader();
      reader.onload = function(e) {
        try {
          const data = new Uint8Array(e.target.result);
          const workbook = XLSX.read(data, { type: 'array', cellDates: true });
          
          // Get the first sheet
          const firstSheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheetName];
          
          // Convert to JSON
          const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
          
          if (jsonData && jsonData.length > 0) {
            // Extract headers (first row)
            const headers = jsonData[0];
            setHeaders(headers);
            
            // Extract preview data (next 5 rows or less)
            const previewData = [];
            const rowCount = Math.min(jsonData.length, 6); // 6 because first row is headers
            
            for (let i = 1; i < rowCount; i++) {
              const row = jsonData[i];
              const rowData = {};
              
              headers.forEach((header, index) => {
                rowData[header] = row[index] !== undefined ? row[index] : 'N/A';
              });
              
              previewData.push(rowData);
            }
            
            setPreview(previewData);
            
            // Auto-map fields if possible
            const mapping = {...fieldMapping};
            headers.forEach(field => {
              const lowerField = field.toLowerCase();
              
              if (lowerField.includes('nume') || lowerField === 'name') {
                mapping.name = field;
              } else if (lowerField.includes('email')) {
                mapping.email = field;
              } else if (lowerField.includes('telefon') || lowerField.includes('phone')) {
                mapping.phone = field;
              } else if (lowerField.includes('status') || lowerField.includes('stare')) {
                mapping.status = field;
              } else if (lowerField.includes('companie') || lowerField.includes('firma') || 
                        lowerField.includes('company') || lowerField.includes('business')) {
                mapping.company = field;
              } else if (lowerField.includes('grupa') || lowerField.includes('group')) {
                mapping.group = field;
              }
            });
            
            setFieldMapping(mapping);
            setStep(2);
          } else {
            setError('Fișierul Excel este gol sau are un format invalid.');
          }
        } catch (error) {
          console.error('Excel parsing error:', error);
          setError(`Eroare la citirea fișierului Excel: ${error.message}`);
        }
      };
      
      reader.onerror = function() {
        setError('Eroare la citirea fișierului Excel.');
      };
      
      reader.readAsArrayBuffer(selectedFile);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFile = e.dataTransfer.files[0];
      
      // Check file type
      const fileExtension = droppedFile.name.split('.').pop().toLowerCase();
      if (!['csv', 'xlsx', 'xls'].includes(fileExtension)) {
        setError('Doar fișierele CSV și Excel (XLSX/XLS) sunt acceptate.');
        return;
      }
      
      // Update the file input
      if (fileInputRef.current) {
        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(droppedFile);
        fileInputRef.current.files = dataTransfer.files;
      }
      
      // Process the file
      setFile(droppedFile);
      setFileName(droppedFile.name);
      setError('');
      
      // Parse the file based on its type
      
      if (fileExtension === 'csv') {
        // Parse CSV file
        Papa.parse(droppedFile, {
          header: true,
          preview: 5,
          skipEmptyLines: true,
          complete: function(results) {
          if (results.data && results.data.length > 0) {
            setHeaders(results.meta.fields || []);
            setPreview(results.data);
            
            // Auto-map fields if possible
            const mapping = {...fieldMapping};
            results.meta.fields.forEach(field => {
              const lowerField = field.toLowerCase();
              
              if (lowerField.includes('nume') || lowerField === 'name') {
                mapping.name = field;
              } else if (lowerField.includes('email')) {
                mapping.email = field;
              } else if (lowerField.includes('telefon') || lowerField.includes('phone')) {
                mapping.phone = field;
              } else if (lowerField.includes('status') || lowerField.includes('stare')) {
                mapping.status = field;
              } else if (lowerField.includes('companie') || lowerField.includes('firma') || 
                        lowerField.includes('company') || lowerField.includes('business')) {
                mapping.company = field;
              } else if (lowerField.includes('grupa') || lowerField.includes('group')) {
                mapping.group = field;
              }
            });
            
            setFieldMapping(mapping);
            setStep(2);
          } else {
            setError('Fișierul CSV este gol sau are un format invalid.');
          }
        },
        error: function(error) {
          setError(`Eroare la citirea fișierului CSV: ${error.message}`);
        }
      });
      } else if (['xlsx', 'xls'].includes(fileExtension)) {
        // Parse Excel file
        const reader = new FileReader();
        reader.onload = function(e) {
          try {
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, { type: 'array', cellDates: true });
            
            // Get the first sheet
            const firstSheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[firstSheetName];
            
            // Convert to JSON
            const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
            
            if (jsonData && jsonData.length > 0) {
              // Extract headers (first row)
              const headers = jsonData[0];
              setHeaders(headers);
              
              // Extract preview data (next 5 rows or less)
              const previewData = [];
              const rowCount = Math.min(jsonData.length, 6); // 6 because first row is headers
              
              for (let i = 1; i < rowCount; i++) {
                const row = jsonData[i];
                const rowData = {};
                
                headers.forEach((header, index) => {
                  rowData[header] = row[index] !== undefined ? row[index] : 'N/A';
                });
                
                previewData.push(rowData);
              }
              
              setPreview(previewData);
              
              // Auto-map fields if possible
              const mapping = {...fieldMapping};
              headers.forEach(field => {
                const lowerField = field.toLowerCase();
                
                if (lowerField.includes('nume') || lowerField === 'name') {
                  mapping.name = field;
                } else if (lowerField.includes('email')) {
                  mapping.email = field;
                } else if (lowerField.includes('telefon') || lowerField.includes('phone')) {
                  mapping.phone = field;
                } else if (lowerField.includes('status') || lowerField.includes('stare')) {
                  mapping.status = field;
                } else if (lowerField.includes('companie') || lowerField.includes('firma') || 
                          lowerField.includes('company') || lowerField.includes('business')) {
                  mapping.company = field;
                } else if (lowerField.includes('grupa') || lowerField.includes('group')) {
                  mapping.group = field;
                }
              });
              
              setFieldMapping(mapping);
              setStep(2);
            } else {
              setError('Fișierul Excel este gol sau are un format invalid.');
            }
          } catch (error) {
            console.error('Excel parsing error:', error);
            setError(`Eroare la citirea fișierului Excel: ${error.message}`);
          }
        };
        
        reader.onerror = function() {
          setError('Eroare la citirea fișierului Excel.');
        };
        
        reader.readAsArrayBuffer(droppedFile);
      }
    }
  };

  const handleFieldMappingChange = (field, value) => {
    setFieldMapping({
      ...fieldMapping,
      [field]: value
    });
  };

  const handleImport = async () => {
    try {
      // Check if at least name and email are mapped
      if (!fieldMapping.name || !fieldMapping.email) {
        setError('Numele și emailul sunt obligatorii pentru import.');
        return;
      }
      
      setUploading(true);
      setError('');
      
      // Process file based on its type
      const fileExtension = file.name.split('.').pop().toLowerCase();
      
      if (fileExtension === 'csv') {
        // Process CSV file
        Papa.parse(file, {
          header: true,
          skipEmptyLines: true,
          complete: async function(results) {
            try {
              // Map CSV data to client format
              const clients = results.data.map(row => {
                return {
                  name: fieldMapping.name ? row[fieldMapping.name] : '',
                  email: fieldMapping.email ? row[fieldMapping.email] : '',
                  phone: fieldMapping.phone ? row[fieldMapping.phone] : '',
                  status: fieldMapping.status ? row[fieldMapping.status] : 'Nou',
                  businessDetails: {
                    companyName: fieldMapping.company ? row[fieldMapping.company] : ''
                  },
                  group: fieldMapping.group ? row[fieldMapping.group] : ''
                };
              });
              
              const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5003/api';
              
              // Send clients data to API
              const response = await axios.post(`${API_URL}/clients/import`, { clients }, {
                headers: {
                  Authorization: `Bearer ${localStorage.getItem('token')}`
                }
              });
              
              if (response.data && response.data.success) {
                setSuccess(true);
                if (onImportSuccess) {
                  onImportSuccess(response.data.data);
                }
                
                // Close modal after success
                setTimeout(() => {
                  onClose();
                }, 2000);
              } else {
                throw new Error(response.data?.message || 'Eroare la importul clienților');
              }
            } catch (error) {
              console.error('Error importing clients:', error);
              setError(error.response?.data?.message || 'Eroare la importul clienților. Verificați formatul datelor.');
            } finally {
              setUploading(false);
            }
          },
          error: function(error) {
            setError(`Eroare la citirea fișierului: ${error.message}`);
            setUploading(false);
          }
        });
      } else if (fileExtension === 'xlsx' || fileExtension === 'xls') {
        // Process Excel file
        const reader = new FileReader();
        
        reader.onload = async function(e) {
          try {
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, { type: 'array', cellDates: true });
            
            // Get the first sheet
            const firstSheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[firstSheetName];
            
            // Convert to JSON with headers
            const excelData = XLSX.utils.sheet_to_json(worksheet);
            
            if (excelData && excelData.length > 0) {
              // Map Excel data to client format
              const clients = excelData.map(row => {
                return {
                  name: fieldMapping.name ? row[fieldMapping.name] : '',
                  email: fieldMapping.email ? row[fieldMapping.email] : '',
                  phone: fieldMapping.phone ? row[fieldMapping.phone] : '',
                  status: fieldMapping.status ? row[fieldMapping.status] : 'Nou',
                  businessDetails: {
                    companyName: fieldMapping.company ? row[fieldMapping.company] : ''
                  },
                  group: fieldMapping.group ? row[fieldMapping.group] : ''
                };
              });
              
              const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5003/api';
              
              // Send clients data to API
              const response = await axios.post(`${API_URL}/clients/import`, { clients }, {
                headers: {
                  Authorization: `Bearer ${localStorage.getItem('token')}`
                }
              });
              
              if (response.data && response.data.success) {
                setSuccess(true);
                if (onImportSuccess) {
                  onImportSuccess(response.data.data);
                }
                
                // Close modal after success
                setTimeout(() => {
                  onClose();
                }, 2000);
              } else {
                throw new Error(response.data?.message || 'Eroare la importul clienților');
              }
            } else {
              throw new Error('Fișierul Excel este gol sau are un format invalid.');
            }
          } catch (error) {
            console.error('Error importing Excel clients:', error);
            setError(error.response?.data?.message || 'Eroare la importul clienților din Excel. Verificați formatul datelor.');
          } finally {
            setUploading(false);
          }
        };
        
        reader.onerror = function() {
          setError('Eroare la citirea fișierului Excel.');
          setUploading(false);
        };
        
        reader.readAsArrayBuffer(file);
      }
    } catch (error) {
      console.error('Error handling import:', error);
      setError('Eroare la procesarea importului. Încercați din nou.');
      setUploading(false);
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

        <div className="inline-block align-bottom bg-white rounded-3xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-3xl sm:w-full">
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 px-4 py-5 sm:px-6 flex justify-between items-center">
            <h3 className="text-lg leading-6 font-medium text-gradient-blue-purple">
              {step === 1 ? 'Import Clienți - Încărcare Fișier' : 'Import Clienți - Mapare Câmpuri'}
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
            {step === 1 && (
              <div>
                <p className="text-sm text-gray-500 mb-4">
                Încărcați un fișier CSV sau Excel (XLSX/XLS) cu datele clienților. Fișierul trebuie să conțină cel puțin numele și emailul clienților.
                </p>
                
                <div 
                  className="mt-2 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-xl"
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                >
                  <div className="space-y-1 text-center">
                    <svg
                      className="mx-auto h-12 w-12 text-gray-400"
                      stroke="currentColor"
                      fill="none"
                      viewBox="0 0 48 48"
                      aria-hidden="true"
                    >
                      <path
                        d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                        strokeWidth={2}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    <div className="flex text-sm text-gray-600">
                      <label
                        htmlFor="file-upload"
                        className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500"
                      >
                        <span>Încărcați un fișier</span>
                        <input
                          id="file-upload"
                          name="file-upload"
                          type="file"
                          className="sr-only"
                          accept=".csv,.xlsx,.xls"
                          onChange={handleFileChange}
                          ref={fileInputRef}
                        />
                      </label>
                      <p className="pl-1">sau trageți și plasați</p>
                    </div>
                    <p className="text-xs text-gray-500">Formate acceptate: CSV, Excel (XLSX/XLS)</p>
                  </div>
                </div>
                
                {fileName && (
                  <div className="mt-4 flex items-center bg-blue-50 p-3 rounded-lg">
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
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                      <polyline points="14 2 14 8 20 8"></polyline>
                      <line x1="16" y1="13" x2="8" y2="13"></line>
                      <line x1="16" y1="17" x2="8" y2="17"></line>
                      <polyline points="10 9 9 9 8 9"></polyline>
                    </svg>
                    <span className="text-sm text-gray-700">{fileName}</span>
                  </div>
                )}
                
                {error && (
                  <div className="mt-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                    {error}
                  </div>
                )}
              </div>
            )}
            
            {step === 2 && (
              <div>
                <p className="text-sm text-gray-500 mb-4">
                  Asociați câmpurile din fișierul CSV cu câmpurile din sistem. Câmpurile Nume și Email sunt obligatorii.
                </p>
                
                <div className="grid grid-cols-2 gap-x-4 gap-y-2 mb-4">
                  {/* Name Field */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nume <span className="text-red-500">*</span>
                    </label>
                    <select
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      value={fieldMapping.name}
                      onChange={(e) => handleFieldMappingChange('name', e.target.value)}
                    >
                      <option value="">Selectați câmpul</option>
                      {headers.map((header) => (
                        <option key={header} value={header}>
                          {header}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  {/* Email Field */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email <span className="text-red-500">*</span>
                    </label>
                    <select
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      value={fieldMapping.email}
                      onChange={(e) => handleFieldMappingChange('email', e.target.value)}
                    >
                      <option value="">Selectați câmpul</option>
                      {headers.map((header) => (
                        <option key={header} value={header}>
                          {header}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  {/* Phone Field */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Telefon
                    </label>
                    <select
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      value={fieldMapping.phone}
                      onChange={(e) => handleFieldMappingChange('phone', e.target.value)}
                    >
                      <option value="">Selectați câmpul</option>
                      {headers.map((header) => (
                        <option key={header} value={header}>
                          {header}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  {/* Status Field */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Status
                    </label>
                    <select
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      value={fieldMapping.status}
                      onChange={(e) => handleFieldMappingChange('status', e.target.value)}
                    >
                      <option value="">Selectați câmpul</option>
                      {headers.map((header) => (
                        <option key={header} value={header}>
                          {header}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  {/* Company Field */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Companie
                    </label>
                    <select
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      value={fieldMapping.company}
                      onChange={(e) => handleFieldMappingChange('company', e.target.value)}
                    >
                      <option value="">Selectați câmpul</option>
                      {headers.map((header) => (
                        <option key={header} value={header}>
                          {header}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  {/* Group Field */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Grupă
                    </label>
                    <select
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      value={fieldMapping.group}
                      onChange={(e) => handleFieldMappingChange('group', e.target.value)}
                    >
                      <option value="">Selectați câmpul</option>
                      {headers.map((header) => (
                        <option key={header} value={header}>
                          {header}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                
                {/* Preview Table */}
                <div className="mt-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Previzualizare (primele {preview.length} înregistrări)</h4>
                  <div className="overflow-x-auto border rounded-lg">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          {headers.map((header) => (
                            <th
                              key={header}
                              scope="col"
                              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                            >
                              {header}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {preview.map((row, rowIndex) => (
                          <tr key={rowIndex}>
                            {headers.map((header) => (
                              <td key={`${rowIndex}-${header}`} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {row[header] || 'N/A'}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
                
                {error && (
                  <div className="mt-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                    {error}
                  </div>
                )}
              </div>
            )}
          </div>
          
          <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            {step === 1 && (
              <>
                <button
                  type="button"
                  className={`w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 
                    ${!file ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-gradient-blue-purple text-white hover:bg-blue-700'} 
                    text-base font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm`}
                  onClick={() => file ? setStep(2) : null}
                  disabled={!file}
                >
                  Continuare
                </button>
                <button
                  type="button"
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={onClose}
                >
                  Anulare
                </button>
              </>
            )}
            
            {step === 2 && (
              <>
                <button
                  type="button"
                  className={`w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 
                    ${(!fieldMapping.name || !fieldMapping.email || uploading) ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-gradient-blue-purple text-white hover:bg-blue-700'} 
                    text-base font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm`}
                  onClick={handleImport}
                  disabled={!fieldMapping.name || !fieldMapping.email || uploading}
                >
                  {uploading ? (
                    <span className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Import în curs...
                    </span>
                  ) : success ? (
                    <span className="flex items-center">
                      <svg className="-ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                      Import reușit!
                    </span>
                  ) : (
                    'Importă Clienți'
                  )}
                </button>
                
                <button
                  type="button"
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={() => setStep(1)}
                  disabled={uploading}
                >
                  Înapoi
                </button>
                
                <button
                  type="button"
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={onClose}
                  disabled={uploading}
                >
                  Anulare
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImportClientsModal;
