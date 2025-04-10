import React, { useState, useEffect } from 'react';
import { FileText, Download, Check, AlertCircle, FileCheck, Printer, Search, ArrowRight, UserRound, X, PenTool } from 'lucide-react';
import SignatureCapture from '../signature/SignatureCapture';
import axios from 'axios';
import { useAuth } from '../../../contexts/AuthContext';

const ClientContractStep = ({ onStepComplete, userDocuments }) => {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [contractUrl, setContractUrl] = useState('');
  const [contractGenerated, setContractGenerated] = useState(false);
  const [viewingContract, setViewingContract] = useState(false);
  const [contractSigned, setContractSigned] = useState(false);
  const [loadingDownload, setLoadingDownload] = useState(false);
  const [loadingReset, setLoadingReset] = useState(false);
  const [showDevInfo, setShowDevInfo] = useState(false);
  const [showIdCardDialog, setShowIdCardDialog] = useState(false);
  const [idCardFormData, setIdCardFormData] = useState({});
  const [idCardFormLoading, setIdCardFormLoading] = useState(false);
  const [idCardMissingFields, setIdCardMissingFields] = useState([]);
  const [showSignatureDialog, setShowSignatureDialog] = useState(false);
  const [signatureData, setSignatureData] = useState('');
  const [signatureSaving, setSignatureSaving] = useState(false);
  
  // Vizualizare contract
  const handleViewContract = () => {
    console.log('Opening contract for viewing');
    if (contractUrl) {
      // Deschide contractul într-o fereastră nouă - încercăm să păstrăm extensia potrivită
      console.log('Using existing contract URL for viewing');
      window.open(contractUrl, '_blank');
    } else {
      console.log('No contract URL available, downloading first');
      handleDownloadContract(true);
      // Apăsăm un buton artificial pentru a deschide contractul în fereastă nouă
      setTimeout(() => {
        if (contractUrl) {
          window.open(contractUrl, '_blank');
        }
      }, 1000);
    }
  };
  
  // Dezactivez devInfo în producție
  const isDev = process.env.NODE_ENV === 'development';

  // Verificare date contract din userDocuments
  useEffect(() => {
    if (userDocuments) {
      if (userDocuments.contractGenerated) {
        setContractGenerated(true);
        
        // Afișăm un mesaj special dacă contractul este în format docx
        if (userDocuments.contractFormat === 'docx') {
          console.log('Contract is in DOCX format');
        }
      }
      if (userDocuments.contractSigned) {
        setContractSigned(true);
      }
      // Dacă este semnat sau generat, încercăm să preîncărcăm URL-ul contractului
      if ((userDocuments.contractGenerated || userDocuments.contractSigned) && !contractUrl) {
        handleDownloadContract(true);
      }
    }
  }, [userDocuments]);
  
  // Verificare date buletin înainte de a permite captura semnăturii
  const checkIdCardData = async () => {
    setError('');
    
    try {
      const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5003/api';
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('Nu există token de autentificare. Te rugăm să te conectezi din nou.');
      }
      
      const response = await axios.post(
        `${API_URL}/contracts/validate-id-card`,
        {},
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      if (response.data && response.data.success) {
        // Toate datele sunt complete, putem cere semnătura utilizatorului
        setShowSignatureDialog(true);
      } else {
        // Avem câmpuri lipsă, trebuie să le completăm
        setIdCardMissingFields(response.data?.missingFields || []);
        setShowIdCardDialog(true);
      }
    } catch (error) {
      console.error('Eroare la verificarea datelor din buletin:', error);
      if (error.response?.data?.missingFields) {
        // Avem câmpuri lipsă, deschidem formularul
        setIdCardMissingFields(error.response.data.missingFields);
        setShowIdCardDialog(true);
      } else {
        setError(error.response?.data?.message || error.message || 'A apărut o eroare la verificarea datelor din buletin.');
      }
    }
  };
  
  // Funcție pentru trimiterea datelor din formularul de buletin
  const submitIdCardForm = async (e) => {
    e.preventDefault();
    setIdCardFormLoading(true);
    setError('');
    
    try {
      const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5003/api';
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('Nu există token de autentificare. Te rugăm să te conectezi din nou.');
      }
      
      const response = await axios.post(
        `${API_URL}/contracts/validate-id-card`,
        idCardFormData,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      if (response.data && response.data.success) {
        // Datele au fost salvate cu succes, închidem dialogul
        setShowIdCardDialog(false);
        // Generează contractul
        handleGenerateContract();
      } else {
        // Mai sunt câmpuri lipsă
        setIdCardMissingFields(response.data?.missingFields || []);
        setError(response.data?.message || 'Unele câmpuri sunt încă incomplete.');
      }
    } catch (error) {
      console.error('Eroare la salvarea datelor din buletin:', error);
      setError(error.response?.data?.message || error.message || 'A apărut o eroare la salvarea datelor din buletin.');
    } finally {
      setIdCardFormLoading(false);
    }
  };
  
  // Actualizare câmp formular
  const handleIdCardFormChange = (e) => {
    const { name, value } = e.target;
    setIdCardFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
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
        `${API_URL}/contracts/reset`,
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
            contractGenerated: false,
            contractSigned: false,
            contractPath: null
          };
          onStepComplete('contract_reset', updatedDocs);
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
      console.log('=== START Download Contract ===');
      const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5003/api';
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('Nu există token de autentificare. Te rugăm să te conectezi din nou.');
      }
      
      // Facem request pentru a descărca contractul salvat
      console.log(`Requesting contract download from: ${API_URL}/contracts/download`);
      const response = await axios.get(`${API_URL}/contracts/download`, {
        responseType: 'blob',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      console.log(`Received response with content type: ${response.headers['content-type']}`);
      
      // Creăm un URL pentru blob-ul primit
      const blob = new Blob([response.data], { 
        type: response.headers['content-type'] || 'application/pdf' 
      });
      const url = URL.createObjectURL(blob);
      console.log(`Created blob URL: ${url}`);
      
      // Stocăm URL-ul contractului
      setContractUrl(url);
      
      // Dacă nu este preload, deschidem contractul într-o fereastră nouă
      if (!preloadOnly) {
        console.log('Opening contract in new window');
        // Creăm un link temporar pentru descărcare
        const downloadLink = document.createElement('a');
        downloadLink.href = url;
        
        // Determinăm numele fișierului bazat pe format
        const isDocx = userDocuments?.contractFormat === 'docx';
        const fileName = `contract_${currentUser?.name || 'utilizator'}.${isDocx ? 'docx' : 'pdf'}`;
        downloadLink.setAttribute('download', fileName);
        
        // Declanșăm click pentru descărcare
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
        
        console.log(`Downloaded contract with filename: ${fileName}`);
      }
      
    } catch (error) {
      console.error('Eroare la descărcarea contractului:', error);
      if (!preloadOnly) { // Afișăm eroarea doar dacă nu este preload
        // Verificăm dacă contractul trebuie regenerat
        if (error.response?.data?.shouldGenerate) {
          console.log('Contractul lipsește dar e marcat ca generat. Încercăm să îl regenerăm.');
          setError('Contractul nu a fost găsit. Încercăm să îl regenerăm automat...');
          
          // Așteptăm puțin și apoi încercam să generăm un contract nou
          setTimeout(() => {
            handleGenerateContract();
          }, 2000);
        } else {
          setError(error.response?.data?.message || error.message || 'A apărut o eroare la descărcarea contractului.');
        }
      }
    } finally {
      setLoadingDownload(false);
    }
  };

  // Generează contractul bazat pe datele din buletin
  const handleGenerateContract = async (signature = null) => {
    console.log('=== START Generare Contract ===');
    setLoading(true);
    setError('');
    
    try {
      const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5003/api';
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('Nu există token de autentificare. Te rugăm să te conectezi din nou.');
      }
      
      // Dacă avem semnătura, o folosim pentru contract
      const sig = signature || signatureData;
      console.log('Generăm contract cu semnătură:', !!sig);
      
      // Nu putem folosi window.open direct pentru endpoint-uri care necesită autorizare
      // Vom face request-ul direct cu axios și vom crea un URL pentru blob
      const response = await axios.get(`${API_URL}/contracts/generate`, {
        responseType: 'blob',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      // Creăm un URL pentru blob-ul primit
      const blob = new Blob([response.data], { 
        type: response.headers['content-type'] || 'application/pdf' 
      });
      const contractUrl = URL.createObjectURL(blob);
      
      // Deschidem într-o fereastră nouă
      window.open(contractUrl, '_blank');
      
      // Stocăm URL-ul contractului pentru referință
      setContractUrl(contractUrl);
      setContractGenerated(true);
      
      // Notificăm componenta părinte că contractul a fost generat
      if (onStepComplete && typeof onStepComplete === 'function') {
        // Actualizăm userDocuments pentru a marca contractul ca generat
        const updatedDocs = { ...userDocuments, contractGenerated: true };
        onStepComplete('contract_generate', updatedDocs);
      }
    } catch (error) {
      console.error('Eroare la generarea contractului:', error);
      setError(error.message || 'A apărut o eroare la generarea contractului. Te rugăm să încerci din nou.');
    } finally {
      setLoading(false);
      console.log('=== END Generare Contract ===');
    }
  };

  // Salvează semnătura
  const handleSaveSignature = async (signatureImageData) => {
    setSignatureSaving(true);
    setError('');
    
    try {
      const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5003/api';
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('Nu există token de autentificare. Te rugăm să te conectezi din nou.');
      }
      
      // Apelăm API-ul pentru a salva semnătura
      const response = await axios.post(
        `${API_URL}/contracts/save-signature`,
        { signatureData: signatureImageData },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      if (response.data && response.data.success) {
        console.log('Semnătura a fost salvată cu succes');
        setSignatureData(signatureImageData);
        setShowSignatureDialog(false);
      } else {
        throw new Error(response.data?.message || 'Eroare la salvarea semnăturii.');
      }
    } catch (error) {
      console.error('Eroare la salvarea semnăturii:', error);
      setError(error.message || 'A apărut o eroare la salvarea semnăturii. Te rugăm să încerci din nou.');
    } finally {
      setSignatureSaving(false);
    }
  };
  
  // Marchează contractul ca semnat
  const handleSignContract = async (signature = null) => {
    console.log('=== START Semnare Contract ===');
    setLoading(true);
    setError('');
    
    try {
      const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5003/api';
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('Nu există token de autentificare. Te rugăm să te conectezi din nou.');
      }
      
      // Apelăm API-ul pentru a marca contractul ca semnat
      const response = await axios.post(
        `${API_URL}/contracts/sign`,
        { signatureData: signature || signatureData },
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
            contractGenerated: true,
            contractSigned: true 
          };
          onStepComplete('contract_sign', updatedDocs);
        }
      } else {
        throw new Error(response.data?.message || 'Eroare la semnarea contractului.');
      }
    } catch (error) {
      console.error('Eroare la semnarea contractului:', error);
      setError(error.message || 'A apărut o eroare la semnarea contractului. Te rugăm să încerci din nou.');
    } finally {
      setLoading(false);
      console.log('=== END Semnare Contract ===');
    }
  };

  return (
    <div className="bg-white/70 backdrop-blur-md rounded-3xl p-6 mb-8 shadow-lg border border-white/50">
      <h2 className="text-xl font-bold mb-6 bg-gradient-to-r from-gray-700 to-gray-900 bg-clip-text text-transparent">
      Contract Curs Antreprenoriat
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
          <h3 className="text-lg font-semibold text-green-700 mb-2">Contract semnat cu succes!</h3>
          <p className="text-center text-gray-600 mb-6">
            Contractul tău a fost semnat și înregistrat. Poți descărca o copie a contractului oricând.
            {userDocuments.contractFormat === 'docx' && (
              <span className="block mt-2 text-amber-600 text-sm">
                Contractul este în format Microsoft Word (DOCX) și poate fi deschis cu orice program care suportă acest format.
              </span>
            )}
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
                    <span>Descarcă contract {userDocuments.contractFormat === 'docx' ? '(DOCX)' : ''}</span>
                  </>
                )}
              </button>
            </div>
          )}
          
          {/* Buton pentru a continua la următorul pas */}
          <div className="mt-4">
            <button
              onClick={() => onStepComplete('contract_complete')}
              className="bg-gradient-to-r from-green-500 to-green-600 text-white px-8 py-2 rounded-full font-medium shadow-md hover:shadow-lg transition-all duration-300 flex items-center"
            >
              <span>Continuă la următorul pas</span>
              <ArrowRight className="h-4 w-4 ml-2" />
            </button>
          </div>
        </div>
      ) : contractGenerated ? (
        // Contract generat dar nesemnat
        <div className="border-2 border-blue-200 rounded-2xl p-8 flex flex-col items-center justify-center bg-blue-50/50">
          <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mb-4 shadow-md">
            <FileText className="h-8 w-8 text-blue-600" />
          </div>
          <h3 className="text-lg font-semibold text-blue-700 mb-2">Contract generat cu succes!</h3>
          
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
                <span>Descarcă contract {userDocuments.contractFormat === 'docx' ? '(DOCX)' : ''}</span>
                </>
              )}
            </button>

            <button
              onClick={() => {
                console.log('Buton "Continuă la Contract Consultanță" apăsat');
                // Salvăm explicit pasul 3 în localStorage pentru a asigura persistența
                localStorage.setItem('currentStep', '3');
                // Actualizare stare documente pentru a marca contractul ca fiind completat
                onStepComplete('contract_complete');
                // Forțăm setarea pasului 3 direct în localStorage
                localStorage.setItem('forceNextStep', '3');
              }}
              className="bg-gradient-to-r from-green-500 to-green-600 text-white px-4 py-2 rounded-full font-medium shadow-md hover:shadow-lg transition-all duration-300 flex items-center justify-center"
            >
              <span>Continuă la Contract Consultanță</span>
              <ArrowRight className="h-4 w-4 ml-2" />
            </button>
          </div>

          <p className="text-center text-gray-600 mb-6">
            Felicitări pentru înscriere! <br/>
            În următorul pas, vă rugăm să generați și contractul de consultanță.<br/>
            Procesul de înscriere pe aplicația ministerului va fi realizat de consultanți mai departe. <br/>
          </p>
        </div>
      ) : (
        // Starea inițială - nu a fost generat un contract
        <div className="border-2 border-dashed border-blue-200 rounded-2xl p-8 flex flex-col items-center justify-center bg-blue-50/50">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center mb-4 shadow-md">
            <FileText className="h-8 w-8 text-white" />
          </div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Contract de Participare</h3>
          <p className="text-center text-gray-600 mb-6">
            Pentru a finaliza înscrierea în program, mai întâi adaugă semnătura, apoi generează contractul. Semnătura va fi inclusă în documentul final.
          </p>
          
          <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
            <button 
              onClick={checkIdCardData}
              disabled={loading}
              className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-full font-medium shadow-md hover:shadow-lg transition-all duration-300 flex items-center justify-center"
            >
              <PenTool className="h-4 w-4 mr-2" />
              <span>Adaugă semnătura</span>
            </button>
            
            <button 
              onClick={() => handleGenerateContract(signatureData)}
              disabled={loading || !signatureData}
              className={`px-6 py-3 rounded-full font-medium shadow-md flex items-center justify-center ${signatureData ? 'bg-green-600 text-white hover:bg-green-700' : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                  <span>Se generează contractul...</span>
                </>
              ) : (
                <>
                  <ArrowRight className="h-4 w-4 mr-2" />
                  <span>Generează contract</span>
                </>
              )}
            </button>
          </div>
          
          {signatureData && (
            <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-green-700 text-sm flex items-center">
                <Check className="h-4 w-4 mr-2 text-green-500" />
                Semnătura a fost adăugată cu succes. Acum poți genera contractul.
              </p>
            </div>
          )}
        </div>
      )}
      
      <div className="mt-4 px-4">
        <p className="text-sm text-gray-500">
          Contractul va fi generat automat folosind datele din buletin.
        </p>
        <ul className="mt-2 text-xs text-gray-500 list-disc list-inside space-y-1">
          <li>Te rugăm să verifici dacă toate datele din contract sunt corecte.</li>
          <li>Contractul este disponibil în format PDF pentru descărcare și printare.</li>
          <li>Contractul semnat electronic are aceeași valoare ca un contract semnat fizic.</li>
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
        
        {isDev && (
          <div className="mt-4 border-t border-gray-300 pt-4">
            <button 
              onClick={() => setShowDevInfo(!showDevInfo)}
              className="text-xs text-gray-600 hover:text-gray-800 flex items-center"
            >
              
              <span>{showDevInfo ? 'Ascunde informații debug' : 'Arată informații debug'}</span>
            </button>
            
            {showDevInfo && (
              <div className="mt-2 p-2 bg-gray-100 rounded text-xs">
                <h4 className="font-medium mb-1">Informații ID Card:</h4>
                <pre className="whitespace-pre-wrap overflow-auto max-h-96 text-xs">
                  {currentUser && currentUser.idCard ? JSON.stringify(currentUser.idCard, null, 2) : 'Nu există date ID Card'}
                </pre>
                
                <h4 className="font-medium mt-3 mb-1">Informații Documents:</h4>
                <pre className="whitespace-pre-wrap overflow-auto max-h-96 text-xs">
                  {userDocuments ? JSON.stringify(userDocuments, null, 2) : 'Nu există documents'}
                </pre>
                
                <div className="mt-3 flex space-x-2">
                  <button
                    onClick={() => alert(JSON.stringify(currentUser?.idCard || {}, null, 2))}
                    className="bg-gray-200 hover:bg-gray-300 text-xs px-2 py-1 rounded"
                  >
                    Alert ID Card
                  </button>
                  <button
                    onClick={() => window.localStorage.setItem('idCardDebug', JSON.stringify(currentUser?.idCard || {}))}
                    className="bg-gray-200 hover:bg-gray-300 text-xs px-2 py-1 rounded"
                  >
                    Save to localStorage
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* Modal pentru completarea datelor din buletin lipsă */}
      {showIdCardDialog && (

        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-lg p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold flex items-center">
                <UserRound className="h-5 w-5 mr-2 text-blue-500" />
                <span>Completează datele din buletin</span>
              </h3>
              <button 
                onClick={() => setShowIdCardDialog(false)} 
                className="p-1 rounded-full hover:bg-gray-100"
              >
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>
            
            {error && (
              <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-lg text-sm flex items-start">
                <AlertCircle className="h-4 w-4 mr-2 flex-shrink-0 mt-0.5" />
                <p>{error}</p>
              </div>
            )}
            
            <p className="text-sm text-gray-600 mb-4">
              Unele date din buletin lipsesc. Te rugăm să completezi următoarele câmpuri pentru a putea genera contractul.
            </p>
            
            <form onSubmit={submitIdCardForm}>
              <div className="space-y-4">
                {idCardMissingFields.includes('CNP') && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">CNP</label>
                    <input
                      type="text"
                      name="CNP"
                      value={idCardFormData.CNP || ''}
                      onChange={handleIdCardFormChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                      required
                    />
                  </div>
                )}
                
                {idCardMissingFields.includes('nume și prenume') && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nume și prenume</label>
                    <input
                      type="text"
                      name="fullName"
                      value={idCardFormData.fullName || ''}
                      onChange={handleIdCardFormChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                      required
                    />
                  </div>
                )}
                
                {idCardMissingFields.includes('adresa') && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Adresa</label>
                    <textarea
                      name="address"
                      value={idCardFormData.address || ''}
                      onChange={handleIdCardFormChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                      rows="2"
                      required
                    ></textarea>
                  </div>
                )}
                
                <div className="grid grid-cols-2 gap-4">
                  {idCardMissingFields.includes('seria') && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Seria</label>
                      <input
                        type="text"
                        name="series"
                        value={idCardFormData.series || ''}
                        onChange={handleIdCardFormChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                        required
                      />
                    </div>
                  )}
                  
                  {idCardMissingFields.includes('numărul') && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Număr</label>
                      <input
                        type="text"
                        name="number"
                        value={idCardFormData.number || ''}
                        onChange={handleIdCardFormChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                        required
                      />
                    </div>
                  )}
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Emis de</label>
                    <input
                      type="text"
                      name="issuedBy"
                      value={idCardFormData.issuedBy || ''}
                      onChange={handleIdCardFormChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Data nașterii</label>
                    <input
                      type="date"
                      name="birthDate"
                      value={idCardFormData.birthDate || ''}
                      onChange={handleIdCardFormChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                    />
                  </div>
                </div>
              </div>
              
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowIdCardDialog(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Anulează
                </button>
                <button
                  type="submit"
                  disabled={idCardFormLoading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md shadow-sm text-sm font-medium hover:bg-blue-700 flex items-center"
                >
                  {idCardFormLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      <span>Se salvează...</span>
                    </>
                  ) : (
                    <span>Salvează și generează contract</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
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
              Adaugă semnătura ta în spațiul de mai jos. Această semnătură va fi salvată și ulterior inclusă în contract atunci când îl vei genera.
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

export default ClientContractStep;