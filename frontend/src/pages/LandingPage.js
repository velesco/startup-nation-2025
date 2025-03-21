import React from 'react';

// Import components
import Navbar from '../components/landing/Navbar';
import HeroSection from '../components/landing/HeroSection';
import ProgramInfoSection from '../components/landing/ProgramInfoSection';
import ApplicationFormSection from '../components/landing/ApplicationFormSection';
import BusinessPlanTemplatesSection from '../components/landing/BusinessPlanTemplatesSection';
import Footer from '../components/common/Footer';

const LandingPage = () => {
  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Decorative Background Elements */}
      <div className="decoration-blob bg-orange-400 w-96 h-96 top-0 right-0"></div>
      <div className="decoration-blob bg-blue-500 w-96 h-96 bottom-0 left-0"></div>
      
      {/* Navigation Bar */}
      <Navbar />
      
      {/* Hero Section with Centered Title */}
      <HeroSection />
      
      {/* Program Information Section */}
      <ProgramInfoSection />
      
      {/* Application Form Section */}
      <ApplicationFormSection />
      
      {/* Business Plan Templates Section */}
      <BusinessPlanTemplatesSection />
      
      {/* Footer */}
      <Footer />
    </div>
  );
};

export default LandingPage;
