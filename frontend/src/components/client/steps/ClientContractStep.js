import React, { useState, useEffect } from 'react';
import { FileText, Download, Check, AlertCircle, FileCheck, Printer, Search, ArrowRight } from 'lucide-react';
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

  // Verifică dacă contractul a fost generat/semnat anterior
  useEffect(() => {
    if (userDocuments && userDocuments.contractGenerated) {
      setContractGenerated(true);
    }
    if (userDocuments && userDocuments.contractSigned) {
      setContractSigned(true);
    }
  }, [userDocuments]);

  // Generează contractul bazat pe datele din buletin
  const handleGenerateContract = async () => {
    console.log('=== START Generare Contract ===');
    setLoading(true);
    setError('');
    
    try {
      const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5003/api';
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('Nu există token de autentificare. Te rugăm să te conectezi din nou.');
      }
      
      // Verificăm dacă datele din buletin sunt completate
      if (!currentUser.idCard || !currentUser.idCard.CNP || !currentUser.idCard.fullName) {
        throw new Error('Datele din buletin nu sunt complete. Te rugăm să completezi toate datele din buletin înainte de a genera contractul.');
      }
      
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

  // Marchează contractul ca semnat
  const handleSignContract = async () => {
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
        {},
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
        Contract de Participare
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
          </p>
          
          {contractUrl && (
            <div className="flex space-x-4 mb-6">
              <a 
                href={contractUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-blue-600 text-white px-4 py-2 rounded-full font-medium shadow-md hover:bg-blue-700 transition-all duration-300 flex items-center"
              >
                <Download className="h-4 w-4 mr-2" />
                <span>Descarcă contract</span>
              </a>
              <a 
                href={contractUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white text-gray-700 border border-gray-300 px-4 py-2 rounded-full font-medium shadow-sm hover:bg-gray-50 transition-all duration-300 flex items-center"
              >
                <Printer className="h-4 w-4 mr-2" />
                <span>Printează</span>
              </a>
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
          <p className="text-center text-gray-600 mb-6">
            Te rugăm să descarci contractul, să îl citești cu atenție, și apoi să confirmi că ești de acord cu termenii și condițiile.
          </p>
          
          <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3 mb-6">
            <a 
              href={contractUrl || '#'}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-blue-600 text-white px-4 py-2 rounded-full font-medium shadow-md hover:bg-blue-700 transition-all duration-300 flex items-center justify-center"
            >
              <Search className="h-4 w-4 mr-2" />
              <span>Vizualizează contract</span>
            </a>
            <a 
              href={contractUrl || '#'}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white text-gray-700 border border-gray-300 px-4 py-2 rounded-full font-medium shadow-sm hover:bg-gray-50 transition-all duration-300 flex items-center justify-center"
            >
              <Download className="h-4 w-4 mr-2" />
              <span>Descarcă contract</span>
            </a>
          </div>
          
          <button
            onClick={handleSignContract}
            disabled={loading}
            className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white py-3 rounded-xl font-medium shadow-md hover:shadow-lg transition-all duration-300 flex items-center justify-center"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                <span>Se procesează...</span>
              </>
            ) : (
              <>
                <Check className="h-5 w-5 mr-2" />
                <span>Confirm și semnez contractul</span>
              </>
            )}
          </button>
        </div>
      ) : (
        // Starea inițială - nu a fost generat un contract
        <div className="border-2 border-dashed border-blue-200 rounded-2xl p-8 flex flex-col items-center justify-center bg-blue-50/50">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center mb-4 shadow-md">
            <FileText className="h-8 w-8 text-white" />
          </div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Contract de Participare</h3>
          <p className="text-center text-gray-600 mb-6">
            Pentru a finaliza înscrierea în program, te rugăm să generezi și să semnezi contractul de participare.
          </p>
          
          <button 
            onClick={handleGenerateContract}
            disabled={loading}
            className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-full font-medium shadow-md hover:shadow-lg transition-all duration-300 flex items-center"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                <span>Se generează contractul...</span>
              </>
            ) : (
              <>
                <span>Generează contract</span>
                <ArrowRight className="h-4 w-4 ml-2" />
              </>
            )}
          </button>
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
      </div>
    </div>
  );
};

export default ClientContractStep;