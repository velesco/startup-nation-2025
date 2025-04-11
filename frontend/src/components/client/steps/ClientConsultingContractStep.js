import React, { useState, useEffect } from 'react';
import { FileText, Download, Check, AlertCircle, FileCheck, Printer, Search, ArrowRight, UserRound, X, PenTool } from 'lucide-react';
import SignatureCapture from '../signature/SignatureCapture';
import axios from 'axios';
import { useAuth } from '../../../contexts/AuthContext';

const ClientConsultingContractStep = ({ onStepComplete, userDocuments }) => {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [contractUrl, setContractUrl] = useState('');
  const [contractGenerated, setContractGenerated] = useState(false);
  const [contractSigned, setContractSigned] = useState(false);
  const [loadingDownload, setLoadingDownload] = useState(false);
  const [loadingReset, setLoadingReset] = useState(false);
  const [showSignatureDialog, setShowSignatureDialog] = useState(false);
  const [signatureSaving, setSignatureSaving] = useState(false);

  // Verificare date contract din userDocuments
  useEffect(() => {
    if (userDocuments) {
      if (userDocuments.consultingContractGenerated) {
        setContractGenerated(true);
      }
      if (userDocuments.consultingContractSigned) {
        setContractSigned(true);
      }
    }
  }, [userDocuments]);

  // Funcție pentru resetarea contractului
  const handleResetContract = async () => {
    if (loadingReset) return;
    
    setLoadingReset(true);
    setError('');
    
    try {
      const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5003/api';
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('Nu există token de autentificare. Te rugăm să te conectezi din nou.');
      }
      
      // Apelăm API-ul pentru a reseta statusul contractului
      const response = await axios.post(
        `${API_URL}/contracts/reset-consulting`,
        {},
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      if (response.data && response.data.success) {
        setContractGenerated(false);
        setContractSigned(false);
        setContractUrl('');
        
        // Notificăm componenta părinte că s-a resetat contractul
        if (onStepComplete && typeof onStepComplete === 'function') {
          // Actualizăm userDocuments pentru a marca contractul ca resetat
          const updatedDocs = { 
            ...userDocuments, 
            consultingContractGenerated: false,
            consultingContractSigned: false
          };
          onStepComplete('consulting_contract_reset', updatedDocs);
        }
      } else {
        throw new Error(response.data?.message || 'Eroare la resetarea contractului.');
      }
    } catch (error) {
      console.error('Eroare la resetarea contractului:', error);
      setError(error.response?.data?.message || error.message || 'A apărut o eroare la resetarea contractului. Te rugăm să încerci din nou.');
    } finally {
      setLoadingReset(false);
    }
  };
  
  // Funcție pentru a descărca contractul existent
  const handleDownloadContract = async (preloadOnly = false) => {
    if (loadingDownload) return;
    
    setLoadingDownload(true);
    setError('');
    
    try {
      const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5003/api';
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('Nu există token de autentificare. Te rugăm să te conectezi din nou.');
      }
      
      // Facem request pentru a descărca contractul salvat
      const response = await axios.get(`${API_URL}/contracts/download-consulting`, {
        responseType: 'blob',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      // Creăm un URL pentru blob-ul primit
      const blob = new Blob([response.data], { 
        type: response.headers['content-type'] || 'application/pdf' 
      });
      const url = URL.createObjectURL(blob);
      
      // Stocăm URL-ul contractului
      setContractUrl(url);
      
      // Dacă nu este preload, deschidem contractul într-o fereastră nouă
      if (!preloadOnly) {
        // Creăm un link temporar pentru descărcare
        const downloadLink = document.createElement('a');
        downloadLink.href = url;
        const fileName = `contract_consultanta_${currentUser?.name || 'utilizator'}.pdf`;
        downloadLink.setAttribute('download', fileName);
        
        // Declanșăm click pentru descărcare
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
      }
      
    } catch (error) {
      console.error('Eroare la descărcarea contractului de consultanță:', error);
      if (!preloadOnly) {
        setError(error.response?.data?.message || error.message || 'A apărut o eroare la descărcarea contractului de consultanță.');
      }
    } finally {
      setLoadingDownload(false);
    }
  };

  // Generează contractul de consultanță (fără semnătură inițial)
  const handleGenerateContract = async () => {
    setLoading(true);
    setError('');
    
    try {
      const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5002/api';
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('Nu există token de autentificare. Te rugăm să te conectezi din nou.');
      }
      
      // Trimitem datele pentru generarea contractului
      const requestData = {
        doresc_consultanta_completa: true
      };
      
      console.log('URL pentru generare contract consultanță:', `${API_URL}/contracts/generate-consulting`);
      console.log('Token de autorizare:', token ? 'disponibil' : 'lipsă');
      console.log('Date trimise:', requestData);
      
      // Facem request pentru a genera contractul folosind URL-ul corect
      const fullUrl = `${API_URL}/contracts/generate-consulting`;
      console.log(`Trimitere POST request la ${fullUrl}`);
      
      // Facem request pentru a genera contractul inițial (fără semnătură)
      const response = await axios.post(
        fullUrl,
        requestData,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      console.log('Răspuns de la generate-consulting:', response.data);
      
      if (response.data && response.data.success) {
        setContractGenerated(true);
        
        // Notificăm componenta părinte că contractul a fost generat
        if (onStepComplete && typeof onStepComplete === 'function') {
          // Actualizăm userDocuments pentru a marca contractul ca generat
          const updatedDocs = { 
            ...userDocuments, 
            consultingContractGenerated: true
          };
          onStepComplete('consulting_contract_generate', updatedDocs);
        }
        
        // Descărcăm contractul pentru vizualizare
        await handleDownloadContract();
      } else {
        throw new Error(response.data?.message || 'Eroare la generarea contractului de consultanță.');
      }
    } catch (error) {
      console.error('Eroare la generarea contractului de consultanță:', error);
      console.error('Detalii eroare:', error.response?.status, error.response?.data);
      setError(error.response?.data?.message || error.message || 'A apărut o eroare la generarea contractului de consultanță. Te rugăm să încerci din nou.');
    } finally {
      setLoading(false);
    }
  };

  // Marchează contractul de consultanță ca semnat
  const handleSignContract = async () => {
    setLoading(true);
    setError('');
    
    try {
      const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5003/api';
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('Nu există token de autentificare. Te rugăm să te conectezi din nou.');
      }
      
      // Verificăm dacă utilizatorul are semnătură salvată
      if (!currentUser.signature && !currentUser.consultingSignature) {
        // Deschide dialog pentru adăugare semnătură
        setShowSignatureDialog(true);
        return;
      }
      
      // Apelăm API-ul pentru a marca contractul ca semnat
      const response = await axios.post(
        `${API_URL}/contracts/sign-consulting`,
        { signatureData: currentUser.signature || currentUser.consultingSignature },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      if (response.data && response.data.success) {
        setContractSigned(true);
        
        // Notificăm componenta părinte că contractul a fost semnat
        if (onStepComplete && typeof onStepComplete === 'function') {
          // Actualizăm userDocuments pentru a marca contractul ca semnat
          const updatedDocs = { 
            ...userDocuments, 
            consultingContractGenerated: true,
            consultingContractSigned: true 
          };
          onStepComplete('consulting_contract_sign_only', updatedDocs);
        }
        
        // Redesărcăm contractul semnat
        await handleDownloadContract();
      } else {
        throw new Error(response.data?.message || 'Eroare la semnarea contractului de consultanță.');
      }
    } catch (error) {
      console.error('Eroare la semnarea contractului de consultanță:', error);
      setError(error.response?.data?.message || error.message || 'A apărut o eroare la semnarea contractului de consultanță. Te rugăm să încerci din nou.');
    } finally {
      setLoading(false);
    }
  };
  
  // Handler pentru salvarea semnăturii și semnarea contractului
  const handleSaveSignature = async (signatureImageData) => {
    setSignatureSaving(true);
    setError('');
    
    try {
      const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5003/api';
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('Nu există token de autentificare. Te rugăm să te conectezi din nou.');
      }
      
      // Închide dialogul de semnătură
      setShowSignatureDialog(false);
      
      // Apelăm API-ul pentru a semna contractul direct cu semnătura nou adăugată
      const response = await axios.post(
        `${API_URL}/contracts/sign-consulting`,
        { signatureData: signatureImageData },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      if (response.data && response.data.success) {
        setContractSigned(true);
        
        // Notificăm componenta părinte că contractul a fost semnat
        if (onStepComplete && typeof onStepComplete === 'function') {
          // Actualizăm userDocuments pentru a marca contractul ca semnat
          const updatedDocs = { 
            ...userDocuments, 
            consultingContractGenerated: true,
            consultingContractSigned: true 
          };
          onStepComplete('consulting_contract_sign_only', updatedDocs);
        }
        
        // Redesărcăm contractul semnat
        await handleDownloadContract();
      } else {
        throw new Error(response.data?.message || 'Eroare la semnarea contractului de consultanță.');
      }
    } catch (error) {
      console.error('Eroare la salvarea semnăturii pentru contract de consultanță:', error);
      setError(error.response?.data?.message || error.message || 'A apărut o eroare la salvarea semnăturii. Te rugăm să încerci din nou.');
    } finally {
      setSignatureSaving(false);
    }
  };
  
  // Handler pentru butonul 'Doresc consultanta completa: Click genereaza Contract consultanta'
  const handleConsultingContractClick = async () => {
    console.log('Buton "Doresc consultanta completa" apăsat');
    setError('');
    
    try {
      // Generăm contractul de consultanță fără a-l marca automat ca semnat
      console.log('Generare contract consultanță...');
      await handleGenerateContract();
    } catch (error) {
      console.error('Eroare la generarea contractului de consultanță:', error);
      setError('Eroare la generarea contractului de consultanță. Te rugăm să încerci din nou.');
    }
  };

  return (
    <div className="bg-white/70 backdrop-blur-md rounded-3xl p-6 mb-8 shadow-lg border border-white/50">
      <h2 className="text-xl font-bold mb-6 bg-gradient-to-r from-gray-700 to-gray-900 bg-clip-text text-transparent">
        Contract de Consultanță
      </h2>
      
      {/* Afișare erori */}
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-start">
          <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
          <p className="text-sm">{error}</p>
        </div>
      )}
      
      {contractSigned ? (
        // Contract semnat
        <div className="border-2 border-green-200 rounded-2xl p-8 flex flex-col items-center justify-center bg-green-50/50">
          <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-4 shadow-md">
            <FileCheck className="h-8 w-8 text-green-500" />
          </div>
          <h3 className="text-lg font-semibold text-green-700 mb-2">Contract de consultanță semnat!</h3>
          <p className="text-center text-gray-600 mb-6">
            Felicitări! Contractul de consultanță a fost semnat și înregistrat. 
            Poți descărca o copie a contractului oricând.
          </p>
          
          {contractUrl && (
            <div className="flex space-x-4 mb-6">
              <button
                onClick={() => handleDownloadContract()}
                disabled={loadingDownload}
                className="bg-blue-600 text-white px-4 py-2 rounded-full font-medium shadow-md hover:bg-blue-700 transition-all duration-300 flex items-center"
              >
                {loadingDownload ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    <span>Se descarcă...</span>
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4 mr-2" />
                    <span>Descarcă contract consultanță</span>
                  </>
                )}
              </button>
            </div>
          )}
          
        </div>
      ) : contractGenerated ? (
        // Contract generat dar nesemnat
        <div className="border-2 border-blue-200 rounded-2xl p-8 flex flex-col items-center justify-center bg-blue-50/50">
          <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mb-4 shadow-md">
            <FileText className="h-8 w-8 text-blue-600" />
          </div>
          <h3 className="text-lg font-semibold text-blue-700 mb-2">Contract de consultanță generat!</h3>
          
          <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3 mb-6">
            <button
              onClick={() => handleDownloadContract()}
              disabled={loadingDownload}
              className="bg-white text-gray-700 border border-gray-300 px-4 py-2 rounded-full font-medium shadow-sm hover:bg-gray-50 transition-all duration-300 flex items-center justify-center"
            >
              {loadingDownload ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-700 mr-2"></div>
                  <span>Se descarcă...</span>
                </>
              ) : (
                <>
                <Download className="h-4 w-4 mr-2" />
                <span>Descarcă contract consultanță</span>
                </>
              )}
            </button>
            
            <button
              onClick={handleSignContract}
              disabled={loading}
              className="bg-blue-600 text-white px-4 py-2 rounded-full font-medium shadow-md hover:bg-blue-700 transition-all duration-300 flex items-center justify-center"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  <span>Se procesează...</span>
                </>
              ) : (
                <>
                  <PenTool className="h-4 w-4 mr-2" />
                  <span>Semnează contract</span>
                </>
              )}
            </button>
          </div>
          
          <p className="text-center text-gray-600 mb-6">
            Te rugăm să descarci și să verifici contractul, apoi să-l semnezi electronic folosind butonul de mai sus.
            <br/>
            După semnare, contractul va fi regenerat automat cu semnătura inclusă și trimis și pe email.
          </p>
        </div>
      ) : (
        // Starea inițială - nu a fost generat un contract
        <div className="border-2 border-dashed border-blue-200 rounded-2xl p-8 flex flex-col items-center justify-center bg-blue-50/50">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center mb-4 shadow-md">
            <FileText className="h-8 w-8 text-white" />
          </div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Contract de Consultanță</h3>
          <p className="text-center text-gray-600 mb-6">
            Pentru a finaliza înscrierea în program, generează contractul de consultanță, descarcă-l și verifică-l, apoi adaugă semnătura ta.
            Contractul final va fi regenerat automat cu semnătura inclusă și trimis pe email.
          </p>
          
          <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
            <button 
              onClick={handleConsultingContractClick}
              disabled={loading}
              className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-full font-medium shadow-md hover:shadow-lg transition-all duration-300 flex items-center justify-center"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                  <span>Se generează contractul...</span>
                </>
              ) : (
                <>
                  <FileText className="h-4 w-4 mr-2" />
                  <span>Generează contract de consultanță</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}
      
      <div className="mt-4 px-4">
        <p className="text-sm text-gray-500">
          Contractul va fi generat automat folosind datele tale personale.
        </p>
        <ul className="mt-2 text-xs text-gray-500 list-disc list-inside space-y-1">
          <li>Acest contract include implicit opțiunea "Doresc consultanță completă".</li>
          <li>Contractul va folosi aceleași date personale ca și contractul anterior.</li>
          <li>Vei putea descărca contractul în format PDF după generare.</li>
        </ul>
        
        {(contractGenerated || contractSigned) && (
          <div className="mt-4 border-t border-gray-200 pt-4">
            <p className="text-xs text-gray-500 mb-2">
              {contractSigned 
                ? 'Dacă ai probleme cu vizualizarea contractului semnat, poți reseta starea contractului pentru a-l regenera.' 
                : 'Ai întâmpinat probleme cu generarea contractului? Poți încerca să resetezi contractul.'}
            </p>
            <button
              onClick={handleResetContract}
              disabled={loadingReset}
              className="text-xs text-red-600 hover:text-red-800 font-medium flex items-center"
            >
              {loadingReset ? (
                <>
                  <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-red-600 mr-1"></div>
                  <span>Se procesează...</span>
                </>
              ) : (
                <>
                  <span>Resetează stare contract</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>
      
      {/* Modal pentru semnătură */}
      {showSignatureDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-lg p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold flex items-center">
                <PenTool className="h-5 w-5 mr-2 text-blue-500" />
                <span>Semnătură olografă</span>
              </h3>
              <button 
                onClick={() => setShowSignatureDialog(false)} 
                className="p-1 rounded-full hover:bg-gray-100"
              >
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>
            
            <p className="text-sm text-gray-600 mb-4">
              Adaugă semnătura ta în spațiul de mai jos. Această semnătură va fi salvată și inclusă în contractul de consultanță.
            </p>
            
            <SignatureCapture 
              onSave={handleSaveSignature} 
              onCancel={() => setShowSignatureDialog(false)}
              required={true}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientConsultingContractStep;