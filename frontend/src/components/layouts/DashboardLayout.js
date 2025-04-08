import React, { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  BookOpen, 
  BarChart2, 
  LogOut,
  ChevronDown,
  Shield,
  UserCircle2,
  Menu,
  X
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const DashboardLayout = ({ children }) => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showDropdown, setShowDropdown] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Verificăm pagina curentă pentru a evidenția linkul activ
  const isActive = (path) => {
    return location.pathname.includes(path);
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Eroare la delogare:', error);
    }
  };

  // Obține inițialele utilizatorului pentru avatar
  const getUserInitials = () => {
    if (!currentUser || !currentUser.name) return 'UN';
    
    const nameParts = currentUser.name.split(' ');
    if (nameParts.length === 1) return nameParts[0].charAt(0).toUpperCase();
    
    return (nameParts[0].charAt(0) + nameParts[nameParts.length - 1].charAt(0)).toUpperCase();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      {/* Header */}
      <header className="bg-white/70 backdrop-blur-md border-b border-gray-100 sticky top-0 z-30">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center h-20">
            {/* Logo */}
            <div className="flex items-center">
              <div className="h-10 w-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold text-lg mr-3 shadow-md">
                SN
              </div>
              <div className="hidden sm:block">
                <div className="text-lg font-bold text-gray-800">Startup Nation 2025</div>
                <div className="text-xs text-gray-500">Dashboard</div>
              </div>
            </div>
            
            {/* Mobile Menu Toggle Button */}
            <button
              className="md:hidden p-2 rounded-md text-gray-700 hover:bg-gray-100 focus:outline-none"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
            
            {/* User Menu - Desktop */}
            <div className="hidden md:flex items-center space-x-4">
              {/* User Profile Menu */}
              <div className="relative">
                <button 
                  className="flex items-center space-x-3 focus:outline-none"
                  onClick={() => setShowDropdown(!showDropdown)}
                >
                  <div className="flex flex-col items-end">
                    <span className="font-medium text-gray-700">
                      {currentUser?.organization || currentUser?.name || 'Utilizator'}
                    </span>
                    <span className="text-xs text-gray-500">
                      {currentUser?.position || currentUser?.role || 'Nespecificat'}
                    </span>
                  </div>
                  <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white shadow-md">
                    {getUserInitials()}
                  </div>
                  <ChevronDown className="h-4 w-4 text-gray-400" />
                </button> 
                
                {/* Dropdown Menu */}
                {showDropdown && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg overflow-hidden z-50">
                    <div className="p-3 border-b border-gray-100">
                      <p className="text-sm font-medium text-gray-700">{currentUser?.name}</p>
                      <p className="text-xs text-gray-500">{currentUser?.email}</p>
                    </div>
                    <div className="py-1">
                      <button
                        onClick={() => {
                          setShowDropdown(false);
                          navigate('/profile');
                        }}
                        className="w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 text-left"
                      >
                        Profil
                      </button>
                      <button
                        onClick={() => {
                          setShowDropdown(false);
                          navigate('/settings');
                        }}
                        className="w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 text-left"
                      >
                        Setări
                      </button>
                      <button
                        onClick={() => {
                          setShowDropdown(false);
                          handleLogout();
                        }}
                        className="w-full px-4 py-2 text-sm text-red-600 hover:bg-gray-100 text-left flex items-center"
                      >
                        <LogOut className="h-4 w-4 mr-2" />
                        Deconectare
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>
      
      {/* Navigation */}
      <nav className="bg-white/70 backdrop-blur-md border-b border-gray-100 sticky top-20 z-20 hidden md:block">
        <div className="container mx-auto px-4">
          <div className="flex space-x-8 h-15">
            <Link
              to="/admin/dashboard"
              className={`flex items-center px-2 py-4 ${isActive('/admin/dashboard') ? 'text-blue-600 border-b-2 border-blue-600 font-medium' : 'text-gray-500 hover:text-gray-700'}`}
            >
              <LayoutDashboard className="h-5 w-5 mr-2" />
              Dashboard
            </Link>
            
            <Link
              to="/admin/clients"
              className={`flex items-center px-2 py-4 ${isActive('/admin/clients') ? 'text-blue-600 border-b-2 border-blue-600 font-medium' : 'text-gray-500 hover:text-gray-700'}`}
            >
              <Users className="h-5 w-5 mr-2" />
              Clienți
            </Link>
            
            {/* Users link - visible only for admin users */}
            {currentUser && currentUser.role === 'admin' && (
              <Link
                to="/admin/users"
                className={`flex items-center px-2 py-4 ${isActive('/admin/users') ? 'text-blue-600 border-b-2 border-blue-600 font-medium' : 'text-gray-500 hover:text-gray-700'}`}
              >
                <Shield className="h-5 w-5 mr-2" />
                Utilizatori
              </Link>
            )}
            
            <Link
              to="/admin/groups"
              className={`flex items-center px-2 py-4 ${isActive('/admin/groups') ? 'text-blue-600 border-b-2 border-blue-600 font-medium' : 'text-gray-500 hover:text-gray-700'}`}
            >
              <BookOpen className="h-5 w-5 mr-2" />
              Grupe
            </Link>
            
            <Link
              to="/admin/reports"
              className={`flex items-center px-2 py-4 ${isActive('/admin/reports') ? 'text-blue-600 border-b-2 border-blue-600 font-medium' : 'text-gray-500 hover:text-gray-700'}`}
            >
              <BarChart2 className="h-5 w-5 mr-2" />
              Rapoarte
            </Link>
          </div>
        </div>
      </nav>
      
      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-gray-200 z-40">
          <div className="container mx-auto px-4 py-2">
            <div className="flex flex-col">
              {/* Mobile Nav Links */}
              <Link
                to="/admin/dashboard"
                className={`flex items-center py-3 px-4 ${isActive('/admin/dashboard') ? 'bg-blue-50 text-blue-600 font-medium rounded-lg' : 'text-gray-600'}`}
                onClick={() => setMobileMenuOpen(false)}
              >
                <LayoutDashboard className="h-5 w-5 mr-3" />
                Dashboard
              </Link>
              
              <Link
                to="/admin/clients"
                className={`flex items-center py-3 px-4 ${isActive('/admin/clients') ? 'bg-blue-50 text-blue-600 font-medium rounded-lg' : 'text-gray-600'}`}
                onClick={() => setMobileMenuOpen(false)}
              >
                <Users className="h-5 w-5 mr-3" />
                Clienți
              </Link>
              
              {currentUser && currentUser.role === 'admin' && (
                <Link
                  to="/admin/users"
                  className={`flex items-center py-3 px-4 ${isActive('/admin/users') ? 'bg-blue-50 text-blue-600 font-medium rounded-lg' : 'text-gray-600'}`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Shield className="h-5 w-5 mr-3" />
                  Utilizatori
                </Link>
              )}
              
              <Link
                to="/admin/groups"
                className={`flex items-center py-3 px-4 ${isActive('/admin/groups') ? 'bg-blue-50 text-blue-600 font-medium rounded-lg' : 'text-gray-600'}`}
                onClick={() => setMobileMenuOpen(false)}
              >
                <BookOpen className="h-5 w-5 mr-3" />
                Grupe
              </Link>
              
              <Link
                to="/admin/reports"
                className={`flex items-center py-3 px-4 ${isActive('/admin/reports') ? 'bg-blue-50 text-blue-600 font-medium rounded-lg' : 'text-gray-600'}`}
                onClick={() => setMobileMenuOpen(false)}
              >
                <BarChart2 className="h-5 w-5 mr-3" />
                Rapoarte
              </Link>
              
              {/* Mobile User Info and Logout */}
              <div className="border-t border-gray-100 my-2 pt-2">
                <div className="flex items-center px-4 py-3">
                  <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white shadow-md mr-3">
                    {getUserInitials()}
                  </div>
                  <div>
                    <div className="font-medium text-gray-700">
                      {currentUser?.name || 'Utilizator'}
                    </div>
                    <div className="text-xs text-gray-500">
                      {currentUser?.email || ''}
                    </div>
                  </div>
                </div>
                
                <div className="px-4 pb-3">
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      navigate('/profile');
                    }}
                    className="w-full flex items-center py-2 px-3 text-sm text-gray-700 hover:bg-gray-100 rounded-lg mb-1"
                  >
                    <UserCircle2 className="h-4 w-4 mr-2" />
                    Profil
                  </button>
                  
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      handleLogout();
                    }}
                    className="w-full flex items-center py-2 px-3 text-sm text-red-600 hover:bg-red-50 rounded-lg"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Deconectare
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Main Content */}
      <main className="py-6 px-4">
        {children}
      </main>
      
      {/* Footer */}
      <footer className="bg-white/50 py-4 border-t border-gray-100">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-2 md:space-y-0">
            <div className="text-sm text-gray-500 text-center md:text-left">
              &copy; {new Date().getFullYear()} Startup Nation 2025. Toate drepturile rezervate.
            </div>
            <div className="text-sm text-gray-500">
              Versiunea 1.0.0
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default DashboardLayout;