import React from 'react';
import Navbar from '../components/landing/Navbar';
import Footer from '../components/common/Footer';

const TermsAndConditionsPage = () => {
  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Navigation Bar */}
      <Navbar />
      
      <div className="container mx-auto px-6 py-12">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-800 mb-8">Termeni și Condiții</h1>
          
          <div className="bg-white rounded-xl shadow-md p-8">
            <div className="space-y-6">
              <section>
                <h2 className="text-xl font-semibold text-gray-700 mb-3">1. Introducere</h2>
                <p className="text-gray-600">
                  Acești Termeni și Condiții guvernează utilizarea platformei Start-Up Nation 2025, accesibilă prin intermediul website-ului nostru, și definesc relația contractuală dintre dumneavoastră și noi. Vă rugăm să citiți cu atenție acești termeni înainte de a utiliza serviciile noastre.
                </p>
                <p className="text-gray-600 mt-2">
                  Prin accesarea și utilizarea platformei noastre, sunteți de acord să respectați și să fiți legat de acești Termeni și Condiții. Dacă nu sunteți de acord cu oricare dintre acești termeni, vă rugăm să nu utilizați platforma noastră.
                </p>
              </section>
              
              <section>
                <h2 className="text-xl font-semibold text-gray-700 mb-3">2. Definiții</h2>
                <p className="text-gray-600">
                  <strong>Platformă</strong>: Se referă la website-ul Start-Up Nation 2025, inclusiv toate paginile, subpaginile și serviciile oferite prin intermediul acestuia.
                </p>
                <p className="text-gray-600 mt-2">
                  <strong>Utilizator</strong>: Orice persoană care accesează sau utilizează Platforma, indiferent dacă este înregistrat sau nu.
                </p>
                <p className="text-gray-600 mt-2">
                  <strong>Cont</strong>: Înregistrarea în cadrul Platformei care permite accesul la funcționalități suplimentare.
                </p>
                <p className="text-gray-600 mt-2">
                  <strong>Servicii</strong>: Toate serviciile, funcționalitățile, tehnologiile și software-ul puse la dispoziție prin intermediul Platformei.
                </p>
                <p className="text-gray-600 mt-2">
                  <strong>Conținut</strong>: Toate informațiile disponibile pe Platformă, inclusiv text, imagini, video, audio, grafice, logo-uri, mărci comerciale, etc.
                </p>
              </section>
              
              <section>
                <h2 className="text-xl font-semibold text-gray-700 mb-3">3. Eligibilitate</h2>
                <p className="text-gray-600">
                  Pentru a vă înregistra și utiliza Platforma, trebuie să îndepliniți următoarele condiții:
                </p>
                <ul className="list-disc pl-6 mt-2 text-gray-600 space-y-1">
                  <li>Aveți cel puțin 18 ani sau vârsta legală pentru a încheia un contract obligatoriu în jurisdicția dumneavoastră;</li>
                  <li>Sunteți o persoană fizică sau reprezentați legal o persoană juridică;</li>
                  <li>Informațiile furnizate în timpul procesului de înregistrare sunt adevărate, exacte, actuale și complete;</li>
                  <li>Veți actualiza informațiile furnizate pentru a le menține adevărate, exacte, actuale și complete.</li>
                </ul>
              </section>
              
              <section>
                <h2 className="text-xl font-semibold text-gray-700 mb-3">4. Înregistrare și Cont</h2>
                <p className="text-gray-600">
                  Pentru a accesa anumite funcționalități ale Platformei, trebuie să vă înregistrați și să creați un cont. În acest proces:
                </p>
                <ul className="list-disc pl-6 mt-2 text-gray-600 space-y-1">
                  <li>Sunteți responsabil pentru menținerea confidențialității datelor de autentificare;</li>
                  <li>Sunteți responsabil pentru toate activitățile desfășurate în contul dumneavoastră;</li>
                  <li>Trebuie să ne notificați imediat despre orice breșă de securitate sau utilizare neautorizată a contului dumneavoastră;</li>
                  <li>Ne rezervăm dreptul de a suspenda sau închide contul dumneavoastră dacă suspectăm activități frauduloase sau încălcări ale acestor Termeni și Condiții.</li>
                </ul>
              </section>
              
              <section>
                <h2 className="text-xl font-semibold text-gray-700 mb-3">5. Programul Start-Up Nation 2025</h2>
                <p className="text-gray-600">
                  Platforma noastră oferă informații și acces la Programul Start-Up Nation 2025, care include:
                </p>
                <ul className="list-disc pl-6 mt-2 text-gray-600 space-y-1">
                  <li>Cursuri de formare antreprenorială și certificări internaționale;</li>
                  <li>Consultanță pentru dezvoltarea planurilor de afaceri;</li>
                  <li>Asistență pentru accesarea finanțărilor de până la 50.000 Euro.</li>
                </ul>
                <p className="text-gray-600 mt-2">
                  Vă rugăm să rețineți că eligibilitatea pentru finanțare depinde de îndeplinirea tuturor criteriilor specificate în documentația oficială a programului și de disponibilitatea fondurilor.
                </p>
              </section>
              
              <section>
                <h2 className="text-xl font-semibold text-gray-700 mb-3">6. Drepturi de Proprietate Intelectuală</h2>
                <p className="text-gray-600">
                  Toate drepturile de proprietate intelectuală asupra Platformei și a Conținutului acesteia (cu excepția conținutului furnizat de utilizatori) sunt deținute de noi sau de licențiatorii noștri. Aceste drepturi sunt protejate de legislația națională și internațională privind proprietatea intelectuală.
                </p>
                <p className="text-gray-600 mt-2">
                  Utilizatorilor li se acordă un drept limitat, neexclusiv, netransferabil de a utiliza Platforma și Conținutul său numai în scopuri personale și necomerciale, în conformitate cu acești Termeni și Condiții.
                </p>
                <p className="text-gray-600 mt-2">
                  Nu aveți permisiunea să:
                </p>
                <ul className="list-disc pl-6 mt-2 text-gray-600 space-y-1">
                  <li>Reproduceți, distribuiți, afișați public, licențiați sau exploatați comercial Platforma sau Conținutul său;</li>
                  <li>Modificați, creați opere derivate, dezasamblați sau încercați să extrageți codul sursă;</li>
                  <li>Eliminați orice notificări de copyright, mărci comerciale sau alte notificări de proprietate.</li>
                </ul>
              </section>
              
              <section>
                <h2 className="text-xl font-semibold text-gray-700 mb-3">7. Conținutul Utilizatorilor</h2>
                <p className="text-gray-600">
                  Când furnizați conținut pe Platformă, ne acordați o licență mondială, neexclusivă, gratuită, transferabilă și care poate fi sublicențiată pentru a utiliza, stoca, afișa, reproduce, modifica, crea opere derivate și distribui acest conținut în legătură cu operarea și promovarea Platformei.
                </p>
                <p className="text-gray-600 mt-2">
                  Garantați că:
                </p>
                <ul className="list-disc pl-6 mt-2 text-gray-600 space-y-1">
                  <li>Dețineți sau aveți drepturile necesare pentru a acorda licența menționată mai sus;</li>
                  <li>Conținutul furnizat nu încalcă drepturile de proprietate intelectuală, drepturile de publicitate sau confidențialitate ale terților;</li>
                  <li>Conținutul furnizat nu conține material ilegal, defăimător, obscen sau ofensator.</li>
                </ul>
                <p className="text-gray-600 mt-2">
                  Ne rezervăm dreptul de a elimina orice conținut care încalcă acești Termeni și Condiții sau pe care îl considerăm, la discreția noastră, dăunător pentru Platformă sau utilizatorii săi.
                </p>
              </section>
              
              <section>
                <h2 className="text-xl font-semibold text-gray-700 mb-3">8. Limitarea Răspunderii</h2>
                <p className="text-gray-600">
                  În măsura permisă de legea aplicabilă, nu vom fi răspunzători pentru:
                </p>
                <ul className="list-disc pl-6 mt-2 text-gray-600 space-y-1">
                  <li>Orice daune indirecte, incidentale, speciale, consecutive sau punitive;</li>
                  <li>Pierderea profiturilor, veniturilor, datelor, oportunităților de afaceri sau a economiilor anticipate;</li>
                  <li>Orice întrerupere, defecțiune sau întârziere în operarea Platformei;</li>
                  <li>Acțiunile sau omisiunile terților, inclusiv ale altor utilizatori;</li>
                  <li>Acuratețea sau completitudinea informațiilor furnizate pe Platformă.</li>
                </ul>
                <p className="text-gray-600 mt-2">
                  În orice caz, răspunderea noastră totală pentru orice reclamație legată de acești Termeni și Condiții sau de utilizarea Platformei nu va depăși suma plătită de dumneavoastră (dacă există) pentru accesul la serviciile noastre în ultimele 12 luni.
                </p>
              </section>
              
              <section>
                <h2 className="text-xl font-semibold text-gray-700 mb-3">9. Indemnizare</h2>
                <p className="text-gray-600">
                  Sunteți de acord să ne indemnizați, să ne apărați și să ne exonerați de orice reclamații, datorii, daune, costuri și cheltuieli, inclusiv onorariile rezonabile ale avocaților, rezultate din:
                </p>
                <ul className="list-disc pl-6 mt-2 text-gray-600 space-y-1">
                  <li>Utilizarea Platformei de către dumneavoastră;</li>
                  <li>Încălcarea acestor Termeni și Condiții;</li>
                  <li>Încălcarea drepturilor terților, inclusiv a drepturilor de proprietate intelectuală, de confidențialitate sau de publicitate;</li>
                  <li>Conținutul pe care îl furnizați pe Platformă.</li>
                </ul>
              </section>
              
              <section>
                <h2 className="text-xl font-semibold text-gray-700 mb-3">10. Modificări ale Termenilor și Condițiilor</h2>
                <p className="text-gray-600">
                  Ne rezervăm dreptul de a modifica acești Termeni și Condiții în orice moment. Modificările vor intra în vigoare imediat după publicarea lor pe Platformă. Continuarea utilizării Platformei după publicarea modificărilor constituie acceptarea acestora.
                </p>
                <p className="text-gray-600 mt-2">
                  Vă încurajăm să revizuiți periodic acești Termeni și Condiții pentru a fi la curent cu eventualele actualizări.
                </p>
              </section>
              
              <section>
                <h2 className="text-xl font-semibold text-gray-700 mb-3">11. Legea Aplicabilă și Jurisdicție</h2>
                <p className="text-gray-600">
                  Acești Termeni și Condiții sunt guvernați și interpretați în conformitate cu legislația din România, fără a da efect vreunui principiu de conflict de legi.
                </p>
                <p className="text-gray-600 mt-2">
                  Orice dispută legată de acești Termeni și Condiții sau de utilizarea Platformei va fi supusă jurisdicției exclusive a instanțelor din România.
                </p>
              </section>
              
              <section>
                <h2 className="text-xl font-semibold text-gray-700 mb-3">12. Prevederi Diverse</h2>
                <p className="text-gray-600">
                  <strong>Integralitatea acordului</strong>: Acești Termeni și Condiții, împreună cu Politica de Confidențialitate, constituie întregul acord între dumneavoastră și noi în ceea ce privește utilizarea Platformei.
                </p>
                <p className="text-gray-600 mt-2">
                  <strong>Renunțare</strong>: Neexercitarea sau neaplicarea oricărui drept sau prevedere din acești Termeni și Condiții nu constituie o renunțare la acel drept sau prevedere.
                </p>
                <p className="text-gray-600 mt-2">
                  <strong>Separabilitate</strong>: Dacă o prevedere din acești Termeni și Condiții este considerată ilegală, nulă sau neaplicabilă, acea prevedere va fi separabilă de restul Termenilor și Condițiilor, care vor rămâne în vigoare și aplicabili.
                </p>
                <p className="text-gray-600 mt-2">
                  <strong>Cesiune</strong>: Nu puteți cesiona sau transfera acești Termeni și Condiții, în totalitate sau parțial, fără consimțământul nostru prealabil scris.
                </p>
                <p className="text-gray-600 mt-2">
                  <strong>Contact</strong>: Pentru orice întrebări sau preocupări legate de acești Termeni și Condiții, vă rugăm să ne contactați la adresa de email: contact@aplica-startup.ro
                </p>
              </section>
              
              <section>
                <p className="text-gray-600 italic">
                  Ultima actualizare: 31 martie 2025
                </p>
              </section>
            </div>
          </div>
        </div>
      </div>
      
      {/* Footer */}
      <Footer />
    </div>
  );
};

export default TermsAndConditionsPage;