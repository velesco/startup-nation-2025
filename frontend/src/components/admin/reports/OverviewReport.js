import React from 'react';
import { 
  Users, 
  BarChart2, 
  TrendingUp, 
  Briefcase, 
  Calendar, 
  PieChart, 
  CheckCircle 
} from 'lucide-react';

const OverviewReport = ({ data }) => {
  // Formatare valoare procentuală
  const formatPercentage = (value) => {
    return `${Math.round(value * 10) / 10}%`;
  };

  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-800 mb-6">Statistici generale</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {/* Card statistici participanți */}
        <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold text-blue-800">Participanți</h3>
            <Users className="h-5 w-5 text-blue-500" />
          </div>
          <div className="text-2xl font-bold text-blue-900 mb-1">
            {data?.participantsStats?.total || 0}
          </div>
          <div className="flex items-center text-sm">
            <TrendingUp className="h-4 w-4 mr-1 text-green-500" />
            <span className="text-green-600">{data?.participantsStats?.newThisPeriod || 0} noi</span>
            <span className="mx-2 text-gray-400">•</span>
            <span className="text-blue-600">{formatPercentage(data?.participantsStats?.completionRate || 0)} finalizați</span>
          </div>
        </div>
        
        {/* Card statistici grupe */}
        <div className="bg-gradient-to-r from-green-50 to-green-100 p-4 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold text-green-800">Grupe</h3>
            <Briefcase className="h-5 w-5 text-green-500" />
          </div>
          <div className="text-2xl font-bold text-green-900 mb-1">
            {data?.groupsStats?.total || 0}
          </div>
          <div className="flex items-center text-sm">
            <span className="text-green-600">{data?.groupsStats?.active || 0} active</span>
            <span className="mx-2 text-gray-400">•</span>
            <span className="text-green-600">{formatPercentage(data?.groupsStats?.averageOccupancy || 0)} ocupare medie</span>
          </div>
        </div>
        
        {/* Card statistici întâlniri */}
        <div className="bg-gradient-to-r from-purple-50 to-purple-100 p-4 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold text-purple-800">Întâlniri</h3>
            <Calendar className="h-5 w-5 text-purple-500" />
          </div>
          <div className="text-2xl font-bold text-purple-900 mb-1">
            {data?.meetingsStats?.total || 0}
          </div>
          <div className="flex items-center text-sm">
            <span className="text-purple-600">{data?.meetingsStats?.completed || 0} finalizate</span>
            <span className="mx-2 text-gray-400">•</span>
            <span className="text-purple-600">{formatPercentage(data?.meetingsStats?.attendanceRate || 0)} prezență medie</span>
          </div>
        </div>
        
        {/* Card progres program */}
        <div className="bg-gradient-to-r from-orange-50 to-orange-100 p-4 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold text-orange-800">Progres program</h3>
            <PieChart className="h-5 w-5 text-orange-500" />
          </div>
          <div className="text-2xl font-bold text-orange-900 mb-1">
            {formatPercentage(data?.programProgress?.overall || 0)}
          </div>
          <div className="flex items-center text-sm">
            <CheckCircle className="h-4 w-4 mr-1 text-orange-500" />
            <span className="text-orange-600">{data?.programProgress?.completedGroups || 0} grupe finalizate</span>
          </div>
        </div>
      </div>
      
      {/* Grafice și alte elemente de vizualizare ar fi afișate aici */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="border rounded-lg p-4">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Participanți pe grupe</h3>
          <div className="h-64 flex items-center justify-center bg-gray-50 rounded">
            <div className="text-center text-gray-500">
              <BarChart2 className="h-10 w-10 mx-auto mb-2 text-gray-300" />
              <p>Vizualizați graficul în tab-ul "Raport grupe"</p>
            </div>
          </div>
        </div>
        
        <div className="border rounded-lg p-4">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Prezență la întâlniri</h3>
          <div className="h-64 flex items-center justify-center bg-gray-50 rounded">
            <div className="text-center text-gray-500">
              <BarChart2 className="h-10 w-10 mx-auto mb-2 text-gray-300" />
              <p>Vizualizați graficul în tab-ul "Raport întâlniri"</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OverviewReport;