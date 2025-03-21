import React from 'react';
import { 
  BarChart2,
  UserPlus, 
  FileText, 
  Edit, 
  Trash2, 
  Users, 
  User, 
  Mail,
  MessageSquare,
  Upload,
  Calendar,
  PieChart
} from 'lucide-react';

const ActivitiesReport = ({ data }) => {
  // Formatare dată pentru afișare
  const formatDateTime = (dateString) => {
    if (!dateString) return 'N/A';
    const options = { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleString('ro-RO', options);
  };
  
  // Funcție pentru afișarea icon-ului corespunzător tipului de activitate
  const getActivityIcon = (type) => {
    switch (type) {
      case 'meeting_create':
        return <Calendar className="h-5 w-5 text-blue-500" />;
      case 'meeting_update':
        return <Edit className="h-5 w-5 text-orange-500" />;
      case 'meeting_delete':
        return <Trash2 className="h-5 w-5 text-red-500" />;
      case 'participant_add':
        return <UserPlus className="h-5 w-5 text-green-500" />;
      case 'participant_remove':
        return <User className="h-5 w-5 text-red-500" />;
      case 'group_create':
        return <Users className="h-5 w-5 text-purple-500" />;
      case 'group_update':
        return <Edit className="h-5 w-5 text-purple-500" />;
      case 'email_send':
        return <Mail className="h-5 w-5 text-blue-500" />;
      case 'document_upload':
        return <Upload className="h-5 w-5 text-green-500" />;
      case 'comment_add':
        return <MessageSquare className="h-5 w-5 text-blue-500" />;
      default:
        return <FileText className="h-5 w-5 text-gray-500" />;
    }
  };

  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-800 mb-6">Jurnalul activităților</h2>
      
      {/* Panouri cu statistici */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white border rounded-lg p-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-gray-500">Total activități</h3>
            <FileText className="h-5 w-5 text-blue-500" />
          </div>
          <div className="mt-2">
            <div className="text-2xl font-bold text-gray-800">
              {data?.stats?.totalActivities || 0}
            </div>
            <div className="text-xs text-gray-500">
              În perioada selectată
            </div>
          </div>
        </div>
        
        <div className="bg-white border rounded-lg p-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-gray-500">Utilizatori activi</h3>
            <User className="h-5 w-5 text-green-500" />
          </div>
          <div className="mt-2">
            <div className="text-2xl font-bold text-gray-800">
              {data?.stats?.activeUsers || 0}
            </div>
            <div className="text-xs text-gray-500">
              Utilizatori care au efectuat acțiuni
            </div>
          </div>
        </div>
        
        <div className="bg-white border rounded-lg p-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-gray-500">Activitate medie zilnică</h3>
            <BarChart2 className="h-5 w-5 text-purple-500" />
          </div>
          <div className="mt-2">
            <div className="text-2xl font-bold text-gray-800">
              {data?.stats?.averagePerDay || 0}
            </div>
            <div className="text-xs text-gray-500">
              Acțiuni efectuate pe zi
            </div>
          </div>
        </div>
      </div>
      
      {/* Lista de activități */}
      <div className="bg-white border rounded-lg overflow-hidden">
        <div className="p-4 border-b">
          <h3 className="text-lg font-semibold text-gray-800">Activități recente</h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acțiune</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Utilizator</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tip</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Detalii</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data/Ora</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {data?.activities && data.activities.length > 0 ? (
                data.activities.map((activity, idx) => (
                  <tr key={activity._id || idx} className="hover:bg-gray-50">
                    <td className="px-4 py-4 text-sm text-gray-900">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 mr-3">
                          {getActivityIcon(activity.type)}
                        </div>
                        <div>{activity.action}</div>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-500">{activity.actorName || 'Utilizator necunoscut'}</td>
                    <td className="px-4 py-4 text-sm text-gray-500">
                      <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                        {activity.type}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-500">{activity.details || '-'}</td>
                    <td className="px-4 py-4 text-sm text-gray-500">{formatDateTime(activity.timestamp)}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="px-4 py-8 text-sm text-gray-500 text-center">
                    Nu există activități de afișat pentru perioada selectată.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Grafice */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="border rounded-lg p-4">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Activități pe tip</h3>
          <div className="h-64 flex items-center justify-center bg-gray-50 rounded">
            {data?.stats?.byType ? (
              <div className="w-full h-full p-4">
                {/* Aici ar fi de fapt un grafic real */}
                <div className="text-center text-gray-500">
                  <PieChart className="h-10 w-10 mx-auto mb-2 text-gray-300" />
                  <p>Grafic pentru distribuția activităților pe tip</p>
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
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Activitate zilnică</h3>
          <div className="h-64 flex items-center justify-center bg-gray-50 rounded">
            {data?.stats?.byDay ? (
              <div className="w-full h-full p-4">
                {/* Aici ar fi de fapt un grafic real */}
                <div className="text-center text-gray-500">
                  <BarChart2 className="h-10 w-10 mx-auto mb-2 text-gray-300" />
                  <p>Grafic pentru activitatea zilnică</p>
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

export default ActivitiesReport;