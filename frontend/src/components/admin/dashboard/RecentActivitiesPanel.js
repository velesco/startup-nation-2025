import React from 'react';
import { 
  Calendar, 
  UserPlus, 
  FileText, 
  Edit, 
  Trash2, 
  Clock, 
  Users, 
  User, 
  Mail,
  MessageSquare,
  Upload
} from 'lucide-react';

const RecentActivitiesPanel = ({ activities = [] }) => {
  // Ne asigurăm că activities este un array valid
  const validActivities = Array.isArray(activities) ? activities : [];
  
  if (validActivities.length === 0) {
    return (
      <div className="py-6 text-center text-gray-500">
        <Clock className="h-8 w-8 text-gray-300 mx-auto mb-2" />
        <p>Nu există activități recente de afișat.</p>
      </div>
    );
  }
  
  // Funcție pentru afișarea icon-ului corespunzător tipului de activitate
  const getActivityIcon = (type) => {
    switch (type) {
      case 'meeting_create':
        return <Calendar className="h-5 w-5 text-blue-500" />;
      case 'meeting_update':
        return <Edit className="h-5 w-5 text-orange-500" />;
      case 'meeting_delete':
        return <Trash2 className="h-5 w-5 text-red-500" />;
      case 'participant_add':
        return <UserPlus className="h-5 w-5 text-green-500" />;
      case 'participant_remove':
        return <User className="h-5 w-5 text-red-500" />;
      case 'group_create':
        return <Users className="h-5 w-5 text-purple-500" />;
      case 'group_update':
        return <Edit className="h-5 w-5 text-purple-500" />;
      case 'email_send':
        return <Mail className="h-5 w-5 text-blue-500" />;
      case 'document_upload':
        return <Upload className="h-5 w-5 text-green-500" />;
      case 'comment_add':
        return <MessageSquare className="h-5 w-5 text-blue-500" />;
      default:
        return <FileText className="h-5 w-5 text-gray-500" />;
    }
  };
  
  // Formatăm data pentru a afișa cât timp a trecut
  const getTimeAgo = (dateString) => {
    try {
      const date = new Date(dateString);
      
      // Verificăm dacă data este validă
      if (isNaN(date.getTime())) {
        console.warn('Data invalidă pentru activitate:', dateString);
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
    <div className="space-y-4 max-h-80 overflow-y-auto">
      {validActivities.map((activity, index) => (
        <div key={index} className="flex items-start space-x-3">
          <div className="flex-shrink-0 mt-0.5">
            {getActivityIcon(activity?.type)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900">
              {typeof activity?.actor === 'string' ? activity?.actor : (activity?.actor && typeof activity?.actor === 'object' && activity?.actor.name ? activity?.actor.name : 'Utilizator necunoscut')} <span className="font-normal">{activity?.action || 'a efectuat o acțiune'}</span>
            </p>
            {activity?.details && (
              <p className="text-xs text-gray-500 mt-0.5">{activity.details}</p>
            )}
            <p className="text-xs text-gray-400 mt-1">{getTimeAgo(activity?.timestamp)}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default RecentActivitiesPanel;