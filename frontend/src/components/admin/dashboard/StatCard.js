import React from 'react';
import { Link } from 'react-router-dom';
import { TrendingUp, TrendingDown } from 'lucide-react';

const StatCard = ({ title, value, icon, backgroundColor, change, link }) => {
  // Verificăm dacă avem date despre schimbare și formatăm corespunzător
  const hasChange = change !== undefined && change !== null;
  const isPositive = hasChange && change >= 0;
  
  return (
    <Link to={link || '#'} className="block">
      <div className={`${backgroundColor || 'bg-blue-50'} p-4 sm:p-5 rounded-xl transition-all duration-200 hover:shadow-md`}>
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-1">{title}</h3>
            <p className="text-xl sm:text-2xl font-bold text-gray-800">{value}</p>
            
            {hasChange && (
              <div className="flex items-center mt-2">
                {isPositive ? (
                  <>
                    <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                    <span className="text-xs font-medium text-green-600">+{change}%</span>
                  </>
                ) : (
                  <>
                    <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
                    <span className="text-xs font-medium text-red-600">{change}%</span>
                  </>
                )}
                <span className="text-xs text-gray-500 ml-1">vs. luna trecută</span>
              </div>
            )}
          </div>
          
          <div className="mt-1">
            {icon}
          </div>
        </div>
      </div>
    </Link>
  );
};

export default StatCard;