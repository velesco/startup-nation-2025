import React from 'react';

const HeroSection = () => {
  const scrollToApplySection = () => {
    const element = document.getElementById('apply-section');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="decoration-blob bg-blue-500 w-96 h-96 top-20 right-5"></div>
      <div className="decoration-blob bg-orange-400 w-80 h-80 top-40 left-0"></div>
      
      <div className="relative min-h-[600px] flex items-center">
        <div className="container mx-auto px-6 py-24 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <div className="mb-6 inline-block">
              <div className="h-20 w-20 bg-gradient-blue-purple rounded-2xl flex items-center justify-center text-white font-bold text-3xl shadow-lg mx-auto mb-4">
                SN
              </div>
              <h1 className="text-5xl font-bold text-gradient-gray mb-4">Startup Nation 2025</h1>
            </div>
            
            <p className="text-xl text-gray-700 mb-8">
              Transformă-ți ideea de afacere în realitate cu finanțare nerambursabilă
              de până la <span className="font-semibold text-blue-600">250.000 lei</span>
            </p>
            
            <div className="space-y-4">
              <button 
                onClick={scrollToApplySection}
                className="bg-gradient-orange-pink shine-effect text-white px-8 py-3 rounded-full text-lg font-medium shadow-md hover:shadow-lg transition-all duration-300"
              >
                Aplică acum
              </button>
              
              <p className="text-sm text-gray-500">
                Termen limită: 15 iulie 2025
              </p>
            </div>
          </div>
          
          <div className="glassmorphism mt-16 p-6 rounded-xl max-w-3xl mx-auto">
            <div className="grid grid-cols-3 gap-6 text-center">
              <div>
                <div className="text-2xl font-bold text-gradient-blue-purple mb-1">250M €</div>
                <div className="text-sm text-gray-500">Fond total</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-gradient-orange-pink mb-1">10.000+</div>
                <div className="text-sm text-gray-500">Aplicații estimate</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-gradient-green-teal mb-1">3.000+</div>
                <div className="text-sm text-gray-500">Beneficiari</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
