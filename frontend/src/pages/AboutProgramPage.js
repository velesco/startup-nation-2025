import React from 'react';
import Navbar from '../components/landing/Navbar';
import Footer from '../components/common/Footer';

const AboutProgramPage = () => {
  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Navigation Bar */}
      <Navbar />
      
      {/* Main Content */}
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold text-gray-800 mb-6 text-center">Despre programul Startup Nation 2025</h1>
        
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-xl p-8 shadow-sm mb-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Ce este Startup Nation 2025?</h2>
            <p className="text-gray-600 mb-4">
              Startup Nation 2025 este un program de finanțare nerambursabilă destinat antreprenorilor care doresc să înceapă o afacere sau să-și dezvolte afacerea existentă. Programul oferă până la 250.000 lei finanțare nerambursabilă pentru a sprijini dezvoltarea ecosistemului antreprenorial din România.
            </p>
            <p className="text-gray-600 mb-4">
              Lansat în 2025, această ediție a programului Startup Nation vine cu îmbunătățiri semnificative și un focus pe domenii inovative și cu potențial mare de creștere.
            </p>
          </div>
          
          <div className="bg-white rounded-xl p-8 shadow-sm mb-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Obiectivele programului</h2>
            <ul className="list-disc list-inside space-y-2 text-gray-600">
              <li>Stimularea înființării și dezvoltării întreprinderilor mici și mijlocii</li>
              <li>Îmbunătățirea performanțelor economice ale acestora</li>
              <li>Crearea de noi locuri de muncă</li>
              <li>Inserția pe piața muncii a persoanelor defavorizate, șomerilor și absolvenților</li>
              <li>Creșterea investițiilor în tehnologii noi inovative</li>
            </ul>
          </div>
          
          <div className="bg-white rounded-xl p-8 shadow-sm mb-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Cine poate beneficia?</h2>
            <p className="text-gray-600 mb-4">
              Programul se adresează următoarelor categorii:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-600">
              <li>Societăți (microîntreprinderi, întreprinderi mici și mijlocii) înființate de persoane fizice</li>
              <li>Start-up-uri create de studenți sau tineri întreprinzători</li>
              <li>IMM-uri existente care doresc să își dezvolte activitatea</li>
              <li>Întreprinderi sociale care implementează un model de afacere cu impact în comunitate</li>
            </ul>
          </div>
          
          <div className="bg-white rounded-xl p-8 shadow-sm mb-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Domeniile prioritare</h2>
            <p className="text-gray-600 mb-4">
              Programul Startup Nation 2025 sprijină cu precădere următoarele domenii:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-600">
              <li>Industria tech și IT&C</li>
              <li>Producție și servicii inovative</li>
              <li>Energie verde și tehnologii curate</li>
              <li>Sănătate și biotehnologie</li>
              <li>Agricultură și industrie alimentară</li>
              <li>Industrii creative și culturale</li>
            </ul>
          </div>
          
          <div className="bg-white rounded-xl p-8 shadow-sm">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Etapele programului</h2>
            <ol className="list-decimal list-inside space-y-4 text-gray-600">
              <li>
                <span className="font-medium text-gray-800">Înscriere online</span>
                <p className="mt-1 ml-6">Completarea și depunerea online a planului de afaceri</p>
              </li>
              <li>
                <span className="font-medium text-gray-800">Evaluare planuri de afaceri</span>
                <p className="mt-1 ml-6">Verificarea eligibilității și evaluarea tehnică și financiară</p>
              </li>
              <li>
                <span className="font-medium text-gray-800">Publicare rezultate</span>
                <p className="mt-1 ml-6">Afișarea listei cu aplicanții acceptați pentru finanțare</p>
              </li>
              <li>
                <span className="font-medium text-gray-800">Semnare contracte</span>
                <p className="mt-1 ml-6">Întocmirea și semnarea contractelor de finanțare</p>
              </li>
              <li>
                <span className="font-medium text-gray-800">Implementare proiecte</span>
                <p className="mt-1 ml-6">Realizarea investițiilor conform planului de afaceri aprobat</p>
              </li>
              <li>
                <span className="font-medium text-gray-800">Monitorizare</span>
                <p className="mt-1 ml-6">Urmărirea indicatorilor de realizare timp de 2 ani de la finalizarea implementării</p>
              </li>
            </ol>
          </div>
        </div>
      </div>
      
      {/* Footer */}
      <Footer />
    </div>
  );
};

export default AboutProgramPage;