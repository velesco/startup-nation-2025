const libre = require('libreoffice-convert');
const { promisify } = require('util');
const logger = require('./logger');

// Promisify the libreoffice-convert function
const convertAsync = promisify(libre.convert);

/**
 * Convert a Word document buffer to PDF
 * @param {Buffer} wordBuffer - The Word document buffer
 * @returns {Promise<Buffer>} - The PDF buffer
 */
const convertWordBufferToPdf = async (wordBuffer) => {
  try {
    logger.info(`Starting Word to PDF conversion, buffer size: ${wordBuffer.length} bytes`);
    // Set conversion options (optional)
    const options = {
      // You can specify output format and other options here
      // format: 'pdf',
      // filter: 'writer_pdf_Export'
    };
    
    // Convert the document
    logger.info(`Converting document with libreoffice-convert...`);
    const pdfBuffer = await convertAsync(wordBuffer, '.pdf', options);
    logger.info(`PDF conversion successful, result size: ${pdfBuffer.length} bytes`);
    
    return pdfBuffer;
  } catch (error) {
    logger.error(`Word to PDF conversion error: ${error.message}`);
    logger.error(`Error stack: ${error.stack}`);
    
    if (error.code) {
      logger.error(`Error code: ${error.code}`);
    }
    
    throw new Error(`Failed to convert Word document to PDF: ${error.message}`);
  }
};

module.exports = {
  convertWordBufferToPdf
};