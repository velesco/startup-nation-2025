import React, { useState, useEffect } from 'react';
import { CheckCircle, Check, Smartphone } from 'lucide-react';

const ClientAppDownloadStep = ({ onStepComplete, userDocuments }) => {
  const [isCompleted, setIsCompleted] = useState(false);
  
  // Verificăm dacă aplicația a fost deja descărcată
  useEffect(() => {
    if (userDocuments && userDocuments.appDownloaded) {
      setIsCompleted(true);
    }
  }, [userDocuments]);

  // Gestionare descărcare aplicație
  const handleAppDownload = (store) => {
    // Simulăm descărcarea
    console.log(`Descărcare din ${store}`);
    
    // Setăm ca fiind completat
    setIsCompleted(true);
    
    // Notificăm componenta părinte că acest pas a fost completat
    if (onStepComplete && typeof onStepComplete === 'function') {
      setTimeout(() => {
        onStepComplete('app_download');
      }, 1000);
    }
  };

  return (
    <div className="bg-white/70 backdrop-blur-md rounded-3xl p-6 mb-8 shadow-lg border border-white/50 flex flex-col items-center relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-gradient-to-br from-green-400/20 to-teal-500/20 blur-2xl"></div>
      <div className="absolute bottom-0 left-0 w-32 h-32 rounded-full bg-gradient-to-tr from-orange-400/20 to-pink-500/20 blur-2xl"></div>
      
      <div className="w-16 h-16 rounded-2xl bg-gradient-to-r from-green-400 to-teal-500 flex items-center justify-center mb-4 shadow-md">
        {isCompleted ? (
          <Check className="h-8 w-8 text-white" />
        ) : (
          <Smartphone className="h-8 w-8 text-white" />
        )}
      </div>
      
      <h2 className="text-xl font-bold mb-2 bg-gradient-to-r from-green-600 to-teal-600 bg-clip-text text-transparent">
        {isCompleted ? 'Felicitări!' : 'Descarcă Aplicația'}
      </h2>
      
      <p className="text-center text-gray-600 mb-8 max-w-xs">
        {isCompleted 
          ? 'Ai completat toți pașii necesari pentru înscrierea în programul Startup Nation 2025.'
          : 'Pentru a finaliza înscrierea, descarcă aplicația Startup Nation 2025 din magazinul de aplicații.'}
      </p>
      
      <div className="w-48 h-48 bg-white rounded-3xl mb-8 shadow-md flex items-center justify-center border border-gray-200 relative overflow-hidden">
        <div className="text-gray-400 text-xs">QR Code pentru aplicație</div>
        <div className="absolute bottom-3 right-3 w-10 h-10 rounded-full bg-gradient-to-r from-orange-400 to-pink-500 opacity-70 blur-md"></div>
      </div>
      
      <div className="flex space-x-4">
        <button 
          className={`px-6 py-3 rounded-full font-medium shadow-md transition-all duration-300 flex items-center ${
            isCompleted ? 'bg-gray-200 text-gray-500' : 'bg-gradient-to-r from-gray-800 to-gray-900 text-white hover:shadow-lg'
          }`}
          onClick={() => handleAppDownload('App Store')}
          disabled={isCompleted}
        >
          <span>App Store</span>
        </button>
        
        <button 
          className={`px-6 py-3 rounded-full font-medium shadow-md transition-all duration-300 flex items-center ${
            isCompleted ? 'bg-gray-200 text-gray-500' : 'bg-gradient-to-r from-green-600 to-teal-500 text-white hover:shadow-lg'
          }`}
          onClick={() => handleAppDownload('Google Play')}
          disabled={isCompleted}
        >
          <span>Google Play</span>
        </button>
      </div>
    </div>
  );
};

export default ClientAppDownloadStep;