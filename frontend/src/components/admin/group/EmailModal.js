import React, { useState, useEffect } from 'react';
import { 
  X, 
  Check, 
  Mail, 
  Send,
  Users
} from 'lucide-react';

const EmailModal = ({ 
  isOpen, 
  onClose, 
  participants, 
  initialSelectedParticipants = [],
  onSendEmail 
}) => {
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [selectedParticipants, setSelectedParticipants] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  
  // Initialize selected participants
  useEffect(() => {
    setSelectedParticipants(initialSelectedParticipants);
    setSelectAll(initialSelectedParticipants.length === participants.length);
  }, [initialSelectedParticipants, participants]);
  
  // Toggle participant selection
  const toggleParticipantSelection = (participantId) => {
    setSelectedParticipants(prev => {
      if (prev.includes(participantId)) {
        const newSelection = prev.filter(id => id !== participantId);
        setSelectAll(false);
        return newSelection;
      } else {
        const newSelection = [...prev, participantId];
        if (newSelection.length === participants.length) {
          setSelectAll(true);
        }
        return newSelection;
      }
    });
  };
  
  // Toggle select all
  const toggleSelectAll = () => {
    if (selectAll) {
      setSelectedParticipants([]);
      setSelectAll(false);
    } else {
      setSelectedParticipants(participants.map(p => p._id));
      setSelectAll(true);
    }
  };
  
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
    
    if (selectedParticipants.length === 0) {
      setError('Selectați cel puțin un participant');
      return;
    }
    
    // Prepare email data
    const emailData = {
      subject,
      message,
      recipients: selectedParticipants
    };
    
    try {
      setSending(true);
      setError('');
      
      // Send email
      const success = await onSendEmail(emailData);
      
      if (success) {
        // Clear form and close modal
        setSubject('');
        setMessage('');
        setSelectedParticipants([]);
        setSelectAll(false);
        onClose();
      }
    } catch (error) {
      setError(error.message || 'A apărut o eroare la trimiterea emailului');
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
        
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-3xl sm:w-full">
          <form onSubmit={handleSubmit}>
            <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
              <div className="sm:flex sm:items-start">
                <div className="w-full">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg leading-6 font-medium text-gray-900 flex items-center">
                      <Mail className="h-5 w-5 mr-2 text-blue-600" />
                      Trimite email către participanți
                    </h3>
                    <button
                      type="button"
                      onClick={onClose}
                      className="text-gray-400 hover:text-gray-500 focus:outline-none"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                  
                  {/* Error message */}
                  {error && (
                    <div className="mb-4 bg-red-50 border-l-4 border-red-500 p-4">
                      <div className="flex">
                        <div className="flex-shrink-0">
                          <X className="h-5 w-5 text-red-500" />
                        </div>
                        <div className="ml-3">
                          <p className="text-sm text-red-700">{error}</p>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* Subject and message */}
                  <div className="space-y-4 mb-6">
                    <div>
                      <label htmlFor="subject" className="block text-sm font-medium text-gray-700">
                        Subiect
                      </label>
                      <input
                        type="text"
                        id="subject"
                        className="mt-1 p-2 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        placeholder="Introduceți subiectul email-ului"
                        required
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="message" className="block text-sm font-medium text-gray-700">
                        Mesaj
                      </label>
                      <textarea
                        id="message"
                        rows={6}
                        className="mt-1 p-2 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Introduceți conținutul email-ului"
                        required
                      />
                    </div>
                  </div>
                  
                  {/* Recipients */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center">
                        <Users className="h-5 w-5 mr-2 text-gray-500" />
                        <h4 className="text-sm font-medium text-gray-700">Selectați destinatarii</h4>
                      </div>
                      
                      <div className="flex items-center">
                        <button
                          type="button"
                          className="text-sm text-blue-600 hover:text-blue-800 flex items-center"
                          onClick={toggleSelectAll}
                        >
                          {selectAll ? (
                            <>
                              <X className="h-4 w-4 mr-1" />
                              Deselectează tot
                            </>
                          ) : (
                            <>
                              <Check className="h-4 w-4 mr-1" />
                              Selectează tot
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                    
                    <div className="max-h-40 overflow-y-auto border border-gray-200 rounded-lg">
                      {participants.length === 0 ? (
                        <div className="p-4 text-center text-gray-500">
                          Nu există participanți în această grupă.
                        </div>
                      ) : (
                        <ul className="divide-y divide-gray-200">
                          {participants.map((participant) => (
                            <li key={participant._id} className="hover:bg-gray-50">
                              <div 
                                className="py-2 px-4 flex items-center cursor-pointer"
                                onClick={() => toggleParticipantSelection(participant._id)}
                              >
                                <div className="h-5 w-5 mr-3">
                                  <div className={`h-5 w-5 rounded-md border ${
                                    selectedParticipants.includes(participant._id) 
                                      ? 'bg-blue-600 border-blue-600 flex items-center justify-center' 
                                      : 'border-gray-300'
                                  }`}>
                                    {selectedParticipants.includes(participant._id) && (
                                      <Check className="h-3 w-3 text-white" />
                                    )}
                                  </div>
                                </div>
                                
                                <div className="flex-1">
                                  <p className="text-sm font-medium text-gray-900">{participant.name}</p>
                                  <p className="text-xs text-gray-500">{participant.email}</p>
                                </div>
                              </div>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                    
                    <div className="mt-1 text-xs text-gray-500">
                      {selectedParticipants.length} din {participants.length} participanți selectați
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
              <button
                type="submit"
                className={`w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm ${
                  sending ? 'opacity-50 cursor-not-allowed' : ''
                }`}
                disabled={sending}
              >
                {sending ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Se trimite...
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
                className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
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

export default EmailModal;