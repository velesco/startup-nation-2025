import React from 'react';
import { User, Mail, Phone, Calendar, Users } from 'lucide-react';

const ClientInfoCard = ({ client }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm h-full p-4">
      <h3 className="text-lg font-semibold text-gray-800 mb-3">Informații client</h3>
      <div className="h-px bg-gray-200 mb-4"></div>
      
      <div className="space-y-3">
        <div className="flex items-start">
          <div className="mt-0.5 mr-3 text-blue-500">
            <User size={18} />
          </div>
          <div>
            <p className="text-sm text-gray-500">Nume</p>
            <p className="font-medium text-gray-800">{client.name}</p>
          </div>
        </div>
        
        <div className="flex items-start">
          <div className="mt-0.5 mr-3 text-blue-500">
            <Mail size={18} />
          </div>
          <div>
            <p className="text-sm text-gray-500">Email</p>
            <p className="font-medium text-gray-800 break-all">{client.email}</p>
          </div>
        </div>
        
        <div className="flex items-start">
          <div className="mt-0.5 mr-3 text-blue-500">
            <Phone size={18} />
          </div>
          <div>
            <p className="text-sm text-gray-500">Telefon</p>
            <p className="font-medium text-gray-800">{client.phone}</p>
          </div>
        </div>
        
        <div className="flex items-start">
          <div className="mt-0.5 mr-3 text-blue-500">
            <Calendar size={18} />
          </div>
          <div>
            <p className="text-sm text-gray-500">Data înregistrării</p>
            <p className="font-medium text-gray-800">{client.registrationDate}</p>
          </div>
        </div>
        
        <div className="flex items-start">
          <div className="mt-0.5 mr-3 text-blue-500">
            <Users size={18} />
          </div>
          <div>
            <p className="text-sm text-gray-500">Grupă</p>
            <div className="mt-1">
              {client.group ? (
                <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
                  {client.group}
                </span>
              ) : (
                <span className="text-gray-500 text-sm">Nealocat</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientInfoCard;