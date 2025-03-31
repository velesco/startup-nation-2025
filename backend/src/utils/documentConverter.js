const fs = require('fs').promises;
const path = require('path');
const { exec } = require('child_process');
const { v4: uuidv4 } = require('uuid');
const logger = require('./logger');

/**
 * Convertește un document docx în PDF folosind LibreOffice
 * Încearcă mai multe căi comune pentru executabilul LibreOffice
 */
async function convertToPdf(docxBuffer) {
  // Creează un director temporar unic
  const tempId = uuidv4();
  const tempDir = path.join('/tmp', `contract-${tempId}`);
  const inputFile = path.join(tempDir, 'input.docx');
  
  // Potențiale căi pentru executabilul LibreOffice
  const libreOfficePaths = [
    '/usr/bin/soffice',
    '/usr/lib/libreoffice/program/soffice',
    '/opt/libreoffice/program/soffice',
    '/Applications/LibreOffice.app/Contents/MacOS/soffice',
    process.env.LIBREOFFICE_PATH // Permite configurare prin variabile de mediu
  ].filter(Boolean); // Elimină valorile null/undefined
  
  try {
    // Asigură-te că directorul există
    await fs.mkdir(tempDir, { recursive: true });
    
    // Scrie documentul în directorul temporar
    await fs.writeFile(inputFile, docxBuffer);
    
    // Încearcă fiecare cale pentru executabilul LibreOffice
    let conversionSuccessful = false;
    let lastError = null;
    
    for (const officeExecutable of libreOfficePaths) {
      try {
        logger.info(`Attempting conversion with LibreOffice at: ${officeExecutable}`);
        
        // Verifică dacă executabilul există
        try {
          await fs.access(officeExecutable);
        } catch (e) {
          logger.warn(`LibreOffice not found at: ${officeExecutable}`);
          continue; // Încearcă următoarea cale
        }
        
        // Convertește folosind soffice
        await new Promise((resolve, reject) => {
          // Setăm HOME explicit pentru a evita probleme cu permisiunile
          const cmd = `HOME=${tempDir} ${officeExecutable} --headless --convert-to pdf --outdir "${tempDir}" "${inputFile}"`;
          
          exec(cmd, (error, stdout, stderr) => {
            if (error) {
              logger.error(`LibreOffice conversion error with ${officeExecutable}:`, error);
              return reject(error);
            }
            logger.info('LibreOffice conversion successful');
            resolve();
          });
        });
        
        // Dacă am ajuns aici, conversia a reușit
        conversionSuccessful = true;
        break;
      } catch (e) {
        lastError = e;
        // Continuă cu următoarea cale
      }
    }
    
    if (!conversionSuccessful) {
      logger.error('PDF conversion failed with all LibreOffice paths');
      throw lastError || new Error('PDF conversion failed with all available LibreOffice paths');
    }
    
    // Citește documentul PDF rezultat
    const pdfFile = path.join(tempDir, 'input.pdf');
    const pdfBuffer = await fs.readFile(pdfFile);
    
    // Curăță după tine
    try {
      await fs.unlink(inputFile);
      await fs.unlink(pdfFile);
      await fs.rmdir(tempDir);
    } catch (e) {
      logger.warn('Cleanup error (non-critical):', e);
    }
    
    return pdfBuffer;
  } catch (error) {
    logger.error(`Document conversion error: ${error.message}`);
    
    // Curăță director temporar în caz de eroare
    try {
      await fs.unlink(inputFile).catch(() => {});
      await fs.rmdir(tempDir).catch(() => {});
    } catch (e) {
      // Ignoră erorile de curățare
    }
    
    throw error;
  }
}

module.exports = { convertToPdf };