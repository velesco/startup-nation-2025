import React from 'react';
import { 
  Users, 
  UserPlus, 
  Calendar, 
  FileText, 
  FileCheck, 
  BookOpen 
} from 'lucide-react';

/**
 * Componenta pentru afișarea statisticilor utilizatorilor în panoul de administrare
 */
const UserStatistics = ({ stats }) => {
  const {
    appliedToday = 0,
    appliedYesterday = 0,
    idCardUploaded = 0,
    contractsGenerated = 0,
    consultingContractsGenerated = 0,
    totalUsers = 0
  } = stats || {};

  // Calculează procentul de schimbare dintre azi și ieri
  const calculateChangePercentage = () => {
    if (appliedYesterday === 0) return 100;
    const percentage = ((appliedToday - appliedYesterday) / appliedYesterday) * 100;
    return Math.round(percentage);
  };

  const changePercentage = calculateChangePercentage();
  const isPositiveChange = changePercentage >= 0;

  // Definirea cardurilor de statistici
  const statisticsCards = [
    {
      title: 'Aplicări Azi',
      value: appliedToday,
      icon: <UserPlus className="h-7 w-7 text-blue-600" />,
      description: (
        <div className="flex items-center mt-1">
          <span 
            className={`text-sm font-medium ${
              isPositiveChange ? 'text-green-600' : 'text-red-600'
            }`}
          >
            {isPositiveChange ? '+' : ''}{changePercentage}%
          </span>
          <span className="text-xs text-gray-500 ml-1">față de ieri</span>
        </div>
      ),
      className: 'from-blue-50 to-indigo-50 shadow-blue-200/40'
    },
    {
      title: 'Aplicări Ieri',
      value: appliedYesterday,
      icon: <Calendar className="h-7 w-7 text-purple-600" />,
      description: <span className="text-xs text-gray-500 mt-1">utilizatori înregistrați</span>,
      className: 'from-purple-50 to-fuchsia-50 shadow-purple-200/40'
    },
    {
      title: 'Buletine Încărcate',
      value: idCardUploaded,
      icon: <FileText className="h-7 w-7 text-emerald-600" />,
      description: (
        <div className="flex items-center mt-1">
          <span className="text-sm font-medium">
            {totalUsers > 0 ? Math.round((idCardUploaded / totalUsers) * 100) : 0}%
          </span>
          <span className="text-xs text-gray-500 ml-1">din total utilizatori</span>
        </div>
      ),
      className: 'from-emerald-50 to-teal-50 shadow-emerald-200/40'
    },
    {
      title: 'Contracte Generate',
      value: contractsGenerated,
      icon: <FileCheck className="h-7 w-7 text-amber-600" />,
      description: (
        <div className="flex items-center mt-1">
          <span className="text-sm font-medium">
            {totalUsers > 0 ? Math.round((contractsGenerated / totalUsers) * 100) : 0}%
          </span>
          <span className="text-xs text-gray-500 ml-1">din total utilizatori</span>
        </div>
      ),
      className: 'from-amber-50 to-yellow-50 shadow-amber-200/40'
    },
    {
      title: 'Contracte Consultanță',
      value: consultingContractsGenerated,
      icon: <BookOpen className="h-7 w-7 text-rose-600" />,
      description: (
        <div className="flex items-center mt-1">
          <span className="text-sm font-medium">
            {totalUsers > 0 ? Math.round((consultingContractsGenerated / totalUsers) * 100) : 0}%
          </span>
          <span className="text-xs text-gray-500 ml-1">din total utilizatori</span>
        </div>
      ),
      className: 'from-rose-50 to-pink-50 shadow-rose-200/40'
    },
    {
      title: 'Total Utilizatori',
      value: totalUsers,
      icon: <Users className="h-7 w-7 text-gray-600" />,
      description: <span className="text-xs text-gray-500 mt-1">înregistrați în platformă</span>,
      className: 'from-gray-50 to-slate-50 shadow-gray-200/40'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
      {statisticsCards.map((card, index) => (
        <div 
          key={index} 
          className={`glassmorphism p-5 rounded-xl shadow-lg bg-gradient-to-br ${card.className}`}
        >
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-gray-700 text-sm font-semibold mb-1">{card.title}</h3>
              <p className="text-2xl font-bold text-gray-800">{card.value}</p>
              {card.description}
            </div>
            <div className="bg-white p-3 rounded-lg shadow-sm">
              {card.icon}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default UserStatistics;