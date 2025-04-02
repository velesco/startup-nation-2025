import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className={`${isScrolled ? 'scrolled' : ''}`}>
      <Link to="/" className="logo">
        <span>SN</span>
        <div className="logo-badge">2025</div>
      </Link>
      
      <nav className={isMenuOpen ? 'active' : ''}>
        <ul>
          <li><Link to="/">Acasă</Link></li>
          <li><Link to="/despre-program#about-program">Despre Program</Link></li>
          <li><Link to="/login?role=trainer">Formatori</Link></li>
          <li><Link to="/login?role=partner">Parteneri</Link></li>
          <li><Link to="/login">Login</Link></li>
        </ul>
      </nav>
      
      <button className="menu-btn" onClick={() => setIsMenuOpen(!isMenuOpen)}>
        {isMenuOpen ? '✕' : '☰'}
      </button>
    </header>
  );
};

export default Navbar;