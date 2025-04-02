import React, { useState } from 'react';
import { useFormik } from 'formik';
import * as yup from 'yup';
import { useNavigate, Link } from 'react-router-dom';
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
    <section className="form-section" id="apply-section" aria-labelledby="apply-heading">
      <h2 id="apply-heading" className="section-title">Înscrie-te acum</h2>
      
      <div className="form-container">
        <div className="form-header">
          <h3 className="form-title">Cu sprijinul nostru, Start-Up Nation 2025 devine simplu</h3>
          <p className="form-subtitle">Completează formularul pentru a te înscrie</p>
        </div>
        
        <div className="form-body">
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
              <div className="form-group">
                <label className="form-label" htmlFor="name">Nume și prenume</label>
                <input 
                  type="text" 
                  id="name" 
                  name="name"
                  className="form-input" 
                  value={formik.values.name}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  required
                />
                {formik.touched.name && formik.errors.name && (
                  <div className="text-red-500 text-sm mt-1">{formik.errors.name}</div>
                )}
              </div>
              
              <div className="form-group">
                <label className="form-label" htmlFor="email">Email</label>
                <input 
                  type="email" 
                  id="email" 
                  name="email"
                  className="form-input" 
                  value={formik.values.email}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  required
                />
                {formik.touched.email && formik.errors.email && (
                  <div className="text-red-500 text-sm mt-1">{formik.errors.email}</div>
                )}
              </div>
              
              <div className="form-group">
                <label className="form-label" htmlFor="phone">Telefon</label>
                <input 
                  type="tel" 
                  id="phone" 
                  name="phone"
                  className="form-input" 
                  value={formik.values.phone}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  required
                />
                {formik.touched.phone && formik.errors.phone && (
                  <div className="text-red-500 text-sm mt-1">{formik.errors.phone}</div>
                )}
              </div>
              
              {submitError && (
                <div className="text-red-600 bg-red-50 border border-red-200 p-3 rounded-lg mb-4">
                  {errorMessage}
                </div>
              )}
              
              <div className="form-check">
                <input type="checkbox" id="terms" className="form-checkbox" required />
                <label htmlFor="terms" className="form-terms">
                  Prin trimiterea formularului, sunt de acord cu <Link to="/termeni-conditii" className="text-blue-600">Termenii și Condițiile</Link> și <Link to="/politica-confidentialitate" className="text-blue-600">Politica de Confidențialitate</Link>.
                </label>
              </div>
              
              <button 
                type="submit" 
                className="btn form-submit"
                disabled={submitLoading}
              >
                {submitLoading ? (
                  <span className="inline-flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Se procesează...
                  </span>
                ) : (
                  'Înscrie-te acum'
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
};

export default ApplicationFormSection;