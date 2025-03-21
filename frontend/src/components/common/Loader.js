import React from 'react';

const Loader = ({ fullScreen = false, size = 'medium', text = null }) => {
  // Size variations
  const sizeClasses = {
    small: 'h-6 w-6 border-2',
    medium: 'h-12 w-12 border-4',
    large: 'h-20 w-20 border-4'
  };

  // Base loader
  const loader = (
    <div className="flex flex-col items-center justify-center">
      <div className={`animate-spin rounded-full ${sizeClasses[size]} border-b-blue-500`}></div>
      {text && <p className="mt-4 text-gray-600">{text}</p>}
    </div>
  );

  // Full screen loader
  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-gray-50 flex items-center justify-center z-50">
        <div className="decoration-blob bg-blue-500 w-96 h-96 top-0 right-0"></div>
        <div className="decoration-blob bg-orange-400 w-96 h-96 bottom-0 left-0"></div>
        <div className="relative z-10">
          {loader}
        </div>
      </div>
    );
  }

  // Regular loader
  return loader;
};

export default Loader;
