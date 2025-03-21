import React, { useState } from 'react';
import axios from 'axios';
import { X, Upload, AlertCircle, Folder } from 'lucide-react';

const MaterialUploadModal = ({ isOpen, onClose, onUploadSuccess, folderId }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [progress, setProgress] = useState(0);
  const [materialName, setMaterialName] = useState('');
  const [materialDescription, setMaterialDescription] = useState('');
  
  if (!isOpen) return null;
  
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      // Folosim numele fișierului ca valoare implicită pentru nume
      if (!materialName) {
        setMaterialName(file.name.split('.')[0]);
      }
    }
  };
  
  const handleUpload = async (e) => {
    e.preventDefault();
    
    if (!selectedFile) {
      setError('Selectați un fișier pentru a-l încărca');
      return;
    }
    
    if (!materialName.trim()) {
      setError('Introduceți un nume pentru material');
      return;
    }
    
    try {
      setUploading(true);
      setError(null);
      setProgress(0);
      
      const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5003/api';
      
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('name', materialName);
      formData.append('description', materialDescription);
      
      if (folderId) {
        formData.append('folderId', folderId);
      }
      
      const response = await axios.post(
        `${API_URL}/admin/materials`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${localStorage.getItem('token')}`
          },
          onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            setProgress(percentCompleted);
          }
        }
      );
      
      if (response.data && response.data.success) {
        onUploadSuccess(response.data.data);
      } else {
        throw new Error(response.data?.message || 'Failed to upload material');
      }
    } catch (err) {
      console.error('Error uploading material:', err);
      setError(err.response?.data?.message || 'Nu s-a putut încărca materialul. Vă rugăm să încercați din nou.');
    } finally {
      setUploading(false);
    }
  };
  
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4">
        <div className="fixed inset-0 bg-black bg-opacity-30 backdrop-blur-sm" onClick={onClose}></div>
        
        <div className="relative bg-white/90 rounded-2xl shadow-xl max-w-md w-full p-6 z-10">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-800">Încarcă material</h2>
            <button 
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 transition-colors"
              disabled={uploading}
            >
              <X className="h-6 w-6" />
            </button>
          </div>
          
          {error && (
            <div className="mb-4 bg-red-50 border-l-4 border-red-500 p-4">
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
          
          <form onSubmit={handleUpload}>
            {/* Folder locație */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Locație
              </label>
              <div className="flex items-center px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg">
                <Folder className="h-5 w-5 text-yellow-500 mr-2" />
                <span className="text-sm text-gray-600 truncate">
                  {folderId ? 'Folder curent' : 'Biblioteca de materiale'}
                </span>
              </div>
            </div>
            
            {/* Selecție fișier */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fișier *
              </label>
              <input
                type="file"
                onChange={handleFileChange}
                className="w-full p-2 border border-gray-300 rounded-lg text-sm"
                disabled={uploading}
              />
              {selectedFile && (
                <p className="mt-1 text-xs text-gray-500">
                  {selectedFile.name} ({(selectedFile.size / 1024).toFixed(2)} KB)
                </p>
              )}
            </div>
            
            {/* Nume material */}
            <div className="mb-4">
              <label htmlFor="materialName" className="block text-sm font-medium text-gray-700 mb-1">
                Nume material *
              </label>
              <input
                type="text"
                id="materialName"
                value={materialName}
                onChange={(e) => setMaterialName(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                placeholder="Introduceți numele materialului"
                disabled={uploading}
                required
              />
            </div>
            
            {/* Descriere */}
            <div className="mb-4">
              <label htmlFor="materialDescription" className="block text-sm font-medium text-gray-700 mb-1">
                Descriere
              </label>
              <textarea
                id="materialDescription"
                value={materialDescription}
                onChange={(e) => setMaterialDescription(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                placeholder="Introduceți o descriere opțională"
                rows="3"
                disabled={uploading}
              ></textarea>
            </div>
            
            {/* Bară de progres */}
            {uploading && (
              <div className="mb-4">
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div 
                    className="bg-blue-600 h-2.5 rounded-full"
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
                <p className="mt-1 text-xs text-gray-500 text-right">{progress}%</p>
              </div>
            )}
            
            {/* Butoane acțiune */}
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors"
                disabled={uploading}
              >
                Anulează
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:opacity-90 text-white rounded-lg font-medium transition-all flex items-center"
                disabled={uploading}
              >
                {uploading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Se încarcă...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4 mr-2" />
                    Încarcă
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default MaterialUploadModal;