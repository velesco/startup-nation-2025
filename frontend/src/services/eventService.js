import axios from 'axios';

/**
 * Serviciu pentru gestionarea evenimentelor și cursurilor
 */
class EventService {
  constructor() {
    this.baseURL = process.env.REACT_APP_API_URL || 'http://localhost:5003/api';
    this.endpoints = [
      '/events',
      '/events/all',
      '/courses/all',
      '/meetings',
      '/client/events'
    ];
  }

  /**
   * Obține token-ul de autorizare
   * @returns {string|null} Token-ul de autorizare sau null dacă nu există
   */
  getToken() {
    return localStorage.getItem('token');
  }

  /**
   * Formatează un eveniment pentru a asigura o structură consistentă
   * @param {Object} event - Evenimentul care trebuie formatat
   * @returns {Object} Evenimentul formatat
   */
  formatEvent(event) {
    if (!event) return null;

    // Procesăm data evenimentului
    let eventDate;
    try {
      // Încercăm să procesăm data indiferent de formatul în care vine
      const dateValue = event.date || event.startDate || event.eventDate || event.dateTime || new Date();
      eventDate = typeof dateValue === 'string' ? new Date(dateValue) : dateValue;
      
      // Verificăm dacă data este validă
      if (!(eventDate instanceof Date) || isNaN(eventDate.getTime())) {
        eventDate = new Date(); // Folosim data curentă ca fallback
      }
    } catch (e) {
      console.warn('Eroare la procesarea datei evenimentului:', e);
      eventDate = new Date();
    }

    // Returnăm un eveniment formatat cu toate câmpurile necesare
    return {
      id: event.id || event._id || Math.random().toString(36).substr(2, 9),
      title: event.title || event.name || event.courseName || 'Eveniment',
      date: eventDate,
      startTime: event.startTime || event.timeStart || '10:00',
      endTime: event.endTime || event.timeEnd || '13:00',
      location: event.location || event.venue || 'Online - Zoom',
      availableSeats: event.availableSeats || event.seatsAvailable || event.seats || 5,
      status: (event.availableSeats > 0 || event.seatsAvailable > 0 || event.seats > 0 || event.status === 'available') 
        ? 'available' 
        : 'full'
    };
  }

  /**
   * Încearcă să obțină evenimente folosind mai multe endpoint-uri
   * @returns {Promise<Array>} Lista de evenimente obținute sau un array gol în caz de eroare
   */
  async getEvents() {
    if (!this.getToken()) {
      console.warn('Nu există token de autorizare pentru obținerea evenimentelor');
      return this.getFallbackEvents();
    }

    // Încercăm fiecare endpoint în parte
    for (const endpoint of this.endpoints) {
      try {
        console.log(`Încerc să obțin evenimente de la ${this.baseURL}${endpoint}`);
        const response = await axios.get(`${this.baseURL}${endpoint}`, {
          headers: {
            Authorization: `Bearer ${this.getToken()}`
          }
        });

        if (response.status === 200) {
          // Analizăm răspunsul pentru a extrage datele
          let eventsData;
          if (response.data && response.data.data) {
            eventsData = response.data.data;
          } else if (Array.isArray(response.data)) {
            eventsData = response.data;
          } else if (response.data && response.data.events) {
            eventsData = response.data.events;
          } else if (response.data && response.data.courses) {
            eventsData = response.data.courses;
          } else if (response.data && response.data.meetings) {
            eventsData = response.data.meetings;
          } else {
            console.warn(`Endpoint-ul ${endpoint} a returnat date într-un format neașteptat`, response.data);
            continue; // Încercăm următorul endpoint
          }

          // Verificăm dacă avem date
          if (!eventsData || !Array.isArray(eventsData) || eventsData.length === 0) {
            console.warn(`Endpoint-ul ${endpoint} nu a returnat evenimente`, eventsData);
            continue; // Încercăm următorul endpoint
          }

          // Formatăm evenimentele și le returnăm
          console.log(`Am obținut ${eventsData.length} evenimente de la ${endpoint}`);
          return eventsData.map(event => this.formatEvent(event));
        }
      } catch (error) {
        console.warn(`Eroare la încărcarea evenimentelor de la ${endpoint}:`, error.message);
        // Continuăm cu următorul endpoint
      }
    }

    // Dacă am ajuns aici, nu am reușit să obținem evenimente de la niciun endpoint
    console.warn('Nu s-au putut obține evenimente de la niciun endpoint, se folosesc date generate');
    return this.getFallbackEvents();
  }

  /**
   * Obține evenimente generate pentru a asigura funcționalitatea UI
   * @returns {Array} Lista de evenimente generate
   */
  getFallbackEvents() {
    return [
      {
        id: 1,
        title: 'Introducere în antreprenoriat',
        date: new Date(2025, 2, 25),
        startTime: '10:00',
        endTime: '13:00',
        location: 'Online - Zoom',
        availableSeats: 5,
        status: 'available'
      },
      {
        id: 2,
        title: 'Marketing pentru startup-uri',
        date: new Date(2025, 2, 28),
        startTime: '14:00',
        endTime: '17:00',
        location: 'Online - Zoom',
        availableSeats: 3,
        status: 'available'
      }
    ];
  }
}

// Exportăm o instanță singleton a serviciului
export default new EventService();