import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import jwt_decode from 'jwt-decode';

// Create context
const AuthContext = createContext();

// API URL
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5003/api';

// Context provider component
export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Setup axios interceptor for token refresh
  useEffect(() => {
    const setupAxiosInterceptors = () => {
      // Response interceptor for handling token expiration
      axios.interceptors.response.use(
        (response) => response,
        async (error) => {
          const originalRequest = error.config;
          
          // If error is 401 and we haven't already tried to refresh the token
          if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            
            try {
              const refreshToken = localStorage.getItem('refreshToken');
              
              if (!refreshToken) {
                // No refresh token, force logout
                logout();
                return Promise.reject(error);
              }
              
              // Call refresh token API
              const response = await axios.post(`${API_URL}/auth/refresh-token`, { refreshToken });
              
              // Store new token
              const { token } = response.data;
              localStorage.setItem('token', token);
              
              // Update authorization header
              axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
              originalRequest.headers['Authorization'] = `Bearer ${token}`;
              
              // Retry the original request
              return axios(originalRequest);
            } catch (refreshError) {
              // Refresh token failed, force logout
              logout();
              return Promise.reject(refreshError);
            }
          }
          
          return Promise.reject(error);
        }
      );
    };
    
    setupAxiosInterceptors();
  }, []);

  // Check if token exists and is valid on initial load
  useEffect(() => {
    const checkAuth = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        
        if (!token) {
          // Nu există token, utilizatorul nu este autentificat
          setCurrentUser(null);
          setIsAuthenticated(false);
          setLoading(false);
          return;
        }
        
        // Check if token is expired
        const decodedToken = jwt_decode(token);
        const currentTime = Date.now() / 1000;
        
        if (decodedToken.exp < currentTime) {
          // Token-ul a expirat, încercăm să folosim refresh token
          const refreshToken = localStorage.getItem('refreshToken');
          
          if (!refreshToken) {
            // Dacă nu avem nici refresh token, delogare
            logout();
            setLoading(false);
            return;
          }
          
          try {
            // Apelarea API pentru reînnoirea token-ului
            const response = await axios.post(`${API_URL}/auth/refresh-token`, { refreshToken });
            
            // Salvarea noului token
            const { token: newToken } = response.data;
            localStorage.setItem('token', newToken);
            
            // Setarea header-ului de autorizare pentru toate cererile
            axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
          } catch (refreshError) {
            // Eroare la reînnoirea token-ului, delogare
            console.error('Refresh token failed:', refreshError);
            logout();
            setLoading(false);
            return;
          }
        } else {
          // Token-ul este valid, setăm header-ul de autorizare
          axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        }
        
        // Obținerea datelor utilizatorului curent
        try {
          const response = await axios.get(`${API_URL}/auth/me`);
          setCurrentUser(response.data.data);
          setIsAuthenticated(true);
        } catch (userError) {
          console.error('Error getting user data:', userError);
          // Eroare la obținerea datelor utilizatorului, delogare
          logout();
        }
      } catch (error) {
        console.error('Authentication error:', error);
        // Eroare generală, setăm utilizatorul ca neautentificat
        setCurrentUser(null);
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };
    
    checkAuth();
  }, []);

  // Login function - supports both credential login and token-based login
  const login = async (emailOrToken, passwordOrRefreshToken, userData) => {
    try {
      setError(null);
      
      // Case 1: We already have user data and tokens (e.g., after registration)
      if (userData) {
        const token = emailOrToken;
        const refreshToken = passwordOrRefreshToken;
        
        // Save tokens to localStorage
        localStorage.setItem('token', token);
        localStorage.setItem('refreshToken', refreshToken);
        
        // Set auth header for all requests
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        
        // Update state
        setCurrentUser(userData);
        setIsAuthenticated(true);
        
        return userData;
      }
      
      // Case 2: Regular login with email and password
      console.log('Attemping login for email:', emailOrToken);
      
      // Call login API
      const response = await axios.post(`${API_URL}/auth/login`, { 
        email: emailOrToken, 
        password: passwordOrRefreshToken 
      });
      
      if (!response.data || !response.data.success) {
        throw new Error(response.data?.message || 'Autentificare eșuată');
      }
      
      const { token, refreshToken, user } = response.data;
      console.log('Login successful, received token');
      
      // Save tokens to localStorage
      localStorage.setItem('token', token);
      localStorage.setItem('refreshToken', refreshToken);
      
      // Set auth header for all requests
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      // Update state
      setCurrentUser(user);
      setIsAuthenticated(true);
      
      return user;
    } catch (error) {
      console.error('Eroare de autentificare:', error);
      setError(error.response?.data?.message || 'Autentificare eșuată. Verifică datele introduse.');
      throw error;
    }
  };

  // Logout function
  const logout = async () => {
    try {
      const token = localStorage.getItem('token');
      
      if (token) {
        // Set auth header for logout request
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        
        // Call logout API (best effort)
        try {
          await axios.get(`${API_URL}/auth/logout`);
        } catch (logoutError) {
          console.error('Logout API error:', logoutError);
          // Continue with local logout even if API fails
        }
      }
    } finally {
      // Remove tokens from localStorage
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      
      // Remove auth header
      delete axios.defaults.headers.common['Authorization'];
      
      setCurrentUser(null);
      setIsAuthenticated(false);
      setError(null);
    }
  };

  // Register function
  const register = async (userData) => {
    try {
      setError(null);
      
      // Call register API
      const response = await axios.post(`${API_URL}/auth/register`, userData);
      
      if (!response.data || !response.data.success) {
        throw new Error(response.data?.message || 'Înregistrare eșuată');
      }
      
      // Obținem token-urile și datele utilizatorului
      const { token, refreshToken, user } = response.data;
      
      // Salvăm token-urile în localStorage
      localStorage.setItem('token', token);
      localStorage.setItem('refreshToken', refreshToken);
      
      // Setăm header-ul de autorizare pentru toate cererile
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      // Actualizăm starea utilizatorului
      setCurrentUser(user);
      setIsAuthenticated(true);
      
      return response.data;
    } catch (error) {
      console.error('Eroare la înregistrare:', error);
      setError(error.response?.data?.message || 'Înregistrare eșuată');
      throw error;
    }
  };

  // Update user details
  const updateProfile = async (userData) => {
    try {
      setError(null);
      
      // Call update details API
      const response = await axios.put(`${API_URL}/auth/update-details`, userData);
      
      // Update current user in state
      setCurrentUser(response.data.data);
      
      return response.data;
    } catch (error) {
      setError(error.response?.data?.message || 'Actualizare profil eșuată');
      throw error;
    }
  };

  // Update password
  const updatePassword = async (currentPassword, newPassword) => {
    try {
      setError(null);
      
      // Call update password API
      const response = await axios.put(`${API_URL}/auth/update-password`, {
        currentPassword,
        newPassword
      });
      
      return response.data;
    } catch (error) {
      setError(error.response?.data?.message || 'Actualizare parolă eșuată');
      throw error;
    }
  };

  // Forgot password
  const forgotPassword = async (email) => {
    try {
      setError(null);
      
      // Call forgot password API
      const response = await axios.post(`${API_URL}/auth/forgot-password`, { email });
      
      return response.data;
    } catch (error) {
      setError(error.response?.data?.message || 'Resetare parolă eșuată');
      throw error;
    }
  };

  // Reset password
  const resetPassword = async (resetToken, password) => {
    try {
      setError(null);
      
      // Call reset password API
      const response = await axios.put(
        `${API_URL}/auth/reset-password/${resetToken}`,
        { password }
      );
      
      return response.data;
    } catch (error) {
      setError(error.response?.data?.message || 'Resetare parolă eșuată');
      throw error;
    }
  };



  // Context value
  const value = {
    currentUser,
    isAuthenticated,
    loading,
    error,
    login,
    logout,
    register,
    updateProfile,
    updatePassword,
    forgotPassword,
    resetPassword
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};