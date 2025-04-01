import React from 'react';
import topImage from '../../assets/header.png';

const HeroSection = () => {
  const scrollToApplySection = () => {
    const element = document.getElementById('apply-section');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header className="relative overflow-hidden">
      <div className="decoration-blob bg-blue-500 w-64 h-64 md:w-96 md:h-96 lg:w-120 lg:h-120 top-20 right-5" aria-hidden="true"></div>
      <div className="decoration-blob bg-orange-400 w-56 h-56 md:w-80 md:h-80 lg:w-96 lg:h-96 top-40 left-0" aria-hidden="true"></div>
      
      <div className="relative min-h-[300px] md:min-h-[350px] lg:min-h-[400px] flex items-center">
        <div className="container mx-auto px-4 py-3 md:py-4 lg:py-6 relative z-10">
          <div className="mx-auto text-center md:max-w-3xl lg:max-w-4xl xl:max-w-5xl 2xl:max-w-6xl">
            <div className="mb-1 inline-block">
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gradient-gray mb-2">Startup Nation 2025</h1>
            </div>
            
            {/* Top Image Banner */}
            <div className="container mx-auto mt-0">
              <div className="mx-auto w-full md:w-4/5 lg:w-3/4 xl:w-2/3 2xl:w-1/2">
                <img 
                  src={topImage} 
                  alt="Startup Nation 2025 - Program de finanțare pentru antreprenori" 
                  className="w-full h-auto object-contain"
                  loading="eager" 
                />
              </div>
            </div>
            
            <div className="space-y-2 mt-2">
              <div className="relative w-full flex justify-center">
                <button 
                  onClick={scrollToApplySection}
                  style={{width: "70%", height: "4rem", fontSize: "1.8rem"}}
                  className="relative bg-gradient-orange-pink shine-effect text-white px-5 py-2 md:px-6 md:py-2 lg:px-8 lg:py-3 rounded-full font-medium shadow-md hover:shadow-lg transition-all duration-300 animate-pulse-attention"
                  aria-label="Aplică pentru finanțare Startup Nation 2025"
                >
                  Aplică acum
                  <span className="ml-2 inline-block animate-bounce-right">→</span>
                </button>
              </div>
              
            </div>
            {/* Decorative Background Elements */}
            <p className="text-sm md:text-base lg:text-lg text-gray-700 mb-2 md:mb-4 lg:mb-6">
              Transformă-ți ideea de afacere în realitate cu finanțare nerambursabilă
              de până la <span className="font-semibold text-blue-600">50.000 Euro</span>
            </p>
          </div>
        </div>
      </div>
    </header>
  );
};

export default HeroSection;