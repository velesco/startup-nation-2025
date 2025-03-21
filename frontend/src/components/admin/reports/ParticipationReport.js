import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { AlertCircle, Users } from 'lucide-react';

const ParticipationReport = ({ data }) => {
  if (!data) {
    return (
      <div className="text-center py-20 text-gray-500">
        <AlertCircle className="mx-auto h-12 w-12 text-gray-400 mb-3" />
        <h3 className="text-lg font-medium">Nu există date disponibile</h3>
        <p className="mt-2">Ajustează filtrele sau selectează alt interval de timp.</p>
      </div>
    );
  }
  
  // Asigură-te că avem date pentru grafic, chiar și goale
  const chartData = data.participationByGroup || [];
  
  // Pregătește datele pentru tabel - participare per întâlnire
  const meetingData = data.participationByMeeting || [];
  
  // Calculul mediei generale de participare
  const avgParticipation = data.averageParticipation || 0;
  
  return (
    <div className="space-y-8">
      {/* Statistici generale */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-blue-50 p-5 rounded-lg">
          <h4 className="text-sm font-medium text-blue-800">Participare medie</h4>
          <div className="mt-2 flex items-end justify-between">
            <div className="text-3xl font-bold text-blue-700">{avgParticipation.toFixed(1)}%</div>
            <Users className="h-8 w-8 text-blue-500" />
          </div>
        </div>
        
        <div className="bg-green-50 p-5 rounded-lg">
          <h4 className="text-sm font-medium text-green-800">Total întâlniri</h4>
          <div className="mt-2 flex items-end justify-between">
            <div className="text-3xl font-bold text-green-700">{meetingData.length}</div>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-500" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
            </svg>
          </div>
        </div>
        
        <div className="bg-purple-50 p-5 rounded-lg">
          <h4 className="text-sm font-medium text-purple-800">Total participanți</h4>
          <div className="mt-2 flex items-end justify-between">
            <div className="text-3xl font-bold text-purple-700">{data.totalParticipants || 0}</div>
            <Users className="h-8 w-8 text-purple-500" />
          </div>
        </div>
      </div>
      
      {/* Grafic participare pe grupe */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="text-lg font-medium text-gray-800 mb-4">Participare pe grupe</h3>
        
        {chartData.length > 0 ? (
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="groupName" />
                <YAxis domain={[0, 100]} />
                <Tooltip 
                  formatter={(value) => [`${value.toFixed(1)}%`, 'Participare']}
                  labelFormatter={(label) => `Grupa: ${label}`}
                />
                <Legend />
                <Bar dataKey="participationRate" name="Rata de participare (%)" fill="#3B82F6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="text-center py-12 text-gray-500">
            <p>Nu există date suficiente pentru afișarea graficului.</p>
          </div>
        )}
      </div>
      
      {/* Tabel cu participare per întâlnire */}
      <div>
        <h3 className="text-lg font-medium text-gray-800 mb-4">Participare per întâlnire</h3>
        
        {meetingData.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Dată
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Grupă
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Subiect
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Participanți
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Prezență (%)
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {meetingData.map((meeting, index) => (
                  <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(meeting.date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {meeting.groupName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {meeting.topic}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {meeting.attendees} / {meeting.totalParticipants}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-full bg-gray-200 rounded-full h-2.5 mr-2">
                          <div 
                            className={`h-2.5 rounded-full ${
                              meeting.attendanceRate >= 75 ? 'bg-green-500' :
                              meeting.attendanceRate >= 50 ? 'bg-yellow-500' :
                              'bg-red-500'
                            }`}
                            style={{ width: `${meeting.attendanceRate}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium text-gray-900">
                          {meeting.attendanceRate.toFixed(1)}%
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8 bg-gray-50 rounded-lg">
            <p className="text-gray-500">Nu există date despre participare pentru perioada selectată.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ParticipationReport;