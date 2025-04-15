import { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';

/**
 * Hook pentru gestionarea datelor utilizatorilor cu filtrare și paginare
 */
const useUsersData = () => {
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [error, setError] = useState(null);
  const [statsData, setStatsData] = useState(null);
  
  // Pagination and filtering
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [activeFilter, setActiveFilter] = useState('');
  
  // Flag pentru a preveni cereri multiple
  const isInitialMount = useRef(true);
  const isFilterChange = useRef(false);

  // Încărcare date statistice
  const fetchStatistics = async () => {
    try {
      const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5002/api';
      
      console.log('Solicită statistici de la API...');
      const response = await axios.get(`${API_URL}/admin/users/statistics`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.data && response.data.success) {
        console.log('Răspuns statistici API:', response.data);
        setStatsData(response.data.data || {});
      }
    } catch (err) {
      console.error('Error loading user statistics:', err);
    }
  };

  // Încărcăm utilizatorii cu paginare și filtre
  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5002/api';
      
      // Fetch users
      let queryString = `?page=${page}&limit=${limit}`;
      if (searchTerm) queryString += `&search=${encodeURIComponent(searchTerm)}`;
      if (roleFilter) queryString += `&role=${encodeURIComponent(roleFilter)}`;
      if (activeFilter) queryString += `&isActive=${encodeURIComponent(activeFilter)}`;
      
      console.log('Cerere API: ', `${API_URL}/admin/users${queryString}`);
      
      const response = await axios.get(`${API_URL}/admin/users${queryString}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.data && response.data.success) {
        console.log('Răspuns API:', response.data);
        
        setUsers(response.data.data);
        setTotal(response.data.pagination.total);
        setTotalPages(response.data.pagination.pages);
      } else {
        throw new Error('Failed to load users');
      }
    } catch (err) {
      console.error('Error loading users:', err);
      setError('Nu s-au putut încărca datele utilizatorilor. Vă rugăm să încercați din nou.');
    } finally {
      setLoading(false);
      isFilterChange.current = false;
    }
  }, [page, limit, searchTerm, roleFilter, activeFilter]);

  // Resetarea filtrelor
  const resetFilters = () => {
    setRoleFilter('');
    setActiveFilter('');
    setSearchTerm('');
    setPage(1);
    isFilterChange.current = true;
  };

  // Effect pentru încărcarea inițială a datelor
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      fetchUsers();
      fetchStatistics();
    } else if (isFilterChange.current) {
      fetchUsers();
    }
  }, [fetchUsers, roleFilter, activeFilter, searchTerm, page]);
  
  // Effect pentru actualizarea statisticilor când utilizatorii se schimbă
  useEffect(() => {
    if (!isInitialMount.current) {
      // Reîmprospătăm statisticile când numărul de utilizatori se schimbă
      fetchStatistics();
    }
  }, [total]);

  // Exportăm toate staturile și funcțiile relevante
  return {
    loading,
    users,
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
    roleFilter,
    setRoleFilter: (role) => {
      setRoleFilter(role);
      isFilterChange.current = true;
    },
    activeFilter, 
    setActiveFilter: (active) => {
      setActiveFilter(active);
      isFilterChange.current = true;
    },
    fetchUsers: () => {
      isFilterChange.current = true;
      fetchUsers();
    },
    fetchStatistics,
    resetFilters
  };
};

export default useUsersData;