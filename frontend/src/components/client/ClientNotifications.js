import React from 'react';

const ClientNotifications = ({ notifications }) => {
  return (
    <div className="bg-white/70 backdrop-blur-md rounded-3xl p-6 mb-8 shadow-lg border border-white/50">
      <h2 className="text-xl font-bold mb-6 bg-gradient-to-r from-gray-700 to-gray-900 bg-clip-text text-transparent">Notificări</h2>
      
      {notifications && notifications.length > 0 ? (
        <div className="space-y-4">
          {notifications.map(notification => (
            <div 
              key={notification.id} 
              className={`p-4 rounded-2xl ${!notification.read ? 
                'bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-100/50 shadow-md' : 
                'bg-white/80 border border-gray-100'
              }`}
            >
              <div className="flex justify-between items-start mb-1">
                <h3 className={`font-semibold ${!notification.read ? 
                  'bg-gradient-to-r from-blue-700 to-purple-700 bg-clip-text text-transparent' : 
                  'text-gray-800'
                }`}>
                  {notification.title}
                </h3>
                <span className="text-xs text-gray-500 bg-white/80 px-2 py-1 rounded-full shadow-sm">{notification.time}</span>
              </div>
              <p className="text-sm text-gray-600">{notification.description}</p>
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