import React from 'react';
import { X, Download, Share, FileText, Clock, User, Calendar } from 'lucide-react';

const MaterialViewModal = ({ isOpen, onClose, material, onDownload, onShare }) => {
  if (!isOpen || !material) return null;
  
  // Funcție pentru afișarea icon-ului corespunzător tipului de fișier
  const getFileIcon = (fileType) => {
    switch (fileType) {
      case 'pdf':
        return <FileText className="h-12 w-12 text-red-500" />;
      case 'doc':
      case 'docx':
        return <FileText className="h-12 w-12 text-blue-500" />;
      case 'xls':
      case 'xlsx':
        return <FileText className="h-12 w-12 text-green-500" />;
      case 'ppt':
      case 'pptx':
        return <FileText className="h-12 w-12 text-orange-500" />;
      case 'jpg':
      case 'jpeg':
      case 'png':
        return <FileText className="h-12 w-12 text-purple-500" />;
      default:
        return <FileText className="h-12 w-12 text-gray-500" />;
    }
  };
  
  // Funcție pentru afișarea dimensiunii fișierului într-un format citibil
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };
  
  // Formatare dată pentru afișare
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('ro-RO', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4">
        <div className="fixed inset-0 bg-black bg-opacity-30 backdrop-blur-sm" onClick={onClose}></div>
        
        <div className="relative bg-white/90 rounded-2xl shadow-xl max-w-md w-full p-6 z-10">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-800 truncate">
              {material.name}
            </h2>
            <button 
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
          
          <div className="bg-gray-50 rounded-lg p-6 mb-4 flex flex-col items-center">
            {getFileIcon(material.fileType)}
            <p className="mt-3 text-sm font-medium text-gray-600">
              {material.fileType ? material.fileType.toUpperCase() : 'Fișier'}
            </p>
          </div>
          
          <div className="space-y-4">
            {material.description && (
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-1">Descriere</h3>
                <p className="text-sm text-gray-600">{material.description}</p>
              </div>
            )}
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-1">Dimensiune</h3>
                <p className="text-sm text-gray-600">{formatFileSize(material.size)}</p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-1">Tip</h3>
                <p className="text-sm text-gray-600">{material.fileType}</p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-1">Încărcat de</h3>
                <div className="flex items-center">
                  <User className="h-3 w-3 text-gray-400 mr-1" />
                  <p className="text-sm text-gray-600">{material.uploadedBy || 'N/A'}</p>
                </div>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-1">Data</h3>
                <div className="flex items-center">
                  <Calendar className="h-3 w-3 text-gray-400 mr-1" />
                  <p className="text-sm text-gray-600">{formatDate(material.createdAt)}</p>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-1">Ultima modificare</h3>
              <div className="flex items-center">
                <Clock className="h-3 w-3 text-gray-400 mr-1" />
                <p className="text-sm text-gray-600">{formatDate(material.updatedAt)}</p>
              </div>
            </div>
          </div>
          
          <div className="mt-6 grid grid-cols-2 gap-3">
            <button
              onClick={onDownload}
              className="flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Download className="h-4 w-4 mr-2" />
              Descarcă
            </button>
            <button
              onClick={onShare}
              className="flex items-center justify-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <Share className="h-4 w-4 mr-2" />
              Partajează
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MaterialViewModal;