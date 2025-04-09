import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import ReactDOM from 'react-dom';
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
  const navigate = useNavigate();

  // Închide dropdown-ul când se face clic în afara lui
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Verificăm dacă click-ul a fost în afara modalului
      if (isOpen) {
        const modal = document.getElementById('notifications-modal');
        if (modal && !modal.contains(event.target) && !event.target.closest('button[aria-label="Notificări"]')) {
          setIsOpen(false);
        }
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

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
    <>
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

      {isOpen && ReactDOM.createPortal(
        <div className="fixed inset-0 z-[9999] bg-black/30 flex items-start justify-center">
          <div className="w-full max-w-md z-[10000] mt-0 bg-white shadow-xl flex flex-col rounded-b-2xl overflow-hidden" style={{background: "white"}}>
            <div className="p-4 text-center text-gray-700 bg-white">
              <p>Nu ai notificări noi</p>
            </div>
            <button 
              className="w-full text-center p-4 bg-blue-100 cursor-pointer hover:bg-blue-200 transition-colors text-blue-700 border-t border-gray-200"
              onClick={() => setIsOpen(false)}
            >
              Închide
            </button>
          </div>
        </div>,
        document.body
      )}
    </>
  );
};

export default NotificationsDropdown;