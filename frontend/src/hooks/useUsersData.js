import { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';

/**
 * Hook pentru gestionarea datelor utilizatorilor cu filtrare și paginare
 */
const useUsersData = () => {
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [error, setError] = useState(null);
  
  // Pagination and filtering
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [activeFilter, setActiveFilter] = useState('');
  const [organizationFilter, setOrganizationFilter] = useState('');
  
  // Flag pentru a preveni cereri multiple
  const isInitialMount = useRef(true);
  const isFilterChange = useRef(false);

  // Încărcăm utilizatorii cu paginare și filtre
  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5003/api';
      
      let queryString = `?page=${page}&limit=${limit}`;
      if (searchTerm) queryString += `&search=${encodeURIComponent(searchTerm)}`;
      if (roleFilter) queryString += `&role=${encodeURIComponent(roleFilter)}`;
      if (activeFilter) queryString += `&active=${encodeURIComponent(activeFilter)}`;
      if (organizationFilter) queryString += `&organization=${encodeURIComponent(organizationFilter)}`;
      
      const response = await axios.get(`${API_URL}/admin/users${queryString}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.data && response.data.success) {
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
  }, [page, limit, searchTerm, roleFilter, activeFilter, organizationFilter]);

  // Resetarea filtrelor
  const resetFilters = () => {
    setRoleFilter('');
    setActiveFilter('');
    setOrganizationFilter('');
    setSearchTerm('');
    setPage(1);
    isFilterChange.current = true;
  };

  // Effect pentru încărcarea inițială a datelor
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      fetchUsers();
    } else if (isFilterChange.current) {
      fetchUsers();
    }
  }, [fetchUsers, roleFilter, activeFilter, organizationFilter, searchTerm, page]);

  // Exportăm toate staturile și funcțiile relevante
  return {
    loading,
    users,
    error,
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
    organizationFilter,
    setOrganizationFilter: (org) => {
      setOrganizationFilter(org);
      isFilterChange.current = true;
    },
    fetchUsers: () => {
      isFilterChange.current = true;
      fetchUsers();
    },
    resetFilters
  };
};

export default useUsersData;