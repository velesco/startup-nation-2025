import React, { useState } from 'react';
import { RotateCw } from 'lucide-react';

/**
 * Buton pentru actualizarea flag-urilor de documente pentru toți utilizatorii și clienții
 * Acesta va afișa un mesaj de informare despre cum să rulezi actualizarea direct pe server
 */
const UpdateDocumentFlagsButton = () => {
  const [isUpdating, setIsUpdating] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);
  const [showResults, setShowResults] = useState(false);

  const handleUpdateFlags = async () => {
    setIsUpdating(true);
    setError(null);
    setResults(null);
    setShowResults(true);
    
    // În loc să apelăm API-ul, vom afișa instrucțiuni pentru rularea scriptului direct pe server
    setResults({
      success: true,
      message: 'Pentru a actualiza flag-urile de documente, trebuie să rulezi scriptul direct pe server.',
      data: {
        updatedUsersCount: 0,
        updatedClientsCount: 0,
        updatedUsers: [],
        updatedClients: [],
        instructions: [
          '1. Conectează-te la server sau la mașina unde rulează backend-ul',
          '2. Navighează la directorul backend',
          '3. Rulează comanda: node update-document-flags.js',
          '4. Scriptul va actualiza automat toate flag-urile și va afișa rezultatele în consolă',
          '5. După finalizare, reîncarcă pagina pentru a vedea rezultatele'
        ]
      }
    });
    
    setIsUpdating(false);
  };

  // Funcție pentru închiderea rezulatelor
  const handleCloseResults = () => {
    setShowResults(false);
    setResults(null);
    setError(null);
  };

  return (
    <div className="mt-4">

      {/* Modal de rezultate */}
      {showResults && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-3xl w-full max-h-screen overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">Rezultate actualizare</h2>
            
            {error && (
              <div className="mb-4 bg-red-50 p-4 rounded-md border-l-4 border-red-500">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                </div>
              </div>
            )}

            {isUpdating && (
              <div className="flex flex-col items-center justify-center py-8">
                <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                <p className="text-gray-700">Se actualizează flag-urile de documente...</p>
              </div>
            )}

            {results && !isUpdating && (
              <div>
                <div className="bg-blue-50 p-4 rounded-md border-l-4 border-blue-500 mb-6">
                  <p className="text-blue-700">{results.message}</p>
                </div>

                {/* Instrucțiuni pentru rularea scriptului */}
                <div className="bg-gray-50 p-4 rounded-lg mb-6">
                  <h4 className="font-semibold text-lg mb-2">Instrucțiuni:</h4>
                  <ul className="list-disc pl-5 space-y-2">
                    {results.data.instructions.map((instruction, index) => (
                      <li key={index} className="text-gray-700">{instruction}</li>
                    ))}
                  </ul>
                </div>

                <div className="bg-yellow-50 p-4 rounded-md border-l-4 border-yellow-500">
                  <p className="text-yellow-700">
                    <strong>Notă:</strong> Acest proces trebuie rulat direct pe server pentru a evita probleme de CORS și acces la fișiere.
                    Odată rulat scriptul, flag-urile vor fi actualizate în baza de date și vor fi vizibile în interfață.
                  </p>
                </div>
              </div>
            )}

            <div className="mt-6 flex justify-end">
              <button
                onClick={handleCloseResults}
                className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors"
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

export default UpdateDocumentFlagsButton;