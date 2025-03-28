import React, { useState, useEffect } from 'react';
import { Save, AlertCircle, Calendar, Check } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../../../contexts/AuthContext';

const ClientIDCardDataForm = ({ onCompleted, onCancel }) => {
  const { currentUser } = useAuth();
  const [formData, setFormData] = useState({
    CNP: '',
    fullName: '',
    address: '',
    series: '',
    number: '',
    issuedBy: '',
    birthDate: '',
    expiryDate: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // Inițializare date din profilul utilizatorului, dacă există
  useEffect(() => {
    if (currentUser && currentUser.idCard) {
      const { idCard } = currentUser;
      const formattedBirthDate = idCard.birthDate ? new Date(idCard.birthDate).toISOString().split('T')[0] : '';
      const formattedExpiryDate = idCard.expiryDate ? new Date(idCard.expiryDate).toISOString().split('T')[0] : '';
      
      setFormData({
        CNP: idCard.CNP || '',
        fullName: idCard.fullName || '',
        address: idCard.address || '',
        series: idCard.series || '',
        number: idCard.number || '',
        issuedBy: idCard.issuedBy || '',
        birthDate: formattedBirthDate,
        expiryDate: formattedExpiryDate
      });
    }
  }, [currentUser]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateCNP = (cnp) => {
    // Validare simplă CNP: 13 cifre, format corect
    const cnpRegex = /^[1-8]\d{12}$/;
    return cnpRegex.test(cnp);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('=== START Salvare Date Buletin ===');
    
    try {
      setError('');
      setLoading(true);
      
      // Validări de bază
      if (!formData.CNP || !formData.fullName || !formData.address || !formData.series || 
          !formData.number || !formData.issuedBy || !formData.birthDate) {
        throw new Error('Te rugăm să completezi toate câmpurile obligatorii.');
      }
      
      // Validare specială pentru CNP
      if (!validateCNP(formData.CNP)) {
        throw new Error('CNP-ul introdus nu este valid. Acesta trebuie să conțină 13 cifre și să înceapă cu o cifră între 1 și 8.');
      }

      // URL API
      const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5003/api';
      const updateUrl = `${API_URL}/auth/update-id-card`;
      console.log('URL actualizare:', updateUrl);
      
      // Token de autorizare
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Nu ești autentificat. Te rugăm să te conectezi din nou.');
      }
      
      // Trimitere date către server
      const response = await axios.put(updateUrl, formData, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      console.log('Răspuns server actualizare date buletin:', response);
      
      // Verificare răspuns
      if (response.data.success || response.status === 200) {
        console.log('Actualizare reușită!');
        setSuccess(true);
        
        // Notificăm componenta părinte că acest pas a fost completat
        if (onCompleted && typeof onCompleted === 'function') {
          setTimeout(() => {
            onCompleted();
          }, 1500);
        }
      } else {
        console.error('Răspunsul nu indică succes:', response.data);
        throw new Error(response.data.message || 'Eroare la actualizarea datelor.');
      }
    } catch (error) {
      console.error('Eroare la actualizarea datelor:', error);
      setError(error.message || 'A apărut o eroare la salvarea datelor. Te rugăm să încerci din nou.');
    } finally {
      setLoading(false);
      console.log('=== END Salvare Date Buletin ===');
    }
  };

  if (success) {
    return (
      <div className="bg-white/70 backdrop-blur-md rounded-3xl p-6 shadow-lg border border-white/50 text-center">
        <div className="mx-auto w-16 h-16 bg-gradient-to-r from-green-400 to-green-600 rounded-full flex items-center justify-center mb-4">
          <Check className="h-8 w-8 text-white" />
        </div>
        <h3 className="text-lg font-bold mb-2">Datele au fost salvate cu succes!</h3>
        <p className="text-gray-600">
          Informațiile tale din buletin au fost înregistrate și vor fi verificate în cel mai scurt timp.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white/70 backdrop-blur-md rounded-3xl p-6 shadow-lg border border-white/50">
      <h2 className="text-xl font-bold mb-6 bg-gradient-to-r from-gray-700 to-gray-900 bg-clip-text text-transparent">
        Completează datele din buletin
      </h2>
      
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-start">
          <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
          <p className="text-sm">{error}</p>
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="CNP" className="block text-sm font-medium text-gray-700 mb-1">
              CNP *
            </label>
            <input
              type="text"
              id="CNP"
              name="CNP"
              value={formData.CNP}
              onChange={handleChange}
              placeholder="1234567890123"
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
              required
            />
          </div>
          
          <div>
            <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">
              Nume și Prenume *
            </label>
            <input
              type="text"
              id="fullName"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              placeholder="Popescu Ion"
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
              required
            />
          </div>
          
          <div className="md:col-span-2">
            <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
              Adresa *
            </label>
            <input
              type="text"
              id="address"
              name="address"
              value={formData.address}
              onChange={handleChange}
              placeholder="Str. Exemplu, Nr. 10, Bl. A1, Sc. 1, Ap. 5, Sector/Județ"
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
              required
            />
          </div>
          
          <div>
            <label htmlFor="series" className="block text-sm font-medium text-gray-700 mb-1">
              Serie Buletin *
            </label>
            <input
              type="text"
              id="series"
              name="series"
              value={formData.series}
              onChange={handleChange}
              placeholder="RT"
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
              required
            />
          </div>
          
          <div>
            <label htmlFor="number" className="block text-sm font-medium text-gray-700 mb-1">
              Număr Buletin *
            </label>
            <input
              type="text"
              id="number"
              name="number"
              value={formData.number}
              onChange={handleChange}
              placeholder="123456"
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
              required
            />
          </div>
          
          <div>
            <label htmlFor="issuedBy" className="block text-sm font-medium text-gray-700 mb-1">
              Emis de *
            </label>
            <input
              type="text"
              id="issuedBy"
              name="issuedBy"
              value={formData.issuedBy}
              onChange={handleChange}
              placeholder="SPCLEP Sector 1"
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
              required
            />
          </div>
          
          <div>
            <label htmlFor="birthDate" className="block text-sm font-medium text-gray-700 mb-1">
              Data Nașterii *
            </label>
            <div className="relative">
              <input
                type="date"
                id="birthDate"
                name="birthDate"
                value={formData.birthDate}
                onChange={handleChange}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                required
              />
              <Calendar className="absolute right-3 top-2.5 h-5 w-5 text-gray-400 pointer-events-none" />
            </div>
          </div>
          
          <div>
            <label htmlFor="expiryDate" className="block text-sm font-medium text-gray-700 mb-1">
              Data Expirării
            </label>
            <div className="relative">
              <input
                type="date"
                id="expiryDate"
                name="expiryDate"
                value={formData.expiryDate}
                onChange={handleChange}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
              />
              <Calendar className="absolute right-3 top-2.5 h-5 w-5 text-gray-400 pointer-events-none" />
            </div>
          </div>
        </div>
        
        <div className="pt-4 flex flex-col sm:flex-row gap-3">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 rounded-xl font-medium shadow-md hover:shadow-lg transition-all duration-300 flex items-center justify-center"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                <span>Se procesează...</span>
              </>
            ) : (
              <>
                <span>Salvează informațiile</span>
                <Save className="h-5 w-5 ml-2" />
              </>
            )}
          </button>
          
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              disabled={loading}
              className="flex-1 bg-white text-gray-700 border border-gray-300 py-3 rounded-xl font-medium shadow-sm hover:bg-gray-50 transition-all duration-300 flex items-center justify-center"
            >
              <span>Anulează</span>
            </button>
          )}
        </div>
      </form>
      
      <div className="mt-4 px-2">
        <p className="text-sm text-gray-500">
          * Câmpuri obligatorii
        </p>
        <p className="mt-2 text-xs text-gray-500">
          Datele sunt folosite exclusiv pentru verificarea identității și în scopul participării la programul Startup Nation 2025.
        </p>
      </div>
    </div>
  );
};

export default ClientIDCardDataForm;