import { useState, useEffect } from 'react';
import axios from 'axios';

/**
 * Hook pentru obținerea statisticilor utilizatorilor
 */
const useUserStatistics = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [error, setError] = useState(null);

  const fetchStatistics = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5003/api';
      
      const response = await axios.get(`${API_URL}/admin/users/statistics`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.data && response.data.success) {
        setStats(response.data.data);
      } else {
        throw new Error('Nu s-au putut încărca statisticile utilizatorilor');
      }
    } catch (err) {
      console.error('Error fetching user statistics:', err);
      setError(err.response?.data?.message || 'Nu s-au putut încărca statisticile utilizatorilor');
    } finally {
      setLoading(false);
    }
  };

  // Încarcă statisticile la primul render
  useEffect(() => {
    fetchStatistics();
  }, []);

  return {
    loading,
    stats,
    error,
    refreshStatistics: fetchStatistics
  };
};

export default useUserStatistics;