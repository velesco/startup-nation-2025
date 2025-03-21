import React from 'react';
import { Bell, Calendar, Users, User, FileText, CheckCircle, AlertCircle, Info } from 'lucide-react';

const NotificationsPanel = ({ notifications = [] }) => {
  // Ne asigurăm că notifications este un array valid
  const validNotifications = Array.isArray(notifications) ? notifications : [];
  
  if (validNotifications.length === 0) {
    return (
      <div className="py-6 text-center text-gray-500">
        <Bell className="h-8 w-8 text-gray-300 mx-auto mb-2" />
        <p>Nu aveți notificări noi.</p>
      </div>
    );
  }
  
  // Funcție pentru afișarea icon-ului corespunzător tipului de notificare
  const getNotificationIcon = (type) => {
    switch (type) {
      case 'meeting':
        return <Calendar className="h-5 w-5 text-blue-500" />;
      case 'participant':
        return <User className="h-5 w-5 text-green-500" />;
      case 'group':
        return <Users className="h-5 w-5 text-purple-500" />;
      case 'document':
        return <FileText className="h-5 w-5 text-orange-500" />;
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'warning':
        return <AlertCircle className="h-5 w-5 text-yellow-500" />;
      case 'error':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Info className="h-5 w-5 text-blue-500" />;
    }
  };
  
  // Formatăm data pentru a afișa cât timp a trecut
  const getTimeAgo = (dateString) => {
    try {
      const date = new Date(dateString);
      
      // Verificăm dacă data este validă
      if (isNaN(date.getTime())) {
        console.warn('Data invalidă pentru notificare:', dateString);
        return 'dată necunoscută';
      }
      
      const now = new Date();
      const diffMs = now - date;
      const diffSec = Math.round(diffMs / 1000);
      const diffMin = Math.round(diffSec / 60);
      const diffHour = Math.round(diffMin / 60);
      const diffDay = Math.round(diffHour / 24);
      
      if (diffSec < 60) {
        return 'acum câteva secunde';
      } else if (diffMin < 60) {
        return `acum ${diffMin} ${diffMin === 1 ? 'minut' : 'minute'}`;
      } else if (diffHour < 24) {
        return `acum ${diffHour} ${diffHour === 1 ? 'oră' : 'ore'}`;
      } else if (diffDay < 30) {
        return `acum ${diffDay} ${diffDay === 1 ? 'zi' : 'zile'}`;
      } else {
        return date.toLocaleDateString('ro-RO');
      }
    } catch (error) {
      console.warn('Eroare la calculul timpului trecut:', error);
      return 'dată necunoscută';
    }
  };
  
  return (
    <div className="space-y-1 max-h-80 overflow-y-auto">
      {validNotifications.map((notification, index) => (
        <div 
          key={index}
          className={`p-3 rounded-lg ${notification?.read ? 'bg-white' : 'bg-blue-50'} hover:bg-gray-50 transition-colors`}
        >
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0 mt-0.5">
              {getNotificationIcon(notification?.type)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900">
                {notification?.title || 'Notificare necunoscută'}
              </p>
              <p className="text-xs text-gray-500 mt-0.5">
                {notification?.message || 'Fără conținut'}
              </p>
              <p className="text-xs text-gray-400 mt-1">
                {getTimeAgo(notification?.createdAt)}
              </p>
            </div>
            {notification && !notification.read && (
              <div className="flex-shrink-0">
                <span className="inline-block h-2 w-2 rounded-full bg-blue-600"></span>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default NotificationsPanel;