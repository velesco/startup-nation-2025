import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const ParticipationChart = ({ data }) => {
  // Verificăm dacă avem date pentru afișare
  if (!data || !Array.isArray(data) || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 bg-gray-50 rounded-lg">
        <p className="text-gray-500">Nu există date disponibile pentru afișare.</p>
      </div>
    );
  }
  
  // Generam date de participare din datele primite, filtrând posibilele date invalide
  // și evitând potențialele erori
  const chartData = data
    .filter(meeting => meeting && typeof meeting === 'object' && meeting.date)
    .map(meeting => {
      // Calculam rata de participare ca raport între participanții prezenți și cei invitați
      // Prevedem toate cazurile de date lipsa sau invalide
      const totalParticipants = typeof meeting.totalParticipants === 'number' ? meeting.totalParticipants : 0;
      const presentParticipants = typeof meeting.presentParticipants === 'number' ? meeting.presentParticipants : 0;
      const participationRate = totalParticipants > 0 
        ? parseFloat((presentParticipants / totalParticipants * 100).toFixed(1)) 
        : 0;
      
      try {
        // Tratam cazul în care date este un string invalid
        new Date(meeting.date);
      } catch (e) {
        // Dacă data nu poate fi convertită, folosim data curentă
        console.warn('Data invalidă pentru întâlnire:', meeting);
        meeting.date = new Date().toISOString();
      }
      
      return {
        date: meeting.date,
        name: meeting.title || meeting.name || 'Întâlnire necunoscută',
        participationRate,
        totalParticipants,
        presentParticipants
      };
    });
  
  // Dacă după filtrare nu mai avem date, afișăm mesajul corespunzător
  if (chartData.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 bg-gray-50 rounded-lg">
        <p className="text-gray-500">Nu există date valide pentru afișare.</p>
      </div>
    );
  }
  
  // Formator pentru data în axa X cu tratarea erorilor
  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return 'Data invalidă';
      }
      return date.toLocaleDateString('ro-RO', { day: '2-digit', month: '2-digit' });
    } catch (e) {
      return 'Data invalidă';
    }
  };
  
  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={chartData}
          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="date" 
            tickFormatter={formatDate}
            minTickGap={15}
          />
          <YAxis domain={[0, 100]} />
          <Tooltip 
            formatter={(value) => [`${value}%`, 'Prezență']}
            labelFormatter={(label) => {
              try {
                return `Data: ${new Date(label).toLocaleDateString('ro-RO')}`;
              } catch (e) {
                return 'Data invalidă';
              }
            }}
          />
          <Line 
            type="monotone" 
            dataKey="participationRate" 
            name="Prezență" 
            stroke="#10B981" 
            strokeWidth={2}
            dot={{ r: 4 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ParticipationChart;