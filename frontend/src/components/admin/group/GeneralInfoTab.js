import React from 'react';
import { 
  Calendar, 
  Users, 
  User, 
  Info, 
  Clock
} from 'lucide-react';

const GeneralInfoTab = ({ group, participants, formatDate }) => {
  // Calculate occupancy percentage
  const calculateOccupancy = () => {
    if (!group.capacity) return 0;
    const participantCount = participants?.length || 0;
    return Math.round((participantCount / group.capacity) * 100);
  };

  return (
    <div className="space-y-6">
      {/* Progress card */}
      <div className="glassmorphism rounded-xl p-6 shadow-lg">
        <h3 className="text-lg font-semibold mb-4">Progres grupă</h3>
        
        <div className="flex flex-wrap gap-6">
          <div className="flex-1 min-w-[200px]">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-500">Ocupare</span>
              <span className="text-sm font-medium">{calculateOccupancy()}%</span>
            </div>
            <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-blue-500 to-purple-600" 
                style={{ width: `${calculateOccupancy()}%` }}
              ></div>
            </div>
            <div className="mt-1 text-xs text-gray-500">
              {participants?.length || 0} / {group.capacity || 0} participanți
            </div>
          </div>
          
          <div className="flex-1 min-w-[200px]">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-500">Durată curs</span>
              <span className="text-sm font-medium">
                {(() => {
                  if (!group.startDate || !group.endDate) return 'Nedefinită';
                  const start = new Date(group.startDate);
                  const end = new Date(group.endDate);
                  const diffTime = Math.abs(end - start);
                  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                  return `${diffDays} zile`;
                })()}
              </span>
            </div>
            <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
              {group.startDate && group.endDate && (
                <div 
                  className="h-full bg-gradient-to-r from-green-500 to-teal-400" 
                  style={{ 
                    width: `${(() => {
                      const start = new Date(group.startDate);
                      const end = new Date(group.endDate);
                      const today = new Date();
                      
                      if (today < start) return 0;
                      if (today > end) return 100;
                      
                      const totalDuration = end - start;
                      const elapsed = today - start;
                      return Math.round((elapsed / totalDuration) * 100);
                    })()}%` 
                  }}
                ></div>
              )}
            </div>
            <div className="mt-1 text-xs text-gray-500 flex justify-between">
              <span>{formatDate(group.startDate)}</span>
              <span>{formatDate(group.endDate)}</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Details card */}
      <div className="glassmorphism rounded-xl p-6 shadow-lg">
        <h3 className="text-lg font-semibold mb-4">Detalii grupă</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <div className="flex items-center mb-1">
                <Info className="h-4 w-4 text-gray-400 mr-2" />
                <span className="text-sm font-medium text-gray-700">Nume</span>
              </div>
              <p className="text-gray-800 pl-6">{group.name}</p>
            </div>
            
            <div>
              <div className="flex items-center mb-1">
                <Clock className="h-4 w-4 text-gray-400 mr-2" />
                <span className="text-sm font-medium text-gray-700">Status</span>
              </div>
              <p className="pl-6">
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                  group.status === 'Active' ? 'bg-green-100 text-green-700' :
                  group.status === 'Completed' ? 'bg-blue-100 text-blue-700' :
                  group.status === 'Cancelled' ? 'bg-red-100 text-red-700' :
                  'bg-purple-100 text-purple-700'
                }`}>
                  {group.status}
                </span>
              </p>
            </div>
            
            <div>
              <div className="flex items-center mb-1">
                <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                <span className="text-sm font-medium text-gray-700">Perioada</span>
              </div>
              <p className="text-gray-800 pl-6">
                {formatDate(group.startDate)} - {formatDate(group.endDate)}
              </p>
            </div>
          </div>
          
          <div className="space-y-4">
            <div>
              <div className="flex items-center mb-1">
                <User className="h-4 w-4 text-gray-400 mr-2" />
                <span className="text-sm font-medium text-gray-700">Instructor</span>
              </div>
              <p className="text-gray-800 pl-6">
                {group.instructor ? group.instructor.name : 'Nespecificat'}
              </p>
            </div>
            
            <div>
              <div className="flex items-center mb-1">
                <Users className="h-4 w-4 text-gray-400 mr-2" />
                <span className="text-sm font-medium text-gray-700">Capacitate</span>
              </div>
              <p className="text-gray-800 pl-6">
                {group.capacity} participanți
              </p>
            </div>
          </div>
        </div>
        
        {/* Description */}
        <div className="mt-6">
          <div className="flex items-center mb-1">
            <Info className="h-4 w-4 text-gray-400 mr-2" />
            <span className="text-sm font-medium text-gray-700">Descriere</span>
          </div>
          <p className="text-gray-800 whitespace-pre-line pl-6">
            {group.description || 'Fără descriere'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default GeneralInfoTab;