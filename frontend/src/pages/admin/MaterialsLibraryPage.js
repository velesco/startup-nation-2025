import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  Search, 
  Filter, 
  FolderPlus, 
  File, 
  Folder, 
  MoreHorizontal, 
  Download, 
  Edit, 
  Trash2, 
  Share, 
  Upload,
  X,
  AlertCircle,
  CheckCircle,
  Eye
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import DashboardLayout from '../../components/layouts/DashboardLayout';
import LoadingScreen from '../../components/client/LoadingScreen';
import MaterialUploadModal from '../../components/admin/materials/MaterialUploadModal';
import MaterialViewModal from '../../components/admin/materials/MaterialViewModal';
import MaterialShareModal from '../../components/admin/materials/MaterialShareModal';

const MaterialsLibraryPage = () => {
  const navigate = useNavigate();
  const { currentUser, isAuthenticated } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [materials, setMaterials] = useState([]);
  const [folders, setFolders] = useState([]);
  const [currentFolder, setCurrentFolder] = useState(null);
  const [folderPath, setFolderPath] = useState([{ id: null, name: 'Biblioteca de materiale' }]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  
  // State pentru modale
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isCreateFolderModalOpen, setIsCreateFolderModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [selectedMaterial, setSelectedMaterial] = useState(null);
  const [newFolderName, setNewFolderName] = useState('');
  
  // Verificăm dacă utilizatorul este autentificat și are rolul potrivit
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    } else if (currentUser && currentUser.role !== 'admin' && currentUser.role !== 'partner') {
      navigate('/');
    }
  }, [isAuthenticated, currentUser, navigate]);
  
  // Încărcarea materialelor și folderelor
  const fetchMaterials = async () => {
    try {
      setLoading(true);
      const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5003/api';
      
      const response = await axios.get(`${API_URL}/admin/materials`, {
        params: {
          folderId: currentFolder,
          fileType: selectedFilter !== 'all' ? selectedFilter : undefined,
          search: searchTerm || undefined
        },
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.data && response.data.success) {
        setMaterials(response.data.data.materials || []);
        setFolders(response.data.data.folders || []);
      } else {
        throw new Error(response.data?.message || 'Failed to load materials');
      }
    } catch (err) {
      console.error('Error loading materials:', err);
      setError('Nu s-au putut încărca materialele. Vă rugăm să încercați din nou.');
    } finally {
      setLoading(false);
    }
  };
  
  // Inițializare și actualizare când se schimbă folder-ul curent sau filtrele
  useEffect(() => {
    if (isAuthenticated && currentUser) {
      fetchMaterials();
    }
  }, [isAuthenticated, currentUser, currentFolder, selectedFilter, searchTerm]);
  
  // Funcție pentru navigarea într-un folder
  const navigateToFolder = (folder) => {
    const newPath = [...folderPath];
    
    // Verificăm dacă folderul este deja în cale (navigare înapoi)
    const existingIndex = newPath.findIndex(item => item.id === folder.id);
    
    if (existingIndex !== -1) {
      // Dacă folderul există deja, tăiem calea până la acel punct
      newPath.splice(existingIndex + 1);
    } else {
      // Altfel adăugăm folderul la cale
      newPath.push({ id: folder.id, name: folder.name });
    }
    
    setFolderPath(newPath);
    setCurrentFolder(folder.id);
  };
  
  // Funcție pentru crearea unui nou folder
  const createFolder = async () => {
    if (!newFolderName.trim()) {
      setError('Introduceți un nume pentru folder.');
      return;
    }
    
    try {
      const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5003/api';
      
      const response = await axios.post(
        `${API_URL}/admin/materials/folders`,
        { 
          name: newFolderName,
          parentId: currentFolder 
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      
      if (response.data && response.data.success) {
        setSuccess('Folder creat cu succes!');
        setNewFolderName('');
        setIsCreateFolderModalOpen(false);
        fetchMaterials();
        
        // Resetăm mesajul de succes după 3 secunde
        setTimeout(() => {
          setSuccess(null);
        }, 3000);
      } else {
        throw new Error(response.data?.message || 'Failed to create folder');
      }
    } catch (err) {
      console.error('Error creating folder:', err);
      setError(err.response?.data?.message || 'Nu s-a putut crea folderul. Vă rugăm să încercați din nou.');
    }
  };
  
  // Funcție pentru descărcarea unui material
  const downloadMaterial = async (material) => {
    try {
      const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5003/api';
      
      const response = await axios.get(
        `${API_URL}/admin/materials/${material.id}/download`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          },
          responseType: 'blob'
        }
      );
      
      // Creăm un URL pentru blob și descărcăm fișierul
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', material.name);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error('Error downloading material:', err);
      setError('Nu s-a putut descărca materialul. Vă rugăm să încercați din nou.');
    }
  };
  
  // Funcție pentru ștergerea unui material sau folder
  const deleteMaterial = async (material, isFolder = false) => {
    if (!window.confirm(`Sigur doriți să ștergeți ${isFolder ? 'acest folder' : 'acest material'}?`)) {
      return;
    }
    
    try {
      const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5003/api';
      
      const endpoint = isFolder 
        ? `${API_URL}/admin/materials/folders/${material.id}`
        : `${API_URL}/admin/materials/${material.id}`;
      
      const response = await axios.delete(
        endpoint,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      
      if (response.data && response.data.success) {
        setSuccess(`${isFolder ? 'Folder' : 'Material'} șters cu succes!`);
        fetchMaterials();
        
        // Resetăm mesajul de succes după 3 secunde
        setTimeout(() => {
          setSuccess(null);
        }, 3000);
      } else {
        throw new Error(response.data?.message || `Failed to delete ${isFolder ? 'folder' : 'material'}`);
      }
    } catch (err) {
      console.error(`Error deleting ${isFolder ? 'folder' : 'material'}:`, err);
      setError(err.response?.data?.message || `Nu s-a putut șterge ${isFolder ? 'folderul' : 'materialul'}. Vă rugăm să încercați din nou.`);
    }
  };
  
  // Funcție pentru afișarea icon-ului corespunzător tipului de fișier
  const getFileIcon = (fileType) => {
    switch (fileType) {
      case 'pdf':
        return <File className="h-8 w-8 text-red-500" />;
      case 'doc':
      case 'docx':
        return <File className="h-8 w-8 text-blue-500" />;
      case 'xls':
      case 'xlsx':
        return <File className="h-8 w-8 text-green-500" />;
      case 'ppt':
      case 'pptx':
        return <File className="h-8 w-8 text-orange-500" />;
      case 'jpg':
      case 'jpeg':
      case 'png':
        return <File className="h-8 w-8 text-purple-500" />;
      default:
        return <File className="h-8 w-8 text-gray-500" />;
    }
  };
  
  // Handler pentru încărcarea unui material
  const handleUploadSuccess = () => {
    setSuccess('Material încărcat cu succes!');
    setIsUploadModalOpen(false);
    fetchMaterials();
    
    // Resetăm mesajul de succes după 3 secunde
    setTimeout(() => {
      setSuccess(null);
    }, 3000);
  };
  
  // Filtrarea materialelor în funcție de tip
  const filterOptions = [
    { id: 'all', name: 'Toate' },
    { id: 'pdf', name: 'PDF' },
    { id: 'doc', name: 'Word' },
    { id: 'xls', name: 'Excel' },
    { id: 'ppt', name: 'PowerPoint' },
    { id: 'image', name: 'Imagini' }
  ];
  
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
    return new Date(dateString).toLocaleDateString('ro-RO', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };
  
  if (loading && (!materials.length && !folders.length)) {
    return <LoadingScreen />;
  }
  
  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-6">
        {/* Header și acțiuni */}
        <div className="flex flex-wrap justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Biblioteca de materiale</h1>
          
          <div className="flex space-x-2 mt-4 sm:mt-0">
            <button
              className="flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              onClick={() => setIsCreateFolderModalOpen(true)}
            >
              <FolderPlus className="h-4 w-4 mr-2" />
              Folder nou
            </button>
            <button
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              onClick={() => setIsUploadModalOpen(true)}
            >
              <Upload className="h-4 w-4 mr-2" />
              Încarcă material
            </button>
          </div>
        </div>
        
        {/* Alerte de succes/eroare */}
        {success && (
          <div className="mb-4 bg-green-50 border-l-4 border-green-500 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <CheckCircle className="h-5 w-5 text-green-500" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-green-700">{success}</p>
              </div>
            </div>
          </div>
        )}
        
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
        
        {/* Bara de căutare și filtrare */}
        <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4 mb-6">
          <div className="md:flex-1">
            <div className="relative">
              <input
                type="text"
                placeholder="Caută materiale..."
                className="w-full h-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
            </div>
          </div>
          
          <div className="flex space-x-2">
            <div className="relative">
              <select
                value={selectedFilter}
                onChange={(e) => setSelectedFilter(e.target.value)}
                className="appearance-none pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {filterOptions.map(option => (
                  <option key={option.id} value={option.id}>{option.name}</option>
                ))}
              </select>
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Filter className="h-5 w-5 text-gray-400" />
              </div>
            </div>
          </div>
        </div>
        
        {/* Breadcrumbs pentru navigare */}
        <div className="flex items-center space-x-2 mb-4 text-sm">
          {folderPath.map((folder, index) => (
            <React.Fragment key={index}>
              {index > 0 && <span className="text-gray-500">/</span>}
              <button 
                className={`hover:text-blue-600 ${index === folderPath.length - 1 ? 'font-medium text-blue-600' : 'text-gray-600'}`}
                onClick={() => navigateToFolder(folder)}
              >
                {folder.name}
              </button>
            </React.Fragment>
          ))}
        </div>
        
        {/* Grid cu foldere și materiale */}
        <div className="bg-white rounded-xl shadow-sm">
          {folders.length === 0 && materials.length === 0 ? (
            <div className="py-12 text-center">
              <File className="mx-auto h-12 w-12 text-gray-300 mb-3" />
              <h3 className="text-lg font-medium text-gray-800 mb-2">Niciun material găsit</h3>
              <p className="text-gray-500 mb-4">Încărcați un material sau creați un folder pentru a începe.</p>
              <div className="flex justify-center space-x-3">
                <button
                  className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                  onClick={() => setIsCreateFolderModalOpen(true)}
                >
                  <FolderPlus className="h-4 w-4 mr-2 inline-block" />
                  Folder nou
                </button>
                <button
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  onClick={() => setIsUploadModalOpen(true)}
                >
                  <Upload className="h-4 w-4 mr-2 inline-block" />
                  Încarcă material
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4">
              {/* Foldere */}
              {folders.map((folder) => (
                <div 
                  key={folder.id}
                  className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer group"
                >
                  <div className="flex justify-between items-start">
                    <div 
                      className="flex items-center flex-1"
                      onClick={() => navigateToFolder(folder)}
                    >
                      <Folder className="h-8 w-8 text-yellow-500 mr-3 flex-shrink-0" />
                      <div className="overflow-hidden">
                        <h3 className="font-medium text-gray-800 truncate">{folder.name}</h3>
                        <p className="text-xs text-gray-500 mt-1">{folder.itemsCount || 0} elemente</p>
                      </div>
                    </div>
                    
                    <div className="relative">
                      <button className="text-gray-400 hover:text-gray-600 p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <MoreHorizontal className="h-5 w-5" />
                      </button>
                      
                      {/* Dropdown pentru acțiuni folder */}
                      <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10 hidden group-hover:block">
                        <button
                          className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                          onClick={() => deleteMaterial(folder, true)}
                        >
                          <Trash2 className="h-4 w-4 mr-2 text-red-500" />
                          Șterge folder
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              
              {/* Materiale */}
              {materials.map((material) => (
                <div 
                  key={material.id}
                  className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer group"
                >
                  <div className="flex justify-between items-start">
                    <div 
                      className="flex items-center flex-1"
                      onClick={() => {
                        setSelectedMaterial(material);
                        setIsViewModalOpen(true);
                      }}
                    >
                      {getFileIcon(material.fileType)}
                      <div className="ml-3 overflow-hidden">
                        <h3 className="font-medium text-gray-800 truncate">{material.name}</h3>
                        <div className="flex items-center text-xs text-gray-500 mt-1">
                          <span className="truncate">{formatFileSize(material.size)}</span>
                          <span className="mx-1">•</span>
                          <span>{formatDate(material.updatedAt)}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="relative">
                      <button className="text-gray-400 hover:text-gray-600 p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <MoreHorizontal className="h-5 w-5" />
                      </button>
                      
                      {/* Dropdown pentru acțiuni material */}
                      <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10 hidden group-hover:block">
                        <button
                          className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                          onClick={() => {
                            setSelectedMaterial(material);
                            setIsViewModalOpen(true);
                          }}
                        >
                          <Eye className="h-4 w-4 mr-2 text-blue-500" />
                          Vizualizează
                        </button>
                        <button
                          className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                          onClick={() => downloadMaterial(material)}
                        >
                          <Download className="h-4 w-4 mr-2 text-green-500" />
                          Descarcă
                        </button>
                        <button
                          className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                          onClick={() => {
                            setSelectedMaterial(material);
                            setIsShareModalOpen(true);
                          }}
                        >
                          <Share className="h-4 w-4 mr-2 text-blue-500" />
                          Partajează
                        </button>
                        <button
                          className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                          onClick={() => deleteMaterial(material)}
                        >
                          <Trash2 className="h-4 w-4 mr-2 text-red-500" />
                          Șterge
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        {/* Modal pentru creare folder */}
        {isCreateFolderModalOpen && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen px-4">
              <div className="fixed inset-0 bg-black bg-opacity-30 backdrop-blur-sm" onClick={() => setIsCreateFolderModalOpen(false)}></div>
              
              <div className="relative bg-white/90 rounded-2xl shadow-xl max-w-md w-full p-6 z-10">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold text-gray-800">Folder nou</h2>
                  <button 
                    onClick={() => setIsCreateFolderModalOpen(false)}
                    className="text-gray-500 hover:text-gray-700 transition-colors"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>
                
                <div className="mb-4">
                  <label htmlFor="folderName" className="block text-sm font-medium text-gray-700 mb-1">
                    Nume folder
                  </label>
                  <input
                    type="text"
                    id="folderName"
                    name="folderName"
                    value={newFolderName}
                    onChange={(e) => setNewFolderName(e.target.value)}
                    placeholder="Introduceți numele folderului"
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                    autoFocus
                  />
                </div>
                
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setIsCreateFolderModalOpen(false)}
                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors"
                  >
                    Anulează
                  </button>
                  <button
                    type="button"
                    onClick={createFolder}
                    className="px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:opacity-90 text-white rounded-lg font-medium transition-all"
                  >
                    Creează
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Modal pentru încărcare material */}
        {isUploadModalOpen && (
          <MaterialUploadModal
            isOpen={isUploadModalOpen}
            onClose={() => setIsUploadModalOpen(false)}
            onUploadSuccess={handleUploadSuccess}
            folderId={currentFolder}
          />
        )}
        
        {/* Modal pentru vizualizare material */}
        {isViewModalOpen && selectedMaterial && (
          <MaterialViewModal
            isOpen={isViewModalOpen}
            onClose={() => setIsViewModalOpen(false)}
            material={selectedMaterial}
            onDownload={() => downloadMaterial(selectedMaterial)}
            onShare={() => {
              setIsViewModalOpen(false);
              setIsShareModalOpen(true);
            }}
          />
        )}
        
        {/* Modal pentru partajare material */}
        {isShareModalOpen && selectedMaterial && (
          <MaterialShareModal
            isOpen={isShareModalOpen}
            onClose={() => setIsShareModalOpen(false)}
            material={selectedMaterial}
            onSuccess={() => {
              setSuccess('Material partajat cu succes!');
              setIsShareModalOpen(false);
              // Resetăm mesajul de succes după 3 secunde
              setTimeout(() => {
                setSuccess(null);
              }, 3000);
            }}
          />
        )}
      </div>
    </DashboardLayout>
  );
};

export default MaterialsLibraryPage;