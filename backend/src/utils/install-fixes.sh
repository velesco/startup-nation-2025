#!/bin/bash

# Script pentru rezolvarea problemelor cu generarea contractelor PDF în aplicația Startup Nation 2025

echo "Începerea procesului de rezolvare a problemelor..."

# Pasul 1: Instalează dependențele necesare
echo "Instalarea dependențelor npm..."
cd /home/ubuntu/startup-nation-2025/backend
npm install --save uuid mkdirp@latest

# Pasul 2: Instalează LibreOffice (dacă nu este deja instalat)
if ! command -v soffice &> /dev/null
then
    echo "LibreOffice nu a fost găsit. Se instalează..."
    sudo apt update
    sudo apt install -y libreoffice-core libreoffice-common
else
    echo "LibreOffice este deja instalat."
fi

# Pasul 3: Creează directorul pentru documentConverter.js
echo "Crearea utilitarului de conversie a documentelor..."
mkdir -p /home/ubuntu/startup-nation-2025/backend/src/utils

# Pasul 4: Creează fișierul documentConverter.js
cat > /home/ubuntu/startup-nation-2025/backend/src/utils/documentConverter.js << 'EOL'
const fs = require('fs').promises;
const path = require('path');
const { exec } = require('child_process');
const { v4: uuidv4 } = require('uuid');

/**
 * Convertește un document docx în PDF folosind LibreOffice direct
 */
async function convertToPdf(docxBuffer) {
  // Creează un director temporar unic
  const tempId = uuidv4();
  const tempDir = path.join('/tmp', `contract-${tempId}`);
  const inputFile = path.join(tempDir, 'input.docx');
  
  try {
    // Asigură-te că directorul există
    await fs.mkdir(tempDir, { recursive: true });
    
    // Scrie documentul în directorul temporar
    await fs.writeFile(inputFile, docxBuffer);
    
    // Convertește folosind soffice direct
    await new Promise((resolve, reject) => {
      // Setăm HOME explicit pentru a evita probleme cu permisiunile
      const cmd = `HOME=${tempDir} /usr/bin/soffice --headless --convert-to pdf --outdir "${tempDir}" "${inputFile}"`;
      
      exec(cmd, (error, stdout, stderr) => {
        if (error) {
          console.error('LibreOffice conversion error:', error, stderr);
          return reject(error);
        }
        console.log('LibreOffice conversion output:', stdout);
        resolve();
      });
    });
    
    // Citește documentul PDF rezultat
    const pdfFile = path.join(tempDir, 'input.pdf');
    const pdfBuffer = await fs.readFile(pdfFile);
    
    // Curăță după tine
    try {
      await fs.unlink(inputFile);
      await fs.unlink(pdfFile);
      await fs.rmdir(tempDir);
    } catch (e) {
      console.warn('Cleanup error (non-critical):', e);
    }
    
    return pdfBuffer;
  } catch (error) {
    console.error('Document conversion error:', error);
    throw error;
  }
}

module.exports = { convertToPdf };
EOL

# Pasul 5: Actualizează setarea 'trust proxy' în index.js
echo "Actualizarea setării 'trust proxy' în index.js..."
sed -i "s/const app = express();/const app = express();\n\n\/\/ Setare 'trust proxy' pentru a rezolva problemele cu X-Forwarded-For\napp.set('trust proxy', 1);/" /home/ubuntu/startup-nation-2025/backend/src/index.js

# Pasul 6: Actualizează utilizarea mkdirp în contract.controller.js
echo "Actualizarea utilizării mkdirp în contract.controller.js..."
sed -i "s/const mkdirp = require('mkdirp');//" /home/ubuntu/startup-nation-2025/backend/src/controllers/contract.controller.js
sed -i "s/await mkdirp/await fs.promises.mkdir/g" /home/ubuntu/startup-nation-2025/backend/src/controllers/contract.controller.js
sed -i "s/mkdirp(/fs.promises.mkdir(/g" /home/ubuntu/startup-nation-2025/backend/src/controllers/contract.controller.js

# Pasul 7: Actualizează importul convertWordBufferToPdf cu convertToPdf
echo "Actualizarea importurilor în contract.controller.js..."
sed -i "s/const { convertWordBufferToPdf } = require('..\/utils\/pdfConverter');/const { convertToPdf } = require('..\/utils\/documentConverter');/" /home/ubuntu/startup-nation-2025/backend/src/controllers/contract.controller.js

# Pasul 8: Actualizează apelurile la convertWordBufferToPdf cu convertToPdf
echo "Actualizarea apelurilor de conversie în contract.controller.js..."
sed -i "s/convertWordBufferToPdf/convertToPdf/g" /home/ubuntu/startup-nation-2025/backend/src/controllers/contract.controller.js

# Pasul 9: Asigură-te că directorul pentru contracte există
echo "Crearea directorului pentru contracte..."
mkdir -p /home/ubuntu/startup-nation-2025/uploads/contracts
chmod -R 755 /home/ubuntu/startup-nation-2025/uploads

# Pasul 10: Asigură-te că directorul temporar are permisiuni corecte
echo "Setarea permisiunilor pentru directorul temporar..."
chmod -R 1777 /tmp

# Pasul 11: Repornește aplicația
echo "Repornirea aplicației..."
pm2 restart all

echo "Procesul de rezolvare a fost finalizat. Verifică jurnalele pentru a confirma că totul funcționează corect."
