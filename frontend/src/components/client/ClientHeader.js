import React, { useState } from 'react';
import { Bell, LogOut, Settings, User, RefreshCw, X, Info, AlertTriangle, AlertCircle, Check, Activity, FileText } from 'lucide-react';

const ClientHeader = ({ user, onLogout, onRefresh }) => {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showNotificationsModal, setShowNotificationsModal] = useState(false);
  
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

  // Function to determine the notification icon based on type
  const getNotificationIcon = (type) => {
    switch (type) {
      case 'info':
        return <Info className="h-5 w-5 text-blue-500" />;
      case 'success':
        return <Check className="h-5 w-5 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'error':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      case 'meeting':
        return <Activity className="h-5 w-5 text-purple-500" />;
      case 'document':
        return <FileText className="h-5 w-5 text-orange-500" />;
      default:
        return <Bell className="h-5 w-5 text-gray-500" />;
    }
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
        <div 
          className="h-10 w-10 rounded-full bg-white/80 hover:bg-blue-50 backdrop-blur-sm shadow-md flex items-center justify-center cursor-pointer transition-all relative"
          onClick={() => setShowNotificationsModal(true)}
          title="Notificări"
        >
          <Bell className="h-5 w-5 text-gray-600" />
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

      {/* Notifications Modal */}
      {showNotificationsModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-xl">
            <div className="flex justify-between items-center p-4 border-b border-gray-100">
              <h3 className="text-xl font-bold text-gray-800 flex items-center">
                <Bell className="h-6 w-6 text-blue-500 mr-2" />
                Toate notificările
              </h3>
              <button 
                onClick={() => setShowNotificationsModal(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>
            
            <div className="overflow-y-auto flex-1 p-4">
              {user?.notifications && user.notifications.length > 0 ? (
                <div className="space-y-4">
                  {user.notifications.map(notification => (
                    <div 
                      key={notification.id || notification._id} 
                      className={`p-4 rounded-2xl ${!notification.read ? 
                        'bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-100/50 shadow-md' : 
                        'bg-white/80 border border-gray-100'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-1">
                        <div className="flex items-start">
                          <div className="mr-3 mt-1">
                            {getNotificationIcon(notification.type)}
                          </div>
                          <h3 className={`font-semibold ${!notification.read ? 
                            'bg-gradient-to-r from-blue-700 to-purple-700 bg-clip-text text-transparent' : 
                            'text-gray-800'
                          }`}>
                            {notification.title}
                          </h3>
                        </div>
                        <span className="text-xs text-gray-500 bg-white/80 px-2 py-1 rounded-full shadow-sm">
                          {notification.time || (notification.createdAt ? new Date(notification.createdAt).toLocaleDateString('ro-RO') : '')}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 bg-white/80 p-3 rounded-xl mt-2">
                        {notification.description || notification.message}
                      </p>
                      {notification.actionLink && (
                        <a 
                          href={notification.actionLink} 
                          className="mt-2 text-sm text-blue-600 hover:text-blue-800 inline-flex items-center"
                        >
                          Vezi detalii
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-4 text-center text-gray-500">
                  Nu ai notificări noi
                </div>
              )}
            </div>
            
            <div className="p-4 border-t border-gray-100">
              <button 
                onClick={() => setShowNotificationsModal(false)}
                className="w-full py-2 bg-blue-100 text-blue-700 rounded-xl hover:bg-blue-200 transition-colors"
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

export default ClientHeader;