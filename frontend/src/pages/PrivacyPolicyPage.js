import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Navbar from '../components/landing/Navbar';
import Footer from '../components/common/Footer';

const PrivacyPolicyPage = () => {
  const location = useLocation();

  useEffect(() => {
    // Verifică dacă URL-ul conține un hash și navigheaza la ancora respectivă
    if (location.hash) {
      const element = document.getElementById(location.hash.substring(1));
      if (element) {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [location]);

  return (
    <div id="privacy-policy" className="bg-gray-50 min-h-screen">
      {/* Navigation Bar */}
      <Navbar />
      
      <div className="container mx-auto px-6 py-12 mt-24">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-800 mb-8">Politica de Confidențialitate și Protecția Datelor (GDPR)</h1>
          
          <div className="bg-white rounded-xl shadow-md p-8">
            <div className="space-y-6">
              <section>
                <h2 className="text-xl font-semibold text-gray-700 mb-3">1. Introducere</h2>
                <p className="text-gray-600">
                  Protecția datelor dumneavoastră cu caracter personal este extrem de importantă pentru noi. Această Politică de Confidențialitate explică modul în care colectăm, folosim, divulgăm, transferăm și stocăm datele dumneavoastră personale atunci când utilizați platforma Start-Up Nation 2025.
                </p>
                <p className="text-gray-600 mt-2">
                  Ne angajăm să respectăm Regulamentul General privind Protecția Datelor (GDPR) al Uniunii Europene și toate legile aplicabile privind protecția datelor din România.
                </p>
                <p className="text-gray-600 mt-2">
                  Vă rugăm să citiți cu atenție această Politică de Confidențialitate înainte de a utiliza platformă noastră sau de a ne furniza orice date personale.
                </p>
              </section>
              
              <section>
                <h2 className="text-xl font-semibold text-gray-700 mb-3">2. Operator de Date</h2>
                <p className="text-gray-600">
                  Operatorul de date pentru informațiile colectate prin intermediul platformei Start-Up Nation 2025 este:
                </p>
                <p className="text-gray-600 mt-2">
                  Areaforu<br />
                
                  38911092<br />
                  Email: contact@aplica-startup.ro
                </p>
                <p className="text-gray-600 mt-2">
                  Responsabilul nostru cu protecția datelor (DPO) poate fi contactat la: contact@aplica-startup.ro
                </p>
              </section>
              
              <section>
                <h2 className="text-xl font-semibold text-gray-700 mb-3">3. Datele pe care le Colectăm</h2>
                <p className="text-gray-600">
                  Putem colecta următoarele categorii de date cu caracter personal:
                </p>
                <ul className="list-disc pl-6 mt-2 text-gray-600 space-y-1">
                  <li>
                    <strong>Informații de identificare</strong>: nume, prenume, adresă, număr de telefon, adresă de email, CNP
                  </li>
                  <li>
                    <strong>Informații despre cont</strong>: nume de utilizator, parolă (stocată în format criptat)
                  </li>
                  <li>
                    <strong>Informații profesionale</strong>: educație, experiență profesională, locuri de muncă anterioare
                  </li>
                  <li>
                    <strong>Informații despre afacere</strong>: detalii despre ideea de afacere, planuri de afaceri, proiecții financiare
                  </li>
                  <li>
                    <strong>Date tehnice</strong>: adresa IP, tipul și versiunea browserului, setarea fusului orar, tipurile și versiunile plugin-urilor de browser, sistemul de operare și platforma
                  </li>
                  <li>
                    <strong>Date de utilizare</strong>: informații despre modul în care utilizați platforma noastră
                  </li>
                  <li>
                    <strong>Date de marketing</strong>: preferințele dumneavoastră în ceea ce privește primirea materialelor de marketing de la noi
                  </li>
                </ul>
              </section>
              
              <section>
                <h2 className="text-xl font-semibold text-gray-700 mb-3">4. Cum Colectăm Datele Dumneavoastră</h2>
                <p className="text-gray-600">
                  Colectăm date personale prin următoarele metode:
                </p>
                <ul className="list-disc pl-6 mt-2 text-gray-600 space-y-1">
                  <li>
                    <strong>Interacțiuni directe</strong>: date furnizate atunci când vă înregistrați, completați formulare, corespondeți cu noi
                  </li>
                  <li>
                    <strong>Tehnologii automate</strong>: în timpul interacțiunii cu platforma noastră, colectăm automat date tehnice despre echipamentul, acțiunile și tiparele de navigare
                  </li>
                  <li>
                    <strong>Surse terțe</strong>: putem primi date despre dumneavoastră de la diverși terți, cum ar fi furnizori de servicii tehnice, de plată și de livrare, furnizori de analize, furnizori de servicii de căutare, registre și evidențe publice
                  </li>
                </ul>
              </section>
              
              <section>
                <h2 className="text-xl font-semibold text-gray-700 mb-3">5. Scopuri și Temei Juridic pentru Prelucrare</h2>
                <p className="text-gray-600">
                  Prelucrăm datele dumneavoastră personale numai dacă avem un temei juridic valid pentru a face acest lucru. Prelucrăm datele dumneavoastră pentru următoarele scopuri:
                </p>
                
                <div className="mt-4">
                  <h3 className="text-lg font-medium text-gray-700 mb-2">5.1 Executarea unui contract</h3>
                  <p className="text-gray-600">
                    Prelucrăm datele dumneavoastră pentru a vă furniza serviciile solicitate:
                  </p>
                  <ul className="list-disc pl-6 mt-1 text-gray-600 space-y-1">
                    <li>Înregistrarea și gestionarea contului dumneavoastră</li>
                    <li>Furnizarea accesului la cursurile de formare și certificări</li>
                    <li>Oferirea de consultanță și asistență pentru planurile de afaceri</li>
                    <li>Procesarea cererilor de finanțare și a documentelor aferente</li>
                  </ul>
                </div>
                
                <div className="mt-4">
                  <h3 className="text-lg font-medium text-gray-700 mb-2">5.2 Interese legitime</h3>
                  <p className="text-gray-600">
                    Prelucrăm datele dumneavoastră pentru interesele noastre legitime:
                  </p>
                  <ul className="list-disc pl-6 mt-1 text-gray-600 space-y-1">
                    <li>Îmbunătățirea platformei și a serviciilor noastre</li>
                    <li>Analize de date și cercetare pentru a dezvolta și îmbunătăți serviciile</li>
                    <li>Protejarea platformei și a utilizatorilor împotriva fraudelor și activităților ilegale</li>
                    <li>Administrarea eficientă a afacerii noastre</li>
                  </ul>
                </div>
                
                <div className="mt-4">
                  <h3 className="text-lg font-medium text-gray-700 mb-2">5.3 Conformitatea cu obligațiile legale</h3>
                  <p className="text-gray-600">
                    Prelucrăm datele dumneavoastră pentru a respecta obligațiile legale:
                  </p>
                  <ul className="list-disc pl-6 mt-1 text-gray-600 space-y-1">
                    <li>Respectarea cerințelor programului Start-Up Nation și a altor reglementări guvernamentale</li>
                    <li>Conformitatea cu obligațiile fiscale și contabile</li>
                    <li>Răspunsul la solicitările autorităților de reglementare și ale organismelor de aplicare a legii</li>
                  </ul>
                </div>
                
                <div className="mt-4">
                  <h3 className="text-lg font-medium text-gray-700 mb-2">5.4 Consimțământ</h3>
                  <p className="text-gray-600">
                    În anumite cazuri, prelucrăm datele dumneavoastră pe baza consimțământului explicit:
                  </p>
                  <ul className="list-disc pl-6 mt-1 text-gray-600 space-y-1">
                    <li>Trimiterea de comunicări de marketing</li>
                    <li>Colectarea anumitor date prin cookie-uri și tehnologii similare</li>
                    <li>Utilizarea datelor dumneavoastră în scopuri de cercetare și statistică</li>
                  </ul>
                  <p className="text-gray-600 mt-2">
                    Aveți dreptul să vă retrageți consimțământul în orice moment, fără a afecta legalitatea prelucrării bazate pe consimțământ înainte de retragerea acestuia.
                  </p>
                </div>
              </section>
              
              <section>
                <h2 className="text-xl font-semibold text-gray-700 mb-3">6. Divulgarea Datelor Dumneavoastră</h2>
                <p className="text-gray-600">
                  Putem partaja datele dumneavoastră personale cu următoarele categorii de destinatari:
                </p>
                <ul className="list-disc pl-6 mt-2 text-gray-600 space-y-1">
                  <li>
                    <strong>Furnizori de servicii</strong>: terți care furnizează servicii în numele nostru, cum ar fi procesarea plăților, furnizarea de infrastructură IT și servicii conexe, servicii de email și hosting
                  </li>
                  <li>
                    <strong>Autorități publice</strong>: agenții guvernamentale implicate în programul Start-Up Nation, organisme de reglementare și alte autorități
                  </li>
                  <li>
                    <strong>Parteneri de afaceri</strong>: terți implicați în furnizarea serviciilor, cum ar fi formatori, mentori și consultanți
                  </li>
                  <li>
                    <strong>Consultanți profesionali</strong>: consultanți, bancheri, auditori, avocați, asigurători, care furnizează servicii de consultanță, bancare, juridice, de asigurare și contabile
                  </li>
                </ul>
                <p className="text-gray-600 mt-2">
                  Solicităm tuturor terților să respecte securitatea datelor dumneavoastră personale și să le trateze în conformitate cu legea. Nu permitem furnizorilor noștri de servicii terți să utilizeze datele dumneavoastră personale în scopuri proprii și le permitem să prelucreze datele dumneavoastră personale numai în scopuri specificate și conform instrucțiunilor noastre.
                </p>
              </section>
              
              <section>
                <h2 className="text-xl font-semibold text-gray-700 mb-3">7. Transferuri Internaționale de Date</h2>
                <p className="text-gray-600">
                  Datele dumneavoastră personale pot fi transferate și procesate în țări din afara Spațiului Economic European (SEE). Aceste țări pot avea legi diferite privind protecția datelor.
                </p>
                <p className="text-gray-600 mt-2">
                  Atunci când transferăm datele dumneavoastră în afara SEE, ne asigurăm că acestea beneficiază de un nivel similar de protecție prin implementarea următoarelor garanții:
                </p>
                <ul className="list-disc pl-6 mt-2 text-gray-600 space-y-1">
                  <li>Transferăm datele dumneavoastră personale către țări care au fost considerate de Comisia Europeană ca oferind un nivel adecvat de protecție a datelor personale</li>
                  <li>Când utilizăm anumiți furnizori de servicii, putem utiliza contracte specifice aprobate de Comisia Europeană care oferă datelor personale aceeași protecție pe care o au în Europa (Clauzele Contractuale Standard)</li>
                  <li>Când utilizăm furnizori din SUA, putem transfera date către aceștia dacă sunt parte a mecanismelor de certificare, cum ar fi EU-US Privacy Shield sau dacă implementează Clauzele Contractuale Standard</li>
                </ul>
              </section>
              
              <section>
                <h2 className="text-xl font-semibold text-gray-700 mb-3">8. Securitatea Datelor</h2>
                <p className="text-gray-600">
                  Am implementat măsuri de securitate adecvate pentru a preveni pierderea accidentală, utilizarea sau accesarea neautorizată, modificarea sau divulgarea datelor dumneavoastră personale. Acestea includ:
                </p>
                <ul className="list-disc pl-6 mt-2 text-gray-600 space-y-1">
                  <li>Criptarea datelor sensibile</li>
                  <li>Protocoale HTTPS pentru transmiterea datelor</li>
                  <li>Sisteme de autentificare cu mai multe niveluri</li>
                  <li>Actualizări regulate de securitate și teste de penetrare</li>
                  <li>Acces restricționat la date pentru personalul nostru, pe baza necesității de a cunoaște</li>
                  <li>Politici și proceduri interne stricte pentru protecția datelor</li>
                  <li>Instruirea personalului cu privire la importanța confidențialității datelor</li>
                </ul>
                <p className="text-gray-600 mt-2">
                  În plus, am instituit proceduri pentru a aborda orice breșă de securitate suspectată a datelor personale și vă vom notifica pe dumneavoastră și orice autoritate de reglementare aplicabilă cu privire la o breșă, în cazul în care suntem obligați legal să facem acest lucru.
                </p>
              </section>
              
              <section>
                <h2 className="text-xl font-semibold text-gray-700 mb-3">9. Păstrarea Datelor</h2>
                <p className="text-gray-600">
                  Vom păstra datele dumneavoastră personale doar atât timp cât este necesar pentru a îndeplini scopurile pentru care le-am colectat, inclusiv în scopul satisfacerii oricăror cerințe legale, contabile sau de raportare.
                </p>
                <p className="text-gray-600 mt-2">
                  Pentru a determina perioada adecvată de păstrare a datelor personale, luăm în considerare cantitatea, natura și sensibilitatea datelor personale, riscul potențial de daune din utilizarea neautorizată sau divulgarea datelor dumneavoastră personale, scopurile pentru care procesăm datele dumneavoastră personale și dacă putem atinge aceste scopuri prin alte mijloace, precum și cerințele legale aplicabile.
                </p>
                <p className="text-gray-600 mt-2">
                  În unele circumstanțe, putem anonimiza datele dumneavoastră personale (astfel încât acestea să nu mai poată fi asociate cu dumneavoastră) în scopuri de cercetare sau statistice, caz în care putem utiliza aceste informații pe termen nelimitat fără a vă notifica ulterior.
                </p>
              </section>
              
              <section>
                <h2 className="text-xl font-semibold text-gray-700 mb-3">10. Drepturile Dumneavoastră</h2>
                <p className="text-gray-600">
                  În conformitate cu GDPR, aveți următoarele drepturi în ceea ce privește datele dumneavoastră personale:
                </p>
                
                <div className="mt-3">
                  <h3 className="text-lg font-medium text-gray-700 mb-1">Dreptul de acces</h3>
                  <p className="text-gray-600">
                    Aveți dreptul de a solicita o copie a informațiilor pe care le deținem despre dumneavoastră.
                  </p>
                </div>
                
                <div className="mt-3">
                  <h3 className="text-lg font-medium text-gray-700 mb-1">Dreptul la rectificare</h3>
                  <p className="text-gray-600">
                    Aveți dreptul de a solicita corectarea sau completarea datelor personale inexacte sau incomplete.
                  </p>
                </div>
                
                <div className="mt-3">
                  <h3 className="text-lg font-medium text-gray-700 mb-1">Dreptul la ștergere ("dreptul de a fi uitat")</h3>
                  <p className="text-gray-600">
                    Aveți dreptul de a solicita ștergerea datelor dumneavoastră personale în anumite circumstanțe.
                  </p>
                </div>
                
                <div className="mt-3">
                  <h3 className="text-lg font-medium text-gray-700 mb-1">Dreptul la restricționarea prelucrării</h3>
                  <p className="text-gray-600">
                    Aveți dreptul de a solicita restricționarea prelucrării datelor dumneavoastră personale în anumite circumstanțe.
                  </p>
                </div>
                
                <div className="mt-3">
                  <h3 className="text-lg font-medium text-gray-700 mb-1">Dreptul la portabilitatea datelor</h3>
                  <p className="text-gray-600">
                    Aveți dreptul de a primi datele dumneavoastră personale într-un format structurat, utilizat în mod curent și care poate fi citit automat, și de a le transmite altui operator.
                  </p>
                </div>
                
                <div className="mt-3">
                  <h3 className="text-lg font-medium text-gray-700 mb-1">Dreptul la opoziție</h3>
                  <p className="text-gray-600">
                    Aveți dreptul de a vă opune prelucrării datelor dumneavoastră personale în anumite circumstanțe, inclusiv prelucrării pentru marketing direct.
                  </p>
                </div>
                
                <div className="mt-3">
                  <h3 className="text-lg font-medium text-gray-700 mb-1">Dreptul de a nu face obiectul unei decizii bazate exclusiv pe prelucrarea automată</h3>
                  <p className="text-gray-600">
                    Aveți dreptul de a nu face obiectul unei decizii bazate exclusiv pe prelucrarea automată, inclusiv crearea de profiluri, care produce efecte juridice care vă privesc sau vă afectează în mod similar într-o măsură semnificativă.
                  </p>
                </div>
                
                <p className="text-gray-600 mt-4">
                  Dacă doriți să vă exercitați oricare dintre aceste drepturi, vă rugăm să ne contactați utilizând detaliile de contact furnizate mai jos.
                </p>
                <p className="text-gray-600 mt-2">
                  Nu veți trebui să plătiți o taxă pentru a vă exercita aceste drepturi. Cu toate acestea, este posibil să percepem o taxă rezonabilă dacă cererea dumneavoastră este în mod clar nefondată, repetitivă sau excesivă. Alternativ, am putea refuza să dăm curs cererii dumneavoastră în aceste circumstanțe.
                </p>
                <p className="text-gray-600 mt-2">
                  Este posibil să avem nevoie să solicităm informații specifice de la dumneavoastră pentru a ne ajuta să confirmăm identitatea dumneavoastră și pentru a vă asigura dreptul de a accesa datele dumneavoastră personale (sau de a vă exercita oricare dintre celelalte drepturi). Aceasta este o măsură de securitate pentru a ne asigura că datele personale nu sunt divulgate niciunei persoane care nu are dreptul să le primească.
                </p>
                <p className="text-gray-600 mt-2">
                  Încercăm să răspundem tuturor solicitărilor legitime în termen de o lună. Ocazional, ne poate lua mai mult de o lună dacă cererea dumneavoastră este deosebit de complexă sau dacă ați făcut mai multe cereri. În acest caz, vă vom notifica și vă vom ține la curent.
                </p>
              </section>
              
              <section>
                <h2 className="text-xl font-semibold text-gray-700 mb-3">11. Cookie-uri și Tehnologii Similare</h2>
                <p className="text-gray-600">
                  Platforma noastră utilizează cookie-uri și tehnologii similare pentru a distinge preferințele dumneavoastră de cele ale altor utilizatori. Acest lucru ne ajută să vă oferim o experiență bună atunci când navigați pe platforma noastră și ne permite, de asemenea, să o îmbunătățim.
                </p>
                <p className="text-gray-600 mt-2">
                  Un cookie este un fișier mic de litere și cifre pe care îl stocăm în browserul dumneavoastră sau pe hard disk-ul dispozitivului dumneavoastră, cu acordul dumneavoastră. Cookie-urile conțin informații care sunt transferate pe hard disk-ul dispozitivului dumneavoastră.
                </p>
                <p className="text-gray-600 mt-2">
                  Utilizăm următoarele tipuri de cookie-uri:
                </p>
                <ul className="list-disc pl-6 mt-2 text-gray-600 space-y-1">
                  <li>
                    <strong>Cookie-uri strict necesare</strong>: Acestea sunt esențiale pentru a vă permite să utilizați funcționalitățile de bază ale platformei noastre.
                  </li>
                  <li>
                    <strong>Cookie-uri analitice/de performanță</strong>: Ne permit să recunoaștem și să numărăm numărul de vizitatori și să vedem cum se deplasează vizitatorii în jurul platformei noastre atunci când o utilizează.
                  </li>
                  <li>
                    <strong>Cookie-uri de funcționalitate</strong>: Acestea sunt utilizate pentru a vă recunoaște atunci când reveniți pe platforma noastră. Acest lucru ne permite să personalizăm conținutul nostru pentru dumneavoastră.
                  </li>
                  <li>
                    <strong>Cookie-uri de direcționare</strong>: Acestea înregistrează vizita dumneavoastră pe platforma noastră, paginile pe care le-ați vizitat și link-urile pe care le-ați urmat. Vom folosi aceste informații pentru a face platforma noastră și publicitatea afișată pe aceasta mai relevante pentru interesele dumneavoastră.
                  </li>
                </ul>
                <p className="text-gray-600 mt-2">
                  Puteți seta browserul dumneavoastră să refuze toate sau unele cookie-uri, sau să vă alerteze atunci când site-urile web setează sau accesează cookie-uri. Dacă dezactivați sau refuzați cookie-urile, vă rugăm să rețineți că unele părți ale acestei platforme pot deveni inaccesibile sau pot să nu funcționeze corect.
                </p>
              </section>
              
              <section>
                <h2 className="text-xl font-semibold text-gray-700 mb-3">12. Modificări ale Politicii de Confidențialitate</h2>
                <p className="text-gray-600">
                  Ne rezervăm dreptul de a actualiza această Politică de Confidențialitate în orice moment. Orice modificări vor fi postate pe această pagină, cu o notificare vizibilă pe pagina principală a platformei noastre.
                </p>
                <p className="text-gray-600 mt-2">
                  Vă încurajăm să revizuiți periodic această Politică de Confidențialitate pentru a fi informat despre modul în care protejăm datele dumneavoastră personale.
                </p>
                <p className="text-gray-600 mt-2">
                  Continuarea utilizării platformei noastre după publicarea modificărilor acestei Politici de Confidențialitate va constitui acceptarea de către dumneavoastră a acestor modificări.
                </p>
              </section>
              
              <section>
                <h2 className="text-xl font-semibold text-gray-700 mb-3">13. Plângeri</h2>
                <p className="text-gray-600">
                  Dacă aveți o plângere cu privire la modul în care am gestionat datele dumneavoastră personale, vă rugăm să ne contactați mai întâi utilizând detaliile furnizate mai jos.
                </p>
                <p className="text-gray-600 mt-2">
                  Aveți, de asemenea, dreptul de a depune o plângere la Autoritatea Națională de Supraveghere a Prelucrării Datelor cu Caracter Personal (ANSPDCP), autoritatea de supraveghere din România pentru probleme de protecție a datelor:
                </p>
                <p className="text-gray-600 mt-2">
                  Autoritatea Națională de Supraveghere a Prelucrării Datelor cu Caracter Personal<br />
                  B-dul G-ral. Gheorghe Magheru 28-30, Sector 1, cod poștal 010336, București, România<br />
                  Telefon: +40.318.059.211<br />
                  Email: anspdcp@dataprotection.ro<br />
                  Website: www.dataprotection.ro
                </p>
              </section>
              
              <section>
                <h2 className="text-xl font-semibold text-gray-700 mb-3">14. Contact</h2>
                <p className="text-gray-600">
                  Dacă aveți întrebări despre această Politică de Confidențialitate sau despre practicile noastre referitoare la datele dumneavoastră personale, vă rugăm să ne contactați la:
                </p>
                <p className="text-gray-600 mt-2">
                  Areaforu<br />
                  Email: contact@aplica-startup.ro<br />
                  <br />
                  
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

export default PrivacyPolicyPage;