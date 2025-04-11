import React, { useState } from 'react';
import { Save, X, User, Mail, Phone, Building, Shield, CreditCard } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const EditUserForm = ({ user, onSubmit, onCancel }) => {
  const { currentUser } = useAuth();
  const [formData, setFormData] = useState({
    name: user.name || '',
    email: user.email || '',
    phone: user.phone || '',
    organization: user.organization || '',
    position: user.position || '',
    role: user.role || 'user',
    isActive: user.isActive !== undefined ? user.isActive : true,
    // Date buletin
    idCardFullName: user.idCard?.fullName || user.name || '',
    idCardSeries: user.idCard?.series || '',
    idCardNumber: user.idCard?.number || '',
    cnp: user.idCard?.CNP || '',
    idCardIssuedBy: user.idCard?.issuedBy || '',
    idCardIssueDate: user.idCard?.issueDate ? new Date(user.idCard.issueDate).toISOString().split('T')[0] : '',
    idCardExpiryDate: user.idCard?.expiryDate ? new Date(user.idCard.expiryDate).toISOString().split('T')[0] : '',
    idCardAddress: user.idCard?.address || ''
  });
  
  const [loading, setLoading] = useState(false);
  
  // Check if current user is allowed to modify certain fields
  const canChangeRole = currentUser && currentUser.role === 'admin';
  
  // Handle input changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };
  
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await onSubmit(formData);
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit}>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-800">Editare profil</h2>
        <div className="flex space-x-3">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 rounded-lg shadow-sm text-gray-700 bg-white hover:bg-gray-50 transition-colors flex items-center"
          >
            <X className="h-4 w-4 mr-2" />
            Anulează
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg shadow-sm hover:bg-blue-700 transition-colors flex items-center"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                <span>Se salvează...</span>
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                <span>Salvează</span>
              </>
            )}
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left column */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nume complet</label>
            <div className="relative">
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Nume și prenume"
                required
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User className="h-5 w-5 text-gray-400" />
              </div>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <div className="relative">
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="email@exemplu.com"
                required
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-gray-400" />
              </div>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Telefon</label>
            <div className="relative">
              <input
                type="text"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="07xx xxx xxx"
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Phone className="h-5 w-5 text-gray-400" />
              </div>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date Buletin</label>
            <div className="relative space-y-3 p-3 border border-gray-200 rounded-lg">
              <div className="absolute top-0 left-3 transform -translate-y-1/2 bg-white px-2">
                <CreditCard className="h-5 w-5 text-gray-400 inline-block mr-1" />
                <span className="text-xs font-medium text-gray-500">Informații CI/BI</span>
              </div>
              
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Nume complet pe buletin</label>
                <input
                  type="text"
                  name="idCardFullName"
                  value={formData.idCardFullName}
                  onChange={handleChange}
                  className="px-3 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  placeholder="Numele complet din buletin"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Serie</label>
                  <input
                    type="text"
                    name="idCardSeries"
                    value={formData.idCardSeries}
                    onChange={handleChange}
                    className="px-3 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                    placeholder="XX"
                  />
                </div>
                
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Număr</label>
                  <input
                    type="text"
                    name="idCardNumber"
                    value={formData.idCardNumber}
                    onChange={handleChange}
                    className="px-3 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                    placeholder="123456"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">CNP</label>
                <input
                  type="text"
                  name="cnp"
                  value={formData.cnp}
                  onChange={handleChange}
                  className="px-3 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  placeholder="1234567890123"
                />
              </div>
              
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Emisă de</label>
                <input
                  type="text"
                  name="idCardIssuedBy"
                  value={formData.idCardIssuedBy}
                  onChange={handleChange}
                  className="px-3 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  placeholder="SPCLEP Sector X"
                />
              </div>
              
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Data emiterii</label>
                <input
                  type="date"
                  name="idCardIssueDate"
                  value={formData.idCardIssueDate}
                  onChange={handleChange}
                  className="px-3 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                />
              </div>
              
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Data expirării</label>
                <input
                  type="date"
                  name="idCardExpiryDate"
                  value={formData.idCardExpiryDate}
                  onChange={handleChange}
                  className="px-3 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                />
              </div>
              
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Adresă</label>
                <input
                  type="text"
                  name="idCardAddress"
                  value={formData.idCardAddress}
                  onChange={handleChange}
                  className="px-3 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  placeholder="Adresa din buletin"
                />
              </div>
            </div>
          </div>
        </div>
        
        {/* Right column */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Organizație</label>
            <div className="relative">
              <input
                type="text"
                name="organization"
                value={formData.organization}
                onChange={handleChange}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Nume organizație (opțional)"
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Building className="h-5 w-5 text-gray-400" />
              </div>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Poziție</label>
            <input
              type="text"
              name="position"
              value={formData.position}
              onChange={handleChange}
              className="px-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Poziție în organizație (opțional)"
            />
          </div>
          
          <div className="flex space-x-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Rol</label>
              <div className="relative">
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  disabled={!canChangeRole}
                >
                  <option value="user">Utilizator</option>
                  <option value="client">Client</option>
                  <option value="partner">Partener</option>
                  {canChangeRole && <option value="admin">Administrator</option>}
                </select>
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Shield className="h-5 w-5 text-gray-400" />
                </div>
              </div>
              {!canChangeRole && (
                <p className="mt-1 text-xs text-gray-500">
                  Doar administratorii pot schimba rolurile utilizatorilor.
                </p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Activ</label>
              <div className="mt-1 flex items-center">
                <input
                  type="checkbox"
                  name="isActive"
                  checked={formData.isActive}
                  onChange={handleChange}
                  className="h-5 w-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">
                  {formData.isActive ? 'Cont activ' : 'Cont inactiv'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
};

export default EditUserForm;