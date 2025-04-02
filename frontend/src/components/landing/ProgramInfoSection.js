import React from 'react';

const ProgramInfoSection = () => {
  return (
    <section className="py-16 relative">
      {/* Eligibility Section */}
      <section className="eligibility" id="eligibility">
        <h2 className="section-title">Ești eligibil?</h2>
        
        <div className="eligibility-list">
          <div className="eligibility-item">
            <div className="eligibility-icon">👨‍👩‍👧‍👦</div>
            <h3 className="eligibility-title">Tineri între 18-30 ani</h3>
            <p className="eligibility-text">Dacă ai între 18 și 30 de ani, poți accesa fondurile pentru ideea ta de afacere.</p>
          </div>
          
          <div className="eligibility-item">
            <div className="eligibility-icon">🔍</div>
            <h3 className="eligibility-title">Persoane care caută un loc de muncă</h3>
            <p className="eligibility-text">Orice persoană care caută un loc de muncă <span className="no-age-limit">fără limită de vârstă</span> poate aplica.</p>
          </div>
          
          <div className="eligibility-item">
            <div className="eligibility-icon">📋</div>
            <h3 className="eligibility-title">Șomeri</h3>
            <p className="eligibility-text">Persoanele înregistrate ca șomeri, inclusiv șomeri de lungă durată, <span className="no-age-limit">fără limită de vârstă</span>.</p>
          </div>
          
          <div className="eligibility-item">
            <div className="eligibility-icon">🌍</div>
            <h3 className="eligibility-title">Persoane din DIASPORA</h3>
            <p className="eligibility-text">Dacă poți dovedi domiciliul în străinătate pentru 12 luni consecutive, <span className="no-age-limit">fără limită de vârstă</span>.</p>
          </div>
          
          <div className="eligibility-item">
            <div className="eligibility-icon">👨‍👩‍👧‍👦</div>
            <h3 className="eligibility-title">Persoane inactive</h3>
            <p className="eligibility-text">Persoane care nu sunt angajate și nu sunt înregistrate ca șomeri, <span className="no-age-limit">fără limită de vârstă</span>.</p>
          </div>
          
          <div className="eligibility-item">
            <div className="eligibility-icon">🤝</div>
            <h3 className="eligibility-title">Grupuri dezavantajate</h3>
            <p className="eligibility-text">Persoane cu nivel scăzut de instruire, persoane cu dizabilități, din comunități supuse riscului de excluziune, <span className="no-age-limit">fără limită de vârstă</span>.</p>
          </div>
        </div>
      </section>
      
      {/* Steps Section */}
      <section className="steps" id="steps">
        <h2 className="section-title">Pașii spre finanțare</h2>
        
        <div className="steps-container">
          <div className="step-card">
            <div className="step-number">1</div>
            <div className="step-icon">✅</div>
            <h3 className="step-title">Aplică mai jos</h3>
            <p className="step-text">Te înscrii în platforma noastră în doar 2 minute. Procesul este simplu și rapid.</p>
          </div>
          
          <div className="step-card">
            <div className="step-number">2</div>
            <div className="step-icon">📝</div>
            <h3 className="step-title">Semnezi contractul pentru cursuri</h3>
            <p className="step-text">Primești 200 lei la finalizarea cursului. Confirmăm locul tău în programul de formare antreprenorială.</p>
          </div>
          
          <div className="step-card">
            <div className="step-number">3</div>
            <div className="step-icon">💻</div>
            <h3 className="step-title">Urmezi cursul 100% online</h3>
            <p className="step-text">Flexibil, oriunde, oricând și fără bătăi de cap. Învață în ritmul tău.</p>
          </div>
          
          <div className="step-card">
            <div className="step-number">4</div>
            <div className="step-icon">📊</div>
            <h3 className="step-title">Primești consultanță + plan de afaceri</h3>
            <p className="step-text">Plan complet, adaptat afacerii tale + depunem proiectul pentru tine. Zero birocrație!</p>
          </div>
        </div>
      </section>
      
      {/* Benefits Section */}
      <section className="benefits" id="benefits">
        <h2 className="section-title">Beneficii exclusive</h2>
        
        <div className="benefits-grid">
          <div className="benefit-card">
            <div className="benefit-icon">🎓</div>
            <h3 className="benefit-title">Curs acreditat de antreprenoriat</h3>
            <p className="benefit-text">Participi la un curs complet de antreprenoriat, acreditat de Ministerul Educației, care îți oferă toate competențele necesare pentru a-ți porni afacerea.</p>
          </div>
          
          <div className="benefit-card">
            <div className="benefit-icon">📋</div>
            <h3 className="benefit-title">Zero birocrație</h3>
            <p className="benefit-text">Ne ocupăm noi de tot procesul birocratic, inclusiv de întocmirea planului de afaceri și depunerea proiectului.</p>
          </div>
          
          <div className="benefit-card">
            <div className="benefit-icon">👨‍💼</div>
            <h3 className="benefit-title">Consultanță personalizată</h3>
            <p className="benefit-text">Experții noștri te ghidează în fiecare etapă a proiectului, oferindu-ți sfaturi personalizate pentru afacerea ta.</p>
          </div>
          
          <div className="benefit-card">
            <div className="benefit-icon">💰</div>
            <h3 className="benefit-title">Finanțare nerambursabilă</h3>
            <p className="benefit-text">Cu sprijinul echipei noastre, șansele de a obține finanțarea de până la 50.000 Euro cresc considerabil.</p>
          </div>
        </div>
      </section>
      
      {/* Countdown Section */}
      <section className="countdown" id="countdown">
        <h2 className="countdown-title">ATENȚIE! Înscrierea pentru cursul de antreprenoriat este posibilă până pe 15 aprilie</h2>
      </section>
      
      {/* JavaScript for countdown */}
      <script dangerouslySetInnerHTML={{
        __html: `
          // Countdown Timer
          const countDownDate = new Date("Apr 15, 2025 23:59:59").getTime();
          
          const countdown = setInterval(function() {
              const now = new Date().getTime();
              const distance = countDownDate - now;
              
              const days = Math.floor(distance / (1000 * 60 * 60 * 24));
              const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
              const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)) ;
              const seconds = Math.floor((distance % (1000 * 60)) / 1000);
              
              document.getElementById("days").innerHTML = days.toString().padStart(2, '0');
              document.getElementById("hours").innerHTML = hours.toString().padStart(2, '0');
              document.getElementById("minutes").innerHTML = minutes.toString().padStart(2, '0');
              document.getElementById("seconds").innerHTML = seconds.toString().padStart(2, '0');
              
              if (distance < 0) {
                  clearInterval(countdown);
                  document.getElementById("days").innerHTML = "00";
                  document.getElementById("hours").innerHTML = "00";
                  document.getElementById("minutes").innerHTML = "00";
                  document.getElementById("seconds").innerHTML = "00";
              }
          }, 1000);
        `
      }} />
    </section>
  );
};

export default ProgramInfoSection;