import React from 'react';

const ProgramInfoSection = () => {
  const steps = [
    {
      number: 1,
      title: 'Aplică mai jos',
      description: 'Te înscrii în platforma noastră în 2 minute.'
    },
    {
      number: 2,
      title: 'Semnezi contractul pentru cursuri',
      description: 'Primești 200 lei la finalizarea cursului. Confirmăm locul tău în programul de formare antreprenorială.'
    },
    {
      number: 3,
      title: 'Urmezi cursul 100% online',
      description: 'Flexibil, oriunde, oricând și fără bătăi de cap.'
    },
    {
      number: 4,
      title: 'Primești consultanță + plan de afaceri gata făcut',
      description: 'Plan complet, adaptat afacerii tale + depunem proiectul pentru tine.'
    }
  ];

  const certifications = [
    {
      number: 1,
      title: 'Inteligență Artificială (AI)'
    },
    {
      number: 2,
      title: 'Machine Learning'
    },
    {
      number: 3,
      title: '3D Printing'
    },
    {
      number: 4,
      title: 'Robotic Process Automation (RPA)'
    },
    {
      number: 5,
      title: 'Big Data & Analytics'
    }
  ];

  const benefits = [
    {
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"></circle>
          <polyline points="12 6 12 12 16 14"></polyline>
        </svg>
      ),
      title: '2000 locuri disponibile',
      description: 'Furnizor acreditat de minister pentru cursul obligatoriu de antreprenoriat'
    },
    {
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
          <polyline points="14 2 14 8 20 8"></polyline>
          <line x1="16" y1="13" x2="8" y2="13"></line>
          <line x1="16" y1="17" x2="8" y2="17"></line>
          <polyline points="10 9 9 9 8 9"></polyline>
        </svg>
      ),
      title: 'Planuri de afaceri complete',
      description: 'Cu acces la furnizori și experți din domeniu'
    },
    {
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
          <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
        </svg>
      ),
      title: 'Zero birocrație',
      description: 'Ne ocupăm noi de tot'
    },
    {
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M22 12h-4l-3 9L9 3l-3 9H2"></path>
        </svg>
      ),
      title: 'Cursuri online tehnice',
      description: 'Interactive și acreditate internațional'
    }
  ];

  return (
    <div className="py-16 container mx-auto px-6 relative">
      <h2 className="text-3xl font-bold text-gradient-gray text-center mb-12">Pașii către finanțare</h2>
      
      <div className="max-w-4xl mx-auto mb-16">
        {/* Steps Section */}
        <div className="grid md:grid-cols-2 gap-6 mb-16">
          {steps.map((step) => (
            <div key={step.number} className="glassmorphism rounded-2xl p-6 shadow-md hover-scale relative">
              <div className="bg-purple-100 text-purple-600 w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg mb-4">
                {step.number}
              </div>
              <h3 className="text-lg font-semibold mb-2 text-gradient-blue-purple">{step.title}</h3>
              <p className="text-gray-600 text-sm">{step.description}</p>
            </div>
          ))}
        </div>
        
        {/* Eligibility Criteria Section */}
        <div className="mb-16">
          <h3 className="text-2xl font-bold text-center mb-8 text-gradient-blue-purple">
            Criterii de eligibilitate
          </h3>
          
          <div className="glassmorphism rounded-2xl p-8 shadow-md">
            <p className="text-gray-700 mb-6 text-center">Programul se adresează următoarelor categorii de persoane:</p>
            
            <div className="grid md:grid-cols-1 gap-4">
              <div className="flex items-start">
                <div className="text-green-500 mr-3 mt-0.5 flex-shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <p className="text-gray-700">Tineri cu vârsta cuprinsă între <strong>18-30 ani</strong></p>
              </div>
              
              
              <div className="flex items-start">
                <div className="text-green-500 mr-3 mt-0.5 flex-shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <p className="text-gray-700">Persoane aflate în căutarea unui loc de muncă</p>
              </div>
              
              <div className="flex items-start">
                <div className="text-green-500 mr-3 mt-0.5 flex-shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <p className="text-gray-700">Șomeri</p>
              </div>
              
              <div className="flex items-start">
                <div className="text-green-500 mr-3 mt-0.5 flex-shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <p className="text-gray-700">Șomeri de lungă durată</p>
              </div>
              
              <div className="flex items-start">
                <div className="text-green-500 mr-3 mt-0.5 flex-shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <p className="text-gray-700">Persoane inactive</p>
              </div>
              
              <div className="flex items-start">
                <div className="text-green-500 mr-3 mt-0.5 flex-shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <p className="text-gray-700">Persoane din <strong>DIASPORA</strong> (persoane care pot face dovada domiciliului sau rezidenței în străinătate 12 luni consecutive anterioare înscrierii)</p>
              </div>
              
              <div className="flex items-start md:col-span-2">
                <div className="text-green-500 mr-3 mt-0.5 flex-shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <p className="text-gray-700">Persoane din grupurile dezavantajate pe piața muncii (persoane cu nivel scăzut de instruire (ultimul nivel de școlarizare absolvit ISCED 2), persoane cu dizabilități, persoane din comunitățile supuse riscului de excluziune socială, persoane din zonele rurale, persoane eliberate din detenție, tineri postinstituționalizați)</p>
              </div>
            </div>
          </div>
        </div>

        {/* Certifications Section */}
        <div className="mb-16">
          <h3 className="text-2xl font-bold text-center mb-8 text-gradient-orange-pink">
            Bonus exclusiv pentru participanții noștri
          </h3>
          <p className="text-gray-700 text-center mb-6">
            Certificări internaționale în domenii de top (în valoare de 17.000 euro):
          </p>
          
          <div className="grid md:grid-cols-5 gap-4">
            {certifications.map((cert) => (
              <div key={cert.number} className="glassmorphism rounded-xl p-4 text-center">
                <div className="bg-blue-100 text-blue-600 w-8 h-8 rounded-full flex items-center justify-center font-bold text-md mb-3 mx-auto">
                  {cert.number}
                </div>
                <p className="text-gray-800 font-medium">{cert.title}</p>
              </div>
            ))}
          </div>
          <p className="text-gray-700 text-center mt-6">
            Obții competențe de viitor, recunoscute global.
          </p>
        </div>
        
        {/* Why Choose Us Section */}
        <h3 className="text-2xl font-bold text-center mb-8 text-gradient-green-teal">
          De ce să alegi echipa noastră
        </h3>
        
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {benefits.map((benefit, index) => (
            <div key={index} className="flex items-start p-4 glassmorphism rounded-xl shadow-sm">
              <div className="text-blue-500 mr-4 flex-shrink-0">{benefit.icon}</div>
              <div>
                <h4 className="text-lg font-semibold mb-1">{benefit.title}</h4>
                <p className="text-gray-600 text-sm">{benefit.description}</p>
              </div>
            </div>
          ))}
        </div>
        
        <div className="glassmorphism rounded-2xl p-6 shadow-md text-center bg-orange-50 border border-orange-100 mt-8">
          <h4 className="text-lg font-semibold text-orange-600 mb-1">ATENȚIE!</h4>
          <p className="text-gray-700">Înscrierea pentru cursuri tehnice este posibilă până pe 15 aprilie</p>
        </div>
      </div>
    </div>
  );
};

export default ProgramInfoSection;