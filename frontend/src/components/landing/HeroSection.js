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
    <section className="hero">
      <div className="hero-content">
        <h1 className="hero-title">
          <div className="typing-animation typing-1" style={{opacity: 1, width: "100%"}}>Startup Nation 2025</div>
          <div className="typing-animation typing-2" style={{opacity: 1, width: "100%"}}>Transformă-ți ideea în realitate</div>
        </h1>
        <p className="hero-subtitle" style={{opacity: 1, transform: "none", color: "#222"}}>Obține finanțare nerambursabilă de până la 50.000 Euro pentru afacerea ta! Programul este deschis unei game largi de persoane, indiferent de vârstă.</p>
        <a href="#apply-section" onClick={scrollToApplySection} className="btn hero-cta desktop-cta" style={{opacity: 1, transform: "none"}}>Aplică acum</a>
      </div>
      
      <div className="hero-image" style={{opacity: 1, transform: "none"}}>
        <img src={topImage} alt="Startup Nation 2025" loading="eager" style={{display: "block"}} />
      </div>

      {/* Buton pentru versiunea mobilă care apare sub imagine */}
      <div className="mobile-cta-container">
        <a href="#apply-section" onClick={scrollToApplySection} className="btn hero-cta mobile-cta" style={{opacity: 1, transform: "none"}}>Aplică acum</a>
      </div>
    </section>
  );
};

export default HeroSection;