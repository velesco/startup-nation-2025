import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  Users, 
  BarChart2, 
  Calendar, 
  ArrowRight, 
  RefreshCw,
  Briefcase,
  PieChart,
  UserPlus,
  Shield
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import DashboardLayout from '../../components/layouts/DashboardLayout';
import LoadingScreen from '../../components/client/LoadingScreen';
import StatCard from '../../components/admin/dashboard/StatCard';
import GroupOccupancyChart from '../../components/admin/dashboard/GroupOccupancyChart';
import ParticipationChart from '../../components/admin/dashboard/ParticipationChart';
import UpcomingMeetingsCalendar from '../../components/admin/dashboard/UpcomingMeetingsCalendar';
import NotificationsPanel from '../../components/admin/dashboard/NotificationsPanel';
import RecentActivitiesPanel from '../../components/admin/dashboard/RecentActivitiesPanel';
import AllUsersPanel from '../../components/admin/dashboard/AllUsersPanel';

const AdminDashboardPage = () => {
  const navigate = useNavigate();
  const { currentUser, isAuthenticated } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  
  // Verificăm dacă utilizatorul este autentificat și are rolul potrivit
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    } else if (currentUser && currentUser.role !== 'admin' && currentUser.role !== 'partner') {
      navigate('/');
    }
  }, [isAuthenticated, currentUser, navigate]);
  
  // Încărcarea datelor pentru dashboard
  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5003/api';
      
      // Încercarea de a obține datele cu tratare individuală a erorilor pentru fiecare cerere
      // în acest fel, chiar dacă unele endpoint-uri nu există, dashboard-ul va funcționa parțial
      let dashboardResponse, clientsResponse, groupsResponse, meetingsResponse, notificationsResponse, activitiesResponse;
      
      try {
        dashboardResponse = await axios.get(`${API_URL}/admin/dashboard`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
      } catch (err) {
        console.warn('Nu s-au putut încărca datele principale de dashboard:', err);
        dashboardResponse = { data: { success: true, data: {} } };
      }
      
      try {
        clientsResponse = await axios.get(`${API_URL}/clients`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
      } catch (err) {
        console.warn('Nu s-au putut încărca datele despre clienți:', err);
        clientsResponse = { data: { data: [] } };
      }
      
      try {
        groupsResponse = await axios.get(`${API_URL}/groups`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
      } catch (err) {
        console.warn('Nu s-au putut încărca datele despre grupe:', err);
        groupsResponse = { data: { data: [] } };
      }
      
      try {
        meetingsResponse = await axios.get(`${API_URL}/meetings`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
      } catch (err) {
        console.warn('Nu s-au putut încărca datele despre întâlniri:', err);
        meetingsResponse = { data: { data: [] } };
      }
      
      try {
        notificationsResponse = await axios.get(`${API_URL}/notifications`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
      } catch (err) {
        console.warn('Nu s-au putut încărca notificările:', err);
        notificationsResponse = { data: { data: [] } };
      }
      
      try {
        activitiesResponse = await axios.get(`${API_URL}/activities`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
      } catch (err) {
        console.warn('Nu s-au putut încărca activitățile recente:', err);
        activitiesResponse = { data: { data: [] } };
      }
      
      // Verificăm dacă avem datele principale pentru dashboard
      if (dashboardResponse.data && dashboardResponse.data.success) {
        // Combinăm datele din toate răspunsurile pentru a crea un obiect de date complet
        const combinedData = {
          ...dashboardResponse.data.data,
          clients: clientsResponse.data.data || [],
          groups: groupsResponse.data.data || [],
          upcomingMeetings: meetingsResponse.data.data || [],
          notifications: notificationsResponse.data.data || [],
          recentActivities: activitiesResponse.data.data || []
        };
        
        // Calculăm statisticile în mod dinamic
        combinedData.participantsCount = combinedData.clients.length || 0;
        combinedData.activeGroupsCount = Array.isArray(combinedData.groups) 
          ? combinedData.groups.filter(group => group && group.status === 'active').length 
          : 0;
        combinedData.upcomingMeetingsCount = Array.isArray(combinedData.upcomingMeetings)
          ? combinedData.upcomingMeetings.filter(meeting => meeting && new Date(meeting.date) > new Date()).length
          : 0;
        
        // Calculăm ocuparea medie a grupelor
        if (Array.isArray(combinedData.groups) && combinedData.groups.length > 0) {
          const totalCapacity = combinedData.groups.reduce((sum, group) => sum + (group.capacity || 0), 0);
          const totalParticipants = combinedData.groups.reduce((sum, group) => {
            return sum + (group.participants ? (Array.isArray(group.participants) ? group.participants.length : 0) : 0);
          }, 0);
          combinedData.averageOccupancy = totalCapacity > 0 ? (totalParticipants / totalCapacity) * 100 : 0;
        } else {
          combinedData.averageOccupancy = 0;
        }
        
        // Formatăm datele pentru grafice
        combinedData.groupOccupancy = Array.isArray(combinedData.groups) ? combinedData.groups.map(group => ({
          name: typeof group.name === 'string' ? group.name : (group.name ? JSON.stringify(group.name) : 'Grupă necunoscută'),
          capacity: group.capacity || 0,
          participants: group.participants ? (Array.isArray(group.participants) ? group.participants.length : 0) : 0,
          percentage: group.capacity > 0 ? (group.participants ? 
            (Array.isArray(group.participants) ? (group.participants.length / group.capacity) * 100 : 0) : 0) : 0
        })) : [];

        // Formatăm datele pentru graficul de participare
        combinedData.meetingParticipation = Array.isArray(combinedData.upcomingMeetings) ? 
          combinedData.upcomingMeetings
            .filter(meeting => meeting && meeting.date)
            .map(meeting => ({
              date: meeting.date,
              title: meeting.title || meeting.name || 'Întâlnire',
              totalParticipants: meeting.totalParticipants || 0,
              presentParticipants: meeting.presentParticipants || 0
            })) : [];
        
        // Setăm datele formatate în state
        setDashboardData(combinedData);
      } else {
        // Dacă nu avem date principale, creăm un set minim de date
        const fallbackData = {
          clients: clientsResponse.data.data || [],
          groups: groupsResponse.data.data || [],
          upcomingMeetings: meetingsResponse.data.data || [],
          notifications: notificationsResponse.data.data || [],
          recentActivities: activitiesResponse.data.data || [],
          participantsCount: (clientsResponse.data.data || []).length,
          activeGroupsCount: 0,
          upcomingMeetingsCount: 0,
          averageOccupancy: 0,
          groupOccupancy: [],
          meetingParticipation: []
        };
        
        setDashboardData(fallbackData);
      }
    } catch (err) {
      console.error('Error loading dashboard data:', err);
      setError('Nu s-au putut încărca datele pentru dashboard. Vă rugăm să încercați din nou.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };
  
  // Inițializare dashboard
  useEffect(() => {
    if (isAuthenticated && currentUser) {
      fetchDashboardData();
    }
  }, [isAuthenticated, currentUser]);
  
  // Funcție pentru reîmprospătare date
  const refreshDashboard = () => {
    setRefreshing(true);
    fetchDashboardData();
  };
  
  if (loading && !dashboardData) {
    return <LoadingScreen />;
  }
  
  // Dacă există o eroare, afișăm un mesaj de eroare
  if (error) {
    return (
      <DashboardLayout>
        <div className="container mx-auto px-4 py-6">
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            <div className="flex items-center">
              <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <p>{error}</p>
            </div>
            <button 
              onClick={refreshDashboard}
              className="mt-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
            >
              Încearcă din nou
            </button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-6">
        {/* Header și acțiuni */}
        <div className="flex flex-wrap justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
            <p className="text-gray-500">Bine ai venit, {typeof currentUser?.name === 'string' ? currentUser?.name : (currentUser?.name && typeof currentUser?.name === 'object' && currentUser?.name.name ? currentUser?.name.name : '')}</p>
          </div>
          
          <div className="flex space-x-3 mt-4 sm:mt-0">
            <button
              className="flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              onClick={refreshDashboard}
              disabled={refreshing}
            >
              {refreshing ? (
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4 mr-2" />
              )}
              Actualizează
            </button>
            <Link
              to="/admin/reports"
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <BarChart2 className="h-4 w-4 mr-2" />
              Rapoarte
            </Link>
          </div>
        </div>
        
        {/* Card-uri cu statistici */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <StatCard 
            title="Total participanți"
            value={dashboardData?.participantsCount || 0}
            icon={<Users className="h-8 w-8 text-blue-500" />}
            backgroundColor="bg-blue-50"
            change={dashboardData?.participantsChange}
            link="/clients"
          />
          
          <StatCard 
            title="Grupe active"
            value={dashboardData?.activeGroupsCount || 0}
            icon={<Briefcase className="h-8 w-8 text-green-500" />}
            backgroundColor="bg-green-50"
            change={dashboardData?.groupsChange}
            link="/admin/groups"
          />
          
          <StatCard 
            title="Întâlniri planificate"
            value={dashboardData?.upcomingMeetingsCount || 0}
            icon={<Calendar className="h-8 w-8 text-purple-500" />}
            backgroundColor="bg-purple-50"
            change={dashboardData?.meetingsChange}
            link="#schedule"
          />
          
          <StatCard 
            title="Grad mediu ocupare"
            value={`${dashboardData?.averageOccupancy?.toFixed(1) || 0}%`}
            icon={<PieChart className="h-8 w-8 text-orange-500" />}
            backgroundColor="bg-orange-50"
            change={dashboardData?.occupancyChange}
            link="/admin/reports"
          />
        </div>
        
        {/* Grafice și statistici avansate */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Grafic ocupare grupe */}
          <div className="bg-white p-5 rounded-xl shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-800">Ocupare grupe</h2>
              <Link to="/admin/reports" className="text-sm text-blue-600 hover:text-blue-800 flex items-center">
                Detalii <ArrowRight className="h-4 w-4 ml-1" />
              </Link>
            </div>
            
            <GroupOccupancyChart data={dashboardData?.groupOccupancy || []} />
          </div>
          
          {/* Grafic participare întâlniri */}
          <div className="bg-white p-5 rounded-xl shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-800">Participare la întâlniri</h2>
              <Link to="/admin/reports" className="text-sm text-blue-600 hover:text-blue-800 flex items-center">
                Detalii <ArrowRight className="h-4 w-4 ml-1" />
              </Link>
            </div>
            
            <ParticipationChart data={dashboardData?.meetingParticipation || []} />
          </div>
        </div>

        {/* Lista utilizatori - vizibilă doar pentru admini */}
        {currentUser && currentUser.role === 'admin' && (
          <div className="mb-6">
            <AllUsersPanel />
          </div>
        )}
        
        {/* Calendar întâlniri și panouri informații */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Calendar întâlniri */}
          <div id="schedule" className="lg:col-span-2 bg-white p-5 rounded-xl shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-800">Întâlniri programate</h2>
              <Link to="/admin/groups" className="text-sm text-blue-600 hover:text-blue-800 flex items-center">
                Toate grupele <ArrowRight className="h-4 w-4 ml-1" />
              </Link>
            </div>
            
            <UpcomingMeetingsCalendar meetings={dashboardData?.upcomingMeetings || []} />
          </div>
          
          {/* Panouri notificări și activități recente */}
          <div className="space-y-6">
            {/* Notificări */}
            <div className="bg-white p-5 rounded-xl shadow-sm">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-gray-800">Notificări</h2>
                <span className="flex justify-center items-center h-5 w-5 bg-red-500 text-white text-xs font-medium rounded-full">
                  {dashboardData?.notifications?.length || 0}
                </span>
              </div>
              
              <NotificationsPanel notifications={dashboardData?.notifications || []} />
            </div>
            
            {/* Activități recente */}
            <div className="bg-white p-5 rounded-xl shadow-sm">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-gray-800">Activități recente</h2>
                <Link to="/admin/reports" className="text-sm text-blue-600 hover:text-blue-800 flex items-center">
                  Toate <ArrowRight className="h-4 w-4 ml-1" />
                </Link>
              </div>
              
              <RecentActivitiesPanel activities={dashboardData?.recentActivities || []} />
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboardPage;