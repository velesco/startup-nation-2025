import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { AlertCircle, TrendingUp, Award, Clock } from 'lucide-react';

const ProgressReport = ({ data }) => {
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
  const progressData = data.progressByGroup || [];
  const individualProgressData = data.individualProgress || [];
  
  // Sortăm datele progresului individual după procent
  const sortedIndividualData = [...individualProgressData].sort((a, b) => b.progressPercentage - a.progressPercentage);
  
  // Extrage cele mai performante și mai puțin performante grupe
  const topGroup = progressData.length > 0 
    ? progressData.reduce((max, group) => group.progressPercentage > max.progressPercentage ? group : max, progressData[0]) 
    : null;
    
  const bottomGroup = progressData.length > 0 
    ? progressData.reduce((min, group) => group.progressPercentage < min.progressPercentage ? group : min, progressData[0]) 
    : null;
  
  return (
    <div className="space-y-8">
      {/* Statistici generale */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-blue-50 p-5 rounded-lg">
          <h4 className="text-sm font-medium text-blue-800">Progres mediu</h4>
          <div className="mt-2 flex items-end justify-between">
            <div className="text-3xl font-bold text-blue-700">{data.averageProgress ? data.averageProgress.toFixed(1) : 0}%</div>
            <TrendingUp className="h-8 w-8 text-blue-500" />
          </div>
        </div>
        
        <div className="bg-green-50 p-5 rounded-lg">
          <h4 className="text-sm font-medium text-green-800">Grupa cu progres maxim</h4>
          <div className="mt-2 flex flex-col">
            <div className="text-xl font-bold text-green-700">{topGroup ? topGroup.groupName : 'N/A'}</div>
            <div className="text-green-600 font-medium">{topGroup ? `${topGroup.progressPercentage.toFixed(1)}%` : ''}</div>
          </div>
        </div>
        
        <div className="bg-orange-50 p-5 rounded-lg">
          <h4 className="text-sm font-medium text-orange-800">Grupa cu progres minim</h4>
          <div className="mt-2 flex flex-col">
            <div className="text-xl font-bold text-orange-700">{bottomGroup ? bottomGroup.groupName : 'N/A'}</div>
            <div className="text-orange-600 font-medium">{bottomGroup ? `${bottomGroup.progressPercentage.toFixed(1)}%` : ''}</div>
          </div>
        </div>
      </div>
      
      {/* Grafic progres pe grupe */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="text-lg font-medium text-gray-800 mb-4">Progres pe grupe</h3>
        
        {progressData.length > 0 ? (
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={progressData}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="groupName" />
                <YAxis domain={[0, 100]} />
                <Tooltip 
                  formatter={(value) => [`${value.toFixed(1)}%`, 'Progres']}
                  labelFormatter={(label) => `Grupa: ${label}`}
                />
                <Legend />
                <Line type="monotone" dataKey="progressPercentage" name="Procent progres" stroke="#3B82F6" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="text-center py-12 text-gray-500">
            <p>Nu există date suficiente pentru afișarea graficului.</p>
          </div>
        )}
      </div>
      
      {/* Tabel cu progres individual */}
      <div>
        <h3 className="text-lg font-medium text-gray-800 mb-4">Progres individual</h3>
        
        {sortedIndividualData.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Participant
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Grupă
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Module completate
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Progres (%)
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ultima activitate
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {sortedIndividualData.map((participant, index) => (
                  <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {participant.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {participant.groupName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {participant.completedModules} / {participant.totalModules}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-full bg-gray-200 rounded-full h-2.5 mr-2">
                          <div 
                            className={`h-2.5 rounded-full ${
                              participant.progressPercentage >= 75 ? 'bg-green-500' :
                              participant.progressPercentage >= 50 ? 'bg-yellow-500' :
                              'bg-red-500'
                            }`}
                            style={{ width: `${participant.progressPercentage}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium text-gray-900">
                          {participant.progressPercentage.toFixed(1)}%
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {participant.lastActivity ? new Date(participant.lastActivity).toLocaleDateString() : 'N/A'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8 bg-gray-50 rounded-lg">
            <p className="text-gray-500">Nu există date despre progres individual pentru perioada selectată.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProgressReport;