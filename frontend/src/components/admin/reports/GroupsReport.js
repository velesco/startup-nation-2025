import React from 'react';
import { 
  BarChart2
} from 'lucide-react';

const GroupsReport = ({ data }) => {
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
      <h2 className="text-xl font-semibold text-gray-800 mb-6">Statistici grupe</h2>
      
      {/* Tabel cu grupe */}
      <div className="overflow-x-auto">
        <table className="min-w-full border-separate border-spacing-y-2">
          <thead>
            <tr>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nume</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dată început</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dată sfârșit</th>
              <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Participanți</th>
              <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Ocupare</th>
              <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Întâlniri</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {data?.groups && data.groups.length > 0 ? (
              data.groups.map((group) => (
                <tr key={group._id} className="bg-white">
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">{group.name}</td>
                  <td className="px-4 py-3 text-sm text-gray-500">
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full 
                      ${group.status === 'Active' ? 'bg-green-100 text-green-800' :
                        group.status === 'Completed' ? 'bg-blue-100 text-blue-800' :
                        group.status === 'Cancelled' ? 'bg-red-100 text-red-800' :
                        'bg-purple-100 text-purple-800'
                      }`}
                    >
                      {group.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">{formatDate(group.startDate)}</td>
                  <td className="px-4 py-3 text-sm text-gray-500">{formatDate(group.endDate)}</td>
                  <td className="px-4 py-3 text-sm text-gray-500 text-center">{group.clientCount || 0}</td>
                  <td className="px-4 py-3 text-sm text-gray-500 text-center">
                    <div className="flex items-center justify-center">
                      <div className="mr-2">{formatPercentage(group.occupancyRate || 0)}</div>
                      <div className="w-16 h-2 bg-gray-200 rounded-full">
                        <div 
                          className="h-full bg-blue-600 rounded-full" 
                          style={{ width: `${group.occupancyRate || 0}%` }}
                        ></div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500 text-center">{group.meetingsCount || 0}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" className="px-4 py-8 text-sm text-gray-500 text-center">
                  Nu există date de afișat pentru grupele selectate.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      
      {/* Grafice */}
      <div className="mt-8 grid grid-cols-1 gap-6">
        <div className="border rounded-lg p-4">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Distribuția participanților pe grupe</h3>
          <div className="h-72 flex items-center justify-center bg-gray-50 rounded">
            {data?.groups && data.groups.length > 0 ? (
              <div className="w-full h-full p-4">
                {/* Aici ar fi de fapt un grafic real */}
                <div className="text-center text-gray-500">
                  <BarChart2 className="h-10 w-10 mx-auto mb-2 text-gray-300" />
                  <p>Grafic pentru distribuția participanților pe grupe</p>
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

export default GroupsReport;