import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Upload, 
  Download, 
  Trash2, 
  FileText, 
  File, 
  FilePlus,
  AlertCircle,
  Check,
  X
} from 'lucide-react';

const UserDocumentsPanel = ({ userId }) => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [notification, setNotification] = useState(null);

  // Fetch user documents
  useEffect(() => {
    const fetchDocuments = async () => {
      if (!userId) return;
      
      setLoading(true);
      try {
        const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5003/api';
        const response = await axios.get(`${API_URL}/admin/users/${userId}/documents`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        });

        if (response.data && response.data.success) {
          setDocuments(response.data.data || []);
        } else {
          throw new Error(response.data?.message || 'Failed to load documents');
        }
      } catch (err) {
        console.error('Error loading documents:', err);
        setError(err.response?.data?.message || err.message || 'Failed to load documents');
      } finally {
        setLoading(false);
      }
    };

    fetchDocuments();
  }, [userId]);

  // Format file size
  const formatFileSize = (bytes) => {
    if (!bytes) return 'N/A';
    const units = ['B', 'KB', 'MB', 'GB'];
    let size = bytes;
    let unitIndex = 0;
    
    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }
    
    return `${size.toFixed(1)} ${units[unitIndex]}`;
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const options = { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString('ro-RO', options);
  };

  // Handle file upload
  const handleFileUpload = async (event) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    setUploadProgress(0);
    
    const formData = new FormData();
    for (let i = 0; i < files.length; i++) {
      formData.append('documents', files[i]);
    }

    try {
      const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5003/api';
      
      const response = await axios.post(
        `${API_URL}/admin/users/${userId}/documents`, 
        formData, 
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setUploadProgress(percentCompleted);
          }
        }
      );

      if (response.data && response.data.success) {
        // Add new documents to the list
        setDocuments(prev => [...prev, ...(response.data.data || [])]);
        showNotification('success', `${files.length} documente încărcate cu succes`);
      } else {
        throw new Error(response.data?.message || 'Încărcarea documentelor a eșuat');
      }
    } catch (err) {
      console.error('Error uploading documents:', err);
      showNotification('error', err.response?.data?.message || err.message || 'Încărcarea documentelor a eșuat');
    } finally {
      setUploading(false);
      // Reset the file input
      event.target.value = '';
    }
  };

  // Handle document deletion
  const handleDeleteDocument = async (documentId) => {
    if (!documentId) {
      showNotification('error', 'ID-ul documentului lipsește');
      return;
    }
    
    if (!window.confirm('Sigur doriți să ștergeți acest document?')) {
      return;
    }

    try {
      setLoading(true);
      const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5003/api';
      
      const response = await axios.delete(`${API_URL}/admin/documents/${documentId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.data && response.data.success) {
        // Remove document from the list
        setDocuments(prev => prev.filter(doc => doc.id !== documentId));
        showNotification('success', 'Document șters cu succes');
      } else {
        throw new Error(response.data?.message || 'Ștergerea documentului a eșuat');
      }
    } catch (err) {
      console.error('Error deleting document:', err);
      showNotification('error', err.response?.data?.message || err.message || 'Ștergerea documentului a eșuat');
    } finally {
      setLoading(false);
    }
  };

  // Handle document download
  const handleDownloadDocument = async (doc) => {
    try {
      if (!doc || !doc._id) {
        showNotification('error', 'ID-ul documentului lipsește');
        return;
      }
      
      const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5003/api';
      
      const response = await axios.get(`${API_URL}/admin/documents/${doc._id}/download`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        responseType: 'blob'
      });
      
      // Create a blob URL and trigger download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = window.document.createElement('a');
      link.href = url;
      link.setAttribute('download', doc.originalName || 'document');
      window.document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error downloading document:', err);
      showNotification('error', 'Descărcarea documentului a eșuat');
    }
  };

  // Show notification
  const showNotification = (type, message) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 5000);
  };

  // Get file icon based on file type
  const getFileIcon = (fileName) => {
    if (!fileName) return <File />;
    
    const extension = fileName.split('.').pop().toLowerCase();
    
    switch (extension) {
      case 'pdf':
        return <FileText className="text-red-500" />;
      case 'doc':
      case 'docx':
        return <FileText className="text-blue-500" />;
      case 'xls':
      case 'xlsx':
        return <FileText className="text-green-500" />;
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
        return <FileText className="text-purple-500" />;
      default:
        return <File className="text-gray-500" />;
    }
  };

  // Get document type label
  const getDocumentTypeLabel = (type) => {
    const types = {
      'identity': 'Act de identitate',
      'registration': 'Act de înregistrare',
      'financial': 'Document financiar',
      'contract': 'Contract',
      'report': 'Raport',
      'other': 'Alt document'
    };
    
    return types[type] || 'Document';
  };

  // Download contract from contract API
  const handleDownloadContract = async () => {
    try {
      setError(null); // Reset error state
      const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5003/api';
      
      const response = await axios.get(`${API_URL}/contracts/download`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        responseType: 'blob'
      });
      
      // Verify if response has content
      if (response.data.size === 0) {
        throw new Error('Contractul descărcat este gol sau invalid');
      }
      
      // Create a blob URL and trigger download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = window.document.createElement('a');
      link.href = url;
      
      // Determine file extension for setting file name
      const contentType = response.headers['content-type'];
      const extension = contentType === 'application/pdf' ? '.pdf' : '.docx';
      
      link.setAttribute('download', `contract_${userId}${extension}`);
      window.document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      showNotification('success', 'Contract descărcat cu succes');
    } catch (err) {
      console.error('Error downloading contract:', err);
      showNotification('error', err.response?.data?.message || err.message || 'Descărcarea contractului a eșuat');
    }
  };

  // Check if user has a contract
  const [hasContract, setHasContract] = useState(false);

  // Check for contract
  useEffect(() => {
    const checkContract = async () => {
      try {
        const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5003/api';
        
        const response = await axios.get(`${API_URL}/admin/users/${userId}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        });

        if (response.data && response.data.success) {
          const user = response.data.data;
          setHasContract(user.documents?.contractGenerated || false);
        }
      } catch (err) {
        console.error('Error checking contract status:', err);
      }
    };

    if (userId) {
      checkContract();
    }
  }, [userId]);

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-800">Documente utilizator</h2>
        <div>
          <label 
            htmlFor="file-upload" 
            className={`inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg shadow-sm hover:bg-blue-700 transition-colors cursor-pointer ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <FilePlus className="h-4 w-4 mr-2" />
            <span>Încarcă documente</span>
            <input
              id="file-upload"
              type="file"
              multiple
              className="hidden"
              onChange={handleFileUpload}
              disabled={uploading}
            />
          </label>
        </div>
      </div>

      {/* Upload Progress */}
      {uploading && (
        <div className="mb-6">
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div
              className="bg-blue-600 h-2.5 rounded-full"
              style={{ width: `${uploadProgress}%` }}
            ></div>
          </div>
          <p className="text-sm text-gray-600 mt-2">
            Se încarcă... {uploadProgress}%
          </p>
        </div>
      )}

      {/* Notification */}
      {notification && (
        <div 
          className={`mb-6 p-4 rounded-lg flex items-start ${
            notification.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
          }`}
        >
          <div className="flex-shrink-0 mt-0.5">
            {notification.type === 'success' ? (
              <Check className="h-5 w-5 text-green-500" />
            ) : (
              <AlertCircle className="h-5 w-5 text-red-500" />
            )}
          </div>
          <div className="ml-3 flex-1">
            <p className="text-sm font-medium">{notification.message}</p>
          </div>
          <button 
            className="ml-auto flex-shrink-0 text-gray-400 hover:text-gray-500"
            onClick={() => setNotification(null)}
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      )}

      {/* Error message */}
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <AlertCircle className="h-5 w-5 text-red-500" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Contract Section */}
      {hasContract && (
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="h-10 w-10 rounded-md bg-blue-100 flex items-center justify-center text-blue-600 mr-3">
                <FileText className="h-6 w-6" />
              </div>
              <div>
                <h4 className="font-medium text-gray-800">Contract</h4>
                <p className="text-sm text-gray-500">Contract generat pentru utilizator</p>
              </div>
            </div>
            <button
              onClick={handleDownloadContract}
              className="px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
            >
              <Download className="h-4 w-4 mr-2" />
              <span>Descarcă</span>
            </button>
          </div>
        </div>
      )}

      {/* Documents list */}
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : documents.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed rounded-lg">
          <FileText className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Niciun document</h3>
          <p className="mt-1 text-sm text-gray-500">
            Nu există documente încărcate pentru acest utilizator.
          </p>
          <div className="mt-6">
            <label 
              htmlFor="file-upload-empty" 
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 cursor-pointer"
            >
              <Upload className="h-4 w-4 mr-2" />
              <span>Încarcă primul document</span>
              <input
                id="file-upload-empty"
                type="file"
                multiple
                className="hidden"
                onChange={handleFileUpload}
              />
            </label>
          </div>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Document
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tip
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Dimensiune
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Încărcat la
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acțiuni
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {documents.map((doc) => (
                <tr key={doc.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 flex items-center justify-center">
                        {getFileIcon(doc.originalName)}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900 max-w-xs truncate">
                          {doc.originalName || 'Document fără nume'}
                        </div>
                        <div className="text-sm text-gray-500">
                          ID: {doc.id}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-900">
                      {getDocumentTypeLabel(doc.documentType)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatFileSize(doc.fileSize)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(doc.createdAt)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      doc.status === 'verified' 
                        ? 'bg-green-100 text-green-800' 
                        : doc.status === 'rejected' 
                          ? 'bg-red-100 text-red-800'
                          : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {doc.status === 'verified' 
                        ? 'Verificat' 
                        : doc.status === 'rejected' 
                          ? 'Respins' 
                          : 'În așteptare'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end space-x-2">
                      <button
                        onClick={() => handleDownloadDocument(doc)}
                        className="text-blue-600 hover:text-blue-900 p-1"
                        title="Descarcă"
                      >
                        <Download className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleDeleteDocument(doc._id)}
                        className="text-red-600 hover:text-red-900 p-1"
                        title="Șterge"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default UserDocumentsPanel;