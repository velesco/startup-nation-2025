import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useFormik } from 'formik';
import * as yup from 'yup';
import axios from 'axios';
import { AlertCircle, CheckCircle, ArrowLeft } from 'lucide-react';

// Validation schema
const validationSchema = yup.object({
  email: yup
    .string()
    .email('Introduceți o adresă de email validă')
    .required('Email-ul este obligatoriu')
});

const ForgotPasswordPage = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Form handling
  const formik = useFormik({
    initialValues: {
      email: ''
    },
    validationSchema: validationSchema,
    onSubmit: async (values) => {
      try {
        setLoading(true);
        setError('');
        
        const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5003/api';
        
        // Call the reset password API
        const response = await axios.post(`${API_URL}/auth/forgot-password`, {
          email: values.email
        });
        
        if (response.data.success) {
          setSuccess(true);
        } else {
          setError(response.data.message || 'A apărut o eroare. Te rugăm să încerci din nou.');
        }
      } catch (error) {
        console.error('Forgot password error:', error);
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
            Recuperare parolă
          </p>
        </div>
        
        <div className="glassmorphism rounded-2xl p-8 shadow-lg hover-scale transition-all duration-300">
          {success ? (
            <div className="text-center py-6">
              <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="h-8 w-8 text-green-500" />
              </div>
              <h2 className="text-xl font-semibold text-gray-800 mb-2">Email trimis cu succes!</h2>
              <p className="text-gray-600 mb-6">
                Un email cu instrucțiuni pentru resetarea parolei a fost trimis la adresa <strong>{formik.values.email}</strong>. 
                Te rugăm să verifici inbox-ul (și dosarul de spam).
              </p>
              <Link
                to="/login"
                className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Înapoi la pagina de autentificare
              </Link>
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
                    Introdu adresa de email asociată contului tău și îți vom trimite un link pentru resetarea parolei.
                  </p>
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

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gradient-blue-purple text-white px-6 py-3 rounded-xl font-medium shadow-md hover:opacity-90 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    {loading ? (
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mx-auto"></div>
                    ) : (
                      'Trimite link de resetare'
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

export default ForgotPasswordPage;