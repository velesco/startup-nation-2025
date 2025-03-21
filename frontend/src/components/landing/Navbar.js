import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X } from 'lucide-react';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="bg-white shadow-sm py-4 w-full z-20 sticky top-0">
      <div className="container mx-auto px-6 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center space-x-2">
          <div className="h-10 w-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold text-xl">
            SN
          </div>
          <span className="font-semibold text-gray-800 hidden sm:block">Startup Nation 2025</span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-6">
          <Link to="/" className="text-gray-700 hover:text-blue-600 font-medium">
            Acasă
          </Link>
          <Link to="/despre-program" className="text-gray-700 hover:text-blue-600 font-medium">
            Despre Program
          </Link>
          <Link to="/login?role=trainer" className="text-gray-700 hover:text-blue-600 font-medium">
            Formatori
          </Link>
          <Link to="/login?role=partner" className="text-gray-700 hover:text-blue-600 font-medium">
            Parteneri
          </Link>
          <Link 
            to="/login" 
            className="bg-white border border-blue-600 text-blue-600 hover:bg-blue-50 px-4 py-2 rounded-lg font-medium transition-colors"
          >
            Login
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <div className="md:hidden">
          <button 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="text-gray-700 hover:text-blue-600 focus:outline-none"
          >
            {isMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-t mt-4 py-2">
          <div className="container mx-auto px-6 space-y-1">
            <Link 
              to="/" 
              className="block py-2 text-gray-700 hover:bg-gray-50 rounded-md"
              onClick={() => setIsMenuOpen(false)}
            >
              Acasă
            </Link>
            <Link 
              to="/despre-program" 
              className="block py-2 text-gray-700 hover:bg-gray-50 rounded-md"
              onClick={() => setIsMenuOpen(false)}
            >
              Despre Program
            </Link>
            <Link 
              to="/login?role=trainer" 
              className="block py-2 text-gray-700 hover:bg-gray-50 rounded-md"
              onClick={() => setIsMenuOpen(false)}
            >
              Formatori
            </Link>
            <Link 
              to="/login?role=partner" 
              className="block py-2 text-gray-700 hover:bg-gray-50 rounded-md"
              onClick={() => setIsMenuOpen(false)}
            >
              Parteneri
            </Link>
            
            <div className="pt-2">
              <Link 
                to="/login" 
                className="block w-full text-center bg-white border border-blue-600 text-blue-600 hover:bg-blue-50 px-4 py-2 rounded-lg font-medium transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Login
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;