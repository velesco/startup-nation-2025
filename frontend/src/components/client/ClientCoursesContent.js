import React from 'react';
import { Calendar, Clock, Bell } from 'lucide-react';

// Funcție pentru formatarea datelor
const formatDate = (dateInput) => {
  let date;
  try {
    // Asigurăm că avem un obiect Date valid
    date = dateInput instanceof Date ? dateInput : new Date(dateInput);
    if (isNaN(date.getTime())) {
      date = new Date(); // Folosim data curentă ca fallback
    }
  } catch (e) {
    console.warn('Eroare la parsarea datei:', e, dateInput);
    date = new Date();
  }
  
  // Array cu lunile în română
  const monthNames = ['Ian', 'Feb', 'Mar', 'Apr', 'Mai', 'Iun', 'Iul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  
  // Returnam data formatată: "ZZ Luna AAAA"
  return `${date.getDate()} ${monthNames[date.getMonth()]} ${date.getFullYear()}`;
};

const ClientCoursesContent = ({ events }) => {
  return (
    <div className="bg-white/70 backdrop-blur-md rounded-3xl p-6 mb-8 shadow-lg border border-white/50">
      <h2 className="text-xl font-bold mb-6 bg-gradient-to-r from-gray-700 to-gray-900 bg-clip-text text-transparent">Cursurile mele</h2>
      
      {events && events.length > 0 ? (
        <div className="space-y-4">
          {events.map(event => {
            // Verificăm dacă avem toate datele necesare pentru afișare
            if (!event || !event.title) return null;
            
            // Analizăm data evenimentului pentru a o formata corect
            let eventDate;
            try {
              eventDate = typeof event.date === 'string' ? new Date(event.date) : event.date;
              if (!(eventDate instanceof Date) || isNaN(eventDate.getTime())) {
                eventDate = new Date(); // Folosim data curentă dacă data evenimentului nu este validă
              }
            } catch (e) {
              console.warn('Eroare la procesarea datei evenimentului:', e);
              eventDate = new Date();
            }
            
            return (
              <div 
                key={event.id || Math.random().toString(36).substr(2, 9)}
                className="bg-white/80 rounded-2xl p-4 shadow-md border border-gray-100 transition-all duration-300 hover:shadow-lg"
              >
                <div className="flex items-center">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center mr-4 shadow-md">
                    <Calendar className="h-6 w-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-800 mb-1">{event.title}</h3>
                    <div className="flex items-center text-sm text-gray-500">
                      <Clock className="h-4 w-4 mr-1" />
                      <span>
                        {formatDate(eventDate)}, {event.startTime || '10:00'} - {event.endTime || '13:00'}
                      </span>
                    </div>
                    <div className="flex items-center text-sm text-gray-500 mt-1">
                      <Bell className="h-4 w-4 mr-1" />
                      <span>{event.location || 'Online - Zoom'}</span>
                    </div>
                  </div>
                  <div className={`text-xs py-1 px-3 rounded-full shadow-sm ${event.status === 'available' ? 'bg-gradient-to-r from-green-400 to-teal-500 text-white' : 'bg-red-100 text-red-700'}`}>
                    {event.status === 'available' ? `Locuri: ${event.availableSeats || 0}` : 'Complet'}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="p-4 text-center text-gray-500">
          Nu ești înscris(ă) la niciun curs
        </div>
      )}
      
      <button className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 mt-6 rounded-2xl font-medium shadow-md hover:shadow-lg transition-all duration-300">
        Toate cursurile disponibile
      </button>
    </div>
  );
};

export default ClientCoursesContent;