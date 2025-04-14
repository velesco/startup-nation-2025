import React, { useState, useEffect } from 'react';
import { FileText, Download, Check, AlertCircle, FileCheck, Printer, Search, ArrowRight, UserRound, X, PenTool } from 'lucide-react';
import SignatureCapture from '../signature/SignatureCapture';
import axios from 'axios';
import { useAuth } from '../../../contexts/AuthContext';

const ClientAuthorityDocumentStep = ({ onStepComplete, userDocuments }) => {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [documentUrl, setDocumentUrl] = useState('');
  const [documentGenerated, setDocumentGenerated] = useState(false);
  const [documentSigned, setDocumentSigned] = useState(false);
  const [loadingDownload, setLoadingDownload] = useState(false);
  const [loadingReset, setLoadingReset] = useState(false);
  const [showSignatureDialog, setShowSignatureDialog] = useState(false);
  const [signatureSaving, setSignatureSaving] = useState(false);

  // Verificare date document din userDocuments
  useEffect(() => {
    if (userDocuments) {
      if (userDocuments.authorityDocumentGenerated) {
        setDocumentGenerated(true);
      }
      if (userDocuments.authorityDocumentSigned) {
        setDocumentSigned(true);
      }
    }
  }, [userDocuments]);

  // Funcție pentru resetarea documentului
  const handleResetDocument = async () => {
    if (loadingReset) return;
    
    setLoadingReset(true);
    setError('');
    
    try {
      const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5003/api';
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('Nu există token de autentificare. Te rugăm să te conectezi din nou.');
      }
      
      // Apelăm API-ul pentru a reseta statusul documentului
      const response = await axios.post(
        `${API_URL}/authority/reset`,
        {},
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      if (response.data && response.data.success) {
        setDocumentGenerated(false);
        setDocumentSigned(false);
        setDocumentUrl('');
        
        // Notificăm componenta părinte că s-a resetat documentul
        if (onStepComplete && typeof onStepComplete === 'function') {
          // Actualizăm userDocuments pentru a marca documentul ca resetat
          const updatedDocs = { 
            ...userDocuments, 
            authorityDocumentGenerated: false,
            authorityDocumentSigned: false
          };
          onStepComplete('authority_document_reset', updatedDocs);
        }
      } else {
        throw new Error(response.data?.message || 'Eroare la resetarea documentului.');
      }
    } catch (error) {
      console.error('Eroare la resetarea documentului:', error);
      setError(error.response?.data?.message || error.message || 'A apărut o eroare la resetarea documentului. Te rugăm să încerci din nou.');
    } finally {
      setLoadingReset(false);
    }
  };
  
  // Funcție pentru a descărca documentul existent
  const handleDownloadDocument = async (preloadOnly = false) => {
    if (loadingDownload) return;
    
    setLoadingDownload(true);
    setError('');
    
    try {
      const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5003/api';
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('Nu există token de autentificare. Te rugăm să te conectezi din nou.');
      }
      
      // Facem request pentru a descărca documentul salvat
      const response = await axios.get(`${API_URL}/authority/download`, {
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
      
      // Stocăm URL-ul documentului
      setDocumentUrl(url);
      
      // Dacă nu este preload, deschidem documentul într-o fereastră nouă
      if (!preloadOnly) {
        // Creăm un link temporar pentru descărcare
        const downloadLink = document.createElement('a');
        downloadLink.href = url;
        const fileName = `imputernicire_${currentUser?.name || 'utilizator'}.pdf`;
        downloadLink.setAttribute('download', fileName);
        
        // Declanșăm click pentru descărcare
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
      }
      
    } catch (error) {
      console.error('Eroare la descărcarea documentului de împuternicire:', error);
      if (!preloadOnly) {
        setError(error.response?.data?.message || error.message || 'A apărut o eroare la descărcarea documentului de împuternicire.');
      }
    } finally {
      setLoadingDownload(false);
    }
  };

  // Generează documentul de împuternicire
  const handleGenerateDocument = async () => {
    setLoading(true);
    setError('');
    
    try {
      const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5003/api';
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('Nu există token de autentificare. Te rugăm să te conectezi din nou.');
      }
      
      // Facem request pentru a genera documentul
      const response = await axios.get(`${API_URL}/authority/generate`, {
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
      
      // Stocăm URL-ul documentului
      setDocumentUrl(url);
      setDocumentGenerated(true);
      
      // Deschidem într-o fereastră nouă
      window.open(url, '_blank');
      
      // Notificăm componenta părinte că documentul a fost generat
      if (onStepComplete && typeof onStepComplete === 'function') {
        // Actualizăm userDocuments pentru a marca documentul ca generat
        const updatedDocs = { ...userDocuments, authorityDocumentGenerated: true };
        onStepComplete('authority_document_generate', updatedDocs);
      }
    } catch (error) {
      console.error('Eroare la generarea documentului de împuternicire:', error);
      setError(error.message || 'A apărut o eroare la generarea documentului de împuternicire. Te rugăm să încerci din nou.');
    } finally {
      setLoading(false);
    }
  };

  // Marchează documentul ca semnat
  const handleSignDocument = async () => {
    setLoading(true);
    setError('');
    
    try {
      const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5003/api';
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('Nu există token de autentificare. Te rugăm să te conectezi din nou.');
      }
      
      // Verificăm dacă utilizatorul are semnătură salvată
      if (!currentUser.signature && !currentUser.authoritySignature) {
        // Deschide dialog pentru adăugare semnătură
        setShowSignatureDialog(true);
        return;
      }
      
      // Apelăm API-ul pentru a marca documentul ca semnat
      const response = await axios.post(
        `${API_URL}/authority/sign`,
        { signatureData: currentUser.signature || currentUser.authoritySignature },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      if (response.data && response.data.success) {
        setDocumentSigned(true);
        
        // Notificăm componenta părinte că documentul a fost semnat
        if (onStepComplete && typeof onStepComplete === 'function') {
          // Actualizăm userDocuments pentru a marca documentul ca semnat
          const updatedDocs = { 
            ...userDocuments, 
            authorityDocumentGenerated: true,
            authorityDocumentSigned: true 
          };
          onStepComplete('authority_document_sign_only', updatedDocs);
        }
        
        // Redesărcăm documentul semnat
        await handleDownloadDocument();
      } else {
        throw new Error(response.data?.message || 'Eroare la semnarea documentului de împuternicire.');
      }
    } catch (error) {
      console.error('Eroare la semnarea documentului de împuternicire:', error);
      setError(error.response?.data?.message || error.message || 'A apărut o eroare la semnarea documentului de împuternicire. Te rugăm să încerci din nou.');
    } finally {
      setLoading(false);
    }
  };
  
  // Handler pentru salvarea semnăturii și semnarea documentului
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
      
      // Apelăm API-ul pentru a semna documentul direct cu semnătura nou adăugată
      const response = await axios.post(
        `${API_URL}/authority/sign`,
        { signatureData: signatureImageData },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      if (response.data && response.data.success) {
        setDocumentSigned(true);
        
        // Notificăm componenta părinte că documentul a fost semnat
        if (onStepComplete && typeof onStepComplete === 'function') {
          // Actualizăm userDocuments pentru a marca documentul ca semnat
          const updatedDocs = { 
            ...userDocuments, 
            authorityDocumentGenerated: true,
            authorityDocumentSigned: true 
          };
          onStepComplete('authority_document_sign_only', updatedDocs);
        }
        
        // Redesărcăm documentul semnat
        await handleDownloadDocument();
      } else {
        throw new Error(response.data?.message || 'Eroare la semnarea documentului de împuternicire.');
      }
    } catch (error) {
      console.error('Eroare la salvarea semnăturii pentru documentul de împuternicire:', error);
      setError(error.response?.data?.message || error.message || 'A apărut o eroare la salvarea semnăturii. Te rugăm să încerci din nou.');
    } finally {
      setSignatureSaving(false);
    }
  };
  
  // Continuă la următorul pas după ce documentul este semnat
  const handleContinueNext = () => {
    if (onStepComplete && typeof onStepComplete === 'function') {
      onStepComplete('authority_document_complete', {
        ...userDocuments,
        authorityDocumentGenerated: true,
        authorityDocumentSigned: true
      });
    }
  };

  return (
    <div className="bg-white/70 backdrop-blur-md rounded-3xl p-6 mb-8 shadow-lg border border-white/50">
      <h2 className="text-xl font-bold mb-6 bg-gradient-to-r from-gray-700 to-gray-900 bg-clip-text text-transparent">
        Împuternicire
      </h2>
      
      {/* Afișare erori */}
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-start">
          <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
          <p className="text-sm">{error}</p>
        </div>
      )}
      
      {documentSigned ? (
        // Document semnat
        <div className="border-2 border-green-200 rounded-2xl p-8 flex flex-col items-center justify-center bg-green-50/50">
          <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-4 shadow-md">
            <FileCheck className="h-8 w-8 text-green-500" />
          </div>
          <h3 className="text-lg font-semibold text-green-700 mb-2">Împuternicire semnată!</h3>
          <p className="text-center text-gray-600 mb-6">
            Felicitări! Documentul de împuternicire a fost semnat și înregistrat.
            
            <br />
            Acest document reprezintă o împuternicire oficială pentru programul Start-Up Nation 2025.
          </p>
          
          {documentUrl && (
            <div className="flex space-x-4 mb-6">
              <button
                onClick={() => handleDownloadDocument()}
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
                    <span>Descarcă împuternicire</span>
                  </>
                )}
              </button>
            </div>
          )}
          
          {/* Buton pentru a continua la următorul pas */}
          <div className="mt-4">
            <button
              onClick={handleContinueNext}
              className="bg-gradient-to-r from-green-500 to-green-600 text-white px-8 py-2 rounded-full font-medium shadow-md hover:shadow-lg transition-all duration-300 flex items-center"
            >
              <span>Continuă la următorul pas</span>
              <ArrowRight className="h-4 w-4 ml-2" />
            </button>
          </div>
        </div>
      ) : documentGenerated ? (
        // Document generat dar nesemnat
        <div className="border-2 border-blue-200 rounded-2xl p-8 flex flex-col items-center justify-center bg-blue-50/50">
          <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mb-4 shadow-md">
            <FileText className="h-8 w-8 text-blue-600" />
          </div>
          <h3 className="text-lg font-semibold text-blue-700 mb-2">Împuternicire generată!</h3>
          
          <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3 mb-6">
            <button
              onClick={() => handleDownloadDocument()}
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
                <span>Descarcă împuternicire</span>
                </>
              )}
            </button>
            
            <button
              onClick={handleSignDocument}
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
                  <span>Semnează împuternicire</span>
                </>
              )}
            </button>
          </div>
          
          <p className="text-center text-gray-600 mb-6">
            Te rugăm să descarci și să verifici documentul de împuternicire, apoi să-l semnezi electronic folosind butonul de mai sus.
            <br/>
            După semnare, documentul va fi marcat ca fiind semnat în platformă.
          </p>
        </div>
      ) : (
        // Starea inițială - nu a fost generat un document
        <div className="border-2 border-dashed border-blue-200 rounded-2xl p-8 flex flex-col items-center justify-center bg-blue-50/50">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center mb-4 shadow-md">
            <FileText className="h-8 w-8 text-white" />
          </div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Document de Împuternicire</h3>
          <p className="text-center text-gray-600 mb-6">
            Pentru a finaliza înscrierea în program, este necesar să generezi și să semnezi documentul de împuternicire.
            Acest document este necesar pentru reprezentarea ta în cadrul programului Start-Up Nation 2025.
          </p>
          
          <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
            <button 
              onClick={handleGenerateDocument}
              disabled={loading}
              className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-full font-medium shadow-md hover:shadow-lg transition-all duration-300 flex items-center justify-center"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                  <span>Se generează documentul...</span>
                </>
              ) : (
                <>
                  <FileText className="h-4 w-4 mr-2" />
                  <span>Generează împuternicire</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}
      
      <div className="mt-4 px-4">
        <p className="text-sm text-gray-500">
          Documentul va fi generat automat folosind datele tale personale.
        </p>
        <ul className="mt-2 text-xs text-gray-500 list-disc list-inside space-y-1">
          <li>Acest document reprezintă o împuternicire oficială pentru programul Start-Up Nation 2025.</li>
          <li>Documentul va folosi aceleași date personale care au fost folosite în contractele anterioare.</li>
          <li>Vei putea descărca documentul în format PDF după generare.</li>
        </ul>
        
        {(documentGenerated || documentSigned) && (
          <div className="mt-4 border-t border-gray-200 pt-4">
            <p className="text-xs text-gray-500 mb-2">
              {documentSigned 
                ? 'Dacă ai probleme cu vizualizarea documentului semnat, poți reseta starea documentului pentru a-l regenera.' 
                : 'Ai întâmpinat probleme cu generarea documentului? Poți încerca să resetezi documentul.'}
            </p>
            <button
              onClick={handleResetDocument}
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
                  <span>Resetează stare document</span>
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
              Adaugă semnătura ta în spațiul de mai jos. Această semnătură va fi salvată și inclusă în documentul de împuternicire.
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

export default ClientAuthorityDocumentStep;