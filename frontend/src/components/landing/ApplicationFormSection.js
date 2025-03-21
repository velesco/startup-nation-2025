import React, { useState } from 'react';
import { useFormik } from 'formik';
import * as yup from 'yup';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';

// Validation schema for application form
const validationSchema = yup.object({
  name: yup.string().required('Numele este obligatoriu'),
  email: yup.string().email('Email invalid').required('Email-ul este obligatoriu'),
  phone: yup.string().required('Telefonul este obligatoriu')
});

const ApplicationFormSection = () => {
  const [submitLoading, setSubmitLoading] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();

  // Form handling
  const formik = useFormik({
    initialValues: {
      name: '',
      email: '',
      phone: ''
    },
    validationSchema: validationSchema,
    onSubmit: async (values) => {
      try {
        setSubmitLoading(true);
        setSubmitError(false);
        setErrorMessage('');
        
        // Verificare în baza de date dacă emailul există deja
        // În implementarea reală, aceasta ar fi o cerere API
        // Simulăm apelul API
        try {
          // Pentru a afișa un mesaj de progres în consolă
          console.log('Se trimite aplicația pentru:', values.email);
          
          // API URL
          const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5003/api';
          
          console.log('Se încearcă înregistrarea utilizatorului:', values.email);
          // Pregătim datele pentru înregistrare
          const userData = {
            name: values.name,
            email: values.email,
            phone: values.phone,
            password: values.phone, // Setăm parola ca fiind numărul de telefon
            role: 'client'
          };
          
          try {
          // Folosim endpoint-ul standard de înregistrare
          const response = await axios.post(`${API_URL}/auth/register`, userData);
          console.log('Răspuns înregistrare:', response.data);
          
          if (response.data && response.data.success) {
          // Înregistrare cu succes, logăm acțiunea în fișierul de log
          try {
            await axios.post(`${API_URL}/logs`, {
              action: 'new_user_application',
              details: JSON.stringify({
                name: values.name,
                email: values.email,
                timestamp: new Date().toISOString()
              }),
              type: 'client_registration'
            }, {
              headers: {
                Authorization: `Bearer ${response.data.token}`
              }
            });
            console.log('Acțiune înregistrată în logs');
          } catch (logError) {
          console.error('Eroare la înregistrarea acțiunii în logs:', logError);
          // Continuăm chiar dacă înregistrarea acțiunii eșuează
          }
            
                  // Store tokens and user data
                  localStorage.setItem('token', response.data.token);
                  localStorage.setItem('refreshToken', response.data.refreshToken);
                  
                  // Set auth header for future requests
                  axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
                  
                  // Update global auth context
                  const userData = response.data.user;
                  
                  setSubmitSuccess(true);
                  
                  // Redirect directly to dashboard after 1.5 seconds
                  setTimeout(() => {
                    console.log('Registration successful, redirecting to dashboard...');
                    window.location.href = '/client/dashboard'; // Redirecționare hard către dashboard
                  }, 1500);
                }
          } catch (apiError) {
            // Verifică dacă eroarea este pentru că utilizatorul există deja
            if (apiError.response && 
                apiError.response.data && 
                apiError.response.data.message && 
                apiError.response.data.message.includes('email already exists')) {
              
              console.log('Email există deja, încercăm autentificarea automată cu telefonul ca parolă');
              // Încearcă să autentifice automat utilizatorul existent
              try {
                console.log('Se încearcă autentificarea automată a utilizatorului existent...');
                const loginResponse = await login(values.email, values.phone);
                
                if (loginResponse) {
                  console.log('Login successful, using tokens to set storage and redirect');
                  setSubmitSuccess(true);
                  setSubmitError(false);
                setErrorMessage('');
                  
                  console.log('Autentificare automată reușită');
                  
                  // Redirect directly to dashboard using window.location for a hard redirect
                  setTimeout(() => {
                    console.log('Redirecting to dashboard...');
                    window.location.href = '/client/dashboard';
                  }, 1500);
                  return;
                }
              } catch (loginError) {
                console.error('Eroare la autentificarea automată:', loginError);
                
                // Dacă autentificarea automată eșuează, redirecționăm către login
                sessionStorage.setItem('loginEmail', values.email);
                
                setSubmitError(true);
                setErrorMessage('Acest email este deja înregistrat. Te rugăm să te autentifici.');
                
                setTimeout(() => {
                  console.log('Login failed, redirecting to login page...');
                  window.location.href = '/login';
                }, 1500);
                return;
              }
              return;
            }
            
            // Handle other API errors
            throw apiError;
          }
        } catch (error) {
          console.error('Eroare la trimiterea aplicației:', error);
          
          // Afișăm mesajul de eroare specific dacă este disponibil
          let errorMsg = 'A apărut o eroare la trimiterea aplicației. Te rugăm să încerci din nou.';
          
          if (error.response) {
            console.error('Detalii eroare server:', error.response.data);
            
            // Preluăm mesajul de eroare de la server dacă există
            if (error.response.data && error.response.data.message) {
              errorMsg = error.response.data.message;
              
              // Specific pentru eroarea de email existent
              if (errorMsg.includes('email already exists')) {
                // Încercăm autentificarea automată
                try {
                  console.log('Se încearcă autentificarea automată după eroare...');
                  const loginResponse = await login(values.email, values.phone);
                  
                  if (loginResponse) {
                    setSubmitSuccess(true);
                    setSubmitError(false);
                    setErrorMessage('');
                    
                    console.log('Autentificare automată reușită, redirecționare către dashboard...');
                    // Redirect directly
                    setTimeout(() => {
                      console.log('Auto-login after error successful, redirecting to dashboard...');
                      window.location.href = '/client/dashboard';
                    }, 1500);
                    return;
                  }
                } catch (loginError) {
                  console.error('Eroare la autentificarea automată:', loginError);
                  
                  errorMsg = 'Acest email există deja. Te rugăm să te autentifici.';
                  // Stocăm email-ul pentru pagina de login
                  sessionStorage.setItem('loginEmail', values.email);
                  // După afișarea erorii, redirecționăm către login
                  setTimeout(() => {
                    console.log('Failed to login automatically, redirecting to login page...');
                    window.location.href = '/login';
                  }, 3000);
                }
              }
            }
          }
          
          setSubmitError(true);
          setErrorMessage(errorMsg);
          setSubmitLoading(false);
        }
      } catch (error) {
        console.error('Eroare generală la trimiterea formularului:', error);
        let finalErrorMessage = 'A apărut o eroare la trimiterea formularului. Te rugăm să încerci din nou.';
        
        // Încercăm să extragem un mesaj de eroare mai specific
        if (error.response && error.response.data && error.response.data.message) {
          finalErrorMessage = error.response.data.message;
        }
        
        setSubmitError(true);
        setErrorMessage(finalErrorMessage);
        setSubmitLoading(false);
      }
    }
  });

  return (
    <div className="py-16 bg-gray-50 relative overflow-hidden" id="apply-section">
      {/* Decorative Background Elements */}
      <div className="decoration-blob bg-green-400 w-80 h-80 bottom-0 right-10"></div>
      
      <div className="container mx-auto px-6 relative z-10">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-gradient-gray text-center mb-2">Aplică pentru finanțare</h2>
          <p className="text-gray-600 text-center mb-8">
            Completează formularul de mai jos pentru a crea un cont și a te alătura programului.
          </p>
          
          <div className="glassmorphism rounded-2xl p-8 shadow-md">
            {submitSuccess ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-green-100 text-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">Aplicația ta a fost trimisă cu succes!</h3>
                <p className="text-gray-600 mb-4">
                  Te vom redirecționa pentru a continua...
                </p>
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
              </div>
            ) : (
              <form onSubmit={formik.handleSubmit}>
                <div className="space-y-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                      Nume și prenume
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      placeholder="Introduceti numele complet"
                      className={`w-full px-4 py-3 rounded-xl border ${
                        formik.touched.name && formik.errors.name 
                          ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                          : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                      } shadow-sm focus:outline-none focus:ring-2`}
                      value={formik.values.name}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                    />
                    {formik.touched.name && formik.errors.name && (
                      <p className="mt-1 text-sm text-red-600">{formik.errors.name}</p>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                        Email
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        placeholder="nume@exemplu.com"
                        className={`w-full px-4 py-3 rounded-xl border ${
                          formik.touched.email && formik.errors.email 
                            ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                            : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                        } shadow-sm focus:outline-none focus:ring-2`}
                        value={formik.values.email}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                      />
                      {formik.touched.email && formik.errors.email && (
                        <p className="mt-1 text-sm text-red-600">{formik.errors.email}</p>
                      )}
                    </div>
                    
                    <div>
                      <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                        Telefon
                      </label>
                      <input
                        type="text"
                        id="phone"
                        name="phone"
                        placeholder="07XX XXX XXX"
                        className={`w-full px-4 py-3 rounded-xl border ${
                          formik.touched.phone && formik.errors.phone 
                            ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                            : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                        } shadow-sm focus:outline-none focus:ring-2`}
                        value={formik.values.phone}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                      />
                      {formik.touched.phone && formik.errors.phone && (
                        <p className="mt-1 text-sm text-red-600">{formik.errors.phone}</p>
                      )}
                    </div>
                  </div>
                  
                  {submitError && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                      {errorMessage || "A apărut o eroare la trimiterea formularului. Te rugăm să încerci din nou."}
                    </div>
                  )}
                  
                  <button
                    type="submit"
                    disabled={submitLoading}
                    className="w-full bg-gradient-blue-purple text-white px-6 py-3 rounded-xl font-medium shadow-md hover:shadow-lg transition-all duration-300 flex items-center justify-center"
                  >
                    {submitLoading ? (
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                    ) : (
                      'Trimite aplicația'
                    )}
                  </button>
                  
                  <p className="text-xs text-gray-500 text-center">
                    Prin trimiterea formularului, ești de acord cu <a href="#" className="text-blue-600 hover:underline">Termenii și Condițiile</a> și <a href="#" className="text-blue-600 hover:underline">Politica de Confidențialitate</a>.
                  </p>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApplicationFormSection;