import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Bell, Info, AlertTriangle, AlertCircle, Check, Activity, FileText } from 'lucide-react';

const ClientNotifications = ({ notifications, onShowAllNotifications }) => {
  const [expandedNotification, setExpandedNotification] = useState(null);
  
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
  
  // Toggle notification expansion
  const toggleNotification = (id) => {
    if (expandedNotification === id) {
      setExpandedNotification(null);
    } else {
      setExpandedNotification(id);
    }
  };

  return (
    <div className="bg-white/70 backdrop-blur-md rounded-3xl p-6 mb-8 shadow-lg border border-white/50">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold bg-gradient-to-r from-gray-700 to-gray-900 bg-clip-text text-transparent">Notificări</h2>
        <button 
          onClick={onShowAllNotifications} 
          className="text-sm text-blue-600 hover:text-blue-800"
        >
          Vezi toate
        </button>
      </div>
      
      {notifications && notifications.length > 0 ? (
        <div className="space-y-4">
          {notifications.map(notification => (
            <div 
              key={notification.id || notification._id} 
              className={`p-4 rounded-2xl cursor-pointer transition-all ${!notification.read ? 
                'bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-100/50 shadow-md' : 
                'bg-white/80 border border-gray-100 hover:border-gray-200 hover:shadow-sm'
              }`}
              onClick={() => toggleNotification(notification.id || notification._id)}
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
                <div className="flex items-center">
                  <span className="text-xs text-gray-500 bg-white/80 px-2 py-1 rounded-full shadow-sm mr-2">
                    {notification.time || (notification.createdAt ? new Date(notification.createdAt).toLocaleDateString('ro-RO') : '')}
                  </span>
                  {expandedNotification === (notification.id || notification._id) ? 
                    <ChevronUp className="h-4 w-4 text-gray-500" /> : 
                    <ChevronDown className="h-4 w-4 text-gray-500" />
                  }
                </div>
              </div>
              <div className={expandedNotification === (notification.id || notification._id) ? "block mt-3" : "hidden"}>
                <p className="text-sm text-gray-600 bg-white/80 p-3 rounded-xl">
                  {notification.description || notification.message}
                </p>
                {notification.actionLink && (
                  <a 
                    href={notification.actionLink} 
                    className="mt-2 text-sm text-blue-600 hover:text-blue-800 inline-flex items-center"
                    onClick={(e) => e.stopPropagation()}
                  >
                    Vezi detalii
                  </a>
                )}
              </div>
              {expandedNotification !== (notification.id || notification._id) && (
                <p className="text-sm text-gray-600 line-clamp-1 mt-1">
                  {notification.description || notification.message}
                </p>
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
  );
};

export default ClientNotifications;