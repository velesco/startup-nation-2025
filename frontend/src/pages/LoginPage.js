import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link as RouterLink } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useFormik } from 'formik';
import * as yup from 'yup';

// Validation schema
const validationSchema = yup.object({
  email: yup
    .string()
    .email('Introduceți o adresă de email validă')
    .required('Email-ul este obligatoriu'),
  password: yup
    .string()
    .required('Parola este obligatorie')
});

const LoginPage = () => {
  const { login, error } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [redirectMessage, setRedirectMessage] = useState('');

  // Obținem parametrul de rol din URL
  const queryParams = new URLSearchParams(location.search);
  const roleFromUrl = queryParams.get('role') || '';

  // Verifică dacă avem un email salvat din redirecționarea anterioară
  useEffect(() => {
    const savedEmail = sessionStorage.getItem('loginEmail');
    if (savedEmail) {
      formik.setFieldValue('email', savedEmail);
      setRedirectMessage('Acest email există deja în baza noastră de date. Te rugăm să te autentifici.');
      // Ștergem email-ul din sessionStorage după ce l-am folosit
      sessionStorage.removeItem('loginEmail');
    }
  }, []);

  // Form handling
  const formik = useFormik({
    initialValues: {
      email: '',
      password: ''
    },
    validationSchema: validationSchema,
    onSubmit: async (values) => {
      try {
        setLoading(true);
        const user = await login(values.email, values.password);
        
        // Redirecționare în funcție de rolul utilizatorului
        if (user.role === 'client' || user.role === 'user') {
          navigate('/client/dashboard', { replace: true });
        } else {
          navigate('/dashboard', { replace: true });
        }
      } catch (error) {
        // Error is handled by auth context
        console.error('Login error:', error);
      } finally {
        setLoading(false);
      }
    }
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex flex-col items-center justify-center relative py-12 px-4 sm:px-6 lg:px-8">
      {/* Decorative Background Elements */}
      <div className="decoration-blob w-96 h-96 bg-blue-400 top-0 right-0"></div>
      <div className="decoration-blob w-96 h-96 bg-purple-400 bottom-0 left-0"></div>
      
      <div className="max-w-md w-full space-y-8 relative z-10">
        <div className="text-center">
          <div className="flex justify-center">
            <div className="h-20 w-20 bg-gradient-blue-purple rounded-2xl flex items-center justify-center text-white font-bold text-2xl shadow-lg">
              SN
            </div>
          </div>
          <h1 className="mt-6 text-3xl font-bold text-gray-800">Startup Nation 2025</h1>
          <p className="mt-2 text-sm text-gray-600">
            Autentificare
          </p>
        </div>
        
        <div className="glassmorphism rounded-2xl p-8 shadow-lg hover-scale transition-all duration-300">
          {redirectMessage && (
            <div className="mb-4 bg-blue-50 border-l-4 border-blue-500 p-4 rounded-lg">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-blue-700">{redirectMessage}</p>
                </div>
              </div>
            </div>
          )}
          
          {error && (
            <div className="mb-4 bg-red-50 border-l-4 border-red-500 p-4 rounded-lg">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            </div>
          )}
          
          <form className="space-y-6" onSubmit={formik.handleSubmit}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Adresă email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                placeholder="nume@exemplu.com"
                className={`w-full px-4 py-3 rounded-xl border ${
                  formik.touched.email && formik.errors.email 
                    ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                    : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                } shadow-sm focus:outline-none focus:ring-2 transition-all`}
                value={formik.values.email}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                disabled={loading}
              />
              {formik.touched.email && formik.errors.email && (
                <p className="mt-1 text-sm text-red-600">{formik.errors.email}</p>
              )}
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Parolă
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                placeholder="••••••••"
                className={`w-full px-4 py-3 rounded-xl border ${
                  formik.touched.password && formik.errors.password 
                    ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                    : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                } shadow-sm focus:outline-none focus:ring-2 transition-all`}
                value={formik.values.password}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                disabled={loading}
              />
              {formik.touched.password && formik.errors.password && (
                <p className="mt-1 text-sm text-red-600">{formik.errors.password}</p>
              )}
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                  Ține-mă minte
                </label>
              </div>

              <div className="text-sm">
                <RouterLink to="/reset-password" className="text-blue-600 hover:text-blue-500 transition-colors">
                  Ai uitat parola?
                </RouterLink>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-blue-purple text-white px-6 py-3 rounded-xl font-medium shadow-md hover:opacity-90 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                ) : (
                  'Autentificare'
                )}
              </button>
            </div>
          </form>
        </div>
        
        <div className="text-center mt-6">
          <p className="text-sm text-gray-600 mb-2">Nu ai cont încă?</p>
          <RouterLink
            to={`/register${roleFromUrl ? `?role=${roleFromUrl}` : ''}`}
            className="text-sm font-medium text-blue-600 hover:text-blue-500 transition-colors"
          >
            Înregistrează-te acum
          </RouterLink>
        </div>
        
        <div className="text-center mt-2">
          <RouterLink to="/" className="text-sm text-gray-600 hover:text-blue-600 flex items-center justify-center transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            Înapoi la pagina principală
          </RouterLink>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;