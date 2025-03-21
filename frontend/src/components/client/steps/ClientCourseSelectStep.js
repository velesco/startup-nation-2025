import React, { useState, useEffect } from 'react';
import { Calendar, Clock, ChevronLeft, ChevronRight, Check, AlertCircle } from 'lucide-react';
import axios from 'axios';

const ClientCourseSelectStep = ({ onStepComplete, userDocuments }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [isCompleted, setIsCompleted] = useState(false);
  const [availableCourses, setAvailableCourses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Verificăm dacă cursul a fost deja selectat și încărcăm cursurile disponibile
  useEffect(() => {
    // Forțăm setarea statusului în cazul în care contextul s-a resetat
    // și avem cursul salvat în localStorage
    const savedCourseId = localStorage.getItem('selectedCourseId');
    
    // Verificăm dacă pasul a fost deja completat
    if (userDocuments && userDocuments.courseSelected) {
      console.log('Cursul a fost deja selectat conform userDocuments');
      setIsCompleted(true);
      
      // Încărcăm cursul salvat din localStorage dacă există
      if (savedCourseId) {
        console.log('Cursul salvat în localStorage:', savedCourseId);
        setSelectedCourse(parseInt(savedCourseId));
      } else {
        console.log('Nu există curs salvat în localStorage, se setează valoarea implicită 1');
        setSelectedCourse(1); // Valoare implicită dacă nu există un curs salvat
        localStorage.setItem('selectedCourseId', '1'); // Salvăm pentru persistență
      }
    } else if (savedCourseId) {
      // Dacă avem curs salvat dar nu avem statusul completat,
      // înseamnă că s-a resetat contextul dar utilizatorul a selectat anterior un curs
      console.log('Curs găsit în localStorage dar nu e marcat ca completat în userDocuments');
      setSelectedCourse(parseInt(savedCourseId));
    }
    
    // Încărcăm cursurile disponibile din API
    const fetchCourses = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5003/api';
        const token = localStorage.getItem('token');
        
        if (!token) {
          throw new Error('Nu există token de autentificare');
        }
        
        const response = await axios.get(`${API_URL}/events`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        // Verificăm formatul răspunsului
        if (response.data && (response.data.success || response.data.data || Array.isArray(response.data))) {
          // Extragem datele în funcție de structura răspunsului
          const coursesData = response.data.data || response.data;
          
          // Formatul de date așteptat pentru cursuri
          const formattedCourses = Array.isArray(coursesData) ? coursesData.map(course => ({
            id: course.id || course._id,
            title: course.title || course.name,
            date: new Date(course.date) || new Date(course.startDate),
            startTime: course.startTime || course.timeStart || '10:00',
            endTime: course.endTime || course.timeEnd || '13:00',
            location: course.location || 'Online - Zoom',
            availableSeats: course.availableSeats || course.seatsAvailable || 0,
            status: course.availableSeats > 0 ? 'available' : 'full'
          })) : [];
          
          setAvailableCourses(formattedCourses);
        } else {
          throw new Error('Format de date nevalid pentru cursuri');
        }
      } catch (error) {
        console.error('Eroare la încărcarea cursurilor:', error);
        setError(error.message);
        
        // În caz de eroare, folosim date statice pentru a asigura funcționalitatea UI
        setAvailableCourses([
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
        ]);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchCourses();
  }, [userDocuments]);
  
  // Calendar navigation
  const goToPreviousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  // Calendar helpers
  const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();

  // Render calendar
  const renderCalendar = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const daysInMonth = getDaysInMonth(year, month);
    const firstDayOfMonth = getFirstDayOfMonth(year, month);
    
    // Ajustare pentru a începe cu luni (0 = luni, 1 = marți, etc.)
    const adjustedFirstDay = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;
    
    const days = [];
    const monthNames = ["Ianuarie", "Februarie", "Martie", "Aprilie", "Mai", "Iunie", "Iulie", 
                         "August", "Septembrie", "Octombrie", "Noiembrie", "Decembrie"];

    // Zile goale pentru începutul lunii
    for (let i = 0; i < adjustedFirstDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-10"></div>);
    }

    // Zilele lunii
    for (let i = 1; i <= daysInMonth; i++) {
      const isEventDay = i === 25 || i === 28; // Pentru exemplu, zilele cu evenimente

      days.push(
        <div 
          key={`day-${i}`}
          className={`
            h-10 flex items-center justify-center rounded-full text-sm shadow-sm transition-all duration-300
            ${isEventDay ? 'bg-gradient-to-r from-orange-400 to-pink-500 text-white shadow-md' : 'bg-white hover:bg-gray-50 text-gray-700'}
            ${i < 20 ? 'opacity-40' : ''}
          `}
        >
          {i}
        </div>
      );
    }

    return (
      <>
        <div className="flex justify-between items-center mb-4">
          <div className="text-sm font-medium text-gray-500">
            {monthNames[month]} {year}
          </div>
          <div className="flex space-x-3">
            <button 
              onClick={goToPreviousMonth}
              className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 shadow-sm"
            >
              <ChevronLeft className="h-4 w-4 text-gray-600" />
            </button>
            <button 
              onClick={goToNextMonth}
              className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 shadow-sm"
            >
              <ChevronRight className="h-4 w-4 text-gray-600" />
            </button>
          </div>
        </div>
        <div className="grid grid-cols-7 gap-2 mb-2">
          {['L', 'M', 'M', 'J', 'V', 'S', 'D'].map((day, i) => (
            <div key={i} className="text-center text-xs font-medium text-gray-400 py-1">{day}</div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-2">
          {days}
        </div>
      </>
    );
  };

  // Înscriere la curs
  const handleCourseEnrollment = () => {
    if (!selectedCourse) {
      alert('Te rugăm să selectezi un curs disponibil.');
      return;
    }
    
    setIsCompleted(true);
    
    // Notificăm componenta părinte că acest pas a fost completat
    if (onStepComplete && typeof onStepComplete === 'function') {
      setTimeout(() => {
        onStepComplete('course_select');
      }, 1000);
    }
  };

  // Selectare curs
  const handleCourseSelect = (courseId) => {
    setSelectedCourse(courseId);
    // Reținem cursul selectat în localStorage pentru persistență
    localStorage.setItem('selectedCourseId', courseId);
  };
  
  // Reținem cursul selectat din localStorage la încărcarea componentei
  useEffect(() => {
    const savedCourseId = localStorage.getItem('selectedCourseId');
    if (savedCourseId && !selectedCourse) {
      setSelectedCourse(parseInt(savedCourseId));
    }
  }, [selectedCourse]);

  return (
    <div className="bg-white/70 backdrop-blur-md rounded-3xl p-6 mb-8 shadow-lg border border-white/50">
      <h2 className="text-xl font-bold mb-6 bg-gradient-to-r from-gray-700 to-gray-900 bg-clip-text text-transparent">Selectare Curs</h2>
      
      <div className="bg-white/80 rounded-2xl p-5 mb-6 shadow-md">
        {renderCalendar()}
      </div>
      
      <div className="mb-6 space-y-3">
        {isLoading ? (
          <div className="bg-white/80 rounded-2xl p-6 shadow-md flex items-center justify-center">
            <div className="animate-pulse text-gray-500">Se încărcă cursurile disponibile...</div>
          </div>
        ) : error ? (
          <div className="bg-red-50/80 rounded-2xl p-4 shadow-md border border-red-100">
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
              <div className="text-red-700">{error}</div>
            </div>
          </div>
        ) : availableCourses.length === 0 ? (
          <div className="bg-white/80 rounded-2xl p-6 shadow-md text-center">
            <div className="text-gray-500">Nu există cursuri disponibile în acest moment.</div>
          </div>
        ) : (
          // Afișăm lista de cursuri
          availableCourses.map(course => (
            <div 
              key={course.id}
              className={`bg-white/80 rounded-2xl p-4 shadow-md border transition-all duration-300 hover:shadow-lg cursor-pointer 
                ${selectedCourse === course.id ? 'border-blue-400' : 'border-gray-100'}
                ${course.status !== 'available' ? 'opacity-60' : ''}`}
              onClick={() => course.status === 'available' && handleCourseSelect(course.id)}
            >
              <div className="flex items-center">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mr-4 shadow-md 
                  ${course.status === 'available' ? 'bg-gradient-to-r from-blue-500 to-purple-600' : 'bg-gray-200'}`}
                >
                  <Calendar className={`h-6 w-6 ${course.status === 'available' ? 'text-white' : 'text-gray-500'}`} />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-800 mb-1">{course.title}</h3>
                  <div className="flex items-center text-sm text-gray-500">
                    <Clock className="h-4 w-4 mr-1" />
                    <span>
                      {course.date.getDate()} {['Ian', 'Feb', 'Mar', 'Apr', 'Mai', 'Iun', 'Iul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][course.date.getMonth()]} {course.date.getFullYear()}, 
                      {course.startTime} - {course.endTime}
                    </span>
                  </div>
                </div>
                {course.status === 'available' ? (
                  <div className="bg-gradient-to-r from-green-400 to-teal-500 text-white text-xs py-1 px-3 rounded-full shadow-sm">
                    Locuri: {course.availableSeats}
                  </div>
                ) : (
                  <div className="bg-red-100 text-red-700 text-xs py-1 px-3 rounded-full">
                    Complet
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
      
      <button 
        className={`w-full py-4 rounded-2xl font-medium shadow-md transition-all duration-300 flex items-center justify-center ${isCompleted ? 'bg-green-500 text-white' : 'bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:shadow-lg'}`}
        onClick={handleCourseEnrollment}
        disabled={isCompleted || !selectedCourse}
      >
        {isCompleted ? (
          <>
            <Check className="mr-2 h-5 w-5" /> Înscris la curs
          </>
        ) : (
          'Înscrie-te la curs'
        )}
      </button>
    </div>
  );
};

export default ClientCourseSelectStep;