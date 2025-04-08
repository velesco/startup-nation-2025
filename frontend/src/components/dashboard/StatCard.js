import React from 'react';

const StatCard = ({ title, value, icon, colorClass = 'blue' }) => {
  // Map of color classes for different stat cards
  const colorMap = {
    blue: {
      bg: 'bg-blue-100',
      text: 'text-blue-600'
    },
    purple: {
      bg: 'bg-purple-100',
      text: 'text-purple-600'
    },
    green: {
      bg: 'bg-green-100',
      text: 'text-green-600'
    },
    orange: {
      bg: 'bg-orange-100',
      text: 'text-orange-500'
    },
    red: {
      bg: 'bg-red-100',
      text: 'text-red-600'
    }
  };

  const { bg, text } = colorMap[colorClass] || colorMap.blue;

  return (
    <div className="glassmorphism rounded-2xl p-4 hover-scale transition-all shadow-md h-full">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm text-gray-500 mb-1">{title}</p>
          <p className="text-2xl font-bold text-gray-800">{value}</p>
        </div>
        <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-full ${bg} flex items-center justify-center ${text}`}>
          {icon}
        </div>
      </div>
    </div>
  );
};

export default StatCard;