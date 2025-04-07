import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useFormik } from 'formik';
import * as yup from 'yup';
import axios from 'axios';
import { AlertCircle, CheckCircle, ArrowLeft, EyeIcon, EyeOffIcon } from 'lucide-react';

// Validation schema
const validationSchema = yup.object({
  password: yup
    .string()
    .min(6, 'Parola trebuie să aibă minim 6 caractere')
    .required('Parola este obligatorie'),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref('password'), null], 'Parolele nu coincid')
    .required('Confirmarea parolei este obligatorie')
});

const ResetPasswordPage = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [tokenValid, setTokenValid] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Extract token from URL
  const query = new URLSearchParams(location.search);
  const token = query.get('token');
  const email = query.get('email');

  // Verify token on mount
  useEffect(() => {
    const verifyToken = async () => {
      if (!token || !email) {
        setTokenValid(false);
        setError('Link-ul de resetare este invalid sau a expirat. Te rugăm să încerci din nou.');
        return;
      }

      try {
        const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5003/api';
        
        // Verify token validity
        const response = await axios.post(`${API_URL}/password/verify-reset-token`, {
          token,
          email
        });
        
        if (!response.data.success) {
          setTokenValid(false);
          setError(response.data?.message || 'Link-ul de resetare este invalid sau a expirat.');
        }
      } catch (error) {
        console.error('Token verification error:', error);
        setTokenValid(false);
        setError(error.response?.data?.message || 'Link-ul de resetare este invalid sau a expirat.');
      }
    };

    verifyToken();
  }, [token, email]);

  // Form handling
  const formik = useFormik({
    initialValues: {
      password: '',
      confirmPassword: ''
    },
    validationSchema: validationSchema,
    onSubmit: async (values) => {
      if (!token || !email) {
        setError('Link-ul de resetare este invalid. Te rugăm să încerci din nou.');
        return;
      }

      try {
        setLoading(true);
        setError('');
        
        const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5003/api';
        
        // Call the reset password API
        const response = await axios.post(`${API_URL}/password/reset-password`, {
          token,
          email,
          password: values.password
        });
        
        if (response.data.success) {
          setSuccess(true);
          
          // Redirect to login after 3 seconds
          setTimeout(() => {
            navigate('/login', { replace: true });
          }, 3000);
        } else {
          setError(response.data.message || 'A apărut o eroare. Te rugăm să încerci din nou.');
        }
      } catch (error) {
        console.error('Reset password error:', error);
        setError(error.response?.data?.message || 'A apărut o eroare. Te rugăm să încerci din nou.');
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
            Resetare parolă
          </p>
        </div>
        
        <div className="glassmorphism rounded-2xl p-8 shadow-lg hover-scale transition-all duration-300">
          {!tokenValid ? (
            <div className="text-center py-6">
              <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="h-8 w-8 text-red-500" />
              </div>
              <h2 className="text-xl font-semibold text-gray-800 mb-2">Link invalid</h2>
              <p className="text-gray-600 mb-6">
                {error || 'Link-ul de resetare este invalid sau a expirat.'}
              </p>
              <Link
                to="/forgot-password"
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Solicită un nou link
              </Link>
            </div>
          ) : success ? (
            <div className="text-center py-6">
              <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="h-8 w-8 text-green-500" />
              </div>
              <h2 className="text-xl font-semibold text-gray-800 mb-2">Parolă resetată cu succes!</h2>
              <p className="text-gray-600 mb-6">
                Parola ta a fost actualizată. Vei fi redirecționat către pagina de autentificare în câteva secunde.
              </p>
              <div className="animate-pulse">
                <Link
                  to="/login"
                  className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Înapoi la pagina de autentificare
                </Link>
              </div>
            </div>
          ) : (
            <>
              {error && (
                <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-lg">
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
              
              <form className="space-y-6" onSubmit={formik.handleSubmit}>
                <div>
                  <p className="text-gray-600 mb-4">
                    Introdu noua parolă pentru contul tău:
                    {email && <span className="font-medium"> {email}</span>}
                  </p>
                  
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                        Parolă nouă
                      </label>
                      <div className="relative">
                        <input
                          id="password"
                          name="password"
                          type={showPassword ? "text" : "password"}
                          className={`w-full px-4 py-3 rounded-xl border ${
                            formik.touched.password && formik.errors.password 
                              ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                              : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                          } shadow-sm focus:outline-none focus:ring-2 transition-all pr-10`}
                          value={formik.values.password}
                          onChange={formik.handleChange}
                          onBlur={formik.handleBlur}
                          disabled={loading}
                        />
                        <button
                          type="button"
                          className="absolute inset-y-0 right-0 flex items-center pr-3"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? (
                            <EyeOffIcon className="h-5 w-5 text-gray-400" />
                          ) : (
                            <EyeIcon className="h-5 w-5 text-gray-400" />
                          )}
                        </button>
                      </div>
                      {formik.touched.password && formik.errors.password && (
                        <p className="mt-1 text-sm text-red-600">{formik.errors.password}</p>
                      )}
                    </div>
                    
                    <div>
                      <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                        Confirmă parola
                      </label>
                      <div className="relative">
                        <input
                          id="confirmPassword"
                          name="confirmPassword"
                          type={showConfirmPassword ? "text" : "password"}
                          className={`w-full px-4 py-3 rounded-xl border ${
                            formik.touched.confirmPassword && formik.errors.confirmPassword 
                              ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                              : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                          } shadow-sm focus:outline-none focus:ring-2 transition-all pr-10`}
                          value={formik.values.confirmPassword}
                          onChange={formik.handleChange}
                          onBlur={formik.handleBlur}
                          disabled={loading}
                        />
                        <button
                          type="button"
                          className="absolute inset-y-0 right-0 flex items-center pr-3"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        >
                          {showConfirmPassword ? (
                            <EyeOffIcon className="h-5 w-5 text-gray-400" />
                          ) : (
                            <EyeIcon className="h-5 w-5 text-gray-400" />
                          )}
                        </button>
                      </div>
                      {formik.touched.confirmPassword && formik.errors.confirmPassword && (
                        <p className="mt-1 text-sm text-red-600">{formik.errors.confirmPassword}</p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gradient-blue-purple text-white px-6 py-3 rounded-xl font-medium shadow-md hover:opacity-90 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    {loading ? (
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mx-auto"></div>
                    ) : (
                      'Resetează parola'
                    )}
                  </button>
                </div>
              </form>
            </>
          )}
        </div>
        
        <div className="text-center mt-6">
          <Link to="/login" className="text-sm text-gray-600 hover:text-blue-600 flex items-center justify-center transition-colors">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Înapoi la pagina de autentificare
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;