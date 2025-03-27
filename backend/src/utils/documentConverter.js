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
