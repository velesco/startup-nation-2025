import React, { useState, useEffect } from 'react';
import { useFormik } from 'formik';
import * as yup from 'yup';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

// Validation schema for password
const validationSchema = yup.object({
  password: yup
    .string()
    .min(8, 'Parola trebuie să aibă cel puțin 8 caractere')
    .matches(/\d/, 'Parola trebuie să conțină cel puțin un număr')
    .required('Parola este obligatorie'),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref('password'), null], 'Parolele nu coincid')
    .required('Confirmarea parolei este obligatorie')
});

const SetPasswordPage = () => {
  const [submitLoading, setSubmitLoading] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [pendingUser, setPendingUser] = useState(null);
  const [pageLoading, setPageLoading] = useState(true);
  const navigate = useNavigate();
  const { login, setDemoMode } = useAuth();

  // Check if there is a pending registration
  useEffect(() => {
    const pendingRegistration = localStorage.getItem('pendingRegistration');
    
    if (!pendingRegistration) {
      navigate('/');
      return;
    }
    
    try {
      const parsedData = JSON.parse(pendingRegistration);
      
      // Check if registration is still valid (within 30 minutes)
      const registrationTime = new Date(parsedData.timestamp);
      const currentTime = new Date();
      const timeDifference = currentTime - registrationTime;
      const thirtyMinutesInMs = 30 * 60 * 1000;
      
      if (timeDifference > thirtyMinutesInMs) {
        // Registration expired
        localStorage.removeItem('pendingRegistration');
        navigate('/');
        return;
      }
      
      setPendingUser(parsedData);
      setPageLoading(false);
    } catch (error) {
      console.error('Error parsing pending registration:', error);
      localStorage.removeItem('pendingRegistration');
      navigate('/');
    }
  }, [navigate]);

  // Form handling
  const formik = useFormik({
    initialValues: {
      password: '',
      confirmPassword: ''
    },
    validationSchema: validationSchema,
    onSubmit: async (values) => {
      try {
        setSubmitLoading(true);
        setSubmitError('');
        
        if (!pendingUser) {
          throw new Error('Nu există un utilizator în așteptare');
        }
        
        // Pentru demo - în loc să înregistrăm utilizatorul la server, 
        // vom simula un răspuns de succes
        try {
          // In implementarea reală, vom face aici un apel API pentru înregistrare
          // const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5003/api';
          // await axios.post(`${API_URL}/auth/register`, userData);
          
          // Pentru demo, simulăm un delay
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          // În mod normal, am primi eroarea "User with this email already exists" de la server
          // Pentru demo, ignorăm această eroare și continuăm
          
          // Registration successful, clear pending data
          localStorage.removeItem('pendingRegistration');
          
          // Pentru demo, setăm modul demo pentru client
          setDemoMode(true, 'client');
          
          // Redirecționare către dashboard-ul de client
          navigate('/client/dashboard');
        } catch (error) {
          // În implementarea reală, am gestiona erorile de la server
          // Pentru demo, ignorăm eroarea și continuăm
          console.log('Simulare înregistrare pentru demo - ignorăm erorile');
          
          // Registration successful, clear pending data
          localStorage.removeItem('pendingRegistration');
          
          // Pentru demo, setăm modul demo pentru client
          setDemoMode(true, 'client');
          
          // Redirecționare către dashboard-ul de client
          navigate('/client/dashboard');
        }
      } catch (error) {
        console.error('Error in form submission:', error);
        setSubmitError(error.message || 'A apărut o eroare la crearea contului');
        setSubmitLoading(false);
      }
    }
  });

  if (pageLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex flex-col items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-600"></div>
        <p className="mt-4 text-gray-600">Se încarcă...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex flex-col items-center justify-center relative py-12 px-4 sm:px-6 lg:px-8">
      {/* Decorative Background Elements */}
      <div className="decoration-blob w-96 h-96 bg-blue-400 top-0 right-0"></div>
      <div className="decoration-blob w-96 h-96 bg-purple-400 bottom-0 left-0"></div>
      
      <div className="max-w-md w-full space-y-8 relative z-10">
        <div className="text-center">
          <div className="flex justify-center">
            <div className="h-16 w-16 bg-gradient-blue-purple rounded-xl flex items-center justify-center text-white font-bold text-2xl shadow-md">
              SN
            </div>
          </div>
          <h1 className="mt-6 text-3xl font-bold text-gray-800">Setează-ți parola</h1>
          <p className="mt-2 text-sm text-gray-600">
            Bine ai venit, {pendingUser.name}! Pentru a finaliza crearea contului, te rugăm să setezi o parolă sigură.
          </p>
        </div>
        
        <div className="glassmorphism rounded-2xl p-8 shadow-md">
          <form className="space-y-6" onSubmit={formik.handleSubmit}>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Parolă
              </label>
              <input
                id="password"
                name="password"
                type="password"
                placeholder="••••••••"
                className={`w-full px-4 py-3 rounded-xl border ${
                  formik.touched.password && formik.errors.password 
                    ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                    : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                } shadow-sm focus:outline-none focus:ring-2 transition-all`}
                value={formik.values.password}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                disabled={submitLoading}
              />
              {formik.touched.password && formik.errors.password && (
                <p className="mt-1 text-sm text-red-600">{formik.errors.password}</p>
              )}
            </div>
            
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                Confirmă parola
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                placeholder="••••••••"
                className={`w-full px-4 py-3 rounded-xl border ${
                  formik.touched.confirmPassword && formik.errors.confirmPassword 
                    ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                    : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                } shadow-sm focus:outline-none focus:ring-2 transition-all`}
                value={formik.values.confirmPassword}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                disabled={submitLoading}
              />
              {formik.touched.confirmPassword && formik.errors.confirmPassword && (
                <p className="mt-1 text-sm text-red-600">{formik.errors.confirmPassword}</p>
              )}
            </div>
            
            {submitError && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                {submitError}
              </div>
            )}
            
            <div>
              <button
                type="submit"
                disabled={submitLoading}
                className="w-full bg-gradient-blue-purple text-white px-6 py-3 rounded-xl font-medium shadow-md hover:opacity-90 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                {submitLoading ? (
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                ) : (
                  'Creează cont'
                )}
              </button>
            </div>
            
            <div className="text-center mt-4">
              <RouterLink to="/" className="text-sm text-gray-600 hover:text-blue-600 flex items-center justify-center transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
                </svg>
                Înapoi la pagina principală
              </RouterLink>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SetPasswordPage;