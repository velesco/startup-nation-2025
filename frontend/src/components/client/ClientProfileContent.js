import React from 'react';
import { User, Mail, Phone, LogOut, Settings } from 'lucide-react';

const ClientProfileContent = ({ user, onLogout }) => {
  return (
    <div className="bg-white/70 backdrop-blur-md rounded-3xl p-6 mb-8 shadow-lg border border-white/50">
      <div className="flex flex-col items-center mb-6">
        <div className="w-24 h-24 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-3xl font-bold shadow-lg mb-4">
          {user.name.split(' ').map(n => n[0]).join('')}
        </div>
        <h2 className="text-xl font-bold mb-1 text-gray-800">{user.name}</h2>
        <p className="text-sm text-gray-500">Participant Startup Nation</p>
      </div>

      <div className="space-y-4 mb-8">
        <div className="flex items-center p-3 bg-white/80 rounded-xl shadow-sm">
          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mr-3">
            <Mail className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <p className="text-xs text-gray-500">Email</p>
            <p className="text-sm font-medium text-gray-800">{user.email}</p>
          </div>
        </div>

        <div className="flex items-center p-3 bg-white/80 rounded-xl shadow-sm">
          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mr-3">
            <Phone className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <p className="text-xs text-gray-500">Telefon</p>
            <p className="text-sm font-medium text-gray-800">{user.phone}</p>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <button className="w-full bg-white/80 text-gray-700 py-3 rounded-xl font-medium shadow-sm hover:shadow-md transition-all duration-300 flex items-center justify-center">
          <Settings className="h-5 w-5 mr-2 text-gray-500" />
          <span>Setări cont</span>
        </button>
        
        <button 
          onClick={onLogout}
          className="w-full bg-gradient-to-r from-red-500 to-pink-500 text-white py-3 rounded-xl font-medium shadow-md hover:shadow-lg transition-all duration-300 flex items-center justify-center"
        >
          <LogOut className="h-5 w-5 mr-2" />
          <span>Deconectare</span>
        </button>
      </div>
    </div>
  );
};

export default ClientProfileContent;