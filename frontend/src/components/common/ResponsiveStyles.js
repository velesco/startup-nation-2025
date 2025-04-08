import React, { useEffect } from 'react';
import '../../styles/responsive.css';

/**
 * Componentă care încarcă stilurile responsive pentru aplicație
 * Aceasta ar trebui adăugată în App.js sau un layout principal
 */
const ResponsiveStyles = () => {
  useEffect(() => {
    // Adăugă meta tag-ul pentru viewport dacă nu există
    if (!document.querySelector('meta[name="viewport"]')) {
      const meta = document.createElement('meta');
      meta.name = 'viewport';
      meta.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no';
      document.getElementsByTagName('head')[0].appendChild(meta);
    }
    
    // Adaugă clasă pentru body pentru a preveni scrollarea orizontală
    document.body.classList.add('overflow-x-hidden');
    
    return () => {
      document.body.classList.remove('overflow-x-hidden');
    };
  }, []);

  return null; // Această componentă nu renderează nimic
};

export default ResponsiveStyles;