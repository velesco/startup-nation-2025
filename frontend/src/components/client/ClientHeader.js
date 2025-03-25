import React, { useState } from 'react';
import { Bell, LogOut, Settings, User, RefreshCw } from 'lucide-react';

const ClientHeader = ({ user, onLogout, onRefresh }) => {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // Handler pentru refresh cu blocarea dublu-click-ului
  const handleRefresh = () => {
    if (isRefreshing) return;
    
    setIsRefreshing(true);
    onRefresh?.();
    
    // Deblochează butonul după 2 secunde
    setTimeout(() => {
      setIsRefreshing(false);
    }, 2000);
  };
  
  // Funcție pentru a obține inițialele
  const getInitials = (name) => {
    if (!name) return "U"; // Default initial
    return name.split(' ').map(n => n[0]).join('');
  };

  return (
    <div className="bg-white/70 backdrop-blur-lg shadow-sm px-6 py-4 flex justify-between items-center rounded-b-3xl border-b border-white/50 z-10">
      <div className="flex items-center space-x-3">
        <div className="h-10 w-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold shadow-lg">
          SN
        </div>
        <h1 className="text-xl font-bold bg-gradient-to-r from-blue-700 to-purple-700 bg-clip-text text-transparent">Startup Nation</h1>
      </div>
      <div className="flex items-center space-x-2">
        <div 
          className={`h-10 w-10 rounded-full ${isRefreshing ? 'bg-gray-100' : 'bg-white/80 hover:bg-blue-50'} backdrop-blur-sm shadow-md flex items-center justify-center cursor-pointer transition-all`}
          onClick={handleRefresh}
          title="Actualizează datele"
        >
          <RefreshCw className={`h-5 w-5 ${isRefreshing ? 'text-gray-400 animate-spin' : 'text-gray-600'}`} />
        </div>
        <div className="relative">
          {user?.notifications?.some(n => !n.read) && (
            <div className="absolute -top-1 -right-1 h-5 w-5 bg-gradient-to-r from-orange-400 to-pink-500 rounded-full flex items-center justify-center shadow-lg animate-pulse">
              <span className="text-white text-xs">{user.notifications.filter(n => !n.read).length}</span>
            </div>
          )}
        </div>
        <div className="relative">
          <div 
            className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold shadow-lg cursor-pointer"
            onClick={() => setShowUserMenu(!showUserMenu)}
          >
            {getInitials(user?.name)}
          </div>
          
          {/* User Menu Dropdown */}
          {showUserMenu && (
            <div className="absolute right-0 top-12 glassmorphism-darker rounded-xl shadow-lg z-20 w-48 py-2">
              <div className="px-4 py-2 border-b border-gray-100">
                <p className="text-sm font-medium text-gray-800">{user?.name || 'Utilizator'}</p>
                <p className="text-xs text-gray-500">{user?.email || 'email@exemplu.com'}</p>
              </div>
              <button className="flex items-center w-full px-4 py-2 text-sm text-left text-gray-700 hover:bg-blue-50/50 transition-colors">
                <User className="h-4 w-4 mr-2 text-gray-500" />
                Profil
              </button>
              <button className="flex items-center w-full px-4 py-2 text-sm text-left text-gray-700 hover:bg-blue-50/50 transition-colors">
                <Settings className="h-4 w-4 mr-2 text-gray-500" />
                Setări
              </button>
              <div className="border-t border-gray-100 my-1"></div>
              <button 
                onClick={onLogout}
                className="flex items-center w-full px-4 py-2 text-sm text-left text-red-600 hover:bg-red-50/50 transition-colors"
              >
                <LogOut className="h-4 w-4 mr-2 text-red-500" />
                Deconectare
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ClientHeader;