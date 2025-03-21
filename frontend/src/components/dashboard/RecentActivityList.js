import React from 'react';
import {
  PersonAdd as PersonAddIcon,
  Update as UpdateIcon,
  Description as DescriptionIcon,
  CheckCircle as CheckCircleIcon,
  StickyNote2 as NoteIcon
} from '@mui/icons-material';
import { format, formatDistanceToNow } from 'date-fns';
import { ro } from 'date-fns/locale';

const RecentActivityList = ({ activities }) => {
  // Get icon for activity type
  const getActivityIcon = (type) => {
    switch (type) {
      case 'client_added':
        return <PersonAddIcon className="h-5 w-5" />;
      case 'status_update':
        return <UpdateIcon className="h-5 w-5" />;
      case 'document_uploaded':
        return <DescriptionIcon className="h-5 w-5" />;
      case 'client_completed':
        return <CheckCircleIcon className="h-5 w-5" />;
      case 'note_added':
        return <NoteIcon className="h-5 w-5" />;
      default:
        return <UpdateIcon className="h-5 w-5" />;
    }
  };

  // Get color classes for activity type
  const getActivityColorClasses = (type) => {
    switch (type) {
      case 'client_added':
        return {
          bg: 'bg-blue-100',
          text: 'text-blue-600'
        };
      case 'status_update':
        return {
          bg: 'bg-indigo-100',
          text: 'text-indigo-600'
        };
      case 'document_uploaded':
        return {
          bg: 'bg-purple-100',
          text: 'text-purple-600'
        };
      case 'client_completed':
        return {
          bg: 'bg-green-100',
          text: 'text-green-600'
        };
      case 'note_added':
        return {
          bg: 'bg-amber-100',
          text: 'text-amber-600'
        };
      default:
        return {
          bg: 'bg-gray-100',
          text: 'text-gray-600'
        };
    }
  };

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const activityDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    
    // Today
    if (activityDate.getTime() === today.getTime()) {
      return `Astăzi, ${format(date, 'HH:mm')}`;
    }
    
    // Yesterday
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    if (activityDate.getTime() === yesterday.getTime()) {
      return `Ieri, ${format(date, 'HH:mm')}`;
    }
    
    // Within the last 7 days
    if ((today - activityDate) / (1000 * 60 * 60 * 24) < 7) {
      return formatDistanceToNow(date, { addSuffix: true, locale: ro });
    }
    
    // More than 7 days ago
    return format(date, 'd MMMM yyyy, HH:mm', { locale: ro });
  };

  return (
    <div className="w-full max-h-96 overflow-auto">
      {activities && activities.length > 0 ? (
        <ul className="divide-y divide-gray-200">
          {activities.map((activity) => {
            const { bg, text } = getActivityColorClasses(activity.type);
            return (
              <li key={activity.id} className="py-4">
                <div className="flex items-start space-x-3">
                  <div className={`${bg} ${text} w-10 h-10 rounded-full flex items-center justify-center shrink-0`}>
                    {getActivityIcon(activity.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800">
                      {activity.title}
                    </p>
                    <p className="text-sm text-gray-600 mt-1 mb-1">
                      {activity.description}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatDate(activity.timestamp)}
                    </p>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      ) : (
        <div className="py-4 px-2">
          <p className="text-sm font-medium text-gray-700">Nu există activități recente</p>
          <p className="text-sm text-gray-500 mt-1">
            Activitățile vor apărea aici pe măsură ce interacționezi cu clienții
          </p>
        </div>
      )}
    </div>
  );
};

export default RecentActivityList;