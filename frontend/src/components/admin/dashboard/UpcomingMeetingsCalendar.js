import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  ChevronLeft, 
  ChevronRight, 
  Clock, 
  MapPin, 
  Users, 
  CalendarDays, 
  ArrowRight
} from 'lucide-react';

const UpcomingMeetingsCalendar = ({ meetings = [] }) => {
  // Ne asigurăm că meetings e un array și că fiecare întâlnire are date necesare
  const validMeetings = Array.isArray(meetings) 
    ? meetings.filter(meeting => meeting && meeting.date)
    : [];
  const [currentDate, setCurrentDate] = useState(new Date());
  const [currentView, setCurrentView] = useState('month'); // 'month' or 'list'
  
  // Funcții pentru navigarea între luni
  const goToPreviousMonth = () => {
    setCurrentDate(prevDate => {
      const newDate = new Date(prevDate);
      newDate.setMonth(newDate.getMonth() - 1);
      return newDate;
    });
  };
  
  const goToNextMonth = () => {
    setCurrentDate(prevDate => {
      const newDate = new Date(prevDate);
      newDate.setMonth(newDate.getMonth() + 1);
      return newDate;
    });
  };
  
  const goToToday = () => {
    setCurrentDate(new Date());
  };
  
  // Funcții pentru generarea calendarului
  const getDaysInMonth = (year, month) => {
    return new Date(year, month + 1, 0).getDate();
  };
  
  const getFirstDayOfMonth = (year, month) => {
    return new Date(year, month, 1).getDay();
  };
  
  const formatMonthYear = (date) => {
    return date.toLocaleDateString('ro-RO', { month: 'long', year: 'numeric' });
  };
  
  // Verifică dacă o dată are întâlniri programate
  const getMeetingsForDate = (date) => {
    return validMeetings.filter(meeting => {
      const meetingDate = new Date(meeting.date);
      return (
        meetingDate.getDate() === date.getDate() &&
        meetingDate.getMonth() === date.getMonth() &&
        meetingDate.getFullYear() === date.getFullYear()
      );
    });
  };
  
  // Generează grid-ul calendarului
  const generateCalendarGrid = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const daysInMonth = getDaysInMonth(year, month);
    const firstDayOfMonth = getFirstDayOfMonth(year, month);
    const grid = [];
    
    // Adăugăm zilele pentru luna anterioară pentru a umple prima săptămână
    const prevMonth = month === 0 ? 11 : month - 1;
    const prevMonthYear = month === 0 ? year - 1 : year;
    const daysInPrevMonth = getDaysInMonth(prevMonthYear, prevMonth);
    
    // Adăugăm zilele pentru luna curentă
    let dayCount = 1;
    
    // Generăm grid-ul pentru 6 săptămâni (42 de zile)
    for (let row = 0; row < 6; row++) {
      const week = [];
      
      for (let col = 0; col < 7; col++) {
        const dayNumber = row * 7 + col;
        
        if (row === 0 && col < firstDayOfMonth) {
          // Zilele din luna anterioară
          const day = daysInPrevMonth - firstDayOfMonth + col + 1;
          const date = new Date(prevMonthYear, prevMonth, day);
          week.push({
            date,
            day,
            isCurrentMonth: false,
            isToday: false,
            meetings: getMeetingsForDate(date)
          });
        } else if (dayCount > daysInMonth) {
          // Zilele din luna următoare
          const day = dayCount - daysInMonth;
          const nextMonth = month === 11 ? 0 : month + 1;
          const nextMonthYear = month === 11 ? year + 1 : year;
          const date = new Date(nextMonthYear, nextMonth, day);
          week.push({
            date,
            day,
            isCurrentMonth: false,
            isToday: false,
            meetings: getMeetingsForDate(date)
          });
          dayCount++;
        } else {
          // Zilele din luna curentă
          const date = new Date(year, month, dayCount);
          const today = new Date();
          const isToday = 
            today.getDate() === dayCount && 
            today.getMonth() === month && 
            today.getFullYear() === year;
          
          week.push({
            date,
            day: dayCount,
            isCurrentMonth: true,
            isToday,
            meetings: getMeetingsForDate(date)
          });
          dayCount++;
        }
      }
      
      grid.push(week);
      
      // Dacă am terminat de afișat toate zilele din luna curentă
      // și suntem la începutul unei noi săptămâni, nu mai continuăm
      if (dayCount > daysInMonth && row < 5 && dayCount % 7 === 1) {
        break;
      }
    }
    
    return grid;
  };
  
  // Formatăm ora pentru afișare cu tratarea erorilor
  const formatTime = (dateString) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return 'Ora necunoscută';
      }
      return date.toLocaleTimeString('ro-RO', { hour: '2-digit', minute: '2-digit' });
    } catch (e) {
      console.warn('Eroare la formatarea orei:', e);
      return 'Ora necunoscută';
    }
  };
  
  // Filtrăm întâlnirile pentru a afișa doar pe cele viitoare pentru vizualizarea de tip listă
  // Sortăm întâlnirile după dată și filtrăm doar întâlnirile viitoare
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const upcomingMeetings = [...validMeetings]
    .filter(meeting => new Date(meeting.date) >= today)
    .sort((a, b) => new Date(a.date) - new Date(b.date));
  
  // Zilele săptămânii pentru header
  const weekdays = ['Dum', 'Lun', 'Mar', 'Mie', 'Joi', 'Vin', 'Sâm'];
  
  return (
    <div>
      {/* Controls */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center space-x-2">
          <button
            onClick={goToPreviousMonth}
            className="p-1 rounded-full hover:bg-gray-100"
          >
            <ChevronLeft className="h-5 w-5 text-gray-600" />
          </button>
          <button
            onClick={goToToday}
            className="px-3 py-1 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md"
          >
            Astăzi
          </button>
          <button
            onClick={goToNextMonth}
            className="p-1 rounded-full hover:bg-gray-100"
          >
            <ChevronRight className="h-5 w-5 text-gray-600" />
          </button>
        </div>
        
        <h3 className="text-lg font-medium text-gray-800">
          {formatMonthYear(currentDate)}
        </h3>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setCurrentView('month')}
            className={`px-3 py-1 text-sm font-medium rounded-md ${
              currentView === 'month' 
                ? 'bg-blue-100 text-blue-700' 
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            Lună
          </button>
          <button
            onClick={() => setCurrentView('list')}
            className={`px-3 py-1 text-sm font-medium rounded-md ${
              currentView === 'list' 
                ? 'bg-blue-100 text-blue-700' 
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            Listă
          </button>
        </div>
      </div>
      
      {/* Calendar View */}
      {currentView === 'month' ? (
        <div className="overflow-hidden rounded-lg border border-gray-200">
          {/* Calendar header */}
          <div className="grid grid-cols-7 bg-gray-50 border-b">
            {weekdays.map((day, index) => (
              <div key={index} className="py-2 text-center text-xs font-medium text-gray-700">
                {day}
              </div>
            ))}
          </div>
          
          {/* Calendar body */}
          <div className="bg-white">
            {generateCalendarGrid().map((week, weekIndex) => (
              <div key={weekIndex} className="grid grid-cols-7 border-b last:border-b-0">
                {week.map((day, dayIndex) => (
                  <div 
                    key={dayIndex} 
                    className={`min-h-28 p-1 border-r last:border-r-0 relative ${
                      !day.isCurrentMonth ? 'bg-gray-50' : ''
                    } ${day.isToday ? 'bg-blue-50' : ''}`}
                  >
                    <div className="flex justify-end">
                      <span className={`inline-flex items-center justify-center h-6 w-6 text-xs ${
                        day.isToday 
                          ? 'text-white bg-blue-600 rounded-full font-medium' 
                          : day.isCurrentMonth 
                            ? 'text-gray-700' 
                            : 'text-gray-400'
                      }`}>
                        {day.day}
                      </span>
                    </div>
                    
                    {/* Meeting indicators */}
                    <div className="mt-1 space-y-1 max-h-20 overflow-y-auto">
                      {day.meetings.map((meeting, index) => (
                        <Link
                          key={index}
                          to={`/admin/groups/${meeting.groupId || (meeting.group && meeting.group._id ? meeting.group._id : 0)}`}
                          className="block px-1.5 py-0.5 text-xs font-medium bg-blue-100 text-blue-800 rounded truncate hover:bg-blue-200"
                        >
                          {formatTime(meeting.date)} - {typeof meeting.groupName === 'string' ? meeting.groupName : (typeof meeting.title === 'string' ? meeting.title : 'Întâlnire')}
                        </Link>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* List View */
        <div className="border border-gray-200 rounded-lg divide-y">
          {upcomingMeetings.length > 0 ? (
            upcomingMeetings.map((meeting, index) => (
              <div key={index} className="p-4 hover:bg-gray-50">
                <Link to={`/admin/groups/${meeting.groupId || (meeting.group && meeting.group._id ? meeting.group._id : 0)}`} className="block">
                  <p className="text-sm font-medium text-gray-900">{typeof meeting.topic === 'string' ? meeting.topic : (typeof meeting.title === 'string' ? meeting.title : 'Întâlnire')}</p>
                  <div className="mt-1 flex items-center text-xs text-gray-500">
                    <CalendarDays className="h-3 w-3 mr-1" />
                    <span>
                      {(() => {
                        try {
                          return new Date(meeting.date).toLocaleDateString('ro-RO');
                        } catch (e) {
                          return 'Data necunoscută';
                        }
                      })()}
                    </span>
                    <span className="mx-1">•</span>
                    <Clock className="h-3 w-3 mr-1" />
                    <span>{formatTime(meeting.date)}</span>
                    
                    {meeting.location && (
                      <>
                        <span className="mx-1">•</span>
                        <MapPin className="h-3 w-3 mr-1" />
                        <span>{meeting.location}</span>
                      </>
                    )}
                  </div>
                  <div className="mt-2 flex items-center justify-between">
                    <span className="inline-flex items-center text-xs text-gray-600">
                      <Users className="h-3 w-3 mr-1" />
                      {typeof meeting.groupName === 'string' ? meeting.groupName : (typeof meeting.group === 'string' ? meeting.group : (meeting.group && meeting.group.name ? meeting.group.name : 'Grupă necunoscută'))}
                    </span>
                    <ArrowRight className="h-4 w-4 text-blue-500" />
                  </div>
                </Link>
              </div>
            ))
          ) : (
            <div className="p-6 text-center text-gray-500">
              <p>Nu există întâlniri programate în perioada selectată.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default UpcomingMeetingsCalendar;