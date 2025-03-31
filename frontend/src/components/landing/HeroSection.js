import React from 'react';
import topImage from '../../assets/top.jpeg';

const HeroSection = () => {
  const scrollToApplySection = () => {
    const element = document.getElementById('apply-section');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="relative overflow-hidden">
      {/* Top Image Banner */}
      <div className="container mx-auto px-6 mt-12">
        <div className="max-w-3xl mx-auto">
          <img src={topImage} alt="Startup Nation 2025" className="w-full h-auto object-contain" />
        </div>
      </div>
      {/* Decorative Background Elements */}
      <div className="decoration-blob bg-blue-500 w-96 h-96 top-20 right-5"></div>
      <div className="decoration-blob bg-orange-400 w-80 h-80 top-40 left-0"></div>
      
      <div className="relative min-h-[600px] flex items-center">
        <div className="container mx-auto px-6 py-24 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <div className="mb-6 inline-block">
              <h1 className="text-5xl font-bold text-gradient-gray mb-4">Startup Nation 2025</h1>
            </div>
            
            <p className="text-xl text-gray-700 mb-8">
              Transformă-ți ideea de afacere în realitate cu finanțare nerambursabilă
              de până la <span className="font-semibold text-blue-600">50.000 Euro</span>
            </p>
            
            <div className="space-y-4">
              <button 
                onClick={scrollToApplySection}
                className="bg-gradient-orange-pink shine-effect text-white px-8 py-3 rounded-full text-lg font-medium shadow-md hover:shadow-lg transition-all duration-300"
              >
                Aplică acum
              </button>
              
              <p className="text-sm text-gray-500">
                Înscriere pentru cursuri tehnice până pe 15 aprilie 2025
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;