import React, { useState, useEffect } from 'react';
import { Download, FileText } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';

const UserDocumentsView = () => {
  const { currentUser } = useAuth();
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Document status
  const [contractStatus, setContractStatus] = useState({
    participationContract: {
      generated: false,
      signed: false,
      path: null
    },
    consultingContract: {
      generated: false,
      signed: false,
      path: null
    },
    authorityDocument: {
      generated: false,
      signed: false,
      path: null
    }
  });

  // Check for any updates to document status
  const refreshDocumentStatus = async () => {
    try {
      const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5003/api';
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('Token de autentificare lipsă');
      }
      
      // Get user data
      const userResponse = await axios.get(`${API_URL}/auth/me`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      if (userResponse.data && userResponse.data.success && userResponse.data.data) {
        const userData = userResponse.data.data;
        
        // Log the complete document status for debugging
        console.log('Document status from API:', userData.documents);
        
        // Update contract status
        if (userData.documents) {
          setContractStatus({
            participationContract: {
              generated: userData.documents.contractGenerated || false,
              signed: userData.documents.contractSigned || false,
              path: userData.documents.contractPath
            },
            consultingContract: {
              generated: userData.documents.consultingContractGenerated || false,
              signed: userData.documents.consultingContractSigned || false,
              path: userData.documents.consultingContractPath
            },
            authorityDocument: {
              generated: userData.documents.authorityDocumentGenerated || false,
              signed: userData.documents.authorityDocumentSigned || false,
              path: userData.documents.authorityDocumentPath
            }
          });
        }
      }
    } catch (err) {
      console.error('Eroare la actualizarea statusului documentelor:', err);
    }
  };

  // Fetch user data and document status
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5003/api';
        const token = localStorage.getItem('token');
        
        if (!token) {
          throw new Error('Token de autentificare lipsă');
        }
        
        // Get user data
        const userResponse = await axios.get(`${API_URL}/auth/me`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        if (userResponse.data && userResponse.data.success && userResponse.data.data) {
          const userData = userResponse.data.data;
          
          // Log the complete document status for debugging
          console.log('Document status from API:', userData.documents);
          
          // Update contract status
          if (userData.documents) {
            setContractStatus({
              participationContract: {
                generated: userData.documents.contractGenerated || false,
                signed: userData.documents.contractSigned || false,
                path: userData.documents.contractPath
              },
              consultingContract: {
                generated: userData.documents.consultingContractGenerated || false,
                signed: userData.documents.consultingContractSigned || false,
                path: userData.documents.consultingContractPath
              },
              authorityDocument: {
                generated: userData.documents.authorityDocumentGenerated || false,
                signed: userData.documents.authorityDocumentSigned || false,
                path: userData.documents.authorityDocumentPath
              }
            });
          }
        }
        
        // Get user documents
        const documentsResponse = await axios.get(`${API_URL}/user/documents`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        if (documentsResponse.data && documentsResponse.data.success) {
          setDocuments(documentsResponse.data.data || []);
        }
      } catch (err) {
        console.error('Eroare la încărcarea datelor:', err);
        setError(err.response?.data?.message || err.message || 'A apărut o eroare la încărcarea documentelor');
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserData();
  }, []);

  // Download contract
  const handleDownloadParticipationContract = async () => {
    try {
      const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5003/api';
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('Token de autentificare lipsă');
      }
      
      const response = await axios.get(`${API_URL}/contracts/download`, {
        headers: {
          Authorization: `Bearer ${token}`
        },
        responseType: 'blob'
      });
      
      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `contract_participare_${currentUser.name}.pdf`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error('Eroare la descărcarea contractului:', err);
      setError('A apărut o eroare la descărcarea contractului');
    }
  };

  // Download consulting contract
  const handleDownloadConsultingContract = async () => {
    try {
      const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5003/api';
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('Token de autentificare lipsă');
      }
      
      const response = await axios.get(`${API_URL}/contracts/download-consulting`, {
        headers: {
          Authorization: `Bearer ${token}`
        },
        responseType: 'blob'
      });
      
      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `contract_consultanta_${currentUser.name}.pdf`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error('Eroare la descărcarea contractului de consultanță:', err);
      setError('A apărut o eroare la descărcarea contractului de consultanță');
    }
  };

  // Generate consulting contract
  const handleGenerateConsultingContract = async () => {
    try {
      const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5003/api';
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('Token de autentificare lipsă');
      }
      
      await axios.post(`${API_URL}/contracts/generate-consulting`, {}, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      // Refresh contract status
      setContractStatus(prev => ({
        ...prev,
        consultingContract: {
          ...prev.consultingContract,
          generated: true
        }
      }));
      
      // Refresh document status from API
      await refreshDocumentStatus();
      
      // Show success message
      setError(null);
      alert('Contractul de consultanță a fost generat cu succes!');
    } catch (err) {
      console.error('Eroare la generarea contractului de consultanță:', err);
      setError('A apărut o eroare la generarea contractului de consultanță');
    }
  };

  // Download authority document
  const handleDownloadAuthorityDocument = async () => {
    try {
      setError(null);
      console.log('Attempting to download authority document');
      const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5003/api';
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('Token de autentificare lipsă');
      }
      
      const response = await axios.get(`${API_URL}/authority/download`, {
        headers: {
          Authorization: `Bearer ${token}`
        },
        responseType: 'blob'
      });
      
      console.log('Document download response received:', response.status);
      
      // Check if response is valid
      if (response.status !== 200 || !response.data || response.data.size === 0) {
        throw new Error('Documentul descărcat este invalid sau gol');
      }
      
      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      
      // Get proper file extension based on content type
      const isDocx = response.headers['content-type'] && 
                      response.headers['content-type'].includes('openxmlformats');
      const fileExt = isDocx ? '.docx' : '.pdf';
      
      link.setAttribute('download', `imputernicire_${currentUser.name}${fileExt}`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      console.log('Document download successful');
    } catch (err) {
      console.error('Eroare la descărcarea împuternicirii:', err);
      
      // Check if the error indicates the document needs to be generated
      if (err.response && err.response.data && err.response.data.shouldGenerate) {
        setError('Documentul nu există sau nu a fost găsit. Vă rugăm să îl generați din nou.');
        
        // Reset the status so the Generate button appears
        setContractStatus(prev => ({
          ...prev,
          authorityDocument: {
            ...prev.authorityDocument,
            generated: false
          }
        }));
      } else {
        setError('A apărut o eroare la descărcarea împuternicirii. Vă rugăm să încercați din nou.');
      }
    }
  };

  // Generate authority document
  const handleGenerateAuthorityDocument = async () => {
    try {
      setError(null);
      console.log('Attempting to generate authority document');
      const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5003/api';
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('Token de autentificare lipsă');
      }
      
      // Show a loading state
      setLoading(true);
      
      const response = await axios.get(`${API_URL}/authority/generate`, {
        headers: {
          Authorization: `Bearer ${token}`
        },
        responseType: 'blob' // We expect a document in response
      });
      
      console.log('Generation complete, response status:', response.status);
      
      // Update the UI to show document is generated
      setContractStatus(prev => ({
        ...prev,
        authorityDocument: {
          ...prev.authorityDocument,
          generated: true
        }
      }));
      
      // Refresh document status from API to ensure we have the latest state
      await refreshDocumentStatus();
      
      // If the response includes the document, offer it for download
      if (response.data && response.data.size > 0) {
        console.log('Document received, offering for download');
        
        // Create download link
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        
        // Get proper file extension based on content type
        const isDocx = response.headers['content-type'] && 
                       response.headers['content-type'].includes('openxmlformats');
        const fileExt = isDocx ? '.docx' : '.pdf';
        
        link.setAttribute('download', `imputernicire_${currentUser.name}${fileExt}`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
      
      // Show success message
      setError(null);
      setLoading(false);
      alert('Documentul de împuternicire a fost generat cu succes!');
    } catch (err) {
      console.error('Eroare la generarea împuternicirii:', err);
      setLoading(false);
      setError(err.response?.data?.message || err.message || 'A apărut o eroare la generarea împuternicirii');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-xl font-semibold text-gray-800">Documente utilizator</h1>
          <button className="bg-blue-600 text-white px-4 py-2 rounded-md flex items-center text-sm font-medium hover:bg-blue-700 transition-colors">
            <span>Încarcă documente</span>
          </button>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            <p className="text-sm">{error}</p>
          </div>
        )}

        {/* Participation Contract */}
        <div className="mb-4 bg-white rounded-lg shadow overflow-hidden">
          <div className="p-4 flex items-center justify-between border-b border-gray-100">
            <div className="flex items-center">
              <div className="mr-3 text-blue-500">
                <FileText size={20} />
              </div>
              <div>
                <h3 className="font-medium text-gray-800">Contract Participare</h3>
                <p className="text-sm text-gray-500">Contract de participare la cursul de antreprenoriat</p>
              </div>
            </div>
            {contractStatus.participationContract.generated ? (
              <button 
                onClick={handleDownloadParticipationContract}
                className="bg-blue-600 text-white px-3 py-1 rounded-md text-sm flex items-center hover:bg-blue-700 transition-colors"
              >
                <Download size={16} className="mr-1" />
                Descarcă
              </button>
            ) : (
              <span className="text-sm text-gray-500">În așteptare</span>
            )}
          </div>
        </div>

        {/* Consulting Contract */}
        <div className="mb-4 bg-white rounded-lg shadow overflow-hidden">
          <div className="p-4 flex items-center justify-between border-b border-gray-100">
            <div className="flex items-center">
              <div className="mr-3 text-indigo-500">
                <FileText size={20} />
              </div>
              <div>
                <h3 className="font-medium text-gray-800">Contract Consultanță</h3>
                {contractStatus.consultingContract.generated ? (
                  <p className="text-sm text-gray-500">Contract de consultanță pentru programul Start-Up Nation</p>
                ) : (
                  <p className="text-sm text-gray-500">Acest contract nu a fost generat încă</p>
                )}
              </div>
            </div>
            {contractStatus.consultingContract.generated ? (
              <button 
                onClick={handleDownloadConsultingContract}
                className="bg-indigo-600 text-white px-3 py-1 rounded-md text-sm flex items-center hover:bg-indigo-700 transition-colors"
              >
                <Download size={16} className="mr-1" />
                Descarcă
              </button>
            ) : contractStatus.participationContract.signed ? (
              <button 
                onClick={handleGenerateConsultingContract}
                className="bg-green-600 text-white px-3 py-1 rounded-md text-sm flex items-center hover:bg-green-700 transition-colors"
              >
                Generează
              </button>
            ) : (
              <span className="text-sm text-gray-500">În așteptare</span>
            )}
          </div>
        </div>

        {/* Authority Document (Împuternicire) */}
        <div className="mb-4 bg-white rounded-lg shadow overflow-hidden">
          <div className="p-4 flex items-center justify-between border-b border-gray-100">
            <div className="flex items-center">
              <div className="mr-3 text-orange-500">
                <FileText size={20} />
              </div>
              <div>
                <h3 className="font-medium text-gray-800">Împuternicire</h3>
                {contractStatus.authorityDocument.generated ? (
                  <p className="text-sm text-gray-500">Document de împuternicire pentru programul Start-Up Nation</p>
                ) : (
                  <p className="text-sm text-gray-500">Acest document nu a fost generat încă</p>
                )}
              </div>
            </div>
            {contractStatus.authorityDocument.generated ? (
              <button 
                onClick={handleDownloadAuthorityDocument}
                className="bg-orange-600 text-white px-3 py-1 rounded-md text-sm flex items-center hover:bg-orange-700 transition-colors"
              >
                <Download size={16} className="mr-1" />
                Descarcă
              </button>
            ) : contractStatus.consultingContract.signed ? (
              <button 
                onClick={handleGenerateAuthorityDocument}
                className="bg-green-600 text-white px-3 py-1 rounded-md text-sm flex items-center hover:bg-green-700 transition-colors"
              >
                Generează
              </button>
            ) : (
              <span className="text-sm text-gray-500">În așteptare</span>
            )}
          </div>
        </div>

        {/* Documents Table */}
        <div className="mt-8">
          <div className="grid grid-cols-5 gap-4 p-4 bg-gray-100 rounded-t-lg text-gray-600 font-medium">
            <div>DOCUMENT</div>
            <div>TIP</div>
            <div>DIMENSIUNE</div>
            <div>ÎNCĂRCAT LA</div>
            <div className="text-right">ACȚIUNI</div>
          </div>
          
          {documents.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <p>Nu ai încărcat niciun document</p>
            </div>
          ) : (
            documents.map((doc) => (
              <div key={doc._id} className="grid grid-cols-5 gap-4 p-4 border-b border-gray-100 items-center">
                <div className="flex items-center">
                  <FileText className="text-gray-400 mr-2" size={16} />
                  <div className="text-sm truncate">{doc.originalName || doc.name}</div>
                </div>
                <div className="text-sm">{doc.type || 'Document'}</div>
                <div className="text-sm">{Math.round(doc.size / 1024)} KB</div>
                <div className="text-sm">{new Date(doc.createdAt || doc.uploadedAt).toLocaleDateString('ro-RO')}</div>
                <div className="text-right">
                  <button className="text-blue-600 hover:text-blue-800">
                    <Download size={16} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default UserDocumentsView;