import React from 'react';
import { 
  BarChart2,
  PieChart,
  CheckCircle,
  XCircle
} from 'lucide-react';

const ParticipantsReport = ({ data }) => {
  // Formatare valoare procentuală
  const formatPercentage = (value) => {
    return `${Math.round(value * 10) / 10}%`;
  };
  
  // Formatare dată pentru afișare
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const options = { day: '2-digit', month: '2-digit', year: 'numeric' };
    return new Date(dateString).toLocaleDateString('ro-RO', options);
  };

  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-800 mb-6">Statistici participanți</h2>
      
      {/* KPI-uri */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white border rounded-lg p-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-gray-500">Rata de finalizare</h3>
            <CheckCircle className="h-5 w-5 text-green-500" />
          </div>
          <div className="mt-2">
            <div className="text-2xl font-bold text-gray-800">
              {formatPercentage(data?.participantsStats?.completionRate || 0)}
            </div>
            <div className="text-xs text-gray-500">
              Participanți care au finalizat programul
            </div>
          </div>
        </div>
        
        <div className="bg-white border rounded-lg p-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-gray-500">Rata de abandon</h3>
            <XCircle className="h-5 w-5 text-red-500" />
          </div>
          <div className="mt-2">
            <div className="text-2xl font-bold text-gray-800">
              {formatPercentage(data?.participantsStats?.dropoutRate || 0)}
            </div>
            <div className="text-xs text-gray-500">
              Participanți care au abandonat programul
            </div>
          </div>
        </div>
        
        <div className="bg-white border rounded-lg p-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-gray-500">Participanți noi</h3>
            <PieChart className="h-5 w-5 text-blue-500" />
          </div>
          <div className="mt-2">
            <div className="text-2xl font-bold text-gray-800">
              {data?.participantsStats?.newThisPeriod || 0}
            </div>
            <div className="text-xs text-gray-500">
              În perioada selectată
            </div>
          </div>
        </div>
      </div>
      
      {/* Tabel cu participanți */}
      <div className="overflow-x-auto">
        <table className="min-w-full border-separate border-spacing-y-2">
          <thead>
            <tr>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nume</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Grupă</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data înregistrării</th>
              <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Întâlniri</th>
              <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Prezență</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {data?.participants && data.participants.length > 0 ? (
              data.participants.map((participant) => (
                <tr key={participant._id} className="bg-white">
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">{participant.name}</td>
                  <td className="px-4 py-3 text-sm text-gray-500">{participant.email}</td>
                  <td className="px-4 py-3 text-sm text-gray-500">{participant.group?.name || 'Neatribuit'}</td>
                  <td className="px-4 py-3 text-sm text-gray-500">
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full 
                      ${participant.status === 'Complet' ? 'bg-green-100 text-green-800' :
                        participant.status === 'În progres' ? 'bg-blue-100 text-blue-800' :
                        participant.status === 'Respins' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}
                    >
                      {participant.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">{formatDate(participant.registrationDate)}</td>
                  <td className="px-4 py-3 text-sm text-gray-500 text-center">{participant.meetingsCount || 0}</td>
                  <td className="px-4 py-3 text-sm text-gray-500 text-center">
                    <div className="flex items-center justify-center">
                      <div className="mr-2">{formatPercentage(participant.attendanceRate || 0)}</div>
                      <div className="w-16 h-2 bg-gray-200 rounded-full">
                        <div 
                          className={`h-full rounded-full ${
                            (participant.attendanceRate || 0) >= 75 ? 'bg-green-600' :
                            (participant.attendanceRate || 0) >= 50 ? 'bg-yellow-600' :
                            'bg-red-600'
                          }`} 
                          style={{ width: `${participant.attendanceRate || 0}%` }}
                        ></div>
                      </div>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" className="px-4 py-8 text-sm text-gray-500 text-center">
                  Nu există date de afișat pentru participanții selectați.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      
      {/* Grafice */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="border rounded-lg p-4">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Distribuția statusurilor</h3>
          <div className="h-64 flex items-center justify-center bg-gray-50 rounded">
            {data?.participantsStats ? (
              <div className="w-full h-full p-4">
                {/* Aici ar fi de fapt un grafic real */}
                <div className="text-center text-gray-500">
                  <PieChart className="h-10 w-10 mx-auto mb-2 text-gray-300" />
                  <p>Grafic pentru distribuția statusurilor participanților</p>
                </div>
              </div>
            ) : (
              <div className="text-center text-gray-500">
                <PieChart className="h-10 w-10 mx-auto mb-2 text-gray-300" />
                <p>Nu există date suficiente pentru a genera graficul</p>
              </div>
            )}
          </div>
        </div>
        
        <div className="border rounded-lg p-4">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Evoluție participanți în timp</h3>
          <div className="h-64 flex items-center justify-center bg-gray-50 rounded">
            {data?.participantsOverTime ? (
              <div className="w-full h-full p-4">
                {/* Aici ar fi de fapt un grafic real */}
                <div className="text-center text-gray-500">
                  <BarChart2 className="h-10 w-10 mx-auto mb-2 text-gray-300" />
                  <p>Grafic pentru evoluția numărului de participanți în timp</p>
                </div>
              </div>
            ) : (
              <div className="text-center text-gray-500">
                <BarChart2 className="h-10 w-10 mx-auto mb-2 text-gray-300" />
                <p>Nu există date suficiente pentru a genera graficul</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ParticipantsReport;