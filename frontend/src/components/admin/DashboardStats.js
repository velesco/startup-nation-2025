import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

const StatCard = ({ title, value, subtitle, trend, trendValue, bgAccent, textAccent }) => {
  return (
    <div className="glassmorphism rounded-xl p-6 shadow-lg overflow-hidden relative">
      <div className="relative z-10">
        <h3 className="text-gray-500 text-sm">{title}</h3>
        <p className={`text-3xl font-bold mt-2 ${textAccent || 'text-blue-600'}`}>{value}</p>
        <div className="mt-2 h-0.5 w-7 bg-gray-200 rounded-full"></div>
        <div className="mt-4 flex items-center">
          {trend === 'up' ? (
            <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
          ) : trend === 'down' ? (
            <TrendingDown className="w-4 h-4 text-red-500 mr-1" />
          ) : null}
          <span className={trend === 'up' ? 'text-green-500' : trend === 'down' ? 'text-red-500' : 'text-gray-500'}>
            {trendValue}
          </span>
          <span className="text-gray-500 ml-1">{subtitle}</span>
        </div>
      </div>
      <div 
        className={`absolute top-0 right-0 w-48 h-48 rounded-full opacity-5 transform translate-x-12 -translate-y-12 ${bgAccent || 'bg-blue-500'}`}
      ></div>
    </div>
  );
};

const DashboardStats = ({ data }) => {
  if (!data) return null;

  const { 
    totalClients, 
    newClientsCurrentMonth, 
    newClientsPercentChange, 
    clientsEnrolled, 
    enrollmentRate,
    activeGroups,
    currentMonthName
  } = data;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      <StatCard 
        title="Total Clienți" 
        value={totalClients || 0} 
        subtitle="față de luna trecută" 
        trend={newClientsPercentChange > 0 ? 'up' : newClientsPercentChange < 0 ? 'down' : null}
        trendValue={`${Math.abs(newClientsPercentChange || 0)}%`}
        bgAccent="bg-blue-500"
        textAccent="bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent"
      />
      <StatCard 
        title={`Clienți Înscriși la Curs`}
        value={clientsEnrolled || 0} 
        subtitle="rată de conversie" 
        trendValue={`${enrollmentRate || 0}%`}
        bgAccent="bg-green-500"
        textAccent="bg-gradient-to-r from-green-500 to-teal-400 bg-clip-text text-transparent"
      />
      <StatCard 
        title={`Clienți Noi (${currentMonthName})`}
        value={newClientsCurrentMonth || 0} 
        subtitle="față de luna trecută" 
        trend={newClientsPercentChange > 0 ? 'up' : newClientsPercentChange < 0 ? 'down' : null}
        trendValue={`${Math.abs(newClientsPercentChange || 0)}%`}
        bgAccent="bg-orange-500"
        textAccent="bg-gradient-to-r from-orange-500 to-pink-500 bg-clip-text text-transparent"
      />
    </div>
  );
};

export default DashboardStats;