import React from 'react';
import {
  Bell,
  Info,
  AlertTriangle,
  AlertCircle,
  Check,
  Activity,
  FileText,
  Calendar,
  User,
  Trash2,
  Eye
} from 'lucide-react';

// Funcție pentru formatarea datei
const formatDate = (dateString) => {
  const options = { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' };
  return new Date(dateString).toLocaleDateString('ro-RO', options);
};

// Funcție pentru obținerea timpului relativ (ex: "acum 5 minute")
const getRelativeTime = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now - date) / 1000);
  
  if (diffInSeconds < 60) {
    return 'chiar acum';
  }
  
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `acum ${diffInMinutes} ${diffInMinutes === 1 ? 'minut' : 'minute'}`;
  }
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `acum ${diffInHours} ${diffInHours === 1 ? 'oră' : 'ore'}`;
  }
  
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) {
    return `acum ${diffInDays} ${diffInDays === 1 ? 'zi' : 'zile'}`;
  }
  
  // Pentru notificări mai vechi de 7 zile, afișăm data completă
  return formatDate(dateString);
};

// Componenta de reprezentare a unei notificări
const NotificationItem = ({ notification, onDelete, isAdmin = false }) => {
  // Definesc icoanele și culorile în funcție de tipul notificării
  const getTypeIcon = (type) => {
    switch (type) {
      case 'info':
        return <Info className="h-6 w-6 text-blue-500" />;
      case 'success':
        return <Check className="h-6 w-6 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="h-6 w-6 text-yellow-500" />;
      case 'error':
        return <AlertCircle className="h-6 w-6 text-red-500" />;
      case 'meeting':
        return <Activity className="h-6 w-6 text-purple-500" />;
      case 'document':
        return <FileText className="h-6 w-6 text-orange-500" />;
      default:
        return <Bell className="h-6 w-6 text-gray-500" />;
    }
  };
  
  const getBgColor = (type) => {
    switch (type) {
      case 'info':
        return 'bg-blue-50';
      case 'success':
        return 'bg-green-50';
      case 'warning':
        return 'bg-yellow-50';
      case 'error':
        return 'bg-red-50';
      case 'meeting':
        return 'bg-purple-50';
      case 'document':
        return 'bg-orange-50';
      default:
        return 'bg-gray-50';
    }
  };
  
  return (
    <div className={`p-4 rounded-lg border mb-4 ${notification.read ? 'border-gray-200 bg-white' : `border-l-4 ${getBgColor(notification.type)}`}`}>
      <div className="flex items-start">
        <div className={`flex-shrink-0 p-2 rounded-lg ${getBgColor(notification.type)}`}>
          {getTypeIcon(notification.type)}
        </div>
        
        <div className="ml-4 flex-1">
          <div className="flex justify-between">
            <h3 className={`text-lg font-medium ${notification.read ? 'text-gray-700' : 'text-gray-900'}`}>
              {notification.title}
            </h3>
            
            {isAdmin && (
              <div className="flex space-x-2">
                <button
                  onClick={() => onDelete(notification._id)}
                  className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                  title="Șterge notificarea"
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              </div>
            )}
          </div>
          
          <p className={`mt-1 ${notification.read ? 'text-gray-500' : 'text-gray-700'}`}>
            {notification.message}
          </p>
          
          <div className="mt-2 flex items-center text-sm text-gray-500">
            <Calendar className="h-4 w-4 mr-1" />
            <span>{getRelativeTime(notification.createdAt)}</span>
            
            {notification.sender && (
              <>
                <span className="mx-2">•</span>
                <User className="h-4 w-4 mr-1" />
                <span>De la: {notification.sender.name}</span>
              </>
            )}
            
            {notification.priority && notification.priority !== 'Medium' && (
              <span className={`ml-2 px-2 py-0.5 text-xs rounded-full ${
                notification.priority === 'High' 
                  ? 'bg-red-100 text-red-800' 
                  : 'bg-blue-100 text-blue-800'
              }`}>
                {notification.priority === 'High' ? 'Prioritate înaltă' : 'Prioritate redusă'}
              </span>
            )}
          </div>
          
          {notification.actionLink && (
            <div className="mt-2">
              <a 
                href={notification.actionLink} 
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 inline-flex items-center"
              >
                <Eye className="h-4 w-4 mr-1" />
                <span>Vezi detalii</span>
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Componenta principală pentru lista de notificări
const NotificationList = ({ notifications, onDelete, isAdmin = false }) => {
  return (
    <div className="space-y-2">
      {notifications.map((notification) => (
        <NotificationItem 
          key={notification._id} 
          notification={notification} 
          onDelete={onDelete}
          isAdmin={isAdmin}
        />
      ))}
    </div>
  );
};

export default NotificationList;