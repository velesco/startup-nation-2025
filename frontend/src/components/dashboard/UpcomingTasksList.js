import React from 'react';
import {
  Assignment as AssignmentIcon,
  CheckCircleOutline as CheckIcon,
  Schedule as ScheduleIcon,
  Warning as WarningIcon
} from '@mui/icons-material';
import { format, isAfter, formatDistanceToNow, parseISO } from 'date-fns';
import { ro } from 'date-fns/locale';

const UpcomingTasksList = ({ tasks }) => {
  // Get priority classes
  const getPriorityClasses = (priority) => {
    switch (priority) {
      case 'high':
        return {
          bg: 'bg-red-100',
          text: 'text-red-700',
          label: 'Înaltă'
        };
      case 'medium':
        return {
          bg: 'bg-amber-100',
          text: 'text-amber-700',
          label: 'Medie'
        };
      case 'low':
        return {
          bg: 'bg-green-100',
          text: 'text-green-700',
          label: 'Scăzută'
        };
      default:
        return {
          bg: 'bg-gray-100',
          text: 'text-gray-700',
          label: 'Normal'
        };
    }
  };

  // Format due date
  const formatDueDate = (dateString) => {
    const date = parseISO(dateString);
    const now = new Date();
    
    // Check if past due
    if (isAfter(now, date)) {
      return {
        text: `Întârziat cu ${formatDistanceToNow(date, { locale: ro })}`,
        isPastDue: true
      };
    }
    
    // Due today
    if (format(date, 'yyyy-MM-dd') === format(now, 'yyyy-MM-dd')) {
      return {
        text: `Astăzi, ${format(date, 'HH:mm', { locale: ro })}`,
        isPastDue: false
      };
    }
    
    // Due tomorrow
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    if (format(date, 'yyyy-MM-dd') === format(tomorrow, 'yyyy-MM-dd')) {
      return {
        text: `Mâine, ${format(date, 'HH:mm', { locale: ro })}`,
        isPastDue: false
      };
    }
    
    // Due within 7 days
    const daysUntilDue = Math.floor((date - now) / (1000 * 60 * 60 * 24));
    if (daysUntilDue < 7) {
      return {
        text: formatDistanceToNow(date, { addSuffix: true, locale: ro }),
        isPastDue: false
      };
    }
    
    // Due more than 7 days from now
    return {
      text: format(date, 'd MMMM', { locale: ro }),
      isPastDue: false
    };
  };

  return (
    <div className="w-full h-full overflow-auto">
      {tasks && tasks.length > 0 ? (
        <ul className="divide-y divide-gray-200">
          {tasks.map((task) => {
            const { text: dueDateText, isPastDue } = formatDueDate(task.dueDate);
            const { bg, text, label } = getPriorityClasses(task.priority);
            
            return (
              <li key={task.id} className="py-4">
                <div className="flex space-x-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                    isPastDue ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'
                  }`}>
                    {isPastDue ? <WarningIcon className="h-5 w-5" /> : <AssignmentIcon className="h-5 w-5" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-1">
                      <p className="text-sm font-medium text-gray-800">{task.title}</p>
                      <span className={`px-2.5 py-0.5 text-xs font-medium rounded-full ${bg} ${text}`}>
                        {label}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-1">
                      {task.description}
                    </p>
                    <div className={`flex items-center text-xs ${isPastDue ? 'text-red-600' : 'text-gray-500'}`}>
                      <ScheduleIcon className="h-3 w-3 mr-1" />
                      <span>{dueDateText}</span>
                    </div>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      ) : (
        <div className="flex items-center space-x-3 py-4">
          <div className="w-10 h-10 rounded-full bg-green-100 text-green-600 flex items-center justify-center shrink-0">
            <CheckIcon className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-800">Nu există taskuri viitoare</p>
            <p className="text-sm text-gray-500">Toate taskurile tale sunt completate. Felicitări!</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default UpcomingTasksList;