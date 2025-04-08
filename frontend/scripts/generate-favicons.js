const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

// Directorul pentru output
const publicDir = path.join(__dirname, '../public');

// Asigură-te că directorul pentru icoane există
const iconsDir = path.join(publicDir, 'icons');
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

// Definește dimensiunile pentru favicon
const sizes = [
  { name: 'favicon-16x16.png', size: 16 },
  { name: 'favicon-32x32.png', size: 32 },
  { name: 'apple-touch-icon.png', size: 180 },
  { name: 'logo192.png', size: 192 },
  { name: 'logo512.png', size: 512 }
];

// Funcția principală pentru generarea favicon-urilor
async function generateFavicons() {
  try {
    console.log('Generare favicon-uri...');
    
    // Calea către fișierul SVG sursă
    const svgPath = path.join(publicDir, 'favicon.svg');
    
    if (!fs.existsSync(svgPath)) {
      console.error('Fișierul SVG sursă nu a fost găsit!');
      return;
    }
    
    // Citim conținutul SVG
    const svgBuffer = fs.readFileSync(svgPath);
    
    // Generăm toate dimensiunile necesare folosind sharp
    for (const sizeObj of sizes) {
      const outputPath = path.join(publicDir, sizeObj.name);
      
      try {
        // Convertim SVG la PNG cu dimensiunile specificate
        await sharp(svgBuffer)
          .resize(sizeObj.size, sizeObj.size)
          .png()
          .toFile(outputPath);
          
        console.log(`Generat: ${sizeObj.name} (${sizeObj.size}x${sizeObj.size}px)`);
      } catch (err) {
        console.error(`Eroare la generarea ${sizeObj.name}:`, err.message);
      }
    }
    
    // Verifică dacă fișierele au fost create
    console.log('\nVerificare fișiere generate:');
    for (const sizeObj of sizes) {
      const outputPath = path.join(publicDir, sizeObj.name);
      if (fs.existsSync(outputPath)) {
        const stats = fs.statSync(outputPath);
        console.log(`✓ ${sizeObj.name} - ${stats.size} bytes`);
      } else {
        console.error(`✗ ${sizeObj.name} nu a fost generat`);
      }
    }
    
    console.log('\nProcesul de generare a favicon-urilor s-a încheiat!');
    console.log('Pentru ca aceste favicon-uri să funcționeze corect, asigură-te că ai inclus toate referințele în fișierul index.html și manifest.json.');
    
  } catch (error) {
    console.error('Eroare generală:', error);
  }
}

// Execută funcția principală
generateFavicons();
