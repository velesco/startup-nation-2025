import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

// Import Icons
import GroupIcon from '@mui/icons-material/Group';
import SchoolIcon from '@mui/icons-material/School';
import BookIcon from '@mui/icons-material/Book';
import AssignmentIcon from '@mui/icons-material/Assignment';
import ArrowRightIcon from '@mui/icons-material/ArrowRight';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import NotificationsIcon from '@mui/icons-material/Notifications';
import PersonIcon from '@mui/icons-material/Person';
import LogoutIcon from '@mui/icons-material/Logout';
import VideocamIcon from '@mui/icons-material/Videocam';
import VideoLibraryIcon from '@mui/icons-material/VideoLibrary';

const TrainerDashboardPage = () => {
  const navigate = useNavigate();
  const { currentUser, logout } = useAuth();
  const [loading, setLoading] = useState(true);
  const [currentTab, setCurrentTab] = useState('calendar');
  const [stats, setStats] = useState({
    totalGroups: 0,
    activeGroups: 0,
    totalStudents: 0,
    upcomingClasses: 0
  });
  
  const [trainerData, setTrainerData] = useState({
    name: '',
    email: '',
    phone: '',
    specialization: '',
    progress: 0,
    ratings: 0,
    notifications: [],
    upcomingClasses: [],
    materials: []
  });

  // Hook pentru a verifica dimensiunea ecranului
  const [isMobile, setIsMobile] = useState(false);

  // Verifică dimensiunea ecranului și actualizează starea
  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768); // 768px este un breakpoint comun pentru dispozitive mobile
    };
    
    // Verifică inițial
    checkIsMobile();
    
    // Adaugă event listener pentru redimensionarea ferestrei
    window.addEventListener('resize', checkIsMobile);
    
    // Curăță event listener-ul
    return () => window.removeEventListener('resize', checkIsMobile);
  }, []);

  useEffect(() => {
    // Folosim un API real pentru a obține datele trainerului
    const fetchTrainerData = async () => {
      try {
        // În mod normal, aici am face un apel API
        // const response = await axios.get(`${API_URL}/trainers/me`);
        // const data = response.data;
        
        // Pentru moment, folosim doar datele utilizatorului curent
        if (currentUser) {
          setTrainerData({
            name: currentUser.name || '',
            email: currentUser.email || '',
            phone: currentUser.phone || '',
            specialization: 'Formator', // În mod real, ar veni din API
            progress: 0,
            ratings: 0,
            notifications: [],
            upcomingClasses: [],
            materials: []
          });
          
          // Într-o implementare reală, am obține aceste date din API
          setStats({
            totalGroups: 0,
            activeGroups: 0,
            totalStudents: 0,
            upcomingClasses: 0
          });
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching trainer data:', error);
        setLoading(false);
      }
    };
    
    fetchTrainerData();
  }, [currentUser]);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gradient-to-b from-blue-600 to-blue-800">
        <div className="w-24 h-24 mb-6 rounded-full bg-white flex items-center justify-center shadow-lg">
          <span className="text-3xl font-bold text-blue-600">SN</span>
        </div>
        <h1 className="text-2xl font-bold text-white mb-8">Startup Nation 2025</h1>
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-white"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      {/* Decorative blobs */}
      <div className="absolute -z-10 w-96 h-96 rounded-full bg-blue-100/50 blur-3xl top-0 right-0"></div>
      <div className="absolute -z-10 w-96 h-96 rounded-full bg-purple-100/50 blur-3xl bottom-0 left-0"></div>
      
      {/* Header */}
      <header className="sticky top-0 z-50">
        <div className="bg-white/70 backdrop-blur-xl px-4 py-3 flex justify-between items-center border-b border-gray-200/50 shadow-sm">
          <div className="flex items-center">
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold">
              SN
            </div>
            <h1 className="ml-2 font-semibold text-gray-800">Startup Nation 2025</h1>
          </div>
          <div className="flex items-center">
            <div className="relative mr-3">
              <button className="relative p-2 rounded-full text-gray-700 hover:bg-gray-100/50 transition">
                <NotificationsIcon className="h-6 w-6" />
                {trainerData.notifications.filter(n => !n.read).length > 0 && (
                  <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] text-white">
                    {trainerData.notifications.filter(n => !n.read).length}
                  </span>
                )}
              </button>
            </div>
            <button 
              onClick={handleLogout}
              className="flex items-center rounded-lg px-3 py-1 text-gray-700 hover:bg-gray-100/50 transition"
            >
              <LogoutIcon className="h-5 w-5 mr-1" />
              <span className="text-sm">Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 px-4 pt-4 pb-20 overflow-y-auto">
        {/* Welcome Card */}
        <div className="mb-6 overflow-hidden">
          <div className="rounded-2xl p-6 bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg">
            <h2 className="text-xl font-bold mb-1">Bine ai venit{trainerData.name ? `, ${trainerData.name}` : ''}!</h2>
            <p className="text-sm text-white/80 mb-2">
              {trainerData.specialization || 'Formator'}
            </p>
            <div className="flex items-center mb-4">
              {trainerData.ratings > 0 && (
                <div className="flex items-center mr-4">
                  <CheckCircleIcon className="h-4 w-4 mr-1" />
                  <span className="text-sm">Rating: {trainerData.ratings}/5</span>
                </div>
              )}
              {stats.activeGroups > 0 && (
                <div className="flex items-center">
                  <CalendarMonthIcon className="h-4 w-4 mr-1" />
                  <span className="text-sm">{stats.activeGroups} grupe active</span>
                </div>
              )}
            </div>
            {trainerData.progress > 0 && (
              <>
                <div className="h-2 bg-white/20 rounded-full mb-1 overflow-hidden">
                  <div 
                    className="h-full bg-white rounded-full"
                    style={{ width: `${trainerData.progress}%` }}
                  />
                </div>
                <p className="text-sm text-white/80">
                  Progres curs: {trainerData.progress}% completat
                </p>
              </>
            )}
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-2xl p-4 shadow-md hover:shadow-lg transition-all">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-gray-500 mb-1">Total Grupe</p>
                <p className="text-2xl font-bold text-gray-800">{stats.totalGroups}</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-600">
                <GroupIcon className="h-5 w-5" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-2xl p-4 shadow-md hover:shadow-lg transition-all">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-gray-500 mb-1">Total Cursanți</p>
                <p className="text-2xl font-bold text-gray-800">{stats.totalStudents}</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-500">
                <SchoolIcon className="h-5 w-5" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-2xl p-4 shadow-md hover:shadow-lg transition-all">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-gray-500 mb-1">Materiale</p>
                <p className="text-2xl font-bold text-gray-800">{trainerData.materials.length}</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                <BookIcon className="h-5 w-5" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-2xl p-4 shadow-md hover:shadow-lg transition-all">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-gray-500 mb-1">Cursuri viitoare</p>
                <p className="text-2xl font-bold text-gray-800">{stats.upcomingClasses}</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-500">
                <CalendarMonthIcon className="h-5 w-5" />
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white rounded-2xl p-4 mb-6 shadow-md">
          <div className="flex space-x-4 overflow-x-auto">
            <button 
              className={`px-4 py-2 rounded-lg flex items-center ${currentTab === 'calendar' ? 'bg-blue-100 text-blue-600 font-medium' : 'text-gray-500 hover:bg-gray-100'}`}
              onClick={() => setCurrentTab('calendar')}
            >
              <CalendarMonthIcon className="h-5 w-5 mr-2" />
              Calendar
            </button>
            <button 
              className={`px-4 py-2 rounded-lg flex items-center ${currentTab === 'materials' ? 'bg-blue-100 text-blue-600 font-medium' : 'text-gray-500 hover:bg-gray-100'}`}
              onClick={() => setCurrentTab('materials')}
            >
              <BookIcon className="h-5 w-5 mr-2" />
              Materiale
            </button>
            <button 
              className={`px-4 py-2 rounded-lg flex items-center ${currentTab === 'groups' ? 'bg-blue-100 text-blue-600 font-medium' : 'text-gray-500 hover:bg-gray-100'}`}
              onClick={() => setCurrentTab('groups')}
            >
              <GroupIcon className="h-5 w-5 mr-2" />
              Grupe
            </button>
          </div>
        </div>

        {/* Calendar Tab Content */}
        {currentTab === 'calendar' && (
          <div className="bg-white rounded-2xl p-6 mb-6 shadow-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-800">Sesiuni de training</h3>
              <button className="text-sm text-blue-600 hover:text-blue-700 flex items-center">
                Vezi calendar complet
                <ArrowRightIcon className="h-4 w-4 ml-1" />
              </button>
            </div>
            
            <div className="space-y-4">
              {trainerData.upcomingClasses && trainerData.upcomingClasses.length > 0 ? (
                trainerData.upcomingClasses.map(session => (
                  <div key={session.id} className="border border-gray-200 rounded-xl p-4 hover:shadow-md transition">
                    <div className="flex items-start justify-between">
                      <div className="flex">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-3 ${session.online ? 'bg-blue-100 text-blue-600' : 'bg-orange-100 text-orange-600'}`}>
                          {session.online ? <VideocamIcon className="h-5 w-5" /> : <SchoolIcon className="h-5 w-5" />}
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-800">{session.title}</h4>
                          <p className="text-sm text-gray-500">{session.group}</p>
                        </div>
                      </div>
                      <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${session.online ? 'bg-blue-100 text-blue-700' : 'bg-orange-100 text-orange-700'}`}>
                        {session.online ? 'Online' : 'Fizic'}
                      </span>
                    </div>
                    <div className="mt-3 flex items-center justify-between">
                      <div className="flex items-center text-gray-500 text-sm">
                        <CalendarMonthIcon className="h-4 w-4 mr-1" />
                        {session.date}, {session.time}
                      </div>
                      <button className="text-sm px-3 py-1 rounded-lg border border-blue-500 text-blue-600 hover:bg-blue-50 transition">
                        Pregătește sesiunea
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <CalendarMonthIcon className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">Nu aveți nicio sesiune programată</p>
                </div>
              )}

              <button className="w-full py-2 mt-2 border border-dashed border-gray-300 rounded-lg text-gray-500 hover:bg-gray-50 flex items-center justify-center">
                <CalendarMonthIcon className="h-5 w-5 mr-2" />
                <span>Programează o nouă sesiune</span>
              </button>
            </div>
          </div>
        )}

        {/* Materials Tab Content */}
        {currentTab === 'materials' && (
          <div className="bg-white rounded-2xl p-6 mb-6 shadow-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-800">Materialele mele</h3>
              <button className="px-3 py-1 rounded-lg bg-blue-600 text-white text-sm hover:bg-blue-700 transition flex items-center">
                <BookIcon className="h-4 w-4 mr-1" />
                Adaugă material
              </button>
            </div>
            
            <div className="space-y-3">
              {trainerData.materials && trainerData.materials.length > 0 ? (
                trainerData.materials.map(material => (
                  <div key={material.id} className="flex items-center justify-between border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all">
                    <div className="flex items-center">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-3 
                        ${material.type === 'presentation' ? 'bg-purple-100 text-purple-600' : 
                          material.type === 'worksheet' ? 'bg-green-100 text-green-600' : 
                          'bg-blue-100 text-blue-600'}`}>
                        {material.type === 'presentation' ? <VideoLibraryIcon className="h-5 w-5" /> : 
                         material.type === 'worksheet' ? <AssignmentIcon className="h-5 w-5" /> : 
                         <BookIcon className="h-5 w-5" />}
                      </div>
                      <div>
                        <p className="font-medium text-gray-800">{material.title}</p>
                        <div className="flex items-center">
                          <span className="text-xs capitalize text-gray-500 mr-2">{material.type}</span>
                          <AccessTimeIcon className="h-3 w-3 text-gray-400 mr-1" />
                          <span className="text-xs text-gray-500">Adăugat pe {material.dateAdded}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <span className={`mr-3 px-2.5 py-1 text-xs font-medium rounded-full 
                        ${material.status === 'approved' ? 'bg-green-100 text-green-700' : 
                          'bg-amber-100 text-amber-700'}`}>
                        {material.status === 'approved' ? 'Aprobat' : 'În așteptare'}
                      </span>
                      <button className="text-blue-600 hover:text-blue-800">
                        <ArrowRightIcon className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <BookIcon className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">Nu aveți materiale adăugate</p>
                  <button className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition flex items-center mx-auto">
                    <BookIcon className="h-4 w-4 mr-2" />
                    Adaugă primul material
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Groups Tab Content */}
        {currentTab === 'groups' && (
          <div className="bg-white rounded-2xl p-6 mb-6 shadow-md">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Grupele mele</h3>
            
            {stats.totalGroups > 0 ? (
              <div className="space-y-4">
                <div className="border border-gray-200 rounded-xl p-4 hover:shadow-md transition">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center">
                      <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600 mr-3">
                        <GroupIcon className="h-5 w-5" />
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-800">Grupa 1</h4>
                        <p className="text-sm text-gray-500">0 cursanți</p>
                      </div>
                    </div>
                    <span className="px-2.5 py-1 text-xs font-medium rounded-full bg-green-100 text-green-700">
                      Activă
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    <div className="text-sm text-gray-500 flex items-center">
                      <CalendarMonthIcon className="h-4 w-4 mr-1" />
                      <span>0/0 sesiuni complete</span>
                    </div>
                    <div className="text-sm text-gray-500 flex items-center">
                      <SchoolIcon className="h-4 w-4 mr-1" />
                      <span>0% prezență</span>
                    </div>
                  </div>
                  <div className="mt-3 flex justify-end">
                    <button className="text-sm px-3 py-1 rounded-lg border border-blue-500 text-blue-600 hover:bg-blue-50 transition">
                      Vezi detalii
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <GroupIcon className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">Nu aveți grupe asignate</p>
                <p className="text-sm text-gray-500 mt-2">Contactați administratorul pentru a vă asigna grupe de training.</p>
              </div>
            )}
          </div>
        )}

        {/* Notifications */}
        <div className="bg-white rounded-2xl p-6 mb-6 shadow-md">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Notificări</h3>
          {trainerData.notifications && trainerData.notifications.length > 0 ? (
            <div className="divide-y divide-gray-200">
              {trainerData.notifications.map(notification => (
                <div 
                  key={notification.id} 
                  className={`py-4 ${notification.read ? '' : 'bg-blue-50 -mx-6 px-6 rounded-lg'}`}
                >
                  <div className="flex justify-between mb-1">
                    <p className={`font-medium ${notification.read ? 'text-gray-800' : 'text-blue-600'}`}>
                      {notification.title}
                    </p>
                    <p className="text-xs text-gray-500">{notification.time}</p>
                  </div>
                  <p className="text-sm text-gray-500">
                    {notification.description}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <NotificationsIcon className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">Nu aveți notificări noi</p>
            </div>
          )}
        </div>
      </main>

      {/* Bottom Navigation - Afișat doar pe dispozitive mobile */}
      {isMobile && (
        <div className="fixed bottom-0 left-0 right-0 bg-white/70 backdrop-blur-xl border-t border-gray-200/50 py-3 flex justify-around z-40 shadow-lg">
          <div 
            className="flex flex-col items-center cursor-pointer"
            onClick={() => setCurrentTab('calendar')}
          >
            <div className={`w-6 h-6 rounded-full flex items-center justify-center ${currentTab === 'calendar' ? 'bg-blue-600 text-white' : 'text-gray-400'}`}>
              <CalendarMonthIcon className="h-4 w-4" />
            </div>
            <p className={`mt-1 text-xs ${currentTab === 'calendar' ? 'font-medium text-blue-600' : 'text-gray-500'}`}>Calendar</p>
          </div>
          <div 
            className="flex flex-col items-center cursor-pointer"
            onClick={() => setCurrentTab('materials')}
          >
            <div className={`w-6 h-6 rounded-full flex items-center justify-center ${currentTab === 'materials' ? 'bg-blue-600 text-white' : 'text-gray-400'}`}>
              <BookIcon className="h-4 w-4" />
            </div>
            <p className={`mt-1 text-xs ${currentTab === 'materials' ? 'font-medium text-blue-600' : 'text-gray-500'}`}>Materiale</p>
          </div>
          <div 
            className="flex flex-col items-center cursor-pointer"
            onClick={() => setCurrentTab('groups')}
          >
            <div className={`w-6 h-6 rounded-full flex items-center justify-center ${currentTab === 'groups' ? 'bg-blue-600 text-white' : 'text-gray-400'}`}>
              <GroupIcon className="h-4 w-4" />
            </div>
            <p className={`mt-1 text-xs ${currentTab === 'groups' ? 'font-medium text-blue-600' : 'text-gray-500'}`}>Grupe</p>
          </div>
          <div className="flex flex-col items-center cursor-pointer">
            <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center">
              <PersonIcon className="h-4 w-4 text-gray-600" />
            </div>
            <p className="mt-1 text-xs text-gray-500">Profil</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default TrainerDashboardPage;