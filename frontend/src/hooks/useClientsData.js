import { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';

/**
 * Hook pentru gestionarea datelor clienților cu filtrare și paginare
 */
const useClientsData = () => {
  const [loading, setLoading] = useState(true);
  const [clients, setClients] = useState([]);
  const [error, setError] = useState(null);
  const [statsData, setStatsData] = useState(null);
  
  // Pagination and filtering
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [groupFilter, setGroupFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [availableGroups, setAvailableGroups] = useState([]);
  
  // Flag pentru a preveni cereri multiple
  const isInitialMount = useRef(true);
  const isFilterChange = useRef(false);

  // Încărcare grupuri disponibile pentru filtrare
  const fetchGroups = async () => {
    try {
      const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5003/api';
      const response = await axios.get(`${API_URL}/admin/groups?limit=100`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.data && response.data.success) {
        setAvailableGroups(response.data.data);
      }
    } catch (err) {
      console.error('Error loading groups:', err);
    }
  };

  // Încărcare date statistice
  const fetchStatistics = async () => {
    try {
      const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5003/api';
      
      const response = await axios.get(`${API_URL}/admin/clients/statistics`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.data && response.data.success) {
        setStatsData(response.data.data);
      }
    } catch (err) {
      console.error('Error loading client statistics:', err);
    }
  };

  // Încărcăm clienții cu paginare și filtre
  const fetchClients = useCallback(async () => {
    try {
      setLoading(true);
      const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5003/api';
      
      // Fetch clients
      let queryString = `?page=${page}&limit=${limit}`;
      if (searchTerm) queryString += `&search=${encodeURIComponent(searchTerm)}`;
      if (statusFilter) queryString += `&status=${encodeURIComponent(statusFilter)}`;
      if (groupFilter) queryString += `&group=${encodeURIComponent(groupFilter)}`;
      
      // Încercăm toate variantele posibile de parametri pentru filtrul de dată
      // pentru a vedea care funcționează
      if (dateFilter) {
        // Varianta 1: folosim parametrul 'date'
        queryString += `&date=${encodeURIComponent(dateFilter)}`;
        
        // Varianta 2: folosim parametrul 'dateFilter'
        queryString += `&dateFilter=${encodeURIComponent(dateFilter)}`;
        
        // Varianta 3: folosim parametrul 'registrationDate'
        queryString += `&registrationDate=${encodeURIComponent(dateFilter)}`;
        
        // Varianta 4: folosim parametrul 'dateRange'
        queryString += `&dateRange=${encodeURIComponent(dateFilter)}`;
      }
      
      console.log('Cerere API: ', `${API_URL}/admin/clients${queryString}`);
      
      const response = await axios.get(`${API_URL}/admin/clients${queryString}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.data && response.data.success) {
        console.log('Răspuns API:', response.data);
        
        const processedClients = response.data.data.map(client => {
          // Construiește un obiect groupInfo indiferent de forma datelor
          const hasGroup = client.group !== null && client.group !== undefined;
          const isGroupObject = hasGroup && typeof client.group === 'object' && client.group !== null;
          const isGroupId = hasGroup && typeof client.group === 'string';
        
          let groupInfo = {
            id: null,
            name: 'Nealocat'
          };
        
          // Dacă client.group este un obiect
          if (isGroupObject && client.group._id) {
            groupInfo = {
              id: client.group._id,
              name: client.group.name || 'Grupă 1'
            };
          }
          // Dacă client.group este un string (ID)
          else if (isGroupId) {
            const foundGroup = availableGroups.find(g => g._id === client.group);
            groupInfo = {
              id: client.group,
              name: foundGroup ? foundGroup.name : 'Grupă 1'
            };
          }
       
          return {
            ...client,
            groupInfo
          };
        });
        
        setClients(processedClients);
        setTotal(response.data.pagination.total);
        setTotalPages(response.data.pagination.pages);
      } else {
        throw new Error('Failed to load clients');
      }
    } catch (err) {
      console.error('Error loading clients:', err);
      setError('Nu s-au putut încărca datele clienților. Vă rugăm să încercați din nou.');
    } finally {
      setLoading(false);
      isFilterChange.current = false;
    }
  }, [page, limit, searchTerm, statusFilter, groupFilter, dateFilter, availableGroups]);

  // Resetarea filtrelor
  const resetFilters = () => {
    setStatusFilter('');
    setGroupFilter('');
    setDateFilter('');
    setSearchTerm('');
    setPage(1);
    isFilterChange.current = true;
  };

  // Effect pentru încărcarea inițială a datelor
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      fetchGroups();
      fetchClients();
      fetchStatistics();
    } else if (isFilterChange.current) {
      fetchClients();
    }
  }, [fetchClients, statusFilter, groupFilter, dateFilter, searchTerm, page]);

  // Exportăm toate staturile și funcțiile relevante
  return {
    loading,
    clients,
    error,
    statsData,
    page, 
    setPage: (newPage) => {
      setPage(newPage);
      isFilterChange.current = true;
    },
    limit,
    setLimit: (newLimit) => {
      setLimit(newLimit);
      isFilterChange.current = true;
    },
    total,
    totalPages,
    searchTerm,
    setSearchTerm: (term) => {
      setSearchTerm(term);
      // Nu marcăm ca schimbare de filtru aici, doar când se apasă butonul de căutare
    },
    statusFilter,
    setStatusFilter: (status) => {
      setStatusFilter(status);
      isFilterChange.current = true;
    },
    groupFilter, 
    setGroupFilter: (group) => {
      setGroupFilter(group);
      isFilterChange.current = true;
    },
    dateFilter,
    setDateFilter: (date) => {
      setDateFilter(date);
      isFilterChange.current = true;
    },
    availableGroups,
    fetchClients: () => {
      isFilterChange.current = true;
      fetchClients();
    },
    fetchStatistics,
    resetFilters
  };
};

export default useClientsData;