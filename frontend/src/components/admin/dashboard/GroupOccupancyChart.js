import React, { useState, useRef, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useNavigate } from 'react-router-dom';
import { Users, Edit2, Trash2 } from 'lucide-react';

const GroupOccupancyChart = ({ data }) => {
  const navigate = useNavigate();
  const [selectedGroup, setSelectedGroup] = useState(null);
  const menuRef = useRef(null);

  // Handle closing menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setSelectedGroup(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Asigurăm-ne că avem date valide
  if (!data || !Array.isArray(data) || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 bg-gray-50 rounded-lg">
        <p className="text-gray-500">Nu există date disponibile pentru afișare.</p>
      </div>
    );
  }
  
  // Formatăm datele pentru chart și evităm erorile
  const chartData = data
    .filter(group => group && typeof group === 'object') // Ne asigurăm că avem obiecte valide
    .map(group => ({
      id: group.id || group._id, // Adăugăm ID-ul grupei pentru a putea naviga către detalii
      name: typeof group.name === 'string' ? group.name : (group.name ? JSON.stringify(group.name) : 'Grupă necunoscută'),
      occupancyRate: group.percentage ? parseFloat(group.percentage.toFixed(1)) : 0,
      capacity: group.capacity || 0,
      participants: group.participants || 0
    }));
  
  // Dacă după filtrare nu mai avem date, afișăm mesajul corespunzător
  if (chartData.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 bg-gray-50 rounded-lg">
        <p className="text-gray-500">Nu există date valide pentru afișare.</p>
      </div>
    );
  }

  const handleBarClick = (data) => {
    // Când se face click pe o bară, deschidem meniul pentru grupa respectivă
    setSelectedGroup(data.id);
  };

  const handleViewGroup = (groupId, e) => {
    e.stopPropagation();
    navigate(`/admin/groups/${groupId}`);
    setSelectedGroup(null);
  };

  const handleEditGroup = (groupId, e) => {
    e.stopPropagation();
    // Logica de editare ar trebui implementată aici
    alert('Funcționalitate în curs de implementare: Editare grupă');
    setSelectedGroup(null);
  };

  const handleDeleteGroup = (groupId, e) => {
    e.stopPropagation();
    if (window.confirm('Sigur doriți să ștergeți această grupă? Această acțiune este ireversibilă.')) {
      // Logica de ștergere ar trebui implementată aici
      alert('Funcționalitate în curs de implementare: Ștergere grupă');
    }
    setSelectedGroup(null);
  };
  
  return (
    <div className="h-64 relative">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData}
          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
          onClick={(e) => e && e.activePayload && handleBarClick(e.activePayload[0].payload)}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis domain={[0, 100]} />
          <Tooltip 
            formatter={(value) => [`${value}%`, 'Ocupare']}
            labelFormatter={(label) => `Grupa: ${label}`}
          />
          <Bar 
            dataKey="occupancyRate" 
            name="Ocupare" 
            fill="#3B82F6" 
            radius={[4, 4, 0, 0]} 
            cursor="pointer"
          />
        </BarChart>
      </ResponsiveContainer>

      {/* Meniu contextual pentru grupă */}
      {selectedGroup && (
        <div 
          ref={menuRef}
          className="absolute z-10 bg-white rounded-md shadow-lg py-1 text-sm"
          style={{
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)'
          }}
        >
          <button 
            className="block px-4 py-2 text-gray-700 hover:bg-gray-100 w-full text-left flex items-center"
            onClick={(e) => handleViewGroup(selectedGroup, e)}
          >
            <Users className="h-4 w-4 mr-2" />
            Vizualizare grupă
          </button>
          <button 
            className="block px-4 py-2 text-gray-700 hover:bg-gray-100 w-full text-left flex items-center"
            onClick={(e) => handleEditGroup(selectedGroup, e)}
          >
            <Edit2 className="h-4 w-4 mr-2" />
            Editare grupă
          </button>
          <button 
            className="block px-4 py-2 text-red-600 hover:bg-gray-100 w-full text-left flex items-center"
            onClick={(e) => handleDeleteGroup(selectedGroup, e)}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Ștergere grupă
          </button>
        </div>
      )}
    </div>
  );
};

export default GroupOccupancyChart;