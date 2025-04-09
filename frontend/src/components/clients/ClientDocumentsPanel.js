import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  FileText, 
  Upload, 
  Download, 
  Trash2, 
  Eye,
  X,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';

const ClientDocumentsPanel = ({ clientId }) => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [uploadingDoc, setUploadingDoc] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [documentType, setDocumentType] = useState('identity');
  const [documentName, setDocumentName] = useState('');
  const [previewDocument, setPreviewDocument] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [hasContract, setHasContract] = useState(false);
  const [client, setClient] = useState(null);
  
  // Încărcă documentele clientului
  const fetchClientDocuments = async () => {
    try {
      setLoading(true);
      const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5003/api';
      
      const response = await axios.get(`${API_URL}/admin/clients/${clientId}/documents`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.data && response.data.success) {
        setDocuments(response.data.data);
      } else {
        throw new Error('Failed to load client documents');
      }
    } catch (err) {
      console.error('Error loading client documents:', err);
      setError('Nu s-au putut încărca documentele clientului.');
    } finally {
      setLoading(false);
    }
  };

  // Fetch client data to check for contract
  const fetchClientData = async () => {
    try {
      const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5003/api';
      
      const response = await axios.get(`${API_URL}/admin/clients/${clientId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.data && response.data.success) {
        const clientData = response.data.data;
        setClient(clientData);
        
        // Check if user associated with client has a contract
        if (clientData.userId) {
          const userResponse = await axios.get(`${API_URL}/admin/users/${clientData.userId}`, {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`
            }
          });
          
          if (userResponse.data && userResponse.data.success) {
            const userData = userResponse.data.data;
            setHasContract(userData.documents?.contractGenerated || false);
          }
        }
      }
    } catch (err) {
      console.error('Error fetching client data:', err);
    }
  };

  // Încărcăm documentele la inițializare
  useEffect(() => {
    if (clientId) {
      fetchClientDocuments();
      fetchClientData();
    }
  }, [clientId]);

  // Resetează formularul de încărcare după upload
  useEffect(() => {
    if (uploadSuccess) {
      const timer = setTimeout(() => {
        setUploadSuccess(false);
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [uploadSuccess]);

  // Download contract
  const handleDownloadContract = async () => {
    if (!client || !client.userId) {
      setError('Utilizatorul asociat clientului nu a fost găsit');
      return;
    }
    
    try {
      setError(null); // Reset error state
      const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5003/api';
      
      // Generate token for this specific user to download contract
      const tokenResponse = await axios.post(`${API_URL}/admin/generate-user-token`, 
        { userId: client.userId },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      
      if (!tokenResponse.data || !tokenResponse.data.success) {
        throw new Error(tokenResponse.data?.message || 'Nu s-a putut genera token-ul pentru descărcare');
      }
      
      const userToken = tokenResponse.data.token;
      
      // Use the token to download the contract
      const response = await axios.get(`${API_URL}/contracts/download`, {
        headers: {
          Authorization: `Bearer ${userToken}`
        },
        responseType: 'blob'
      });
      
      // Verify if response has content
      if (response.data.size === 0) {
        throw new Error('Contractul descărcat este gol sau invalid');
      }
      
      // Create a blob URL and trigger download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      
      // Determine file extension based on content type
      const contentType = response.headers['content-type'];
      const extension = contentType === 'application/pdf' ? '.pdf' : '.docx';
      
      const clientName = client.name.replace(/\s+/g, '_');
      link.setAttribute('download', `contract_${clientName}${extension}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error downloading contract:', err);
      setError(err.response?.data?.message || err.message || 'Descărcarea contractului a eșuat');
    }
  };

  // Funcție pentru încărcarea documentelor
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  // Funcție pentru încărcarea documentului
  const handleUploadDocument = async (e) => {
    e.preventDefault();
    
    if (!selectedFile) {
      return;
    }

    try {
      setUploadingDoc(true);
      setError(null);
      const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5003/api';
      
      const formData = new FormData();
      formData.append('document', selectedFile); // Folosim 'document' pentru a se potrivi cu middlewar-ul express-fileupload
      formData.append('type', documentType);
      formData.append('name', documentName || selectedFile.name);
      
      const response = await axios.post(`${API_URL}/admin/clients/${clientId}/documents`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.data && response.data.success) {
        // Resetăm câmpurile și reîncărcăm documentele
        setSelectedFile(null);
        setDocumentType('identity');
        setDocumentName('');
        document.getElementById('fileInput').value = '';
        setUploadSuccess(true);
        fetchClientDocuments();
      } else {
        throw new Error('Failed to upload document');
      }
    } catch (err) {
      console.error('Error uploading document:', err);
      setError('Nu s-a putut încărca documentul. Vă rugăm să încercați din nou.');
    } finally {
      setUploadingDoc(false);
    }
  };

  // Funcție pentru descărcarea documentului
  const handleDownloadDocument = async (docId) => {
    try {
      const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5003/api';
      
      const response = await axios.get(`${API_URL}/admin/documents/${docId}/download`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        responseType: 'blob'
      });
      
      // Crează un URL pentru blob și descarcă fișierul
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      
      // Găsește documentul pentru a obține numele
      const doc = documents.find(d => d._id === docId);
      link.setAttribute('download', doc ? doc.name : 'document');
      
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error('Error downloading document:', err);
      setError('Nu s-a putut descărca documentul. Vă rugăm să încercați din nou.');
    }
  };

  // Funcție pentru ștergerea documentului
  const handleDeleteDocument = async (docId) => {
    if (!window.confirm('Sigur doriți să ștergeți acest document?')) {
      return;
    }
    
    try {
      const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5003/api';
      
      const response = await axios.delete(`${API_URL}/admin/documents/${docId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.data && response.data.success) {
        // Reîncărcăm documentele
        fetchClientDocuments();
      } else {
        throw new Error('Failed to delete document');
      }
    } catch (err) {
      console.error('Error deleting document:', err);
      setError('Nu s-a putut șterge documentul. Vă rugăm să încercați din nou.');
    }
  };

  // Funcție pentru previzualizarea documentului
  const handlePreviewDocument = async (docId, docType) => {
    try {
      const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5003/api';
      
      const response = await axios.get(`${API_URL}/admin/documents/${docId}/download`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        responseType: 'blob'
      });
      
      // Creăm un URL pentru blob
      const url = window.URL.createObjectURL(new Blob([response.data]));
      
      // Găsim documentul pentru a obține numele și tipul MIME
      const doc = documents.find(d => d._id === docId);
      
      setPreviewDocument({
        url,
        type: docType || 'unknown',
        name: doc ? doc.name : 'document',
        mimeType: doc ? doc.mimeType : 'application/octet-stream'
      });
      
      setShowPreview(true);
    } catch (err) {
      console.error('Error previewing document:', err);
      setError('Nu s-a putut previzualiza documentul. Vă rugăm să încercați din nou.');
    }
  };

  // Formatare dată pentru afișare
  const formatDate = (dateString) => {
    const options = { day: '2-digit', month: '2-digit', year: 'numeric' };
    return new Date(dateString).toLocaleDateString('ro-RO', options);
  };

  if (loading && documents.length === 0) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold mb-4">Documente Client</h3>
      
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
                <p className="text-sm text-gray-500">Contract generat pentru acest client</p>
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
      
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded-lg">
          <div className="flex">
            <div className="flex-shrink-0">
              <AlertTriangle className="h-5 w-5 text-red-500" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}
      
      {uploadSuccess && (
        <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-6 rounded-lg">
          <div className="flex">
            <div className="flex-shrink-0">
              <CheckCircle className="h-5 w-5 text-green-500" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-green-700">Documentul a fost încărcat cu succes!</p>
            </div>
          </div>
        </div>
      )}
      
      <div className="bg-gradient-to-r from-orange-50 to-yellow-50 p-4 rounded-lg mb-6 border border-orange-100">
        <h4 className="font-medium text-orange-800 mb-2">Încărcare Document Nou</h4>
        <form onSubmit={handleUploadDocument} className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tip Document</label>
            <select
              value={documentType}
              onChange={(e) => setDocumentType(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              required
            >
              <option value="identity">Act de Identitate</option>
              <option value="registration">Certificat Înregistrare</option>
              <option value="contract">Contract</option>
              <option value="other">Alt Document</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nume Document</label>
            <input
              type="text"
              value={documentName}
              onChange={(e) => setDocumentName(e.target.value)}
              placeholder="Opțional - se va folosi numele fișierului dacă nu este completat"
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Fișier</label>
            <input
              id="fileInput"
              type="file"
              onChange={handleFileChange}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              required
            />
          </div>
          
          <button
            type="submit"
            disabled={uploadingDoc || !selectedFile}
            className={`w-full bg-gradient-to-r from-orange-500 to-pink-500 text-white p-2 rounded-md font-medium flex items-center justify-center ${
              uploadingDoc || !selectedFile ? 'opacity-50 cursor-not-allowed' : 'hover:opacity-90'
            }`}
          >
            {uploadingDoc ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Încărcare...
              </>
            ) : (
              <>
                <Upload className="h-5 w-5 mr-2" />
                Încarcă Document
              </>
            )}
          </button>
        </form>
      </div>
      
      {/* Lista de documente */}
      {documents.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <FileText className="h-12 w-12 mx-auto text-gray-300 mb-2" />
          <p>Nu există documente încărcate pentru acest client.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {documents.map((doc) => (
            <div key={doc._id} className="bg-white p-4 rounded-lg border border-gray-200 hover:shadow-md transition-shadow flex items-center justify-between">
              <div className="flex items-center">
                <div className="h-10 w-10 rounded-md bg-orange-100 flex items-center justify-center text-orange-600">
                  <FileText className="h-6 w-6" />
                </div>
                <div className="ml-3">
                  <h4 className="font-medium text-gray-800">{doc.name}</h4>
                  <div className="flex items-center text-sm text-gray-500">
                    <span className="capitalize">{doc.type}</span>
                    <span className="mx-1">•</span>
                    <span>{formatDate(doc.uploadedAt || doc.createdAt)}</span>
                  </div>
                </div>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => handlePreviewDocument(doc._id, doc.type)}
                  className="p-2 text-green-600 hover:bg-green-50 rounded-md transition-colors"
                  title="Previzualizare"
                >
                  <Eye className="h-5 w-5" />
                </button>
                <button
                  onClick={() => handleDownloadDocument(doc._id)}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                  title="Descarcă"
                >
                  <Download className="h-5 w-5" />
                </button>
                <button
                  onClick={() => handleDeleteDocument(doc._id)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                  title="Șterge"
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {/* Modal pentru previzualizare document */}
      {showPreview && previewDocument && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-75 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            <div className="p-4 border-b flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-800 truncate flex-1">
                {previewDocument.name}
              </h3>
              <button 
                className="p-1 rounded-full hover:bg-gray-100"
                onClick={() => setShowPreview(false)}
              >
                <X className="h-6 w-6 text-gray-500" />
              </button>
            </div>
            
            <div className="flex-1 overflow-auto flex items-center justify-center p-4 bg-gray-100">
              {previewDocument.mimeType?.startsWith('image/') ? (
                <img 
                  src={previewDocument.url} 
                  alt={previewDocument.name} 
                  className="max-w-full max-h-[70vh] object-contain"
                />
              ) : previewDocument.mimeType === 'application/pdf' ? (
                <iframe
                  src={`${previewDocument.url}#toolbar=0&view=FitH`}
                  title={previewDocument.name}
                  className="w-full h-[70vh]"
                  frameBorder="0"
                ></iframe>
              ) : (
                <div className="py-20 px-10 text-center">
                  <FileText className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                  <p className="text-lg text-gray-600 mb-2">Documentul nu poate fi previzualizat direct.</p>
                  <p className="text-gray-500">Tip de fișier: {previewDocument.mimeType}</p>
                  <a 
                    href={previewDocument.url} 
                    download={previewDocument.name}
                    className="mt-4 inline-flex items-center px-4 py-2 bg-orange-600 text-white font-medium rounded-lg hover:bg-orange-700 transition-colors"
                  >
                    <Download className="h-5 w-5 mr-2" />
                    Descarcă documentul
                  </a>
                </div>
              )}
            </div>
            
            <div className="p-4 border-t flex justify-end space-x-3">
              <a 
                href={previewDocument.url} 
                download={previewDocument.name}
                className="px-4 py-2 bg-orange-600 text-white font-medium rounded-lg hover:bg-orange-700 transition-colors flex items-center"
              >
                <Download className="h-5 w-5 mr-2" />
                Descarcă
              </a>
              <button 
                className="px-4 py-2 bg-gray-200 text-gray-800 font-medium rounded-lg hover:bg-gray-300 transition-colors"
                onClick={() => setShowPreview(false)}
              >
                Închide
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientDocumentsPanel;