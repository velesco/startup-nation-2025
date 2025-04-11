import React from 'react';
import useContractStats from '../../hooks/useContractStats';
import { FileCheck, BookOpen, AlertTriangle, RefreshCw, Upload } from 'lucide-react';

/**
 * Componenta pentru afișarea statisticilor despre contracte în panoul de administrare
 */
const ContractStats = () => {
  const { loading, stats, error, lastUpdated, refreshStats } = useContractStats();

  const handleRefresh = () => {
    refreshStats();
  };

  // Formatăm data ultimei actualizări
  const formatLastUpdated = () => {
    if (!lastUpdated) return 'Niciodată';
    
    // Calculez diferența de timp în secunde
    const secondsAgo = Math.floor((new Date() - lastUpdated) / 1000);
    
    if (secondsAgo < 60) {
      return `Acum ${secondsAgo} secunde`;
    } else if (secondsAgo < 3600) {
      const minutes = Math.floor(secondsAgo / 60);
      return `Acum ${minutes} ${minutes === 1 ? 'minut' : 'minute'}`;
    } else {
      return lastUpdated.toLocaleTimeString();
    }
  };

  if (loading && !stats) {
    return (
      <div className="flex justify-center items-center h-24 bg-white/30 rounded-lg shadow p-4 animate-pulse">
        <div className="text-gray-400">Se încarcă statisticile...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg shadow">
        <div className="flex">
          <div className="flex-shrink-0">
            <AlertTriangle className="h-5 w-5 text-red-400" />
          </div>
          <div className="ml-3">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!stats) return null;

  // Calculăm procentele pentru contracte și buletine
  const standardContractsPercent = stats.totalUsers > 0 
    ? Math.round((stats.standardContracts / stats.totalUsers) * 100) 
    : 0;
    
  const consultingContractsPercent = stats.totalUsers > 0
    ? Math.round((stats.consultingContracts / stats.totalUsers) * 100)
    : 0;
    
  const idCardsPercent = stats.totalUsers > 0
    ? Math.round((stats.usersWithIdCards / stats.totalUsers) * 100)
    : 0;

  return (
    <div className="bg-white/50 rounded-lg shadow-lg p-4">
      <div className="flex justify-between mb-4 items-center">
        <h3 className="text-lg font-semibold text-gray-700">Statistici Contracte</h3>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500">
            Actualizat: {formatLastUpdated()}
          </span>
          <button 
            onClick={handleRefresh}
            className="p-2 text-gray-500 hover:text-blue-600 rounded-full transition-colors"
            title="Actualizează statisticile"
          >
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        {/* Contracte standard */}
        <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-4 shadow">
          <div className="flex justify-between items-start">
            <div>
              <h4 className="text-sm font-medium text-blue-800">Contracte Standard</h4>
              <p className="text-2xl font-bold text-blue-900">{stats.standardContracts}</p>
              <span className="text-sm text-blue-600">{standardContractsPercent}% din utilizatori</span>
            </div>
            <div className="p-3 bg-white rounded-lg shadow-sm">
              <FileCheck className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        {/* Contracte consultanță */}
        <div className="bg-gradient-to-r from-amber-50 to-amber-100 rounded-lg p-4 shadow">
          <div className="flex justify-between items-start">
            <div>
              <h4 className="text-sm font-medium text-amber-800">Contracte Consultanță</h4>
              <p className="text-2xl font-bold text-amber-900">{stats.consultingContracts}</p>
              <span className="text-sm text-amber-600">{consultingContractsPercent}% din utilizatori</span>
            </div>
            <div className="p-3 bg-white rounded-lg shadow-sm">
              <BookOpen className="h-6 w-6 text-amber-600" />
            </div>
          </div>
        </div>
        
        {/* Buletine încărcate */}
        <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-lg p-4 shadow">
          <div className="flex justify-between items-start">
            <div>
              <h4 className="text-sm font-medium text-green-800">Buletine Încărcate</h4>
              <p className="text-2xl font-bold text-green-900">{stats.usersWithIdCards || 0}</p>
              <span className="text-sm text-green-600">{idCardsPercent}% din utilizatori</span>
            </div>
            <div className="p-3 bg-white rounded-lg shadow-sm">
              <Upload className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-between text-xs text-gray-500 mt-2">
        <span>Total utilizatori: {stats.totalUsers}</span>
        <span>{stats.updated ? 'Actualizat automat' : ''}</span>
      </div>
    </div>
  );
};

export default ContractStats;