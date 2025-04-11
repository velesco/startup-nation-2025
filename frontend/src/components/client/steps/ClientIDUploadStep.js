import React, { useState, useRef, useEffect } from 'react';
import { Camera, ArrowRight, Upload, Check, XCircle, FileWarning, AlertCircle } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../../../contexts/AuthContext';
import ClientIDCardDataForm from './ClientIDCardDataForm';

const ClientIDUploadStep = ({ onStepComplete, userDocuments }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [uploadStatus, setUploadStatus] = useState('idle'); // idle, loading, success, success_with_form, error
  const [showDataForm, setShowDataForm] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef(null);
  const { currentUser } = useAuth();
  
  // Verificăm dacă buletinul a fost deja încărcat pentru a afișa starea corectă
  useEffect(() => {
    if (userDocuments && userDocuments.id_cardUploaded) {
      // Verificăm dacă utilizatorul are deja datele din buletin completate
      if (currentUser?.idCard?.CNP && currentUser?.idCard?.fullName) {
        setUploadStatus('success');
      } else {
        setUploadStatus('success_with_form');
        setShowDataForm(true);
      }
    }
  }, [userDocuments, currentUser]);

  // Gestionarea selecției fișierului
  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Verificare tip fișier (doar imagini și PDF)
      const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
      if (!validTypes.includes(file.type)) {
        setErrorMessage('Format neacceptat. Te rugăm să încarci o imagine (JPEG, PNG) sau un PDF.');
        setUploadStatus('error');
        return;
      }

      // Verificare dimensiune fișier (max 5MB)
      const maxSize = 555 * 1024 * 1024; // 5MB în bytes
      if (file.size > maxSize) {
        setErrorMessage('Fișierul este prea mare. Dimensiunea maximă este de 5MB.');
        setUploadStatus('error');
        return;
      }

      // Resetare erori anterioare
      setErrorMessage('');
      setUploadStatus('idle');
      
      // Setare fișier selectat
      setSelectedFile(file);
      
      // Creare URL pentru previzualizare (doar pentru imagini)
      if (file.type.startsWith('image/')) {
        const imageUrl = URL.createObjectURL(file);
        setPreviewUrl(imageUrl);
      } else {
        // Pentru PDF, punem o imagine placeholder
        setPreviewUrl('pdf-icon');
      }
    }
  };

  // Deschidere dialog de selecție fișier
  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  // Încărcare fișier
  const handleUpload = async () => {
    if (!selectedFile) {
      setErrorMessage('Te rugăm să selectezi un fișier.');
      setUploadStatus('error');
      return;
    }

    console.log('=== START Încarcare Document ===');
    console.log('Fișier selectat:', selectedFile.name, selectedFile.type, selectedFile.size);
    console.log('Current User:', currentUser);

    setUploadStatus('loading');
    setUploadProgress(0);
    
    // Creare formular pentru încărcare
    const formData = new FormData();
    formData.append('document', selectedFile); // Folosim 'document' conform așteptărilor din backend
    formData.append('type', 'identity'); // Tip document conform Document.js (identity, registration, contract, other)
    
    // Adăugăm userId doar dacă API-ul îl cere (în acest caz nu-l trimitem pentru că backend-ul îl ia din token)
    // formData.append('userId', currentUser?.id || currentUser?._id); 

    console.log('FormData creat, se pregătește request-ul API...');
    
    try {
      // URL API
      const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5003/api';
      const uploadUrl = `${API_URL}/documents/upload`;
      console.log('URL încărcare:', uploadUrl);
      
      // Token de autorizare
      const token = localStorage.getItem('token');
      console.log('Token disponibil:', !!token);
      
      // Simulare progres până ajungem la server
      let progress = 0;
      const progressInterval = setInterval(() => {
        if (progress < 90) { // Doar până la 90% pentru a aștepta răspunsul serverului
          progress += 5;
          setUploadProgress(progress);
        }
      }, 100);
      
      // Încărcare cu progres
      console.log('Se trimite request-ul...');
      const response = await axios.post(uploadUrl, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`
        },
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setUploadProgress(progress);
            console.log(`Progres încărcare: ${progress}%`);
          }
        }
      });

      // Oprim simularea progresului
      clearInterval(progressInterval);
      setUploadProgress(100);

      console.log('Răspuns server încărcare document:', response);
      console.log('Status code:', response.status);
      console.log('Răspuns data:', response.data);

      // Verificare răspuns - acceptăm și alte formate de răspuns
      if (response.data.success || response.status === 200) {
        console.log('Încărcare reușită!');
        
        // Setăm starea pentru a afișa formularul de date
        setUploadStatus('success_with_form'); 
        setShowDataForm(true);
        
        // Notificăm componenta părinte doar după ce utilizatorul alege să continue
        // NU mai apelăm automat onStepComplete
      } else {
        console.error('Răspunsul nu indică succes:', response.data);
        throw new Error(response.data.message || 'Eroare la încărcarea documentului');
      }
    } catch (error) {
      console.error('Eroare completă la încărcare:', error);
      console.error('Stare eroare:', error.response?.status);
      console.error('Răspuns eroare:', error.response?.data);
      console.error('Mesaj eroare:', error.message);
      
      setUploadStatus('error');
      setErrorMessage(error.response?.data?.message || error.message || 'A apărut o eroare la încărcarea documentului. Te rugăm să încerci din nou.');
    } finally {
      console.log('=== END Încarcare Document ===');
    }
  };

  // Anulare și resetare
  const handleCancel = () => {
    setSelectedFile(null);
    setPreviewUrl('');
    setUploadStatus('idle');
    setErrorMessage('');
    setUploadProgress(0);
    
    // Resetare input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Handler pentru finalizarea completării formularului
  const handleFormCompleted = () => {
    setUploadStatus('success');
    setShowDataForm(false);
    
    // Nu mai notificăm componenta părinte pentru a nu trece automat la următorul pas
    // Utilizatorul va trebui să aleagă manual când dorește să continue
  };

  // Handler pentru a continua la următorul pas
  const handleContinue = () => {
    // Notificăm componenta părinte că acest pas a fost completat
    if (onStepComplete && typeof onStepComplete === 'function') {
      onStepComplete('id_card');
    }
  };

  return (
    <div className="bg-white/70 backdrop-blur-md rounded-3xl p-6 mb-8 shadow-lg border border-white/50">
      <h2 className="text-xl font-bold mb-6 bg-gradient-to-r from-gray-700 to-gray-900 bg-clip-text text-transparent">Încărcare Buletin</h2>
      
      {showDataForm ? (
        // Afișăm formularul de introducere date buletin
        <ClientIDCardDataForm 
          onCompleted={handleFormCompleted} 
          onCancel={() => setShowDataForm(false)}
        />
      ) : uploadStatus === 'success' ? (
        <div className="border-2 border-green-200 rounded-2xl p-8 flex flex-col items-center justify-center bg-green-50/50">
          <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-4 shadow-md">
            <Check className="h-8 w-8 text-green-500" />
          </div>
          <h3 className="text-lg font-semibold text-green-700 mb-2">Document încărcat cu succes!</h3>
          <p className="text-center text-gray-600 mb-6">
            Documentul tău a fost transmis și va fi verificat în cel mai scurt timp.
          </p>
          
          <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3 mb-6">
            <button 
              onClick={() => setShowDataForm(true)}
              className="bg-blue-600 text-white border border-blue-600 px-6 py-2 rounded-full font-medium shadow-sm hover:bg-blue-700 transition-all duration-300"
            >
              Editează datele din buletin
            </button>
            <button 
              onClick={handleCancel}
              className="bg-white text-gray-700 border border-gray-300 px-6 py-2 rounded-full font-medium shadow-sm hover:bg-gray-50 transition-all duration-300"
            >
              Încarcă alt document
            </button>
          </div>
          
          {/* Buton pentru a continua la următorul pas */}
          <button
            onClick={handleContinue}
            className="bg-gradient-to-r from-green-500 to-green-600 text-white px-8 py-2 rounded-full font-medium shadow-md hover:shadow-lg transition-all duration-300 flex items-center"
          >
            <span>Continuă la următorul pas</span>
            <ArrowRight className="h-4 w-4 ml-2" />
          </button>
        </div>
      ) : (
        <div className="border-2 border-dashed border-blue-200 rounded-2xl p-8 flex flex-col items-center justify-center bg-blue-50/50">
          {/* Input fișier ascuns */}
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            className="hidden" 
            accept="image/jpeg,image/png,image/jpg,application/pdf"
          />
          
          {selectedFile && previewUrl ? (
            // Previzualizare fișier selectat
            <div className="w-full flex flex-col items-center">
              {previewUrl === 'pdf-icon' ? (
                // Icon PDF
                <div className="w-40 h-40 rounded-lg bg-white border border-gray-200 flex items-center justify-center mb-4 shadow-md">
                  <FileWarning className="h-16 w-16 text-red-500" />
                  <span className="absolute mt-16 text-sm font-medium">Document PDF</span>
                </div>
              ) : (
                // Previzualizare imagine
                <div className="relative w-40 h-40 mb-4">
                  <img src={previewUrl} alt="Preview" className="w-40 h-40 object-cover rounded-lg shadow-md" />
                </div>
              )}
              
              <p className="text-sm text-gray-700 mb-2 break-all max-w-full truncate">{selectedFile.name}</p>
              <p className="text-xs text-gray-500 mb-6">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
              
              {uploadStatus === 'loading' ? (
                // Progress bar și status
                <div className="w-full max-w-xs mb-4">
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div 
                      className="bg-gradient-to-r from-blue-500 to-purple-600 h-2.5 rounded-full transition-all duration-300" 
                      style={{ width: `${uploadProgress}%` }}
                    ></div>
                  </div>
                  <p className="text-center text-sm text-gray-600 mt-2">Se încarcă... {uploadProgress}%</p>
                </div>
              ) : (
                // Butoane de acțiune
                <div className="flex space-x-4">
                  <button 
                    onClick={handleUpload}
                    className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-2 rounded-full font-medium shadow-md hover:shadow-lg transition-all duration-300 flex items-center"
                    disabled={uploadStatus === 'loading'}
                  >
                    <span>Încarcă</span>
                    <Upload className="h-4 w-4 ml-2" />
                  </button>
                  <button 
                    onClick={handleCancel}
                    className="bg-white text-gray-700 border border-gray-300 px-6 py-2 rounded-full font-medium shadow-sm hover:bg-gray-50 transition-all duration-300"
                  >
                    Anulează
                  </button>
                </div>
              )}
            </div>
          ) : (
            // Zonă drag & drop / selecție fișier
            <>
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center mb-4 shadow-md">
                <Camera className="h-8 w-8 text-white" />
              </div>
              <p className="text-center text-gray-600 mb-6">Încarcă o poză clară cu buletinul tău</p>
              <button 
                onClick={triggerFileInput}
                className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-full font-medium shadow-md hover:shadow-lg transition-all duration-300 flex items-center"
              >
                <span>Selectează imagine</span>
                <ArrowRight className="h-4 w-4 ml-2" />
              </button>
            </>
          )}
          
          {/* Afișare erori */}
          {errorMessage && (
            <div className="mt-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-start">
              <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
              <p className="text-sm">{errorMessage}</p>
            </div>
          )}
        </div>
      )}
      
      <div className="mt-4 px-4">
        <p className="text-sm text-gray-500">
          Asigură-te că toate informațiile sunt vizibile și documentul este în termen de valabilitate.
        </p>
        <ul className="mt-2 text-xs text-gray-500 list-disc list-inside space-y-1">
          <li>Fișierele acceptate sunt: JPEG, PNG și PDF</li>
          <li>Dimensiunea maximă a fișierului este de 5MB</li>
          <li>Documentele vor fi verificate manual de către echipa noastră</li>
        </ul>
      </div>
    </div>
  );
};

export default ClientIDUploadStep;