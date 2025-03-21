import React from 'react';
import { Clock, ArrowRight, MapPin } from 'lucide-react';

// Funcție pentru formatarea datei evenimentului
const formatDateToRo = (date) => {
  try {
    const monthNames = ["Ian", "Feb", "Mar", "Apr", "Mai", "Iun", "Iul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    return `${date.getDate()} ${monthNames[date.getMonth()]}`;
  } catch (e) {
    console.error('Eroare la formatarea datei:', e);
    return '--';
  }
};

const ClientEventCard = ({ event }) => {
  // Formatarea datei
  if (!event) {
    return (
      <div className="bg-white/70 backdrop-blur-md rounded-3xl p-5 mb-8 shadow-lg border border-white/50 flex flex-col md:flex-row overflow-hidden">
        <div className="flex-1 text-center py-8">
          <p className="text-gray-500">Nu există evenimente programate</p>
        </div>
      </div>
    );
  }
  
  // Asigurăm că avem date valide
  const title = event.title || 'Eveniment';
  const location = event.location || 'Online - Zoom';
  const startTime = event.startTime || '10:00';
  const endTime = event.endTime || '13:00';
  
  // Asigurăm că data este un obiect Date valid
  let eventDate;
  try {
    eventDate = event.date instanceof Date ? event.date : new Date(event.date);
    // Verificăm dacă data rezultată este validă
    if (isNaN(eventDate.getTime())) {
      eventDate = new Date(); // Data curentă ca fallback
    }
  } catch (e) {
    console.error('Eroare la parsarea datei evenimentului', e, event);
    eventDate = new Date();
  }
  
  // Formatarea datei
  const formattedDay = formatDateToRo(eventDate);
  
  return (
    <div className="bg-white/70 backdrop-blur-md rounded-3xl p-5 mb-8 shadow-lg border border-white/50 flex flex-col md:flex-row overflow-hidden">
      <div className="flex-1 pr-4 mb-4 md:mb-0">
        <div className="text-gray-400 text-sm font-medium mb-1">Următorul eveniment</div>
        <div className="text-3xl font-bold bg-gradient-to-r from-gray-700 to-gray-900 bg-clip-text text-transparent mb-1">
          {formattedDay}
        </div>
        <div className="flex items-center text-sm text-gray-500 mb-4">
          <Clock className="h-4 w-4 mr-1" />
          <span>{startTime} - {endTime}</span>
        </div>
        <div className="text-gray-400 text-sm font-medium">Locație</div>
        <div className="text-gray-700 flex items-center">
          <MapPin className="h-4 w-4 mr-1 text-gray-400" />
          <span>{location}</span>
        </div>
      </div>
      <div className="flex-1 md:pl-4 md:border-l border-gray-100 flex flex-col justify-between">
        <div>
          <div className="text-gray-400 text-sm font-medium mb-1">Curs</div>
          <div className="text-gray-800 font-semibold">{title}</div>
        </div>
        <button className="bg-gradient-to-r from-orange-400 to-pink-500 text-white px-4 py-2 rounded-full mt-4 shadow-md hover:shadow-lg transition-all duration-300 text-sm font-medium flex items-center justify-center">
          <span>Detalii</span>
          <ArrowRight className="h-4 w-4 ml-1" />
        </button>
      </div>
    </div>
  );
};

export default ClientEventCard;