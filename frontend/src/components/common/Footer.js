import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-gradient-blue-purple text-white py-12 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-8 bg-gray-50 rounded-b-[50%]"></div>
      
      <div className="container mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          <div>
            <div className="flex items-center mb-6">
              <div className="h-10 w-10 bg-white rounded-xl flex items-center justify-center text-blue-600 font-bold text-lg shadow-md mr-3">
                SN
              </div>
              <span className="text-xl font-bold">Startup Nation 2025</span>
            </div>
            <p className="text-blue-50 mb-6">
              Program de finanțare pentru antreprenori susținut de Guvernul României.
              Transformă-ți ideea într-o afacere de succes cu ajutorul nostru.
            </p>
          </div>
          
          
          <div>
            <h3 className="text-lg font-semibold mb-6">Contact</h3>
            <ul className="space-y-3">
              <li className="flex items-start">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3 mt-0.5 text-blue-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <span className="text-blue-50">contact@aplica-startup.ro</span>
              </li>
              <li className="flex items-start">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3 mt-0.5 text-blue-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                <span className="text-blue-50">0800 123 456</span>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-blue-400/30 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-blue-100 text-sm mb-4 md:mb-0">
            &copy; {currentYear} Startup Nation 2025. Toate drepturile rezervate.
          </p>
          <div className="flex space-x-6">
            <a href="#" className="text-blue-100 text-sm hover:text-white transition-colors duration-300">
              Termeni și condiții
            </a>
            <a href="#" className="text-blue-100 text-sm hover:text-white transition-colors duration-300">
              Politica de confidențialitate
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
