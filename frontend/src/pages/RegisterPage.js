import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { ChevronLeft, AlertCircle, CheckCircle, User, Building, Mail, Lock, Phone } from 'lucide-react';

const RegisterPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated, login } = useAuth();
  const location = useLocation();
  
  // Obținem parametrul de rol din URL
  const queryParams = new URLSearchParams(location.search);
  const roleFromUrl = queryParams.get('role') || '';
  
  // State-uri pentru formular
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    company: '',
    role: roleFromUrl === 'trainer' ? 'trainer' : roleFromUrl === 'partner' ? 'partner' : '',
    terms: false
  });
  
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [loading, setLoading] = useState(false);
  
  // Opțiuni de rol
  const roleOptions = [
    { id: 'trainer', label: 'Formator' },
    { id: 'partner', label: 'Partener' }
  ];
  
  // Verificăm dacă utilizatorul este deja autentificat
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);
  
  // Actualizăm state-ul formularului când se schimbă rolul în URL
  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      role: roleFromUrl === 'trainer' ? 'trainer' : roleFromUrl === 'partner' ? 'partner' : prev.role
    }));
  }, [roleFromUrl]);
  
  // Handler pentru modificări în formular
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };
  
  // Handler pentru selectarea rolului
  const handleRoleSelect = (role) => {
    setFormData(prev => ({ ...prev, role }));
  };
  
  // Handler pentru trimiterea formularului
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validare
    if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword || !formData.role) {
      setError('Toate câmpurile marcate cu * sunt obligatorii');
      return;
    }
    
    if (formData.password !== formData.confirmPassword) {
      setError('Parolele nu coincid');
      return;
    }
    
    if (!formData.terms) {
      setError('Trebuie să accepți termenii și condițiile');
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5003/api';
      
      const response = await axios.post(`${API_URL}/auth/register`, {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        phone: formData.phone,
        company: formData.company,
        role: formData.role
      });
      
      if (response.data && response.data.success) {
        // Get token and user data from response
        const { token, refreshToken, user } = response.data;
        
        // Call login function from AuthContext to set user as authenticated
        login(token, refreshToken, user);
        
        setSuccess('Înregistrare realizată cu succes! Te vom redirecționa către dashboard...');
        
        setTimeout(() => {
          navigate('/dashboard');
        }, 2000);
      } else {
        throw new Error(response.data?.message || 'Eroare la înregistrare');
      }
    } catch (err) {
      console.error('Registration error:', err);
      setError(err.response?.data?.message || 'A apărut o eroare. Vă rugăm să încercați din nou.');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Link to="/" className="flex items-center justify-center">
          <div className="h-12 w-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold text-xl">
            SN
          </div>
        </Link>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Înregistrare {formData.role === 'trainer' ? 'Formator' : formData.role === 'partner' ? 'Partener' : ''}
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Sau{' '}
          <Link to="/login" className="font-medium text-blue-600 hover:text-blue-500">
            conectează-te la contul tău existent
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {/* Mesaje de eroare/succes */}
          {error && (
            <div className="mb-4 bg-red-50 border-l-4 border-red-500 p-4">
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
          
          {success && (
            <div className="mb-4 bg-green-50 border-l-4 border-green-500 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                </div>
                <div className="ml-3">
                  <p className="text-sm text-green-700">{success}</p>
                </div>
              </div>
            </div>
          )}
          
          {/* Selectare rol (dacă nu este primit din URL) */}
          {!formData.role && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Selectează rolul tău *
              </label>
              <div className="grid grid-cols-2 gap-4">
                {roleOptions.map(option => (
                  <button
                    key={option.id}
                    type="button"
                    className={`border rounded-lg p-4 flex items-center justify-center focus:outline-none ${
                      formData.role === option.id
                        ? 'bg-blue-50 border-blue-500 text-blue-700'
                        : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                    onClick={() => handleRoleSelect(option.id)}
                  >
                    {option.id === 'trainer' ? (
                      <User className="h-5 w-5 mr-2" />
                    ) : (
                      <Building className="h-5 w-5 mr-2" />
                    )}
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          )}
          
          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Nume complet */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Nume complet *
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Nume și prenume"
                />
              </div>
            </div>
            
            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Adresă email *
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="email@example.com"
                />
              </div>
            </div>
            
            {/* Număr de telefon */}
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                Număr de telefon
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Phone className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  autoComplete="tel"
                  value={formData.phone}
                  onChange={handleChange}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="+40712345678"
                />
              </div>
            </div>
            
            {/* Companie/Organizație (doar pentru parteneri) */}
            {formData.role === 'partner' && (
              <div>
                <label htmlFor="company" className="block text-sm font-medium text-gray-700">
                  Companie/Organizație *
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Building className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="company"
                    name="company"
                    type="text"
                    required
                    value={formData.company}
                    onChange={handleChange}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="Denumirea companiei/organizației"
                  />
                </div>
              </div>
            )}
            
            {/* Parolă */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Parolă *
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
            </div>
            
            {/* Confirmare parolă */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                Confirmă parola *
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
            </div>
            
            {/* Termeni și condiții */}
            <div className="flex items-center">
              <input
                id="terms"
                name="terms"
                type="checkbox"
                checked={formData.terms}
                onChange={handleChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="terms" className="ml-2 block text-sm text-gray-900">
                Sunt de acord cu <a href="#" className="text-blue-600 hover:text-blue-500">Termenii și Condițiile</a> *
              </label>
            </div>
            
            {/* Buton de submit */}
            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Se procesează...' : 'Înregistrare'}
              </button>
            </div>
          </form>
          
          {/* Link către login */}
          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">
                  Ai deja cont?
                </span>
              </div>
            </div>
            
            <div className="mt-6">
              <Link
                to={`/login${formData.role ? `?role=${formData.role}` : ''}`}
                className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Conectează-te
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;