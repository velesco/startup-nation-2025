import React from 'react';

/**
 * Componentă pentru afișarea statisticilor despre clienți
 */
const ClientsStats = ({ clients }) => {
  // Calculăm numărul de clienți pe status
  const inProgressCount = clients.filter(client => client.status === 'În progres').length || 0;
  const completedCount = clients.filter(client => client.status === 'Complet').length || 0;
  const newCount = clients.filter(client => client.status === 'Nou').length || 0;
  
  // Calculăm rata de conversie
  const conversionRate = clients.length > 0
    ? Math.round((completedCount / clients.length) * 100)
    : 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
      {/* Total Clienți */}
      <div className="glassmorphism rounded-xl p-6 shadow-lg overflow-hidden relative">
        <div className="relative z-10">
          <h3 className="text-gray-500 text-sm">Total Clienți</h3>
          <p className="text-3xl font-bold mt-2 bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
            {clients.length || 0}
          </p>
          <div className="mt-2 h-0.5 w-7 bg-gray-200 rounded-full"></div>
          <div className="mt-4 flex items-center">
            <span className="text-gray-500">
              {inProgressCount} în progres
            </span>
          </div>
        </div>
        <div className="absolute top-0 right-0 w-48 h-48 rounded-full opacity-5 bg-blue-500 transform translate-x-12 -translate-y-12"></div>
      </div>

      {/* Înscriși la Curs */}
      <div className="glassmorphism rounded-xl p-6 shadow-lg overflow-hidden relative">
        <div className="relative z-10">
          <h3 className="text-gray-500 text-sm">Înscriși la Curs</h3>
          <p className="text-3xl font-bold mt-2 bg-gradient-to-r from-green-500 to-teal-400 bg-clip-text text-transparent">
            {completedCount}
          </p>
          <div className="mt-2 h-0.5 w-7 bg-gray-200 rounded-full"></div>
          <div className="mt-4 flex items-center">
            <span className="text-green-500">
              {conversionRate}%
            </span>
            <span className="text-gray-500 ml-1">rată de conversie</span>
          </div>
        </div>
        <div className="absolute top-0 right-0 w-48 h-48 rounded-full opacity-5 bg-green-500 transform translate-x-12 -translate-y-12"></div>
      </div>

      {/* Clienți Noi */}
      <div className="glassmorphism rounded-xl p-6 shadow-lg overflow-hidden relative">
        <div className="relative z-10">
          <h3 className="text-gray-500 text-sm">Clienți Noi (Luna curentă)</h3>
          <p className="text-3xl font-bold mt-2 bg-gradient-to-r from-orange-500 to-pink-500 bg-clip-text text-transparent">
            {newCount}
          </p>
          <div className="mt-2 h-0.5 w-7 bg-gray-200 rounded-full"></div>
          <div className="mt-4 flex items-center">
            <span className="text-gray-500">
              Necesită procesare
            </span>
          </div>
        </div>
        <div className="absolute top-0 right-0 w-48 h-48 rounded-full opacity-5 bg-orange-500 transform translate-x-12 -translate-y-12"></div>
      </div>
    </div>
  );
};

export default ClientsStats;