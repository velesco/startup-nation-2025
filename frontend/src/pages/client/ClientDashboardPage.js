import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Bell, CheckCircle, User, X, Info, AlertTriangle, AlertCircle, Check, Activity, FileText } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import ClientWelcomeCard from '../../components/client/ClientWelcomeCard';
import ClientProgressSteps from '../../components/client/ClientProgressSteps';
import ClientNotifications from '../../components/client/ClientNotifications';
import ClientStepContent from '../../components/client/ClientStepContent';
import ClientHeader from '../../components/client/ClientHeader';
import ClientProfileContent from '../../components/client/ClientProfileContent';
import LoadingScreen from '../../components/client/LoadingScreen';

const ClientDashboardPage = () => {
  const { currentUser, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [activeTab, setActiveTab] = useState('steps');
  const [error, setError] = useState(null);
  const [showAllNotificationsModal, setShowAllNotificationsModal] = useState(false);
  const stepsContentRef = useRef(null);
  
  // Funcție pentru a calcula progresul utilizatorului în funcție de documentele încărcate
  const calculateProgress = useCallback((documents) => {
    if (!documents) return 0;
    
    const steps = [
      documents.id_cardUploaded || false,
      documents.appDownloaded || false
    ];
    
    const completedSteps = steps.filter(step => step).length;
    return Math.round((completedSteps / steps.length) * 100);
  }, []);

  // Verificăm dacă utilizatorul este autentificat - dacă nu, redirecționăm la login
  useEffect(() => {
    if (!isAuthenticated) {
      console.log('Utilizator neautentificat, redirecționare la login');
      navigate('/login');
    } else {
      console.log('Utilizator autentificat:', currentUser?.email);
    }
  }, [isAuthenticated, navigate, currentUser]);
  
  const fetchUserData = useCallback(async () => {
    console.log('START fetchUserData');
    try {
      setError(null);
      if (!currentUser) {
        console.error('Nu există un utilizator autentificat');
        navigate('/login');
        return;
      }

      // Încercăm să obținem datele utilizatorului de la API
      try {
        const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5003/api';
        const token = localStorage.getItem('token');
        
        if (!token) {
          throw new Error('Nu există token de autentificare');
        }
        
        const response = await axios.get(`${API_URL}/auth/me`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        console.log('Date utilizator de la API:', response.data);
        
        // Verificăm dacă avem date valide de la server
        if (response.data && response.data.success && response.data.data) {
          const userData = response.data.data;
          
          // Verificăm starea documentelor pentru a determina progresul
          const documents = userData.documents || {
            id_cardUploaded: false,
            contractGenerated: false,
            contractSigned: false,
            appDownloaded: false
          };
          
          // Calculăm progresul utilizatorului în funcție de documentele încărcate
          const completedSteps = [
            documents.id_cardUploaded,
            documents.contractSigned,
            documents.consultingContractSigned,
            documents.appDownloaded
          ].filter(Boolean).length;
          
          const progress = Math.round((completedSteps / 4) * 100);
          
          // Determinăm pasul curent în funcție de progres
          let currentStepValue = 1;
          
          if (documents.id_cardUploaded) {
            currentStepValue = 2; // Pas contract participare
            
            if (documents.contractSigned) {
              currentStepValue = 3; // Pas contract consultanță
              
              if (documents.consultingContractSigned) {
                currentStepValue = 4; // Pas instalare aplicație
              }
            }
          }
          
          // Dacă avem consultingContractSigned dar nu avem contractSigned (caz special), marcăm și contractSigned = true
          if (documents.consultingContractSigned && !documents.contractSigned) {
            console.log('Am detectat consultingContractSigned=true dar contractSigned=false. Corectăm...');
            documents.contractSigned = true;
          }
          
          setCurrentStep(currentStepValue);
          
          // Încercăm să obținem notificările utilizatorului din API
          let userNotifications = [];
          try {
            const notificationsResponse = await axios.get(`${API_URL}/notifications`, {
              headers: { Authorization: `Bearer ${token}` }
            });
            
            if (notificationsResponse.data && notificationsResponse.data.success && notificationsResponse.data.data) {
              userNotifications = notificationsResponse.data.data;
              console.log('Notificări obținute din API:', userNotifications);
            }
          } catch (notificationsError) {
            console.warn('Nu s-au putut obține notificările din API, se folosesc notificări generate:', notificationsError);
            
            // Generăm notificări bazate pe starea utilizatorului
            userNotifications = [
              {
                id: 1,
                title: documents.id_cardUploaded ? "Buletinul tău a fost verificat" : "Încarcă buletinul",
                description: documents.id_cardUploaded ? 
                  "Documentul tău a fost verificat și aprobat. Poți continua la următorul pas." : 
                  "Te rugăm să încarci copia buletinului pentru verificare.",
                time: "Acum " + (new Date()).getMinutes() + " minute",
                read: documents.id_cardUploaded,
                createdAt: new Date()
              },
              {
                id: 2,
                title: "Grup disponibil",
                description: "S-a deschis o nouă grupă pentru cursul de antreprenoriat",
                time: "Acum 3 ore",
                read: true,
                createdAt: new Date(new Date().getTime() - 3 * 60 * 60 * 1000)
              }
            ];
          }
          
          // Combinăm datele utilizatorului cu informațiile adiționale
          const enhancedUser = {
            ...userData,
            progress,
            documents,
            notifications: userNotifications
          };
          
          setUser(enhancedUser);
        } else {
          throw new Error('Răspunsul API nu conține datele necesare');
        }
      } catch (apiError) {
        console.error('Eroare la obținerea datelor utilizatorului:', apiError);
        console.error('Detalii eroare:', apiError.response?.data || apiError.message);
        
        setError('Nu s-au putut obține datele utilizatorului. Vă rugăm încercați din nou sau contactați asistența.');
        
        if (apiError.response?.status === 401) {
          console.error('Sesiune expirată sau token invalid. Redirecționare la login...');
          logout();
          navigate('/login');
        }
        return;
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Eroare generală la încărcarea datelor:', error);
      setError('A apărut o eroare la încărcarea datelor. Încercați să actualizați pagina sau contactați asistența.');
      setLoading(false);
    }
  }, [currentUser, navigate, logout]);

  // Funcție pentru actualizarea datelor utilizatorului
  const updateUserData = useCallback(async (newData) => {
    console.log('=== START updateUserData ===');
    console.log('Date noi pentru actualizare:', newData);
    
    try {
      const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5003/api';
      const token = localStorage.getItem('token');
      
      if (!token) {
        console.error('Token lipsă, nu se poate actualiza');
        return false;
      }
      
      console.log('API URL:', API_URL);
      console.log('Token disponibil:', !!token);
      console.log('Request endpoint:', `${API_URL}/auth/update-details`);
      
      // Actualizăm datele utilizatorului prin API
      const response = await axios.put(`${API_URL}/auth/update-details`, newData, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      console.log('Răspuns actualizare date utilizator:', response.data);
      console.log('Status code:', response.status);
      
      if (response.data && (response.data.success || response.status === 200)) {
        // Actualizăm starea locală a utilizatorului
        if (user) {
          console.log('Utilizator actual înainte de actualizare:', user);
          const updatedUser = {
            ...user,
            ...newData
          };
          
          // Actualizăm progresul dacă s-au modificat documentele
          if (newData.documents) {
            console.log('Documente noi:', newData.documents);
            const completedSteps = [
              newData.documents.id_cardUploaded,
              newData.documents.contractSigned,
              newData.documents.consultingContractSigned,
              newData.documents.appDownloaded
            ].filter(Boolean).length;
            
            updatedUser.progress = Math.round((completedSteps / 4) * 100);
            console.log('Progres nou calculat:', updatedUser.progress);
            
            // Verificăm dacă avem un pas forțat transmis explicit
            if (newData.nextStep !== undefined) {
              console.log(`Utilizăm pasul forțat: ${newData.nextStep}`);
              // Forțăm setarea pasului curent cu un timer pentru a evita problemele de sincronizare
              setCurrentStep(newData.nextStep);
              
              // Forțăm din nou după un scurt delay pentru a ne asigura că se aplică
              setTimeout(() => {
                console.log(`Re-forțăm setarea pasului la: ${newData.nextStep}`);
                setCurrentStep(newData.nextStep);
              }, 300);
            } else {
              // Determinăm pasul curent în funcție de progres
              let nextStep = 1;
              if (newData.documents.id_cardUploaded) {
                nextStep = 2;
                if (newData.documents.contractSigned) {
                  nextStep = 3;
                  if (newData.documents.consultingContractSigned) {
                    nextStep = 4;
                  }
                } else if (newData.documents.consultingContractSigned) {
                  // Dacă avem consultingContractSigned dar nu avem contractSigned (caz special), 
                  // marcăm contractSigned = true și setăm pasul la 3
                  console.log('Am detectat consultingContractSigned=true dar contractSigned=false în actualizare. Corectăm...');
                  newData.documents.contractSigned = true;
                  nextStep = 3;
                }
              }
              
              console.log('Pas nou calculat:', nextStep);
              
              // Actualizăm pasul curent
              setCurrentStep(nextStep);
            }
          }
          
          console.log('Utilizator actualizat:', updatedUser);
          setUser(updatedUser);
          
          // Reîncărcăm documentele în cazul actualizării documentelor
          if (newData.documents) {
            try {
              const documentsResponse = await axios.get(`${API_URL}/user/documents`, {
                headers: { Authorization: `Bearer ${token}` }
              });
              console.log('Documente reîncărcate după actualizare:', documentsResponse.data);
            } catch (documentsError) {
              console.warn('Nu s-au putut reîncărca documentele după actualizare:', documentsError);
            }
          }
        } else {
          console.warn('Nu există un utilizator în stare pentru actualizare!');
        }
        
        console.log('=== END updateUserData (succes) ===');
        return true;
      } else {
        console.error('Eroare la actualizarea datelor utilizatorului din API:', response.data);
        console.log('=== END updateUserData (eroare API) ===');
        return false;
      }
    } catch (error) {
      console.error('Excepție la actualizarea datelor utilizatorului:', error);
      console.error('Mesaj eroare:', error.message);
      console.error('Stare eroare:', error.response?.status);
      console.error('Răspuns eroare:', error.response?.data);
      console.log('=== END updateUserData (eroare) ===');
      return false;
    }
  }, [user, setCurrentStep]);

  // Funcție de refresh pentru butonul din header
  const handleRefresh = useCallback(() => {
    setLoading(true);
    setUser(null);
    setError(null);
    
    console.log('Forțăm resetarea cache-ului și reîncărcarea datelor...');
    
    // Forțăm un refresh complet al paginii pentru a evita problemele de cache
    localStorage.setItem('dashboardNeedsRefresh', 'true');
    window.location.reload();
    
  }, []);

  // Detectare dimensiune ecran pentru design responsive
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Încărcarea inițială a datelor
  useEffect(() => {
    // Important: verificăm dacă trebuie să forțăm un refresh total
    const needsRefresh = localStorage.getItem('dashboardNeedsRefresh') === 'true';
    const forceRefresh = new URLSearchParams(window.location.search).get('refresh');
    
    // Verificăm dacă trebuie să forțăm un anumit pas
    const forceNextStep = localStorage.getItem('forceNextStep');
    if (forceNextStep) {
      console.log(`Avem pas forțat din localStorage: ${forceNextStep}`);
      const stepNumber = parseInt(forceNextStep, 10);
      if (!isNaN(stepNumber)) {
        console.log(`Setăm pasul forțat: ${stepNumber}`);
        setCurrentStep(stepNumber);
        
        // Setăm un timer pentru a ne asigura că se aplică după ce datele sunt încărcate
        setTimeout(() => {
          console.log(`Re-aplicare pas forțat: ${stepNumber}`);
          setCurrentStep(stepNumber);
          
          // Șterge valoarea din localStorage
          localStorage.removeItem('forceNextStep');
        }, 500);
      }
    }
    
    if (needsRefresh && !forceRefresh) {
      // Setăm flag-ul în localStorage
      localStorage.removeItem('dashboardNeedsRefresh');
      
      // Reîncărcăm pagina cu parameter de refresh
      const currentUrl = window.location.pathname + '?refresh=' + Date.now();
      console.log('Forțăm reactualizarea completă pentru a evita cache-ul...');
      window.location.href = currentUrl;
      return;
    }
    
    console.log('Reîncărcăm datele utilizatorului...');
    setLoading(true);
    // Forțăm reîncărcarea completă a datelor, ștergem întâi vechile date
    setUser(null);
    setError(null);
    
    // Folosim setTimeout doar pentru a evita problema de Maximum update depth exceeded
    const timer = setTimeout(() => {
      fetchUserData();
    }, 100);
    
    return () => clearTimeout(timer);
  }, [fetchUserData]);

  // Funcție pentru scroll la conținutul pașilor
  const scrollToStepsContent = useCallback(() => {
    if (stepsContentRef.current) {
      stepsContentRef.current.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
    }
  }, []);

  // Funcție pentru a gestiona click-ul pe pași și a face scroll
  const handleStepClick = useCallback((step) => {
    console.log(`Click pe pasul ${step}`);
    
    // Dacă utilizatorul încearcă să meargă la un pas avansat, verificăm dacă pașii anteriori sunt completați
    if (step > 1 && user?.documents) {
      if (step > 1 && !user.documents.id_cardUploaded) {
        console.warn('Nu poți merge la pasul următor înainte de a finaliza buletinul');
        setCurrentStep(1); // Rămânem la pasul 1
        return;
      }
      
      if (step > 2 && !user.documents.contractSigned) {
        // Dacă mergem la Contract Consultanță dar contractul de participare nu e semnat,
        // marcăm manual contractul de participare ca semnat
        console.log('Marcăm contractul de participare ca semnat pentru a permite navigarea');
        const updatedDocs = { 
          ...user.documents,
          contractSigned: true,
          contractGenerated: true
        };
        updateUserData({ documents: updatedDocs });
      }
    }
    
    // Setăm pasul current
    setCurrentStep(step);
    
    // Dacă suntem pe mobil și tab-ul nu este 'steps', mai întâi schimbăm la tab-ul steps
    if (isMobile && activeTab !== 'steps') {
      setActiveTab('steps');
      // Adăugăm un mic delay pentru a permite schimbarea tab-ului înainte de scroll
      setTimeout(() => {
        scrollToStepsContent();
      }, 100);
    } else {
      // Altfel, doar facem scroll
      scrollToStepsContent();
    }
  }, [isMobile, activeTab, scrollToStepsContent, user, updateUserData]);
  
  // Funcție pentru obținerea iconiței în funcție de tipul notificării
  const getNotificationIcon = (type) => {
    switch (type) {
      case 'info':
        return <Info className="h-5 w-5 text-blue-500" />;
      case 'success':
        return <Check className="h-5 w-5 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'error':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      case 'meeting':
        return <Activity className="h-5 w-5 text-purple-500" />;
      case 'document':
        return <FileText className="h-5 w-5 text-orange-500" />;
      default:
        return <Bell className="h-5 w-5 text-gray-500" />;
    }
  };

  // Progress steps
  const steps = user ? [
    { id: 1, name: "Încărcare Buletin", icon: "document", completed: user.documents?.id_cardUploaded },
    { id: 2, name: "Contract Participare", icon: "document", completed: user.documents?.contractSigned },
    { id: 3, name: "Contract Consultanță", icon: "document", completed: user.documents?.consultingContractSigned },
    // { id: 4, name: "Instalare Aplicație", icon: "check", completed: user.documents?.appDownloaded }
  ] : [];

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Eroare la delogare:', error);
    }
  };

  // Memoizarea conținutului pentru a preveni rerenderizări inutile
  const renderStepsContent = useCallback(() => {
    return (
      <>
        <ClientWelcomeCard user={user} />
        <ClientProgressSteps 
          steps={steps} 
          currentStep={currentStep} 
          setCurrentStep={handleStepClick} 
        />
        <div ref={stepsContentRef}>
          <ClientStepContent 
            step={currentStep} 
            updateUserData={updateUserData} 
            userDocuments={user?.documents} 
          />
        </div>
      </>
    );
  }, [user, steps, currentStep, handleStepClick, updateUserData]);

  // Memoizarea conținutului principal
  const renderMainContent = useCallback(() => {
    if (isMobile) {
      // Conținut bazat pe tab-ul activ (pentru mobile)
      switch (activeTab) {
        case 'steps':
          return renderStepsContent();
        case 'notifications':
          return <ClientNotifications 
            notifications={user?.notifications || []} 
            onShowAllNotifications={() => setShowAllNotificationsModal(true)} 
          />;
        case 'profile':
          return <ClientProfileContent user={user} onLogout={handleLogout} />;
        default:
          return renderStepsContent();
      }
    } else {
      // Pentru desktop afișăm toate conținuturile
      return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            {renderStepsContent()}
          </div>
          <div className="lg:col-span-1 space-y-8">
            <ClientNotifications 
              notifications={user?.notifications || []} 
              onShowAllNotifications={() => setShowAllNotificationsModal(true)} 
            />
          </div>
        </div>
      );
    }
  }, [isMobile, activeTab, renderStepsContent, user, handleLogout]);

  // Loading screen
  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 relative overflow-hidden">
      {/* Decorative Elements */}
      <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-gradient-to-br from-orange-400/20 to-pink-500/20 blur-3xl -z-10"></div>
      <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full bg-gradient-to-tr from-blue-500/20 to-purple-600/20 blur-3xl -z-10"></div>
      
      {/* Modal pentru toate notificările */}
      {showAllNotificationsModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-xl mx-auto my-auto">
            <div className="flex justify-between items-center p-4 border-b border-gray-100">
              <h3 className="text-xl font-bold text-gray-800 flex items-center">
                <Bell className="h-6 w-6 text-blue-500 mr-2" />
                Toate notificările
              </h3>
              <button 
                onClick={() => setShowAllNotificationsModal(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>
            
            <div className="overflow-y-auto flex-1 p-4">
              {user?.notifications && user.notifications.length > 0 ? (
                <div className="space-y-4">
                  {user.notifications.map(notification => (
                    <div 
                      key={notification.id || notification._id} 
                      className={`p-4 rounded-2xl transition-all ${!notification.read ? 
                        'bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-100/50 shadow-md' : 
                        'bg-white/80 border border-gray-100 hover:border-gray-200 hover:shadow-sm'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-1">
                        <div className="flex items-start">
                          <div className="mr-3 mt-1">
                            {getNotificationIcon(notification.type)}
                          </div>
                          <h3 className={`font-semibold ${!notification.read ? 
                            'bg-gradient-to-r from-blue-700 to-purple-700 bg-clip-text text-transparent' : 
                            'text-gray-800'
                          }`}>
                            {notification.title}
                          </h3>
                        </div>
                        <span className="text-xs text-gray-500 bg-white/80 px-2 py-1 rounded-full shadow-sm">
                          {notification.time || (notification.createdAt ? new Date(notification.createdAt).toLocaleDateString('ro-RO') : '')}
                        </span>
                      </div>
                      <div className="mt-3">
                        <p className="text-sm text-gray-600 bg-white/80 p-3 rounded-xl">
                          {notification.description || notification.message}
                        </p>
                        {notification.actionLink && (
                          <a 
                            href={notification.actionLink} 
                            className="mt-2 text-sm text-blue-600 hover:text-blue-800 inline-flex items-center"
                          >
                            Vezi detalii
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-4 text-center text-gray-500">
                  Nu ai notificări noi
                </div>
              )}
            </div>
            
            <div className="p-4 border-t border-gray-100">
              <button 
                onClick={() => setShowAllNotificationsModal(false)}
                className="w-full py-2 bg-blue-100 text-blue-700 rounded-xl hover:bg-blue-200 transition-colors"
              >
                Închide
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Header */}
      <ClientHeader 
        user={user} 
        onLogout={handleLogout} 
        onRefresh={handleRefresh} 
        onShowNotifications={() => setShowAllNotificationsModal(true)} 
      />

      {/* Content */}
      <div className="flex-1 overflow-auto px-6 pt-6 pb-24 md:pb-6">
        {error || user?.progress < 0 ? (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 text-red-700 flex items-center">
            <div className="bg-red-100 rounded-full p-2 mr-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="font-medium">A apărut o eroare</p>
              <p className="text-sm text-red-600">{error || "Se afișează date vechi. Pentru a vedea cele mai recente date, curățați cache-ul."}</p>
              <button 
                className="mt-2 px-3 py-1 text-sm bg-red-100 hover:bg-red-200 rounded transition-colors text-red-800"
                onClick={() => {
                  localStorage.clear(); // Ștergem tot din localStorage
                  localStorage.setItem('dashboardNeedsRefresh', 'true');
                  window.location.href = window.location.pathname + '?forceRefresh=' + Date.now();
                }}
              >
                Curăță cache-ul și reîncărcă
              </button>
            </div>
          </div>
        ) : null}
        
        {renderMainContent()}
      </div>

      {/* Bottom Navigation - doar pentru mobil */}
      {isMobile && (
        <div className="fixed bottom-0 left-0 right-0 bg-white/70 backdrop-blur-xl border-t border-white/50 flex justify-around py-4 px-6 rounded-t-3xl shadow-lg z-[9000]">
          <div 
            className="flex flex-col items-center cursor-pointer"
            onClick={() => {
              setActiveTab('steps');
              // Facem scroll după ce se schimbă tab-ul
              setTimeout(() => scrollToStepsContent(), 100);
            }}
          >
            <div className={`w-10 h-10 rounded-full flex items-center justify-center shadow-md mb-1 ${
              activeTab === 'steps' ? 'bg-gradient-to-r from-blue-500 to-purple-600' : 'bg-white'
            }`}>
              <CheckCircle className={`h-5 w-5 ${activeTab === 'steps' ? 'text-white' : 'text-gray-500'}`} />
            </div>
            <span className={`text-xs font-medium ${
              activeTab === 'steps' ? 'bg-gradient-to-r from-blue-700 to-purple-700 bg-clip-text text-transparent' : 'text-gray-500'
            }`}>Pași</span>
          </div>

          <div 
            className="flex flex-col items-center cursor-pointer"
            onClick={() => setActiveTab('notifications')}
          >
            <div className={`w-10 h-10 rounded-full flex items-center justify-center shadow-md mb-1 ${
              activeTab === 'notifications' ? 'bg-gradient-to-r from-blue-500 to-purple-600' : 'bg-white'
            }`}>
              <Bell className={`h-5 w-5 ${activeTab === 'notifications' ? 'text-white' : 'text-gray-500'}`} />
            </div>
            <span className={`text-xs font-medium ${
              activeTab === 'notifications' ? 'bg-gradient-to-r from-blue-700 to-purple-700 bg-clip-text text-transparent' : 'text-gray-500'
            }`}>Notificări</span>
          </div>
          <div 
            className="flex flex-col items-center cursor-pointer"
            onClick={() => setActiveTab('profile')}
          >
            <div className={`w-10 h-10 rounded-full flex items-center justify-center shadow-md mb-1 ${
              activeTab === 'profile' ? 'bg-gradient-to-r from-blue-500 to-purple-600' : 'bg-white'
            }`}>
              <User className={`h-5 w-5 ${activeTab === 'profile' ? 'text-white' : 'text-gray-500'}`} />
            </div>
            <span className={`text-xs font-medium ${
              activeTab === 'profile' ? 'bg-gradient-to-r from-blue-700 to-purple-700 bg-clip-text text-transparent' : 'text-gray-500'
            }`}>Profil</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientDashboardPage;