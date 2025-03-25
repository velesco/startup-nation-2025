import React, { useState, useEffect } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

// Import Icons (using Material UI icons for now, can be replaced with custom SVG icons later)
import GroupIcon from '@mui/icons-material/Group';
import AssessmentIcon from '@mui/icons-material/Assessment';
import CardMembershipIcon from '@mui/icons-material/CardMembership';
import AddIcon from '@mui/icons-material/Add';
import ArrowRightIcon from '@mui/icons-material/ArrowRight';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import FileUploadIcon from '@mui/icons-material/FileUpload';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import NotificationsIcon from '@mui/icons-material/Notifications';
import PersonIcon from '@mui/icons-material/Person';
import LogoutIcon from '@mui/icons-material/Logout';

const DashboardPage = () => {
  const navigate = useNavigate();
  const { currentUser, logout } = useAuth();
  const [loading, setLoading] = useState(true);
  const [currentStep, setCurrentStep] = useState(1);
  const [stats, setStats] = useState({
    totalClients: 42,
    newClients: 7,
    completedClients: 15,
    inProgressClients: 20
  });
  const [user, setUser] = useState({
    name: "Tech Partners SRL",
    email: "contact@techpartners.ro",
    phone: "0722123456",
    progress: 75,
    clients: {
      totalUploaded: true,
      documentsReviewed: true,
      groupsCreated: false
    },
    notifications: [
      {
        id: 1,
        title: "Client nou adăugat",
        description: "Vasilescu Ana a fost adăugată în sistem",
        time: "Acum 2 ore",
        read: false
      },
      {
        id: 2,
        title: "Document în așteptare",
        description: "Un nou document a fost încărcat și așteaptă verificare",
        time: "Ieri",
        read: true
      }
    ],
    upcomingTasks: [
      {
        id: 1,
        title: "Verificare plan de afaceri",
        description: "Pentru Vasilescu Ana",
        date: "25 Mar 2025",
        time: "10:00 - 13:00",
        priority: "high"
      },
      {
        id: 2,
        title: "Întâlnire consultanță",
        description: "Cu Ionescu Dan",
        date: "28 Mar 2025",
        time: "14:00 - 15:00",
        priority: "medium"
      }
    ]
  });

  // Progress steps for partners
  const steps = [
    { id: 1, name: "Importare Clienți", icon: <GroupIcon className="h-5 w-5" />, completed: user.clients.totalUploaded },
    { id: 2, name: "Verificare Documente", icon: <FileUploadIcon className="h-5 w-5" />, completed: user.clients.documentsReviewed },
    { id: 3, name: "Creare Grupe", icon: <CalendarMonthIcon className="h-5 w-5" />, completed: user.clients.groupsCreated }
  ];

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  useEffect(() => {
    // Simulate fetching data
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

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
      <div className="decoration-blob w-96 h-96 bg-blue-400 top-0 right-0"></div>
      <div className="decoration-blob w-96 h-96 bg-purple-400 bottom-0 left-0"></div>
      
      {/* Header */}
      <header className="sticky top-0 z-50">
        <div className="glassmorphism px-4 py-3 flex justify-between items-center border-b border-gray-200/50">
          <div className="flex items-center">
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-blue-purple text-white font-bold">
              SN
            </div>
            <h1 className="ml-2 font-semibold text-gray-800">Startup Nation 2025</h1>
          </div>
          <div className="flex items-center">
            <div className="relative mr-3">
              <button className="relative p-2 rounded-full text-gray-700 hover:bg-gray-100/50 transition">
                <NotificationsIcon className="h-6 w-6" />
                {user.notifications.filter(n => !n.read).length > 0 && (
                  <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] text-white">
                    {user.notifications.filter(n => !n.read).length}
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
          <div className="rounded-2xl p-6 bg-gradient-blue-purple text-white hover-scale transition-all shadow-lg">
            <h2 className="text-xl font-bold mb-1">Salut, {user.name}!</h2>
            <p className="text-sm text-white/80 mb-4">
              Gestionează clienții din programul Startup Nation 2025
            </p>
            <div className="h-2 bg-white/20 rounded-full mb-1 overflow-hidden">
              <div 
                className="h-full bg-white rounded-full"
                style={{ width: `${user.progress}%` }}
              />
            </div>
            <p className="text-sm text-white/80">
              Progres: {user.progress}% completat
            </p>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="glassmorphism rounded-2xl p-4 hover-scale transition-all shadow-md">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-gray-500 mb-1">Total Clienți</p>
                <p className="text-2xl font-bold text-gray-800">{stats.totalClients}</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-600">
                <GroupIcon className="h-5 w-5" />
              </div>
            </div>
          </div>
          
          <div className="glassmorphism rounded-2xl p-4 hover-scale transition-all shadow-md">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-gray-500 mb-1">Clienți Noi</p>
                <p className="text-2xl font-bold text-gray-800">{stats.newClients}</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-500">
                <AddIcon className="h-5 w-5" />
              </div>
            </div>
          </div>
          
          <div className="glassmorphism rounded-2xl p-4 hover-scale transition-all shadow-md">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-gray-500 mb-1">În Progres</p>
                <p className="text-2xl font-bold text-gray-800">{stats.inProgressClients}</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                <AssessmentIcon className="h-5 w-5" />
              </div>
            </div>
          </div>
          
          <div className="glassmorphism rounded-2xl p-4 hover-scale transition-all shadow-md">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-gray-500 mb-1">Finalizați</p>
                <p className="text-2xl font-bold text-gray-800">{stats.completedClients}</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-500">
                <CardMembershipIcon className="h-5 w-5" />
              </div>
            </div>
          </div>
        </div>

        {/* Progress Steps */}
        <div className="glassmorphism rounded-2xl p-6 mb-6 shadow-md">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Pașii de urmat</h3>
          
          <div className="space-y-3">
            {steps.map((step) => (
              <div 
                key={step.id} 
                className={`flex items-center p-4 rounded-xl border transition-all cursor-pointer hover:border-blue-300 hover:shadow-md ${
                  currentStep === step.id 
                    ? 'border-blue-500 bg-blue-50/50' 
                    : 'border-gray-200'
                }`}
                onClick={() => setCurrentStep(step.id)}
              >
                <div 
                  className={`w-10 h-10 rounded-full flex items-center justify-center mr-3 ${
                    step.completed 
                      ? 'bg-green-500 text-white' 
                      : currentStep === step.id
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-200 text-gray-500'
                  }`}
                >
                  {step.completed ? <CheckCircleIcon className="h-5 w-5" /> : step.icon}
                </div>
                <div className="flex-1">
                  <p className={`font-medium ${
                    currentStep === step.id ? 'text-blue-600' : 'text-gray-700'
                  }`}>
                    {step.name}
                  </p>
                  <p className="text-sm text-gray-500">
                    {step.completed ? 'Completat' : step.id === 1 ? 'În așteptare' : 'Blocat'}
                  </p>
                </div>
                <ArrowRightIcon className={`h-5 w-5 ${
                  currentStep === step.id ? 'text-blue-600' : 'text-gray-300'
                }`} />
              </div>
            ))}
          </div>
        </div>

        {/* Current Step Content */}
        {currentStep === 1 && (
          <div className="glassmorphism rounded-2xl p-6 mb-6 shadow-md">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Importare Clienți</h3>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center justify-center bg-gray-50/50 mb-4">
              <FileUploadIcon className="h-12 w-12 text-gray-400 mb-3" />
              <p className="text-gray-500 text-center mb-4">
                Încarcă un fișier CSV sau Excel cu lista clienților
              </p>
              <label className="bg-gradient-blue-purple hover:opacity-90 text-white font-medium py-2 px-4 rounded-lg cursor-pointer transition-all shadow-md">
                Import Clienți
                <input type="file" accept=".csv,.xlsx,.xls" className="hidden" />
              </label>
            </div>
            <p className="text-sm text-gray-500">
              Poți adăuga și clienți individual folosind butonul "Adaugă client nou" din pagina de clienți.
            </p>
          </div>
        )}

        {currentStep === 2 && (
          <div className="glassmorphism rounded-2xl p-6 mb-6 shadow-md">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Verificare Documente</h3>
            <div className="mb-6">
              <div className="flex justify-between items-center mb-1">
                <p className="text-sm text-gray-500">Progres verificare</p>
                <p className="text-sm font-medium text-blue-600">15/42 clienți</p>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-blue-500 rounded-full" style={{ width: '35.7%' }}></div>
              </div>
            </div>
            
            <h4 className="text-sm font-semibold text-gray-700 mb-2">
              Documente în așteptare:
            </h4>
            
            <div className="border border-gray-200 rounded-lg p-4 mb-3 hover:shadow-md transition-all">
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 mr-3">
                  <FileUploadIcon className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-800">Plan de afaceri - Vasilescu Ana</p>
                  <div className="flex items-center">
                    <AccessTimeIcon className="h-3 w-3 text-gray-400 mr-1" />
                    <p className="text-xs text-gray-500">Încărcat acum 2 ore</p>
                  </div>
                </div>
                <button className="rounded-lg border border-blue-500 text-blue-600 hover:bg-blue-50 px-3 py-1 text-sm transition-colors">
                  Verifică
                </button>
              </div>
            </div>
            
            <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all">
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 mr-3">
                  <FileUploadIcon className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-800">Certificat Înregistrare - Ionescu Dan</p>
                  <div className="flex items-center">
                    <AccessTimeIcon className="h-3 w-3 text-gray-400 mr-1" />
                    <p className="text-xs text-gray-500">Încărcat ieri</p>
                  </div>
                </div>
                <button className="rounded-lg border border-blue-500 text-blue-600 hover:bg-blue-50 px-3 py-1 text-sm transition-colors">
                  Verifică
                </button>
              </div>
            </div>
          </div>
        )}

        {currentStep === 3 && (
          <div className="glassmorphism rounded-2xl p-6 mb-6 shadow-md">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Creare Grupe</h3>
            
            <button className="w-full mb-6 bg-gradient-blue-purple hover:opacity-90 text-white font-medium py-2.5 px-4 rounded-lg flex items-center justify-center shadow-md transition-all">
              <AddIcon className="h-5 w-5 mr-1" />
              Creează Grupă Nouă
            </button>
            
            <h4 className="text-sm font-semibold text-gray-700 mb-2">
              Grupe Existente:
            </h4>
            
            <div className="border border-gray-200 rounded-lg p-4 mb-3 hover:shadow-md transition-all">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600 mr-3">
                    <CalendarMonthIcon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-800">Grupa 1 - Martie</p>
                    <p className="text-xs text-gray-500">15 clienți asignați</p>
                  </div>
                </div>
                <span className="px-2.5 py-1 text-xs font-medium rounded-full bg-green-100 text-green-700">
                  Activă
                </span>
              </div>
            </div>
            
            <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 mr-3">
                    <CalendarMonthIcon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-800">Grupa 2 - Aprilie</p>
                    <p className="text-xs text-gray-500">8 clienți asignați</p>
                  </div>
                </div>
                <span className="px-2.5 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-700">
                  În pregătire
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Notifications */}
        <div className="glassmorphism rounded-2xl p-6 mb-6 shadow-md">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Notificări</h3>
          <div className="divide-y divide-gray-200">
            {user.notifications.map(notification => (
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
        </div>

        {/* Upcoming Tasks */}
        <div className="glassmorphism rounded-2xl p-6 mb-6 shadow-md">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Taskuri Viitoare</h3>
          <div className="divide-y divide-gray-200">
            {user.upcomingTasks.map(task => (
              <div key={task.id} className="py-4">
                <div className="flex justify-between mb-1">
                  <p className="font-medium text-gray-800">{task.title}</p>
                  <span 
                    className={`px-2.5 py-1 text-xs font-medium rounded-full ${
                      task.priority === 'high' 
                        ? 'bg-red-100 text-red-700' 
                        : task.priority === 'medium'
                          ? 'bg-amber-100 text-amber-700'
                          : 'bg-green-100 text-green-700'
                    }`}
                  >
                    {task.priority === 'high' 
                      ? 'Urgent' 
                      : task.priority === 'medium'
                        ? 'Mediu'
                        : 'Scăzut'}
                  </span>
                </div>
                <p className="text-sm text-gray-500 mb-1">
                  {task.description}
                </p>
                <div className="flex items-center">
                  <AccessTimeIcon className="h-3 w-3 text-gray-400 mr-1" />
                  <p className="text-xs text-gray-500">
                    {task.date}, {task.time}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 glassmorphism border-t border-gray-200/50 py-3 flex justify-around z-40">
        <div className="flex flex-col items-center">
          <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center text-white">
            <CheckCircleIcon className="h-4 w-4" />
          </div>
          <p className="mt-1 text-xs font-medium text-blue-600">Pași</p>
        </div>
        <div className="flex flex-col items-center">
          <CalendarMonthIcon className="h-6 w-6 text-gray-400" />
          <p className="mt-1 text-xs text-gray-500">Grupe</p>
        </div>
        <div className="flex flex-col items-center">
          <NotificationsIcon className="h-6 w-6 text-gray-400" />
          <p className="mt-1 text-xs text-gray-500">Notificări</p>
        </div>
        <div className="flex flex-col items-center">
          <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center">
            <p className="text-xs font-medium text-gray-600">TP</p>
          </div>
          <p className="mt-1 text-xs text-gray-500">Profil</p>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;