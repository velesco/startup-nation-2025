import axios from 'axios';

// API base URL
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add authorization header before each request if token exists
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle response errors and token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // Prevent infinite loops - if we've already tried to refresh
    if (error.response?.status === 401 && 
        !originalRequest._retry && 
        error.response?.data?.message?.includes('expired')) {
      originalRequest._retry = true;
      
      try {
        const refreshToken = localStorage.getItem('refreshToken');
        
        if (!refreshToken) {
          // Force logout
          localStorage.removeItem('token');
          localStorage.removeItem('refreshToken');
          window.location.href = '/login?expired=true';
          return Promise.reject(error);
        }
        
        // Use a new axios instance to avoid interceptors loop
        const response = await axios.post(`${API_URL}/auth/refresh-token`, { refreshToken });
        
        if (!response.data || !response.data.success) {
          throw new Error('Token refresh failed');
        }
        
        // Store new token
        const { token } = response.data;
        localStorage.setItem('token', token);
        
        // Update authorization header and retry
        originalRequest.headers['Authorization'] = `Bearer ${token}`;
        return api(originalRequest);
      } catch (refreshError) {
        // Failed to refresh token - logout
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        
        // Redirect to login with expired=true param
        window.location.href = '/login?expired=true';
        return Promise.reject(refreshError);
      }
    }
    
    // For other errors, just pass them through
    return Promise.reject(error);
  }
);

// API wrapper functions
const apiService = {
  // Authentication requests
  auth: {
    login: (credentials) => api.post('/auth/login', credentials),
    register: (userData) => api.post('/auth/register', userData),
    logout: () => api.get('/auth/logout'),
    getProfile: () => api.get('/auth/me'),
    updateProfile: (userData) => api.put('/auth/update-details', userData),
    updatePassword: (passwords) => api.put('/auth/update-password', passwords),
    forgotPassword: (email) => api.post('/password/forgot-password', email),
    verifyResetToken: (token, email) => api.post('/password/verify-reset-token', { token, email }),
    resetPassword: (token, email, password) => api.post('/password/reset-password', { token, email, password }),
    updateIdCard: (idCardData) => api.put('/auth/update-id-card', idCardData),
    checkEmail: (email) => api.post('/auth/check-email', { email })
  },
  
  // User requests
  users: {
    getAll: (params) => api.get('/users', { params }),
    getById: (id) => api.get(`/users/${id}`),
    create: (userData) => api.post('/users', userData),
    update: (id, userData) => api.put(`/users/${id}`, userData),
    delete: (id) => api.delete(`/users/${id}`),
    updateRole: (id, role) => api.put(`/users/${id}/role`, { role })
  },
  
  // Client requests
  clients: {
    getAll: (params) => api.get('/clients', { params }),
    getById: (id) => api.get(`/clients/${id}`),
    create: (clientData) => api.post('/clients', clientData),
    update: (id, clientData) => api.put(`/clients/${id}`, clientData),
    delete: (id) => api.delete(`/clients/${id}`),
    getDocuments: (id) => api.get(`/clients/${id}/documents`),
    addDocument: (id, document) => {
      const formData = new FormData();
      formData.append('file', document.file);
      formData.append('type', document.type);
      formData.append('description', document.description || '');
      
      return api.post(`/clients/${id}/documents`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
    },
    deleteDocument: (clientId, documentId) => api.delete(`/clients/${clientId}/documents/${documentId}`),
    getNotes: (id) => api.get(`/clients/${id}/notes`),
    addNote: (id, note) => api.post(`/clients/${id}/notes`, note),
    deleteNote: (clientId, noteId) => api.delete(`/clients/${clientId}/notes/${noteId}`)
  },
  
  // Group requests
  groups: {
    getAll: (params) => api.get('/groups', { params }),
    getById: (id) => api.get(`/groups/${id}`),
    create: (groupData) => api.post('/groups', groupData),
    update: (id, groupData) => api.put(`/groups/${id}`, groupData),
    delete: (id) => api.delete(`/groups/${id}`),
    addClient: (id, clientId) => api.post(`/groups/${id}/clients`, { clientId }),
    removeClient: (id, clientId) => api.delete(`/groups/${id}/clients/${clientId}`),
    getMeetings: (id) => api.get(`/groups/${id}/meetings`),
    addMeeting: (id, meetingData) => api.post(`/groups/${id}/meetings`, meetingData),
    updateMeeting: (groupId, meetingId, meetingData) => api.put(`/groups/${groupId}/meetings/${meetingId}`, meetingData),
    deleteMeeting: (groupId, meetingId) => api.delete(`/groups/${groupId}/meetings/${meetingId}`)
  },
  
  // Document requests
  documents: {
    getAll: (params) => api.get('/documents', { params }),
    getById: (id) => api.get(`/documents/${id}`),
    download: (id) => api.get(`/documents/${id}/download`, { responseType: 'blob' }),
    delete: (id) => api.delete(`/documents/${id}`)
  },
  
  // Meeting requests
  meetings: {
    getAll: (params) => api.get('/meetings', { params }),
    getById: (id) => api.get(`/meetings/${id}`),
    create: (meetingData) => api.post('/meetings', meetingData),
    update: (id, meetingData) => api.put(`/meetings/${id}`, meetingData),
    delete: (id) => api.delete(`/meetings/${id}`),
    getParticipants: (id) => api.get(`/meetings/${id}/participants`),
    addParticipant: (id, userId) => api.post(`/meetings/${id}/participants`, { userId }),
    removeParticipant: (id, userId) => api.delete(`/meetings/${id}/participants/${userId}`)
  },
  
  // Notification requests
  notifications: {
    getAll: () => api.get('/notifications'),
    markAsRead: (id) => api.put(`/notifications/${id}/read`),
    markAllAsRead: () => api.put('/notifications/read-all'),
    delete: (id) => api.delete(`/notifications/${id}`)
  },
  
  // Activity requests
  activities: {
    getRecent: (limit = 10) => api.get('/activities/recent', { params: { limit } }),
    getForResource: (modelType, modelId) => api.get(`/activities/resource/${modelType}/${modelId}`),
    getStats: () => api.get('/activities/stats')
  },
  
  // Contract requests
  contracts: {
    generate: (clientId, templateId) => api.post('/contracts/generate', { clientId, templateId }),
    sign: (id, signature) => api.post(`/contracts/${id}/sign`, signature),
    download: (id) => api.get(`/contracts/${id}/download`, { responseType: 'blob' })
  },
  
  // Admin requests
  admin: {
    getStats: () => api.get('/admin/stats'),
    getSystemHealth: () => api.get('/admin/health'),
    getBackups: () => api.get('/admin/backups'),
    createBackup: () => api.post('/admin/backups'),
    restoreBackup: (filename) => api.post('/admin/backups/restore', { filename }),
    getLogs: (params) => api.get('/admin/logs', { params })
  },

  // User requests
  users: {
    getProfile: () => api.get('/users/profile'),
    updateProfile: (data) => api.put('/users/profile', data),
    uploadProfilePicture: (formData) => api.post('/users/profile-picture', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),
    changePassword: (data) => api.put('/users/password', data),
    uploadIDCard: (formData) => api.post('/users/id-card', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),
    extractIDCardData: () => api.post('/users/id-card/extract')
  }
};

export default apiService;
