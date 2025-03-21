import React from 'react';
import { CheckCircle, FileText, Calendar, ArrowRight } from 'lucide-react';

const ClientProgressSteps = ({ steps, currentStep, setCurrentStep }) => {
  // Mapare icoane
  const getIcon = (iconName) => {
    switch (iconName) {
      case 'document':
        return <FileText className="h-6 w-6 text-white" />;
      case 'calendar':
        return <Calendar className="h-6 w-6 text-white" />;
      case 'check':
        return <CheckCircle className="h-6 w-6 text-white" />;
      default:
        return <FileText className="h-6 w-6 text-white" />;
    }
  };

  return (
    <div className="bg-white/70 backdrop-blur-md rounded-3xl p-6 mb-8 shadow-lg border border-white/50">
      <h2 className="text-xl font-bold mb-6 bg-gradient-to-r from-gray-700 to-gray-900 bg-clip-text text-transparent">Pașii de urmat</h2>
      
      <div className="space-y-4">
        {steps.map((step, idx) => (
          <div 
            key={step.id} 
            className={`flex items-center p-4 rounded-2xl transition-all duration-300 ${
              currentStep === step.id ? 
              'bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200/50 shadow-md' : 
              'bg-white/50 border border-gray-100'
            }`}
            onClick={() => setCurrentStep(step.id)}
          >
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mr-4 transition-all duration-300 ${
              step.completed ? 
              'bg-gradient-to-r from-green-400 to-teal-500 shadow-md' : 
              currentStep === step.id ? 
              'bg-gradient-to-r from-blue-500 to-purple-600 shadow-md' : 
              'bg-gray-100'
            }`}>
              {step.completed ? (
                <CheckCircle className="h-6 w-6 text-white" />
              ) : (
                getIcon(step.icon)
              )}
            </div>
            <div className="flex-1">
              <h3 className={`font-semibold text-lg ${
                currentStep === step.id ? 
                'bg-gradient-to-r from-blue-700 to-purple-700 bg-clip-text text-transparent' : 
                'text-gray-800'
              }`}>{step.name}</h3>
              <p className="text-sm text-gray-500">
                {step.completed ? 'Completat' : idx === 0 ? 'În așteptare' : 'Blocat'}
              </p>
            </div>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
              currentStep === step.id ? 
              'bg-gradient-to-r from-blue-500 to-purple-600 shadow-md' : 
              'bg-gray-100'
            }`}>
              <ArrowRight className={`h-5 w-5 ${currentStep === step.id ? 'text-white' : 'text-gray-400'}`} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ClientProgressSteps;