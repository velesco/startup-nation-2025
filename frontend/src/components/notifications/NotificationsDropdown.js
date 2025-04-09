import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import {
  Bell,
  Check,
  Info,
  AlertTriangle,
  AlertCircle,
  Activity,
  FileText,
  X,
  CheckCircle
} from 'lucide-react';

// Funcție pentru formatarea datei relative
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
  const options = { day: '2-digit', month: '2-digit', year: 'numeric' };
  return date.toLocaleDateString('ro-RO', options);
};

const NotificationsDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  // Închide dropdown-ul când se face clic în afara lui
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Încarcă notificările și numărul de notificări necitite
  const fetchNotifications = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5003/api';
      
      const [notificationsResponse, countResponse] = await Promise.all([
        axios.get(`${API_URL}/notifications?limit=5`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }),
        axios.get(`${API_URL}/notifications/count`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        })
      ]);
      
      if (notificationsResponse.data && notificationsResponse.data.success) {
        setNotifications(notificationsResponse.data.data);
      }
      
      if (countResponse.data && countResponse.data.success) {
        setUnreadCount(countResponse.data.unreadCount);
      }
    } catch (err) {
      console.error('Error fetching notifications:', err);
      setError('Nu s-au putut încărca notificările');
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch notifications initially and periodically
  useEffect(() => {
    fetchNotifications();
    
    // Update notifications every minute
    const interval = setInterval(() => {
      fetchNotifications();
    }, 60000);
    
    return () => clearInterval(interval);
  }, []);

  // Funcție pentru marcarea unei notificări ca citită
  const markAsRead = async (notificationId) => {
    try {
      const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5003/api';
      
      await axios.put(`${API_URL}/notifications/${notificationId}/read`, {}, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      // Actualizează starea în UI
      setNotifications(prevNotifications => 
        prevNotifications.map(notification => 
          notification._id === notificationId
            ? { ...notification, read: true }
            : notification
        )
      );
      
      setUnreadCount(count => Math.max(0, count - 1));
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  };

  // Funcție pentru marcarea tuturor notificărilor ca citite
  const markAllAsRead = async () => {
    try {
      const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5003/api';
      
      await axios.put(`${API_URL}/notifications/read-all`, {}, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      // Actualizează starea în UI
      setNotifications(prevNotifications => 
        prevNotifications.map(notification => ({ ...notification, read: true }))
      );
      
      setUnreadCount(0);
    } catch (err) {
      console.error('Error marking all notifications as read:', err);
    }
  };

  // Funcție pentru obținerea iconiței în funcție de tipul notificării
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
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => {
          setIsOpen(!isOpen);
          // Reîmprospătează notificările când se deschide dropdown-ul
          if (!isOpen) {
            fetchNotifications();
          }
        }}
        className="p-2 rounded-full hover:bg-gray-100 relative"
        aria-label="Notificări"
      >
        <Bell className="h-6 w-6 text-gray-600" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs text-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-lg shadow-lg border border-gray-200 z-50 max-h-[80vh] flex flex-col">
          <div className="p-3 border-b border-gray-200 flex justify-between items-center bg-gray-50 rounded-t-lg">
            <h3 className="font-medium text-gray-800 flex items-center">
              <Bell className="h-5 w-5 text-blue-500 mr-2" />
              Notificări
              {unreadCount > 0 && (
                <span className="ml-2 bg-red-100 text-red-800 text-xs font-semibold px-2 py-0.5 rounded-full">
                  {unreadCount} necitite
                </span>
              )}
            </h3>
            
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-sm text-blue-600 hover:text-blue-800 flex items-center"
              >
                <CheckCircle className="h-4 w-4 mr-1" />
                Marchează toate ca citite
              </button>
            )}
          </div>
          
          <div className="overflow-y-auto flex-1">
            {isLoading && notifications.length === 0 ? (
              <div className="p-4 text-center">
                <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
                <p className="text-gray-500 mt-2">Se încarcă notificările...</p>
              </div>
            ) : error ? (
              <div className="p-4 text-center">
                <AlertCircle className="h-6 w-6 text-red-500 mx-auto" />
                <p className="text-red-500 mt-2">{error}</p>
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-8 text-center">
                <Bell className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">Nu ai nicio notificare</p>
              </div>
            ) : (
              <div>
                {notifications.map((notification) => (
                  <div 
                    key={notification._id}
                    className={`border-b border-gray-100 hover:bg-gray-50 transition-colors p-3 ${notification.read ? 'bg-white' : 'bg-blue-50'}`}
                  >
                    <div className="flex">
                      <div className="flex-shrink-0 mt-1">
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className="ml-3 flex-1">
                        <div className="flex justify-between items-start">
                          <p className={`text-sm font-medium ${notification.read ? 'text-gray-700' : 'text-gray-900'}`}>
                            {notification.title}
                          </p>
                          {!notification.read && (
                            <button
                              onClick={() => markAsRead(notification._id)}
                              className="ml-2 text-blue-500 hover:text-blue-700"
                              title="Marchează ca citit"
                            >
                              <Check className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                        <p className={`text-sm ${notification.read ? 'text-gray-500' : 'text-gray-700'}`}>
                          {notification.message}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {getRelativeTime(notification.createdAt)}
                        </p>
                        
                        {notification.actionLink && (
                          <a 
                            href={notification.actionLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-blue-600 hover:text-blue-800 mt-1 inline-block"
                          >
                            Vezi detalii
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <div className="p-2 border-t border-gray-200 bg-gray-50 rounded-b-lg text-center">
            <button
              onClick={() => {
                setIsOpen(false);
                navigate('/notifications');
              }}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              Vezi toate notificările
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationsDropdown;