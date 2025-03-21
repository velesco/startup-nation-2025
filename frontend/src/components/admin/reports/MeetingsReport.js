import React from 'react';
import { 
  BarChart2,
  PieChart,
  Calendar,
  Clock,
  MapPin,
  CheckCircle
} from 'lucide-react';

const MeetingsReport = ({ data }) => {
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
  
  // Formatare oră pentru afișare
  const formatTime = (dateString) => {
    if (!dateString) return 'N/A';
    const options = { hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleTimeString('ro-RO', options);
  };

  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-800 mb-6">Statistici întâlniri</h2>
      
      {/* KPI-uri */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white border rounded-lg p-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-gray-500">Total întâlniri</h3>
            <Calendar className="h-5 w-5 text-blue-500" />
          </div>
          <div className="mt-2">
            <div className="text-2xl font-bold text-gray-800">
              {data?.meetingsStats?.total || 0}
            </div>
            <div className="text-xs text-gray-500">
              În perioada selectată
            </div>
          </div>
        </div>
        
        <div className="bg-white border rounded-lg p-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-gray-500">Rata de prezență</h3>
            <CheckCircle className="h-5 w-5 text-green-500" />
          </div>
          <div className="mt-2">
            <div className="text-2xl font-bold text-gray-800">
              {formatPercentage(data?.meetingsStats?.attendanceRate || 0)}
            </div>
            <div className="text-xs text-gray-500">
              Medie pentru toate întâlnirile
            </div>
          </div>
        </div>
        
        <div className="bg-white border rounded-lg p-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-gray-500">Întâlniri viitoare</h3>
            <Clock className="h-5 w-5 text-purple-500" />
          </div>
          <div className="mt-2">
            <div className="text-2xl font-bold text-gray-800">
              {data?.meetingsStats?.upcoming || 0}
            </div>
            <div className="text-xs text-gray-500">
              Programate pentru perioada următoare
            </div>
          </div>
        </div>
      </div>
      
      {/* Tabel cu întâlniri */}
      <div className="overflow-x-auto">
        <table className="min-w-full border-separate border-spacing-y-2">
          <thead>
            <tr>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Titlu</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Grupă</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ora</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Durată</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Locație</th>
              <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Prezență</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {data?.meetings && data.meetings.length > 0 ? (
              data.meetings.map((meeting) => (
                <tr key={meeting._id} className="bg-white">
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">{meeting.title}</td>
                  <td className="px-4 py-3 text-sm text-gray-500">{meeting.group?.name || 'N/A'}</td>
                  <td className="px-4 py-3 text-sm text-gray-500">{formatDate(meeting.date)}</td>
                  <td className="px-4 py-3 text-sm text-gray-500">{formatTime(meeting.date)}</td>
                  <td className="px-4 py-3 text-sm text-gray-500">{meeting.duration} min</td>
                  <td className="px-4 py-3 text-sm text-gray-500">
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 mr-1 text-gray-400" />
                      <span>{meeting.location || 'Online'}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500 text-center">
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full 
                      ${meeting.status === 'Completed' ? 'bg-green-100 text-green-800' :
                        meeting.status === 'InProgress' ? 'bg-blue-100 text-blue-800' :
                        meeting.status === 'Cancelled' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}
                    >
                      {meeting.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500 text-center">
                    {meeting.status === 'Completed' ? (
                      <div className="flex items-center justify-center">
                        <div className="mr-2">{formatPercentage(meeting.attendancePercentage || 0)}</div>
                        <div className="w-16 h-2 bg-gray-200 rounded-full">
                          <div 
                            className={`h-full rounded-full ${
                              (meeting.attendancePercentage || 0) >= 75 ? 'bg-green-600' :
                              (meeting.attendancePercentage || 0) >= 50 ? 'bg-yellow-600' :
                              'bg-red-600'
                            }`} 
                            style={{ width: `${meeting.attendancePercentage || 0}%` }}
                          ></div>
                        </div>
                      </div>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="8" className="px-4 py-8 text-sm text-gray-500 text-center">
                  Nu există date de afișat pentru întâlnirile selectate.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      
      {/* Grafice */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="border rounded-lg p-4">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Distribuția prezenței la întâlniri</h3>
          <div className="h-64 flex items-center justify-center bg-gray-50 rounded">
            {data?.meetingsStats ? (
              <div className="w-full h-full p-4">
                {/* Aici ar fi de fapt un grafic real */}
                <div className="text-center text-gray-500">
                  <BarChart2 className="h-10 w-10 mx-auto mb-2 text-gray-300" />
                  <p>Grafic pentru distribuția prezenței la întâlniri</p>
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
        
        <div className="border rounded-lg p-4">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Distribuția statusurilor întâlnirilor</h3>
          <div className="h-64 flex items-center justify-center bg-gray-50 rounded">
            {data?.meetingsStats ? (
              <div className="w-full h-full p-4">
                {/* Aici ar fi de fapt un grafic real */}
                <div className="text-center text-gray-500">
                  <PieChart className="h-10 w-10 mx-auto mb-2 text-gray-300" />
                  <p>Grafic pentru distribuția statusurilor întâlnirilor</p>
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
      </div>
    </div>
  );
};

export default MeetingsReport;