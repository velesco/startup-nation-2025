import React from 'react';

const ProgramInfoSection = () => {
  const benefits = [
    {
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="8" r="7"></circle>
          <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"></polyline>
        </svg>
      ),
      title: 'Finanțare nerambursabilă',
      description: 'Până la 200.000 lei pentru demararea afacerii tale, fără obligația de a returna suma.'
    },
    {
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
          <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
        </svg>
      ),
      title: 'Consultanță specializată',
      description: 'Acces la experți care te vor ajuta cu planul de afaceri, documentație și implementare.'
    },
    {
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
          <circle cx="9" cy="7" r="4"></circle>
          <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
          <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
        </svg>
      ),
      title: 'Mentorat pentru creștere',
      description: 'Programe de mentorat cu antreprenori experimentați pentru a-ți accelera creșterea afacerii.'
    }
  ];

  const eligibility = [
    'Să fii o societate comercială (SRL, SRL-D, SA) înființată conform Legii 31/1990',
    'Să nu ai datorii la bugetul de stat și la bugetele locale',
    'Să creezi cel puțin un loc de muncă cu normă întreagă pe perioadă nedeterminată',
    'Să menții investiția finanțată pentru cel puțin 3 ani după finalizarea proiectului'
  ];

  return (
    <div className="py-16 container mx-auto px-6 relative">
      <h2 className="text-3xl font-bold text-gradient-gray text-center mb-12">Despre programul Startup Nation 2025</h2>
      
      <div className="max-w-3xl mx-auto mb-16">
        <p className="text-gray-700 mb-6">
          Programul Startup Nation 2025 este o inițiativă a Guvernului României pentru sprijinirea 
          antreprenorilor la început de drum. Prin acest program, poți obține o finanțare nerambursabilă 
          de până la 250.000 lei pentru a-ți deschide sau dezvolta afacerea.
        </p>
        
        <p className="text-gray-700 mb-6">
          Programul se adresează IMM-urilor nou înființate sau cu activitate recentă și încurajează 
          inovația, tehnologia și crearea de locuri de muncă. Domeniile prioritare includ IT, producție, 
          servicii creative, sănătate, educație și turism.
        </p>
      </div>
      
      <div className="grid md:grid-cols-3 gap-6 mb-16">
        {benefits.map((benefit, index) => (
          <div key={index} className="glassmorphism rounded-2xl p-6 shadow-md hover-scale">
            <div className="text-blue-500 mb-4">{benefit.icon}</div>
            <h3 className="text-xl font-semibold mb-2 text-gradient-blue-purple">{benefit.title}</h3>
            <p className="text-gray-600">{benefit.description}</p>
          </div>
        ))}
      </div>
      
      <div className="glassmorphism rounded-2xl p-8 shadow-md">
        <h3 className="text-xl font-semibold mb-4 text-gradient-orange-pink">Criterii de eligibilitate</h3>
        <ul className="space-y-3">
          {eligibility.map((item, index) => (
            <li key={index} className="flex items-start">
              <svg className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
              <span className="text-gray-700">{item}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default ProgramInfoSection;
