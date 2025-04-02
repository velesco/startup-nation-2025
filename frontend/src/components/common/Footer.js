import React from 'react';
import { Link } from 'react-router-dom';
import './FooterCustomStyles.css'; // Importăm stilurile personalizate

const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer>
      <div className="footer-top">
        <div>
          <Link to="/" className="footer-logo">Startup Nation 2025</Link>
          <p className="footer-text">Transformă-ți ideea de afacere în realitate cu ajutorul programului Startup Nation 2025 și obține finanțare nerambursabilă de până la 50.000 Euro.</p>
        </div>
        
        <div>
          <h4 className="footer-title">Link-uri utile</h4>
          <ul className="footer-links">
            <li><Link to="/">Acasă</Link></li>
            <li><Link to="/despre-program#about-program">Despre Program</Link></li>
            <li><Link to="/login?role=trainer">Formatori</Link></li>
            <li><Link to="/login?role=partner">Parteneri</Link></li>
            <li><Link to="/intrebari-frecvente">Întrebări frecvente</Link></li>
            <li><Link to="/termeni-conditii#terms-and-conditions">Termeni și condiții</Link></li>
            <li><Link to="/politica-confidentialitate#privacy-policy">Politica de confidențialitate</Link></li>
          </ul>
        </div>
        
        <div>
          <h4 className="footer-title">Contact</h4>
          
          <div className="footer-contact-item">
            <div className="footer-contact-icon">✉️</div>
            <div className="footer-contact-text">contact@aplica-startup.ro</div>
          </div>
          
          <div className="footer-contact-item">
            <div className="footer-contact-icon">📍</div>
            <div className="footer-contact-text">București, România</div>
          </div>
        </div>
      </div>
      
      <div className="footer-bottom">
        <p>&copy; {currentYear} Startup Nation. Toate drepturile rezervate.</p>
        
        <div className="eu-funding">
          <img src="https://european-union.europa.eu/themes/contrib/oe_theme/dist/eu/images/logo/standard-version/positive/logo-eu--en.svg" alt="Uniunea Europeană" className="eu-logo" />
          <img src="https://mfe.gov.ro/logomic.png" alt="Ministerul Investițiilor și Proiectelor Europene" className="eu-logo" />
          <p>Program finanțat prin fonduri europene nerambursabile aferente Programului Educație și Ocupare 2021-2027</p>
        </div>
        
        <div className="official-links">
          <a href="https://mfe.gov.ro/" target="_blank" rel="noopener noreferrer">Ministerul Investițiilor și Proiectelor Europene</a>
          <a href="https://www.fonduri-ue.ro/" target="_blank" rel="noopener noreferrer">Fonduri Europene</a>
          <a href="https://www.fonduri-structurale.ro/" target="_blank" rel="noopener noreferrer">Fonduri Structurale</a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;