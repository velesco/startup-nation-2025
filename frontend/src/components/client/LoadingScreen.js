import React from 'react';

const LoadingScreen = () => {
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gradient-to-br from-blue-500 via-blue-600 to-purple-700">
      <div className="relative">
        <div className="w-24 h-24 mb-6 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center shadow-lg border border-white/30">
          <div className="text-white text-4xl font-bold bg-gradient-to-r from-orange-400 to-pink-500 bg-clip-text text-transparent">SN</div>
        </div>
        <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-gradient-to-r from-orange-400 to-pink-500 animate-pulse"></div>
      </div>
      <div className="text-white text-2xl font-bold mb-8 tracking-wide">Startup Nation</div>
      <div className="w-16 h-16 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
    </div>
  );
};

export default LoadingScreen;