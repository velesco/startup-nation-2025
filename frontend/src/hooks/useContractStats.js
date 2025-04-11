import { useState, useEffect, useRef } from 'react';
import axios from 'axios';

/**
 * Funcție pentru obținerea numărului total de utilizatori
 */
const getTotalUsers = async () => {
  try {
    const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5003/api';
    
    const response = await axios.get(`${API_URL}/admin/users/statistics`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    });
    
    if (response.data && response.data.success) {
      return response.data.data.totalUsers || 0;
    }
    
    return 0;
  } catch (error) {
    console.error('Eroare la obținerea numărului total de utilizatori:', error);
    return 0;
  }
};

/**
 * Hook pentru obținerea statisticilor despre contracte, cu auto-reîmprospătare la fiecare 30 de secunde
 */
const useContractStats = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  
  // Folosim un ref pentru intervalul de actualizare
  const refreshIntervalRef = useRef(null);

  const fetchContractStats = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5003/api';
      
      const response = await axios.get(`${API_URL}/admin/contracts/counts`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.data && response.data.success) {
        // Adăugăm și informația despre numărul total de utilizatori pentru a calcula procentele
        const totalUsers = response.data.data.totalUsers || await getTotalUsers();
        
        setStats({
          ...response.data.data,
          totalUsers,
        });
        
        setLastUpdated(new Date());
        console.log('Statistici contracte încărcate:', response.data.data);
      } else {
        throw new Error('Nu s-au putut încărca statisticile contractelor');
      }
    } catch (err) {
      console.error('Error fetching contract statistics:', err);
      setError(err.response?.data?.message || 'Nu s-au putut încărca statisticile contractelor');
    } finally {
      setLoading(false);
    }
  };

  // Încarcă statisticile la primul render și setează intervalul de actualizare
  useEffect(() => {
    // Încarcă statisticile imediat
    fetchContractStats();
    
    // Configurăm intervalul pentru actualizare automată la fiecare 30 secunde
    refreshIntervalRef.current = setInterval(() => {
      console.log('Auto-actualizare statistici contracte...');
      fetchContractStats();
    }, 30000); // 30 secunde
    
    // Curățare la demontarea componentei
    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
    };
  }, []);

  return {
    loading,
    stats,
    error,
    lastUpdated,
    refreshStats: fetchContractStats
  };
};

export default useContractStats;