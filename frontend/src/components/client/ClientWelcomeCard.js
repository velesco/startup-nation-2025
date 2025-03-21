import React from 'react';

const ClientWelcomeCard = ({ user }) => {
  // Calculăm progresul real în funcție de documentele încărcate
  const calculateProgress = (user) => {
    if (!user || !user.documents) return 0;
    
    const steps = [
      user.documents.id_cardUploaded || false,
      user.documents.courseSelected || false,
      user.documents.appDownloaded || false
    ];
    
    const completedSteps = steps.filter(step => step).length;
    return Math.round((completedSteps / steps.length) * 100);
  };
  
  // Progresul calculat în funcție de starea actuală
  const actualProgress = user ? calculateProgress(user) : 0;
  
  // Folosim progresul din backend sau cel calculat dacă nu există
  const progress = user && typeof user.progress === 'number' ? user.progress : actualProgress;

  if (!user) {
    return (
      <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-3xl p-6 mb-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-white/10 -mr-10 -mt-10"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 rounded-full bg-white/10 -ml-10 -mb-10"></div>
        
        <h2 className="text-2xl font-bold mb-2 relative z-10">Încărcare...</h2>
        <div className="h-3 bg-white/20 backdrop-blur-sm rounded-full mb-2 relative z-10 overflow-hidden shadow-inner">
          <div className="h-3 bg-white/50 rounded-full animate-pulse"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-3xl p-6 mb-8 text-white shadow-xl relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-white/10 -mr-10 -mt-10"></div>
      <div className="absolute bottom-0 left-0 w-24 h-24 rounded-full bg-white/10 -ml-10 -mb-10"></div>
      
      <h2 className="text-2xl font-bold mb-2 relative z-10">Salut, {user.name}!</h2>
      <p className="text-blue-100 mb-4 relative z-10">Continuă înscrierea în programul Startup Nation 2025</p>
      
      <div className="bg-white/20 backdrop-blur-sm h-3 rounded-full mb-2 relative z-10 overflow-hidden shadow-inner">
        <div 
          className="bg-gradient-to-r from-orange-400 to-pink-500 h-3 rounded-full relative"
          style={{ width: `${progress}%` }}
        ></div>
      </div>
      <div className="text-sm text-blue-100 relative z-10">Progres: {progress}% completat</div>
    </div>
  );
};

export default ClientWelcomeCard;