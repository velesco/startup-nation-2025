import React, { useState } from 'react';
import { RotateCw, AlertTriangle } from 'lucide-react';
import axios from 'axios';

/**
 * Buton pentru actualizarea informațiilor despre contracte pentru toți utilizatorii
 */
const UpdateContractsButton = ({ onSuccess }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showTip, setShowTip] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleUpdateContracts = async () => {
    setIsLoading(true);
    setError(null);
    setShowSuccess(false);
    setResult(null);

    try {
      const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5003/api';
      
      const response = await axios.post(`${API_URL}/admin/update-contracts`, {}, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.data && response.data.success) {
        setResult(response.data);
        setShowSuccess(true);
        
        // Apelăm callback-ul de succes pentru a actualiza date în componenta părinte dacă este necesar
        if (onSuccess && typeof onSuccess === 'function') {
          onSuccess();
        }
        
        // Ascundem notificarea de succes după 5 secunde
        setTimeout(() => {
          setShowSuccess(false);
        }, 5000);
      } else {
        throw new Error(response.data?.message || 'Actualizarea contractelor a eșuat');
      }
    } catch (err) {
      console.error('Error updating contracts:', err);
      setError(err.response?.data?.message || 'Eroare la actualizarea contractelor. Vă rugăm să încercați din nou.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative">
      <div className="flex items-center">
        <button
          onClick={handleUpdateContracts}
          disabled={isLoading}
          className="bg-gradient-to-r from-amber-500 to-amber-600 text-white px-4 py-2 rounded-lg shadow-sm hover:shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
        >
          {isLoading ? (
            <RotateCw className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <RotateCw className="h-4 w-4 mr-2" />
          )}
          <span>Actualizează stare contracte</span>
        </button>
        
        <button 
          className="ml-2 text-amber-600 hover:text-amber-700 p-1 rounded-full"
          onClick={() => setShowTip(!showTip)}
          title="Informații"
        >
          <AlertTriangle size={16} />
        </button>
      </div>
      
      {showTip && (
        <div className="absolute z-10 w-72 mt-2 right-0 bg-amber-50 border border-amber-200 p-3 rounded-lg shadow-lg text-xs">
          <p className="font-semibold text-amber-800 mb-1">Recomandare:</p>
          <p className="text-amber-700">
            Dacă contractele nu apar după actualizare, verificați dacă fișierele există pe server și 
            dacă numele lor respectă convenția corectă: <br />
            <span className="font-mono bg-amber-100 px-1 rounded">contract_consultanta_[ID].pdf</span>
          </p>
        </div>
      )}
      
      {showSuccess && result && (
        <div className="fixed bottom-4 right-4 bg-green-100 border-l-4 border-green-500 text-green-700 p-4 rounded shadow-lg z-50 max-w-md">
          <div className="flex items-start">
            <div className="ml-3">
              <p className="text-sm font-medium">{result.message}</p>
              <p className="text-xs mt-1">Utilizatori actualizați: {result.updatedCount || 0}</p>
            </div>
          </div>
        </div>
      )}
      
      {error && (
        <div className="mt-2 text-sm text-red-600">
          {error}
        </div>
      )}
    </div>
  );
};

export default UpdateContractsButton;