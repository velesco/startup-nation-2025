import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  BarChart2, 
  Calendar, 
  Users, 
  Download, 
  RefreshCw,
  Briefcase,
  AlertCircle,
  Filter,
  Clock
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import DashboardLayout from '../../components/layouts/DashboardLayout';
import LoadingScreen from '../../components/client/LoadingScreen';

// Import report components
import OverviewReport from '../../components/admin/reports/OverviewReport';
import GroupsReport from '../../components/admin/reports/GroupsReport';
import ParticipantsReport from '../../components/admin/reports/ParticipantsReport';
import MeetingsReport from '../../components/admin/reports/MeetingsReport';
import ActivitiesReport from '../../components/admin/reports/ActivitiesReport';

const ReportsPage = () => {
  const navigate = useNavigate();
  const { currentUser, isAuthenticated } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [reportsData, setReportsData] = useState(null);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  
  // Filtre pentru rapoarte
  const [filters, setFilters] = useState({
    dateRange: 'last30days',
    startDate: '',
    endDate: '',
    groupId: '',
    status: ''
  });
  
  // Date pentru filtre
  const [groups, setGroups] = useState([]);
  
  // Date de export
  const [exportFormat, setExportFormat] = useState('excel');
  const [exportLoading, setExportLoading] = useState(false);
  
  // Verificăm dacă utilizatorul este autentificat și are rolul potrivit
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    } else if (currentUser && currentUser.role !== 'admin' && currentUser.role !== 'partner') {
      navigate('/');
    }
  }, [isAuthenticated, currentUser, navigate]);
  
  // Inițializarea datelor pentru filtre
  useEffect(() => {
    const fetchFilterData = async () => {
      try {
        const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5003/api';
        
        // Încărcarea grupelor pentru filtru
        const groupsResponse = await axios.get(`${API_URL}/groups`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        
        if (groupsResponse.data && groupsResponse.data.success) {
          setGroups(groupsResponse.data.data || []);
        }
      } catch (err) {
        console.error('Error loading filter data:', err);
      }
    };
    
    if (isAuthenticated && currentUser) {
      fetchFilterData();
    }
  }, [isAuthenticated, currentUser]);
  
  // Încărcarea datelor pentru rapoarte
  const fetchReportsData = async () => {
    try {
      setLoading(true);
      const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5003/api';
      
      // Pregătim parametrii pentru filtre
      let params = {};
      
      if (filters.dateRange === 'custom' && filters.startDate && filters.endDate) {
        params.startDate = filters.startDate;
        params.endDate = filters.endDate;
      } else {
        params.dateRange = filters.dateRange;
      }
      
      if (filters.groupId) {
        params.groupId = filters.groupId;
      }
      
      if (filters.status) {
        params.status = filters.status;
      }
      
      // Încărcăm datele pentru rapoarte în funcție de tab-ul activ
      let endpoint = '/admin/reports/overview';
      
      if (activeTab === 'groups') {
        endpoint = '/admin/reports/groups';
      } else if (activeTab === 'participants') {
        endpoint = '/admin/reports/participants';
      } else if (activeTab === 'meetings') {
        endpoint = '/admin/reports/meetings';
      } else if (activeTab === 'activities') {
        endpoint = '/admin/reports/activities';
      }
      
      const response = await axios.get(`${API_URL}${endpoint}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        params
      });
      
      if (response.data && response.data.success) {
        setReportsData(response.data.data);
      } else {
        throw new Error(response.data?.message || 'Failed to load reports data');
      }
    } catch (err) {
      console.error('Error loading reports data:', err);
      setError('Nu s-au putut încărca datele pentru rapoarte. Vă rugăm să încercați din nou.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };
  
  // Încărcarea datelor la inițializare și când se schimbă filtrele sau tab-ul
  useEffect(() => {
    if (isAuthenticated && currentUser) {
      fetchReportsData();
    }
  }, [isAuthenticated, currentUser, activeTab, filters.dateRange, filters.groupId, filters.status]);
  
  // Handler pentru schimbarea filtrelor predefinite
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'dateRange' && value === 'custom') {
      // Setăm datele implicite pentru filtrul personalizat
      const today = new Date();
      const lastMonth = new Date();
      lastMonth.setMonth(lastMonth.getMonth() - 1);
      
      setFilters(prev => ({
        ...prev,
        dateRange: value,
        startDate: lastMonth.toISOString().split('T')[0],
        endDate: today.toISOString().split('T')[0]
      }));
    } else {
      setFilters(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };
  
  // Handler pentru schimbarea datelor în filtrul personalizat
  const handleDateChange = (e) => {
    const { name, value } = e.target;
    
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Handler pentru exportul datelor
  const handleExport = async () => {
    try {
      setExportLoading(true);
      const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5003/api';
      
      // Pregătim parametrii pentru filtre
      let params = {
        format: exportFormat
      };
      
      if (filters.dateRange === 'custom' && filters.startDate && filters.endDate) {
        params.startDate = filters.startDate;
        params.endDate = filters.endDate;
      } else {
        params.dateRange = filters.dateRange;
      }
      
      if (filters.groupId) {
        params.groupId = filters.groupId;
      }
      
      if (filters.status) {
        params.status = filters.status;
      }
      
      // Endpoint pentru export în funcție de tab-ul activ
      let endpoint = '/admin/reports/export/overview';
      
      if (activeTab === 'groups') {
        endpoint = '/admin/reports/export/groups';
      } else if (activeTab === 'participants') {
        endpoint = '/admin/reports/export/participants';
      } else if (activeTab === 'meetings') {
        endpoint = '/admin/reports/export/meetings';
      } else if (activeTab === 'activities') {
        endpoint = '/admin/reports/export/activities';
      }
      
      const response = await axios.get(`${API_URL}${endpoint}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        params,
        responseType: 'blob'
      });
      
      // Creăm un URL pentru blob și descărcăm fișierul
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `report-${activeTab}-${new Date().toISOString().split('T')[0]}.${exportFormat === 'excel' ? 'xlsx' : 'csv'}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error('Error exporting data:', err);
      setError('Nu s-au putut exporta datele. Vă rugăm să încercați din nou.');
    } finally {
      setExportLoading(false);
    }
  };
  
  // Handler pentru reîncărcarea datelor
  const refreshData = () => {
    setRefreshing(true);
    fetchReportsData();
  };
  
  if (loading && !reportsData) {
    return <LoadingScreen />;
  }
  
  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex flex-wrap justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Rapoarte și statistici</h1>
            <p className="text-gray-500">Analiză detaliată a performanței</p>
          </div>
          
          <div className="flex space-x-3 mt-4 sm:mt-0">
            <button
              className="flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              onClick={refreshData}
              disabled={refreshing}
            >
              {refreshing ? (
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4 mr-2" />
              )}
              Actualizează
            </button>
            
            <div className="relative">
              <select
                className="pl-10 pr-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors appearance-none"
                value={exportFormat}
                onChange={(e) => setExportFormat(e.target.value)}
              >
                <option value="excel">Excel</option>
                <option value="csv">CSV</option>
              </select>
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Download className="h-4 w-4 text-gray-400" />
              </div>
            </div>
            
            <button
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
              onClick={handleExport}
              disabled={exportLoading}
            >
              {exportLoading ? (
                <>
                  <span className="mr-2">Se exportă...</span>
                  <div className="animate-spin h-4 w-4 border-2 border-white border-opacity-50 border-t-transparent rounded-full"></div>
                </>
              ) : (
                <>Exportă raport</>
              )}
            </button>
          </div>
        </div>
        
        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <AlertCircle className="h-5 w-5 text-red-500" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}
        
        {/* Filtre */}
        <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
          <div className="flex items-center mb-4">
            <Filter className="h-5 w-5 text-gray-400 mr-2" />
            <h2 className="text-lg font-semibold text-gray-800">Filtre</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Perioadă
              </label>
              <select
                name="dateRange"
                value={filters.dateRange}
                onChange={handleFilterChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="last7days">Ultimele 7 zile</option>
                <option value="last30days">Ultimele 30 zile</option>
                <option value="last90days">Ultimele 90 zile</option>
                <option value="thisYear">Anul curent</option>
                <option value="custom">Perioadă personalizată</option>
              </select>
            </div>
            
            {filters.dateRange === 'custom' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Data de început
                  </label>
                  <input
                    type="date"
                    name="startDate"
                    value={filters.startDate}
                    onChange={handleDateChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Data de sfârșit
                  </label>
                  <input
                    type="date"
                    name="endDate"
                    value={filters.endDate}
                    onChange={handleDateChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </>
            )}
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Grupă
              </label>
              <select
                name="groupId"
                value={filters.groupId}
                onChange={handleFilterChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Toate grupele</option>
                {groups.map(group => (
                  <option key={group._id} value={group._id}>
                    {group.name}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                name="status"
                value={filters.status}
                onChange={handleFilterChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Toate statusurile</option>
                <option value="Active">Active</option>
                <option value="Completed">Finalizate</option>
                <option value="Planned">Planificate</option>
                <option value="Cancelled">Anulate</option>
              </select>
            </div>
          </div>
        </div>
        
        {/* Tab-uri pentru navigare */}
        <div className="mb-6 border-b">
          <nav className="flex space-x-8 overflow-x-auto" aria-label="Tabs">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-1 py-4 text-sm font-medium border-b-2 whitespace-nowrap ${
                activeTab === 'overview'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center">
                <BarChart2 className="h-5 w-5 mr-2" />
                Prezentare generală
              </div>
            </button>
            
            <button
              onClick={() => setActiveTab('groups')}
              className={`px-1 py-4 text-sm font-medium border-b-2 whitespace-nowrap ${
                activeTab === 'groups'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center">
                <Briefcase className="h-5 w-5 mr-2" />
                Raport grupe
              </div>
            </button>
            
            <button
              onClick={() => setActiveTab('participants')}
              className={`px-1 py-4 text-sm font-medium border-b-2 whitespace-nowrap ${
                activeTab === 'participants'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center">
                <Users className="h-5 w-5 mr-2" />
                Raport participanți
              </div>
            </button>
            
            <button
              onClick={() => setActiveTab('meetings')}
              className={`px-1 py-4 text-sm font-medium border-b-2 whitespace-nowrap ${
                activeTab === 'meetings'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center">
                <Calendar className="h-5 w-5 mr-2" />
                Raport întâlniri
              </div>
            </button>
            
            <button
              onClick={() => setActiveTab('activities')}
              className={`px-1 py-4 text-sm font-medium border-b-2 whitespace-nowrap ${
                activeTab === 'activities'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center">
                <Clock className="h-5 w-5 mr-2" />
                Raport activități
              </div>
            </button>
          </nav>
        </div>
        
        {/* Conținut tab-uri */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          {activeTab === 'overview' && <OverviewReport data={reportsData} />}
          {activeTab === 'groups' && <GroupsReport data={reportsData} />}
          {activeTab === 'participants' && <ParticipantsReport data={reportsData} />}
          {activeTab === 'meetings' && <MeetingsReport data={reportsData} />}
          {activeTab === 'activities' && <ActivitiesReport data={reportsData} />}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ReportsPage;