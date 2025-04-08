import React, { useState, useEffect } from 'react';
import { 
  X, 
  Mail,
  Send,
  AlertTriangle
} from 'lucide-react';
import axios from 'axios';

const SendEmailToClientModal = ({ 
  isOpen, 
  onClose, 
  clientId,
  clientEmail,
  clientName
}) => {
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  
  // Reset form fields when modal opens with new client
  useEffect(() => {
    if (isOpen) {
      setSubject('');
      setMessage('');
      setError('');
      setSuccess(false);
    }
  }, [isOpen, clientId]);
  
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    if (!subject.trim()) {
      setError('Subiectul este obligatoriu');
      return;
    }
    
    if (!message.trim()) {
      setError('Mesajul este obligatoriu');
      return;
    }
    
    try {
      setSending(true);
      setError('');
      
      const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5003/api';
      
      // Send email
      const response = await axios.post(
        `${API_URL}/email/client/${clientId}`, 
        {
          subject,
          message,
          htmlMessage: message.replace(/\n/g, '<br>')
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      
      if (response.data.success) {
        setSuccess(true);
        
        // Clear form after 2 seconds and close modal
        setTimeout(() => {
          setSubject('');
          setMessage('');
          onClose();
        }, 2000);
      } else {
        throw new Error(response.data.message || 'A apărut o eroare la trimiterea emailului');
      }
    } catch (error) {
      console.error('Error sending email:', error);
      setError(error.response?.data?.message || error.message || 'A apărut o eroare la trimiterea emailului');
    } finally {
      setSending(false);
    }
  };
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity">
          <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
        </div>
        
        <span className="hidden sm:inline-block sm:align-middle sm:h-screen"></span>&#8203;
        
        <div className="inline-block align-bottom glassmorphism rounded-xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-xl sm:w-full">
          <form onSubmit={handleSubmit}>
            <div className="bg-white/50 px-4 pt-5 pb-4 sm:p-6 sm:pb-4 rounded-t-xl">
              <div className="sm:flex sm:items-start">
                <div className="w-full">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg leading-6 font-medium text-gray-900 flex items-center">
                      <Mail className="h-5 w-5 mr-2 text-orange-500" />
                      Trimite email către {clientName}
                    </h3>
                    <button
                      type="button"
                      onClick={onClose}
                      className="text-gray-400 hover:text-gray-500 focus:outline-none"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                  
                  <div className="mb-4 flex items-center bg-orange-50 border border-orange-200 p-3 rounded-lg">
                    <Mail className="h-5 w-5 mr-2 text-orange-500" />
                    <div className="text-sm text-orange-700">
                      Email-ul va fi trimis la adresa: <span className="font-semibold">{clientEmail}</span>
                    </div>
                  </div>
                  
                  {/* Error message */}
                  {error && (
                    <div className="mb-4 bg-red-50 border-l-4 border-red-500 p-4 rounded-lg">
                      <div className="flex">
                        <div className="flex-shrink-0">
                          <AlertTriangle className="h-5 w-5 text-red-500" />
                        </div>
                        <div className="ml-3">
                          <p className="text-sm text-red-700">{error}</p>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* Success message */}
                  {success && (
                    <div className="mb-4 bg-green-50 border-l-4 border-green-500 p-4 rounded-lg">
                      <div className="flex">
                        <div className="flex-shrink-0">
                          <svg className="h-5 w-5 text-green-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <div className="ml-3">
                          <p className="text-sm text-green-700">Email-ul a fost trimis cu succes!</p>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* Form fields */}
                  <div className="space-y-4 mb-2">
                    <div>
                      <label htmlFor="subject" className="block text-sm font-medium text-gray-700">
                        Subiect
                      </label>
                      <input
                        type="text"
                        id="subject"
                        className="mt-1 p-3 w-full border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        placeholder="Introduceți subiectul email-ului"
                        disabled={sending || success}
                        required
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="message" className="block text-sm font-medium text-gray-700">
                        Mesaj
                      </label>
                      <textarea
                        id="message"
                        rows={10}
                        className="mt-1 p-3 w-full border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Introduceți conținutul email-ului"
                        disabled={sending || success}
                        required
                      />
                      <p className="mt-1 text-xs text-gray-500">
                        Poți folosi simboluri de text la introducerea mesajului. Liniile noi vor fi păstrate în email.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse rounded-b-xl">
              <button
                type="submit"
                className={`w-full inline-flex justify-center rounded-lg border border-transparent shadow-sm px-4 py-2 bg-gradient-to-r from-orange-500 to-pink-500 text-base font-medium text-white hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 sm:ml-3 sm:w-auto sm:text-sm ${
                  sending || success ? 'opacity-50 cursor-not-allowed' : ''
                }`}
                disabled={sending || success}
              >
                {sending ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Se trimite...
                  </>
                ) : success ? (
                  <>
                    <svg className="h-4 w-4 mr-2 text-white" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Trimis
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Trimite email
                  </>
                )}
              </button>
              <button
                type="button"
                className="mt-3 w-full inline-flex justify-center rounded-lg border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                onClick={onClose}
                disabled={sending}
              >
                Anulează
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SendEmailToClientModal;