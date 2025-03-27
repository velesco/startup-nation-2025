import React from 'react';
import { X } from 'lucide-react';
import SignatureCanvas from './SignatureCanvas';

const SignatureModal = ({ isOpen, onClose, onSave }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="w-full max-w-lg bg-white rounded-xl shadow-lg p-6 m-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold">Semnătură olografă</h3>
          <button 
            onClick={onClose}
            className="p-1 rounded-full hover:bg-gray-100"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>
        
        <p className="text-gray-600 mb-4">
          Semnătura ta olografă va apărea pe contract. Desenează-ți semnătura în zona de mai jos.
        </p>
        
        <SignatureCanvas onSave={onSave} onCancel={onClose} />
      </div>
    </div>
  );
};

export default SignatureModal;